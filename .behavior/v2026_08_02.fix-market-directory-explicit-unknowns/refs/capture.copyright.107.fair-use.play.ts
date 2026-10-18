/**
 * .what = capture 17 U.S.C. § 107 — limitations on exclusive rights: fair use
 *
 * .why  = the fallback for whatever sits on the promotional side and IS expression — a
 *         logo thumbnail, a quoted line of site copy, an excerpt of a review.
 *
 *         ⛔ the cluster already learned this lesson once, expensively. the Lanham
 *         analysis assumed a nominative-fair-use defense and the capture showed the
 *         statutory exclusion sits at § 1125(c)(3)(A), INSIDE the dilution subsection,
 *         so it does NOT reach the § 1125(a) claim that actually scales. a defense
 *         assumed from its reputation rather than read from its text was wrong about
 *         which claim it answered.
 *
 *         so § 107 is captured BEFORE it is relied on, to settle two questions from the
 *         text rather than from its reputation: whether the four factors are mandatory
 *         ("shall include") and whether the preamble's listed purposes bound the defense
 *         or merely illustrate it.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section107&num=0&edition=prelim';

const OUTPUT_PATH = '.temp/capture/copyright.17usc107.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '§107.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  await input.page
    .waitForSelector('#docViewerContent', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('#docViewerContent') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  if (!text.includes(SECTION_MARKER))
    HelpfulError.throw('capture lacks its section marker', {
      marker: SECTION_MARKER,
      bytes: text.length,
      url: SOURCE_URL,
      hint: 'likely the async shell, not the statute — re-run with --mode HEADFUL and confirm the page rendered',
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
