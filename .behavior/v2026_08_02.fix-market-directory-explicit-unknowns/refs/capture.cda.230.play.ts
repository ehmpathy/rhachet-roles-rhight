/**
 * .what = capture verbatim text of 47 U.S.C. § 230 (CDA immunity) from the official
 *         U.S. House Office of Law Revision Counsel site
 *
 * .why  = a directory that publishes its OWN verification labels ("verified" /
 *         "claimed" / "unknown") authors that content. § 230(c)(1) shields a provider
 *         from treatment as the publisher of ANOTHER information content provider's
 *         content; § 230(f)(3) defines who counts as one. we need both verbatim to test
 *         the assumption that our own labels sit outside the shield.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.cda.230.play.ts
 *
 * output:
 *   .temp/capture/cda.230.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim';

const OUTPUT_PATH = '.temp/capture/cda.230.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '§230.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // best-effort wait only. a selector can appear before its content does, so the
  // selector is NOT the gate — the marker assertion below is. swallow here and
  // let the assertion speak, so the error names the real fault (no statute text)
  // rather than a selector timeout that may be a false alarm.
  await input.page
    .waitForSelector('#docViewerContent', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('#docViewerContent') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  // fail loud rather than persist a shell read as if it were a citable capture.
  // assert the MARKER, not a byte floor: short statutes are legitimately short,
  // so a length heuristic cannot tell a two-sentence statute from a shell.
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
