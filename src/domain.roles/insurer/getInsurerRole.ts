import { Role } from 'rhachet';

/**
 * .what = the insurer role definition
 * .why = defines briefs and skills for insurance and license verification
 */
export const ROLE_INSURER: Role = Role.build({
  slug: 'insurer',
  name: 'Insurer',
  purpose: 'verify contractor insurance and license coverage',
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
            './node_modules/.bin/rhachet roles boot --repo rhight --role insurer',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
