import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the DETERMINISTIC half of pii.scan
 * .why  = verify the scanner catches PII in both the formatted and the
 *         BARE form, that the allowlist mutes by value rather than by
 *         file, that hits are masked in the report, and that a hit
 *         exits 2 so a pre-commit gate can block on it.
 *
 * .note = every fixture value here is synthetic. 666-12-3456 carries a
 *         prefix the SSA has never issued, so it is structurally valid
 *         and permanently fake — which also lets this file stay clean
 *         under its own scanner.
 */

const scriptPath = path.join(__dirname, 'pii.scan.via.regex.sh');

const UTF8 = 'utf-8' as const;

/** a synthetic SSN; the 666 prefix is never issued by the SSA */
const SSN_FORMATTED = '666-12-3456';
/** the same value with the dashes dropped — the shape that hid in SS-4 7b */
const SSN_BARE = '666123456';

const runSkill = (input: {
  args: string[];
  cwd: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * .what = build a throwaway git repo that carries the given files
 * .why  = the scanner derives its scope from git, so it needs a real
 *         work tree; a temp repo keeps each case hermetic
 */
const genTempRepo = (input: {
  files: Record<string, string>;
  /** raw bytes, for fixtures that must NOT be text — see [case14] */
  binaries?: Record<string, Buffer>;
  stage?: string[];
}): { dir: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-scan-'));

  const git = (args: string[]): void => {
    const res = spawnSync('git', args, { cwd: dir, encoding: UTF8 });
    if (res.status !== 0) {
      throw new Error(`git ${args.join(' ')} failed: ${res.stderr}`);
    }
  };

  git(['init', '--quiet']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'user.name', 'test']);

  for (const [rel, content] of Object.entries(input.files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  for (const [rel, bytes] of Object.entries(input.binaries ?? {})) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, bytes);
  }

  if (input.stage?.length) git(['add', ...input.stage]);

  return { dir };
};

/**
 * ⚠️ the describe names the LEAF, deliberately. it used to read
 *    `pii.scan.sh` — the DISPATCHER — while `scriptPath` above points at
 *    `pii.scan.via.regex.sh`. that is the leak-5 scope hazard in its
 *    loudest form: not a comment, but the string jest PRINTS, so a
 *    reader who greps for dispatcher coverage found an 18-case block
 *    titled exactly `pii.scan.sh` and concluded it was covered.
 *
 *    the dispatcher's own cases now live in pii.scan.integration.test.ts.
 */
describe('pii.scan.via.regex.sh', () => {
  given('[case1] a file with a BARE (undashed) SSN', () => {
    // this is the regression the skill exists for: IRS Form SS-4 field
    // 7b stores an SSN with no dashes, so a dashed-only pattern misses
    // it entirely and the scan reports a false all-clear
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'evidence.md': `responsible party id ${SSN_BARE} on file` },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 2 (constraint: hits found)', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the file and the detector', () => {
        expect(result.stdout).toContain('evidence.md');
        expect(result.stdout).toContain('ssn');
      });

      then('it masks the value rather than echo it', () => {
        expect(result.stdout).not.toContain(SSN_BARE);
        expect(result.stdout).toContain('666******');
      });
    });
  });

  given('[case2] a file with a formatted SSN', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'form.md': `owner SSN ${SSN_FORMATTED} holds 100 percent` },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it masks all but the first three digits', () => {
        expect(result.stdout).not.toContain(SSN_FORMATTED);
        expect(result.stdout).toContain('666-**-****');
      });
    });
  });

  given('[case3] a clean file', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'readme.md': 'no identifiers here, just prose and a year 2026',
        },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 0', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it reports zero hits', () => {
        expect(result.stdout).toContain('hits: 0');
      });
    });
  });

  given('[case4] an allowlist that names the value', () => {
    when('[t0] the allowlist carries the FORMATTED form only', () => {
      // the entry matches on its digits, so one line must mute the bare
      // form too — else every synthetic fixture needs two entries and
      // the allowlist rots
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: {
            '.pii-allow': `# synthetic fixture\n${SSN_FORMATTED}\n`,
            'a.md': `formatted ${SSN_FORMATTED}`,
            'b.md': `bare ${SSN_BARE}`,
          },
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 0', () => {
        expect(result.exitCode).toBe(0);
      });

      then('both the formatted and the bare form are muted', () => {
        expect(result.stdout).toContain('hits: 0');
      });
    });

    when('[t1] the same tree is scanned with no allowlist', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: {
            'a.md': `formatted ${SSN_FORMATTED}`,
            'b.md': `bare ${SSN_BARE}`,
          },
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 2 — so case4/t0 was the allowlist, not a miss', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it flags both files', () => {
        expect(result.stdout).toContain('a.md');
        expect(result.stdout).toContain('b.md');
      });
    });
  });

  given('[case5] a file with an EIN', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ files: { 'cp575.md': 'EIN 12-3456789 assigned' } }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it reports the ein detector', () => {
        expect(result.stdout).toContain('ein');
      });

      then('it masks the value', () => {
        expect(result.stdout).not.toContain('12-3456789');
      });

      /**
       * ⛔ THE BLOCKED VERDICT ITSELF, which had zero assertions in any test
       *    file in this repo. `clear skies` is asserted BOTH ways — three
       *    positives and one `not.toContain` — and its opposite number was
       *    read by nobody.
       *
       *    the verdict is emitted by `report_hits`, a NAMED FUNCTION, so the
       *    exit at `main`'s tail carries no adjacent refusal call and the
       *    MESSAGE sweep classifies it `no-msg`. that classification is a
       *    prompt to read the site, not a verdict — and the read found a
       *    real gap the sweep could not have named.
       *
       * ⚠️ WHAT STAYS GREEN without this line. delete the `print_eagle_header`
       *    at `report_hits`'s blocked branch and the skill emits a full PII
       *    report — every row, every detector, every masked value, exit 2 —
       *    with NO VERDICT ON IT. all three assertions above pass, and so
       *    does every one of the ~20 other `toBe(2)` clamps in this file.
       *
       *    that is the whole output a human reads at the pre-commit gate to
       *    decide whether their commit is safe. an inventory with no verdict
       *    on it reads as a record, not a refusal.
       */
      then('⭐ it renders the BLOCKED verdict', () => {
        expect(result.stdout).toContain('hold up — that carries PII');
      });

      /**
       * ⭐ SPLIT from the positive above, per the discipline this walk holds
       *    throughout: jest halts a `then` at its first red, so a co-located
       *    exclusion can never be measured apart from the positive it guards.
       *
       *    this one rules out the BRANCH INVERSION — `-eq 0` flipped to
       *    `-ne 0` in `report_hits` — under which a run that DOES hold hits
       *    takes the clear-skies arm and announces `hits: 0` over a real EIN.
       */
      then('⭐ and NOT the clear one', () => {
        expect(result.stdout).not.toContain('clear skies');
      });
    });
  });

  given('[case6] a file with a street address', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'addr.md': 'mailed to 500 Fake Street Apt 12, Somewhere' },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it reports the street detector', () => {
        expect(result.stdout).toContain('street');
      });
    });
  });

  given('[case7] a staged file with PII', () => {
    // this is the scope the pre-commit hook uses: what a commit would
    // actually capture
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'staged.md': `id ${SSN_BARE}` },
        stage: ['staged.md'],
      }),
    );

    when('[t0] scanned with --diffs since-staged', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs', 'since-staged'], cwd: repo.dir }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the staged scope', () => {
        expect(result.stdout).toContain('staged');
      });
    });
  });

  given('[case8] a lockfile with long digit runs', () => {
    // lockfile integrity strings are digit soup; if they are scanned the
    // report cries wolf and gets ignored, which is worse than absent
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'pnpm-lock.yaml': 'integrity: sha512-900000000123456789' },
      }),
    );

    when('[t0] scanned with defaults', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 0 — lockfiles are skipped', () => {
        expect(result.exitCode).toBe(0);
      });
    });
  });

  given('[case9] a postal address with a ZIP+4', () => {
    // a ZIP+4 is nine digits with one dash, exactly like an SSN — but the
    // dash falls after five digits, not three. a detector written with an
    // optional dash ([0-9]{3}-?[0-9]{2}-?[0-9]{4}) reads 19899-2044 as a
    // valid SSN, so every address in the repo becomes a hit and the whole
    // report gets ignored. false positives are how a scanner dies.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'mail.md': [
            'DE Division of Revenue, Wilmington, DE 19899-2044',
            'IRS, Cincinnati OH 45999-0023',
          ].join('\n'),
        },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 0 — a ZIP+4 is not an SSN', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it reports zero hits', () => {
        expect(result.stdout).toContain('hits: 0');
      });
    });
  });

  given('[case10] the skill invoked for help', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called with --help', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--help'], cwd: repo.dir }),
      );

      then('it exits 0', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it documents usage, args, and an example', () => {
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('args:');
        expect(result.stdout).toContain('example:');
      });
    });
  });

  given('[case11] an unknown option', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called with a bad flag', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--nope'], cwd: repo.dir }),
      );

      then('it exits 2 with a constraint message', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown option');
      });
    });
  });

  given('[case12] a roster that names a person and their address', () => {
    // the closed-world half. no regex sees "Dale Waverly" as a name,
    // and the street detector cannot see an address with no unit word
    // — yet those are the least rotatable values in the corpus. the
    // roster catches them by literal match, exactly and offline.
    const repo = useBeforeAll(async () => {
      const built = genTempRepo({
        files: {
          '.gitignore': '.pii-map\n',
          'letter.md': [
            'Dear Dale Waverly,',
            'we mailed it to 88 Sandpine Road.',
          ].join('\n'),
        },
      });
      // TSV, exactly as doc.pseudonymize writes it: real<TAB>synthetic.
      // gitignored above, since the scan refuses a tracked roster.
      fs.writeFileSync(
        path.join(built.dir, '.pii-map'),
        [
          '# real\tsynthetic',
          'Dale Waverly\tJordan Hale',
          '88 Sandpine Road\t12 Example Way',
        ].join('\n'),
      );
      return built;
    });

    when('[t0] scanned with --roster', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.', '--roster', '.pii-map'],
          cwd: repo.dir,
        }),
      );

      then('it exits 2 — the roster values were found', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      then('it reports them under the roster detector', () => {
        expect(result.stdout).toContain('roster');
        expect(result.stdout).toContain('letter.md');
      });

      then('it masks the values rather than echo them', () => {
        expect(result.stdout).not.toContain('Dale Waverly');
        expect(result.stdout).not.toContain('88 Sandpine Road');
      });

      then('it never reports the SYNTHETIC side of the map', () => {
        // only the LEFT field is a real value. to match the right
        // field would flag every correctly-pseudonymized document as
        // a leak — the exact false positive that trains people to
        // ignore the scanner
        expect(result.stdout).not.toContain('Jordan Hale');
      });
    });

    when('[t1] scanned WITHOUT --roster', () => {
      // the control. without it these values are invisible, which is
      // the whole reason the flag exists — and is what the state of
      // the gate was before it did
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 0 — no regex can see a name', () => {
        expect(result.exitCode).toBe(0);
      });
    });
  });

  given('[case13] a roster that git tracks', () => {
    // ⛔ the roster lists every real value verbatim, so a tracked one
    //    is a worse leak than the one it prevents. this must refuse
    //    rather than scan, or the safety tool becomes the vector.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          '.pii-map': 'Dale Waverly\tJordan Hale',
          'letter.md': 'Dear Dale Waverly,',
        },
        stage: ['.pii-map'],
      }),
    );

    when('[t0] scanned with --roster', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.', '--roster', '.pii-map'],
          cwd: repo.dir,
        }),
      );

      then('it refuses, and says why', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('roster is tracked by git');
      });
    });
  });

  given('[case14] a binary file whose BYTES carry a real SSN', () => {
    // ⛔ `grep -I` treats a binary as non-matching, so the scanner drops
    //    it — and used to print the very same `files: 0, hits: 0` green
    //    as a genuine pass. those two states are not the same one:
    //    "examined and clean" versus "never opened". a rendered page or
    //    a screenshot is the primary artifact type of this whole domain,
    //    so the unread set is exactly where a leak hides.
    //
    // 🚩 observed 2026-08-31: a render of a PII-bearing form page
    //    was staged at the repo root and cleared all three guards.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'notes.md': 'no identifiers here, just prose and a year' },
        binaries: {
          // the NUL bytes are what make grep -I call this binary. the
          // SSN sits after them, genuinely present and genuinely unread
          'render.png': Buffer.concat([
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            Buffer.from([0x00, 0x00, 0x00, 0x0d]),
            Buffer.from(`responsible party ${SSN_BARE}`, UTF8),
          ]),
        },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it still exits 0 — the counter is report-only', () => {
        // ⚠️ deliberate, and the reason this fix was safe to land alone.
        //    a gate that blocked on every png would be muted inside a
        //    day. what it must never do is stay SILENT about the skip.
        expect(result.exitCode).toBe(0);
      });

      then('it counts the skip and names BINARY as the cause', () => {
        // ⭐ the cause, not merely a count. a bare `skipped: 12` reads
        //    as "lockfiles" and gets waved through; `binary 1` does not
        expect(result.stdout).toContain('skipped');
        expect(result.stdout).toContain('binary');
      });

      then('it says outright that the file was never scanned', () => {
        expect(result.stdout).toContain('NOT scanned');
        expect(result.stdout).toContain('--via brain');
      });

      then('the text file beside it WAS examined — files: 1', () => {
        // ⭐ the positive control. without it, a scanner that skipped
        //    every input would satisfy every assertion above
        expect(result.stdout).toContain('files: 1');
      });

      then('the SSN never reaches the report', () => {
        expect(result.stdout).not.toContain(SSN_BARE);
      });
    });
  });

  given('[case15] a tree with no unscannable file in it', () => {
    // the negative control for [case14]. the skip line must be ABSENT
    // on an all-text scan — a line that prints unconditionally is noise
    // that teaches a reader to skim past it, and then it has stopped
    // being a signal at all
    const repo = useBeforeAll(async () =>
      genTempRepo({ files: { 'notes.md': 'prose, and no more than that' } }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 0 with one file examined', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('files: 1');
      });

      then('no skip line is printed at all', () => {
        expect(result.stdout).not.toContain('skipped');
      });
    });
  });

  given('[case16] noise that would consume the whole report budget', () => {
    // ⛔ observed 2026-08-31. the detail was a PATH-ORDERED PREFIX capped at
    // 60 rows, so a file that sorts LAST got no row at all — counted in the
    // header, absent from the page. a real survivor hid exactly there, and a
    // sweep read the rendered rows and recorded the scope clean.
    //
    // ⚠️ this fixture deliberately gives the buried hit the SAME detector as
    // the noise. the fix everyone reaches for first — "sort shape-based
    // detectors ahead of the noisy one" — cannot move a row whose detector
    // IS the noisy one, so that fix leaves this case red. the clamp rules it
    // out on purpose.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          // sorts FIRST, and alone exceeds the 60-row budget
          'a-noise.md': Array.from(
            { length: 70 },
            (_unused, i) => `row ${i} id ${SSN_BARE}`,
          ).join('\n'),
          // sorts LAST, one hit, same detector as the noise
          'z-buried.md': `party id ${SSN_FORMATTED} on file`,
        },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ the file that sorts LAST still gets a row', () => {
        expect(result.stdout).toContain('z-buried.md');
      });

      then('the noisy file is still shown too', () => {
        expect(result.stdout).toContain('a-noise.md');
      });

      then('the floor does not blow the budget', () => {
        const rows = result.stdout.match(/├─ L/g) ?? [];
        expect(rows.length).toBe(60);
      });

      then('the truncation notice states that no file is hidden', () => {
        expect(result.stdout).toContain('more hit(s) not shown');
        expect(result.stdout).toContain('no file is hidden');
      });

      then('⭐ and it names the FLAG that reveals the rows it withheld', () => {
        // ⚠️ the line directly BELOW the two above, and it had zero
        //    assertions — the sentence-level gap this sweep exists for.
        //
        //    a notice that says rows are withheld and names no way to see
        //    them is the concealment this whole case was filed against,
        //    one step removed: the reader is told a survivor may be off
        //    the page and given no move. and the flag NAME can drift
        //    (`--paths-with` → `--paths`) with every other assertion here
        //    still green, which points them at a flag that exits 2 on an
        //    unknown argument.
        expect(result.stdout).toContain('--paths-with');
        expect(result.stdout).toContain('to see every row');
      });
    });
  });

  given('[case17] a scope whose report already fits in the budget', () => {
    // the negative control for [case16] — the input the guard must LET
    // THROUGH. a floor that suppressed rows on a small scope, or a notice
    // that printed unconditionally, would trade one concealment for another
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'alpha.md': `party id ${SSN_BARE} on file`,
          'beta.md': 'EIN 12-3456789 assigned',
        },
      }),
    );

    when('[t0] scanned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('every counted hit gets a rendered row', () => {
        const counted = /hits: (\d+) across/.exec(result.stdout);
        expect(counted).not.toBeNull();
        const rows = result.stdout.match(/├─ L/g) ?? [];
        expect(rows.length).toBe(Number(counted![1]));
      });

      then('no truncation notice is printed', () => {
        expect(result.stdout).not.toContain('more hit(s) not shown');
      });

      then('⭐ the header carries a per-detector tally', () => {
        // the cap's own comment claims "the counts above already carry the
        // verdict" — true of the verdict, false of the TRIAGE. the tally is
        // the one line that describes every hit, rendered or not
        expect(result.stdout).toMatch(
          /hits: \d+ across \d+ file\(s\) \([a-z]+ \d+/,
        );
        expect(result.stdout).toContain('ssn');
        expect(result.stdout).toContain('ein');
      });
    });
  });

  given('[case18] one roster value printed in two letter-cases', () => {
    // ⛔ THE MUTE MUST AGREE WITH ITS OWN MATCHER.
    //
    // the roster half matches case-INsensitively (`grep -noFif`), on
    // purpose — its own comment says "the same corpus prints a name in
    // three casings, and a case-sensitive sweep reports clean on the two
    // it did not think of".
    //
    // the mute one function over used an awk array subscript, which is an
    // exact string. so a human who allowlists the value AS REPORTED is
    // still blocked by a different letter-case of the same value, and the
    // only cure available to them is one allowlist line per form.
    //
    // that is not a leak; it is the other failure direction of
    // rule.require.audit-guards-by-input-type: a guard that refuses work
    // a human has already cleared gets disabled, which costs the whole
    // guarantee rather than one case.
    const NAME_TITLE = 'Dale Waverly';
    const NAME_UPPER = 'DALE WAVERLY';

    const files = {
      '.gitignore': '.pii-map\n',
      'letter.md': [`Dear ${NAME_TITLE},`, `cc: ${NAME_UPPER}`].join('\n'),
    };

    const genRepoWithMap = (extra: Record<string, string>): { dir: string } => {
      const built = genTempRepo({ files: { ...files, ...extra } });
      fs.writeFileSync(
        path.join(built.dir, '.pii-map'),
        ['# real\tsynthetic', `${NAME_TITLE}\tJordan Hale`].join('\n'),
      );
      return built;
    };

    when('[t0] no allowlist at all', () => {
      // ⭐ THE POSITIVE CONTROL, and it is mandatory. [t1] asserts an
      // ABSENCE of hits, and an absence is satisfied just as well by a
      // matcher that never saw the upper-case line as by a mute that
      // correctly cleared it. this pins that the roster DID match both.
      const repo = useBeforeAll(async () => genRepoWithMap({}));
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.', '--roster', '.pii-map'],
          cwd: repo.dir,
        }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ the roster matched BOTH forms, not just the title one', () => {
        if (!/roster 2/.test(result.stdout)) {
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.stdout).toMatch(
          /hits: 2 across 1 file\(s\) \(roster 2\)/,
        );
      });
    });

    when('[t1] the allowlist names the value as the report prints it', () => {
      const repo = useBeforeAll(async () =>
        genRepoWithMap({
          '.pii-allow': `# the fixture name, cleared by a human\n${NAME_TITLE}\n`,
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.', '--roster', '.pii-map'],
          cwd: repo.dir,
        }),
      );

      then('⭐ BOTH forms are muted — the mute agrees with the match', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('no roster hit survives', () => {
        expect(result.stdout).not.toMatch(/roster \d/);
      });
    });
  });

  given(
    '[case19] the report FOOTER — the only actionable prose it prints',
    () => {
      // ⭐ THE REMEDY LINE NAMES A PATH, AND THE PATH IS INTERPOLATED.
      //
      //    `fix each, or add the value to $ALLOW_FILE with a reason` is the
      //    single instruction a blocked operator acts on. it had ZERO
      //    assertions in ANY file, and `--allow` was never once passed to
      //    this leaf — so the interpolation was wholly unverified.
      //
      // ⚠️ hardcode `.pii-allow` into that line and the report tells an
      //    operator who ran `--allow <other>` to add the value to a file the
      //    scan does not read. they add it, re-run, stay blocked, and the
      //    only conclusion available to them is that the allowlist is broken.
      //    the gate then gets bypassed rather than fixed, which costs the
      //    whole guarantee — the failure direction
      //    rule.require.audit-guards-by-input-type names as the costlier one.
      //
      // ⭐ so this is a TIE, clamped at BOTH ends: the loader must honor the
      //    flag, and the remedy must name the same file the loader read. the
      //    default allowlist here CARRIES the hit's value, so [t0]'s hit is
      //    proof the default was never opened.
      const files = {
        // ⭐ the DEFAULT, and it would clear the hit if it were read
        '.pii-allow': `# would mute the fixture, and must NOT be read here\n${SSN_FORMATTED}\n`,
        // the file the caller actually names — it clears no value
        '.other-allow': '# a deliberately empty allowlist\n',
        'deed.md': `party id ${SSN_FORMATTED} on file`,
      };

      when('[t0] a NON-default allowlist is named', () => {
        const repo = useBeforeAll(async () => genTempRepo({ files }));
        const result = useBeforeAll(async () =>
          runSkill({
            args: ['--paths-with', '.', '--allow', '.other-allow'],
            cwd: repo.dir,
          }),
        );

        then('⭐ the DEFAULT allowlist was not read — the hit survives', () => {
          // the positive control. without it, [t1]'s path assertion is
          // satisfied by a run that read the wrong file and still echoed
          // the flag's value back
          if (result.exitCode !== 2) {
            console.log('PROOF: stdout:', result.stdout);
            console.log('PROOF: stderr:', result.stderr);
          }
          expect(result.exitCode).toBe(2);
          expect(result.stdout).toContain('deed.md');
        });

        then('⭐ the remedy names the file the scan ACTUALLY read', () => {
          expect(result.stdout).toContain(
            'add the value to .other-allow with a reason',
          );
        });

        then('⭐ and it does NOT name the default it never opened', () => {
          // the discriminator. a hardcoded remedy passes the assertion
          // above only if it is written with the flag's value, so the
          // exclusion is what separates the two
          expect(result.stdout).not.toContain('.pii-allow with a reason');
        });

        then(
          'the footer states WHY the values are masked, and the way in',
          () => {
            // a report that shows masked values and states no route to the
            // real one leaves an operator with no triage move at all — and
            // the rationale is what stops the next author from a "helpful"
            // unmask, which turns the scanner's own output into the leak
            expect(result.stdout).toContain('masked on purpose');
            expect(result.stdout).toContain('must');
            expect(result.stdout).toContain('not become the leak');
            expect(result.stdout).toContain('open the file at the line');
          },
        );
      });
    },
  );

  /**
   * .what = the arg-parse arms no case in this repo ever reached
   *
   * .why  = `parse_args` (pii.scan.via.regex.sh:144) has ELEVEN arms and
   *         only two were covered — `--help` by [case10] and `-*)` by
   *         [case11]. the `-h` alias, the rhachet passthrough, and the
   *         BARE-token catch-all had no case anywhere.
   *
   * ⚠️ `pii.scan.integration.test.ts` DOES cover `-h` and the passthrough
   *    — for the DISPATCHER, which is a different executable. that says
   *    none of whether this leaf handles them, and the two carry
   *    byte-identical usage titles, so a grep for coverage finds the
   *    dispatcher's cases and reads as complete.
   *
   * ⚠️ every assertion below reads the MESSAGE, never the exit code. this
   *    skill refuses at exit 2 from NINE sites — the two catch-alls, six
   *    guards in `validate`, and the hit verdict at :733 — so a
   *    fall-through from one arm to another is wholly invisible to
   *    `expect(exitCode).toBe(2)`.
   *
   * ⚠️ each positive sits in its own `then`, apart from its discriminator.
   *    jest halts a `then` at its first red, so an exclusion co-located
   *    with a positive can never be measured on its own.
   */
  given('[case20] the arg-parse arms', () => {
    when('[t0] the -h alias is used', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: {} }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['-h'], cwd: repo.dir }),
      );

      then('it exits 0 and renders the usage block', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--help, -h');
      });

      // ⭐ the discriminator. a dead `-h` falls to the `-*)` catch-all,
      //    which refuses at the SAME exit 2 as eight other sites — so only
      //    the absence of that message tells the two apart.
      then('⭐ it does NOT fall through to the unknown-option arm', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] rhachet passes --repo, --skill and --role', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'notes.md': 'the quarterly review met on a Tuesday' },
        }),
      );

      // ⚠️ ORDER IS LOAD-BEARING. under a `shift` defect the parser halts
      //    at the FIRST stray token, so only the value of the FIRST
      //    passthrough flag can ever leak. `--repo` leads, and its value
      //    is the needle.
      //
      // ⚠️ and `bhrain` is chosen because `scope_label()` (:573) echoes
      //    --diffs, --paths-with, --join and --paths-wout back into the
      //    report — a needle drawn from any of those would redden on
      //    CORRECT behavior.
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--repo',
            'bhrain',
            '--skill',
            'pii.scan',
            '--role',
            'transcriber',
            '--paths-with',
            '.',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it scans, rather than refuse', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('clear skies');
      });

      then('⭐ it does NOT read a flag VALUE as an argument', () => {
        expect(result.stdout).not.toContain('bhrain');
      });
    });

    when('[t2] a bare token is passed', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: {} }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['ledger.md'], cwd: repo.dir }),
      );

      then('it names the token on the unexpected-argument arm', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unexpected argument: ledger.md');
      });

      // ⭐ the two catch-alls differ ONLY by message — `-*)` says "unknown
      //    option", `*)` says "unexpected argument", and both exit 2. so a
      //    merge of the two is invisible to [case11], which passes a
      //    dash-prefixed token and would stay GREEN under it.
      then('⭐ it is NOT reported as an unknown OPTION', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });
  });

  /**
   * .what = the value-guards in `validate` (pii.scan.via.regex.sh:201)
   *
   * .why  = six of the nine exit-2 sites live here and only ONE was
   *         covered ([case13], the tracked roster). the rest are
   *         distinguishable from each other by their MESSAGE alone.
   *
   * ⛔ and the harm of a dead value-guard is not a wrong refusal — it is
   *    a CLEAN REPORT over an EMPTY SCOPE. an unvalidated --diffs value
   *    matches no arm of `files_from_diffs`, so the scan selects zero
   *    files and prints `clear skies · files: 0`, which is the exact
   *    "never opened wearing the verdict of read" failure this skill's
   *    own header names. so each guard is clamped by its message AND by
   *    the absence of that green.
   */
  given('[case21] the value-guards', () => {
    when('[t0] --diffs carries a near-miss value', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: { 'deed.md': `party id ${SSN_FORMATTED}` } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs', 'since-stage'], cwd: repo.dir }),
      );

      then('it names the value set it accepts', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(
          '--diffs must be since-staged, since-commit, or since-main',
        );
      });

      // ⭐ the harm. the fixture carries a real hit, so a dead guard does
      //    not merely accept a bad value — it reports the repo CLEAN.
      then('⭐ it does NOT report clean over a scope it never built', () => {
        expect(result.stdout).not.toContain('clear skies');
      });
    });

    when('[t1] --join carries a value outside the pair', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: { 'notes.md': 'a quiet file' } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--join', 'both', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('it names the pair it accepts', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--join must be intersect or union');
      });

      then('⭐ it is NOT reported as a --diffs fault', () => {
        expect(result.stdout).not.toContain('--diffs must be');
      });
    });

    when('[t2] --roster names a file that is not there', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: { 'notes.md': 'a quiet file' } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--roster', '.absent-map', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('it names the absent path', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('roster not found: .absent-map');
      });

      // ⭐ THE ADJACENT-GUARD DISCRIMINATOR. the three roster guards run in
      //    sequence and all exit 2. drop this one and control reaches
      //    `git check-ignore`, which fails on a path that does not exist —
      //    so the operator is told to gitignore a file they never made.
      then('⭐ it is NOT reported as a gitignore fault', () => {
        expect(result.stdout).not.toContain('roster is not gitignored');
      });
    });

    when('[t3] --roster names a file git does not ignore', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: {
            '.pii-map': 'Dale Waverly\tJordan Hale',
            'notes.md': 'a quiet file',
          },
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--roster', '.pii-map', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('it names the path and the cure', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('roster is not gitignored: .pii-map');
        expect(result.stdout).toContain('add it to .gitignore');
      });

      // the roster is present and untracked, so neither neighbouring
      // guard may claim it
      then('⭐ it is reported as neither absent nor tracked', () => {
        expect(result.stdout).not.toContain('roster not found');
        expect(result.stdout).not.toContain('roster is tracked by git');
      });
    });
  });

  /**
   * .what = the three scope flags this leaf declares and no case passed
   *
   * .why  = --paths-wout, --lockfiles and `--join union` each CHANGE THE
   *         SET OF FILES OPENED, which is the one input every verdict on
   *         this report rests on. a flag that silently does no work turns
   *         an operator's deliberate narrowing into a full scan, or their
   *         deliberate widening into a scan that skipped the file they
   *         asked for.
   *
   * ⚠️ every absence assertion below is paired with a POSITIVE CONTROL —
   *    the same fixture, scanned without the flag, proving the value was
   *    reachable at all. without it, "the hit is gone" is satisfied just
   *    as well by a fixture the detector never matched.
   */
  given('[case22] the scope flags with no prior case', () => {
    const withVendor = {
      'vendor/dep.md': `party id ${SSN_FORMATTED}`,
      'notes.md': 'a quiet file',
    };

    when('[t0] the vendor path is left in scope', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: withVendor }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      // the positive control for [t1]
      then('⭐ the value IS reachable without the subtraction', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('vendor/dep.md');
      });
    });

    when('[t1] --paths-wout subtracts that path', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: withVendor }));
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.', '--paths-wout', 'vendor'],
          cwd: repo.dir,
        }),
      );

      then('⭐ the hit is gone and the scan reports clean', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('clear skies');
      });

      then('⭐ the subtracted path is named on the scope line', () => {
        // a subtraction that never reached scope_label is a scope the
        // reader cannot audit — the report would claim a scope it did
        // not scan
        expect(result.stdout).toContain('minus vendor');
      });
    });

    const withLockfile = {
      'pnpm-lock.yaml': `integrity ${SSN_BARE} sha512`,
      'notes.md': 'a quiet file',
    };

    when('[t2] a lockfile is in scope by default', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: withLockfile }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: repo.dir }),
      );

      then('it reports clean, and SAYS the lockfile was never opened', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('lockfile 1');
        expect(result.stdout).toContain('never opened');
      });
    });

    when('[t3] --lockfiles opts the lockfile back in', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: withLockfile }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.', '--lockfiles'],
          cwd: repo.dir,
        }),
      );

      then('⭐ the lockfile IS opened, and its hit is reported', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('pnpm-lock.yaml');
      });

      // ⭐ the discriminator. `--lockfiles` takes NO value, so it is the
      //    one flag on this arm list that shifts by 1. a `shift 2` there
      //    would swallow the next token — and with the flag last there is
      //    no next token, so the defect would hide. it is passed LAST
      //    here deliberately, and the skip line is what reports it.
      then('⭐ the lockfile is no longer counted as skipped', () => {
        expect(result.stdout).not.toContain('lockfile 1');
      });
    });

    when('[t4] --diffs and --paths-with select disjoint sets', () => {
      const disjoint = {
        'staged.md': `party id ${SSN_FORMATTED}`,
        'loose.md': `party id ${SSN_FORMATTED}`,
      };

      const repoIntersect = useBeforeAll(async () =>
        genTempRepo({ files: disjoint, stage: ['staged.md'] }),
      );
      const intersected = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--paths-with', 'loose.md'],
          cwd: repoIntersect.dir,
        }),
      );

      const repoUnion = useBeforeAll(async () =>
        genTempRepo({ files: disjoint, stage: ['staged.md'] }),
      );
      const unioned = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--paths-with',
            'loose.md',
            '--join',
            'union',
          ],
          cwd: repoUnion.dir,
        }),
      );

      // ⛔ the default is correct AND is the failhide shape: two files,
      //    each carrying a real value, and the report is green because
      //    the intersection is empty
      then('the default intersect selects neither, and reports clean', () => {
        expect(intersected.exitCode).toBe(0);
        expect(intersected.stdout).toContain('clear skies');
      });

      then('⭐ --join union selects BOTH, and both hits are reported', () => {
        expect(unioned.exitCode).toBe(2);
        expect(unioned.stdout).toContain('staged.md');
        expect(unioned.stdout).toContain('loose.md');
      });

      then('⭐ the scope line says which join was applied', () => {
        expect(unioned.stdout).toContain('union');
        expect(intersected.stdout).toContain('intersect');
      });
    });
  });

  /**
   * ⛔ THE GUARD THAT DECIDES WHETHER THE SCANNER CAN WORK AT ALL, and no
   *    case in this file had ever reached it. all 22 above run inside a
   *    `genTempRepo` work tree BY CONSTRUCTION — the helper's second line
   *    is `git init`, so the precondition under test here is the one
   *    condition every other fixture guarantees.
   *
   *    the scanner derives its ENTIRE scope from git: `files_from_paths_with`
   *    and `files_from_tree` are `git ls-files`, `files_from_diffs` is
   *    `git diff`. outside a work tree there is no scope to derive, so
   *    `validate` refuses up front rather than let the run reach a scope it
   *    cannot build.
   *
   * ⚠️ the fixture is a BARE mkdtemp, deliberately not `genTempRepo`. the
   *    helper would satisfy the precondition it is meant to remove.
   */
  given('[case23] a directory that is NOT a git work tree', () => {
    const bare = useBeforeAll(async () => ({
      dir: fs.mkdtempSync(path.join(os.tmpdir(), 'pii-scan-nogit-')),
    }));

    when('[t0] the scanner is invoked there', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--paths-with', '.'], cwd: bare.dir }),
      );

      then('it refuses at exit 2 — a CONSTRAINT, not a malfunction', () => {
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ SPLIT from the exit-code clamp above on purpose. jest halts a
       *    `then` at its first red, so two clamps in one block can never be
       *    measured apart.
       *
       *    MEASURED 2026-09-04, guard deleted from `validate()`:
       *      exit code = 128   (git's own, propagated by `set -euo pipefail`)
       *      stdout    = ""    (empty — no reason reaches the caller at all)
       *    both clamps went red, 77/2.
       *
       * ⚠️ the exit-code clamp bites here only because git happens to exit
       *    128 rather than 2. that is a fact about the DEPENDENCY, not about
       *    the guard — had the fall-through exited 2, it would have stayed
       *    GREEN over a run that never checked the precondition. the message
       *    clamp carries the weight: an empty stdout cannot be told apart
       *    from a refusal by any assertion over the code alone.
       */
      then('⭐ and it NAMES the reason', () => {
        expect(result.stdout).toContain('not inside a git work tree');
      });
    });
  });
});
