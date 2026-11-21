/**
 * .what = capture Nguyen v. Barnes & Noble Inc., 763 F.3d 1171 (9th Cir. 2014)
 *
 * .why  = closes G-browsewrap-assent, the question that decides whether a platform's
 *         terms reach us AT ALL.
 *
 *         ⛔ the metadata rule asserts that Yelp's terms forbid automated collection of
 *         "Yelp data". that is true of the term. whether the term BINDS a party who never
 *         created an account and never clicked agree is a separate question the rule
 *         never asked — and a contract binds only a party.
 *
 *         Nguyen is the principal 9th Circuit statement on browsewrap: terms posted
 *         behind a link, with no affirmative act of assent. what to look for:
 *           - whether a browsewrap term binds absent actual or constructive notice
 *           - what makes notice "conspicuous" enough to impute assent
 *           - whether proximity of the link to a button is sufficient on its own
 *
 *         ⭐ the answer bounds the entire contract layer of ref.clearance-inventory. if a
 *         browsewrap term does not bind a non-user, the Yelp prohibition constrains our
 *         ACCOUNT-HOLDER conduct and not a public read.
 *
 * .note = case law has no uscode.house.gov analogue. Justia is a reliable mirror and the
 *         fallback is declared in the brief's .sources per rule.require.bhrowser-citations.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://law.justia.com/cases/federal/appellate-courts/ca9/12-56628/12-56628-2014-08-18.html';

const OUTPUT_PATH = '.temp/capture/caselaw.nguyen.browsewrap.txt';

/** a phrase the real opinion must carry; navigation chrome cannot fake it */
const SECTION_MARKER = 'browsewrap';

/** an opinion runs to many thousands of chars; a stub is a failed capture */
const MIN_BYTES = 5_000;

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  await input.page
    .waitForSelector('main', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('main') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  if (!text.toLowerCase().includes(SECTION_MARKER) || text.length < MIN_BYTES)
    HelpfulError.throw('capture lacks its marker or is too thin to be the opinion', {
      marker: SECTION_MARKER,
      bytes: text.length,
      minBytes: MIN_BYTES,
      url: SOURCE_URL,
      hint: 'open the url with --mode HEADFUL and read what rendered before you adjust the assertion',
    });

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `SOURCE: ${SOURCE_URL}\n\n${text}`, 'utf8');

  return {
    url: input.page.url(),
    title: await input.page.title(),
    bytes: text.length,
    output: OUTPUT_PATH,
  };
};
