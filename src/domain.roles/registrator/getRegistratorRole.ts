import { Role } from 'rhachet';

/**
 * .what = the registrator role definition
 * .why = defines briefs and skills for entity formation and maintenance
 */
export const ROLE_REGISTRATOR: Role = Role.build({
  slug: 'registrator',
  name: 'Registrator',
  purpose: 'form entities and maintain legal standing',
  readme: { uri: `${__dirname}/readme.md` },
  boot: { uri: `${__dirname}/boot.yml` },
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
            './node_modules/.bin/rhachet roles boot --repo rhight --role registrator',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
