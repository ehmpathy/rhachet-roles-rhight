import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the pdf.redact skill
 * .why  = verify deterministic SSN masks over stdin and files, that
 *         the full value is masked (no digits kept — last 4 is still
 *         sensitive PII), that bare 9-digit ids (EINs) are left intact,
 *         and that constraints failfast.
 */

const scriptPath = path.join(__dirname, 'pdf.redact.sh');

const UTF8 = 'utf-8' as const;

// build a deterministic text-based PDF with an SSN via ps2pdf
const genPdfWithSsn = (input: { into: string; ssn: string }): void => {
  const ps = [
    '%!PS',
    '/Helvetica findfont 12 scalefont setfont',
    '72 720 moveto',
    `(owner SSN ${input.ssn} holds 100 percent) show`,
    '72 700 moveto',
    '(gross assets 0 end of year) show',
    'showpage',
  ].join('\n');
  const psPath = `${input.into}.ps`;
  fs.writeFileSync(psPath, ps);
  const res = spawnSync('ps2pdf', [psPath, input.into], { encoding: UTF8 });
  if (res.status !== 0) {
    throw new Error(`ps2pdf failed to build pdf fixture: ${res.stderr}`);
  }
};

// extract the text layer of a PDF (to prove the SSN is gone)
const pdfText = (pdfPath: string): string => {
  const res = spawnSync('pdftotext', [pdfPath, '-'], { encoding: UTF8 });
  return res.stdout ?? '';
};

/**
 * ⛔ THE TEXT-LAYER CHECK IS VACUOUS ON A REDACTED PDF.
 *
 * step 1 of `redact_ssn_pdf` rasterizes every page — which destroys the
 * text layer outright — and it does so BEFORE step 3 paints any box. so
 * `pdfText(out)` returns '' whether or not a single box ever landed, and
 * every `not.toContain` over it is satisfied trivially, forever.
 *
 * measured 2026-09-02: `paint_box() { return 0; }` — no box painted at
 * all, the SSN plainly legible in the output pixels — left this suite at
 * **37 passed, 0 failed**.
 *
 * the skill's own rule says exactly this:
 *   `rule.require.deterministic-redaction` —
 *   "on a rasterized output this is nearly free and proves little …
 *    the render is the one that carries the weight."
 *
 * the two operations below implement that second check.
 */
const PROBE_DPI = 100; // independent of the skill's own DPI (200)

/**
 * .what = the page size of a rendered png, back in PostScript points
 *
 * .why  = ⚠️ the page height is NOT a constant to assume. a first pass here
 *         hardcoded 792 (US Letter) and every band came back at a mean of
 *         exactly 1.0 — pure white — INCLUDING the source bands that hold
 *         the fixture's own text. this ghostscript emits a different paper
 *         size, so the flip below landed ~70px into the top margin.
 *
 *         that is the whole argument for a positive control: without one,
 *         a wrong band reads as "no ink here", which is indistinguishable
 *         from a redaction that worked.
 */
const pageGeomPt = (png: string): { w: number; h: number } => {
  const res = spawnSync('convert', [png, '-format', '%w %h', 'info:'], {
    encoding: UTF8,
  });
  const parts = (res.stdout ?? '').trim().split(/\s+/).map(Number);
  const w = parts[0];
  const h = parts[1];
  if (
    w === undefined ||
    h === undefined ||
    !Number.isFinite(w) ||
    !Number.isFinite(h)
  ) {
    throw new Error(`convert gave no geometry: "${res.stdout}" ${res.stderr}`);
  }
  return { w: (w * 72) / PROBE_DPI, h: (h * 72) / PROBE_DPI };
};

/** rasterize page 1 of a pdf to a png; returns the png path */
const renderPage1 = (input: { pdf: string; into: string }): string => {
  const res = spawnSync(
    'pdftoppm',
    [
      '-r',
      String(PROBE_DPI),
      '-png',
      '-f',
      '1',
      '-l',
      '1',
      input.pdf,
      input.into,
    ],
    { encoding: UTF8 },
  );
  if (res.status !== 0) {
    throw new Error(`pdftoppm failed on ${input.pdf}: ${res.stderr}`);
  }
  const dir = path.dirname(input.into);
  const stem = path.basename(input.into);
  const hit = fs
    .readdirSync(dir)
    .find((f) => f.startsWith(`${stem}-`) && f.endsWith('.png'));
  if (!hit) throw new Error(`no page png produced for ${input.pdf}`);
  return path.join(dir, hit);
};

/**
 * .what = mean brightness (0 = black … 1 = white) of a horizontal band of
 *         a rendered page, addressed in the fixture's OWN PostScript
 *         coordinates (bottom-left origin, flipped here to image rows).
 *
 * .why  = ⚠️ the band is derived from the PostScript the fixture was built
 *         from — deliberately NOT from `pdftotext -bbox`, which is the very
 *         instrument the skill uses to place its box. a verification that
 *         reuses the edit's matcher inherits the edit's blind spot, so a
 *         scale or origin error would be replicated rather than caught.
 */
const bandMean = (input: {
  png: string;
  psTop: number;
  psBottom: number;
}): number => {
  const pageH = pageGeomPt(input.png).h;
  const top = Math.round(((pageH - input.psTop) * PROBE_DPI) / 72);
  const bottom = Math.round(((pageH - input.psBottom) * PROBE_DPI) / 72);
  const height = bottom - top;
  if (height < 1) {
    throw new Error(`empty band: ps ${input.psTop}..${input.psBottom}`);
  }
  // x window 60pt..260pt — wide enough to hold the whole fixture line,
  // narrow enough that a painted box is a large share of the crop.
  const x = Math.round((60 * PROBE_DPI) / 72);
  const width = Math.round((200 * PROBE_DPI) / 72);
  const res = spawnSync(
    'convert',
    [
      input.png,
      '-crop',
      `${width}x${height}+${x}+${top}`,
      '+repage',
      '-colorspace',
      'Gray',
      '-format',
      '%[fx:mean]',
      'info:',
    ],
    { encoding: UTF8 },
  );
  const mean = Number(res.stdout);
  if (!Number.isFinite(mean)) {
    throw new Error(`convert gave no mean: "${res.stdout}" ${res.stderr}`);
  }
  return mean;
};

const runSkill = (input: {
  args: string[];
  stdin?: string;
  path?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    input: input.stdin ?? '',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: input.path ? { ...process.env, PATH: input.path } : process.env,
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * .what = the binaries the skill needs to REACH its tool guard at all —
 *         every name bash itself reaches for before `check_pdf_tools` runs.
 *
 * .why  = these are support, never the subject. the subject of a tool-absence
 *         case is one of pdftoppm / pdftotext / convert, and it is named by
 *         its ABSENCE from the allow list below.
 */
const SUPPORT_BINS = [
  'bash',
  'sed',
  'awk',
  'tr',
  'wc',
  'rm',
  'mktemp',
  'cat',
  'dirname',
  'basename',
  'env',
  'sort',
  'head',
  'uname',
];

/**
 * .what = a directory that becomes the WHOLE PATH: it holds the support
 *         binaries plus exactly the tools named in `allow`, and no others.
 *
 * .why  = ⛔ A PATH PREPEND CAN ONLY ADD. to prove that a tool-absence guard
 *         bites, the tool has to be UNREACHABLE — so the PATH is REPLACED,
 *         not extended, and every binary the skill touches on the way to the
 *         guard is linked in by hand.
 *
 *         (the same lesson as `notary.find`'s jq case: a shim that prepends
 *         can make a tool appear, and can never make one vanish.)
 *
 * ⚠️ a real path is resolved for each name and symlinked. a name with no
 *    binary on the host is skipped rather than faked — a fake would be a
 *    second defect wearing the fixture's clothes.
 */
const genAllowlistBin = (input: { into: string; allow: string[] }): string => {
  fs.mkdirSync(input.into, { recursive: true });
  for (const tool of [...SUPPORT_BINS, ...input.allow]) {
    const res = spawnSync('which', [tool], { encoding: UTF8 });
    const real = (res.stdout ?? '').trim();
    if (!real) continue;
    const link = path.join(input.into, tool);
    if (!fs.existsSync(link)) fs.symlinkSync(real, link);
  }
  return input.into;
};

describe('pdf.redact.sh', () => {
  const tmp = useBeforeAll(async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-redact-'));
    return { dir };
  });

  given('[case1] text with a dash-separated SSN on stdin', () => {
    when('[t0] redacted with --what ssn', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--what', 'ssn'],
          stdin: 'owner SSN 666-12-3456 holds 100%',
        }),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the full SSN is masked with no digits kept', () => {
        expect(result.stdout).toContain('***-**-****');
        expect(result.stdout).not.toContain('666-12-3456');
        expect(result.stdout).not.toContain('3456');
      });

      then('adjacent text is preserved', () => {
        expect(result.stdout).toContain('owner SSN');
        expect(result.stdout).toContain('holds 100%');
      });

      then('stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case2] text with a space-separated SSN', () => {
    when('[t0] redacted', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--what', 'ssn'], stdin: 'id 666 12 3456 end' }),
      );

      then('it masks the space-separated form too', () => {
        expect(result.stdout).toContain('***-**-****');
        expect(result.stdout).not.toContain('666 12 3456');
        expect(result.stdout).not.toContain('3456');
      });

      then('stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case3] text with a bare 9-digit EIN (no separators)', () => {
    when('[t0] redacted', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--what', 'ssn'], stdin: 'EIN 123456789 stays' }),
      );

      then('the EIN is left intact (not an SSN pattern)', () => {
        expect(result.stdout).toContain('123456789');
      });

      then('stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case4] a file input with multiple SSNs', () => {
    const scene = useBeforeAll(async () => {
      const src = path.join(tmp.dir, 'doc.md');
      fs.writeFileSync(
        src,
        'first 111-22-3333 line\nsecond 444-55-6666 line\n',
      );
      const out = path.join(tmp.dir, 'doc.redacted.md');
      return { src, out };
    });

    when('[t0] redacted from file into file', () => {
      const written = useBeforeAll(async () => {
        const result = runSkill({
          args: ['--what', 'ssn', '--from', scene.src, '--into', scene.out],
        });
        if (result.exitCode !== 0) {
          throw new Error(`skill failed: ${result.stdout} ${result.stderr}`);
        }
        return { md: fs.readFileSync(scene.out, UTF8), stdout: result.stdout };
      });

      then('all SSNs in the file are masked with no digits kept', () => {
        expect(written.md).toContain('***-**-****');
        expect(written.md).not.toContain('111-22-3333');
        expect(written.md).not.toContain('444-55-6666');
        expect(written.md).not.toContain('3333');
        expect(written.md).not.toContain('6666');
      });

      then('the summary reports the redaction', () => {
        expect(written.stdout).toContain('pdf.redact');
        expect(written.stdout).toContain('ssn');
      });

      then('the redacted file content matches snapshot', () => {
        expect(written.md).toMatchSnapshot();
      });

      then('the summary stdout matches snapshot', () => {
        // the tmp path varies per run; strip it for a stable snapshot.
        // split/join, not .replace: this readout carries the tmp path TWICE
        // (--from and --into), and a string-pattern .replace stabilizes only
        // the first — which churned this snapshot on every single run.
        // (split/join rather than replaceAll: tsconfig lib predates es2021.)
        const stable = written.stdout.split(tmp.dir).join('<tmp>');
        expect(stable).toMatchSnapshot();
      });
    });
  });

  given('[case5] no --what provided', () => {
    when('[t0] invoked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], stdin: '666-12-3456' }),
      );

      then('it blocks with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no target given');
      });

      then('the blocked stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case6] an unsupported --what', () => {
    when('[t0] invoked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--what', 'phone'], stdin: 'x' }),
      );

      then('it blocks with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unsupported --what');
      });

      then('the blocked stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case7] a PDF that contains an SSN', () => {
    const scene = useBeforeAll(async () => {
      // failfast: pdf mode depends on ps2pdf + poppler + imagemagick
      for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
        if (spawnSync('which', [tool]).status !== 0) {
          throw new Error(`${tool} required for pdf-mode test`);
        }
      }
      const src = path.join(tmp.dir, 'return.pdf');
      const out = path.join(tmp.dir, 'return.redacted.pdf');
      genPdfWithSsn({ into: src, ssn: '666-12-3456' });
      return { src, out };
    });

    when('[t0] before redaction', () => {
      then('the source PDF text layer contains the SSN', () => {
        expect(pdfText(scene.src)).toContain('666-12-3456');
      });
    });

    when('[t1] redacted via pdf mode', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--what', 'ssn', '--from', scene.src, '--into', scene.out],
        }),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('an output PDF is produced', () => {
        expect(fs.existsSync(scene.out)).toBe(true);
      });

      then('the SSN is gone from the output text layer', () => {
        const text = pdfText(scene.out);
        expect(text).not.toContain('666-12-3456');
        expect(text).not.toContain('3456');
      });

      then('the summary reports pdf mode with one box', () => {
        expect(result.stdout).toContain('pdf (cover + flatten)');
        expect(result.stdout).toContain('boxes: 1');
      });
    });
  });

  given('[case8] a PDF input but a non-pdf --into', () => {
    const scene = useBeforeAll(async () => {
      const src = path.join(tmp.dir, 'return2.pdf');
      genPdfWithSsn({ into: src, ssn: '666-12-3456' });
      return { src };
    });

    when('[t0] redacted with a .md output', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--what',
            'ssn',
            '--from',
            scene.src,
            '--into',
            path.join(tmp.dir, 'wrong.md'),
          ],
        }),
      );

      then('it blocks with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('pdf mode requires --into');
      });
    });
  });

  given('[case9] a PDF redacted with the caution-tape style', () => {
    const scene = useBeforeAll(async () => {
      for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
        if (spawnSync('which', [tool]).status !== 0) {
          throw new Error(`${tool} required for tape-style test`);
        }
      }
      const src = path.join(tmp.dir, 'tape.pdf');
      const out = path.join(tmp.dir, 'tape.redacted.pdf');
      genPdfWithSsn({ into: src, ssn: '666-12-3456' });
      return { src, out };
    });

    when('[t0] redacted with --style tape', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--what',
            'ssn',
            '--from',
            scene.src,
            '--into',
            scene.out,
            '--style',
            'tape',
          ],
        }),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('an output PDF is produced', () => {
        expect(fs.existsSync(scene.out)).toBe(true);
      });

      then('the SSN is still gone from the output text layer', () => {
        const text = pdfText(scene.out);
        expect(text).not.toContain('666-12-3456');
        expect(text).not.toContain('3456');
      });

      then('the summary reports the tape style', () => {
        expect(result.stdout).toContain('style: tape');
        expect(result.stdout).toContain('boxes: 1');
      });
    });
  });

  given('[case10] an unsupported --style', () => {
    when('[t0] invoked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--what', 'ssn', '--style', 'rainbow'], stdin: 'x' }),
      );

      then('it blocks with a constraint exit code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unsupported --style');
      });

      then('the blocked stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given(
    '[case11] a PDF with a name + SSN, redacted via --what + --text',
    () => {
      const scene = useBeforeAll(async () => {
        for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
          if (spawnSync('which', [tool]).status !== 0) {
            throw new Error(`${tool} required for text-redact test`);
          }
        }
        const src = path.join(tmp.dir, 'named.pdf');
        const out = path.join(tmp.dir, 'named.redacted.pdf');
        // a PDF that carries both a name and an SSN.
        //
        // the name is our canonical synthetic founder, EAGLE OF'RHIGHT, with
        // the apostrophe dropped ON PURPOSE: PostScript StandardEncoding maps
        // 0x27 to `quoteright`, so ps2pdf would render ' as ’ and pdftotext
        // would hand back U+2019 — a mismatch that has nothing to do with
        // redaction. keep the fixture ASCII so a failure means a real defect.
        const ps = [
          '%!PS',
          '/Helvetica findfont 12 scalefont setfont',
          '72 720 moveto',
          '(EAGLE OFRHIGHT owner) show',
          '72 700 moveto',
          '(SSN 666-12-3456 gross assets 0) show',
          'showpage',
        ].join('\n');
        const psPath = `${src}.ps`;
        fs.writeFileSync(psPath, ps);
        const res = spawnSync('ps2pdf', [psPath, src], { encoding: UTF8 });
        if (res.status !== 0) {
          throw new Error(`ps2pdf failed: ${res.stderr}`);
        }
        return { src, out };
      });

      when('[t0] before redaction', () => {
        then('the source contains both the name and the SSN', () => {
          const text = pdfText(scene.src);
          expect(text).toContain('OFRHIGHT');
          expect(text).toContain('666-12-3456');
        });
      });

      when('[t1] redacted with --what ssn --text the name', () => {
        const result = useBeforeAll(async () =>
          runSkill({
            args: [
              '--what',
              'ssn',
              '--text',
              'EAGLE OFRHIGHT',
              '--from',
              scene.src,
              '--into',
              scene.out,
              '--style',
              'tape',
            ],
          }),
        );

        then('it succeeds', () => {
          expect(result.exitCode).toBe(0);
        });

        then(
          'both the name and the SSN are gone from the output text layer',
          () => {
            // note: flatten rasterizes every page, so NO text is extractable;
            // the redacted terms are covered visually AND absent as text
            const text = pdfText(scene.out);
            expect(text).not.toContain('666-12-3456');
            expect(text).not.toContain('EAGLE');
            expect(text).not.toContain('OFRHIGHT');
          },
        );
      });
    },
  );

  given('[case12] --text without a pdf source', () => {
    when('[t0] invoked in text mode', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--text', 'JOHN DOE'], stdin: 'JOHN DOE here' }),
      );

      then('it blocks (—text is pdf-mode only)', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--text requires --from');
      });
    });
  });

  /**
   * .why = ⭐ THE CHECK THAT CARRIES THE WEIGHT. every other pdf-mode case
   *        above reads the TEXT LAYER, which step 1 destroys before step 3
   *        paints — so all of them stay green over an output whose SSN is
   *        plainly legible. this case reads the PIXELS.
   *
   *        two bands, 320pt apart, and the pair is what discriminates:
   *          - the SSN band MUST go dark  → a box landed on the value
   *          - the control band MUST NOT  → the box landed only there
   *
   *        the second half is not decoration. a y-origin flip, an off-by-a-
   *        page-height, or a bbox/DPI scale error all still darken *some*
   *        band, so a lone "something changed" assertion accepts a box
   *        painted over the wrong content.
   */
  given(
    '[case13] a PDF whose PIXELS must be checked, not its text layer',
    () => {
      const scene = useBeforeAll(async () => {
        for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
          if (spawnSync('which', [tool]).status !== 0) {
            throw new Error(`${tool} required for the pixel-check test`);
          }
        }
        const src = path.join(tmp.dir, 'pixels.pdf');
        const out = path.join(tmp.dir, 'pixels.redacted.pdf');
        // each line sits ALONE on its row, and the rows are 320pt apart, so
        // the two bands cannot overlap and one box cannot darken both.
        const ps = [
          '%!PS',
          '/Helvetica findfont 12 scalefont setfont',
          '72 720 moveto',
          '(666-12-3456) show',
          '72 400 moveto',
          '(gross assets 0) show',
          'showpage',
        ].join('\n');
        const psPath = `${src}.ps`;
        fs.writeFileSync(psPath, ps);
        const res = spawnSync('ps2pdf', [psPath, src], { encoding: UTF8 });
        if (res.status !== 0) throw new Error(`ps2pdf failed: ${res.stderr}`);
        return { src, out };
      });

      when('[t0] rendered before and after redaction', () => {
        const bands = useBeforeAll(async () => {
          const result = runSkill({
            args: ['--what', 'ssn', '--from', scene.src, '--into', scene.out],
          });
          if (result.exitCode !== 0) {
            throw new Error(`skill failed: ${result.stdout} ${result.stderr}`);
          }
          const srcPng = renderPage1({
            pdf: scene.src,
            into: path.join(tmp.dir, 'pixels-src'),
          });
          const outPng = renderPage1({
            pdf: scene.out,
            into: path.join(tmp.dir, 'pixels-out'),
          });
          const ssn = { psTop: 734, psBottom: 712 };
          const ctl = { psTop: 414, psBottom: 392 };
          return {
            srcSsn: bandMean({ png: srcPng, ...ssn }),
            srcCtl: bandMean({ png: srcPng, ...ctl }),
            outSsn: bandMean({ png: outPng, ...ssn }),
            outCtl: bandMean({ png: outPng, ...ctl }),
          };
        });

        /**
         * ⚠️ THE POSITIVE CONTROL, AND IT IS NOT OPTIONAL.
         *
         * every decisive assertion below is about a band going DARK. a band
         * that was never rendered is pure white, so "no ink here" and "the
         * redaction worked" are the same number — and a wrong band reads as
         * a pass on both halves at once.
         *
         * measured 2026-09-02: a first pass hardcoded a 792pt page height and
         * every band came back at exactly 1.0, this one included. that is how
         * the geometry bug was found.
         */
        then(
          'the source page HAS ink in both bands — the probe is aimed',
          () => {
            expect(bands.srcSsn).toBeLessThan(0.99);
            expect(bands.srcCtl).toBeLessThan(0.99);
          },
        );

        /**
         * .why = ⭐ the half no text-layer check can make. step 1 rasterizes,
         *        so `pdftotext(out)` is empty whether or not a box landed —
         *        only the pixels can say that one did.
         *
         *        measured: 0.9576 → 0.8408, a drop of ~0.117.
         *
         *        ✅ PROVEN to bite, alone. `paint_box() { return 0; }` — no box
         *        painted anywhere — left this at `outSsn 0.957038` against
         *        `srcSsn 0.957601`, so THIS assertion went red and the other 39
         *        stayed green. the SSN was plainly legible in the output.
         */
        then('the SSN band went materially DARKER — a box landed on it', () => {
          expect(bands.outSsn).toBeLessThan(bands.srcSsn - 0.05);
        });

        /**
         * .why = ⭐ the discriminator. the assertion above accepts ANY box
         *        that darkens that band — including one placed there by a
         *        y-origin flip, an off-by-a-page-height, or a bbox/DPI scale
         *        error that happens to land near the top of the page.
         *
         *        this one says the box landed ONLY there. a redaction that
         *        covers the wrong content is a redaction that failed, and it
         *        is invisible to a lone "something changed" check.
         *
         *        ✅ PROVEN to bite, ALONE, on a DIFFERENT wrong fix than the
         *        one above. `y2=$((y2 + 889))` — a box over-padded downward by
         *        320pt, the "pad it generously to be safe" error — still covers
         *        the SSN, so the assertion above stays GREEN, and every one of
         *        the other 39 tests in this file stays green too. only THIS one
         *        went red: `|outCtl - srcCtl| = 0.161`, expected < 0.01.
         *
         *        ⚠️ a first attempt used a whole-page box, which CRASHED the
         *        skill (`no images defined hazard_banner.png`) and reddened 10
         *        tests. that is a malfunction, not a misplaced box, so it says
         *        none about this assertion. the probe has to leave the skill
         *        working and only move the ink.
         */
        then('the control band 320pt away is UNTOUCHED', () => {
          expect(Math.abs(bands.outCtl - bands.srcCtl)).toBeLessThan(0.01);
        });
      });
    },
  );

  /**
   * .why = ⭐ THE PIXEL CHECK, POINTED AT `--text`. [case13] above built the
   *        band probe and aimed it at `--what ssn`. `--text` never got one.
   *
   *        so `--text` was exercised by exactly one case — [case11] — whose
   *        two substantive assertions are `exitCode === 0` and
   *        `pdfText(out)` without the name in it. the second is the VACUOUS
   *        channel this file's own header at the top documents: step 1
   *        rasterizes before step 3 paints, so that extract is empty
   *        whether or not a box ever landed.
   *
   * ⛔ the consequence: drop every text-term box on the floor and [case11]
   *    stays green on both halves, at exit 0, over an output whose name is
   *    plainly legible. leak 4, alive inside the file that named it.
   *
   * ⚠️ this case passes NO `--what`, so it is also the only coverage of the
   *    text-only target path — the branch where `targets` carries no
   *    `ssn +` prefix.
   */
  given('[case14] a PDF redacted by --text alone, checked in PIXELS', () => {
    const scene = useBeforeAll(async () => {
      for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
        if (spawnSync('which', [tool]).status !== 0) {
          throw new Error(`${tool} required for the text pixel-check test`);
        }
      }
      const src = path.join(tmp.dir, 'textpixels.pdf');
      const out = path.join(tmp.dir, 'textpixels.redacted.pdf');
      // 320pt apart, per [case13] — one box cannot darken both bands.
      // ASCII only: ps2pdf maps 0x27 to quoteright, so the apostrophe is
      // dropped from the canonical synthetic founder on purpose.
      const ps = [
        '%!PS',
        '/Helvetica findfont 12 scalefont setfont',
        '72 720 moveto',
        '(EAGLE OFRHIGHT) show',
        '72 400 moveto',
        '(gross assets 0) show',
        'showpage',
      ].join('\n');
      const psPath = `${src}.ps`;
      fs.writeFileSync(psPath, ps);
      const res = spawnSync('ps2pdf', [psPath, src], { encoding: UTF8 });
      if (res.status !== 0) throw new Error(`ps2pdf failed: ${res.stderr}`);
      return { src, out };
    });

    when('[t0] redacted with --text and no --what', () => {
      const seen = useBeforeAll(async () => {
        const result = runSkill({
          args: [
            '--text',
            'EAGLE OFRHIGHT',
            '--from',
            scene.src,
            '--into',
            scene.out,
          ],
        });
        if (result.exitCode !== 0) {
          throw new Error(`skill failed: ${result.stdout} ${result.stderr}`);
        }
        const srcPng = renderPage1({
          pdf: scene.src,
          into: path.join(tmp.dir, 'textpixels-src'),
        });
        const outPng = renderPage1({
          pdf: scene.out,
          into: path.join(tmp.dir, 'textpixels-out'),
        });
        const name = { psTop: 734, psBottom: 712 };
        const ctl = { psTop: 414, psBottom: 392 };
        return {
          stdout: result.stdout,
          srcName: bandMean({ png: srcPng, ...name }),
          srcCtl: bandMean({ png: srcPng, ...ctl }),
          outName: bandMean({ png: outPng, ...name }),
          outCtl: bandMean({ png: outPng, ...ctl }),
        };
      });

      // ⚠️ the positive control, per [case13]: an UNRENDERED band is pure
      //    white, so "no ink here" and "the redaction worked" are the same
      //    number. without this, a wrong band passes both halves at once.
      then('the source page HAS ink in both bands — the probe is aimed', () => {
        expect(seen.srcName).toBeLessThan(0.99);
        expect(seen.srcCtl).toBeLessThan(0.99);
      });

      then('the NAME band went materially DARKER — a box landed on it', () => {
        expect(seen.outName).toBeLessThan(seen.srcName - 0.05);
      });

      // ⭐ the discriminator. the assertion above accepts ANY box that
      //    darkens that band — even one placed by an origin flip or a
      //    scale error. this one says the box landed ONLY there.
      then('the control band 320pt away is UNTOUCHED', () => {
        expect(Math.abs(seen.outCtl - seen.srcCtl)).toBeLessThan(0.01);
      });

      /**
       * .why = the report channel, which [case11] reads not at all.
       *
       *        `boxes: 2` is not incidental — a phrase is matched WORD-WISE
       *        (usage: "each word of the phrase is matched
       *        case-insensitively"), so a two-word phrase yields two boxes.
       *        a matcher rewritten to seek the whole phrase would emit 1,
       *        or 0, and every pixel assertion above could still pass.
       */
      then('the report names the text target and counts a box per word', () => {
        expect(seen.stdout).toContain('what: 1 text phrase(s)');
        expect(seen.stdout).toContain('boxes: 2');
        // ⛔ no --what was passed; the target line must not claim one
        expect(seen.stdout).not.toContain('ssn');
      });
    });
  });

  /**
   * .why = ⭐ THE ARM WALK. every case above starts from an assertion that
   *        already exists. the cases below start from the SKILL: each arm of
   *        `parse_args`, `validate`, and `redact_ssn_pdf` was enumerated and
   *        asked "which case reaches this line?" — the ones below are the
   *        arms whose answer was NONE.
   *
   *        (`rule.require.assertions-that-discriminate`, leak 5 shape 1. it
   *        is invisible from any read of the test file, because the defect
   *        is the ABSENCE of a case rather than a weak assertion.)
   */

  /**
   * .why = ⛔ `--help` IS AN OUTPUT MODE WITH ZERO ASSERTIONS.
   *
   *        it exits 0 with an empty stderr, so no automated signal can
   *        report it broken. two other skills in this repo shipped a
   *        `--help` that printed the bare line `!/usr/bin/env bash` and
   *        nobody noticed, because a surface that cannot fail loudly is
   *        exactly the surface that needs an assertion.
   *
   * ⚠️ `-h` shares the arm. a clamp on `--help` alone leaves the alias
   *    uncovered — and this skill's catch-all is `-*)`, so a dead `-h`
   *    lands on "unknown option: -h" at exit 2.
   */
  given('[case15] the help text', () => {
    when('[t0] --help is passed', () => {
      const result = useBeforeAll(async () => runSkill({ args: ['--help'] }));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      /**
       * ⭐ the assertions below read the BODY of the usage block, not the
       *    fact that stdout is non-empty. a renderer that emits one stray
       *    line is non-empty too.
       */
      then('it teaches every flag the parser accepts', () => {
        expect(result.stdout).toContain('--what KIND');
        expect(result.stdout).toContain('--text PHRASE');
        expect(result.stdout).toContain('--from FILE');
        expect(result.stdout).toContain('--into FILE');
        expect(result.stdout).toContain('--style STYLE');
      });

      then('it states the pdf-mode constraint the parser enforces', () => {
        expect(result.stdout).toContain('pdf mode requires --from *.pdf');
      });

      // ⛔ the observed failure mode on two neighbor skills: a shebang line
      //    rendered as the whole help body.
      then('it does NOT render the shebang', () => {
        expect(result.stdout).not.toContain('/usr/bin/env bash');
      });
    });

    when('[t1] help is requested by its -h alias', () => {
      const result = useBeforeAll(async () => runSkill({ args: ['-h'] }));

      then('it renders the same help --help does', () => {
        const long = runSkill({ args: ['--help'] });
        expect(result.stdout).toEqual(long.stdout);
      });

      // ⭐ the discriminator. drop `-h` from the arm and it falls to `-*)`,
      //    which refuses at exit 2 and echoes the token back.
      then('⭐ it is not refused as an unknown option', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain('unknown option');
      });
    });
  });

  /**
   * .why = rhachet prepends `--skill`, `--repo`, `--role` to every invocation
   *        it drives. the arm that consumes them has no case.
   *
   * ⭐ AND THE HARM IS LOUD HERE, which is not portable. this skill's
   *    catch-all is `-*)` at exit 2, so a dead passthrough arm BLOCKS every
   *    rhachet-driven run. the `pii.scan` dispatcher one role over has no
   *    `-*` arm at all and appends the unknown token to a passthru array —
   *    the identical defect, silent, at exit 0.
   *
   *    so the clamp cannot be lifted from a neighbor: what a dead arm does
   *    is decided by the catch-all, and the catch-all differs per skill.
   */
  given('[case16] rhachet passes --skill / --repo / --role', () => {
    when('[t0] the flags are prepended to a real text redaction', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--skill',
            'pdf.redact',
            '--repo',
            'rhight',
            '--role',
            'transcriber',
            '--what',
            'ssn',
          ],
          stdin: 'owner SSN 666-12-3456 end',
        }),
      );

      then('it succeeds — the flags are consumed, not refused', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the redaction still happened', () => {
        expect(result.stdout).toContain('***-**-****');
        expect(result.stdout).not.toContain('666-12-3456');
      });

      // ⭐ neither the flag nor its value may be echoed back as a refusal
      then('⭐ no flag or value is echoed as unknown', () => {
        expect(result.stdout).not.toContain('unknown option');
        expect(result.stdout).not.toContain('unexpected argument');
        expect(result.stdout).not.toContain('transcriber');
      });
    });
  });

  /**
   * .why = ⭐ TWO CATCH-ALLS, TWO MESSAGES, AND A CLAMP MUST NAME THE RIGHT
   *        ONE. `-*)` says "unknown option"; `*)` says "unexpected
   *        argument". neither had a case.
   *
   * ⛔ a bare `toContain('blocked')` cannot tell them apart, and the two
   *    describe opposite operator errors — a mistyped FLAG versus a
   *    stray POSITIONAL. so each assertion below is paired with the
   *    exclusion of its twin.
   */
  given('[case17] arguments the parser must refuse', () => {
    when('[t0] an unknown OPTION is passed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--what', 'ssn', '--bogus'], stdin: 'x' }),
      );

      then('it blocks as a constraint', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the option arm, not the positional arm', () => {
        expect(result.stdout).toContain('unknown option: --bogus');
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });

    when('[t1] a stray POSITIONAL is passed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--what', 'ssn', 'stray.md'], stdin: 'x' }),
      );

      then('it blocks as a constraint', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the positional arm, not the option arm', () => {
        expect(result.stdout).toContain('unexpected argument: stray.md');
        expect(result.stdout).not.toContain('unknown option');
      });
    });
  });

  /**
   * .why = `validate`'s file-not-found guard had no case, and it is the one
   *        an operator hits most: a typo in `--from`.
   *
   * ⭐ THE LEAK-6 CHECK. this arm exits 2. the un-guarded path would reach
   *    `redact_ssn_text < "$FROM_PATH"`, where bash's own redirection
   *    failure aborts at exit 1 — a DIFFERENT code. so here the code does
   *    discriminate, and both halves are asserted.
   */
  given('[case18] a --from path that is not on disk', () => {
    when('[t0] the skill is pointed at it', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--what', 'ssn', '--from', path.join(tmp.dir, 'absent.md')],
        }),
      );

      then('it blocks as a CONSTRAINT — the operator must fix the path', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the path it could not open', () => {
        expect(result.stdout).toContain('file not found');
        expect(result.stdout).toContain('absent.md');
      });

      then('it does NOT emit a redaction report over an absent input', () => {
        expect(result.stdout).not.toContain('into:');
      });
    });
  });

  /**
   * .why = ⛔ `--style solid` IS HALF OF `paint_box` AND HAD ZERO COVERAGE.
   *        [case9] exercises `tape`; the `else` branch was never run by any
   *        case, in any file.
   *
   * ⭐ AND A TEXT-LAYER CHECK CANNOT SEE THE DIFFERENCE — both styles
   *    rasterize, so `pdfText(out)` is empty either way (leak 4, per this
   *    file's own header). the two styles differ ONLY in pixels.
   *
   * ⭐ THE DISCRIMINATOR IS A WITHIN-RUN COMPARISON, not a threshold. the
   *    band window is 200pt wide and the painted box is far narrower, so an
   *    absolute "is it black enough" number depends on page geometry and
   *    proves little. instead the SAME fixture is redacted twice:
   *
   *      solid = an opaque black rectangle           -> darkest possible
   *      tape  = the same black base, then a banner
   *              of white stripes and a white label  -> strictly lighter
   *
   *    so `solid < tape` over the same band is a property of what the two
   *    branches actually paint, and a `--style solid` that silently fell
   *    through to the tape branch could not satisfy it.
   */
  given('[case19] the two --style branches, compared in PIXELS', () => {
    const scene = useBeforeAll(async () => {
      for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
        if (spawnSync('which', [tool]).status !== 0) {
          throw new Error(`${tool} required for the style pixel-check test`);
        }
      }
      const src = path.join(tmp.dir, 'styles.pdf');
      genPdfWithSsn({ into: src, ssn: '666-12-3456' });
      return { src };
    });

    when('[t0] the same page is redacted solid, then taped', () => {
      const bands = useBeforeAll(async () => {
        const outSolid = path.join(tmp.dir, 'styles.solid.pdf');
        const outTape = path.join(tmp.dir, 'styles.tape.pdf');
        for (const [style, out] of [
          ['solid', outSolid],
          ['tape', outTape],
        ] as const) {
          const res = runSkill({
            args: [
              '--what',
              'ssn',
              '--style',
              style,
              '--from',
              scene.src,
              '--into',
              out,
            ],
          });
          if (res.exitCode !== 0) {
            throw new Error(`${style} run failed: ${res.stdout} ${res.stderr}`);
          }
        }
        const ssn = { psTop: 734, psBottom: 712 };
        const srcPng = renderPage1({
          pdf: scene.src,
          into: path.join(tmp.dir, 'styles-src'),
        });
        const solidPng = renderPage1({
          pdf: outSolid,
          into: path.join(tmp.dir, 'styles-solid'),
        });
        const tapePng = renderPage1({
          pdf: outTape,
          into: path.join(tmp.dir, 'styles-tape'),
        });
        return {
          src: bandMean({ png: srcPng, ...ssn }),
          solid: bandMean({ png: solidPng, ...ssn }),
          tape: bandMean({ png: tapePng, ...ssn }),
        };
      });

      // ⚠️ the positive control, per [case13]: every decisive assertion
      //    below is about a band going DARK, and an unrendered band is pure
      //    white — indistinguishable from a redaction that worked.
      then('the source page HAS ink in the band — the probe is aimed', () => {
        expect(bands.src).toBeLessThan(0.99);
      });

      then('BOTH styles darken the band — a box landed either way', () => {
        expect(bands.solid).toBeLessThan(bands.src - 0.05);
        expect(bands.tape).toBeLessThan(bands.src - 0.05);
      });

      /**
       * ⭐ THE ONE ASSERTION THAT SEPARATES THE TWO BRANCHES. drop the
       *    `if [[ "$STYLE" == "tape" ]]` split — so every run paints the
       *    plain rectangle — and both assertions above stay green while
       *    this one goes red.
       */
      then('⭐ solid is STRICTLY darker than tape — the branch is live', () => {
        expect(bands.solid).toBeLessThan(bands.tape - 0.02);
      });

      then('the report names the style it actually painted', () => {
        const res = runSkill({
          args: [
            '--what',
            'ssn',
            '--style',
            'solid',
            '--from',
            scene.src,
            '--into',
            path.join(tmp.dir, 'styles.solid2.pdf'),
          ],
        });
        expect(res.stdout).toContain('style: solid');
        expect(res.stdout).not.toContain('style: tape');
      });
    });
  });

  /**
   * .why = ⛔ `check_pdf_tools` LOOPS OVER THREE TOOLS AND HAD ZERO COVERAGE.
   *        it is the skill's only dependency guard, and the skill is a
   *        SECURITY skill — a guard that never ran is a redaction that never
   *        ran, reported as one that did.
   *
   * ⭐ A PATH PREPEND CANNOT TEST THIS. a prepend only ADDS; to prove the
   *    guard bites, the tool has to be unreachable, so the whole PATH is
   *    replaced by `genAllowlistBin` and the subject is named by its absence.
   *
   * ⭐ THE LEAK-6 CHECK PASSES HERE. this guard exits 2. with it removed,
   *    control reaches `pdftoppm`, whose failure lands on the exit-1 arm
   *    below — so the CODE does discriminate, unlike the three arms in
   *    [case21]. both the code and the message are asserted.
   */
  given('[case20] a PATH that omits one required pdf tool', () => {
    const scene = useBeforeAll(async () => {
      for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
        if (spawnSync('which', [tool]).status !== 0) {
          throw new Error(`${tool} required for the tool-absence test`);
        }
      }
      const src = path.join(tmp.dir, 'tools.pdf');
      genPdfWithSsn({ into: src, ssn: '666-12-3456' });
      return { src };
    });

    // one `when` per tool: the guard is a loop, and a loop that exits on
    // its first iteration would still satisfy a case built on pdftoppm.
    for (const absent of ['pdftoppm', 'pdftotext', 'convert'] as const) {
      when(`[t0] ${absent} is absent from PATH`, () => {
        const result = useBeforeAll(async () => {
          const allow = (['pdftoppm', 'pdftotext', 'convert'] as const).filter(
            (t) => t !== absent,
          );
          const bin = genAllowlistBin({
            into: path.join(tmp.dir, `bin-no-${absent}`),
            allow: [...allow],
          });
          return runSkill({
            args: [
              '--what',
              'ssn',
              '--from',
              scene.src,
              '--into',
              path.join(tmp.dir, `tools-no-${absent}.pdf`),
            ],
            path: bin,
          });
        });

        then('it blocks as a CONSTRAINT — the operator installs it', () => {
          expect(result.exitCode).toBe(2);
        });

        then(`it names ${absent} and the package that carries it`, () => {
          expect(result.stdout).toContain(`${absent} not found`);
          expect(result.stdout).toContain('poppler-utils');
          expect(result.stdout).toContain('imagemagick');
        });

        // ⛔ the guarantee: it must never answer from a half-run pipeline
        then('⭐ it emits no redaction report', () => {
          expect(result.stdout).not.toContain('redacted,');
          expect(result.stdout).not.toContain('boxes:');
        });
      });
    }

    // ⚠️ THE POSITIVE CONTROL. every assertion above is about a refusal, and
    //    a refusal is satisfied just as well by a PATH so bare that bash
    //    could not run the skill at all. this proves the allowlist itself is
    //    complete — with all three tools linked in, the same PATH succeeds.
    when('[t1] the identical PATH, with all three tools linked in', () => {
      const result = useBeforeAll(async () => {
        const bin = genAllowlistBin({
          into: path.join(tmp.dir, 'bin-complete'),
          allow: ['pdftoppm', 'pdftotext', 'convert'],
        });
        return runSkill({
          args: [
            '--what',
            'ssn',
            '--from',
            scene.src,
            '--into',
            path.join(tmp.dir, 'tools-complete.pdf'),
          ],
          path: bin,
        });
      });

      then('⭐ it redacts cleanly — the shim is otherwise complete', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('boxes: 1');
      });
    });
  });

  /**
   * .why = ⛔ ALL THREE EXIT-1 ARMS OF `redact_ssn_pdf` HAD ZERO COVERAGE —
   *        every refusal path the skill has for a tool that is PRESENT but
   *        FAILS.
   *
   * ⭐ AND ALL THREE ARE LEAK-6 COINCIDENCES. ask the rule's question — what
   *    does the un-guarded path exit with, on this same input?
   *
   *      guard removed from step 1 -> control reaches step 4, whose convert
   *                                   gets an unmatched glob and fails ->
   *                                   exit 1
   *      guard removed from step 2 -> `set -e` aborts on the failed
   *                                   pdftotext                    -> exit 1
   *      guard removed from step 4 -> `set -e` aborts on the failed
   *                                   convert                      -> exit 1
   *
   *    so `expect(exitCode).toBe(1)` is satisfied whether the guard ran or
   *    never existed. the MESSAGE is the only observable that separates
   *    "the guard refused" from "the shell fell over", and each assertion
   *    below therefore excludes the other two messages by name.
   */
  given('[case21] a pdf tool that is present but FAILS', () => {
    const scene = useBeforeAll(async () => {
      for (const tool of ['ps2pdf', 'pdftoppm', 'pdftotext', 'convert']) {
        if (spawnSync('which', [tool]).status !== 0) {
          throw new Error(`${tool} required for the tool-failure test`);
        }
      }
      const withSsn = path.join(tmp.dir, 'fails.pdf');
      genPdfWithSsn({ into: withSsn, ssn: '666-12-3456' });
      // a page with NO ssn: zero boxes, so `paint_box` never runs and the
      // only `convert` call left is step 4's reassembly.
      const noSsn = path.join(tmp.dir, 'fails-nossn.pdf');
      genPdfWithSsn({ into: noSsn, ssn: 'no-id-here' });
      return { withSsn, noSsn };
    });

    /** replace one link in an allowlist bin with a stub that always fails */
    const genFailingTool = (input: { bin: string; tool: string }): void => {
      const at = path.join(input.bin, input.tool);
      if (fs.existsSync(at)) fs.rmSync(at);
      fs.writeFileSync(at, '#!/usr/bin/env bash\nexit 3\n');
      fs.chmodSync(at, 0o755);
    };

    when('[t0] pdftoppm fails to rasterize', () => {
      const result = useBeforeAll(async () => {
        const bin = genAllowlistBin({
          into: path.join(tmp.dir, 'bin-fail-ppm'),
          allow: ['pdftoppm', 'pdftotext', 'convert'],
        });
        genFailingTool({ bin, tool: 'pdftoppm' });
        return runSkill({
          args: [
            '--what',
            'ssn',
            '--from',
            scene.withSsn,
            '--into',
            path.join(tmp.dir, 'fail-ppm.pdf'),
          ],
          path: bin,
        });
      });

      then('it blocks as a MALFUNCTION', () => {
        expect(result.exitCode).toBe(1);
      });

      // ⭐ the code above is a coincidence; this is the discrimination
      then('⭐ it names the RASTERIZE step, not a later one', () => {
        expect(result.stdout).toContain('failed to rasterize PDF');
        expect(result.stdout).not.toContain('failed to read PDF text layer');
        expect(result.stdout).not.toContain('failed to reassemble PDF');
      });
    });

    when('[t1] pdftotext fails to read the text layer', () => {
      const result = useBeforeAll(async () => {
        const bin = genAllowlistBin({
          into: path.join(tmp.dir, 'bin-fail-totext'),
          allow: ['pdftoppm', 'pdftotext', 'convert'],
        });
        genFailingTool({ bin, tool: 'pdftotext' });
        return runSkill({
          args: [
            '--what',
            'ssn',
            '--from',
            scene.withSsn,
            '--into',
            path.join(tmp.dir, 'fail-totext.pdf'),
          ],
          path: bin,
        });
      });

      then('it blocks as a MALFUNCTION', () => {
        expect(result.exitCode).toBe(1);
      });

      then('⭐ it names the TEXT LAYER step, not a neighbor', () => {
        expect(result.stdout).toContain('failed to read PDF text layer');
        expect(result.stdout).not.toContain('failed to rasterize PDF');
        expect(result.stdout).not.toContain('failed to reassemble PDF');
      });
    });

    when('[t2] convert fails to reassemble', () => {
      const result = useBeforeAll(async () => {
        const bin = genAllowlistBin({
          into: path.join(tmp.dir, 'bin-fail-convert'),
          allow: ['pdftoppm', 'pdftotext', 'convert'],
        });
        genFailingTool({ bin, tool: 'convert' });
        return runSkill({
          args: [
            '--what',
            'ssn',
            // ⚠️ the NO-SSN fixture on purpose: zero boxes means `paint_box`
            //    never calls convert, so the failing stub is first reached by
            //    step 4 — the arm under test.
            '--from',
            scene.noSsn,
            '--into',
            path.join(tmp.dir, 'fail-convert.pdf'),
          ],
          path: bin,
        });
      });

      then('it blocks as a MALFUNCTION', () => {
        expect(result.exitCode).toBe(1);
      });

      then('⭐ it names the REASSEMBLE step, not an earlier one', () => {
        expect(result.stdout).toContain('failed to reassemble PDF');
        expect(result.stdout).not.toContain('failed to rasterize PDF');
        expect(result.stdout).not.toContain('failed to read PDF text layer');
      });

      // ⛔ a security guarantee: a run that could not finish must not report
      //    a redaction. a human who reads "redacted," stops looking.
      then('⭐ it emits no success report', () => {
        expect(result.stdout).not.toContain('redacted,');
        expect(result.stdout).not.toContain('into:');
      });
    });
  });

  /**
   * .why = `main`'s text mode has FOUR sub-branches on the {from, into} pair.
   *        two had cases — stdin to stdout ([case1]) and file to file
   *        ([case4]) — and the two MIXED ones had none.
   *
   * ⭐ AND THEY DIFFER IN WHAT THEY REPORT, which is the part a bare
   *    "did it redact" assertion cannot see: only the file-to-file branch
   *    prints a tree. the other three write the redacted bytes and stay
   *    silent, so a report leaked into a stdout-bound branch would corrupt
   *    the very output it describes.
   */
  given('[case22] the mixed text-mode branches', () => {
    when('[t0] --from a file, with no --into (file to stdout)', () => {
      const result = useBeforeAll(async () => {
        const src = path.join(tmp.dir, 'mixed-in.md');
        fs.writeFileSync(src, 'owner SSN 666-12-3456 end\n');
        return runSkill({ args: ['--what', 'ssn', '--from', src] });
      });

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the redacted text goes to stdout', () => {
        expect(result.stdout).toContain('***-**-****');
        expect(result.stdout).not.toContain('666-12-3456');
      });

      // ⭐ the discriminator. stdout IS the payload here, so the tree report
      //    must not appear in it — a report on this branch corrupts the file
      //    a caller redirects stdout into.
      then('⭐ no tree report is mixed into the payload', () => {
        expect(result.stdout).not.toContain('pdf.redact');
        expect(result.stdout).not.toContain('redacted,');
      });
    });

    when('[t1] --into a file, with no --from (stdin to file)', () => {
      const seen = useBeforeAll(async () => {
        const out = path.join(tmp.dir, 'mixed-out.md');
        const result = runSkill({
          args: ['--what', 'ssn', '--into', out],
          stdin: 'owner SSN 666-12-3456 end\n',
        });
        return { result, written: fs.readFileSync(out, UTF8) };
      });
      then('it succeeds', () => {
        expect(seen.result.exitCode).toBe(0);
      });

      then('the redacted text lands in the file, not on stdout', () => {
        expect(seen.written).toContain('***-**-****');
        expect(seen.written).not.toContain('666-12-3456');
      });

      // ⭐ this branch is deliberately silent; a report here would be the
      //    only output a caller sees, and would read as the redaction.
      then('⭐ stdout stays empty', () => {
        expect(seen.result.stdout).toEqual('');
      });
    });
  });
});
