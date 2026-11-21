import { given, then, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

/**
 * .what = verifies the Delaware franchise tax calculator against
 *         independently published worked examples
 *
 * .why  = the figure this skill emits goes into a petition under
 *         8 Del. C. §505. "my arithmetic looked right" is not evidence.
 *
 *         so the cases below are NOT self-authored. each is a fact
 *         pattern some third party published a full answer to, which
 *         means a defect in the branch logic cannot hide behind a
 *         fixture written to match the code.
 *
 *         the decisive case is [case2] — the only one whose answer is
 *         NOT the $400 minimum. every other case would still pass if
 *         the whole APV computation were replaced by `echo 400`.
 */
describe('franchise.tax.delaware.sh', () => {
  const scriptPath = path.join(__dirname, 'franchise.tax.delaware.sh');

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
   * .what = the line that carries method A's annual figure
   *
   * .why  = ⛔ THREE rows of this report render the shape `$N / year` —
   *         method A, method B step 6, and the `governs:` line. so a bare
   *         `toContain('$85,165.00 / year')` names no cell: it passes just
   *         as happily when that figure is printed under the OTHER method.
   *
   *         and the swap is not cosmetic. it inverts the skill's whole
   *         purpose — the report would tell a reader the DEFAULT method
   *         costs $400 and the ELECTED one costs $85,165, so no election
   *         is needed.
   *
   * .how = method A prints its figure on the line immediately BELOW its
   *        header, so anchor on the header and step one line down. the
   *        caller MUST assert the row is non-empty, or a header rename
   *        turns every exclusion below it vacuously true.
   */
  const rowUnderMethodA = (input: { of: string }): string => {
    const lines = input.of.split('\n');
    const at = lines.findIndex((l) => l.includes('method A ·'));
    if (at === -1) return '';
    return lines[at + 1] ?? '';
  };

  /**
   * .what = the numbered step row of method B, by its step number
   *
   * .why  = same ambiguity as above, from the other side. step 6 is the
   *         only row that carries method B's annual figure.
   *
   * .how = strip the tree glyph, then match from the START of the label,
   *        so `6` cannot match the `$1,000,000` inside step 5.
   */
  const rowAtStep = (input: { of: string; step: string }): string =>
    input.of
      .split('\n')
      .find((l) =>
        l.replace(/^[\s│]*[├└]─\s*/, '').startsWith(`${input.step}. `),
      ) ?? '';

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
        expect(result.stdout).toContain('--authorized');
        expect(result.stdout).toContain('--assets');
        expect(result.stdout.trim().split('\n').length).toBeGreaterThan(10);
      });

      then('it does NOT leak the shebang', () => {
        expect(result.stdout).not.toContain('/usr/bin/env');
      });

      then('it does NOT dump the body', () => {
        expect(result.stdout).not.toContain('PAR=""');
      });
    });
  });

  given(
    '[case1] the demo share structure — 10M authorized @ $0.00001, 8M issued, $0 assets (an illustrative input)',
    () => {
      when('[t0] both methods are computed', () => {
        const result = run([
          '--authorized',
          '10000000',
          '--par',
          '0.00001',
          '--issued',
          '8000000',
          '--assets',
          '0',
        ]);

        then('it succeeds', () => {
          if (result.exitCode !== 0) {
            console.log('PROOF: stdout:', result.stdout);
            console.log('PROOF: stderr:', result.stderr);
          }
          expect(result.exitCode).toBe(0);
        });

        // positive control: both rows this case asserts about actually
        // exist. without it, a header or step rename would satisfy every
        // `not.toContain` below trivially.
        then('the method A row and the step 6 row are both present', () => {
          expect(rowUnderMethodA({ of: result.stdout })).not.toEqual('');
          expect(rowAtStep({ of: result.stdout, step: '6' })).not.toEqual('');
        });

        /**
         * .why = ⭐ the pair that discriminates. `$85,165.00` and `$400.00`
         *        are the two figures this whole skill exists to contrast,
         *        and they render in the SAME `$%s / year` format two rows
         *        apart. the exclusions carry the weight — under a swap
         *        both figures are still in the report, one method off, so
         *        a bare presence check stays green over an output that
         *        tells the reader the default method is the cheap one.
         */
        then(
          'the authorized-shares method is the $85,165 Delaware billed',
          () => {
            expect(rowUnderMethodA({ of: result.stdout })).toContain(
              '$85,165.00 / year',
            );
            expect(rowUnderMethodA({ of: result.stdout })).not.toContain(
              '$400.00',
            );
          },
        );

        then('the assumed-par-value method is the $400 minimum', () => {
          expect(rowAtStep({ of: result.stdout, step: '6' })).toContain(
            '$400.00 / year',
          );
          expect(rowAtStep({ of: result.stdout, step: '6' })).not.toContain(
            '$85,165.00',
          );
          expect(result.stdout).toContain('governs: assumed-par-value');
        });

        then('the assets band is $800,000 — issued/authorized x $1M', () => {
          expect(result.stdout).toContain('$800,000.00');
        });

        /**
         * ⭐ THE OUTPUT WALK. every line the two `then`s below assert is
         *    emitted on EVERY successful run and was read by no assertion in
         *    this file. a grep for `503`, `penalties`, `do not derive`, or
         *    `per $1,000,000` returns only comment text and one `given`
         *    string — so the whole guidance channel of this report had zero
         *    coverage while every arithmetic case stayed green.
         *
         * ⛔ the final caveat is the boundary between THIS skill and its
         *    twin. this one computes TAX ONLY. strip the two lines and the
         *    report's last figure is `× N year(s) = $...  ⬅️ tax only`,
         *    which a reader then takes as the amount owed — while the
         *    State's bill also carries §502(c) penalty and §504(c) interest,
         *    which on a two-year SANDPINE-scale lapse is over $20,000. the
         *    caveat is what routes the reader to
         *    `franchise.tax.delaware.accrue` instead of a short answer.
         *
         * ⛔ the § cites are not decoration.
         *    `rule.forbid.hand-computed-figures` demands "the statutory or
         *    GAAP citation, inline, at each step — so the step can be
         *    checked against the source rather than against intuition." a
         *    report that drops them is a bare total, which is the exact
         *    artifact that rule forbids.
         *
         *    §503(i) is the sharpest of the three, because it names WHERE
         *    the gross-assets figure comes from — Form 1120 Schedule L.
         *    drop it and a reader supplies a bank balance instead, which
         *    corrupts the one input the whole APV answer turns on.
         */
        then(
          'the report sends penalty and interest AWAY from this skill',
          () => {
            expect(result.stdout).toContain(
              '⚠️ tax only. penalties ($200/yr) and interest (1.5%/mo) are fixed',
            );
            expect(result.stdout).toContain(
              'by the state — take them from Delaware, do not derive them.',
            );
          },
        );

        then('each step carries the statute it is checkable against', () => {
          // ⭐ §503(i) names the SOURCE of the one input the answer turns on
          expect(result.stdout).toContain(
            'gross assets: $0.00  (Form 1120 Sch. L, per §503(i))',
          );
          expect(result.stdout).toContain(
            'method A · authorized shares  §503(a)(1)',
          );
          expect(result.stdout).toContain(
            'method B · assumed par value  §503(a)(2)',
          );
          // ⛔ "or fraction" is a CEILING; the natural read is a floor
          expect(rowAtStep({ of: result.stdout, step: '5' })).toContain(
            '$400 per $1,000,000 or fraction',
          );
          expect(rowAtStep({ of: result.stdout, step: '6' })).toContain(
            '(min $400, max $200,000)',
          );
        });

        /**
         * ⭐ THE ECHO IS THE ONLY RECONCILIATION CHANNEL, and until this
         *    line it had ZERO assertions — the snapshot alone read it, and
         *    a snapshot in this repo CANNOT FAIL: `[ -n $RESNAP ]` in
         *    package.json collapses to `[ -n ]`, which POSIX evaluates as
         *    "is the string `-n` non-empty" — true, for every value. so
         *    `--updateSnapshot` is passed on every run and a drifted
         *    snapshot is silently REWRITTEN rather than reported. see task
         *    #169, where a snapshot did not merely fail to catch a probe,
         *    it ADOPTED the probe's output as the expected value, on disk.
         *
         *    these rows are where a human confirms the calculator read
         *    their flags the way they meant them. `rule.forbid.hand-
         *    computed-figures` makes this output the ARTIFACT OF RECORD for
         *    a figure said aloud to a Delaware clerk under §502(b) perjury
         *    — so a caller who reconciles $400.00 against an echo the skill
         *    never used has checked the wrong number and cannot tell.
         *
         * ⚠️ swap `$AUTHORIZED` and `$ISSUED` in the ECHO LINES ALONE and
         *    every arithmetic value in the report is unchanged, so every
         *    other assertion in this file stays green. MEASURED 41/1.
         *
         * ⛔ this clamp pins ONE set of flags, so it cannot see a field that
         *    IGNORES its flag and renders [case1]'s own value as a constant.
         *    [case2] carries the second point that can. do not read this one
         *    as coverage of the echo's per-input behaviour.
         */
        then('⭐ each echo row pairs its LABEL with its OWN figure', () => {
          expect(result.stdout).toContain(
            'authorized: 10,000,000 shares @ $0.00001 par',
          );
          expect(result.stdout).toContain('issued: 8,000,000 shares');
          // the discriminators: under a swap BOTH figures are still in the
          // report, one label off — so a bare presence check stays green
          // over a report that credits the wrong count to the wrong field.
          expect(result.stdout).not.toContain('authorized: 8,000,000');
          expect(result.stdout).not.toContain('issued: 10,000,000');
        });

        then('output matches snapshot', () => {
          expect(result.stdout).toMatchSnapshot();
        });
      });

      when('[t1] the SAME charter is computed with 0 issued shares', () => {
        const result = run([
          '--authorized',
          '10000000',
          '--par',
          '0.00001',
          '--issued',
          '0',
          '--assets',
          '0',
        ]);

        /**
         * .why = this is the whole point of the SANDPINE recompute. the draft
         *        affidavit swore issued = 0. that turned out to be false.
         *        the skill must show the false claim was never even load
         *        critical — and it does so by REFUSAL of the zero case,
         *        because Delaware itself routes issued=0 to a human rather
         *        than publish a rate for it.
         */
        then('it blocks as a constraint rather than emit a number', () => {
          expect(result.exitCode).toBe(2);
          expect(result.stdout).toContain(
            'divides gross assets by issued shares',
          );
        });
      });
    },
  );

  given(
    '[case2] EisnerAmper published example — $50M assets, 15M issued, 20M authorized @ $0.0001',
    () => {
      /**
       * .why = ⚠️ THE DECISIVE CASE. it is the only one whose answer is not
       *        the $400 floor, so it is the only one that exercises:
       *          - step 1's division to 6 decimal places
       *          - the step-2 branch (stated par BELOW assumed par)
       *          - the "$400 per $1,000,000 OR FRACTION" round-up
       *
       *        source: eisneramper.com/insights/life-sciences/c-corp-delaware-franchise-0122
       *        published: "$50M assets / 15M issued = 3.333333 assumed par"
       *        and a tax of $26,800.
       */
      when('[t0] the assumed par value method is applied', () => {
        const result = run([
          '--authorized',
          '20000000',
          '--par',
          '0.0001',
          '--issued',
          '15000000',
          '--assets',
          '50000000',
        ]);

        then('the assumed par matches the published 3.333333', () => {
          expect(result.stdout).toContain('$3.333333');
        });

        then(
          'step 2 fires, not step 3 — stated par is below assumed par',
          () => {
            expect(result.stdout).toContain(
              '2. authorized w/ par BELOW assumed  = $66,666,660.00',
            );
            expect(result.stdout).toContain(
              '3. authorized w/ par AT-OR-ABOVE it = $0.00',
            );
          },
        );

        // scoped to step 6, method B's own row. EisnerAmper's $26,800 is
        // an assumed-par-value figure; on method A's row it would be a
        // wrong answer that a whole-report `toContain` cannot see.
        then('the tax matches the published $26,800', () => {
          expect(rowAtStep({ of: result.stdout, step: '6' })).toContain(
            '$26,800.00 / year',
          );
        });

        /**
         * ⭐ THE SECOND POINT ON THE ECHO. [case1] pins the echo at one set
         *    of flags; this pins it at another. neither alone can see a
         *    field that IGNORES its flag and renders a constant.
         *
         * 🚩 MEASURED 2026-09-03, task #170. [case1] carried a clamp whose
         *    `then`-string read "the CALLER's par, not a default". a probe
         *    that hardcoded the echoed par to `$0.00001` — [case1]'s own
         *    value, so `--par` was honoured by every computation and
         *    ignored by the echo — ran the whole suite at 42 passed / 0
         *    FAILED. that clamp could not fail for the defect it named,
         *    because it read [case1] alone, and it was deleted rather than
         *    kept as decoration.
         *
         *    ⚠️ a case built on ONE set of inputs cannot test a PER-INPUT
         *    property. whatever its `then`-string claims, it asserts a
         *    constant.
         *
         * .why = par is echoed HERE AND NOWHERE ELSE. it feeds method B's
         *        step-2/step-3 split, but that split renders as DOLLARS, so
         *        a par the caller never supplied leaves every other row of
         *        the report untouched.
         */
        then('⭐ the echo tracks the CALLER’s flags at a SECOND point', () => {
          expect(result.stdout).toContain(
            'authorized: 20,000,000 shares @ $0.0001 par',
          );
          expect(result.stdout).toContain('issued: 15,000,000 shares');
          // ⭐ the discriminators name [case1]'s values on purpose: a field
          //    frozen at the [case1] value passes [case1] forever, and is
          //    visible only from a second set of flags.
          expect(result.stdout).not.toContain('10,000,000 shares @');
          expect(result.stdout).not.toContain('$0.00001 par');
          expect(result.stdout).not.toContain('issued: 8,000,000');
        });
      });
    },
  );

  given(
    '[case3] Clerky published example — $50k assets, 5M issued, 10M authorized',
    () => {
      when('[t0] the assumed par value method is applied', () => {
        const result = run([
          '--authorized',
          '10000000',
          '--par',
          '0.0001',
          '--issued',
          '5000000',
          '--assets',
          '50000',
        ]);

        then('assumed par value capital matches the published $100,000', () => {
          expect(result.stdout).toContain('capital = $100,000.00');
        });

        then('the tax is the published $400 minimum', () => {
          expect(rowAtStep({ of: result.stdout, step: '6' })).toContain(
            '$400.00 / year',
          );
        });
      });
    },
  );

  given('[case4] the authorized-shares rate schedule, §503(a)(1)', () => {
    /**
     * .why = "each additional 10,000 or fraction thereof" rounds UP. an
     *        off-by-one here silently misstates the very number under
     *        dispute, which is what the whole petition rests on.
     */
    when('[t0] at each statutory boundary', () => {
      // ⚠️ scoped to METHOD A's row, not the whole report. every figure in
      // this case is a §503(a)(1) rate; each run also prints a method B
      // row and a `governs:` row in the identical `$%s / year` format, so
      // a whole-report match would accept the rate on the wrong method.
      const at = (n: string): string =>
        rowUnderMethodA({
          of: run([
            '--authorized',
            n,
            '--par',
            '0.0001',
            '--issued',
            '1',
            '--assets',
            '0',
          ]).stdout,
        });

      // positive control: the scoped row exists, so the boundary
      // assertions below are read from a real line rather than from ''.
      then('the method A row is present', () => {
        expect(at('5000')).not.toEqual('');
      });

      then('5,000 shares is $175', () => {
        expect(at('5000')).toContain('$175.00 / year');
      });

      then('5,001 shares is $250', () => {
        expect(at('5001')).toContain('$250.00 / year');
      });

      then('10,000 shares is $250', () => {
        expect(at('10000')).toContain('$250.00 / year');
      });

      then('10,001 shares rounds up a whole block to $335', () => {
        expect(at('10001')).toContain('$335.00 / year');
      });

      then('20,000 shares is also $335 — the fraction rule rounds up', () => {
        expect(at('20000')).toContain('$335.00 / year');
      });

      then('10,000,000 shares is the $85,165 startup default', () => {
        expect(at('10000000')).toContain('$85,165.00 / year');
      });
    });
  });

  given('[case5] inputs that must be refused rather than answered', () => {
    when('[t0] the stock has no par value', () => {
      const result = run([
        '--authorized',
        '10000000',
        '--par',
        '0',
        '--issued',
        '8000000',
        '--assets',
        '0',
      ]);

      /**
       * .why = Delaware deems no-par shares worth $100 EACH, which pins
       *        almost any charter at the $200,000 maximum. a number emitted
       *        here would be wrong by ~500x in the direction that costs
       *        money.
       */
      then('it blocks and names the specialist line', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no-par stock');
        expect(result.stdout).toContain('(302) 739-3073');
      });
    });

    when('[t1] issued shares exceed authorized shares', () => {
      const result = run([
        '--authorized',
        '1000',
        '--par',
        '0.0001',
        '--issued',
        '8000000',
        '--assets',
        '0',
      ]);

      then('it blocks — a charter cannot over-issue', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('exceeds');
      });
    });

    /**
     * ⭐ BOTH ARG LOOPS ARE LEAK 6, AND THEY REFUSE EACH OTHER'S INPUTS.
     *
     *      :112  --<name> is required
     *      :126  --<name> must be a non-negative number, got: <value>
     *
     *    each is ONE site that stands for 4 (presence) or 5 (number) flags,
     *    so a `toBe(2)` reads as coverage of the whole arg layer.
     *
     * ⚠️ the two loops catch each other. drop :112 and an absent flag falls
     *    to :126, which refuses at the SAME exit 2, echoes the SAME flag
     *    token, and blames the VALUE of an input the human never supplied.
     *
     * ⚠️ every assertion sits in its OWN `then`. jest halts a `then` at its
     *    first red, so a co-located pair can never be measured — proven
     *    here: under a dropped :126 the extant `[t3]` died on its exit-code
     *    line and its message line was never reached.
     */
    when('[t2] a required argument is absent', () => {
      const result = run(['--authorized', '10000000', '--par', '0.0001']);

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the absent argument', () => {
        expect(result.stdout).toContain('--issued is required');
      });

      // ⭐ the discriminator. under a dropped :112 the run reaches :126 and
      //    refuses with `--issued must be a non-negative number, got: ` over
      //    an EMPTY value — same code, same flag, and it sends the human to
      //    audit an input they correctly left off.
      then('⭐ it does NOT blame the value of an absent argument', () => {
        expect(result.stdout).not.toContain('must be a non-negative number');
      });
    });

    when('[t3] an argument is not a number', () => {
      const result = run([
        '--authorized',
        'ten-million',
        '--par',
        '0.0001',
        '--issued',
        '8000000',
        '--assets',
        '0',
      ]);

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the constraint AND echoes the value', () => {
        expect(result.stdout).toContain(
          '--authorized must be a non-negative number, got: ten-million',
        );
      });

      // ⭐ the discriminator. MEASURED with :126 dropped — awk coerces
      //    `ten-million` to 0, so the report reads:
      //
      //      ├─ authorized: 0 shares @ $0.0001 par
      //      ├─ governs: authorized-shares  →  $165.00 / year
      //         └─ so NO gross-assets figure raises this tax
      //
      //    the SAME charter at its full 10,000,000 is billed $85,165 by that
      //    same §503(a)(1) method — a 516x understatement, at exit 0, under
      //    the CALMEST of the three sensitivity branches.
      //
      // ⚠️ and note WHERE the coercion lands the reader: a zeroed charter
      //    always picks method A, so the report also asserts that no assets
      //    figure can raise the bill. the typo buys false comfort twice.
      then('⭐ it does NOT report a tax computed from a coerced string', () => {
        expect(result.stdout).not.toContain('reckoned it,');
      });
    });
  });

  given(
    '[case6] figures copied off the Delaware site carry punctuation',
    () => {
      when('[t0] commas and dollar signs are passed through', () => {
        const clean = run([
          '--authorized',
          '10000000',
          '--par',
          '0.00001',
          '--issued',
          '8000000',
          '--assets',
          '0',
        ]);
        const dirty = run([
          '--authorized',
          '10,000,000',
          '--par',
          '0.00001',
          '--issued',
          '8,000,000',
          '--assets',
          '$0',
        ]);

        /**
         * .why = the alternative to this tolerance is that a human strips the
         *        commas by hand before each run — the exact re-type step that
         *        rule.forbid.hand-transcription exists to remove.
         */
        then('the answer is byte-identical to the unpunctuated run', () => {
          expect(dirty.exitCode).toBe(0);
          expect(dirty.stdout).toEqual(clean.stdout);
        });
      });
    },
  );

  given('[case8] the sensitivity band — the highest-value output', () => {
    /**
     * .why = 🚩 the band was `$1,000,000 x issued / authorized`, printed
     *        UNCONDITIONALLY under the words "stays at the $400 minimum".
     *        that expression is the T = $400 special case. on any charter
     *        whose tax is above the floor it was wrong TWICE in one line:
     *        it named the $400 floor where the real tax was higher, and
     *        it stopped at the FIRST $1,000,000 block of capital.
     *
     *        [case2] below already sat in this suite with a $26,800 tax
     *        and a band that said "$400 minimum ... up to $750,000" — the
     *        defect was live in a case the suite already ran, because no
     *        assertion had ever read the sensitivity line.
     */
    when('[t0] stated par is AT-OR-ABOVE the assumed par (step 3)', () => {
      const result = run([
        '--authorized',
        '10000000',
        '--par',
        '0.50',
        '--issued',
        '5000000',
        '--assets',
        '500000',
      ]);

      then(
        'the tax is $2,000 — step 3 fires, capital = authorized x par',
        () => {
          expect(result.stdout).toContain(
            '3. authorized w/ par AT-OR-ABOVE it = $5,000,000.00',
          );
          expect(rowAtStep({ of: result.stdout, step: '6' })).toContain(
            '$2,000.00 / year',
          );
        },
      );

      /**
       * .why = ⛔ THE CLAMP. under the one-branch helper this line read
       *        "stays at the $400 minimum for any gross assets up to
       *        $500,000.00" — the $400 is not the tax, and $500,000 is
       *        the step-2 crossover rather than this charter's.
       */
      then('the band names the REAL tax, never the $400 floor', () => {
        expect(result.stdout).toContain('the tax holds at $2,000.00 / year');
        expect(result.stdout).not.toContain('$400 minimum');
      });

      then('the band ends at par x issued = $2,500,000', () => {
        expect(result.stdout).toContain('assets up to $2,500,000.00');
      });
    });

    /**
     * .why = ⛔ THE SECOND CLAMP, and it rules out a DIFFERENT wrong fix.
     *        "the band is `par x issued`" reproduces [t0] exactly and is
     *        still wrong: past the crossover, capital tracks assets again
     *        and the band must move with it. only these two points
     *        together pin the formula.
     */
    when('[t1] the charter is walked ACROSS its crossover', () => {
      const at = (assets: string): string =>
        run([
          '--authorized',
          '10000000',
          '--par',
          '0.50',
          '--issued',
          '5000000',
          '--assets',
          assets,
        ]).stdout;

      then('at the crossover exactly, the tax has not yet moved', () => {
        expect(at('2500000')).toContain('$2,000.00 / year');
        expect(at('2500000')).toContain('assets up to $2,500,000.00');
      });

      then('past it, BOTH the tax and the band move', () => {
        expect(at('3000000')).toContain('$2,400.00 / year');
        expect(at('3000000')).toContain('assets up to $3,000,000.00');
      });
    });

    when(
      '[t2] stated par is BELOW the assumed par (step 2, above floor)',
      () => {
        const result = run([
          '--authorized',
          '20000000',
          '--par',
          '0.0001',
          '--issued',
          '15000000',
          '--assets',
          '50000000',
        ]);

        /**
         * .why = the EisnerAmper charter of [case2]. $50,250,000 is where
         *        capital reaches 67 x $1,000,000 — one more block of
         *        headroom above the $50,000,000 actually reported.
         */
        then('the band scales by the blocks the tax already buys', () => {
          expect(result.stdout).toContain('the tax holds at $26,800.00 / year');
          expect(result.stdout).toContain('assets up to $50,250,000.00');
        });

        /**
         * ⭐ THE CONCLUSION SENTENCE OF THE BAND had ZERO assertions — in
         *    this case AND in the three beside it. all four read only the
         *    two lines above it (`the tax holds at $X`, `assets up to $Y`)
         *    and stop. so the sentence that tells a clerk WHAT THE BAND
         *    MEANS can be deleted, or reworded, in any of them, and every
         *    one of the four stays green.
         *
         * ⚠️ and the skill NAMES the exact defect, in a comment, with no
         *    assertion behind it: "does NOT RAISE, never does not change".
         *    that substitution reads as MORE general and MORE helpful, and
         *    it is FALSE — about THIS charter above all.
         *
         *    [t2] is the step-2 regime, where capital tracks assets. lower
         *    the $50,000,000 here and the tax genuinely FALLS. so `does not
         *    change` would be a lie about the very charter under test, and
         *    the upward claim is the only one that holds in both regimes.
         *
         *    prose about correctness is the weakest evidence there is. this
         *    assertion is what gives that comment teeth.
         */
        then('⭐ the band claims only UPWARD, never "does not change"', () => {
          expect(result.stdout).toContain(
            'so a revision to the assets figure below that line',
          );
          expect(result.stdout).toContain('does NOT raise the tax');
          expect(result.stdout).not.toContain('does not change');
        });
      },
    );

    /**
     * .why = ⛔ THE LET-THROUGH. a band that cried wolf on the ordinary
     *        minimum-tax charter would be worse than the defect, since
     *        this is the shape nearly every startup files. the fix must
     *        leave these two figures byte-identical.
     */
    when(
      '[t3] the ordinary minimum-tax charter — the demo share structure',
      () => {
        const result = run([
          '--authorized',
          '10000000',
          '--par',
          '0.00001',
          '--issued',
          '8000000',
          '--assets',
          '0',
        ]);

        then('the band is unchanged at $400 / $800,000', () => {
          expect(result.stdout).toContain('the tax holds at $400.00 / year');
          expect(result.stdout).toContain('assets up to $800,000.00');
        });
      },
    );

    when('[t4] the authorized-shares method wins', () => {
      const result = run([
        '--authorized',
        '10000',
        '--par',
        '0.0001',
        '--issued',
        '1',
        '--assets',
        '1000000',
      ]);

      /**
       * .why = method A counts authorized shares and ignores assets
       *        entirely. a numeric band here would invite the reader to
       *        infer a threshold that does not exist.
       */
      then('it states that NO assets figure raises the tax', () => {
        expect(result.stdout).toContain('governs: authorized-shares');
        expect(result.stdout).toContain('does not count assets at all');
        expect(result.stdout).toContain('NO gross-assets figure raises');
        expect(result.stdout).not.toContain('assets up to');
      });
    });

    /**
     * ⭐ THE $200,000 CEILING ARM had ZERO coverage — no test in any file
     *    matched `statutory maximum`. and it is not decorative: the band
     *    helper's OWN comment says its formula is "valid ONLY when the APV
     *    method wins and the tax is under the $200,000 statutory maximum.
     *    the caller branches; see the sensitivity block below."
     *
     *    THIS is that branch, and it was unguarded.
     *
     * ⚠️ delete the elif and the else runs at tax = $200,000, so the report
     *    prints a band — "holds ... for any gross assets up to $X" — which
     *    tells a reader the tax RISES past $X. it cannot. the charter sits
     *    at the statutory ceiling and no assets figure moves it.
     *
     *    the harm inverts the band's whole purpose: a caller made to fear
     *    an asset revision that cannot cost them a dollar, and tempted to
     *    under-report assets under §503(i) to stay below a line that does
     *    not exist.
     *
     *    `not.toContain('assets up to')` is the discriminator — the one
     *    assertion that reddens when the ceiling arm falls through to the
     *    band.
     */
    when('[t5] BOTH methods are pinned at the statutory maximum', () => {
      const result = run([
        '--authorized',
        '30000000',
        '--par',
        '0.0001',
        '--issued',
        '30000000',
        '--assets',
        // ⚠️ punctuated deliberately. unpunctuated, this figure is an unbroken
        // 9-digit run, which matches the pii.scan `ssn` AND `ein` detectors at
        // once and blocks the pre-commit gate. `[case6]` clamps that the skill
        // accepts punctuation, so this is byte-identical in behavior.
        //
        // ⛔ do NOT restate the unpunctuated form anywhere — a note that spells
        // it out re-trips the same gate the note exists to explain.
        '600,000,000',
      ]);

      then('⭐ at the cap it names the CEILING, never a band', () => {
        expect(result.stdout).toContain('$200,000.00 / year');
        expect(result.stdout).toContain(
          'already at the $200,000 statutory maximum',
        );
        expect(result.stdout).toContain(
          'no gross-assets figure raises it further',
        );
        expect(result.stdout).not.toContain('assets up to');
      });
    });
  });

  given('[case7] a multi-year assessment', () => {
    when('[t0] two years are owed', () => {
      const result = run([
        '--authorized',
        '10000000',
        '--par',
        '0.00001',
        '--issued',
        '8000000',
        '--assets',
        '0',
        '--years',
        '2',
      ]);

      then('the annual figure is multiplied', () => {
        expect(result.stdout).toContain('× 2 year(s) = $800.00');
      });

      then('the avoided amount is stated against method A', () => {
        expect(result.stdout).toContain('$169,530.00 avoided');
      });
    });
  });

  /**
   * .what = the arg-parse arms no other case in this file reaches
   *
   * .why  = an ARM WALK of :85-95 found THREE arms with zero coverage
   *         anywhere in the repo — the `-h` alias, the rhachet
   *         passthrough, and the `*)` catch-all. every one is a line each
   *         invocation runs PAST, so a line-coverage report scores the
   *         block at 100% and reports no gap. only a walk of the `case`
   *         arms finds them.
   *
   * ⛔ LEAK 6 IS IN FORCE, AND HARD. this skill has SIX exit-2 sites —
   *    the `*)` catch-all at :94, the required-arg guard at :112, the
   *    non-negative-number guard at :126, and three domain refusals at
   *    :138 / :143 / :148 (no-par, zero-issued, issued>authorized).
   *
   *    so `expect(exitCode).toBe(2)` names NONE of them. it is satisfied
   *    by five guards that are not the one under test, and by a `*)` arm
   *    deleted outright — where the bogus flag is silently ignored and
   *    the run then refuses on an absent `--authorized`. the MESSAGE is
   *    the only observable that separates them.
   *
   * ⚠️ and the `-h` arm carries the #98 defect class, not merely a dead
   *    alias. `show_help` renders the doc block with an awk filter that
   *    once emitted the single line `!/usr/bin/env bash` — SILENTLY, at
   *    exit 0. so a clamp that only checks `exitCode === 0` would report
   *    a live alias over a renderer that prints one wrong line. `-h`
   *    gets the same three-way check `[case0]` gives `--help`.
   */
  given('[case9] the arg-parse arms', () => {
    when('[t0] the -h alias is used', () => {
      const result = run(['-h']);

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('⭐ it renders the SAME doc block --help does', () => {
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--authorized');
        expect(result.stdout.trim().split('\n').length).toBeGreaterThan(10);
      });

      then('⭐ it does NOT leak the shebang — the #98 class', () => {
        // a dead `-h` refuses; a BROKEN renderer succeeds and prints one
        // plausible line. only this rules the second one out.
        expect(result.stdout).not.toContain('/usr/bin/env');
      });
    });

    when('[t1] rhachet passes --skill, --repo and --role', () => {
      const result = run([
        '--skill',
        'franchise.tax.delaware',
        '--repo',
        'rhight',
        '--role',
        'accountant',
        '--authorized',
        '10000000',
        '--par',
        '0.00001',
        '--issued',
        '8000000',
        '--assets',
        '0',
      ]);

      then('⭐ it computes, and does not refuse', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain(
          'governs: assumed-par-value  →  $400.00 / year',
        );
      });

      then('⭐ it does NOT read a flag VALUE as an argument', () => {
        // `shift` where `shift 2` belongs leaves the VALUE as $1, which
        // then lands on `*)`. the refusal names the SKILL'S OWN NAME as
        // a bad flag — and it exits 2, the same code as five other
        // guards, so only this exclusion can see it.
        expect(result.stdout).not.toContain('unknown argument');
      });
    });

    when('[t2] an unknown option is given', () => {
      const result = run(['--bogus-flag']);

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the OPTION, not a bare token', () => {
        // a `*)` that drops the `: $1` still satisfies a
        // toContain('unknown argument') — the LOOSE TOKEN discriminates
        // a silent drop but NOT a misnamed refusal, so the value must be
        // in the needle.
        expect(result.stdout).toContain('unknown argument: --bogus-flag');
      });

      then('⭐ it refuses at PARSE, before any validation runs', () => {
        // rules out a `*)` replaced by `shift` — which ignores the bogus
        // flag, reaches the required-arg guard, and refuses at the SAME
        // exit code with a message about an absent --authorized.
        expect(result.stdout).not.toContain('is required');
      });
    });
  });
});
