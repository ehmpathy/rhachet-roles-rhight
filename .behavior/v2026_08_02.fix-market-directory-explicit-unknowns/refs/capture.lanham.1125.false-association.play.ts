/**
 * .what = capture 15 U.S.C. § 1125 (Lanham Act § 43(a)) — false designation of origin
 *         and false association
 *
 * .why  = at entity grain the right-of-publicity layer collapses (an entity is not a
 *         "natural person" in any of the five swept states). but it does NOT simply
 *         vanish — it is REPLACED. entities hold trademark rights, so a badge rendered
 *         beside a company's mark risks an implied-affiliation or implied-endorsement
 *         claim under § 43(a). this is a NEW exposure the entity-grain answer created,
 *         and it is otherwise wholly un-analyzed.
 *
 *         it also survives § 230: 47 U.S.C. § 230(e)(2) expressly preserves
 *         intellectual-property law, so the shield does not reach it.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1125&num=0&edition=prelim';

const OUTPUT_PATH = '.temp/capture/lanham.1125.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '§1125.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // best-effort only — a selector can appear before its content does, so the
  // selector is NOT the gate. the marker assertion below is.
  await input.page
    .waitForSelector('#docViewerContent', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('#docViewerContent') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  // fail loud rather than persist a shell read as if it were a citable capture.
  // assert the MARKER, not a byte floor: short statutes are legitimately short.
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
