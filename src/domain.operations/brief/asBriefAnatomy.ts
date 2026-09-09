/**
 * .what = the shape of a brief, extracted once so every check reads the
 *         same parse rather than each one rolls its own regex
 * .why = six late defects were all "one part of the file contradicts another
 *        part". a check can only compare parts it can name.
 */
export interface BriefAnatomy {
  /** the h1 title, or null when the file opens without one */
  title: string | null;

  /** `## .publishability`'s tag word, or null when no tag line was found */
  publishability: 'fullsun' | 'obscure' | 'protect' | null;

  /** true when a `not legal advice` callout appears anywhere */
  hasNotAdviceCallout: boolean;

  /** true when a `## .date researched` header appears */
  hasDateResearched: boolean;

  /**
   * true when the file claims `rule.require.seven-distinct-citations`'s
   * exception — as a **navigation/rollup artifact** or as a **method brief**
   *
   * ⚠️ the claim must carry BOTH halves the rule states — the doc's exempt
   * CHARACTER (navigation/rollup, or method brief) AND the absence of an
   * independent factual claim. the rule exempts *"pure navigation/rollup
   * artifacts that make no independent factual claim"* and, on the same
   * condition, a doc whose subject is how to write a document. one half
   * alone does not earn it: a brief that merely inherits its citations
   * still argues, and still owes the floor.
   *
   * ⛔ this is a DECLARATION, never an inference from a path or a filename.
   * a filename-keyed exemption is granted by accident — drop any file into a
   * `_taxonomy/` folder and its citation floor silently vanishes. a sentence
   * in the body is deliberate, greppable, and visible in a diff.
   */
  hasCitationExemptionClaim: boolean;

  /** every relative path named as a `.see also` entry, with its line */
  seeAlsoTargets: { target: string; line: number }[];

  /** every numbered entry under `## .sources`, with its line */
  sources: { index: number; title: string; line: number }[];

  /** the text ABOVE `## .sources` — where a source must actually be used */
  bodyAboveSources: string;

  /** the file, split to lines, so a check can report a line number */
  lines: string[];
}

/**
 * .what = the header that opens the sources list
 */
const HEADER_SOURCES = /^#{2,3}\s+\.sources\s*$/;

/**
 * .what = the header that opens the see-also list
 */
const HEADER_SEE_ALSO = /^#{2,3}\s+\.see also\s*$/;

/**
 * .what = the header that opens the publishability triage block
 */
const HEADER_PUBLISHABILITY = /^#{2,3}\s+\.publishability\s*$/;

/**
 * .what = the header that records when the research pass ran
 */
const HEADER_DATE_RESEARCHED = /^#{2,3}\s+\.date researched\s*$/;

/**
 * .what = a numbered source entry, e.g. `3. [Fla. Stat. § 501.059 — ...](url)`
 */
const ENTRY_SOURCE = /^(\d+)\.\s+\[([^\]]+)\]\(/;

/**
 * .what = a see-also entry whose target is a repo path in a code span
 * .why = only a path can be checked; a bare prose entry cannot
 */
const ENTRY_SEE_ALSO_PATH = /^-\s+`([^`]+\.md)`/;

/**
 * .what = the navigation/rollup half of the citation exemption claim
 * .why = `rule.require.seven-distinct-citations` exempts *"pure
 *        navigation/rollup artifacts"*, and this is the character half of
 *        that phrase. matched apart from the second half so the check can
 *        require both.
 */
const CLAIM_ARTIFACT_ROLLUP = /\b(navigation|rollup)\b[^.\n]{0,20}artifact/i;

/**
 * .what = the no-independent-claim half of the citation exemption claim
 * .why = the second half of the same phrase — *"that make no independent
 *        factual claim"*. an artifact that DOES argue owes the floor even
 *        when it inherits its citations, so this half cannot be dropped.
 */
const CLAIM_NO_INDEPENDENT = /no independent factual claim/i;

/**
 * .what = the method-brief half of the citation exemption claim
 * .why = `rule.require.seven-distinct-citations` also exempts a **method
 *        brief** — a doc whose subject is how to WRITE a document rather
 *        than a claim about any subject domain. every mechanic in that rule
 *        presumes an external source (capture the url, quote it verbatim,
 *        dedupe, count seven), so on a doc that quotes no external page the
 *        count bar measures only whether the author padded a list.
 *
 * ⚠️ this half pairs with CLAIM_NO_INDEPENDENT exactly as the rollup half
 *    does, and for the same reason: the rule swaps the bar rather than
 *    removes it. a method brief that restates its worked example's factual
 *    content HAS made an independent claim, and owes the seven.
 */
const CLAIM_METHOD_BRIEF = /\bmethod brief\b/i;

/**
 * .what = the publishability tag word, in whichever emoji it carries
 * .why = a file holds several ☀️ lines (e.g. "☀️ both triage gates have run"),
 *        so the tag is keyed to the WORD, never to the emoji
 */
const TAG_PUBLISHABILITY = /\*\*(fullsun|obscure|protect)\*\*/;

/**
 * .what = extract the parts of a brief that the integrity checks compare
 * .why = one parse, one place to fix when the brief anatomy evolves
 */
export const asBriefAnatomy = (input: { content: string }): BriefAnatomy => {
  const lines = input.content.split('\n');

  // locate the section boundaries the checks need
  const lineOfSources = lines.findIndex((line) => HEADER_SOURCES.test(line));
  const lineOfSeeAlso = lines.findIndex((line) => HEADER_SEE_ALSO.test(line));
  const lineOfPublishability = lines.findIndex((line) =>
    HEADER_PUBLISHABILITY.test(line),
  );

  // the title is the first h1
  const title =
    lines
      .find((line) => line.startsWith('# '))
      ?.slice(2)
      .trim() ?? null;

  // the publishability tag is the first tag word AFTER its header
  const publishability =
    (lineOfPublishability === -1
      ? null
      : ((lines
          .slice(lineOfPublishability, lineOfPublishability + 12)
          .map((line) => TAG_PUBLISHABILITY.exec(line)?.[1])
          .find((word): word is string => !!word) as
          | BriefAnatomy['publishability']
          | undefined) ?? null)) ?? null;

  // see-also entries run from their header to the next header
  const lineOfSeeAlsoEnd =
    lineOfSeeAlso === -1
      ? -1
      : asLineOfNextHeader({ lines, from: lineOfSeeAlso });
  const seeAlsoTargets =
    lineOfSeeAlso === -1
      ? []
      : lines.slice(lineOfSeeAlso, lineOfSeeAlsoEnd).flatMap((line, offset) => {
          const target = ENTRY_SEE_ALSO_PATH.exec(line)?.[1];
          if (!target) return [];
          return [{ target, line: lineOfSeeAlso + offset + 1 }];
        });

  // sources run from their header to the end of the file
  const sources =
    lineOfSources === -1
      ? []
      : lines.slice(lineOfSources).flatMap((line, offset) => {
          const match = ENTRY_SOURCE.exec(line);
          if (!match) return [];
          return [
            {
              index: Number(match[1]),
              title: match[2] ?? '',
              line: lineOfSources + offset + 1,
            },
          ];
        });

  return {
    title,
    publishability,
    hasNotAdviceCallout: /not legal advice/i.test(input.content),
    hasDateResearched: lines.some((line) => HEADER_DATE_RESEARCHED.test(line)),
    hasCitationExemptionClaim:
      (CLAIM_ARTIFACT_ROLLUP.test(input.content) ||
        CLAIM_METHOD_BRIEF.test(input.content)) &&
      CLAIM_NO_INDEPENDENT.test(input.content),
    seeAlsoTargets,
    sources,
    bodyAboveSources:
      lineOfSources === -1
        ? input.content
        : lines.slice(0, lineOfSources).join('\n'),
    lines,
  };
};

/**
 * .what = find where a section ends — the next header, or the file's end
 */
const asLineOfNextHeader = (input: {
  lines: string[];
  from: number;
}): number => {
  const offset = input.lines
    .slice(input.from + 1)
    .findIndex((line) => /^#{1,6}\s/.test(line));
  return offset === -1 ? input.lines.length : input.from + 1 + offset;
};
