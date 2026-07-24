import { Role } from 'rhachet';

/**
 * .what = the accountant role definition
 * .why = advises on books and tax treatment of rewards instruments — debt vs revenue
 *   characterization, recognition, redemption-path treatment, float, and escheat
 */
export const ROLE_ACCOUNTANT: Role = Role.build({
  slug: 'accountant',
  name: 'Accountant',
  purpose:
    'advise on books and tax treatment of rewards instruments and their redemption paths',
  readme: { uri: `${__dirname}/readme.md` },
  boot: { uri: `${__dirname}/boot.yml` },
  keyrack: { uri: `${__dirname}/keyrack.yml` },
  traits: [],
  briefs: {
    dirs: { uri: `${__dirname}/briefs` },
  },
  skills: {
    dirs: { uri: `${__dirname}/skills` },
    refs: [],
  },
  inits: {
    dirs: { uri: `${__dirname}/inits` },
    exec: [],
  },
  hooks: {
    onBrain: {
      onBoot: [
        {
          command:
            './node_modules/.bin/rhachet roles boot --repo rhight --role accountant',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
