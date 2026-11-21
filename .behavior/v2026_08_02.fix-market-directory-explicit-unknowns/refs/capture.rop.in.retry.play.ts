/**
 * .what = re-capture Ind. Code art. 32-36-1 (Indiana right of publicity) after the
 *         first pass returned 805 bytes of app shell ("loading")
 *
 * .why  = iga.in.gov is a javascript app; networkidle + 4s was not enough for the
 *         chapter body to hydrate. a short capture is a block page, not a source —
 *         quoting it would have fabricated a citation. this pass polls until the
 *         statute text is actually present.
 *
 * usage:
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.rop.in.retry.play.ts
 *
 * output:
 *   .temp/capture/rop.in.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SOURCE_URL = 'https://iga.in.gov/laws/2025/ic/titles/32#32-36-1';
const OUTPUT_PATH = '.temp/capture/rop.in.txt';

/**
 * ⭐ the marker the real chapter body must carry — and note its SHAPE.
 *
 * a bare section number will not do. this route's own data proves it: the shell
 * this playbook captured contains the string "32-36-1" once, and the Justia
 * CHAPTER INDEX contains it twenty-one times — while it bears no statutory text
 * at all. an index of a section is not the section.
 *
 * Indiana prints its statutory text as "Sec. N.", so the body marker is the
 * section title as the code itself sets it. chrome and indexes do not carry it.
 */
const BODY_MARKER = 'Sec. 8.';

export const action = async (input: { page: Page; browser: Browser }) => {
  await input.page.goto(SOURCE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });

  // ⭐ wait for the CONTENT, not on a clock. this replaces a 20×3s poll loop, and
  // the swap is a strict improvement in three ways: it returns the instant the
  // body arrives rather than at the next tick, it tolerates a page slower than any
  // fixed budget, and it deletes the mutable accumulator the loop needed.
  //
  // ⭐ the condition is the MARKER, not a byte count — and THIS playbook is the
  // proof of why. it once used MIN_BYTES = 6_000, which was wrong in both
  // directions at once: the shell it captured is 4,383 bytes (so the floor never
  // tripped and the loop simply exhausted), while Ind. Code §§ 24-4-18-7 and -8
  // are 704 and 378 bytes of legitimate statute (so any floor that rejected this
  // shell would also have rejected those). length cannot tell a short statute
  // from a long shell. the marker can.
  //
  // best-effort only — a timeout means the marker never arrived, which the
  // assertion below reports with the marker, byte count, and url. so the wait is
  // NOT the gate; it only gives the page its chance.
  await input.page
    .waitForFunction(
      (marker) => document.body.innerText.includes(marker),
      BODY_MARKER,
      { timeout: 60_000 },
    )
    .catch(allowTimeoutOnly);

  const text = await input.page.evaluate(
    () => (document.body as HTMLElement).innerText,
  );

  // fail loud rather than persist a shell read as if it were a citable capture.
  //
  // ⭐ the ORIGINAL defect here was worse than the byte floor: this playbook wrote
  // the shell to a citation-shaped path regardless, and reported the failure only
  // as a `hydrated: false` field a reader could miss. the diagnostic is preserved
  // in the error metadata; what is removed is the chance of a shell on disk under
  // a name that reads like a source.
  if (!text.includes(BODY_MARKER))
    HelpfulError.throw('capture lacks its chapter body marker', {
      marker: BODY_MARKER,
      bytes: text.length,
      url: SOURCE_URL,
      hint: 'iga.in.gov never served a chapter body to a driven navigation; use the Justia section-grain mirror, per capture.rop.in.retry3.play.ts',
    });

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `SOURCE: ${SOURCE_URL}\n\n${text}`, 'utf8');

  return {
    url: input.page.url(),
    bytes: text.length,
    output: OUTPUT_PATH,
  };
};
