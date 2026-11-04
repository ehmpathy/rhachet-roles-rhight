import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the audit.boot.manifests skill
 *
 * .why  = this sweep's whole value is a number, and on the real tree that
 *         number is currently ZERO. a sweep that has only ever reported
 *         `dead: 0` is indistinguishable from a sweep that CANNOT report a
 *         different number — which is the toothless-instrument defect this
 *         repo has now met a dozen times.
 *
 *         so [case2] is the control it MUST fail: a root with one deliberately
 *         dead entry. without that case, every other assertion here is
 *         satisfied by `console.log('dead: 0')`.
 *
 * hermetic: every fixture is built at runtime under a temp dir. the sweep is
 * never pointed at the real repo, so these counts cannot drift with the tree.
 */

const scriptPath = path.join(__dirname, 'audit.boot.manifests.sh');
const UTF8 = 'utf-8' as const;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-boot-'));

const write = (at: string, body: string): void => {
  fs.mkdirSync(path.dirname(at), { recursive: true });
  fs.writeFileSync(at, body, UTF8);
};

interface Run {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const run = (input: { args: string[] }): Run => {
  const res = spawnSync('bash', [scriptPath, ...input.args], {
    cwd: __dirname,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    exitCode: res.status ?? 1,
  };
};

/**
 * ⭐ THE CLEAN ROOT — one role, three live entries, one under an UNFORESEEN key.
 *
 * `skills:` is not a key the real manifests use for a path list today. it is
 * here on purpose: the skill guarantees that the section label is carried for
 * the REPORT only and never gates the check, and this is the assertion that
 * holds it to that. a matcher that modelled `always > briefs > say|ref` would
 * skip `helm.md` in silence and still report `dead: 0`.
 */
const cleanRoot = path.join(tempDir, 'clean');
write(
  path.join(cleanRoot, 'surfer/boot.yml'),
  [
    'always:',
    '  briefs:',
    '    say:',
    '      # a full-line comment, which must not be read as an item',
    '      - briefs/rule.require.wax.md',
    '    ref:',
    '      - briefs/howto.paddle.md',
    '  skills:',
    '    say:',
    '      - skills/helm.md',
    '',
  ].join('\n'),
);
write(path.join(cleanRoot, 'surfer/briefs/rule.require.wax.md'), '# wax\n');
write(path.join(cleanRoot, 'surfer/briefs/howto.paddle.md'), '# paddle\n');
write(path.join(cleanRoot, 'surfer/skills/helm.md'), '# helm\n');

/**
 * ⭐ THE DEAD ROOT — the same manifest, with `howto.paddle.md` NOT on disk.
 *
 * exactly one entry of two is dead, so the report must name that one and
 * leave the other unmentioned. a sweep that merely counts, or that names
 * every entry, passes a bare `dead: 1` and fails the row assertions below.
 */
const deadRoot = path.join(tempDir, 'dead');
write(
  path.join(deadRoot, 'surfer/boot.yml'),
  [
    'always:',
    '  briefs:',
    '    say:',
    '      - briefs/rule.require.wax.md',
    '    ref:',
    '      - briefs/howto.paddle.md',
    '',
  ].join('\n'),
);
write(path.join(deadRoot, 'surfer/briefs/rule.require.wax.md'), '# wax\n');

/**
 * ⭐ THE HALF ROOT — one role with a manifest, one without.
 *
 * a role that LOST its boot.yml looks identical to a role that never had one,
 * and only the first is a defect. so the skill names it rather than a skip in
 * silence, and this fixture is what proves the name is printed.
 */
const halfRoot = path.join(tempDir, 'half');
write(
  path.join(halfRoot, 'surfer/boot.yml'),
  ['always:', '  briefs:', '    say:', '      - briefs/rule.require.wax.md', ''].join('\n'),
);
write(path.join(halfRoot, 'surfer/briefs/rule.require.wax.md'), '# wax\n');
write(path.join(halfRoot, 'shaper/readme.md'), '# shaper\n');

describe('audit.boot.manifests', () => {
  given('[case1] a root whose every listed path is on disk', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen('it exits 0', () => {
        const res = run({ args: ['--in', cleanRoot] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('it counts the role and its manifest', () => {
        expect(outcome.stdout).toContain('roles: 1');
        expect(outcome.stdout).toContain('manifests: 1');
      });

      then('⭐ it counts the entry under an UNFORESEEN key — 3, not 2', () => {
        // the section label is carried for the report only. a matcher that
        // modelled `briefs > say|ref` would report `listed: 2` here and still
        // say `dead: 0`, so the COUNT is the only thing that can see it.
        expect(outcome.stdout).toContain('listed: 3');
      });

      then('it reports no dead entry, and says so in words', () => {
        expect(outcome.stdout).toContain('dead: 0');
        expect(outcome.stdout).toContain('every listed path is on disk');
      });

      then('it renders no dead-entry block', () => {
        expect(outcome.stdout).not.toContain('dead entries');
      });
    });
  });

  given('[case2] a root with exactly ONE dead entry ⭐ THE CONTROL', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen('it exits 0 — a finding is not a malfunction', () => {
        const res = run({ args: ['--in', deadRoot] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('⭐ it counts the dead entry', () => {
        // ⛔ if this ever goes green on the CLEAN root too, the instrument is
        //    toothless and every `dead: 0` it has ever printed is worthless.
        expect(outcome.stdout).toContain('listed: 2');
        expect(outcome.stdout).toContain('dead: 1');
      });

      then('⭐ it names the role, the section, AND the path', () => {
        expect(outcome.stdout).toMatch(
          /surfer\/boot\.yml \[ref\] briefs\/howto\.paddle\.md/,
        );
      });

      then('⭐ it does NOT name the entry that is on disk', () => {
        // the discriminator. a report that names every entry satisfies the row
        // assertion above and leaves a human unable to see which one broke.
        expect(outcome.stdout).not.toContain('rule.require.wax.md');
      });

      then('⭐ it does NOT claim the root is clean', () => {
        expect(outcome.stdout).not.toContain('every listed path is on disk');
      });
    });
  });

  given('[case3] a root where one role has no boot.yml', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen('it exits 0', () => {
        const res = run({ args: ['--in', halfRoot] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('⭐ it names the role that has no manifest', () => {
        expect(outcome.stdout).toContain('no boot.yml');
        expect(outcome.stdout).toMatch(/no boot\.yml[\s\S]*shaper/);
      });

      then('it counts 2 roles but only 1 manifest', () => {
        expect(outcome.stdout).toContain('roles: 2');
        expect(outcome.stdout).toContain('manifests: 1');
      });

      then('the absent manifest contributes no dead row', () => {
        expect(outcome.stdout).toContain('dead: 0');
      });
    });
  });

  given('[case4] a caller who asks for help', () => {
    when('[t0] --help is passed', () => {
      const outcome = useThen('it exits 0', () => {
        const res = run({ args: ['--help'] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('⭐ it renders the header, not the shebang', () => {
        // the #98 class: a mawk-incompatible fence pattern matches no line and
        // dumps the whole executable, SILENTLY, at exit 0.
        expect(outcome.stdout).toContain('.what = check every path');
        expect(outcome.stdout).toContain('--in DIR');
        expect(outcome.stdout).not.toContain('set -euo pipefail');
      });

      then('it stops at the closing fence', () => {
        expect(outcome.stdout).not.toContain('SKILL_DIR=');
      });
    });
  });

  given('[case5] a caller who hands it an input it cannot use', () => {
    when('[t0] an unknown option is passed', () => {
      const outcome = useThen('it exits 2 — a constraint', () => {
        const res = run({ args: ['--nope'] });
        expect(res.exitCode).toBe(2);
        return res;
      });

      then('⭐ it says WHICH option it did not know', () => {
        // leak 6: the exit code alone cannot tell this refusal from the one
        // below, so only the message discriminates.
        expect(outcome.stdout).toContain('unknown option: --nope');
      });
    });

    when('[t1] a root that is not on disk is passed', () => {
      const outcome = useThen('it exits 2 — a constraint', () => {
        const res = run({ args: ['--in', path.join(tempDir, 'absent')] });
        expect(res.exitCode).toBe(2);
        return res;
      });

      then('⭐ it says the root was not found, and names it', () => {
        expect(outcome.stdout).toContain('root directory not found');
        expect(outcome.stdout).toContain('absent');
      });

      then('it does NOT report a sweep it never ran', () => {
        expect(outcome.stdout).not.toContain('listed:');
      });
    });
  });

  given('[case6] the skill as it sits on disk', () => {
    when('[t0] its file mode is read', () => {
      then('⭐ it carries the executable bit — no spawn-through-bash case can see this', () => {
        // leak 7. every case above reaches the skill through an INTERPRETER,
        // and an interpreter consults `r`, never `x`. `rhx` execs, so a 644
        // file exits 126 before a line of it is parsed — at full green here.
        const mode = fs.statSync(scriptPath).mode;
        // eslint-disable-next-line no-bitwise
        expect(mode & 0o111).not.toBe(0);
      });
    });
  });
});
