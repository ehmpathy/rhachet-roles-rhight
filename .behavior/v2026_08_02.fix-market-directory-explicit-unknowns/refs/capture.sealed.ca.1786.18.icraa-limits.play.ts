/**
 * .what = capture Cal. Civ. Code § 1786.18 — ICRAA's list of items an investigative
 *         consumer reporting agency may not report
 *
 * .why  = California's cell of the sealed-record sweep. CA has no criminal-history-provider
 *         chapter, but ICRAA does the same work from the other direction: rather than tell a
 *         publisher what to delete, it enumerates the record classes that may not be reported
 *         at all — reportedly arrests and convictions past a fixed age, and dispositions that
 *         did not end in conviction.
 *
 *         this matters beyond the sealed-record brief: ICRAA is a SECOND, state-level
 *         consumer-report gate stacked on top of the federal FCRA gate already briefed in
 *         hazard.consumer-report-gate. if its trigger is broader than FCRA's, the federal
 *         analysis alone understates the exposure — so the capture earns its keep twice.
 *
 * .note  = leginfo.legislature.ca.gov served § 3344 cleanly through the same URL shape.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1786.18';

const OUTPUT_PATH = '.temp/capture/sealed.ca.1786.18.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '1786.18.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // best-effort only — a selector can appear before its content does, so the
  // selector is NOT the gate. the marker assertion below is.
  await input.page
    .waitForSelector('#codeLawSectionNoHead', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node =
      document.querySelector('#codeLawSectionNoHead') ?? document.body;
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
