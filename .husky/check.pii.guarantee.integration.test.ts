import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = prove the GUARANTEE, not the exit code: that a value the gate
 *         catches cannot reach a commit object
 * .why  = "the hook blocks it" was an assertion. an exit code is a claim
 *         about a shell; the guarantee is a claim about git's object
 *         store, and only one of those is what actually protects anyone.
 *
 *         so every case here ends on `git rev-list` — the artifact that
 *         would have to be rewritten if the gate were wrong.
 *
 * .note = the matrix is deliberately HONEST. the last case asserts that
 *         a `--no-verify` commit DOES get through, because a guarantee
 *         whose limits are undocumented is one people discover by
 *         accident.
 *
 * .note = every case runs against a throwaway repo, never this one.
 */

jest.setTimeout(120_000);

const UTF8 = 'utf-8' as const;

/** synthetic; the SSA has never issued a 666 prefix */
const SSN_BARE = '666123456';

const SKILL_REL = 'src/domain.roles/transcriber/skills/pii.scan';
const BRAIN_REL = `${SKILL_REL}/pii.scan.via.brain.sh`;
const skillDir = path.join(__dirname, '..', SKILL_REL);

const huskyReal = __dirname;

type Run = { stdout: string; stderr: string; exitCode: number };

const run = (input: { cmd: string; args: string[]; cwd: string }): Run => {
  const res = spawnSync(input.cmd, input.args, {
    cwd: input.cwd,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    exitCode: res.status ?? 1,
  };
};

const git = (input: { args: string[]; cwd: string }): Run =>
  run({ cmd: 'git', args: input.args, cwd: input.cwd });

const gitOrThrow = (input: { args: string[]; cwd: string }): Run => {
  const res = git(input);
  if (res.exitCode !== 0) {
    throw new Error(
      `git ${input.args.join(' ')} failed: ${res.stderr}${res.stdout}`,
    );
  }
  return res;
};

/**
 * .what = a husky directory with `_/husky.sh` removed
 * .why  = the exact shape of a fresh clone that never ran `npm install`.
 *         this is the machine the old `pre-commit` waved through, and
 *         the reason the PII gate now sits ABOVE that guard.
 */
const genHuskyWithoutRuntime = (input: { into: string }): string => {
  fs.cpSync(huskyReal, input.into, { recursive: true });
  fs.rmSync(path.join(input.into, '_'), { recursive: true, force: true });
  return input.into;
};

/**
 * .what = a throwaway repo with one seed commit
 * .why  = the hook reads the STAGED set, so the fixture has to be a real
 *         index — and the guarantee is measured in commit objects, so it
 *         needs a baseline to count from
 *
 * .note = the scanner is copied in UNTRACKED, on purpose. it has to sit
 *         at the path the hook anchors to (`git rev-parse
 *         --show-toplevel`), but if it were staged the gate would spend
 *         every case on its own test fixtures instead of the file under
 *         test.
 */
const genTempRepo = (input?: { husky?: 'real' | 'no-runtime' }): {
  root: string;
  work: string;
  husky: string;
} => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-guarantee-'));
  const work = path.join(root, 'work');
  fs.mkdirSync(work);

  gitOrThrow({ args: ['init', '--quiet', '--initial-branch=main'], cwd: work });
  gitOrThrow({ args: ['config', 'user.email', 'test@example.com'], cwd: work });
  gitOrThrow({ args: ['config', 'user.name', 'test'], cwd: work });

  // seed a baseline. no hooks are active yet — core.hooksPath is passed
  // per-command below, so this commit uses the repo's own empty
  // .git/hooks and cannot be blocked by the gate under test.
  fs.writeFileSync(path.join(work, 'readme.md'), 'seed\n');
  gitOrThrow({ args: ['add', 'readme.md'], cwd: work });
  gitOrThrow({ args: ['commit', '-m', 'seed'], cwd: work });

  fs.cpSync(skillDir, path.join(work, SKILL_REL), { recursive: true });

  // the brain layer, stubbed clean. what is under test is the GUARANTEE
  // — that a caught value cannot reach an object — so the second layer
  // needs only to be present and to not veto. its live invocation is
  // proven separately, in pii.scan.via.brain.live.integration.test.ts.
  fs.writeFileSync(
    path.join(work, BRAIN_REL),
    '#!/usr/bin/env bash\necho "stub reviewer: exit 0"\nexit 0\n',
  );

  const husky =
    input?.husky === 'no-runtime'
      ? genHuskyWithoutRuntime({ into: path.join(root, 'husky-fresh') })
      : huskyReal;

  return { root, work, husky };
};

const stagePii = (input: { work: string }): void => {
  fs.writeFileSync(
    path.join(input.work, 'leak.md'),
    `responsible party id ${SSN_BARE} on file\n`,
  );
  gitOrThrow({ args: ['add', 'leak.md'], cwd: input.work });
};

const stageClean = (input: { work: string }): void => {
  fs.writeFileSync(path.join(input.work, 'note.md'), 'just prose, year 2026\n');
  gitOrThrow({ args: ['add', 'note.md'], cwd: input.work });
};

/**
 * .what = stage a BINARY whose bytes carry a detectable value
 * .why  = the input class the whole matrix omitted. [case1]-[case5] are
 *         all text, so five green cases said no word about the file type
 *         that actually reached the index on 2026-08-31.
 * .note = a PNG magic number, a NUL, then the value. git classifies it
 *         binary on the NUL, which is the same fact `grep -I` acts on.
 */
const stageBinaryPii = (input: { work: string }): void => {
  fs.writeFileSync(
    path.join(input.work, 'render.png'),
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from([0x00, 0x00, 0x00, 0x0d]),
      Buffer.from(`responsible party ${SSN_BARE}`, UTF8),
    ]),
  );
  gitOrThrow({ args: ['add', 'render.png'], cwd: input.work });
};

const commit = (input: {
  work: string;
  husky: string;
  noVerify?: boolean;
}): Run =>
  git({
    cwd: input.work,
    args: [
      '-c',
      `core.hooksPath=${input.husky}`,
      'commit',
      '-m',
      'test',
      ...(input.noVerify ? ['--no-verify'] : []),
    ],
  });

/**
 * .what = how many commit objects exist beyond the seed
 * .why  = THE assertion. a non-zero exit could come from any hook in the
 *         chain, or from a shell error; only the object count says
 *         whether the value actually crossed the boundary.
 */
const countCommitsPastSeed = (input: { work: string }): number => {
  const res = gitOrThrow({
    args: ['rev-list', '--count', 'HEAD'],
    cwd: input.work,
  });
  return Number(res.stdout.trim()) - 1;
};

describe('the PII gate guarantee (commit boundary)', () => {
  given('[case1] PII staged, husky fully installed', () => {
    const scene = useBeforeAll(async () => {
      const repo = genTempRepo();
      stagePii({ work: repo.work });
      const result = commit({ work: repo.work, husky: repo.husky });
      return {
        repo,
        result,
        committed: countCommitsPastSeed({ work: repo.work }),
      };
    });

    when('[t0] a normal commit is attempted', () => {
      then('git aborts', () => {
        if (scene.result.exitCode === 0) {
          console.log('PROOF: stdout:', scene.result.stdout);
          console.log('PROOF: stderr:', scene.result.stderr);
        }
        expect(scene.result.exitCode).not.toBe(0);
      });

      then('NO commit object was created', () => {
        expect(scene.committed).toBe(0);
      });

      then('the gate names PII as the reason', () => {
        const output = scene.result.stdout + scene.result.stderr;
        expect(output).toContain('commit blocked: the staged set carries PII');
      });

      then('it never echoes the value it caught', () => {
        const output = scene.result.stdout + scene.result.stderr;
        expect(output).not.toContain(SSN_BARE);
      });
    });
  });

  given('[case2] PII staged, husky runtime ABSENT (a fresh clone)', () => {
    // ⚠️ THE regression this file exists for. `_/husky.sh` is absent
    //    until someone runs `npm install`, and the old `pre-commit`
    //    answered that with a skip notice and exit 0 — for EVERY hook,
    //    the PII gate included.
    //
    //    so the hole opened precisely on the machine least equipped to
    //    notice, and no test caught it, because every test ran where
    //    husky was already installed.
    const scene = useBeforeAll(async () => {
      const repo = genTempRepo({ husky: 'no-runtime' });
      stagePii({ work: repo.work });
      const result = commit({ work: repo.work, husky: repo.husky });
      return {
        repo,
        result,
        committed: countCommitsPastSeed({ work: repo.work }),
      };
    });

    when('[t0] a normal commit is attempted', () => {
      then('the fixture really is a fresh clone', () => {
        // guard the guard. if `_/husky.sh` were present this case would
        // pass for the wrong reason and prove no regression at all.
        expect(
          fs.existsSync(path.join(scene.repo.husky, '_', 'husky.sh')),
        ).toBe(false);
      });

      then('git STILL aborts', () => {
        if (scene.result.exitCode === 0) {
          console.log('PROOF: stdout:', scene.result.stdout);
          console.log('PROOF: stderr:', scene.result.stderr);
        }
        expect(scene.result.exitCode).not.toBe(0);
      });

      then('NO commit object was created', () => {
        expect(scene.committed).toBe(0);
      });

      then('the PII gate is what blocked it, not a shell error', () => {
        const output = scene.result.stdout + scene.result.stderr;
        expect(output).toContain('commit blocked: the staged set carries PII');
      });
    });
  });

  given('[case3] a clean staged set, husky runtime absent', () => {
    // the other half of case2. a gate hoisted above the husky guard
    // must not ALSO hoist the hooks that legitimately need
    // node_modules — a fresh clone has to stay able to commit.
    const scene = useBeforeAll(async () => {
      const repo = genTempRepo({ husky: 'no-runtime' });
      stageClean({ work: repo.work });
      const result = commit({ work: repo.work, husky: repo.husky });
      return {
        repo,
        result,
        committed: countCommitsPastSeed({ work: repo.work }),
      };
    });

    when('[t0] a normal commit is attempted', () => {
      then('the commit succeeds', () => {
        if (scene.result.exitCode !== 0) {
          console.log('PROOF: stdout:', scene.result.stdout);
          console.log('PROOF: stderr:', scene.result.stderr);
        }
        expect(scene.result.exitCode).toBe(0);
      });

      then('a commit object exists', () => {
        expect(scene.committed).toBe(1);
      });
    });
  });

  given('[case4] a clean staged set, husky fully installed', () => {
    const scene = useBeforeAll(async () => {
      const repo = genTempRepo();
      stageClean({ work: repo.work });
      const result = commit({ work: repo.work, husky: repo.husky });
      return {
        repo,
        result,
        committed: countCommitsPastSeed({ work: repo.work }),
      };
    });

    when('[t0] a normal commit is attempted', () => {
      then('the commit succeeds', () => {
        // the half people route around. a gate that blocks every commit
        // gets disabled within a day, and then guards no one.
        if (scene.result.exitCode !== 0) {
          console.log('PROOF: stdout:', scene.result.stdout);
          console.log('PROOF: stderr:', scene.result.stderr);
        }
        expect(scene.result.exitCode).toBe(0);
      });

      then('a commit object exists', () => {
        expect(scene.committed).toBe(1);
      });
    });
  });

  given('[case5] PII forced past the gate with --no-verify', () => {
    // ⚠️ the limit of the guarantee, asserted rather than assumed.
    //    git is a local tool the human controls; no hook survives
    //    --no-verify, and to claim otherwise would be the failhide this
    //    whole gate exists to avoid.
    //
    //    commit is the ONLY boundary this repo gates, on purpose — a
    //    pre-push hook was built and removed, because it would fire on
    //    every push of a branch already scanned at each of its commits.
    //    so the honest statement of what is guaranteed is: no
    //    ACCIDENTAL commit OF A TEXT FILE, on every default path, with
    //    the bypass deliberate and loud — and the CI backstop
    //    (pii.scan.repo.integration.test.ts) red at the PR, while the
    //    branch is still rewritable.
    //
    // 🚩 that sentence read "on every default path", with no file-type
    //    qualifier, until 2026-08-31. it was FALSE, and it was falsified
    //    the same day by a staged PNG. see [case6] — a binary needs no
    //    bypass at all. the qualifier is the correction.
    const scene = useBeforeAll(async () => {
      const repo = genTempRepo();
      stagePii({ work: repo.work });
      const result = commit({
        work: repo.work,
        husky: repo.husky,
        noVerify: true,
      });
      return {
        repo,
        result,
        committed: countCommitsPastSeed({ work: repo.work }),
      };
    });

    when('[t0] the commit is forced', () => {
      then('it DOES commit — this is the documented limit', () => {
        expect(scene.result.exitCode).toBe(0);
        expect(scene.committed).toBe(1);
      });
    });
  });

  given('[case6] a BINARY that carries PII, on the default path', () => {
    // ⛔ THE SECOND DOCUMENTED LIMIT, and the one that cost real work.
    //
    //    on 2026-08-31 a PNG that carried PII sat
    //    staged at the repo root. it would have committed
    //    ACCIDENTALLY, on the DEFAULT path, with NO bypass — the case
    //    [case5] above says that cannot happen. the deterministic
    //    scanner reported `files: 0`, which reads as "examined and
    //    clean" and meant "never opened."
    //
    //    the input-type gap was total: the hook, its own suite, this
    //    matrix, and the CI backstop were four independent layers that
    //    all shared one assumption — that an input is text.
    //
    // ⚠️ this case asserts the CURRENT behavior on purpose. a red test
    //    nobody can fix gets skipped, and a limit recorded only in prose
    //    has no clamp and drifts the moment the code moves
    //    (rule.require.audit-guards-by-input-type). so it sits beside
    //    [case5], in the documented-limits position, and it will need a
    //    deliberate edit the day the gate learns to read a binary.
    //
    // ⚠️ the BRAIN layer is stubbed clean in this fixture, deliberately
    //    — what is measured here is the deterministic path, the one that
    //    runs offline, for free, and without credentials. the reviewer
    //    IS now handed the binary paths by name
    //    (pii.scan.via.brain.integration.test.ts [case8]), but a
    //    probabilistic reader is an addition to this limit, never its
    //    repeal.
    const scene = useBeforeAll(async () => {
      const repo = genTempRepo();
      stageBinaryPii({ work: repo.work });
      // ⚠️ read the staged diff HERE, while there still is one. a
      //    successful commit empties the index, so a `git diff --cached`
      //    after the fact returns "" — which satisfies the "does not
      //    contain the value" half for the wrong reason and fails the
      //    other half in a way that looks like a fixture bug.
      const diffStaged = git({ args: ['diff', '--cached'], cwd: repo.work });
      const result = commit({ work: repo.work, husky: repo.husky });
      return {
        repo,
        diffStaged,
        result,
        committed: countCommitsPastSeed({ work: repo.work }),
      };
    });

    when('[t0] a normal commit is attempted', () => {
      then('⭐ the value really is in the file, and out of the diff', () => {
        // the positive control on the FIXTURE. without it, a case that
        // shows a value cross the boundary could just as well be a case
        // where the value was never staged at all.
        const onDisk = fs.readFileSync(
          path.join(scene.repo.work, 'render.png'),
        );
        expect(onDisk.toString('latin1')).toContain(SSN_BARE);

        expect(scene.diffStaged.stdout).toContain('Binary files');
        expect(scene.diffStaged.stdout).not.toContain(SSN_BARE);
      });

      then('⚠️ it COMMITS — no bypass, no flag, the default path', () => {
        if (scene.result.exitCode !== 0) {
          console.log('PROOF: stdout:', scene.result.stdout);
          console.log('PROOF: stderr:', scene.result.stderr);
        }
        expect(scene.result.exitCode).toBe(0);
        expect(scene.committed).toBe(1);
      });

      then('but the gate SAYS it never opened the file', () => {
        // the whole value of the counter. the commit is permitted
        // either way; what changed is that the human is told the file
        // was skipped and why, rather than shown a `files: 0` that
        // wears the verdict of a clean read.
        const output = scene.result.stdout + scene.result.stderr;
        if (!output.includes('binary')) {
          console.log('PROOF: output:', JSON.stringify(output));
        }
        expect(output).toContain('skipped');
        expect(output).toContain('binary');
        expect(output).toContain('NOT scanned');
      });

      then('it never echoes the value it declined to read', () => {
        const output = scene.result.stdout + scene.result.stderr;
        expect(output).not.toContain(SSN_BARE);
      });
    });
  });

  given('[case7] the ENVIRONMENT that makes [case2]-[case4] real', () => {
    // ⛔ THE PRECONDITION NO OTHER CASE READS.
    //
    //    `check.pii.sh` opens with a note that it is POSIX sh only,
    //    because `pre-commit` is #!/bin/sh and husky re-execs the chain
    //    under `sh -e`. the defect it records — a ${BASH_SOURCE[0]} that
    //    is a "Bad substitution" under dash — blocked EVERY commit and
    //    "passed every test that invoked the hook directly under bash."
    //
    //    the cases above are the cure: they commit through the real
    //    git -> pre-commit chain, so the hook runs under whatever
    //    /bin/sh actually is. but that is the whole mechanism — the dash
    //    coverage is a property of THE MACHINE, not of any assertion.
    //
    //    on a distro where /bin/sh is bash, [case2], [case3] and [case4]
    //    all still pass and no longer reach dash at all, with no signal.
    //    that is `rule.require.assertions-that-discriminate` leak 7 one
    //    level out: a property of the harness's ENVIRONMENT that no
    //    assertion in the suite reads.
    //
    // ⚠️ this case is ALLOWED TO GO RED on such a machine, on purpose.
    //    the doctrine is quoted in the subject file itself:
    //
    //      "a gate that could not run must never look like a gate that
    //       passed."
    //
    //    a suite whose dash coverage silently lapsed is exactly that.
    //
    //    measured 2026-09-05 on this machine and on GitHub Actions
    //    ubuntu-latest: `readlink -f /bin/sh` -> /usr/bin/dash.
    const scene = useBeforeAll(async () => {
      const probe = ['-c', 'echo ${BASH_VERSION:-NOT-BASH}'];
      return {
        viaSh: run({ cmd: '/bin/sh', args: probe, cwd: __dirname }),
        viaBash: run({ cmd: 'bash', args: probe, cwd: __dirname }),
      };
    });

    when('[t0] the probe is run under an explicit bash', () => {
      then('⭐ it reports a version — so the probe CAN detect bash', () => {
        // the control this case must be able to fail. without it, a
        // probe that printed NOT-BASH for any reason at all — a broken
        // expansion, an empty stdout — would read as "dash confirmed".
        expect(scene.viaBash.exitCode).toBe(0);
        expect(scene.viaBash.stdout.trim()).not.toBe('NOT-BASH');
        expect(scene.viaBash.stdout.trim().length).toBeGreaterThan(0);
      });
    });

    when('[t1] the same probe is run under /bin/sh', () => {
      then('it reports NOT-BASH — the dash coverage above is REAL', () => {
        if (scene.viaSh.stdout.trim() !== 'NOT-BASH') {
          console.log(
            'PROOF: /bin/sh is bash on this machine, so [case2]-[case4]',
            'no longer reach the POSIX-only path.',
            'stdout:',
            JSON.stringify(scene.viaSh.stdout),
          );
        }
        expect(scene.viaSh.exitCode).toBe(0);
        expect(scene.viaSh.stdout.trim()).toBe('NOT-BASH');
      });
    });
  });
});
