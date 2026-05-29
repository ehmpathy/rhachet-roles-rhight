import { Role } from 'rhachet';

/**
 * .what = the counselor role definition
 * .why = advises on protection mechanisms when homeowners hire contractors
 */
export const ROLE_COUNSELOR: Role = Role.build({
  slug: 'counselor',
  name: 'Counselor',
  purpose: 'advise on contractor protection structure, liability, and recourse',
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
            './node_modules/.bin/rhachet roles boot --repo rhight --role counselor',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
