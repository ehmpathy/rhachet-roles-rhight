import { given, then, useBeforeAll, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * .what = integration tests for the statement.tally skill
 * .why  = this produces the figure that lands on Form 1120 line 26. the
 *         two behaviors that must never regress: (a) charges bucket by
 *         CHARGE date, not statement date, and (b) a statement that fails
 *         to reconcile is loud, never silently undercounted.
 *         hermetic — fixtures are written at runtime.
 */

const scriptPath = path.join(__dirname, 'statement.tally.sh');

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

/**
 * .what = build a synthetic amex statement
 * .why  = lets each case pin an exact expected total
 * .note = header text below is verbatim amex; the section regexes depend on it
 */
const genStatement = (input: {
  shutDate: string; // MM/DD/YY
  declared: string; // e.g. '1,000.00'
  charges: { date: string; merchant: string; amount: string }[];
  credits?: { date: string; merchant: string; amount: string }[];
  fees?: { date: string; merchant: string; amount: string }[];
  interest?: { date: string; merchant: string; amount: string }[];
  account?: string; // which card; defaults to the corporate one
}): string =>
  [
    '         American Express Blue Business Cash',
    `         Closing Date ${input.shutDate}`,
    `         Account End${'ing'} ${input.account ?? '9-99999'}`,
    ' Payments and Credits',
    ' Detail        *Indicates posting date',
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
    // .why = a fee and an interest charge are NOT purchases. the parser tags
    //        them as their own kinds so they stay out of the deductible
    //        charge bucket, and the tally surfaces each in its own column.
    //        both blocks are OPTIONAL and absent by default, so every extant
    //        fixture renders byte-identically.
    ...(input.fees?.length
      ? [
          ' Fees               *Indicates posting date',
          '                                                               Amount',
          ...input.fees.map(
            (f) =>
              `${f.date}*       ${f.merchant}                  $${f.amount}`,
          ),
        ]
      : []),
    ...(input.interest?.length
      ? [
          ' Interest Charged',
          '                                                               Amount',
          ...input.interest.map(
            (i) =>
              `${i.date}        ${i.merchant}                 $${i.amount}`,
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
 * .what = cut one `## ` section out of the report, for a scoped search
 *
 * .why  = `the per-month row lands where its header says` is a claim about a
 *         RELATION — which TABLE a row sits in. the report renders the same
 *         seven-column shape twice, from two copy-pasted renderers, so a
 *         whole-report `toContain` can be satisfied by the per-YEAR row when
 *         the per-month table rendered empty.
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

/**
 * .what = copy the skill into a directory the case controls, and decide what
 *         sits beside it
 *
 * ⛔ THE PARSER IS RESOLVED OFF BASH_SOURCE, WITH NO OVERRIDE FLAG.
 *    `statement.tally.sh` sets, once, at the top of the file:
 *      PARSER="$SCRIPT_DIR/../statement.parse/statement.parse.sh"
 *    so no env var and no argument can move it. the ONLY way to reach the
 *    guard that reads it is to move the SKILL — which is also the only way to
 *    hand the tally a parser whose output a case chooses.
 *
 * @param parser  the stub to write at ../statement.parse/statement.parse.sh,
 *                or null to leave that neighbor ABSENT
 */
const genSkillCopy = (input: {
  into: string;
  parser: string | null;
}): string => {
  const skillDir = path.join(input.into, 'statement.tally');
  const vendorsAt = path.join(skillDir, 'vendors');
  fs.mkdirSync(vendorsAt, { recursive: true });

  // .note = output.sh is sourced off SCRIPT_DIR too, and vendors/ is read off
  //         it for the default map, so both travel with the copy
  fs.copyFileSync(scriptPath, path.join(skillDir, 'statement.tally.sh'));
  fs.copyFileSync(
    path.join(__dirname, 'output.sh'),
    path.join(skillDir, 'output.sh'),
  );
  for (const f of fs.readdirSync(path.join(__dirname, 'vendors'))) {
    fs.copyFileSync(
      path.join(__dirname, 'vendors', f),
      path.join(vendorsAt, f),
    );
  }

  if (input.parser !== null) {
    const parseDir = path.join(input.into, 'statement.parse');
    fs.mkdirSync(parseDir, { recursive: true });
    fs.writeFileSync(path.join(parseDir, 'statement.parse.sh'), input.parser);
  }

  return path.join(skillDir, 'statement.tally.sh');
};

/** run a COPY of the skill rather than the one beside this file */
const runCopy = (
  at: string,
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [at, ...args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

describe('statement.tally.sh', () => {
  // .note = a plain const, not useBeforeAll — the proxy that useBeforeAll
  //         returns cannot be passed to path.join as a string
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'statement-tally-'));

  given('[case1] statements that straddle a year boundary', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'straddle');
      fs.mkdirSync(dir, { recursive: true });

      // a january 2024 statement that carries december 2023 charges —
      // the exact case where statement-year and tax-year diverge
      fs.writeFileSync(
        path.join(dir, '2024-01-25.md'),
        genStatement({
          shutDate: '01/25/24',
          declared: '300.00',
          charges: [
            { date: '12/28/23', merchant: 'GOOGLE *ADS1', amount: '100.00' },
            { date: '01/05/24', merchant: 'TWILIO INC', amount: '200.00' },
          ],
        }),
      );

      // a plain december 2023 statement
      fs.writeFileSync(
        path.join(dir, '2023-12-25.md'),
        genStatement({
          shutDate: '12/25/23',
          declared: '50.00',
          charges: [
            { date: '12/01/23', merchant: 'GITHUB, INC.', amount: '50.00' },
          ],
        }),
      );

      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the december charge buckets into 2023, not 2024', () => {
        // 2023 = 50.00 (dec statement) + 100.00 (dec charge on jan statement)
        expect(result.stdout).toMatch(/\|\s*2023\s*\|\s*\$150\.00/);
      });

      then('only the january charge buckets into 2024', () => {
        expect(result.stdout).toMatch(/\|\s*2024\s*\|\s*\$200\.00/);
      });

      then('every statement reconciles', () => {
        expect(result.stdout).toContain('✅ every statement reconciles');
        expect(result.stdout).toContain('reconciled: ✅ all 2 statements');
      });

      then('output matches snapshot', () => {
        // .note = scrub the random tmpdir so the snapshot stays stable
        expect(result.stdout.split(root).join('$TMP')).toMatchSnapshot();
      });
    });
  });

  given('[case2] a statement with credits', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'credits');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '1,000.00',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '1,000.00' },
          ],
          credits: [
            {
              date: '06/02/23',
              merchant: 'YOUR CASH REWARD/REFUND IS',
              amount: '20.00',
            },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('credits reduce the net deductible basis', () => {
        // charges 1000.00, credits -20.00, net 980.00
        expect(result.stdout).toMatch(
          /\|\s*2023\s*\|\s*\$1000\.00\s*\|\s*1\s*\|\s*\$-20\.00\s*\|\s*\*\*\$980\.00\*\*/,
        );
      });

      then('reconciliation compares charges only, apart from credits', () => {
        expect(result.stdout).toContain('✅ every statement reconciles');
      });
    });
  });

  given('[case3] a statement whose rows undercount its declared total', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'mismatch');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-01-25.md'),
        genStatement({
          shutDate: '01/25/23',
          declared: '999.00', // declares more than the single row below
          charges: [
            { date: '01/05/23', merchant: 'GOOGLE *ADS1', amount: '350.00' },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it exits 3 — a silent undercount is never acceptable', () => {
        expect(result.exitCode).toBe(3);
      });

      then('it names the statement and shows the gap', () => {
        expect(result.stdout).toContain('failed to reconcile');
        expect(result.stdout).toContain('2023-01-25.md');
        expect(result.stdout).toContain('parsed=350.00');
        expect(result.stdout).toContain('declared=999.00');
        expect(result.stdout).toContain('diff=-649.00');
      });

      then('the treestruct marks it failed', () => {
        expect(result.stdout).toContain('reconciled: ❌ 1 statement(s)');
      });
    });
  });

  given('[case4] a vendor breakdown is requested', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'vendor');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '1,460.00',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '1,000.00' },
            { date: '06/02/23', merchant: 'TWILIO INC', amount: '10.00' },
            {
              date: '06/03/23',
              merchant: 'Amazon Web Services',
              amount: '300.00',
            },
            // .note = these two hit the SECOND alternative of a
            //         multi-alternative rule ("AMAZON WEB SERVICES|AWS\."
            //         and "WEWORK|REGUS|INDUSTRIOUS"). the map delimiter
            //         is also "|", so a naive left-to-right field split
            //         drops every alternative past the first AND shifts
            //         the 1120 line into the label slot.
            {
              date: '06/04/23',
              merchant: 'AWS.AMAZON.CO SERVICES',
              amount: '50.00',
            },
            {
              date: '06/05/23',
              merchant: 'REGUS MANAGEMENT GROUP',
              amount: '100.00',
            },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] --by vendor is given', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'vendor']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it groups merchants into vendors tagged by 1120 line', () => {
        expect(result.stdout).toContain(
          '| 2023 | 22 Google Ads | 1 | $1000.00 |',
        );
        expect(result.stdout).toContain('| 2023 | 26 Twilio | 1 | $10.00 |');
      });

      then('a rule matches on any of its alternatives', () => {
        // "Amazon Web Services" (1st alt) + "AWS.AMAZON.CO" (2nd alt)
        // land in the same vendor — 2 rows, $350.00
        expect(result.stdout).toContain('| 2023 | 26 AWS | 2 | $350.00 |');
      });

      then('the 1120 line stays paired with its label', () => {
        // REGUS is the 2nd alternative of the rents rule; the line must
        // read 16, not leak the leftover pattern text
        expect(result.stdout).toContain(
          '| 2023 | 16 shared office (rent) | 1 | $100.00 |',
        );
      });

      then('no merchant lands unclassified', () => {
        expect(result.stdout).not.toContain('?? unclassified');
      });

      then('vendors sort by charge size', () => {
        const ads = result.stdout.indexOf('22 Google Ads');
        const aws = result.stdout.indexOf('| 2023 | 26 AWS');
        const twilio = result.stdout.indexOf('26 Twilio');
        expect(ads).toBeLessThan(aws);
        expect(aws).toBeLessThan(twilio);
      });
    });
  });

  given('[case5] artifacts are written to files', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'artifacts');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '100.00',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '100.00' },
          ],
        }),
      );
      return {
        dir,
        report: path.join(root, 'tally.md'),
        rows: path.join(root, 'rows.tsv'),
      };
    });

    when('[t0] --into and --rows are given', () => {
      const result = useBeforeAll(async () =>
        runSkill([
          '--from',
          scene.dir,
          '--into',
          scene.report,
          '--rows',
          scene.rows,
        ]),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the report carries the per-year table', () => {
        const written = fs.readFileSync(scene.report, UTF8);
        expect(written).toContain('# statement.tally');
        expect(written).toContain('## per tax year');
        expect(written).toContain('$100.00');
      });

      then('the rows file carries the raw rows, tagged by source', () => {
        const written = fs.readFileSync(scene.rows, UTF8);
        expect(written.split('\n')[0]).toBe(
          'statement\tdate\tkind\tamount\tmerchant',
        );
        expect(written).toContain('2023-06-23.md\t2023-06-01\tcharge\t100.00');
      });
    });
  });

  given('[case7] one vendor whose spend steps up mid-year', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'runrate');
      fs.mkdirSync(dir, { recursive: true });

      // twilio at 40/mo for two months, then 400/mo — a step change the
      // YEAR grain cannot show, which is the whole reason month exists
      const months: { shut: string; charge: string; twilio: string }[] = [
        { shut: '01/25/26', charge: '01/10/26', twilio: '40.00' },
        { shut: '02/25/26', charge: '02/10/26', twilio: '40.00' },
        { shut: '03/25/26', charge: '03/10/26', twilio: '400.00' },
      ];
      for (const m of months) {
        fs.writeFileSync(
          path.join(dir, `${m.shut.slice(6)}-${m.shut.slice(0, 2)}.md`),
          genStatement({
            shutDate: m.shut,
            declared: (Number(m.twilio) + 10).toFixed(2),
            charges: [
              { date: m.charge, merchant: 'TWILIO INC', amount: m.twilio },
              { date: m.charge, merchant: 'GITHUB, INC.', amount: '10.00' },
            ],
          }),
        );
      }
      return { dir };
    });

    when('[t0] tallied by month', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'month']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('each month gets its own row, keyed YYYY-MM', () => {
        expect(result.stdout).toMatch(/\|\s*2026-01\s*\|\s*\$50\.00/);
        expect(result.stdout).toMatch(/\|\s*2026-02\s*\|\s*\$50\.00/);
        expect(result.stdout).toMatch(/\|\s*2026-03\s*\|\s*\$410\.00/);
      });

      then('the per-vendor-per-month table shows the step change', () => {
        expect(result.stdout).toContain('## per vendor per month');
        expect(result.stdout).toMatch(
          /\|\s*2026-01\s*\|\s*26 Twilio\s*\|\s*1\s*\|\s*\$40\.00/,
        );
        expect(result.stdout).toMatch(
          /\|\s*2026-03\s*\|\s*26 Twilio\s*\|\s*1\s*\|\s*\$400\.00/,
        );
      });

      then('it warns that a card statement is not an invoice', () => {
        expect(result.stdout).toContain('not the vendor');
      });
    });

    when('[t1] narrowed with --only', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'month', '--only', 'twilio']),
      );

      then('it succeeds and names the filter', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('narrowed to `twilio`');
      });

      then('the matched vendor stays', () => {
        expect(result.stdout).toMatch(
          /\|\s*2026-03\s*\|\s*26 Twilio\s*\|\s*1\s*\|\s*\$400\.00/,
        );
      });

      then('every other vendor drops out of the vendor table', () => {
        const table = result.stdout.split('## per vendor per month')[1] ?? '';
        expect(table).not.toContain('$10.00');
      });

      then('the per-month totals stay UNfiltered, as the whole spend', () => {
        // .why = the filter narrows the vendor breakdown, not the run's
        //        totals — a filtered total would misread as "all we spent"
        expect(result.stdout).toMatch(/\|\s*2026-03\s*\|\s*\$410\.00/);
      });
    });

    when('[t2] --only matches no vendor label', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'month', '--only', 'nosuchco']),
      );

      then('it says the result is EMPTY, never implies a zero', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('no vendor label matched');
        expect(result.stdout).toContain('NOT a zero');
      });
    });
  });

  /**
   * ⛔ THE TEETH of the account guard.
   *
   * every statement below reconciles to the penny — the personal card is
   * parsed PERFECTLY. that is the point: reconciliation asks "was this read
   * correctly?", and a stranger's card passes it while it inflates the
   * deduction by its whole balance. the account line is the only signal,
   * so these cases must fail if the guard is removed.
   */
  given('[case8] two different cards in one folder', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'twocards');
      fs.mkdirSync(dir, { recursive: true });

      // the corporate card
      fs.writeFileSync(
        path.join(dir, '2023-06-corp.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '100.00',
          account: '1-00007',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '100.00' },
          ],
        }),
      );

      // the personal card — same issuer, same layout, reconciles cleanly
      fs.writeFileSync(
        path.join(dir, '2023-06-personal.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '900.00',
          account: '6-44000',
          charges: [
            { date: '06/02/23', merchant: 'GOOGLE *ADS1', amount: '900.00' },
          ],
        }),
      );

      return { dir };
    });

    when('[t0] tallied with no account flag', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it blocks — a tally is one card by default', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('2 different cards here');
      });

      /**
       * ⛔ ASSERT THE PAIR, NEVER FOUR BARE TOKENS.
       *
       *    the claim here is the GROUP — which statement sits under which
       *    card — and that is the whole actionable output: a human reads
       *    this block to decide which card to pin. four independent
       *    `toContain` calls cannot see the group at all.
       *
       * 🚩 proven 2026-09-02. `print_account_block` groups with
       *    `awk '$1 == a'`. drop that one condition and EVERY statement
       *    lists under EVERY card — so the block tells a human that the
       *    personal statement belongs to the corporate card, the exact
       *    inverse of what this guard exists to prevent. the suite stayed
       *    47 passed, 0 failed.
       *
       * ⭐ so anchor on ADJACENCY. `[ ]+` rather than `\s+` deliberately:
       *    `\s` matches a newline, which would let a statement three rows
       *    down satisfy a pair it does not belong to.
       *
       *    see rule.require.clamp-edge-cases
       */
      then('it names each card and the statements beneath IT', () => {
        // the two correct pairs
        expect(result.stdout).toMatch(/1-00007\n[ ]+· 2023-06-corp\.md/);
        expect(result.stdout).toMatch(/6-44000\n[ ]+· 2023-06-personal\.md/);
        // ⭐ the discriminators — a cross-pair is the defect, and only
        //    these can see it
        expect(result.stdout).not.toMatch(
          /1-00007\n[ ]+· 2023-06-personal\.md/,
        );
        expect(result.stdout).not.toMatch(/6-44000\n[ ]+· 2023-06-corp\.md/);
      });

      then('it names both deliberate exits', () => {
        expect(result.stdout).toContain('--account ID');
        expect(result.stdout).toContain('--accounts mixed');
      });

      then('it emits NO figure — a blocked tally must not be quotable', () => {
        expect(result.stdout).not.toContain('per tax year');
        expect(result.stdout).not.toContain('$1000.00');
      });
    });

    when('[t1] --account pins the corporate card', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--account', '1-00007']),
      );

      then('it blocks — the other statement belongs to another card', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('wrong card');
        expect(result.stdout).toContain('6-44000');
        expect(result.stdout).toContain('· 2023-06-personal.md');
      });
    });

    when('[t2] --accounts mixed affirms the mix is intended', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--accounts', 'mixed']),
      );

      then('it tallies both together', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/\|\s*2023\s*\|\s*\$1000\.00/);
      });

      then('the report names BOTH cards on its face', () => {
        expect(result.stdout).toContain('card: `1-00007, 6-44000`');
      });
    });

    when('[t3] --account and --accounts mixed are both given', () => {
      const result = useBeforeAll(async () =>
        runSkill([
          '--from',
          scene.dir,
          '--account',
          '1-00007',
          '--accounts',
          'mixed',
        ]),
      );

      then('it blocks rather than pick a winner silently', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('contradicts it');
      });
    });
  });

  given('[case9] a folder that holds only the corporate card', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'onecard');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '100.00',
          account: '1-00007',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '100.00' },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] --account is given with dashes the human recalls', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--account', '100007']),
      );

      then('separators are ignored — 100007 matches 1-00007', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('card: `1-00007`');
      });
    });

    when('[t1] --account names a card that is not here', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--account', '6-44000']),
      );

      then('it blocks and names the card it actually found', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('wrong card');
        expect(result.stdout).toContain('1-00007');
      });
    });

    when('[t2] no account flag is given at all', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('one card needs no flag — the safe path is the bare one', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('card: 1-00007');
      });
    });
  });

  /**
   * .what = a statement that carries a fee and an interest charge
   *
   * .why  = the `fees` and `interest` columns were NEVER NONZERO in any
   *         fixture, so both aggregators (`statement.tally.sh:413-414`,
   *         `:440-441`) were entirely unexercised and every assertion read
   *         `$0.00`. that is the failhide shape — `$0.00` cannot be told
   *         apart from "never counted."
   *
   *         the input class is real: `statement.parse` clamps the case where a
   *         card fee was counted as a deductible charge. the parse side tags it; this
   *         is the consumer that sums it into the column a return reads.
   *         interest expense is Form 1120 line 18, not line 26.
   */
  given('[case10] a statement that carries a fee and interest', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'fees');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '360.00',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '350.00' },
            { date: '06/02/23', merchant: 'TWILIO INC', amount: '10.00' },
          ],
          fees: [
            {
              date: '06/05/23',
              merchant: 'ANNUAL MEMBERSHIP FEE',
              amount: '25.00',
            },
          ],
          interest: [
            {
              date: '06/23/23',
              merchant: 'Interest Charge on Purchases',
              amount: '50.00',
            },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] the directory is tallied', () => {
      const result = useBeforeAll(async () => runSkill(['--from', scene.dir]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      // ⭐ the WHOLE row, so both trailing columns are position-anchored.
      //    `fees` and `interest` are the last two of FOUR identically
      //    formatted `$%s` columns, and the args at `:617` are already out
      //    of field order — so a bare `toContain('$25.00')` could not say
      //    which column it landed in, and a `$6`/`$7` swap would stay green.
      then('the fee and the interest each land in their OWN column', () => {
        expect(result.stdout).toContain(
          '| 2023 | $360.00 | 2 | $0.00 | **$360.00** | $25.00 | $50.00 |',
        );
      });

      // ⚠️ a DIFFERENT axis from the row above — this guards the BUCKET,
      //    not the column. charges must be 360.00, NOT 385.00 or 435.00.
      //    a fee swept into the charge bucket is a disallowed deduction.
      then('neither is swept into the deductible charge bucket', () => {
        expect(result.stdout).not.toContain('$385.00');
        expect(result.stdout).not.toContain('$435.00');
        expect(result.stdout).toMatch(
          /\|\s*2023\s*\|\s*\$360\.00\s*\|\s*2\s*\|/,
        );
      });

      then('the fee row does not inflate the reconcile', () => {
        expect(result.stdout).toContain('every statement reconciles');
      });
    });
  });

  /**
   * .what = the `--by line` mode, which had ZERO coverage
   *
   * .why  = `--by line` is a documented, validated mode (`:163`, `:209`) with
   *         its own aggregator and its own section, and no test ever invoked
   *         it. it is the table that assigns spend to a Form 1120 line and
   *         flags `20/cap` capital assets.
   *
   * ⚠️ the skill's own note at `:550-554` records that a name collision with
   *    the awk prelude "surfaces only as an EMPTY TABLE" — a silent failure
   *    at exit 0. the author named the hazard and shipped no assertion.
   */
  given('[case11] a Form 1120 line breakdown is requested', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'byline');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '1,460.00',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '1,000.00' },
            // .note = these two are DIFFERENT vendors that share line 26.
            //         the roll-up is the whole point of this mode, and this
            //         pair is what makes it observable.
            { date: '06/02/23', merchant: 'TWILIO INC', amount: '10.00' },
            {
              date: '06/03/23',
              merchant: 'Amazon Web Services',
              amount: '300.00',
            },
            {
              date: '06/04/23',
              merchant: 'AWS.AMAZON.CO SERVICES',
              amount: '50.00',
            },
            {
              date: '06/05/23',
              merchant: 'REGUS MANAGEMENT GROUP',
              amount: '100.00',
            },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] --by line is given', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'line']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      // positive control: an empty table is the DOCUMENTED silent failure,
      // so a section that renders no rows must not read as "no charges map"
      then('the section renders at all', () => {
        expect(result.stdout).toContain('## per Form 1120 line per year');
        expect(result.stdout).toContain(
          '| year | 1120 line | count | charges |',
        );
      });

      // ⭐ THE discriminating assertion. the vendor view keeps these apart:
      //      | 2023 | 26 AWS    | 2 | $350.00 |
      //      | 2023 | 26 Twilio | 1 | $10.00  |
      //    the LINE view must MERGE them. `3 | $360.00` appears in neither
      //    the vendor view nor the per-year table, so this row can only
      //    render if the roll-up actually ran.
      then('charges roll up from vendor to 1120 line', () => {
        expect(result.stdout).toContain('| 2023 | 26 | 3 | $360.00 |');
      });

      // ⚠️ these two are NOT redundant with the row above — they rule out a
      //    roll-up that over-merges. a broken key that collapsed every
      //    charge into one bucket would satisfy neither.
      then('lines with a single vendor stay separate', () => {
        expect(result.stdout).toContain('| 2023 | 22 | 1 | $1000.00 |');
        expect(result.stdout).toContain('| 2023 | 16 | 1 | $100.00 |');
      });

      then('the capital-asset caution rides with the table', () => {
        expect(result.stdout).toContain('20/cap');
        expect(result.stdout).toContain('do NOT');
      });
    });
  });

  /**
   * .what = merchants that match no rule in the vendor map
   *
   * .why  = the `## unclassified merchants` section had NEVER rendered. the
   *         suite's only reference to it was `[case4]`'s bare
   *         `not.toContain('?? unclassified')` — an ABSENCE, which cannot
   *         tell a working detector from a dead one. three pieces of the
   *         skill were unexercised: the `vendor()` fallback (`:493`), the
   *         whole `unclassified_detail()` aggregator (`:573`), and the
   *         section renderer (`:688-704`).
   *
   *         the section's own `.why` names the stake: "without this, the
   *         only way to audit the tail is to eyeball raw rows, which is how
   *         a misclassified capital asset slips through."
   *
   * ⚠️ ACME and HARBOR are deliberately chosen to match NO pattern in
   *    `software-startup.vendors`. the map holds broad alternations
   *    (`LINEAR`, `NEON`, `SLACK`, `STRIPE`), so a merchant string must be
   *    checked against the whole file, not merely look unfamiliar.
   */
  given('[case12] merchants that match no rule in the vendor map', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'unmapped');
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '110.00',
          charges: [
            {
              date: '06/01/23',
              merchant: 'ACME PLUMBING SUPPLY',
              amount: '75.00',
            },
            {
              date: '06/02/23',
              merchant: 'HARBOR COFFEE ROASTERS',
              amount: '25.00',
            },
            // .note = a MAPPED merchant, in the same fixture on purpose —
            //         it rules out a detector that flags everything
            { date: '06/03/23', merchant: 'TWILIO INC', amount: '10.00' },
          ],
        }),
      );

      // a second year for ACME only. the `years` column exists to tell a
      // subscription from a one-off, and it is the 4th field of a row whose
      // other three are all numerics — no other table in the report carries it
      fs.writeFileSync(
        path.join(dir, '2024-06-21.md'),
        genStatement({
          shutDate: '06/21/24',
          declared: '75.00',
          charges: [
            {
              date: '06/01/24',
              merchant: 'ACME PLUMBING SUPPLY',
              amount: '75.00',
            },
          ],
        }),
      );

      return { dir };
    });

    when('[t0] --by vendor is given', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'vendor']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      // positive control: the section is nested inside the `--by vendor`
      // branch and behind a non-empty guard, so a dead detector emits no
      // header, no caution, and no table. this is the assertion that must be
      // seen to pass while a row assertion reddens.
      then('the section renders at all', () => {
        expect(result.stdout).toContain('## unclassified merchants');
        expect(result.stdout).toContain(
          '| merchant | count | charges | years |',
        );
      });

      // ⭐ THE discriminating assertion. the vendor table is keyed by
      //    year+vendor, so it MERGES ACME with HARBOR inside 2023 and SPLITS
      //    ACME across 2023/2024. the unclassified table is keyed by
      //    MERCHANT across years, so it does the exact opposite. `2` charges
      //    summing `$150.00` over `2023 2024` appears in no other table, so
      //    this row can only render if the per-merchant aggregation ran.
      then('the detail keys on the merchant, ACROSS years', () => {
        expect(result.stdout).toContain(
          '| ACME PLUMBING SUPPLY | 2 | $150.00 | 2023 2024 |',
        );
      });

      // ⚠️ NOT redundant with the row above — it rules out a detector that
      //    collapsed every unmapped merchant into one bucket, which is
      //    exactly what the vendor table does one section earlier.
      then('a second unmapped merchant gets its OWN row', () => {
        expect(result.stdout).toContain(
          '| HARBOR COFFEE ROASTERS | 1 | $25.00 | 2023 |',
        );
      });

      // ⚠️ a DIFFERENT axis: the BUCKET, not the row. a mapped merchant
      //    swept into the TODO list would send a human to re-classify a
      //    cost that already has a 1120 line.
      then('a mapped merchant stays OUT of the todo list', () => {
        expect(result.stdout).toContain('| 2023 | 26 Twilio | 1 | $10.00 |');
        expect(result.stdout).not.toContain('| TWILIO INC |');
      });

      // the vendor table's own view of the same charges — proves the two
      // aggregations really are different, rather than one re-render
      then('the vendor table still buckets them together, by year', () => {
        expect(result.stdout).toContain(
          '| 2023 | ?? unclassified | 2 | $100.00 |',
        );
        expect(result.stdout).toContain(
          '| 2024 | ?? unclassified | 1 | $75.00 |',
        );
      });
    });
  });

  /**
   * ⭐ THE OUTPUT WALK, applied to `## per month` — the SIBLING of a table
   *    that already carries a whole-row clamp.
   *
   *    `:616-618` and `:626-628` are two SEPARATE awk blocks with a
   *    byte-identical format string and a byte-identical arg list:
   *
   *      printf "| %s | $%s | %d | $%s | **$%s** | $%s | $%s |\n",
   *             $1, $3, $2, $4, $5, $6, $7
   *
   *    [case10] pinned the WHOLE per-YEAR row, precisely because those args
   *    are out of column order and a bare `toContain('$25.00')` cannot say
   *    which of four identically formatted `$%s` columns it landed in.
   *
   * ⛔ the per-MONTH row got none of that. every assertion on it stops after
   *    column 2 — `toMatch(/\|\s*2026-01\s*\|\s*\$50\.00/)` at `:424-426`
   *    and `:468`. so FOUR of its seven columns — credits, net, fees,
   *    interest — are read by no assertion at all, and a `$6`/`$7` or
   *    `$4`/`$5` swap in that renderer alone stays fully green.
   *
   * ⚠️ AND THE SKILL'S OWN COMMENT ASSERTS THE GUARANTEE THAT WOULD HAVE
   *    MADE THAT SAFE. `tally_by_month`'s note at `:432-434` says the row
   *    format is "deliberately identical so the report can SHARE A FORMATTER
   *    and the two grains cannot drift apart." the two AGGREGATORS do share
   *    a shape. the two RENDERERS are copy-pasted, so no mechanism stops
   *    them drifting — and only one of the pair was ever observed.
   *
   *    same shape as `line_for`s comment in stripe.tally: prose about
   *    correctness is the weakest evidence there is.
   */
  given('[case13] the `--by month` row — the SAME renderer, unclamped', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'monthrow');
      fs.mkdirSync(dir, { recursive: true });
      // one month, and every one of the seven columns distinct and nonzero,
      // so no two can be transposed without a visible change
      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '360.00',
          charges: [
            { date: '06/01/23', merchant: 'GOOGLE *ADS1', amount: '350.00' },
            { date: '06/02/23', merchant: 'TWILIO INC', amount: '10.00' },
          ],
          credits: [
            {
              date: '06/03/23',
              merchant: 'YOUR CASH REWARD/REFUND IS',
              amount: '60.00',
            },
          ],
          fees: [
            {
              date: '06/05/23',
              merchant: 'ANNUAL MEMBERSHIP FEE',
              amount: '25.00',
            },
          ],
          interest: [
            {
              date: '06/23/23',
              merchant: 'Interest Charge on Purchases',
              amount: '50.00',
            },
          ],
        }),
      );
      return { dir };
    });

    when('[t0] --by month is given', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--by', 'month']),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      // ⭐ the whole row, SCOPED to its own section. the per-year table one
      //    screen up renders the identical seven figures — only the key cell
      //    differs — so a whole-report `toContain` could be satisfied by the
      //    wrong table if the month renderer emitted an empty table.
      then('every per-MONTH column lands where its header says', () => {
        const section = sliceSection({
          of: result.stdout,
          from: '## per month',
        });
        expect(section).not.toEqual(''); // positive control: the header exists
        expect(section).toContain(
          '| 2023-06 | $360.00 | 2 | $-60.00 | **$300.00** | $25.00 | $50.00 |',
        );
      });

      // ⭐ the discriminators — each is a TRANSPOSITION of the pair beside
      //    it, which every extant per-month assertion is blind to because it
      //    stops after column 2
      then('no two of its columns are transposed', () => {
        const section = sliceSection({
          of: result.stdout,
          from: '## per month',
        });
        expect(section).not.toContain('| $50.00 | $25.00 |'); // fees <-> interest
        expect(section).not.toContain('| $-60.00 | **$360.00** |'); // credits <-> net
        expect(section).not.toContain('| 2023-06 | $-60.00 |'); // charges <-> credits
      });

      // the two grains must AGREE on a single-month fixture. this is the
      // property the skill's `:432-434` note claims and does not enforce.
      then('the per-YEAR row carries the same seven figures', () => {
        const section = sliceSection({
          of: result.stdout,
          from: '## per tax year',
        });
        expect(section).not.toEqual('');
        expect(section).toContain(
          '| 2023 | $360.00 | 2 | $-60.00 | **$300.00** | $25.00 | $50.00 |',
        );
        // ⛔ and the month key must NOT reach the year table
        expect(section).not.toContain('| 2023-06 |');
      });
    });
  });

  given('[case6] bad invocations', () => {
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

    when('[t2] --by is unknown', () => {
      then('it blocks', () => {
        const result = runSkill(['--from', root, '--by', 'moon']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown --by mode');
      });
    });

    when('[t6] --accounts is an unknown mode', () => {
      then('it blocks', () => {
        const result = runSkill(['--from', root, '--accounts', 'whatever']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown --accounts mode');
      });
    });

    when('[t5] --only is given without --by month', () => {
      then('it blocks, rather than silently drop the filter', () => {
        const result = runSkill([
          '--from',
          root,
          '--by',
          'vendor',
          '--only',
          'twilio',
        ]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--only applies to --by month');
      });
    });

    when('[t3] the directory carries no statements', () => {
      then('it blocks rather than report an empty tally', () => {
        const empty = path.join(root, 'empty');
        fs.mkdirSync(empty, { recursive: true });
        const result = runSkill(['--from', empty]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no statements found');
      });
    });

    when('[t4] --help is given', () => {
      then('it prints usage and exits clean', () => {
        const result = runSkill(['--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: statement.tally.sh');
      });
    });
  });

  /**
   * .what = the arg-parse arms no other case reaches
   *
   * .why  = an ARM WALK of statement.tally.sh:90-152 found SIX arms with zero
   *         coverage anywhere in the repo — `-h`, the rhachet passthrough,
   *         `-*`, the second-positional `else`, `--format`, and `--vendors`.
   *         every one is a line every invocation runs past, so a line-coverage
   *         report scores the block at 100% and reports no gap.
   *
   * ⚠️ EVERY assertion here is a MESSAGE, never an exit code. five of the six
   *    defects fall through to a NEIGHBOURING refusal that exits 2 — the SAME
   *    code the arm itself returns — so `expect(exitCode).toBe(2)` stays green
   *    over an arm that never ran. that is leak 6 of
   *    `rule.require.assertions-that-discriminate`, and it was confirmed three
   *    times in the sibling skill.
   *
   * ⚠️ and each positive sits in a SEPARATE `then` from its discriminator.
   *    jest stops a `then` at its first red, so a co-located exclusion is
   *    never measured — the exclusion cannot be proven to bite.
   */
  given('[case14] the arg-parse arms', () => {
    const scene = useBeforeAll(async () => {
      const dir = path.join(root, 'argparse');
      const other = path.join(root, 'argparse-other');
      fs.mkdirSync(dir, { recursive: true });
      fs.mkdirSync(other, { recursive: true });

      fs.writeFileSync(
        path.join(dir, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '100.00',
          charges: [
            { date: '06/01/23', merchant: 'TWILIO INC', amount: '100.00' },
          ],
        }),
      );

      return { dir, other };
    });

    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () => runSkill(['-h']));

      then('it prints the same usage as --help', () => {
        expect(result.stdout).toContain('usage: statement.tally.sh');
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

    when('[t1] rhachet passes --skill, --repo and --role', () => {
      const result = useBeforeAll(async () =>
        runSkill([
          '--from',
          scene.dir,
          '--skill',
          'statement.tally',
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
        // .why = `shift 2` -> `shift` on that arm and `statement.tally`
        //        survives as a bare word, so it lands on the `*)` arm and is
        //        refused as an `unexpected argument` — a run that names the
        //        SKILL'S OWN NAME as the caller's mistake.
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });

    when('[t2] an unknown option is given', () => {
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

    when('[t3] a second directory is given', () => {
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
        //        the silent pick is a whole card's statement set. that is
        //        precisely the deduction defect
        //        `rule.require.one-card-per-tally` exists to prevent, reached
        //        through the arg parser rather than through the account line.
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(`unexpected argument: ${scene.other}`);
        expect(result.stdout).not.toContain('## by year');
      });
    });

    when('[t4] --format names a format the parser does not know', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--format', 'nosuchformat']),
      );

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ the flag REACHES the parser — it is not a no-op', () => {
        // .why = `--format` is only ever FORWARDED — `statement.tally.sh`
        //        has exactly one `bash "$PARSER" … --format "$FORMAT"` —
        //        so a parse of the flag that never reaches the parser leaves
        //        every run green and the flag inert. the tell is that a bogus
        //        format must make every statement fail to parse, which is
        //        `no rows parsed` — a run that SUCCEEDS here proves the value
        //        was accepted and thrown away.
        expect(result.stdout).toContain('no rows parsed');
        expect(result.stdout).not.toContain('✅ every statement reconciles');
      });
    });

    when('[t5] --vendors names an unknown map', () => {
      const result = useBeforeAll(async () =>
        runSkill(['--from', scene.dir, '--vendors', 'nosuchmap']),
      );

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the MAP, and says where a map may live', () => {
        // .why = an unknown vendor map is a caller-fixable constraint, and
        //        the two cures are not guessable — a NAME under vendors/, or
        //        a PATH. a refusal that omits them sends the caller to read
        //        the source. (`rule.require.errors-name-the-fix`)
        expect(result.stdout).toContain('unknown vendor map: nosuchmap');
        expect(result.stdout).toContain('vendors/');
      });
    });
  });

  /**
   * ⛔ THE TWO GUARDS NO ARGUMENT CAN REACH.
   *
   *    `:230` reads a path derived from BASH_SOURCE, and `:343` fires only on
   *    parser output that the real parser will never emit. neither is
   *    reachable from the copy of the skill beside this file, so both had ZERO
   *    message assertions until now — the MESSAGE walk found them, and the
   *    directory copy is what makes them testable.
   *
   * ⚠️ THEIR FALL-THROUGHS ARE NOT ALIKE, so the two `when`s below discriminate
   *    by opposite means:
   *
   *      :230  falls through to a DIFFERENT REFUSAL — `no rows parsed from:`
   *            at exit 2. so the message AND the code both move
   *      :343  falls through to SILENT SUCCESS at exit 0. so no message is
   *            printed to exclude, and only the ABSENCE of the report pins it
   */
  given('[case15] the two guards reachable only by a directory copy', () => {
    const scene = useBeforeAll(async () => {
      const from = path.join(root, 'copyfrom');
      fs.mkdirSync(from, { recursive: true });
      fs.writeFileSync(
        path.join(from, '2023-06-23.md'),
        genStatement({
          shutDate: '06/23/23',
          declared: '100.00',
          charges: [
            { date: '06/01/23', merchant: 'TWILIO INC', amount: '100.00' },
          ],
        }),
      );

      /**
       * ⛔ a parser that emits a WELL-FORMED table with NO `account` row.
       *
       *    `:338`'s own note says an empty result means the parser was
       *    bypassed, and this is that bypass made concrete: every column the
       *    tally reads is present and the amounts reconcile to the penny —
       *    only the one field that answers "whose card?" is absent.
       */
      const parserNoAccount = [
        '#!/usr/bin/env bash',
        'set -euo pipefail',
        "printf 'date\\tkind\\tamount\\tmerchant\\n'",
        "printf '06/01/23\\tcharge\\t100.00\\tTWILIO INC\\n'",
        "printf '06/23/23\\tdeclared.charges\\t100.00\\tTotal New Charges\\n'",
        '',
      ].join('\n');

      return {
        from,
        absent: genSkillCopy({
          into: path.join(root, 'copy-noparser'),
          parser: null,
        }),
        accountless: genSkillCopy({
          into: path.join(root, 'copy-noaccount'),
          parser: parserNoAccount,
        }),
      };
    });

    when('[t0] the parser beside the skill is absent', () => {
      const result = useBeforeAll(async () =>
        runCopy(scene.absent, ['--from', scene.from]),
      );

      then('it blocks as a MALFUNCTION, not a constraint', () => {
        // .why = an absent parser is a broken INSTALL, which the caller cannot
        //        fix by a different flag. the fall-through refuses at exit 2,
        //        so this assertion moves on its own.
        expect(result.exitCode).toBe(1);
      });

      then('⭐ it names the PARSER', () => {
        expect(result.stdout).toContain('parser not found at:');
      });

      then('⭐ and does NOT blame the statements it never read', () => {
        // .why = delete this guard and every parse fails into the
        //        `PARSE_FAILED` branch (`:285-288`), so `rows_file` comes back
        //        empty and `:741` refuses with `no rows parsed from: <dir>`.
        //        that is a run which blames the CALLER'S DOCUMENTS for a
        //        defect in the SKILL'S OWN INSTALL — the inverse-blame shape
        //        already met in pdf.redact and statement.parse. a human would
        //        go audit statements that parse perfectly.
        expect(result.stdout).not.toContain('no rows parsed');
      });
    });

    when('[t1] the parser returns rows but declares no account', () => {
      const result = useBeforeAll(async () =>
        runCopy(scene.accountless, ['--from', scene.from]),
      );

      then('it blocks as a constraint', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it says the CARD cannot be named', () => {
        expect(result.stdout).toContain('no statement declared an account');
      });

      then(
        '⭐ and NO tally is produced over a folder it cannot attribute',
        () => {
          // .why = delete this guard and the fall-through is SILENT SUCCESS, not
          //        a second refusal. with `pairs` empty, `n_named` counts the one
          //        blank line printf emits, so it equals `n_stmt` at 1 and `:350`
          //        passes; `n_accounts` is 1 for the same reason and `:373`
          //        passes too. the run reaches `reconcile` and reports an EMPTY
          //        card label over a real dollar figure bound for line 26 —
          //        exactly what `rule.require.one-card-per-tally` forbids.
          //        ⛔ the exit code moves 2 -> 0 here, so it is the ABSENCE of
          //        the report, never the presence of a message, that pins it.
          expect(result.stdout).not.toContain('reconciled');
        },
      );
    });
  });
});
