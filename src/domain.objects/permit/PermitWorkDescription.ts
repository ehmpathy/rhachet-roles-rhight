import { DomainLiteral } from 'domain-objects';

/**
 * .what = a description of work to evaluate for permit requirements
 * .why = input to permit determination process
 */
export interface PermitWorkDescription {
  /**
   * type of work (e.g., "electrical", "plumbing", "hvac")
   */
  workType: string;

  /**
   * specific scope (e.g., "panel upgrade 100A to 200A")
   */
  scope: string;

  /**
   * property type (e.g., "residential", "commercial")
   */
  propertyType: 'residential' | 'commercial';

  /**
   * address where work will be performed
   */
  address: string | null;

  /**
   * postal code for jurisdiction lookup
   */
  postalCode: string;
}

export class PermitWorkDescription
  extends DomainLiteral<PermitWorkDescription>
  implements PermitWorkDescription {}
