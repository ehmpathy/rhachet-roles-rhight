import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the doc.signature skill
 * .why  = verify the skill renders a cursive-signature html from any name,
 *         honors --pick to narrow to one face, and fails fast on bad input.
 *         hermetic: writes only into a temp dir, makes no network calls.
 */

const skillPath = path.join(__dirname, 'doc.signature.sh');

const UTF8 = 'utf-8' as const;

const runSkill = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [skillPath, ...args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

// eager, not deferred: path.join needs a real string, not a test-fns proxy
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-signature-'));

describe('doc.signature.sh', () => {
  given('[case1] a caller who wants to see the available faces', () => {
    when('[t0] --faces is requested', () => {
      const result = useThen('it exits clean', () => {
        const res = runSkill(['--faces']);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        return res;
      });

      then('it lists every face', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      /**
       * ⭐ THE SNAPSHOT ABOVE CANNOT FAIL, so before this the whole
       *    `--faces` output surface was guarded by an EXIT CODE alone.
       *
       *    `[ -n $RESNAP ]` in package.json collapses to `[ -n ]`, which
       *    POSIX evaluates as "is the string `-n` non-empty" — true, for
       *    every value of RESNAP. so `--updateSnapshot` is passed on every
       *    run and a drifted snapshot is silently REWRITTEN rather than
       *    reported. see task #127, where a snapshot passed under a probe
       *    that inverted its skill's whole purpose.
       *
       *    so: neuter the loop body in `show_faces` and the skill prints a
       *    header, NO faces at all, and exits 0 — under a `then`-string
       *    that says "it lists every face".
       */
      then('⭐ it renders one row per face, not merely a header', () => {
        const rows = result.stdout.match(/^\s+[├└]─ \d+: /gm) ?? [];
        expect(rows).toHaveLength(10);
      });

      /**
       * ⭐ THE PAIRING IS THE PAYLOAD, and a count cannot see it.
       *
       *    the NUMBER is the only handle `--pick` accepts, so a roster
       *    that renders every family under the WRONG number is worse than
       *    an empty one — it is confidently, legibly wrong. a bare
       *    `toContain('Great Vibes')` is satisfied by exactly that.
       */
      then('⭐ each row pairs its NUMBER with its OWN family', () => {
        expect(result.stdout).toMatch(/[├└]─ 1: Great Vibes — /);
        expect(result.stdout).toMatch(/[├└]─ 5: Herr Von Muellerhoff — /);
        expect(result.stdout).toMatch(/└─ 10: Italianno — /);
        // the discriminator: a field-order slip in the `IFS` read puts the
        // NOTE where the family belongs, and every count stays green.
        expect(result.stdout).not.toMatch(/[├└]─ 1: formal copperplate/);
      });
    });
  });

  given('[case2] a name and no face choice', () => {
    when('[t0] the picker is rendered', () => {
      const outcome = useThen('it exits clean', () => {
        const into = path.join(tempDir, 'picker.html');
        const res = runSkill(['--name', 'Ada Lovelace', '--into', into]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        return { res, html: fs.readFileSync(into, UTF8) };
      });

      then('every face card renders — 10 faces + 2 initials blocks', () => {
        const cards = outcome.html.match(/class="sig slant"/g) ?? [];
        expect(cards).toHaveLength(12);
      });

      /**
       * .why = ⭐ the count above claims a CARD COUNT and the `then`-string
       *        used to claim THE NAME. those are two different facts, and
       *        the count cannot see the second one.
       *
       *        `Ada Lovelace` was, before this, an INPUT in five places and
       *        an ASSERTION in zero. the card body is the `${NAME}` that
       *        closes the `<div class="sig slant">` in the CARDS loop of
       *        `doc.signature.sh`; the initials are a SEPARATE `MARK=`
       *        awk derivation under `if [[ -z "$PICK" ]]`. so the `>A.L.<`
       *        check below proves the name reached the initials path and
       *        says none about the cards.
       *
       *        ✅ PROVEN to bite. that card `${NAME}` replaced by the literal
       *        `Grace Hopper` — every one of the ten signature cards
       *        rendering somebody else's name — left the suite at
       *        **16 passed, 0 failed**. stdout, the title, the h1 and the
       *        initials all stayed correct, so no other assertion could see
       *        it.
       *
       *        ⚠️ this is the skill's whole purpose. a human runs it, opens
       *        the page, picks a face, and signs a legal document with the
       *        signature it showed them.
       */
      then(
        'every card carries the CALLER\u2019s name, not a baked-in one',
        () => {
          const bodies =
            outcome.html.match(/class="sig slant"[^>]*>([^<]*)</g) ?? [];
          const rendered = bodies.map((b) =>
            b.replace(/^.*>/, '').replace(/<$/, '').trim(),
          );

          // positive control: the match above found real card bodies. without
          // it, a regex that matched none would satisfy every filter below.
          expect(rendered).toHaveLength(12);

          // the ten faces carry the name; the two initials blocks carry A.L.
          expect(rendered.filter((r) => r === 'Ada Lovelace')).toHaveLength(10);
          expect(rendered.filter((r) => r === 'A.L.')).toHaveLength(2);
        },
      );

      then('all ten faces are requested from the font host', () => {
        expect(outcome.html).toContain('family=Great+Vibes');
        expect(outcome.html).toContain('family=Herr+Von+Muellerhoff');
        expect(outcome.html).toContain('family=Italianno');
      });

      then('initials are derived from the name', () => {
        expect(outcome.html).toContain('>A.L.<');
      });

      then('it carries the jurat warn banner', () => {
        expect(outcome.html).toContain('jurat');
      });
    });
  });

  given('[case3] a name and a chosen face', () => {
    when('[t0] face 5 is picked', () => {
      const outcome = useThen('it exits clean', () => {
        const into = path.join(tempDir, 'pick5.html');
        const res = runSkill([
          '--name',
          'Ada Lovelace',
          '--pick',
          '5',
          '--into',
          into,
        ]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        return { res, html: fs.readFileSync(into, UTF8) };
      });

      then('only the picked face renders', () => {
        const cards = outcome.html.match(/class="sig slant"/g) ?? [];
        expect(cards).toHaveLength(1);
        expect(outcome.html).toContain("font-family: 'Herr Von Muellerhoff'");
      });

      /**
       * .why = the same gap as `[case2]`, on the path that matters more.
       *        `--pick` is what a human runs LAST, to produce the one
       *        signature they will actually trace. `[case2]`'s clamp cannot
       *        reach here: the card loop is shared, but `--pick` skips the
       *        initials block entirely (`:195` gates on `-z "$PICK"`), so a
       *        defect introduced in the picked branch alone would be
       *        invisible to it.
       *
       *        ✅ PROVEN to bite ALONE, on the PLAUSIBLE WRONG FIX. patch
       *        only the picker — `BODY="$NAME"; [[ -n "$PICK" ]] &&
       *        BODY="Grace Hopper"` — and `[case2]`'s clamp goes GREEN while
       *        this one stays red: **17 passed, 1 failed**, `Expected "Ada
       *        Lovelace" / Received "Grace Hopper"`. that half-fix is what
       *        someone reaches for first when `[case2]` alone is red, so
       *        this clamp is what rules it out.
       */
      then('the picked card carries the caller\u2019s name', () => {
        const body = /class="sig slant"[^>]*>([^<]*)</.exec(outcome.html);
        // positive control: a regex that matched none would make the
        // assertion below vacuous rather than red
        expect(body).not.toBeNull();
        expect(body?.[1]?.trim()).toEqual('Ada Lovelace');
      });

      then('only the picked font is requested from the font host', () => {
        expect(outcome.html).toContain('family=Herr+Von+Muellerhoff');
        expect(outcome.html).not.toContain('family=Great+Vibes');
      });

      then('initials are omitted', () => {
        expect(outcome.html).not.toContain('initials only');
      });

      then('the report reads as expected', () => {
        // split/join, not replace: the path appears twice and replace
        // would only swap the first, leaving an unstable snapshot
        expect(
          outcome.res.stdout.split(tempDir).join('<TEMPDIR>'),
        ).toMatchSnapshot();
      });
    });
  });

  given('[case4] a caller who chose the ink and slant', () => {
    when('[t0] both are supplied', () => {
      then('both reach the css', () => {
        const into = path.join(tempDir, 'inked.html');
        const res = runSkill([
          '--name',
          'Ada Lovelace',
          '--pick',
          '1',
          '--ink',
          '#101010',
          '--slant',
          '-6',
          '--into',
          into,
        ]);
        expect(res.exitCode).toEqual(0);
        const html = fs.readFileSync(into, UTF8);
        expect(html).toContain('--ink: #101010;');
        expect(html).toContain('rotate(-6deg)');
      });
    });
  });

  given('[case5] invalid input', () => {
    when('[t0] no name is supplied', () => {
      then('it fails as a constraint', () => {
        const res = runSkill(['--pick', '1']);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--name is required');
      });
    });

    when('[t1] the picked face is out of range', () => {
      then('it fails as a constraint', () => {
        const res = runSkill(['--name', 'Ada Lovelace', '--pick', '99']);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('--pick must be a number 1-10');
      });
    });

    when('[t2] an unknown argument is supplied', () => {
      then('it fails as a constraint', () => {
        const res = runSkill(['--name', 'Ada Lovelace', '--wat']);
        expect(res.exitCode).toEqual(2);
        expect(res.stdout).toContain('unknown argument');
      });
    });
  });

  /**
   * .why = ⭐ TWO un-read outputs, on the path EVERY case already runs.
   *
   *        1. the VISIBLE warn banner. `[case2]` asserts `toContain('jurat')`
   *           under a `then`-string that claims "the jurat warn banner" — but
   *           the word `jurat` appears TWICE in the document: once in the
   *           `<!-- -->` preamble of `doc.signature.sh`, and once in the
   *           `.warn` div a human actually sees. so the visible
   *           banner can be deleted whole and that assertion stays green over
   *           a page whose only caution is in a comment no browser paints.
   *
   *           ⛔ that banner is the skill's entire safety statement: a typed
   *              cursive signature is valid under ESIGN/UETA and is FORBIDDEN
   *              on a document that needs a jurat. the human this page is for
   *              is one click from a sworn legal document.
   *
   *        2. the stdout report at `:346-367` — `ink`, `bytes`, `wrote`, the
   *           face count, the `file://` path, and the sandbox caution. every
   *           case in this file runs that block and no assertion reads a
   *           single line of it, so a branch walk reports it covered and a
   *           line-coverage report scores it 100%.
   *
   * ⚠️ the `file://` line is the one actionable output: it is how the human
   *    opens what was just written. an empty or wrong path there is a silent
   *    dead end.
   */
  given('[case6] the caution a human SEES, and the report they act on', () => {
    when('[t0] the picker is written', () => {
      const seen = useThen('it exits clean', () => {
        const into = path.join(tempDir, 'visible.html');
        const res = runSkill([
          '--name',
          'Ada Lovelace',
          '--ink',
          '#223344',
          '--into',
          into,
        ]);
        if (res.exitCode !== 0) {
          console.log('PROOF: stdout:', res.stdout);
          console.log('PROOF: stderr:', res.stderr);
        }
        expect(res.exitCode).toEqual(0);
        const html = fs.readFileSync(into, UTF8);
        // ⭐ slice to <body>, so the <!-- --> preamble cannot satisfy any
        //    needle below. the comment sits above <html>, so the cut is clean.
        const at = html.indexOf('<body>');
        return {
          res,
          into,
          bytes: fs.statSync(into).size,
          body: at === -1 ? '' : html.slice(at),
        };
      });

      // ⚠️ the positive control. every assertion under it searches a SLICE,
      //    and an empty slice satisfies a `not.toContain` trivially — so a
      //    missed `<body>` marker would read as a clean pass.
      then('the body slice is real — the cut landed', () => {
        expect(seen.body).not.toEqual('');
        expect(seen.body).toContain('Ada Lovelace');
      });

      then(
        'the jurat caution is in the VISIBLE body, not only a comment',
        () => {
          expect(seen.body).toContain('not for a notarized affidavit');
          expect(seen.body).toContain(
            'an affidavit needs a <em>jurat</em>: the notary administers an oath, then watches you sign in wet ink',
          );
        },
      );

      then('the how-to block tells them what to do with a face', () => {
        expect(seen.body).toContain('how to turn one into a reusable PNG');
      });

      then(
        'the report carries the ink, the face count, and the byte size',
        () => {
          expect(seen.res.stdout).toContain('├─ name: Ada Lovelace');
          expect(seen.res.stdout).toContain('├─ faces: 10 (all)');
          expect(seen.res.stdout).toContain('├─ ink: #223344');
          // ⭐ the byte figure is checked against the FILE, not merely present.
          //    a hardcoded or stale count reddens here and nowhere else.
          expect(seen.res.stdout).toContain(`├─ bytes: ${seen.bytes}`);
          expect(seen.res.stdout).toContain(`└─ wrote: ${seen.into}`);
        },
      );

      then('the report hands back a file:// path that resolves', () => {
        expect(seen.res.stdout).toContain('open it with:');
        expect(seen.res.stdout).toContain(`file://${seen.into}`);
        expect(seen.res.stdout).toContain(
          'if your browser is sandboxed (flatpak/snap), copy it to ~/Downloads first',
        );
      });
    });

    when('[t1] a single face is picked', () => {
      then('the report names THAT face, and drops the count row', () => {
        const into = path.join(tempDir, 'picked-report.html');
        const res = runSkill([
          '--name',
          'Ada Lovelace',
          '--pick',
          '5',
          '--into',
          into,
        ]);
        expect(res.exitCode).toEqual(0);
        // the `--pick` arm of the report is a BRANCH no prior case read
        expect(res.stdout).toMatch(/├─ face: 5 — \S+/);
        expect(res.stdout).not.toContain('faces: 10 (all)');
      });

      /**
       * ⭐ `\S+` ABOVE IS A WILDCARD ON THE ONE CELL THAT NAMES THE HAND.
       *    it is satisfied by `face: 5 — Sacramento`, by `face: 5 — x`,
       *    by any non-space token at all. so the row that tells a signer
       *    WHICH HAND they picked was, until this line, unpinned.
       */
      then('⭐ and it names the family, not merely a token', () => {
        const res = runSkill([
          '--name',
          'Ada Lovelace',
          '--pick',
          '5',
          '--into',
          path.join(tempDir, 'picked-report-named.html'),
        ]);
        expect(res.stdout).toContain('├─ face: 5 — Herr Von Muellerhoff');
      });
    });
  });

  /**
   * ⭐ THE CROSS-MODE TIE — the one assertion in this file that spans both
   *    renderers, and the only one that can see them come apart.
   *
   *    `--faces` is the ONLY place a caller learns which NUMBER means which
   *    HAND. `--pick N` is the only consumer of that number. the two read
   *    the same FACES array today (`:83` and `:352`), but no assertion said
   *    so — so a change to EITHER renderer alone was invisible:
   *
   *      - the `--faces` roster is guarded by a snapshot that cannot fail
   *      - the `--pick` report's family was a `\S+` wildcard
   *
   *    with both ends loose, the skill can advertise one hand and render
   *    another, at exit 0, on a document that will be notarized. a signer
   *    who reads "5 = Herr Von Muellerhoff" and runs `--pick 5` signs a
   *    SWORN INSTRUMENT in a hand they never chose.
   *
   * ⚠️ this asserts a RELATION, so it must read both sides in one case.
   *    two separate cases, each correct about its own mode, cannot say
   *    that the two modes agree.
   */
  given('[case9] the roster and the picker are two views of one array', () => {
    when('[t0] a face is read off the roster and then picked', () => {
      const seen = useThen('both modes exit clean', () => {
        const listed = runSkill(['--faces']);
        expect(listed.exitCode).toEqual(0);

        // pull the family the ROSTER advertises for face 4, off the roster
        // itself — never off a constant, or the tie would be to my memory
        // of the array rather than to what the caller was actually shown.
        const row = listed.stdout.match(/[├└]─ 4: ([^—]+) — /);
        expect(row).not.toBeNull();
        const advertised = row![1]!.trim();

        const picked = runSkill([
          '--name',
          'Ada Lovelace',
          '--pick',
          '4',
          '--into',
          path.join(tempDir, 'tie.html'),
        ]);
        expect(picked.exitCode).toEqual(0);
        return { advertised, picked };
      });

      then('⭐ the picker renders the family the roster advertised', () => {
        // the positive control: an empty capture would satisfy every
        // `toContain` below trivially.
        expect(seen.advertised.length).toBeGreaterThan(3);
        expect(seen.picked.stdout).toContain(`├─ face: 4 — ${seen.advertised}`);
      });

      then('⭐ and the html carries that same family, not another', () => {
        const html = fs.readFileSync(path.join(tempDir, 'tie.html'), UTF8);
        expect(html).toContain(`4 — ${seen.advertised}`);
        // the discriminator: only ONE face may render under --pick, so a
        // family from a neighbouring row must be absent entirely.
        expect(html).not.toContain('Great Vibes');
      });
    });
  });
});
