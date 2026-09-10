/**
 * .what = locate appellate decisions that review an FCC forfeiture order in a robocall or
 *         caller-id case, as the route to how the Commission applies § 1.80's per-violation figure
 *         and its "single act or failure to act" cap
 * .why  = R8. the direct route failed: fcc.gov's document search is a javascript app and returned
 *         one irrelevant static link for all three queries. rather than a fourth query variant or a
 *         guess at a docs.fcc.gov path, this changes the kind of source — the same move that solved
 *         U4, where a published opinion that reproduced a policy from the record beat a hunt for a
 *         second specimen pdf.
 *
 *         a court that reviews a forfeiture must state the amount and must engage with how the
 *         Commission counted violations. that is better evidence than the order alone for the
 *         question actually open here, which is not "what was the number" but "what does the
 *         Commission treat as one act".
 * .note = the specific dollar figures I half-recall are again not used as search terms, for the
 *         same reason as the prior playbook: a number-keyed query returns a confirmation of the
 *         number whether or not it is right.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    'FCC forfeiture order robocall "per-call" violations petition for review',
    '"single act or failure to act" forfeiture Communications Act robocalls',
    'spoofed caller id "Truth in Caller ID" forfeiture order court of appeals',
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
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        const row = a.closest('article') || a.closest('div');
        out.push({
          title,
          href: (a as HTMLAnchorElement).href,
          meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 300),
        });
        if (out.length >= 6) break;
      }
      return out;
    });

    found.push({ query: q, hits });
  }

  const total = found.reduce((sum: number, f: any) => sum + (f.hits?.length ?? 0), 0); if (total === 0) throw new UnexpectedCodePathError("search returned zero hits across every query. treat this as a broken capture, not a proven absence. fix: snapshot the page and confirm the result selectors still match the site markup."); return { total, found };
};
