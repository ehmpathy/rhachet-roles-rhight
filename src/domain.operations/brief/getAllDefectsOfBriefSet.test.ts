import { given, then, when } from 'test-fns';

import { getAllDefectsOfBriefSet } from './getAllDefectsOfBriefSet';

/**
 * .what = a minimal brief that carries one triage tag
 */
const asBriefTagged = (input: {
  tag: 'fullsun' | 'obscure' | 'protect';
  body?: string;
}): string =>
  [
    '# a brief',
    '',
    input.body ?? 'a body.',
    '',
    '## .publishability',
    '',
    `☀️ **${input.tag}** — a tag.`,
    '',
    '☀️ **both triage gates have run.** a decoy line that must not be read as the tag.',
  ].join('\n');

describe('getAllDefectsOfBriefSet', () => {
  given('[case1] a fullsun brief that names an obscure brief', () => {
    when('[t0] the set is checked', () => {
      const defects = getAllDefectsOfBriefSet({
        briefs: [
          {
            path: 'comms/ref.public.[ref].md',
            content: asBriefTagged({
              tag: 'fullsun',
              body: 'see `rule.require.consent-provenance-record.[rule].md` for the record design.',
            }),
          },
          {
            path: 'comms/rule.require.consent-provenance-record.[rule].md',
            content: asBriefTagged({ tag: 'obscure' }),
          },
        ],
      });

      then('a blocker fires against the fullsun file', () => {
        expect(defects).toHaveLength(1);
        expect(defects[0]?.check).toEqual('fullsun-names-non-fullsun');
        expect(defects[0]?.severity).toEqual('blocker');
        expect(defects[0]?.path).toEqual('comms/ref.public.[ref].md');
      });

      then('it reports the line, so the reference can be found', () => {
        expect(defects[0]?.line).toEqual(3);
      });
    });
  });

  given(
    '[case2] ⭐ the reference sits in a BODY blockquote, not in .publishability',
    () => {
      when('[t0] the set is checked', () => {
        then(
          'it still fires — a publication-time strip would have missed it',
          () => {
            const defects = getAllDefectsOfBriefSet({
              briefs: [
                {
                  path: 'comms/ref.public.[ref].md',
                  content: asBriefTagged({
                    tag: 'fullsun',
                    body: '> the moment a reader asks what to do, see `rule.require.consent-provenance-record.[rule].md`.',
                  }),
                },
                {
                  path: 'comms/rule.require.consent-provenance-record.[rule].md',
                  content: asBriefTagged({ tag: 'obscure' }),
                },
              ],
            });
            expect(defects).toHaveLength(1);
            expect(defects[0]?.check).toEqual('fullsun-names-non-fullsun');
          },
        );
      });
    },
  );

  given('[case3] a fullsun brief that names only other fullsun briefs', () => {
    when('[t0] the set is checked', () => {
      then('no defect fires', () => {
        const defects = getAllDefectsOfBriefSet({
          briefs: [
            {
              path: 'comms/ref.public.[ref].md',
              content: asBriefTagged({
                tag: 'fullsun',
                body: 'see `ref.other.[ref].md`.',
              }),
            },
            {
              path: 'comms/ref.other.[ref].md',
              content: asBriefTagged({ tag: 'fullsun' }),
            },
          ],
        });
        expect(defects).toEqual([]);
      });
    });
  });

  given('[case4] an obscure brief that names another obscure brief', () => {
    when('[t0] the set is checked', () => {
      then('no defect fires — the guard is on the PUBLISHED side only', () => {
        const defects = getAllDefectsOfBriefSet({
          briefs: [
            {
              path: 'comms/rule.a.[rule].md',
              content: asBriefTagged({
                tag: 'obscure',
                body: 'see `rule.b.[rule].md`.',
              }),
            },
            {
              path: 'comms/rule.b.[rule].md',
              content: asBriefTagged({ tag: 'obscure' }),
            },
          ],
        });
        expect(defects).toEqual([]);
      });
    });
  });

  given('[case5] a set with no guarded brief at all', () => {
    when('[t0] the set is checked', () => {
      then('no defect fires', () => {
        const defects = getAllDefectsOfBriefSet({
          briefs: [
            {
              path: 'comms/ref.a.[ref].md',
              content: asBriefTagged({ tag: 'fullsun' }),
            },
          ],
        });
        expect(defects).toEqual([]);
      });
    });
  });

  given('[case6] a protect-tagged brief', () => {
    when('[t0] a fullsun brief names it', () => {
      then('it blocks the same as an obscure one', () => {
        const defects = getAllDefectsOfBriefSet({
          briefs: [
            {
              path: 'comms/ref.public.[ref].md',
              content: asBriefTagged({
                tag: 'fullsun',
                body: 'see `ref.secret.[ref].md`.',
              }),
            },
            {
              path: 'comms/ref.secret.[ref].md',
              content: asBriefTagged({ tag: 'protect' }),
            },
          ],
        });
        expect(defects).toHaveLength(1);
        expect(defects[0]?.check).toEqual('fullsun-names-non-fullsun');
      });
    });
  });
});
