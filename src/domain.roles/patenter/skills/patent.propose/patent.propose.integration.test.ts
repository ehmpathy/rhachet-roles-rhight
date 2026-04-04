import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, when } from 'test-fns';

describe('patent.propose.sh', () => {
  const scriptPath = path.join(__dirname, 'patent.propose.sh');

  const runPropose = (input: {
    proposeArgs: string[];
    tempDir: string;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.proposeArgs], {
      cwd: input.tempDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  given('[case1] new route creation', () => {
    when('[t0] patent.propose is called in a git repo', () => {
      then('route directory is created with all template files', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-new',
          git: true,
        });

        const result = runPropose({
          proposeArgs: [],
          tempDir,
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('patent.propose');

        // verify route directory created
        const routeDirs = fs.readdirSync(path.join(tempDir, '.route'));
        expect(routeDirs.length).toBe(1);
        expect(routeDirs[0]).toMatch(/^v\d{4}_\d{2}_\d{2}\.patent\.propose$/);

        // verify template files
        const routeDir = routeDirs[0];
        if (!routeDir) throw new Error('route directory not found');
        const routePath = path.join(tempDir, '.route', routeDir);
        const files = fs.readdirSync(routePath);
        expect(files).toContain('0.idea.md');
        expect(files).toContain('1.vision.stone');
        expect(files).toContain('3.1.research.prior-art.favorable.stone');
        expect(files).toContain('3.1.research.prior-art.adverse.stone');
        expect(files).toContain('3.2.distill.claims.prior-art.stone');
        expect(files).toContain('3.2.distill.claims.patentable.stone');
        expect(files).toContain('3.2.distill.strategy.officeactions.stone');
        expect(files).toContain('3.3.blueprint.patent.stone');
        expect(files).toContain('5.1.deliver.patent.latex.stone');

        expect(result.stdout).toMatchSnapshot();
      });

      then('branch is bound to route via symlink', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-bind',
          git: true,
        });

        // create a branch (no slashes to avoid nested paths)
        spawnSync('git', ['checkout', '-b', 'test-patent-branch'], {
          cwd: tempDir,
          encoding: 'utf-8',
        });

        const result = runPropose({
          proposeArgs: [],
          tempDir,
        });

        expect(result.exitCode).toBe(0);

        // verify bind symlink
        const bindPath = path.join(
          tempDir,
          '.branch',
          '.bind',
          'test-patent-branch',
        );
        expect(fs.existsSync(bindPath)).toBe(true);
        expect(fs.lstatSync(bindPath).isSymbolicLink()).toBe(true);

        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] route already exists', () => {
    when('[t0] patent.propose is called when route extant', () => {
      then('error is returned', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-extant',
          git: true,
        });

        // create first route
        runPropose({ proposeArgs: [], tempDir });

        // attempt second route
        const result = runPropose({
          proposeArgs: [],
          tempDir,
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('already');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] --open with invalid editor', () => {
    when('[t0] nonexistent editor is specified', () => {
      then('error is returned', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-editor',
          git: true,
        });

        const result = runPropose({
          proposeArgs: ['--open', 'nonexistent-editor-xyz'],
          tempDir,
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('editor not found');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] --help', () => {
    when('[t0] help is requested', () => {
      then('usage is shown', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-help',
          git: true,
        });

        const result = runPropose({
          proposeArgs: ['--help'],
          tempDir,
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case5] not in git repo', () => {
    when('[t0] patent.propose is called outside git repo', () => {
      then('error is returned', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-nogit',
          git: false,
        });

        const result = runPropose({
          proposeArgs: [],
          tempDir,
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('git repository');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });
});
