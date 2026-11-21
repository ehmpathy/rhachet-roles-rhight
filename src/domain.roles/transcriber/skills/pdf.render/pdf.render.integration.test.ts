import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the pdf.render skill
 * .why  = verify a page renders to exactly the named png, that an
 *         out-of-range page fails LOUD rather than writing no file at
 *         exit 0, and that --crop narrows the output. hermetic: the
 *         fixture pdf is built at runtime via ps2pdf, no committed
 *         binaries.
 */

const scriptPath = path.join(__dirname, 'pdf.render.sh');

const UTF8 = 'utf-8' as const;

// eager, not deferred: path.join needs a real string, and a test-fns
// proxy is an object until it is awaited.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-render-'));

/**
 * ⚠️ `cwd: tempDir` IS LOAD-BEARING, NOT TIDINESS.
 *
 * the skill's default `--into` is a RELATIVE path — `./<stem>.p<N>.png`
 * (`pdf.render.sh`) — so the ONLY thing that decides where a defaulted
 * render lands is the process cwd. with no cwd set, every case that
 * reaches the render without an explicit `--into` writes a png INTO THE
 * CHECKOUT.
 *
 * 🚩 this is not hypothetical. it was OBSERVED 2026-09-02: a probe that
 *    disabled the `--dpi` guard let `--dpi 0` render successfully, and
 *    `fixture.p1.png` appeared at the repo root. the case that found it
 *    was the case that caused it.
 *
 * ⭐ every path below is ABSOLUTE (`path.join(tempDir, …)`), including
 *    `scriptPath`, so pinning the cwd changes no other case's meaning —
 *    it only bounds the blast radius of the defaulted one.
 *
 * see rule.require.hermetic-tests.
 */
const runSkill = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...args], {
    cwd: tempDir,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * ⚠️ A PATH SHIM, USED ONLY WHERE THE REAL TOOL CANNOT BE MADE TO FAIL.
 *
 * `render()` has two exit-1 arms that no ordinary input can reach: one
 * for a pdftoppm that returns non-zero, one for a pdftoppm that returns
 * zero and leaves no file behind. both describe a broken or absent
 * poppler, which a fixture cannot simulate.
 *
 * so `pdftoppm` alone is replaced, by a bin dir prepended to PATH.
 * `pdfinfo` is deliberately NOT replaced — `validate_page_range` runs
 * before `render()` and must still read the real fixture, or the run
 * would refuse for the wrong reason and the arm under test would never
 * execute.
 *
 * see howto.mock-cli-via-path — a last resort, and this is one: there is
 * no input that makes a healthy poppler misbehave.
 */
const whichOne = (tool: string): string => {
  const found = spawnSync('which', [tool], { encoding: UTF8 });
  const at = (found.stdout ?? '').trim();
  if (!at) throw new Error(`${tool} not on PATH — cannot run this suite`);
  return at;
};

const realPdftoppm = whichOne('pdftoppm');

const runSkillWithShim = (input: {
  body: string;
  args: string[];
}): { stdout: string; stderr: string; exitCode: number } => {
  const binDir = fs.mkdtempSync(path.join(tempDir, 'shim-'));
  const shim = path.join(binDir, 'pdftoppm');
  fs.writeFileSync(shim, input.body);
  fs.chmodSync(shim, 0o755);

  const result = spawnSync('bash', [scriptPath, ...input.args], {
    cwd: tempDir,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ''}` },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * ⚠️ A PATH NARROWED TO ONE DIRECTORY, SO A TOOL CAN BE MADE ABSENT.
 *
 * the shim above answers "what if the tool misbehaves". `check_tools`
 * asks the other question — "what if the tool is not installed" — and no
 * shim can produce that, because a shim IS an installed tool.
 *
 * so PATH is replaced outright by a directory that holds symlinks to
 * exactly the tools a case names. anything unnamed is absent.
 *
 * ⚠️ the interpreter is passed by ABSOLUTE path. with PATH narrowed to a
 *    directory that holds no `bash`, a bare `'bash'` would be resolved
 *    against an environment that may or may not be the child's, per
 *    platform — so the suite would fail to launch rather than exercise
 *    the guard, and the reason would be off in the harness.
 *
 * ⚠️ `dirname` IS ALWAYS KEPT, and it is not a poppler tool.
 *
 *    `:51` resolves SCRIPT_DIR through `$(dirname "${BASH_SOURCE[0]}")`,
 *    and dirname is a coreutils BINARY, not a bash builtin. drop it and
 *    the command substitution fails, `set -e` ends the run before
 *    `check_tools` is ever reached, and the caller gets exit 1 with an
 *    EMPTY stdout — a refusal for the wrong reason, wearing the shape of
 *    the one under test.
 *
 *    measured 2026-09-02: without it, all five assertions below went red
 *    at `Received: 1` and `Received string: ""`.
 *
 * ⭐ once dirname is present, this is safe, because `check_tools` runs
 *    BEFORE any other external tool: `output.sh` is pure function
 *    declarations, `parse_args` is pure bash, and `command -v` is a
 *    builtin. so the refusal lands before the narrowed PATH could
 *    misattribute a later failure to it.
 */
const realBash = whichOne('bash');

const runSkillWithOnly = (input: {
  tools: string[];
  args: string[];
}): { stdout: string; stderr: string; exitCode: number } => {
  const binDir = fs.mkdtempSync(path.join(tempDir, 'onlybin-'));
  for (const tool of [...input.tools, 'dirname'])
    fs.symlinkSync(whichOne(tool), path.join(binDir, tool));

  const result = spawnSync(realBash, [scriptPath, ...input.args], {
    cwd: tempDir,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PATH: binDir },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

// a deterministic 3-page pdf. page 3 is deliberately blank, so a test
// can prove the byte-size readout distinguishes ink from no ink.
const genFixturePdf = (into: string): void => {
  const page = (lines: string[]): string[] => [
    '/Helvetica findfont 24 scalefont setfont',
    ...lines.flatMap((line, i) => [
      `72 ${700 - i * 30} moveto`,
      `(${line}) show`,
    ]),
    'showpage',
  ];

  const ps = [
    '%!PS',
    ...page(['PAGE ONE ALPHA', 'second line of page one']),
    ...page(['PAGE TWO BRAVO']),
    ...page([]),
  ].join('\n');

  const psPath = `${into}.ps`;
  fs.writeFileSync(psPath, ps);
  const res = spawnSync('ps2pdf', [psPath, into], { encoding: UTF8 });
  if (res.status !== 0) {
    throw new Error(`ps2pdf failed to build fixture: ${res.stderr}`);
  }
};

// a png carries its pixel dimensions in the IHDR chunk: width at byte
// 16, height at byte 20, both big-endian uint32. this is an INDEPENDENT
// instrument — it reads what pdftoppm actually produced, not what the
// skill echoed back from its own arguments.
const getPngSize = (at: string): { w: number; h: number } => {
  const buf = fs.readFileSync(at);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

const fixturePdf = path.join(tempDir, 'fixture.pdf');

beforeAll(() => {
  // failfast: the skill and its tests both need poppler + ghostscript
  for (const tool of ['pdftoppm', 'pdfinfo', 'ps2pdf']) {
    const res = spawnSync('which', [tool], { encoding: UTF8 });
    if (res.status !== 0) {
      throw new Error(
        `${tool} required for these tests. install poppler-utils and ghostscript.`,
      );
    }
  }
  genFixturePdf(fixturePdf);
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('pdf.render.sh', () => {
  given('[case1] a valid 3 page pdf', () => {
    when('[t0] page 1 is rendered to a named path', () => {
      const into = path.join(tempDir, 'p1.png');
      const outcome = useThen('it succeeds', () =>
        runSkill([fixturePdf, '--page', '1', '--into', into]),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('the png exists at exactly the named path', () => {
        expect(fs.existsSync(into)).toBe(true);
      });

      then('the file is a real png, by magic bytes', () => {
        const head = fs.readFileSync(into).subarray(0, 8);
        expect([...head]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      });

      then('no suffixed neighbor was written alongside it', () => {
        // without -singlefile, pdftoppm writes p1-1.png or p1-01.png.
        // the whole point is that the output path is predictable.
        const strays = fs
          .readdirSync(tempDir)
          .filter((f) => f.startsWith('p1-'));
        expect(strays).toEqual([]);
      });

      then('the readout names the page and the total', () => {
        expect(outcome.stdout).toContain('page: 1 of 3');
      });

      then('the readout carries a byte count', () => {
        expect(outcome.stdout).toMatch(/bytes: [0-9]+/);
      });

      then('the readout carries real page dimensions, not "unknown"', () => {
        // regression: the first parse anchored on a fixed awk field
        // index, which matched only pdfinfo's mixed-page-size output.
        // every ordinary letter-size document reported "unknown".
        expect(outcome.stdout).not.toContain('page size: unknown');
        expect(outcome.stdout).toMatch(/page size: [0-9.]+ x [0-9.]+ pt/);
      });
    });

    when('[t1] a page with ink and a blank page are both rendered', () => {
      const inked = path.join(tempDir, 'inked.png');
      const blank = path.join(tempDir, 'blank.png');
      const outcome = useThen('both succeed', () => {
        const a = runSkill([fixturePdf, '--page', '1', '--into', inked]);
        const b = runSkill([fixturePdf, '--page', '3', '--into', blank]);
        return { a, b };
      });

      then('both exit 0', () => {
        expect(outcome.a.exitCode).toBe(0);
        expect(outcome.b.exitCode).toBe(0);
      });

      then('the inked page is materially larger than the blank one', () => {
        // this is the property that makes the byte readout useful: a
        // caller can tell "rendered but empty" from "rendered with
        // content" without a viewer.
        const inkedBytes = fs.statSync(inked).size;
        const blankBytes = fs.statSync(blank).size;
        expect(inkedBytes).toBeGreaterThan(blankBytes);
      });
    });

    when('[t2] --crop narrows the render', () => {
      const full = path.join(tempDir, 'full.png');
      const cropped = path.join(tempDir, 'cropped.png');
      const outcome = useThen('both succeed', () => {
        const a = runSkill([fixturePdf, '--page', '1', '--into', full]);
        const b = runSkill([
          fixturePdf,
          '--page',
          '1',
          '--crop',
          '0,0,200,100',
          '--into',
          cropped,
        ]);
        return { a, b };
      });

      then('both exit 0', () => {
        expect(outcome.a.exitCode).toBe(0);
        expect(outcome.b.exitCode).toBe(0);
      });

      then('the cropped file is smaller than the full page', () => {
        expect(fs.statSync(cropped).size).toBeLessThan(fs.statSync(full).size);
      });

      then('the readout echoes the crop box', () => {
        expect(outcome.b.stdout).toContain('crop: 0,0,200,100');
      });

      /**
       * .why = ⭐ the three assertions above claim a SMALLER FILE and an
       *        ECHOED ARGUMENT. neither can see the SHAPE of what was
       *        rendered.
       *
       *        the echo is `$CROP` — the skill's own INPUT, printed back.
       *        it is true no matter what pdftoppm did with it. and
       *        "smaller than a full page" is satisfied by every crop box
       *        there is.
       *
       *        ✅ PROVEN to bite. the skill's `args+=(-x "$x" -y "$y"
       *        -W "$w" -H "$h")` transposed to `-W "$h" -H "$w"` — so
       *        every caller who wants a 200-wide band gets a 200-TALL
       *        one — left the suite at **51 passed, 0 failed**.
       *
       *        ⚠️ this is the use that carries the weight.
       *        `rule.require.deterministic-redaction` makes the render
       *        the check that decides whether a box landed on the value,
       *        and that check works by a crop of a BAND over it. a
       *        transposed box reads a different region and reports a
       *        redaction verified that was never looked at.
       *
       *        ⭐ the assertion only discriminates because 200 ≠ 100. a
       *        square crop box would make this clamp vacuous.
       */
      then('the crop box is W x H, not H x W', () => {
        // positive control: the reader works and the full page is a
        // different shape, so a 200x100 result was set by the CROP.
        expect(getPngSize(full).w).toBeGreaterThan(200);
        expect(getPngSize(cropped)).toEqual({ w: 200, h: 100 });
      });
    });

    /**
     * .why = ⭐ `[t2]`'s crop box is `0,0,...`, so its ORIGIN is TWO
     *        ZEROES. transpose x and y and the arguments are unchanged.
     *
     *        so the fixture forecloses the check before any assertion is
     *        written: no `then` in `[t2]`, however sharp, could ever see
     *        an origin defect. ✅ measured — `-x "$y" -y "$x"` left the
     *        suite at **51 passed, 0 failed**, because on `0,0` that
     *        patch is a no-op.
     *
     *        the cure is a fixture, not a needle. this case uses a
     *        NON-ZERO, ASYMMETRIC origin and reads a channel the origin
     *        actually moves: whether the band it selected has ink.
     *
     *        the two renders are the SAME W x H at DIFFERENT y, so any
     *        byte difference between them is INK rather than geometry.
     *        page 1 carries two text lines near the top and no mark
     *        below them, so y=200 is inked and y=900 is blank.
     */
    when('[t4] the crop ORIGIN selects which band of the page renders', () => {
      const atText = path.join(tempDir, 'band-text.png');
      const atEmpty = path.join(tempDir, 'band-empty.png');
      const outcome = useThen('both succeed', () => {
        const a = runSkill([
          fixturePdf,
          '--page',
          '1',
          '--crop',
          '0,200,600,80',
          '--into',
          atText,
        ]);
        const b = runSkill([
          fixturePdf,
          '--page',
          '1',
          '--crop',
          '0,900,600,80',
          '--into',
          atEmpty,
        ]);
        return { a, b };
      });

      then('both exit 0', () => {
        expect(outcome.a.exitCode).toBe(0);
        expect(outcome.b.exitCode).toBe(0);
      });

      // positive control: the two renders are geometrically identical,
      // which is what licenses the byte comparison below to be read as
      // a statement about INK.
      then('both bands are exactly 600 x 80', () => {
        expect(getPngSize(atText)).toEqual({ w: 600, h: 80 });
        expect(getPngSize(atEmpty)).toEqual({ w: 600, h: 80 });
      });

      then(
        'the band at the TEXT has ink and the band below it does not',
        () => {
          const textBytes = fs.statSync(atText).size;
          const emptyBytes = fs.statSync(atEmpty).size;
          // a ratio, not a bare `>`: under an x/y transposition BOTH bands
          // land on blank regions and their sizes come out near-equal, so
          // a bare `>` could pass on noise.
          expect(textBytes).toBeGreaterThan(emptyBytes * 2);
        },
      );
    });

    when('[t3] --dpi raises the resolution', () => {
      const low = path.join(tempDir, 'low.png');
      const high = path.join(tempDir, 'high.png');
      const outcome = useThen('both succeed', () => {
        const a = runSkill([
          fixturePdf,
          '--page',
          '1',
          '--dpi',
          '72',
          '--into',
          low,
        ]);
        const b = runSkill([
          fixturePdf,
          '--page',
          '1',
          '--dpi',
          '300',
          '--into',
          high,
        ]);
        return { a, b };
      });

      then('both exit 0', () => {
        expect(outcome.a.exitCode).toBe(0);
        expect(outcome.b.exitCode).toBe(0);
      });

      then('the higher dpi render is larger', () => {
        expect(fs.statSync(high).size).toBeGreaterThan(fs.statSync(low).size);
      });
    });
  });

  given('[case2] a page number past the end of the document', () => {
    when('[t0] page 99 of a 3 page pdf is requested', () => {
      const into = path.join(tempDir, 'p99.png');
      const outcome = useThen('it is refused', () =>
        runSkill([fixturePdf, '--page', '99', '--into', into]),
      );

      then('exit code is 2 — a constraint, not a malfunction', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the range, not just a failure', () => {
        // pdftoppm alone would exit 0 here and write no file, which
        // reads as "the page is blank". the whole guard exists to turn
        // that silent result into a loud one.
        expect(outcome.stdout).toContain('out of range');
        expect(outcome.stdout).toContain('3 page(s)');
      });

      then('no file was written', () => {
        expect(fs.existsSync(into)).toBe(false);
      });
    });
  });

  given('[case3] malformed arguments', () => {
    when('[t0] the pdf path does not exist', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([path.join(tempDir, 'absent.pdf')]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason says the file was not found', () => {
        expect(outcome.stdout).toContain('file not found');
      });
    });

    when('[t1] no pdf path is given at all', () => {
      const outcome = useThen('it is refused', () => runSkill([]));

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason says no path was given', () => {
        expect(outcome.stdout).toContain('no PDF path given');
      });
    });

    when('[t2] --page is not a positive integer', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([fixturePdf, '--page', 'seven']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the bad value', () => {
        expect(outcome.stdout).toContain('--page must be a positive integer');
        expect(outcome.stdout).toContain('seven');
      });
    });

    when('[t3] --crop is not four comma separated numbers', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([fixturePdf, '--crop', '10,20,30']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason states the expected shape', () => {
        expect(outcome.stdout).toContain('--crop must be X,Y,W,H in pixels');
      });
    });

    when('[t4] --into does not end in .png', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([fixturePdf, '--into', path.join(tempDir, 'out.jpg')]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason states the expected extension', () => {
        expect(outcome.stdout).toContain('--into must end in .png');
      });
    });

    when('[t5] the output directory does not exist', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([
          fixturePdf,
          '--into',
          path.join(tempDir, 'absent-dir/x.png'),
        ]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the absent directory', () => {
        expect(outcome.stdout).toContain('output directory does not exist');
      });
    });

    when('[t6] an unknown option is passed', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([fixturePdf, '--zoom', '2']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the option', () => {
        expect(outcome.stdout).toContain('unknown option: --zoom');
      });
    });

    /**
     * ⛔ `--dpi` HAD A VALID-PATH CLAMP AND NO REFUSAL CLAMP.
     *
     * `[t3]` above varies dpi 72<->300 and a later case measures the png's
     * IHDR bytes against `(pts / 72) * dpi`, so the flag is PROVEN live.
     * what had no case at all is `pdf.render.sh:147-149` — the guard that
     * refuses a dpi which is not a positive integer.
     *
     * ⭐ WHY THIS ONE MATTERS MORE THAN A TYPO GUARD USUALLY DOES.
     *    this skill IS check 2 of `rule.require.deterministic-redaction`:
     *
     *      "the render — that the box landed ON the value. this is the one
     *       that carries the weight."
     *
     *    a dpi of 0 does not fail loudly; it degenerates the render. and a
     *    human who runs the visual redaction check against a degenerate
     *    page sees a smudge where the value was and passes it. so an
     *    unguarded dpi turns the ONE check that carries the weight into a
     *    check that cannot fail — the same shape as leak 4, reached from
     *    the argument parser rather than from the pipeline.
     */
    when('[t7] --dpi is not a positive integer', () => {
      const into = path.join(tempDir, 'dpi-refused.png');
      const outcome = useThen('it is refused', () =>
        runSkill([fixturePdf, '--dpi', '0', '--into', into]),
      );

      then('exit code is 2 — a constraint, not a malfunction', () => {
        expect(outcome.exitCode).toBe(2);
      });

      /**
       * ⚠️ the MESSAGE, not only the code. every other refusal in this
       *    block also exits 2, so the code alone cannot say WHICH guard
       *    ran — nor whether any ran, if the tool below happens to exit 2
       *    unaided. the echoed value is what proves this guard read the
       *    input it claims to have read.
       *
       * 🚩 MEASURED 2026-09-02, and the harm is larger than the code
       *    suggests. with the guard disabled, `--dpi 0` does NOT error —
       *    it exits 0 and prints a report that reads as an ordinary
       *    success:
       *
       *      🦅 have a look,
       *      🔎 pdf.render
       *         ├─ page: 1 of 3
       *         ├─ dpi: 0
       *         ├─ page size: 595 x 842 pt
       *         ├─ bytes: 21504
       *         └─ into: ./fixture.p1.png
       *
       *    every row but one is correct, `bytes` is plausibly non-zero so
       *    a "did it produce output?" check also passes, and the HEADER is
       *    an instruction to eyeball the result. that is the check which
       *    `rule.require.deterministic-redaction` calls "the one that
       *    carries the weight", degraded while every indicator says fine.
       */
      then('the reason names the flag and echoes the bad value', () => {
        expect(outcome.stdout).toContain('--dpi must be a positive integer');
        expect(outcome.stdout).toContain('got: 0');
      });

      /**
       * ⭐ THE FIRST VERSION OF THIS ASSERTION WAS TOOTHLESS, AND THE
       *    PROBE IS WHAT EXPOSED IT.
       *
       * it read `fixturePdf.replace(/\.pdf$/, '.png')` — a path the skill
       * never writes under ANY input, because the defaulted name carries a
       * `.p<N>` page segment and resolves against the cwd rather than
       * against the source. so it asserted the absence of a file that
       * could not exist, and stayed GREEN through a probe that rendered
       * successfully.
       *
       * the cure is to name a path the skill WOULD have written: pass an
       * explicit `--into` and assert THAT is absent.
       */
      then('⭐ it refuses BEFORE it renders — the named file is absent', () => {
        expect(fs.existsSync(into)).toBe(false);
      });
    });

    /**
     * ⛔ A SECOND POSITIONAL PATH WAS UNGUARDED-BY-TEST.
     *
     * `pdf.render.sh:92-100` takes the FIRST bare argument as the pdf and
     * refuses any second one. remove that refusal and the `*)` arm becomes
     * a bare `shift`: the second path is silently DISCARDED, the first
     * renders, and the skill reports success at exit 0.
     *
     * ⭐ that is the silent-narrow shape — a run that reports ✅ over a set
     *    it quietly shrank. the human asked for two renders, was told the
     *    run succeeded, and got one. and because the exit code is 0 in the
     *    broken case and 2 in the correct one, the code DOES discriminate
     *    here — which is not true of most of this block.
     */
    when('[t8] a second pdf path is passed', () => {
      const outcome = useThen('it is refused', () => {
        const second = path.join(tempDir, 'second.pdf');
        fs.copyFileSync(fixturePdf, second);
        return { res: runSkill([fixturePdf, second]), second };
      });

      then('exit code is 2', () => {
        expect(outcome.res.exitCode).toBe(2);
      });

      /**
       * ⚠️ the assertion names the SECOND path specifically. a message
       *    that echoed the FIRST one would read as a correct refusal and
       *    would not tell the human which argument to drop.
       */
      then('⭐ the reason names the ARGUMENT it could not place', () => {
        expect(outcome.res.stdout).toContain('unexpected argument');
        expect(outcome.res.stdout).toContain(outcome.second);
      });
    });
  });

  given('[case4] a file that is not a pdf', () => {
    when('[t0] a .txt is passed', () => {
      const outcome = useThen('it is refused', () => {
        const txt = path.join(tempDir, 'notes.txt');
        fs.writeFileSync(txt, 'hello');
        return runSkill([txt]);
      });

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason says it is not a PDF', () => {
        expect(outcome.stdout).toContain('not a PDF file');
      });
    });
  });

  given('[case5] --help', () => {
    when('[t0] help is requested', () => {
      const outcome = useThen('it succeeds', () => runSkill(['--help']));

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('it documents every flag', () => {
        for (const flag of ['--page', '--dpi', '--crop', '--into']) {
          expect(outcome.stdout).toContain(flag);
        }
      });

      then('it stops at the header fence, not the whole file', () => {
        // mawk lacks interval expressions, so `/^#{5,}/` would match no
        // line and dump the executable. this asserts the fence held.
        expect(outcome.stdout).not.toContain('set -euo pipefail');
        expect(outcome.stdout).not.toContain('main "$@"');
      });

      then('it points at the read skill rather than itself', () => {
        expect(outcome.stdout).toContain('pdf.transcribe');
      });
    });
  });

  given('[case6] a file named .pdf that poppler cannot read', () => {
    /**
     * .what = the page-count read fails, and the skill must SAY so
     *
     * .why  = this is the one exit-1 arm in the skill, and its exit code
     *         is the SAME code poppler emits unaided on an unreadable
     *         file. so `exitCode === 1` cannot tell "the guard ran and
     *         refused" from "the guard never ran" — only the MESSAGE can.
     *
     *         and the guard genuinely could not run: written as one
     *         statement, `set -e` + `pipefail` makes the assignment
     *         inherit the pipeline's status and abort on the assignment
     *         line, so the caller gets an EMPTY stdout, an empty stderr
     *         (pdfinfo's own message is discarded by 2>/dev/null), and a
     *         bare 1 with no reason attached.
     *
     *         `rule.require.assertions-that-discriminate`, leak 6.
     */
    when('[t0] the page-count read cannot complete', () => {
      const outcome = useThen('it is refused', () => {
        const fake = path.join(tempDir, 'error-page.pdf');
        fs.writeFileSync(fake, '<html><body>404 Not Found</body></html>');
        return runSkill([fake]);
      });

      then('exit code is 1 — a MALFUNCTION, not a constraint', () => {
        expect(outcome.exitCode).toBe(1);
      });

      then('⭐ it says the page count could not be read', () => {
        // the decisive clamp. the exit-code assertion above passes by
        // coincidence whether or not the guard executed at all.
        expect(outcome.stdout).toContain('could not read page count');
      });

      then('the reason names the file it could not read', () => {
        expect(outcome.stdout).toContain('error-page.pdf');
      });
    });
  });

  /**
   * .what = the report's own figures, checked against the FILE rather
   *         than against their own shape
   *
   * .why  = ⭐ an OUTPUT walk of `pdf.render.sh:268-278` finds nine rows
   *         and three readers. `page: N of M` is checked by value at
   *         `:124`. `crop:` is an echo of the skill's own argument, which
   *         `[t2]` already documents. every other row is either a SHAPE
   *         regex or wholly unread:
   *
   *           source:      ⛔ no assertion
   *           dpi:         ⛔ no assertion — and `[t3]` varies it 72<->300
   *           page size:   🟡 /[0-9.]+ x [0-9.]+ pt/
   *           bytes:       🟡 /bytes: [0-9]+/
   *           into:        ⛔ no assertion
   *
   *         ⛔ the two shape regexes are the sharper half, because they
   *            READ AS COVERAGE. `page size: W x H` renders TWO numbers
   *            in ONE row, and a regex that accepts any two numbers names
   *            neither cell — so `$(i+1)` and `$(i+3)` transposed in
   *            `describe_output` emits a plausible `792 x 612 pt` and
   *            satisfies both `:135` and `:136`.
   *
   *         ⚠️ that matters here specifically. the header's own guarantee
   *            is that the skill "reports pixel dimensions and byte size,
   *            so a caller can tell an empty render from a real one" —
   *            and a caller who sizes a crop box off a transposed page
   *            geometry crops the WRONG BAND. per
   *            `rule.require.deterministic-redaction` that band IS the
   *            check that decides whether a redaction box landed on the
   *            value, so the failure ends in a redaction reported as
   *            verified that was never looked at.
   *
   *         🚩 note where the extant clamp stops. `:135`'s
   *            `not.toContain('page size: unknown')` guards the defect
   *            the skill's own comment records — a fixed awk field index
   *            that yielded "unknown". the TRANSPOSITION is the same
   *            parse, one field apart, and it is worse: "unknown" is
   *            loud, `792 x 612` is not.
   *
   * ⚠️ the fixture's paper size is NOT hardcoded. ps2pdf takes its
   *    default from the host (letter on some, a4 on others), so an
   *    expected `612 x 792` would be a host-dependent clamp. the figures
   *    are checked against `getPngSize` — the IHDR reader, which is an
   *    INDEPENDENT instrument: it reads what pdftoppm actually produced,
   *    never what pdfinfo told the skill.
   */
  given('[case7] the report is the artifact — check its figures', () => {
    when('[t0] a full page is rendered at a known dpi', () => {
      const into = path.join(tempDir, 'report.png');
      const dpi = 150;
      const seen = useThen('it succeeds', () => {
        const res = runSkill([
          fixturePdf,
          '--page',
          '2',
          '--dpi',
          String(dpi),
          '--into',
          into,
        ]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toBe(0);
        return { res, png: getPngSize(into), bytes: fs.statSync(into).size };
      });

      // positive control: every assertion below reads a number out of the
      // report and compares it to this render. if the render itself were
      // degenerate — a zero-size png, a square page — the comparisons
      // would pass trivially and prove none of it.
      then('the render is a real, portrait-shaped page', () => {
        expect(seen.png.w).toBeGreaterThan(0);
        expect(seen.png.h).toBeGreaterThan(seen.png.w);
        expect(seen.bytes).toBeGreaterThan(0);
      });

      then('⭐ the page size is W x H, in that order, and to scale', () => {
        const row = /page size: ([0-9.]+) x ([0-9.]+) pt/.exec(seen.res.stdout);
        // the needle must match at all — a null here means the row is
        // absent, which no `not.toContain` below could distinguish.
        expect(row).not.toBeNull();
        const wPt = Number(row![1]);
        const hPt = Number(row![2]);

        // ⭐ the discriminator. converted at the dpi the caller asked for,
        //    the reported points must land on the pixels pdftoppm wrote.
        //    a transposition reports h where w belongs and reddens here,
        //    while `/[0-9.]+ x [0-9.]+ pt/` stays green over it.
        expect(
          Math.abs(Math.round((wPt / 72) * dpi) - seen.png.w),
        ).toBeLessThan(3);
        expect(
          Math.abs(Math.round((hPt / 72) * dpi) - seen.png.h),
        ).toBeLessThan(3);
        // and portrait in points too, so the order is asserted directly
        expect(hPt).toBeGreaterThan(wPt);
      });

      then('⭐ the byte figure is the FILE size, not merely a number', () => {
        // `/bytes: [0-9]+/` accepts a hardcoded or stale count. the whole
        // point of the row is that a caller trusts it instead of a viewer.
        expect(seen.res.stdout).toContain(`├─ bytes: ${seen.bytes}`);
      });

      then('the report names its source, its dpi, and where it wrote', () => {
        expect(seen.res.stdout).toContain(`├─ source: ${fixturePdf}`);
        expect(seen.res.stdout).toContain(`├─ dpi: ${dpi}`);
        expect(seen.res.stdout).toContain(`└─ into: ${into}`);
      });

      then('the report carries its header and its own name', () => {
        expect(seen.res.stdout).toContain('🦅 have a look,');
        expect(seen.res.stdout).toContain('🔎 pdf.render');
      });
    });

    when('[t1] a non-default dpi is asked for', () => {
      then('the report echoes THAT dpi, not the default', () => {
        const into = path.join(tempDir, 'report-300.png');
        const res = runSkill([
          fixturePdf,
          '--page',
          '1',
          '--dpi',
          '300',
          '--into',
          into,
        ]);
        expect(res.exitCode).toBe(0);
        expect(res.stdout).toContain('├─ dpi: 300');
        expect(res.stdout).not.toContain('├─ dpi: 150');
      });
    });

    when('[t2] no --crop is passed', () => {
      then('the crop row is absent, rather than empty', () => {
        // the row is inside an `if [[ -n "$CROP" ]]`. a drop of that guard
        // would print `crop:  (x,y,w,h px)` on every render, which reads
        // as a crop that was applied and was not.
        const into = path.join(tempDir, 'report-nocrop.png');
        const res = runSkill([fixturePdf, '--page', '1', '--into', into]);
        expect(res.exitCode).toBe(0);
        expect(res.stdout).not.toContain('crop:');
      });
    });
  });

  /**
   * .what = the two exit-1 arms inside `render()`, which no ordinary
   *         input can reach
   *
   * .why  = ⭐ AN ARM WALK OF `pdf.render.sh:225-234` FINDS TWO REFUSALS
   *         AND NO CASE THAT REACHES EITHER. both describe a broken or
   *         absent poppler, so a fixture cannot produce them — which is
   *         exactly why they went uncovered, and exactly why they are the
   *         arms a human meets on a machine that is not this one.
   *
   *         🚩 this is not a hypothetical arm. the repo's own history
   *            carries a commit that added the error capture to this very
   *            line — so CI once hit this arm and was given no reason at
   *            all. the `$err` capture on `:226` IS that fix, and until
   *            now it had no assertion of any kind.
   *
   *         ⚠️ LEAK 6, on the first arm. pdftoppm exits 1 when it fails,
   *            and this guard also exits 1 — so `exitCode === 1` cannot
   *            tell "the guard ran and reported the cause" from "the
   *            guard never ran and the shell fell over". that is precisely
   *            the state the CI fix was written for: a correct exit code
   *            with an empty reason. only the MESSAGE discriminates.
   */
  given('[case8] pdftoppm itself misbehaves', () => {
    /**
     * ⭐ THE POSITIVE CONTROL, AND IT IS MANDATORY HERE.
     *
     * every other case in this block asserts a FAILURE reached through a
     * PATH shim. a shim dir that was never consulted, or one that shadowed
     * `pdfinfo` too, would produce a failure for the wrong reason and each
     * of those cases would stay green over a mechanism that does not work.
     *
     * so one shim delegates to the real binary. it must SUCCEED — which
     * proves the shim is reached (the file is executable and on PATH) and
     * that the shim mechanism does not itself break the render.
     */
    when('[t0] the shim delegates to the real pdftoppm', () => {
      const into = path.join(tempDir, 'shim-control.png');
      const outcome = useThen('it still renders', () =>
        runSkillWithShim({
          body: `#!/usr/bin/env bash\nexec ${realPdftoppm} "$@"\n`,
          args: [fixturePdf, '--page', '1', '--into', into],
        }),
      );

      then('exit code is 0 — the shim path is live and harmless', () => {
        expect(outcome.exitCode).toBe(0);
        expect(fs.existsSync(into)).toBe(true);
      });
    });

    when('[t1] pdftoppm exits non-zero', () => {
      const into = path.join(tempDir, 'toppm-failed.png');
      const outcome = useThen('it is refused', () =>
        runSkillWithShim({
          // the message is deliberately unique, so an assertion on it
          // cannot be satisfied by any other text the skill emits.
          body:
            '#!/usr/bin/env bash\n' +
            'echo "I/O Error: Couldn\'t open file - marker-9f3a" >&2\n' +
            'exit 1\n',
          args: [fixturePdf, '--page', '1', '--into', into],
        }),
      );

      then('exit code is 1 — a MALFUNCTION, not a constraint', () => {
        expect(outcome.exitCode).toBe(1);
      });

      /**
       * ⚠️ THIS IS THE ASSERTION THAT CARRIES THE CASE.
       *
       * the code above passes by COINCIDENCE — pdftoppm exits 1 unaided,
       * so a run in which the guard never executed returns the same 1.
       */
      then('⭐ it says pdftoppm failed', () => {
        expect(outcome.stdout).toContain('pdftoppm failed');
      });

      /**
       * ⭐ AND THE TOOL'S OWN WORDS REACH THE HUMAN.
       *
       * the stderr merge inside the substitution on `:226` is the whole CI
       * fix. drop it and the guard still prints `pdftoppm failed:` with an
       * EMPTY tail — a refusal that names the step and withholds the
       * cause, which is the state that made the fix necessary.
       *
       * the assertion above cannot see that; only this one can.
       */
      then('⭐ it echoes the CAUSE poppler reported, not only the step', () => {
        expect(outcome.stdout).toContain('marker-9f3a');
      });

      then('no file was written at the named path', () => {
        expect(fs.existsSync(into)).toBe(false);
      });
    });

    /**
     * ⭐ THE SILENT-SUCCESS ARM, AND THE MORE DANGEROUS OF THE TWO.
     *
     * a pdftoppm that exits 0 and leaves no file behind is the shape the
     * skill's own header calls out for `--page`: poppler "writes no file
     * and exits 0", which reads as "the page is blank" rather than "that
     * page does not exist". `:231` is the backstop for the same shape
     * arriving from the render itself.
     *
     * 🚩 THIS DOCBLOCK FIRST CLAIMED THE EXIT CODE DISCRIMINATES HERE —
     *    "0 without the guard, 1 with it". THAT WAS WRONG, and the probe
     *    that was meant to confirm it refuted it instead.
     *
     *    MEASURED 2026-09-02, guard disabled:
     *
     *      ✓ then: exit code is 1 — a MALFUNCTION, not a silent success
     *      ✕ then: ⭐ it says no file was written
     *      ✕ then: the reason names the path it expected
     *          Received string:    ""
     *
     *    the run does NOT reach a success. it aborts one function later,
     *    in `describe_output`, where a byte count is read off a path that
     *    is not there — and `set -e` ends the process at exit 1, the SAME
     *    code this guard emits. so the caller gets a bare 1 with an EMPTY
     *    stdout and no reason attached to it.
     *
     * ⛔ LEAK 6, for the third time in this one file, and the reason the
     *    prediction was worth measuring rather than reasoning about. an
     *    exit code that COINCIDES is the normal case for a wrapper, and
     *    the intuition that a dropped guard changes the code is the exact
     *    intuition that leaves an arm covered only by a number.
     *
     *    only the MESSAGE assertions below can see this.
     */
    when('[t2] pdftoppm exits 0 and writes no file', () => {
      const into = path.join(tempDir, 'toppm-silent.png');
      const outcome = useThen('it is refused', () =>
        runSkillWithShim({
          body: '#!/usr/bin/env bash\nexit 0\n',
          args: [fixturePdf, '--page', '1', '--into', into],
        }),
      );

      then('exit code is 1 — a MALFUNCTION, not a silent success', () => {
        expect(outcome.exitCode).toBe(1);
      });

      then('⭐ it says no file was written', () => {
        expect(outcome.stdout).toContain('pdftoppm wrote no file');
      });

      /**
       * ⚠️ the EXPECTED PATH, named. a refusal that withheld it would
       *    leave the human unable to tell an absent render from one that
       *    landed somewhere they did not look — the same ambiguity the
       *    `-singlefile` comment on `:212` exists to remove.
       */
      then('the reason names the path it expected', () => {
        expect(outcome.stdout).toContain(into);
      });

      /**
       * ⛔ AND IT MUST NOT REPORT A SUCCESS.
       *
       * without the guard the run falls through to `describe_output`,
       * which reads a byte count off a file that is not there. the eagle
       * header is the token a human scans for; it must be absent.
       */
      then('⭐ it does NOT print the success header', () => {
        expect(outcome.stdout).not.toContain('have a look');
      });
    });
  });

  /**
   * .what = `check_tools` (:119-127), the last arm in this file that no
   *         case reached
   *
   * .why  = ⭐ THE LOOP CHECKS TWO TOOLS AND EVERY CASE HAD BOTH. so the
   *         second iteration was code every run executed and no assertion
   *         read — an arm walk answers "which case reaches this?" with
   *         "all of them" and moves on satisfied.
   *
   *         this is the arm a human meets on a machine that is not this
   *         one: a fresh container, a CI image without poppler, a mac
   *         with only half the suite installed. it is the FIRST thing
   *         they see from this skill, and the only place the cure —
   *         `install poppler-utils` — is ever named.
   *
   * ⭐ THE TWO CASES BELOW ARE EACH OTHER'S CONTROL, and that is why
   *    neither needs a separate positive one.
   *
   *    the loop reads `for tool in pdftoppm pdfinfo`, so pdftoppm is
   *    checked first. under a mechanism that made BOTH tools absent —
   *    a mis-built bin dir, a PATH that never took — every run would
   *    refuse on pdftoppm, and [t1] would go red. and under a guard that
   *    checked only the first tool, [t1] would go red the same way.
   *
   *    so [t1] rules out both the broken harness and the plausible wrong
   *    implementation, with one assertion.
   *
   * ⭐ MEASURED 2026-09-02, and the two probes redden DISJOINT sets:
   *
   *      loop -> `for tool in pdftoppm`   ->  94/2, exactly [t1]'s two
   *      loop -> `for tool in pdfinfo`    ->  93/3, exactly [t0]'s three
   *
   *    so neither case rides on the other, and each names its own tool.
   *
   * ⚠️ AND THE UNGUARDED FAILURE IS `Received: 127`, WITH EMPTY STDOUT.
   *
   *    without the check, the run does not refuse — it reaches the first
   *    use of the absent tool and the shell ends it at 127, the bare
   *    "command not found" code. so the human loses three things at once:
   *    the documented exit 2, the skill's own refusal block, and the only
   *    line that names the package to install.
   *
   *    ⭐ note the contrast with [case8], where the code COINCIDES and
   *       only the message discriminates. here the code moves (2 -> 127),
   *       so it discriminates too — which is why an exit-code assertion
   *       earns its place in BOTH cases even though it carries neither.
   */
  given('[case9] a tool poppler provides is not installed', () => {
    when('[t0] pdftoppm is absent', () => {
      const outcome = useThen('it is refused', () =>
        runSkillWithOnly({ tools: ['pdfinfo'], args: [fixturePdf] }),
      );

      then('exit code is 2 — a constraint, not a malfunction', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('⭐ it names the tool that is absent', () => {
        expect(outcome.stdout).toContain('pdftoppm not found');
      });

      /**
       * ⚠️ THE CURE, NOT ONLY THE SYMPTOM.
       *
       * "pdftoppm not found" sends a reader to hunt for a package named
       * pdftoppm, which does not exist. the package is poppler-utils, and
       * this line is the only place the skill says so.
       */
      then('⭐ it names the PACKAGE to install, not just the binary', () => {
        expect(outcome.stdout).toContain('install poppler-utils');
      });

      then('it refuses BEFORE it renders — no file was written', () => {
        expect(fs.existsSync(path.join(tempDir, 'fixture.p1.png'))).toBe(false);
      });
    });

    /**
     * ⭐ THE DISCRIMINATOR, per the header above.
     *
     * pdfinfo is the SECOND tool in the loop, so this case is red under a
     * guard that checks only the first, and red under a harness that made
     * both tools absent. the exclusion is what carries it: a run that
     * refused on pdftoppm instead would satisfy an assertion on exit code
     * and on "install poppler-utils" alike.
     */
    when('[t1] pdfinfo is absent', () => {
      const outcome = useThen('it is refused', () =>
        runSkillWithOnly({ tools: ['pdftoppm'], args: [fixturePdf] }),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('⭐ it names pdfinfo — the SECOND tool in the loop', () => {
        expect(outcome.stdout).toContain('pdfinfo not found');
      });

      then('⭐ and it does NOT name pdftoppm, which is present', () => {
        expect(outcome.stdout).not.toContain('pdftoppm not found');
      });
    });
  });

  /**
   * ⭐ THE ARG-PARSE ARMS THAT NO OTHER CASE REACHES.
   *
   * `parse_args` has SIX arms. four already carry a case:
   *
   *   --help          [case5]
   *   --page/--dpi/--crop/--into   [case1]-[case3]
   *   -*)             [t6], via --zoom
   *   *) second token [t8], via two bare paths
   *
   * two do not, and this block is for exactly those:
   *
   *   -h              the alias on the --help arm
   *   --skill|--repo|--role   the rhachet passthrough
   *
   * ⚠️ AND THIS SKILL'S `*)` IS A POSITIONAL ACCUMULATOR, NOT A REFUSAL.
   *
   *    every prior arg-parse walk in this repo met a `*)` that refused on
   *    sight. here the FIRST bare token becomes PDF_PATH and only a SECOND
   *    one refuses — which inverts how [t1] below must be ordered. see the
   *    note on that case.
   */
  given('[case10] the arg-parse arms with no other case', () => {
    /**
     * a dead `-h` does not fall through to a help block. it falls to the
     * `-*)` arm one line down and is reported as `unknown option: -h` at
     * exit 2 — so the alias breaks INTO a refusal, and a reader who typed
     * the short form is told their flag does not exist.
     *
     * ⚠️ the two assertions are split across two `then`s deliberately.
     *    jest halts a `then` at its first red, so an exclusion co-located
     *    with a positive can never be measured under a probe that reddens
     *    the positive.
     */
    when('[t0] the -h alias is used', () => {
      const outcome = useThen('it succeeds', () => runSkill(['-h']));

      then('exit code is 0 and it renders the usage block', () => {
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('--page');
      });

      then('⭐ it does NOT fall through to the unknown-option arm', () => {
        expect(outcome.stdout).not.toContain('unknown option');
      });
    });

    /**
     * rhachet appends `--repo`, `--skill` and `--role` to every skill it
     * dispatches. the arm consumes each flag AND its value. drop the `2`
     * from its `shift` and the VALUE is re-read as a token on the next
     * pass of the loop.
     *
     * ⚠️ ORDER IS LOAD-BEARING HERE, AND FOR A REASON UNIQUE TO THIS SKILL.
     *
     *    the pdf path comes first, so it takes the PDF_PATH slot on the
     *    `*)` arm. that leaves `bhrain` — the value of the first
     *    passthrough flag — as the SECOND bare token under a shift defect,
     *    which is the token `*)` actually refuses by name.
     *
     *    pass the flags first instead and `bhrain` would become PDF_PATH,
     *    the refusal would name the fixture path, and the needle below
     *    would have to be the fixture rather than a word we chose.
     *
     * ⚠️ and `--repo` must come FIRST among the three, because the parser
     *    halts at the FIRST stray token — only that flag's value can ever
     *    reach the refusal.
     *
     * ⚠️ `bhrain` is safe as a needle: the report echoes the pdf path, the
     *    page, the dpi, the crop and the output path, and none of those
     *    can carry it on a correct run.
     */
    when('[t1] rhachet passes --repo, --skill and --role', () => {
      const into = path.join(tempDir, 'passthrough.png');
      const outcome = useThen('it succeeds', () =>
        runSkill([
          fixturePdf,
          '--repo',
          'bhrain',
          '--skill',
          'pdf.render',
          '--role',
          'transcriber',
          '--into',
          into,
        ]),
      );

      then('⭐ it renders the page, rather than refuse', () => {
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('have a look,');
      });

      then('⭐ it does NOT read a flag VALUE as a positional argument', () => {
        expect(outcome.stdout).not.toContain('bhrain');
      });
    });
  });
});
