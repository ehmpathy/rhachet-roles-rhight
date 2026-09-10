import { given, then, when } from 'test-fns';

import {
  asSourceAnchor,
  getAllDefectsOfOneBrief,
} from './getAllDefectsOfOneBrief';

/**
 * .what = a brief that satisfies every mechanical invariant
 * .why = each case below mutates exactly one part off this baseline, so a
 *        test proves the check it names and no other
 */
const asBriefSound = (input?: { body?: string }): string =>
  [
    '# ref.example',
    '',
    '## .what',
    '',
    '> **not legal advice.** informational groundwork for counsel to validate.',
    '',
    input?.body ?? 'the rule turns on § 64.1200 and on Duguid v. Facebook.',
    '',
    '## .publishability',
    '',
    '☀️ **fullsun** (share) — generic public law.',
    '',
    '## .sources',
    '',
    '1. [47 C.F.R. § 64.1200 — the rules](https://a.example)',
    '2. [Duguid v. Facebook — the autodialer case](https://b.example)',
    '3. [a source of an unrecognized shape](https://c.example)',
    '4. [another unrecognized shape](https://d.example)',
    '5. [a third unrecognized shape](https://e.example)',
    '6. [a fourth unrecognized shape](https://f.example)',
    '7. [a fifth unrecognized shape](https://g.example)',
    '',
    '## .date researched',
    '',
    '2026-08-01',
  ].join('\n');

describe('getAllDefectsOfOneBrief', () => {
  given('[case1] a brief that satisfies every invariant', () => {
    when('[t0] it is checked', () => {
      then('no defect is emitted', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'briefs/ref.example.md',
          content: asBriefSound(),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: false,
        });
        expect(defects).toEqual([]);
      });
    });
  });

  given('[case2] a see-also target the caller could not open', () => {
    when('[t0] it is checked', () => {
      const defects = getAllDefectsOfOneBrief({
        path: 'briefs/ref.example.md',
        content: asBriefSound(),
        seeAlsoTargetsAbsent: [{ target: '../../absent.md', line: 42 }],
        isPublishedPath: false,
      });

      then('a blocker names the target and its line', () => {
        expect(defects).toHaveLength(1);
        expect(defects[0]?.check).toEqual('see-also-target-absent');
        expect(defects[0]?.severity).toEqual('blocker');
        expect(defects[0]?.line).toEqual(42);
        expect(defects[0]?.detail).toContain('../../absent.md');
      });
    });
  });

  given('[case3] a brief with six sources', () => {
    when('[t0] it is checked', () => {
      const defects = getAllDefectsOfOneBrief({
        path: 'briefs/ref.example.md',
        content: asBriefSound().replace(
          '7. [a fifth unrecognized shape](https://g.example)\n',
          '',
        ),
        seeAlsoTargetsAbsent: [],
        isPublishedPath: false,
      });

      then('the citation floor blocks', () => {
        expect(defects.map((defect) => defect.check)).toContain(
          'sources-below-seven',
        );
      });

      then('the count is stated, never merely asserted absent', () => {
        const defect = defects.find(
          (found) => found.check === 'sources-below-seven',
        );
        expect(defect?.detail).toContain('6 numbered sources');
      });
    });
  });

  given(
    '[case4] a source whose anchor no sentence uses — the orphan pad',
    () => {
      when('[t0] it is checked', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'briefs/ref.example.md',
          // the body cites § 64.1200 but never Duguid
          content: asBriefSound({ body: 'the rule turns on § 64.1200 alone.' }),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: false,
        });

        then('the unused source is flagged as a nitpick', () => {
          const orphans = defects.filter(
            (defect) => defect.check === 'source-anchor-unreferenced',
          );
          expect(orphans).toHaveLength(1);
          expect(orphans[0]?.severity).toEqual('nitpick');
          expect(orphans[0]?.detail).toContain('Duguid v.');
        });

        then('the source the body DOES use is not flagged', () => {
          expect(
            defects.filter((defect) => defect.detail.includes('§ 64.1200')),
          ).toEqual([]);
        });
      });
    },
  );

  given('[case5] a brief that lacks each required block', () => {
    when('[t0] the not-advice callout is absent', () => {
      then('it blocks', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'briefs/ref.example.md',
          content: asBriefSound().replace(/> \*\*not legal advice.*\n/, ''),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: false,
        });
        expect(defects.map((defect) => defect.check)).toContain(
          'not-advice-callout-absent',
        );
      });
    });

    when('[t1] the date-researched section is absent', () => {
      then('it blocks', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'briefs/ref.example.md',
          content: asBriefSound().replace('## .date researched', '## when'),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: false,
        });
        expect(defects.map((defect) => defect.check)).toContain(
          'date-researched-absent',
        );
      });
    });

    when('[t2] the publishability tag is absent', () => {
      then('it blocks', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'briefs/ref.example.md',
          content: asBriefSound().replace('☀️ **fullsun** (share)', '☀️ shared'),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: false,
        });
        expect(defects.map((defect) => defect.check)).toContain(
          'publishability-tag-absent',
        );
      });
    });
  });

  given(
    '[case6] ⭐ the real defect — a publishability block its own table falsifies',
    () => {
      when(
        '[t0] the claimed-absent sentence appears verbatim elsewhere',
        () => {
          const content = asBriefSound({
            body: 'the reader should just refuse to pay and demand a jury, plainly.',
          }).replace(
            '☀️ **fullsun** (share) — generic public law.',
            '☀️ **fullsun** (share) — the sentence that would have made it obscure — "refuse to pay and demand a jury" — is deliberately absent.',
          );

          const defects = getAllDefectsOfOneBrief({
            path: 'briefs/ref.example.md',
            content,
            seeAlsoTargetsAbsent: [],
            isPublishedPath: false,
          });

          then('the falsified attestation blocks', () => {
            const falsified = defects.filter(
              (defect) => defect.check === 'absence-claim-falsified-exact',
            );
            expect(falsified).toHaveLength(1);
            expect(falsified[0]?.severity).toEqual('blocker');
          });

          then(
            'the detail points at BOTH lines, so a human can compare',
            () => {
              const falsified = defects.find(
                (defect) => defect.check === 'absence-claim-falsified-exact',
              );
              expect(falsified?.detail).toContain('carries it verbatim');
            },
          );
        },
      );

      when('[t1] only a paraphrase appears elsewhere', () => {
        const content = asBriefSound({
          body: '| how does a respondent get a jury? | **refuse to pay** the forfeiture |',
        }).replace(
          '☀️ **fullsun** (share) — generic public law.',
          '☀️ **fullsun** (share) — the sentence "so refuse to pay and demand a jury" is deliberately absent.',
        );

        then('it is a nitpick, never a blocker — the match is fuzzy', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'briefs/ref.example.md',
            content,
            seeAlsoTargetsAbsent: [],
            isPublishedPath: false,
          });
          const falsified = defects.filter((defect) =>
            defect.check.startsWith('absence-claim-falsified'),
          );
          expect(falsified).toHaveLength(1);
          expect(falsified[0]?.check).toEqual('absence-claim-falsified-loose');
          expect(falsified[0]?.severity).toEqual('nitpick');
        });
      });

      when('[t2] the claim is honest — the phrase truly is absent', () => {
        then('no defect fires', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'briefs/ref.example.md',
            content: asBriefSound().replace(
              '☀️ **fullsun** (share) — generic public law.',
              '☀️ **fullsun** (share) — the sentence "refuse to pay and demand a jury" is deliberately absent.',
            ),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: false,
          });
          expect(
            defects.filter((defect) =>
              defect.check.startsWith('absence-claim-falsified'),
            ),
          ).toEqual([]);
        });
      });

      when(
        '[t3] ⚠️ "is absent" describes a CONDITION, with a quote nearby',
        () => {
          then('no defect fires — the clamp on a live false positive', () => {
            // a real brief wrote "…breaks where any one is absent:" about a
            // condition; a coincidental quote three lines below tripped the
            // check. a bare "is absent" only counts when the quote sits
            // immediately BEFORE it, in the shape of an attestation.
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/define.example.md',
              content: asBriefSound({
                body: [
                  'the characterization holds only where three conditions are met,',
                  'and breaks where any one is absent:',
                  '',
                  '1. **earned-only** — a deposit flips it to "funds paid in advance".',
                  '',
                  'the definitions reach funds "funds paid in advance" and more.',
                ].join('\n'),
              }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: false,
            });
            expect(
              defects.filter((defect) =>
                defect.check.startsWith('absence-claim-falsified'),
              ),
            ).toEqual([]);
          });
        },
      );

      when(
        '[t4] the claimed-absent text is a single term, not a sentence',
        () => {
          then('no defect fires — a term is not an attestation', () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/ref.example.md',
              content: asBriefSound({
                body: 'the statute reaches § 64.1200 and Duguid v. Facebook alike.',
              }).replace(
                '☀️ **fullsun** (share) — generic public law.',
                '☀️ **fullsun** (share) — the word "Facebook" does not appear here.',
              ),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: false,
            });
            expect(
              defects.filter((defect) =>
                defect.check.startsWith('absence-claim-falsified'),
              ),
            ).toEqual([]);
          });
        },
      );
    },
  );

  given(
    '[case7] a withheld brief, on a path that ships and on one that does not',
    () => {
      // ⭐ the tag is a note in a file body; the build is an rsync that reads no
      // tag. so a 🕶️ brief left under a published root SHIPS, and its tag
      // records an intent the toolchain never enforced.
      const withheld = (tag: string): string =>
        asBriefSound().replace(
          '☀️ **fullsun** (share) — generic public law.',
          tag,
        );

      when('[t0] an obscure brief sits on a published path', () => {
        then('a blocker is emitted that says to MOVE it, not retag it', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'counselor/briefs/tactic.example.md',
            content: withheld(
              '🕶️ **obscure** (scrub) — picks among lawful options.',
            ),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: true,
          });
          const detected = defects.filter(
            (defect) => defect.check === 'non-fullsun-in-published-path',
          );
          expect(detected.length).toEqual(1);
          expect(detected[0]?.severity).toEqual('blocker');
          expect(detected[0]?.detail).toContain('move it');
        });
      });

      when('[t1] a protect brief sits on a published path', () => {
        then('the same blocker fires — the check is not obscure-only', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'counselor/briefs/ref.client.md',
            content: withheld('🔒 **protect** (withhold) — client identity.'),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: true,
          });
          expect(
            defects.filter(
              (defect) => defect.check === 'non-fullsun-in-published-path',
            ).length,
          ).toEqual(1);
        });
      });

      when('[t2] the SAME obscure brief sits outside the packaged tree', () => {
        then('no defect is emitted — the path is what the check grades', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'role=any/briefs/tactic.example.md',
            content: withheld(
              '🕶️ **obscure** (scrub) — picks among lawful options.',
            ),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: false,
          });
          expect(
            defects.filter(
              (defect) => defect.check === 'non-fullsun-in-published-path',
            ),
          ).toEqual([]);
        });
      });

      when('[t3] a fullsun brief sits on a published path', () => {
        then(
          'no defect is emitted — that is the whole point of the tag',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'counselor/briefs/ref.example.md',
              content: asBriefSound(),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(
              defects.filter(
                (defect) => defect.check === 'non-fullsun-in-published-path',
              ),
            ).toEqual([]);
          },
        );
      });

      when('[t4] a brief on a published path carries NO tag at all', () => {
        then(
          'only the absent-tag blocker fires, never this one — an untagged brief is a different defect',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'counselor/briefs/ref.untagged.md',
              content: asBriefSound()
                .replace('## .publishability', '')
                .replace('☀️ **fullsun** (share) — generic public law.', ''),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(
              defects.filter(
                (defect) => defect.check === 'non-fullsun-in-published-path',
              ),
            ).toEqual([]);
            expect(
              defects.filter(
                (defect) => defect.check === 'publishability-tag-absent',
              ).length,
            ).toEqual(1);
          },
        );
      });
    },
  );

  given(
    "[case8] ⭐ a rollup artifact that claims the citation rule's own exception",
    () => {
      // `rule.require.seven-distinct-citations` exempts *"pure navigation/rollup
      // artifacts that make no independent factual claim"*. the checker did not
      // implement that exception, so a glossary index blocked on a floor its own
      // rule had already waived — and the file declared the exception, in the
      // rule's exact words, while the checker ignored it.
      //
      // ⚠️ the exception has TWO conjunctive halves. each `when` below drops one
      // and proves the floor returns, because a single-half claim is exactly how
      // a brief that argues would slip the floor.
      const asRollup = (input: { claim: string }): string =>
        [
          '# _.glossary — the index',
          '',
          '> **not legal advice.** informational groundwork for counsel to validate.',
          '>',
          `> ${input.claim}`,
          '',
          '## .publishability',
          '',
          '☀️ **fullsun** (share) — an index of public-law briefs.',
          '',
          '## .date researched',
          '',
          '2026-08-05',
        ].join('\n');

      const CLAIM_WHOLE =
        'this is a navigation artifact — it makes no independent factual claim, so it inherits its citations from the briefs it points to.';

      when('[t0] both halves of the exception are declared', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'briefs/_taxonomy/_.glossary.md',
          content: asRollup({ claim: CLAIM_WHOLE }),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: true,
        });

        then(
          'the citation floor does NOT block, though it has 0 sources',
          () => {
            expect(defects.map((defect) => defect.check)).not.toContain(
              'sources-below-seven',
            );
          },
        );

        then(
          'no other defect fires either — the fixture is otherwise sound',
          () => {
            expect(defects).toEqual([]);
          },
        );
      });

      when('[t1] ⭐ the SAME rollup omits its not-advice callout', () => {
        then(
          'that still blocks — only the CITATION floor is waived, never the rest',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/_taxonomy/_.glossary.md',
              content: asRollup({ claim: CLAIM_WHOLE }).replace(
                /> \*\*not legal advice.*\n/,
                '',
              ),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects.map((defect) => defect.check)).toContain(
              'not-advice-callout-absent',
            );
            expect(defects.map((defect) => defect.check)).not.toContain(
              'sources-below-seven',
            );
          },
        );
      });

      when('[t2] ⚠️ only the no-independent-claim half is declared', () => {
        then(
          'the floor STILL blocks — a brief that argues owes its citations even when it inherits them',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/floor.mustcants.md',
              content: asRollup({
                claim:
                  'this file makes no independent factual claim — it inherits its citations.',
              }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects.map((defect) => defect.check)).toContain(
              'sources-below-seven',
            );
          },
        );
      });

      when('[t3] ⚠️ only the navigation-artifact half is declared', () => {
        then(
          'the floor STILL blocks — the character alone does not earn it',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/_taxonomy/_.index.md',
              content: asRollup({
                claim: 'this is a navigation artifact for the set below.',
              }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects.map((defect) => defect.check)).toContain(
              'sources-below-seven',
            );
          },
        );
      });

      when('[t4] ⛔ the file merely SITS in a _taxonomy/ folder', () => {
        then(
          'the floor blocks — the exemption is a declaration, never a path',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/_taxonomy/_.glossary.md',
              content: asRollup({ claim: 'an index of the briefs below.' }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects.map((defect) => defect.check)).toContain(
              'sources-below-seven',
            );
          },
        );
      });

      when('[t5] the blocked message tells a rollup how to claim it', () => {
        then('the error names the fix, not just the symptom', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'briefs/_taxonomy/_.glossary.md',
            content: asRollup({ claim: 'an index of the briefs below.' }),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: true,
          });
          const floor = defects.find(
            (defect) => defect.check === 'sources-below-seven',
          );
          expect(floor?.detail).toContain('navigation/rollup artifact');
          expect(floor?.detail).toContain('no independent factual claim');
        });
      });

      // ⭐ the METHOD-BRIEF half of the same exception.
      //
      // .why = every mechanic in the citation rule presumes an external source
      //        — capture the url, quote it verbatim, dedupe, count seven. a doc
      //        whose subject is how to WRITE a document quotes no external
      //        page, so the count bar measures only whether the author padded
      //        a list. the rule swaps the bar (a traced internal lineage) and
      //        this branch honours that swap.
      //
      // ⛔ the SAME two-half discipline applies: character + no-independent-
      //    claim. a method brief that restates its worked example's factual
      //    content has made an independent claim, and owes the seven.
      when('[t6] ⭐ a method brief declares both halves', () => {
        then(
          'the citation floor does NOT block, though it has 0 sources',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/research/define.the-floor-ladder.md',
              content: asRollup({
                claim:
                  'this file makes no independent factual claim about any subject domain — it is a method brief, and its lineage is internal.',
              }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects).toEqual([]);
          },
        );
      });

      when('[t7] ⚠️ only the method-brief half is declared', () => {
        then(
          'the floor STILL blocks — the character alone does not earn it',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/research/define.the-floor-ladder.md',
              content: asRollup({
                claim: 'this is a method brief about how to write a floor.',
              }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects.map((defect) => defect.check)).toContain(
              'sources-below-seven',
            );
          },
        );
      });

      when('[t8] ⛔ the file merely SITS in a research/ folder', () => {
        then(
          'the floor blocks — the exemption is a declaration, never a path',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'briefs/research/howto.some-method.md',
              content: asRollup({ claim: 'how to run a research pass.' }),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(defects.map((defect) => defect.check)).toContain(
              'sources-below-seven',
            );
          },
        );
      });
    },
  );

  given(
    '[case9] ⭐ an internal engagement path, leaked into a shipped fullsun brief',
    () => {
      // ⭐ a ☀️ fullsun brief on a published path is rsynced verbatim into
      // `dist/` and published to npm. a `.behavior/` or `.route/` engagement
      // path is dead to a consumer and doxxes the internal route. the build
      // reads no brief body, so only this check can catch it.
      //
      // ⚠️ the check is scoped to `.behavior/`/`.route/` PATH tokens ONLY. it
      // does NOT grep `rule.require.*` — a `.see also` to a shipped sibling
      // rule brief is legitimate, and a token grep would train a reader to
      // route around the checker. the false-positive branches below clamp that.
      const withBody = (body: string): string => asBriefSound({ body });

      when('[t0] a .behavior/ path sits in a fullsun published brief', () => {
        const defects = getAllDefectsOfOneBrief({
          path: 'counselor/briefs/ref.example.md',
          content: withBody(
            'the rule turns on § 64.1200 and on Duguid v. Facebook. reproducible pull: `.behavior/v2026_07_30.fix-legal-comms-consent/refs/find.state.play.ts`',
          ),
          seeAlsoTargetsAbsent: [],
          isPublishedPath: true,
        });

        then('a blocker fires that names the leaked path', () => {
          const detected = defects.filter(
            (defect) => defect.check === 'internal-scaffold-leaked-in-fullsun',
          );
          expect(detected).toHaveLength(1);
          expect(detected[0]?.severity).toEqual('blocker');
          expect(detected[0]?.detail).toContain('.behavior/');
        });

        then('the blocker points at the line the leak sits on', () => {
          const detected = defects.find(
            (defect) => defect.check === 'internal-scaffold-leaked-in-fullsun',
          );
          expect(detected?.line).toEqual(7);
        });
      });

      when('[t1] a .route/ path sits in a fullsun published brief', () => {
        then('the same blocker fires — the check is not behavior-only', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'counselor/briefs/ref.example.md',
            content: withBody(
              'the rule turns on § 64.1200 and on Duguid v. Facebook. see `.route/v2026_07_31.package.install/3.reason.md`',
            ),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: true,
          });
          const detected = defects.filter(
            (defect) => defect.check === 'internal-scaffold-leaked-in-fullsun',
          );
          expect(detected).toHaveLength(1);
          expect(detected[0]?.detail).toContain('.route/');
        });
      });

      when('[t2] the SAME leak sits outside the packaged tree', () => {
        then('no defect fires — a leak that never ships is not a leak', () => {
          const defects = getAllDefectsOfOneBrief({
            path: 'role=any/briefs/ref.example.md',
            content: withBody(
              'the rule turns on § 64.1200 and on Duguid v. Facebook. reproducible pull: `.behavior/v2026_07_30.fix-legal-comms-consent/refs/find.state.play.ts`',
            ),
            seeAlsoTargetsAbsent: [],
            isPublishedPath: false,
          });
          expect(
            defects.filter(
              (defect) =>
                defect.check === 'internal-scaffold-leaked-in-fullsun',
            ),
          ).toEqual([]);
        });
      });

      when('[t3] the leak sits in a NON-fullsun published brief', () => {
        then(
          'this check stays silent — the non-fullsun tag is its own blocker',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'counselor/briefs/tactic.example.md',
              content: withBody(
                'the rule turns on § 64.1200 and on Duguid v. Facebook. reproducible pull: `.behavior/v2026_07_30.fix-legal-comms-consent/refs/find.state.play.ts`',
              ).replace(
                '☀️ **fullsun** (share) — generic public law.',
                '🕶️ **obscure** (scrub) — picks among lawful options.',
              ),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(
              defects.filter(
                (defect) =>
                  defect.check === 'internal-scaffold-leaked-in-fullsun',
              ),
            ).toEqual([]);
          },
        );
      });

      when('[t4] ⚠️ a .see also names a shipped sibling rule brief', () => {
        then(
          'no defect fires — a rule.require.* token is not a route path',
          () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'counselor/briefs/ref.example.md',
              content: withBody(
                'the rule turns on § 64.1200 and on Duguid v. Facebook. see also `rule.require.consent-provenance-record`.',
              ),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(
              defects.filter(
                (defect) =>
                  defect.check === 'internal-scaffold-leaked-in-fullsun',
              ),
            ).toEqual([]);
          },
        );
      });

      when(
        '[t5] a clean fullsun published brief names no internal path',
        () => {
          then('no defect fires — the current tree stays green', () => {
            const defects = getAllDefectsOfOneBrief({
              path: 'counselor/briefs/ref.example.md',
              content: asBriefSound(),
              seeAlsoTargetsAbsent: [],
              isPublishedPath: true,
            });
            expect(
              defects.filter(
                (defect) =>
                  defect.check === 'internal-scaffold-leaked-in-fullsun',
              ),
            ).toEqual([]);
          });
        },
      );
    },
  );
});

describe('asSourceAnchor', () => {
  const CASES = [
    {
      description: 'extracts a regulation section',
      title: '47 C.F.R. § 64.1200 — the FCC rules',
      expected: '§ 64.1200',
    },
    {
      description: 'extracts a statute section',
      title: 'Fla. Stat. § 501.059 — the FTSA',
      expected: '§ 501.059',
    },
    {
      description: 'extracts a case name up to the v.',
      title: 'Thomas v. Abercrombie & Fitch Co., 301 F. Supp. 3d 749',
      expected: 'Thomas v.',
    },
    {
      description: 'extracts a chapter token',
      title: 'Tex. Bus. & Com. Code ch. 305 — the private action',
      expected: 'ch. 305',
    },
    {
      description: 'declines to guess at an unrecognized shape',
      title: 'a broker note on coverage',
      expected: null,
    },
  ];

  CASES.map((thisCase) =>
    test(thisCase.description, () => {
      expect(asSourceAnchor({ title: thisCase.title })).toEqual(
        thisCase.expected,
      );
    }),
  );
});
