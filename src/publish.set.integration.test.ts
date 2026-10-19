import { genTempDir, given, then, when } from 'test-fns';

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * .what = clamps the PUBLISH SET — the exact file list `build:complete:dist`
 *         rsyncs into `dist/`, which `package.json` `files: ["/dist"]` ships
 *         to npm.
 *
 * .why  = `.demo/` holds BOTH a pseudonymized public demo AND real client
 *         material — a real EIN, a real business address, a sole officer's
 *         full legal name, 42 months of card statements.
 *
 *         "it's gitignored, therefore it doesn't ship" is FALSE REASONING in
 *         this repo. npm packs `dist/`; `dist/` is written by `tsc` and
 *         `rsync`, and NEITHER consults git. the real demos were safe only
 *         because no file inside them happened to carry an allowlisted
 *         extension — a guarantee of the form "nobody adds a readme."
 *
 *         so the guard is the rsync flag list, and this file is its clamp.
 *
 * ⚠️ `dist/` HAS TWO PRODUCERS, so this file has two harnesses. an assertion
 *    proven against one says NOTHING about the other — they read different
 *    config, in different syntax, with different glob semantics:
 *
 *    | producer | config | harness | cases |
 *    |---|---|---|---|
 *    | `rsync` | `package.json` `build:complete:dist` | `genPublishSet` | [case1] [case2] |
 *    | `tsc`   | `tsconfig.build.json` `exclude`      | `genCompileSet` | [case3] |
 */
describe('the published file set', () => {
  const repoDir = path.join(__dirname, '..');

  /**
   * .what = runs the REAL `build:complete:dist` command, read out of
   *         package.json, in dry-run mode over an arbitrary source tree.
   *
   * .why  = a test that restated the flag list would drift from the command
   *         that actually builds the package, and would then clamp a fiction.
   *         to read the command is what makes this test track reality.
   *
   * ⚠️ `--out-format='%n'` emits directories too, as `path/`. those are
   *    filtered out — a directory is not a published file, and
   *    `--prune-empty-dirs` means an emitted dir does not imply a file in it.
   */
  const genPublishSet = (input: { from: string }): string[] => {
    const manifest: unknown = JSON.parse(
      fs.readFileSync(path.join(repoDir, 'package.json'), 'utf-8'),
    );
    const command = (manifest as Record<string, Record<string, unknown>>)
      .scripts?.['build:complete:dist'];
    if (typeof command !== 'string')
      throw new Error('package.json declares no build:complete:dist command');
    if (!command.endsWith(' src/ dist/'))
      throw new Error(
        `build:complete:dist no longer ends with "src/ dist/"; got: ${command}`,
      );

    const into = `${input.from}.dist`;
    fs.mkdirSync(into, { recursive: true });

    const invocation = command
      .replace(/^rsync /, "rsync -n --out-format='%n' ")
      .replace(/ src\/ dist\/$/, ` '${input.from}/' '${into}/'`);

    const stdout = execSync(invocation, {
      cwd: repoDir,
      encoding: 'utf-8',
      shell: '/bin/bash',
      maxBuffer: 32 * 1024 * 1024,
    });

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .filter((line) => !line.endsWith('/')); // drop directories
  };

  /**
   * .what = derives the OTHER producer's input set — the `.ts` files
   *         `build:compile:tsc` compiles into `dist/` — over an arbitrary
   *         source tree.
   *
   * .why  = `genPublishSet` proves a file is not rsync'd. that says NOT ONE
   *         thing about whether tsc compiles it. the two producers read
   *         different config, in different syntax, with different glob
   *         semantics — and they DISAGREE today: rsync strips
   *         `__fixtures__`/`__snapshots__`, tsc's `**\/__test*__\/**` matches
   *         neither name.
   *
   * ⚠️ `tsconfig.build.json` is JSONC — it carries `//` comments, so
   *    `JSON.parse` throws on it. the `exclude` list is therefore read back
   *    out of `tsc --showConfig`, which uses TypeScript's OWN parser. that is
   *    also what keeps this harness honest: the patterns under test are the
   *    expanded ones, not a hand-copy that can drift.
   *
   * ⚠️ the probe config CANNOT `extends` the real one. TypeScript anchors a
   *    relative `include`/`exclude` to the file that DECLARED it, so an
   *    inherited `exclude` would stay pointed at the real repo and match no
   *    file in a temp tree — the harness would report a clean zero over a
   *    tree it never filtered.
   */
  const genCompileSet = (input: { from: string }): string[] => {
    const showConfig = (at: string): { files?: string[]; exclude?: string[] } =>
      JSON.parse(
        execSync(`npx tsc -p '${at}' --showConfig`, {
          cwd: repoDir,
          encoding: 'utf-8',
          shell: '/bin/bash',
          maxBuffer: 32 * 1024 * 1024,
        }),
      );

    const exclude = showConfig(
      path.join(repoDir, 'tsconfig.build.json'),
    ).exclude;
    if (!Array.isArray(exclude) || exclude.length === 0)
      throw new Error('tsconfig.build.json expanded to an empty exclude list');

    const root = path.dirname(input.from);
    const at = path.join(root, 'tsconfig.probe.json');
    fs.writeFileSync(
      at,
      JSON.stringify({
        compilerOptions: { noEmit: true },
        include: ['src/**/*.ts'],
        exclude,
      }),
    );

    return (showConfig(at).files ?? []).map((f) =>
      path.relative(root, path.resolve(root, f)),
    );
  };

  given('[case1] the real src/ tree', () => {
    const published = genPublishSet({ from: path.join(repoDir, 'src') });

    /**
     * ⚠️ THE POSITIVE CONTROL, and it is not optional.
     *
     * every assertion below is an ABSENCE. an absence is satisfied just as
     * well by a broken selector as by a clean tree — a `genPublishSet` that
     * returned `[]` would pass all of them. this case is what earns the
     * zeros.
     */
    when('[t0] the harness is checked against a known-present file', () => {
      then('it emits the public sandpine demo readme', () => {
        expect(published).toContain(
          'domain.roles/registrator/skills/corp.franchise.reinstate/.demo/v2020_05_21.sandpine/readme.md',
        );
      });

      then('it emits a non-trivial number of files', () => {
        expect(published.length).toBeGreaterThan(100);
      });
    });

    when('[t1] the .demo paths are inspected', () => {
      const demos = published.filter((p) => p.includes('/.demo/'));

      then('every published .demo path is the pseudonymized public one', () => {
        const leaks = demos.filter(
          (p) => !p.includes('/.demo/v2020_05_21.sandpine/'),
        );
        expect(leaks).toEqual([]);
      });
    });
  });

  /**
   * ⚠️ [case1] CANNOT FAIL TODAY, because no real demo currently holds a file
   *    with an allowlisted extension. it asserts a zero over an input class
   *    that is empty — which is exactly the shape of a clamp that does not
   *    bite (`rule.require.clamp-edge-cases`).
   *
   *    this case supplies the input. it stages the one file `#109` named —
   *    a `readme.md` under a real-demo directory — and asserts it does not
   *    ship.
   *
   * ⭐ PROVEN TO BITE, on TWO different reverts (2026-09-02):
   *
   *    | revert | result |
   *    |---|---|
   *    | drop both `.demo` flags | [case2] RED, all 4 [case1] assertions GREEN |
   *    | move both flags to AFTER `--include='**\/readme.md'` | [case2] RED |
   *
   *    the second is the one that matters. **rsync is first-match-wins**, so
   *    the natural fix — append the flags to the end of the list — is a
   *    SILENT NO-OP: `--include='**\/readme.md'` matches the probe first and
   *    the later exclude is never consulted. it looks identical in a diff
   *    and guards no file at all.
   *
   *    that plausible-but-wrong fix is ruled out by THIS FIXTURE, not by a
   *    comment. do not remove the probe to "simplify" the case.
   */
  given('[case2] a src tree with a readme inside a REAL demo dir', () => {
    const write = (input: { root: string; at: string }): void => {
      const full = path.join(input.root, input.at);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, '# probe\n');
    };

    when('[t0] the publish set is generated', () => {
      then(
        'the real-demo readme is excluded, and the rest still ship',
        async () => {
          const root = path.join(
            await genTempDir({ slug: 'publish-set' }),
            'src',
          );

          const atProbe =
            'domain.roles/accountant/.demo/v2000_01_01.real-probe/readme.md';
          const atNested =
            'domain.roles/accountant/.demo/v2020_05_21.sandpine/nested/readme.md';
          const atPublic =
            'domain.roles/accountant/.demo/v2020_05_21.sandpine/readme.md';
          const atOrdinary = 'domain.roles/accountant/readme.md';

          write({ root, at: atProbe });
          write({ root, at: atNested });
          write({ root, at: atPublic });
          write({ root, at: atOrdinary });

          const published = genPublishSet({ from: root });

          // 🚨 the defect #109 named: a readme under a REAL demo dir
          expect(published).not.toContain(atProbe);

          /**
           * ⚠️ the allowlist is a TIGHT LITERAL — `.demo/v2020_05_21.sandpine/readme.md`,
           * not `**` beneath it. exactly one such file exists, at the top level,
           * so the tight form preserves today's published set exactly and keeps
           * the default-deny posture: a future nested readme must be
           * deliberately allowlisted rather than inherited.
           *
           * this assertion documents that choice. it is not incidental.
           */
          expect(published).not.toContain(atNested);

          // the public demo still ships — the exclude is not a blunt drop
          expect(published).toContain(atPublic);

          // an ordinary readme outside any .demo is untouched
          expect(published).toContain(atOrdinary);
        },
      );
    });
  });

  /**
   * ⚠️ THE INVERSE DEFECT. [case1] and [case2] guard against a file that
   *    SHIPS AND MUST NOT. this case guards a file that MUST SHIP AND DID NOT.
   *
   *    an allowlist has two failure directions and only one of them is loud.
   *    an over-ship leaks; an under-ship is silent, because the package builds,
   *    installs, and imports exactly as before.
   *
   * 🚩 observed 2026-09-02. `rule.require.embed-source-bytes` demands the exact
   *    statute text and agency PDFs be committed beside the brief that quotes
   *    them — *"a .gov url rots and the claim outlives its evidence."* 37 such
   *    payloads sat under `briefs/**\/refs/`, and **none reached `dist/`**:
   *
   *    | under `briefs/**\/refs/` | shipped before this case |
   *    |---|---|
   *    | 32 `.txt` — statute + rule text | ⛔ no |
   *    | 4 `.pdf` — agency forms and manuals | ⛔ no |
   *    | 1 `.json` — a state registry snapshot | ⛔ no |
   *    | 41 `.play.ts` → compiled `.js` | ✅ **yes** |
   *
   * ⭐ the inversion is the point: `dist/` shipped the code that REPRODUCES the
   *    evidence and not the evidence itself — because tsc compiles `.ts` by
   *    default while rsync ships only what its allowlist names. **12 briefs**
   *    name a `refs/…` payload by relative path, and in the published package
   *    every one of those references resolved to an absent file.
   *
   * ⚠️ THE PLAUSIBLE-BUT-WRONG FIX, ruled out by the fixture below. rsync's
   *    `**` matches slashes but does NOT match empty, so a single
   *    `--include='**\/refs/**\/*.txt'` covers `refs/a/x.txt` and MISSES
   *    `refs/x.txt` — which is where most of these actually live. both depths
   *    are staged here on purpose; drop either include and this case reddens.
   *
   * ⭐ THE AXIS IS DEPTH *INSIDE* `refs/`, NOT DEPTH IN THE TREE. that is why
   *    the wrong fix reads as sufficient: `briefs/refs/a.txt` and
   *    `briefs/<topic>/<scope>/refs/b.txt` sit at different tree depths and are
   *    covered by the SAME include, because each is a direct child of a `refs/`
   *    dir. measured against the real corpus:
   *
   *    | fixture | position in `refs/` | include it exercises | real files |
   *    |---|---|---|---|
   *    | `atTxtInRefs`    | direct child | `**\/refs/*.txt`     | 27 |
   *    | `atTxtBelowRefs` | one dir down | `**\/refs/**\/*.txt` |  5 |
   *    | `atPdfBelowRefs` | one dir down | `**\/refs/**\/*.pdf` |  4 |
   *    | `atJsonBelowRefs`| one dir down | `**\/refs/**\/*.json`|  1 |
   *
   * ⚠️ `**\/refs/*.pdf` and `**\/refs/*.json` carry NO fixture, because the
   *    corpus has no `.pdf` or `.json` directly in a `refs/` dir. they are
   *    defensive, and this case cannot see their removal. stated rather than
   *    implied — an uncovered include must not read as a covered one.
   */
  given(
    '[case4] a src tree with evidence payloads under briefs/**/refs/',
    () => {
      when('[t0] the publish set is generated', () => {
        then('every refs payload ships, at BOTH depths', async () => {
          const root = path.join(
            await genTempDir({ slug: 'publish-refs' }),
            'src',
          );
          const write = (at: string): void => {
            const full = path.join(root, at);
            fs.mkdirSync(path.dirname(full), { recursive: true });
            fs.writeFileSync(full, 'probe\n');
          };

          // a DIRECT CHILD of refs/ — 27 real files. covered by `**/refs/*.txt`.
          // the tree depth above refs/ is deliberately shallow here and deep in
          // the neighbor below, to show that axis does NOT decide the include.
          const atTxtInRefs =
            'domain.roles/r/briefs/refs/effectiveAt=2024-01-01.a.txt';
          // ONE DIR BELOW refs/ — 5 real files. covered by `**/refs/**/*.txt`.
          const atTxtBelowRefs =
            'domain.roles/r/briefs/limitations/state=fl/refs/jurisdiction=usa-fl/effectiveAt=2024-01-01.b.txt';
          const atPdfBelowRefs =
            'domain.roles/r/briefs/jurats/refs/jurisdiction=usa-fl/effectiveAt=2020-01-01.c.pdf';
          const atJsonBelowRefs =
            'domain.roles/r/briefs/ronproviders/refs/jurisdiction=usa-fl/pulledAt=2026-08-30.d.json';
          // the brief that quotes them — already shipped; the control for this case
          const atBrief =
            'domain.roles/r/briefs/limitations/state=fl/lever.e.md';
          // ⚠️ default-deny is PRESERVED: a refs dir inside a real demo must NOT ship
          const atDemoRefs =
            'domain.roles/r/.demo/v2000_01_01.real/refs/effectiveAt=2024-01-01.f.txt';

          write(atTxtInRefs);
          write(atTxtBelowRefs);
          write(atPdfBelowRefs);
          write(atJsonBelowRefs);
          write(atBrief);
          write(atDemoRefs);

          const published = genPublishSet({ from: root });

          // 🚨 the defect: the evidence a shipped brief names by path
          expect(published).toContain(atTxtInRefs);
          expect(published).toContain(atTxtBelowRefs);
          expect(published).toContain(atPdfBelowRefs);
          expect(published).toContain(atJsonBelowRefs);

          // the control — the brief itself was never the broken half
          expect(published).toContain(atBrief);

          /**
           * ⭐ the discriminator. the `.demo` exclude sits BEFORE these includes
           *    and rsync is first-match-wins, so a refs dir under a real demo is
           *    still refused. move the new includes above `--exclude='**\/.demo/**'`
           *    and this one assertion — alone — goes red.
           */
          expect(published).not.toContain(atDemoRefs);
        });
      });
    },
  );

  /**
   * ⚠️ THE SAME DEFECT CLASS AS [case4], FOUND BY ENUMERATING THE INPUT SPACE.
   *
   *    [case4] closed ONE hole. an inverse allowlist has as many holes as there
   *    are shapes it did not think of, so the next move was not to guess the
   *    next hole — it was to walk every extension under `src/` and ask which
   *    ones `dist/` refuses. that walk found two more `.md` payloads, and they
   *    fail in OPPOSITE ways:
   *
   *    | absent payload | the skill that reads it | how it fails |
   *    |---|---|---|
   *    | `patent.propose/templates/0.idea.md` | `for file in "$dir"/*` | 🚨 **SILENT** |
   *    | `pii.scan/rubric/rule.forbid.pii-in-a-diff.md` | `print_blocked` | ✅ loud |
   *
   * 🚨 the silent one is the reason this case exists. `patent.propose` copies
   *    its templates with a bare glob and asserts NO COUNT, then prints
   *    `$ROUTE_PATH/0.idea.md` and hands it to `--open` regardless. `src` held
   *    9 templates; `dist` held 8, and the absent one was the file the whole
   *    route starts from. the published skill opened an empty buffer and
   *    reported success.
   *
   * ⭐ AND THE EXTANT TEST WAS GREEN THROUGH ALL OF IT — because it asserts
   *    `toContain('0.idea.md')` against a route built from `src/`. no assertion
   *    anywhere verified `dist/`. that is the whole reason this file exists.
   *
   * ⚠️ `**\/skills/*.md` — the SHALLOW half of the pair — carries NO fixture.
   *    no file in the corpus sits directly in a `skills/` dir but `.gitkeep`,
   *    so this case cannot see its removal. stated rather than implied: an
   *    uncovered include must not read as a covered one.
   */
  given('[case5] a src tree with .md payloads a skill reads at runtime', () => {
    when('[t0] the publish set is generated', () => {
      then('the payloads ship, and the excluded .md still do not', async () => {
        const root = path.join(
          await genTempDir({ slug: 'publish-skill-md' }),
          'src',
        );
        const write = (at: string): void => {
          const full = path.join(root, at);
          fs.mkdirSync(path.dirname(full), { recursive: true });
          fs.writeFileSync(full, '# probe\n');
        };

        // the two real payloads, at the depth they really live
        const atTemplate =
          'domain.roles/patenter/skills/patent.propose/templates/0.idea.md';
        const atRubric =
          'domain.roles/transcriber/skills/pii.scan/rubric/rule.forbid.pii-in-a-diff.md';
        // the skill's own executable — already shipped; the control for this case
        const atScript =
          'domain.roles/patenter/skills/patent.propose/patent.propose.sh';
        /**
         * ⚠️ the two discriminators. both sit UNDER a `skills/` dir, so the new
         *    include would match them — and both are refused only because
         *    rsync is FIRST-MATCH-WINS and their excludes sit earlier in the
         *    flag list. move the `.md` include above either exclude and exactly
         *    one of these assertions reddens.
         */
        const atDemoMd =
          'domain.roles/patenter/skills/patent.propose/.demo/v2000_01_01.real/notes.md';
        const atSnapshotMd =
          'domain.roles/patenter/skills/patent.propose/__snapshots__/notes.md';

        write(atTemplate);
        write(atRubric);
        write(atScript);
        write(atDemoMd);
        write(atSnapshotMd);

        const published = genPublishSet({ from: root });

        // 🚨 the defect: the payload the published skill opens at runtime
        expect(published).toContain(atTemplate);
        expect(published).toContain(atRubric);

        // the control — the executable was never the broken half
        expect(published).toContain(atScript);

        // default-deny is PRESERVED under the wider include
        expect(published).not.toContain(atDemoMd);
        expect(published).not.toContain(atSnapshotMd);
      });
    });
  });

  /**
   * ⚠️ A THIRD SHAPE THE ALLOWLIST NEVER CONTEMPLATED: a skill shared between
   *    two roles by a DIRECTORY SYMLINK.
   *
   *    `registrator/skills/franchise.tax.delaware` is a symlink to the
   *    accountant's copy — the pattern `rule.require.bounded-roles` prescribes,
   *    where the role that owns the DETAIL owns the skill and the caller gets a
   *    pointer. rsync `-a` implies `-l`, which preserves a symlink AS a
   *    symlink; the link itself matches no include, so it was dropped whole.
   *
   * 🚨 the observable was not an absent file. **the registrator role shipped
   *    with ZERO skills** — the published farm had no `registrator/skills` dir
   *    at all.
   *
   * ⭐ `--copy-dirlinks` is the fix rather than a name-specific include, for
   *    three reasons, and the fixture below clamps all three:
   *
   *    | property | assertion |
   *    |---|---|
   *    | contents land under the SYMLINK's path | `toContain(atLinkedScript)` |
   *    | contents are filtered by the SAME includes, not blanket-copied | `not.toContain(atLinkedStray)` |
   *    | the target still ships on its own path | `toContain(atRealScript)` |
   *
   *    the second is the one a blanket `--include` would have broken. blast
   *    radius was measured before the flag was added: `src/` holds EXACTLY ONE
   *    symlink, and it is this dir-link.
   *
   * ⚠️ it also produces a REAL DIRECTORY in `dist/`, which matters beyond
   *    correctness — symlinks are unreliable inside an npm tarball.
   */
  given('[case6] a src tree with a skill shared by a directory symlink', () => {
    when('[t0] the publish set is generated', () => {
      then('the linked skill ships under the LINK path', async () => {
        const root = path.join(
          await genTempDir({ slug: 'publish-dirlink' }),
          'src',
        );
        const write = (at: string): void => {
          const full = path.join(root, at);
          fs.mkdirSync(path.dirname(full), { recursive: true });
          fs.writeFileSync(full, '#!/usr/bin/env bash\n');
        };

        const atRealScript =
          'domain.roles/accountant/skills/franchise.tax.delaware/franchise.tax.delaware.sh';
        /**
         * ⚠️ a NON-allowlisted file inside the linked dir. this is what proves
         *    `--copy-dirlinks` still filters rather than blanket-copies — the
         *    property a `--include='**\/skills/*'` fix would have destroyed.
         */
        const atRealStray =
          'domain.roles/accountant/skills/franchise.tax.delaware/notes.scratchpad';
        write(atRealScript);
        write(atRealStray);

        fs.mkdirSync(path.join(root, 'domain.roles/registrator/skills'), {
          recursive: true,
        });
        fs.symlinkSync(
          '../../accountant/skills/franchise.tax.delaware',
          path.join(
            root,
            'domain.roles/registrator/skills/franchise.tax.delaware',
          ),
        );

        const published = genPublishSet({ from: root });

        const atLinkedScript =
          'domain.roles/registrator/skills/franchise.tax.delaware/franchise.tax.delaware.sh';
        const atLinkedStray =
          'domain.roles/registrator/skills/franchise.tax.delaware/notes.scratchpad';

        // 🚨 the defect: the linked role shipped with no skills at all
        expect(published).toContain(atLinkedScript);

        // the link is DEREFERENCED, not preserved — no bare symlink entry
        expect(published).not.toContain(
          'domain.roles/registrator/skills/franchise.tax.delaware',
        );

        // the allowlist still applies BENEATH the link
        expect(published).not.toContain(atLinkedStray);
        expect(published).not.toContain(atRealStray);

        // the control — the target still ships on its own path
        expect(published).toContain(atRealScript);
      });
    });
  });

  /**
   * ⚠️ THE SECOND PRODUCER. [case1] and [case2] prove a file is not RSYNC'd
   *    and say not one thing about `tsc`, which writes the other half of
   *    `dist/` from a different config in a different syntax.
   *
   *    the two producers' exclude lists DISAGREED until 2026-09-02:
   *
   *    | dir | rsync | tsc |
   *    |---|---|---|
   *    | `__test_assets__` | excluded | excluded by `**\/__test*__\/**` |
   *    | `__fixtures__` | excluded | ⛔ **matched by neither pattern** |
   *    | `__snapshots__` | excluded | ⛔ **matched by neither pattern** |
   *
   *    `__test*__` requires the `__test` prefix. so a non-test `.ts` under
   *    `__fixtures__` would have compiled and shipped while every sibling
   *    beside it was stripped — a file arriving in the package alone, with
   *    the context that explains it removed.
   *
   * ⭐ zero such `.ts` existed, so this was an UNEXERCISED gap, not a live
   *    leak — the same shape as `.demo`, one producer over. that also means
   *    [t0] below is an unexercised zero and cannot fail on its own. [t1]
   *    supplies the input.
   */
  given('[case3] the tsc half of dist/', () => {
    when('[t0] the real src/ tree is compiled', () => {
      const compiled = genCompileSet({ from: path.join(repoDir, 'src') });

      // the positive control — an absence is worthless without one
      then('the harness sees the real entrypoint', () => {
        expect(compiled).toContain('src/index.ts');
      });

      then('no test-adjacent dir contributes a compiled file', () => {
        const strays = compiled.filter((p) =>
          /\/(__fixtures__|__snapshots__|__test[^/]*__|\.demo|\.scratch)\//.test(
            p,
          ),
        );
        expect(strays).toEqual([]);
      });
    });

    when('[t1] a plain .ts sits under __fixtures__ and __snapshots__', () => {
      then('neither is compiled, and an ordinary .ts still is', async () => {
        const root = path.join(
          await genTempDir({ slug: 'compile-set' }),
          'src',
        );
        const write = (at: string): void => {
          const full = path.join(root, at);
          fs.mkdirSync(path.dirname(full), { recursive: true });
          fs.writeFileSync(full, 'export const probe = 1;\n');
        };

        /**
         * ⚠️ these are NOT `.test.ts`. that name is excluded by a separate,
         *    older pattern, so a `.test.ts` probe would pass under BOTH the
         *    fixed and the broken config and prove not one thing.
         */
        const atFixture = 'domain.roles/skills/x/__fixtures__/helper.ts';
        const atSnapshot = 'domain.roles/skills/x/__snapshots__/helper.ts';
        const atOrdinary = 'domain.roles/skills/x/helper.ts';

        write(atFixture);
        write(atSnapshot);
        write(atOrdinary);

        const compiled = genCompileSet({ from: root });

        expect(compiled).not.toContain(`src/${atFixture}`);
        expect(compiled).not.toContain(`src/${atSnapshot}`);

        // the exclude is not a blunt drop — a sibling .ts still compiles
        expect(compiled).toContain(`src/${atOrdinary}`);
      });
    });
  });
});
