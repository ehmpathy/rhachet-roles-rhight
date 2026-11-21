import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the memory.prune skill
 *
 * .why  = this skill is four detectors and one mutation, and on the real
 *         memory directory every detector currently reports ZERO. a census
 *         that has only ever printed `structural defects: 0` cannot be told
 *         apart from one that is INCAPABLE of printing anything else.
 *
 *         so each detector here gets a fixture it MUST fire on, paired with a
 *         control it must stay silent on. without the pair, every assertion
 *         below is satisfied by an executable that prints the clean report and
 *         exits 0.
 *
 * ⛔ THE SHARPEST CASE IS [case4]. the two orphan kinds need OPPOSITE cures —
 *    one is a prune candidate, the other wants an index line — and they are
 *    INDISTINGUISHABLE from the index. a skill that lumped them would offer to
 *    archive a live lesson, and every count it printed would still be correct.
 *
 * ⛔ AND [case6] IS THE ONE THAT PROTECTS A MEMORY. to archive a file the index
 *    still names converts a clean directory into one with a DEAD POINTER —
 *    strictly worse than the orphan it cured. the assertion is not only that
 *    the skill refuses, but that the file is STILL ON DISK afterward.
 *
 * hermetic: every fixture is built at runtime under a temp dir, and `--at` is
 * passed on every invocation. the real `~/.claude/projects/*\/memory` trees are
 * never read, so these counts cannot drift with a session.
 */

const skillAt = path.join(__dirname, 'memory.prune.sh');
const UTF8 = 'utf-8' as const;

const write = (at: string, body: string): void => {
  fs.mkdirSync(path.dirname(at), { recursive: true });
  fs.writeFileSync(at, body, UTF8);
};

/**
 * .what = build a memory dir from an index body plus a set of files
 * .why  = every case below differs only in those two inputs, so the shape is
 *         declared once and each case states only its own deviation
 */
const genMemoryDir = (input: {
  slug: string;
  index: string[];
  files: Record<string, string>;
}): { at: string } => {
  const at = fs.mkdtempSync(path.join(os.tmpdir(), 'mem-prune-' + input.slug + '-'));
  write(path.join(at, 'MEMORY.md'), input.index.join('\n'));
  for (const [name, body] of Object.entries(input.files))
    write(path.join(at, name), body);
  return { at };
};

/**
 * .what = a memory file's frontmatter block
 * .why  = the retired/unlisted split reads the first 600 chars for a
 *         superseded marker, so a fixture must carry a real frontmatter to
 *         exercise the branch rather than the fallthrough
 */
const genFrontmatter = (input: { name: string; description: string }): string =>
  [
    '---',
    'name: ' + input.name,
    'description: ' + input.description,
    'type: feedback',
    '---',
    '',
    'the body of the lesson.',
    '',
  ].join('\n');

interface Run {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const run = (input: { args: string[]; env?: Record<string, string> }): Run => {
  const res = spawnSync('bash', [skillAt, ...input.args], {
    cwd: __dirname,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...(input.env ?? {}) },
  });
  return {
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    exitCode: res.status ?? 1,
  };
};

describe('memory.prune', () => {
  // ⭐ THE CONTROL FOR EVERY DETECTOR BELOW.
  //
  //    each later case plants exactly one defect into this same shape. so when
  //    a detector fires there and stays silent here, the signal is attributable
  //    to the planted defect rather than to the fixture shape.
  given('[case1] a memory dir with no structural defect', () => {
    const s1 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'clean',
        index: [
          '- [the tide rule](feedback_tide.md) — read the tide before you paddle',
          '- [the reef map](reference_reef.md) — where the shallow water sits',
        ],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide before you paddle',
          }),
          'reference_reef.md': genFrontmatter({
            name: 'the reef map',
            description: 'where the shallow water sits',
          }),
        },
      }),
    );

    when('[t0] the census runs', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s1.at] }));

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });
      then('it reports zero structural defects', () => {
        expect(result.stdout).toContain('structural defects: 0');
      });
      then('every structural row is green', () => {
        expect(result.stdout).toContain('every index entry is inside');
        expect(result.stdout).toContain('every pointer resolves to a file');
        expect(result.stdout).toContain('every file is named by the index');
        expect(result.stdout).toContain('no target is named twice');
      });
      then('the advisory line is all zeros', () => {
        expect(result.stdout).toContain(
          'advisory: 0 retired · 0 unlisted · 0 duplicate · 0 fat',
        );
      });
      then('it names the directory it censused', () => {
        expect(result.stdout).toContain('at: ' + s1.at);
      });
    });
  });

  // ⛔ THE HEADLINE DEFECT, AND THE ONLY ONE WHOSE FAILURE IS WHOLLY SILENT.
  //
  //    an entry past the cap is indexed and never loaded, so it reads as
  //    covered from the index and as reachable from the file. every other
  //    check in this suite can be green while this one bites.
  given('[case2] an index whose later entries fall past the line cap', () => {
    const s2 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'cap',
        index: [
          '- [one](a.md) — first',
          '- [two](b.md) — second',
          '- [three](c.md) — third',
          '- [four](d.md) — fourth, and past a cap of 3',
        ],
        files: {
          'a.md': 'a',
          'b.md': 'b',
          'c.md': 'c',
          'd.md': 'd',
        },
      }),
    );

    when('[t0] the cap is set below the index length', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s2.at, '--cap', '3'] }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });
      then('it counts the defect as structural, not advisory', () => {
        expect(result.stdout).toContain('structural defects: 1');
      });
      then('it names the entry that is never loaded', () => {
        expect(result.stdout).toContain('PAST THE 3-LINE CAP');
        expect(result.stdout).toContain('d.md');
      });
      // ⭐ the line number is what makes the report actionable, so it is
      //    asserted rather than left to the reader of the path alone.
      then('it reports the 1-based line the entry sits on', () => {
        expect(result.stdout).toMatch(/L\s*4\s+d\.md/);
      });
      // the census lists every file elsewhere (largest files), so the check
      // reads the past-the-cap section alone
      then('the earlier entries are not flagged', () => {
        const section = result.stdout.split('PAST THE 3-LINE CAP')[1]?.split('├─ ✅')[0] ?? '';
        expect(section).toContain('d.md');
        for (const name of ['a.md', 'b.md', 'c.md']) expect(section).not.toContain(name);
      });
    });

    // ⭐ THE CONTROL. the same index, a cap that clears it. without this, an
    //    implementation that flagged the last entry unconditionally would pass
    //    every assertion above.
    when('[t1] the cap is set above the index length', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s2.at, '--cap', '200'] }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });
      then('no entry is reported past the cap', () => {
        expect(result.stdout).not.toContain('PAST THE');
        expect(result.stdout).toContain('every index entry is inside the 200-line cap');
      });
    });
  });

  given('[case3] an index that names a file which is absent', () => {
    const s3 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'dead',
        index: [
          '- [the tide rule](feedback_tide.md) — read the tide',
          '- [the lost lesson](feedback_gone.md) — this file was removed by hand',
        ],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide',
          }),
        },
      }),
    );

    when('[t0] the census runs', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s3.at] }));

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });
      then('it names the dead pointer', () => {
        expect(result.stdout).toContain('DEAD POINTER');
        expect(result.stdout).toContain('feedback_gone.md');
      });
      then('it counts it as structural', () => {
        expect(result.stdout).toContain('structural defects: 1');
      });
      then('it reports exactly one dead pointer, not both entries', () => {
        expect(result.stdout).toContain('the index names a file that is absent (1)');
      });
    });
  });

  // ⛔ THE SHARPEST CASE IN THIS FILE.
  //
  //    both files below are orphans. from the index they are identical — one
  //    line of absence each. only the file's OWN frontmatter says which is a
  //    tombstone and which is a live lesson somebody forgot to index.
  //
  //    a skill that reported `orphans: 2` would be arithmetically correct and
  //    would invite a human to archive a memory whose only fault is a missed
  //    edit.
  given('[case4] two orphans — one retired, one merely unlisted', () => {
    const s4 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'orphans',
        index: ['- [the tide rule](feedback_tide.md) — read the tide'],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide',
          }),
          'feedback_tombstone.md': genFrontmatter({
            name: 'SUPERSEDED — see feedback_tide.md',
            description: 'superseded duplicate; the live entry is feedback_tide.md',
          }),
          'feedback_forgotten.md': genFrontmatter({
            name: 'the wind rule',
            description: 'an offshore wind holds the face up; a live lesson, never indexed',
          }),
        },
      }),
    );

    when('[t0] the census runs', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s4.at] }));

      // ⭐ AN ORPHAN IS ADVISORY, NEVER STRUCTURAL. the cure is a human read,
      //    so the skill must not halt a caller over one.
      then('it exits clean, because an orphan is advisory', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('structural defects: 0');
      });

      then('it counts one of each kind, not two of one', () => {
        expect(result.stdout).toContain('advisory: 1 retired · 1 unlisted');
      });

      // ⭐ THE SPLIT ITSELF. each file must appear under its OWN heading —
      //    a lumped report would satisfy a mere `toContain(filename)`.
      then('the tombstone is offered as a prune candidate', () => {
        const at = result.stdout.indexOf('ORPHAN · RETIRED');
        const upto = result.stdout.indexOf('ORPHAN · UNLISTED');
        expect(at).toBeGreaterThan(-1);
        expect(upto).toBeGreaterThan(at);
        expect(result.stdout.slice(at, upto)).toContain('feedback_tombstone.md');
        expect(result.stdout.slice(at, upto)).not.toContain('feedback_forgotten.md');
      });

      then('the live lesson is fenced off from the prune offer', () => {
        const at = result.stdout.indexOf('ORPHAN · UNLISTED');
        const tail = result.stdout.slice(at);
        expect(tail).toContain('feedback_forgotten.md');
        expect(tail).toContain('do NOT archive these');
        expect(tail).toContain('the cure is an index line');
      });
    });
  });

  given('[case5] an index that names one target twice', () => {
    const s5 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'dupe',
        index: [
          '- [the tide rule](feedback_tide.md) — read the tide',
          '- [the tide rule, again](feedback_tide.md) — a second line, one target',
        ],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide',
          }),
        },
      }),
    );

    when('[t0] the census runs', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s5.at] }));

      then('it exits clean, because a duplicate is advisory', () => {
        expect(result.exitCode).toEqual(0);
      });
      then('it reports the target and its count', () => {
        expect(result.stdout).toContain('DUPLICATE');
        expect(result.stdout).toContain('2×  feedback_tide.md');
      });
      then('it counts one duplicate target, not two entries', () => {
        expect(result.stdout).toContain('0 unlisted · 1 duplicate');
      });
    });
  });

  // ⛔ THE GUARD THAT PROTECTS A MEMORY.
  //
  //    to move an indexed file leaves the index pointed at a path that is
  //    gone — the `dead` defect of [case3], manufactured by the very command
  //    meant to tidy the directory.
  given('[case6] an archive request for a file the index still names', () => {
    const s6 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'guard',
        index: ['- [the tide rule](feedback_tide.md) — read the tide'],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide',
          }),
        },
      }),
    );

    when('[t0] the archive is attempted', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s6.at, '--archive', 'feedback_tide.md'] }),
      );

      then('it refuses with exit 2', () => {
        expect(result.exitCode).toEqual(2);
      });
      then('the refusal names the cure, not only the symptom', () => {
        expect(result.stdout).toContain('the index still names feedback_tide.md');
        expect(result.stdout).toContain('drop its MEMORY.md line first');
      });

      // ⭐ THE ASSERTION THAT MATTERS. a refusal that printed correctly and
      //    moved the file anyway would pass every line above.
      then('the file is still on disk, unmoved', () => {
        expect(fs.existsSync(path.join(s6.at, 'feedback_tide.md'))).toEqual(true);
      });
      then('no archive directory was created', () => {
        expect(fs.existsSync(path.join(s6.at, '.archive'))).toEqual(false);
      });
    });
  });

  given('[case7] an archive request for a genuine orphan', () => {
    const s7 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'archive',
        index: ['- [the tide rule](feedback_tide.md) — read the tide'],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide',
          }),
          'feedback_tombstone.md': genFrontmatter({
            name: 'SUPERSEDED — see feedback_tide.md',
            description: 'superseded duplicate',
          }),
        },
      }),
    );

    when('[t0] the orphan is archived', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s7.at, '--archive', 'feedback_tombstone.md'] }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });

      // ⛔ THE GUARANTEE. a MOVE, never a delete — the memory dir sits outside
      //    git, so a delete here has no undo at all.
      then('the file left the root', () => {
        expect(fs.existsSync(path.join(s7.at, 'feedback_tombstone.md'))).toEqual(false);
      });
      then('the file is in .archive, intact', () => {
        const at = path.join(s7.at, '.archive', 'feedback_tombstone.md');
        expect(fs.existsSync(at)).toEqual(true);
        expect(fs.readFileSync(at, UTF8)).toContain('SUPERSEDED');
      });
      then('it prints the exact command that undoes the move', () => {
        expect(result.stdout).toContain('undo: mv');
        expect(result.stdout).toContain(path.join(s7.at, '.archive', 'feedback_tombstone.md'));
      });
      then('the indexed file was left alone', () => {
        expect(fs.existsSync(path.join(s7.at, 'feedback_tide.md'))).toEqual(true);
      });
    });

    // ⭐ THE SWEEP MUST NOT SEE INTO `.archive/`. it is non-recursive on
    //    purpose — a recursive scan would report every archived file as an
    //    orphan forever, so a directory could never reach a clean census.
    when('[t1] the census runs after the archive', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s7.at] }));

      then('the archived file is not reported as an orphan', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('every file is named by the index');
        expect(result.stdout).not.toContain('feedback_tombstone.md');
      });
      then('the on-disk count excludes the archived file', () => {
        expect(result.stdout).toContain('files: 1 on disk');
      });
    });
  });

  given('[case8] archive requests the skill must turn away', () => {
    const s8 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'refuse',
        index: ['- [the tide rule](feedback_tide.md) — read the tide'],
        files: {
          'feedback_tide.md': genFrontmatter({
            name: 'the tide rule',
            description: 'read the tide',
          }),
          'feedback_orphan.md': genFrontmatter({
            name: 'SUPERSEDED',
            description: 'superseded',
          }),
        },
      }),
    );

    when('[t0] a path is passed instead of a bare filename', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s8.at, '--archive', '../escape.md'] }),
      );
      then('it refuses, and says what it wanted', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('takes a bare filename');
      });
    });

    when('[t1] the index itself is named', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s8.at, '--archive', 'MEMORY.md'] }),
      );
      then('it refuses', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('is the index itself');
      });
      then('the index survives', () => {
        expect(fs.existsSync(path.join(s8.at, 'MEMORY.md'))).toEqual(true);
      });
    });

    when('[t2] a file that is not there is named', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s8.at, '--archive', 'feedback_imaginary.md'] }),
      );
      then('it refuses, and names the path it looked at', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('no such memory');
        expect(result.stdout).toContain('feedback_imaginary.md');
      });
    });

    // ⛔ AN ARCHIVE MUST NEVER OVERWRITE AN ARCHIVE. the move is the only undo
    //    a caller has, so a clobber here destroys the one copy that was kept.
    when('[t3] a name already taken in .archive is archived again', () => {
      const result = useBeforeAll(async () => {
        write(
          path.join(s8.at, '.archive', 'feedback_orphan.md'),
          'the ORIGINAL archived body, which must survive',
        );
        return run({ args: ['--at', s8.at, '--archive', 'feedback_orphan.md'] });
      });

      then('it refuses', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('already in .archive');
      });
      then('the archived copy is untouched', () => {
        expect(
          fs.readFileSync(path.join(s8.at, '.archive', 'feedback_orphan.md'), UTF8),
        ).toContain('the ORIGINAL archived body');
      });
      then('the root copy is untouched too', () => {
        expect(fs.existsSync(path.join(s8.at, 'feedback_orphan.md'))).toEqual(true);
      });
    });
  });

  given('[case9] bad input to the census itself', () => {
    const s9 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'input',
        index: ['- [the tide rule](feedback_tide.md) — read the tide'],
        files: { 'feedback_tide.md': 'body' },
      }),
    );

    when('[t0] --at names a directory that is not there', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', path.join(os.tmpdir(), 'mem-prune-absent-dir')] }),
      );
      then('it refuses', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('memory dir not found');
      });
    });

    when('[t1] --at names a directory with no index', () => {
      const result = useBeforeAll(async () => {
        const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'mem-prune-bare-'));
        return run({ args: ['--at', bare] });
      });
      then('it refuses rather than assume an empty index', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('no MEMORY.md in');
      });
    });

    when('[t2] --cap is handed a value that is not a number', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s9.at, '--cap', 'lots'] }),
      );
      then('it refuses, and echoes what it got', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('--cap needs a whole number, got: lots');
      });
    });

    when('[t3] an unknown option is passed', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s9.at, '--purge'] }),
      );
      then('it refuses rather than ignore it', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('unknown option: --purge');
      });
    });

    when('[t4] a bare argument is passed', () => {
      const result = useBeforeAll(async () =>
        run({ args: ['--at', s9.at, 'feedback_tide.md'] }),
      );
      then('it refuses rather than guess the intent', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('unexpected argument');
      });
    });
  });

  // ⛔ ZERO OR MANY IS A REFUSAL, NEVER A PICK.
  //
  //    a default that guesses between two memory directories writes a census
  //    about one project under the name of another, and the output looks
  //    correct either way.
  given('[case10] --at omitted, and HOME decides what is reachable', () => {
    when('[t0] the resolver runs against an empty HOME', () => {
      const result = useBeforeAll(async () => {
        const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mem-prune-home-'));
        return run({ args: [], env: { HOME: home } });
      });

      then('it refuses rather than fall through to the cwd', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('no memory dir found under');
      });
      then('the refusal tells the caller how to proceed', () => {
        expect(result.stdout).toContain('pass --at DIR');
      });
    });

    when('[t1] the resolver runs against a HOME with two candidates', () => {
      const result = useBeforeAll(async () => {
        const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mem-prune-home2-'));
        for (const slug of ['proj-alpha', 'proj-beta'])
          write(
            path.join(home, '.claude/projects', slug, 'memory/MEMORY.md'),
            '- [x](x.md) — x',
          );
        return run({ args: [], env: { HOME: home } });
      });

      // ⭐ THE CONTROL FOR THE REFUSAL. an implementation that took `[0]` would
      //    pass [t0] and would silently census one project under the name of
      //    the other here.
      then('it refuses to choose', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('found 2 memory dirs, so --at is required');
      });
      then('it names both candidates, so the caller need not hunt', () => {
        expect(result.stdout).toContain('proj-alpha');
        expect(result.stdout).toContain('proj-beta');
      });
    });

    when('[t2] the resolver runs against a HOME with exactly one', () => {
      const result = useBeforeAll(async () => {
        const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mem-prune-home1-'));
        const at = path.join(home, '.claude/projects/proj-solo/memory');
        write(path.join(at, 'MEMORY.md'), '- [the tide rule](feedback_tide.md) — read it');
        write(path.join(at, 'feedback_tide.md'), 'body');
        return run({ args: [], env: { HOME: home } });
      });

      // ⭐ AND THE CONTROL FOR THE CONTROLS. without this, a resolver that
      //    refused unconditionally would pass [t0] and [t1] both.
      then('it resolves, and censuses that one', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('proj-solo/memory');
      });
    });
  });

  // ⛔ A WHOLE OUTPUT SURFACE WITH ZERO ASSERTIONS IS THE DEFECT THIS REPO HAS
  //    NOW MET REPEATEDLY. `--help` exits 0 with an empty stderr, so no
  //    automated signal can report that it printed garbage — which is exactly
  //    why it needs an assertion MORE than a surface that can fail loudly.
  given('[case11] the help surface', () => {
    when('[t0] --help is passed', () => {
      const result = useBeforeAll(async () => run({ args: ['--help'] }));

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });
      then('it carries the usage block', () => {
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--archive F');
        expect(result.stdout).toContain('--cap N');
      });
      then('it states the guarantee that matters', () => {
        expect(result.stdout).toContain('NO FILE IS EVER DELETED');
      });

      // ⭐ THE AWK FENCE. `NR == 1 { next }` is what drops the shebang, and a
      //    one-character slip there prints `!/usr/bin/env bash` at exit 0 with
      //    an empty stderr — invisible to every other signal.
      then('it does not leak the shebang line', () => {
        expect(result.stdout).not.toContain('/usr/bin/env bash');
      });
      // ⭐ AND THE FENCE MUST STOP. `/^#####/` closing on the second fence is
      //    what keeps the executable body out of the help text.
      then('it stops at the closing fence, before the code', () => {
        expect(result.stdout).not.toContain('set -euo pipefail');
        expect(result.stdout).not.toContain('print_blocked');
      });
    });

    when('[t1] -h is passed', () => {
      const result = useBeforeAll(async () => run({ args: ['-h'] }));
      then('the short form behaves the same', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('usage:');
      });
    });
  });

  // ⚠️ A FAT LINE IS REPORTED AND IS NOT A DEFECT. the cap is counted in
  //    LINES, so a fat line costs no more of it than a thin one — it costs
  //    tokens, which is a different bill. the assertion holds the skill to
  //    that distinction.
  given('[case12] an index entry well over the ~150 char guidance', () => {
    const s12 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'fat',
        index: [
          '- [thin](a.md) — short',
          '- [fat](b.md) — ' + 'a very long hook that belongs inside the file. '.repeat(6),
        ],
        files: { 'a.md': 'a', 'b.md': 'b' },
      }),
    );

    when('[t0] the census runs', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s12.at] }));

      then('it exits clean, because a fat line is not structural', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('structural defects: 0');
      });
      then('it names the fat entry and not the thin one', () => {
        const at = result.stdout.indexOf('over ~150 chars');
        expect(at).toBeGreaterThan(-1);
        const upto = result.stdout.indexOf('the 5 largest files');
        expect(result.stdout.slice(at, upto)).toContain('b.md');
        expect(result.stdout.slice(at, upto)).not.toContain('a.md');
      });
      then('it counts exactly one', () => {
        expect(result.stdout).toContain('0 duplicate · 1 fat');
      });
    });
  });

  // ⭐ AN INDEX IS PROSE PLUS POINTERS. a heading, a blank, a note — none of
  //    those is a defect, and a parser that held them to the pointer contract
  //    would report a dead pointer on every heading in the file.
  given('[case13] an index that carries prose alongside its pointers', () => {
    const s13 = useBeforeAll(async () =>
      genMemoryDir({
        slug: 'prose',
        index: [
          '# memory index',
          '',
          'a note about how this index is kept.',
          '',
          '- [the tide rule](feedback_tide.md) — read the tide',
          '',
          '## older',
          '',
          '- [the reef map](reference_reef.md) — where the shallow water sits',
        ],
        files: {
          'feedback_tide.md': 'body',
          'reference_reef.md': 'body',
        },
      }),
    );

    when('[t0] the census runs', () => {
      const result = useBeforeAll(async () => run({ args: ['--at', s13.at] }));

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });
      then('it counts the pointers, not the lines', () => {
        expect(result.stdout).toContain('9 lines · 2 entries');
      });
      then('no prose line is reported as a dead pointer', () => {
        expect(result.stdout).toContain('every pointer resolves to a file');
      });
    });
  });
});
