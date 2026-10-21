/**
 * .what = capture Fla. Stat. § 943.0585 — court-ordered expunction of criminal history records
 *
 * .why  = Florida has no criminal-history-provider chapter analogous to Tex. Bus. & Com. ch. 109
 *         or Ind. Code ch. 24-4-18, so the FL cell of the sweep must be read off the expunction
 *         statute itself. § 943.0585 is the one that states WHO the order binds and what the
 *         subject may lawfully deny afterward — the two facts that decide whether a third-party
 *         republication is exposed.
 *
 *         the absence of a provider chapter is itself a result, not a gap in the capture: it
 *         means the FL analysis rests on the order's reach rather than on a duty imposed
 *         directly on a publisher.
 *
 * .note  = leg.state.fl.us serves the section through a query-string app; the same URL shape
 *          worked for the § 540.08 right-of-publicity capture.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0900-0999/0943/Sections/0943.0585.html';

const OUTPUT_PATH = '.temp/capture/sealed.fl.943.0585.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '943.0585 Court-ordered expunction';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // ⭐ this playbook had NO wait at all — it read the body straight off
  // `domcontentloaded`, which is the fixed-delay hazard in its worst form: a
  // delay of zero. it happened to work because leg.state.fl.us serves the
  // statute server-side, but that is a property of today's portal, not a
  // guarantee. wait for the marker so the capture does not depend on it.
  //
  // best-effort only — a timeout means the marker never arrived, which the
  // assertion below reports with the byte count and url.
  await input.page
    .waitForFunction(
      (marker) => document.body.innerText.includes(marker),
      SECTION_MARKER,
      { timeout: 45_000 },
    )
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => document.body.innerText);

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
