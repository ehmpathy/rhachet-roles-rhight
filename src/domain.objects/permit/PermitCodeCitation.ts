import { DomainLiteral } from 'domain-objects';

/**
 * .what = a citation to a code section used in permit determination
 * .why = provides legal basis for permit requirement decisions
 */
export interface PermitCodeCitation {
  /**
   * code reference (e.g., "IRC R105.1")
   */
  codeRef: string;

  /**
   * verbatim quote from the code
   */
  quote: string;

  /**
   * relevance to the determination
   */
  relevance: 'requires-permit' | 'exempt' | 'conditional';

  /**
   * explanation of how this citation applies
   */
  explanation: string;
}

export class PermitCodeCitation
  extends DomainLiteral<PermitCodeCitation>
  implements PermitCodeCitation {}
