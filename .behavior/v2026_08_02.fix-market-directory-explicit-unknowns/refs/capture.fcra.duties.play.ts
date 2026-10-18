/**
 * .what = capture verbatim text of the FCRA duty sections that bite a directory:
 *         § 1681b (permissible purposes), § 1681c (obsolete adverse info / 7-year bar),
 *         § 1681e (accuracy + reasonable procedures), § 1681k (public record for employment)
 *
 * .why  = the wish asks whether a true, publicly-sourced adverse fact may be shown.
 *         truth answers defamation; it does NOT answer FCRA, which bars stale adverse
 *         items outright and demands maximum possible accuracy. we need the statute's
 *         own words on both, plus the permissible-purpose list that decides whether the
 *         directory is inside the act at all.
 *
 * usage:
 *   rhx browser.start --mode HEADFUL --refresh
 *   rhx browser.action --play $PWD/.behavior/<route>/refs/capture.fcra.duties.play.ts
 *
 * output:
 *   .temp/capture/fcra.1681b.txt, fcra.1681c.txt, fcra.1681e.txt, fcra.1681k.txt
 */
import { mkdirSync, writeFileSync } from 'fs';
import { HelpfulError } from 'helpful-errors';
import { dirname } from 'path';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const SECTIONS = [
  { slug: '1681b', note: 'permissible purposes of consumer reports' },
  { slug: '1681c', note: 'requirements for information contained in consumer reports' },
  { slug: '1681e', note: 'compliance procedures' },
  { slug: '1681k', note: 'public record information for employment purposes' },
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

    const outputPath = `.temp/capture/fcra.${section.slug}.txt`;
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
