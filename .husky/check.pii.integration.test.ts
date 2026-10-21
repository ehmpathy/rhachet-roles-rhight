import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the pre-commit PII gate
 * .why  = the hook is the PRIMARY guard — it fires before the commit
 *         object exists, which is the only side of the boundary where a
 *         leak is cheap to fix. so its exit code must actually reach
 *         git, and "the scanner could not run" must never read as "the
 *         scan passed".
 *
 * .note = these run the hook against a THROWAWAY repo, never this one.
 *         a gate tested only against a clean tree proves no result.
 */

const hookPath = path.join(__dirname, 'check.pii.sh');
const huskyDir = __dirname;

const UTF8 = 'utf-8' as const;

/** synthetic; the SSA has never issued a 666 prefix */
const SSN_BARE = '666123456';

const SKILL_REL = 'src/domain.roles/transcriber/skills/pii.scan';
const skillDir = path.join(__dirname, '..', SKILL_REL);

/** the brain mechanism sits BESIDE the dispatcher, in the same skill */
const BRAIN_REL = `${SKILL_REL}/pii.scan.via.brain.sh`;

/**
 * .what = build a throwaway git repo with a file staged, and a copy of
 *         the scanner at the path the hook expects
 * .why  = the hook reads the STAGED set, so the fixture has to be a real
 *         index, not just a file on disk
 *
 * .note = the hook anchors to the repo TOP-LEVEL, so the temp repo has
 *         to carry the scanner at the same relative path production
 *         uses. that makes the fixture a faithful miniature rather than
 *         a foreign tree pointed at someone else's scanner — and it is
 *         what lets `orphan: true` (omit the copy) exercise the branch
 *         where the scanner cannot be found.
 *
 *         the temp repo still needs no node_modules and no build, which
 *         is the property that keeps the gate robust.
 */
const genTempRepo = (input: {
  content: string;
  orphan?: boolean;
  reviewer?: 'real' | 'stub-clean' | 'stub-hit' | 'stub-broken' | 'absent';
}): { dir: string; hook: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-pii-'));

  const git = (args: string[]): void => {
    const res = spawnSync('git', args, { cwd: dir, encoding: UTF8 });
    if (res.status !== 0) {
      throw new Error(`git ${args.join(' ')} failed: ${res.stderr}`);
    }
  };

  git(['init', '--quiet']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'user.name', 'test']);

  fs.writeFileSync(path.join(dir, 'staged.md'), input.content);
  git(['add', 'staged.md']);

  if (!input.orphan) {
    fs.cpSync(skillDir, path.join(dir, SKILL_REL), { recursive: true });
  }

  // the SECOND layer. the whole skill was copied above, so the REAL
  // brain mechanism is already in place; these cases overwrite it with
  // a stub so the chain can be clamped without a network call.
  //
  // what is under test here is that the DISPATCHER routes each exit
  // code correctly and that the hook reports it — never the brains'
  // judgment, which is neither fast nor repeatable. the live
  // invocation is proven separately, in
  // pii.scan.via.brain.live.integration.test.ts.
  const reviewer = input.reviewer ?? 'stub-clean';
  if (!input.orphan) {
    const brainPath = path.join(dir, BRAIN_REL);
    if (reviewer === 'absent') {
      fs.rmSync(brainPath, { force: true });
    } else if (reviewer !== 'real') {
      const code = { 'stub-clean': 0, 'stub-hit': 2, 'stub-broken': 1 }[
        reviewer
      ];
      fs.writeFileSync(
        brainPath,
        `#!/usr/bin/env bash\necho "stub reviewer: exit ${code}"\nexit ${code}\n`,
      );
    }
  }

  return { dir, hook: hookPath };
};

/**
 * .what = run the hook directly, under bash
 * .why  = these cases are about the gate's LOGIC — which paths it
 *         refuses, what it prints, what it declines to echo. a direct
 *         spawn keeps each one fast and independent of git.
 *
 * ⛔ .note = THIS INVOCATION IS BLIND TO THE ONE DEFECT THE SUBJECT FILE
 *    DOCUMENTS. `check.pii.sh` is #!/bin/sh and its header records a
 *    ${BASH_SOURCE[0]} bashism that blocked EVERY commit and "passed
 *    every test that invoked the hook directly under bash" — which is
 *    exactly the line below.
 *
 *    a shebang cannot save us either: `pre-commit` SOURCES this file
 *    (`. "$(dirname -- "$0")/check.pii.sh"`), so its #!/bin/sh is inert
 *    and the operative interpreter is whatever ran `pre-commit`.
 *
 * ⭐ .note = so the POSIX-only property is covered ELSEWHERE, and the
 *    cross-file dependency is decisive: [case2], [case3] and [case4] of
 *    `check.pii.guarantee.integration.test.ts` commit through the real
 *    git -> pre-commit chain, so the hook runs under /bin/sh. [case7]
 *    of that same file clamps the environment that makes those three
 *    hold. do not read a green run of THIS file as coverage of the dash
 *    path.
 */
const runHook = (input: {
  cwd: string;
  hook: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const res = spawnSync('bash', [input.hook], {
    encoding: UTF8,
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    exitCode: res.status ?? 1,
  };
};

describe('check.pii.sh (the pre-commit gate)', () => {
  given('[case1] a staged file that carries a bare SSN', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: `responsible party id ${SSN_BARE} on file` }),
    );

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it exits 2 — hits found, not a malfunction', () => {
        // ⚠️ assert the EXACT code, never merely non-zero. an earlier
        // draft of this test accepted any non-zero and passed green
        // while the scanner was in fact unreachable — the gate had
        // detected no PII at all. "non-zero" cannot tell a working gate
        // apart from a broken one.
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      then('it names PII as the reason', () => {
        // match the HOOK's own line, not the bare phrase — the scanner
        // report says "carries PII" too, so the loose form stayed green
        // even when the hook had been made to exit 0 and print no
        // verdict of its own
        expect(result.stdout).toContain(
          'commit blocked: the staged set carries PII',
        );
      });

      then('it never echoes the value it caught', () => {
        expect(result.stdout).not.toContain(SSN_BARE);
        expect(result.stderr).not.toContain(SSN_BARE);
      });

      then('⭐ the brain was never asked — a regex hit is FINAL', () => {
        // ⚠️ THE SEQUENCE IS THE SAFETY PROPERTY. pii.scan.sh states it
        // three times (:27, :62, :114) and holds it at :207-209, which
        // exits on a non-zero regex status BEFORE the brain call at :224.
        //
        // the default reviewer here is `stub-clean`, so if the brain were
        // asked it would return a clean verdict on content the regex just
        // blocked. [case6] proves this marker reaches stdout whenever the
        // brain runs, which makes its ABSENCE here an exact negative
        // control rather than an incidental one.
        //
        // ⛔ the dangerous revert — move the :207-209 exit BELOW the brain
        // call — is invisible to every other assertion in this case: the
        // exit code stays 2, so the suite stays green on a dispatcher that
        // pays for, ships the staged bytes for, and then discards a
        // verdict that could only ever weaken a deterministic hit.
        expect(result.stdout).not.toContain('stub reviewer:');
      });
    });
  });

  given('[case2] a staged file with no PII', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: 'just prose, and a year 2026' }),
    );

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it exits 0, so the commit proceeds', () => {
        // a gate that blocks a clean commit is as broken as one that
        // passes a dirty one — it just fails in the direction people
        // route around, which ends with the gate disabled
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });
    });
  });

  given('[case3] the scanner cannot be found', () => {
    // the dangerous case. if a missing scanner exits 0, the gate is
    // indistinguishable from a clean scan — a silent pass on the exact
    // side of the boundary where a leak is unrecoverable
    const repo = useBeforeAll(async () =>
      genTempRepo({
        content: `responsible party id ${SSN_BARE} on file`,
        orphan: true,
      }),
    );

    when('[t0] the hook runs against a tree that carries PII', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it exits non-zero rather than pass silently', () => {
        expect(result.exitCode).not.toBe(0);
      });

      then('it reports a failed scan, NOT a detected leak', () => {
        // the distinction matters: to claim PII that was never detected
        // sends someone hunting a value that may not be there
        expect(result.stdout).toContain('could not run');
        expect(result.stdout).not.toContain('carries PII');
      });
    });
  });

  given('[case4] a real `git commit`, through the husky chain', () => {
    // ⚠️ every case above invokes the hook DIRECTLY, under bash. that is
    //    not how it fires in production. git runs `pre-commit`, which is
    //    `#!/bin/sh` — and on this machine /bin/sh is dash. husky then
    //    re-execs the whole chain under `sh -e`. so a construct that
    //    works under bash and not under dash passes every case above and
    //    fails on the first real commit.
    //
    //    core.hooksPath points at the REAL .husky, so this exercises the
    //    production hook files and the production layout, while the
    //    index being scanned belongs to a throwaway repo.
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: `responsible party id ${SSN_BARE} on file` }),
    );

    when('[t0] the commit is attempted with PII staged', () => {
      const result = useBeforeAll(async () => {
        const res = spawnSync(
          'git',
          ['-c', `core.hooksPath=${huskyDir}`, 'commit', '-m', 'test'],
          { cwd: repo.dir, encoding: UTF8, stdio: ['pipe', 'pipe', 'pipe'] },
        );
        return {
          stdout: res.stdout ?? '',
          stderr: res.stderr ?? '',
          exitCode: res.status ?? 1,
        };
      });

      then('git aborts the commit', () => {
        if (result.exitCode === 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).not.toBe(0);
      });

      then('the gate names PII as the reason', () => {
        // a chain that aborts for its OWN reason (a shell error, an
        // absent binary) also aborts the commit — and looks identical
        // from the exit code alone. so the verdict has to be present.
        const output = result.stdout + result.stderr;
        if (!output.includes('commit blocked: the staged set carries PII')) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(output).toContain('commit blocked: the staged set carries PII');
      });

      then('no commit object was created', () => {
        const res = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], {
          cwd: repo.dir,
          encoding: UTF8,
        });
        expect(res.status).not.toBe(0);
      });
    });
  });

  given('[case6] the scanner passes but a reviewer sees PII', () => {
    // the second layer's whole reason to exist. the regexes cannot see
    // a name, so the deterministic pass is clean — and the commit must
    // still block.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        content: 'a letter to a person, with no value of a matched shape',
        reviewer: 'stub-hit',
      }),
    );

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it exits 2', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      then('the BRAIN mechanism is what produced the block', () => {
        // ⚠️ assert the mechanism, not merely the exit code. exit 2
        // from the regex pass and exit 2 from the brain pass look
        // identical at the hook, and only one of them proves the
        // second layer ran at all. the stub's own marker is the proof.
        expect(result.stdout).toContain('stub reviewer: exit 2');
      });

      then('it names the .pii-map fix, so the class gets accrued', () => {
        // what a brain caught is a roster entry not yet written. told
        // otherwise, the human leaves the class in the brain's head,
        // and it is re-discovered at brain prices on every commit
        expect(result.stdout).toContain('.pii-map');
      });
    });
  });

  given('[case7] the scanner passes but the reviewer malfunctions', () => {
    // ⚠️ THE hazard of a probabilistic layer at a gate. an unreachable
    //    brain must never read as a clean diff — otherwise a locked
    //    keyrack silently downgrades the gate to one layer, and no one
    //    is told.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        content: 'just prose, and a year 2026',
        reviewer: 'stub-broken',
      }),
    );

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it blocks rather than pass silently', () => {
        if (result.exitCode === 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
      });

      then('it reports a MALFUNCTION, NOT a detected leak', () => {
        expect(result.stdout).toContain('the PII scan could not run');
        expect(result.stdout).toContain('MALFUNCTION, not a detected leak');
        expect(result.stdout).not.toContain('carries PII');
      });

      then('it names the most likely cause', () => {
        // a gate that blocks without a fix gets bypassed, and a
        // bypassed gate protects no one. locked keyrack is by far the
        // common case, so the hook says so rather than make the human
        // guess
        expect(result.stdout).toContain('keyrack unlock');
      });
    });
  });

  given('[case8] the reviewer is absent entirely', () => {
    // a gate that quietly shrinks from two layers to one is the worst
    // outcome: it still passes every commit, so no signal is emitted
    // to say that half the protection left
    const repo = useBeforeAll(async () =>
      genTempRepo({
        content: 'just prose, and a year 2026',
        reviewer: 'absent',
      }),
    );

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it blocks rather than fall back to one layer', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('the PII scan could not run');
      });

      then('it says WHICH mechanism went absent', () => {
        // "could not run" alone sends a human to check keyrack when
        // the real cause is a file that is not on disk
        expect(result.stdout).toContain('the brain mechanism was not found');
      });
    });
  });

  given('[case5] a real `git commit` of a clean staged set', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ content: 'just prose, and a year 2026' }),
    );

    when('[t0] the commit is attempted', () => {
      const result = useBeforeAll(async () => {
        const res = spawnSync(
          'git',
          ['-c', `core.hooksPath=${huskyDir}`, 'commit', '-m', 'test'],
          { cwd: repo.dir, encoding: UTF8, stdio: ['pipe', 'pipe', 'pipe'] },
        );
        return {
          stdout: res.stdout ?? '',
          stderr: res.stderr ?? '',
          exitCode: res.status ?? 1,
        };
      });

      then('the commit succeeds', () => {
        // the half that people route around. a gate that blocks every
        // commit gets disabled within a day, and then guards no one.
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('a commit object exists', () => {
        const res = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], {
          cwd: repo.dir,
          encoding: UTF8,
        });
        expect(res.status).toBe(0);
      });
    });
  });
});
