/**
 * .what = locate actual FCC forfeiture orders in robocall / caller-id cases, to learn how the
 *         Commission applies the per-violation figure and the "single act or failure to act" cap
 * .why  = R8. the rule text is now in hand — 47 C.F.R. § 1.80(b)(10) caps a catch-all forfeiture at
 *         $25,132 per violation and $188,491 "for any single act or failure to act". that cap is
 *         smaller than the nine-figure robocall forfeitures I recall the Commission has issued, by
 *         three orders of magnitude. one of those two things is wrong, and I cannot tell which from
 *         the rule text: the answer turns on whether "single act" means one call or one campaign,
 *         and § 1.80 does not say.
 *
 *         this is the R7 lesson applied before the fact rather than after it: for a claim about what
 *         an authority does, the rule it operates under is necessary and not sufficient. a brief
 *         that quoted the cap and stopped would state a number that is probably off by 1000x.
 * .note = my recollection of the specific figures ($120M, $225M) is unverified recall and is
 *         deliberately not used as a search term — to search for a number I half-remember is to
 *         invite a confirmation hit. the queries name the conduct and the document type instead, so
 *         whatever the real magnitudes are, they come back on their own terms.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    'robocall forfeiture order enforcement bureau',
    'spoofed caller identification forfeiture order',
    'telephone consumer protection act notice of apparent liability',
  ];

  const found: { query: string; url: string; hits: { title: string; href: string }[] }[] = [];

  for (const q of queries) {
    const url = `https://www.fcc.gov/search/?t=documents&q=${encodeURIComponent(q)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string }[] = [];
      const anchors = Array.from(document.querySelectorAll('a[href*="/document/"]'));
      for (const a of anchors) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title) continue;
        out.push({ title, href: (a as HTMLAnchorElement).href });
        if (out.length >= 10) break;
      }
      return out;
    });

    found.push({ query: q, url, hits });
  }

  const total = found.reduce((sum: number, f: any) => sum + (f.hits?.length ?? 0), 0); if (total === 0) throw new UnexpectedCodePathError("search returned zero hits across every query. treat this as a broken capture, not a proven absence. fix: snapshot the page and confirm the result selectors still match the site markup."); return { total, found };
};
