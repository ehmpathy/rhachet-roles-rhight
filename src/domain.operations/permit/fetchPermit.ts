/**
 * .what = fetch permit details by permit ID via Accela API
 * .why = get full permit record with status, contacts, inspections
 *
 * .status = BLOCKED — requires Accela API access
 *
 * when unblocked, implement:
 * - GET https://apis.accela.com/v4/records/{permitId}
 * - headers: Authorization: Bearer {token}, x-accela-agency: INDY
 */

export const fetchPermit = async (
  _input: {
    permitId: string;
  },
  _context: {
    accelaToken: string;
  },
): Promise<{ permit: unknown }> => {
  throw new Error(
    'fetchPermit is BLOCKED: requires Accela API access. see src/domain.roles/permiter/briefs/howto.indianapolis-permit-api-search.[ref].md',
  );
};
