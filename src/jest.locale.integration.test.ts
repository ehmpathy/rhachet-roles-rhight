import { spawnSync } from 'child_process';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = the jest config pins the cicd locale for every spawned skill
 * .why  = a skill that formats numbers through the locale prints `85,165` on
 *         an en_US laptop and `85165` on the cicd runner. without the pin a
 *         local green said naught about cicd; observed on PR #41, where
 *         franchise.tax.delaware passed locally and failed 23 cases in cicd
 */
describe('jest locale pin', () => {
  given('[case1] a test run under the integration jest config', () => {
    when('[t0] a skill shell formats a number through the locale', () => {
      const result = useBeforeAll(async () =>
        spawnSync('bash', ['-c', 'awk \'BEGIN { printf "%\\047d", 85165 }\''], {
          encoding: 'utf-8',
        }),
      );

      then('the process runs in the cicd locale', () => {
        expect(process.env.LC_ALL).toEqual('C.UTF-8');
      });

      then('the shell prints what cicd prints: no thousands group', () => {
        expect(result.status).toEqual(0);
        expect(result.stdout).toEqual('85165');
      });
    });
  });
});
