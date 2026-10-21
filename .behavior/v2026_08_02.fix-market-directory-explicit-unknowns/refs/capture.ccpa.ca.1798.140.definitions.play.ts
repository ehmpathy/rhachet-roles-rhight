/**
 * .what = capture Cal. Civ. Code § 1798.140 — the CCPA/CPRA definitions section
 *
 * .why  = the last open research row from the vision's F6 residual. two definitions decide
 *         whether the entity-grain answer holds against California's privacy regime:
 *
 *         1. "consumer" — if CCPA's consumer is a natural person who is a CA resident, then
 *            an entity-grain directory falls outside it the same way it falls outside FCRA
 *            (§ 1681a(c): "The term 'consumer' means an individual"). that would make the
 *            entity-grain collapse hold across BOTH regimes for the same structural reason.
 *
 *         2. "sell" — CCPA defines the word far more broadly than its plain sense, and the
 *            council's answer was "we never sell personal info". a promise made against the
 *            plain sense is not a promise made against the statutory one, so the exact text
 *            decides whether the council's answer is actually satisfiable.
 *
 *         the second is the sharper of the two: it can turn a commitment we believe we keep
 *         into one we do not.
 *
 * .note  = leginfo.legislature.ca.gov, same URL shape as § 3344 and § 1798.99.80.
 *          this section is very long; the selector narrows to the code body only.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140';

const OUTPUT_PATH = '.temp/capture/ccpa.ca.1798.140.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '1798.140.';

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
