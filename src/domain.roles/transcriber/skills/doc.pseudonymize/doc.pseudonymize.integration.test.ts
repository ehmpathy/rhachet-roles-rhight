import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the doc.pseudonymize skill
 *
 * .why  = the skill makes exactly two promises, and both are easy to
 *         believe without proof:
 *
 *         1. pairs apply LONGEST-REAL-FIRST. a map that holds both
 *            `ACMEWIDGET -> NORTHWIND` and `ACME -> NORT` will, applied
 *            shortest-first, produce `NORTWIDGET` — neither real nor
 *            synthetic, and invisible to any verify pass, because the
 *            real value is genuinely gone. [case1] is that test.
 *
 *         2. --verify checks the PATH as well as the content. a
 *            transcript whose body is clean still names the person if
 *            the file is called `deed.jane-doe.md`.
 *
 *         the rest guard the refusals: an uncommittable map, a
 *         --into that would overwrite the source.
 */

const scriptPath = path.join(__dirname, 'doc.pseudonymize.sh');

const UTF8 = 'utf-8' as const;

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

/**
 * .what = a hermetic git repo with a gitignored map
 * .why  = the skill refuses to run against a map git could commit, so
 *         every test needs a real repo with a real .gitignore
 */
interface Scene {
  dir: string;
  dirFrom: string;
  dirInto: string;
}

const genRepo = async (input: {
  map: string;
  docs: Record<string, string>;
}): Promise<Scene> => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc.pseudonymize.'));

  spawnSync('git', ['init', '-q'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 'test'], { cwd: dir });

  fs.writeFileSync(path.join(dir, '.gitignore'), '.pii-map\n');
  fs.writeFileSync(path.join(dir, '.pii-map'), input.map);

  const dirFrom = path.join(dir, 'evidence');
  fs.mkdirSync(dirFrom, { recursive: true });
  for (const [name, body] of Object.entries(input.docs)) {
    fs.writeFileSync(path.join(dirFrom, name), body);
  }

  return { dir, dirFrom, dirInto: path.join(dir, 'example') };
};

/**
 * .what = apply the swap once and share the result across then blocks
 * .why  = rule.forbid.redundant-expensive-operations — one spawn, many
 *         assertions
 */
const useThenApply = (scene: Record<string, any>) =>
  useBeforeAll(async () =>
    runSkill({
      args: [
        '--map',
        '.pii-map',
        '--from',
        scene.dirFrom,
        '--into',
        scene.dirInto,
        '--mode',
        'apply',
      ],
      cwd: scene.dir,
    }),
  );

const readAll = (dir: string): string =>
  fs
    .readdirSync(dir)
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), UTF8))
    .join('\n');

describe('doc.pseudonymize.sh', () => {
  given('[case1] a map whose real values overlap by prefix', () => {
    // this is THE correctness property. ACME is a prefix of ACMEWIDGET,
    // so a shortest-first pass corrupts the longer value into a hybrid.
    const scene = useBeforeAll(() =>
      genRepo({
        map: ['ACMEWIDGET\tNORTHWIND', 'ACME\tNORT'].join('\n') + '\n',
        docs: {
          'charter.md': [
            'the name of the corporation is ACMEWIDGET, INC.',
            'its IRS name control is ACME.',
          ].join('\n'),
        },
      }),
    );

    when('[t0] the swap is applied', () => {
      const result = useThenApply(scene);

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the longer value became its own synthetic, not a hybrid', () => {
        const out = readAll(scene.dirInto);
        expect(out).toContain('NORTHWIND, INC.');
        expect(out).not.toContain('NORTWIDGET');
      });

      then('the shorter value became its own synthetic', () => {
        const out = readAll(scene.dirInto);
        expect(out).toContain('name control is NORT.');
      });

      then('neither real value survives', () => {
        const out = readAll(scene.dirInto);
        expect(out).not.toContain('ACMEWIDGET');
        expect(out).not.toContain('ACME');
      });
    });
  });

  given('[case2] a real value that appears only in the FILENAME', () => {
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'Jane Doe\tPat Roe\njane-doe\tpat-roe\n',
        docs: { 'deed.jane-doe.md': 'a deed, with no name in the body.\n' },
      }),
    );

    when('[t0] the swap is applied', () => {
      const result = useThenApply(scene);

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the output filename carries the synthetic value', () => {
        expect(fs.readdirSync(scene.dirInto)).toEqual(['deed.pat-roe.md']);
      });

      then('verify reports clean', () => {
        const verify = runSkill({
          args: ['--map', '.pii-map', '--verify', scene.dirInto],
          cwd: scene.dir,
        });
        expect(verify.exitCode).toBe(0);
        expect(verify.stdout).toContain('survivors: 0');
      });
    });
  });

  given('[case3] a directory whose content was never swapped', () => {
    when('[t0] verify runs over it', () => {
      const verify = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: ['--map', '.pii-map', '--verify', scene.dirFrom],
          cwd: scene.dir,
        });
      });

      then('it fails, masks the value, and labels the channel', () => {
        expect(verify.exitCode).toBe(2);
        expect(verify.stdout).toContain('survivors: 1');
        // ⛔ assert the ROW, never the bare token. the skill's exit line is a
        //    legend that names all three channels, so `toContain('[content]')`
        //    matches on ANY survivor on ANY channel and is unfalsifiable.
        //    see rule.require.clamp-edge-cases
        expect(verify.stdout).toMatch(/└─ \[content\]\s+\S*deed\.md/);
        expect(verify.stdout).not.toMatch(/└─ \[wrap\]/);
        // the skill's own output must never print the real value
        expect(verify.stdout).not.toContain('Jane Doe');
        expect(verify.stdout).toContain('Ja******');
      });

      /**
       * ⛔ THE DIRECTIVE. every assertion above is DIAGNOSTIC — a count, a
       *    channel label, a mask. `:293` is the only line in the whole skill
       *    that tells a human what to DO, and until now no assertion in any
       *    file read it.
       *
       *    the plausible defect is a tidy-up. `:293` and `:294` are adjacent
       *    echoes and the second reads as a superset:
       *
       *        a real value survives. do NOT publish this directory.
       *        [content] = a re-run may fix · [path] + [wrap] = fix the source
       *
       *    drop the first as redundant and the block still exits 2, still
       *    counts `survivors: 1`, still renders the `[content]` row — and the
       *    sentence left behind reads as advice about a FIXABLE state rather
       *    than a stop. the suite stays whole green while the skill's one
       *    security directive is gone.
       *
       * ⚠️ SPLIT from the legend clamp below on purpose. jest halts a `then`
       *    at its first red, so two clamps in one block can never be measured
       *    apart — and these two lines can be lost independently.
       */
      then('⭐ the DIRECTIVE reaches the human — do NOT publish', () => {
        expect(verify.stdout).toContain('do NOT publish this directory');
      });

      then('⭐ and the legend routes the cure by CHANNEL', () => {
        // the remedy half. a [content] hit may clear on a re-run; a [path] or
        // [wrap] hit never will, because neither names a value this skill
        // wrote. a human who re-runs against a [wrap] hit gets the same answer
        // twice and concludes the tool is broken.
        expect(verify.stdout).toContain('[path] + [wrap] = fix the source');
      });
    });
  });

  given('[case4] a map that git would commit', () => {
    when('[t0] the map is not gitignored', () => {
      then('it refuses', async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        // rename the map out from under the ignore rule
        fs.renameSync(
          path.join(scene.dir, '.pii-map'),
          path.join(scene.dir, 'visible-map.tsv'),
        );

        const result = runSkill({
          args: [
            '--map',
            'visible-map.tsv',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
          ],
          cwd: scene.dir,
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('not gitignored');
      });
    });
  });

  given('[case5] an --into equal to --from', () => {
    when('[t0] the swap is planned', () => {
      then('it refuses, so the source stays intact', async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });

        const result = runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirFrom,
          ],
          cwd: scene.dir,
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('must differ');
      });
    });
  });

  given('[case6] plan mode', () => {
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'Jane Doe\tPat Roe\n',
        docs: { 'deed.md': 'signed by Jane Doe\n' },
      }),
    );

    when('[t0] the swap is planned', () => {
      then('it writes no output and masks the real values', () => {
        const result = runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
          ],
          cwd: scene.dir,
        });

        expect(result.exitCode).toBe(0);
        expect(fs.existsSync(scene.dirInto)).toBe(false);
        expect(result.stdout).not.toContain('Jane Doe');
        expect(result.stdout).toContain('Pat Roe');
      });
    });
  });

  given('[case7] a swapped document', () => {
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'Jane Doe\tPat Roe\n',
        docs: { 'deed.md': 'signed by Jane Doe\n' },
      }),
    );

    when('[t0] the swap is applied', () => {
      const result = useThenApply(scene);

      then('it succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      then('the output is marked synthetic on its first line', () => {
        const out = fs.readFileSync(path.join(scene.dirInto, 'deed.md'), UTF8);
        expect(out.startsWith('<!-- SYNTHETIC DOCUMENT')).toBe(true);
      });
    });
  });

  given('[case8] a PATH with no perl on it', () => {
    // ⛔ `perl` IS the swap. an absent one does not degrade the output,
    //    it aborts the run partway through — which is the one state
    //    this skill must never leave behind. eight neighbor skills
    //    already check what they call; this one did not.
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'Jane Doe\tPat Roe\n',
        docs: { 'deed.md': 'signed by Jane Doe\n' },
      }),
    );

    when('[t0] the swap is applied', () => {
      const result = useBeforeAll(async () => {
        // a PATH that holds every tool the skill uses EXCEPT perl,
        // built by symlink so the check fails on the one that matters.
        //
        // ⚠️ `bash` itself must be on it. without it the spawn fails
        //    before the skill runs at all, and the empty stdout looks
        //    exactly like a skill that blocked without a message
        const bin = path.join(scene.dir, 'thinbin');
        fs.mkdirSync(bin, { recursive: true });
        const whichOf = (tool: string): string =>
          (spawnSync('which', [tool], { encoding: UTF8 }).stdout ?? '').trim();
        for (const tool of [
          'bash',
          'env',
          'git',
          'grep',
          'cp',
          'mv',
          'rm',
          'cat',
          'mkdir',
          'mktemp',
          'dirname',
          'sort',
          'cut',
          'tr',
          'sed',
          'awk',
          'find',
          'wc',
        ]) {
          const real = whichOf(tool);
          if (real) fs.symlinkSync(real, path.join(bin, tool));
        }

        const res = spawnSync(
          whichOf('bash'),
          [
            scriptPath,
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--mode',
            'apply',
          ],
          {
            cwd: scene.dir,
            encoding: UTF8,
            env: { ...process.env, PATH: bin },
            stdio: ['pipe', 'pipe', 'pipe'],
          },
        );
        return {
          stdout: res.stdout ?? '',
          stderr: res.stderr ?? '',
          exitCode: res.status ?? 1,
        };
      });

      then('it blocks up front and names the absent tool', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('perl');
      });

      then('it never created the publish directory at all', () => {
        // ⭐ the property that matters. a check that ran too LATE would
        //    still exit 2, but it would have left a directory behind
        expect(fs.existsSync(scene.dirInto)).toBe(false);
      });
    });
  });

  given('[case9] a run that dies partway through the swap loop', () => {
    // 🚨 the safety property, tested directly rather than by proxy.
    //
    //    the swap used to `cp` the source into the publish directory and
    //    then edit it IN PLACE, so for the full width of the loop the
    //    REAL document sat in the directory the operator publishes from.
    //    an abort in that window left file N as the real document, among
    //    correctly-swapped neighbors, with no marker to tell them apart —
    //    which reads as a partial success rather than as a crash.
    //
    //    the most likely trigger needs no bug at all: a human hits ctrl-C.
    //    here it is provoked by a perl that dies on its SECOND call, so
    //    the abort lands mid-document with one pair already applied.
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'Jane Doe\tPat Roe\nAcme Holdings\tNorthwind Corp\n',
        docs: { 'deed.md': 'Jane Doe of Acme Holdings, signed.\n' },
      }),
    );

    when('[t0] perl fails on its second invocation', () => {
      const result = useBeforeAll(async () => {
        const bin = path.join(scene.dir, 'flakybin');
        fs.mkdirSync(bin, { recursive: true });

        const realPerl = (
          spawnSync('which', ['perl'], { encoding: UTF8 }).stdout ?? ''
        ).trim();

        // a counter on disk, so it survives across the two spawns
        fs.writeFileSync(
          path.join(bin, 'perl'),
          [
            '#!/usr/bin/env bash',
            `count="${bin}/.calls"`,
            'n=$(cat "$count" 2>/dev/null || echo 0)',
            'n=$((n + 1))',
            'echo "$n" > "$count"',
            '[[ "$n" -ge 2 ]] && exit 1',
            `exec ${realPerl} "$@"`,
          ].join('\n'),
        );
        fs.chmodSync(path.join(bin, 'perl'), 0o755);

        const res = spawnSync(
          'bash',
          [
            scriptPath,
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--mode',
            'apply',
          ],
          {
            cwd: scene.dir,
            encoding: UTF8,
            env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
            stdio: ['pipe', 'pipe', 'pipe'],
          },
        );
        return {
          stdout: res.stdout ?? '',
          stderr: res.stderr ?? '',
          exitCode: res.status ?? 1,
        };
      });

      then('the run does not succeed', () => {
        expect(result.exitCode).not.toBe(0);
      });

      then('NO real value survives in the publish directory', () => {
        // ⭐ the clamp. under the old cp-then-edit-in-place shape this
        //    directory held `deed.md` with "Jane Doe" swapped and the
        //    second value still in the clear — a real document that
        //    reads as published, under a synthetic filename
        const present = fs.existsSync(scene.dirInto)
          ? readAll(scene.dirInto)
          : '';
        expect(present).not.toContain('Jane Doe');
        expect(present).not.toContain('Acme Holdings');
      });

      then('an abort leaves the file ABSENT, not real', () => {
        // the safe direction, and a detectable one — a count that does
        // not match is a signal; a real document that looks swapped is
        // not
        expect(fs.existsSync(path.join(scene.dirInto, 'deed.md'))).toBe(false);
      });
    });
  });

  given('[case10] a mapped value that HARD-WRAPS across a line break', () => {
    // ⛔ the swap is `perl -pe`, whose body is wrapped in `while(<>)`,
    //    so a pattern can never span a newline. --verify used `grep`,
    //    line-scoped for the same reason. a verification that reuses
    //    the edit's matcher inherits the edit's blind spot and always
    //    reports clean.
    //
    //    an address block in an OCR transcript wraps as a matter of
    //    course, and rule.require.provable-pseudonymization puts
    //    "home and business addresses" on the swap list by name.
    const scene = useBeforeAll(() =>
      genRepo({
        map: '1200 Sandpine Harbor Way\t12 Example Way\n',
        docs: {
          // the real value, split exactly as a form's address block
          // splits it. one token per line, no single line holds it
          'deed.md': ['Address:  1200 Sandpine', 'Harbor Way, Suite 400'].join(
            '\n',
          ),
        },
      }),
    );

    when('[t0] applied, then verified', () => {
      const result = useBeforeAll(async () => {
        runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--mode',
            'apply',
          ],
          cwd: scene.dir,
        });
        return runSkill({
          args: ['--map', '.pii-map', '--verify', scene.dirInto],
          cwd: scene.dir,
        });
      });

      then('the swap genuinely did NOT land — the setup is real', () => {
        // ⭐ the positive control for the fixture itself. if the swap
        //    HAD landed, a clean verify would be correct and this case
        //    would prove no thing at all
        const out = fs.readFileSync(path.join(scene.dirInto, 'deed.md'), UTF8);
        expect(out).toContain('1200 Sandpine');
        expect(out).toContain('Harbor Way');
        expect(out).not.toContain('12 Example Way');
      });

      then('verify refuses — it does not report clean', () => {
        // ⭐ the clamp. before the wrap-aware pass this printed
        //    `clean.` and exited 0, clearing the tree for publication
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('survivors');
        expect(result.stdout).not.toContain('clean.');
      });

      then('it labels the channel [wrap], so the cure is legible', () => {
        // a wrap hit cannot be fixed by a re-run — the value spans a
        // line break, so no line-scoped edit reaches it. the source
        // document is what has to change, and the label says so
        //
        // ⛔ assert the ROW, never the bare token. the exit line is a legend
        //    that names all three channels, so `toContain('[wrap]')` matched
        //    on ANY survivor on ANY channel — it was unfalsifiable
        expect(result.stdout).toMatch(/└─ \[wrap\]\s+\S*deed\.md/);
        // ⭐ the discriminator. this value spans a line break, so the
        //    line-scoped [content] pass CANNOT see it. a [content] label here
        //    would mean the report is wrong about which pass found it — and
        //    about the cure it prints
        expect(result.stdout).not.toMatch(/└─ \[content\]/);
      });

      then('it masks the real value in its own report', () => {
        expect(result.stdout).not.toContain('1200 Sandpine Harbor Way');
      });
    });
  });

  given('[case11] a clean tree, checked by the wrap-aware pass too', () => {
    // the negative control for [case10]. the second matcher is looser
    // than the first by construction, so it is exactly the kind of
    // check that starts to cry wolf. a correctly-swapped corpus must
    // still verify clean, or the whole guard gets disabled
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'Jane Doe\tPat Roe\nAcme Holdings\tNorthwind Corp\n',
        docs: {
          'deed.md': ['Jane Doe of', 'Acme Holdings, signed.'].join('\n'),
        },
      }),
    );

    when('[t0] applied, then verified', () => {
      const result = useBeforeAll(async () => {
        runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--mode',
            'apply',
          ],
          cwd: scene.dir,
        });
        return runSkill({
          args: ['--map', '.pii-map', '--verify', scene.dirInto],
          cwd: scene.dir,
        });
      });

      then('it reports clean with zero survivors', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('survivors');
        expect(result.stdout).toContain('0');
      });

      then('no [wrap] channel is reported', () => {
        // ⚠️ anchored on the ROW, not the token — the token also appears in
        //    the exit legend. on a clean run that legend never prints, so
        //    this assertion is vacuous either way; it is kept as a structural
        //    negative control that would bite if a clean run ever emitted a
        //    channel row. the clean assertion that carries the weight is the
        //    one above
        expect(result.stdout).not.toMatch(/└─ \[wrap\]/);
      });
    });
  });

  /**
   * ⛔ the marker is the widest claim the skill makes, and it is the
   *    worst-placed one. `pii.scan` and `doc.sign` print their warranties
   *    to stdout, where they scroll away. this one is written INTO every
   *    output file, so a downstream reader inherits it as text.
   *
   *    it used to read "every name, number, address, and identifier below
   *    was replaced." no code establishes that, and none could:
   *    `run_verify` iterates `read_map_sorted`, so an identifier nobody
   *    mapped is invisible to the swap AND to the check.
   *
   * ⚠️ [case12] and [case13] cover the SAME defect from opposite
   *    directions, per rule.require.audit-guards-by-input-type's
   *    both-directions walk. neither alone rules out the plausible-but-
   *    wrong fix; see the note on each.
   */
  given('[case12] a file that carries an identifier NOT in the map', () => {
    const scene = useBeforeAll(async () =>
      genRepo({
        map: 'Jane Doe\tPat Roe\n',
        docs: {
          // `Jane Doe` IS mapped and swaps. the EIN is NOT mapped, so it
          // survives untouched — exactly the case the old marker lied about
          'deed.md': 'signed by Jane Doe, EIN 00-0000000\n',
        },
      }),
    );

    when('[t0] applied with the marker on', () => {
      const result = useThenApply(scene);

      then('it succeeds and the unmapped identifier survives verbatim', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);

        const out = readAll(scene.dirInto);
        expect(out).toContain('Pat Roe');
        // the ground truth this whole case rests on: a value outside the
        // map is carried through unchanged
        expect(out).toContain('EIN 00-0000000');
      });

      /**
       * ⭐ THE RULING-OUT CLAMP, and note WHICH wrong fix it rules out —
       *    ⛔ MEASURED, because the first guess about this was BACKWARDS.
       *
       *    the plausible-but-wrong fix here is "state the count and stop"
       *    — emit `1 of 1 mapped pair(s)` and omit the limit sentences. a
       *    bare count reads as a completeness report, so it still
       *    overclaims, just by silence instead of by assertion. THIS file
       *    is the one that proves the silence is a lie: it demonstrably
       *    carries `EIN 00-0000000`, which the map never covered.
       *
       *    ✅ counterfactual C — drop the two limit lines from the marker:
       *       [case12] 1 RED · [case13] both green.
       *
       * ⚠️ [case12] does NOT catch "gate the marker on a nonzero count."
       *    this file has a nonzero count, so it takes the marker either
       *    way and stays fully green. [case13] is the case that catches
       *    that one — see its note. the two are not redundant and neither
       *    substitutes for the other.
       */
      then('the marker claims no more than the map covers', () => {
        const out = readAll(scene.dirInto);

        // the warranty is gone
        expect(out).not.toContain('every name, number, address, and');

        // a counted figure replaced it, measured against the map width
        expect(out).toContain('1 of 1 mapped pair(s)');

        // and the limit is stated in the artifact, not merely in a brief
        expect(out).toContain('as wide as that map');
        expect(out).toContain('never mapped was never swapped');
      });
    });
  });

  given('[case13] a file that matches NO mapped pair at all', () => {
    const scene = useBeforeAll(async () =>
      genRepo({
        map: 'Jane Doe\tPat Roe\n',
        docs: { 'notes.md': 'no mapped value appears here\n' },
      }),
    );

    when('[t0] applied with the marker on', () => {
      const result = useThenApply(scene);

      then('it succeeds and reports zero swaps for the file', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(readAll(scene.dirInto)).toContain('0 of 1 mapped pair(s)');
      });

      /**
       * ⭐ THE LET-THROUGH CLAMP — the input the guard must NOT refuse,
       *    per rule.require.audit-guards-by-input-type's both-directions
       *    walk. and it is the ONLY case that rules out the most
       *    tempting wrong fix.
       *
       *    that fix is "gate the marker on a nonzero swap count," which
       *    sounds like honesty and is the opposite: it strips the marker
       *    from a zero-swap file, and a zero-swap file is precisely the
       *    one that needs "NOT a record of any real entity or person"
       *    MOST — it looks least touched, so it is likeliest to be
       *    mistaken for a real record.
       *
       *    ✅ counterfactual B — add `&& $swaps_file -gt 0` to the marker
       *       condition: [case13] both RED · [case12] both green · every
       *       other case in this file green.
       *
       *    ⛔ so a guard that strips the disclaimer from the file that
       *       needs it most is worse than the warranty it replaced, and
       *       [case13] is the only thing standing between the two.
       */
      then('the unconditional disclaimer is still present', () => {
        const out = readAll(scene.dirInto);
        expect(out).toContain('SYNTHETIC DOCUMENT');
        expect(out).toContain('NOT a record of any real entity or person');
      });
    });
  });

  /**
   * ⛔ THE THIRD MATCHER — and the axis this file states and does not walk.
   *
   *    `run_verify` searches for one mapped value through THREE channels,
   *    inside one loop body, and they did not agree about letter-case:
   *
   *      [content]  grep -Frl   ⛔ case-SENSITIVE
   *      [path]     grep -Fi    ✅ case-INsensitive
   *      [wrap]     grep -Fq    ⛔ case-SENSITIVE
   *
   *    the skill's own header already rules on this, in terms:
   *
   *      "a verification that reuses the edit's matcher inherits the
   *       edit's blind spot and always reports clean."
   *
   *    that sentence rejects "verify should match what the swap matched."
   *    it is why [wrap] exists at all. and [path] is `-Fi` for the same
   *    reason — a leak does not care about case. so the principle was
   *    stated once and applied to two of three channels.
   *
   * 🚩 the consequence is MEASURED, not hypothetical. a real corpus of 28
   *    pairs carries a real person's name in an ALL-CAPS form; `pii.scan`
   *    reports it (its roster match is `grep -noFif`) and this skill's
   *    --verify reported `survivors: 0` over the same directory.
   *
   *    two guards, one map, opposite verdicts — because the matcher is
   *    the guard, not the map.
   *
   * ⚠️ this does NOT touch the swap. `perl -pe` stays case-sensitive, so
   *    the longest-first correctness property [case1] clamps is untouched.
   *    verify reports a survivor the swap cannot fix — exactly what [wrap]
   *    already does, and the reason both channels label their cure.
   */
  given(
    '[case14] a mapped value that appears in a DIFFERENT letter-case',
    () => {
      const REAL = 'Jane Doe';
      const UPPER = 'JANE DOE';

      const scene = useBeforeAll(async () =>
        genRepo({
          map: `${REAL}\tPat Roe\n`,
          docs: {
            'deed.md': [`Grantor: ${REAL}`, `Witnessed by ${UPPER}`].join('\n'),
          },
        }),
      );

      when('[t0] applied, then verified', () => {
        const result = useBeforeAll(async () => {
          runSkill({
            args: [
              '--map',
              '.pii-map',
              '--from',
              scene.dirFrom,
              '--into',
              scene.dirInto,
              '--mode',
              'apply',
            ],
            cwd: scene.dir,
          });
          return runSkill({
            args: ['--map', '.pii-map', '--verify', scene.dirInto],
            cwd: scene.dir,
          });
        });

        /**
         * ⭐ THE POSITIVE CONTROL, and it is mandatory.
         *
         *    the assertion below is that verify BLOCKS. a block is satisfied
         *    just as well by a swap that failed outright as by a swap that
         *    correctly left the upper-case form alone. this pins that the
         *    title-case form WAS swapped and the upper-case one WAS NOT —
         *    i.e. that the fixture exercises the case axis and not some
         *    unrelated breakage.
         */
        then(
          '⭐ the swap landed on the title-case form and NOT the upper',
          () => {
            const out = readAll(scene.dirInto);
            if (out.includes(REAL) || !out.includes(UPPER)) {
              console.log('PROOF: output:', out);
            }
            expect(out).toContain('Pat Roe');
            expect(out).not.toContain(REAL);
            expect(out).toContain(UPPER);
          },
        );

        then('⭐ verify REPORTS it — a leak does not care about case', () => {
          if (result.exitCode !== 2) {
            console.log('PROOF: stdout:', result.stdout);
            console.log('PROOF: stderr:', result.stderr);
          }
          expect(result.exitCode).toBe(2);
        });

        /**
         * ⛔ ASSERT THE REPORT LINE, NEVER THE BARE CHANNEL TOKEN.
         *
         *    the first draft of this was `toContain('[content]')`, and it
         *    was UNFALSIFIABLE — the skill's final line is a legend that
         *    names all three channels:
         *
         *      [content] = a re-run may fix · [path] + [wrap] = fix the source
         *
         *    so the bare token matches on ANY survivor, on ANY channel. with
         *    the `-i` reverted this case still reported the leak (as [wrap],
         *    the wrong label) and the assertion stayed green.
         *
         * ⚠️ the `not [wrap]` half is the discriminator. a [wrap] label sends
         *    the human to "fix the source" when the real cure is a map pair
         *    plus a re-run — so the CHANNEL is the actionable output here,
         *    not merely the block.
         */
        then('⭐ it is reported on [content], NOT mislabeled [wrap]', () => {
          if (!/└─ \[content\]/.test(result.stdout)) {
            console.log('PROOF: stdout:', result.stdout);
          }
          expect(result.stdout).toMatch(/└─ \[content\]\s+\S*deed\.md/);
          expect(result.stdout).not.toMatch(/└─ \[wrap\]/);
        });

        /**
         * ⚠️ the final line used to read "the swap did not land." that is
         *    true of a content hit the swap COULD have made and did not, and
         *    false of the other two channels — [path] names a directory this
         *    skill never wrote, and [wrap] names a value no line-scoped edit
         *    can reach. a case-variant is the same shape: the cure is a new
         *    map pair, never a re-run.
         */
        then('the final line does not blame a re-run for every channel', () => {
          expect(result.stdout).not.toContain('the swap did not land.');
        });
      });
    },
  );

  /**
   * ⭐ [case14] CANNOT CLAMP THE [wrap] MATCHER, and that is why this
   *    case exists.
   *
   *    the two `-i` flags are separate edits, so each needs a case that
   *    reddens on ITS OWN revert. in [case14] the value sits on one line,
   *    so the line-scoped [content] pass sees it and the case stays green
   *    whatever [wrap] does — coverage is per-ASSERTION, not per-CASE.
   *
   *    a value that is BOTH wrapped AND re-cased is invisible to
   *    [content] by construction: `grep` is line-scoped, so no flag on it
   *    can span the break. only the collapsed-whitespace pass can reach
   *    it, and only if that pass folds case.
   *
   * ⚠️ note the swap never runs here either — `perl -pe` wraps its body in
   *    `while(<>)`, and the `grep -Fq` gate at the swap is case-sensitive
   *    besides. so the document is unchanged and the leak is real.
   */
  given('[case15] a mapped value that is BOTH wrapped and re-cased', () => {
    const REAL = '1200 Sandpine Harbor Way';

    const scene = useBeforeAll(async () =>
      genRepo({
        map: `${REAL}\t900 Northwind Plaza\n`,
        docs: {
          'lease.md': [
            'Address:  1200 SANDPINE HARBOR',
            '  WAY, Suite 400',
          ].join('\n'),
        },
      }),
    );

    when('[t0] applied, then verified', () => {
      const result = useBeforeAll(async () => {
        runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--mode',
            'apply',
          ],
          cwd: scene.dir,
        });
        return runSkill({
          args: ['--map', '.pii-map', '--verify', scene.dirInto],
          cwd: scene.dir,
        });
      });

      // ⭐ the positive control: the wrapped value really did survive the
      //    swap, so the block below is about DETECTION and not about a
      //    swap that happened to succeed
      then('⭐ the wrapped value survived the swap, in upper case', () => {
        const out = readAll(scene.dirInto);
        if (!out.includes('1200 SANDPINE HARBOR')) {
          console.log('PROOF: output:', out);
        }
        expect(out).toContain('1200 SANDPINE HARBOR');
        expect(out).not.toContain('900 Northwind Plaza');
      });

      then('⭐ verify BLOCKS — the wrap pass folds case too', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      // ⚠️ [content] is line-scoped and CANNOT see this, `-i` or not. so a
      //    [content] label here would mean the report is wrong about which
      //    pass found it — and about the cure it prints
      then('⭐ it is reported on [wrap], which [content] cannot reach', () => {
        expect(result.stdout).toMatch(/└─ \[wrap\]\s+\S*lease\.md/);
        expect(result.stdout).not.toMatch(/└─ \[content\]/);
      });
    });
  });

  /**
   * .what = the arg-parse arms no other case reaches
   *
   * .why  = an ARM WALK of doc.pseudonymize.sh:74-91 found FIVE arms with
   *         zero coverage anywhere in the repo — the `-h` alias, the
   *         rhachet passthrough, `--glob`, `--marker`, and the `*)`
   *         refusal. every one is a line each invocation runs PAST, so a
   *         line-coverage report scores the block at 100% and reports no
   *         gap. only a walk of the `case` arms finds them.
   *
   * ⛔ this skill has NO `-*` arm — `*)` catches an unknown option AND a
   *    stray positional, and refuses both. so the discriminator is
   *    inverted from the skills that carry both arms: here a dead arm
   *    lands on a REFUSAL that names the value, and the danger is a
   *    refusal that names the WRONG value.
   *
   * ⚠️ `--glob` is the sharpest of the five. it feeds `find -name` at
   *    :317, so it decides WHICH REAL DOCUMENTS GET SWAPPED. a value that
   *    never reaches GLOB leaves the default `*.md` in force, every
   *    non-md document is never opened, and the run reports success over
   *    a set it silently narrowed — an unswapped real document, published
   *    under a report that says the swap is done.
   *
   * ⚠️ this is [case16], not [case14] — `[case14]` is taken above, by the
   *    letter-case block. that block is declared across TWO LINES, with
   *    `given(` on one and its label on the next, so a single-line grep
   *    for `given('[case` cannot see it. the file then READS as 1-13,15,
   *    and the absent 14 looks like a free gap rather than an occupied
   *    slot. a label collision fails no test; it just makes two blocks
   *    indistinguishable in a report.
   *
   *    so the enumerator must be multiline-aware. the same defect has
   *    THREE causes now, and each hides the label from a different
   *    instrument: a `given.skip` (invisible in the RUN OUTPUT), an
   *    out-of-order sequence (visible but mis-read), and this one
   *    (invisible to a SOURCE GREP).
   */
  given('[case16] the arg-parse arms', () => {
    const scene = useBeforeAll(() =>
      genRepo({
        map: 'ACMEWIDGET\tNORTHWIND\n',
        docs: {
          'deed.md': 'ACMEWIDGET, INC.\n',
          'notes.txt': 'ACMEWIDGET, INC.\n',
        },
      }),
    );

    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['-h'], cwd: scene.dir }),
      );

      then('it prints the header and exits clean', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('swap real identifiers for synthetic');
      });

      then('⭐ it does NOT render the shebang and stop', () => {
        // .why = TWO defects hide behind a bare `exitCode === 0` here.
        //   1. drop `-h` from `--help|-h` and it falls to `*)`, so a HELP
        //      REQUEST is refused as `unknown argument: -h` at exit 2.
        //   2. ⛔ the renderer is the `awk '/^####/ ...'` idiom that task
        //      #98 caught rendering `!/usr/bin/env bash` AND NO OTHER
        //      LINE — silently, at exit 0, with empty stderr. no
        //      automated signal exists for that but an assertion on the
        //      BODY.
        expect(result.stdout).not.toContain('!/usr/bin/env bash');
        expect(result.stdout).not.toContain('unknown argument');
      });
    });

    when('[t1] rhachet passes --skill, --repo and --role', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--skill',
            'doc.pseudonymize',
            '--repo',
            'rhight',
            '--role',
            'transcriber',
          ],
          cwd: scene.dir,
        }),
      );

      then('⭐ it plans the swap, not the flag value', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('deed.md');
      });

      then('it does NOT read a flag value as an argument', () => {
        // .why = `shift 2` -> `shift` on that arm and `doc.pseudonymize`
        //        survives as a bare word, so it lands on `*)` and the run
        //        is refused as `unknown argument: doc.pseudonymize` — the
        //        skill names ITS OWN NAME as the caller's mistake.
        expect(result.stdout).not.toContain('unknown argument');
      });
    });

    when('[t2] --glob narrows the set to a non-md extension', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--glob',
            '*.txt',
          ],
          cwd: scene.dir,
        }),
      );

      then('the report states the glob it was handed', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('glob: *.txt');
      });

      then('⭐ the file set FOLLOWS the glob, and excludes the default', () => {
        // .why = a value that never reaches GLOB leaves `*.md` in force.
        //        the run then opens `deed.md`, never opens `notes.txt`,
        //        and reports success — so a REAL document ships with its
        //        real identifiers intact, under a report that says the
        //        swap is done. ⛔ the report's own `glob` line is NOT
        //        enough on its own: a defect that echoes the flag while
        //        the find still uses the default satisfies it exactly.
        expect(result.stdout).toContain('notes.txt');
        expect(result.stdout).not.toContain('deed.md');
      });
    });

    when('[t3] --marker false is given', () => {
      const result = useBeforeAll(async () => {
        const dirInto = path.join(scene.dir, 'nomarker');
        runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            dirInto,
            '--marker',
            'false',
            '--mode',
            'apply',
          ],
          cwd: scene.dir,
        });
        // ⚠️ wrapped in an object on purpose. `useBeforeAll` hands back a
        //    PROXY, so a bare string return cannot be asserted directly —
        //    `expect(proxy).toContain(...)` throws `received is not
        //    iterable`, which reads as a skill defect and is a harness one.
        return { body: readAll(dirInto) };
      });

      // ⭐ the positive control, and it is MANDATORY here. every decisive
      //    assertion below is an ABSENCE, and an absent file satisfies an
      //    absence trivially — so without this, "no marker" and "the run
      //    wrote no file at all" are the same green.
      then('⭐ the swap still ran — the output carries the fake value', () => {
        expect(result.body).toContain('NORTHWIND');
        expect(result.body).not.toContain('ACMEWIDGET');
      });

      then('the marker is absent from the output', () => {
        // .why = `--marker` has zero coverage, so the OFF path is never
        //        taken. a defect that ignores the flag emits the banner
        //        on every artifact regardless, and a caller who asked for
        //        a bare document gets a marked one with no notice.
        expect(result.body).not.toContain('SYNTHETIC DOCUMENT');
      });
    });

    when('[t4] an unknown option is given', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--wat'], cwd: scene.dir }),
      );

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the OPTION, not an absent --map', () => {
        // .why = `--wat` reaches `*)` BEFORE any validation runs. change
        //        `*)` to swallow instead of refuse and the run falls
        //        through to `--map is required` — a refusal that sends a
        //        human to check a flag they DID supply, for a run whose
        //        real fault was a typo two flags earlier.
        // ⚠️ BOTH refuse at exit 2, so only the message can tell "the arm
        //    ran" from "the arm is gone". that is leak 6 of
        //    rule.require.assertions-that-discriminate.
        expect(result.stdout).toContain('unknown argument: --wat');
        expect(result.stdout).not.toContain('--map is required');
      });
    });
  });

  /**
   * ⛔ EVERY ARM BELOW REFUSES AT EXIT 2, so a clamp on the code cannot tell
   *    "the guard ran" from "the guard is gone" — delete one and the run falls
   *    through to the NEXT guard, which refuses at exit 2 as well. only the
   *    MESSAGE separates them. leak 6 of
   *    rule.require.assertions-that-discriminate.
   *
   * ⚠️ surfaced by `rhx audit.refusal.messages`, which reported ELEVEN refusal
   *    sites in this file with no asserted message.
   *
   * ⭐ [t0] is the sharpest. the map is the RE-IDENTIFICATION KEY, and
   *    rule.require.provable-pseudonymization states the guarantee in terms —
   *    the skill "refuses to run against a map that git TRACKS or does not
   *    ignore". only the does-not-ignore half had a case ([case4]). the TRACKS
   *    half — the one that keeps the key out of a commit — had none, and the
   *    two guards sit four lines apart and both name the map, so a loose token
   *    could not have told them apart either.
   */
  given('[case17] the map guards', () => {
    when('[t0] the map is TRACKED by git', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        // a map git already tracks. it is also un-ignored, which is what makes
        // the discriminator below bite: drop the tracked guard and the run
        // lands on the ignore guard, at the same exit 2
        fs.writeFileSync(
          path.join(scene.dir, 'tracked-map.tsv'),
          'Jane Doe\tPat Roe\n',
        );
        spawnSync('git', ['add', 'tracked-map.tsv'], { cwd: scene.dir });

        return runSkill({
          args: [
            '--map',
            'tracked-map.tsv',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
          ],
          cwd: scene.dir,
        });
      });

      then('it refuses', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it says the map must never be COMMITTED', () => {
        expect(result.stdout).toContain('must never be committed');
      });

      then(
        '⭐ and NOT that the map is un-ignored — that is the next guard',
        () => {
          expect(result.stdout).not.toContain('not gitignored');
        },
      );
    });

    when('[t1] --map is absent', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: ['--from', scene.dirFrom, '--into', scene.dirInto],
          cwd: scene.dir,
        });
      });

      then('it refuses and names the FLAG', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--map is required');
      });

      then(
        '⭐ and NOT an absent FILE — that is the guard one line down',
        () => {
          expect(result.stdout).not.toContain('map not found');
        },
      );
    });

    when('[t2] --map names a file that is not there', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: [
            '--map',
            'no-such-map.tsv',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
          ],
          cwd: scene.dir,
        });
      });

      then('it refuses and names the PATH', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('map not found: no-such-map.tsv');
      });

      then('⭐ and NOT an absent flag — the flag WAS supplied', () => {
        expect(result.stdout).not.toContain('--map is required');
      });
    });

    when('[t3] the map holds no pairs', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: '# a comment, and no pair beneath it\n\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
          ],
          cwd: scene.dir,
        });
      });

      then('it refuses rather than emit an unswapped copy', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('map holds no pairs');
      });

      then('⭐ and NOT that the map is absent — it was read', () => {
        expect(result.stdout).not.toContain('map not found');
      });
    });
  });

  given('[case18] the directory guards', () => {
    when('[t0] --from is absent', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: ['--map', '.pii-map', '--into', scene.dirInto],
          cwd: scene.dir,
        });
      });

      then('it refuses and names --from', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--from is required');
      });

      then('⭐ and NOT --into, which was supplied', () => {
        expect(result.stdout).not.toContain('--into is required');
      });
    });

    when('[t1] --into is absent', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: ['--map', '.pii-map', '--from', scene.dirFrom],
          cwd: scene.dir,
        });
      });

      then('it refuses and names --into', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--into is required');
      });

      then('⭐ and NOT --from, which was supplied', () => {
        expect(result.stdout).not.toContain('--from is required');
      });
    });

    when('[t2] --from names a directory that is not there', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            path.join(scene.dir, 'no-such-dir'),
            '--into',
            scene.dirInto,
          ],
          cwd: scene.dir,
        });
      });

      then('it refuses and names the SOURCE', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('source not found:');
      });

      then(
        '⭐ and NOT a no-match report — the guard sits ABOVE the find',
        () => {
          // ⛔ the exclusion names the MEASURED fall-through, not the adjacent
          //    guard. drop the `-d` check and `--from` is still set, so the
          //    `--from is required` arm is unreachable either way — an exclusion
          //    on it could never go red. what the run DOES reach is the `find`,
          //    which matches no file under a path that is not there and refuses
          //    at the same exit 2 with `no files matched`. that is the message a
          //    human would be handed, and it blames the GLOB for an absent
          //    DIRECTORY
          expect(result.stdout).not.toContain('no files matched');
        },
      );
    });

    when('[t3] --mode is neither plan nor apply', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--mode',
            'wat',
          ],
          cwd: scene.dir,
        });
      });

      then('⭐ it refuses and ECHOES the value it was handed', () => {
        // .why = the value is the whole diagnostic. a refusal that names the
        //        flag but not the typo sends a human back to guess
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(
          '--mode must be plan or apply, got: wat',
        );
      });

      then('⭐ and it does NOT fall through to a swap', () => {
        expect(result.stdout).not.toContain('mapped pair(s)');
      });
    });

    when('[t4] --verify names a directory that is not there', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: [
            '--map',
            '.pii-map',
            '--verify',
            path.join(scene.dir, 'no-such-dir'),
          ],
          cwd: scene.dir,
        });
      });

      then(
        '⭐ it refuses rather than report a clean verify over no files',
        () => {
          // ⛔ this is the dangerous one. an absent target that verified CLEAN
          //    would read as proof the corpus is safe, over a corpus never read
          expect(result.exitCode).toBe(2);
          expect(result.stdout).toContain('verify target not found:');
        },
      );

      then('⭐ and it never claims zero survivors', () => {
        expect(result.stdout).not.toContain('survivors: 0');
      });
    });

    when('[t5] the glob matches no file under --from', () => {
      const result = useBeforeAll(async () => {
        const scene = await genRepo({
          map: 'Jane Doe\tPat Roe\n',
          docs: { 'deed.md': 'signed by Jane Doe\n' },
        });
        return runSkill({
          args: [
            '--map',
            '.pii-map',
            '--from',
            scene.dirFrom,
            '--into',
            scene.dirInto,
            '--glob',
            '*.txt',
          ],
          cwd: scene.dir,
        });
      });

      then('⭐ it refuses rather than emit an EMPTY publish directory', () => {
        // ⛔ a silent empty output reads as "the corpus held no PII" rather
        //    than "the glob matched no file"
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain("no files matched '*.txt'");
      });

      then('⭐ and NOT an absent source — the directory WAS there', () => {
        expect(result.stdout).not.toContain('source not found');
      });
    });
  });
});
