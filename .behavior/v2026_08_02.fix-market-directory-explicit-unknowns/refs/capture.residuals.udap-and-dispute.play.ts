/**
 * .what = capture the residual statutes the thin directory briefs name but had not read:
 *         FTC Act § 5, FCRA §§ 1681i and 1681m, CCPA §§ 1798.106 and 1798.125, ICRAA
 *         § 1786.24, NY GBL § 380-f, and the five-state UDAP prohibitions (TX, IN, FL, CA, NY)
 *
 * .why  = the briefs cite "§ 5 / state UDAP", "§ 1681m", "§ 1798.125", and a dispute duty
 *         sourced from one state only. each of those was a cite without a capture. this
 *         playbook reads them off each official site so the cite rests on text, not memory.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.residuals.udap-and-dispute.play.ts
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
    slug: 'ftc.45',
    cite: '15 U.S.C. § 45',
    url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section45&num=0&edition=prelim',
    marker: '§45.',
  },
  {
    slug: 'fcra.1681i',
    cite: '15 U.S.C. § 1681i',
    url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681i&num=0&edition=prelim',
    marker: '§1681i.',
  },
  {
    slug: 'fcra.1681m',
    cite: '15 U.S.C. § 1681m',
    url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681m&num=0&edition=prelim',
    marker: '§1681m.',
  },
  {
    slug: 'ccpa.1798.106',
    cite: 'Cal. Civ. Code § 1798.106',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.106',
    marker: '1798.106.',
  },
  {
    slug: 'ccpa.1798.125',
    cite: 'Cal. Civ. Code § 1798.125',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.125',
    marker: '1798.125.',
  },
  {
    slug: 'icraa.1786.24',
    cite: 'Cal. Civ. Code § 1786.24',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1786.24',
    marker: '1786.24.',
  },
  {
    slug: 'ny.gbl.380-f',
    cite: 'N.Y. Gen. Bus. Law § 380-f',
    url: 'https://www.nysenate.gov/legislation/laws/GBS/380-F',
    marker: '380-f',
  },
  {
    slug: 'udap.tx.17.46',
    cite: 'Tex. Bus. & Com. Code § 17.46',
    url: 'https://statutes.capitol.texas.gov/Docs/BC/htm/BC.17.htm',
    marker: 'Sec. 17.46.',
  },
  {
    slug: 'udap.in.24-5-0.5-3',
    cite: 'Ind. Code § 24-5-0.5-3',
    url: 'https://law.justia.com/codes/indiana/title-24/article-5/chapter-0-5/section-24-5-0-5-3/',
    marker: '24-5-0.5-3',
  },
  {
    slug: 'udap.fl.501.204',
    cite: 'Fla. Stat. § 501.204',
    url: 'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.204.html',
    marker: '501.204',
  },
  {
    slug: 'udap.ca.17200',
    cite: 'Cal. Bus. & Prof. Code § 17200',
    url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17200',
    marker: '17200.',
  },
  {
    slug: 'udap.ny.349',
    cite: 'N.Y. Gen. Bus. Law § 349',
    url: 'https://www.nysenate.gov/legislation/laws/GBS/349',
    marker: '§ 349',
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
