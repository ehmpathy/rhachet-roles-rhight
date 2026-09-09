import { DomainLiteral } from 'domain-objects';

/**
 * .what = one mechanical defect detected in a brief
 * .why = the peer rubrics are globbed to '**\/*.{ts,sh}', so no automated
 *        check has ever read a shipped markdown brief. six defects reached
 *        late review rounds as a result. this is the unit those checks emit.
 */
export interface BriefIntegrityDefect {
  /**
   * the brief the defect was detected in, as a repo-relative path
   */
  path: string;

  /**
   * the check that detected it — a stable slug, safe to allowlist against
   */
  check: BriefIntegrityCheckSlug;

  /**
   * blocker = the claim is false or the artifact is broken
   * nitpick = a heuristic fired; a human decides
   */
  severity: 'blocker' | 'nitpick';

  /**
   * 1-indexed line the defect sits on, or null when the defect is the
   * ABSENCE of something and therefore has no line to point at
   */
  line: number | null;

  /**
   * what is wrong, and what would repair it
   */
  detail: string;
}

/**
 * .what = the closed set of checks this suite runs
 * .why = a stable slug per check lets a report group, and lets a future
 *        allowlist name one check without a free-text match
 */
export type BriefIntegrityCheckSlug =
  | 'see-also-target-absent'
  | 'sources-below-seven'
  | 'source-anchor-unreferenced'
  | 'not-advice-callout-absent'
  | 'date-researched-absent'
  | 'publishability-tag-absent'
  | 'non-fullsun-in-published-path'
  | 'internal-scaffold-leaked-in-fullsun'
  | 'fullsun-names-non-fullsun'
  | 'absence-claim-falsified-exact'
  | 'absence-claim-falsified-loose';

export class BriefIntegrityDefect
  extends DomainLiteral<BriefIntegrityDefect>
  implements BriefIntegrityDefect {}
