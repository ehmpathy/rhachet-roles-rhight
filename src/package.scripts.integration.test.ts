import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { given, then, when } from 'test-fns';

/**
 * .what = the env guards inside the package.json test scripts
 * .why  = an unquoted `[ -n $RESNAP ]` collapses to `[ -n ]` when RESNAP is
 *         unset, which is TRUE. so every run passed `--updateSnapshot`, and a
 *         drifted snapshot was rewritten instead of failed, in CI too.
 *         this suite evaluates each guard the way the shell does
 */
const repoDir = path.join(__dirname, '..');

const scripts: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(repoDir, 'package.json'), 'utf-8'),
).scripts;

/**
 * .what = the `$([ ... ] && echo '...')` guards of every script that names a var
 */
const getAllGuards = (input: {
  scripts: Record<string, string>;
  variable: string;
}): { script: string; guard: string }[] =>
  Object.entries(input.scripts).flatMap(([script, body]) =>
    (body.match(/\$\(\[[^\]]*\][^)]*\)/g) ?? [])
      .filter((guard) => guard.includes(`$${input.variable}`))
      .map((guard) => ({ script, guard })),
  );

/**
 * .what = expand one guard in bash, with the var set to a value or removed
 */
const asGuardExpansion = (input: {
  guard: string;
  variable: string;
  value: string | null;
}): string => {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env[input.variable];
  if (input.value !== null) env[input.variable] = input.value;
  // the guard is spliced in as the shell meets it in a script: unquoted
  const result = spawnSync('bash', ['-c', `printf '%s' ${input.guard}`], {
    encoding: 'utf-8',
    env,
  });
  if (result.status !== 0)
    throw new Error(`guard did not expand: ${input.guard}: ${result.stderr}`);
  return result.stdout;
};

describe('package.json test scripts', () => {
  given('[case1] the RESNAP guards', () => {
    const guards = getAllGuards({ scripts, variable: 'RESNAP' });

    // the positive control: an absence below is worthless if no guard was found
    then('every snapshot-capable test script carries one', () => {
      expect(guards.map((g) => g.script).sort()).toEqual(
        [
          'test:acceptance',
          'test:acceptance:locally',
          'test:integration',
          'test:unit',
        ].sort(),
      );
    });

    when('[t0] RESNAP is unset', () => {
      then('⭐ no script passes --updateSnapshot', () => {
        const expanded = guards.map((g) => ({
          ...g,
          out: asGuardExpansion({ ...g, variable: 'RESNAP', value: null }),
        }));
        expect(
          expanded.filter((g) => g.out.includes('--updateSnapshot')),
        ).toEqual([]);
      });
    });

    when('[t1] RESNAP is set', () => {
      then('every script passes --updateSnapshot', () => {
        for (const g of guards)
          expect(
            asGuardExpansion({ ...g, variable: 'RESNAP', value: 'true' }),
          ).toEqual('--updateSnapshot');
      });
    });
  });

  given('[case2] the THOROUGH guards', () => {
    const guards = getAllGuards({ scripts, variable: 'THOROUGH' });

    then('the unit and integration scripts carry one', () => {
      expect(guards.map((g) => g.script)).toEqual(
        expect.arrayContaining(['test:unit', 'test:integration']),
      );
    });

    when('[t0] THOROUGH is unset', () => {
      then('each run is scoped to the files changed since main', () => {
        for (const g of guards)
          expect(
            asGuardExpansion({ ...g, variable: 'THOROUGH', value: null }),
          ).toEqual('--changedSince=main');
      });
    });

    when('[t1] THOROUGH is set', () => {
      then('each run is the full suite', () => {
        for (const g of guards)
          expect(
            asGuardExpansion({ ...g, variable: 'THOROUGH', value: 'true' }),
          ).toEqual('');
      });
    });
  });
});
