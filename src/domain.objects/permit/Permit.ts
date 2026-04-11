import { DomainEntity } from 'domain-objects';

/**
 * .what = a permit record from a jurisdiction's permit database
 * .why = represents the canonical permit entity for search and fetch
 */
export interface Permit {
  /**
   * unique permit number from the jurisdiction
   */
  permitNumber: string;

  /**
   * type of permit (e.g., "Electrical/Residential")
   */
  type: string;

  /**
   * current status (e.g., "Issued", "Final", "Expired")
   */
  status: string;

  /**
   * date the permit was issued or filed
   */
  date: string;

  /**
   * address associated with the permit
   */
  address: string;

  /**
   * description of the work
   */
  description: string;

  /**
   * jurisdiction slug (e.g., "indianapolis-marion-in")
   */
  jurisdictionSlug: string;
}

export class Permit extends DomainEntity<Permit> implements Permit {
  public static unique = ['permitNumber'] as const;
}
