import { DomainEntity } from 'domain-objects';

/**
 * .what = a section of code that defines permit requirements
 * .why = enables citation of specific code sections for permit determinations
 */
export interface PermitCodeSection {
  /**
   * code reference (e.g., "IRC R105.1")
   */
  codeRef: string;

  /**
   * jurisdiction slug this code applies to
   */
  jurisdictionSlug: string;

  /**
   * title of the code section
   */
  title: string;

  /**
   * verbatim text of the code section
   */
  text: string;

  /**
   * year or version of the code
   */
  codeVersion: string;

  /**
   * source URL where code was retrieved
   */
  sourceUrl: string | null;
}

export class PermitCodeSection
  extends DomainEntity<PermitCodeSection>
  implements PermitCodeSection
{
  public static unique = ['codeRef'] as const;
}
