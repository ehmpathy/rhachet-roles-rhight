/**
 * .what = capture hiQ Labs, Inc. v. LinkedIn Corp., 31 F.4th 1180 (9th Cir. 2022)
 *
 * .why  = the case most often cited for "public data is free to collect", and the
 *         clearance inventory's contract verdict has to be reconciled with it or it is
 *         wrong.
 *
 *         ⛔ the reconciliation depends on WHICH statute the decision reached, and that is
 *         precisely the detail a summary drops. the popular read is "automated collection
 *         of public data is lawful". the actual question presented was whether it violates
 *         the COMPUTER FRAUD AND ABUSE ACT — an anti-circumvention statute — and a CFAA
 *         decision says naught about breach of contract, which is a separate claim with
 *         separate elements.
 *
 *         what to look for in the capture:
 *           - the precise scope of the decision: which statute, which term construed
 *           - whether the opinion reserves or addresses the contract claim
 *           - any language on "authorization" and access barriers
 *
 *         ⭐ this matters twice over. it decides whether the Yelp term is enforceable
 *         against a non-user at all — a collector who never created an account never
 *         assented, and contract needs assent.
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
  'https://law.justia.com/cases/federal/appellate-courts/ca9/17-16783/17-16783-2022-04-18.html';

const OUTPUT_PATH = '.temp/capture/caselaw.hiq.linkedin.txt';

/** a phrase the real opinion must carry; navigation chrome cannot fake it */
const SECTION_MARKER = 'hiQ';

/** an opinion runs to many thousands of chars; a stub is a failed capture */
const MIN_BYTES = 10_000;

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

  if (!text.includes(SECTION_MARKER) || text.length < MIN_BYTES)
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
