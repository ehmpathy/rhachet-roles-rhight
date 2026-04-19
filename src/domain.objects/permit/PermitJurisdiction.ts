import { DomainEntity } from 'domain-objects';

/**
 * .what = a jurisdiction that issues permits
 * .why = enables jurisdiction-specific code lookup and portal access
 */
export interface PermitJurisdiction {
  /**
   * unique slug (e.g., "indianapolis-marion-in")
   */
  slug: string;

  /**
   * display name (e.g., "Indianapolis, Marion County, IN")
   */
  name: string;

  /**
   * state code (e.g., "IN")
   */
  stateCode: string;

  /**
   * county name (e.g., "Marion")
   */
  county: string | null;

  /**
   * city name (e.g., "Indianapolis")
   */
  city: string | null;

  /**
   * portal type for scrape (e.g., "accela")
   */
  portalType: 'accela' | null;

  /**
   * base URL for permit portal
   */
  portalUrl: string | null;
}

export class PermitJurisdiction
  extends DomainEntity<PermitJurisdiction>
  implements PermitJurisdiction
{
  public static primary = ['slug'] as const;
  public static unique = ['slug'] as const;
}
