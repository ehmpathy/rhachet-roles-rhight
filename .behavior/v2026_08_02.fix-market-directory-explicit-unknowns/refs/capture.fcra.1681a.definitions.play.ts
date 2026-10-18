/**
 * .what = capture verbatim text of 15 U.S.C. § 1681a (FCRA definitions) from the
 *         official U.S. House Office of Law Revision Counsel site
 *
 * .why  = the vision's load-bearing assumption is that a directory which publishes
 *         verification-status about people can fall inside the FCRA definitions of
 *         "consumer report" (§ 1681a(d)) and "consumer reporting agency" (§ 1681a(f)).
 *         a summarizer's paraphrase drops the carve-outs; we need the statute's own words.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.fcra.1681a.definitions.play.ts
 *
 * output:
 *   .temp/capture/fcra.1681a.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim';

const OUTPUT_PATH = '.temp/capture/fcra.1681a.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '§1681a.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // the OLRC viewer renders statute text into #docViewerContent; wait for it.
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
