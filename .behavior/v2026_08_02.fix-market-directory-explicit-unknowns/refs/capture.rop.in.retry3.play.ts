/**
 * .what = third re-capture attempt for Indiana's right of publicity, at section grain
 *
 * .why  = iga.in.gov never serves a chapter body to a headless-driven navigation (probed
 *         three url shapes; all returned app shell). Justia is the sanctioned mirror
 *         fallback under rule.require.five-state-baseline, and its SECTION pages — unlike
 *         its chapter TOC — carry the statutory text. the fallback is recorded here
 *         rather than hidden, per that rule's "note the fallback" clause.
 *
 * .sections
 *   32-36-1-1  applicability + the carve-outs (this is where newsworthy/public-affairs sits)
 *   32-36-1-7  "right of publicity" defined — which attributes are property
 *   32-36-1-8  consent required for commercial use; the operative prohibition
 *
 *   ⚠️ an earlier form of this note swapped -7 and -8 and placed "personality"
 *      at -7. the captures say otherwise: -7 defines the right of publicity, -8
 *      states the consent rule, and "personality" is defined at 32-36-1-6 — the
 *      section captured separately by capture.rop.in.32-36-1-6.personality.play.ts.
 *      a wrong section-to-topic map in a capture record is how a brief comes to
 *      cite the wrong provision, so it is corrected here rather than silently.
 *
 * usage:
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.rop.in.retry3.play.ts
 *
 * output:
 *   .temp/capture/rop.in.$section.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SECTIONS = ['32-36-1-1', '32-36-1-7', '32-36-1-8'];

const asJustiaUrl = (section: string) =>
  `https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-${section}/`;

/**
 * the marker the real section body must carry. Indiana prints its statutory text
 * as "Sec. N.", where N is the section's last segment — so the marker is derived
 * from the section itself rather than hand-kept in a second list that could drift.
 *
 * ⭐ a bare section number would NOT do: the Justia chapter index carries
 * "32-36-1" twenty-one times while it bears no statutory text at all. an index of
 * a section is not the section, and only the body-shaped marker tells them apart.
 */
const asBodyMarker = (section: string) =>
  `Sec. ${section.split('-').at(-1)}.`;

export const action = async (input: { page: Page; browser: Browser }) => {
  const captured: { section: string; bytes: number; url: string }[] = [];

  for (const section of SECTIONS) {
    const url = asJustiaUrl(section);

    // ⭐ NO .catch here. this loop writes each read under the NEXT section's name,
    // so a swallowed navigation failure would persist the PRIOR section's text as
    // if it were this one — a mislabeled citation, the one defect a capture record
    // must never produce. let the navigation throw.
    await input.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    const marker = asBodyMarker(section);

    // ⭐ wait for CONTENT, not for a clock. the 2.5s fixed delay this replaces was
    // a bet that the mirror renders in time; on a slow network it expires early
    // and the capture silently takes a shell. this returns the instant the
    // section body appears, so it is both safer and faster.
    //
    // best-effort only — a timeout means the marker never arrived, which the
    // assertion below reports with the section, byte count, and url.
    await input.page
      .waitForFunction(
        (want) => document.body.innerText.includes(want),
        marker,
        { timeout: 45_000 },
      )
      .catch(allowTimeoutOnly);

    const text = await input.page.evaluate(
      () => (document.body as HTMLElement).innerText,
    );

    // fail loud rather than persist a shell read as if it were a citable capture.
    // assert the MARKER, not a byte floor: short statutes are legitimately short —
    // § 32-36-1-7 is two sentences, and any floor that rejected this route's
    // 4,385-byte chrome would have rejected it too.
    if (!text.includes(marker))
      HelpfulError.throw('capture lacks its section body marker', {
        marker,
        section,
        bytes: text.length,
        url,
        hint: 'the mirror may have redirected to a search or 404 page — confirm the section path, and note the mirror fallback in the brief .sources',
      });

    const outputPath = `.temp/capture/rop.in.${section}.txt`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `SOURCE: ${url}\n\n${text}`, 'utf8');

    captured.push({ section, bytes: text.length, url: input.page.url() });
  }

  return { captured };
};
