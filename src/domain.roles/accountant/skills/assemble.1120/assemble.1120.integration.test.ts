import { given, then, useBeforeAll, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * .what = integration tests for the assemble.1120 skill
 * .why  = this is the last step before figures reach a filed return, so the
 *         behaviors that must never regress are the ones that would put a
 *         wrong number on the form:
 *           (a) a card credit is subtracted from line 26 exactly ONCE
 *           (b) a capital asset and an unclassified charge are held OUT of
 *               line 27, never quietly expensed
 *           (c) an upstream tally that failed to reconcile is refused, never
 *               laundered into a total that looks clean
 *         hermetic — fixtures are written at runtime, no real data.
 */

const runnerPath: string = path.join(__dirname, 'assemble.1120.sh');

const UTF8 = 'utf-8' as const;

const runAt = (
  runner: string,
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [runner, ...args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/** .what = run the REAL copy, whose siblings point at the real tally skills */
const runSkill = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } =>
  runAt(runnerPath, args);

/**
 * .what = build a synthetic amex statement
 * .note = header text below is verbatim amex; the section regexes depend on it
 */
const genStatement = (input: {
  shutDate: string; // MM/DD/YY
  declared: string; // total new charges, as the statement declares it
  charges: { date: string; merchant: string; amount: string }[];
  credits?: { date: string; merchant: string; amount: string }[];
}): string =>
  [
    '         American Express Blue Business Cash',
    `         Clos${'ing'} Date ${input.shutDate}`,
    `         Account End${'ing'} 9-99999`,
    ' Payments and Credits',
    ` Detail        *Indicates post${'ing'} date`,
    'Payments                                                       Amount',
    '01/18/23*      MOBILE PAYMENT - THANK YOU                    -$100.00',
    ...(input.credits?.length
      ? [
          'Credits                                                        Amount',
          ...input.credits.map(
            (c) =>
              `${c.date}*      ${c.merchant}                 -$${c.amount}`,
          ),
        ]
      : []),
    ' New Charges',
    ' Summary',
    `Total New Charges                                           $${input.declared}`,
    ' Detail',
    '                                                               Amount',
    ...input.charges.map(
      (c) => `${c.date}       ${c.merchant}          $${c.amount}`,
    ),
  ].join('\n');

/**
 * .what = write a stripe year: the itemized export plus its summary
 * .note = header names are verbatim Stripe; columns are located by name.
 *         activity_fee is declared NEGATIVE by Stripe, as "Less fees".
 */
const putStripeYear = (input: {
  dir: string;
  year: string;
  gross: string;
  fee: string;
  activityGross: string;
  activityFee: string;
  activity: string;
}): void => {
  const net = (Number(input.gross) - Number(input.fee)).toFixed(2);
  fs.writeFileSync(
    path.join(
      input.dir,
      `Itemized_balance_change_from_activity_${input.year}.csv`,
    ),
    [
      `"balance_transaction_id","created","available_on","currency","gross","fee","net","report${'ing'}_category","description"`,
      `"txn_0","${input.year}-03-01 12:00:00","${input.year}-03-01 12:00:00","usd","${input.gross}","${input.fee}","${net}","charge",""`,
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(input.dir, `Balance_Summary_${input.year}.csv`),
    [
      '"category","description","net_amount","currency"',
      `"start${'ing'}_balance","Start${'ing'} balance (${input.year}-01-01)","0.00","usd"`,
      `"activity_gross","Account activity before fees","${input.activityGross}","usd"`,
      `"activity_fee","Less fees","${input.activityFee}","usd"`,
      `"activity","Activity","${input.activity}","usd"`,
      `"end${'ing'}_balance","End${'ing'} balance (${input.year}-12-31)","${input.activity}","usd"`,
    ].join('\n'),
  );
};

/** .what = a stripe year with one 10.00 charge and no fees, to hold revenue steady */
const putStripeQuiet = (dir: string): void =>
  putStripeYear({
    dir,
    year: '2023',
    gross: '10.00',
    fee: '0.00',
    activityGross: '10.00',
    activityFee: '0.00',
    activity: '10.00',
  });

/**
 * .what = cut one `## ` section out of the report, for a scoped search
 *
 * .why  = the capital-assets section and the unclassified-charges section
 *         render the IDENTICAL row shape `| <year> | $<amount> |`
 *         (assemble.1120.sh:403 and :429). so a `toContain('$2000.00')` over
 *         the whole report cannot say which section the amount landed in —
 *         and to hold those amounts OUT of line 27 is the entire purpose of
 *         both sections.
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

describe('assemble.1120.sh', () => {
  // .note = a plain const, not useBeforeAll — the proxy that useBeforeAll
  //         returns cannot be passed to path.join as a string
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'assemble-1120-'));

  const genCase = (name: string): { cards: string; stripe: string } => {
    const cards = path.join(root, name, 'cards');
    const stripe = path.join(root, name, 'stripe');
    fs.mkdirSync(cards, { recursive: true });
    fs.mkdirSync(stripe, { recursive: true });
    return { cards, stripe };
  };

  /**
   * .what = stand up an ISOLATED COPY of the skill, with controlled neighbors
   *
   * .why  = the three INSTALL guards cannot be reached any other way.
   *         `assemble.1120.sh:51-52` derives both neighbor paths from its own
   *         `BASH_SOURCE`, so there is no env seam to point elsewhere. only a
   *         copy can hold a neighbor out of reach, or swap it for a stub.
   *
   * ⚠️ `output.sh` comes along. the skill sources it off the same
   *    `SCRIPT_DIR`, so a copy without it aborts before any guard runs — and
   *    the case would redden for a cause unrelated to the behavior under
   *    test, which is the harness artifact of task #160.
   *
   * .note = a `null` body leaves that neighbor ABSENT. a string writes it.
   */
  const genInstall = (input: {
    name: string;
    card: string | null;
    stripe: string | null;
  }): { runner: string; cards: string; stripe: string } => {
    const home = path.join(root, input.name);
    const own = path.join(home, 'skills', 'assemble.1120');
    fs.mkdirSync(own, { recursive: true });
    fs.copyFileSync(runnerPath, path.join(own, 'assemble.1120.sh'));
    fs.copyFileSync(
      path.join(__dirname, 'output.sh'),
      path.join(own, 'output.sh'),
    );

    const put = (neighbor: string, body: string | null): void => {
      if (body === null) return;
      const at = path.join(home, 'skills', neighbor);
      fs.mkdirSync(at, { recursive: true });
      fs.writeFileSync(path.join(at, `${neighbor}.sh`), body);
    };
    put('statement.tally', input.card);
    put('stripe.tally', input.stripe);

    const cards = path.join(home, 'cards');
    const stripe = path.join(home, 'stripe');
    fs.mkdirSync(cards, { recursive: true });
    fs.mkdirSync(stripe, { recursive: true });
    return { runner: path.join(own, 'assemble.1120.sh'), cards, stripe };
  };

  /** .what = a neighbor that SUCCEEDS and publishes no table at all */
  const QUIET_STUB = ['#!/usr/bin/env bash', 'exit 0', ''].join('\n');

  given('[case1] a year with a charge on every 1120 line', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('full');

      // 22: 1000.00 | 26: 100.00 | 16: 300.00 | 17: 50.00
      // credits: 50.00 | declared charges: 1450.00
      fs.writeFileSync(
        path.join(dirs.cards, '2023-12-25.md'),
        genStatement({
          shutDate: '12/25/23',
          declared: '1450.00',
          charges: [
            { date: '12/01/23', merchant: 'GOOGLE *ADS1', amount: '1000.00' },
            { date: '12/02/23', merchant: 'GITHUB, INC.', amount: '100.00' },
            { date: '12/03/23', merchant: 'WEWORK', amount: '300.00' },
            {
              date: '12/04/23',
              merchant: 'DELAWARE CORP & TAX',
              amount: '50.00',
            },
          ],
          credits: [
            { date: '12/05/23', merchant: 'CASH BACK', amount: '50.00' },
          ],
        }),
      );

      // revenue: 200.00 gross, 3.00 fee
      putStripeYear({
        dir: dirs.stripe,
        year: '2023',
        gross: '200.00',
        fee: '3.00',
        activityGross: '200.00',
        activityFee: '-3.00',
        activity: '197.00',
      });

      return dirs;
    });

    when('[t0] the year is assembled', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('income carries through from the revenue tally', () => {
        expect(result.stdout).toContain('| 1a | gross receipts | $200.00 |');
        expect(result.stdout).toContain(
          '| 1c | **net receipts** | **$200.00**',
        );
      });

      /**
       * ⭐ THE LABEL IS THE PAYLOAD, so it may not be a wildcard.
       *
       *    this `then` claims each card line lands on its OWN 1120 line, and
       *    the label is the only cell that names which line that is. a human
       *    reads that label and copies $1,000 onto line 22 of a federal
       *    return.
       *
       * ⛔ the old form asserted `/\| 22 \| \w+ \| \$1000\.00 \|/` — the
       *    amount pinned, the label ANY word at all. swap the two label
       *    strings in the renderer (assemble.1120.sh:388-389) and the report
       *    labels line 22 as interest while that regex still matches. GREEN,
       *    over a report that files an ad spend as interest — and line 18 is
       *    subject to the §163(j) limitation while line 22 is not, so the two
       *    are not interchangeable even though the DEDUCTION TOTAL is
       *    identical either way.
       *
       * ⚠️ that identical total is exactly why line 27 below cannot catch it.
       */
      then('each card line lands on its own 1120 line', () => {
        expect(result.stdout).toContain('| 16 | rents | $300.00 |');
        expect(result.stdout).toContain('| 17 | taxes and licenses | $50.00 |');
        expect(result.stdout).toContain('| 22 | advertising | $1000.00 |');
        // ⭐ the discriminator — the LABEL swap, which the amount cannot see
        expect(result.stdout).not.toContain('| 22 | interest');
        expect(result.stdout).not.toContain('| 18 | advertising');
      });

      /**
       * ⭐ THE ZERO LINES HAD NO ASSERTION IN ANY CASE, IN ANY FILE.
       *
       *    every row of both tables is rendered by one shape —
       *    `| N | label | $(awk … $F)` — off a POSITIONAL field index. lines
       *    1b ($3) and 18 ($7) were the two nobody read, so a wrong index on
       *    either prints a figure from a different 1120 line and no assertion
       *    moves.
       *
       *    they carry $0.00 here, which is the point: a zero cell is the one
       *    a reader trusts at a glance, and the one an index error is most
       *    likely to survive in.
       */
      then('the lines with no activity report ZERO, not another line', () => {
        expect(result.stdout).toContain(
          '| 1b | returns and allowances | $0.00 |',
        );
        expect(result.stdout).toContain('| 18 | interest | $0.00 |');
      });

      then(
        'line 26 sums card other-deductions and stripe fees, less credits',
        () => {
          // 100.00 (github) + 3.00 (stripe fee) - 50.00 (credit) = 53.00
          expect(result.stdout).toContain('| 26 | other deductions | $53.00 |');
        },
      );

      then('line 27 totals the deduction lines', () => {
        // 300 + 50 + 0 + 1000 + 53
        expect(result.stdout).toContain(
          '| 27 | **total deductions** | **$1403.00**',
        );
      });

      /**
       * ⭐ the WHOLE ROW, not two tokens out of it.
       *
       * the bottom-line row carries TWO bold columns — taxable income (30) and
       * NOL cumulative. `assemble.1120.sh` renders both with the SAME
       * `**$%.2f**` verb, in the one printf whose args run
       * `$1, tag, inc, ded, ti, nol, carry`. so a bare
       * `toContain('**$0.00**')` cannot say WHICH of them it matched.
       *
       * ⛔ swap `ti` and `carry` in that printf — one token — and the row reads
       *    `| 2023 | $200.00 | $1403.00 | **$-1203.00** | $-1203.00 | **$0.00** |`
       *    where `**$0.00**` still matches (cumulative) and `$-1203.00` still
       *    matches (generated). BOTH GREEN, over a report that calls a $1,203
       *    loss TAXABLE INCOME — on a figure bound for Form 1120 line 30.
       *
       * the claim is a RELATION between columns; only the row can carry it.
       */
      then('a loss year reports zero taxable income and names the NOL', () => {
        // 200.00 income - 1403.00 deductions = -1203.00
        expect(result.stdout).toContain(
          '| 2023 | $200.00 | $1403.00 | **$0.00** | $-1203.00 | **$-1203.00** |',
        );
        // ⭐ the discriminator — the column SWAP is the defect, and it is
        //    invisible to every bare token above
        expect(result.stdout).not.toContain('| **$-1203.00** | $-1203.00 |');
      });

      then('the line split ties to the independent total', () => {
        expect(result.stdout).toContain('✅ every year ties');
      });
    });
  });

  given('[case2] a year with a large card credit', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('credits');

      // 26: 500.00 charges, against a 200.00 credit
      fs.writeFileSync(
        path.join(dirs.cards, '2023-06-25.md'),
        genStatement({
          shutDate: '06/25/23',
          declared: '500.00',
          charges: [
            { date: '06/01/23', merchant: 'GITHUB, INC.', amount: '500.00' },
          ],
          credits: [
            { date: '06/02/23', merchant: 'CASH BACK', amount: '200.00' },
          ],
        }),
      );
      putStripeQuiet(dirs.stripe);

      return dirs;
    });

    when('[t0] the year is assembled', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      // .why = the card tally prints credits ALREADY SIGNED ("$-200.00"), so a
      //        caller that subtracts that value adds it instead. that slip
      //        doubles the credit on line 26 rather than removes it. 500 - 200 = 300, never 700.
      then('the credit is subtracted from line 26 exactly once', () => {
        expect(result.stdout).toContain('| 26 | other deductions | $300.00 |');
        expect(result.stdout).not.toContain('$700.00');
      });

      then('the line split still ties', () => {
        expect(result.stdout).toContain('✅ every year ties');
      });
    });
  });

  given('[case3] a capital asset and an unclassified charge', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('heldout');

      // 20/cap: 2000.00 | ??: 77.00 | 26: 100.00
      fs.writeFileSync(
        path.join(dirs.cards, '2023-09-25.md'),
        genStatement({
          shutDate: '09/25/23',
          declared: '2177.00',
          charges: [
            { date: '09/01/23', merchant: 'DELL INC', amount: '2000.00' },
            {
              date: '09/02/23',
              merchant: 'MYSTERY MERCHANT LLC',
              amount: '77.00',
            },
            { date: '09/03/23', merchant: 'GITHUB, INC.', amount: '100.00' },
          ],
        }),
      );
      putStripeQuiet(dirs.stripe);

      return dirs;
    });

    when('[t0] the year is assembled', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      // ⭐ "in ITS OWN section" is a RELATION, and the two sections render the
      //    same row shape — so the amount must be asserted INSIDE its slice,
      //    with the cross-pair excluded. two whole-report `toContain`s pass
      //    just as well when the amounts land in each other's tables.
      then('the capital asset is named in its own section', () => {
        const section = sliceSection({
          of: result.stdout,
          from: 'line 20 — capital assets',
        });
        expect(section).not.toEqual(''); // positive control: the header exists
        expect(section).toContain('| 2023 | $2000.00 |');
        expect(section).not.toContain('$77.00'); // ⭐ the cross-pair
      });

      then('the unclassified charge is named in its own section', () => {
        const section = sliceSection({
          of: result.stdout,
          from: 'unclassified card charges',
        });
        expect(section).not.toEqual(''); // positive control: the header exists
        expect(section).toContain('| 2023 | $77.00 |');
        expect(section).not.toContain('$2000.00'); // ⭐ the cross-pair
      });

      /**
       * ⭐ THE OUTPUT WALK — the guidance prose of both held-out sections is
       *    emitted on every run that keeps a charge back, and was read by no
       *    assertion at all.
       *
       *    neuter the four `echo`s at `:422-425` and the section still
       *    renders its header, its table, and its §274(d) paragraph. every
       *    extant assertion stays green, because the two `then`s above slice
       *    the section and read only the AMOUNT ROW out of it.
       *
       * ⛔ what a truncated section costs a reader is exact, not cosmetic.
       *    the paragraph that survives tells a human to answer ONE question —
       *    was it away from home? — and §274(k)(1)(B) makes a SECOND question
       *    decisive: was the taxpayer or an employee present. a local meal
       *    with no one present is disallowed IN FULL, not halved. so the
       *    truncated section routes a wholly disallowed charge toward line 26.
       *
       *    the capital-assets note has the same shape pointed the other way:
       *    strip it and the header says "EXCLUDED from line 27" with no
       *    account of why, and the reader's obvious repair is to add the
       *    $2000.00 back — the overstated deduction the section exists to
       *    prevent.
       */
      then('the held-out sections say WHY, not only how much', () => {
        const capital = sliceSection({
          of: result.stdout,
          from: 'line 20 — capital assets',
        });
        expect(capital).not.toEqual(''); // positive control: the header exists
        expect(capital).toContain('depreciate via Form 4562');
        // ⭐ the election is what stops the reader from repair in the wrong direction
        expect(capital).toContain('an election, not a');

        const open = sliceSection({
          of: result.stdout,
          from: 'unclassified card charges',
        });
        expect(open).not.toEqual(''); // positive control: the header exists
        expect(open).toContain('need a human decision');
        expect(open).toContain('§274(d) class');
        // ⛔ the SECOND question — §274(k) zeroes what §274(d) only documents
        expect(open).toContain('§274(k)(1)(B) disallows');
        expect(open).toContain('was it away from home, and was');
      });

      // .why = a capital asset expensed in full is an overstated deduction, and
      //        an unclassified charge deducted without a decision is an
      //        unsupported one. both must stay out of the total.
      then('neither reaches line 27', () => {
        expect(result.stdout).toContain(
          '| 27 | **total deductions** | **$100.00**',
        );
      });

      then('the line split still ties', () => {
        expect(result.stdout).toContain('✅ every year ties');
      });
    });
  });

  given('[case4] a card statement that does not reconcile', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('cardbad');

      // declares 999.00 but the rows sum to 100.00
      fs.writeFileSync(
        path.join(dirs.cards, '2023-03-25.md'),
        genStatement({
          shutDate: '03/25/23',
          declared: '999.00',
          charges: [
            { date: '03/01/23', merchant: 'GITHUB, INC.', amount: '100.00' },
          ],
        }),
      );
      putStripeQuiet(dirs.stripe);

      return dirs;
    });

    when('[t0] the year is assembled', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it exits 3, the untrusted-figures code', () => {
        expect(result.exitCode).toBe(3);
      });

      then('it names which tally failed', () => {
        expect(result.stdout).toContain('card tally did not reconcile');
        expect(result.stdout).toContain('refus');
      });

      // .why = to roll up figures a tally already flagged as untrustworthy
      //        would launder a known defect into a total that looks clean
      then('no totals are emitted at all', () => {
        expect(result.stdout).not.toContain('total deductions');
        expect(result.stdout).not.toContain('the bottom line');
      });
    });
  });

  given('[case5] a stripe summary that does not reconcile', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('stripebad');

      fs.writeFileSync(
        path.join(dirs.cards, '2023-03-25.md'),
        genStatement({
          shutDate: '03/25/23',
          declared: '100.00',
          charges: [
            { date: '03/01/23', merchant: 'GITHUB, INC.', amount: '100.00' },
          ],
        }),
      );

      // rows total 200.00 but the summary declares 999.00
      putStripeYear({
        dir: dirs.stripe,
        year: '2023',
        gross: '200.00',
        fee: '0.00',
        activityGross: '999.00',
        activityFee: '0.00',
        activity: '999.00',
      });

      return dirs;
    });

    when('[t0] the year is assembled', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it exits 3, the untrusted-figures code', () => {
        expect(result.exitCode).toBe(3);
      });

      then('it names which tally failed', () => {
        expect(result.stdout).toContain('stripe tally did not reconcile');
      });

      then('no totals are emitted at all', () => {
        expect(result.stdout).not.toContain('total deductions');
      });
    });
  });

  given('[case6] a report written to a file', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('into');
      fs.writeFileSync(
        path.join(dirs.cards, '2023-03-25.md'),
        genStatement({
          shutDate: '03/25/23',
          declared: '100.00',
          charges: [
            { date: '03/01/23', merchant: 'GITHUB, INC.', amount: '100.00' },
          ],
        }),
      );
      putStripeQuiet(dirs.stripe);
      return { ...dirs, out: path.join(root, 'into', 'report.md') };
    });

    when('[t0] --into names an output path', () => {
      const result = useBeforeAll(async () =>
        runSkill([
          '--cards',
          scene.cards,
          '--stripe',
          scene.stripe,
          '--into',
          scene.out,
        ]),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the file holds the same report as stdout', () => {
        const written = fs.readFileSync(scene.out, UTF8);
        expect(written).toContain('| 26 | other deductions | $100.00 |');
        expect(result.stdout).toContain(written.trimEnd());
      });
    });
  });

  /**
   * ⚠️ `validate_args` is drafted as FOUR NEAR-PARALLEL ARMS — two per input,
   *    `-z` then `! -d`, for `--cards` and again for `--stripe`. so the
   *    hazard here is not a dead arm, it is a CROSS-PAIR: an arm that reads
   *    the OTHER input's variable.
   *
   * ⚠️ a bare `toContain('not a directory')` cannot see that. both arms emit
   *    that exact phrase, so the token is satisfied whichever variable was
   *    read — which is why each positive below names the WHOLE PATH, and
   *    each is paired with an exclusion of its sibling's path.
   */
  given('[case7] malformed invocations', () => {
    const dirs = genCase('malformed');
    const absentCards = path.join(root, 'malformed', 'absent-cards');
    const absentStripe = path.join(root, 'malformed', 'absent-stripe');

    when('[t0] --cards is absent', () => {
      const result = useBeforeAll(async () => runSkill([]));

      then('it exits 2, the constraint code', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no --cards directory provided');
      });
    });

    when('[t1] --cards names a path that is not a directory', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', absentCards, '--stripe', dirs.stripe]),
      );

      then('it exits 2 and names the WHOLE cards path', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(`not a directory: ${absentCards}`);
      });

      // ⭐ the cross-pair. under an arm that reads `$STRIPE_DIR` here, the
      //    refusal would name the stripe path instead — and the bare token
      //    `not a directory` is green either way.
      then('⭐ it does NOT name the stripe path', () => {
        expect(result.stdout).not.toContain(`not a directory: ${dirs.stripe}`);
      });
    });

    when('[t2] an unknown option is passed', () => {
      const result = useBeforeAll(async () => runSkill(['--nope']));

      then('it exits 2 and names the option', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown option: --nope');
      });
    });

    when('[t3] --help is passed', () => {
      const result = useBeforeAll(async () => runSkill(['--help']));

      then('it exits 0 and shows usage', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: assemble.1120.sh');
      });
    });

    when('[t4] --cards is given but --stripe is absent', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', dirs.cards]),
      );

      then('it names the ABSENT input, not the one it was handed', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no --stripe directory provided');
      });

      /**
       * ⭐ drop this arm and control falls one line down, to `! -d ""`, which
       *    refuses at the SAME exit 2 with `not a directory: ` — a message
       *    whose whole payload is a path, and whose path is EMPTY. so the
       *    diagnosis flips from "you left a flag off" to "the path you gave
       *    is bad", over a flag the caller never typed.
       */
      then('⭐ it does NOT fall to the is-a-directory arm', () => {
        expect(result.stdout).not.toContain('not a directory');
      });
    });

    when('[t5] --stripe names a path that is not a directory', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--cards', dirs.cards, '--stripe', absentStripe]),
      );

      then('it exits 2 and names the WHOLE stripe path', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(`not a directory: ${absentStripe}`);
      });

      // ⭐ the other half of the cross-pair. an arm that reads `$CARDS_DIR`
      //    here would never fire at all — the cards dir is real — so the
      //    run would proceed past a stripe path that does not exist.
      then('⭐ it does NOT name the cards path', () => {
        expect(result.stdout).not.toContain(`not a directory: ${dirs.cards}`);
      });
    });
  });

  given('[case8] a prior year, already filed elsewhere', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('priors');

      // 26: 500.00, no credits
      fs.writeFileSync(
        path.join(dirs.cards, '2023-06-25.md'),
        genStatement({
          shutDate: '06/25/23',
          declared: '500.00',
          charges: [
            { date: '06/01/23', merchant: 'GITHUB, INC.', amount: '500.00' },
          ],
        }),
      );
      putStripeQuiet(dirs.stripe);

      return dirs;
    });

    const base = (): string[] => [
      '--cards',
      scene.cards,
      '--stripe',
      scene.stripe,
    ];

    when('[t0] a prior loss year is declared', () => {
      const result = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '2022=10000']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the prior year gets its own row, marked as such', () => {
        expect(result.stdout).toContain('| 2022 ᵖ |');
      });

      then('its income and deduction cells are blank, never zeroed', () => {
        // a $0.00 would assert a figure this run never derived
        expect(result.stdout).toContain('| 2022 ᵖ | — | — |');
      });

      // ⭐ both rows in full — `$-10000.00` alone matches the NOL-generated cell
      //    AND the cumulative cell beside it, so a bare token cannot say which
      //    column carried the loss. see the note at [case1][t0].
      then('its loss is carried as a negative', () => {
        expect(result.stdout).toContain(
          '| 2022 ᵖ | — | — | **$0.00** | $-10000.00 | **$-10000.00** |',
        );
      });

      then('the cumulative chain includes the prior year', () => {
        // 2023: 10.00 income - 500.00 deductions = -490.00
        // cumulative: -10000.00 + -490.00
        expect(result.stdout).toContain(
          '| 2023 | $10.00 | $500.00 | **$0.00** | $-490.00 | **$-10490.00** |',
        );
        // ⭐ the discriminator — under a ti/carry swap the cumulative figure
        //    would render in the TAXABLE INCOME column, and `**$-10490.00**`
        //    alone would still have matched it
        expect(result.stdout).not.toContain('| **$-10490.00** | $-490.00 |');
      });

      then('the footnote explains the mark', () => {
        expect(result.stdout).toContain('ᵖ = a **prior** year');
      });
    });

    when('[t1] the same loss is declared already-negative', () => {
      const asPositive = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '2022=10000']),
      );
      const asNegative = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '2022=-10000']),
      );

      then('the sign is normalized — a loss is a loss either way', () => {
        expect(asNegative.exitCode).toBe(0);
        expect(asNegative.stdout).toEqual(asPositive.stdout);
      });
    });

    when('[t2] a prior year collides with a computed year', () => {
      const result = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '2023=100']),
      );

      then('it refuses, rather than count the year twice', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('already computed from statements');
        expect(result.stdout).toContain('2023');
      });
    });

    when('[t3] a prior is malformed', () => {
      const noAmount = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '2022']),
      );
      const badYear = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '22=100']),
      );
      const badAmount = useBeforeAll(async () =>
        runSkill([...base(), '--prior', '2022=eight']),
      );

      then('an absent amount is refused', () => {
        expect(noAmount.exitCode).toBe(2);
        expect(noAmount.stdout).toContain('YEAR=AMOUNT');
      });

      then('a short year is refused', () => {
        expect(badYear.exitCode).toBe(2);
        expect(badYear.stdout).toContain('4 digits');
      });

      then('a non-numeric amount is refused', () => {
        expect(badAmount.exitCode).toBe(2);
        expect(badAmount.stdout).toContain('must be a number');
      });
    });
  });

  /**
   * .what = the arg-parse arms `[case7]` never reaches
   *
   * .why  = `parse_args` (assemble.1120.sh:66) has SEVEN arms and `[case7]`
   *         covers three. the three below had no case anywhere in the repo:
   *         the `-h` alias, the rhachet passthrough, and the BARE-token
   *         catch-all `*)`.
   *
   * ⚠️ every assertion here reads the MESSAGE, never the exit code. this
   *    skill refuses at exit 2 from SIX sites — the two catch-alls, plus
   *    four in `validate_args` and `write_priors` — so a fall-through from
   *    one arm to another is invisible to `expect(exitCode).toBe(2)`.
   *
   * ⚠️ each positive sits in its own `then`, apart from its discriminator.
   *    jest halts a `then` at its first red, so an exclusion co-located with
   *    a positive can never be measured on its own.
   */
  given('[case9] the arg-parse arms', () => {
    const scene = useBeforeAll(async () => {
      const dirs = genCase('argparse');
      fs.writeFileSync(
        path.join(dirs.cards, '2023-06-25.md'),
        genStatement({
          shutDate: '06/25/23',
          declared: '500.00',
          charges: [
            { date: '06/01/23', merchant: 'GITHUB, INC.', amount: '500.00' },
          ],
        }),
      );
      putStripeQuiet(dirs.stripe);
      return dirs;
    });

    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () => runSkill(['-h']));

      then('it exits 0 and renders the usage block', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: assemble.1120.sh');
      });

      // ⭐ the discriminator. a dead `-h` falls to the `-*)` catch-all, which
      //    refuses at the SAME exit 2 as every other refusal site — so only
      //    the absence of that message tells the two apart.
      then('⭐ it does NOT fall through to the unknown-option arm', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] rhachet passes --repo, --skill and --role', () => {
      // ⚠️ ORDER IS LOAD-BEARING. under a `shift` defect the parser halts at
      //    the FIRST stray token, so only the value of the FIRST passthrough
      //    flag can ever leak. `--repo` leads, and its value is the needle.
      //
      // ⚠️ and `bhrain` is chosen because the success report echoes the cards
      //    and stripe paths (assemble.1120.sh:504) — a needle the report
      //    prints on the happy path would redden on CORRECT behavior.
      const result = useBeforeAll(async () =>
        runSkill([
          '--repo',
          'bhrain',
          '--skill',
          'assemble.1120',
          '--role',
          'accountant',
          '--cards',
          scene.cards,
          '--stripe',
          scene.stripe,
        ]),
      );

      then('⭐ it assembles the report, rather than refuse', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('assembled it,');
      });

      then('⭐ it does NOT read a flag VALUE as an argument', () => {
        expect(result.stdout).not.toContain('bhrain');
      });
    });

    when('[t2] a bare token is passed', () => {
      const result = useBeforeAll(async () => runSkill(['ledger.md']));

      then('it names the token on the unexpected-argument arm', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unexpected argument: ledger.md');
      });

      // ⭐ the two catch-alls differ ONLY by message — `-*)` says "unknown
      //    option", `*)` says "unexpected argument", and both exit 2. so a
      //    merge of the two is invisible to `[case7][t2]`, which passes a
      //    dash-prefixed token and would stay GREEN under it.
      then('⭐ it is NOT reported as an unknown OPTION', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });
  });

  /**
   * .what = the three guards that check the INSTALL, not the input
   *
   * .why  = this skill computes nothing itself — it delegates to two neighbor
   *         skills and reads their published tables. so a broken install is
   *         one of its real failure modes, and all three arms that name it
   *         had ZERO assertions in any test file.
   *
   * ⭐ THE TWO GUARDS HAVE DIFFERENT FALL-THROUGHS, and that was MEASURED
   *    rather than reasoned. an earlier draft of this block asserted one
   *    fall-through for both and was wrong about half of it — the error came
   *    from a read at the FUNCTION level (`validate_args` -> `run_tally`)
   *    that skipped the ADJACENT LINE.
   *
   *      guard dropped   scene              falls to         exit  says
   *      -------------   ----------------   --------------   ----  ------------------
   *      card            [t0] both absent   the NEXT arm        1  the WRONG neighbor
   *      card            [t3] card absent   run_tally           3  did not reconcile
   *      stripe          [t1] stripe absent run_tally           3  did not reconcile
   *
   *    so an exit-code assertion discriminates in TWO of those rows and NOT
   *    in the first — which is exactly the row it sits in below. it is kept,
   *    and labelled for what it is.
   *
   * ⚠️ [t0] is ORDER-SHADOWED: with both neighbors absent, the arm one line
   *    down catches what the dropped one would have. that is why [t3] exists —
   *    it holds the stripe neighbor PRESENT so the card guard's own
   *    fall-through is reachable, and the two discriminators can bite.
   *
   * ⭐ where the fall-through IS run_tally, the message carries a diagnosis
   *    the exit code cannot:
   *
   *      guard:        `card tally not found at: <path>`   -> blame the INSTALL
   *      fall-through: `card tally did not reconcile`      -> blame the DATA
   *
   *    a human who reads the second one goes and audits their statements for
   *    a figure that never disagreed. (same shape as #167 and #175: an absent
   *    PACKAGE reported as a corrupt DOCUMENT.)
   *
   * ⚠️ each positive sits apart from its discriminator. jest halts a `then`
   *    at its first red, so a co-located exclusion can never be measured.
   */
  given('[case10] a broken install, with a neighbor out of reach', () => {
    when('[t0] neither tally neighbor is present', () => {
      const scene = genInstall({
        name: 'install-none',
        card: null,
        stripe: null,
      });
      const result = useBeforeAll(async () =>
        runAt(scene.runner, ['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it blames the INSTALL, and names the path it looked at', () => {
        expect(result.stdout).toContain('card tally not found at:');
        expect(result.stdout).toContain('statement.tally/statement.tally.sh');
      });

      // ⚠️ MEASURED TOOTHLESS in this scene, and kept anyway. with both
      //    neighbors absent the drop of this guard lands on the arm one line
      //    down, which also exits 1 — so the code cannot tell the two apart.
      //    [t3] is where this same guard's code assertion DOES bite.
      then('it exits 1, the malfunction code', () => {
        expect(result.exitCode).toBe(1);
      });

      // ⚠️ likewise toothless HERE, for the same reason — the arm one line
      //    down refuses before `run_tally` is ever reached, so no
      //    reconciliation text is emitted either way. [t3] gives it teeth.
      then('⭐ it does NOT report this as a reconciliation failure', () => {
        expect(result.stdout).not.toContain('did not reconcile');
      });
    });

    when('[t1] only the card tally neighbor is present', () => {
      const scene = genInstall({
        name: 'install-card-only',
        card: QUIET_STUB,
        stripe: null,
      });
      const result = useBeforeAll(async () =>
        runAt(scene.runner, ['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it names the STRIPE tally as the absent one', () => {
        expect(result.stdout).toContain('stripe tally not found at:');
        expect(result.stdout).toContain('stripe.tally/stripe.tally.sh');
      });

      // ⭐ the cross-pair. the two guards are drafted in parallel and differ
      //    only by the variable they read, so an arm that checks `$CARD_TALLY`
      //    twice would refuse HERE — with the card tally sitting right there
      //    on disk — and every other assertion above stays green.
      then('⭐ it does NOT blame the card tally, which IS present', () => {
        expect(result.stdout).not.toContain('card tally not found');
      });

      then('⭐ nor does it report a reconciliation failure', () => {
        expect(result.stdout).not.toContain('did not reconcile');
      });
    });

    when('[t2] both neighbors succeed but publish no table', () => {
      const scene = genInstall({
        name: 'install-quiet',
        card: QUIET_STUB,
        stripe: QUIET_STUB,
      });
      const result = useBeforeAll(async () =>
        runAt(scene.runner, ['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it refuses, and names the shape as the cause', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('could not read the tally tables');
      });

      /**
       * ⭐ THE ONE THAT MATTERS. both neighbors exited 0, so `run_tally` is
       *    satisfied and every reconciliation check downstream has nothing to
       *    disagree about. drop this guard and the skill assembles a report
       *    over ZERO YEARS and declares it clean — a laundered total, which
       *    is the failure this whole skill exists to prevent.
       */
      then('⭐ it does NOT emit a clean report over an empty table', () => {
        expect(result.stdout).not.toContain('assembled it,');
      });
    });

    /**
     * ⭐ THE NON-SHADOWED TWIN OF [t0], and the reason it exists is a measured
     *    result rather than a hunch.
     *
     *    [t0] holds BOTH neighbors absent, so a drop of the card guard is
     *    caught by the arm one line down — which refuses at the SAME exit 1,
     *    naming the stripe neighbor. so [t0]'s exit-code assertion and its
     *    reconciliation exclusion are both toothless there, measured.
     *
     *    here the stripe neighbor is PRESENT, so that arm is satisfied and
     *    control reaches `run_tally` — which cannot run an absent file, reads
     *    the shell's 127 as a failed reconciliation, and tells a human their
     *    STATEMENTS disagree when the truth is that a skill is not installed.
     */
    when('[t3] only the STRIPE tally neighbor is present', () => {
      const scene = genInstall({
        name: 'install-stripe-only',
        card: null,
        stripe: QUIET_STUB,
      });
      const result = useBeforeAll(async () =>
        runAt(scene.runner, ['--cards', scene.cards, '--stripe', scene.stripe]),
      );

      then('it names the CARD tally as the absent one', () => {
        expect(result.stdout).toContain('card tally not found at:');
        expect(result.stdout).toContain('statement.tally/statement.tally.sh');
      });

      // ⭐ toothless in [t0], with teeth HERE. the fall-through is run_tally,
      //    which exits 3 — so in this scene the code does discriminate.
      then('it exits 1, not the 3 that run_tally would return', () => {
        expect(result.exitCode).toBe(1);
      });

      // ⭐ the diagnosis discriminator, likewise toothless in [t0]. this is
      //    the assertion that separates "a skill is absent" from "your books
      //    disagree" — two cures with no overlap at all.
      then('⭐ it does NOT report this as a reconciliation failure', () => {
        expect(result.stdout).not.toContain('did not reconcile');
      });
    });
  });
});
