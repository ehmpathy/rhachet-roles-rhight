/**
 * .what = capture verbatim right-of-publicity statutes for the five-state baseline
 *         (TX, IN, FL, CA, NY) from each state's own official site
 *
 * .why  = a directory page is built out of a real person's name — and, when it carries a
 *         status badge, out of an assertion about that person. right of publicity is the
 *         one claim § 230(e)(2) expressly declines to touch ("no effect on intellectual
 *         property law"), so it is the state-law axis most likely to reach our own labels.
 *         IN is reputed to be the broadest in the nation; that reputation must be read
 *         off the statute, not off a summary.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.rop.five-state.play.ts
 *
 * output:
 *   .temp/capture/rop.$state.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

/**
 * each source carries the `marker` its real statute text must contain.
 *
 * ⚠️ the markers are NOT guesses — each was read back out of the capture this
 * playbook produced. that is the point of a marker: it is a fact about the
 * page, so it can distinguish the statute from the shell that wraps it.
 */
const SOURCES = [
  {
    state: 'tx',
    cite: 'Tex. Prop. Code ch. 26',
    url: 'https://statutes.capitol.texas.gov/Docs/PR/htm/PR.26.htm',
    marker: 'Sec. 26.001.',
  },
  // ⛔ IN IS DELIBERATELY ABSENT FROM THIS SWEEP. it is captured at section grain by
  //    capture.rop.in.retry3.play.ts        (§§ 32-36-1-1, -7, -8)
  //    capture.rop.in.32-36-1-6.personality.play.ts  (§ 32-36-1-6, "personality")
  //
  // ⭐ a peer review caught why the row could not stay, and the reason is recorded
  // here because it is a lesson about markers rather than about Indiana:
  //
  // the row's marker was the bare section number `'32-36-1'` — and the 805-byte
  // iga.in.gov SHELL CONTAINS THAT STRING, because it is the URL fragment and the
  // app echoes it into the DOM. so the assertion would have PASSED on the shell
  // and written it to `.temp/capture/rop.in.txt` as a successful capture. a marker
  // that the failure mode also carries is not a marker; it is decoration.
  //
  // ⚠️ and the row collided on output: `rop.${state}.txt` for 'in' is the exact
  // path capture.rop.in.retry.play.ts writes, so whichever ran last won — this
  // sweep could silently clobber a good section-grain capture with a shell.
  //
  // both defects die with the row. the general lesson lives in
  // capture.rop.in.retry.play.ts, which now asserts the body-shaped `Sec. N.`
  // form that no shell can fake.
  {
    state: 'fl',
    cite: 'Fla. Stat. § 540.08',
    url: 'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html',
    marker: '540.08 Unauthorized publication',
  },
  {
    state: 'ca',
    cite: 'Cal. Civ. Code § 3344',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=3344',
    marker: '3344.',
  },
  {
    state: 'ny',
    cite: 'N.Y. Civ. Rights Law § 51',
    url: 'https://www.nysenate.gov/legislation/laws/CVR/51',
    marker: '§ 51. Action for injunction',
  },
];

export const action = async (input: { page: Page; browser: Browser }) => {
  const captured: { state: string; bytes: number; url: string }[] = [];

  for (const source of SOURCES) {
    // best-effort only — a nav timeout on a js portal is often a false alarm and
    // the page still renders. so goto is NOT the gate; the marker wait below is.
    //
    // ⭐ a swallowed nav timeout is safe HERE, in a loop, only because the wait
    // that follows is keyed on THIS source's marker. without it, a failed goto
    // would leave the PRIOR state's statute on screen and this iteration would
    // write it under this state's filename — a mislabeled citation, the one
    // defect a capture record must never produce.
    await input.page
      .goto(source.url, { waitUntil: 'networkidle', timeout: 90_000 })
      .catch(allowTimeoutOnly);

    // ⭐ wait for CONTENT, not for a clock. a fixed delay is a bet that the
    // portal renders inside N seconds; on a slow network it expires early and
    // the capture silently takes a shell. this waits for the source's own marker
    // and returns the instant it appears, so it is both safer and faster.
    //
    // best-effort only — a timeout here means the marker never arrived, which the
    // assertion below reports with the state, cite, byte count, and url. so the
    // wait is NOT the gate; it just gives the page its chance.
    await input.page
      .waitForFunction(
        (marker) => document.body.innerText.includes(marker),
        source.marker,
        { timeout: 45_000 },
      )
      .catch(allowTimeoutOnly);

    const text = await input.page.evaluate(
      () => (document.body as HTMLElement).innerText,
    );

    // fail loud rather than persist a shell read as if it were a citable capture.
    // assert the MARKER, not a byte floor: short statutes are legitimately short,
    // so a length heuristic cannot tell a two-sentence statute from a shell.
    if (!text.includes(source.marker))
      HelpfulError.throw('capture lacks its section marker', {
        marker: source.marker,
        state: source.state,
        cite: source.cite,
        bytes: text.length,
        url: source.url,
        hint: 'likely the async shell, not the statute — re-run with --mode HEADFUL and confirm the page rendered; if the portal never serves text to a driven navigation, fall back to a sanctioned mirror and note the fallback in the brief .sources',
      });

    const outputPath = `.temp/capture/rop.${source.state}.txt`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      `SOURCE: ${source.url}\nCITE: ${source.cite}\n\n${text}`,
      'utf8',
    );

    captured.push({
      state: source.state,
      bytes: text.length,
      url: input.page.url(),
    });
  }

  return { captured };
};
