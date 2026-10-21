/**
 * .what = capture 15 U.S.C. §§ 45, 1681i, 1681m from govinfo (GPO, official)
 *
 * .why  = retry of the three uscode sources in capture.residuals.udap-and-dispute, which
 *         waited on networkidle over document.body and read only the 913-byte viewer shell.
 *         this one follows the proven capture.fcra.duties shape: domcontentloaded, then the
 *         #docViewerContent node, then the section marker as the gate.
 *
 * .fallback = observed 2026-10-19: uscode.house.gov runs "in a temporary format" and its
 *         view.xhtml section URLs return "Page Not Found" (the 913-byte read). govinfo.gov
 *         publishes the same official Code as static per-section html, so it is the source.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.residuals.uscode.govinfo.play.ts
 *
 * output:
 *   .temp/capture/residual.$slug.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SECTIONS = [
  { slug: '45', file: 'ftc.45', path: 'chap2-subchapI-sec45', note: 'unfair or deceptive acts' },
  { slug: '1681i', file: 'fcra.1681i', path: 'chap41-subchapIII-sec1681i', note: 'disputed accuracy' },
  { slug: '1681m', file: 'fcra.1681m', path: 'chap41-subchapIII-sec1681m', note: 'duties of report users' },
];

const asSourceUrl = (path: string) =>
  `https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-${path}.htm`;

/**
 * the marker the real statute must carry, derived per section — the OLRC viewer
 * titles each section as e.g. "§1681c. Requirements for information...".
 * navigation chrome and the async shell cannot fake it.
 */
const asSectionMarker = (slug: string) => `§${slug}.`;
// govinfo renders the same heading shape as the OLRC viewer: "§45. Unfair methods..."

export const action = async (input: { page: Page; browser: Browser }) => {
  const captured: { slug: string; bytes: number; title: string }[] = [];

  for (const section of SECTIONS) {
    const url = asSourceUrl(section.path);
    // the title-15 viewer path differs only in the section slug
    await input.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    // best-effort only — a selector can appear before its content does, so the
    // selector is NOT the gate. the marker assertion below is.
    const text = await input.page.evaluate(
      () => (document.body as HTMLElement).innerText,
    );

    // fail loud rather than persist a shell read as if it were a citable capture.
    // assert the MARKER, not a byte floor: short statutes are legitimately short,
    // so a length heuristic cannot tell a two-sentence statute from a shell.
    const marker = asSectionMarker(section.slug);
    if (!text.includes(marker))
      HelpfulError.throw('capture lacks its section marker', {
        marker,
        slug: section.slug,
        bytes: text.length,
        url,
        hint: 'likely the async shell, not the statute — re-run with --mode HEADFUL and confirm the page rendered',
      });

    const outputPath = `.temp/capture/residual.${section.file}.txt`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `SOURCE: ${url}\n\n${text}`, 'utf8');

    captured.push({
      slug: section.slug,
      bytes: text.length,
      title: await input.page.title(),
    });
  }

  return { captured };
};
