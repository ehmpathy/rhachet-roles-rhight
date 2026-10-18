/**
 * .what = capture Tex. Bus. & Com. Code ch. 109 — "Correction of Criminal Record Information"
 *
 * .why  = the sealed-record sweep needed a five-state baseline and only NY was captured.
 *         but the naive target (the EXPUNCTION statute) is the wrong one: an expunction
 *         order binds the state, not a third party who copied the record beforehand.
 *
 *         chapter 109 is the on-point statute — it regulates "business entities that
 *         publish criminal record information" DIRECTLY, and it is the single closest
 *         analogue in any state to what a contractor directory does. it is the statute
 *         that answers "may we still show it after the record was sealed?" rather than
 *         "what does a seal order do to the court file?"
 *
 * .note  = ⚠️ statutes.capitol.texas.gov is NOT static html, contrary to what the earlier
 *          ch. 26 right-of-publicity capture suggested. a bare domcontentloaded read returns
 *          only 84 bytes of shell — the literal placeholder "Retrieving statute document...".
 *          the real text arrives afterward via xhr.
 *
 *          so this playbook waits for CONTENT, not for the shell: it polls until the
 *          placeholder is gone AND a section marker ("Sec. 109.") is present. that is the
 *          rule.require.wait-for-content-not-shell discipline, and the 84-byte read is
 *          exactly the failure mode it exists to catch — a capture that "succeeds" and
 *          yields no citable text at all.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL = 'https://statutes.capitol.texas.gov/Docs/BC/htm/BC.109.htm';

const OUTPUT_PATH = '.temp/capture/sealed.tx.bc109.txt';

/** the marker the real statute must carry; chrome and the async shell cannot fake it */
const SECTION_MARKER = 'Sec. 109.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  // the xhr-delivered statute text replaces the placeholder; wait for the real text.
  // best-effort only — a wait can time out on a slow xhr that later arrives, so the
  // wait is NOT the gate. the marker assertion below is, and it re-reads the same
  // two conditions, so a swallowed timeout cannot let a shell through.
  await input.page
    .waitForFunction(
      () => {
        const body = document.body.innerText;
        return !body.includes('Retrieving statute') && body.includes('Sec. 109.');
      },
      { timeout: 45_000 },
    )
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(() => document.body.innerText);

  // fail loud rather than persist a shell read as if it were a citable capture.
  //
  // assert the MARKER, not a byte floor. a self-review showed a 1,000-byte floor
  // would have falsely rejected Ind. Code §§ 24-4-18-7 (704 bytes) and -8 (378) —
  // both valid, both bear weight. short statutes are legitimately short, so a
  // length heuristic cannot tell a two-sentence statute from a shell.
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
