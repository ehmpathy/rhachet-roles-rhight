/**
 * .what = capture Yelp's Terms of Service
 *
 * .why  = closes half of G-platform-tos, the gap that decides the OTHER half of the
 *         quadrant-2 verdict in ref.clearance-inventory.
 *
 *         ⛔ the copyright answer and the contract answer share no elements. Feist settles
 *         that a fact may be taken from another's publication; a platform's terms may
 *         still forbid the ACCESS METHOD by which we took it. so a correct copyright
 *         answer proves the wrong point if the contract layer is never read.
 *
 *         what to look for in the capture:
 *           - any restriction on automated access, bulk collection, or crawlers
 *           - any restriction on display or republication of review content
 *           - whether the restriction reaches FACTS (counts, scores) or only CONTENT
 *
 *         ⭐ the last one is the whole question. a term that forbids reproduction of
 *         "Content" may leave a count untouched; a term that forbids automated ACCESS
 *         reaches the count too, because it binds on how we got it rather than on what
 *         it is.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL = 'https://terms.yelp.com/tos/en_us/20250314_en_us/';

const OUTPUT_PATH = '.temp/capture/tos.yelp.txt';

/** the marker the real terms must carry; navigation chrome cannot fake it */
const SECTION_MARKER = 'Terms of Service';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  await input.page
    .waitForSelector('body', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('main') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  if (!text.includes(SECTION_MARKER))
    HelpfulError.throw('capture lacks its marker', {
      marker: SECTION_MARKER,
      bytes: text.length,
      url: SOURCE_URL,
      hint: 'the dated terms URL may have rotated — open terms.yelp.com and read the current path, then update SOURCE_URL',
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
