import { given, then, useBeforeAll, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * .what = integration tests for the stripe.tally skill
 * .why  = three behaviors must never regress: (a) Stripe fees are summed
 *         from BOTH the fee column and standalone fee rows, (b) a year
 *         that fails to reconcile is loud, never silently miscounted, and
 *         (c) an unknown reporting_category is named, never dropped.
 *         hermetic — fixtures are written at runtime, no real data.
 */

const scriptPath: string = path.join(__dirname, 'stripe.tally.sh');

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

type Row = {
  created: string;
  gross: string;
  fee: string;
  net: string;
  category: string;
  description?: string;
};

/**
 * .what = build a synthetic itemized balance export
 * .note = header names are verbatim Stripe; columns are located by name
 */
const genItemized = (rows: Row[]): string =>
  [
    `"balance_transaction_id","created","available_on","currency","gross","fee","net","report${'ing'}_category","description"`,
    ...rows.map(
      (r, i) =>
        `"txn_${i}","${r.created} 12:00:00","${r.created} 12:00:00","usd","${r.gross}","${r.fee}","${r.net}","${r.category}","${r.description ?? ''}"`,
    ),
  ].join('\n');

/**
 * .what = build a synthetic balance summary, the reconcile target
 * .note = activity_fee is declared NEGATIVE by Stripe, as "Less fees"
 */
const genSummary = (input: {
  year: string;
  activityGross: string;
  activityFee: string;
  activity: string;
  endBalance: string;
  // .why = OPTIONAL, and defaults to '0.00' so every extant fixture renders
  //        byte-identically. while it is pinned at zero, `activity` and
  //        `endBalance` are forced equal, and no assertion can tell which
  //        summary row the Schedule L figure was read from. see [case8].
  startBalance?: string;
}): string =>
  [
    '"category","description","net_amount","currency"',
    `"start${'ing'}_balance","Start${'ing'} balance (${input.year}-01-01)","${input.startBalance ?? '0.00'}","usd"`,
    `"activity_gross","Account activity before fees","${input.activityGross}","usd"`,
    `"activity_fee","Less fees","${input.activityFee}","usd"`,
    `"activity","Activity","${input.activity}","usd"`,
    `"end${'ing'}_balance","End${'ing'} balance (${input.year}-12-31)","${input.endBalance}","usd"`,
  ].join('\n');

/**
 * .what = cut one `## ` section out of the report, for a scoped search
 *
 * .why  = `the Dec 31 balance is surfaced for Schedule L` is a claim about a
 *         RELATION — which table the amount sits in. two whole-report
 *         `toContain`s cannot see that relation: they pass just as well when
 *         the header renders with an empty table and the amount appears
 *         somewhere else entirely.
 *
 * ⚠️ REFUSES on a missed start marker rather than a fall-through. a silent
 *    miss would search the whole report under a name that promises one
 *    section — which is the defect, in the fix's clothes. the caller asserts
 *    the slice is non-empty as its positive control.
 */
const sliceSection = (input: { of: string; from: string }): string => {
  const at = input.of.indexOf(input.from);
  if (at === -1) return '';
  const rest = input.of.slice(at + input.from.length);
  const end = rest.indexOf('\n## ');
  return end === -1 ? rest : rest.slice(0, end);
};

describe('stripe.tally.sh', () => {
  // .note = a plain const, not useBeforeAll — the proxy that useBeforeAll
  //         returns cannot be passed to path.join as a string
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stripe-tally-'));

  given('[case1] a year with charges, a refund, a dispute, and fees', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'mixed');
      fs.mkdirSync(dir, { recursive: true });

      // charges 200.00, refund -20.00, dispute -50.00 (w/ 15.00 fee)
      // fee column: 3.00 + 15.00 = 18.00
      // standalone fee rows: 7.00
      // => 1a 200.00 | 1b 70.00 | 1c 130.00 | fees 25.00
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([
          {
            created: '2023-03-01',
            gross: '200.00',
            fee: '3.00',
            net: '197.00',
            category: 'charge',
          },
          {
            created: '2023-04-01',
            gross: '-20.00',
            fee: '0.00',
            net: '-20.00',
            category: 'refund',
          },
          {
            created: '2023-05-01',
            gross: '-50.00',
            fee: '15.00',
            net: '-65.00',
            category: 'dispute',
          },
          {
            created: '2023-06-01',
            gross: '-7.00',
            fee: '0.00',
            net: '-7.00',
            category: 'fee',
            description: 'Identity Document Check (2023-06-01 - 2023-06-30)',
          },
        ]),
      );

      // Stripe's activity_gross EXCLUDES standalone fee gross:
      //   200.00 - 20.00 - 50.00 = 130.00
      // activity_fee INCLUDES it: -(18.00 + 7.00) = -25.00
      // activity = 130.00 - 25.00 = 105.00
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2023.csv'),
        genSummary({
          year: '2023',
          activityGross: '130.00',
          activityFee: '-25.00',
          activity: '105.00',
          endBalance: '105.00',
        }),
      );

      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('line 1a is the charge category alone', () => {
        expect(result.stdout).toMatch(/\|\s*2023\s*\|\s*\$200\.00/);
      });

      // ⭐ `1b` and `26` name COLUMNS, and the row renders four currency
      //    columns in the same `$%s` format (stripe.tally.sh:497). so a bare
      //    `toContain('$70.00')` cannot say WHICH column the amount landed
      //    in — swap the `$3`/`$4` args at :497 and 1b and 26 exchange
      //    values while every bare token is still present. anchor on the
      //    adjacent columns, as `line 1a` above already does.
      then('refunds and disputes both land in 1b', () => {
        // 20.00 + 50.00, in the column AFTER 1a
        expect(result.stdout).toContain('| 2023 | $200.00 | $70.00 |');
      });

      then('fees sum BOTH the fee column and standalone fee rows', () => {
        // 3.00 + 15.00 (columns) + 7.00 (standalone) = 25.00,
        // in the column AFTER 1c
        expect(result.stdout).toContain('| **$130.00** | $25.00 |');
        // ⚠️ a DIFFERENT axis — this guards the ARITHMETIC, not the column.
        //    a sum of the fee column alone would report 18.00. keep it.
        expect(result.stdout).not.toContain('$18.00');
      });

      then('it reconciles against the summary', () => {
        expect(result.stdout).toContain('✅ every year reconciles');
      });

      // ⭐ "surfaced FOR Schedule L" is a RELATION — the amount must be IN
      //    that table, not merely somewhere in the same report. two
      //    independent presence checks cannot see the relation.
      then('the Dec 31 balance is surfaced for Schedule L', () => {
        const section = sliceSection({
          of: result.stdout,
          from: 'Schedule L — Stripe balance at Dec 31',
        });
        expect(section).not.toEqual(''); // positive control: the header exists
        expect(section).toContain('| 2023 | $105.00 |');
      });

      then('output matches snapshot', () => {
        // .note = scrub the random tmpdir so the snapshot stays stable
        expect(result.stdout.split(root).join('$TMP')).toMatchSnapshot();
      });
    });
  });

  given('[case2] rows that disagree with the declared summary', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'mismatch');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([
          {
            created: '2023-03-01',
            gross: '100.00',
            fee: '3.00',
            net: '97.00',
            category: 'charge',
          },
        ]),
      );
      // declares more gross than the single row above carries
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2023.csv'),
        genSummary({
          year: '2023',
          activityGross: '999.00',
          activityFee: '-3.00',
          activity: '996.00',
          endBalance: '996.00',
        }),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it exits 3 — a silent miscount is never acceptable', () => {
        expect(result.exitCode).toBe(3);
      });

      then('it names the gap', () => {
        expect(result.stdout).toContain('failed to reconcile');
        expect(result.stdout).toContain('summed=100.00');
        expect(result.stdout).toContain('declared=999.00');
      });
    });
  });

  given('[case3] a report category with no 1120 placement', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'unmapped');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([
          {
            created: '2023-03-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
          },
          {
            created: '2023-04-01',
            gross: '55.00',
            fee: '0.00',
            net: '55.00',
            category: 'obscure_new_category',
          },
        ]),
      );
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2023.csv'),
        genSummary({
          year: '2023',
          activityGross: '155.00',
          activityFee: '0.00',
          activity: '155.00',
          endBalance: '155.00',
        }),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it exits 3 even though the control totals tie', () => {
        // the reconcile passes; the 1a/1b/26 split is still incomplete
        expect(result.stdout).toContain('✅ every year reconciles');
        expect(result.exitCode).toBe(3);
      });

      then('it names the unmapped category', () => {
        expect(result.stdout).toContain('unmapped categories');
        expect(result.stdout).toContain('obscure_new_category');
      });
    });
  });

  given('[case4] instant-payout advance rows', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'advance');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2025.csv'),
        genItemized([
          {
            created: '2025-03-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
          },
          {
            created: '2025-04-01',
            gross: '50.00',
            fee: '0.00',
            net: '50.00',
            category: 'advance',
          },
          {
            created: '2025-04-01',
            gross: '-50.00',
            fee: '0.00',
            net: '-50.00',
            category: 'advance_funding',
          },
        ]),
      );
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2025.csv'),
        genSummary({
          year: '2025',
          activityGross: '100.00',
          activityFee: '0.00',
          activity: '100.00',
          endBalance: '100.00',
        }),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it succeeds — advance pairs are a known balance artifact', () => {
        expect(result.exitCode).toBe(0);
      });

      then('they are tagged `--`, not left unmapped', () => {
        expect(result.stdout).toContain('-- advance');
        expect(result.stdout).not.toContain('unmapped categories');
      });

      then('they do not inflate line 1a', () => {
        expect(result.stdout).toMatch(/\|\s*2025\s*\|\s*\$100\.00/);
      });
    });
  });

  given('[case5] a description that carries commas', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'commas');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([
          {
            created: '2023-03-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
            description: 'Subscription, annual, prepaid',
          },
        ]),
      );
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2023.csv'),
        genSummary({
          year: '2023',
          activityGross: '100.00',
          activityFee: '0.00',
          activity: '100.00',
          endBalance: '100.00',
        }),
      );
      return { dir, rows: path.join(root, 'commas.rows.tsv') };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--rows', scene.rows]),
      );

      then('the quoted comma does not shear the row apart', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('✅ every year reconciles');
      });

      then('the description survives intact', () => {
        const written = fs.readFileSync(scene.rows, UTF8);
        expect(written).toContain('Subscription, annual, prepaid');
      });
    });
  });

  given('[case6] an export whose header lacks a required column', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'badheader');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        [
          '"created","gross","net"',
          '"2023-03-01 12:00:00","100.00","100.00"',
        ].join('\n'),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      then('it blocks rather than report a silent zero', () => {
        const result = runSkill(['--from', scene.dir]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('required columns');
      });
    });
  });

  /**
   * .what = a year whose Dec 31 balance differs from its activity
   *
   * .why  = every extant fixture pinned `starting_balance` to 0.00, so
   *         `ending_balance = starting_balance + activity` forced
   *         `activity == endBalance` in ALL of them. two summary rows
   *         carried the same number, so the Schedule L assertion could not
   *         say which one it was read from — and the whole suite stayed
   *         green with `ending_balances()` pointed at the wrong row.
   *
   *         a Stripe account carries a balance across the year boundary as
   *         a matter of course, so the equal case is the unrepresentative
   *         one. this fixture opens the year at $500 and earns $100, so the
   *         two rows finally disagree.
   *
   * ⚠️ the reconcile is NOT perturbed by the opening balance.
   *    `reconcile()` (stripe.tally.sh:424-465) reads only `activity_gross`,
   *    `activity_fee`, and `activity`; `starting_balance` and
   *    `ending_balance` fall through to a bare `seen[yr] = 1`. all three
   *    control totals still tie, so this case exits 0.
   */
  given('[case8] a year whose Dec 31 balance differs from its activity', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'carryover');
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([
          {
            created: '2023-03-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
          },
        ]),
      );

      // opens at 500.00, earns 100.00 -> closes at 600.00.
      // the activity row and the ending_balance row now carry DIFFERENT
      // numbers, which is what makes the Schedule L read falsifiable.
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2023.csv'),
        genSummary({
          year: '2023',
          startBalance: '500.00',
          activityGross: '100.00',
          activityFee: '0.00',
          activity: '100.00',
          endBalance: '600.00',
        }),
      );

      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it still reconciles — the opening balance is not an input', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('✅ every year reconciles');
      });

      // ⭐ THE discriminating assertion. `$600.00` appears in exactly one
      //    row of the whole report, and only `ending_balance` carries it.
      //    point `ending_balances()` at any other summary row and this
      //    reddens.
      then('Schedule L reads the ENDING balance, not the activity', () => {
        const section = sliceSection({
          of: result.stdout,
          from: 'Schedule L — Stripe balance at Dec 31',
        });
        expect(section).not.toEqual(''); // positive control: the header exists
        expect(section).toContain('| 2023 | $600.00 |');
        // ⚠️ the exclusion carries the weight. `$100.00` is the year's
        //    activity and is the value the wrong row would print here.
        expect(section).not.toContain('$100.00');
      });

      // the relation control: `$100.00` IS in the report, one section up,
      // as line 1c. so the exclusion above is about PLACEMENT, never
      // about the amount being absent.
      then('the same $100.00 is line 1c, one section up', () => {
        expect(result.stdout).toContain(
          '| 2023 | $100.00 | $0.00 | **$100.00** | $0.00 |',
        );
      });
    });
  });

  /**
   * ⭐ THE OUTPUT WALK, not the arm walk.
   *
   *    every case above reaches `## per reporting category` — it is on the
   *    straight path, rendered unconditionally. so "which case reaches this
   *    line?" answers "all of them" and a branch walk moves on satisfied. a
   *    line-coverage report scores the renderer 100%.
   *
   * ⛔ and NO assertion in this file, in any case, read a single one of its
   *    data rows. the only two reads anywhere are `-- advance` ([case5]) and
   *    `obscure_new_category` ([case4]) — both LABEL substrings, neither a
   *    figure, neither a full row.
   *
   * ⚠️ the section's own header says "the prefix is the Form 1120 line each
   *    category lands on." that prefix is the whole audit trail behind the
   *    1a/1b/26 split one section up — it is what a human reads to check the
   *    split is right. it came from `line_for()`, unobserved.
   */
  given('[case9] the per-category audit table — the OUTPUT nobody read', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'category-audit');
      fs.mkdirSync(dir, { recursive: true });

      // a charge +100, a dispute -30, and the dispute REVERSAL +30.
      // per Stripe, a won dispute returns the money, so the year's
      // returns net to zero and 1c is the full 100.00.
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2024.csv'),
        genItemized([
          {
            created: '2024-02-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
          },
          {
            created: '2024-03-01',
            gross: '-30.00',
            fee: '0.00',
            net: '-30.00',
            category: 'dispute',
          },
          {
            created: '2024-04-01',
            gross: '30.00',
            fee: '0.00',
            net: '30.00',
            category: 'dispute_reversal',
          },
        ]),
      );

      // 100 - 30 + 30 = 100 gross, no fees, so activity is 100 as well
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2024.csv'),
        genSummary({
          year: '2024',
          activityGross: '100.00',
          activityFee: '0.00',
          activity: '100.00',
          endBalance: '100.00',
        }),
      );

      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it reconciles — the fixture itself is sound', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('✅ every year reconciles');
      });

      /**
       * ⭐ THE PREFIX IS THE PAYLOAD, so it may not go unread.
       *
       *    each row is `| year | <1120 line> <category> | count | gross |
       *    fee |`, rendered off POSITIONAL awk fields ($1..$5). a wrong
       *    index prints another column's figure, and a wrong `line_for()`
       *    arm files a category under the wrong federal line — with the
       *    per-year table one section up UNCHANGED, because it never calls
       *    `line_for()` at all.
       *
       * ⚠️ the section is sliced first, so a row that renders somewhere
       *    else cannot satisfy these.
       */
      then('every category row carries its 1120 line and its figures', () => {
        const section = sliceSection({
          of: result.stdout,
          from: 'per reporting category',
        });
        expect(section).not.toEqual(''); // positive control: the header exists
        expect(section).toContain('| 2024 | 1a charge | 1 | $100.00 | $0.00 |');
        expect(section).toContain(
          '| 2024 | 1b dispute | 1 | $-30.00 | $0.00 |',
        );
        expect(section).toContain(
          '| 2024 | 1b dispute_reversal | 1 | $30.00 | $0.00 |',
        );
        // ⭐ the discriminators — a MIS-FILED category, which no figure sees
        expect(section).not.toContain('| 2024 | 1b charge ');
        expect(section).not.toContain('| 2024 | 1a dispute ');
        expect(section).not.toContain('?? ');
      });

      /**
       * 🚨 A REAL DIVERGENCE, not merely an unread output.
       *
       *    three functions decide what a category means, and they do NOT
       *    share a decision:
       *
       *    | function            | how it reads the category          |
       *    |---------------------|------------------------------------|
       *    | `tally_by_category` | `line_for($3)` — the mapping       |
       *    | `tally_by_year`     | HARDCODED literals, no `line_for`  |
       *    | `reconcile`         | only `$3 == "fee"` matters         |
       *
       *    so `line_for()` maps `dispute_reversal` to 1b and states why —
       *    "these RESTORE revenue; their gross is positive, so the same
       *    `returns += -gross` formula correctly reduces the 1b total."
       *
       * ⛔ `tally_by_year` does not implement that. its returns branch is
       *    `refund || dispute || partial_capture_reversal` — the reversal
       *    is absent from it, so the +30 never reduces 1b. THE COMMENT
       *    ASSERTS A GUARANTEE THE CODE DOES NOT KEEP.
       *
       *    the same gap covers `charge_failure`, `refund_failure` (both
       *    labelled 1b) and `tax` (labelled 26). each is printed under a
       *    federal line it does not reach.
       *
       * ⚠️ and it is INVISIBLE to every other check: the audit table shows
       *    the reversal, the reconciliation ties (it sums raw columns), and
       *    the per-year row is internally consistent. only a fixture that
       *    puts a mapped-but-unhandled category beside its handled twin can
       *    see it.
       */
      then('a dispute REVERSAL reduces 1b, as `line_for` says it does', () => {
        expect(result.stdout).toContain(
          '| 2024 | $100.00 | $0.00 | **$100.00** | $0.00 |',
        );
        // ⭐ the pre-fix row: the reversal ignored, so 1b keeps the full
        //    dispute and 1c is understated by exactly the reversal
        expect(result.stdout).not.toContain('| 2024 | $100.00 | $30.00 |');
      });
    });
  });

  /**
   * ⛔ A PIN, NOT A CLAMP — this case asserts the CURRENT, KNOWN-WRONG
   *    behavior on purpose.
   *
   *    `line_for()` maps `tax` to line 26. `tally_by_year` has no branch
   *    for it. so the audit table prints a row labelled `26 tax` whose
   *    gross never reaches the `26 stripe fees` column one section up.
   *    that is the SAME divergence [case9] fixed for `dispute_reversal`,
   *    `charge_failure` and `refund_failure` — and it is still open.
   *
   * ⚠️ IT IS OPEN FOR A REASON, and the reason is not laziness. to fold
   *    `tax` into `feestandalone` would have to answer whether Stripe's
   *    declared `activity_fee` includes tax, and `reconcile` keys on
   *    `$3 == "fee"` alone. no ground truth for that is in this repo, and
   *    a fixture I author myself cannot supply it — it would prove only
   *    that the code matches my own read (`rule.forbid.hand-computed-figures`).
   *    ⛔ so the placement is NOT guessed here.
   *
   * ⭐ WHY PIN IT AT ALL. before this case, the limit lived ONLY in prose
   *    — a comment in the skill and a docblock in this file. prose drifts
   *    on the next edit and no run reports it. and a RED test nobody can
   *    fix gets skipped, so a clamp for the un-answered question would be
   *    worse than absent.
   *
   *    this is the shape `rule.require.audit-guards-by-input-type`
   *    prescribes for exactly this situation: assert the current behavior,
   *    beside its fixed twin, so the boundary is CHECKABLE rather than
   *    merely mentioned. it will take a deliberate edit the day it is
   *    resolved — which is the point.
   */
  given('[case10] `tax` is labelled 26 and reaches no 26 column', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'tax-unhandled');
      fs.mkdirSync(dir, { recursive: true });

      // a charge +100, a standalone fee -10, and a tax -5.
      // ⭐ the fee is the HANDLED twin: both are mapped to 26 by
      //    `line_for`, and only the fee has a `tally_by_year` branch.
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2024.csv'),
        genItemized([
          {
            created: '2024-02-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
          },
          {
            created: '2024-03-01',
            gross: '-10.00',
            fee: '0.00',
            net: '-10.00',
            category: 'fee',
          },
          {
            created: '2024-04-01',
            gross: '-5.00',
            fee: '0.00',
            net: '-5.00',
            category: 'tax',
          },
        ]),
      );

      // ⚠️ `reconcile` keys on `$3 == "fee"` ALONE, so the tax row is
      //    summed as ordinary gross: 100 - 5 = 95. the fee row's gross is
      //    excluded from gross and counted as fee instead: 10.
      //    net is the plain sum: 100 - 10 - 5 = 85.
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2024.csv'),
        genSummary({
          year: '2024',
          activityGross: '95.00',
          activityFee: '-10.00',
          activity: '85.00',
          endBalance: '85.00',
        }),
      );

      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it reconciles — the fixture itself is sound', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('✅ every year reconciles');
      });

      /**
       * ⭐ the POSITIVE CONTROL for the pin below. without it, an absent
       *    `26 tax` row and a correctly-handled one look the same, and
       *    the pin could pass over a skill that dropped the category
       *    from the audit table entirely.
       */
      then('the audit table labels BOTH costs as line 26', () => {
        const section = sliceSection({
          of: result.stdout,
          from: 'per report' + 'ing category',
        });
        expect(section).not.toEqual(''); // positive control: header exists
        expect(section).toContain('| 2024 | 26 fee | 1 | $-10.00 | $0.00 |');
        expect(section).toContain('| 2024 | 26 tax | 1 | $-5.00 | $0.00 |');
      });

      /**
       * 📌 THE PIN. the two rows above declare $15.00 of line-26 cost.
       *    the column reports $10.00 — the fee's alone.
       *
       *    when the open question is answered and a `tax` branch is
       *    added, THIS assertion goes red and must be updated to $15.00.
       *    that red is the intended signal, not a regression.
       */
      then('📌 the 26 column carries the fee ONLY — the tax is dropped', () => {
        // the whole row, so a column swap cannot satisfy it
        expect(result.stdout).toContain(
          '| 2024 | $100.00 | $0.00 | **$100.00** | $10.00 |',
        );
        // ⭐ the discriminator — $15.00 is what a `tax` branch would print
        expect(result.stdout).not.toContain('| $15.00 |');
      });

      /**
       * ⚠️ and the divergence is INVISIBLE to every other check, which is
       *    why it needed its own case: the reconciliation ties (it sums
       *    raw columns), the audit table shows the row, the per-year row
       *    is internally consistent, and `tax` is NOT unmapped — so the
       *    unmapped-category notice never names it.
       */
      then('no notice names it — the report looks complete', () => {
        expect(result.stdout).not.toContain('?? tax');
        expect(result.stdout).not.toContain('no Form 1120 placement');
      });
    });
  });

  given('[case7] bad invocations', () => {
    when('[t0] no --from is given', () => {
      then('it blocks', () => {
        const result = runSkill([]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no --from directory provided');
      });
    });

    when('[t1] --from is not a directory', () => {
      then('it blocks', () => {
        const result = runSkill(['--from', '/nonexistent/dir']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('not a directory');
      });
    });

    when('[t2] the directory carries no itemized export', () => {
      const result = useBeforeAll(async () => {
        const empty = path.join(root, 'empty');
        fs.mkdirSync(empty, { recursive: true });
        return runSkill(['--from', empty]);
      });

      then('it blocks rather than report an empty tally', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no itemized balance export found');
      });

      then('⭐ and it does NOT refuse as though a file had been read', () => {
        // .why = ⛔ THIS GUARD'S OWN FALL-THROUGH IS THE NEXT GUARD, at the
        //        SAME exit code. delete `:582` and `itemized` is empty, the
        //        parse loop reads no line, `rows_file` stays empty, and `:603`
        //        refuses with `no rows parsed from the itemized export(s)` —
        //        also exit 2. so `expect(exitCode).toBe(2)` cannot tell the two
        //        apart, and the two messages send a human to OPPOSITE places:
        //        one says "your folder has no export", the other says "your
        //        export has no rows". leak 6, between two guards 21 lines
        //        apart in ONE skill.
        expect(result.stdout).not.toContain('no rows parsed');
      });
    });

    when('[t3] --help is given', () => {
      then('it prints usage and exits clean', () => {
        const result = runSkill(['--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: stripe.tally.sh');
      });
    });
  });

  /**
   * .what = the arg-parse arms no other case reaches
   *
   * .why  = an ARM WALK of stripe.tally.sh:65-103 found FIVE arms with zero
   *         coverage anywhere in the repo — the `-h` alias, the rhachet
   *         passthrough, `-*`, and BOTH halves of the `*)` catch-all. every
   *         one is a line every invocation runs past, so a line-coverage
   *         report scores the block at 100% and reports no gap.
   *
   * ⚠️ EVERY decisive assertion here is a MESSAGE, never an exit code. the
   *    fall-through for a dropped `-*` arm is `not a directory`, which
   *    refuses at the SAME exit 2 the arm itself returns — so
   *    `expect(exitCode).toBe(2)` stays green over an arm that never ran.
   *    that is leak 6 of `rule.require.assertions-that-discriminate`, now
   *    confirmed four times across the sibling skills.
   *
   * ⚠️ and each positive sits in a SEPARATE `then` from its discriminator.
   *    jest stops a `then` at its first red, so a co-located exclusion is
   *    never measured — and therefore can never be proven to bite.
   */
  given('[case11] the arg-parse arms', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'argparse');
      const other = path.join(root, 'argparse-other');
      fs.mkdirSync(dir, { recursive: true });
      fs.mkdirSync(other, { recursive: true });

      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([
          {
            created: '2023-03-01',
            gross: '100.00',
            fee: '0.00',
            net: '100.00',
            category: 'charge',
          },
        ]),
      );
      fs.writeFileSync(
        path.join(dir, 'Balance_Summary_2023.csv'),
        genSummary({
          year: '2023',
          activityGross: '100.00',
          activityFee: '0.00',
          activity: '100.00',
          endBalance: '100.00',
        }),
      );

      return { dir, other };
    });

    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () => runSkill(['-h']));

      then('it prints the same usage as --help', () => {
        expect(result.stdout).toContain('usage: stripe.tally.sh');
      });

      then('⭐ it exits clean, NOT as an unknown option', () => {
        // .why = drop `-h` from the `--help|-h` alias and `-h` falls to the
        //        `-*` arm, so a HELP REQUEST is answered with
        //        `unknown option: -h` at exit 2 — the surface tells the
        //        caller their request for help was itself the mistake.
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] a bare directory is given, with no --from', () => {
      const result = useBeforeAll(async () => runSkill([scene.dir]));

      then('⭐ the first positional becomes the source directory', () => {
        // .why = the `if [[ -z "$FROM_DIR" ]]` half of the `*)` arm has no
        //        coverage — every other case passes `--from`. delete it and
        //        a bare path is refused as `unexpected argument`, so the
        //        documented positional form stops working entirely.
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/\|\s*2023\s*\|\s*\$100\.00/);
      });

      then('it does NOT refuse the path it was handed', () => {
        expect(result.stdout).not.toContain('unexpected argument');
        expect(result.stdout).not.toContain('no --from directory provided');
      });
    });

    when('[t2] rhachet passes --skill, --repo and --role', () => {
      const result = useBeforeAll(async () =>
        runSkill([
          '--from',
          scene.dir,
          '--skill',
          'stripe.tally',
          '--repo',
          'rhight',
          '--role',
          'accountant',
        ]),
      );

      then('⭐ it tallies the folder, not the flag value', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/\|\s*2023\s*\|\s*\$100\.00/);
      });

      then('it does NOT read a flag value as a second directory', () => {
        // .why = `shift 2` -> `shift` on that arm and `stripe.tally`
        //        survives as a bare word, so it lands on the `*)` arm and is
        //        refused as an `unexpected argument` — a run that names the
        //        SKILL'S OWN NAME as the caller's mistake.
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });

    when('[t3] an unknown option is given', () => {
      const result = useBeforeAll(async () => runSkill(['--wat']));

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the OPTION, not a directory', () => {
        // .why = delete the `-*` arm and `--wat` falls to `*)`, which assigns
        //        it to FROM_DIR — so the refusal becomes
        //        `not a directory: --wat`, and a human goes to check a path
        //        they never typed. ⚠️ BOTH refuse at exit 2, so only the
        //        message can tell "the guard ran" from "the guard is gone".
        expect(result.stdout).toContain('unknown option: --wat');
        expect(result.stdout).not.toContain('not a directory');
      });
    });

    when('[t4] a second directory is given', () => {
      const result = useBeforeAll(async () =>
        runSkill([scene.dir, scene.other]),
      );

      then('it blocks rather than pick one', () => {
        expect(result.stdout).toContain('unexpected argument');
      });

      then('⭐ it names the SECOND directory, and tallies neither', () => {
        // .why = remove the `else` and the second directory is SILENTLY
        //        DROPPED — the run tallies the first at exit 0 and reports no
        //        word of it. ⛔ FROM_DIR is a DIRECTORY here, not a file, so
        //        the silent pick is a whole EXPORT SET, and every figure in
        //        the report feeds a federal Form 1120 line. a caller who
        //        named two directories gets one tallied and no notice which.
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(`unexpected argument: ${scene.other}`);
        expect(result.stdout).not.toContain('## per tax year');
      });
    });
  });

  /**
   * ⛔ THE GUARD WHOSE FALL-THROUGH IS AN AFFIRMATIVE ✅.
   *
   *    `:603` refuses when the parse yielded zero rows. the MESSAGE walk
   *    found it unasserted — no case in this file had ever handed the skill
   *    an export it could open and could not read.
   *
   * ⚠️ ITS FALL-THROUGH IS NOT A REFUSAL. delete `:603` and `main` walks on:
   *    `reconcile` and `emit_report` both tolerate an empty rows file, so the
   *    run prints a report with no year in it and closes with
   *    `reconciled  ✅ all 0 year(s)` at EXIT 0.
   *
   *    so the exit code moves the WRONG WAY — 2 -> 0 — and the run does not
   *    merely stay quiet, it affirmatively reports a ✅ over an export it
   *    never read a row of. only the ABSENCE of that line can pin the guard.
   */
  given('[case12] an export the skill can open and cannot read', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'headeronly');
      fs.mkdirSync(dir, { recursive: true });

      // ⓘ every required column is present, so the header guard at `:598`
      //    passes and hands `:603` a rows file of zero length — the one
      //    input that reaches it.
      fs.writeFileSync(
        path.join(dir, 'Itemized_balance_change_from_activity_2023.csv'),
        genItemized([]),
      );

      return { dir };
    });

    when('[t0] the export carries a header and no data row', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it blocks as a constraint', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it says the ROWS could not be parsed', () => {
        expect(result.stdout).toContain(
          'no rows parsed from the itemized export(s)',
        );
      });

      then('⭐ and it does NOT blame the FOLDER, which held the export', () => {
        // .why = ⛔ `:582` and `:603` are a leak-6 pair 21 lines apart in ONE
        //        skill, BOTH at exit 2, and `:582`'s own fall-through IS
        //        `:603`. the two messages send a human to opposite places —
        //        one says "your folder has no export", the other says "your
        //        export has no rows". an exit-code assertion cannot tell the
        //        two apart, so each case excludes the other's message.
        expect(result.stdout).not.toContain('no itemized balance export found');
      });

      then('⭐ and NO ✅ is reported over an export it never read', () => {
        // .why = the decisive one. the fall-through is a SILENT SUCCESS that
        //        prints `reconciled  ✅ all 0 year(s)` at exit 0 — a green
        //        verdict on a tally with no row behind it, bound for a
        //        federal Form 1120. `reconciled` is emitted at `:651` and
        //        `:654` only, both AFTER this guard, so its absence is what
        //        proves the guard ran.
        expect(result.stdout).not.toContain('reconciled');
      });
    });
  });
});
