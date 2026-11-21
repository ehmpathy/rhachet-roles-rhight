/**
 * .what = second re-capture attempt for Ind. Code art. 32-36-1, across candidate URL
 *         shapes on iga.in.gov
 *
 * .why  = the hash-fragment form (#32-36-1) only scrolls the title index; it never loads
 *         a chapter body. this pass probes the path-segment forms the app actually
 *         routes on, and reports the byte count of each so the real one is provable
 *         rather than assumed.
 *
 * usage:
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.rop.in.retry2.play.ts
 *
 * output:
 *   .temp/capture/rop.in.candidate.$index.txt (one per probed url)
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

/**
 * ⚠️ this file is a PROBE, not a capture — read the distinction before you copy it.
 *
 * a CAPTURE fetches one known source and must refuse to persist a read that is
 * not that source; it therefore asserts a marker and throws (see every other
 * playbook alongside this one).
 *
 * a PROBE fetches several SPECULATIVE url shapes to learn which one the app
 * routes on. its product is the comparison, so it must survive a candidate that
 * fails and carry on to the next. it deliberately does NOT throw, and it writes
 * to `rop.in.candidate.$index.txt` — a name no brief may cite.
 *
 * ⛔ the byte counts below are the MEASUREMENT, never a gate. an earlier form of
 * this file waited on `text.length > 8_000`, which is the byte-floor
 * anti-pattern: candidate 1 returned 4,385 bytes of pure navigation chrome, and
 * Ind. Code § 24-4-18-8 is 378 bytes of real statute. no threshold separates
 * those two. the wait keys on the marker instead.
 */
const CANDIDATE_URLS = [
  'https://iga.in.gov/laws/2025/ic/titles/32/articles/36/chapters/1',
  'https://iga.in.gov/laws/2025/ic/titles/32#32-36-1-8',
  'https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/',
];

/** Indiana prints statutory text as "Sec. N." — chrome and chapter indexes do not */
const BODY_MARKER = 'Sec. 8.';

export const action = async (input: { page: Page; browser: Browser }) => {
  const probed: {
    url: string;
    bytes: number;
    reached: boolean;
    fault: string | null;
    marked: boolean;
    head: string;
  }[] = [];

  for (const [index, url] of CANDIDATE_URLS.entries()) {
    // a failed navigation is a RESULT for a probe, not an error — but the error
    // itself must be KEPT, not merely counted. if it were swallowed silently we
    // would go on to read the PRIOR candidate's page and write it under this
    // candidate's name, which is the one defect a capture record must never make.
    //
    // ⭐ why this is not a failhide: `rule.forbid.failhide` bars the DISCARD of an
    // error, not the decision to carry on. a bare `.catch(() => false)` discards —
    // and then a persistent network fault reads identically to a url that simply
    // does not route, which is precisely the comparison this probe exists to draw.
    // so the error is captured into `fault`, returned to the caller, and written
    // into the candidate's own output file. the probe survives; the cause survives
    // with it.
    const arrival = await input.page
      .goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 })
      .then(() => ({ reached: true, fault: null as string | null }))
      .catch((error: unknown) => ({
        reached: false,
        fault:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error),
      }));

    if (!arrival.reached) {
      // ⛔ the failure is persisted too, not merely returned. a probe whose record
      // lives only in a return value cannot be audited after the session ends.
      const faultPath = `.temp/capture/rop.in.candidate.${index}.txt`;
      mkdirSync(dirname(faultPath), { recursive: true });
      writeFileSync(
        faultPath,
        [
          `SOURCE: ${url}`,
          `PROBE: candidate ${index} — NOT a citable capture`,
          `RESULT: navigation FAILED — no text was read`,
          `FAULT: ${arrival.fault}`,
        ].join('\n'),
        'utf8',
      );

      probed.push({
        url,
        bytes: 0,
        reached: false,
        fault: arrival.fault,
        marked: false,
        head: '',
      });
      continue;
    }

    // ⭐ wait for the CONTENT, not on a clock — the same discipline every capture
    // alongside this file uses. it returns the instant the body arrives, tolerates
    // a page slower than any fixed budget, and deletes the mutable accumulator the
    // poll loop needed.
    //
    // ⚠️ and a timeout here is EXPECTED for a probe, not exceptional: most
    // candidates are speculative shapes that will never serve a body. so the wait
    // is best-effort, and `marked` below records the outcome either way. that is
    // the probe's product.
    await input.page
      .waitForFunction(
        (marker) => document.body.innerText.includes(marker),
        BODY_MARKER,
        { timeout: 20_000 },
      )
      .catch(allowTimeoutOnly);

    const text = await input.page.evaluate(
      () => (document.body as HTMLElement).innerText,
    );

    const marked = text.includes(BODY_MARKER);

    // the file name says candidate, and the banner says probe, so a later reader
    // cannot mistake an unmarked read for a source.
    const outputPath = `.temp/capture/rop.in.candidate.${index}.txt`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      [
        `SOURCE: ${url}`,
        `PROBE: candidate ${index} — NOT a citable capture`,
        `MARKER "${BODY_MARKER}": ${marked ? 'present' : 'ABSENT — this is not statutory text'}`,
        '',
        text,
      ].join('\n'),
      'utf8',
    );

    probed.push({
      url,
      bytes: text.length,
      reached: true,
      fault: null,
      marked,
      head: text.slice(0, 120).replace(/\s+/g, ' '),
    });
  }

  return { probed };
};
