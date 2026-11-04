import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the doc.sign skill
 *
 * .why  = doc.sign places a signature onto a page of a legal document. its
 *   headline guarantee is that ONLY the signed page is rasterized and every
 *   other page is carried through untouched — a return whose other pages
 *   silently lost their text layer reads as blank to any later extract, which
 *   is the exact defect `rule.forbid.hand-transcription` exists to prevent.
 *   that guarantee was verified nowhere before this file.
 *
 * .note = hermetic. no network, no mock. the skill fetches its font from
 *   Google Fonts ONLY when the cache misses, and the cache is rooted at
 *   `$HOME` — so a fake HOME with a seeded ttf takes the network out of the
 *   picture entirely. the skill documents this escape itself, at the point
 *   where the fetch fails: "to sidestep all three, drop a ttf at: $FONT_FILE".
 */

const skillPath = path.join(__dirname, 'doc.sign.sh');

const UTF8 = 'utf-8' as const;

// eager, not deferred: path.join needs a real string, not a test-fns proxy
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-sign-'));
const fakeHome = path.join(tempDir, 'home');

/**
 * .what = the font family the tests ask for
 *
 * .why  = the skill derives its cache filename by a space->dash swap on the
 *   family name, so a synthetic family maps to a cache path we control. a real
 *   family name would work too, but would invite a live fetch the moment the
 *   seed step regressed — and that failure would be a silent network call
 *   rather than a red test.
 */
const FONT_FAMILY = 'TestFace';

const PAGE_MARKERS = [
  'PAGE ONE MARKER',
  'PAGE TWO MARKER',
  'PAGE THREE MARKER',
];

const fixturePdf = path.join(tempDir, 'return.pdf');

/**
 * .what = the extracted text layer of one page
 *
 * .why  = `pdftotext` is the deterministic read the whole guarantee is stated
 *   in terms of. a page that was rasterized returns empty here; a page carried
 *   through returns its marker.
 */
const textOfPage = (input: { pdf: string; page: number }): string => {
  const res = spawnSync(
    'pdftotext',
    ['-f', String(input.page), '-l', String(input.page), input.pdf, '-'],
    { encoding: UTF8 },
  );
  return res.stdout ?? '';
};

const pageCountOf = (pdf: string): number => {
  const res = spawnSync('pdfinfo', [pdf], { encoding: UTF8 });
  const line = (res.stdout ?? '')
    .split('\n')
    .find((l) => l.startsWith('Pages:'));
  return Number((line ?? '').replace('Pages:', '').trim());
};

/**
 * .what = seed the font cache under the fake HOME from a system ttf
 *
 * .why  = imagemagick needs a real outline font file; the skill needs it at an
 *   exact path. fc-match resolves one that is already installed, so no font is
 *   committed to the repo — a committed binary is opaque to a reviewer and
 *   ships inside the npm package.
 */
const seedFontCache = (): void => {
  const cacheDir = path.join(fakeHome, '.rhachet/cache/fonts');
  fs.mkdirSync(cacheDir, { recursive: true });

  const matched = spawnSync(
    'fc-match',
    ['-f', '%{file}', ':fontformat=TrueType:scalable=true'],
    { encoding: UTF8 },
  );
  const fontFile = (matched.stdout ?? '').trim();
  if (matched.status !== 0 || !fontFile || !fs.existsSync(fontFile)) {
    throw new Error(
      `no system TrueType font resolved by fc-match. status=${matched.status} stdout=${matched.stdout} stderr=${matched.stderr}`,
    );
  }

  fs.copyFileSync(fontFile, path.join(cacheDir, `${FONT_FAMILY}.ttf`));
};

/**
 * .what = build a three-page pdf whose every page carries a unique text marker
 *
 * .why  = the guarantee under test is per-page, so the fixture needs more than
 *   one page to be true about. three pages with the signature on the MIDDLE one
 *   exercises both carry-through branches — the `before.pdf` slice and the
 *   `after.pdf` slice — which a single-page or first-page fixture would leave
 *   untouched.
 *
 * .note = generated, never committed. a committed pdf is an opaque blob: a
 *   reviewer cannot see what it holds, and when it breaks the failure reads as
 *   "fixture not found" rather than as a meaningful break. this way the
 *   fixture's content is legible right here.
 */
const genFixturePdf = (): void => {
  const ps = [
    '%!PS',
    ...PAGE_MARKERS.flatMap((marker) => [
      '/Helvetica findfont 24 scalefont setfont',
      '72 700 moveto',
      `(${marker}) show`,
      '72 100 moveto',
      '(Signature of officer: ______________________) show',
      'showpage',
    ]),
  ].join('\n');

  const psPath = path.join(tempDir, 'fixture.ps');
  fs.writeFileSync(psPath, ps);

  const built = spawnSync('ps2pdf', [psPath, fixturePdf], { encoding: UTF8 });
  if (built.status !== 0) {
    throw new Error(`ps2pdf failed to build the fixture: ${built.stderr}`);
  }
  fs.rmSync(psPath, { force: true });

  // failfast: prove the fixture really is a three-page TEXT pdf. if it came
  // out image-only or short, every per-page assertion below would measure the
  // wrong property while still red or green for the wrong reason.
  if (pageCountOf(fixturePdf) !== 3) {
    throw new Error(`fixture is not 3 pages — got ${pageCountOf(fixturePdf)}`);
  }
  const tail = textOfPage({ pdf: fixturePdf, page: 3 });
  if (!tail.includes(PAGE_MARKERS[2]!)) {
    throw new Error(
      `fixture page 3 does not carry its marker — got: ${tail.slice(0, 200)}`,
    );
  }
};

const scannedPdf = path.join(tempDir, 'scanned.pdf');

/**
 * .what = the same three pages, rasterized — a stand-in for a scanned return
 *
 * .why  = this fixture is what decides between two candidate guards. a
 *   PRESENCE test — "does each other page yield text?" — REFUSES this document
 *   though the output is perfectly correct, because a scan has no text layer
 *   anywhere. the comparison guard passes it, because a page blank in both the
 *   input and the output lost no text. without this case the wrong guard looks
 *   right, and a guard that blocks valid work gets disabled.
 */
const genScannedPdf = (): void => {
  const built = spawnSync(
    'gs',
    [
      '-q',
      '-dNOPAUSE',
      '-dBATCH',
      '-sDEVICE=pdfimage24',
      '-r72',
      `-sOutputFile=${scannedPdf}`,
      fixturePdf,
    ],
    { encoding: UTF8 },
  );
  if (built.status !== 0) {
    throw new Error(`gs failed to build the scanned fixture: ${built.stderr}`);
  }

  // failfast: the fixture is only meaningful if it truly has NO text layer.
  // were gs to leave one behind, [case6] would pass under a presence test too,
  // and would prove nothing about which of the two guards is right.
  for (const page of [1, 2, 3]) {
    const text = textOfPage({ pdf: scannedPdf, page }).trim();
    if (text !== '') {
      throw new Error(
        `scanned fixture page ${page} still carries text: ${text.slice(0, 120)}`,
      );
    }
  }
};

/**
 * .what = a fake `gs` on PATH that rasterizes ONLY the trailing carry-through
 *   slice, and passes every other invocation through to the real one
 *
 * .why  = the defect, stated as an executable fact. `#49` proved the page-count
 *   guard cannot see it — a raster page is still a page — so the only way to
 *   know the text-layer guard bites is to produce an output that has the right
 *   page count and the wrong content. a whole-file break would be caught by
 *   other means and would prove less.
 *
 * .note = the fake bin is PREPENDED to the real PATH, never substituted for it.
 *   the shim is a bash executable and the skill needs six other binaries, so a
 *   stripped PATH would fail as "not found" — a red test for the wrong reason.
 */
const genGsThatRastersTheTrailingSlice = (input: {
  dir: string;
}): { bin: string } => {
  const which = spawnSync('which', ['gs'], { encoding: UTF8 });
  const realGs = (which.stdout ?? '').trim();
  if (which.status !== 0 || !realGs) {
    throw new Error('gs is required but was not resolved on PATH');
  }

  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(
    path.join(bin, 'gs'),
    [
      '#!/usr/bin/env bash',
      'args=("$@")',
      'out=""',
      'for a in "${args[@]}"; do',
      '  case "$a" in -sOutputFile=*) out="${a#-sOutputFile=}" ;; esac',
      'done',
      'if [[ "$out" == *after.pdf ]]; then',
      '  for i in "${!args[@]}"; do',
      '    if [[ "${args[$i]}" == "-sDEVICE=pdfwrite" ]]; then',
      '      args[$i]="-sDEVICE=pdfimage24"',
      '    fi',
      '  done',
      '  args+=("-r72")',
      'fi',
      `exec ${realGs} "\${args[@]}"`,
    ].join('\n'),
  );
  fs.chmodSync(path.join(bin, 'gs'), '755');
  return { bin };
};

const runSkill = (
  args: string[],
  options?: { binFirst?: string },
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [skillPath, ...args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
    // the fake HOME is what makes this hermetic — it redirects the font cache
    env: {
      ...process.env,
      HOME: fakeHome,
      ...(options?.binFirst
        ? { PATH: `${options.binFirst}:${process.env.PATH ?? ''}` }
        : {}),
    },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

// module scope on purpose: all three run before any beforeAll would fire
seedFontCache();
genFixturePdf();
genScannedPdf();

describe('doc.sign.sh', () => {
  given('[case1] a caller who asks for help', () => {
    when('[t0] --help is requested', () => {
      then('it exits clean and states its usage', () => {
        const res = runSkill(['--help']);
        expect(res.exitCode).toEqual(0);
        expect(res.stdout).toContain('doc.sign.sh');
        expect(res.stdout).toContain('--sign-at');
        expect(res.stdout).toContain('--mode');
      });
    });
  });

  given('[case2] invalid input', () => {
    when('[t0] no --pdf is supplied', () => {
      then('it fails as a constraint', () => {
        const res = runSkill(['--name', 'Ada Lovelace', '--sign-at', '85,670']);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--pdf is required');
      });
    });

    when('[t1] the --pdf is absent from disk', () => {
      then('it fails as a constraint and names the path', () => {
        const res = runSkill([
          '--pdf',
          '/nonexistent/return.pdf',
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--pdf not found');
      });
    });

    when('[t2] no --name is supplied', () => {
      then('it fails as a constraint', () => {
        const res = runSkill(['--pdf', fixturePdf, '--sign-at', '85,670']);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--name is required');
      });
    });

    when('[t3] --sign-at is not an X,Y pair', () => {
      then('it fails as a constraint', () => {
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85x670',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--sign-at must be X,Y');
      });
    });

    when('[t4] a --date is given with no --date-at', () => {
      then('it fails as a constraint', () => {
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
          '--date',
          '2026-08-31',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--date needs --date-at');
      });
    });

    when('[t5] --mode is neither plan nor apply', () => {
      then('it fails as a constraint', () => {
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
          '--mode',
          'banana',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--mode must be plan or apply');
      });
    });

    when('[t6] an unknown argument is supplied', () => {
      then('it fails as a constraint', () => {
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
          '--wat',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('unknown argument');
      });
    });

    when('[t7] --page is past the end of the document', () => {
      then('it fails as a constraint and names the real page count', () => {
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
          '--page',
          '99',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('out of range');
        expect(res.stdout).toContain('3 pages');
      });
    });

    /**
     * .what = a --pdf poppler cannot read must be REFUSED, with a reason
     *
     * .why  = there is no `not a PDF file` check above the page-count read,
     *         so a .txt renamed .pdf reaches it. written as one statement,
     *         `set -e` + `pipefail` makes the assignment abort the file, so
     *         every guard below it — this one and the range check at [t7] —
     *         becomes UNREACHABLE and the caller gets an empty stdout.
     *
     *         ⭐ the exit code alone cannot see it: poppler exits 1, and a
     *         `toEqual(2)` would go red for the RIGHT reason here — but on
     *         the exit-1 post-condition further down the two codes COINCIDE
     *         and only the message discriminates.
     *         `rule.require.assertions-that-discriminate`, leak 6.
     */
    when('[t8] --pdf is a file poppler cannot read', () => {
      then('it fails as a constraint and says why', () => {
        const fake = path.join(tempDir, 'not-really.pdf');
        fs.writeFileSync(fake, '<html><body>404 Not Found</body></html>');
        const res = runSkill([
          '--pdf',
          fake,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
        ]);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('could not read the page count');
        expect(res.stdout).toContain('not-really.pdf');
      });
    });
  });

  given('[case3] a caller who wants to confirm the position first', () => {
    when('[t0] the skill runs in its default plan mode', () => {
      const outcome = useThen('it exits clean', () => {
        const into = path.join(tempDir, 'planned.pdf');
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--font',
          FONT_FAMILY,
          '--sign-at',
          '85,700',
          '--page',
          '2',
          '--into',
          into,
        ]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        return { res, into };
      });

      then('it writes a preview png', () => {
        const preview = outcome.into.replace(/\.pdf$/, '.plan.png');
        expect(fs.existsSync(preview)).toEqual(true);
      });

      then('it writes NO pdf — plan mode commits no signature', () => {
        expect(fs.existsSync(outcome.into)).toEqual(false);
      });

      then('the font came from cache, so no network was touched', () => {
        expect(outcome.res.stdout).toContain(`${FONT_FAMILY} (cache)`);
      });
    });
  });

  given('[case4] a three-page return signed on its MIDDLE page', () => {
    /**
     * .why = page 2 of 3 is the only choice that exercises BOTH carry-through
     *   branches at once — the `-dLastPage=$((PAGE - 1))` slice before it and
     *   the `-dFirstPage=$((PAGE + 1))` slice after it. sign page 1 and the
     *   `before` branch never runs.
     */
    when('[t0] the skill runs in apply mode', () => {
      const outcome = useThen('it exits clean', () => {
        const into = path.join(tempDir, 'signed.pdf');
        const res = runSkill([
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--font',
          FONT_FAMILY,
          '--sign-at',
          '85,700',
          '--date',
          '2026-08-31',
          '--date-at',
          '262,700',
          '--page',
          '2',
          '--dpi',
          '150',
          '--into',
          into,
          '--mode',
          'apply',
        ]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        return { res, into };
      });

      then('it writes the signed pdf', () => {
        expect(fs.existsSync(outcome.into)).toEqual(true);
      });

      then('the page count is preserved', () => {
        expect(pageCountOf(outcome.into)).toEqual(3);
      });

      then('⭐ page 1 keeps its text layer — it was carried through', () => {
        expect(textOfPage({ pdf: outcome.into, page: 1 })).toContain(
          PAGE_MARKERS[0],
        );
      });

      then('⭐ page 3 keeps its text layer — it was carried through', () => {
        expect(textOfPage({ pdf: outcome.into, page: 3 })).toContain(
          PAGE_MARKERS[2],
        );
      });

      then(
        '⭐ page 2 lost its text layer — it is the one that was signed',
        () => {
          // the rasterize is what places the signature. its cost is the text
          // layer of that ONE page, and that cost must fall nowhere else.
          expect(textOfPage({ pdf: outcome.into, page: 2 })).not.toContain(
            PAGE_MARKERS[1],
          );
        },
      );

      then('it reports the verified page count back to the caller', () => {
        expect(outcome.res.stdout).toContain('3 (verified)');
      });

      then(
        '⭐ it reports the text-layer check as CHECKED, not asserted',
        () => {
          expect(outcome.res.stdout).toContain(
            '2 other page(s), byte-for-byte (verified)',
          );
        },
      );

      then('⭐ the unverified warranty is gone from the stdout', () => {
        // it read "every other page kept its text layer" and no code in the
        // skill examined a text layer. an unverified warranty and no warranty
        // are both honest; only the prior state was not.
        expect(outcome.res.stdout).not.toContain(
          'every other page kept its text layer',
        );
      });

      then('the font came from cache, so no network was touched', () => {
        expect(outcome.res.stdout).toContain(`${FONT_FAMILY} (cache)`);
      });
    });
  });

  given('[case5] a gs that rasters the trailing carry-through slice', () => {
    /**
     * .why = ⭐ this is the defect `#49` exposed and could not catch. the
     *   page-count guard stays GREEN on this output — 3 in, 3 out — because a
     *   raster page is still a page. a case that asserted only the count would
     *   pass over a return whose page 3 had silently gone blank.
     *
     *   the input type under test is a per-page ENCODE change that leaves every
     *   count intact (`rule.require.audit-guards-by-input-type`).
     */
    const shim = useThen('the shim resolves the real gs', () =>
      genGsThatRastersTheTrailingSlice({ dir: tempDir }),
    );

    when('[t0] the skill runs in apply mode under that gs', () => {
      const outcome = useThen('it refuses, as a malfunction', () => {
        const into = path.join(tempDir, 'signed-raster.pdf');
        const res = runSkill(
          [
            '--pdf',
            fixturePdf,
            '--name',
            'Ada Lovelace',
            '--font',
            FONT_FAMILY,
            '--sign-at',
            '85,700',
            '--page',
            '2',
            '--dpi',
            '150',
            '--into',
            into,
            '--mode',
            'apply',
          ],
          { binFirst: shim.bin },
        );
        if (res.exitCode !== 1) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(1);
        return { res, into };
      });

      then('⭐ it names the page that lost its text layer', () => {
        expect(`${outcome.res.stdout}${outcome.res.stderr}`).toContain(
          'page 3',
        );
      });

      then('⭐ it says it will not vouch for the output', () => {
        expect(`${outcome.res.stdout}${outcome.res.stderr}`).toContain(
          'refusing to vouch',
        );
      });

      then(
        'it prints no success tree, so no warranty can reach the reader',
        () => {
          expect(outcome.res.stdout).not.toContain('(verified)');
        },
      );

      then(
        '⚠️ the page COUNT is intact — the prior guard could not have caught this',
        () => {
          // the proof that the new guard is load-bearing: the output the shim
          // produced satisfies every check that existed before it.
          expect(pageCountOf(outcome.into)).toEqual(3);
        },
      );

      then(
        '⚠️ the refused output is LEFT on disk — asserted, not assumed',
        () => {
          // the limit of the refusal, stated as a case rather than a comment.
          // the skill declines to vouch; it does not clean up. a caller who
          // ignores exit 1 can still open this file. the extant page-count
          // guard behaves the same way, so this documents both.
          expect(fs.existsSync(outcome.into)).toEqual(true);
        },
      );
    });
  });

  given('[case6] a SCANNED return — no page has a text layer at all', () => {
    /**
     * .why = ⭐ the negative control that rejects the naive fix. a PRESENCE
     *   test would refuse this document, though its output is correct — and a
     *   guard that blocks valid work gets disabled, which is worse than absent.
     *   the comparison guard passes it because a page blank in both the input
     *   and the output lost no text.
     */
    when('[t0] the skill signs its middle page', () => {
      const outcome = useThen('it exits clean — no text was lost', () => {
        const into = path.join(tempDir, 'signed-scanned.pdf');
        const res = runSkill([
          '--pdf',
          scannedPdf,
          '--name',
          'Ada Lovelace',
          '--font',
          FONT_FAMILY,
          '--sign-at',
          '85,700',
          '--page',
          '2',
          '--dpi',
          '150',
          '--into',
          into,
          '--mode',
          'apply',
        ]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        return { res, into };
      });

      then(
        '⭐ the fixture control — the INPUT really has no text anywhere',
        () => {
          // without this the case proves the guard is lenient, not that it is
          // correct: a fixture that quietly kept its text would pass under a
          // presence test too.
          expect(textOfPage({ pdf: scannedPdf, page: 1 }).trim()).toEqual('');
          expect(textOfPage({ pdf: scannedPdf, page: 3 }).trim()).toEqual('');
        },
      );

      then('it kept every page', () => {
        expect(pageCountOf(outcome.into)).toEqual(3);
      });

      then(
        '⭐ the check RAN over both other pages — it was not skipped',
        () => {
          expect(outcome.res.stdout).toContain(
            '2 other page(s), byte-for-byte (verified)',
          );
        },
      );
    });
  });

  given('[case7] the font cache misses and no ttf can be fetched', () => {
    /**
     * ⭐ THE REFUSAL PROSE THIS WHOLE FILE DEPENDS ON HAD ZERO ASSERTIONS.
     *
     *   the `.note` at the head of this file states its own hermeticity in
     *   terms of one sentence the skill prints HERE — "to sidestep all three,
     *   drop a ttf at: $FONT_FILE". `seedFontCache` writes to the path that
     *   sentence names. so every case above is hermetic BECAUSE of this line,
     *   and the line itself was read by no assertion: the only match anywhere
     *   in this file was the doc comment quoting it.
     *
     * ⚠️ and the path is INTERPOLATED TWICE OVER — `$FONT_CACHE` is rooted at
     *   `$HOME`, and `$FONT_SLUG` is `$FONT` with spaces swapped for dashes.
     *   hardcode either half and the refusal tells an operator to drop a ttf
     *   where the skill will never look. they drop it, re-run, stay blocked,
     *   and the only conclusion available to them is that the cache is broken.
     *
     * ⭐ THE FIXTURE HAD TO CHANGE TO SEE IT. every other case uses `TestFace`,
     *   which has NO SPACES — so the space->dash swap is a no-op there and a
     *   defect in it is UNOBSERVABLE by construction. the skill's own DEFAULT
     *   family is `Herr Von Muellerhoff`, which has two. this case uses a
     *   multi-word family for exactly that reason: a uniform fixture cannot
     *   test a per-character transform.
     *
     * .note = hermetic. a `curl` shim that always fails stands in for "no
     *   network", so this never reaches Google Fonts. the family is also one
     *   Google does not publish, so even a shim regression cannot reach a real
     *   ttf and quietly turn this green for the wrong reason.
     */
    const FONT_MULTIWORD = 'Nonexistent Test Family';
    const FONT_SLUGGED = 'Nonexistent-Test-Family';

    const bin = path.join(tempDir, '.fakebin-curl');
    fs.mkdirSync(bin, { recursive: true });
    fs.writeFileSync(
      path.join(bin, 'curl'),
      ['#!/usr/bin/env bash', 'exit 1'].join('\n'),
    );
    fs.chmodSync(path.join(bin, 'curl'), '755');

    when('[t0] the fetch yields no ttf url', () => {
      const res = runSkill(
        [
          '--pdf',
          fixturePdf,
          '--name',
          'Ada Lovelace',
          '--sign-at',
          '85,670',
          '--font',
          FONT_MULTIWORD,
        ],
        { binFirst: bin },
      );

      then('⭐ the control — it really did refuse, rather than sign', () => {
        // without this, every string assertion below is satisfied just as
        // well by a run that succeeded and printed none of them
        if (res.exitCode !== 2) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('could not find a ttf for font');
      });

      then('the headline names the family the CALLER asked for', () => {
        expect(res.stdout).toContain(
          `could not find a ttf for font '${FONT_MULTIWORD}'`,
        );
      });

      then('it states all THREE causes it promises, and numbers them', () => {
        // the header commits to a count. a list that says "three causes" and
        // renders two sends a reader hunting for a cause that is not there
        expect(res.stdout).toContain('three causes, in order of likelihood');
        expect(res.stdout).toContain('1. no network reachable from here');
        expect(res.stdout).toContain(
          `2. '${FONT_MULTIWORD}' is not a Google Fonts family`,
        );
        expect(res.stdout).toContain('3. Google served woff2/eot');
      });

      then('⭐ the remedy names the EXACT path the cache lookup uses', () => {
        // the decisive assertion. the spaces must be dashes and the root must
        // be the caller's HOME — this is the one place the skill ever states
        // the path that `seedFontCache` is written against
        expect(res.stdout).toContain('to sidestep all three, drop a ttf at:');
        expect(res.stdout).toContain(
          path.join(fakeHome, '.rhachet/cache/fonts', `${FONT_SLUGGED}.ttf`),
        );
      });

      then(
        '⭐ and it does NOT print the un-slugged family in that path',
        () => {
          // the discriminator. drop the `tr` and the remedy still carries a
          // plausible-looking cache path under the right HOME, so only an
          // exclusion separates the slugged form from the raw one
          expect(res.stdout).not.toContain(
            path.join(
              fakeHome,
              '.rhachet/cache/fonts',
              `${FONT_MULTIWORD}.ttf`,
            ),
          );
        },
      );
    });
  });
});
