import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the pdf.merge skill
 * .why  = the skill exists for ONE guarantee — that every input page
 *         survives into the output — so the suite's center of gravity is
 *         the case where that guarantee FAILS. a merge that drops a page
 *         writes a valid PDF at a plausible size and reports success, so
 *         a suite that only ever merges correctly proves that a correct
 *         merge is correct and leaves the reconciliation unexercised.
 *
 *         hermetic: every fixture pdf is built at runtime via ps2pdf, no
 *         committed binaries. see rule.require.hermetic-tests.
 */

const scriptPath = path.join(__dirname, 'pdf.merge.sh');

const UTF8 = 'utf-8' as const;

// eager, not deferred: path.join needs a real string, and a test-fns
// proxy is an object until it is awaited.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-merge-'));

/**
 * ⚠️ `cwd: tempDir` is tidiness here, NOT load-bearing — and the
 *    difference is worth stating, because the sibling suite's identical
 *    line IS load-bearing.
 *
 *    `pdf.render` defaults `--into` to a RELATIVE path, so an unset cwd
 *    scatters pngs into the checkout. `pdf.merge` has NO default: an
 *    absent `--into` is refused at exit 2, and every case below passes
 *    an absolute one. so the cwd changes no outcome.
 *
 * ⭐ it is pinned anyway, so a future default cannot silently inherit the
 *    checkout as its write target.
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

const whichOne = (tool: string): string => {
  const found = spawnSync('which', [tool], { encoding: UTF8 });
  const at = (found.stdout ?? '').trim();
  if (!at) throw new Error(`${tool} not on PATH — cannot run this suite`);
  return at;
};

const realBash = whichOne('bash');

/**
 * 🎯 A PATH SHIM — AND HERE IT IS THE POINT OF THE SUITE, NOT A CORNER.
 *
 * `verify_output` is the whole reason this skill exists, and NO INPUT CAN
 * REACH IT. a healthy pdfunite never drops a page, so on a real toolchain
 * the reconciliation is code that has never once executed its refusal.
 *
 * so `pdfunite` alone is replaced. `pdfinfo` is deliberately NOT replaced:
 * `tally_inputs` must read the real fixtures to compute EXPECTED_PAGES,
 * and `verify_output` must read the real output to compute ACTUAL_PAGES.
 * shim either one and the comparison becomes two mock numbers agreeing
 * with each other, which is the defect this suite is written against.
 *
 * see howto.mock-cli-via-path — a last resort, and this is one.
 */
const runSkillWithShim = (input: {
  body: string;
  args: string[];
}): { stdout: string; stderr: string; exitCode: number } => {
  const binDir = fs.mkdtempSync(path.join(tempDir, 'shim-'));
  const shim = path.join(binDir, 'pdfunite');
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
 * ⚠️ `dirname` IS ALWAYS KEPT, and it is not a poppler tool. the skill
 *    resolves SCRIPT_DIR through `$(dirname "${BASH_SOURCE[0]}")` before
 *    it sources output.sh, and dirname is a coreutils BINARY rather than
 *    a bash builtin. drop it and `set -e` ends the run before
 *    `check_tools` is reached — a refusal for the wrong reason, wearing
 *    the shape of the one under test.
 *
 * ⚠️ the interpreter is passed by ABSOLUTE path, since the narrowed PATH
 *    holds no `bash`.
 */
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

// a pdf of N pages, each stamped with a caller-named marker, so the
// ORDER of the merged output can be read back off the text layer.
const genPdf = (input: { into: string; markers: string[] }): void => {
  const ps = [
    '%!PS',
    ...input.markers.flatMap((marker) => [
      '/Helvetica findfont 24 scalefont setfont',
      '72 700 moveto',
      `(${marker}) show`,
      'showpage',
    ]),
  ].join('\n');

  const psPath = `${input.into}.ps`;
  fs.writeFileSync(psPath, ps);
  const res = spawnSync('ps2pdf', [psPath, input.into], { encoding: UTF8 });
  if (res.status !== 0) {
    throw new Error(`ps2pdf failed to build fixture: ${res.stderr}`);
  }
};

// an INDEPENDENT instrument: read the pages back out of the artifact,
// rather than trust the count the skill echoed from its own arithmetic.
const readPageCount = (at: string): number => {
  const res = spawnSync('pdfinfo', [at], { encoding: UTF8 });
  const line = (res.stdout ?? '')
    .split('\n')
    .find((l) => l.startsWith('Pages:'));
  if (!line) throw new Error(`pdfinfo read no page count from ${at}`);
  return Number(line.split(/\s+/)[1]);
};

const readText = (at: string): string => {
  const res = spawnSync('pdftotext', [at, '-'], { encoding: UTF8 });
  if (res.status !== 0) throw new Error(`pdftotext failed on ${at}`);
  return res.stdout ?? '';
};

const coverPdf = path.join(tempDir, 'cover.pdf'); // 1 page
const bodyPdf = path.join(tempDir, 'body.pdf'); // 2 pages
const signedPdf = path.join(tempDir, 'signed.pdf'); // 1 page + sig furniture

beforeAll(() => {
  // failfast: the skill needs poppler, the fixtures need ghostscript,
  // and the independent instruments need pdftotext.
  for (const tool of ['pdfunite', 'pdfinfo', 'pdftotext', 'ps2pdf']) {
    const res = spawnSync('which', [tool], { encoding: UTF8 });
    if (res.status !== 0) {
      throw new Error(
        `${tool} required for these tests. install poppler-utils and ghostscript.`,
      );
    }
  }

  genPdf({ into: coverPdf, markers: ['COVER ALPHA'] });
  genPdf({ into: bodyPdf, markers: ['BODY BRAVO', 'BODY CHARLIE'] });

  // ⚠️ the signature guard is a BYTE grep for `/ByteRange` and
  //    `/Adobe.PPKLite`, so the fixture is a real pdf carrying exactly
  //    those bytes. a genuinely signed pdf cannot be produced here, and
  //    is not what the guard reads anyway.
  genPdf({ into: signedPdf, markers: ['SIGNED DELTA'] });
  fs.appendFileSync(signedPdf, '\n% /ByteRange [0 1 2 3] /Adobe.PPKLite\n');
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('pdf.merge.sh', () => {
  given('[case1] a 1 page cover and a 2 page body', () => {
    when('[t0] they are merged in argument order', () => {
      const into = path.join(tempDir, 'packet.pdf');
      const outcome = useThen('it succeeds', () =>
        runSkill([coverPdf, bodyPdf, '--into', into]),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('the pdf exists at exactly the named path', () => {
        expect(fs.existsSync(into)).toBe(true);
      });

      then('the file is a real pdf, by magic bytes', () => {
        const head = fs.readFileSync(into).subarray(0, 4).toString('latin1');
        expect(head).toBe('%PDF');
      });

      then(
        'the output carries every input page — read back, not echoed',
        () => {
          expect(readPageCount(into)).toBe(3);
        },
      );

      then('the ARGUMENT order is the page order', () => {
        // on a filing the order is substantive: a cover letter behind
        // the instrument it transmits is a different document.
        const text = readText(into);
        expect(text.indexOf('COVER ALPHA')).toBeGreaterThanOrEqual(0);
        expect(text.indexOf('COVER ALPHA')).toBeLessThan(
          text.indexOf('BODY BRAVO'),
        );
        expect(text.indexOf('BODY BRAVO')).toBeLessThan(
          text.indexOf('BODY CHARLIE'),
        );
      });

      then('the readout reconciles the page counts', () => {
        expect(outcome.stdout).toContain('pages: 3 of 3 expected ✅');
      });

      then('the readout names each input and its page count', () => {
        expect(outcome.stdout).toContain('1 page(s)');
        expect(outcome.stdout).toContain('2 page(s)');
      });

      then('the readout matches snapshot', () => {
        expect(outcome.stdout.split(tempDir).join('<tmp>')).toMatchSnapshot();
      });
    });

    when('[t1] the same merge is asked for in the REVERSE order', () => {
      const into = path.join(tempDir, 'reversed.pdf');
      const outcome = useThen('it succeeds', () =>
        runSkill([bodyPdf, coverPdf, '--into', into]),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('the order follows the arguments, never a sort', () => {
        // this is the discriminating case: a skill that sorted its
        // inputs would pass [t0] and fail here.
        const text = readText(into);
        expect(text.indexOf('BODY BRAVO')).toBeLessThan(
          text.indexOf('COVER ALPHA'),
        );
      });
    });

    when('[t2] --mode plan is asked for', () => {
      const into = path.join(tempDir, 'planned.pdf');
      const outcome = useThen('it succeeds', () =>
        runSkill([coverPdf, bodyPdf, '--into', into, '--mode', 'plan']),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('it writes NO file', () => {
        expect(fs.existsSync(into)).toBe(false);
      });

      then('it reports the total it would produce', () => {
        expect(outcome.stdout).toContain('would total: 3 page(s)');
      });

      then('it names the path it would write', () => {
        expect(outcome.stdout).toContain(into);
      });
    });
  });

  given('[case2] a pdfunite that silently drops a page', () => {
    // 🎯 THE CASE THE SKILL EXISTS FOR.
    //
    //    the shim merges only the FIRST input, so it exits 0 and writes a
    //    valid pdf at a plausible size — exactly the shape of the defect.
    //    every visual check passes. only the count catches it.
    const realPdfunite = whichOne('pdfunite');
    const shimDrops = [
      '#!/usr/bin/env bash',
      'args=( "$@" )',
      'out="${args[${#args[@]}-1]}"',
      `exec ${realPdfunite} "\${args[0]}" "$out"`,
      '',
    ].join('\n');

    when('[t0] a merge is attempted', () => {
      const into = path.join(tempDir, 'dropped.pdf');
      const outcome = useThen('it refuses', () =>
        runSkillWithShim({
          body: shimDrops,
          args: [coverPdf, bodyPdf, '--into', into],
        }),
      );

      then('exit code is 1 — a malfunction, not a constraint', () => {
        expect(outcome.exitCode).toBe(1);
      });

      then('the refusal names both counts', () => {
        expect(outcome.stdout).toContain(
          'page count mismatch: expected 3, output has 1',
        );
      });

      then('the shim really did produce a short but VALID pdf', () => {
        // proves the case is the silent one: had the shim produced
        // garbage, the refusal would have come from the page READ rather
        // than from the reconciliation, and this suite would be
        // asserting on the wrong arm.
        expect(fs.existsSync(into)).toBe(true);
        expect(fs.readFileSync(into).subarray(0, 4).toString('latin1')).toBe(
          '%PDF',
        );
        expect(readPageCount(into)).toBe(1);
      });
    });
  });

  given('[case3] a pdfunite that exits non-zero', () => {
    const shimFails = [
      '#!/usr/bin/env bash',
      'echo "pdfunite: catastrophic failure" >&2',
      'exit 3',
      '',
    ].join('\n');

    when('[t0] a merge is attempted', () => {
      const into = path.join(tempDir, 'failed.pdf');
      const outcome = useThen('it refuses', () =>
        runSkillWithShim({
          body: shimFails,
          args: [coverPdf, bodyPdf, '--into', into],
        }),
      );

      then('exit code is 1', () => {
        expect(outcome.exitCode).toBe(1);
      });

      then("the refusal carries the tool's own stderr", () => {
        expect(outcome.stdout).toContain('catastrophic failure');
      });
    });
  });

  given('[case4] a pdfunite that exits 0 and writes no file', () => {
    const shimSilent = ['#!/usr/bin/env bash', 'exit 0', ''].join('\n');

    when('[t0] a merge is attempted', () => {
      const into = path.join(tempDir, 'absent.pdf');
      const outcome = useThen('it refuses', () =>
        runSkillWithShim({
          body: shimSilent,
          args: [coverPdf, bodyPdf, '--into', into],
        }),
      );

      then('exit code is 1', () => {
        expect(outcome.exitCode).toBe(1);
      });

      then('the refusal says no file was written', () => {
        expect(outcome.stdout).toContain('pdfunite wrote no file');
      });
    });
  });

  given('[case5] an input carrying a cryptographic signature', () => {
    when('[t0] a merge is attempted', () => {
      const into = path.join(tempDir, 'wouldvoid.pdf');
      const outcome = useThen('it refuses', () =>
        runSkill([coverPdf, signedPdf, '--into', into]),
      );

      then('exit code is 2 — a constraint', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the signature and the harm', () => {
        expect(outcome.stdout).toContain('cryptographic signature');
        expect(outcome.stdout).toContain('void it');
      });

      then('no file was written', () => {
        expect(fs.existsSync(into)).toBe(false);
      });
    });
  });

  given('[case6] an --into path that is also an input', () => {
    when('[t0] a merge is attempted onto one of its own sources', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([coverPdf, bodyPdf, '--into', coverPdf]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the collision', () => {
        expect(outcome.stdout).toContain('--into is also an input');
      });

      then('the SOURCE document is untouched', () => {
        // the failure mode this guard prevents is a truncated input, not
        // a bad output — so the assertion is on the input.
        expect(readPageCount(coverPdf)).toBe(1);
      });
    });
  });

  given('[case7] malformed invocations', () => {
    when('[t0] only one pdf is given', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([coverPdf, '--into', path.join(tempDir, 'one.pdf')]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the minimum', () => {
        expect(outcome.stdout).toContain('need at least 2 PDFs');
      });
    });

    when('[t1] --into is absent', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([coverPdf, bodyPdf]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal asks for the output path', () => {
        expect(outcome.stdout).toContain('no --into given');
      });
    });

    when('[t2] --into does not end in .pdf', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([coverPdf, bodyPdf, '--into', path.join(tempDir, 'out.png')]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the required extension', () => {
        expect(outcome.stdout).toContain('--into must end in .pdf');
      });
    });

    when('[t3] an input does not exist', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([
          coverPdf,
          path.join(tempDir, 'nowhere.pdf'),
          '--into',
          path.join(tempDir, 'out.pdf'),
        ]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the absent path', () => {
        expect(outcome.stdout).toContain('file not found');
      });
    });

    when('[t4] the output directory does not exist', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([
          coverPdf,
          bodyPdf,
          '--into',
          path.join(tempDir, 'nodir', 'out.pdf'),
        ]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the absent directory', () => {
        expect(outcome.stdout).toContain('output directory does not exist');
      });
    });

    when('[t5] --mode is neither plan nor apply', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([
          coverPdf,
          bodyPdf,
          '--into',
          path.join(tempDir, 'out.pdf'),
          '--mode',
          'yolo',
        ]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the valid modes', () => {
        expect(outcome.stdout).toContain('--mode must be plan or apply');
      });
    });

    when('[t6] an unknown option is given', () => {
      const outcome = useThen('it refuses', () =>
        runSkill([coverPdf, bodyPdf, '--flatten']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the option', () => {
        expect(outcome.stdout).toContain('unknown option: --flatten');
      });
    });
  });

  given('[case8] pdfunite is not installed', () => {
    when('[t0] a merge is attempted', () => {
      const outcome = useThen('it refuses', () =>
        runSkillWithOnly({
          tools: ['pdfinfo'],
          args: [
            coverPdf,
            bodyPdf,
            '--into',
            path.join(tempDir, 'notools.pdf'),
          ],
        }),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the refusal names the tool and how to get it', () => {
        expect(outcome.stdout).toContain('pdfunite not found');
        expect(outcome.stdout).toContain('poppler-utils');
      });
    });
  });

  given('[case9] --help is asked for', () => {
    when('[t0] the skill is invoked with --help', () => {
      const outcome = useThen('it succeeds', () => runSkill(['--help']));

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('it documents the guarantee, not merely the flags', () => {
        expect(outcome.stdout).toContain('usage:');
        expect(outcome.stdout).toContain('guarantee:');
      });

      then('the help stops at its own fence', () => {
        // the header is delimited by its own ##### fences rather than a
        // hardcoded line count, so it cannot dump the executable when
        // the header grows. mawk has no interval expressions, so a
        // `{5,}` pattern would match no line and print everything.
        expect(outcome.stdout).not.toContain('set -euo pipefail');
      });

      then('the help matches snapshot', () => {
        expect(outcome.stdout).toMatchSnapshot();
      });
    });
  });
});
