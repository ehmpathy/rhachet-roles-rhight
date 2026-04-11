/**
 * .what = search for permits by address via Accela API
 * .why = find permit history for a property
 *
 * .status = BLOCKED — requires Accela API access
 *
 * todo: use rhachet-roles-kermet to webscrape
 *
 * when unblocked, implement:
 * - POST https://apis.accela.com/v4/search/records
 * - headers: Authorization: Bearer {token}, x-accela-agency: INDY
 */

export const searchPermits = async (
  _input: {
    address: string;
    postal: string;
  },
  _context: {
    accelaToken: string;
  },
): Promise<{ permits: unknown[] }> => {
  throw new Error(
    'searchPermits is BLOCKED: requires Accela API access. see .behavior/v2026_04_09.permit-required/blocker.goal2.md',
  );
};
