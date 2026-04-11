import { DomainEntity, DomainLiteral } from 'domain-objects';

import { PermitCodeCitation } from './PermitCodeCitation';
import { PermitWorkDescription } from './PermitWorkDescription';

/**
 * .what = a determination of whether a permit is required
 * .why = output of permit requirement analysis with citations
 */
export interface PermitDetermination {
  /**
   * the work being evaluated
   */
  work: PermitWorkDescription;

  /**
   * jurisdiction slug where work will occur
   */
  jurisdictionSlug: string;

  /**
   * determination result
   */
  result: 'required' | 'not-required' | 'conditional' | 'unclear';

  /**
   * confidence level of determination
   */
  confidence: 'high' | 'medium' | 'low';

  /**
   * human-readable summary
   */
  summary: string;

  /**
   * code citations that support the determination
   */
  citations: PermitCodeCitation[];

  /**
   * conditions that would change the determination (if conditional)
   */
  conditions: string[] | null;

  /**
   * recommended next steps
   */
  recommendations: string[];

  /**
   * disclaimer about not being legal advice
   */
  disclaimer: string;
}

export class PermitDetermination
  extends DomainEntity<PermitDetermination>
  implements PermitDetermination
{
  public static nested = {
    work: PermitWorkDescription,
    citations: [DomainLiteral, PermitCodeCitation],
  };
}
