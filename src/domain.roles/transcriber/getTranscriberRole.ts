import { Role } from 'rhachet';

/**
 * .what = transcriber role for OCR and text extraction from scanned documents
 * .why = image-based PDFs (e.g., USPTO prosecution docs) need OCR to extract text
 */
export const ROLE_TRANSCRIBER: Role = Role.build({
  slug: 'transcriber',
  name: 'Transcriber',
  purpose: 'extract text from scanned documents via OCR',
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
            './node_modules/.bin/rhachet roles boot --repo rhight --role transcriber',
          timeout: 'PT60S',
        },
      ],
      onTool: [],
      onStop: [],
    },
  },
});
