import { spawnSync } from 'child_process';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = the CI backstop: scan THIS repo's branch changes for PII
 * .why  = the pre-commit hook is the guard, but it is bypassable
 *         (`--no-verify`, or a fresh clone with no `npm install`). this
 *         test is the net under it.
 *
 * .note = this is deliberately a BACKSTOP, not the primary gate. by the
 *         time it fails, the value already sits in a commit object — so
 *         a failure here means "rewrite history", not "edit a file".
 *         the pre-commit hook is what keeps you out of that state.
 *
 * .note = `--via regex`, deliberately. CI wants a check that is free,
 *         offline, and gives the same answer every run — and the brain
 *         pass is none of the three. it also needs credentials CI does
 *         not hold.
 *
 *         that is not a downgrade of the gate: the brain layer runs at
 *         the pre-commit boundary, where a catch is still cheap to fix.
 *         here it would only tell you to start the notice, and it would
 *         do so non-deterministically.
 */

const scriptPath = path.join(__dirname, 'pii.scan.sh');
const repoRoot = path.join(__dirname, '..', '..', '..', '..', '..');

const UTF8 = 'utf-8' as const;

describe('pii.scan against this repo', () => {
  given('[case1] the changes on this branch', () => {
    when('[t0] scanned against the trunk', () => {
      const result = useBeforeAll(async () => {
        const res = spawnSync(
          'bash',
          [scriptPath, '--diffs', 'since-main', '--via', 'regex'],
          { encoding: UTF8, cwd: repoRoot, stdio: ['pipe', 'pipe', 'pipe'] },
        );
        return {
          stdout: res.stdout ?? '',
          stderr: res.stderr ?? '',
          exitCode: res.status ?? 1,
        };
      });

      then('no PII reaches the branch', () => {
        // the report masks every value, so this output is safe to print
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });
    });
  });
});
