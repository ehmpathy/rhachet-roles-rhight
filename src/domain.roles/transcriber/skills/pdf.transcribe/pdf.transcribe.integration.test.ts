import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the pdf.transcribe dispatcher
 * .why  = the dispatcher exists for ONE reason: to ask "does this page
 *         have text?" per PAGE rather than per FILE. so the load-bearing
 *         fixture here is a MIXED document — text pages around an
 *         image-only page — which is exactly the shape that made a
 *         whole-file check return scanned pages as empty at exit 0.
 *
 * .note = these tests spend no money on OCR, deliberately. the
 *         dispatcher's own job is ROUTING, and routing is fully
 *         observable via --mode plan and via the forced-textual guard.
 *         the OCR call itself is covered by
 *         pdf.transcribe.via.optical.integration.test.ts, which owns the
 *         credential requirement. this is a scope split, not a gap.
 */

const scriptPath = path.join(__dirname, 'pdf.transcribe.sh');

const UTF8 = 'utf-8' as const;

// eager, not deferred: path.join needs a real string, and a test-fns
// proxy is an object until it is awaited.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-transcribe-'));

const runSkill = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...args], {
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

/**
 * ⚠️ A PATH NARROWED TO ONE DIRECTORY, SO A TOOL CAN BE MADE ABSENT.
 *
 * a shim — a fake binary prepended to PATH — cannot express absence,
 * because a shim IS an installed tool. `check_tools` asks the other
 * question: what if the tool is not installed at all.
 *
 * so PATH is replaced outright by a directory that holds symlinks to
 * exactly the tools a case names. a tool left unnamed is absent.
 *
 * ⚠️ the interpreter is passed by ABSOLUTE path. with PATH narrowed to a
 *    directory that holds no `bash`, a bare `'bash'` would be resolved
 *    against an environment that may or may not be the child's, per
 *    platform — so the suite would fail to launch rather than exercise
 *    the guard, and the reason would be off in the harness.
 *
 * ⛔ THE COREUTILS BELOW ARE ALWAYS KEPT, AND NONE OF THEM IS A POPPLER
 *    TOOL. omit one and the harness manufactures a failure of its own,
 *    IN THE SHAPE OF THE ONE UNDER TEST.
 *
 *    | tool      | where the skill reaches for it                  |
 *    |-----------|-------------------------------------------------|
 *    | `dirname` | `:69`, to derive SCRIPT_DIR                     |
 *    | `awk`     | `:189` page count · `:267` optical header strip |
 *    | `sed`     | `:260`, the textual header strip                |
 *    | `tr`      | `:203`, the whitespace strip in `page_has_text` |
 *
 *    each is a coreutils BINARY, not a bash builtin, so under a narrowed
 *    PATH each finds no executable and `set -e` ends the run early.
 *
 * 🚩 MEASURED TWICE, AND THE SECOND TIME COST A WHOLE DIAGNOSIS.
 *
 *    the first miss was `dirname`, on the sibling pdf.render suite
 *    (2026-09-02): every assertion red at `Received: 1`, `Received
 *    string: ""`.
 *
 *    the second was `awk`, here, 2026-09-03. the probe for [case6]
 *    returned `Received: 127` with an EMPTY stdout, which reads as "the
 *    skill dies silently when a tool is absent" — a substantive finding
 *    about the skill, and a false one. the true cause was `:189`:
 *
 *      PAGE_COUNT="$(printf '%s\n' "$info" | awk '/^Pages:/ …')"
 *
 *    with awk absent that pipeline exits 127, and `set -e` + `pipefail`
 *    abort ON THE ASSIGNMENT — the very shape #136 fixed one line above.
 *    with awk restored, the same probe produced the skill's real
 *    behaviour: a refusal at exit 1 that blames the document.
 *
 *    ⭐ so a harness defect and a skill defect are INDISTINGUISHABLE from
 *       the assertion output alone. both print an unexpected exit and an
 *       unexpected string. when a probe surprises you, rule the harness
 *       out before you write down what the skill does.
 *
 * ⭐ once the coreutils are present this is safe, because `check_tools` is
 *    the FIRST call in `main` after `parse_args`, and `parse_args` is pure
 *    bash. so the refusal lands before the narrowed PATH could
 *    misattribute a later failure to it.
 */
const realBash = whichOne('bash');

const COREUTILS_ALWAYS = ['dirname', 'awk', 'sed', 'tr'];

const runSkillWithOnly = (input: {
  tools: string[];
  args: string[];
}): { stdout: string; stderr: string; exitCode: number } => {
  const binDir = fs.mkdtempSync(path.join(tempDir, 'onlybin-'));
  for (const tool of [...input.tools, ...COREUTILS_ALWAYS])
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

// a page carrying real text, extractable by pdftotext
const pageWithText = (lines: string[]): string[] => [
  '/Helvetica findfont 12 scalefont setfont',
  ...lines.flatMap((line, i) => [
    `72 ${720 - i * 16} moveto`,
    `(${line}) show`,
  ]),
  'showpage',
];

// a page carrying only ink, no text layer — this is what a scan looks
// like to pdftotext: present, legible to a human, and empty to the
// extractor.
const pageWithoutText = (): string[] => [
  '100 100 300 400 rectfill',
  'showpage',
];

const genPdf = (input: { into: string; pages: string[][] }): void => {
  const ps = ['%!PS', ...input.pages.flat()].join('\n');
  const psPath = `${input.into}.ps`;
  fs.writeFileSync(psPath, ps);
  const res = spawnSync('ps2pdf', [psPath, input.into], { encoding: UTF8 });
  if (res.status !== 0) {
    throw new Error(`ps2pdf failed to build fixture: ${res.stderr}`);
  }
};

// the fixture the dispatcher exists for: text cover sheet, scanned body,
// text back page. a whole-FILE check says "this pdf has text" and hands
// page 2 back empty.
const mixedPdf = path.join(tempDir, 'mixed.pdf');

// an all-text fixture, so the apply path can be exercised end to end
// without any OCR spend
const textPdf = path.join(tempDir, 'text.pdf');

beforeAll(() => {
  // failfast: the skill and its fixture generator both need poppler +
  // ghostscript. absent dep is a blocker, never a skip.
  for (const tool of ['pdftotext', 'pdfinfo', 'ps2pdf']) {
    const res = spawnSync('which', [tool], { encoding: UTF8 });
    if (res.status !== 0) {
      throw new Error(
        `${tool} required for these tests. install poppler-utils and ghostscript.`,
      );
    }
  }

  genPdf({
    into: mixedPdf,
    pages: [
      pageWithText(['STATE OF DELAWARE', 'certification cover sheet']),
      pageWithoutText(),
      pageWithText(['back page', 'filed 2020']),
    ],
  });

  genPdf({
    into: textPdf,
    pages: [
      pageWithText(['SANDPINE INC', 'charter page one']),
      pageWithText(['schedule L', 'end of year 0']),
    ],
  });
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('pdf.transcribe.sh', () => {
  given('[case1] a MIXED pdf — text, image-only, text', () => {
    when('[t0] the routing is planned', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill([mixedPdf, '--mode', 'plan']),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('each page is routed by its OWN text layer, not the file', () => {
        // the whole reason this skill exists. a per-FILE check would put
        // all three on textual, because page 1 has text.
        expect(outcome.stdout).toContain('page 1: textual');
        expect(outcome.stdout).toContain('page 2: optical');
        expect(outcome.stdout).toContain('page 3: textual');
      });

      then('the OCR page count is stated before anything is spent', () => {
        expect(outcome.stdout).toContain('1 (costs per page');
        expect(outcome.stdout).toContain('2 (free, offline)');
      });

      /**
       * .why = ⛔ `source:`, `via:` and `pages:` were read by the SNAPSHOT
       *        below and by no other assertion — and a snapshot is not a
       *        guard in this repo right now. `[ -n $RESNAP ]` is unquoted
       *        in package.json, so it collapses to `[ -n ]`, which POSIX
       *        evaluates TRUE for every value; `--updateSnapshot` is
       *        therefore passed on every run and no snapshot can fail
       *        (on the record since #127).
       *
       *        so a plan that priced the WRONG document — `source:`
       *        naming one file while the routes describe another — had
       *        zero live coverage, on the one mode a human runs
       *        specifically to decide whether to spend money on OCR.
       */
      then('the plan names the document it actually priced', () => {
        expect(outcome.stdout).toContain(`├─ source: ${mixedPdf}`);
        expect(outcome.stdout).toContain('├─ via: auto');
        expect(outcome.stdout).toContain('├─ pages: 3');
      });

      /**
       * .why = the route lines are read as a SET above. the tree they sit
       *        in claims an ORDER — the last page closes with `└─` and
       *        every other opens with `├─`. a renderer that emitted `├─`
       *        for all of them leaves an unterminated tree, and every
       *        `page N: route` assertion stays green over it.
       */
      then('the route tree terminates on the LAST page', () => {
        expect(outcome.stdout).toContain('├─ page 1: textual');
        expect(outcome.stdout).toContain('└─ page 3: textual');
        expect(outcome.stdout).not.toContain('└─ page 1:');
      });

      then('plan emits ROUTING only — never page content', () => {
        // if plan leaked content, it would have had to run the leaves,
        // which is the spend this mode exists to avoid.
        expect(outcome.stdout).not.toContain('<!-- via:');
        expect(outcome.stdout).not.toContain('STATE OF DELAWARE');
      });

      then('the plan matches snapshot', () => {
        // split/join, not .replace: a readout can carry the tmp path more
        // than once (source AND into), and a string-pattern .replace
        // stabilizes only the first — which churns the snapshot every run.
        const stable = outcome.stdout.split(tempDir).join('<tmp>');
        expect(stable).toMatchSnapshot();
      });
    });

    when('[t1] --via textual is forced on it', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([mixedPdf, '--via', 'textual']),
      );

      then('exit code is 2 — a constraint, not a malfunction', () => {
        // THE regression guard. the old behavior was exit 0 with page 2
        // returned blank, which reads as "that page is empty" rather
        // than "that page was never examined".
        expect(outcome.exitCode).toBe(2);
      });

      then('it names the page that has no text layer', () => {
        expect(outcome.stdout).toContain('no text layer');
        expect(outcome.stdout).toContain('2');
      });

      then('it says what the silent failure would have looked like', () => {
        expect(outcome.stdout).toContain('reads as a blank page');
      });

      then('it points at the routes that CAN honor the request', () => {
        expect(outcome.stdout).toContain('--via auto');
        expect(outcome.stdout).toContain('--via optical');
      });

      then('the refusal matches snapshot', () => {
        // split/join, not .replace: a readout can carry the tmp path more
        // than once (source AND into), and a string-pattern .replace
        // stabilizes only the first — which churns the snapshot every run.
        const stable = outcome.stdout.split(tempDir).join('<tmp>');
        expect(stable).toMatchSnapshot();
      });
    });

    when('[t2] --via textual is forced in PLAN mode', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([mixedPdf, '--via', 'textual', '--mode', 'plan']),
      );

      then('exit code is still 2', () => {
        // a plan that could never be executed must not print as if it
        // were fine. the guard fires ahead of the mode branch.
        expect(outcome.exitCode).toBe(2);
      });

      /**
       * ⭐ THE DISCRIMINATOR. every constraint refusal in this skill exits
       *    2 — by convention (rule.require.exit-code-semantics), not by
       *    accident. so the code above cannot tell "the TEXT-LAYER guard
       *    fired" from "some OTHER arm refused first": a bad --via, an
       *    unknown option, an absent file all land on the same number.
       *
       * ⚠️ and the neighbor below asserts an ABSENCE, which is satisfied by
       *    every one of those wrong causes just as readily. two assertions,
       *    neither able to name the guard under test.
       *
       *    the message is the only observable that separates them.
       */
      then('the reason is the TEXT LAYER, not some other refusal', () => {
        expect(outcome.stdout).toContain('no text layer');
      });

      then('no routing table is printed', () => {
        expect(outcome.stdout).not.toContain('page 1: textual');
      });
    });

    when('[t3] --via optical is forced on it', () => {
      const outcome = useThen('it plans', () =>
        runSkill([mixedPdf, '--via', 'optical', '--mode', 'plan']),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('every page routes optical, including the text pages', () => {
        expect(outcome.stdout).toContain('page 1: optical');
        expect(outcome.stdout).toContain('page 2: optical');
        expect(outcome.stdout).toContain('page 3: optical');
      });

      then('the full page count is priced', () => {
        expect(outcome.stdout).toContain('3 (costs per page');
      });
    });
  });

  given('[case2] an all-text pdf', () => {
    when('[t0] it is transcribed to stdout', () => {
      const outcome = useThen('it succeeds', () => runSkill([textPdf]));

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('the text of every page is present', () => {
        expect(outcome.stdout).toContain('SANDPINE INC');
        expect(outcome.stdout).toContain('charter page one');
        expect(outcome.stdout).toContain('schedule L');
        expect(outcome.stdout).toContain('end of year 0');
      });

      then('each page carries a provenance marker', () => {
        // the provenance of any line in the output must be checkable.
        const markers = outcome.stdout.match(/<!-- via: \w+ -->/g) ?? [];
        expect(markers).toEqual([
          '<!-- via: textual -->',
          '<!-- via: textual -->',
        ]);
      });

      then(
        'page headers are the DISPATCHER numbering, exactly once each',
        () => {
          // the textual leaf restarts its own numbering at 1 for every
          // single-page call, so without the strip both pages would be
          // labelled "## page 1". this asserts the strip held.
          const headers = outcome.stdout.match(/^## page \d+$/gm) ?? [];
          expect(headers).toEqual(['## page 1', '## page 2']);
        },
      );
    });

    when('[t1] it is transcribed to a file via --into', () => {
      const into = path.join(tempDir, 'text.md');
      const outcome = useThen('it succeeds', () =>
        runSkill([textPdf, '--into', into]),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('the markdown is written to exactly the named path', () => {
        expect(fs.existsSync(into)).toBe(true);
        const md = fs.readFileSync(into, UTF8);
        expect(md).toContain('SANDPINE INC');
        expect(md).toContain('## page 2');
      });

      then('stdout carries the readout, not the markdown', () => {
        expect(outcome.stdout).toContain('into');
        expect(outcome.stdout).not.toContain('SANDPINE INC');
      });

      /**
       * .why = ⛔ the assertion above reads the WORD, never the PATH. on
       *        this branch stdout carries no markdown at all, so the
       *        readout is the ONLY thing telling a human where their
       *        output went — and `toContain('into')` is satisfied by a
       *        readout whose `into:` names the SOURCE, which would send
       *        them to look in the wrong place, silently, at exit 0.
       *
       *        the same tree emits `source:` and `via:`, and no assertion
       *        in this file had ever read either one.
       */
      then(
        'the readout names the DESTINATION, the source, and the route',
        () => {
          expect(outcome.stdout).toContain(`└─ into: ${into}`);
          expect(outcome.stdout).toContain(`├─ source: ${textPdf}`);
          expect(outcome.stdout).toContain('├─ via: auto');
        },
      );

      then('the readout states the textual/optical split', () => {
        expect(outcome.stdout).toContain('2 textual, 0 optical');
      });
    });

    when('[t2] --via textual is forced on it', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill([textPdf, '--via', 'textual']),
      );

      then('exit code is 0 — every page can honor the request', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('the text is present', () => {
        expect(outcome.stdout).toContain('SANDPINE INC');
      });
    });
  });

  given('[case3] malformed arguments', () => {
    when('[t0] --via is not a known route', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([textPdf, '--via', 'psychic']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the allowed routes and the bad value', () => {
        expect(outcome.stdout).toContain(
          '--via must be auto, textual or optical',
        );
        expect(outcome.stdout).toContain('psychic');
      });
    });

    when('[t1] --mode is not a known mode', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([textPdf, '--mode', 'maybe']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the allowed modes and the bad value', () => {
        expect(outcome.stdout).toContain('--mode must be plan or apply');
        expect(outcome.stdout).toContain('maybe');
      });
    });

    when('[t2] no pdf path is given at all', () => {
      const outcome = useThen('it is refused', () => runSkill([]));

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason says no path was given', () => {
        expect(outcome.stdout).toContain('no PDF path given');
      });
    });

    when('[t3] the pdf path does not exist', () => {
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

    when('[t4] the file is not a pdf', () => {
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

    when('[t5] an unknown option is passed', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([textPdf, '--ocr']),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('the reason names the option', () => {
        expect(outcome.stdout).toContain('unknown option: --ocr');
      });
    });

    when('[t6] a second positional argument is passed', () => {
      const outcome = useThen('it is refused', () =>
        runSkill([textPdf, mixedPdf]),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      /**
       * ⚠️ the needle names the SECOND path, not the bare phrase. a bare
       *    `toContain('unexpected argument')` cannot say WHICH argument
       *    was refused, so it is satisfied by a guard that names the
       *    first one — and the whole point of this arm is that the
       *    document the caller did not expect is the one that gets read.
       */
      then('the reason names the unexpected argument', () => {
        expect(outcome.stdout).toContain(`unexpected argument: ${mixedPdf}`);
      });

      /**
       * ⭐ THE DISCRIMINATOR, and this arm is the one with real weight.
       *    drop the `else` (:109) and the second path is SILENTLY
       *    DISCARDED — PDF_PATH keeps the first, and the run proceeds to
       *    transcribe it at exit 0. both fixtures here are REAL pdfs, so
       *    that defect does not surface as an error at all: it surfaces
       *    as a complete, correct-looking transcript OF THE WRONG
       *    DOCUMENT, with no channel that says the second path was seen.
       */
      then('⭐ and it does NOT silently transcribe the first path', () => {
        expect(outcome.stdout).not.toContain('## page 1');
        expect(outcome.stdout).not.toContain('via: textual');
      });
    });

    /**
     * ⭐ THE PASSTHROUGH ARM HAD NO CASE, AND IT IS THE ONE EVERY REAL
     *    INVOCATION USES. rhachet appends `--skill`, `--repo`, `--role`
     *    to every skill it runs, so `:97` is on the hot path of literally
     *    every `rhx pdf.transcribe` — and no test in any of the three
     *    files in this family ever passed those flags.
     */
    when('[t7] rhachet passes --skill / --repo / --role', () => {
      const outcome = useThen('it is refused on the PATH, not the flags', () =>
        runSkill([
          '--skill',
          'pdf.transcribe',
          '--repo',
          'rhight',
          '--role',
          'transcriber',
          path.join(tempDir, 'absent.pdf'),
        ]),
      );

      then('the flags are consumed and the PDF path still lands', () => {
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain(
          `file not found: ${path.join(tempDir, 'absent.pdf')}`,
        );
      });

      /**
       * ⭐ TWO EXCLUSIONS, AND THEY RULE OUT TWO DIFFERENT DEFECTS.
       *
       *    1. drop the arm (:97) and each flag falls to `-*`, so the run
       *       refuses with `unknown option: --skill` and never reaches
       *       the path. that defect breaks EVERY rhachet invocation.
       *
       *    2. keep the arm but `shift` instead of `shift 2`, and the
       *       VALUE survives: `pdf.transcribe` becomes the PDF path, and
       *       the real path that follows becomes an `unexpected
       *       argument`.
       *
       * ⚠️ both defects exit 2 and both print `blocked`, so the exit code
       *    discriminates neither — and the positive assertion above
       *    discriminates only the first, since a run refused on `unknown
       *    option` never prints the path either.
       */
      then('⭐ and neither the flags nor their values become the path', () => {
        expect(outcome.stdout).not.toContain('unknown option');
        expect(outcome.stdout).not.toContain('unexpected argument');
      });
    });
  });

  /**
   * .why = ⛔ `get_page_count`'s refusal arm had ZERO coverage, and it is
   *        the only path in the skill that exits **1** rather than 2 —
   *        the malfunction/constraint split the header states as a
   *        guarantee. every other refusal case in this file asserts 2, so
   *        a collapse of 1 into 2 was invisible.
   *
   * ⚠️ this is not a contrived input. `validate_input` checks only the
   *    FILE EXTENSION, so any file named `*.pdf` reaches pdfinfo — and a
   *    sibling skill in this repo was observed caching HTTP ERROR PAGES
   *    under a `.pdf` name (#46). a truncated download, a 429 body, a
   *    git-lfs pointer: all arrive here, and all must refuse rather than
   *    transcribe a document that is not there.
   */
  given('[case6] a file named .pdf that is not a PDF', () => {
    when('[t0] it is transcribed', () => {
      const outcome = useThen('it is refused', () => {
        const fake = path.join(tempDir, 'error-page.pdf');
        fs.writeFileSync(
          fake,
          '<html><body>429 Too Many Requests</body></html>',
        );
        return runSkill([fake]);
      });

      then('exit code is 1 — a MALFUNCTION, not a constraint', () => {
        // ⭐ the discriminator. the extension check passed, so this is not
        //    a caller mistake to be corrected — the file itself is broken.
        expect(outcome.exitCode).toBe(1);
      });

      then('it says the page count could not be read', () => {
        expect(outcome.stdout).toContain('could not read page count');
      });

      then('it transcribes no page at all', () => {
        // a skill that fell through to emit_markdown would print a header
        // for a document with no readable pages, which reads as an empty
        // document rather than an unreadable one.
        expect(outcome.stdout).not.toContain('## page 1');
        expect(outcome.stdout).not.toContain('<!-- via:');
      });
    });
  });

  given('[case4] --help', () => {
    when('[t0] help is requested', () => {
      const outcome = useThen('it succeeds', () => runSkill(['--help']));

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('it documents every flag', () => {
        for (const flag of ['--into', '--via', '--mode']) {
          expect(outcome.stdout).toContain(flag);
        }
      });

      then('it stops at the header fence, not the whole file', () => {
        // mawk lacks interval expressions, so `/^#{5,}/` would match no
        // line and dump the executable. this asserts the fence held.
        expect(outcome.stdout).not.toContain('set -euo pipefail');
        expect(outcome.stdout).not.toContain('main "$@"');
      });

      then('it names the leaves it dispatches to', () => {
        expect(outcome.stdout).toContain('textual');
        expect(outcome.stdout).toContain('optical');
      });
    });

    /**
     * ⭐ THE ALIAS IS A SEPARATE ARM, AND IT HAD NO CASE.
     *
     *    `-h` is an alias on the SAME `case` arm as `--help` (:81). every
     *    assertion in [t0] above runs against `--help`, so the alias was
     *    reachable by no test in this file — drop it and `-h` falls
     *    through to `-*` (:101), which refuses it as an unknown option at
     *    exit 2, and the whole suite stays green.
     *
     * ⚠️ note what the alias costs when it breaks. `-h` is the reflex a
     *    human reaches for FIRST, so a dead alias turns the skill's own
     *    documentation into a refusal — on the one surface whose entire
     *    job is to explain the skill to someone who does not know it.
     */
    when('[t1] the short `-h` alias is used', () => {
      const outcome = useThen('it succeeds', () => runSkill(['-h']));

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('it renders the same header block', () => {
        expect(outcome.stdout).toContain('usage:');
        expect(outcome.stdout).toContain('--via');
      });

      /**
       * ⭐ THE DISCRIMINATOR. the two assertions above cannot carry this
       *    alone: [t0] already proves `--help` renders that block, so a
       *    reviewer who reads them sees coverage the alias does not have.
       *    only the EXCLUSION separates a live alias from a dead one —
       *    and a dead one exits 2 with a refusal, not silence.
       */
      then('⭐ and it is NOT refused as an unknown option', () => {
        expect(outcome.stdout).not.toContain('unknown option');
      });
    });
  });

  /**
   * .why = ⭐ the OPTICAL branch of `transcribe_page` had NO coverage, in
   *        this file or any other. the header note above claims a scope
   *        split — "the OCR call itself is covered by
   *        pdf.transcribe.via.optical.integration.test.ts" — and that is
   *        true of the LEAF and false of the BOUNDARY. the leaf's own
   *        suite runs `pdf.transcribe.via.optical.sh` directly, so no
   *        case anywhere exercises the dispatcher's read of what the leaf
   *        hands back.
   *
   *        that read is one awk needle in `pdf.transcribe.sh`, in the
   *        optical arm of `transcribe_page`:
   *
   *            awk '/^## Page /{ seen = 1; next } seen { print }'
   *
   *        the two leaves emit DIFFERENT header casings — textual writes
   *        `## page N`, optical writes `## Page N` — so a reader who
   *        aligns them "for consistency" turns that needle into a filter
   *        that matches no line. the dispatcher then emits an EMPTY body
   *        for every OCR'd page, at exit 0. that is the precise failure
   *        this skill was built to prevent, reintroduced in the skill
   *        itself.
   *
   *        ✅ PROVEN to bite. `/^## Page /` lowered to `/^## page /`
   *        left the suite at **58 passed, 0 failed**.
   *
   * .how = a hermetic COPY of the skill, with the optical leaf swapped
   *        for a stub that honors the leaf's stdout contract. a copy
   *        rather than a PATH shim, because the dispatcher resolves both
   *        leaves by ABSOLUTE path off its own BASH_SOURCE — there is no
   *        env seam to reach through. no credentials, no network, no
   *        spend.
   */
  given('[case5] the OPTICAL branch, with the leaf stubbed', () => {
    const BANNER = 'STUB-BANNER-THE-DISPATCHER-MUST-STRIP';

    const genSkillCopy = (): string => {
      const at = path.join(tempDir, 'skill');
      fs.mkdirSync(at, { recursive: true });
      for (const name of [
        'pdf.transcribe.sh',
        'output.sh',
        'pdf.transcribe.via.textual.sh',
      ]) {
        fs.copyFileSync(path.join(__dirname, name), path.join(at, name));
      }
      // the stub mimics the real leaf: a treestruct banner on stdout ahead
      // of the text, then `## Page N`, then the page body.
      fs.writeFileSync(
        path.join(at, 'pdf.transcribe.via.optical.sh'),
        [
          '#!/usr/bin/env bash',
          'set -euo pipefail',
          'page=1',
          'while [[ $# -gt 0 ]]; do',
          '  case $1 in',
          '    --page) page="$2"; shift 2 ;;',
          '    *) shift ;;',
          '  esac',
          'done',
          `echo "${BANNER}"`,
          'echo "   └─ source: stub"',
          'echo ""',
          'echo "## Page $page"',
          'echo ""',
          'echo "SCANNED BODY OF PAGE $page"',
          '',
        ].join('\n'),
      );
      return path.join(at, 'pdf.transcribe.sh');
    };

    // the text between one dispatcher header and the next. refuses on a
    // missed start marker rather than fall through to the whole document,
    // which would search everything under a name that promises one page.
    const slicePage = (input: {
      of: string;
      from: string;
      until: string;
    }): string => {
      const at = input.of.indexOf(input.from);
      if (at === -1) return '';
      const rest = input.of.slice(at + input.from.length);
      const end = rest.indexOf(input.until);
      return end === -1 ? rest : rest.slice(0, end);
    };

    when('[t0] the MIXED pdf is transcribed in apply mode', () => {
      const outcome = useThen('it succeeds', () => {
        const copy = genSkillCopy();
        const res = spawnSync('bash', [copy, mixedPdf], {
          encoding: UTF8,
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        return {
          stdout: res.stdout ?? '',
          stderr: res.stderr ?? '',
          exitCode: res.status ?? 1,
        };
      });

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      // positive control: the copied dispatcher is a WORKING dispatcher.
      // without this, a body absent below could mean a broken copy rather
      // than a broken strip — and every assertion under it would be a
      // claim about the fixture instead of about the skill.
      then('the TEXTUAL pages still transcribe through the copy', () => {
        expect(outcome.stdout).toContain('STATE OF DELAWARE');
        expect(outcome.stdout).toContain('back page');
      });

      /**
       * .why = ⭐ the assertion the whole case exists for. under the
       *        lowered needle this is the empty string, and no other
       *        assertion in any of the three test files can see it.
       */
      then('the OCR page BODY reaches the transcript', () => {
        expect(outcome.stdout).toContain('SCANNED BODY OF PAGE 2');
      });

      /**
       * .why = ⭐ rules out the PLAUSIBLE WRONG FIX. the symmetric repair
       *        — `sed '/^## Page /d'`, to match the textual branch one
       *        line up — deletes the header and lets the leaf's whole
       *        treestruct banner through into the transcript. the body
       *        check above stays GREEN under it, so only an exclusion
       *        tells the two apart.
       */
      then("the leaf's banner does NOT reach the transcript", () => {
        expect(outcome.stdout).not.toContain(BANNER);
        expect(outcome.stdout).not.toContain('└─ source: stub');
      });

      /**
       * .why = ⭐ a MIXED marker set, which `[case2]` cannot produce. its
       *        `toEqual(['<!-- via: textual -->', '<!-- via: textual -->'])`
       *        is satisfied by a marker that reads `textual` for every
       *        page regardless of the route taken — so the provenance
       *        guarantee ("the provenance of any line in the output is
       *        checkable") had no case that could falsify it.
       */
      then(
        'each page carries the marker for the route it ACTUALLY took',
        () => {
          const markers = outcome.stdout.match(/<!-- via: \w+ -->/g) ?? [];
          expect(markers).toEqual([
            '<!-- via: textual -->',
            '<!-- via: optical -->',
            '<!-- via: textual -->',
          ]);
        },
      );

      /**
       * .why = the three assertions above are whole-document presence
       *        checks, and the `then`-strings claim a PAGE. those are two
       *        different facts. a defect that stitched page 2's body under
       *        the `## page 1` header would satisfy every one of them.
       */
      then('the OCR body sits under page 2, and the text pages do not', () => {
        const page2 = slicePage({
          of: outcome.stdout,
          from: '## page 2',
          until: '## page 3',
        });
        // positive control: an empty slice satisfies every exclusion below
        expect(page2).not.toEqual('');

        expect(page2).toContain('SCANNED BODY OF PAGE 2');
        expect(page2).toContain('<!-- via: optical -->');
        expect(page2).not.toContain('STATE OF DELAWARE');
        expect(page2).not.toContain('back page');
      });
    });
  });

  /**
   * .what = the readout rows an OUTPUT walk finds with no live reader
   *
   * .why  = ⭐ this file already carries the argument, at `[case1][t0]`:
   *         "`source:`, `via:` and `pages:` were read by the SNAPSHOT and
   *         by no other assertion — and a snapshot is not a guard in this
   *         repo right now." that cure moved three rows and stopped. the
   *         SAME tree emits two more rows on the SAME snapshot, and they
   *         were left where the three had been:
   *
   *           🦅 <phrase>                      ⛔ snapshot only
   *           🔎 pdf.transcribe [--mode plan]  ⛔ snapshot only
   *
   *         ⛔ and the second one is the row that separates the two MODES.
   *            plan exits 0 with no page transcribed; apply writes a
   *            document. a plan branch that rendered the apply banner
   *            reads as work completed, and every extant assertion in
   *            `[case1][t0]` stays green over it — the routes, the counts,
   *            and `source`/`via`/`pages` are all printed either way.
   *
   * 🚩 the second hole is an AMBIGUOUS NEEDLE of the kind
   *    `rule.require.assertions-that-discriminate` names leak 3. `[t1]`
   *    above claims "it names the page that has no text layer" and asserts
   *    `toContain('2')` — a bare digit, matched against the WHOLE readout.
   *    a guard that named every page (`1 2 3`) satisfies it, so the
   *    assertion cannot tell "page 2 lacks text" from "no page was
   *    examined and all were listed". that list is what a human acts on:
   *    it decides which pages they pay to OCR.
   */
  given('[case7] the readout names its MODE and its pages, by value', () => {
    when('[t0] a plan is printed', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill([mixedPdf, '--mode', 'plan']),
      );

      then(
        '⭐ the banner says PLAN, and does not say the work was done',
        () => {
          expect(outcome.stdout).toContain("🦅 heres how I'd read it,");
          expect(outcome.stdout).toContain('🔎 pdf.transcribe --mode plan');
          // ⭐ the discriminator. `toContain('🔎 pdf.transcribe')` alone is
          //    satisfied by the apply banner, since the plan banner is that
          //    string plus a suffix. only the exclusion separates them.
          expect(outcome.stdout).not.toContain('🦅 read it,');
        },
      );

      then('the route table is introduced by its own row', () => {
        // `print_tree_leaf "routes" ""` closes the tree the per-page rows
        // hang under. drop it and the pages dangle off `optical:`.
        expect(outcome.stdout).toContain('└─ routes:');
      });
    });

    when('[t1] a document is transcribed to a file', () => {
      const into = path.join(tempDir, 'mode-apply.md');
      const outcome = useThen('it succeeds', () =>
        runSkill([textPdf, '--into', into]),
      );

      then('⭐ the banner says APPLY, and never claims to be a plan', () => {
        expect(outcome.stdout).toContain('🦅 read it,');
        expect(outcome.stdout).toContain('🔎 pdf.transcribe');
        expect(outcome.stdout).not.toContain('--mode plan');
        expect(outcome.stdout).not.toContain("heres how I'd read it,");
      });

      then('the page row carries the COUNT as well as the split', () => {
        // `[case2][t1]` reads only the tail — `2 textual, 0 optical` — so
        // the count ahead of it had no reader. the whole row is one claim.
        expect(outcome.stdout).toContain('├─ pages: 2 (2 textual, 0 optical)');
      });
    });

    when(
      '[t2] --via textual is forced on a document with an image page',
      () => {
        const outcome = useThen('it is refused', () =>
          runSkill([mixedPdf, '--via', 'textual']),
        );

        then('⭐ it names EXACTLY the page that lacks a text layer', () => {
          const row = /no text layer: (.+)$/m.exec(outcome.stdout);
          // the needle must match at all — a null here means the row is
          // absent, which the equality below could not distinguish.
          expect(row).not.toBeNull();
          // ⭐ equality, not containment. a guard that listed every page
          //    passes `toContain('2')` and fails here.
          expect(row?.[1]?.trim()).toEqual('2');
        });
      },
    );
  });

  /**
   * .what = `check_tools` (:133-137), an arm no case in this file reached
   *
   * .why  = ⭐ THE LOOP CHECKS TWO TOOLS AND EVERY CASE HAD BOTH, so the
   *         guard executed on every one of them and no assertion read its
   *         output. an arm walk answers "which case reaches this?" with
   *         "all of them" and moves on satisfied.
   *
   *         this is the arm a human meets on a machine that is not this
   *         one: a fresh container, a CI image without poppler, a mac
   *         with only half the suite installed. it is the FIRST output
   *         they see from this skill, and the only place the cure —
   *         `install poppler-utils` — is ever named.
   *
   * ⛔ THE TWO TOOLS FAIL DIFFERENTLY, AND ONLY ONE OF THEM FAILS LOUDLY.
   *    measured 2026-09-03, with the loop narrowed one tool at a time.
   *
   *    ── pdfinfo unguarded (`for tool in pdftotext`) ────────────────
   *
   *      🔎 pdf.transcribe
   *         └─ blocked: could not read page count — is this a valid PDF?
   *
   *    a refusal, but at exit 1 and pointed at the wrong thing. the file
   *    is fine — this suite built it, and every other case here reads it
   *    without complaint. what is absent is a TOOL, and no channel says
   *    so: `get_page_count` sends stderr to /dev/null, so the shell's own
   *    "command not found" is discarded before anyone could see it.
   *
   *    ⭐ the exit code moves in the direction that compounds the harm:
   *       2 -> 1. this skill documents 2 as a CONSTRAINT and 1 as a
   *       MALFUNCTION, so the unguarded path also tells the caller "the
   *       server is broken" where the truth is "install a package."
   *
   *    ── pdftotext unguarded (`for tool in pdfinfo`) ────────────────
   *
   *      ## page 1
   *      <!-- via: optical -->
   *
   *      ## page 2
   *      <!-- via: optical -->
   *
   *    ⛔ AT EXIT 0. no refusal at all. TWO EMPTY PAGES, EACH LABELLED
   *       AS THOUGH IT HAD BEEN OCR'd, over a document that is pure text
   *       and would have transcribed perfectly.
   *
   *    the mechanism is `page_has_text` (:201), whose probe ends in
   *    `|| true`. that swallows the shell's 127, so an absent pdftotext
   *    is indistinguishable from a page with no text layer — and EVERY
   *    page is therefore classified image-only and routed to OCR.
   *
   *    ⭐ read that against this skill's own header, which states the
   *       whole reason it exists: "an empty page is either a genuinely
   *       blank page or an OCR'd one — NEVER AN UNEXAMINED ONE." with
   *       pdftotext absent, every page is unexamined, every page comes
   *       back empty at exit 0, and the `via: optical` marker actively
   *       LIES about the provenance of each one.
   *
   *       so `check_tools` is not a convenience that improves an error
   *       message here. it is the only thing between a poppler-less
   *       machine and a blank transcript that claims to have been read.
   *
   * ⭐ SO THE EXCLUSIONS CARRY THE WEIGHT — AND THEY ARE NOT THE SAME
   *    EXCLUSION, because the two defects do not look alike.
   *
   *    1. [t0] excludes the TRANSCRIPT. its defect emits no refusal at
   *       all, so an exclusion on refusal text would be satisfied
   *       trivially — measured: `not.toContain('is this a valid PDF')`
   *       was GREEN under the very defect this case exists to catch.
   *
   *    2. [t1] excludes the MISDIAGNOSIS. a bare presence check on the
   *       tool's name cannot serve, because the downstream message names
   *       a binary too.
   *
   *    3. [t1] additionally rules out a guard that checks only the FIRST
   *       tool in the loop, and a harness that made BOTH tools absent —
   *       either of which would refuse on pdftotext instead. so the two
   *       cases are each other's control.
   *
   * ⚠️ this is [case8], not [case6] — `[case6]` is taken above, by the
   *    not-a-PDF case. this file numbers its cases 1,2,3,6,4,5,7, and an
   *    OUT-OF-ORDER sequence is what invites a reuse: an appender who
   *    reads the tail sees 7 and picks the next, or reads the head and
   *    picks a number already spent mid-file. a label collision fails no
   *    test; it just makes two blocks indistinguishable in a report.
   */
  given('[case8] a tool poppler provides is not installed', () => {
    when('[t0] pdftotext is absent', () => {
      const outcome = useThen('it is refused', () =>
        runSkillWithOnly({ tools: ['pdfinfo'], args: [textPdf] }),
      );

      then('exit code is 2 — a constraint, not a malfunction', () => {
        // 1 would say "the server is broken"; the caller must install a
        // package, which is a constraint on them.
        expect(outcome.exitCode).toBe(2);
      });

      then('⭐ it names the tool that is absent', () => {
        expect(outcome.stdout).toContain('pdftotext not found');
      });

      /**
       * ⚠️ THE CURE, NOT ONLY THE SYMPTOM.
       *
       * "pdftotext not found" sends a reader to hunt for a package named
       * pdftotext, which does not exist. the package is poppler-utils,
       * and this line is the only place the skill says so.
       */
      then('⭐ it names the PACKAGE to install, not just the binary', () => {
        expect(outcome.stdout).toContain('install poppler-utils');
      });

      /**
       * ⛔ THE DISCRIMINATOR, AND IT IS NOT THE ONE [t1] USES.
       *
       * without the guard this arm emits no refusal — it emits a clean
       * TRANSCRIPT at exit 0 whose every page is marked `via: optical`
       * and whose every body is empty. so an exclusion on refusal prose
       * cannot see it: `not.toContain('is this a valid PDF')` was
       * measured GREEN under this exact defect.
       *
       * ⭐ the assertion has to name the thing the defect PRODUCES. a
       *    routing marker is emitted once per page by `emit_markdown`
       *    (:274), so its presence proves the run reached transcription
       *    — which a refusal must never do.
       */
      then(
        '⭐ and it emits NO transcript — it refused before it routed',
        () => {
          expect(outcome.stdout).not.toContain('via: optical');
          expect(outcome.stdout).not.toContain('## page 1');
        },
      );
    });

    when('[t1] pdfinfo is absent', () => {
      const outcome = useThen('it is refused', () =>
        runSkillWithOnly({ tools: ['pdftotext'], args: [textPdf] }),
      );

      then('exit code is 2', () => {
        expect(outcome.exitCode).toBe(2);
      });

      then('⭐ it names pdfinfo — the SECOND tool in the loop', () => {
        expect(outcome.stdout).toContain('pdfinfo not found');
      });

      then('⭐ and it does NOT name pdftotext, which is present', () => {
        // the discriminator, per the header. a run that refused on
        // pdftotext instead would satisfy an assertion on the exit code
        // and on "install poppler-utils" alike.
        expect(outcome.stdout).not.toContain('pdftotext not found');
      });

      then('⭐ and it does NOT blame the document instead', () => {
        expect(outcome.stdout).not.toContain('is this a valid PDF');
      });
    });
  });
});
