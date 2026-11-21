import { spawnSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for publish.redteam.sh
 *
 * .why  = every check in this skill exists because a per-file scan
 *         passed over a leak that shipped anyway. so every case below is
 *         a PAIR: a fixture the check must catch, beside a control it
 *         must pass. a check tested only on its dirty fixture would pass
 *         just as well if it flagged every repo it was ever pointed at.
 *
 * .note = every "real" value here is invented. the roster names a
 *         company and a person that do not exist, so this file stays
 *         clean under its own red team.
 */

const scriptPath = path.join(__dirname, 'publish.redteam.sh');
const UTF8 = 'utf-8' as const;

/** the invented "real" values the red team hunts for */
const REAL_CORP = 'Zorblatt Industries';
const REAL_NAME = 'Quenby';
const REAL_DATE = '2019-03-04';
const ROSTER = [
  `${REAL_CORP}\tNorthwind Widgets`,
  `${REAL_NAME}\tPat`,
  `${REAL_DATE}\t2019-01-26`,
].join('\n');

const runSkill = (input: {
  args: string[];
  cwd: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    cwd: input.cwd,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

const git = (dir: string, args: string[]): void => {
  const res = spawnSync('git', args, { cwd: dir, encoding: UTF8 });
  if (res.status !== 0)
    throw new Error(`git ${args.join(' ')} failed: ${res.stderr}`);
};

/**
 * .what = a hermetic git repo with an ignored roster and a first commit
 * .why  = the skill derives its published set from git, and refuses a
 *         roster git could commit, so every case needs a real repo
 */
const genTempRepo = (input: {
  files: Record<string, string>;
  gitignore?: string;
  roster?: string;
}): { dir: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-redteam-'));
  git(dir, ['init', '--quiet']);
  git(dir, ['config', 'user.email', 'test@example.com']);
  git(dir, ['config', 'user.name', 'test']);
  fs.writeFileSync(
    path.join(dir, '.gitignore'),
    input.gitignore ?? '.pii-map\n.temp\n',
  );
  fs.writeFileSync(path.join(dir, '.pii-map'), input.roster ?? ROSTER);
  for (const [rel, body] of Object.entries(input.files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), body);
  }
  git(dir, ['add', '-A']);
  git(dir, ['commit', '--quiet', '-m', 'seed']);
  return { dir };
};

/** asserts no roster value leaked into a report, in any letter-case */
const expectNoRealValue = (text: string): void => {
  const low = text.toLowerCase();
  for (const v of [REAL_CORP, REAL_NAME, REAL_DATE])
    expect(low).not.toContain(v.toLowerCase());
};

describe('publish.redteam.sh', () => {
  given('[case1] --help', () => {
    when('[t0] help is requested', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--help'], cwd: os.tmpdir() }),
      );

      then('it succeeds and documents every flag', () => {
        expect(result.exitCode).toBe(0);
        for (const flag of [
          '--roster',
          '--demo',
          '--dist',
          '--history',
          '--emit-blind',
          '--evidence',
          '--entity',
          '--mode',
        ])
          expect(result.stdout).toContain(flag);
      });

      then('it names every layer, and that L3 is emit-only', () => {
        for (const layer of ['L1', 'L2', 'L3', 'L4'])
          expect(result.stdout).toContain(layer);
        expect(result.stdout).toContain('EMIT-ONLY');
      });

      then('it states the exit codes', () => {
        expect(result.stdout).toContain('0  clean');
        expect(result.stdout).toContain('1  malfunction');
        expect(result.stdout).toContain('2  findings');
      });
    });
  });

  given('[case2] a clean repo', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ files: { 'readme.md': 'a plain readme, with prose.\n' } }),
    );

    when('[t0] the red team runs', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 0, clear skies', () => {
        if (result.exitCode !== 0) console.log(result.stdout, result.stderr);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('clear skies');
      });

      then('every layer reported, with P0 and P1 at zero', () => {
        expect(result.stdout).toContain('L1 deterministic');
        expect(result.stdout).toContain('L2 publication surface');
        expect(result.stdout).toContain('P0 fix before release: 0');
        expect(result.stdout).toContain('P1 owner decision: 0');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] a leak staged, then fixed only in the worktree', () => {
    const repo = useBeforeAll(async () => {
      const scene = genTempRepo({ files: { 'notes.md': 'clean notes\n' } });
      fs.writeFileSync(
        path.join(scene.dir, 'notes.md'),
        `met with ${REAL_CORP} today\n`,
      );
      git(scene.dir, ['add', 'notes.md']);
      fs.writeFileSync(
        path.join(scene.dir, 'notes.md'),
        'met with a counterparty today\n',
      );
      return scene;
    });

    when('[t0] the red team runs', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('the positive control: the worktree copy is clean', () => {
        // so any roster hit below came from the INDEX, not the tree
        expect(
          fs.readFileSync(path.join(repo.dir, 'notes.md'), UTF8),
        ).not.toContain(REAL_CORP);
      });

      then('it exits 2 and names the staged leak', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('staged leak');
        expect(result.stdout).toContain('1 path(s) staged AND changed after');
      });

      then('the roster hit comes from the index snapshot', () => {
        expect(result.stdout).toContain('roster: 1 hit(s) across 1 file(s)');
      });

      then('no real value appears; the mask does', () => {
        expectNoRealValue(result.stdout);
        expect(result.stdout).toContain('Zo***');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] a published transform', () => {
    // built at runtime, so this test file never carries the phrase
    // ⚠️ the magnitude is arbitrary and must stay so. a test fixture that
    //    happens to equal a real map's offset would publish that offset
    const magnitude = ['all dates shifted', '-37', 'days'].join(' ');

    when('[t0] the text states the magnitude', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: { 'demo.md': `note: ${magnitude}.\n` } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 with one magnitude disclosure', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('1 magnitude disclosure(s)');
      });
    });

    when('[t1] the control: the shift is stated, its size is not', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'demo.md': 'note: dates shifted, figures perturbed.\n' },
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 0 with zero disclosures', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('0 magnitude disclosure(s)');
      });
    });
  });

  given('[case5] a hash oracle of a short real name', () => {
    const sha = (s: string) =>
      crypto.createHash('sha256').update(s).digest('hex');

    when('[t0] a test fixture carries sha256 of the name', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: {
            'fixture.ts': `const expected = '${sha(REAL_NAME.toLowerCase())}';\n`,
          },
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 and names the algorithm, masked', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('1 digest(s) of a roster value');
        expect(result.stdout).toContain('sha256(Qu***)');
        expectNoRealValue(result.stdout);
      });
    });

    when('[t1] the control: a digest of an unrelated word', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'fixture.ts': `const expected = '${sha('seaweed')}';\n` },
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 0 with zero digests', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('0 digest(s) of a roster value');
      });
    });
  });

  given('[case6] a stale build that still carries a roster value', () => {
    const repo = useBeforeAll(async () => {
      const scene = genTempRepo({
        gitignore: '.pii-map\ndist\n',
        files: { 'src/index.md': 'the source is clean\n' },
      });
      fs.mkdirSync(path.join(scene.dir, 'dist'), { recursive: true });
      fs.writeFileSync(
        path.join(scene.dir, 'dist', 'index.md'),
        `built from notes on ${REAL_NAME}\n`,
      );
      return scene;
    });

    when('[t0] dist is scanned by default', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 with a dist hit', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('c. dist: 1 hit(s) across 1 file(s)');
        expectNoRealValue(result.stdout);
      });
    });

    when('[t1] the control: --dist none', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--dist', 'none'], cwd: repo.dir }),
      );

      then('it exits 0 — the src itself is clean', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('c. dist: skipped');
      });
    });
  });

  given('[case7] a roster value only in history', () => {
    const repo = useBeforeAll(async () => {
      const scene = genTempRepo({ files: { 'log.md': 'start\n' } });
      fs.writeFileSync(
        path.join(scene.dir, 'log.md'),
        `call with ${REAL_CORP}\n`,
      );
      git(scene.dir, ['commit', '--quiet', '-am', 'add']);
      fs.writeFileSync(path.join(scene.dir, 'log.md'), 'call with a firm\n');
      git(scene.dir, ['commit', '--quiet', '-am', 'scrub']);
      return scene;
    });

    when('[t0] without --history', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 0 and says history was skipped', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('b. history: skipped');
      });
    });

    when('[t1] with --history', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--history'], cwd: repo.dir }),
      );

      then('it exits 2 and counts the commits that carry it', () => {
        expect(result.exitCode).toBe(2);
        // the add AND the scrub: a removal diff carries the value too
        expect(result.stdout).toContain(
          'b. history: 2 commit(s) carry a roster value',
        );
        expect(result.stdout).toContain('owner decision');
        expectNoRealValue(result.stdout);
      });
    });
  });

  given('[case8] a real-evidence demo dir beside the public one', () => {
    const files = {
      'cases/.demo/v1.public/readme.md': 'a pseudonymized demo\n',
    };

    when('[t0] the real dir is untracked and NOT ignored', () => {
      const repo = useBeforeAll(async () => {
        const scene = genTempRepo({ files });
        fs.mkdirSync(path.join(scene.dir, 'cases/.demo/realcase'), {
          recursive: true,
        });
        fs.writeFileSync(
          path.join(scene.dir, 'cases/.demo/realcase/notes.md'),
          'raw notes\n',
        );
        return scene;
      });
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--demo', 'cases/.demo/v1.public'],
          cwd: repo.dir,
        }),
      );

      then('it exits 2 and names the unignored path', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('g. evidence: 1 path(s)');
        expect(result.stdout).toContain('untracked, not ignored');
      });

      then('the declared demo verified clean', () => {
        expect(result.stdout).toContain('survivors 0');
      });
    });

    when('[t1] the control: the real dir is ignored', () => {
      const repo = useBeforeAll(async () => {
        const scene = genTempRepo({
          files,
          gitignore: '.pii-map\n**/.demo/*\n!**/.demo/v1.public\n',
        });
        fs.mkdirSync(path.join(scene.dir, 'cases/.demo/realcase'), {
          recursive: true,
        });
        fs.writeFileSync(
          path.join(scene.dir, 'cases/.demo/realcase/notes.md'),
          `raw notes on ${REAL_CORP}\n`,
        );
        return scene;
      });
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--demo', 'cases/.demo/v1.public'],
          cwd: repo.dir,
        }),
      );

      then('it exits 0 — an ignored source is not published', () => {
        if (result.exitCode !== 0) console.log(result.stdout);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('g. evidence: 0 path(s)');
      });
    });
  });

  given('[case9] a roster git could commit', () => {
    when('[t0] the roster is tracked', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ gitignore: '\n', files: { 'readme.md': 'hi\n' } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it refuses with exit 2, before any scan', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('roster is tracked by git');
        expect(result.stdout).not.toContain('L1 deterministic');
      });
    });

    when('[t1] the roster is untracked but not ignored', () => {
      const repo = useBeforeAll(async () => {
        const scene = genTempRepo({ files: { 'readme.md': 'hi\n' } });
        fs.writeFileSync(path.join(scene.dir, 'roster.tsv'), ROSTER);
        return scene;
      });
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--roster', 'roster.tsv'], cwd: repo.dir }),
      );

      then('it refuses with exit 2', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('roster is not gitignored');
      });
    });
  });

  given('[case10] --emit-blind', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'readme.md': 'a plain readme\n',
          // a path that names the person — must be masked in the prompt
          [`${REAL_NAME.toLowerCase()}-notes.md`]: 'clean body\n',
        },
      }),
    );

    when('[t0] the prompt is emitted', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--emit-blind', '.temp/blind.md'],
          cwd: repo.dir,
        }),
      );
      // useBeforeAll proxies an object, so the text rides inside one
      const prompt = useBeforeAll(async () => {
        void result.exitCode;
        return {
          text: fs.readFileSync(path.join(repo.dir, '.temp/blind.md'), UTF8),
        };
      });

      then('it says the prompt was emitted', () => {
        expect(result.stdout).toContain('emitted → .temp/blind.md');
      });

      then('the prompt holds its constraints and the published list', () => {
        expect(prompt.text).toContain('## constraints');
        expect(prompt.text).toContain('## the published set');
        expect(prompt.text).toContain('- readme.md');
      });

      then('the prompt masks the path that names a roster value', () => {
        expect(prompt.text).toContain('- qu***-notes.md');
        expectNoRealValue(prompt.text);
      });

      then('the path itself is a hit, so it exits 2', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('[path]');
      });
    });
  });

  given('[case11] a real date key, published in another format', () => {
    when('[t0] the long form appears', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: { 'story.md': 'filed on March 4, 2019.\n' } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 with one real date in another format', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('1 real date(s) in another format');
      });
    });

    when('[t1] the control: the synthetic date only', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({ files: { 'story.md': 'filed on 2019-01-26.\n' } }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 0', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('0 real date(s) in another format');
      });
    });
  });

  given('[case12] --mode plan over a repo that carries a leak', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({ files: { 'notes.md': `about ${REAL_CORP}\n` } }),
    );

    when('[t0] planned', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--mode', 'plan'], cwd: repo.dir }),
      );

      then('it exits 0 — so no scan ran', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no scan ran');
      });
    });

    when('[t1] the positive control: applied', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 because it SCANNED, not because it refused', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('roster: 1 hit(s)');
        expect(result.stdout).not.toContain('blocked:');
      });
    });
  });
});
