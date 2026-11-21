/**
 * .what = capture 17 U.S.C. § 102 — subject matter of copyright
 *
 * .why  = the promotional-vs-sensitive axis turns on ONE question the cluster has never
 *         asked: is the thing we republish a FACT or someone's EXPRESSION?
 *
 *         every layer the cluster has analysed so far — FCRA, ROP, the DELETE Act, CCPA —
 *         gates on whether the SUBJECT is a natural person. copyright does not care about
 *         the subject at all; it gates on whether the MATERIAL is original expression.
 *         so an entity-grain answer, which exits four regimes at once, buys no exit here.
 *
 *         § 102(b) is the hook: protection does NOT extend to any "idea, procedure,
 *         process, system, method of operation, concept, principle, or discovery." that is
 *         the statutory root of the facts/expression line that decides whether a review
 *         COUNT ("412 reviews from 380 customers") is free and the review TEXT is not.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section102&num=0&edition=prelim';

const OUTPUT_PATH = '.temp/capture/copyright.17usc102.txt';

/** the marker the real statute must carry; navigation chrome cannot fake it */
const SECTION_MARKER = '§102.';

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
