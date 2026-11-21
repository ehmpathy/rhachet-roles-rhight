import { given, then, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

/**
 * .what = verifies the §504 penalty and interest accrual
 *
 * .why  = this skill exists to TEST a State assessment, so a defect here
 *         would produce a confident "the bill is wrong" (or "the bill is
 *         right") on bad arithmetic. either direction is expensive.
 *
 *         the decisive case is [case1]: the §504(a) installment schedule.
 *         a naive model bills everything on March 1 following the tax
 *         year and understates interest by ~40%, because 40% of the tax
 *         was actually due June 1 OF the tax year — nine months earlier.
 */
describe('franchise.tax.delaware.accrue.sh', () => {
  const scriptPath = path.join(__dirname, 'franchise.tax.delaware.accrue.sh');

  const run = (
    args: string[],
  ): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = --help renders the doc block, and ONLY the doc block
   *
   * .why  = ⛔ THE CLAMP. under `seen == 0` this whole command printed the
   *         single line `!/usr/bin/env bash` — the shebang with its `#`
   *         stripped. the doc block sits BETWEEN the two #### banners, so
   *         `seen == 0` could never reach it.
   *
   *         ⚠️ a broken help renderer is SILENT. it exits 0 and prints one
   *         plausible line, so neither the exit code nor stderr reports it.
   *         it is visible only to a human who reads the output — which is
   *         why it survived here while every arithmetic case stayed green.
   *
   * .how = each assertion rules out a DIFFERENT wrong fix, so no single
   *        plausible repair turns them all green:
   *
   *          1. the doc text is present  -> rules out the shipped defect
   *          2. the shebang is ABSENT    -> rules out "drop the seen guard"
   *                                         (`/^#/ { print }`), which emits
   *                                         the doc block AND line 1
   *          3. body code is ABSENT      -> rules out "print every #-line",
   *                                         and catches the mawk failure
   *                                         mode where an awk filter that
   *                                         should stop early instead dumps
   *                                         the whole executable
   */
  given('[case0] the --help contract', () => {
    when('[t0] --help is passed', () => {
      const result = run(['--help']);

      then('it succeeds', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('it renders the usage block, not one line', () => {
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--tax');
        expect(result.stdout).toContain('--asof');
        expect(result.stdout.trim().split('\n').length).toBeGreaterThan(10);
      });

      then('it does NOT leak the shebang', () => {
        expect(result.stdout).not.toContain('/usr/bin/env');
      });

      then('it does NOT dump the body', () => {
        expect(result.stdout).not.toContain('FIT=""');
      });
    });
  });

  given('[case1] a liability at or above the §504(a) $5,000 threshold', () => {
    when('[t0] the schedule is emitted for tax year 2022', () => {
      const result = run([
        '--tax',
        '85165',
        '--years',
        '2022',
        '--asof',
        '2024-03-01',
      ]);

      then('it succeeds', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      /**
       * .why = ⚠️ THE DECISIVE ASSERTION. the first installment is due
       *        June 1 of the TAX YEAR, not March 1 of the year following.
       *        if this date regresses to 2023-03-01, every accrual this
       *        skill produces understates the State's interest.
       */
      then('40% is due June 1 OF the tax year, not March 1 following', () => {
        expect(result.stdout).toContain('2022-06-01');
        expect(result.stdout).toContain('34,066.00');
      });

      then(
        'the remaining 60% lands on Sep 1, Dec 1, and Mar 1 following',
        () => {
          expect(result.stdout).toContain('2022-09-01');
          expect(result.stdout).toContain('2022-12-01');
          expect(result.stdout).toContain('2023-03-01');
        },
      );

      then('the four installments sum to the annual tax', () => {
        // 34,066 + 17,033 x 3 = 85,165
        expect(result.stdout).toContain('17,033.00');
      });

      /**
       * ⭐ THE OUTPUT WALK. every assertion above is a bare `toContain` over
       *    the WHOLE report, and each `then`-string claims a RELATION —
       *    "40% is DUE June 1", "the rest LANDS ON Sep 1, Dec 1". which date
       *    carries which amount is the entire content of a schedule, and a
       *    set of independent presence checks cannot see it.
       *
       * ⛔ the report renders FOUR rows of one identical shape, so rotate the
       *    percentages — put `0.40` on the March row and `0.20` on June, the
       *    "remainder is largest" misread of §504(a) — and:
       *
       *      `2022-06-01`  still present ✅
       *      `34,066.00`   still present ✅  (now on 2023-03-01)
       *      `17,033.00`   still present ✅
       *      the three date assertions   ✅
       *
       *    every extant assertion stays green over a schedule that defers
       *    80% of the tax by nine months.
       *
       * ⚠️ AND THAT IS THE DEFECT `[t0]`s OWN DOCBLOCK CALLS DECISIVE:
       *    "if this date regresses to 2023-03-01, every accrual this skill
       *    produces understates the State's interest." the `then`-string
       *    names the relation; the assertion beneath it reads a token.
       *
       *    the §504(a)(N) labels have no assertion in this file at all, so a
       *    label rotation is invisible by the same mechanism.
       */
      then('each installment binds its date, amount, months, and cite', () => {
        expect(result.stdout).toContain(
          '2022-06-01  $   34,066.00  × 21 mo → $ 10,730.79  40% estimated (§504(a)(1))',
        );
        expect(result.stdout).toContain(
          '2022-09-01  $   17,033.00  × 18 mo → $  4,598.91  20% estimated (§504(a)(2))',
        );
        expect(result.stdout).toContain(
          '2022-12-01  $   17,033.00  × 15 mo → $  3,832.43  20% estimated (§504(a)(3))',
        );
        expect(result.stdout).toContain(
          '2023-03-01  $   17,033.00  × 12 mo → $  3,065.94  20% remainder (§504(a)(4))',
        );
      });

      then('the 40% instalment reaches NO other due date', () => {
        // ⭐ the discriminator. a rotation moves it and every token survives
        expect(result.stdout).not.toContain('2022-09-01  $   34,066.00');
        expect(result.stdout).not.toContain('2022-12-01  $   34,066.00');
        expect(result.stdout).not.toContain('2023-03-01  $   34,066.00');
        // ⛔ and the earliest date must never carry a 20% share
        expect(result.stdout).not.toContain('2022-06-01  $   17,033.00');
      });

      /**
       * .why = `rule.forbid.hand-computed-figures` makes the artifact of
       *        record the SKILL's output, and this caveat is what stops a
       *        reader who presents a derived figure to Delaware as the
       *        amount owed. it is emitted on every run and was read by no
       *        assertion.
       */
      then(
        'the report states it TESTS the bill rather than replaces it',
        () => {
          expect(result.stdout).toContain(
            "⚠️ derived to TEST the State's figure, not to replace it.",
          );
          expect(result.stdout).toContain(
            'simple interest assumed; §504(c) does not state compound accrual.',
          );
        },
      );

      then('output matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });

    when('[t1] the same year is accrued to its own June 1 due date', () => {
      const result = run([
        '--tax',
        '85165',
        '--years',
        '2022',
        '--asof',
        '2022-06-01',
      ]);

      then('no interest has accrued yet — none of it is late', () => {
        expect(result.stdout).toContain('interest  $0.00');
      });

      then('the $200 report penalty still applies', () => {
        expect(result.stdout).toContain('penalty   $200.00');
      });
    });
  });

  given('[case2] a liability below the §504(a) $5,000 threshold', () => {
    /**
     * .why = the $400 APV minimum is BELOW the threshold, so a reinstated
     *        corporation on the minimum has ONE due date, not four. if the
     *        skill applied installments here it would overstate the
     *        interest on exactly the figure we intend to pay.
     */
    when('[t0] the annual tax is the $400 minimum', () => {
      const result = run([
        '--tax',
        '400',
        '--years',
        '2022',
        '--asof',
        '2024-03-01',
      ]);

      then('the whole tax is due March 1 following — one installment', () => {
        expect(result.stdout).toContain('2023-03-01');
        expect(result.stdout).toContain('return + tax due');
      });

      then('no June/September/December installments appear', () => {
        expect(result.stdout).not.toContain('2022-06-01');
        expect(result.stdout).not.toContain('2022-09-01');
        expect(result.stdout).not.toContain('2022-12-01');
      });
    });
  });

  given('[case3] §504(c) counts a partial month as a whole one', () => {
    when('[t0] accrual runs one day past a due date', () => {
      const early = run([
        '--tax',
        '400',
        '--years',
        '2022',
        '--asof',
        '2023-03-01',
      ]);
      const late = run([
        '--tax',
        '400',
        '--years',
        '2022',
        '--asof',
        '2023-03-02',
      ]);

      then('on the due date itself there is no interest', () => {
        expect(early.stdout).toContain('interest  $0.00');
      });

      /**
       * .why = "for each month or portion thereof" — one day late is one
       *        full month of interest. a floor here would drop up to a
       *        month per installment, which across 8 installments is
       *        material.
       */
      then('one day late is a FULL month: $400 x 1.5% = $6.00', () => {
        expect(late.stdout).toContain('interest  $6.00');
      });
    });
  });

  given('[case4] the --fit reconciliation against a State bill', () => {
    when('[t0] a total the model can reproduce is supplied', () => {
      // the model's own output at 2023-11-01 for 2022,2023
      const result = run([
        '--tax',
        '85165',
        '--years',
        '2022,2023',
        '--fit',
        '190914.10',
      ]);

      then('it reports a match rather than a false alarm', () => {
        expect(result.stdout).toContain('✅ within $500');
      });

      /**
       * ⭐ THE QUALIFICATION IS THE LOAD-BEARING HALF OF THE ✅ ARM, and
       *    until this line it had ZERO assertions — `✅ within $500` was
       *    the only token any case read, and it is the first five tokens
       *    of a TWO-LINE verdict.
       *
       *    [t2] of this SAME case documents, and asserts, that the model
       *    is translation-invariant in years: shift every year by one and
       *    the residual is IDENTICAL. so --fit cannot identify which tax
       *    years a bill covers — only the State can. the REPORT says so
       *    in exactly one place, and it is these two lines.
       *
       *    strip them and a ✅ reads as an unqualified match, on a tool
       *    this suite itself proves cannot establish the year set. that
       *    is the very launder [t1]'s docblock exists to prevent — met
       *    through the branch that says YES rather than the one that
       *    says NO.
       *
       * ⚠️ THE NATURAL DEFECT IS A TIDY-UP, NOT A DELETION. the verdict
       *    wraps mid-sentence, so `on these` dangles at the end of line 1.
       *    the obvious cleanup — collapse to `✅ within $500 — the statute
       *    reproduces the bill.` — takes the whole qualification with it
       *    and leaves `toContain('✅ within $500')` GREEN.
       */
      then('⭐ the ✅ verdict carries its ASSUMPTIONS qualifier', () => {
        expect(result.stdout).toContain(
          'the statute reproduces the bill on these',
        );
        expect(result.stdout).toContain(
          'still confirm the year set with the State',
        );
      });
    });

    when('[t1] a total the model cannot reproduce is supplied', () => {
      const result = run([
        '--tax',
        '85165',
        '--years',
        '2022,2023',
        '--fit',
        '500000',
      ]);

      /**
       * .why = the whole value of --fit is that it can say NO. a fitter
       *        that always claims a match is worse than no fitter, because
       *        it would launder a wrong year-set into a confident answer.
       */
      then('it refuses to claim a match', () => {
        expect(result.stdout).toContain('🚩 residual over $500');
        expect(result.stdout).toContain('do NOT present a derived figure');
      });

      /**
       * ⭐ THE MIDDLE LINE OF THE 🚩 ARM had ZERO assertions. the two
       *    above read line 1 and line 3 and SKIP line 2 — so the one row
       *    that tells a caller WHAT TO GO LOOK AT could be deleted and
       *    this case stays green.
       *
       *    a refusal that names no candidate cause is a dead end: the
       *    caller learns the statute does not reproduce the bill and has
       *    nowhere to take it. these three candidates — the year set, the
       *    annual tax, the accrual model — are the whole remedy, and the
       *    first of them is the one [t2] proves --fit cannot settle.
       */
      then('⭐ the 🚩 verdict names the three candidate causes', () => {
        expect(result.stdout).toContain(
          'the year set, the annual tax, or the accrual model is wrong',
        );
      });
    });

    when('[t2] the SAME bill is fit against two different year sets', () => {
      const a = run([
        '--tax',
        '85165',
        '--years',
        '2022,2023',
        '--fit',
        '191652.43',
      ]);
      const b = run([
        '--tax',
        '85165',
        '--years',
        '2023,2024',
        '--fit',
        '191652.43',
      ]);

      const residual = (s: string): string =>
        s.split('\n').find((l) => l.includes('residual')) ?? '';

      /**
       * .why = ⚠️ A DOCUMENTED LIMITATION, asserted so it cannot be
       *        forgotten. the model is translation-invariant in years —
       *        shifting every year by one shifts the best accrual date by
       *        one and leaves the residual identical. so --fit CANNOT
       *        identify which tax years a bill covers. only the State can.
       */
      then(
        'the residuals are identical — the year set is NOT identifiable',
        () => {
          expect(residual(a.stdout)).toEqual(residual(b.stdout));
          expect(residual(a.stdout)).toContain('residual');
        },
      );
    });

    /**
     * .what = every dollar row of the --fit summary carries the right figure
     *
     * .why  = ⛔ THE CLAMP. before this case the --fit block had **zero value
     *         assertions**. [t0] read only `✅ within $500`, [t1] only the
     *         🚩 line, and [t2] only that two runs' residual lines match each
     *         other — a relation that holds even if `residual` printed a
     *         constant. so all six dollar rows the human actually reads were
     *         unasserted, and there is no --fit snapshot either (the only
     *         `toMatchSnapshot` is on the --asof path).
     *
     *         PROVEN 2026-09-02: swapping `$P` and `$I` at
     *         franchise.tax.delaware.accrue.sh's --fit block left the suite at
     *         **20 passed, 0 failed**. that renders
     *         `penalty $20,184.10 (§502(c), $200/yr)` — a figure that
     *         contradicts its own statutory cite by 50x — under a green ✅.
     *
     * ⚠️ the --asof block renders the SAME two variables and IS clamped, by
     *    [case1][t1] (`penalty   $200.00`) and [case3] (`interest  $6.00`).
     *    coverage did not spread: those needles carry the --asof block's
     *    3-space gutter, and the --fit block uses 6, so they cannot match it
     *    even by accident. one renderer of a value being clamped says none of
     *    whether a second renderer of the same value is.
     *
     * ⭐ THE FIT IS DELIBERATELY A NEAR MISS, not the exact figure [t0] uses.
     *    at an exact fit `= total` and `the bill` carry the SAME number and
     *    `residual` is $0.00, so a TOT/FIT swap is invisible — the #125
     *    trap, where a fixture forces two distinct values equal. $190,814.10
     *    is $100 off, which is inside the $500 tolerance (so the ✅ branch is
     *    still the one under test) and makes all six rows distinct.
     */
    when(
      '[t3] a near-miss bill is fit — every row carries a DIFFERENT figure',
      () => {
        const result = run([
          '--tax',
          '85165',
          '--years',
          '2022,2023',
          '--fit',
          '190814.10',
        ]);

        // strip the tree glyph, then match from the START of the label, so
        // `tax` cannot match the `annual tax:` header row two lines up.
        const row = (input: { of: string; label: string }): string =>
          input.of
            .split('\n')
            .find((l) =>
              l.replace(/^\s*[├└]─\s*/, '').startsWith(`${input.label} `),
            ) ?? '';

        then(
          'it is still the ✅ branch — the tolerance is not under test',
          () => {
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('✅ within $500');
          },
        );

        // positive control: every row this case asserts about actually exists.
        // without it, a renderer that emitted none of them would satisfy every
        // `not.toContain` below trivially.
        then('all six dollar rows are present', () => {
          for (const label of [
            'tax',
            'penalty',
            'interest',
            '= total',
            'the bill',
            'residual',
          ]) {
            expect(row({ of: result.stdout, label })).not.toEqual('');
          }
        });

        /**
         * .why = ⭐ the discriminating pair. `$400.00` is the §502(c) penalty
         *        and `$20,184.10` is the §504(c) interest; they differ by 50x
         *        and sit on adjacent lines in the same `$%s` format. the
         *        exclusions are what carry the weight — a bare presence check
         *        passes under the swap, because both figures are still in the
         *        report, one row off.
         */
        then(
          'penalty is the $200/yr statutory figure, NOT the interest',
          () => {
            expect(row({ of: result.stdout, label: 'penalty' })).toContain(
              '$400.00',
            );
            expect(row({ of: result.stdout, label: 'penalty' })).not.toContain(
              '$20,184.10',
            );
          },
        );

        then('interest is the 1.5%/mo accrual, NOT the penalty', () => {
          expect(row({ of: result.stdout, label: 'interest' })).toContain(
            '$20,184.10',
          );
          expect(row({ of: result.stdout, label: 'interest' })).not.toContain(
            '$400.00',
          );
        });

        /**
         * .why = `taxsum` is computed at the --fit block as `TAX * yearcount`,
         *        an INDEPENDENT derivation from the year loop that produces
         *        `TOT`. no other computation consumes it, so a wrong year count
         *        here would print a wrong tax beside a right total and still
         *        report ✅.
         */
        then('tax is the annual tax times the year count', () => {
          // 85,165 x 2 years
          expect(row({ of: result.stdout, label: 'tax' })).toContain(
            '$170,330.00',
          );
        });

        /**
         * .why = ⭐ the second discriminating pair, and the reason for the near
         *        miss. `= total` is what the STATUTE produces; `the bill` is
         *        what the State sent. swap them and the report tells the reader
         *        the State's figure is the derived one — which inverts the
         *        entire purpose of --fit.
         */
        then(
          '= total is the DERIVED figure, the bill is the STATE figure',
          () => {
            expect(row({ of: result.stdout, label: '= total' })).toContain(
              '$190,914.10',
            );
            expect(row({ of: result.stdout, label: '= total' })).not.toContain(
              '$190,814.10',
            );
            expect(row({ of: result.stdout, label: 'the bill' })).toContain(
              '$190,814.10',
            );
            expect(row({ of: result.stdout, label: 'the bill' })).not.toContain(
              '$190,914.10',
            );
          },
        );

        then('residual is the gap between them, not either one', () => {
          // 190,914.10 - 190,814.10
          expect(row({ of: result.stdout, label: 'residual' })).toContain(
            '$100.00',
          );
          expect(row({ of: result.stdout, label: 'residual' })).not.toContain(
            '190,',
          );
        });
      },
    );
  });

  given('[case5] inputs that must be refused', () => {
    when('[t0] neither --asof nor --fit is supplied', () => {
      const result = run(['--tax', '85165', '--years', '2022']);

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('one of --asof or --fit is required');
      });
    });

    when('[t1] --asof is not an ISO date', () => {
      const result = run([
        '--tax',
        '85165',
        '--years',
        '2022',
        '--asof',
        'March 2024',
      ]);

      then('it blocks and echoes the bad value', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('March 2024');
      });
    });

    /**
     * ⭐ THE TWO ARG GUARDS NO CASE IN THIS FILE READ — and both are leak 6,
     *    at the same exit 2 as the guard one line down.
     *
     *      :103  --tax and --years are both required
     *      :111  --tax must be a number, got: <value>
     *
     *    [t0] and [t1] above cover the OTHER two (:107, :115), so a read of
     *    this block's exit codes reports the whole family as covered.
     *
     * ⚠️ [t2]'s fall-through is the worst shape of leak 6 yet met: drop :103
     *    with --asof supplied and control lands on :111, which refuses at the
     *    SAME exit 2 AND echoes the SAME flag name. so `toBe(2)` is green,
     *    and so is a bare `toContain('--tax')` — that token sits in both
     *    messages. only the whole phrase discriminates.
     *
     * ⚠️ each positive sits apart from its discriminator. jest halts a `then`
     *    at its first red, so a co-located exclusion can never be measured.
     */
    when('[t2] --tax is omitted', () => {
      const result = run(['--years', '2022', '--asof', '2026-09-01']);

      then('it names BOTH required flags', () => {
        expect(result.stdout).toContain('--tax and --years are both required');
      });

      // ⭐ the discriminator. under a dropped :103 the run falls to :111 and
      //    refuses with `--tax must be a number, got: ` over an EMPTY value —
      //    which blames a value the human never supplied, and sends them to
      //    audit a flag they correctly left off.
      then('⭐ it does NOT blame the value of a flag never supplied', () => {
        expect(result.stdout).not.toContain('must be a number');
      });
    });

    when('[t3] --tax carries a unit suffix', () => {
      const result = run([
        '--tax',
        '$85K',
        '--years',
        '2022',
        '--asof',
        '2026-09-01',
      ]);

      then('it echoes the value it could not read', () => {
        expect(result.stdout).toContain('--tax must be a number, got: 85K');
      });

      // ⭐ the discriminator, and the one that carries the weight. `denude`
      //    strips only `$` and `,`, so `85K` reaches awk as a STRING.
      //
      // ⛔ MEASURED with :111 dropped — awk SPLITS on the value's kind, and
      //    the two halves land wrong in OPPOSITE directions:
      //
      //      t >= 5000   compares as STRINGS ("8" > "5")  -> takes the
      //                  ≥$5,000 INSTALLMENT branch it must not take
      //      t * 0.40    coerces to a NUMBER               -> 85, not 85000
      //
      //    so the run emits `annual tax: $85.00`, a full §504(a)(1)-(4)
      //    installment table, a §502(c) penalty row, and `TOTAL $345.44`,
      //    under `reckoned the accrual` at exit 0 — for a corporation whose
      //    real bill is $85,165. authoritative shape, statute cited per row,
      //    off by three orders of magnitude, and every internal check green.
      //
      // ⚠️ a `toBe(0)`-shaped assertion cannot see this and neither can a
      //    read of the tree. only the ABSENCE of the success header does.
      then('⭐ it does NOT emit a schedule built from a coerced string', () => {
        expect(result.stdout).not.toContain('reckoned the accrual');
      });
    });
  });

  /**
   * .what = the three arms of the arg-parse `case` block that no other
   *         case in this file reaches: the `-h` alias, the rhachet
   *         passthrough, and the `*)` catch-all
   *
   * .why  = ⛔ AN ARM WALK, not an outcome walk. [case0] and [case5] cover
   *         the OUTCOMES (help renders, bad input blocks) and neither one
   *         ever touches these three arms — so a defect in any of them is
   *         invisible from a read of the assertions.
   *
   * .how = ⚠️ EVERY assertion here reads the MESSAGE, never the exit code
   *        alone. this skill has FIVE sites that exit 2, and four of them
   *        sit BELOW the parse block:
   *
   *          :92   unknown argument: $1        <- the arm under test
   *          :103  --tax and --years are both required
   *          :107  one of --asof or --fit is required
   *          :111  --tax must be a number
   *          :115  --asof must be YYYY-MM-DD
   *
   *        so a `*)` arm that swallowed its argument in silence would fall
   *        through to :103 and refuse at the SAME exit 2 — `toBe(2)` is
   *        green either way, and cannot tell "the guard ran" from "the
   *        guard never ran". only the message discriminates.
   *
   *        ⚠️ and the positive is split from its exclusion into separate
   *        `then` blocks, deliberately. jest halts a `then` at its first
   *        red, so an exclusion co-located with a positive that fails is
   *        never evaluated — and an unevaluated clamp cannot be proven to
   *        bite.
   *
   * ⛔ THE ORDER-SHADOWED EXCLUSION — measured 2026-09-03
   *
   *    [t1]'s exclusion names `bhrain`, the value of --repo. the first
   *    draft of this case passed --skill FIRST, and under the `shift`
   *    typo it scored ONE red rather than two: the positive went red and
   *    the exclusion stayed GREEN, under its own named defect.
   *
   *    the cause is EXECUTION ORDER, not a bad needle. under `shift` the
   *    FIRST stray token lands on `*)` and the run refuses THERE — so
   *    with --skill leading, `franchise.tax.delaware.accrue` refused and
   *    control never reached --repo. `bhrain` was absent because the
   *    defect stopped the run before it, which is exactly the state the
   *    exclusion reads as success.
   *
   *    ⚠️ and the obvious repair — name the FIRST flag's value instead —
   *    is VACUOUS the other way here: `franchise.tax.delaware.accrue` is
   *    echoed in the SUCCESS header, so that exclusion would go red on
   *    correct behavior. the fix is to ORDER the flag whose value the
   *    exclusion names FIRST, and pick a value the report never echoes.
   *
   *    ⭐ generalize: for a multi-flag passthrough, an exclusion can only
   *    see the value of the flag that refuses FIRST. every later value is
   *    shadowed, and its exclusion is decoration.
   */
  given('[case6] the arg-parse arms', () => {
    when('[t0] the -h alias is used', () => {
      const result = run(['-h']);

      then('it succeeds', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('it renders the SAME doc block --help does', () => {
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--tax');
        expect(result.stdout).toContain('--asof');
        expect(result.stdout.trim().split('\n').length).toBeGreaterThan(10);
      });

      then('⭐ it does NOT fall through to the catch-all', () => {
        // a dead `-h` lands on `*)` and refuses, at exit 2. the exclusion
        // is what separates "the alias was honored" from "the alias was
        // never in the case list".
        expect(result.stdout).not.toContain('unknown argument');
      });

      then('it does NOT leak the shebang', () => {
        expect(result.stdout).not.toContain('/usr/bin/env');
      });

      then('it does NOT dump the body', () => {
        expect(result.stdout).not.toContain('FIT=""');
      });
    });

    when('[t1] rhachet passes --repo, --role and --skill', () => {
      // ⚠️ --repo LEADS, deliberately. under a `shift` typo the FIRST
      //    stray token refuses and the run stops there, so an exclusion
      //    that names a LATER flag's value can never fire — see the
      //    ORDER-SHADOWED EXCLUSION note above.
      const result = run([
        '--repo',
        'bhrain',
        '--role',
        'accountant',
        '--skill',
        'franchise.tax.delaware.accrue',
        '--tax',
        '85165',
        '--years',
        '2022',
        '--asof',
        '2026-09-03',
      ]);

      then('⭐ it reckons the accrual, and does not block', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('reckoned the accrual');
      });

      then('⭐ it does NOT read a flag VALUE as an argument', () => {
        // the arm consumes the flag AND its value. consume only the flag
        // and `bhrain` becomes the next `$1`, which lands on `*)`.
        expect(result.stdout).not.toContain('bhrain');
      });
    });

    when('[t2] an unknown option is passed', () => {
      const result = run(['--bogus-flag']);

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the OPTION, not an absent required flag', () => {
        expect(result.stdout).toContain('unknown argument: --bogus-flag');
      });

      then('⭐ it refuses at PARSE, not at the guards below it', () => {
        // the four other exit-2 sites. a `*)` that swallowed its argument
        // would reach the first of these and refuse at the same code.
        expect(result.stdout).not.toContain('are both required');
        expect(result.stdout).not.toContain('one of --asof or --fit');
      });

      then('⭐ the refusal names THIS skill, not its prefix-twin', () => {
        // ⚠️ `toContain('franchise.tax.delaware')` is VACUOUS here — the
        // twin's name is a strict PREFIX of this one, so the shorter
        // token matches under both. anchor on the line end instead.
        expect(result.stdout).toMatch(/🏛️ franchise\.tax\.delaware\.accrue\n/);
      });
    });
  });
});
