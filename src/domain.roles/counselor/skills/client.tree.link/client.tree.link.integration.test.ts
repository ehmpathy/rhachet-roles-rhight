import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for client.tree.link
 * .why  = the skill is the guard between a client fact and a public repo.
 *         each refusal below is a path by which a client fact would ship,
 *         so each one gets a case that must refuse AND leave no link behind
 *
 * hermetic: the host repo, the route, and the client tree are all temp git
 * repos built here. no real client repo is read
 */
const scriptPath = path.join(__dirname, 'client.tree.link.sh');
const UTF8 = 'utf-8' as const;

const git = (input: { cwd: string; args: string[] }): void => {
  const res = spawnSync('git', input.args, { cwd: input.cwd, encoding: UTF8 });
  if (res.status !== 0)
    throw new Error(`git ${input.args.join(' ')} failed: ${res.stderr}`);
};

/**
 * .what = a host repo (with a route dir) and a client tree (with an origin)
 */
const genScene = (input: {
  slug: string;
  ignoreClient: boolean;
  origin: string | null;
}): { host: string; route: string; tree: string } => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `ctl-${input.slug}-`));

  const host = path.join(root, 'host');
  fs.mkdirSync(host, { recursive: true });
  git({ cwd: host, args: ['init', '--quiet'] });
  if (input.ignoreClient)
    fs.writeFileSync(path.join(host, '.gitignore'), '.client\n');
  const route = path.join(host, '.route', 'v2026_01_01.demo');
  fs.mkdirSync(route, { recursive: true });

  const tree = path.join(root, 'client', 'tree');
  fs.mkdirSync(tree, { recursive: true });
  git({ cwd: tree, args: ['init', '--quiet'] });
  if (input.origin)
    git({ cwd: tree, args: ['remote', 'add', 'origin', input.origin] });
  fs.writeFileSync(path.join(tree, 'roadmap.md'), '# the client record\n');

  return { host, route, tree };
};

/**
 * .what = a fake `gh` first on PATH, which answers one visibility
 *
 * .mock = gh repo view (the visibility read)
 * .why  = a real read needs a real private repo plus network and a login;
 *         the subject here is the skill's verdict on the answer, not gh
 * .real = the skill's live use, which reads gh as shipped
 */
const genFakeGh = (input: {
  dir: string;
  visibility: string | null;
}): { bin: string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });
  const body =
    input.visibility === null
      ? '#!/usr/bin/env bash\necho "gh: could not resolve to a Repository" >&2\nexit 1\n'
      : `#!/usr/bin/env bash\necho "${input.visibility}"\n`;
  fs.writeFileSync(path.join(bin, 'gh'), body, { mode: 0o755 });
  return { bin };
};

const runSkill = (input: {
  args: string[];
  cwd: string;
  binFirst?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    cwd: input.cwd,
    env: {
      ...process.env,
      ...(input.binFirst
        ? { PATH: `${input.binFirst}:${process.env.PATH ?? ''}` }
        : {}),
    },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

const ORIGIN = 'git@github.com:acme/rhachet-briefs-acme.git';

describe('client.tree.link', () => {
  given('[case1] the skill invoked for help', () => {
    then('it states its usage and exits 0', () => {
      const result = runSkill({ args: ['--help'], cwd: os.tmpdir() });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('usage:');
      expect(result.stdout).toContain('never creates a tree');
    });
  });

  given('[case10] the skill as rhx invokes it', () => {
    then(
      '⭐ the entrypoint is executable, so `rhx client.tree.link` can run it',
      () => {
        // rhx execs the file directly; these tests call `bash <file>`, which hides a lost +x
        expect(fs.statSync(scriptPath).mode & 0o111).not.toBe(0);
      },
    );
  });

  given('[case2] an org that is not one path segment', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'org', ignoreClient: true, origin: ORIGIN }),
    );
    then('it refuses at exit 2', () => {
      const result = runSkill({
        args: [
          '--org',
          '../escape',
          '--route',
          scene.route,
          '--tree',
          scene.tree,
        ],
        cwd: scene.host,
      });
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('✋ ConstraintError');
      expect(fs.existsSync(path.join(scene.route, '.client'))).toBe(false);
    });
  });

  given('[case3] no tree given', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'notree', ignoreClient: true, origin: ORIGIN }),
    );
    when('[t0] the skill runs', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--org',
            'acme',
            '--route',
            scene.route,
            '--repo',
            '/nonexistent/repo',
          ],
          cwd: scene.host,
        }),
      );
      then('⭐ it asks the director, and creates no tree and no link', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('never creates one');
        expect(result.stderr).toContain('ask the director');
        expect(result.stderr).toContain('worktree add');
        expect(fs.existsSync(path.join(scene.route, '.client'))).toBe(false);
      });
      then('it says the repo was not found, and to ask the human', () => {
        expect(result.stderr).toContain('ask the human');
      });
    });
  });

  given('[case4] a tree that is not a git work tree', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'nogit', ignoreClient: true, origin: ORIGIN }),
    );
    then('it refuses at exit 2', () => {
      const plain = fs.mkdtempSync(path.join(os.tmpdir(), 'ctl-plain-'));
      const result = runSkill({
        args: ['--org', 'acme', '--route', scene.route, '--tree', plain],
        cwd: scene.host,
      });
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('not a git work tree');
    });
  });

  given('[case5] a tree whose repo is PUBLIC', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'public', ignoreClient: true, origin: ORIGIN }),
    );
    const gh = useBeforeAll(async () =>
      genFakeGh({ dir: scene.host, visibility: 'PUBLIC' }),
    );
    then('⭐ it refuses at exit 2, and makes no link', () => {
      const result = runSkill({
        args: [
          '--org',
          'acme',
          '--route',
          scene.route,
          '--tree',
          scene.tree,
          '--mode',
          'apply',
        ],
        cwd: scene.host,
        binFirst: gh.bin,
      });
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('not PRIVATE');
      expect(fs.existsSync(path.join(scene.route, '.client', 'acme'))).toBe(
        false,
      );
    });
  });

  given('[case6] a host repo that does not gitignore .client', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'noignore', ignoreClient: false, origin: ORIGIN }),
    );
    const gh = useBeforeAll(async () =>
      genFakeGh({ dir: scene.host, visibility: 'PRIVATE' }),
    );
    then('⭐ it refuses at exit 2, so the link can never be tracked', () => {
      const result = runSkill({
        args: [
          '--org',
          'acme',
          '--route',
          scene.route,
          '--tree',
          scene.tree,
          '--mode',
          'apply',
        ],
        cwd: scene.host,
        binFirst: gh.bin,
      });
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('does not gitignore');
      expect(fs.existsSync(path.join(scene.route, '.client', 'acme'))).toBe(
        false,
      );
    });
  });

  given('[case7] a private tree, a gitignored route', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'happy', ignoreClient: true, origin: ORIGIN }),
    );
    const gh = useBeforeAll(async () =>
      genFakeGh({ dir: scene.host, visibility: 'PRIVATE' }),
    );
    const linkAt = (): string => path.join(scene.route, '.client', 'acme');
    const args = (mode: string): string[] => [
      '--org',
      'acme',
      '--route',
      scene.route,
      '--tree',
      scene.tree,
      '--mode',
      mode,
    ];

    when('[t0] planned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: args('plan'), cwd: scene.host, binFirst: gh.bin }),
      );
      then('it shows the link and makes none', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('acme/rhachet-briefs-acme (PRIVATE)');
        expect(result.stdout).toContain('no link made');
        expect(fs.existsSync(linkAt())).toBe(false);
      });
    });

    when('[t1] applied', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: args('apply'), cwd: scene.host, binFirst: gh.bin }),
      );
      then('it links the route to the tree, by a relative path', () => {
        expect(result.exitCode).toBe(0);
        expect(fs.lstatSync(linkAt()).isSymbolicLink()).toBe(true);
        expect(path.isAbsolute(fs.readlinkSync(linkAt()))).toBe(false);
        expect(fs.realpathSync(linkAt())).toBe(fs.realpathSync(scene.tree));
      });
      then('the client record reads through the link', () => {
        expect(
          fs.readFileSync(path.join(linkAt(), 'roadmap.md'), UTF8),
        ).toContain('the client record');
      });
      then('⭐ the host repo sees no file to track', () => {
        const status = spawnSync(
          'git',
          ['status', '--porcelain', '--untracked-files=all'],
          {
            cwd: scene.host,
            encoding: UTF8,
          },
        );
        expect(status.stdout).not.toContain('.client');
      });
    });

    when('[t2] applied again', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: args('apply'), cwd: scene.host, binFirst: gh.bin }),
      );
      then('it is a no-op that says so', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('already linked');
      });
    });

    when('[t3] our route dir is removed with rm -rf', () => {
      useBeforeAll(async () => {
        fs.rmSync(scene.route, { recursive: true, force: true });
        return {};
      });
      then('⭐ the client record survives in the client tree', () => {
        expect(fs.existsSync(scene.route)).toBe(false);
        expect(
          fs.readFileSync(path.join(scene.tree, 'roadmap.md'), UTF8),
        ).toContain('the client record');
      });
    });
  });

  given('[case8] a link already there, to another tree', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'elsewhere', ignoreClient: true, origin: ORIGIN }),
    );
    const gh = useBeforeAll(async () =>
      genFakeGh({ dir: scene.host, visibility: 'PRIVATE' }),
    );
    then('it refuses at exit 2, and leaves the old link as found', () => {
      const other = fs.mkdtempSync(path.join(os.tmpdir(), 'ctl-other-'));
      fs.mkdirSync(path.join(scene.route, '.client'), { recursive: true });
      fs.symlinkSync(other, path.join(scene.route, '.client', 'acme'));
      const result = runSkill({
        args: [
          '--org',
          'acme',
          '--route',
          scene.route,
          '--tree',
          scene.tree,
          '--mode',
          'apply',
        ],
        cwd: scene.host,
        binFirst: gh.bin,
      });
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('already links elsewhere');
      expect(fs.readlinkSync(path.join(scene.route, '.client', 'acme'))).toBe(
        other,
      );
    });
  });

  given('[case9] a visibility read that fails', () => {
    const scene = useBeforeAll(async () =>
      genScene({ slug: 'ghfail', ignoreClient: true, origin: ORIGIN }),
    );
    const gh = useBeforeAll(async () =>
      genFakeGh({ dir: scene.host, visibility: null }),
    );
    then('it is a malfunction at exit 1, never a pass', () => {
      const result = runSkill({
        args: [
          '--org',
          'acme',
          '--route',
          scene.route,
          '--tree',
          scene.tree,
          '--mode',
          'apply',
        ],
        cwd: scene.host,
        binFirst: gh.bin,
      });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('💥 MalfunctionError');
      expect(fs.existsSync(path.join(scene.route, '.client', 'acme'))).toBe(
        false,
      );
    });
  });
});
