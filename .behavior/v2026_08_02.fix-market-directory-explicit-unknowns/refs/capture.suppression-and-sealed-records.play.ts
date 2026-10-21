/**
 * .what = capture the two statutes that govern the wish's hardest two corners:
 *         - Cal. Civ. Code § 1798.99.80 et seq. (DELETE Act) — the "let me go private" axis
 *         - N.Y. Civ. Rights Law § 50-g — the sealed-conviction disclosure axis
 *
 * .why  = the wish assumes (a) a subject may ask to go private "at any time" and we
 *         choose how to honor it, and (b) a true, publicly-sourced adverse record may be
 *         shown. both assumptions have a statute pointed at them. CA converts the request
 *         from a courtesy into a duty routed through a state deletion mechanism; NY makes
 *         disclosure of a sealed conviction independently unlawful no matter how
 *         truthfully it was once obtained.
 *
 * usage:
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.suppression-and-sealed-records.play.ts
 *
 * output:
 *   .temp/capture/ca.delete-act.$section.txt, ny.civrights.50-g.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

/**
 * each source carries the MARKER its real text must contain — the section number
 * as the statute itself prints it. a byte floor cannot serve here: § 1798.99.80 is
 * a short definitions section, and a navigation shell from the same portal is
 * comparably long. only the marker separates the two.
 */
const SOURCES = [
  {
    slug: 'ca.delete-act.1798.99.80',
    cite: 'Cal. Civ. Code § 1798.99.80 (definitions)',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80',
    marker: '1798.99.80.',
  },
  {
    slug: 'ca.delete-act.1798.99.86',
    cite: 'Cal. Civ. Code § 1798.99.86 (accessible deletion mechanism)',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.86',
    marker: '1798.99.86.',
  },
  {
    slug: 'ny.civrights.50-g',
    cite: 'N.Y. Civ. Rights Law § 50-g',
    url: 'https://www.nysenate.gov/legislation/laws/CVR/50-G',
    marker: '§ 50-g. Disclosure of convictions sealed',
  },
];

export const action = async (input: { page: Page; browser: Browser }) => {
  const captured: { slug: string; bytes: number; url: string }[] = [];

  for (const source of SOURCES) {
    // ⭐ NO .catch here. this loop writes each read under the NEXT slug, so a
    // swallowed navigation failure would persist the PRIOR statute's text under
    // this source's filename — a mislabeled citation, the one defect a capture
    // must never produce. let the navigation throw.
    await input.page.goto(source.url, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    // ⭐ wait for CONTENT, not for a clock. the 3s fixed delay this replaces was a
    // bet that leginfo and nysenate render inside that window; on a slow network
    // it expires early and the capture silently takes a shell. this returns the
    // instant the section appears, so it is both safer and faster.
    //
    // best-effort only — a timeout means the marker never arrived, which the
    // assertion below reports with the slug, byte count, and url.
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
    // assert the MARKER, not a byte floor: short statutes are legitimately short.
    if (!text.includes(source.marker))
      HelpfulError.throw('capture lacks its section marker', {
        marker: source.marker,
        slug: source.slug,
        bytes: text.length,
        url: source.url,
        hint: 'likely the async shell, not the statute — re-run with --mode HEADFUL and confirm the page rendered',
      });

    const outputPath = `.temp/capture/${source.slug}.txt`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      `SOURCE: ${source.url}\nCITE: ${source.cite}\n\n${text}`,
      'utf8',
    );

    captured.push({
      slug: source.slug,
      bytes: text.length,
      url: input.page.url(),
    });
  }

  return { captured };
};
