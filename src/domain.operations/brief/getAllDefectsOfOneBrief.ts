import type { BriefIntegrityDefect } from '../../domain.objects/brief/BriefIntegrityDefect';
import { asBriefAnatomy } from './asBriefAnatomy';
import { getAllFalsifiedAbsenceClaims } from './getAllFalsifiedAbsenceClaims';

/**
 * .what = the citation floor a research brief must clear
 * .why = `rule.require.seven-distinct-citations`
 */
const FLOOR_OF_SOURCES = 7;

/**
 * .what = check one brief against the mechanical invariants
 * .why = pure, so it is unit-testable against fixtures. the caller settles
 *        `see-also` targets, because only the caller can touch a filesystem.
 *
 * .note = the caller supplies `seeAlsoTargetsAbsent`; this operation cannot
 *         open a file and will not pretend to. an unchecked target is
 *         reported by the caller, never silently passed.
 */
export const getAllDefectsOfOneBrief = (input: {
  path: string;
  content: string;
  seeAlsoTargetsAbsent: { target: string; line: number }[];

  /**
   * whether this brief sits on a path that ships to consumers
   *
   * ⚠️ the CALLER decides this, never this operation — a relative path
   * cannot tell you whether its root is packaged. the disk layer knows the
   * absolute path and the package's `files`; this operation does not.
   */
  isPublishedPath: boolean;
}): BriefIntegrityDefect[] => {
  const anatomy = asBriefAnatomy({ content: input.content });

  const defects: BriefIntegrityDefect[] = [];

  // a see-also entry that does not open is a dead end for every reader
  for (const absent of input.seeAlsoTargetsAbsent)
    defects.push({
      path: input.path,
      check: 'see-also-target-absent',
      severity: 'blocker',
      line: absent.line,
      detail: `\`.see also\` names \`${absent.target}\`, which does not open from this file's directory. check the ../ depth.`,
    });

  // the citation floor
  //
  // ⭐ the rule that sets this floor also states its own exception, for
  //    *"pure navigation/rollup artifacts that make no independent factual
  //    claim"* — which inherit their citations from the docs they point to.
  //    the check honours that exception rather than outlive it: a checker
  //    that enforces more than its rule says makes the rule unfindable, and
  //    trains readers to route around the checker instead of to read the rule.
  //
  // ⚠️ only the CITATION floor is waived. the not-advice callout, the date,
  //    and the publishability tag come from other rules and still apply — an
  //    index that summarises legal conclusions still carries the disclaimer.
  if (
    anatomy.sources.length < FLOOR_OF_SOURCES &&
    !anatomy.hasCitationExemptionClaim
  )
    defects.push({
      path: input.path,
      check: 'sources-below-seven',
      severity: 'blocker',
      line: null,
      detail: `${anatomy.sources.length} numbered sources found; ${FLOOR_OF_SOURCES} is the floor. (if this is a pure navigation/rollup artifact, claim the rule's exception in the body — it must state BOTH that it is a navigation/rollup artifact AND that it makes no independent factual claim.)`,
    });

  // a source no sentence uses is a pad
  for (const source of anatomy.sources) {
    const anchor = asSourceAnchor({ title: source.title });
    if (!anchor) continue;
    if (anatomy.bodyAboveSources.includes(anchor)) continue;
    defects.push({
      path: input.path,
      check: 'source-anchor-unreferenced',
      severity: 'nitpick',
      line: source.line,
      detail: `source ${source.index}'s anchor \`${anchor}\` appears in no sentence above \`.sources\`. a cite that supports no sentence is a pad — use it or drop it.`,
    });
  }

  // the three required blocks
  if (!anatomy.hasNotAdviceCallout)
    defects.push({
      path: input.path,
      check: 'not-advice-callout-absent',
      severity: 'blocker',
      line: null,
      detail: 'no `not legal advice` callout found.',
    });

  if (!anatomy.hasDateResearched)
    defects.push({
      path: input.path,
      check: 'date-researched-absent',
      severity: 'blocker',
      line: null,
      detail: 'no `## .date researched` section found.',
    });

  if (!anatomy.publishability)
    defects.push({
      path: input.path,
      check: 'publishability-tag-absent',
      severity: 'blocker',
      line: null,
      detail:
        'no `## .publishability` section with a **fullsun** / **obscure** / **protect** tag found.',
    });

  // ⭐ a withheld brief on a path that ships is not withheld
  //
  // .why = the tag is a note in a file body. the build is an rsync that
  //        globs '**\/briefs/**\/*.md' and reads no tag, `files` carries
  //        `dist`, and the package is public — so a 🕶️ brief left under a
  //        published root SHIPS, and its tag records an intent the
  //        toolchain never enforced. this is the same defect class as a
  //        review rubric that cannot reach its subject: a control that
  //        does not reach what it governs passes forever.
  //
  // .note = the repair is to MOVE it, never to retag it. a non-fullsun
  //         brief belongs outside the packaged tree.
  if (
    input.isPublishedPath &&
    anatomy.publishability &&
    anatomy.publishability !== 'fullsun'
  )
    defects.push({
      path: input.path,
      check: 'non-fullsun-in-published-path',
      severity: 'blocker',
      line: null,
      detail: `tagged **${anatomy.publishability}** but sits on a published path, so it ships to consumers. move it out of the packaged tree — do not retag it.`,
    });

  // ⭐ internal engagement scaffold must not ship inside a public brief
  //
  // .why = a ☀️ fullsun brief on a published path is rsynced verbatim into
  //        `dist/` and published to npm. a `.behavior/` or `.route/`
  //        engagement path is dead to a consumer — no such path exists in the
  //        package — and it doxxes the internal route structure. same control
  //        class as the tag check above: the leak ships because the build
  //        reads no brief body.
  //
  // .note = scoped to `.behavior/` and `.route/` PATH tokens ONLY. it does
  //         NOT grep `rule.require.*` / `rule.forbid.*`: a method brief names
  //         the author-rule it teaches, and a `.see also` points at a shipped
  //         peer rule brief — a token grep fires on both and trains a reader
  //         to route around the checker (the failure the citation-floor note
  //         above warns of). a route path has no such legitimate use, so it
  //         carries no false positive.
  if (input.isPublishedPath && anatomy.publishability === 'fullsun') {
    const SCAFFOLD_PATH = /\.(?:behavior|route)\//;
    anatomy.lines.forEach((line, offset) => {
      const hit = SCAFFOLD_PATH.exec(line);
      if (!hit) return;
      defects.push({
        path: input.path,
        check: 'internal-scaffold-leaked-in-fullsun',
        severity: 'blocker',
        line: offset + 1,
        detail: `a fullsun published brief names the internal engagement path \`${hit[0]}\`, which ships to npm where no such path exists. strip the internal-route reference; keep any public source citation.`,
      });
    });
  }

  // the attestation a file's own body falsifies
  defects.push(...getAllFalsifiedAbsenceClaims({ path: input.path, anatomy }));

  return defects;
};

/**
 * .what = the shortest distinctive token by which a body would cite a source
 * .why = a source title opens with its citation — a case name or a section
 *        number — and that token is what a body sentence repeats. a looser
 *        rule produces false hits, so an unrecognized title yields null and
 *        the check declines to grade it rather than guess.
 */
export const asSourceAnchor = (input: { title: string }): string | null => {
  // a statute or regulation cites by its section token
  const section = /§+\s?[\d]+[\d.\-–]*/.exec(input.title)?.[0];
  if (section) return section.replace(/§+\s?/, '§ ');

  // a decision cites by the party names either side of ` v. `
  const parties = /([A-Z][\w&.'-]*(?:\s+[\w&.'-]+){0,3})\s+v\.\s/.exec(
    input.title,
  )?.[1];
  if (parties) return `${parties} v.`;

  // a code chapter cites by its chapter number
  const chapter = /\bch(?:apter)?\.?\s+(\d+)\b/i.exec(input.title)?.[0];
  if (chapter) return chapter;

  // unrecognized shape — decline to grade rather than emit a false anchor
  return null;
};
