import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the pdf.transcribe.via.textual skill
 * .why  = verify deterministic pdf->md extraction, page markers, and
 *         failfast on image-based (no-text) PDFs. hermetic: fixtures
 *         are generated at runtime via ps2pdf (no committed binaries).
 */

const scriptPath = path.join(__dirname, 'pdf.transcribe.via.textual.sh');

const UTF8 = 'utf-8' as const;

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
 * because a shim IS an installed tool. `check_tool` asks the other
 * question: what if the tool is not installed at all.
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
 *    `:35` resolves SCRIPT_DIR through `$(dirname "${BASH_SOURCE[0]}")`,
 *    and dirname is a coreutils BINARY, not a bash builtin. drop it and
 *    the command substitution fails, `set -e` ends the run before
 *    `check_tool` is ever reached, and the caller gets exit 1 with an
 *    EMPTY stdout — a refusal for the wrong reason, in the shape of the
 *    one under test.
 *
 *    measured 2026-09-02 on the sibling pdf.render suite: without it,
 *    every assertion went red at `Received: 1` and `Received string: ""`.
 *
 * ⭐ once dirname is present, this is safe, because `check_tool` runs
 *    before any other external tool: `output.sh` is pure function
 *    declarations, `parse_args` and `validate_pdf` are pure bash, and
 *    `command -v` is a builtin. so the refusal lands before the narrowed
 *    PATH could misattribute a later failure to it.
 */
const realBash = whichOne('bash');

const runSkillWithOnly = (input: {
  tools: string[];
  args: string[];
  under: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const binDir = fs.mkdtempSync(path.join(input.under, 'onlybin-'));
  for (const tool of [...input.tools, 'dirname'])
    fs.symlinkSync(whichOne(tool), path.join(binDir, tool));

  const result = spawnSync(realBash, [scriptPath, ...input.args], {
    cwd: input.under,
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

// build a deterministic text-based PDF from PostScript via ps2pdf
const genTextPdf = (input: {
  into: string;
  lines: { page1: string[]; page2: string[] };
}): void => {
  const ps = [
    '%!PS',
    '/Helvetica findfont 12 scalefont setfont',
    ...input.lines.page1.flatMap((line, i) => [
      `72 ${720 - i * 16} moveto`,
      `(${line}) show`,
    ]),
    'showpage',
    '/Helvetica findfont 12 scalefont setfont',
    ...input.lines.page2.flatMap((line, i) => [
      `72 ${720 - i * 16} moveto`,
      `(${line}) show`,
    ]),
    'showpage',
  ].join('\n');

  const psPath = `${input.into}.ps`;
  fs.writeFileSync(psPath, ps);
  const res = spawnSync('ps2pdf', [psPath, input.into], { encoding: UTF8 });
  if (res.status !== 0) {
    throw new Error(`ps2pdf failed to build fixture: ${res.stderr}`);
  }
};

// build an image-based (no embedded text) PDF: a PostScript page that only
// draws a filled rectangle — pdftotext yields no text for it
const genImagePdf = (input: { into: string }): void => {
  const ps = ['%!PS', '100 100 200 200 rectfill', 'showpage'].join('\n');
  const psPath = `${input.into}.ps`;
  fs.writeFileSync(psPath, ps);
  const res = spawnSync('ps2pdf', [psPath, input.into], { encoding: UTF8 });
  if (res.status !== 0) {
    throw new Error(`ps2pdf failed to build image fixture: ${res.stderr}`);
  }
};

describe('pdf.transcribe.via.textual.sh', () => {
  const tmp = useBeforeAll(async () => {
    // failfast: the skill and its generator depend on poppler + ghostscript
    if (spawnSync('which', ['pdftotext']).status !== 0) {
      throw new Error('pdftotext required (install poppler-utils)');
    }
    if (spawnSync('which', ['ps2pdf']).status !== 0) {
      throw new Error(
        'ps2pdf required (install ghostscript) to build fixtures',
      );
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-pdf-text-'));
    return { dir };
  });

  given('[case1] a text-based PDF with two pages', () => {
    const scene = useBeforeAll(async () => {
      const pdfPath = path.join(tmp.dir, 'text.pdf');
      genTextPdf({
        into: pdfPath,
        lines: {
          page1: ['SANDPINE INC', 'charter page one'],
          page2: ['schedule L', 'end of year 0'],
        },
      });
      return { pdfPath };
    });

    when('[t0] extracted to stdout', () => {
      const result = useBeforeAll(async () => runSkill([scene.pdfPath]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it contains the page-1 text', () => {
        expect(result.stdout).toContain('SANDPINE INC');
        expect(result.stdout).toContain('charter page one');
      });

      then('it contains the page-2 text', () => {
        expect(result.stdout).toContain('schedule L');
        expect(result.stdout).toContain('end of year 0');
      });

      then('it marks page boundaries as markdown headers', () => {
        expect(result.stdout).toContain('## page 1');
        expect(result.stdout).toContain('## page 2');
      });

      then('each page of text sits under ITS OWN header', () => {
        // ⭐ the four assertions above are a SET, and this `then`-string
        //    claims a RELATION — which line sits under which header. a
        //    marker emitted one line late files page 2's first line under
        //    "## page 1", and every presence check above stays green over
        //    it. for a transcriber, a mislabeled page IS the defect: a
        //    reader cites page 1 for text that was never on page 1.
        const [, afterOne = ''] = result.stdout.split('## page 1');
        const [underOne = '', underTwo = ''] = afterOne.split('## page 2');

        // positive control: both headers exist, so the slices are real
        expect(underOne).not.toEqual('');
        expect(underTwo).not.toEqual('');

        expect(underOne).toContain('SANDPINE INC');
        expect(underOne).toContain('charter page one');
        expect(underOne).not.toContain('schedule L');

        expect(underTwo).toContain('schedule L');
        expect(underTwo).toContain('end of year 0');
        expect(underTwo).not.toContain('SANDPINE INC');
      });

      then('it invents no page the document does not have', () => {
        // ⚠️ pdftotext terminates EVERY page with a form feed, the last one
        //    included, so a naive split yields one more page than exists.
        //    the header for it carries an empty body — and an empty page
        //    reads as "this page is blank" rather than "this page is not
        //    there", which is the one confusion this whole skill family was
        //    built to prevent.
        expect(result.stdout).not.toContain('## page 3');
      });
    });

    when('[t1] extracted to a file via --into', () => {
      const written = useBeforeAll(async () => {
        const out = path.join(tmp.dir, 'text.md');
        const result = runSkill([scene.pdfPath, '--into', out]);
        if (result.exitCode !== 0) {
          throw new Error(`skill failed: ${result.stdout} ${result.stderr}`);
        }
        return { md: fs.readFileSync(out, UTF8), out, stdout: result.stdout };
      });

      then('the file is written with the extracted markdown', () => {
        expect(written.md).toContain('SANDPINE INC');
        expect(written.md).toContain('## page 1');
      });

      then('the file carries EVERY page, not only the first', () => {
        // an --into path that wrote a truncated document would satisfy the
        // assertion above, which reads page 1 only.
        expect(written.md).toContain('## page 2');
        expect(written.md).toContain('end of year 0');
      });

      then('stdout confirms where the markdown actually went', () => {
        // ⭐ the confirmation block is FOUR output calls the skill makes on
        //    every --into run, and no assertion in this file read any of
        //    them. it is all a human sees on this path — stdout carries no
        //    markdown here — so an `into:` that named the SOURCE would send
        //    a reader to look for their output in the wrong place,
        //    silently, at exit 0.
        expect(written.stdout).toContain('🔎 pdf.transcribe.via.textual');
        expect(written.stdout).toContain(`├─ source: ${scene.pdfPath}`);
        expect(written.stdout).toContain(`└─ into: ${written.out}`);
      });
    });
  });

  given('[case2] an image-based PDF with no embedded text', () => {
    const scene = useBeforeAll(async () => {
      const pdfPath = path.join(tmp.dir, 'image.pdf');
      genImagePdf({ into: pdfPath });
      return { pdfPath };
    });

    when('[t0] extraction is attempted', () => {
      const result = useBeforeAll(async () => runSkill([scene.pdfPath]));

      then('it fails fast with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it points the user to OCR', () => {
        expect(`${result.stdout}${result.stderr}`).toContain(
          'pdf.transcribe.via.optical',
        );
      });

      then('the blocked stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] an absent file', () => {
    when('[t0] extraction is attempted', () => {
      const result = useBeforeAll(async () =>
        runSkill([path.join(tmp.dir, 'nope.pdf')]),
      );

      then('it blocks with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('file not found');
      });

      then('the blocked stdout matches snapshot', () => {
        // the tmp path varies per run; strip it for a stable snapshot
        const stable = result.stdout.split(tmp.dir).join('<tmp>');
        expect(stable).toMatchSnapshot();
      });
    });
  });

  given('[case4] an extant non-pdf file', () => {
    when('[t0] extraction is attempted', () => {
      const result = useBeforeAll(async () => {
        const txt = path.join(tmp.dir, 'notes.txt');
        fs.writeFileSync(txt, 'hello');
        return runSkill([txt]);
      });

      then('it blocks with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('not a PDF');
      });

      then('the blocked stdout matches snapshot', () => {
        const stable = result.stdout.split(tmp.dir).join('<tmp>');
        expect(stable).toMatchSnapshot();
      });
    });
  });

  given('[case5] a single page requested via --page', () => {
    /**
     * ⛔ `--page N` had ZERO coverage. it is parsed, it is handed to
     *    pdftotext as `-f N -l N`, and the usage block advertises it —
     *    and no case in this file ever exercised it. it drives two
     *    separate behaviors, and each is a silent corruption:
     *      1. WHICH page the extract reads
     *      2. WHAT NUMBER that page is labeled with
     *
     * ⚠️ the sibling leaf guards behavior 2 explicitly, and names the harm
     *    in a comment of its own. this leaf does not.
     */
    const scene = useBeforeAll(async () => {
      const pdfPath = path.join(tmp.dir, 'paged.pdf');
      genTextPdf({
        into: pdfPath,
        lines: {
          page1: ['ALPHA MARKS PAGE ONE'],
          page2: ['OMEGA MARKS PAGE TWO'],
        },
      });
      return { pdfPath };
    });

    when('[t0] page 2 of a two-page document is requested', () => {
      const result = useBeforeAll(async () =>
        runSkill([scene.pdfPath, '--page', '2']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it reads page 2, and ONLY page 2', () => {
        // ⭐ the discriminator. without the exclusion, a `-f/-l` scope that
        //    was dropped entirely returns the WHOLE document, and a bare
        //    presence check on page 2's marker is satisfied by that.
        expect(result.stdout).toContain('OMEGA MARKS PAGE TWO');
        expect(result.stdout).not.toContain('ALPHA MARKS PAGE ONE');
      });

      then('it labels the page with the number that was ASKED FOR', () => {
        // ⭐ the second behavior, and the one that reads as correct while
        //    being wrong. the skill's stated guarantee is that headers
        //    "preserve page breaks as markdown '## page N' headers", and
        //    the usage block advertises `--page 3` as a supported call. a
        //    header that says 1 over page 3's text is a corrupted record:
        //    a reader cites page 1 for text that was never on page 1, and
        //    the extract carries no signal that anything is amiss.
        expect(result.stdout).toContain('## page 2');
        expect(result.stdout).not.toContain('## page 1');
      });
    });
  });

  given('[case6] the help text', () => {
    when('[t0] --help is passed', () => {
      const result = useBeforeAll(async () => runSkill(['--help']));

      then('it succeeds and teaches the command', () => {
        // ⚠️ a `--help` renderer can emit the WRONG BYTES at exit 0 with an
        //    empty stderr, so no automated signal reports it. a sibling
        //    skill in this repo shipped exactly that — its help printed one
        //    line of the shebang and no more, silently. a surface that
        //    cannot fail loudly needs an assertion MORE, not less.
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: pdf.transcribe.via.textual.sh');
        expect(result.stdout).toContain('--into FILE');
        expect(result.stdout).toContain('pdf.transcribe.via.optical');
        expect(result.stdout).not.toContain('#!/usr/bin/env bash');
      });
    });

    /**
     * ⭐ THE ALIAS IS A SEPARATE SURFACE, AND IT HAD NO CASE.
     *
     *    `-h` shares one `case` arm with `--help` in `parse_args`, and every
     *    assertion in [t0] runs against the long form. so the alias was
     *    reached by no test here — drop it and `-h` falls through to the
     *    `-*` arm, which refuses it as an unknown option at exit 2, while
     *    this whole suite stays green.
     *
     * ⚠️ a dead alias costs more than a dead flag. `-h` is the reflex a
     *    human reaches for FIRST, so its breakage turns the skill's own
     *    documentation into a refusal — on the one surface whose entire job
     *    is to explain the skill to someone who does not yet know it.
     */
    when('[t1] the short `-h` alias is used', () => {
      const result = useBeforeAll(async () => runSkill(['-h']));

      then('it succeeds and renders the same usage block', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: pdf.transcribe.via.textual.sh');
        expect(result.stdout).toContain('--into FILE');
      });

      /**
       * ⭐ THE DISCRIMINATOR. the two assertions above cannot carry this
       *    alone: [t0] already proves `--help` renders that block, so a
       *    reviewer who reads them sees coverage the alias does not have.
       *    only the EXCLUSION separates a live alias from a dead one — and
       *    a dead one exits 2 with a refusal, never with silence.
       */
      then('⭐ and it is NOT refused as an unknown option', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });
  });

  given('[case7] inputs that must be refused rather than answered', () => {
    when('[t0] no path is given at all', () => {
      const result = useBeforeAll(async () => runSkill([]));

      then('it blocks as a constraint and says what is absent', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no PDF path provided');
      });
    });

    when('[t1] an unknown option is passed', () => {
      const result = useBeforeAll(async () =>
        runSkill([path.join(tmp.dir, 'text.pdf'), '--nope']),
      );

      then('it blocks and echoes the bad option', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown option: --nope');
      });
    });

    when('[t2] a second positional argument is passed', () => {
      const result = useBeforeAll(async () =>
        runSkill([path.join(tmp.dir, 'text.pdf'), 'extra.pdf']),
      );

      then('it blocks rather than silently ignore one of them', () => {
        // a parser that dropped the extra would transcribe the FIRST file
        // while the caller believes they asked for both.
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unexpected argument: extra.pdf');
      });
    });

    /**
     * ⭐ THE PASSTHROUGH ARM HAD NO CASE, AND IT IS ON THE HOT PATH OF EVERY
     *    REAL INVOCATION. rhachet appends `--skill`, `--repo`, and `--role`
     *    to every skill it runs, so that arm of `parse_args` executes on
     *    literally every `rhx pdf.transcribe.via.textual` — and no test in
     *    any of the three files in this family ever passed those flags.
     */
    when('[t3] rhachet passes --skill / --repo / --role', () => {
      const result = useBeforeAll(async () =>
        runSkill([
          '--skill',
          'pdf.transcribe.via.textual',
          '--repo',
          'rhight',
          '--role',
          'transcriber',
          path.join(tmp.dir, 'absent.pdf'),
        ]),
      );

      then('the flags are consumed and the PDF path still lands', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(
          `file not found: ${path.join(tmp.dir, 'absent.pdf')}`,
        );
      });

      /**
       * ⭐ TWO EXCLUSIONS, TWO DIFFERENT DEFECTS, ONE EXIT CODE.
       *
       *    1. drop the arm and each flag falls through to `-*`, so the run
       *       refuses with `unknown option: --skill` and never reaches the
       *       path at all. that defect breaks EVERY rhachet invocation.
       *
       *    2. keep the arm but `shift` instead of `shift 2`, and the VALUE
       *       survives: `pdf.transcribe.via.textual` becomes the PDF path,
       *       and the real path that follows it becomes an `unexpected
       *       argument`.
       *
       * ⚠️ both defects exit 2 and both print `blocked`, so the exit code
       *    discriminates neither — and the positive assertion above
       *    discriminates only the first, since a run refused on `unknown
       *    option` never prints the path either.
       */
      then('⭐ and neither the flags nor their values become the path', () => {
        expect(result.stdout).not.toContain('unknown option');
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });
  });

  /**
   * .what = `check_tool` (:116-121), an arm no case in this file reached
   *
   * .why  = ⭐ EVERY CASE ABOVE RUNS ON A MACHINE THAT HAS POPPLER, so the
   *         guard executed on every one of them and no assertion read its
   *         output. an arm walk answers "which case reaches this?" with
   *         "all of them" and moves on satisfied.
   *
   *         this is the arm a human meets on a machine that is not this
   *         one: a fresh container, a CI image without poppler, a mac with
   *         only half the suite installed. it is the FIRST output they see
   *         from this skill, and the only place the cure —
   *         `install poppler-utils` — is ever named.
   *
   * ⛔ THE UNGUARDED FAILURE IS NOT A SILENCE — IT IS A CONFIDENT
   *    MISDIAGNOSIS, AND IT BLAMES THE DOCUMENT.
   *
   *    measured 2026-09-03. neutered, the run does not die at 127 with an
   *    empty stdout, as a first read of the code predicts. it reaches
   *    `read_pdf_text`, whose `|| { print_blocked … ; exit 1 }` catches
   *    the shell's 127 and emits, in full:
   *
   *      🦅 that wont work...
   *      🔎 pdf.transcribe.via.textual
   *         └─ blocked: pdftotext failed to read: <the pdf>
   *
   *    every word of that is wrong about the cause. the PDF is fine — it
   *    was built by this very case and is read without complaint by every
   *    other case in the file. what is absent is the TOOL, and the reader
   *    is sent to inspect their document instead.
   *
   *    ⚠️ and no channel names the truth. `read_pdf_text` sends stderr to
   *       /dev/null, so the shell's own "command not found" is discarded
   *       before anyone could see it.
   *
   *    ⭐ the exit code moves too, and in the direction that compounds the
   *       harm: 2 -> 1. this skill documents 2 as a CONSTRAINT and 1 as a
   *       MALFUNCTION, so the unguarded path also tells the caller "the
   *       server is broken" where the truth is "install a package."
   *
   *    ⭐ SO THE EXCLUSION BELOW CARRIES THE WEIGHT. a bare presence check
   *       on "pdftotext" would match the misdiagnosis string, which
   *       contains the tool's name. only an assertion that the WRONG
   *       refusal is absent can separate the guard from its downstream
   *       imitation.
   */
  given('[case8] pdftotext is not installed', () => {
    when('[t0] a valid PDF is handed to a machine without poppler', () => {
      const outcome = useBeforeAll(async () => {
        // ⭐ a REAL fixture, deliberately. `validate_pdf` runs BEFORE
        //    `check_tool`, so an absent or non-pdf path would refuse one
        //    step earlier and this case would report green over an arm it
        //    never reached.
        const pdfPath = path.join(tmp.dir, 'toolless.pdf');
        genTextPdf({
          into: pdfPath,
          lines: { page1: ['ALPHA'], page2: ['OMEGA'] },
        });
        return runSkillWithOnly({ tools: [], args: [pdfPath], under: tmp.dir });
      });

      then('exit code is 2 — a constraint, not a malfunction', () => {
        // 1 would say "the server is broken"; the caller must install a
        // package, which is a constraint on them.
        expect(outcome.exitCode).toBe(2);
      });

      then('⭐ it names the tool that is absent', () => {
        expect(outcome.stdout).toContain('pdftotext not found');
      });

      then('⭐ and it does NOT blame the document instead', () => {
        // the discriminator, per the header. the downstream arm refuses
        // too, at exit 1, with a message that names the same binary and
        // the wrong cause — so a presence check on "pdftotext" alone is
        // satisfied by the very defect this case exists to catch.
        expect(outcome.stdout).not.toContain('failed to read');
      });

      /**
       * ⚠️ THE CURE, NOT ONLY THE SYMPTOM.
       *
       * "pdftotext not found" sends a reader to hunt for a package named
       * pdftotext, which does not exist. the package is poppler-utils, and
       * this line is the only place the skill says so.
       */
      then('⭐ it names the PACKAGE to install, not just the binary', () => {
        expect(outcome.stdout).toContain('install poppler-utils');
      });

      then('it refuses BEFORE it reads — no markdown was emitted', () => {
        expect(outcome.stdout).not.toContain('## page 1');
      });
    });
  });

  /**
   * .what = the `pdftotext failed to read` arm — this skill's ONLY exit-1
   *         path, and one no case in this file ever reached on purpose
   *
   * .why  = [case8] above proves the arm EXECUTES: it is what catches the
   *         shell's 127 when poppler is absent, and that case asserts it as
   *         the WRONG answer. no case asserted it as the RIGHT one, so the
   *         arm was known here only by the defect it masks.
   *
   * ⛔ AND THE EXIT CODE CANNOT TELL YOU THE GUARD RAN.
   *
   *    the arm returns 1. poppler returns 1 on a file it cannot parse. so
   *    `expect(exitCode).toBe(1)` is satisfied by a run in which the guard
   *    never executed at all — the same coincidence already found and cured
   *    in this family's dispatcher, whose page-count guard was UNREACHABLE
   *    while its exit-code assertion stayed green.
   *
   *    the shape here is one edit away. `raw=$(read_pdf_text) || { … }` is
   *    reachable only BECAUSE of the `||`, which consumes the non-zero
   *    status that `set -e` plus `pipefail` would otherwise abort on.
   *    delete the block as redundant — the obvious cleanup, since `set -e`
   *    "handles it" — and the caller gets an EMPTY stdout, an empty stderr
   *    (poppler's own message is discarded inside `read_pdf_text`), and a
   *    bare 1 with no reason attached to it.
   *
   * ⭐ SO THE MESSAGE IS THE ONLY OBSERVABLE THAT DISCRIMINATES.
   */
  given('[case9] a file that ends in .pdf but is not a PDF', () => {
    when('[t0] extraction is attempted', () => {
      const scene = useBeforeAll(async () => {
        // ⭐ a REAL file with a REAL .pdf extension, deliberately.
        //    `validate_pdf` checks existence and extension only, so BOTH of
        //    its refusals must be cleared for this arm to be reached at all
        //    — an absent path or a `.txt` would refuse one step earlier and
        //    report green over an arm the case never touched.
        const pdfPath = path.join(tmp.dir, 'corrupt.pdf');
        fs.writeFileSync(pdfPath, 'this is not a PDF. it is a sentence.\n');
        return { result: runSkill([pdfPath]), pdfPath };
      });

      then('exit code is 1 — a MALFUNCTION, not a constraint', () => {
        expect(scene.result.exitCode).toBe(1);
      });

      /**
       * ⭐ THE DECISIVE ASSERTION, per the header. poppler emits the same
       *    exit code unaided on this same input, so this line is the only
       *    observable that separates "the guard ran and refused" from "the
       *    guard never ran."
       */
      then('⭐ it says the read failed, and names the file', () => {
        expect(scene.result.stdout).toContain(
          `pdftotext failed to read: ${scene.pdfPath}`,
        );
      });

      /**
       * ⚠️ the neighbor refusal one step below sends a reader to OCR. that
       *    cure does not apply to a file poppler could not parse at all, so
       *    a run that reported it would send a human to spend money on an
       *    optical pass over a document that is not a document.
       */
      then('and it does NOT misreport the file as merely text-free', () => {
        expect(scene.result.stdout).not.toContain('no embedded text found');
      });
    });
  });
});
