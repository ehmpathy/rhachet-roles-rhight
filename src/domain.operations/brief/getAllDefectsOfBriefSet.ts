import type { BriefIntegrityDefect } from '../../domain.objects/brief/BriefIntegrityDefect';
import { asBriefAnatomy } from './asBriefAnatomy';

/**
 * .what = check the invariants that no single brief can see
 * .why = ⭐ this is the check the whole engagement earned. a blind red-team
 *        reported that the comms INDEX published the subject of the two
 *        🕶️ obscure briefs. the index was repaired — and a later link pass
 *        found the SAME defect in three other fullsun briefs, four times
 *        over, one of them in a body blockquote where a publication-time
 *        strip of `.publishability` blocks would never have reached it.
 *
 *        a report names an instance; the fix is owed to the class. this
 *        operation is the class.
 */
export const getAllDefectsOfBriefSet = (input: {
  briefs: { path: string; content: string }[];
}): BriefIntegrityDefect[] => {
  // read every brief's triage tag once
  const tagged = input.briefs.map((brief) => ({
    ...brief,
    basename: asBasename({ path: brief.path }),
    publishability: asBriefAnatomy({ content: brief.content }).publishability,
  }));

  // the files a published set must not so much as name
  const guarded = tagged.filter(
    (brief) =>
      brief.publishability === 'obscure' || brief.publishability === 'protect',
  );
  if (!guarded.length) return [];

  // every fullsun brief is checked against every guarded basename
  return tagged
    .filter((brief) => brief.publishability === 'fullsun')
    .flatMap((brief) =>
      guarded.flatMap((secret) => {
        const lines = brief.content.split('\n');
        return lines.flatMap((line, offset) => {
          if (!line.includes(secret.basename)) return [];
          return [
            {
              path: brief.path,
              check: 'fullsun-names-non-fullsun' as const,
              severity: 'blocker' as const,
              line: offset + 1,
              detail: `a ☀️ fullsun brief names \`${secret.basename}\`, which is tagged 🕶️/🔒. to name a withheld file — and state its subject — publishes its abstract to a reader who cannot open it. the mitigation becomes the disclosure.`,
            },
          ];
        });
      }),
    );
};

/**
 * .what = the filename at the end of a path
 */
const asBasename = (input: { path: string }): string =>
  input.path.split('/').pop() ?? input.path;
