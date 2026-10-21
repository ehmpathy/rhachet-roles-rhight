import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the DISPATCHER, pii.scan.sh
 *
 * .why  = the dispatcher had no test file of its own. its SEQUENCE
 *         property — regex first, brain only on an already-clean set —
 *         is clamped from above, in `.husky/check.pii.integration.test.ts`,
 *         which drives it through the pre-commit hook.
 *
 *         but a hook exercises exactly one invocation:
 *         `--diffs since-staged [--roster …]`. so everything the hook
 *         does not pass is unreached, and everything the hook does not
 *         read is unasserted:
 *
 *           ⛔ `--help`          — a whole output mode, zero assertions
 *           ⛔ `--mode plan`     — BOTH arms, zero assertions
 *           ⛔ a bad `--via`     — the refusal, and its message
 *           ⛔ a bad `--mode`    — the refusal, and its message
 *           ⛔ the regex mechanism absent — while its BRAIN twin at
 *                                 `:224` IS clamped, by [case8] there
 *
 * ⚠️ the last row is the asymmetry worth naming. the hook's own
 *    "scanner was not found" arm fires FIRST (check.pii.sh:45), so
 *    [case3] there removes the whole skill and never reaches the
 *    dispatcher's guard at all. one of two identically-shaped guards was
 *    covered and the other was not, and no read of the husky file shows
 *    that — its `orphan: true` looks like it covers both.
 *
 * ⭐ the decisive clamp is [case2]/[case3]: `--mode plan` carries a MONEY
 *    guarantee, stated twice in the skill's own header —
 *    *"shows what would run without a spend"* and *"--via brain needs
 *    credentials and costs money"*. plan mode exits at `:198`, ABOVE the
 *    regex run, so the discriminator is a fixture that CARRIES PII: a
 *    plan that still exits 0 over it proves no scan was performed.
 *
 * .note = every fixture value is synthetic. the 666 prefix has never been
 *         issued by the SSA, so it is structurally valid and permanently
 *         fake — which also keeps this file clean under its own scanner.
 */

const dispatcherPath = path.join(__dirname, 'pii.scan.sh');
const skillDir = __dirname;

const UTF8 = 'utf-8' as const;

/** synthetic; the SSA has never issued a 666 prefix */
const SSN_BARE = '666123456';

const runSkill = (input: {
  args: string[];
  cwd: string;
  /** a COPY of the dispatcher, for the mechanism-absent case */
  dispatcher?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync(
    'bash',
    [input.dispatcher ?? dispatcherPath, ...input.args],
    {
      encoding: UTF8,
      cwd: input.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * .what = a throwaway git repo that carries one file
 * .why  = the regex mechanism derives its scope from git, so a real work
 *         tree is required. the CONTENT matters here: several cases below
 *         rely on the fixture being one the scanner WOULD block, so that
 *         an exit 0 proves the scan never ran.
 */
const genTempRepo = (input: { content: string }): { dir: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-dispatch-'));

  const git = (args: string[]): void => {
    const res = spawnSync('git', args, { cwd: dir, encoding: UTF8 });
    if (res.status !== 0)
      throw new Error(`git ${args.join(' ')} failed: ${res.stderr}`);
  };

  git(['init', '--quiet']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'user.name', 'test']);

  fs.writeFileSync(path.join(dir, 'evidence.md'), input.content);

  return { dir };
};

describe('pii.scan.sh (the dispatcher)', () => {
  given('[case1] --help', () => {
    when('[t0] help is requested', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--help'], cwd: os.tmpdir() }),
      );

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it documents every flag the dispatcher parses', () => {
        // ⭐ `--help` is a whole OUTPUT MODE, and it had zero assertions.
        //    a surface that exits 0 with empty stderr cannot fail loudly,
        //    so it needs an assertion MORE than one that can — a broken
        //    renderer here emits garbage at exit 0 and no automated
        //    signal reports it.
        for (const flag of [
          '--via',
          '--mode',
          '--diffs',
          '--paths-with',
          '--paths-wout',
          '--join',
          '--allow',
          '--roster',
          '--brain',
          '--lockfiles',
        ])
          expect(result.stdout).toContain(flag);
      });

      then('it states the SEQUENCE, which is the safety property', () => {
        // the one thing a caller must not get wrong. the skill says it
        // three times in its header; help is the only place a caller
        // reads.
        expect(result.stdout).toContain('regex runs FIRST');
        expect(result.stdout).toContain('never wave one through');
      });

      then('it states the exit codes a gate would branch on', () => {
        expect(result.stdout).toContain('0  clean');
        expect(result.stdout).toContain('1  malfunction');
        expect(result.stdout).toContain('2  hits');
      });

      then('it never leaks the shebang', () => {
        // the class from the franchise.tax.delaware defect: a one-char
        // bug in a header renderer prints `!/usr/bin/env bash` alone, at
        // exit 0, with empty stderr
        expect(result.stdout).not.toContain('/usr/bin/env bash');
        expect(result.stdout.length).toBeGreaterThan(500);
      });
    });
  });

  given('[case2] --mode plan --via regex, over a repo that CARRIES PII', () => {
    // ⭐ the fixture carries a value the scanner blocks. that is what
    //    makes the exit-0 assertion below a real clamp rather than a
    //    tautology: over a CLEAN repo, a plan mode that secretly ran the
    //    scan would also exit 0, and no assertion could tell them apart.
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: `responsible party id ${SSN_BARE} on file` }),
    );

    when('[t0] planned', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--mode', 'plan', '--via', 'regex', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('⭐ it exits 0 — so the scan was never performed', () => {
        // an apply over this same fixture exits 2 ([t1] below pins that,
        // so this is a measured contrast rather than an assumed one)
        expect(result.exitCode).toBe(0);
      });

      then('it never echoes the value it did not scan for', () => {
        expect(result.stdout).not.toContain(SSN_BARE);
        expect(result.stderr).not.toContain(SSN_BARE);
      });

      then('the report names the regex-only path, and its cost', () => {
        expect(result.stdout).toContain('via: regex');
        expect(result.stdout).toContain('regex only');
        expect(result.stdout).toContain('offline, free');
      });

      then('⭐ and does NOT name the brain path or a spend', () => {
        // the discriminator. both plan arms print a `would run` line, so
        // a bare `toContain('would run')` cannot tell them apart — and
        // the arms differ on exactly the fact a caller reads plan mode
        // to learn.
        expect(result.stdout).not.toContain('then brain');
        expect(result.stdout).not.toContain('spends');
      });
    });

    when('[t1] the same fixture, APPLIED', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--via', 'regex', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('it exits 2 — the positive control for [t0]', () => {
        // without this, [t0]'s exit 0 is satisfied just as well by a
        // scanner that cannot see the fixture at all
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ A POSITIVE CONTROL THAT THE WRONG CAUSE CAN SATISFY IS NOT A
       *    CONTROL — and the exit code alone is exactly that here.
       *
       *    rule.require.exit-code-semantics assigns 2 to EVERY constraint,
       *    so within one skill every refusal arm collides with every other
       *    by design. a typo in the args above would refuse at 2, the
       *    check above would pass, and [t0]'s "the scan was never
       *    performed" would rest on a run that never scanned for a wholly
       *    different reason.
       *
       *    the report shape is what proves the scan RAN and HIT. an arg
       *    refusal prints `blocked:` and a usage block; it can never print
       *    a hit tally.
       */
      then(
        '⭐ and it exits 2 because it SCANNED, not because it refused',
        () => {
          expect(result.stdout).toMatch(
            /hits: \d+ across \d+ file\(s\) \([a-z]+ \d+/,
          );
          expect(result.stdout).toContain('ssn');
          expect(result.stdout).not.toContain('blocked:');
        },
      );
    });
  });

  given('[case3] --mode plan on the default (auto) path', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: 'just prose, and a year 2026' }),
    );

    when('[t0] planned with no --via', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--mode', 'plan', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('it exits 0', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it names BOTH mechanisms, and the sequence between them', () => {
        expect(result.stdout).toContain('via: auto');
        expect(result.stdout).toContain('regex, then brain if regex is clean');
      });

      then('⭐ it warns that the brain pass SPENDS', () => {
        // the whole reason plan mode exists. a plan that omits the cost
        // line is a plan a caller reads and then pays anyway.
        expect(result.stdout).toContain('needs credentials and spends');
      });

      then('and does NOT claim the free path', () => {
        expect(result.stdout).not.toContain('regex only');
      });
    });
  });

  given('[case4] an invalid --via', () => {
    when('[t0] a value outside the three is passed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--via', 'vibes'], cwd: os.tmpdir() }),
      );

      then('it is refused with exit 2 — a constraint', () => {
        expect(result.exitCode).toBe(2);
      });

      then('the reason names the VALID set, not just the failure', () => {
        // an error that rejects a value without the valid ones sends the
        // caller to the source (rule.require.errors-name-the-fix)
        expect(result.stdout).toContain('--via must be auto, regex, or brain');
      });
    });
  });

  given('[case5] an invalid --mode', () => {
    when('[t0] a value outside the two is passed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--mode', 'maybe'], cwd: os.tmpdir() }),
      );

      then('it is refused with exit 2', () => {
        expect(result.exitCode).toBe(2);
      });

      then('the reason names the valid set', () => {
        expect(result.stdout).toContain('--mode must be plan or apply');
      });
    });

    when('[t1] --mode is validated BEFORE the scan runs', () => {
      // the ordering matters: `validate` is called at `:175`, above every
      // mechanism. a refusal that arrived after a brain pass would have
      // already spent.
      const repo = useBeforeAll(async () =>
        genTempRepo({ content: `responsible party id ${SSN_BARE} on file` }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--mode', 'maybe', '--paths-with', '.'],
          cwd: repo.dir,
        }),
      );

      then('the refusal wins — 2 from validate, not from the scan', () => {
        // ⚠️ both exits are 2, so the code cannot discriminate here.
        //    the MESSAGE is the only observable that separates "refused
        //    the flag" from "ran and found PII".
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--mode must be plan or apply');
        expect(result.stdout).not.toContain('carries PII');
        expect(result.stdout).not.toContain(SSN_BARE);
      });
    });
  });

  given('[case6] the REGEX mechanism is not on disk', () => {
    /**
     * .what = the asymmetric twin of `.husky` [case8]
     *
     * .why  = the dispatcher guards BOTH mechanisms with the same shape —
     *         `:183` for regex, `:224` for brain. only the brain one had
     *         a case.
     *
     *         the regex guard is the more consequential of the two: it
     *         protects the DETERMINISTIC half, whose verdict is final. a
     *         dispatcher that fell through here would run only the
     *         probabilistic layer and report its verdict as the gate —
     *         which inverts the sequence the whole skill exists to hold.
     *
     * ⚠️ the husky file cannot reach this. its `orphan: true` deletes the
     *    entire skill, so `check.pii.sh`'s own skill-present guard
     *    refuses first and the
     *    dispatcher is never invoked. that reads like coverage and is not.
     */
    const scene = useBeforeAll(async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-noregex-'));
      const copied = path.join(dir, 'skill');
      fs.cpSync(skillDir, copied, { recursive: true });
      fs.rmSync(path.join(copied, 'pii.scan.via.regex.sh'), { force: true });
      return { dir, dispatcher: path.join(copied, 'pii.scan.sh') };
    });

    when('[t0] the dispatcher runs', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--paths-with', '.'],
          cwd: scene.dir,
          dispatcher: scene.dispatcher,
        }),
      );

      then('it exits 1 — a MALFUNCTION, not a clean scan', () => {
        // a gate that quietly shrank to one layer still passes every
        // commit, so no signal is emitted to say half the protection left
        if (result.exitCode !== 1) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
      });

      then('it says WHICH mechanism went absent, and where', () => {
        expect(result.stdout).toContain('the regex mechanism was not found');
        expect(result.stdout).toContain('pii.scan.via.regex.sh');
      });

      then('⭐ and it does NOT report a clean scan', () => {
        // the discriminator. exit 1 alone is satisfied by a crash, and a
        // crash prints no verdict — so the message is what proves the
        // guard ran rather than the shell aborted under it.
        expect(result.stdout).not.toContain('clear skies');
      });
    });
  });

  /**
   * .what = the `-h` alias, which shares one `case` arm with `--help` in
   *         `parse_args` and was reached by no case in this file
   *
   * ⛔ AND THIS DISPATCHER HAS NO `-*` ARM. its catch-all is `*)`, which
   *    APPENDS to `PASSTHRU` — so an unrecognized flag is FORWARDED to the
   *    mechanisms rather than refused.
   *
   *    that inverts the usual failure. drop `-h` from the arm and it does
   *    not become `unknown option`; it becomes an argument to
   *    `pii.scan.via.regex.sh`, which HAS its own `--help|-h` arm. the
   *    caller gets that leaf's usage, then the brain leaf's, and an
   *    exit 0.
   *
   * ⭐ SO THE DEFECT PRINTS A HELP BLOCK FOR A SKILL THE CALLER DID NOT
   *    ASK ABOUT, AT EXIT 0, WITH EMPTY STDERR. no exit code, no stderr,
   *    and no `not.toContain('blocked')` can see it — the run looks like a
   *    successful help. only a needle that is UNIQUE TO THIS DISPATCHER
   *    discriminates.
   *
   * ⚠️ and what the leaf's help omits is the part that matters most: the
   *    SEQUENCE. the dispatcher's whole reason to exist is that regex runs
   *    first and its verdict is final; the regex leaf never says so,
   *    because from inside it there is no sequence to describe. so a
   *    caller who reaches for `-h` learns the flags and misses the one
   *    guarantee the skill was built to hold.
   */
  given('[case7] the short `-h` alias', () => {
    when('[t0] help is requested by its alias', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['-h'], cwd: os.tmpdir() }),
      );

      then('it succeeds and renders the DISPATCHER usage block', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain(
          'pii.scan — scan a repo scope for PII before it reaches a commit',
        );
      });

      /**
       * ⭐ THE DISCRIMINATOR. [case1] already proves `--help` renders that
       *    block, so the assertions above read as coverage the alias does
       *    not have — a fall-through reaches the LEAF's help, which is a
       *    real help block at exit 0.
       *
       *    these two strings appear only in the dispatcher's own header.
       *    checked against `pii.scan.via.regex.sh`'s `print_usage`, which
       *    documents detectors, roster, and allowlist and states no
       *    sequence at all.
       */
      then(
        '⭐ and it states the SEQUENCE, which only THIS help carries',
        () => {
          expect(result.stdout).toContain('regex runs FIRST');
          expect(result.stdout).toContain('never wave one through');
        },
      );

      /**
       * ⚠️ a second, independent discriminator: a fall-through runs BOTH
       *    leaves, so the caller gets two usage blocks concatenated. the
       *    regex leaf names its own file in its example line, which the
       *    dispatcher's help never does.
       */
      then('and it does NOT leak a LEAF skill’s usage', () => {
        expect(result.stdout).not.toContain('pii.scan.via.regex.sh --diffs');
      });
    });
  });

  /**
   * .what = the `--skill` / `--repo` / `--role` arm — the flags rhachet
   *         appends to EVERY skill it runs, so this arm executes on
   *         literally every real `rhx pii.scan`
   *
   * ⛔ AND THE OBVIOUS PROBE ON IT IS MASKED, ON PURPOSE — see below.
   *
   *    `pii.scan.via.regex.sh` carries an IDENTICAL `--skill|--repo|--role`
   *    arm. so deleting the dispatcher's copy forwards the flags to a leaf
   *    that consumes them itself, and the run is unchanged. a duplicate
   *    guard downstream makes the upstream one look dead.
   *
   * ⭐ THE `shift` / `shift 2` TYPO IS NOT MASKED, AND IT IS THE ONE THAT
   *    HAPPENS. `shift` leaves the flag's VALUE on the line, so
   *    `pii.scan` is appended to `PASSTHRU` and handed to the regex leaf,
   *    whose `*)` arm refuses it as an `unexpected argument`.
   *
   * ⚠️ AND THAT REFUSAL EXITS 2 — the same code a real hit exits with.
   *    so the gate reports the same number for "PII found" and "I could
   *    not parse my own arguments", and a caller who branches on the code
   *    cannot tell a working scan from one that never scanned.
   *
   *    this is the collision [case2][t1] already names in this file. the
   *    cure is the same: assert the HIT TALLY, which an argument refusal
   *    can never print.
   */
  given('[case8] rhachet passes --skill / --repo / --role', () => {
    // the fixture CARRIES PII, deliberately. over a clean repo the run
    // would exit 0 whether or not the flags corrupted the scope, so the
    // tally assertion would have no two outcomes to separate.
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: `responsible party id ${SSN_BARE} on file` }),
    );

    when('[t0] the flags are prepended to a real scan', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--skill',
            'pii.scan',
            '--repo',
            'rhight',
            '--role',
            'transcriber',
            '--via',
            'regex',
            '--paths-with',
            '.',
          ],
          cwd: repo.dir,
        }),
      );

      /**
       * ⚠️ this `then`-string states ONLY what the exit code proves — that
       *    the run ended on a constraint. it deliberately does NOT say the
       *    scan ran.
       *
       * 🚩 it said exactly that on the first draft — "the scan ran and the
       *    fixture was caught" — and the `shift` probe measured it GREEN
       *    over a run where the scan never executed and the output read
       *    `blocked: unexpected argument: pii.scan`. a `then`-string that
       *    claims more than its assertion can see is the defect this whole
       *    case exists to catch, reintroduced inside the clamp for it.
       */
      then('it exits 2 — a constraint, not necessarily a scan', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ THE DECISIVE ASSERTION. the exit code above is satisfied by an
       *    argument refusal, which is exactly what the `shift` typo
       *    produces — so it discriminates none of this on its own.
       *
       *    a hit tally is emitted only after a scan; a refusal prints
       *    `blocked:` and stops.
       */
      then(
        '⭐ and it exits 2 because it SCANNED, not because it refused',
        () => {
          expect(result.stdout).toMatch(
            /hits: \d+ across \d+ file\(s\) \([a-z]+ \d+/,
          );
          expect(result.stdout).not.toContain('blocked:');
          expect(result.stdout).not.toContain('unexpected argument');
        },
      );
    });
  });
});
