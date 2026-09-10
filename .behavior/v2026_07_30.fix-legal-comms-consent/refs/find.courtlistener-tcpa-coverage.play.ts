/**
 * .what = search CourtListener for federal opinions that apply the ISO CGL exclusion titled
 *         "Recording And Distribution Of Material Or Information In Violation Of Law" to a TCPA claim
 * .why  = R10, and the last research leg of D6. the vision proved the exclusion exists verbatim in
 *         the form, but never checked whether courts enforce it, nor whether "personal and
 *         advertising injury" ever reaches a TCPA claim despite it. a coverage brief that says "your
 *         policy excludes this" without a single decision is an assertion about how a document would
 *         be read, not a report of how it has been read.
 * .note = CourtListener is a free full-text opinion database run by the Free Law Project; opinions
 *         it hosts are the courts' own text. it is used here to locate decisions — any decision that
 *         a brief quotes must then be read at its own official source or in full.
 *         the search terms quote policy language and cannot be reworded.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    '"Recording and Distribution of Material" TCPA exclusion',
    '"Telephone Consumer Protection Act" "advertising injury" exclusion coverage',
  ];

  const found: { query: string; hits: { title: string; href: string; meta: string }[] }[] = [];

  for (const q of queries) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(q)}&type=o&order_by=score+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string; meta: string }[] = [];
      const anchors = Array.from(document.querySelectorAll('a[href*="/opinion/"]'));
      for (const a of anchors) {
        const row = a.closest('article') || a.closest('div');
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title) continue;
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
