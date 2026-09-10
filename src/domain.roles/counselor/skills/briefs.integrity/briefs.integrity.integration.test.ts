import { given, then, useThen, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

describe('briefs.integrity', () => {
  const scriptPath = path.join(__dirname, 'briefs.integrity.sh');

  const runSkill = (
    args: string[],
  ): { stdout: string; stderr: string; exitCode: number } => {
    // .note = `encoding` is the spawnSync option name, not our term
    const result = spawnSync('bash', [scriptPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
      env: process.env,
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = mask only the VOLATILE digits in tree / stderr text
   * .why = the furniture a caller reads (labels, emoji, tree glyphs, defect
   *        detail) is the contract a snapshot guards. only three digit-runs
   *        drift as the corpus evolves: a count row (`nitpicks: 10`), a line
   *        ref (`.md:45`), and a source ordinal (`source 5's`). mask exactly
   *        those.
   * .note = ⛔ a blanket `\d+ -> #` was rejected — it erased the citation
   *        bytes INSIDE a detail string (`§ 227` -> `§ #`, `§ 64.1200` ->
   *        `§ #.#`), so a regression that broke a statute cite would never
   *        surface in the diff. the citations are deterministic; they stay.
   */
  const maskCounts = (raw: string): string =>
    raw
      .replace(/(: )\d+$/gm, '$1#') // a count row: `nitpicks: 10`
      .replace(/(\.md):\d+/g, '$1:#') // a line ref: `foo.[ref].md:45`
      .replace(/source \d+'s/g, "source #'s"); // a source ordinal in detail

  /**
   * .what = mask only the VOLATILE numeric fields of the json variant
   * .why = the --format json contract a machine reader consumes is the keys,
   *        the per-check tally shape, and the defect-record fields. the counts
   *        (reach, tallies, per-check values) and each defect's line number
   *        drift with the corpus; the source ordinal drifts inside detail.
   *        mask those and leave `detail` citation bytes (`§ 227`) intact, so a
   *        cite-breaking regression still breaks the snapshot.
   */
  const maskJson = (raw: string): string => {
    const parsed = JSON.parse(raw);
    parsed.briefsReached = '#';
    parsed.briefsWithDefects = '#';
    parsed.blockers = '#';
    parsed.nitpicks = '#';
    parsed.countByCheck = Object.fromEntries(
      Object.keys(parsed.countByCheck).map((key) => [key, '#']),
    );
    parsed.defects = parsed.defects.map(
      (defect: { line: number; detail: string }) => ({
        ...defect,
        line: '#',
        detail: defect.detail.replace(/source \d+'s/g, "source #'s"),
      }),
    );
    return JSON.stringify(parsed);
  };

  given('[case1] --help flag', () => {
    when('[t0] help is requested', () => {
      const result = useThen('the skill exits cleanly', async () =>
        runSkill(['--help']),
      );

      then('usage, options, and an example are all shown', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--path');
        expect(result.stdout).toContain('--severity');
        expect(result.stdout).toContain('--check');
        expect(result.stdout).toContain('examples:');
      });

      then('every check is named, so the reader can find one', () => {
        expect(result.stdout).toContain('fullsun-names-non-fullsun');
        expect(result.stdout).toContain('absence-claim-falsified-exact');
        expect(result.stdout).toContain('non-fullsun-in-published-path');
      });

      then('the help text is snapshotted', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] an unknown argument', () => {
    when('[t0] the skill is called with it', () => {
      const result = useThen('the skill rejects it', async () =>
        runSkill(['--nonsuch', 'x']),
      );

      then('it exits 2 — a caller must fix the input', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('the error names the fix, never only the symptom', () => {
        expect(result.stderr).toContain('unknown argument');
        expect(result.stderr).toContain('--help');
      });

      then('the rejection stderr is snapshotted, so a caller sees it', () => {
        // the negative-path variant a caller hits on a typo; deterministic
        // (no counts), so it snapshots raw.
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case3] a path that does not exist', () => {
    when('[t0] the skill is called with it', () => {
      const result = useThen('the skill rejects it', async () =>
        runSkill(['--path', 'src/does.not.exist']),
      );

      then('it exits 2 with a copy-paste fix', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stderr).toContain('no directory at');
        expect(result.stderr).toContain('briefs.integrity.sh --path');
      });

      then('the bad-path stderr is snapshotted, counts masked', () => {
        // the error names the bad path back to the caller; that path is the
        // one they typed, so the mask keeps this deterministic across roots.
        expect(maskCounts(result.stderr)).toMatchSnapshot();
      });
    });
  });

  given('[case4] the live comms briefs, json format', () => {
    when('[t0] the skill runs over them', () => {
      const result = useThen('the skill completes', async () =>
        runSkill([
          '--path',
          'src/domain.roles/counselor/briefs/market/comms',
          '--format',
          'json',
        ]),
      );

      then('it exits 0 — the comms set holds only nitpicks, no blocker', () => {
        // ⚖️ the exit contract: nitpicks alone never drive exit 2. only a
        // recorded blocker does. this proves the comms deliverable ships clean.
        expect(result.exitCode).toEqual(0);
      });

      then('it emits parseable json that names the scope it read', () => {
        const parsed = JSON.parse(result.stdout);
        expect(parsed.root).toEqual(
          'src/domain.roles/counselor/briefs/market/comms',
        );
        expect(parsed).toHaveProperty('blockers');
        expect(parsed).toHaveProperty('nitpicks');
        expect(parsed).toHaveProperty('countByCheck');
        expect(parsed).toHaveProperty('briefsReached');
      });

      then('⭐ a narrowed scope warns that a check is weakened by it', () => {
        // the cross-file check can only see the set it is given. a scope
        // that silently weakens a check is the exact defect this skill
        // exists to end, so the narrowed reach is stated rather than hidden.
        expect(result.stderr).toContain('scope narrowed');
        expect(result.stderr).toContain('fullsun-names-non-fullsun');
      });

      then('the json variant shape is snapshotted, counts masked', () => {
        // the --format json contract a machine reader consumes: keys, the
        // per-check tally shape, the defect-record fields. only the volatile
        // numeric fields are masked; detail citation bytes (`§ 227`) stay, so
        // a cite regression still breaks this snapshot.
        expect(maskJson(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case5] a brief set with a known blocker', () => {
    when('[t0] the skill runs over the whole roles tree', () => {
      const result = useThen('the skill completes', async () =>
        runSkill(['--severity', 'blocker', '--format', 'json']),
      );

      then('it exits 2 — the corpus holds recorded legacy debt', () => {
        // ⚠️ this asserts the EXIT CONTRACT, not a defect count. the count
        // is ratcheted by the jest gate in domain.operations/brief; here
        // we only prove that a blocker drives exit 2 rather than exit 0.
        const parsed = JSON.parse(result.stdout);
        expect(parsed.blockers).toBeGreaterThan(0);
        expect(result.exitCode).toEqual(2);
      });

      then('the reach is reported, never only the defect count', () => {
        // a suite that reaches no file reports zero defects and looks
        // identical to a clean pass. so the count of briefs reached is
        // part of the result.
        //
        // ⛔ an earlier form of this assertion read `briefsWithDefects`,
        // which IS the defect count — so it could never fail for the reason
        // its own title named. the two fields are asserted separately now,
        // and the strict inequality below is what proves they are measured
        // differently rather than one derived from the other.
        const parsed = JSON.parse(result.stdout);
        expect(parsed.briefsReached).toBeGreaterThan(100);
        expect(parsed.briefsWithDefects).toBeGreaterThan(0);
        expect(parsed.briefsReached).toBeGreaterThan(parsed.briefsWithDefects);
      });
    });
  });

  given('[case6] the tree format', () => {
    when('[t0] the skill runs over one brief folder', () => {
      const result = useThen('the skill completes', async () =>
        runSkill(['--path', 'src/domain.roles/counselor/briefs/market/comms']),
      );

      then('it exits 0 and reports the briefs hold — nitpicks only', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('⚖️ the briefs hold');
      });

      then('it emits the counselor treestruct', () => {
        expect(result.stdout).toContain('⚖️');
        expect(result.stdout).toContain('📋 briefs.integrity');
        expect(result.stdout).toContain('blockers:');
        expect(result.stdout).toContain('nitpicks:');
      });

      then('the tree variant furniture is snapshotted, counts masked', () => {
        // the primary stdout a human reads: the ⚖️ header, the 📋 tree glyphs,
        // the labelled rows, the defect lines. counts + line numbers masked so
        // a format regression surfaces without a count drift breaking it.
        expect(maskCounts(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case7] a hermetic corpus with a single clean brief', () => {
    // a temp dir under a `/briefs/` segment — the only path getAllBriefsOnDisk
    // reaches. the fixture trips zero checks: it claims a citation exemption
    // (so the source-count + anchor checks stand down), carries the not-advice
    // callout, a `## .date researched` header, and a `## .publishability`
    // fullsun tag. a temp dir is not a published path, so the scaffold /
    // non-fullsun checks cannot fire either.
    const tempRoot = mkdtempSync(
      path.join(tmpdir(), 'briefs-integrity-clean-'),
    );
    const briefsDir = path.join(tempRoot, 'briefs');
    mkdirSync(briefsDir, { recursive: true });
    writeFileSync(
      path.join(briefsDir, 'index.example.[ref].md'),
      [
        '# index.example',
        '',
        '## .what',
        '',
        'this is a navigation artifact that makes no independent factual claim;',
        'it only points a reader at the briefs that hold the substance.',
        '',
        '> not legal advice.',
        '',
        '## .publishability',
        '',
        '**fullsun** — a pure index over public briefs, no withheld content.',
        '',
        '## .date researched',
        '',
        '2026-09-08',
        '',
      ].join('\n'),
    );

    when('[t0] the skill runs over it', () => {
      const result = useThen('the skill completes', async () =>
        runSkill(['--path', briefsDir]),
      );

      then('it exits 0 — a clean corpus holds', () => {
        // ⚖️ the happy path: no defect on any check, so exit 0 and the
        // affirmative "the briefs hold" banner. this is the pit-of-success
        // baseline every narrowed run is measured against.
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('⚖️ the briefs hold');
        expect(result.stdout).toContain('no defect detected in scope');
      });

      then('the clean tree is snapshotted, temp root normalized', () => {
        // the reader-faced clean-pass furniture: the affirmative banner, the
        // tally rows all at zero, the "no defect" terminus. the temp root is
        // normalized to <tmp> so the snapshot is stable across machines.
        const normalized = maskCounts(result.stdout)
          .split(tempRoot)
          .join('<tmp>');
        expect(normalized).toMatchSnapshot();
      });
    });
  });

  given('[case8] a check filter and a nitpick severity filter', () => {
    when('[t0] --check narrows to one check over the comms set', () => {
      const result = useThen('the skill completes', async () =>
        runSkill([
          '--path',
          'src/domain.roles/counselor/briefs/market/comms',
          '--check',
          'source-anchor-unreferenced',
          '--format',
          'json',
        ]),
      );

      then('only the named check appears in the tally', () => {
        // --check is a reporting filter: it must narrow the tally to exactly
        // the requested check, never widen or drop it.
        const parsed = JSON.parse(result.stdout);
        expect(Object.keys(parsed.countByCheck)).toEqual([
          'source-anchor-unreferenced',
        ]);
        expect(
          parsed.defects.every(
            (defect: { check: string }) =>
              defect.check === 'source-anchor-unreferenced',
          ),
        ).toEqual(true);
      });
    });

    when('[t0] --severity nitpick narrows the comms set', () => {
      const result = useThen('the skill completes', async () =>
        runSkill([
          '--path',
          'src/domain.roles/counselor/briefs/market/comms',
          '--severity',
          'nitpick',
          '--format',
          'json',
        ]),
      );

      then('every reported defect is a nitpick, and exit is 0', () => {
        // --severity nitpick is a DISPLAY filter over a nitpick-only set. it
        // must exit 0 (no blocker) and surface only nitpick records.
        const parsed = JSON.parse(result.stdout);
        expect(result.exitCode).toEqual(0);
        expect(parsed.severity).toEqual('nitpick');
        expect(
          parsed.defects.every(
            (defect: { severity: string }) => defect.severity === 'nitpick',
          ),
        ).toEqual(true);
      });
    });

    when('[t0] --severity blocker filters a nitpick-only set to empty', () => {
      const result = useThen('the skill completes', async () =>
        runSkill([
          '--path',
          'src/domain.roles/counselor/briefs/market/comms',
          '--severity',
          'blocker',
          '--format',
          'json',
        ]),
      );

      then('the display filter empties defects while the tally stands', () => {
        // ⚖️ a distinct caller-encounterable shape: over a nitpick-only set,
        // --severity blocker empties the displayed defects (countByCheck: {},
        // defects: []) yet the tally still reports the true nitpick count. this
        // proves the DISPLAY filter never touches the counted totals.
        const parsed = JSON.parse(result.stdout);
        expect(result.exitCode).toEqual(0);
        expect(parsed.countByCheck).toEqual({});
        expect(parsed.defects).toEqual([]);
        expect(parsed.nitpicks).toBeGreaterThan(0);
      });

      then(
        'the blocker-filtered json variant is snapshotted, counts masked',
        () => {
          // the blocker-display variant a caller meets: the same envelope, an
          // empty per-check tally and defect list, the true counts pinned by the
          // json mask. a distinct baseline from the defect-laden case4.
          expect(maskJson(result.stdout)).toMatchSnapshot();
        },
      );
    });
  });
});
