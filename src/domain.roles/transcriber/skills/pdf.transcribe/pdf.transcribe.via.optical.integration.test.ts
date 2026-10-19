import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, when } from 'test-fns';

/**
 * BLOCKER: credentials required for live API tests
 *
 * GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS: for OCR transcription
 *
 * locally: rhx keyrack unlock --owner ehmpath --env test
 * in CI: secrets injected via GitHub secrets (keyrack forwards env vars)
 */
/**
 * the fixture is GENERATED, never committed.
 *
 * .why = a committed pdf is an opaque blob: a reviewer cannot see what it
 *   contains, it bloats the package, and when it is moved or dropped the
 *   break surfaces as "fixture path not found" rather than as anything
 *   meaningful. generating it makes the fixture's content READABLE right
 *   here, and makes the test hermetic.
 *
 * .how = ps2pdf lays the words down as real text, then ghostscript's
 *   pdfimage24 device RASTERIZES that page — which destroys the text layer
 *   and leaves an image of legible words. that is precisely what a scanned
 *   document is, so the live OCR path gets a fair subject.
 *
 * .note = this runs at module scope on purpose. genTempDir clones the
 *   fixture during collection, which is BEFORE any beforeAll would fire.
 */
const FIXTURE_ROOT = path.join(__dirname, '__fixtures__', 'cached-patent');
const FIXTURE_CACHE = path.join(FIXTURE_ROOT, '.agent/.cache/patents/19399196');
const FIXTURE_PDF = path.join(
  FIXTURE_CACHE,
  '1.event.2025-11-24.office-action.pdf',
);
const FIXTURE_MD = FIXTURE_PDF.replace('.pdf', '.md');

const FIXTURE_LINES = [
  'UNITED STATES PATENT AND TRADEMARK OFFICE',
  'OFFICE ACTION SUMMARY',
  'Application No. 19399196',
  'Claims 1-20 are pending in the application.',
];

/**
 * .what = a SECOND fixture, two pages, each with its own marker word
 *
 * .why = `--page N` is the only interface the dispatcher ever calls this
 *   leaf through, and a one-page subject cannot exercise it: `--page 1`
 *   yields `## Page 1`, which is exactly what the default yields. so the
 *   page-offset arm, the `-f/-l` scope, and the cache suppression are all
 *   invisible against the one-page fixture.
 *
 * .note = ALPHA and OMEGA share no substring, so neither marker can be
 *   read as evidence for the other.
 */
const FIXTURE_TWOPAGE_PDF = path.join(FIXTURE_CACHE, '2.multipage.scanned.pdf');
const FIXTURE_TWOPAGE_MARK = {
  one: 'ALPHA MARKS PAGE ONE',
  two: 'OMEGA MARKS PAGE TWO',
};

/**
 * .what = lays words down as real text, then RASTERIZES the page
 *
 * .why = that is precisely what a scanned document is, so the live OCR path
 *   gets a fair subject. shared by both fixtures so the "prove it carries no
 *   text layer" failfast cannot drift between them.
 */
const genScannedPdfFrom = (input: {
  pages: string[][];
  into: string;
}): void => {
  const psText = [
    '%!PS',
    // ⚠️ the font is re-selected PER PAGE on purpose: showpage resets the
    //    graphics state, so a single leading findfont leaves page 2 blank —
    //    and a blank page 2 would make the page-scope clamp below pass for
    //    the wrong reason.
    //
    // 🚩 18pt, not 28. at 28pt an all-caps line of ~41 characters runs off
    //    the right edge of a 612pt page, and PostScript simply clips it —
    //    silently. this fixture shipped that way, and OCR returned
    //    "UNITED STATES PATENT AND TRADEMA" for months, because no
    //    assertion in this file ever read the transcribed words. the width
    //    failfast below is what keeps that from recurring.
    ...input.pages.flatMap((lines) => [
      '/Helvetica findfont 18 scalefont setfont',
      ...lines.flatMap((line, i) => [
        `40 ${700 - i * 44} moveto`,
        `(${line}) show`,
      ]),
      'showpage',
    ]),
  ].join('\n');

  const dir = path.dirname(input.into);
  const stem = path.basename(input.into, '.pdf');
  const psPath = path.join(dir, `${stem}.ps`);
  const textPdf = path.join(dir, `${stem}.text.pdf`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(psPath, psText);

  const built = spawnSync('ps2pdf', [psPath, textPdf], { encoding: 'utf-8' });
  if (built.status !== 0) {
    throw new Error(`ps2pdf failed to build fixture: ${built.stderr}`);
  }

  // ⭐ failfast: prove every line RENDERED IN FULL, while a text layer still
  //    exists to check it against. a line wider than the page is clipped by
  //    PostScript without any error, so the only signal is that the glyphs
  //    are absent — and once the page is rasterized below, an OCR miss and a
  //    render miss look identical. this check must run HERE or not at all.
  const laid = spawnSync('pdftotext', ['-layout', textPdf, '-'], {
    encoding: 'utf-8',
  });
  const laidFlat = (laid.stdout ?? '').replace(/\s+/g, ' ');
  for (const line of input.pages.flat()) {
    if (!laidFlat.includes(line.replace(/\s+/g, ' '))) {
      throw new Error(
        `fixture line did not render in full (too wide for the page?): "${line}"`,
      );
    }
  }

  // rasterize: the output has NO text layer, so pdftotext yields an empty
  // string and only real OCR can read it
  const flattened = spawnSync(
    'gs',
    [
      '-sDEVICE=pdfimage24',
      '-r150',
      '-dNOPAUSE',
      '-dBATCH',
      '-dQUIET',
      `-sOutputFile=${input.into}`,
      textPdf,
    ],
    { encoding: 'utf-8' },
  );
  if (flattened.status !== 0) {
    throw new Error(`gs failed to rasterize fixture: ${flattened.stderr}`);
  }

  fs.rmSync(psPath, { force: true });
  fs.rmSync(textPdf, { force: true });

  // failfast: prove the fixture really is image-only. if a text layer
  // survived, the "cached vs OCR" tests below would be measuring the wrong
  // thing entirely.
  const extracted = spawnSync('pdftotext', [input.into, '-'], {
    encoding: 'utf-8',
  });
  if ((extracted.stdout ?? '').replace(/\s/g, '') !== '') {
    throw new Error(
      'fixture still carries a text layer — rasterization did not take effect',
    );
  }
};

const genScannedFixture = (): void => {
  fs.mkdirSync(FIXTURE_CACHE, { recursive: true });

  genScannedPdfFrom({ pages: [FIXTURE_LINES], into: FIXTURE_PDF });
  genScannedPdfFrom({
    pages: [[FIXTURE_TWOPAGE_MARK.one], [FIXTURE_TWOPAGE_MARK.two]],
    into: FIXTURE_TWOPAGE_PDF,
  });

  // failfast: a one-page render here would make the page-scope clamp pass
  // for the wrong reason — `--page 2` on a one-page pdf extracts no image
  // at all, so the run would block rather than mislabel.
  const counted = spawnSync('pdfinfo', [FIXTURE_TWOPAGE_PDF], {
    encoding: 'utf-8',
  });
  if (!/^Pages:\s+2$/m.test(counted.stdout ?? '')) {
    throw new Error(
      `two-page fixture did not render two pages: ${counted.stdout}`,
    );
  }

  // the pre-populated cache, so the cache-hit case has a hit to make.
  // marked so that if it ever leaks into a real transcript, its origin is
  // obvious rather than mistaken for genuine OCR output.
  fs.writeFileSync(
    FIXTURE_MD,
    ['<!-- generated test fixture, not real OCR -->', '', '## Page 1', '']
      .concat(FIXTURE_LINES)
      .join('\n'),
  );
};

genScannedFixture();

/**
 * .what = the binaries this skill reaches for on the way to each guard below
 *
 * .why  = these are support, never the subject. the subject of a tool-absence
 *   case is `pdftoppm`, and it is named by its ABSENCE from the allow list.
 *
 * ⚠️ `curl` and `rhx` are deliberately NOT here. both are network doors, and
 *    every case below supplies its own local stand-in for them — so a real one
 *    on PATH would turn a hermetic probe into a live call, silently.
 */
const OPTICAL_SUPPORT_BINS = [
  'bash',
  'sed',
  'awk',
  'tr',
  'wc',
  'ls',
  'rm',
  'mktemp',
  'cat',
  'cut',
  'date',
  'dirname',
  'basename',
  'env',
  'head',
  'tail',
  'sort',
  'uname',
  'jq',
  'openssl',
  'base64',
];

/**
 * .what = a directory that becomes the WHOLE PATH: the support binaries, plus
 *         exactly the tools named in `allow`, plus any local stand-ins.
 *
 * .why  = ⛔ A PATH PREPEND CAN ONLY ADD. to prove a tool-absence guard bites,
 *         the tool has to be UNREACHABLE — so PATH is REPLACED, never extended.
 *         (the same lesson `pdf.redact` and `notary.find` each learned.)
 *
 * ⚠️ a real path is resolved per name and symlinked. a name with no binary on
 *    the host is skipped rather than faked — a fake would be a second defect in
 *    the fixture's clothes.
 */
const genProbeBin = (input: {
  into: string;
  allow: string[];
  stands?: Record<string, string>;
}): string => {
  fs.mkdirSync(input.into, { recursive: true });
  for (const tool of [...OPTICAL_SUPPORT_BINS, ...input.allow]) {
    const res = spawnSync('which', [tool], { encoding: 'utf-8' });
    const real = (res.stdout ?? '').trim();
    if (!real) continue;
    const link = path.join(input.into, tool);
    if (!fs.existsSync(link)) fs.symlinkSync(real, link);
  }
  for (const [name, body] of Object.entries(input.stands ?? {})) {
    const at = path.join(input.into, name);
    fs.rmSync(at, { force: true });
    fs.writeFileSync(at, body);
    fs.chmodSync(at, 0o755);
  }
  return input.into;
};

/**
 * .what = a synthetic service account, with a REAL locally generated RSA key
 *
 * .why  = ⭐ THIS IS THE LEVER THE FILE SAID DID NOT EXIST. `check_credentials`
 *   (:133) reads the env var FIRST and only falls back to keyrack, so a
 *   synthetic value here takes the whole credential path off the network.
 *
 * ⚠️ the key must be a real PEM, because `get_access_token` signs the JWT with
 *    `openssl dgst -sha256 -sign` (:176) and openssl refuses a fake. nobody
 *    ever VERIFIES that signature — the token endpoint is a local stand-in — so
 *    a throwaway key is sufficient and no secret is involved.
 */
const genSyntheticServiceAccount = (input: { into: string }): string => {
  const pemAt = path.join(input.into, 'synthetic.pem');
  const made = spawnSync('openssl', ['genrsa', '-out', pemAt, '2048'], {
    encoding: 'utf-8',
  });
  if (made.status !== 0) {
    throw new Error(
      `openssl genrsa failed to make a probe key: ${made.stderr}`,
    );
  }
  return JSON.stringify({
    client_email: 'probe@synthetic.invalid',
    private_key: fs.readFileSync(pemAt, 'utf-8'),
  });
};

/**
 * .what = a `curl` that never leaves the machine, and answers from files
 *
 * .why  = the skill calls curl twice with two different hosts — the oauth token
 *   endpoint (:181) and the Vision endpoint (:244) — so one stand-in serves
 *   every arm below, by a read of the url it was handed.
 *
 * ⚠️ THE WIRE FORMAT IS LOAD-BEARING. the Vision call passes
 *    `-w "\n%{http_code}"`, and `ocr_image` then splits the LAST LINE off as
 *    the status (:252-253). so the reply must be `<body>\n<code>`; emit only a
 *    body and the skill reads the body's own last line as an HTTP status.
 */
const genLocalCurl = (input: { answersAt: string }): string =>
  [
    '#!/usr/bin/env bash',
    '# a probe stand-in. answers from files; opens no socket.',
    `ANSWERS="${input.answersAt}"`,
    'for arg in "$@"; do',
    '  case "$arg" in',
    '    *oauth2.googleapis.com*)',
    '      cat "$ANSWERS/token.json"',
    '      exit 0',
    '      ;;',
    '    *vision.googleapis.com*)',
    '      cat "$ANSWERS/vision.body"',
    '      echo ""',
    '      cat "$ANSWERS/vision.code"',
    '      exit 0',
    '      ;;',
    '  esac',
    'done',
    'echo "{}"',
    'exit 0',
  ].join('\n');

/**
 * .what = writes the two replies the local curl reads
 *
 * .note = `vision.body` is written with no newline at its end on purpose; the
 *   stand-in adds exactly one before the status code, so the split in
 *   `ocr_image` lands where the real `-w` format would put it.
 */
const setCurlAnswers = (input: {
  at: string;
  token: string;
  visionBody: string;
  visionCode: string;
}): void => {
  fs.mkdirSync(input.at, { recursive: true });
  fs.writeFileSync(path.join(input.at, 'token.json'), input.token);
  fs.writeFileSync(path.join(input.at, 'vision.body'), input.visionBody);
  fs.writeFileSync(path.join(input.at, 'vision.code'), input.visionCode);
};

const TOKEN_OK = JSON.stringify({ access_token: 'synthetic-probe-token' });

const VISION_OK = JSON.stringify({
  responses: [{ fullTextAnnotation: { text: 'SYNTHETIC PROBE TEXT' } }],
});

describe('pdf.transcribe.via.optical', () => {
  const scriptPath = path.join(__dirname, 'pdf.transcribe.via.optical.sh');

  // fail fast if credentials not set
  beforeAll(() => {
    if (!process.env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS) {
      throw new Error(
        'GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS required for OCR. run: rhx keyrack unlock --owner ehmpath --env test',
      );
    }
  });

  const runSkill = (
    args: string[],
  ): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000, // 2 min timeout for OCR
      env: process.env, // explicitly pass env for API credentials
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = swaps the per-run temp dir out of stdout for a stable token
   *
   * .why = genTempDir mints a fresh path on every run — a timestamp, a slug,
   *   and a random suffix — and the skill echoes that path straight back on
   *   its `source:` and `cached:` lines. snapshot it raw and the value differs
   *   on every run and on every machine, so the snapshot can never pass, and
   *   the developer's absolute home path ships to npm inside it.
   *
   * .note = an exact split, not a regex. the temp path is already in scope
   *   here, so there is no shape left to pattern-match; a regex would only be
   *   a guess at that shape, and would silently under-match when the shape
   *   moves (as it does here, where genTempDir nests one extra `symlink`
   *   level that a `.temp/[^/]+` matcher stops at).
   */
  const scrub = (input: { stdout: string; tempDir: string }): string =>
    input.stdout.split(input.tempDir).join('$TMP');

  given('[case1] --help flag', () => {
    when('[t0] help is requested', () => {
      then('usage info is displayed', () => {
        const result = runSkill(['--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('pdf.transcribe.via.optical.sh');
        expect(result.stdout).toContain('--into');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] no PDF path provided', () => {
    when('[t0] skill is called without arguments', () => {
      then('error is returned', () => {
        const result = runSkill([]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('blocked');
        expect(result.stdout).toContain('no PDF path');
        expect(result.stdout).toMatchSnapshot();
      });

      /**
       * .why = ⭐ `output.sh` exists in three executables and takes the
       *        name of the one that blocked from `SKILL_NAME`. its own
       *        header states why: "without that, a failure inside
       *        via.optical would report itself as 'pdf.transcribe' and
       *        send the reader to the wrong file."
       *
       *        ⛔ that guarantee had NO live reader on this leaf. the name
       *        appears in six snapshot entries and in no assertion — and
       *        a snapshot cannot fail here, because `[ -n $RESNAP ]` is
       *        unquoted in package.json and collapses to `[ -n ]`, which
       *        POSIX evaluates TRUE for every value (on the record since
       *        #127). so `--updateSnapshot` is passed on every run.
       *
       *        🚩 the SIBLING leaf has the assertion —
       *        `pdf.transcribe.via.textual.integration.test.ts` reads
       *        `🔎 pdf.transcribe.via.textual` live, under its
       *        `stdout confirms where the markdown actually went` then.
       *        one leaf was cured
       *        and the other was left on the snapshot.
       *
       * ⚠️ `toContain('blocked')` above cannot stand in for this. `blocked`
       *    is the tree KEY, printed by every refusal in the family, so it
       *    is identical across all three executables.
       */
      then('⭐ the refusal names THIS leaf, not the dispatcher', () => {
        const result = runSkill([]);
        expect(result.stdout).toContain('🔎 pdf.transcribe.via.optical');
        expect(result.stdout).not.toContain('🔎 pdf.transcribe\n');
      });
    });
  });

  given('[case3] PDF file does not exist', () => {
    when('[t0] nonexistent file is specified', () => {
      then('error is returned', () => {
        const result = runSkill([
          '/nonexistent/file.pdf',
          '--into',
          'markdown',
        ]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('blocked');
        expect(result.stdout).toContain('file not found');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] unsupported output format', () => {
    when('[t0] invalid format is specified', () => {
      then('error is returned', () => {
        // create a temp PDF for this test
        const tempDir = fs.mkdtempSync('/tmp/transcribe-test-');
        const tempPdf = path.join(tempDir, 'test.pdf');
        fs.writeFileSync(tempPdf, '%PDF-1.4\n'); // minimal PDF header

        const result = runSkill([tempPdf, '--into', 'docx']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('blocked');
        expect(result.stdout).toContain('unsupported format');
        expect(result.stdout).toMatchSnapshot();

        // cleanup
        fs.rmSync(tempDir, { recursive: true });
      });
    });
  });

  /**
   * .what = the arg-parse and validate arms that no other case reaches
   *
   * .why = ⛔ THIS IS THE ARM WALK, NOT THE OUTPUT WALK. every arm below is
   *   a `case` branch in `parse_args` or a guard in `validate_pdf`, and
   *   before this case NO test in ANY of the three files in this family
   *   ever entered one of them. an arm no case reaches has no assertion to
   *   audit — the defect is legible only from the ABSENCE of a case, which
   *   is the one signal a read of the assertions cannot supply.
   *
   * ⭐ every arm here sits ABOVE the network. `main` runs
   *    parse_args -> validate_pdf -> validate_format -> cache -> creds
   *    (:331-350), so each refusal lands before a token is fetched and
   *    before a page is sent to Vision. that is why they are cheap to
   *    clamp, and why their absence is expensive: a run that should have
   *    refused instead SPENDS money on the wrong document.
   *
   * ⛔ the `pdftoppm not found` arm (:201) is deliberately NOT here. it
   *    sits after `get_access_token`, so any case that reaches it must
   *    make a live credential call first — a narrowed PATH cannot get
   *    there hermetically. recorded as still-uncovered rather than faked.
   *
   * 🚩 RETRACTED 2026-09-03. the paragraph above is left as written, per
   *    `rule.require.permanent-yields` — a record is appended to, never
   *    edited to be correct. its premise holds and its conclusion does
   *    not: a narrowed PATH is ONE lever, and to weigh only that one
   *    turned "this lever cannot reach it" into "no lever can".
   *
   *    [case12][t0] now covers that arm, and the coverage is proven: with
   *    the guard reverted, exit went 2 -> 1 and the run reported `failed
   *    to convert PDF to images` — an absent PACKAGE misdiagnosed as a
   *    corrupt DOCUMENT.
   *
   *    the second lever, and why it opens all seven arms below the
   *    network at once, is set out in [case9]'s header.
   */
  given('[case8] the arg-parse and validate arms', () => {
    // ⚠️ every value here is deliberate: the flags must be consumed AND
    //    their values must be consumed, so the real path is what lands.
    const rhachetArgs = [
      '--skill',
      'pdf.transcribe.via.optical',
      '--repo',
      'rhight',
      '--role',
      'transcriber',
      '/nonexistent/probe.pdf',
    ];

    when('[t0] the short `-h` alias is used', () => {
      then('it prints the usage block, at exit 0', () => {
        const outcome = runSkill(['-h']);
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('usage:');
      });

      /**
       * ⭐ THE DISCRIMINATOR. `-h` is an alias on the SAME `case` arm as
       *    `--help` (:39). drop it and `-h` falls through to `-*` (:65),
       *    which refuses it as an unknown option at exit 2.
       *
       * ⚠️ the `usage:` assertion above cannot carry this on its own,
       *    because [case1] already proves `--help` renders that block. it
       *    is the EXCLUSION that separates a live alias from a dead one.
       */
      then('⭐ and it is NOT refused as an unknown option', () => {
        const outcome = runSkill(['-h']);
        expect(outcome.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] an unrecognized flag is passed', () => {
      then('it refuses at exit 2 and names the flag', () => {
        const outcome = runSkill(['--bogus']);
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('unknown option: --bogus');
      });

      /**
       * ⭐ THE DISCRIMINATOR. drop the `-*` arm (:65) and `--bogus` falls
       *    to `*)` (:69), where it is taken as the PDF PATH — so the run
       *    refuses with `file not found: --bogus` instead.
       *
       * ⚠️ same exit code, same `blocked` tree key, and a message that
       *    sends the reader to hunt for a file they never named. only the
       *    exclusion tells the two refusals apart.
       */
      then('⭐ and it is NOT mistaken for the PDF path', () => {
        const outcome = runSkill(['--bogus']);
        expect(outcome.stdout).not.toContain('file not found');
      });
    });

    when('[t2] a second positional argument is passed', () => {
      then('it refuses at exit 2 and names the extra argument', () => {
        const outcome = runSkill(['a.pdf', 'b.pdf']);
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('unexpected argument: b.pdf');
      });

      /**
       * ⭐ THE DISCRIMINATOR, and this arm is the one with real money
       *    behind it. drop the guard (:73) and the second path is
       *    SILENTLY DISCARDED — PDF_PATH keeps the first, and the run
       *    proceeds. here that surfaces as `file not found: a.pdf`,
       *    because neither path exists; with two REAL paths it surfaces
       *    as a full OCR run against the wrong document, at exit 0, with
       *    no channel that says the second argument was ever seen.
       */
      then('⭐ and the second path is NOT silently discarded', () => {
        const outcome = runSkill(['a.pdf', 'b.pdf']);
        expect(outcome.stdout).not.toContain('file not found');
      });
    });

    when('[t3] rhachet passes --skill / --repo / --role', () => {
      then('they are consumed, and the PDF path still lands', () => {
        const outcome = runSkill(rhachetArgs);
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain(
          'file not found: /nonexistent/probe.pdf',
        );
      });

      /**
       * ⭐ TWO EXCLUSIONS, AND THEY RULE OUT TWO DIFFERENT DEFECTS.
       *
       *    1. drop the `--skill|--repo|--role` arm (:61) and each flag
       *       falls to `-*`, so the run refuses with `unknown option` and
       *       never reaches the path at all. that defect would break
       *       EVERY rhachet invocation of this leaf.
       *
       *    2. keep the arm but `shift` instead of `shift 2`, and the
       *       VALUE survives: `pdf.transcribe.via.optical` becomes the
       *       PDF path, and the real path that follows becomes an
       *       `unexpected argument`.
       *
       * ⚠️ both defects still exit 2, and both still print `blocked`. so
       *    the exit code discriminates neither of them, and the positive
       *    assertion above discriminates only the first — a run that
       *    refused on `unknown option` never prints the path either.
       */
      then('⭐ and neither the flags nor their values become the path', () => {
        const outcome = runSkill(rhachetArgs);
        expect(outcome.stdout).not.toContain('unknown option');
        expect(outcome.stdout).not.toContain('unexpected argument');
      });
    });
  });

  given('[case5] deterministic cached flow (uses fixture)', () => {
    // this test uses a pre-populated fixture to prove the cached flow works
    // without any API calls - deterministic and fast
    const fixturePath = path.join(__dirname, '__fixtures__', 'cached-patent');

    // genTempDir clones the fixture into an isolated temp directory with git init
    const tempDir = genTempDir({
      slug: 'transcribe-cached',
      clone: fixturePath,
      git: true,
    });

    when('[t0] cached result extant', () => {
      then('cache is used instead of OCR (no API calls)', () => {
        // fixture has both PDF and .md file pre-populated
        const testPdf = path.join(
          tempDir,
          '.agent/.cache/patents/19399196/1.event.2025-11-24.office-action.pdf',
        );
        const expectedCache = testPdf.replace('.pdf', '.md');

        // failfast: verify fixture PDF is valid (not a JSON error)
        const pdfHeader = fs.readFileSync(testPdf, 'utf-8').slice(0, 10);
        if (!pdfHeader.startsWith('%PDF')) {
          throw new Error(
            `fixture PDF is invalid (not a PDF file). header: ${pdfHeader}. path: ${testPdf}`,
          );
        }

        // failfast: verify fixture has cache file
        if (!fs.existsSync(expectedCache)) {
          throw new Error(
            `fixture .md cache file not found at: ${expectedCache}`,
          );
        }

        const result = runSkill([testPdf, '--into', 'markdown']);

        // should succeed and indicate cache hit
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('found in cache');
        expect(scrub({ stdout: result.stdout, tempDir })).toMatchSnapshot();
      });
    });
  });

  given('[case6] valid scanned PDF (LIVE API)', () => {
    // CRITICAL: this test MUST hit the live Google Cloud Vision API
    // if this test passes without credentials, the test suite is broken
    const fixturePath = path.join(__dirname, '__fixtures__', 'cached-patent');

    // genTempDir clones the fixture into an isolated temp directory
    const tempDir = genTempDir({
      slug: 'transcribe-live',
      clone: fixturePath,
      git: true,
    });

    when('[t0] OCR is performed on a real document', () => {
      then('text is extracted and cached', () => {
        const testPdf = path.join(
          tempDir,
          '.agent/.cache/patents/19399196/1.event.2025-11-24.office-action.pdf',
        );
        const expectedCache = testPdf.replace('.pdf', '.md');

        // failfast: verify fixture PDF is valid (not a JSON error)
        const pdfHeader = fs.readFileSync(testPdf, 'utf-8').slice(0, 10);
        if (!pdfHeader.startsWith('%PDF')) {
          throw new Error(
            `fixture PDF is invalid (not a PDF file). header: ${pdfHeader}. path: ${testPdf}`,
          );
        }

        // remove cached result to force fresh OCR
        if (fs.existsSync(expectedCache)) {
          fs.unlinkSync(expectedCache);
        }

        const result = runSkill([testPdf, '--into', 'markdown']);

        // failfast: log proof of failure
        if (result.exitCode !== 0) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }

        // should succeed
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('pdf.transcribe.via.optical');

        // should have extracted text
        expect(result.stdout).toContain('## Page 1');

        // ⭐ the WORDS. every assertion above is satisfied by a skill that
        //    returns an empty page under a correct header — which is the
        //    one failure `rule.forbid.hand-transcription` names by name:
        //    an empty page reads as "this page is blank" rather than as
        //    "this page was never examined". slice the body first, so a
        //    header or a path cannot stand in for transcribed text.
        const body = result.stdout.split('## Page 1')[1] ?? '';
        expect(body).not.toEqual(''); // positive control: the header exists
        expect(body).toContain('UNITED STATES PATENT AND TRADEMARK OFFICE');
        expect(body).toContain('OFFICE ACTION SUMMARY');

        // should have cached result
        expect(fs.existsSync(expectedCache)).toBe(true);

        // ⭐ and the cache carries the words too. existence is not content,
        //    and an empty cache is PERMANENT: the next run reads it instead
        //    of paying for OCR again, so it can never self-heal.
        const cached = fs.readFileSync(expectedCache, 'utf-8');
        expect(cached).toContain('## Page 1');
        expect(cached).toContain('UNITED STATES PATENT AND TRADEMARK OFFICE');
        expect(cached).toContain('OFFICE ACTION SUMMARY');

        // snapshot the output structure (not full text, too variable)
        expect(
          scrub({ stdout: result.stdout, tempDir })
            .split('\n')
            .slice(0, 10)
            .join('\n'),
        ).toMatchSnapshot();
      });
    });
  });

  given('[case7] one page of a multi-page scan, via --page (LIVE API)', () => {
    /**
     * ⛔ `--page N` is the ONLY interface the dispatcher calls this leaf
     *    through, and before this case it had NO coverage on either side of
     *    that seam. it drives four separate behaviors:
     *      1. the `-f/-l` scope handed to pdftoppm
     *      2. the `## Page N` label offset
     *      3. CACHE_SKIP on the READ path
     *      4. the whole-document cache-write suppression
     *    each one is a silent corruption when it breaks.
     */
    const fixturePath = path.join(__dirname, '__fixtures__', 'cached-patent');

    const tempDir = genTempDir({
      slug: 'transcribe-page',
      clone: fixturePath,
      git: true,
    });

    when('[t0] page 2 of a two-page scan is requested', () => {
      then('it reads page 2, labels it 2, and writes no document cache', () => {
        const testPdf = path.join(
          tempDir,
          '.agent/.cache/patents/19399196/2.multipage.scanned.pdf',
        );
        const wholeDocCache = testPdf.replace('.pdf', '.md');

        // positive control: the fixture cloned. without it, every
        // `not.toContain` below is satisfied by a run that never happened.
        expect(fs.existsSync(testPdf)).toBe(true);

        const result = runSkill([testPdf, '--page', '2']);

        if (result.exitCode !== 0) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);

        // ⭐ which page it ACTUALLY read. this is the discriminator: without
        //    it, `## Page 2` is equally satisfied by a mislabeled page 1.
        expect(result.stdout).toContain(FIXTURE_TWOPAGE_MARK.two);
        expect(result.stdout).not.toContain(FIXTURE_TWOPAGE_MARK.one);

        // ⭐ and the page NUMBER, which no assertion in this file read. the
        //    skill's own comment names the harm: "otherwise the dispatcher
        //    would stitch a page 7 into the document under the header
        //    '## Page 1'".
        expect(result.stdout).toContain('## Page 2');
        expect(result.stdout).not.toContain('## Page 1');

        // ⭐ no whole-document cache. a one-page cache under the document's
        //    own cache path is read by the NEXT full call, which then returns
        //    this single page AS the entire document, at exit 0.
        expect(fs.existsSync(wholeDocCache)).toBe(false);

        expect(
          scrub({ stdout: result.stdout, tempDir })
            .split('\n')
            .slice(0, 8)
            .join('\n'),
        ).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = every arm BELOW the network door, reached with no network at all
   *
   * .why  = 🚩 THIS FILE SAID THESE ARMS COULD NOT BE REACHED. [case8]'s own
   *   header carried the claim verbatim:
   *
   *     "the `pdftoppm not found` arm (:201) is deliberately NOT here. it sits
   *      after `get_access_token`, so any case that reaches it must make a live
   *      credential call first — a narrowed PATH cannot get there hermetically.
   *      recorded as still-uncovered rather than faked."
   *
   *   the first sentence is true and the conclusion does not follow. it weighs
   *   exactly ONE lever — a narrowed PATH — and generalizes its limit to
   *   "hermetically unreachable". there is a second lever, and it opens all
   *   seven arms at once:
   *
   *     1. `check_credentials` (:133) reads the ENV VAR before it reaches for
   *        keyrack, so a synthetic service account takes that door off the wire
   *     2. `get_access_token` (:181) and `ocr_image` (:244) both go out through
   *        `curl`, and curl is a name on PATH like any other
   *
   *   with those two, every guard below runs against a local answer file, at
   *   zero API spend and with no credential in play.
   *
   * ⛔ AND THE ARMS ARE NOT MINOR. between them they carry the whole failure
   *    vocabulary a human meets when a key lapses, a bill goes unpaid, or a
   *    package is absent — the moments when a correct message is worth most and
   *    a wrong one costs a support cycle.
   *
   * ⚠️ `[case6]` and `[case7]` remain LIVE on purpose. a stand-in proves the
   *    skill's own branches; only a real call proves the contract with Google
   *    still holds. these cases are additive, never a replacement.
   */
  const SYNTHETIC_SA = genSyntheticServiceAccount({
    into: fs.mkdtempSync('/tmp/optical-probe-key-'),
  });

  const genScene = (input?: {
    allow?: string[];
    stands?: Record<string, string>;
    token?: string;
    visionBody?: string;
    visionCode?: string;
    pdfBytes?: string;
  }): { root: string; bin: string; pdf: string } => {
    const root = fs.mkdtempSync('/tmp/optical-probe-');
    const answers = path.join(root, 'answers');
    setCurlAnswers({
      at: answers,
      token: input?.token ?? TOKEN_OK,
      visionBody: input?.visionBody ?? VISION_OK,
      visionCode: input?.visionCode ?? '200',
    });
    const bin = genProbeBin({
      into: path.join(root, 'bin'),
      allow: input?.allow ?? ['pdftoppm'],
      stands: {
        curl: genLocalCurl({ answersAt: answers }),
        ...(input?.stands ?? {}),
      },
    });
    // a FRESH copy of the scanned fixture, so a cache write from one probe can
    // never be read as a cache hit by the next.
    const pdf = path.join(root, 'probe.pdf');
    if (input?.pdfBytes !== undefined) fs.writeFileSync(pdf, input.pdfBytes);
    else fs.copyFileSync(FIXTURE_PDF, pdf);
    return { root, bin, pdf };
  };

  const runProbe = (input: {
    bin: string;
    args: string[];
    creds?: string | null;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const env: Record<string, string> = {
      ...(process.env as Record<string, string>),
      PATH: input.bin,
    };
    // ⛔ the real credential must be OUT of the probe env, always. it arrives
    //    from keyrack in `process.env`, and a leak here would send a live call
    //    from a case whose whole point is that it makes none.
    delete env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS;
    if (input.creds !== null) {
      env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS =
        input.creds ?? SYNTHETIC_SA;
    }
    const res = spawnSync('bash', [scriptPath, ...input.args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
      env,
    });
    return {
      stdout: res.stdout ?? '',
      stderr: res.stderr ?? '',
      exitCode: res.status ?? 1,
    };
  };

  /**
   * ⭐ THE POSITIVE CONTROL, AND IT IS MANDATORY.
   *
   * every case after this one asserts a REFUSAL. a refusal is satisfied just as
   * well by a harness that broke as by a guard that fired — a truncated PATH, a
   * curl stand-in with the wrong wire format, an unparseable key. so before any
   * of them is read as evidence, one run must go all the way through the same
   * harness and SUCCEED.
   *
   * ⭐ it is also the first fully hermetic end-to-end pass over this leaf. every
   *    other success case in this file spends real API budget.
   */
  given('[case9] the probe harness itself, driven end to end', () => {
    when('[t0] every stand-in answers as a healthy service would', () => {
      then('it transcribes, at exit 0, with no network in play', () => {
        const scene = genScene();
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });

        if (outcome.exitCode !== 0) {
          console.log('PROOF: exitCode:', outcome.exitCode);
          console.log('PROOF: stdout:', outcome.stdout);
          console.log('PROOF: stderr:', outcome.stderr);
        }
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('## Page 1');
      });

      /**
       * ⭐ the WORDS, not the header. `## Page 1` over an empty body is the
       *    failure `rule.forbid.hand-transcription` names by name, and it is
       *    what a broken stand-in would produce here.
       */
      then('⭐ the body carries the text the stand-in returned', () => {
        const scene = genScene();
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        const body = outcome.stdout.split('## Page 1')[1] ?? '';
        expect(body).not.toEqual('');
        expect(body).toContain('SYNTHETIC PROBE TEXT');
      });

      then('and the whole-document cache is written beside the pdf', () => {
        const scene = genScene();
        runProbe({ bin: scene.bin, args: [scene.pdf] });
        const cacheAt = scene.pdf.replace('.pdf', '.md');
        expect(fs.existsSync(cacheAt)).toBe(true);
        expect(fs.readFileSync(cacheAt, 'utf-8')).toContain(
          'SYNTHETIC PROBE TEXT',
        );
      });
    });
  });

  given('[case10] the keyrack door, when no env credential is set', () => {
    when('[t0] keyrack itself refuses', () => {
      const stands = {
        rhx: '#!/usr/bin/env bash\necho "probe: keyrack is locked" >&2\nexit 1\n',
      };

      then('it blocks as a CONSTRAINT and names the unlock command', () => {
        const scene = genScene({ stands });
        const outcome = runProbe({
          bin: scene.bin,
          args: [scene.pdf],
          creds: null,
        });
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('keyrack failed');
        expect(outcome.stdout).toContain('rhx keyrack unlock');
      });

      /**
       * ⭐ THE DISCRIMINATOR. drop the `|| { ... }` on :138 and `set -e` aborts
       *    the whole run on the assignment itself — so the caller gets a bare
       *    exit code with EMPTY stdout, and the one line that tells a human how
       *    to fix it is never printed.
       *
       * ⚠️ this is the same shape as `pdf.transcribe`'s `get_page_count`
       *    (#136): the guard sits BELOW a command substitution under
       *    `set -euo pipefail`, so its own `if` is unreachable and the failure
       *    arrives with no reason attached.
       */
      then('⭐ and the reason reaches stdout, not just an exit code', () => {
        const scene = genScene({ stands });
        const outcome = runProbe({
          bin: scene.bin,
          args: [scene.pdf],
          creds: null,
        });
        expect(outcome.stdout).not.toEqual('');
      });
    });

    when('[t1] keyrack answers, but carries no secret', () => {
      const stands = {
        rhx: '#!/usr/bin/env bash\necho \'{"grant":{"key":{"secret":null}}}\'\nexit 0\n',
      };

      then('it blocks as a CONSTRAINT and says the secret is absent', () => {
        const scene = genScene({ stands });
        const outcome = runProbe({
          bin: scene.bin,
          args: [scene.pdf],
          creds: null,
        });
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('keyrack returned no secret');
      });

      /**
       * ⭐ THE DISCRIMINATOR, and it is the costly one. drop the null check
       *    (:144) and `SA_JSON` is the four characters `null`. the run carries
       *    on: `jq -r '.client_email'` on it yields `null` too, openssl is
       *    handed a key that is not one, and the failure surfaces LATER as an
       *    openssl parse error — which reads as a corrupt credential rather
       *    than an absent one, and sends the reader to rotate a key that was
       *    never the problem.
       */
      then('⭐ and it does NOT carry on to sign a token with it', () => {
        const scene = genScene({ stands });
        const outcome = runProbe({
          bin: scene.bin,
          args: [scene.pdf],
          creds: null,
        });
        expect(outcome.stdout).not.toContain('failed to get access token');
        expect(outcome.stdout).not.toContain('## Page 1');
      });
    });
  });

  given('[case11] the token exchange is refused', () => {
    const token = JSON.stringify({
      error: 'invalid_grant',
      error_description: 'probe: the assertion was rejected',
    });

    when('[t0] the oauth endpoint returns an error payload', () => {
      then('it blocks as a MALFUNCTION and quotes the reason', () => {
        const scene = genScene({ token });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.exitCode).toBe(1);
        expect(outcome.stdout).toContain('failed to get access token');
        expect(outcome.stdout).toContain('probe: the assertion was rejected');
      });

      /**
       * ⭐ THE DISCRIMINATOR. drop the guard (:186) and `ACCESS_TOKEN` is the
       *    string `null`. the run carries straight on to Vision and sends the
       *    page with `Authorization: Bearer null` — so a credential fault is
       *    reported as whatever the API says about an unauthenticated request,
       *    one layer further from its cause. against this stand-in it simply
       *    SUCCEEDS, at exit 0.
       */
      then(
        '⭐ and it does NOT carry on to send a page with a null token',
        () => {
          const scene = genScene({ token });
          const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
          expect(outcome.stdout).not.toContain('## Page 1');
          expect(outcome.stdout).not.toContain('SYNTHETIC PROBE TEXT');
        },
      );
    });
  });

  given('[case12] the page-render arms', () => {
    /**
     * ⭐ THE ARM THIS FILE RECORDED AS UNREACHABLE. it is reached here with no
     *    credential and no socket — see the header above [case9].
     */
    when('[t0] pdftoppm is absent from PATH', () => {
      then('it blocks as a CONSTRAINT and names the package', () => {
        const scene = genScene({ allow: [] });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('pdftoppm not found');
        expect(outcome.stdout).toContain('poppler-utils');
      });

      /**
       * ⭐ THE DISCRIMINATOR, and the harm is a MISDIAGNOSIS. drop the
       *    `command -v` guard (:201) and pdftoppm is simply invoked; the shell
       *    reports it as not found, the `|| { ... }` on :212 catches that, and
       *    the run blocks with `failed to convert PDF to images` at exit 1.
       *
       * ⚠️ so AN ABSENT PACKAGE IS REPORTED AS A BAD DOCUMENT. the operator is
       *    sent to inspect a PDF that is perfectly sound. the same inversion
       *    `pdf.redact`'s `check_pdf_tools` exists to prevent.
       */
      then('⭐ and it does NOT blame the document', () => {
        const scene = genScene({ allow: [] });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.stdout).not.toContain('failed to convert PDF to images');
      });
    });

    when('[t1] the pdf cannot be rendered', () => {
      then('it blocks as a MALFUNCTION and quotes the renderer', () => {
        const scene = genScene({ pdfBytes: '%PDF-1.4\nnot a real body\n' });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.exitCode).toBe(1);
        expect(outcome.stdout).toContain('failed to convert PDF to images');
      });

      /**
       * ⭐ THE DISCRIMINATOR, AND THE EXIT CODE CANNOT CARRY IT. drop the
       *    `|| { ... }` on :212 and the run reaches the page count instead,
       *    which is zero — so it blocks at `no pages extracted from PDF`, also
       *    at EXIT 1. same code, same `blocked` key, and a message that
       *    describes an empty document rather than a broken one.
       *
       *    this is the coincidence `rule.require.assertions-that-discriminate`
       *    calls leak 6: only the MESSAGE separates "the guard fired" from "the
       *    guard was never there".
       */
      then('⭐ and it is NOT reported as an empty document', () => {
        const scene = genScene({ pdfBytes: '%PDF-1.4\nnot a real body\n' });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.stdout).not.toContain('no pages extracted');
      });
    });

    when('[t2] the renderer succeeds but writes no page', () => {
      const stands = { pdftoppm: '#!/usr/bin/env bash\nexit 0\n' };

      then('it blocks as a MALFUNCTION and says no page was extracted', () => {
        const scene = genScene({ stands });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.exitCode).toBe(1);
        expect(outcome.stdout).toContain('no pages extracted');
      });

      /**
       * ⭐ THE DISCRIMINATOR, and this arm is the reason the count exists at
       *    all. drop the check (:219) and the loop on :369 iterates over an
       *    UNMATCHED GLOB — bash hands the literal `.../page-*.png` to base64,
       *    which fails, and `set -e` ends the run at exit 1 with a base64 error
       *    on stderr and NO `blocked` line anywhere.
       *
       * ⚠️ exit 1 either way. the exclusion is what proves the skill refused on
       *    its own terms rather than tripped over a filename.
       */
      then('⭐ and it refuses on its own terms, not on a glob', () => {
        const scene = genScene({ stands });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.stdout).toContain('blocked');
        expect(outcome.stderr).not.toContain('page-*.png');
      });
    });
  });

  given('[case13] the Vision response arms', () => {
    when('[t0] the project has no billing enabled', () => {
      const visionBody = JSON.stringify({
        error: {
          code: 403,
          message: 'This API method requires billing to be enabled.',
          details: [
            {
              reason: 'BILLING_DISABLED',
              metadata: { consoleUrl: 'https://console.probe.invalid/billing' },
            },
          ],
        },
      });

      then('it blocks as a CONSTRAINT and hands over the console url', () => {
        const scene = genScene({ visionBody, visionCode: '403' });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stderr).toContain('billing not enabled');
        expect(outcome.stderr).toContain(
          'https://console.probe.invalid/billing',
        );
      });

      /**
       * ⭐ THE DISCRIMINATOR. drop the BILLING_DISABLED branch (:260) and the
       *    same reply falls to the generic HTTP handler four lines down, which
       *    blocks at EXIT 1 with `Vision API error (HTTP 403)` and no console
       *    url at all.
       *
       * ⚠️ the difference is the whole value of the branch: a billing lapse is
       *    a CONSTRAINT the operator can clear in one click, and the generic
       *    path reports it as a MALFUNCTION with a bare status code.
       */
      then('⭐ and it is NOT flattened into a generic API error', () => {
        const scene = genScene({ visionBody, visionCode: '403' });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.stderr).not.toContain('Vision API error');
      });
    });

    when('[t1] the API returns some other http error', () => {
      const visionBody = JSON.stringify({
        error: { code: 429, message: 'probe: quota exhausted' },
      });

      then(
        'it blocks as a MALFUNCTION, with the status and the message',
        () => {
          const scene = genScene({ visionBody, visionCode: '429' });
          const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
          expect(outcome.exitCode).toBe(1);
          expect(outcome.stderr).toContain('Vision API error (HTTP 429)');
          expect(outcome.stderr).toContain('probe: quota exhausted');
        },
      );

      /**
       * ⭐ THE DISCRIMINATOR, and it is the one that matters most in this file.
       *    drop the http check (:256) and the run reads
       *    `.responses[0].fullTextAnnotation.text // ""` out of an ERROR
       *    payload — which yields the empty string. the page is then emitted
       *    under a correct `## Page 1` header, AT EXIT 0, and cached.
       *
       * ⛔ that is precisely the failure `rule.forbid.hand-transcription` names:
       *    an empty page that reads as "this page is blank" rather than "this
       *    page was never examined" — and the cache makes it PERMANENT.
       */
      then('⭐ and it never emits an empty page over an error payload', () => {
        const scene = genScene({ visionBody, visionCode: '429' });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.stdout).not.toContain('## Page 1');
        expect(fs.existsSync(scene.pdf.replace('.pdf', '.md'))).toBe(false);
      });
    });

    when('[t2] the API accepts the request but fails on the image', () => {
      const visionBody = JSON.stringify({
        responses: [
          { error: { message: 'probe: the image was not readable' } },
        ],
      });

      then('it blocks as a MALFUNCTION and quotes the per-image error', () => {
        const scene = genScene({ visionBody });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.exitCode).toBe(1);
        expect(outcome.stderr).toContain('OCR failed');
        expect(outcome.stderr).toContain('probe: the image was not readable');
      });

      /**
       * ⭐ THE DISCRIMINATOR, and this arm is invisible to the http check above
       *    because the request SUCCEEDED — the reply is a 200. drop the
       *    per-image check (:289) and the text extraction yields "", so the run
       *    emits an empty page at EXIT 0 and caches it.
       *
       * ⚠️ a 200 that carries a per-item error is the hardest shape to notice,
       *    because every transport-level signal says the call went fine.
       */
      then('⭐ and a 200 with an error inside it is not read as text', () => {
        const scene = genScene({ visionBody });
        const outcome = runProbe({ bin: scene.bin, args: [scene.pdf] });
        expect(outcome.stdout).not.toContain('## Page 1');
        expect(fs.existsSync(scene.pdf.replace('.pdf', '.md'))).toBe(false);
      });
    });
  });
});
