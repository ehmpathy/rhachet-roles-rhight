/**
 * .what = the second pass of the five-state sweep, which closes the three gaps the first pass left:
 *         (A) Indiana — the first pass proved the chapters are REACHABLE but captured only index
 *             pages, so this walks the index links down to the section text
 *         (B) California — PUC 2872/2874 captured, but both returned ZERO hits on every consent and
 *             penalty pattern, which is a result that must be explained rather than assumed
 *         (C) Florida — the first pass read the civil penalty as **Class IV** under s. 570.971 while
 *             this engagement's earlier notes recorded **Class III**. one of the two is wrong
 * .why  = `rule.require.five-state-baseline` wants a verbatim cite per cell or an explicit "none
 *         found". a chapter TITLE is not a cell, and a zero-hit capture is not a "none found" until
 *         someone has looked at the page.
 * .note = ⭐ (C) is the reason this file exists at all. a re-pull that merely confirmed prior notes
 *         would be cheap insurance; a re-pull that CONTRADICTS them is the whole argument for the
 *         re-pull rule. whichever way it lands, the discrepancy gets recorded rather than silently
 *         reconciled to whichever number was written first.
 *         ⚠️ (A) carries a trap worth a note of its own: the official iga.in.gov urls returned
 *         "IGA | Not Found" at 425 bytes — so the earlier engagement note that Indiana "blocked on a
 *         credential/bot wall" was WRONG. it was a 404, not a wall. a wrong diagnosis of a failure is
 *         as costly as a wrong fact, because it sends the next attempt at the wrong fix.
 *         ⚠️ the chapter titles below ("Automatic Dialing Machines") are the statute's OWN headings,
 *         quoted verbatim so the cite can be matched against the code.
 *         ⚠️ every target is graded on its own and failures are captured, never thrown.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const out: any[] = [];

  // ── (A) Indiana: walk each chapter index down to its section pages ──────────────────
  const inChapters = [
    {
      cite: 'Ind. Code § 24-5-14 (Automatic Dialing Machines)',
      url: 'https://law.justia.com/codes/indiana/title-24/article-5/chapter-14/',
    },
    {
      cite: 'Ind. Code § 24-4.7-4 (Telephone Solicitations)',
      url: 'https://law.justia.com/codes/indiana/title-24/article-4-7/chapter-4/',
    },
  ];

  for (const chapter of inChapters) {
    await page.goto(chapter.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
      if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
    }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const links: string[] = await page.evaluate(() => {
      const acc: string[] = [];
      for (const a of Array.from(document.querySelectorAll('a[href*="/section-"]'))) {
        const href = (a as HTMLAnchorElement).href;
        if (href && acc.indexOf(href) === -1) acc.push(href);
        if (acc.length >= 6) break;
      }
      return acc;
    });

    const sections: any[] = [];
    for (const link of links) {
      let text = '';
      let failure: string | null = null;
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForLoadState('networkidle', { timeout: 6000 }).catch((e: any) => {
          if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
        }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows
        text = await page.evaluate(() => {
          const region = document.querySelector('.codes-content') || document.body;
          return ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim();
        });
      } catch (e: any) {
        failure = String(e?.message || e).slice(0, 200);
      }
      sections.push({ url: link, bytes: text.length, failure, text: text.slice(0, 1600) });
    }

    out.push({
      part: 'A-indiana',
      cite: chapter.cite,
      indexUrl: chapter.url,
      sectionLinks: links.length,
      verdict:
        links.length === 0
          ? 'NO-SECTION-LINKS — the index rendered but exposed no section anchors'
          : `${links.length} section page(s) walked`,
      sections,
    });
  }

  // ── (B) California: capture the actual body so a zero-hit result can be explained ────
  for (const sec of ['2871', '2872', '2874', '2875', '2876']) {
    let text = '';
    let failure: string | null = null;
    const url = `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=${sec}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
        if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
      }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows
      text = await page.evaluate(() => {
        const region =
          document.querySelector('#codeLawSectionNoHead') ||
          document.querySelector('#manylawsections') ||
          document.body;
        return ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim();
      });
    } catch (e: any) {
      failure = String(e?.message || e).slice(0, 200);
    }
    out.push({
      part: 'B-california',
      cite: `Cal. Pub. Util. Code § ${sec}`,
      url,
      bytes: text.length,
      failure,
      verdict:
        text.length < 200 ? 'THIN-OR-EMPTY — inspect before any "none found" claim' : 'captured',
      text: text.slice(0, 2200),
    });
  }

  // ── (C) Florida: settle the Class III vs Class IV discrepancy ────────────────────────
  const flUrl = 'https://www.flsenate.gov/Laws/Statutes/2025/501.059';
  await page.goto(flUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
    if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
  }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const flBlob = await page.evaluate(() =>
    (document.body?.innerText || '').replace(/\s+/g, ' ').trim(),
  );
  if (String(flBlob).length < 2000)
    throw new UnexpectedCodePathError(
      `Florida capture was ${String(flBlob).length} bytes — under the 2000-byte floor.\n` +
        '  fix: this host worked minutes ago in the first pass; re-run before any conclusion.',
    );

  const classHunted = /([\s\S]{0,300}(?:Class [IVX]+ category|570\.971)[\s\S]{0,300})/gi;
  const classWindows: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = classHunted.exec(String(flBlob))) !== null) {
    classWindows.push(m[0]);
    if (classWindows.length >= 4) break;
  }

  out.push({
    part: 'C-florida-penalty-class',
    cite: 'Fla. Stat. § 501.059 — civil penalty category',
    url: flUrl,
    bytes: String(flBlob).length,
    verdict:
      classWindows.length === 0
        ? 'NO-CLASS-LANGUAGE-FOUND — do NOT restate either Class III or Class IV from prior notes'
        : `${classWindows.length} window(s) — read them and record which category the statute states`,
    classWindows,
  });

  return { parts: out.length, out };
};
