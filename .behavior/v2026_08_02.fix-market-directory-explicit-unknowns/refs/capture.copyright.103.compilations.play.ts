/**
 * .what = capture 17 U.S.C. § 103 — compilations and derivative works
 *
 * .why  = § 103(b) answers the AGGREGATION half of the copyright question, which § 102
 *         does not reach. a directory IS a compilation, so § 103 governs what we build
 *         rather than the pieces we gather.
 *
 *         it cuts BOTH ways, and that symmetry is what makes it worth a capture:
 *           - it bounds what a SOURCE platform can claim over its own review corpus, so a
 *             count derived from that corpus is not theirs by compilation copyright alone
 *           - it bounds what WE could claim over our own directory, which matters the
 *             moment anyone proposes a moat argument built on copyright
 *
 *         paired with § 102(b), it is the statutory root of the line the cluster needs:
 *         a review COUNT is a fact about a corpus; the review TEXT is expression.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section103&num=0&edition=prelim';

const OUTPUT_PATH = '.temp/capture/copyright.17usc103.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '§103.';

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
