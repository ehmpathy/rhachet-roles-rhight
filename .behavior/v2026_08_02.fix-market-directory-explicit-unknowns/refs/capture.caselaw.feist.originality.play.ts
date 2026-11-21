/**
 * .what = capture Feist Publications v. Rural Telephone Service Co., 499 U.S. 340 (1991)
 *
 * .why  = closes G-facts-originality, the gap that decides half of the quadrant-2 verdict.
 *
 *         the clearance inventory says a review COUNT is outside copyright's subject
 *         matter. that rests on § 102(a)'s "original works of authorship" threshold —
 *         which supports the conclusion but never says "facts are not copyrightable" in
 *         so many words. Feist is where the Court says it, and it also settles the
 *         COMPILATION half: a compiler's selection and arrangement may be protected
 *         while the facts beneath are not.
 *
 *         ⛔ this is the row the cluster has cited twice from memory. per
 *         rule.require.bhrowser-citations, a memory-sourced case is [unverified] until a
 *         capture exists, whatever its fame.
 *
 * .note = case law has no uscode.house.gov analogue. Justia is a reliable mirror and the
 *         fallback is declared in the brief's .sources per the five-state rule.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL = 'https://supreme.justia.com/cases/federal/us/499/340/';

const OUTPUT_PATH = '.temp/capture/caselaw.feist.499us340.txt';

/** the marker the real opinion must carry; navigation chrome cannot fake it */
const SECTION_MARKER = 'Rural Telephone Service';

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

  if (!text.includes(SECTION_MARKER))
    HelpfulError.throw('capture lacks its marker', {
      marker: SECTION_MARKER,
      bytes: text.length,
      url: SOURCE_URL,
      hint: 'likely the async shell, not the opinion — re-run with --mode HEADFUL and confirm the page rendered',
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
