import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the HARNESS of the brain mechanism
 * .why  = this layer is PROBABILISTIC and it BLOCKS, which is a
 *         dangerous pair. so the tests clamp the properties that make
 *         it safe at a gate, rather than the brains' judgment:
 *
 *           1. a reviewer that could not run is a MALFUNCTION (exit 1),
 *              never a clean pass. "the check did not run" and "the
 *              check found no PII" must never look alike.
 *           2. an absent rubric blocks rather than grades against no
 *              rules and returns a vacuous 0/0.
 *           3. an empty scope is genuinely clean, so the gate does not
 *              block a commit that touches only deletions.
 *
 * .note = no test HERE asks a real brain. a brain call is slow, costs
 *         money, and returns a different answer each run — three
 *         properties that have no place in a suite that must be able to
 *         go red for one reason only.
 *
 *         but a harness proven only against its own error paths is a
 *         harness nobody has watched succeed, so the live invocation is
 *         clamped separately, in
 *         pii.scan.via.brain.live.integration.test.ts.
 */

const scriptPath = path.join(__dirname, 'pii.scan.via.brain.sh');

const UTF8 = 'utf-8' as const;

const runSkill = (input: {
  args: string[];
  cwd: string;
  /** prepended to PATH — see genRhxThatCapturesTheArgv */
  binFirst?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: input.binFirst
      ? { ...process.env, PATH: `${input.binFirst}:${process.env.PATH ?? ''}` }
      : process.env,
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

const genTempRepo = (input: {
  files: Record<string, string>;
  /** raw bytes, for fixtures that must NOT be text — see [case8] */
  binaries?: Record<string, Buffer>;
  stage?: string[];
}): { dir: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-review-'));

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
 * .what = put a fake `rhx` first on PATH that captures the prompt and
 *         answers a readable, clean verdict
 *
 * .why  = the prompt is the ONLY place the binary paths appear. the
 *         count in the tree says how many there were; it says no word
 *         about whether the reviewer was ever handed them, and those are
 *         the two halves of this change. a test that asserts only the
 *         count would go green on a build where the prompt section was
 *         deleted.
 *
 * .note = `rule.forbid.integration.mocks` allows a mock where the
 *         circumstance is unavoidable and the exception is documented
 *         where it is declared. this is that case, and it is the same
 *         one the file header already states: a brain call is slow,
 *         costs money, and answers differently each run. the REAL
 *         invocation stays clamped in
 *         pii.scan.via.brain.live.integration.test.ts.
 *
 * ⚠️ the fake is PREPENDED to the real PATH, never substituted for it.
 *    a stripped PATH drops the interpreter and every coreutil the skill
 *    calls, and the failure it produces — empty stdout, exit 1 — reads
 *    exactly like a skill that blocked without a message.
 */
/**
 * .what = the body of a fake `rhx review`, shared by every fake below
 *
 * .why  = the skill reads THREE things off a review, and a fake that
 *         supplies fewer than three exercises a path production never
 *         takes:
 *           1. the argv        — so a case can assert which flags went out
 *           2. the `--output`  — the report body lives in that FILE, and
 *              the skill copies it out; stdout carries only counts
 *           3. the `logs:`     — the sole discriminator between a clean
 *              pass and a SKIPPED review, which print identical counts
 *
 * ⚠️ `withLogs: false` impersonates a skip. `rhx review` skips when its
 *    rules glob matches zero files, and prints the same
 *    `0 blockers / 0 nitpicks`, exit 0, as a clean pass — so the skip
 *    guard cannot be clamped without a fake that can omit that one line.
 */
const asFakeReviewBody = (input: {
  captureAt: string;
  reportBody: string;
  blockers: number;
  nitpicks: number;
  /** omit the `logs:` line, to impersonate a skipped review */
  withLogs?: boolean;
}): string[] => [
  '#!/usr/bin/env bash',
  `printf '%s\\n' "$@" > "${input.captureAt}"`,
  'prev=""',
  'out=""',
  'for a in "$@"; do',
  '  if [[ "$prev" == "--output" ]]; then out="$a"; fi',
  '  prev="$a"',
  'done',
  'if [[ -n "$out" ]]; then',
  '  mkdir -p "$(dirname "$out")"',
  `  printf '%s\\n' "${input.reportBody}" > "$out"`,
  'fi',
  'echo "🔍 review"',
  ...(input.withLogs === false
    ? []
    : ['echo "   ├─ logs: .log/bhrain/review/x"']),
  'echo "   ├─ review: $out"',
  'echo "   └─ summary"',
  `echo "      ├─ ${input.blockers} blockers"`,
  `echo "      └─ ${input.nitpicks} nitpicks"`,
];

/**
 * .what = a fake `rhx` that records the ARGV it was called with
 *
 * .why  = the swap to `rhx review` moved every input off the prompt and
 *         onto the command line. no `-p` is passed at all, so the prior
 *         capture — the value after `-p` — records an empty string on
 *         every run, and every assertion built on it would pass
 *         vacuously.
 *
 *         the argv is now the whole contract: `--rules`, `--refs`,
 *         `--diffs`, `--brain`, `--focus`, `--goal`, `--output`. each is
 *         load-bearing, and each is invisible unless the fake keeps it.
 */
const genRhxThatCapturesTheArgv = (input: {
  dir: string;
}): { bin: string; captureAt: string; readArgv: () => string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });
  const captureAt = path.join(input.dir, '.argv.txt');

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    asFakeReviewBody({
      captureAt,
      reportBody: 'no hits',
      blockers: 0,
      nitpicks: 0,
    }).join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  return {
    bin,
    captureAt,
    readArgv: (): string =>
      fs.existsSync(captureAt) ? fs.readFileSync(captureAt, UTF8) : '',
  };
};

/**
 * .what = a fake `rhx` that answers with a NON-ZERO verdict
 *
 * .why  = `genRhxThatCapturesTheArgv` hardcodes `0 blockers`, so every
 *         apply-path case built on it lands on the CLEAN branch. that
 *         left the hit branch — the one this whole skill exists to
 *         produce — with no case that reaches it at all.
 *
 * ⚠️ the marker goes into the `--output` FILE, never stdout. `rhx review`
 *    puts what it found in that file and prints only counts and paths, so
 *    a fake that echoed the body to stdout would clamp a copy-out the
 *    skill no longer performs.
 *
 * .note = same `rule.forbid.integration.mocks` exception as its peer
 *         above: a real brain call is slow, paid, and answers
 *         differently each run. the REAL invocation stays clamped in
 *         pii.scan.via.brain.live.integration.test.ts.
 */
const genRhxThatAnswers = (input: {
  dir: string;
  blockers: number;
  nitpicks: number;
  marker: string;
}): { bin: string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    asFakeReviewBody({
      captureAt: path.join(input.dir, '.argv.txt'),
      reportBody: input.marker,
      blockers: input.blockers,
      nitpicks: input.nitpicks,
    }).join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  return { bin };
};

/**
 * .what = a fake `rhx` that SKIPS — zero counts, exit 0, and no logs
 *
 * .why  = `rhx review` skips when its rules glob matches zero files, and
 *         a skip prints `0 blockers / 0 nitpicks` at exit 0 — byte for
 *         byte what a CLEAN pass prints. so a skip would read as a green
 *         gate over a diff no brain ever graded, which is the exact
 *         failhide this whole skill exists to refuse.
 *
 * ⛔ THE ONE DIFFERENCE IS THE `logs:` LINE, and this fake exists to
 *    prove the skill reads it. a skip writes no log artifacts, so it
 *    advertises none; the `review:` line is NOT usable, because a skip
 *    writes that file and its presence proves naught.
 */
const genRhxThatSkips = (input: { dir: string }): { bin: string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    asFakeReviewBody({
      captureAt: path.join(input.dir, '.argv.txt'),
      reportBody: '',
      blockers: 0,
      nitpicks: 0,
      withLogs: false,
    }).join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  return { bin };
};

describe('pii.scan.via.brain.sh', () => {
  given('[case1] a staged file, in plan mode', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] planned', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'plan'],
          cwd: repo.dir,
        }),
      );

      then('it exits 0 and asks no brain', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      then('it names the reviewer it WOULD ask', () => {
        // ONE by default. a union of three catches more and costs three
        // times the latency and spend at EVERY commit, and `--brain` is
        // repeatable — so the union is one flag away when a tree wants it
        expect(result.stdout).toContain('brains');
        expect(result.stdout).toContain('anthropic/claude/opus');
      });

      then('it names the briefs it WOULD hand the reviewer', () => {
        // ⛔ the API brain boots none of the role's briefs, so they must
        //    arrive as --refs. an absent refs branch here is the tell
        //    that the reviewer would grade with no practice rules at all
        expect(result.stdout).toContain('refs');
      });
    });
  });

  given('[case2] a staged scope with no files', () => {
    // an empty scope is genuinely clean. to block here would block
    // every commit that touches only deletions — and a gate that
    // blocks a clean commit gets disabled within a day
    const repo = useBeforeAll(async () =>
      genTempRepo({ files: { 'untracked.md': 'not staged' } }),
    );

    when('[t0] reviewed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs', 'since-staged'], cwd: repo.dir }),
      );

      then('it exits 0 without a brain call', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('no review needed');
      });
    });
  });

  given('[case3] a rubric that cannot be found', () => {
    // ⚠️ the quiet catastrophe. a reviewer handed no rules grades
    //    against an empty rubric and returns a clean 0/0 — a silent
    //    pass at the one boundary where a miss is unrecoverable
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed with a bogus rubric path', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--rubric',
            '/tmp/does-not-exist.md',
          ],
          cwd: repo.dir,
        }),
      );

      then('it exits 1 (malfunction), NOT 0', () => {
        // assert the EXACT code. "non-zero" cannot tell a gate that
        // refused to run apart from one that found PII, and the two
        // send a human down completely different paths
        if (result.exitCode !== 1) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('rubric not found');
      });
    });
  });

  given('[case4] a brain that cannot be reached', () => {
    // THE case this file exists for. a reviewer that cannot run must
    // never read as a reviewer that found no PII — per
    // contract.reviewer-output, an unreadable verdict is a
    // malfunction, and a malfunction blocks
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed against a brain slug that does not exist', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'nope/not/a/real/brain'],
          cwd: repo.dir,
        }),
      );

      then('it exits 1 (malfunction), never 0', () => {
        if (result.exitCode === 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
      });

      then('it says the diff was never examined', () => {
        // the distinction is load-bearing: to report a leak that was
        // never detected sends someone hunting a value that may not
        // be there, and teaches them to distrust the gate
        //
        // ⚠️ this assertion is also what tells a CRASH apart from the
        //    malfunction branch. both exit 1, so the exit code alone
        //    cannot distinguish "the gate reported it could not run"
        //    from "the gate fell over" — only the verdict text can
        if (!result.stdout.includes('never actually examined')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', JSON.stringify(result.stdout));
          console.log('PROOF: stderr:', JSON.stringify(result.stderr));
        }
        expect(result.stdout).toContain('never actually examined');
      });

      then('it does NOT claim the diff is clean', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      /**
       * ⭐ the MALFUNCTION HEADER — the verdict line, as opposed to the body
       *    line above it. the MESSAGE walk graded `:661` `no-assert` on the
       *    longest literal adjacent to that exit, and the grade held up: of
       *    the six lines this branch prints, exactly ONE was read.
       */
      then('⭐ it renders the MALFUNCTION verdict', () => {
        expect(result.stdout).toContain('the review could not run');
      });

      /**
       * ⭐ THE REMEDY, and the one line here with real operational weight.
       *
       *    this branch's own source comment states the stake outright — "a
       *    block with no cause is a block a human cannot clear, and a gate
       *    nobody can clear is a gate that gets bypassed". the cause is the
       *    per-reviewer evidence above; the CURE is this line, and only this
       *    line, because the overwhelmingly common cause is a locked
       *    keyrack rather than a defect in the diff.
       *
       * ⛔ delete it and every extant clamp stays green. the human at the
       *    pre-commit gate then gets a block, a tail of raw reviewer output,
       *    and no next move — which per `rule.require.errors-name-the-fix`
       *    is a symptom with no fix attached.
       *
       * ⚠️ the command is asserted too, not just the prose. "keyrack is
       *    locked" tells a reader WHAT; only the invocation tells them HOW,
       *    and the two are separate lines in the source, so one can be lost
       *    without the other.
       */
      then('⭐ and it names the FIX, with the command to run', () => {
        expect(result.stdout).toContain('most often: keyrack is locked');
        expect(result.stdout).toContain(
          'rhx keyrack unlock --owner ehmpath --env test',
        );
      });
    });
  });

  given('[case5] no scope given', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called bare', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 and names the fix', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--diffs since-staged');
      });

      then("it offers `rhx review`'s vocabulary, not a private one", () => {
        // one canonical word per concept. a caller who learned the
        // reviewer's flags must not have to learn a second set here
        expect(result.stdout).not.toContain('--staged');
      });
    });
  });

  given('[case6] the skill invoked for help', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called with --help', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--help'], cwd: repo.dir }),
      );

      then('it exits 0 and explains why a brain is here at all', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('pii.scan --via brain');
        expect(result.stdout).toContain('can only ADD blocks');
      });
    });
  });

  given('[case7] an unknown option', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called with a bad flag', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--nope'],
          cwd: repo.dir,
        }),
      );

      then('it exits 2 with a constraint message', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown option');
      });
    });
  });

  given('[case8] a staged BINARY, which no upstream check can read', () => {
    // ⛔ THE case this change exists for. `grep -I` refuses to open a
    //    binary, so the deterministic pass skips it; `git diff` prints
    //    one line for it that names no value. the reviewer here is the
    //    only gate left — and it cannot look at a file it was never
    //    told about.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'notes.md': 'Dear reader,' },
        binaries: {
          'scan.png': Buffer.concat([
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            Buffer.from([0x00, 0x00, 0x00, 0x0d]),
            Buffer.from('rendered form', UTF8),
          ]),
        },
        stage: ['notes.md', 'scan.png'],
      }),
    );

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ the diff genuinely hides it — the fixture is real', () => {
        // the positive control, on the FIXTURE rather than the guard.
        // without it, a report that names the file proves little: the
        // diff might have carried the bytes all along, and there would
        // be no blindness for this change to cure.
        const diff = spawnSync('git', ['diff', '--cached'], {
          cwd: repo.dir,
          encoding: UTF8,
        });
        expect(diff.stdout).toContain('Binary files');
        expect(diff.stdout).not.toContain('rendered form');
      });

      then('it names the binary IN THE REPORT, by path', () => {
        // ⛔ THE SUBJECT MOVED, and the move is the whole point of the
        //    swap. the prior form put the path in a PROMPT and told the
        //    reviewer to open it. an API brain has no filesystem, so
        //    that instruction is one it CANNOT obey — and an
        //    unfulfillable instruction at a gate is worse than an absent
        //    one, because it reads like coverage.
        //
        //    what replaces it is deterministic: the skill counts them
        //    itself, names each one, and prints the remedy. a prompt
        //    makes examination LIKELY; a counter makes blindness VISIBLE.
        if (!result.stdout.includes('scan.png')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.stdout).toContain('scan.png');
      });

      then('it says plainly that NO pass has looked inside', () => {
        // the path alone is not enough. a human handed a filename with
        // no claim about it assumes some layer read it — which is the
        // exact assumption this branch exists to refuse
        expect(result.stdout).toContain('unread');
        expect(result.stdout).toContain('no pass has looked inside these');
      });

      then('it names the remedy, as a runnable command', () => {
        // a gate that reports a gap and no way to close it is a gate a
        // human learns to scroll past
        expect(result.stdout).toContain('rhx pdf.transcribe');
      });

      then('it does NOT name the text file in that branch', () => {
        // notes.md reaches the reviewer through the diff already. to
        // list it here would dilute the one list whose whole value is
        // that it is short
        const branch = result.stdout.slice(result.stdout.indexOf('unread'));
        expect(branch).not.toContain('notes.md');
      });

      then('⭐ it does NOT block — a staged binary is ordinary', () => {
        // a gate that refuses every staged PDF is a gate that gets
        // bypassed within a day, and a bypassed gate catches none of
        // what it was built to catch
        expect(result.exitCode).toBe(0);
      });
    });
  });

  given('[case9] a staged set that is all text', () => {
    // the negative control. a section that prints on every run is
    // noise, and noise trains a reader to skim past the one run where
    // it mattered
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'notes.md': 'Dear reader,' },
        stage: ['notes.md'],
      }),
    );

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('a review DID run — the positive control for this case', () => {
        // without it, a fake that was never invoked would satisfy the
        // assertion below for the wrong reason: an absent branch proves
        // silence, never that the run reached the point of printing it
        const argv = fake.readArgv();
        expect(argv).toContain('review');
        expect(argv).toContain('--diffs');
      });

      then('the report shows no unread branch at all', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('clear skies');
        expect(result.stdout).not.toContain('unread');
      });
    });
  });

  /**
   * .what = the arg-parse arms no case in this file ever reached
   *
   * .why  = `parse_args` (pii.scan.via.brain.sh:159) has ELEVEN arms.
   *         SIX were covered — `--help` by [case6], `--diffs`, `--brain`,
   *         `--rubric`, `--mode` and `-*)` by [case7]. the `-h` alias, the
   *         rhachet passthrough and the BARE-token catch-all had none.
   *
   * ⚠️ every assertion below reads the MESSAGE, never the exit code. this
   *    skill refuses at exit 2 from SEVEN sites — the two catch-alls, four
   *    guards in `validate`, and the hit verdict at :633 — so a
   *    fall-through from one arm to another is wholly invisible to
   *    `expect(exitCode).toBe(2)`.
   *
   * ⚠️ each positive sits in its own `then`, apart from its discriminator.
   *    jest halts a `then` at its first red, so an exclusion co-located
   *    with a positive can never be measured on its own.
   */
  given('[case10] the arg-parse arms with no prior case', () => {
    when('[t0] the -h alias is used', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: {} }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['-h'], cwd: repo.dir }),
      );

      then('it exits 0 and renders the usage block', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('pii.scan --via brain');
        expect(result.stdout).toContain('--help, -h');
      });

      // ⭐ the discriminator. a dead `-h` falls to the `-*)` catch-all,
      //    which refuses at the SAME exit 2 as six other sites — so only
      //    the absence of that message tells the two apart.
      then('⭐ it does NOT fall through to the unknown-option arm', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] rhachet passes --repo, --skill and --role', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      // ⚠️ ORDER IS LOAD-BEARING. under a `shift` defect the parser halts
      //    at the FIRST stray token, so only the value of the FIRST
      //    passthrough flag can ever leak. `--repo` leads, and its value
      //    is the needle.
      //
      // ⚠️ and `bhrain` is chosen because the plan report echoes the
      //    scope, the rubric basename, the roles and the brain slugs — a
      //    needle drawn from any of those would redden on CORRECT
      //    behavior. `bhrain` appears in none of them.
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--repo',
            'bhrain',
            '--skill',
            'pii.scan',
            '--role',
            'transcriber',
            '--diffs',
            'since-staged',
            '--mode',
            'plan',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it plans, rather than refuse', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
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
      //    merge of the two is invisible to [case7], which passes a
      //    dash-prefixed token and would stay GREEN under it.
      then('⭐ it is NOT reported as an unknown OPTION', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });
  });

  /**
   * .what = the flags the DISPATCHER forwards, which this leaf accepts
   *         and drops
   *
   * .why  = `pii.scan.sh` hands every scope flag to both layers, so this
   *         leaf must swallow five it has no use for
   *         (pii.scan.via.brain.sh:185). drop one from that alternation
   *         and it falls to `-*)` — so the gate refuses, at exit 2, every
   *         invocation the dispatcher makes with a roster or an allowlist.
   *         the whole second layer stops, and it stops by REFUSAL, which
   *         at a pre-commit gate blocks every commit.
   *
   * ⚠️ the five sit on ONE alternation line, so a defect in it is a defect
   *    in all five and one case reaches them together. what a single case
   *    CANNOT do is name which one broke — hence the two exclusions below,
   *    which separate a dropped FLAG from a mis-shifted VALUE.
   */
  given('[case11] the flags forwarded by the dispatcher', () => {
    when('[t0] all five accept-and-drop flags are passed', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--paths-with',
            'src/**',
            '--paths-wout',
            'vendor',
            '--join',
            'union',
            '--allow',
            '.my-allow',
            '--roster',
            '.my-map',
            '--mode',
            'plan',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it plans, rather than refuse a flag it was handed', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      // ⭐ a flag dropped from the alternation lands on `-*)`
      then('⭐ no flag fell to the unknown-option arm', () => {
        expect(result.stdout).not.toContain('unknown option');
      });

      // ⭐ a `shift` where `shift 2` is meant leaves the VALUE as a bare
      //    token, which lands on `*)` — a different message, the same
      //    exit code
      then('⭐ no VALUE fell to the unexpected-argument arm', () => {
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });

    when('[t1] --lockfiles is passed AHEAD of another flag', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      // ⚠️ POSITION IS LOAD-BEARING, and it is the INVERSE of the regex
      //    suite's choice. there `--lockfiles` changes the file set, so it
      //    goes LAST to isolate its effect. here it does no work at all —
      //    it is accepted and dropped — so acceptance is the ONLY
      //    observable, and a `shift 2` defect can be seen only if there is
      //    a next token for it to swallow. so it LEADS: under `shift 2` it
      //    eats `--diffs`, and `since-staged` is left as a bare token.
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--lockfiles', '--diffs', 'since-staged', '--mode', 'plan'],
          cwd: repo.dir,
        }),
      );

      then('⭐ it plans, rather than swallow the flag behind it', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      then('⭐ the flag behind it was NOT read as an argument', () => {
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });
  });

  /**
   * .what = the value-guards in `validate` (pii.scan.via.brain.sh:223)
   *
   * .why  = four of the seven exit-2 sites live here and only ONE was
   *         covered ([case5], the absent scope). the rest are
   *         distinguishable from each other by their MESSAGE alone.
   *
   * ⛔ and the harm of a dead value-guard is never a wrong refusal. it is
   *    one of two silent failures, and they are DIFFERENT failures:
   *
   *      --diffs  an unvalidated value matches no arm of `collect_files`,
   *               which has no `*)`. so it emits no path, the file count
   *               is zero, and the gate reports `clear skies · no review
   *               needed` — the exact "never opened, reported as read"
   *               failure this skill exists to prevent.
   *
   *      --mode   an unvalidated value is not `plan`, so control falls
   *               past the plan branch into APPLY. a typo does not refuse
   *               — it asks a paid brain that the operator deliberately
   *               asked it not to ask.
   */
  given('[case12] the value-guards with no prior case', () => {
    when('[t0] --diffs carries a near-miss value', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
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

      // ⭐ the harm. a file IS staged, so a dead guard does not merely
      //    accept a bad value — it reports the scope empty and clean.
      then('⭐ it does NOT report clean over a scope it never built', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      then('⭐ it is NOT reported as an absent scope', () => {
        // [case5]'s message, from the guard immediately above this one
        expect(result.stdout).not.toContain('needs a scope');
      });
    });

    when('[t1] --mode carries a typo', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      // ⚠️ the fake `rhx` is here as a COST CEILING, not as the subject.
      //    under a dead guard this invocation reaches the apply path and
      //    asks a real brain — slow, paid, and non-deterministic. the
      //    fake bounds that, and doubles as the instrument for the
      //    assertion below.
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'paln'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it names the pair it accepts', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--mode must be plan or apply');
      });

      // ⭐ THE HARM, MEASURED AT THE SOURCE. every other clamp in this file
      //    reads the report; this one reads whether a brain was invoked at
      //    all. a dead guard turns a typo into a paid call, and the report
      //    it then prints is a perfectly ordinary clean one.
      then('⭐ no brain was asked', () => {
        expect(fake.readArgv()).toEqual('');
      });

      then('⭐ it does NOT report clean', () => {
        expect(result.stdout).not.toContain('clear skies');
      });
    });
  });

  /**
   * .what = --roles, the flag the swap to `rhx review` REMOVED
   *
   * .why  = an enrolled clone booted roles; an API brain boots none of
   *         them, so the flag has no target and was deleted from the
   *         surface. the hazard is what a REMOVED flag does next — and
   *         the two exits are not equally safe:
   *
   *           accepted and dropped -> the operator believes they narrowed
   *                                   the reviewer, the run proceeds, and
   *                                   the report is an ordinary clean one
   *           refused              -> exit 2, and they read the help
   *
   *         the first is a silent behavior change at a gate whose whole
   *         job is to refuse silence. so the clamp is on the REFUSAL,
   *         never merely on the flag's absence from the report.
   *
   * ⚠️ this case USED to assert the flag worked. it now asserts the flag
   *    is gone, and that inversion is deliberate: the prior assertion is
   *    exactly the one a half-done swap would leave green.
   */
  given('[case13] the removed --roles flag', () => {
    when('[t0] an operator sends it out of habit', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--roles',
            'reviewer,notary',
            '--mode',
            'plan',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it is REFUSED, never silently dropped', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.exitCode).toBe(2);
      });

      then('the refusal names the flag it rejected', () => {
        expect(result.stdout).toContain('--roles');
      });

      then('⭐ it does NOT proceed to a report', () => {
        // the harm, stated. a run that accepted the flag and reviewed
        // anyway prints a perfectly ordinary plan, and the operator
        // never learns the reviewer was never narrowed
        expect(result.stdout).not.toContain('heres the plan');
        expect(result.stdout).not.toContain('clear skies');
      });
    });
  });

  /**
   * ⭐ the TWIN of [case23] in pii.scan.via.regex.integration.test.ts, and it
   *    had ZERO coverage here. the MESSAGE walk found it on the
   *    `rev-parse --is-inside-work-tree` guard in
   *    `pii.scan.via.brain.sh`, graded `no-assert`.
   *
   *    both leaves derive their whole scope from git — `--diffs` resolves to a
   *    `git diff` — so outside a work tree there is no scope to build. each
   *    refuses up front rather than let the run reach a scope it cannot
   *    derive.
   *
   * ⚠️ the fixture is a BARE mkdtemp, deliberately not `genTempRepo`. that
   *    helper opens with `git init`, so it would satisfy the very precondition
   *    this case exists to remove.
   *
   * ⚠️ `--diffs since-staged` is passed on purpose. the git check is FIRST in
   *    `validate()`, so a bare invocation would be refused by the scope guard
   *    below it and the probe would measure the wrong arm.
   */
  given('[case14] a directory that is NOT a git work tree', () => {
    const bare = useBeforeAll(async () => ({
      dir: fs.mkdtempSync(path.join(os.tmpdir(), 'pii-review-nogit-')),
    }));

    when('[t0] the reviewer is invoked there', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'plan'],
          cwd: bare.dir,
        }),
      );

      then('it refuses at exit 2 — a CONSTRAINT, not a malfunction', () => {
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ SPLIT from the exit-code clamp above, per the discipline this walk
       *    holds throughout: jest halts a `then` at its first red, so two
       *    clamps in one block can never be measured apart.
       *
       *    MEASURED 2026-09-04, guard deleted from `validate()`:
       *      exit code = 129   (NOT 2 — no reason reaches the caller)
       *      stdout    = ""    (empty)
       *    both clamps went red, 37/2.
       *
       * ⭐ 129, where the REGEX leaf's identical guard falls through to 128.
       *    two twin skills, the same guard, the same fixture, two different
       *    codes — which is the leak-6 lesson stated as a measurement: the
       *    exit-code clamp's teeth are a property of what lies DOWNSTREAM,
       *    not of the guard. neither number is a fact about the refusal, and
       *    the day one of them lands on 2 the code clamp goes green over a
       *    run that never checked the precondition.
       *
       * ⚠️ and the split earns more here than at the regex leaf. this skill
       *    spends MONEY — an `--mode apply` arm past `validate` is a paid
       *    brain call — so a guard that never fires is not merely a wrong
       *    verdict, it is a wrong verdict with a bill attached.
       */
      then('⭐ and it NAMES the reason', () => {
        expect(result.stdout).toContain('not inside a git work tree');
      });
    });
  });

  /**
   * .what = the HIT verdict — pii.scan.via.brain.sh:612-633
   *
   * ⛔ THE BRANCH THIS SKILL EXISTS TO PRODUCE, AND NO CASE REACHED IT.
   *
   *    every apply-path case in this file goes through
   *    `genRhxThatCapturesTheArgv`, whose fake answers `0 blockers` —
   *    hardcoded, in its shared body. so `totalBlockers` was zero on every
   *    run, and the whole `-gt 0` arm was dead: the `hold up — a brain saw
   *    PII` header, the per-reviewer 🚨 line, the UNION rule, the report
   *    copy, and `exit 2`.
   *
   * ⭐ the MESSAGE walk graded `:633` **thin-msg**, which is a WEAKER claim
   *    than the truth. the sweep can only see that the longest literal
   *    adjacent to an exit is short; it cannot see that no case reaches the
   *    branch at all. so a `thin-msg` grade is a PROMPT to open the site —
   *    and opened, this one is leak 5, not leak 6.
   *
   * ⛔ and the extant discriminators cannot stand in for this. three cases
   *    assert `not.toContain('clear skies')`, which is satisfied by ANY
   *    output that is not the clean header — an empty stdout, a crash, a
   *    truncated report. an exclusion cannot tell "the blocked verdict
   *    rendered" from "no verdict rendered at all".
   */
  given('[case15] a reviewer that answers with BLOCKERS', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed under a fake that reports a hit', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 2,
          nitpicks: 1,
          marker: 'VERDICT-BODY-MARKER',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it blocks at exit 2', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ the verdict itself. SPLIT from the exit code above, because the
       *    two fail apart: `main`'s clean tail also exits 0 and the
       *    malfunction tail exits 1, so a swap of the two headers moves no
       *    exit code at all.
       */
      then('⭐ it renders the HIT verdict', () => {
        expect(result.stdout).toContain('hold up — a brain saw PII');
      });

      /**
       * ⭐ the per-reviewer line, from the `blockers -gt 0` arm at :604.
       *    its ✅ twin sits two lines below at :606 and is byte-adjacent in
       *    the source, so a swap of the two arms is a one-line edit that
       *    labels a hit `clean` while the header above still says `hold up`.
       */
      then('⭐ it names the reviewer that saw it, with its counts', () => {
        expect(result.stdout).toContain(
          '🚨 fake/one — 2 blocker(s), 1 nitpick(s)',
        );
      });

      then('⭐ it states the UNION rule', () => {
        // ⛔ the rule a human must know to act: one blocker from one
        //    reviewer blocks, whatever the other two said. without it the
        //    tree reads as a tally to weigh rather than a gate that closed
        expect(result.stdout).toContain(
          'results are UNIONED: any blocker from any reviewer blocks',
        );
      });

      /**
       * ⭐ the report copy — the only clamp here that reads DISK rather than
       *    stdout. the reviewer's own reply IS the report (see
       *    run_one_reviewer), so a `cp` that silently no-ops leaves the
       *    human with a tree that points at a file that was never written.
       *    the `|| true` on that line makes the failure silent by design.
       */
      then("⭐ the report lands on disk, with the reviewer's own words", () => {
        const at = path.join(repo.dir, '.pii-review.fake-one.md');
        expect(fs.existsSync(at)).toBe(true);
        expect(fs.readFileSync(at, UTF8)).toContain('VERDICT-BODY-MARKER');
      });

      then('⭐ and it is NOT the clean verdict', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      /**
       * ⭐ the discriminator that the three extant `clear skies` exclusions
       *    cannot supply. a hit and a malfunction BOTH block, so the two are
       *    separated by their text alone — and they send a human down
       *    completely different paths: one hunts a value, the other unlocks
       *    a keyrack.
       */
      then('⭐ nor the MALFUNCTION verdict', () => {
        expect(result.stdout).not.toContain('the review could not run');
        expect(result.stdout).not.toContain('never actually examined');
      });
    });
  });

  /**
   * .what = the `rhx review` argv — the whole contract of the swap
   *
   * ⛔ EVERY FLAG BELOW IS LOAD-BEARING, AND TWO ARE SET TO THE VALUE
   *    THAT IS ALREADY THE DEFAULT. that redundancy is the point: an
   *    upstream default that moves must not silently change what this
   *    gate does, and only an assertion on the argv can prove the flag
   *    was actually sent rather than merely relied upon.
   *
   * ⚠️ none of these is visible in the report. a run with `--focus pull`
   *    against an API brain grades a diff it never read and prints an
   *    ordinary `clear skies` — so no stdout clamp can reach this.
   */
  given('[case16] the flags handed to rhx review', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it calls `review`, never `enroll`', () => {
        // ⛔ the swap itself. `rhx enroll claude` spawns a clone with a
        //    cwd jail, and twice that jail turned a clean tree into a
        //    blocked commit
        const argv = fake.readArgv();
        if (!argv.includes('review')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: argv:', JSON.stringify(argv));
        }
        expect(argv).toContain('review');
        expect(argv).not.toContain('enroll');
      });

      then('it hands over the rubric, as --rules', () => {
        const argv = fake.readArgv();
        expect(argv).toContain('--rules');
        expect(argv).toContain('rule.forbid.pii-in-a-diff.md');
      });

      then("⭐ it hands over the role's briefs, as --refs", () => {
        // ⛔ an enrolled clone BOOTED these. an API brain boots none of
        //    them, so a swap that dropped this flag would hand the
        //    reviewer a rubric and no practice rules behind it — and
        //    print a report indistinguishable from a correct run
        const argv = fake.readArgv();
        expect(argv).toContain('--refs');
        expect(argv).toContain('briefs/practices');
      });

      then('it pins the brain it was told to ask', () => {
        const argv = fake.readArgv();
        expect(argv).toContain('--brain');
        expect(argv).toContain('fake/one');
      });

      then('⭐ it PUSHES the diff — an API brain cannot pull one', () => {
        // `pull` hands the brain paths and expects it to open them. an
        // API brain has no tools to do that, so it would grade a diff it
        // never read — and answer, confidently, `0 blockers`
        expect(fake.readArgv()).toContain('push');
      });

      then('⭐ it asks for EXHAUSTIVE, never a sample', () => {
        // a representative sample of leaks is not a gate. one missed SSN
        // is the whole failure, and it cannot be rotated after a push
        expect(fake.readArgv()).toContain('exhaustive');
      });

      then('⛔ it NEVER passes --optional', () => {
        // ⛔ `--optional rules` turns a zero-match rules glob into
        //    `0 blockers / 0 nitpicks`, exit 0 — the exact failhide this
        //    gate exists to stop. `validate()` already refuses an absent
        //    rubric, so the flag buys nothing and costs the guarantee
        expect(fake.readArgv()).not.toContain('--optional');
      });
    });
  });

  /**
   * .what = a SKIPPED review, scored as a MALFUNCTION
   *
   * ⛔ A SKIP AND A CLEAN PASS PRINT THE SAME TWO LINES. `rhx review`
   *    skips when its rules glob matches zero files, and emits
   *    `0 blockers / 0 nitpicks` at exit 0 — byte for byte what a clean
   *    pass emits. so the count parser CANNOT tell them apart, and a skip
   *    would read as a green gate over a diff no brain ever graded.
   *
   * ⭐ the one discriminator is the `logs:` line. a skip writes no log
   *    artifacts, so it advertises none.
   *
   * ⚠️ the `review:` line is NOT usable, and that is the trap. a skip
   *    DOES write its --output file, so the presence of that line proves
   *    naught — a guard built on it would pass a skip.
   */
  given('[case17] a review that SKIPS', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the reviewer reports zero counts with no logs', () => {
      const fake = useBeforeAll(async () => genRhxThatSkips({ dir: repo.dir }));

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it does NOT report clean', () => {
        // THE assertion of this case. the fake prints `0 blockers` and
        // `0 nitpicks` at exit 0, so a skill that read only the counts
        // would land here on the clean tail
        if (result.stdout.includes('clear skies')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.stdout).not.toContain('clear skies');
      });

      then('it blocks, as a malfunction', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('the review could not run');
      });

      then('⭐ it says the diff was never examined', () => {
        // a human handed `0 blockers` and an exit 1 cannot tell a broken
        // reviewer from a broken skill. the words are the whole remedy
        expect(result.stdout).toContain('never actually examined');
      });

      then('⭐ and it is NOT the hit verdict', () => {
        // a hit and a malfunction both block, and they send a human down
        // completely different paths: one hunts a value in a diff, the
        // other repairs a reviewer that did not run
        expect(result.stdout).not.toContain('hold up — a brain saw PII');
      });
    });
  });
});
