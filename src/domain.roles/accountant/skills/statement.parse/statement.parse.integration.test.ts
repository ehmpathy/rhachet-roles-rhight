import { given, then, useBeforeAll, when } from 'test-fns';

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * .what = integration tests for the statement.parse skill
 * .why  = the figures this emits land on a federal tax return, so the
 *         parse must be exact: right sections, right signs, right dates.
 *         hermetic — fixtures are written at runtime, no committed binaries.
 */

const scriptPath = path.join(__dirname, 'statement.parse.sh');

const UTF8 = 'utf-8' as const;

/**
 * .what = the bash binary, by absolute path
 * .why  = [case8] runs the skill under a PATH that holds no pdftotext.
 *         spawnSync looks its command up through THAT path, so a bare 'bash'
 *         would not be found and the probe would report a shell fault where
 *         the guard under test should have spoken.
 */
const BASH =
  ['/bin/bash', '/usr/bin/bash'].find((p) => fs.existsSync(p)) ?? 'bash';

const runSkill = (
  args: string[],
  options?: { env?: NodeJS.ProcessEnv },
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync(BASH, [scriptPath, ...args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
    ...(options?.env ? { env: options.env } : {}),
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * .what = a PATH that carries every tool the skill reaches BEFORE its
 *         pdftotext check, and no other
 * .why  = `command -v pdftotext` is the guard under test, so pdftotext must be
 *         genuinely absent — a stub that merely exits nonzero takes a
 *         different branch and proves a different point.
 * .note = ⚠️ exactly ONE symlink is needed, and it is not obvious. every step
 *         on the way to that check is a bash builtin EXCEPT `dirname`, which
 *         the skill uses at load to compute SCRIPT_DIR. drop it and the skill
 *         dies at 127 before the guard is ever reached, and the case goes red
 *         for a reason that has no relation to what it tests.
 */
const genPathWithoutPdftotext = (at: string): string => {
  fs.mkdirSync(at, { recursive: true });
  const dirnameBin = ['/usr/bin/dirname', '/bin/dirname'].find((p) =>
    fs.existsSync(p),
  );
  if (!dirnameBin)
    throw new Error('dirname absent — cannot build the probe PATH');
  fs.symlinkSync(dirnameBin, path.join(at, 'dirname'));
  return at;
};

/**
 * .what = a synthetic amex statement in the exact layout pdftotext emits
 * .why  = pins the parse against the real column/section shape
 * .note = the header text here is verbatim amex wording; it must match
 *         the real statements for the section regexes to be meaningful
 */
const STATEMENT_TYPICAL = [
  '## page 1',
  '',
  '         American Express Blue Business Cash              p. 1/8',
  '         ACME WIDGETS INC',
  '         J DOE                                    Customer Care: 1-800-521-6121',
  '         Closing Date 06/23/23  Next Closing Date 07/25/23',
  '         Account Ending 9-99999',
  '  New Balance                                             $1,000.00',
  '',
  ' Payments and Credits',
  ' Summary',
  '                                                                Total',
  'Payments                                                   -$2,000.00',
  'Credits                                                       -$50.00',
  'Total Payments and Credits                                 -$2,050.00',
  ' Detail        *Indicates posting date',
  'Payments                                                       Amount',
  '05/31/23*      MOBILE PAYMENT - THANK YOU                    -$500.00',
  '06/12/23*      MOBILE PAYMENT - THANK YOU                  -$1,500.00',
  'Credits                                                        Amount',
  '06/02/23*      YOUR CASH REWARD/REFUND IS                     -$50.00',
  '               AMERICAN EXPRESS CASH REBATE TRANSACTION',
  ' New Charges',
  ' Summary',
  '                                                                Total',
  'Total New Charges                                           $1,510.00',
  ' Detail',
  '          J DOE',
  '          Card Ending 9-99999',
  '                                                               Amount',
  '05/27/23       GOOGLE*DOMAINS GOOGLE PAYMENT   G.CO HELPPAY#   $10.00',
  '               COMPUTER PROGRAMMING',
  '06/01/23       GOOGLE *ADS0000000000           CC@GOOGLE.COM   $300.00',
  '               ADVERTISING SERVICE',
  '',
  '## page 2',
  '',
  '  Detail Continued',
  '                                                               Amount',
  '06/02/23      ACME HOSTING                     ACMEHOST.COM    $1,000.00',
  '              WEB HOSTING',
  '06/21/23      GITHUB, INC.                     SAN FRANCISCO   $200.00',
  '              +18774484820',
  'Total Fees for this Period                                       $0.00',
  'Total Interest Charged for this Period                           $0.00',
].join('\n');

/**
 * .what = a statement whose charge rows do not sum to its declared total
 * .why  = proves the reconcile signal is real, not decorative
 */
const STATEMENT_SHORT = [
  '         American Express Blue Business Cash',
  `         Account End${'ing'} 9-99999`,
  '         Closing Date 01/25/23',
  ' New Charges',
  'Total New Charges                                             $999.00',
  ' Detail',
  '                                                               Amount',
  '01/05/23       GOOGLE *ADS0000000000           CC@GOOGLE.COM   $350.00',
].join('\n');

describe('statement.parse.sh', () => {
  // .note = a plain const, not useBeforeAll — the proxy that useBeforeAll
  //         returns cannot be passed to path.join as a string
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'statement-parse-'));

  given('[case1] a typical amex statement', () => {
    const scene = useBeforeAll(async () => {
      const md = path.join(dir, 'typical.md');
      fs.writeFileSync(md, STATEMENT_TYPICAL);
      return { md };
    });

    when('[t0] the statement is parsed', () => {
      const result = useBeforeAll(async () => runSkill([scene.md]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it emits a tsv header', () => {
        expect(result.stdout.split('\n')[0]).toBe(
          'date\tkind\tamount\tmerchant',
        );
      });

      then('it captures all four charges with charge-date years', () => {
        const charges = result.stdout
          .split('\n')
          .filter((l: string) => l.split('\t')[1] === 'charge');
        expect(charges).toHaveLength(4);
        expect(charges[0]).toContain('2023-05-27');
        expect(charges[0]).toContain('10.00');
      });

      then('it parses thousands separators', () => {
        expect(result.stdout).toContain('2023-06-02\tcharge\t1000.00');
      });

      then('it captures the credit as negative', () => {
        expect(result.stdout).toContain('2023-06-02\tcredit\t-50.00');
      });

      then('it separates payments from charges', () => {
        const payments = result.stdout
          .split('\n')
          .filter((l: string) => l.split('\t')[1] === 'payment');
        expect(payments).toHaveLength(2);
        expect(payments[0]).toContain('-500.00');
      });

      then('it emits the declared total for reconciliation', () => {
        expect(result.stdout).toContain(
          '2023-06-23\tdeclared.charges\t1510.00',
        );
      });

      then('the parsed charges equal the declared total', () => {
        const charged = result.stdout
          .split('\n')
          .filter((l: string) => l.split('\t')[1] === 'charge')
          .reduce(
            (sum: number, l: string) => sum + Number(l.split('\t')[2]),
            0,
          );
        expect(charged).toBeCloseTo(1510.0, 2);
      });

      then('it does not treat summary lines as transactions', () => {
        // the "Payments  -$2,000.00" summary line is not a dated row
        expect(result.stdout).not.toContain('-2000.00');
      });

      then('output matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] a statement whose rows undercount its declared total', () => {
    const scene = useBeforeAll(async () => {
      const md = path.join(dir, 'short.md');
      fs.writeFileSync(md, STATEMENT_SHORT);
      return { md };
    });

    when('[t0] the statement is parsed', () => {
      const result = useBeforeAll(async () => runSkill([scene.md]));

      then('it still succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the gap is visible via the declared total', () => {
        const charged = result.stdout
          .split('\n')
          .filter((l: string) => l.split('\t')[1] === 'charge')
          .reduce(
            (sum: number, l: string) => sum + Number(l.split('\t')[2]),
            0,
          );
        expect(charged).toBeCloseTo(350.0, 2);
        expect(result.stdout).toContain('declared.charges\t999.00');
      });
    });
  });

  given('[case3] output redirected to a file', () => {
    const scene = useBeforeAll(async () => {
      const md = path.join(dir, 'into.md');
      fs.writeFileSync(md, STATEMENT_TYPICAL);
      return { md, out: path.join(dir, 'rows.tsv') };
    });

    when('[t0] --into is given', () => {
      const result = useBeforeAll(async () =>
        runSkill([scene.md, '--into', scene.out]),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the file holds the rows', () => {
        const written = fs.readFileSync(scene.out, UTF8);
        expect(written).toContain('date\tkind\tamount\tmerchant');
        expect(written).toContain('2023-05-27\tcharge\t10.00');
      });

      then('stdout shows the treestruct summary', () => {
        expect(result.stdout).toContain('🧮 statement.parse');
        expect(result.stdout).toContain('rows:');
      });
    });
  });

  given('[case4] a recognized statement with no transaction rows', () => {
    /**
     * .why = a recognized format whose rows fail to parse means the layout
     *        shifted. that must block, never report an empty tally.
     */
    const scene = useBeforeAll(async () => {
      const md = path.join(dir, 'empty.md');
      fs.writeFileSync(
        md,
        [
          '   American Express Blue Business Cash',
          `   Account End${'ing'} 9-99999`,
          '   this document carries no transaction detail at all',
        ].join('\n'),
      );
      return { md };
    });

    when('[t0] the file is parsed', () => {
      const result = useBeforeAll(async () => runSkill([scene.md]));

      then('it fails as a constraint, never silently empty', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no transaction rows found');
      });
    });
  });

  given('[case5] a section header that carries a suffix note', () => {
    /**
     * .what = a real amex layout: " Fees" is followed by
     *         "*Indicates posting date" on the same line
     * .why  = regression guard. a match anchored on end-of-line missed this
     *         header, so an ANNUAL MEMBERSHIP FEE was counted as a
     *         deductible charge. a fee is not a purchase and does not get
     *         the same 1120 treatment. the reconcile caught it; this test
     *         keeps it caught.
     */
    const scene = useBeforeAll(async () => {
      const md = path.join(dir, 'fee-suffix.md');
      fs.writeFileSync(
        md,
        [
          '         American Express Blue Business Cash',
          `         Account End${'ing'} 9-99999`,
          '         Closing Date 03/25/25',
          ' New Charges',
          'Total New Charges                                           $120.00',
          ' Detail',
          '                                                               Amount',
          '03/24/25        ACME MONITOR          BOSTON        MA        $100.00',
          '03/21/25        EXAMPLE SMS INC       SAN FRANCISCO CA         $20.00',
          ' Fees               *Indicates posting date',
          '                                                               Amount',
          '03/05/25*       ANNUAL MEMBERSHIP FEE                         $25.00',
          'Total Fees for this Period                                     $25.00',
          ' Interest Charged',
          '                                                               Amount',
          '03/25/25        Interest Charge on Purchases                   $50.00',
        ].join('\n'),
      );
      return { md };
    });

    when('[t0] the statement is parsed', () => {
      const result = useBeforeAll(async () => runSkill([scene.md]));

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the fee is tagged as a fee, not a charge', () => {
        expect(result.stdout).toContain('2025-03-05\tfee\t25.00');
      });

      then('the interest is tagged as interest, not a charge', () => {
        expect(result.stdout).toContain('2025-03-25\tinterest\t50.00');
      });

      then('charges hold only the two real purchases', () => {
        const charges = result.stdout
          .split('\n')
          .filter((l: string) => l.split('\t')[1] === 'charge');
        expect(charges).toHaveLength(2);
      });

      then('the charges reconcile to the declared total', () => {
        const charged = result.stdout
          .split('\n')
          .filter((l: string) => l.split('\t')[1] === 'charge')
          .reduce(
            (sum: number, l: string) => sum + Number(l.split('\t')[2]),
            0,
          );
        expect(charged).toBeCloseTo(120.0, 2);
      });
    });
  });

  given('[case6] format selection', () => {
    when('[t0] --formats is given', () => {
      then('it lists the known formats', () => {
        const result = runSkill(['--formats']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('amex');
        expect(result.stdout).toContain('American Express');
      });
    });

    when('[t1] a format is pinned explicitly', () => {
      then('it parses with that format', () => {
        const md = path.join(dir, 'pinned.md');
        fs.writeFileSync(md, STATEMENT_TYPICAL);
        const result = runSkill([md, '--format', 'amex']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('2023-05-27\tcharge\t10.00');
      });
    });

    when('[t2] an unknown format is pinned', () => {
      then('it blocks', () => {
        const md = path.join(dir, 'unknown-fmt.md');
        fs.writeFileSync(md, STATEMENT_TYPICAL);
        const result = runSkill([md, '--format', 'moonbank']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown format: moonbank');
      });
    });

    when('[t3] the document matches no known format', () => {
      /**
       * .why = a statement from an unsupported issuer could partially match
       *        another format and undercount silently. refuse to guess.
       */
      then('it blocks rather than guess', () => {
        const md = path.join(dir, 'foreign.md');
        fs.writeFileSync(
          md,
          [
            '   MOONBANK STATEMENT OF ACCOUNT',
            '   Period Close 06/23/25',
            '   Purchases                                          Amount',
            '06/01/25   SOME MERCHANT                              $10.00',
          ].join('\n'),
        );
        const result = runSkill([md]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unrecognized statement format');
      });
    });

    when('[t4] the document has rows but no declared total', () => {
      /**
       * .why = the declared total is what makes a parse verifiable. without
       *        it the tally cannot reconcile, so an undercount would pass
       *        unnoticed onto a return. refuse the parse outright.
       * .note = header text below is verbatim amex, needed for the fingerprint
       */
      then('it blocks rather than emit an unverifiable parse', () => {
        const md = path.join(dir, 'no-declared.md');
        fs.writeFileSync(
          md,
          [
            '   American Express Blue Business Cash',
            `   Account End${'ing'} 9-99999`,
            `   Clos${'ing'} Date 06/23/23`,
            ' New Charges',
            ' Detail',
            '                                                       Amount',
            '06/01/23   SOME MERCHANT                               $10.00',
          ].join('\n'),
        );
        const result = runSkill([md]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('cannot be reconciled');
      });
    });
  });

  given('[case7] bad invocations', () => {
    when('[t0] no path is given', () => {
      then('it blocks', () => {
        const result = runSkill([]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('no statement path provided');
      });
    });

    when('[t1] the file is absent', () => {
      then('it blocks', () => {
        const result = runSkill(['/nonexistent/statement.md']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('file not found');
      });
    });

    when('[t2] the extension is unsupported', () => {
      then('it blocks', () => {
        const bad = path.join(dir, 'statement.csv');
        fs.writeFileSync(bad, 'x');
        const result = runSkill([bad]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unsupported extension');
      });
    });

    when('[t3] --help is given', () => {
      then('it prints usage and exits clean', () => {
        const result = runSkill(['--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage: statement.parse.sh');
      });
    });
  });

  given('[case10] the arg-parse arms', () => {
    /**
     * .why = every arm of a `case` block is an output surface, and four of
     *        these five had no assertion anywhere in the repo. each fails by
     *        MISDIAGNOSIS rather than by a crash: the caller gets a real
     *        refusal, at a plausible exit code, and it names the wrong fault.
     *        that is the same shape as [case8] — an absent PACKAGE reported
     *        as a corrupt DOCUMENT — met four more times in one block.
     */
    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () => runSkill(['-h']));

      then('it prints the same usage as --help', () => {
        expect(result.stdout).toContain('usage: statement.parse.sh');
      });

      then('⭐ it exits clean, NOT as an unknown option', () => {
        // .why = the discriminator. drop `-h` from the alias and it falls
        //        through to the `-*` arm, which refuses at exit 2 with
        //        "unknown option: -h" — a help request answered by a refusal.
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] rhachet passes --skill, --repo and --role', () => {
      const result = useBeforeAll(async () => {
        const md = path.join(dir, 'rhachet-passthrough.md');
        fs.writeFileSync(md, STATEMENT_TYPICAL);
        return runSkill([
          '--skill',
          'statement.parse',
          '--repo',
          'rhight',
          '--role',
          'accountant',
          md,
        ]);
      });

      then('⭐ it parses the statement, not the flag value', () => {
        // .why = each of these arms is a `shift 2`. write `shift` instead and
        //        the flag's VALUE lands in the `*)` arm as SRC_PATH, so the
        //        skill reads `statement.parse` as the document and refuses
        //        with "unsupported extension" — a rhachet call fault reported
        //        as a bad statement.
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('GOOGLE');
      });

      then('it does NOT mistake a flag value for the path', () => {
        expect(result.stdout).not.toContain('unsupported extension');
        expect(result.stdout).not.toContain('file not found');
      });
    });

    when('[t2] an unknown option is given', () => {
      const result = useBeforeAll(async () => runSkill(['--wat']));

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the OPTION, not an absent file', () => {
        // .why = delete the `-*` arm and `--wat` falls to `*)`, so it becomes
        //        SRC_PATH. the caller is then told "file not found: --wat",
        //        which sends them to check a path that was never a path.
        expect(result.stdout).toContain('unknown option: --wat');
        expect(result.stdout).not.toContain('file not found');
      });
    });

    when('[t3] a second path is given', () => {
      const scene = useBeforeAll(async () => {
        const one = path.join(dir, 'two-paths-a.md');
        const two = path.join(dir, 'two-paths-b.md');
        fs.writeFileSync(one, STATEMENT_TYPICAL);
        fs.writeFileSync(two, STATEMENT_TYPICAL);
        return { outcome: runSkill([one, two]), two };
      });

      then('it blocks rather than pick one', () => {
        expect(scene.outcome.exitCode).toBe(2);
      });

      then('⭐ it names the SECOND path, and parses neither', () => {
        // .why = the `else` is the whole guard. without it the second path
        //        overwrites the first and the skill parses a DIFFERENT
        //        statement than the caller named, at exit 0 — the silent
        //        wrong-document failure, one card away from a wrong return.
        expect(scene.outcome.stdout).toContain(
          `unexpected argument: ${scene.two}`,
        );
        expect(scene.outcome.stdout).not.toContain('GOOGLE');
      });
    });

    when('[t4] the extract comes back empty', () => {
      const result = useBeforeAll(async () => {
        const blank = path.join(dir, 'image-based.txt');
        fs.writeFileSync(blank, '   \n\t\n  \n');
        return runSkill([blank]);
      });

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it routes the caller to OCR', () => {
        // .why = an empty extract is an IMAGE-BASED pdf, and the cure is
        //        pdf.transcribe. this names the cure; the exclusion below
        //        rules out the misdiagnosis. they are separate `then`s on
        //        purpose — jest stops a `then` at its first red, so a
        //        positive and its discriminator in one block means only
        //        the positive is ever measured.
        expect(result.stdout).toContain('no text found');
        expect(result.stdout).toContain('pdf.transcribe');
      });

      then(
        '⭐ it does NOT blame the FORMAT for a document it never read',
        () => {
          // .why = MEASURED 2026-09-03, not predicted. neuter the guard and
          //        the fall-through is the format matcher, which refuses with
          //        "unrecognized statement format — see --formats, or add
          //        formats/<name>.fmt" — so a human is told to AUTHOR A NEW
          //        FORMAT DECLARATION for a scanned pdf that has no text layer
          //        at all. the cure is one apt-get away and the message points
          //        at a day of work on the wrong artifact.
          //
          //        ⚠️ the first draft of this clamp excluded "layout may have
          //        changed" — prose this defect NEVER emits — so it was green
          //        under the very revert it was written for.
          expect(result.stdout).not.toContain('unrecognized statement format');
          expect(result.stdout).not.toContain('--formats');
        },
      );
    });
  });

  given('[case8] pdftotext is absent', () => {
    /**
     * .why = an absent poppler PACKAGE and a corrupt DOCUMENT are different
     *        faults with different cures, and only one of them is the
     *        caller's to fix. the skill knows the difference — read_text says
     *        "install poppler-utils" and exits 2 — but that guard runs inside
     *        `raw=$(read_text)`, and print_blocked writes to STDOUT, so the
     *        one actionable sentence is captured into the variable and thrown
     *        away. `exit 2` leaves only the subshell, so the `||` fires and
     *        rewrites a CONSTRAINT as a MALFUNCTION that blames the file.
     */
    when('[t0] a pdf is parsed', () => {
      const result = useBeforeAll(async () => {
        const pdf = path.join(dir, 'no-pdftotext.pdf');
        // .note = deliberately NOT a pdf. the guard fires before one byte is
        //         read, so a stub is honest here — no case below parses it.
        fs.writeFileSync(pdf, 'stub — the guard fires before any read');
        const bin = genPathWithoutPdftotext(path.join(dir, 'bin-no-pdftotext'));
        return runSkill([pdf], { env: { ...process.env, PATH: bin } });
      });

      then('the probe reached the skill, not a broken shell', () => {
        // .why = a positive control. without it, a red below cannot be told
        //        apart from a probe PATH too thin to load the skill at all.
        expect(result.stderr).not.toContain('command not found');
      });

      then('⭐ it names the absent package, not the file', () => {
        expect(result.stdout).toContain('pdftotext not found');
      });

      then('⭐ it is a CONSTRAINT — the caller installs a package', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it does NOT blame the document', () => {
        // .why = the discriminator. "failed to read" sends a caller to hunt a
        //        corrupt statement for a fault that is one apt-get away.
        expect(result.stdout).not.toContain('failed to read');
      });
    });
  });

  given('[case9] the --account card guard', () => {
    /**
     * .why = two cards from one issuer print the same layout, so this
     *        comparison is the only barrier between a personal statement and
     *        a corporate deduction (rule.require.one-card-per-tally). and no
     *        other case in the repo exercises it: statement.tally
     *        deliberately never passes --account down, because a parser
     *        refusal would land in its `||` branch and SKIP the stranger's
     *        card rather than refuse it.
     */
    const scene = useBeforeAll(async () => {
      const md = path.join(dir, 'account-guard.md');
      fs.writeFileSync(md, STATEMENT_TYPICAL);
      return { md };
    });

    when('[t0] no --account is given', () => {
      const result = useBeforeAll(async () => runSkill([scene.md]));

      then('⭐ it emits the card as its own row', () => {
        // .why = the whole downstream guard reads this row. a parse that
        //        cannot say WHICH card it read cannot keep a personal charge
        //        off a corporate return.
        expect(result.stdout).toMatch(/\taccount\t0\.00\t9-99999$/m);
      });
    });

    when('[t1] --account names a DIFFERENT card', () => {
      const result = useBeforeAll(async () =>
        runSkill([scene.md, '--account', '1-00007']),
      );

      then('it refuses', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names BOTH cards, so the caller sees which is which', () => {
        expect(result.stdout).toContain(
          'wrong card: wanted 1-00007, statement is 9-99999',
        );
      });

      then('it emits no rows at all', () => {
        // .why = a refusal that still printed the rows would let a caller
        //        pipe the wrong card's charges onward anyway.
        expect(result.stdout).not.toContain('GOOGLE');
      });
    });

    when('[t2] --account names the SAME card, without its separator', () => {
      const result = useBeforeAll(async () =>
        runSkill([scene.md, '--account', '999999']),
      );

      then('⭐ it accepts — a dash is not a different card', () => {
        // .why = this is the whole reason as_account_comparable exists, and
        //        it is declared a byte-for-byte twin of the copy in
        //        statement.tally.sh. only the tally side was ever tested.
        expect(result.exitCode).toBe(0);
      });

      then('it emits the rows', () => {
        expect(result.stdout).toContain('GOOGLE');
      });
    });

    when('[t3] the statement declares no account line', () => {
      /**
       * .why = reachable only under an explicit --format, because 'Account
       *        End' is half the amex fingerprint — so auto-detect refuses
       *        first and this guard never speaks for itself.
       */
      then('it blocks rather than emit rows no card owns', () => {
        const md = path.join(dir, 'no-account-line.md');
        fs.writeFileSync(
          md,
          [
            '   American Express Blue Business Cash',
            `   Clos${'ing'} Date 06/23/23`,
            ' New Charges',
            'Total New Charges                                      $10.00',
            ' Detail',
            '                                                       Amount',
            '06/01/23   SOME MERCHANT                               $10.00',
          ].join('\n'),
        );
        const result = runSkill([md, '--format', 'amex']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('cannot tell which card this is');
      });
    });
  });

  given('[case11] a FORMAT that declares no required field', () => {
    /**
     * .why = load_format resolves FORMATS_DIR off its own BASH_SOURCE and
     *        takes no override flag, so these two guards are reachable ONLY
     *        through a copy of the whole skill directory. [case6][t4] and
     *        [case9][t3] look adjacent and are not: those clamp a DOCUMENT
     *        that omits a line, which is a different guard with a different
     *        message. the format-side guards had no case at all.
     *
     * ⚠️ the two messages differ by ONE FIELD NAME, so the natural defect is
     *    a SWAP — which every exit-code assertion is blind to. hence the
     *    cross-exclusion beneath each.
     */
    const scene = useBeforeAll(async () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fmt-copy-'));
      const formats = path.join(root, 'formats');
      fs.mkdirSync(formats);

      // the skill sources output.sh off its own dir, so carry both
      fs.copyFileSync(scriptPath, path.join(root, 'statement.parse.sh'));
      fs.copyFileSync(
        path.join(__dirname, 'output.sh'),
        path.join(root, 'output.sh'),
      );

      const amex = fs.readFileSync(
        path.join(__dirname, 'formats', 'amex.fmt'),
        UTF8,
      );
      fs.writeFileSync(path.join(formats, 'amex.fmt'), amex);

      // .what = the same format, minus one required declaration
      const without = (prefix: string, as: string): void =>
        fs.writeFileSync(
          path.join(formats, `${as}.fmt`),
          amex
            .split('\n')
            .filter((line) => !line.startsWith(prefix))
            .join('\n')
            .replace("FMT_NAME='amex'", `FMT_NAME='${as}'`),
        );
      without('FMT_DECLARED=', 'nodeclared');
      without('FMT_ACCOUNT=', 'noaccount');

      const md = path.join(root, 'statement.md');
      fs.writeFileSync(md, STATEMENT_TYPICAL);

      return { root, md };
    });

    const runAt = (args: string[]): { stdout: string; exitCode: number } => {
      const out = spawnSync(
        BASH,
        [path.join(scene.root, 'statement.parse.sh'), ...args],
        { stdio: ['pipe', 'pipe', 'pipe'] },
      );
      return { stdout: String(out.stdout ?? ''), exitCode: out.status ?? 1 };
    };

    when('[t0] the copied format is intact', () => {
      then('⭐ the copy is a real, live skill — the positive control', () => {
        // .why = without this, an absent row below could mean the copy is
        //        broken rather than that the guard fired.
        const result = runAt([scene.md, '--format', 'amex']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('GOOGLE');
      });
    });

    when('[t1] the format declares no FMT_DECLARED', () => {
      const result = useBeforeAll(async () =>
        runAt([scene.md, '--format', 'nodeclared']),
      );

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the format at fault', () => {
        expect(result.stdout).toContain('format nodeclared');
      });

      then('⭐ it names the ABSENT field, and why that is fatal', () => {
        expect(result.stdout).toContain(
          'declares no FMT_DECLARED — an unverifiable parse is refused',
        );
      });

      then(
        '⭐ it does NOT name the other field — the swap discriminator',
        () => {
          // .why = the two guards sit nine lines apart and differ by one token.
          //        an exit-code assertion cannot tell them apart at all.
          expect(result.stdout).not.toContain('FMT_ACCOUNT');
        },
      );
    });

    when('[t2] the format declares no FMT_ACCOUNT', () => {
      const result = useBeforeAll(async () =>
        runAt([scene.md, '--format', 'noaccount']),
      );

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('it names the format at fault', () => {
        expect(result.stdout).toContain('format noaccount');
      });

      then('⭐ it names the ABSENT field, and why that is fatal', () => {
        expect(result.stdout).toContain(
          'declares no FMT_ACCOUNT — a parse that cannot name its card is refused',
        );
      });

      then(
        '⭐ it does NOT name the other field — the swap discriminator',
        () => {
          expect(result.stdout).not.toContain('FMT_DECLARED');
        },
      );
    });
  });

  given('[case12] a .pdf the reader cannot open', () => {
    /**
     * ⚠️ leak 6, in its cleanest shape. drop the `|| { ... exit 1; }` and
     *    `set -euo pipefail` aborts at the SAME exit 1, with empty stdout and
     *    empty stderr — the stderr is empty because read_text sends
     *    pdftotext's own complaint to /dev/null. so the exit code cannot tell
     *    "the guard refused" from "the guard was never there", and only the
     *    MESSAGE discriminates.
     */
    const result = useBeforeAll(async () => {
      const pdf = path.join(dir, 'not-really-a.pdf');
      fs.writeFileSync(pdf, 'this is plain text under a .pdf suffix\n');
      return { pdf, ...runSkill([pdf]) };
    });

    when('[t0] the skill is pointed at it', () => {
      then('it exits 1 — a MALFUNCTION, not a constraint', () => {
        // ⚠️ this assertion alone proves none of it. it stays GREEN with the
        //    guard deleted, because the shell aborts at 1 unaided.
        expect(result.exitCode).toBe(1);
      });

      then('⭐ it says the read failed, and names the file', () => {
        expect(result.stdout).toContain(`failed to read: ${result.pdf}`);
      });

      then('⭐ it does NOT blame an image-based scan', () => {
        // .why = two duties at once. the OCR arm nine lines below refuses an
        //        EMPTY extract at exit 2, which is a wholly different cure —
        //        and if this ever fired, the fixture would be wrong rather
        //        than the skill.
        expect(result.stdout).not.toContain('no text found');
      });
    });
  });
});
