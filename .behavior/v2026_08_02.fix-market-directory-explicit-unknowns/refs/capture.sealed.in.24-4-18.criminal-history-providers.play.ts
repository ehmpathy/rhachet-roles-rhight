/**
 * .what = capture Ind. Code ch. 24-4-18 — "Criminal History Providers"
 *
 * .why  = Indiana's analogue to Tex. Bus. & Com. Code ch. 109. it sits in the CONSUMER
 *         PROTECTION title (24), not the criminal title (35), which is the tell: Indiana
 *         regulates the PUBLISHER of criminal history as a commercial actor, separately
 *         from what its expungement statute (IC 35-38-9) does to the court file.
 *
 *         that separation is the whole point of the sweep. the expungement statute answers
 *         "what happened to the record"; this chapter answers "what must WE do about a copy
 *         we already hold" — which is the question a directory actually faces.
 *
 * .note  = iga.in.gov is a javascript app that returned navigation chrome only across four
 *          attempted URL shapes in the earlier ROP sweep (playbooks kept alongside this one).
 *          the Justia section-grain mirror is the sanctioned fallback under
 *          rule.require.five-state-baseline, and it is what worked for IC 32-36-1-*.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/';

const OUTPUT_PATH = '.temp/capture/sealed.in.24-4-18.txt';

/** the marker the real chapter index must carry; a 404 or search page cannot */
const SECTION_MARKER = '24-4-18';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // best-effort only — the marker assertion below is the gate.
  await input.page
    .waitForSelector('#codes-content', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('#codes-content') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  // fail loud rather than persist a shell read as if it were a citable capture.
  // assert the MARKER, not a byte floor: short statutes are legitimately short.
  if (!text.includes(SECTION_MARKER))
    HelpfulError.throw('capture lacks its chapter marker', {
      marker: SECTION_MARKER,
      bytes: text.length,
      url: SOURCE_URL,
      hint: 'the mirror may have redirected to a search or 404 page — confirm the chapter path, and note the mirror fallback in the brief .sources',
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
