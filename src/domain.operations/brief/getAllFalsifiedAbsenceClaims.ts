import type { BriefIntegrityDefect } from '../../domain.objects/brief/BriefIntegrityDefect';
import type { BriefAnatomy } from './asBriefAnatomy';

/**
 * .what = phrases by which a brief claims some text is NOT in it
 * .why = the 5th late defect was exactly this: a `.publishability` block
 *        attested that a sentence was "deliberately absent" while the key
 *        takeaways table 21 lines above carried it. an attestation that its
 *        own file falsifies is worse than no attestation, because it is
 *        read as proof the file was checked.
 */
const MARKERS_ABSENCE_EXPLICIT = [
  'deliberately absent',
  'appears nowhere',
  'appeared nowhere',
  'nowhere in this',
  'does not appear',
  'do not appear',
  'is not present',
  'never appears',
  'no such sentence',
];

/**
 * .what = markers that mean absence-of-TEXT only sometimes
 * .why = ⚠️ a live false positive taught this split. a brief wrote
 *        "…breaks where any one is absent:" about a CONDITION, and a
 *        coincidental quote three lines below tripped the check. a bare
 *        "is absent" is polysemous, so it only counts when the quoted
 *        phrase sits immediately before it — the shape of an attestation
 *        ("the sentence \"X\" is absent"), never the shape of prose.
 */
const MARKERS_ABSENCE_GENERIC = ['is absent', 'are absent'];

/**
 * .what = a double-quoted phrase, straight or curly
 */
const PHRASE_QUOTED = /["“]([^"”]{8,240})["”]/g;

/**
 * .what = how far from an explicit marker a quote still counts as its subject
 * .why = an absence claim names its subject close by; a quote three
 *        paragraphs later is a different sentence
 */
const REACH_OF_MARKER = 240;

/**
 * .what = how far BEFORE a generic marker its subject must sit
 * .why = the attestation shape puts the quote immediately before the verb
 */
const REACH_OF_MARKER_GENERIC = 60;

/**
 * .what = words too common to evidence that two lines say the same thing
 */
const WORDS_IGNORED = new Set([
  'that',
  'this',
  'with',
  'from',
  'they',
  'them',
  'have',
  'been',
  'were',
  'which',
  'what',
  'when',
  'their',
  'there',
  'would',
  'could',
  'should',
  'about',
  'into',
  'than',
  'then',
  'made',
  'make',
  'only',
  'also',
  'more',
  'most',
  'such',
  'over',
  'each',
  'both',
  'does',
  'said',
  'says',
]);

/**
 * .what = strip markdown and punctuation so two renders of one phrase match
 */
const asComparable = (input: { text: string }): string =>
  input.text
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/[^a-z0-9§ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * .what = the content words of a phrase, long enough to carry weight
 */
const asContentWords = (input: { text: string }): string[] =>
  asComparable({ text: input.text })
    .split(' ')
    .filter((word) => word.length >= 4 && !WORDS_IGNORED.has(word));

/**
 * .what = detect a brief that claims a phrase is absent while it holds it
 * .why = this is the one contradiction that is fully mechanical. a general
 *        "does the summary contradict the body?" check must read sense;
 *        this one only reads a quote the brief itself supplied.
 */
export const getAllFalsifiedAbsenceClaims = (input: {
  path: string;
  anatomy: BriefAnatomy;
}): BriefIntegrityDefect[] => {
  const content = input.anatomy.lines.join('\n');

  // find each place the brief claims some text is absent
  const claims = [
    ...MARKERS_ABSENCE_EXPLICIT.flatMap((marker) =>
      asAllIndexesOf({ haystack: content.toLowerCase(), needle: marker }).map(
        (index) => ({ index, explicit: true }),
      ),
    ),
    ...MARKERS_ABSENCE_GENERIC.flatMap((marker) =>
      asAllIndexesOf({ haystack: content.toLowerCase(), needle: marker }).map(
        (index) => ({ index, explicit: false }),
      ),
    ),
  ];

  return claims.flatMap(({ index: indexOfMarker, explicit }) => {
    // the quoted phrase the claim is about sits near the marker. an
    // explicit marker reaches both ways; a generic one only backward, and
    // only far enough to catch an attestation's own subject
    const window = explicit
      ? content.slice(
          Math.max(0, indexOfMarker - REACH_OF_MARKER),
          indexOfMarker + REACH_OF_MARKER,
        )
      : content.slice(
          Math.max(0, indexOfMarker - REACH_OF_MARKER_GENERIC),
          indexOfMarker,
        );
    const lineOfClaim = asLineOfIndex({ content, index: indexOfMarker });

    return [...window.matchAll(PHRASE_QUOTED)].flatMap(
      (match): BriefIntegrityDefect[] => {
        const phrase = match[1] ?? '';
        const words = asContentWords({ text: phrase });

        // a claim about a single term is not a claim about a sentence.
        // ⚠️ the floor counts TOTAL words, never content words — the real
        // defect this check exists for ("refuse to pay and demand a jury")
        // carries only three content words, so a content-word floor of four
        // rejected the one sentence that motivated the check.
        if (asComparable({ text: phrase }).split(' ').length < 4) return [];

        // the rest of the file — every line but the ones the claim occupies
        const linesElsewhere = input.anatomy.lines
          .map((line, offset) => ({ line, number: offset + 1 }))
          .filter(({ number }) => Math.abs(number - lineOfClaim) > 2);

        // exact: the phrase itself is carried elsewhere, verbatim
        const carriedExact = linesElsewhere.find(({ line }) =>
          asComparable({ text: line }).includes(asComparable({ text: phrase })),
        );
        if (carriedExact)
          return [
            {
              path: input.path,
              check: 'absence-claim-falsified-exact' as const,
              severity: 'blocker' as const,
              line: lineOfClaim,
              detail: `line ${lineOfClaim} claims "${phrase}" is absent, but line ${carriedExact.number} carries it verbatim. an attestation its own file falsifies reads as proof the file was checked — repair the claim or the line.`,
            },
          ];

        // loose: enough of the phrase's content words co-occur on one line.
        // the bar scales with the phrase — a majority of its content words,
        // never fewer than two, so a long phrase is graded strictly and a
        // short one is not graded on a single incidental word
        const sharedNeeded = Math.max(2, Math.ceil(words.length * 0.6));
        const carriedLoose = linesElsewhere.find(({ line }) => {
          const wordsOfLine = new Set(asContentWords({ text: line }));
          return (
            words.filter((word) => wordsOfLine.has(word)).length >= sharedNeeded
          );
        });
        if (carriedLoose)
          return [
            {
              path: input.path,
              check: 'absence-claim-falsified-loose' as const,
              severity: 'nitpick' as const,
              line: lineOfClaim,
              detail: `line ${lineOfClaim} claims "${phrase}" is absent; line ${carriedLoose.number} carries ${sharedNeeded}+ of its ${words.length} content words. a paraphrase can falsify an attestation as fully as a quote — read both and decide.`,
            },
          ];

        return [];
      },
    );
  });
};

/**
 * .what = every index at which a needle occurs
 */
const asAllIndexesOf = (input: {
  haystack: string;
  needle: string;
}): number[] => {
  const indexes: number[] = [];
  let cursor = input.haystack.indexOf(input.needle);
  while (cursor !== -1) {
    indexes.push(cursor);
    cursor = input.haystack.indexOf(input.needle, cursor + 1);
  }
  return indexes;
};

/**
 * .what = the 1-indexed line a character index falls on
 */
const asLineOfIndex = (input: { content: string; index: number }): number =>
  input.content.slice(0, input.index).split('\n').length;
