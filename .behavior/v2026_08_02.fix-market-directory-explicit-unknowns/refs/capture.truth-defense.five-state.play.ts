/**
 * .what = capture the truth defense to defamation across the five-state baseline (TX, CA, FL,
 *         NY, IN), from each state's statute or constitution
 *
 * .why  = define.boundary.presence-fact-vs-absence-fact rests a step on "truth is a complete
 *         defense to defamation". that is state law, and it was uncited. this reads it off
 *         each state's own text rather than off a summary, so the step can be checked.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.truth-defense.five-state.play.ts
 *
 * output:
 *   .temp/capture/residual.$slug.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

/**
 * each source carries the `marker` its real statute text must contain. a marker that
 * fails to appear means the portal served a shell, and the capture refuses to write.
 */
const SOURCES = [
  {
    slug: 'truth.tx.73.005',
    cite: 'Tex. Civ. Prac. & Rem. Code § 73.005',
    url: 'https://statutes.capitol.texas.gov/Docs/CP/htm/CP.73.htm',
    marker: 'Sec. 73.005.',
  },
  {
    slug: 'truth.ca.civ.45',
    cite: 'Cal. Civ. Code § 45',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=45',
    marker: 'Libel is a false and unprivileged publication',
  },
  {
    slug: 'truth.fl.const.1.4',
    cite: 'Fla. Const. art. I, § 4',
    url: 'https://www.flsenate.gov/Laws/Constitution',
    marker: 'Freedom of speech and press',
  },
  {
    slug: 'truth.ny.const.1.8',
    cite: 'N.Y. Const. art. I, § 8',
    url: 'https://www.nysenate.gov/legislation/laws/CNS/A1S8',
    marker: 'Freedom of speech and press',
  },
  {
    slug: 'truth.in.const.1.10',
    cite: 'Ind. Const. art. 1, § 10',
    // the index's article-1/section-10/ link served "Page not found"; art1.html is the live article page
    url: 'https://law.justia.com/constitution/indiana/art1.html',
    marker: 'truth of the matters alleged',
  },
];

export const action = async (input: { page: Page; browser: Browser }) => {
  const captured: { slug: string; bytes: number; url: string }[] = [];
  const failed: { slug: string; bytes: number; url: string }[] = [];

  for (const source of SOURCES) {
    // goto is not the gate; the marker wait keyed on THIS source is
    await input.page
      .goto(source.url, { waitUntil: 'networkidle', timeout: 90_000 })
      .catch(allowTimeoutOnly);

    // wait for this source's own marker, not for a clock
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

    // a source without its marker is recorded as failed, never written as a capture
    if (!text.includes(source.marker)) {
      failed.push({ slug: source.slug, bytes: text.length, url: source.url });
      continue;
    }

    const outputPath = `.temp/capture/residual.${source.slug}.txt`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      `SOURCE: ${source.url}\nCITE: ${source.cite}\n\n${text}`,
      'utf8',
    );
    captured.push({ slug: source.slug, bytes: text.length, url: source.url });
  }

  // fail loud once every source has had its chance, so one bad portal does not hide the rest
  if (failed.length)
    HelpfulError.throw('captures lack their section markers', {
      failed,
      captured,
      hint: 're-run with --mode HEADFUL; if a portal never serves text to a driven navigation, fall back to a sanctioned mirror and note it in .sources',
    });

  return { captured };
};
