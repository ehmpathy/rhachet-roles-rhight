/**
 * .what = capture Ind. Code § 32-36-1-6 — the definition of "personality"
 *
 * .why  = the one OPEN cell in the five-state right-of-publicity sweep. every other
 *         state's statute was shown to reach only a natural person (TX "individual",
 *         FL "any natural person", CA's minor/guardian clause, NY "such person" while
 *         alive). Indiana gates on a "personality" instead, and its statute is the
 *         broadest of the five — so whether an ENTITY can be a "personality" decides
 *         whether the entity-grain collapse holds in all five states or only four.
 *
 * .note  = the iga.in.gov portal is a javascript app that returned navigation chrome
 *          only (see the adjacent capture.rop.in.retry*.play.ts attempts). the Justia
 *          section-grain mirror is the fallback that worked for §§ -1, -7, -8, and
 *          `rule.require.five-state-baseline` expressly sanctions a reliable mirror
 *          with the fallback noted.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL =
  'https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-6/';

const OUTPUT_PATH = '.temp/capture/rop.in.32-36-1-6.txt';

/**
 * the marker the real section must carry. ⚠️ this playbook is the MIRROR
 * fallback for a source whose official portal served only chrome — so the
 * assertion matters more here, not less: a mirror that silently 404s into a
 * search page is exactly the failure a citation cannot afford.
 */
const SECTION_MARKER = 'Sec. 6. As used in this chapter, "personality"';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // the codes body renders into #codes-content on justia; fall back to body.
  // best-effort only — the marker assertion below is the gate.
  await input.page
    .waitForSelector('#codes-content', { timeout: 30_000 })
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => {
    const node = document.querySelector('#codes-content') ?? document.body;
    return (node as HTMLElement).innerText;
  });

  // fail loud rather than persist a shell read as if it were a citable capture.
  // assert the MARKER, not a byte floor: short statutes are legitimately short —
  // this very chapter has sections of 704 and 378 bytes that a floor would reject.
  if (!text.includes(SECTION_MARKER))
    HelpfulError.throw('capture lacks its section marker', {
      marker: SECTION_MARKER,
      bytes: text.length,
      url: SOURCE_URL,
      hint: 'the mirror may have redirected to a search or 404 page — confirm the section path, and note the mirror fallback in the brief .sources',
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
