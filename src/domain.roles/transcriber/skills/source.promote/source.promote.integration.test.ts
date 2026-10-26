import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for source.promote
 * .why  = this skill decides which bytes a published brief ships as its
 *         own evidence. every failure mode it has is SILENT: a missed
 *         marker that falls through emits the whole document under a
 *         filename that promises a section, and the reader has no way to
 *         tell that from a correct slice.
 *
 * .note = [case2] and [case3] are THE CLAMPS. they prove the refusal guard
 *         can fire at all — and, just as important, that it writes NO file
 *         when it does. a guard that refuses and leaves a partial artifact
 *         on disk is worse than none, because the artifact outlives the
 *         exit code.
 *
 *         [case4] is the second clamp. it proves the marker search runs
 *         over a LENGTH-STABLE map (so an invisible U+00A0 cannot defeat a
 *         marker) while the SLICE still comes off the original bytes. a
 *         version that sliced the comparable copy would pass a naive test
 *         and quietly ship a document whose whitespace we rewrote.
 */

const scriptPath = path.join(__dirname, 'source.promote.sh');

const UTF8 = 'utf-8' as const;

const SOURCE = [
  'PAGE CHROME, which a slice exists to drop.',
  '',
  'Company incorporation in Delaware',
  'the fee is $500 at signup, and $100 annually after your first year',
  '',
  'MORE CHROME, also dropped.',
].join('\n');

const runSkill = (input: {
  args: string[];
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * .what = a throwaway dir that holds one source and a destination path
 * .why  = each case writes real files; a temp dir keeps them hermetic
 */
const genTempPair = (input?: {
  source?: string;
  dst?: string;
}): { dir: string; from: string; into: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'source-promote-'));
  const from = path.join(dir, 'pull.txt');
  const into = path.join(
    dir,
    'refs',
    input?.dst ?? 'pulledAt=2026-01-15.example.txt',
  );
  fs.writeFileSync(from, input?.source ?? SOURCE);
  return { dir, from, into };
};

describe('source.promote', () => {
  given('[case1] a whole-file promotion, in the default mode', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs with no --mode', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--into', scene.into] }),
      );

      then('it reports the promotion as clean', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('promoted: 1');
        expect(result.stdout).toContain('refused:  0');
      });

      then('it says it is in plan mode', () => {
        expect(result.stdout).toContain('mode: plan');
      });

      then('⭐ it writes NO file — plan is the safe default', () => {
        expect(fs.existsSync(scene.into)).toBe(false);
      });
    });
  });

  given('[case2] a slice whose START marker is not in the source', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs in apply mode', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--into',
            scene.into,
            '--slice-from',
            'Company incorporation in Nevada',
            '--slice-to',
            'annually after your first year',
            '--why',
            'a hydration payload rides along',
            '--mode',
            'apply',
          ],
        }),
      );

      then('⭐ it REFUSES, with exit 2', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('start marker missed');
        expect(result.stdout).toContain('refused:  1');
      });

      then('⭐ it writes NO file — an artifact outlives an exit code', () => {
        expect(fs.existsSync(scene.into)).toBe(false);
      });

      then('it names where the marker and the document part ways', () => {
        expect(result.stdout).toContain('matched up to');
        expect(result.stdout).toContain('Company incorporation in ');
      });
    });
  });

  given('[case3] a slice whose END marker is not in the source', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs in apply mode', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--into',
            scene.into,
            '--slice-from',
            'Company incorporation in Delaware',
            '--slice-to',
            'a sentence the document never carries',
            '--why',
            'a hydration payload rides along',
            '--mode',
            'apply',
          ],
        }),
      );

      then('⭐ it REFUSES rather than emit an unbounded tail', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('end marker missed');
        expect(fs.existsSync(scene.into)).toBe(false);
      });
    });
  });

  given('[case4] a source that separates words with U+00A0', () => {
    const scene = useBeforeAll(async () =>
      genTempPair({
        source: SOURCE.replace(
          'Company incorporation in Delaware',
          'Company\u00a0incorporation\u00a0in\u00a0Delaware',
        ),
      }),
    );

    when('[t0] the marker is typed with plain spaces', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--into',
            scene.into,
            '--slice-from',
            'Company incorporation in Delaware',
            '--slice-to',
            'annually after your first year',
            '--why',
            'the whole page carries a hydration payload',
            '--mode',
            'apply',
          ],
        }),
      );

      then('⭐ the marker still lands — the map is length-stable', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('sliced');
      });

      then('⭐ the SLICE comes off the ORIGINAL, so U+00A0 survives', () => {
        const landed = fs.readFileSync(scene.into, UTF8);
        expect(landed).toContain(
          'Company\u00a0incorporation\u00a0in\u00a0Delaware',
        );
        expect(landed.startsWith('Company')).toBe(true);
        expect(landed.endsWith('annually after your first year')).toBe(true);
      });

      then('it drops the chrome the slice exists to drop', () => {
        const landed = fs.readFileSync(scene.into, UTF8);
        expect(landed).not.toContain('PAGE CHROME');
        expect(landed).not.toContain('MORE CHROME');
      });
    });
  });

  given('[case5] a slice with no stated reason', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs without --why', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--into',
            scene.into,
            '--slice-from',
            'Company incorporation in Delaware',
            '--slice-to',
            'annually after your first year',
            '--mode',
            'apply',
          ],
        }),
      );

      then('it refuses — an unstated judgment cannot be audited', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('needs a `why`');
        expect(fs.existsSync(scene.into)).toBe(false);
      });
    });
  });

  given(
    '[case6] an effectiveAt= stamp whose year is nowhere in the bytes',
    () => {
      const scene = useBeforeAll(async () =>
        genTempPair({ dst: 'effectiveAt=2025-01-01.example.txt' }),
      );

      when('[t0] the skill runs in apply mode', () => {
        const result = useBeforeAll(async () =>
          runSkill({
            args: [
              '--from',
              scene.from,
              '--into',
              scene.into,
              '--mode',
              'apply',
            ],
          }),
        );

        then('⭐ it refuses — a stamp is a CLAIM about the artifact', () => {
          expect(result.exitCode).toBe(2);
          expect(result.stdout).toContain('read the stamp OFF the artifact');
          expect(fs.existsSync(scene.into)).toBe(false);
        });
      });
    },
  );

  given('[case7] a whole-file promotion in apply mode', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs with --mode apply', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--from', scene.from, '--into', scene.into, '--mode', 'apply'],
        }),
      );

      then('it writes the file, byte for byte', () => {
        expect(result.exitCode).toBe(0);
        expect(fs.readFileSync(scene.into, UTF8)).toBe(SOURCE);
      });

      then('it creates the parent dir it needed', () => {
        expect(fs.existsSync(path.dirname(scene.into))).toBe(true);
      });
    });
  });

  given('[case8] a manifest where one job lands and one refuses', () => {
    const scene = useBeforeAll(async () => {
      const pair = genTempPair();
      const manifest = path.join(pair.dir, 'jobs.json');
      const good = path.join(pair.dir, 'refs', 'pulledAt=2026-01-15.good.txt');
      const bad = path.join(pair.dir, 'refs', 'pulledAt=2026-01-15.bad.txt');
      fs.writeFileSync(
        manifest,
        JSON.stringify({
          jobs: [
            { src: pair.from, dst: good, slice: null },
            {
              src: pair.from,
              dst: bad,
              slice: { from: 'a marker that is absent', to: 'also absent' },
              why: 'the page is too large to promote whole',
            },
          ],
        }),
      );
      return { manifest, good, bad };
    });

    when('[t0] the manifest runs in apply mode', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--manifest', scene.manifest, '--mode', 'apply'],
        }),
      );

      then('⭐ a PARTIAL promotion does NOT read as a success', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('promoted: 1');
        expect(result.stdout).toContain('refused:  1');
      });

      then('the job that landed is on disk, and the refused one is not', () => {
        expect(fs.existsSync(scene.good)).toBe(true);
        expect(fs.existsSync(scene.bad)).toBe(false);
      });
    });
  });

  given('[case9] a --slice-from with no --slice-to', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--into',
            scene.into,
            '--slice-from',
            'Company incorporation in Delaware',
          ],
        }),
      );

      then('it blocks — an unbounded tail is not a slice', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unbounded tail is not a slice');
      });
    });
  });

  given('[case10] a --manifest passed beside a --from', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs with both shapes', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--manifest',
            path.join(scene.dir, 'jobs.json'),
            '--from',
            scene.from,
          ],
        }),
      );

      then('it blocks rather than silently drop the flag', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('exclusive');
      });
    });
  });

  given('[case11] a source that is not on disk', () => {
    const scene = useBeforeAll(async () => genTempPair());

    when('[t0] the skill runs against an absent pull', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            path.join(scene.dir, 'never-pulled.txt'),
            '--into',
            scene.into,
            '--mode',
            'apply',
          ],
        }),
      );

      then('it refuses and names the absent source', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('source absent');
      });
    });
  });

  given('[case12] the --help flag', () => {
    when('[t0] the skill runs with --help', () => {
      const result = useBeforeAll(async () => runSkill({ args: ['--help'] }));

      then('it prints usage and exits clean', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--slice-from');
      });
    });
  });
});
