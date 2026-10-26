import { Role } from 'rhachet';

/**
 * .what = the notary role definition
 * .why = defines briefs for notarial acts, identity verification, and
 *        interstate acceptance of notarized documents
 */
export const ROLE_NOTARY: Role = Role.build({
  slug: 'notary',
  name: 'Notary',
  purpose: 'get documents notarized so the agency accepts them',
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
            './node_modules/.bin/rhachet roles boot --repo rhight --role notary',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
