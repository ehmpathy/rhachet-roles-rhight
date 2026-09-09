/**
 * .what = find the California Supreme Court's answer to the question the Ninth Circuit certified in
 *         Yahoo! Inc. v. National Union Fire Ins. Co., 913 F.3d 923 (9th Cir. 2019)
 * .why  = R10 / D6. the 9th Circuit document already read is an order that certifies a question — it
 *         decides no merits and expressly says the panel "may hazard a guess" but will not. to cite
 *         it as a decision on the merits would repeat, in a third authority, the exact defect this
 *         engagement has hit twice: a reservation dropped and a summary treated as a decision. the
 *         certified question has an answer somewhere or it does not, and I decline to supply one
 *         from recall — a prior claim in this session was wrong for precisely that reason.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    'Yahoo National Union Fire Insurance right of privacy seclusion',
    '"JT\'s Frames" "ACS Systems" seclusion secrecy insurance',
  ];

  const found: { query: string; hits: { title: string; href: string; meta: string }[] }[] = [];

  for (const q of queries) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(q)}&type=o&order_by=dateFiled+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string; meta: string }[] = [];
      const anchors = Array.from(document.querySelectorAll('a[href*="/opinion/"]'));
      for (const a of anchors) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        const row = a.closest('article') || a.closest('div');
        out.push({
          title,
          href: (a as HTMLAnchorElement).href,
          meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 300),
        });
        if (out.length >= 8) break;
      }
      return out;
    });

    found.push({ query: q, hits });
  }

  const total = found.reduce((sum: number, f: any) => sum + (f.hits?.length ?? 0), 0); if (total === 0) throw new UnexpectedCodePathError("search returned zero hits across every query. treat this as a broken capture, not a proven absence. fix: snapshot the page and confirm the result selectors still match the site markup."); return { total, found };
};
