import { RoleRegistry } from 'rhachet';

import { ROLE_INSURER } from './insurer/getInsurerRole';
import { ROLE_LICENSER } from './licenser/getLicenserRole';
import { ROLE_PATENTER } from './patenter/getPatenterRole';
import { ROLE_PERMITER } from './permiter/getPermiterRole';
import { ROLE_TRANSCRIBER } from './transcriber/getTranscriberRole';

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
    roles: [ROLE_INSURER, ROLE_LICENSER, ROLE_PATENTER, ROLE_PERMITER, ROLE_TRANSCRIBER],
  });
