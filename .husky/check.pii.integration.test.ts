import { spawnSync } from 'child_process';
import * as fs from 'fs';
import { UnexpectedCodePathError } from 'helpful-errors';
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
  /**
   * the brain mechanism the fixture carries: `real` keeps the shipped
   * pii.scan.via.brain.sh (a case may still shim `rhx review` beneath
   * it); each stub replaces that file; `absent` removes it
   */
  reviewer?: 'real' | 'stub-clean' | 'stub-hit' | 'stub-broken' | 'absent';
}): { dir: string; hook: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-pii-'));

  // run git in the fixture; a git that never ran names that, not a git error
  const git = (gitInput: { args: string[] }): void => {
    const res = spawnSync('git', gitInput.args, { cwd: dir, encoding: UTF8 });
    if (res.error)
      throw new UnexpectedCodePathError('git could not be run', {
        args: gitInput.args,
        error: res.error.message,
      });
    if (res.status !== 0)
      throw new UnexpectedCodePathError('git failed in the fixture', {
        args: gitInput.args,
        status: res.status,
        stderr: res.stderr,
      });
  };

  git({ args: ['init', '--quiet'] });
  git({ args: ['config', 'user.email', 'test@example.com'] });
  git({ args: ['config', 'user.name', 'test'] });

  fs.writeFileSync(path.join(dir, 'staged.md'), input.content);
  git({ args: ['add', 'staged.md'] });

  if (!input.orphan) {
    fs.cpSync(skillDir, path.join(dir, SKILL_REL), { recursive: true });
  }

  // the SECOND layer. the whole skill was copied above, so the REAL
  // brain mechanism is already in place; these cases overwrite it with
  // a stub so the chain can be clamped without a network call.
  //
  // what is under test here is that the DISPATCHER routes each exit
  // code correctly and that the hook reports it — never the brains'
  // judgment, which is neither fast nor repeatable.
  //
  // .mock = the brain mechanism (pii.scan.via.brain.sh), swapped for a stub
  // .why  = a brain call bills the api, is slow, and answers differently
  //         each run; ci runs this suite on every push
  // .real = this hook at every commit, on the real brain; and
  //         pii.scan.via.brain.live.integration.test.ts under BRAIN_LIVE=true
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
 * .what = mask the temp dir path in a hook stdout
 * .why  = a snapshot must go red for a change in what the hook SAYS,
 *         never for the throwaway repo's path
 */
const asStdoutStable = (stdout: string): string =>
  stdout.replace(
    new RegExp(
      os.tmpdir().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\s]*',
      'g',
    ),
    '<tmp>',
  );

/**
 * .what = the whole output a committer reads, stable across runs
 * .why  = a git commit splits the hook's words across stdout and stderr,
 *         and prints a branch and sha that change every run; the snapshot
 *         must go red only for a change in what the gate says
 */
/**
 * .what = the two streams of a run, each under its own label
 * .why  = a concat would put stderr after stdout and misstate the order a
 *         terminal shows; labeled, each stream claims only its own bytes
 */
const asStreamsLabeled = (run: { stdout: string; stderr: string }): string =>
  [
    `── stdout ──\n${run.stdout.replace(/\n+$/, '\n')}`,
    ...(run.stderr ? [`── stderr ──\n${run.stderr.replace(/\n+$/, '\n')}`] : []),
  ].join('\n');

const asRunStable = (run: { stdout: string; stderr: string }): string =>
  asStdoutStable(asStreamsLabeled(run))
    .replace(/\[[^\]\s]+ (\(root-commit\) )?[0-9a-f]{7,40}\]/g, '[<branch> <sha>]')
    .replace(/\/tmp\/[^\n]*?(?=\/|\s|$)/g, '<tmp>');

/**
 * .what = the streams and exit code of a spawn that ran
 * .why  = exit 1 is the malfunction verdict these cases assert on, so a
 *         spawn that never ran (no binary, a signal kill) must throw,
 *         never default to 1 and read as a verdict
 */
const asRunOutcome = (input: {
  res: ReturnType<typeof spawnSync>;
  label: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  // a run that produced no exit status produced no verdict
  if (input.res.error || input.res.status === null)
    throw new UnexpectedCodePathError(`${input.label} produced no exit status`, {
      error: input.res.error?.message ?? null,
      signal: input.res.signal,
    });
  return {
    stdout: String(input.res.stdout),
    stderr: String(input.res.stderr),
    exitCode: input.res.status,
  };
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
  /** merged over process.env — see [case10], [case11] */
  env?: Record<string, string>;
}): { stdout: string; stderr: string; exitCode: number } => {
  const res = spawnSync('bash', [input.hook], {
    encoding: UTF8,
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...input.env },
  });
  return asRunOutcome({ res, label: 'the hook' });
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
          '✋ ConstraintError: the PII scan blocked the commit',
        );
        expect(result.stdout).toContain(
          'commit blocked: the staged set carries PII',
        );
        // the header alone also fronts a refused input; only a hit prints its detector
        expect(result.stdout).toContain('hold up — that carries PII');
        expect(result.stdout).toContain('ssn 1');
      });

      then('the stdout of the PII block matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asRunStable(result)).toMatchSnapshot();
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

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
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

      then('it exits 1, a malfunction, rather than pass silently', () => {
        expect(result.exitCode).toBe(1);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asRunStable(result)).toMatchSnapshot();
      });

      then('it reports a failed scan, not a PII hit', () => {
        // the distinction matters: to claim PII that was never detected
        // sends someone hunting a value that may not be there
        expect(result.stdout).toContain('could not run');
        expect(result.stdout).not.toContain('carries PII');
      });

      then('it names the fix: restore the scanner, or reinstall', () => {
        expect(result.stdout).toContain('restore it from git');
        expect(result.stdout).toContain('reinstall');
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
        return asRunOutcome({ res, label: 'git commit' });
      });

      then('git aborts the commit', () => {
        if (result.exitCode === 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asRunStable(result)).toMatchSnapshot();
      });

      then('the gate names PII as the reason', () => {
        // a chain that aborts for its OWN reason (a shell error, an
        // absent binary) also aborts the commit — and looks identical
        // from the exit code alone. so the verdict has to be present.
        const output = result.stdout + result.stderr;
        if (!output.includes('✋ ConstraintError: the PII scan blocked the commit')) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(output).toContain('✋ ConstraintError: the PII scan blocked the commit');
        expect(output).toContain('commit blocked: the staged set carries PII');
        // the header alone also fronts a refused input; only a hit prints its detector
        expect(output).toContain('hold up — that carries PII');
        expect(output).toContain('ssn 1');
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
        return asRunOutcome({ res, label: 'git commit' });
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

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
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

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asRunStable(result)).toMatchSnapshot();
      });

      then('the BRAIN mechanism is what produced the block', () => {
        // ⚠️ assert the mechanism, not merely the exit code. exit 2
        // from the regex pass and exit 2 from the brain pass look
        // identical at the hook, and only one of them proves the
        // second layer ran at all. the stub's own marker is the proof.
        expect(result.stdout).toContain('stub reviewer: exit 2');
      });

      then('the hook states its own verdict for a brain hit', () => {
        expect(result.stdout).toContain(
          'commit blocked: the staged set carries PII',
        );
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

      then('it reports a malfunction, not a PII hit', () => {
        expect(result.stdout).toContain('the PII scan could not run');
        expect(result.stdout).toContain('this is a malfunction, not a PII hit');
        expect(result.stdout).not.toContain('carries PII');
      });

      then('it defers to the cause the scan named, and names the escape', () => {
        expect(result.stdout).toContain('the scan output above names the cause');
        expect(result.stdout).toContain('git commit --no-verify');
      });

      then('⭐ it still names a fix when the scan named none', () => {
        // this stub dies with `stub reviewer: exit 1` and no cause, as a
        // scan that crashed mid-run would. the fallback is conditional,
        // so it never contradicts a cause the skill did name
        expect(result.stdout).toContain('stub reviewer: exit 1');
        expect(result.stdout).toContain('if it names none');
        expect(result.stdout).toContain('rhx keyrack unlock --owner ehmpath --env prep');
      });

      then('the stdout of the malfunction block matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asRunStable(result)).toMatchSnapshot();
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

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asRunStable(result)).toMatchSnapshot();
      });

      then('it says WHICH mechanism went absent', () => {
        // "could not run" alone sends a human to check keyrack when
        // the real cause is a file that is not on disk
        expect(result.stdout).toContain('the brain mechanism was not found');
      });
    });
  });

  /**
   * .what = the local allowlist merge reads each file it finds, or blocks
   *
   * ⚠️ a partial allowlist is a quiet degrade: a public value the missed
   *    file mutes reads as a PII hit, and the exit-2 message then sends a
   *    human to allow a value already allowed. a read that fails is a
   *    malfunction, named with the file at fault.
   */
  given('[case9] a local allowlist beside the tracked one', () => {
    when('[t0] the local allowlist cannot be read', () => {
      const repo = useBeforeAll(async () => {
        const made = genTempRepo({ content: 'just prose, and a year 2026' });
        const local = path.join(made.dir, '.pii-allow.local');
        fs.writeFileSync(local, 'public-value\n');
        fs.chmodSync(local, 0o000);
        return made;
      });

      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('the fixture is unreadable to this process, as the case needs', () => {
        // root ignores mode bits; on a root run the fixture reads fine and
        // the case cannot hold, so it fails here with that cause named
        const local = path.join(repo.dir, '.pii-allow.local');
        const readable =
          spawnSync('sh', ['-c', 'test -r "$1"', 'sh', local]).status === 0;
        if (readable) console.log('PROOF: uid', process.getuid?.() ?? null);
        expect(readable).toBe(false);
      });

      then('⭐ it blocks at exit 1, a malfunction, not a PII hit', () => {
        expect(result.exitCode).toBe(1);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asRunStable(result)).toMatchSnapshot();
      });

      then('⭐ it names the file it could not read', () => {
        expect(result.stdout).toContain('the allowlist could not be read');
        expect(result.stdout).toContain('💥 MalfunctionError: the PII scan could not run');
        expect(result.stdout).toContain('.pii-allow.local');
      });
    });

    when('[t1] the tracked allowlist is absent, the local one is readable', () => {
      const repo = useBeforeAll(async () => {
        const made = genTempRepo({ content: 'just prose, and a year 2026' });
        fs.writeFileSync(
          path.join(made.dir, '.pii-allow.local'),
          'public-value\n',
        );
        return made;
      });

      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('it passes at exit 0 on the local allowlist alone', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = a temp dir whose path holds a space
   *
   * ⚠️ the merged allowlist lives under TMPDIR. spliced into the scanner
   *    argv unquoted, a space splits its path in two, the scanner refuses
   *    the stray half at exit 2, and the hook reports a PII hit that was
   *    never found.
   */
  given('[case10] a TMPDIR whose path holds a space', () => {
    const repo = useBeforeAll(async () => {
      const made = genTempRepo({ content: 'just prose, and a year 2026' });
      fs.writeFileSync(
        path.join(made.dir, '.pii-allow.local'),
        'public-value\n',
      );
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pii tmp '));
      return { ...made, tmp };
    });

    when('[t0] a local allowlist is merged for a clean staged set', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook, env: { TMPDIR: repo.tmp } }),
      );

      then('⭐ it passes at exit 0 — the path stays one argument', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain('ConstraintError');
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = a hook run where git cannot name a repo top
   *
   * ⚠️ a fallback to the cwd would look for the scanner in the wrong
   *    place and blame an absent scanner for a git failure.
   */
  given('[case11] a cwd outside any git repo', () => {
    const dir = useBeforeAll(async () => ({
      path: fs.mkdtempSync(path.join(os.tmpdir(), 'check-pii-norepo-')),
    }));

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({
          cwd: dir.path,
          hook: hookPath,
          env: { GIT_CEILING_DIRECTORIES: path.dirname(dir.path) },
        }),
      );

      then('⭐ it blocks at exit 1 and names git as the cause', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          '💥 MalfunctionError: the PII scan could not run',
        );
        expect(result.stdout).toContain('git could not name the repo top');
        expect(result.stdout).not.toContain('scanner was not found');
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });
  });
  /**
   * .what = husky's re-run of the pre-commit chain
   *
   * ⚠️ `husky.sh` re-execs `pre-commit`, which sources this hook again.
   *    two passes over one staged set must ask the reviewer once; a set
   *    that changed between passes must be asked again; and the caller's
   *    argv, which husky re-execs with, must survive the hook.
   */
  given("[case12] the hook sourced inside a caller's chain", () => {
    // a brain stub that counts its calls and answers clean
    const genCountedRepo = (): { dir: string; countAt: string } => {
      const made = genTempRepo({ content: 'just prose, and a year 2026' });
      const countAt = path.join(made.dir, '.brain-calls');
      fs.writeFileSync(
        path.join(made.dir, BRAIN_REL),
        `#!/usr/bin/env bash\necho x >> '${countAt}'\nexit 0\n`,
      );
      return { dir: made.dir, countAt };
    };
    const readCount = (countAt: string): number =>
      fs.existsSync(countAt)
        ? fs.readFileSync(countAt, UTF8).trim().split('\n').length
        : 0;
    const runChain = (input: { cwd: string; script: string; args: string[] }) =>
      asRunOutcome({
        res: spawnSync('sh', ['-c', input.script, 'sh', hookPath, ...input.args], {
          encoding: UTF8,
          cwd: input.cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
        label: 'the chain',
      });

    when('[t0] the staged set is unchanged between passes', () => {
      const repo = useBeforeAll(async () => genCountedRepo());
      const result = useBeforeAll(async () =>
        runChain({ cwd: repo.dir, script: '. "$1"; . "$1"', args: [] }),
      );

      then('⭐ it passes, and asks the reviewer once', () => {
        expect(result.exitCode).toBe(0);
        expect(readCount(repo.countAt)).toBe(1);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });

    when('[t1] the staged set changes between passes', () => {
      const repo = useBeforeAll(async () => genCountedRepo());
      const result = useBeforeAll(async () =>
        runChain({
          cwd: repo.dir,
          script:
            '. "$1"; echo more >> staged.md; git add staged.md; . "$1"',
          args: [],
        }),
      );

      then('⭐ it scans the changed set again', () => {
        expect(result.exitCode).toBe(0);
        expect(readCount(repo.countAt)).toBe(2);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });

    when('[t2] the caller holds args of its own', () => {
      const repo = useBeforeAll(async () => genCountedRepo());
      const result = useBeforeAll(async () =>
        runChain({
          cwd: repo.dir,
          script: 'h="$1"; shift; . "$h"; echo "args=$#:$*"',
          args: ['one', 'two'],
        }),
      );

      then('⭐ the caller args survive the hook', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('args=2:one two');
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });

    when('[t3] a clean-tree mark set by hand names some other tree', () => {
      const repo = useBeforeAll(async () => genCountedRepo());
      const result = useBeforeAll(async () =>
        runChain({
          cwd: repo.dir,
          script:
            'export PII_SCAN_CLEAN_TREE=0000000000000000000000000000000000000000; . "$1"',
          args: [],
        }),
      );

      then('⭐ it scans — only the staged tree itself skips a pass', () => {
        expect(result.exitCode).toBe(0);
        expect(readCount(repo.countAt)).toBe(1);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });

  });
  /**
   * .what = a staged rename that also edits the file
   *
   * ⛔ git reports a moved-and-edited file as `R`. a file list filtered
   *    to `ACM` drops it, so its new content was never scanned — a fail
   *    open on exactly the commit that moves a file and adds a value.
   */
  given('[case13] a staged rename whose edit adds an SSN', () => {
    const repo = useBeforeAll(async () => {
      // long enough that the edit keeps git's rename similarity above 50%
      const prose = Array.from(
        { length: 40 },
        (_, i) => `line ${i} of plain prose, no values`,
      ).join('\n');
      const made = genTempRepo({ content: prose });
      // a fixture step that git refused fails here, named, not as a later rename assert
      const git = (args: string[]) => {
        const outcome = asRunOutcome({
          res: spawnSync('git', args, { cwd: made.dir, encoding: UTF8 }),
          label: `git ${args[0]}`,
        });
        if (outcome.exitCode !== 0)
          throw new UnexpectedCodePathError(`git ${args[0]} failed in the fixture`, {
            args,
            exitCode: outcome.exitCode,
            stderr: outcome.stderr,
          });
        return outcome;
      };
      git(['-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'seed']);
      git(['mv', 'staged.md', 'moved.md']);
      fs.appendFileSync(
        path.join(made.dir, 'moved.md'),
        `\nresponsible party id ${SSN_BARE} on file\n`,
      );
      git(['add', 'moved.md']);
      const status = git(['diff', '--cached', '--name-status']).stdout;
      return { ...made, status };
    });

    when('[t0] the hook runs', () => {
      const result = useBeforeAll(async () =>
        runHook({ cwd: repo.dir, hook: repo.hook }),
      );

      then('the fixture is a rename, as git reports it', () => {
        expect(repo.status).toMatch(/^R\d+\tstaged\.md\tmoved\.md/m);
      });

      then('⭐ it blocks at exit 2 — the renamed content is scanned', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(
          '✋ ConstraintError: the PII scan blocked the commit',
        );
        expect(result.stdout).not.toContain(SSN_BARE);
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });
  });
  /**
   * .what = the commit this wish exists for, through every layer below
   *         git: the hook, the dispatcher, the regex pass, then the real
   *         brain skill, with only `rhx review` shimmed
   * .why  = every layer between `git commit` and the json read is real
   *         here; the skill-level cases call the brain skill alone
   */
  given('[case14] the route file at blocker/5.briefs.short.md, through every layer', () => {
    const repo = useBeforeAll(async () => {
      const made = genTempRepo({
        content: 'just prose, and a year 2026',
        reviewer: 'real',
      });
      const rel = '.route/v2026_10_23.pr41-green/blocker/5.briefs.short.md';
      fs.mkdirSync(path.join(made.dir, path.dirname(rel)), { recursive: true });
      fs.writeFileSync(path.join(made.dir, rel), 'brief notes, no values\n');
      const added = spawnSync('git', ['add', rel], {
        cwd: made.dir,
        encoding: UTF8,
      });
      if (added.status !== 0)
        throw new UnexpectedCodePathError('the route file could not be staged', {
          rel,
          status: added.status,
          stderr: added.stderr,
        });

      // a fake `rhx review`: drops route paperwork unless --polluters
      // keep, as the real one does; echoes the staged paths ahead of
      // its summary; writes a clean verdict json in its own log dir
      const bin = path.join(made.dir, '.fakebin');
      fs.mkdirSync(bin, { recursive: true });
      fs.writeFileSync(
        path.join(bin, 'rhx'),
        [
          '#!/usr/bin/env bash',
          'keep=""; prev=""; out=""',
          'for a in "$@"; do',
          '  if [[ "$prev" == "--polluters" && "$a" == "keep" ]]; then keep=1; fi',
          '  if [[ "$prev" == "--output" ]]; then out="$a"; fi',
          '  prev="$a"',
          'done',
          `if [[ -z "$keep" ]] && ! git diff --cached --name-only | grep -qvE '^(\\.route|\\.behavior|\\.dream)/'; then`,
          '  echo "✋ ConstraintError: combined scope resolves to zero files"; exit 2',
          'fi',
          'logdir=".log/bhrain/review/fake"; mkdir -p "$logdir"',
          `echo '{"done":true,"blockers":[],"nitpicks":[]}' > "$logdir/output.response.json"`,
          'if [[ -n "$out" ]]; then mkdir -p "$(dirname "$out")"; echo "no hits" > "$out"; fi',
          'echo "🔍 review"',
          'git diff --cached --name-only | sed "s/^/   ├─ staged: /"',
          'echo "   ├─ logs: $logdir"',
          'echo "   ├─ review: $out"',
          'echo "   └─ summary"',
          'echo "      ├─ 0 blockers"',
          'echo "      └─ 0 nitpicks"',
        ].join('\n'),
      );
      fs.chmodSync(path.join(bin, 'rhx'), '755');
      return { ...made, bin };
    });

    when('[t0] the hook runs over the staged route file', () => {
      const result = useBeforeAll(async () =>
        runHook({
          cwd: repo.dir,
          hook: repo.hook,
          env: { PATH: `${repo.bin}:${process.env.PATH ?? ''}` },
        }),
      );

      then('⭐ it passes at exit 0', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the route file is reviewed, and its path is not read as a verdict', () => {
        expect(result.stdout).toContain('clear skies');
        expect(result.stdout).not.toContain('MalfunctionError');
      });

      then('the output a committer reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asRunStable(result)).toMatchSnapshot();
      });
    });
  });
});
