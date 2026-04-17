import { Role } from 'rhachet';

/**
 * .what = the licenser role definition
 * .why = defines briefs and skills for professional license verification
 */
export const ROLE_LICENSER: Role = Role.build({
  slug: 'licenser',
  name: 'Licenser',
  purpose: 'verify professional licenses are legitimate and unexpired',
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
            './node_modules/.bin/rhachet roles boot --repo rhight --role licenser',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
