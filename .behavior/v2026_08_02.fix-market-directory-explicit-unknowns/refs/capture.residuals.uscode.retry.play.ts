/**
 * .what = capture 15 U.S.C. §§ 45, 1681i, 1681m from the OLRC viewer
 *
 * .why  = retry of the three uscode sources in capture.residuals.udap-and-dispute, which
 *         waited on networkidle over document.body and read only the 913-byte viewer shell.
 *         this one follows the proven capture.fcra.duties shape: domcontentloaded, then the
 *         #docViewerContent node, then the section marker as the gate.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.residuals.uscode.retry.play.ts
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
  { slug: '45', file: 'ftc.45', note: 'unfair methods of competition; unfair or deceptive acts' },
  { slug: '1681i', file: 'fcra.1681i', note: 'procedure in case of disputed accuracy' },
  { slug: '1681m', file: 'fcra.1681m', note: 'requirements on users of consumer reports' },
];

const asSourceUrl = (slug: string) =>
  `https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section${slug}&num=0&edition=prelim`;

/**
 * the marker the real statute must carry, derived per section — the OLRC viewer
 * titles each section as e.g. "§1681c. Requirements for information...".
 * navigation chrome and the async shell cannot fake it.
 */
const asSectionMarker = (slug: string) => `§${slug}.`;

export const action = async (input: { page: Page; browser: Browser }) => {
  const captured: { slug: string; bytes: number; title: string }[] = [];

  for (const section of SECTIONS) {
    const url = asSourceUrl(section.slug);
    // the title-15 viewer path differs only in the section slug
    await input.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    // best-effort only — a selector can appear before its content does, so the
    // selector is NOT the gate. the marker assertion below is.
    await input.page
      .waitForSelector('#docViewerContent', { timeout: 30_000 })
      .catch(allowTimeoutOnly);

    const text = await input.page.evaluate(() => {
      const node = document.querySelector('#docViewerContent') ?? document.body;
      return (node as HTMLElement).innerText;
    });

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
