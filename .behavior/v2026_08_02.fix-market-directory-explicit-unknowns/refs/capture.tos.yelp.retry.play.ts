/**
 * .what = capture Yelp's Terms of Service — retry, after the dated URL rotated
 *
 * .why  = the first attempt targeted a dated path (…/20250314_en_us/) and got a 155-byte
 *         "Page not found". ⭐ the marker assertion caught it; a byte floor alone would
 *         have needed a threshold guess, and a naive capture would have persisted a 404
 *         as though it were the terms.
 *
 *         this retry navigates the UNDATED entry point and lets Yelp redirect to whatever
 *         the current dated path is, then records the resolved URL in the output header so
 *         a verifier can re-run against the same text.
 *
 * .note = kept as a separate file rather than an edit to the first, per
 *         rule.require.bhrowser-citations: every failed playbook stays on disk as the
 *         record of what was tried.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL = 'https://terms.yelp.com/tos/en_us/';

const OUTPUT_PATH = '.temp/capture/tos.yelp.txt';

/** a phrase the real terms body must carry; a 404 shell cannot fake it */
const SECTION_MARKER = 'Yelp';

/** the terms must be substantive, not a stub: a real ToS runs to many thousands of chars */
const MIN_BYTES = 5_000;

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

  const resolved = input.page.url();

  if (!text.includes(SECTION_MARKER) || text.length < MIN_BYTES)
    HelpfulError.throw('capture lacks its marker or is too thin to be the terms', {
      marker: SECTION_MARKER,
      bytes: text.length,
      minBytes: MIN_BYTES,
      requested: SOURCE_URL,
      resolved,
      hint: 'open the resolved url with --mode HEADFUL and read what actually rendered before you adjust the assertion',
    });

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(
    OUTPUT_PATH,
    `SOURCE: ${SOURCE_URL}\nRESOLVED: ${resolved}\n\n${text}`,
    'utf8',
  );

  return {
    url: resolved,
    title: await input.page.title(),
    bytes: text.length,
    output: OUTPUT_PATH,
  };
};
