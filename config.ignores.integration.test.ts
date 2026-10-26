import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = clamp: a gitignored dir can never turn a local suite red
 * .why = `.temp/` (scratch, genTempDir clones) and `.agent/.actors/` (per-actor
 *        brain caches) hold local state that CI never sees. a test file or an
 *        import there once failed a local integration run and a local lint run
 *        while CI held green. the exclusions in jest.*.config.ts and
 *        .depcheckrc.yml are the cure; this clamp goes red if either is dropped
 * .note = each half carries a positive control, so a tool that lists or flags
 *         naught cannot pass the clamp vacuously
 */
const ROOT = __dirname;

describe('config.ignores', () => {
  given('[case1] a test file under the gitignored .temp dir', () => {
    when('[t0] jest lists the integration suite', () => {
      const scene = useBeforeAll(async () => {
        const dir = fs.mkdtempSync(path.join(ROOT, '.temp', 'clamp.ignores.'));
        const stray = path.join(dir, 'stray.integration.test.ts');
        fs.writeFileSync(stray, "test('stray', () => { throw new Error('stray'); });\n");
        const listed = spawnSync(
          'npx',
          ['jest', '-c', './jest.integration.config.ts', '--listTests'],
          { cwd: ROOT, encoding: 'utf-8', timeout: 120000 },
        );
        fs.rmSync(dir, { recursive: true, force: true });
        return { stray, stdout: listed.stdout ?? '', status: listed.status };
      });

      then('jest lists tests at all (control: this clamp is listed)', () => {
        expect(scene.status).toBe(0);
        expect(scene.stdout).toContain('config.ignores.integration.test.ts');
      });

      then('the stray test under .temp is not listed', () => {
        expect(scene.stdout).not.toContain(scene.stray);
        expect(scene.stdout).not.toContain('stray.integration.test.ts');
      });
    });
  });

  given('[case2] unknown imports under .temp and .agent/.actors', () => {
    when('[t0] depcheck runs with the repo .depcheckrc.yml', () => {
      const scene = useBeforeAll(async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clamp.depcheck.'));
        fs.writeFileSync(
          path.join(dir, 'package.json'),
          JSON.stringify({ name: 'clamp', version: '0.0.0' }),
        );
        fs.copyFileSync(
          path.join(ROOT, '.depcheckrc.yml'),
          path.join(dir, '.depcheckrc.yml'),
        );
        const plant = (rel: string, pkg: string): void => {
          fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
          fs.writeFileSync(path.join(dir, rel), `import '${pkg}';\n`);
        };
        plant('src/control.ts', 'clamp-control-pkg');
        plant('.temp/x/stray.ts', 'clamp-temp-pkg');
        plant('.agent/.actors/x/stray.ts', 'clamp-actors-pkg');
        const checked = spawnSync(
          'npx',
          ['depcheck', dir, '-c', path.join(dir, '.depcheckrc.yml')],
          { cwd: ROOT, encoding: 'utf-8', timeout: 120000 },
        );
        fs.rmSync(dir, { recursive: true, force: true });
        return { stdout: checked.stdout ?? '' };
      });

      then('depcheck flags an unknown import (control: src/)', () => {
        expect(scene.stdout).toContain('clamp-control-pkg');
      });

      then('the imports under .temp and .agent/.actors are ignored', () => {
        expect(scene.stdout).not.toContain('clamp-temp-pkg');
        expect(scene.stdout).not.toContain('clamp-actors-pkg');
      });
    });
  });
});
