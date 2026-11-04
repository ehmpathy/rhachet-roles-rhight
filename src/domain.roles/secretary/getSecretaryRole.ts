import { Role } from 'rhachet';

/**
 * .what = the secretary role definition
 * .why = defines briefs and skills for the corporate record, document
 *        production, and the statutory deadline calendar
 */
export const ROLE_SECRETARY: Role = Role.build({
  slug: 'secretary',
  name: 'Secretary',
  purpose: 'keep the corporate record and file on time',
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
  hooks: {
    onBrain: {
      onBoot: [
        {
          command:
            './node_modules/.bin/rhachet roles boot --repo rhight --role secretary',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
