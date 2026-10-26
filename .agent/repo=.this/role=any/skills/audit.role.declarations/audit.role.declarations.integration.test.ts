import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the audit.role.declarations skill
 *
 * .why  = this sweep's whole value is a number, and a sweep that has only ever
 *         reported one number is indistinguishable from a sweep that CANNOT
 *         report a different one.
 *
 *         so [case2] and [case3] are the two controls it MUST fail. and they
 *         are DIFFERENT controls: [case2] is an ABSENT pointer, which a bare
 *         `fs.existsSync` catches; [case3] is an EMPTY DIRECTORY, which it does
 *         NOT. the first version of this sweep passed [case3]'s shape on the
 *         real tree and reported `dead: 2` where the truth was 3.
 *
 * hermetic: every fixture is built at runtime under a temp dir. the sweep is
 * never pointed at the real repo, so these counts cannot drift with the tree.
 */

const scriptPath = path.join(__dirname, 'audit.role.declarations.sh');
const UTF8 = 'utf-8' as const;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-decl-'));

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
 * ⭐ the declaration body every fixture reuses.
 *
 * it carries FOUR pointers on purpose:
 *   - two INLINE   (`readme`, `boot`) — the flat shape
 *   - one NESTED   (`briefs > dirs`)  — the shape whose label must be the
 *                                       OUTER key, not the pass-through `dirs`
 *   - one under an UNFORESEEN key (`helm`) — a key no real role uses today.
 *     the skill guarantees the section label is carried for the REPORT only
 *     and never gates the check, and this is what holds it to that.
 *
 * plus a COMMENTED-OUT pointer, which must not be counted at all.
 */
const asDeclaration = (): string =>
  [
    'export const ROLE_SURFER = Role.build({',
    "  slug: 'surfer',",
    '  // a commented pointer, which must not be counted: `${__dirname}/ghost.md`',
    '  readme: { uri: `${__dirname}/readme.md` },',
    '  boot: { uri: `${__dirname}/boot.yml` },',
    '  briefs: {',
    '    dirs: { uri: `${__dirname}/briefs` },',
    '  },',
    '  helm: {',
    '    dirs: { uri: `${__dirname}/helm` },',
    '  },',
    '});',
    '',
  ].join('\n');

/**
 * ⭐ THE CLEAN ROOT — every one of the four pointers is on disk, and both
 * directories hold an entry.
 *
 * the `helm` pointer is what proves the unforeseen-key guarantee: a matcher
 * that modelled `readme | boot | briefs | skills | inits` would report
 * `declared: 3` here and still say `dead: 0`.
 */
const cleanRoot = path.join(tempDir, 'clean');
write(path.join(cleanRoot, 'surfer/getSurferRole.ts'), asDeclaration());
write(path.join(cleanRoot, 'surfer/readme.md'), '# surfer\n');
write(path.join(cleanRoot, 'surfer/boot.yml'), 'always:\n');
write(path.join(cleanRoot, 'surfer/briefs/rule.require.wax.md'), '# wax\n');
write(path.join(cleanRoot, 'surfer/helm/howto.paddle.md'), '# paddle\n');

/**
 * ⭐ THE ABSENT ROOT — the same declaration, with `briefs/` NOT created.
 *
 * exactly one of four pointers is dead, so the report must name that one and
 * leave the other three unmentioned.
 */
const absentRoot = path.join(tempDir, 'absent');
write(path.join(absentRoot, 'surfer/getSurferRole.ts'), asDeclaration());
write(path.join(absentRoot, 'surfer/readme.md'), '# surfer\n');
write(path.join(absentRoot, 'surfer/boot.yml'), 'always:\n');
write(path.join(absentRoot, 'surfer/helm/howto.paddle.md'), '# paddle\n');

/**
 * ⭐ THE EMPTY ROOT ⭐ THE CONTROL A BARE `existsSync` CANNOT FAIL.
 *
 * `briefs/` EXISTS here and holds no entry. git cannot track an empty
 * directory, so that pointer will not exist after a clone — yet `existsSync`
 * reports it covered.
 *
 * ⛔ if this case ever goes green on a sweep that only calls existsSync, the
 *    instrument is toothless in the SILENT direction, which is the one that
 *    costs a defect.
 */
const emptyRoot = path.join(tempDir, 'empty');
write(path.join(emptyRoot, 'surfer/getSurferRole.ts'), asDeclaration());
write(path.join(emptyRoot, 'surfer/readme.md'), '# surfer\n');
write(path.join(emptyRoot, 'surfer/boot.yml'), 'always:\n');
write(path.join(emptyRoot, 'surfer/helm/howto.paddle.md'), '# paddle\n');
fs.mkdirSync(path.join(emptyRoot, 'surfer/briefs'), { recursive: true });

/**
 * ⭐ THE HALF ROOT — one role with a declaration, one without.
 *
 * a role that LOST its declaration looks identical to a role that never had
 * one, and only the first is a defect. so the skill names it rather than skip
 * it in silence, and this fixture is what proves the name is printed.
 */
const halfRoot = path.join(tempDir, 'half');
write(path.join(halfRoot, 'surfer/getSurferRole.ts'), asDeclaration());
write(path.join(halfRoot, 'surfer/readme.md'), '# surfer\n');
write(path.join(halfRoot, 'surfer/boot.yml'), 'always:\n');
write(path.join(halfRoot, 'surfer/briefs/rule.require.wax.md'), '# wax\n');
write(path.join(halfRoot, 'surfer/helm/howto.paddle.md'), '# paddle\n');
write(path.join(halfRoot, 'shaper/readme.md'), '# shaper\n');

describe('audit.role.declarations', () => {
  given('[case1] a root whose every declared path is on disk', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen('it exits 0', () => {
        const res = run({ args: ['--in', cleanRoot] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('it counts the role and its declaration', () => {
        expect(outcome.stdout).toContain('roles: 1');
        expect(outcome.stdout).toContain('declarations: 1');
      });

      then('⭐ it counts the pointer under an UNFORESEEN key — 4, not 3', () => {
        // the section label is carried for the report only. a matcher that
        // modelled the known keys would report `declared: 3` here and still
        // say `dead: 0`, so the COUNT is the only thing that can see it.
        //
        // 4 and not 5: the commented pointer must not be counted either.
        expect(outcome.stdout).toContain('declared: 4');
      });

      then('it reports no dead pointer, and says so in words', () => {
        expect(outcome.stdout).toContain('dead: 0 (absent 0 · empty 0)');
        expect(outcome.stdout).toContain('every declared path is on disk');
      });

      then('it renders no dead-pointer block', () => {
        expect(outcome.stdout).not.toContain('dead pointers');
      });
    });
  });

  given('[case2] a root with exactly ONE ABSENT pointer ⭐ CONTROL A', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen(
        'it exits 0 — a result is not a malfunction',
        () => {
          const res = run({ args: ['--in', absentRoot] });
          expect(res.exitCode).toBe(0);
          return res;
        },
      );

      then('⭐ it counts the dead pointer, and grades it ABSENT', () => {
        expect(outcome.stdout).toContain('declared: 4');
        expect(outcome.stdout).toContain('dead: 1 (absent 1 · empty 0)');
      });

      then('⭐ it labels the section with the OUTER key, not `dirs`', () => {
        // the pointer sits under `briefs > dirs`. `dirs` is a PASS-THROUGH
        // that carries the pointer without naming it, so a label of `[dirs]`
        // leaves a human unable to see WHICH declaration broke.
        expect(outcome.stdout).toMatch(
          /absent · surfer\/getSurferRole\.ts \[briefs\] briefs/,
        );
        expect(outcome.stdout).not.toContain('[dirs]');
      });

      then('⭐ it does NOT name the three pointers that are on disk', () => {
        // the discriminator. a report that names every pointer satisfies the
        // row assertion above and tells a human none of what actually broke.
        expect(outcome.stdout).not.toContain('readme.md');
        expect(outcome.stdout).not.toContain('boot.yml');
        expect(outcome.stdout).not.toContain('[helm]');
      });

      then('⭐ it does NOT claim the root is clean', () => {
        expect(outcome.stdout).not.toContain('every declared path is on disk');
      });
    });
  });

  given('[case3] a root whose declared dir is EMPTY ⭐ CONTROL B', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen('it exits 0', () => {
        const res = run({ args: ['--in', emptyRoot] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('⭐ it grades an EMPTY directory dead — existsSync cannot', () => {
        // ⛔ THE ONE ASSERTION A BARE `fs.existsSync` SWEEP CANNOT PASS.
        //    the dir is present on this machine and will be absent after a
        //    clone, because git cannot track an empty directory.
        expect(outcome.stdout).toContain('dead: 1 (absent 0 · empty 1)');
        expect(outcome.stdout).toMatch(
          /empty · surfer\/getSurferRole\.ts \[briefs\] briefs/,
        );
      });

      then('⭐ it does NOT grade it ABSENT', () => {
        // the two verdicts carry different cures — create the dir, versus put
        // a file in the dir — so a merged count would hide the difference.
        expect(outcome.stdout).not.toContain('absent ·');
      });

      then('⭐ it does NOT claim the root is clean', () => {
        expect(outcome.stdout).not.toContain('every declared path is on disk');
      });
    });
  });

  given('[case4] a root where one role has no get*Role.ts', () => {
    when('[t0] the sweep runs', () => {
      const outcome = useThen('it exits 0', () => {
        const res = run({ args: ['--in', halfRoot] });
        expect(res.exitCode).toBe(0);
        return res;
      });

      then('⭐ it names the role that has no declaration', () => {
        expect(outcome.stdout).toContain('no declaration');
        expect(outcome.stdout).toMatch(/no declaration[\s\S]*shaper/);
      });

      then('it counts 2 roles but only 1 declaration', () => {
        expect(outcome.stdout).toContain('roles: 2');
        expect(outcome.stdout).toContain('declarations: 1');
      });

      then('the absent declaration contributes no dead row', () => {
        expect(outcome.stdout).toContain('dead: 0 (absent 0 · empty 0)');
      });
    });
  });

  given('[case5] a caller who asks for help', () => {
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

  given('[case6] a caller who hands it an input it cannot use', () => {
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
        const res = run({ args: ['--in', path.join(tempDir, 'nowhere')] });
        expect(res.exitCode).toBe(2);
        return res;
      });

      then('⭐ it says the root was not found, and names it', () => {
        expect(outcome.stdout).toContain('root directory not found');
        expect(outcome.stdout).toContain('nowhere');
      });

      then('it does NOT report a sweep it never ran', () => {
        expect(outcome.stdout).not.toContain('declared:');
      });
    });
  });

  given('[case7] the skill as it sits on disk', () => {
    when('[t0] its file mode is read', () => {
      then(
        '⭐ it carries the executable bit — no spawn-through-bash case can see this',
        () => {
          // leak 7. every case above reaches the skill through an INTERPRETER,
          // and an interpreter consults `r`, never `x`. `rhx` execs, so a 644
          // file exits 126 before a line of it is parsed — at full green here.
          //
          // ⚠️ read the mode INSIDE the then. a lazy accessor hands back a
          //    proxy, and a proxy coerced by `&` yields NaN — which reddens on
          //    a file that IS executable, and proves none of what it claims.
          const mode = fs.statSync(scriptPath).mode;
          // eslint-disable-next-line no-bitwise
          expect(mode & 0o111).not.toBe(0);
        },
      );
    });
  });
});
