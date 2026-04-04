import { RoleRegistry } from 'rhachet';

import { ROLE_PATENTER } from './patenter/getPatenterRole';

/**
 * .what = returns the rhight registry of predefined roles
 * .why =
 *   - enables CLI or thread logic to load available roles
 *   - avoids dynamic mutation
 */
export const getRoleRegistry = (): RoleRegistry =>
  new RoleRegistry({
    slug: 'rhight',
    readme: { uri: `${__dirname}/readme.md` },
    roles: [ROLE_PATENTER],
  });
