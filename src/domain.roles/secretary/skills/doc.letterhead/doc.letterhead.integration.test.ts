import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, when } from 'test-fns';

describe('doc.letterhead.sh', () => {
  const scriptPath = path.join(__dirname, 'doc.letterhead.sh');

  const runSkill = (input: {
    args: string[];
    cwd?: string;
    stdin?: string;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.args], {
      cwd: input.cwd,
      // an `undefined` here behaves exactly as if the field were absent, so
      // every extant caller is unaffected. `--body @stdin` is the one arm
      // that needs a real pipe behind it.
      input: input.stdin,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = run the skill into a fresh temp dir and hand back the html
   *
   * .why  = every case that inspects output needs the same three steps
   *         (temp dir, --into, read back), and a case that forgets the
   *         temp dir writes into the repo instead. see
   *         rule.require.hermetic-tests.
   */
  const runIntoTemp = async (input: {
    args: string[];
    slug: string;
    stdin?: string;
  }): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    html: string;
    markup: string;
  }> => {
    const tempDir = await genTempDir({ slug: input.slug });
    const into = path.join(tempDir, 'out.html');
    const result = runSkill({
      args: [...input.args, '--into', into],
      stdin: input.stdin,
    });
    const html = fs.existsSync(into) ? fs.readFileSync(into, 'utf-8') : '';
    return {
      ...result,
      html,

      /**
       * .what = the temp path is scrubbed OUT of stdout before it can
       *         reach a snapshot
       *
       * .why  = the skill echoes `wrote: <path>`, and that path carries a
       *         timestamp AND a random suffix AND the checkout's own
       *         directory name. snapshot it raw and the file rewrites
       *         itself on every run, differs between two worktrees of one
       *         repo, and differs between a laptop and CI.
       *
       *         a snapshot that changes on its own catches no change. worse,
       *         it trains every reader to wave through its diff, which is
       *         exactly where a real regression hides.
       *
       * ⚠️ BOTH passes run, and the second is not redundant. the exact
       *    split is precise when it matches — but the skill may print a
       *    CANONICALIZED path while `genTempDir` returns the path it
       *    created. those name one directory and can differ as strings, so
       *    a `.split(tempDir)` can silently match zero times and leave the
       *    random suffix in the snapshot. the shape-keyed regex covers that
       *    gap.
       */
      stdout: result.stdout
        .split(tempDir)
        .join('$TMP')
        .replace(/\S*\/\.temp\/[^/\s]+/g, '$TMP'),

      /**
       * ⚠️ ASSERT AN ABSENCE AGAINST `markup`, NEVER `html`.
       *
       * this file is heavily commented ON PURPOSE — the comments carry
       * the statutory cites a notary or a clerk may need to check. but
       * that means the comments legitimately CONTAIN the very strings a
       * negative assertion hunts for:
       *
       *   `☐`                    — in the note on why the box is drawn
       *                            rather than typed
       *   `<body class="draft">` — in the note on the draft/final toggle
       *   `Jurat`                — in the note on why no title is printed
       *
       * so `not.toContain` against the raw file fails on the skill's own
       * documentation while the rendered document is perfectly correct.
       * two of these bit on the first run.
       *
       * ⚠️ TWO comment syntaxes reach the output, and the first fix caught
       *    only one. `<!-- -->` carries the prose notes; `/* *\/` inside
       *    `<style>` carries the CSS notes — and the ☐ note lives THERE,
       *    which is why a third run was needed. strip both.
       *
       * a positive assertion may use either. an absence picks by WHAT
       * it guards:
       *
       *   an absent rendered FEATURE  -> `markup`. a comment about the
       *                                  feature is not the feature
       *   an absent LEAK              -> `html`. a real entity name in a
       *                                  comment is still a leak, so the
       *                                  stricter target is correct there
       */
      markup: html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, ''),
    };
  };

  given('[case1] --variants', () => {
    when('[t0] the variants are listed', () => {
      then('all four are shown, each with its statutory cite', () => {
        const result = runSkill({ args: ['--variants'] });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plain');
        expect(result.stdout).toContain('jurat');
        expect(result.stdout).toContain('acknowledgment');
        expect(result.stdout).toContain('acknowledgment-rep');
        // every notarial variant names the section it was copied from
        expect(result.stdout).toContain('§117.05(13)(a)');
        expect(result.stdout).toContain('§117.05(13)(b)');
        expect(result.stdout).toContain('§117.05(13)(c)');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] --help', () => {
    when('[t0] help is requested', () => {
      then('usage is shown', () => {
        const result = runSkill({ args: ['--help'] });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage');
        expect(result.stdout).toContain('--variant');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] variant=plain', () => {
    when('[t0] a plain letterhead is produced', () => {
      then('it carries no notarial block at all', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-plain',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--title',
            'Notice of Change of Agent',
          ],
        });

        expect(result.exitCode).toBe(0);
        expect(result.html).toContain('SANDPINE, INC.');
        expect(result.html).toContain('Notice of Change of Agent');
        // the whole certificate apparatus stays away
        expect(result.markup).not.toContain('STATE OF FLORIDA');
        expect(result.markup).not.toContain('notarial seal');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] variant=jurat', () => {
    when('[t0] a sworn statement is produced', () => {
      then('it carries the Florida jurat, verbatim', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-jurat',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'jurat',
            '--signer',
            "Eagle Of'Rhight",
          ],
        });

        expect(result.exitCode).toBe(0);
        // the statutory sentence, which is what tells a notary the act
        expect(result.html).toContain(
          'Sworn to (or affirmed) and subscribed before me',
        );
        expect(result.html).toContain('STATE OF FLORIDA');
      });

      then(
        'the three elements an out-of-state template drops are present',
        async () => {
          const result = await runIntoTemp({
            slug: 'letterhead-jurat-elements',
            args: ['--entity', 'SANDPINE, INC.', '--variant', 'jurat'],
          });

          // (c) physical presence vs audio-video — TWO drawn boxes, never a
          //     literal ☐, which is absent from most webfonts
          expect(result.html).toContain('physical presence');
          expect(result.html).toContain('online notarization');
          expect((result.html.match(/class="box"/g) ?? []).length).toBe(2);
          expect(result.markup).not.toContain('☐');

          // (f) the identification relied upon
          expect(result.html).toContain('Personally Known');
          expect(result.html).toContain('Type of Identification Produced');

          // (h) the notary's name BELOW the signature
          const sigAt = result.html.indexOf('Signature of Notary Public');
          const nameAt = result.html.indexOf(
            'Commissioned Name of Notary Public',
          );
          expect(sigAt).toBeGreaterThan(-1);
          expect(nameAt).toBeGreaterThan(sigAt);
        },
      );

      /**
       * ⛔ the certificate carries NO title, and this clamps it.
       *
       * surveyed 13 of 14 executed documents untitled, 4 of 4 on
       * letterhead, 5 of 5 SOS form families; and 23 of 23 blocks across
       * Florida's own four sources. an earlier prototype printed `Jurat`
       * here on an invented convention.
       */
      then('the notarial block carries no title', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-jurat-untitled',
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'jurat'],
        });

        expect(result.markup).not.toMatch(/Jurat/i);
        // and the block still opens on the venue, per the statutory form
        expect(result.markup).toContain('STATE OF FLORIDA');
      });

      then('the seal area is reserved and left genuinely empty', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-jurat-seal',
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'jurat'],
        });

        expect(result.html).toContain('seal-box');
        // 1.0in x 2.6in clears the largest RECTANGULAR cap of the five
        // jurisdictions inventoried (Tex. Gov't Code §406.013(b))
        expect(result.html).toContain('height: 1in; width: 2.6in');
      });
    });
  });

  /**
   * ⛔ THE STATE GUARD — the reason this skill exists.
   *
   * a jurat is not portable. a Texas form on a Florida document was a
   * real blocker on a real submission; the skill refuses rather than emit
   * a certificate it cannot source.
   */
  given('[case5] a notarial variant for an uncited state', () => {
    when('[t0] a jurat is requested for texas', () => {
      then('it is refused, and both exits are offered', () => {
        const result = runSkill({
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'jurat',
            '--state',
            'texas',
          ],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('no cited notarial form');
        expect(result.stderr).toContain('texas');
        expect(result.stderr).toContain('NOT portable');
        // the two ways forward
        expect(result.stderr).toContain('--state florida');
        expect(result.stderr).toContain('--variant plain');
        expect(result.stderr).toMatchSnapshot();
      });
    });

    when('[t1] a PLAIN letterhead is requested for texas', () => {
      then(
        'it succeeds — the guard is scoped to notarial variants',
        async () => {
          const result = await runIntoTemp({
            slug: 'letterhead-plain-texas',
            args: [
              '--entity',
              'SANDPINE, INC.',
              '--variant',
              'plain',
              '--state',
              'texas',
            ],
          });

          expect(result.exitCode).toBe(0);
          expect(result.html).toContain('SANDPINE, INC.');
        },
      );
    });
  });

  /**
   * ⛔ THE CAPACITY GUARD.
   *
   * five states for five prescribe no representative-capacity jurat. an
   * oath is a personal act and a corporation cannot swear, so capacity
   * belongs in the document and never in the certificate.
   */
  given('[case6] --capacity on a jurat', () => {
    when('[t0] a capacity is passed with a jurat', () => {
      then('it is refused, and the one form with a slot is named', () => {
        const result = runSkill({
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'jurat',
            '--capacity',
            'President',
          ],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('no capacity slot');
        expect(result.stderr).toContain('§117.05(13)(a)');
        expect(result.stderr).toContain('acknowledgment-rep');
        expect(result.stderr).toMatchSnapshot();
      });
    });

    when('[t1] a capacity is passed with variant=plain', () => {
      then('it lands in the document, where it belongs', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-capacity-plain',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'plain',
            '--signer',
            "Eagle Of'Rhight",
            '--capacity',
            'President',
          ],
        });

        expect(result.exitCode).toBe(0);
        // the lead sentence and the signature caption both carry it
        expect(result.html).toContain('President of');
        expect(result.html).toContain("Eagle Of'Rhight, President");
      });
    });
  });

  given('[case7] variant=acknowledgment-rep', () => {
    when('[t0] no capacity is supplied', () => {
      then('it is refused — the form has a slot that must be filled', () => {
        const result = runSkill({
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'acknowledgment-rep',
          ],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('needs --capacity');
        expect(result.stderr).toMatchSnapshot();
      });
    });

    when('[t1] a capacity is supplied', () => {
      then('the certificate carries the statutory capacity slot', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-ackrep',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'acknowledgment-rep',
            '--signer',
            "Eagle Of'Rhight",
            '--capacity',
            'President',
          ],
        });

        expect(result.exitCode).toBe(0);
        expect(result.html).toContain('instrument was acknowledged');
        expect(result.html).toContain('type of authority');
        expect(result.html).toContain(
          'name of party on behalf of whom instrument was executed',
        );
        // it is an acknowledgment, so it must NOT read as an oath
        expect(result.markup).not.toContain('Sworn to (or affirmed)');
      });
    });
  });

  /**
   * the checkbox stays on the individual acknowledgment even though the
   * DOS samples page omits it there. §117.05(4) makes the
   * presence-vs-online disclosure element (c) of "a jurat or notarial
   * certificate" — it is not scoped to jurats.
   */
  given('[case8] variant=acknowledgment', () => {
    when('[t0] an individual acknowledgment is produced', () => {
      then('it keeps the mandatory presence/online checkbox', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-ack',
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'acknowledgment'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.html).toContain('instrument was acknowledged');
        expect((result.html.match(/class="box"/g) ?? []).length).toBe(2);
        // and no capacity slot, since (13)(b) has none
        expect(result.markup).not.toContain('type of authority');
      });
    });
  });

  /**
   * ⛔ src/domain.roles/ ships to npm. a demo must never carry a real
   *    entity or a real person. see
   *    rule.require.collision-checked-pseudonyms.
   */
  given('[case9] --demo', () => {
    when('[t0] a jurat demo is produced', () => {
      then('it is pseudonymized, and names no real entity', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-demo',
          args: ['--demo', 'jurat'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.html).toContain('SANDPINE, INC.');
        expect(result.html).toContain("Eagle Of'Rhight");

        /**
         * ⭐ the WHOLE html is pinned — comments included — because a
         *    `not.toContain('<one name>')` can guard only the single
         *    value it names, and IT MUST NAME THAT VALUE TO DO SO. that
         *    is how the clamp for "no real entity" became the one file
         *    in this skill that carried a real entity toward npm: the
         *    assertion proving the demo names no real entity WAS the
         *    thing that wrote one into a published directory.
         *
         *    an exact snapshot guards the CLASS instead: any real value,
         *    anywhere in the document, diverges from the pin — and it
         *    names none of them. strictly stronger, and it leaks no value.
         *
         * .why the raw html rather than `markup`: a real entity name in
         *      a comment is still a leak, per the note on `markup` above.
         *      the stricter target is correct for a leak.
         *
         * .why this is safe to pin: the document embeds no date, no
         *      random value, and no path. `$INTO` reaches exactly THREE
         *      sites in `doc.letterhead.sh`, and none of them is the
         *      document — the `[[ -z "$INTO" ]]` default guard, the
         *      `} >"$INTO"` redirect that closes the emit block, and the
         *      `print_tree_leaf "wrote" "$INTO"` stdout line. so two runs
         *      on two machines render byte-identical output.
         *
         * ⚠️ that is a CHECKABLE claim, not a recollection: `rg -n
         *    '\$INTO' doc.letterhead.sh` must return those three and no
         *    others. a fourth hit inside the emit block would make this
         *    pin machine-dependent.
         *
         * ⚠️ PROVEN TO BITE 2026-08-31, and note HOW — because it cannot
         *    be proven the ordinary way. `package.json` passes
         *    `--updateSnapshot` unconditionally (an unquoted
         *    `[ -n $RESNAP ]` word-splits to `[ -n ]`, which is always
         *    true), so NO snapshot in this repo can go red today. see
         *    task #42; the fix is upstream at declapract v0.47.48.
         *
         *    so the bite was measured by the trace the disabled guard
         *    still leaves: a sentinel was written into this pin, INSIDE
         *    THE HTML COMMENT — exactly the leak class, and a position
         *    the two `toContain` lines above cannot see. one run later
         *    the sentinel was gone and the file was byte-identical to a
         *    pre-run copy. the comparison happened and the values
         *    diverged; under an honest harness that divergence IS the
         *    red.
         *
         *    ⛔ do NOT weaken this back to a `not.toContain`. that shape
         *       is the defect, not the fallback.
         */
        expect(result.html).toMatchSnapshot();
        expect(result.stdout).toMatchSnapshot();
      });

      then('the demo omits capacity, since a jurat has no slot', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-demo-nocap',
          args: ['--demo', 'jurat'],
        });

        // the guard would have refused; the demo must not trip it
        expect(result.exitCode).toBe(0);
        expect(result.stderr).toBe('');
      });
    });

    when('[t1] an acknowledgment-rep demo is produced', () => {
      then('it supplies a capacity, since that form needs one', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-demo-ackrep',
          args: ['--demo', 'acknowledgment-rep'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.html).toContain('President');
      });
    });
  });

  /**
   * ⛔ THE DRAFT/FINAL DISTINCTION IS CARRIED BY CSS, NOT BY THE MARKUP.
   *
   * the banner `<div class="draft-banner">` is emitted on EVERY path —
   * it sits in the `HTML_HEAD` heredoc, outside any conditional. what
   * makes it appear or not is two style rules plus the body class:
   *
   *   `.draft-banner { display: none; }`            <- hides it by default
   *   `body.draft .draft-banner { display: block }` <- reveals it on a draft
   *   `body.draft .seal-box { border: ... dashed }` <- the seal guide
   *
   * ⚠️ SO `toContain('Draft for review')` IS SATISFIED BY A FINAL. the text
   *    is in the file either way. the assertion below is kept as a
   *    structural presence check and is marked so no later reader mistakes
   *    it for a discriminator (leak 1: a needle the report emits on every
   *    path).
   *
   * ⚠️ AND `<body class="draft">` — which IS a real discriminator, and was
   *    the only one here — is not sufficient on its own, because the class
   *    is an inert label until a rule keys on it. drop `body.draft ` from
   *    either rule and the body tag is still perfectly correct while the
   *    rendered document is wrong.
   *
   * the four edits this now covers, none of which move the body class:
   *
   *   | edit                                   | what a human receives      |
   *   |----------------------------------------|----------------------------|
   *   | delete `.draft-banner { display:none }` | a FINAL prints DRAFT       |
   *   | unscope the `display: block` rule       | a FINAL prints DRAFT       |
   *   | unscope the `.seal-box` border          | a FINAL prints a border in |
   *   |                                         | the seal area              |
   *   | delete the `body.draft` banner rule     | 🚨 a DRAFT prints CLEAN    |
   *
   * ⛔ the last row is the dangerous one, and it is SILENT: a draft that
   *    renders as a finished instrument is a draft that gets signed and
   *    sworn. the stdout would still say `this is a DRAFT` — that branch
   *    is separate (`:977`) and reads `$MODE`, not the stylesheet — so the
   *    terminal and the artifact would disagree, and only the artifact
   *    reaches the notary.
   *
   * ⛔ the seal-box row is a STATUTORY constraint, not a cosmetic one. the
   *    skill's own note at `:867-871` says the border prints on the draft
   *    only "because a border is printed matter and the point is to hand
   *    the notary an area with none" — §117.05(3)(a) requires the seal be
   *    photographically reproducible, and a dashed rule under a rubber
   *    stamp fights that.
   */
  given('[case10] --mode', () => {
    /**
     * .what = pull every style rule whose selector names `sel`, each with
     *         its own selector text attached
     *
     * .why  = the guarantee is not "the rule exists" but "the rule is
     *         SCOPED to the draft". a bare `toContain('border')` cannot
     *         tell `body.draft .seal-box { border }` from `.seal-box {
     *         border }`, and those two are the correct document and the
     *         defective one.
     *
     * ⚠️ `[^\n{}]*` deliberately does not cross a newline, so each match
     *    picks up only the selector on its own line — which is where
     *    `body.draft ` sits.
     */
    const cssRulesFor = (input: { css: string; sel: string }): string[] =>
      input.css.match(
        new RegExp(`[^\\n{}]*\\${input.sel}\\s*\\{[^}]*\\}`, 'g'),
      ) ?? [];

    when('[t0] mode is draft', () => {
      const result = useBeforeAll(async () =>
        runIntoTemp({
          slug: 'letterhead-draft',
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'jurat'],
        }),
      );

      then('the body carries the draft class', () => {
        expect(result.html).toContain('<body class="draft">');
      });

      /**
       * ⚠️ NOT A DISCRIMINATOR — the div is emitted unconditionally, so a
       *    FINAL satisfies this too. kept because an absent div would be a
       *    real regression; see the block comment above.
       */
      then('the banner div is present (structure only)', () => {
        expect(result.html).toContain('Draft for review');
      });

      /**
       * ⭐ THE REVEAL RULE. without it the banner div is inert — the
       *    default `display: none` one section up wins, and the draft
       *    renders as a clean, finished instrument.
       */
      then('⭐ the banner is revealed ONLY by a draft-scoped rule', () => {
        const rules = cssRulesFor({ css: result.markup, sel: '.draft-banner' });
        expect(rules).toHaveLength(2); // positive control: hide + reveal

        const [hide, reveal] = rules;
        expect(hide).toMatch(/^\s*\.draft-banner\s*\{[^}]*display:\s*none/);
        expect(reveal).toContain('body.draft');
        expect(reveal).toMatch(/display:\s*block/);
      });

      /**
       * ⭐ THE SEAL GUIDE. the `then`-string of the case this replaces
       *    named it — "the banner AND the dashed seal guide both print" —
       *    and no assertion in any file read it.
       *
       * ⛔ and its SCOPE is the statutory half: a border that reaches the
       *    final is printed matter inside the seal area.
       */
      then('⭐ the seal border is scoped to the draft, and only there', () => {
        const rules = cssRulesFor({ css: result.markup, sel: '.seal-box' });
        expect(rules.length).toBeGreaterThan(0); // positive control

        const bordered = rules.filter((rule) => /border:/.test(rule));
        expect(bordered).toHaveLength(1);
        expect(bordered[0]).toContain('body.draft');
      });
    });

    when('[t1] mode is final', () => {
      const result = useBeforeAll(async () =>
        runIntoTemp({
          slug: 'letterhead-final',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--variant',
            'jurat',
            '--mode',
            'final',
          ],
        }),
      );

      then('the body carries no draft class', () => {
        expect(result.markup).toContain('<body>');
        expect(result.markup).not.toContain('<body class="draft">');
      });

      /**
       * ⭐ THE DEFAULT HIDE. this is the ONLY reason a final does not print
       *    the banner — the div is in the file regardless. delete this one
       *    declaration and every final document a notary ever sees is
       *    stamped DRAFT FOR REVIEW across the top.
       */
      then('⭐ the stylesheet hides the banner by default', () => {
        const rules = cssRulesFor({ css: result.markup, sel: '.draft-banner' });
        expect(rules.length).toBeGreaterThan(0); // positive control

        const unscoped = rules.filter((rule) => !rule.includes('body.draft'));
        expect(unscoped).toHaveLength(1);
        expect(unscoped[0]).toMatch(/display:\s*none/);
      });

      /**
       * ⭐ and the final's own seal area carries no rule that draws in it.
       *    same check as the draft's, asserted from the other side, because
       *    the harm lands HERE — on the copy the notary stamps.
       */
      then('⭐ no unscoped rule draws a border in the seal area', () => {
        const rules = cssRulesFor({ css: result.markup, sel: '.seal-box' });
        expect(rules.length).toBeGreaterThan(0); // positive control

        const unscoped = rules.filter((rule) => !rule.includes('body.draft'));
        expect(unscoped.length).toBeGreaterThan(0); // positive control
        unscoped.forEach((rule) => expect(rule).not.toMatch(/border:/));
      });
    });
  });

  given('[case11] bad arguments', () => {
    when('[t0] no entity is supplied', () => {
      then('it is refused', () => {
        const result = runSkill({ args: ['--variant', 'plain'] });
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('entity required');
      });
    });

    when('[t1] the variant is unknown', () => {
      then('it is refused, and the list is named', () => {
        const result = runSkill({
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'affidavit'],
        });
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown --variant');
        expect(result.stderr).toContain('--variants');
      });
    });

    when('[t2] the mode is unknown', () => {
      then('it is refused', () => {
        const result = runSkill({
          args: ['--entity', 'SANDPINE, INC.', '--mode', 'preview'],
        });
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown --mode');
      });
    });

    when('[t3] the argument is unknown', () => {
      then('it is refused', () => {
        const result = runSkill({
          args: ['--entity', 'SANDPINE, INC.', '--nope', 'x'],
        });
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown argument');
      });
    });
  });

  given('[case12] an entity name that carries markup characters', () => {
    when('[t0] the name holds an ampersand and angle brackets', () => {
      then('they are escaped, so the markup cannot break', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-escape',
          args: ['--entity', 'SANDPINE & <SONS>, INC.'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.html).toContain('SANDPINE &amp; &lt;SONS&gt;, INC.');
        expect(result.html).not.toContain('<SONS>');
      });
    });
  });

  /**
   * the certificate must never part company with the statement it
   * certifies, and the page height is DERIVED from the @page margins
   * rather than chosen. both carry real weight and neither is enforced by
   * any rule in the css, so they are clamped here.
   */
  given('[case13] the one-page apparatus', () => {
    when('[t0] a notarial document is produced', () => {
      then(
        'the certificate is unsplittable and the height is derived',
        async () => {
          const result = await runIntoTemp({
            slug: 'letterhead-onepage',
            args: ['--entity', 'SANDPINE, INC.', '--variant', 'jurat'],
          });

          expect(result.html).toContain('break-inside: avoid');
          // letter (11in) − 0.7in top − 0.7in bottom = 9.6in
          expect(result.html).toContain('margin: 0.7in 1in 0.7in 1in');
          expect(result.html).toContain('min-height: 9.6in');
        },
      );
    });
  });

  /**
   * a broken logo box on a document handed to an agency reads as a
   * defective document. the file must carry no external refs at all.
   */
  given('[case14] self-containment', () => {
    when('[t0] any document is produced', () => {
      then('it references no external asset', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-selfcontained',
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'jurat'],
        });

        // an absent rendered feature, so `markup` — a url named in a
        // comment issues no request
        expect(result.markup).not.toContain('<img');
        expect(result.markup).not.toContain('src=');
        expect(result.markup).not.toContain('<link');
        expect(result.markup).not.toContain('http://');
        expect(result.markup).not.toContain('https://');
      });
    });
  });

  /**
   * .why = ⭐ THE SWORN TEXT ITSELF HAD ZERO ASSERTIONS. not one of the 26
   *        cases above reads a body paragraph — `8,000,000`, `class="body"`
   *        and `issued shares` appear nowhere in this file.
   *
   *        so `--body` was an arg-parse arm no case reached, and
   *        `emit_body_paragraphs` was a function every demo case RAN and
   *        none observed. those are the two halves of the same hole, and
   *        neither is visible from a read of the assertions.
   *
   *        ✅ PROVEN to bite. the loop body at `emit_body_paragraphs`
   *        replaced by a bare `:` — so the document renders its letterhead,
   *        its title, its doc-ref, its signature block and its full
   *        notarial certificate, with NO STATEMENT IN IT — left the suite
   *        at **26 passed, 0 failed**.
   *
   *        ⚠️ that is a jurat bound for a Florida notary and the Delaware
   *        Division of Corporations, in which the thing being sworn to is
   *        absent. every guard in the suite passed.
   */
  given('[case15] the sworn statement', () => {
    /**
     * ⚠️ `<p class="body">` is rendered by TWO different sites, so a bare
     *    count of it names no site:
     *
     *      the CAPACITY lead sentence — "I, X, President of Y, state as
     *        follows:", emitted only when SIGNER and CAPACITY are BOTH set
     *      emit_body_paragraphs      — one per --body
     *
     *    the two `when`s below are chosen to split exactly on that gate: a
     *    jurat demo sets no capacity (the skill suppresses it), so its body
     *    paragraphs are all sworn text; an acknowledgment demo does, so its
     *    first is the lead sentence. an instrument that could not tell them
     *    apart would report the same number for both.
     */
    const bodyParas = (input: { of: string }): string[] =>
      Array.from(input.of.matchAll(/<p class="body">([\s\S]*?)<\/p>/g)).map(
        (m) => m[1] ?? '',
      );

    when('[t0] the demo fills the bodies and no capacity is set', () => {
      then('every sworn paragraph reaches the document, in order', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-body-demo',
          args: ['--demo', 'jurat', '--state', 'florida'],
        });

        // positive control: the render happened and the apparatus is there.
        // without it, a skill that wrote an EMPTY FILE would satisfy the
        // ordering and exclusion assertions below trivially.
        expect(result.exitCode).toBe(0);
        expect(result.markup).toContain('Sworn to (or affirmed)');

        const paras = bodyParas({ of: result.markup });

        // the count. a jurat demo sets no capacity, so the lead sentence
        // does not fire and every one of these is sworn text.
        expect(paras).toHaveLength(2);

        /**
         * ⭐ the discriminator, and the reason this is two assertions
         *    rather than one `toContain` over the whole document.
         *
         *    the PLAUSIBLE WRONG FIX for a perceived duplicate is to emit
         *    `BODIES[0]` and drop the loop. under it, paragraph 1 is still
         *    present and still correct — so a presence check on it, or on
         *    `8,000,000`, stays GREEN over a document that has lost its
         *    continuity clause. only an assertion on paragraph 2 reddens.
         *
         *    the INDEX is what carries the order. a reversed loop puts the
         *    continuity clause before the fact it continues, which reads as
         *    incoherent to a notary and is invisible to any set-shaped
         *    assertion.
         */
        expect(paras[0]).toContain('8,000,000');
        expect(paras[1]).toContain('initial issuance');
      });
    });

    when('[t1] a capacity IS set, so the lead sentence renders too', () => {
      then(
        'the lead sentence is FIRST and the sworn text follows',
        async () => {
          const result = await runIntoTemp({
            slug: 'letterhead-body-capacity',
            args: ['--demo', 'acknowledgment', '--state', 'florida'],
          });

          expect(result.exitCode).toBe(0);
          const paras = bodyParas({ of: result.markup });

          // three now, not two — the lead sentence joined them. an instrument
          // that reported 2 here would be blind to the site it came from.
          expect(paras).toHaveLength(3);
          expect(paras[0]).toContain('state as follows');
          expect(paras[1]).toContain('8,000,000');
          expect(paras[2]).toContain('initial issuance');

          // ⭐ and the lead sentence is NOT a sworn paragraph. it must not be
          // emitted by the body loop, or a caller who passes --body gets a
          // sentence they never wrote.
          expect(paras[1]).not.toContain('state as follows');
          expect(paras[2]).not.toContain('state as follows');
        },
      );
    });

    when('[t2] the caller supplies --body', () => {
      then(
        'the caller\u2019s text is used, and the demo\u2019s is not',
        async () => {
          const result = await runIntoTemp({
            slug: 'letterhead-body-caller',
            args: [
              '--entity',
              'SANDPINE, INC.',
              '--body',
              'The first sworn paragraph.',
              '--body',
              'The second sworn paragraph.',
            ],
          });

          expect(result.exitCode).toBe(0);
          const paras = bodyParas({ of: result.markup });

          // ⭐ this `when` is the only one that reaches the `--body` arm at
          // all. before it, that arm had no case in any file.
          expect(paras).toHaveLength(2);
          expect(paras[0]).toBe('The first sworn paragraph.');
          expect(paras[1]).toBe('The second sworn paragraph.');
        },
      );
    });

    when('[t3] the caller supplies --body @stdin', () => {
      then('the piped text becomes the sworn paragraph', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-body-stdin',
          args: ['--entity', 'SANDPINE, INC.', '--body', '@stdin'],
          stdin: 'A paragraph that arrived down a pipe.',
        });

        expect(result.exitCode).toBe(0);
        const paras = bodyParas({ of: result.markup });

        // the `@stdin` sub-branch. its failure mode is an EMPTY paragraph,
        // which renders as a document with a blank line where the statement
        // belongs — so the exact text is asserted, never mere presence.
        expect(paras).toHaveLength(1);
        expect(paras[0]).toBe('A paragraph that arrived down a pipe.');
      });
    });

    when('[t4] the sworn text carries markup characters', () => {
      then('they are escaped, so the statement cannot break', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-body-escape',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--body',
            'Holders of A & B <series> stock.',
          ],
        });

        expect(result.exitCode).toBe(0);

        // [case12] clamps this for the ENTITY. the body runs through the
        // same `as_html`, by a different call site, and had no case.
        expect(result.html).toContain('A &amp; B &lt;series&gt; stock.');
        expect(result.markup).not.toContain('<series>');
      });
    });
  });

  /**
   * .why = ⭐ FOUR FLAGS WITH NO CASE AT ALL. `--addr`, `--ref`, `--accent`
   *        and `--accent2` are arg-parse arms that no test in this file
   *        passes, and their four emission sites are outputs that every
   *        `--demo` case RUNS and none reads.
   *
   *        ⚠️ the demo path is what hides them. `--demo` fills ADDR and REF
   *        with defaults, so an ARM walk — "which case reaches this line?"
   *        — answers "every demo case" and moves on. only the OUTPUT walk
   *        — "which assertion READS this?" — finds the hole. that is leak
   *        5's second shape, and a line-coverage report scores it 100%.
   *
   *        ⚠️ and each pair is a leak-3 site: the renderer emits the SAME
   *        shape twice, so a bare token names no cell.
   *
   *          `<p class="X">value</p>`   -> addr AND doc-ref
   *          `--accentN: color;`        -> accent AND accent2
   *
   *        a SWAP of either pair leaves both caller values present and
   *        every containment assertion green. so each `then` below carries
   *        the whole row plus the cross-pair exclusion.
   */
  given('[case16] the caller-supplied letterhead fields', () => {
    when('[t0] --addr and --ref are both supplied', () => {
      then('⭐ each lands under ITS OWN anchor, never the other', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-addr-ref',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--title',
            'Statement of Issued Shares',
            '--addr',
            '12 Example Way, Wilmington, DE 19801',
            '--ref',
            'Ref-Alpha-42',
          ],
        });

        // positive control. without it, an EMPTY file satisfies both
        // exclusions below trivially.
        expect(result.exitCode).toBe(0);
        expect(result.markup).toContain('<p class="name">SANDPINE, INC.</p>');

        // ⭐ ADJACENCY, not presence. the address belongs INSIDE the
        //    letterhead block, directly under the wordmark.
        //
        // ⚠️ `[ ]*` and not `\s*`. `\s` matches a newline, so `\s*` would
        //    let a paragraph three rows down satisfy a pair it does not
        //    belong to — the defect, reintroduced inside the fix for it.
        expect(result.markup).toMatch(
          /<p class="name">SANDPINE, INC\.<\/p>\n[ ]*<p class="addr">12 Example Way, Wilmington, DE 19801<\/p>/,
        );

        // and the reference belongs under the TITLE, a separate block
        expect(result.markup).toMatch(
          /<h1 class="doc-title">Statement of Issued Shares<\/h1>\n[ ]*<p class="doc-ref">Ref-Alpha-42<\/p>/,
        );

        // ⭐ the discriminators. a swap of the two emission sites keeps
        //    both values in the document and reads as correct.
        expect(result.markup).not.toContain('<p class="addr">Ref-Alpha-42</p>');
        expect(result.markup).not.toContain(
          '<p class="doc-ref">12 Example Way, Wilmington, DE 19801</p>',
        );
      });
    });

    when('[t1] --addr is omitted', () => {
      then('the address paragraph is absent, not empty', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-addr-absent',
          args: ['--entity', 'SANDPINE, INC.'],
        });

        // positive control: the letterhead rendered, so the absence below
        // is a real absence rather than a blank document
        expect(result.exitCode).toBe(0);
        expect(result.markup).toContain('<p class="name">SANDPINE, INC.</p>');

        // the `[[ -n "$ADDR" ]]` guard. its failure mode is an EMPTY
        // paragraph, which prints a blank line where an address belongs —
        // so the CLASS is excluded, never merely the value.
        expect(result.markup).not.toContain('class="addr"');
      });
    });

    when('[t2] --accent and --accent2 are both supplied', () => {
      then('⭐ each reaches ITS OWN custom property', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-accents',
          args: [
            '--entity',
            'SANDPINE, INC.',
            '--accent',
            '#ff0000',
            '--accent2',
            '#00ff00',
          ],
        });

        expect(result.exitCode).toBe(0);

        // the whole declaration, never the bare color. both properties
        // render as `--accentN: <color>;`, so a color alone names no site.
        //
        // ⚠️ the trailing colon carries the discrimination: `--accent2`
        //    contains `--accent` as a substring, and `var(--accent)` closes
        //    with `)`. only `--accent:` matches exactly one declaration.
        expect(result.markup).toContain('--accent: #ff0000;');
        expect(result.markup).toContain('--accent2: #00ff00;');

        // ⭐ the discriminators. under a swap both colors are still in the
        //    stylesheet and both `toContain`s above stay green.
        expect(result.markup).not.toContain('--accent: #00ff00;');
        expect(result.markup).not.toContain('--accent2: #ff0000;');
      });
    });

    when('[t3] neither accent is supplied', () => {
      then('the documented defaults reach the stylesheet', async () => {
        const result = await runIntoTemp({
          slug: 'letterhead-accents-default',
          args: ['--entity', 'SANDPINE, INC.'],
        });

        expect(result.exitCode).toBe(0);

        // the two defaults the docblock advertises. an unread default is
        // how `--accent` silently becomes empty — `--accent: ;` is valid
        // css that renders an unstyled wordmark at exit 0.
        expect(result.markup).toContain('--accent: #1f2937;');
        expect(result.markup).toContain('--accent2: #9ca3af;');
      });
    });
  });

  /**
   * .why = ⭐ `--variants` IS THE DECISION INSTRUMENT. it is the table a
   *        human reads to pick which notarial act their document needs,
   *        and picking wrong is the defect this whole skill exists to
   *        prevent.
   *
   *        [case1] asserts SEVEN bare tokens against it and cannot see a
   *        single one of its three columns:
   *
   *          `notary: no|yes`            -> ZERO assertions
   *          `capacity slot: n/a|no|YES` -> ZERO assertions
   *          the statutory cite          -> 3 bare `toContain`
   *
   *        ⚠️ and the four rows render in ONE shape, so a bare token names
   *           no row. that is leak 3, four ways over:
   *
   *             ├─ <slug>: <note>
   *             │     notary: <n> · capacity slot: <c> · <cite>
   *
   *           swap any column between two rows and every token is still
   *           present, so all seven assertions stay green.
   *
   *        ⚠️ `toContain('acknowledgment')` is worse than weak — it is a
   *           SUBSTRING of `acknowledgment-rep`, so it is satisfied by the
   *           other row and cannot tell the two apart at all.
   *
   *        🚨 and the snapshot beside them is ANTI-evidence. under
   *           always-on `--updateSnapshot` it rewrites itself toward
   *           whatever the skill just emitted, so it launders a defect
   *           into the committed baseline rather than catching it.
   */
  given('[case17] the --variants decision table', () => {
    when('[t0] the variants are listed', () => {
      then('⭐ each column pairs with ITS OWN row, never another', () => {
        const result = runSkill({ args: ['--variants'] });

        // positive control. every assertion below is a pairing or an
        // exclusion, and an EMPTY stdout satisfies the exclusions freely.
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('doc.letterhead --variants');

        // ⭐ ADJACENCY. the detail line belongs to the slug directly above
        //    it, so each row is asserted WHOLE and pinned to its own slug.
        //
        // ⚠️ `[ ]` and never `\s`. `\s` matches a newline, so a detail line
        //    three rows down would satisfy a slug it does not belong to —
        //    the swap, re-admitted inside the clamp written to catch it.
        expect(result.stdout).toMatch(
          /├─ plain:[^\n]*\n[ ]*│[ ]+notary: no · capacity slot: n\/a · —/,
        );
        expect(result.stdout).toMatch(
          /├─ jurat:[^\n]*\n[ ]*│[ ]+notary: yes · capacity slot: no · Fla\. Stat\. §117\.05\(13\)\(a\)/,
        );
        expect(result.stdout).toMatch(
          /├─ acknowledgment:[^\n]*\n[ ]*│[ ]+notary: yes · capacity slot: no · Fla\. Stat\. §117\.05\(13\)\(b\)/,
        );
        // the last row is a LEAF, so it carries no `│` continuation bar
        expect(result.stdout).toMatch(
          /└─ acknowledgment-rep:[^\n]*\n[ ]+notary: yes · capacity slot: YES · Fla\. Stat\. §117\.05\(13\)\(c\)/,
        );
      });

      then('⭐ exactly ONE row carries a capacity slot', () => {
        const result = runSkill({ args: ['--variants'] });
        expect(result.exitCode).toBe(0);

        // ⭐ THE TABLE'S OWN CLAIM ABOUT ITSELF, clamped as a COUNT.
        //
        //    the acknowledgment-rep note reads "the ONLY form with a
        //    capacity slot", and TWO separate guards enforce it — [case6]
        //    refuses `--capacity` on a jurat, [case7] refuses
        //    acknowledgment-rep WITHOUT one.
        //
        //    a count is what a pairwise assertion cannot give you: it
        //    fails on a SPURIOUS second YES anywhere in the table,
        //    even in a row nobody thought to pin.
        expect(result.stdout.match(/capacity slot: YES/g)).toHaveLength(1);
        expect(result.stdout.match(/capacity slot: no/g)).toHaveLength(2);
        expect(result.stdout.match(/capacity slot: n\/a/g)).toHaveLength(1);

        // ⭐ the discriminator the pairs alone leave open. a swap of the
        //    capslot column sends a corporate officer who needs their
        //    office on the certificate to the jurat — which then REFUSES
        //    them — and steers them off the one act that would have
        //    carried it.
        expect(result.stdout).not.toMatch(/├─ jurat:[^\n]*\n[^\n]*YES/);
        expect(result.stdout).not.toMatch(
          /└─ acknowledgment-rep:[^\n]*\n[^\n]*capacity slot: no/,
        );
      });

      then('only the non-notarial variant reads notary: no', () => {
        const result = runSkill({ args: ['--variants'] });
        expect(result.exitCode).toBe(0);

        // `plain` is the one variant that emits no certificate at all
        // ([case3] proves the apparatus stays away). the column that says
        // so had no assertion — so a swap advertised a notary-free jurat.
        expect(result.stdout.match(/notary: no /g)).toHaveLength(1);
        expect(result.stdout.match(/notary: yes /g)).toHaveLength(3);
        expect(result.stdout).not.toMatch(/├─ jurat:[^\n]*\n[^\n]*notary: no /);
      });
    });
  });

  /**
   * .why = ⛔ THE REFUSAL MESSAGE IS THE DELIVERABLE, and its decisive
   *        sentence had no assertion that could see it.
   *
   *        `[case5][t0]` covers the exit code and five bare tokens. but
   *        the guard interpolates `$STATE` at THREE sites, and one bare
   *        `toContain('texas')` is satisfied by the first one alone:
   *
   *          :318  `blocked: no cited notarial form for state: texas`
   *          :330  `so a signer in texas wants a texas form`   <- x2
   *          :340  `-- the safe default for texas`
   *
   *        ⭐ line :330 IS THE RULE THAT RESOLVED TASK #35 — a Texas form
   *           on a Florida document, caught on a real submission. it is
   *           the one sentence that tells a refused human which way the
   *           portability rule runs.
   *
   *        🚨 swap either slot to the cited state and the message reads
   *           "so a signer in FLORIDA wants a FLORIDA form" — to a user
   *           who just told us their notary is in Texas. that is the
   *           EXACT inversion this skill exists to prevent, printed by
   *           the guard built to prevent it. and `toContain('texas')`
   *           stays GREEN off the `blocked:` line.
   *
   *        the invariant, stated plainly:
   *
   *          the REQUESTED state is what the signer WANTS.
   *          the CITED state may be OFFERED as an option, and must
   *          never be ADVISED as the form this signer wants.
   *
   *        ⚠️ the snapshot beside `[t0]` is not a backstop. under
   *           always-on `--updateSnapshot` it rewrites itself toward
   *           whatever the skill just emitted (observed on this very
   *           file: probe C's log closed with `1 snapshot updated`
   *           while the defect was live).
   */
  given('[case18] the refusal message for an uncited state', () => {
    when('[t0] a jurat is requested for texas', () => {
      // ⚠️ `--entity` IS LOAD-BEARING HERE. the entity guard runs BEFORE
      //    the state guard and also exits 2 — so an args list without it
      //    refuses for the wrong reason while `exitCode).toBe(2)` stays
      //    GREEN. that is leak 6, the exit-code coincidence, and it was
      //    observed inside this very clamp on its first run: both cases
      //    went red on their MESSAGE assertions, never on the code.
      const args = [
        '--entity',
        'SANDPINE, INC.',
        '--variant',
        'jurat',
        '--state',
        'texas',
      ];

      then('⭐ it advises the REQUESTED state, never the cited one', () => {
        const result = runSkill({ args });

        // positive control. every decisive assertion below is a pair or
        // an exclusion, and an EMPTY stderr satisfies the exclusions
        // freely.
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain(
          'no cited notarial form for state: texas',
        );

        // ⭐ THE DECISIVE SENTENCE, WHOLE. both slots pinned in one
        //    match, so a swap of either cannot pass.
        expect(result.stderr).toMatch(
          /so a signer in texas wants a texas form/,
        );

        // and the recommendation names who it is for
        expect(result.stderr).toMatch(/-- the safe default for texas/);

        // ⭐ the discriminators. a half-swap leaves one slot correct, so
        //    the pair above must be joined by exclusions that fire on the
        //    cited state in either advice slot.
        expect(result.stderr).not.toMatch(
          /so a signer in \S+ wants a florida form/,
        );
        expect(result.stderr).not.toMatch(/so a signer in florida wants/);
        expect(result.stderr).not.toMatch(/the safe default for florida/);
      });

      then('⭐ the cited state appears ONLY where it is OFFERED', () => {
        const result = runSkill({ args });
        expect(result.exitCode).toBe(2);

        // ⭐ THE COUNT — the complement of the pairs above, per the result
        //    measured on `[case17]`: a SWAP preserves a multiset within
        //    one column, so a count alone cannot see it. here the swap is
        //    ACROSS two values, so the count DOES move — and it
        //    additionally catches a spurious mention in a line nobody
        //    thought to pin.
        //
        //    `florida` is cited exactly twice, and both are offers:
        expect(result.stderr.match(/florida/g)).toHaveLength(2);
        expect(result.stderr).toContain('cited states: florida');
        expect(result.stderr).toContain(
          '--state florida    ONLY if the notary is there',
        );
      });
    });

    when('[t1] a PLAIN letterhead is requested for texas', () => {
      then(
        '⛔ no Florida venue reaches a document bound for texas',
        async () => {
          const result = await runIntoTemp({
            slug: 'letterhead-plain-texas-venue',
            args: [
              '--entity',
              'SANDPINE, INC.',
              '--variant',
              'plain',
              '--state',
              'texas',
            ],
          });

          // `[case3]` proves the apparatus stays away at the DEFAULT state.
          // this is the same property at an UNCITED one — the combination
          // that produced the original blocker: a Florida venue pre-printed
          // onto a document whose notary is elsewhere.
          //
          // `[case5][t1]` asserts exit 0 and the entity name; neither can
          // see a venue that leaked in.
          expect(result.exitCode).toBe(0);
          expect(result.markup).not.toContain('STATE OF FLORIDA');
          expect(result.markup).not.toContain('Sworn to (or affirmed)');
          expect(result.markup).not.toContain('notarial seal');
        },
      );
    });
  });

  /**
   * ⛔ THE DEFAULT `--into` PATH IS UNREACHABLE FROM `runIntoTemp`, AND
   *    THAT HELPER'S OWN DOCBLOCK SAYS WHY.
   *
   * `runIntoTemp` appends `--into` on every call (`:52`), and every case
   * in this file above goes through it. so `doc.letterhead.sh:387-389`
   *
   *   if [[ -z "$INTO" ]]; then
   *     INTO="./letterhead.$(as_slug "$ENTITY").html"
   *   fi
   *
   * was never once executed — and with it, `as_slug` (`:152-156`), whose
   * ONLY caller in the whole skill is that one line.
   *
   * ⭐ the helper exists BECAUSE of this path. its docblock reads:
   *    "a case that forgets the temp dir writes into the repo instead."
   *    that is exactly right, and it is why the default went uncovered —
   *    **the safety mechanism created the blind spot.** the cure is not to
   *    drop the hermetic wrapper but to point a DIFFERENT hermetic wrapper
   *    at the default: run with `cwd` set to a temp dir and no `--into`,
   *    so the relative path resolves inside the temp dir rather than into
   *    the checkout.
   *
   * what a human loses if the slug drifts: the skill reports `wrote: <p>`
   * and exits 0, so the run looks clean either way. the document simply is
   * not where they were told it is — and the next run, with a different
   * entity, may silently overwrite it if the slug collapses to a constant.
   */
  given('[case19] --into, defaulted', () => {
    /**
     * .what = run the skill with NO `--into`, from inside a fresh temp dir
     *
     * .why  = the default is a RELATIVE path, so the only thing that keeps
     *         it out of the checkout is the process cwd. `runSkill` already
     *         accepts one; this supplies a temp dir and reads back whatever
     *         landed there.
     */
    const runIntoCwd = async (input: {
      args: string[];
      slug: string;
    }): Promise<{
      stdout: string;
      exitCode: number;
      files: string[];
      html: string;
    }> => {
      const cwd = await genTempDir({ slug: input.slug });
      const result = runSkill({ args: input.args, cwd });
      const files = fs.readdirSync(cwd).sort();
      return {
        ...result,
        files,
        html:
          files.length === 1
            ? fs.readFileSync(path.join(cwd, files[0]!), 'utf-8')
            : '',
      };
    };

    when('[t0] a plain entity name', () => {
      const result = useBeforeAll(async () =>
        runIntoCwd({
          slug: 'letterhead-default-into',
          args: ['--entity', 'SANDPINE, INC.', '--variant', 'plain'],
        }),
      );

      then('the run succeeds', () => {
        expect(result.exitCode).toBe(0);
      });

      /**
       * ⭐ THE WHOLE GUARANTEE, AS A DIRECTORY LISTING.
       *
       * an exact listing is the right assertion here because it carries
       * three claims at once, and a bare `existsSync` carries none of
       * them: that the file is THERE, that it is named EXACTLY this, and
       * that no OTHER file was written beside it.
       *
       * ⚠️ the trailing `.` of `INC.` and the `, ` both collapse to `-`,
       *    so the trim of the trailing dash is load-bearing — without it
       *    this reads `letterhead.sandpine-inc-.html`.
       */
      then('⭐ it lands at the entity-derived default name, alone', () => {
        expect(result.files).toEqual(['letterhead.sandpine-inc.html']);
      });

      /**
       * ⭐ POSITIVE CONTROL, AND NOT A DECORATIVE ONE. a skill that made
       *    the name and left the file EMPTY would satisfy the listing
       *    above in full. so the control reads the bytes.
       */
      then('⭐ the defaulted file holds a real document', () => {
        expect(result.html).toContain('<!DOCTYPE html>');
        expect(result.html).toContain('SANDPINE, INC.');
      });

      /**
       * ⚠️ the bare word `letterhead` is in this skill's own name and in
       *    its markup, so it is not a discriminator. the assertion is the
       *    FULL relative path, which is the thing a human copies.
       */
      then('⭐ stdout names the defaulted path, not a bare directory', () => {
        expect(result.stdout).toContain('./letterhead.sandpine-inc.html');
      });
    });

    when('[t1] an entity name dense with punctuation', () => {
      const result = useBeforeAll(async () =>
        runIntoCwd({
          slug: 'letterhead-default-into-punct',
          args: [
            '--entity',
            "Eagle Of'Rhight & Sons, L.L.C.",
            '--variant',
            'plain',
          ],
        }),
      );

      /**
       * ⭐ THE CROSS-PAIR. `[t0]` alone cannot see a slug that ignores its
       *    input — a default hardcoded to one constant name would satisfy
       *    a single case. two DIFFERENT entities must yield two DIFFERENT
       *    filenames, and this one exercises the collapse of a run of
       *    punctuation (`' & `, `, `, `.`) that `[t0]` does not reach.
       */
      then('⭐ a different entity yields a different name', () => {
        expect(result.exitCode).toBe(0);
        expect(result.files).toEqual([
          'letterhead.eagle-of-rhight-sons-l-l-c.html',
        ]);
        expect(result.files).not.toEqual(['letterhead.sandpine-inc.html']);
      });
    });
  });

  /**
   * ⭐ LEAK 7 — a property of HOW THE SKILL IS REACHED, which no case above
   *    can see.
   *
   *    every other case in this file arrives via
   *    `spawnSync('bash', [scriptPath, ...])`. that hands the file to an
   *    INTERPRETER, and an interpreter reads a file it can READ — the
   *    executable bit is never consulted. so a `644` file passes all of
   *    them.
   *
   *    `rhx` does not interpret, it EXECS, so the kernel checks `+x` and
   *    refuses before a single line is parsed. there is no stdout at exit
   *    126, so no assertion over output could ever have closed this.
   *
   *    ⚠️ MEASURED 2026-09-05, on this skill:
   *
   *        rhx doc.letterhead --help
   *        Exit code 126
   *        /bin/bash: line 1: .../doc.letterhead.sh: Permission denied
   *
   *    ⚠️ 51 tests were green at the time — every one of them, and none of
   *       them could see it. (53 total after this case; 52 pass and the mode
   *       assertion below is red until a human `chmod +x`es the source.)
   *
   *    🚩 that figure was first written here as "38", which is the count from
   *       the `audit.refusal.messages` clamp this case is modelled on — a
   *       number carried across from a NEIGHBOURING file rather than measured
   *       on this one. caught and corrected the same day. a borrowed figure in
   *       a docblock reads exactly like a measured one.
   *
   *    ⛔ read the mode INSIDE the `then`. a `useThen` hands back a PROXY,
   *       and a proxy coerced by a bitwise operator yields `NaN` — so the
   *       clamp would report red on a file that IS executable, and its red
   *       would prove none of what it claims.
   *
   *    see `rule.require.assertions-that-discriminate`, leak 7.
   */
  given(
    '[case20] the skill is reached through a real exec, not an interpreter',
    () => {
      when('[t0] the file mode is read off disk', () => {
        then(
          '⭐ it carries the executable bit — no spawn-through-bash case can see this',
          () => {
            const mode = fs.statSync(scriptPath).mode;
            // eslint-disable-next-line no-bitwise
            expect(mode & 0o111).not.toBe(0);
          },
        );
      });

      /**
       * ⭐ THE POSITIVE CONTROL. the assertion above is satisfied by any
       *    non-zero bit, so on its own it cannot tell a real read from a
       *    path that points somewhere else by accident.
       */
      when('[t1] the path under test is the skill itself', () => {
        then('it is the entrypoint, present on disk', () => {
          expect(fs.existsSync(scriptPath)).toBe(true);
          expect(path.basename(scriptPath)).toBe('doc.letterhead.sh');
        });
      });
    },
  );
});
