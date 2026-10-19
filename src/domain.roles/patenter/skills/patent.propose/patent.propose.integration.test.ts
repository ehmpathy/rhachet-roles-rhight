import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, useThen, when } from 'test-fns';

describe('patent.propose.sh', () => {
  const scriptPath = path.join(__dirname, 'patent.propose.sh');

  /**
   * .what = replace the two volatile tokens in stdout, so the snapshot can be
   *         committed and still mean something tomorrow
   *
   * .why  = both of these change on EVERY run:
   *
   *         1. the route slug is stamped with TODAY's date (v2026_08_30.…),
   *            so a committed snapshot goes red at midnight and each run
   *            rewrites the file
   *         2. the temp dir carries a timestamp AND a random suffix AND the
   *            checkout's directory name, so it differs between two worktrees
   *            of one repo, and between a laptop and CI
   *
   *         a snapshot exists to catch a change in BEHAVIOR. one that changes
   *         on its own catches none, and worse: it trains every reader to wave
   *         through its diff, which is where a real regression hides.
   *
   * .note = the date SHAPE is still clamped, by the `/^v\d{4}_\d{2}_\d{2}\./`
   *         assertion in [case1]. no coverage is lost here that a real
   *         assertion does not already hold.
   *
   * ⚠️ the exact-string split ALONE is not enough, and the reason is worth
   *    keeping: the skill prints a path built from `git rev-parse
   *    --show-toplevel`, which is CANONICALIZED. `genTempDir` returns the
   *    path it created. the two name one directory and can differ as strings,
   *    so a `.split(tempDir)` silently matches zero times and leaves the
   *    random suffix in the snapshot — which is precisely how this file came
   *    to churn on every run while every test stayed green.
   *
   *    so both run: the exact split first (precise when it matches), then a
   *    shape-keyed regex that covers the canonicalization gap.
   */
  const scrub = (input: { stdout: string; tempDir: string }): string =>
    input.stdout
      .split(input.tempDir)
      .join('$TMP')
      // <anything>/.temp/<timestamp>.<slug>.<hash> -> $TMP
      .replace(/\S*\/\.temp\/[^/\s]+/g, '$TMP')
      .replace(/v\d{4}_\d{2}_\d{2}\.patent\.propose/g, 'v$DATE.patent.propose');

  const runPropose = (input: {
    proposeArgs: string[];
    tempDir: string;
    env?: Record<string, string>;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.proposeArgs], {
      cwd: input.tempDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...(input.env ?? {}) },
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = read the one route directory this skill created
   *
   * .why  = several clamps below relate STDOUT to the FILESYSTEM. that
   *         relation is the whole point — the extant assertions read only the
   *         filesystem, so the printed report could name a different set of
   *         files, or no files at all, and every one of them stays green.
   *
   * ⚠️ it REFUSES rather than returns a default when the count is not 1. a
   *    helper that falls through on a miss makes every clamp below it
   *    vacuous, under a name that promises the route.
   */
  const getRoutePath = (input: { tempDir: string }): string => {
    const routeDirs = fs.readdirSync(path.join(input.tempDir, '.route'));
    if (routeDirs.length !== 1)
      throw new Error(
        `expected exactly 1 route dir, found ${routeDirs.length}: ${routeDirs.join(', ')}`,
      );
    return path.join(input.tempDir, '.route', routeDirs[0]!);
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

        /**
         * ⭐ every assertion above reads the FILESYSTEM. the skill's whole
         *    visible output — the `stones` block a human actually reads to
         *    learn what was made — had ZERO assertions on it, so the report
         *    could name a different set, or no set at all, and all of them
         *    stay green.
         *
         * ⚠️ and the snapshot below is NOT a backstop: `[ -n $RESNAP ]`
         *    unquoted collapses to `[ -n ]`, always true, so no snapshot in
         *    this repo can fail. on the record since task #127.
         *
         *    `rule.require.assertions-that-discriminate`, leak 5 shape 2 —
         *    an output every case RUNS and none READS.
         */
        const listed = result.stdout
          .split('\n')
          .filter((line) => /^ {6}[├└]─ ✓ /.test(line))
          .map((line) => line.replace(/^ {6}[├└]─ ✓ /, '').trim());

        // a RELATION, not a presence check: the report names exactly the set
        // on disk. a report that drops one, or invents one, goes red here.
        expect([...listed].sort()).toEqual([...files].sort());

        // positive control — an empty report would satisfy an equality against
        // an empty disk, so pin that the disk is genuinely populated
        expect(files.length).toBeGreaterThan(5);

        // the tree glyph: exactly one terminator, and it is the LAST row
        const glyphs = result.stdout
          .split('\n')
          .filter((line) => /^ {6}[├└]─ ✓ /.test(line))
          .map((line) => line.trim().charAt(0));
        expect(glyphs.filter((g) => g === '└')).toHaveLength(1);
        expect(glyphs[glyphs.length - 1]).toEqual('└');

        expect(scrub({ stdout: result.stdout, tempDir })).toMatchSnapshot();
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

        /**
         * ⭐ the decisive clamp. the `then`-string claims the branch is bound
         *    TO THE ROUTE — a RELATION. the two assertions above check only
         *    that A SYMLINK EXISTS, so a bind pointed at the wrong route, at
         *    `/tmp`, or at a path that does not exist keeps both of them
         *    green.
         *
         *    a bind is not decoration: `route.drive` resolves the route
         *    THROUGH it. a dangling target means the route "does not exist"
         *    to the driver, on a repo whose `.route/` plainly holds it.
         *
         *    `rule.require.assertions-that-discriminate`, leak 2.
         */
        const routePath = getRoutePath({ tempDir });
        expect(fs.realpathSync(bindPath)).toEqual(fs.realpathSync(routePath));

        // and the report must NAME the branch it bound, not merely mention one
        expect(result.stdout).toContain('branch test-patent-branch <-> route');

        expect(scrub({ stdout: result.stdout, tempDir })).toMatchSnapshot();
      });
    });
  });

  /**
   * ⛔ THE REFUSAL IS SPLIT ACROSS TWO STREAMS.
   *
   *    `check_route_extant` calls `print_blocked`, which writes to STDERR,
   *    and then plain `echo`s the path and the next step to STDOUT. so a
   *    caller who captures only stderr gets a refusal with no path and no
   *    remedy, and one who captures only stdout gets the remedy with no
   *    refusal. this case now reads BOTH.
   *
   * ⚠️ AND THE FALL-THROUGH IS SILENT DATA LOSS, not a second refusal.
   *    `ROUTE_PATH` is derived from `date +%Y_%m_%d`, so a second run on the
   *    SAME DAY computes the SAME path. delete this guard and `mkdir -p`
   *    no-ops, `copy_templates` puts every blank template back over the files
   *    already there, and the human's edited `0.idea.md` is overwritten — at
   *    EXIT 0, with no word of it.
   *
   *    so the sentinel below is the decisive clamp, not the messages.
   */
  given('[case2] route already exists', () => {
    const scene = useBeforeAll(async () => {
      const tempDir = await genTempDir({
        slug: 'patent-propose-extant',
        git: true,
      });

      // create the first route, then put the human's own work into it
      runPropose({ proposeArgs: [], tempDir });
      const ideaPath = path.join(getRoutePath({ tempDir }), '0.idea.md');
      const sentinel = 'THE HUMAN ALREADY WROTE THIS';
      fs.writeFileSync(ideaPath, sentinel);

      // attempt a second route, the same day, from the same tree
      const result = runPropose({ proposeArgs: [], tempDir });

      return { tempDir, ideaPath, sentinel, result };
    });

    when('[t0] patent.propose is called when route extant', () => {
      then('error is returned', () => {
        // error messages go to stderr
        expect(scene.result.exitCode).toBe(2);
        expect(scene.result.stderr).toContain('already');
        expect(scene.result.stderr).toMatchSnapshot();
      });

      then('the refusal names the collision — on STDERR', () => {
        expect(scene.result.stderr).toContain('patent route already exists');
      });

      then('⭐ and the NEXT STEP is on STDOUT, a different stream', () => {
        // .why = `print_blocked` writes to stderr; the `echo`s beneath it
        //        write to stdout. so the ONE actionable sentence in this
        //        refusal cannot be read by a caller that captures only the
        //        stream the refusal itself arrived on.
        expect(scene.result.stdout).toContain(
          'use the route or delete it first',
        );
      });

      then('and it points at the route it found', () => {
        // ⚠️ REALPATH, deliberately. `genTempDir` hands back a SYMLINK, and
        //    `$GIT_ROOT` comes from `git rev-parse --show-toplevel`, which
        //    resolves it. so the path the skill prints is the real one, and
        //    a comparison against the symlink path fails on a correct run.
        expect(scene.result.stdout).toContain(
          `found: ${fs.realpathSync(getRoutePath({ tempDir: scene.tempDir }))}`,
        );
      });

      then("⭐ and the human's own 0.idea.md is UNTOUCHED", () => {
        // .why = the decisive one. delete the guard and this run recomputes
        //        the SAME `ROUTE_PATH` (the stem is today's date), `mkdir -p`
        //        no-ops, and `copy_templates` lays the blank template back
        //        over this file — silently, at exit 0. no message assertion
        //        can see that; only the bytes can.
        expect(fs.readFileSync(scene.ideaPath, 'utf-8')).toEqual(
          scene.sentinel,
        );
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

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('editor not found');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case6] --open with an editor that DOES exist', () => {
    /**
     * .what = the happy path of `--open`, which no case reached
     *
     * .why  = [case3] passes an editor that does NOT exist, so it exits at
     *         `validate_editor` and never reaches `open_editor`. that leaves
     *         the whole success arm unexercised: the `--open $EDITOR` echo in
     *         the resolved-args header, the `opened in $EDITOR` line, and the
     *         invocation itself.
     *
     *         the invocation is the one that matters. `open_editor` runs
     *         `"$OPEN_EDITOR" "$ROUTE_PATH/0.idea.md"` — a wrong `$ROUTE_PATH`
     *         opens an empty buffer at a path that does not exist, and the
     *         human's first act on a new route is to type their idea into a
     *         file the route will never read.
     *
     *         `rule.require.assertions-that-discriminate`, leak 5 shape 1.
     */
    when('[t0] the editor is on PATH', () => {
      then('it is invoked on 0.idea.md, and the report says so', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-open',
          git: true,
        });

        // a stub editor that records the argv it was handed
        const fakeBin = path.join(tempDir, '.fakebin');
        fs.mkdirSync(fakeBin, { recursive: true });
        const argvLog = path.join(tempDir, 'argv.log');
        const stub = path.join(fakeBin, 'stub-editor');
        fs.writeFileSync(stub, `#!/bin/bash\nprintf '%s' "$1" > ${argvLog}\n`);
        fs.chmodSync(stub, '755');

        const result = runPropose({
          proposeArgs: ['--open', 'stub-editor'],
          tempDir,
          env: { PATH: `${fakeBin}:${process.env.PATH}` },
        });

        expect(result.exitCode).toBe(0);

        // ⭐ the decisive clamp — the editor got the route's OWN 0.idea.md
        const routePath = getRoutePath({ tempDir });
        expect(fs.existsSync(argvLog)).toBe(true);
        const opened = fs.readFileSync(argvLog, 'utf-8');
        expect(fs.realpathSync(opened)).toEqual(
          fs.realpathSync(path.join(routePath, '0.idea.md')),
        );

        // the report must reflect the arm it actually took
        expect(result.stdout).toContain('--open stub-editor');
        expect(result.stdout).toContain('opened in stub-editor');
        expect(result.stdout).not.toContain('ready for you to fill out');
      });
    });
  });

  given('[case7] an unknown argument', () => {
    const scene = useBeforeAll(async () => {
      const tempDir = await genTempDir({
        slug: 'patent-propose-badarg',
        git: true,
      });

      const result = runPropose({
        proposeArgs: ['--nope'],
        tempDir,
      });

      return { tempDir, result };
    });

    when('[t0] a flag the skill does not accept is passed', () => {
      then('it is refused', () => {
        expect(scene.result.exitCode).toBe(2);
      });

      then('⭐ the reason names the LABEL, not only the flag', () => {
        // .why = the extant assertion read `--nope` alone, which is the
        //        CALLER'S OWN INPUT. that token lands in the refusal under
        //        every phrase a rewrite might choose — `unknown option:`,
        //        `bad flag:`, or a bare echo of argv — so it cannot tell
        //        this arm's own message apart from any of them. the label
        //        paired with the value can.
        expect(scene.result.stderr).toContain('unknown argument: --nope');
      });

      then('⭐ and it made no route first', () => {
        // .why = `parse_args` executes before every other step, so a
        //        `.route/` here means the arm fell through to the create
        //        path instead of an exit.
        expect(fs.existsSync(path.join(scene.tempDir, '.route'))).toBe(false);
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

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('git repository');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case8] rhachet passes --skill / --repo / --role', () => {
    /**
     * .what = the arm that swallows the three flags rhachet prepends
     *
     * ⛔ IT WAS DEAD. no case passed them, so a dropped arm or a `shift` typo
     *    would have shipped green.
     *
     * ⭐ AND THIS SKILL REFUSES LOUDLY, which decides the discriminator. its
     *    `*)` catch-all exits 2 and echoes the token by name, so a dead arm
     *    BLOCKS rather than falls through. that is the opposite of a
     *    dispatcher which forwards its leftovers, where the same defect is
     *    silent — the two skills need opposite clamps, and neither is
     *    derivable from the other.
     *
     * ⚠️ so TWO exclusions, because they catch DIFFERENT defects:
     *      - the FLAG echoed  -> the arm was dropped whole
     *      - the VALUE echoed -> the arm is there, but `shift` ate one of two
     */
    when('[t0] the flags are prepended to a real run', () => {
      const scene = useThen('the run completes', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-rhachet',
          git: true,
        });
        return {
          tempDir,
          result: runPropose({
            proposeArgs: [
              '--skill',
              'patent.propose',
              '--repo',
              'rhight',
              '--role',
              'patenter',
            ],
            tempDir,
          }),
        };
      });

      then('it succeeds — the flags are consumed, not refused', () => {
        expect(scene.result.exitCode).toBe(0);
      });

      then('⭐ neither the flag nor its value is echoed as unknown', () => {
        expect(scene.result.stderr).not.toContain('unknown argument');
        expect(scene.result.stderr).not.toContain('--skill');
        expect(scene.result.stderr).not.toContain('patenter');
      });

      /**
       * ⭐ the positive control. both exclusions above are ABSENCES, and an
       *    absence is satisfied just as well by a run that never happened. so
       *    pin that the route was genuinely made — which only the success arm
       *    can produce, since `parse_args` runs before every other step.
       */
      then('and the route it was asked for actually exists', () => {
        const routePath = getRoutePath({ tempDir: scene.tempDir });
        expect(fs.existsSync(path.join(routePath, '0.idea.md'))).toBe(true);
      });
    });
  });

  given('[case9] the short `-h` alias', () => {
    /**
     * .what = the `-h` half of the `--help|-h` arm
     *
     * ⛔ IT WAS DEAD. [case4] passes `--help` only, so `-h` could be dropped
     *    from that arm and every assertion in this file stays green.
     *
     * ⭐ and here the FALL-THROUGH is loud: `-h` would land on `*)` and exit
     *    2. so the exit code alone discriminates, which is NOT the usual case
     *    — see `rule.require.assertions-that-discriminate` leak 6, where a
     *    wrapper's refusal code equals its dependency's and says none of it.
     */
    when('[t0] help is requested by its alias', () => {
      const scene = useThen('the run completes', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-h',
          git: true,
        });
        return {
          tempDir,
          result: runPropose({ proposeArgs: ['-h'], tempDir }),
        };
      });

      then('it renders the same usage `--help` does', () => {
        expect(scene.result.exitCode).toBe(0);
        expect(scene.result.stdout).toContain('usage: patent.propose.sh');
        expect(scene.result.stdout).toContain('--open');
      });

      then('⭐ and it is not refused as an unknown argument', () => {
        expect(scene.result.stderr).not.toContain('unknown argument');
      });

      /**
       * ⚠️ the exclusion above reads a channel the defect does NOT erase —
       *    `*)` writes to stderr and exits, so under the defect stderr is
       *    populated rather than empty. that is what makes it a real
       *    discriminator here, and it is worth a note, because the same shape
       *    of exclusion is VACUOUS wherever the defect aborts the run before
       *    any output at all (leak 4).
       *
       * ✅ and help must never make a route — it exits inside `parse_args`.
       */
      then('and it made no route on the way out', () => {
        expect(fs.existsSync(path.join(scene.tempDir, '.route'))).toBe(false);
      });
    });
  });

  given('[case10] a detached HEAD', () => {
    /**
     * .what = the second arm of `check_git_repo` — a repo with no current
     *         branch
     *
     * ⛔ IT WAS DEAD. [case5] covers the not-a-repo arm; this one had no case
     *    at all, so the guard could be deleted and the skill would carry on
     *    with `BRANCH` empty.
     *
     * ⚠️ AND THAT IS THE HARM — MEASURED, not predicted. the guard was
     *    neutered and the run went all the way to `emit_success` and EXITED
     *    0, with the full tree report and every template file on disk. so the
     *    defect never announces itself: a human reads a clean success over a
     *    route whose bind was computed from an EMPTY branch name.
     *
     *    ⭐ an earlier draft of this note GUESSED the harm was a late `ln -s`
     *       failure — loud, non-zero, half-done. the probe said exit 0. a
     *       guessed harm is a claim about a codepath nobody ran, and it is
     *       wrong in the direction that matters: it describes a defect that
     *       reports itself, where the real one is silent.
     *
     * ⭐ THE EXIT CODE CANNOT DISCRIMINATE HERE, unlike [case9]. both arms of
     *    `check_git_repo` exit 2, as do `check_route_extant` and
     *    `validate_editor`. the MESSAGE is the only observable that says
     *    which of the four refused.
     */
    when('[t0] HEAD points at a commit rather than a branch', () => {
      const scene = useThen('the run completes', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-detached',
          git: true,
        });

        spawnSync('git', ['checkout', '--detach', 'HEAD'], {
          cwd: tempDir,
          encoding: 'utf-8',
        });

        // ⭐ positive control on the FIXTURE: prove the detach took, before
        //    any assertion rests on it. a checkout that silently failed would
        //    leave a normal branch, and every clamp below would then be a
        //    claim about the happy path under this case's name.
        const branch = spawnSync('git', ['branch', '--show-current'], {
          cwd: tempDir,
          encoding: 'utf-8',
        });

        return {
          branchWhenDetached: (branch.stdout ?? '').trim(),
          tempDir,
          result: runPropose({ proposeArgs: [], tempDir }),
        };
      });

      then('the fixture is genuinely detached', () => {
        expect(scene.branchWhenDetached).toEqual('');
      });

      then('⭐ it blocks, and names detached HEAD as the reason', () => {
        expect(scene.result.exitCode).toBe(2);
        expect(scene.result.stderr).toContain('detached HEAD');
      });

      then('and it refused BEFORE it made a route', () => {
        expect(fs.existsSync(path.join(scene.tempDir, '.route'))).toBe(false);
      });
    });
  });

  given('[case11] the templates directory is absent', () => {
    /**
     * .what = `copy_templates`'s refusal — THE ONLY exit-1 arm in this skill
     *
     * ⛔ IT WAS DEAD. every other case runs the committed skill, whose
     *    `templates/` is right there, so the guard went unexercised.
     *
     * ⭐ AND THE EXIT CODE IS THE DISCRIMINATOR, which is rare enough to name.
     *    every other guard here exits 2 — a constraint the caller can fix. an
     *    absent `templates/` is a MALFUNCTION of the install, so it exits 1,
     *    and that 1 tells a caller not to re-read their own flags.
     *
     * ⚠️ THE PROBE CANNOT DELETE `templates/` FROM THE REPO. so the fixture
     *    builds a COPY of the skill in the temp dir, laid out to satisfy the
     *    skill's own `source` — which reaches a SIBLING directory,
     *    `patent.priors/output.sh`, off `$SCRIPT_DIR`. copy one file and the
     *    run dies at the `source` line for an unrelated reason, and the case
     *    would then report a red that has no relation to its name.
     *
     * 🚩 AND THE ORDER IN `main` IS ITSELF A FINDING. `create_route_dir` runs
     *    BEFORE `copy_templates`, so this refusal leaves an EMPTY route
     *    directory behind. it is asserted below rather than fixed, because a
     *    change to that order is a behavior change and this case exists to
     *    pin the arm as it stands.
     */
    when('[t0] the skill runs from a tree with no templates/', () => {
      const scene = useThen('the run completes', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-notemplates',
          git: true,
        });

        // a copy of the skill, laid out so `source` reaches its neighbor,
        // and with NO templates/ dir
        const skillsRoot = path.join(tempDir, '.fakeskill');
        const proposeDir = path.join(skillsRoot, 'patent.propose');
        const priorsDir = path.join(skillsRoot, 'patent.priors');
        fs.mkdirSync(proposeDir, { recursive: true });
        fs.mkdirSync(priorsDir, { recursive: true });
        fs.copyFileSync(scriptPath, path.join(proposeDir, 'patent.propose.sh'));
        fs.copyFileSync(
          path.join(__dirname, '..', 'patent.priors', 'output.sh'),
          path.join(priorsDir, 'output.sh'),
        );

        const result = spawnSync(
          'bash',
          [path.join(proposeDir, 'patent.propose.sh')],
          {
            cwd: tempDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
          },
        );

        return {
          proposeDir,
          tempDir,
          result: {
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
            exitCode: result.status ?? 1,
          },
        };
      });

      then('⭐ it exits 1 — a MALFUNCTION, not a constraint', () => {
        expect(scene.result.exitCode).toBe(1);
      });

      then('⭐ and it SAYS the templates were not found', () => {
        // .why = split from the exit code above on purpose. jest halts a
        //        `then` at its first red, so a message co-located with a
        //        code assertion can never be measured on its own — and this
        //        is the one arm here whose fall-through would exit 1 too:
        //        `cp` from an absent dir fails under `set -e` at the same
        //        code, with an empty stdout and poppler-style noise on
        //        stderr. only the message tells the guard from the fault.
        expect(scene.result.stderr).toContain('templates not found');
      });

      /**
       * ⭐ the discriminator that rules out a plausible-but-wrong fix: a
       *    guard which reported the path it SHOULD have looked in, rather
       *    than the one it did. the expected path must be the COPY's, so a
       *    hardcoded or mis-derived `$SCRIPT_DIR` goes red here while the
       *    exit code above stays green.
       */
      then('and it names the directory it actually looked in', () => {
        expect(scene.result.stdout).toContain(
          path.join(scene.proposeDir, 'templates'),
        );
      });

      then('⭐ and the path carries its own LABEL', () => {
        // .why = the assertion above reads the path alone — a VALUE this
        //        case computed itself. so a guard that printed the right
        //        path under a label that means something else (`found:`,
        //        `route:`) stays green there. ⛔ and the two halves are on
        //        DIFFERENT STREAMS: `print_blocked` writes the refusal to
        //        stderr while the plain `echo` beneath it writes this line
        //        to stdout, so the label is the only token on stdout that
        //        says what the path IS.
        expect(scene.result.stdout).toContain(
          `expected: ${path.join(scene.proposeDir, 'templates')}`,
        );
      });

      /**
       * 🚩 pinned, not endorsed — see the note above. the route dir is made
       *    before the templates guard runs, so a refusal leaves it behind,
       *    empty. a later reader who changes the order in `main` should see
       *    this go red and decide deliberately.
       */
      then('🚩 and it leaves an EMPTY route dir behind — pinned as-is', () => {
        const routePath = getRoutePath({ tempDir: scene.tempDir });
        expect(fs.readdirSync(routePath)).toEqual([]);
      });
    });
  });

  given('[case12] a stale bind already occupies the branch slot', () => {
    /**
     * .what = the `[[ -L "$bind_path" ]]` arm of `bind_branch`
     *
     * ⛔ IT WAS DEAD, and could not be reached by a second run: a second run
     *    blocks at `check_route_extant` long before `bind_branch`. so the
     *    only way in is a bind left over from a route that is gone — which is
     *    exactly what a human does when they delete `.route/` by hand and
     *    start over, the flow the extant-route refusal tells them to use.
     *
     * ⚠️ WITHOUT THE `rm` — MEASURED — `ln -s` fails with "File exists",
     *    `set -e` aborts at exit 1, and the abort lands AFTER the route and
     *    its template files are on disk and BEFORE `emit_success`. so the
     *    human gets a non-zero exit, an empty report, and a fully-populated
     *    route with no bind at all.
     *
     * ⭐ THE FIXTURE PLANTS A BROKEN SYMLINK ON PURPOSE, and that choice is
     *    the discriminator. `-L` is true for a link whose target is gone;
     *    `-e` is false for the same link. so the plausible-but-wrong fix —
     *    `[[ -e ]]`, which reads as the more careful test — cannot pass here,
     *    while a fixture with an intact link would have let it through.
     *
     *    ⚠️ THAT RULING-OUT WAS MEASURED, not reasoned. `-L` was swapped for
     *       `-e` and the same two assertions went red, on the same
     *       `Expected: 0, Received: 1`. what a fixture rules out is a claim
     *       about a fix nobody wrote — run the wrong fix, or the claim is
     *       decoration.
     */
    when('[t0] the bind slot holds a link to a route that is gone', () => {
      const scene = useThen('the run completes', async () => {
        const tempDir = await genTempDir({
          slug: 'patent-propose-stalebind',
          git: true,
        });

        spawnSync('git', ['checkout', '-b', 'stale-bind-branch'], {
          cwd: tempDir,
          encoding: 'utf-8',
        });

        const bindDir = path.join(tempDir, '.branch', '.bind');
        fs.mkdirSync(bindDir, { recursive: true });
        const bindPath = path.join(bindDir, 'stale-bind-branch');
        fs.symlinkSync('../../.route/v1999_01_01.patent.propose', bindPath);

        return {
          bindPath,
          // ⭐ positive control on the FIXTURE: the plant must be a link, and
          //    its target must be absent, or the `-L` vs `-e` discrimination
          //    below is a claim about a case the fixture never set up.
          plantIsLink: fs.lstatSync(bindPath).isSymbolicLink(),
          plantIsBroken: !fs.existsSync(bindPath),
          tempDir,
          result: runPropose({ proposeArgs: [], tempDir }),
        };
      });

      then('the fixture planted a broken symlink', () => {
        expect(scene.plantIsLink).toBe(true);
        expect(scene.plantIsBroken).toBe(true);
      });

      then(
        '⭐ it succeeds — the stale link is replaced, not tripped over',
        () => {
          expect(scene.result.exitCode).toBe(0);
        },
      );

      then('⭐ and the bind now points at the route it just made', () => {
        const routePath = getRoutePath({ tempDir: scene.tempDir });
        expect(fs.realpathSync(scene.bindPath)).toEqual(
          fs.realpathSync(routePath),
        );
      });
    });
  });
});
