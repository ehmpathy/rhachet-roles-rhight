/**
 * .what = locate (a) the Supreme Court authority that makes class-action waivers in arbitration
 *         agreements enforceable, and (b) decisions that apply arbitration clauses to TCPA claims
 * .why  = R7 / H9. the vision's headline exposure figure — $500 per message x the class — assumes
 *         class treatment is available, and never named the standard defeater of aggregation. but
 *         the more decision-relevant question is the limit of that defense: an arbitration clause
 *         binds the people who agreed to it, and a large share of TCPA plaintiffs (purchased leads,
 *         wrong numbers, reassigned numbers) never agreed to a thing. the search targets both the
 *         rule and its edge deliberately, so the answer does not come out one-sided.
 * .note = supremecourt.gov returned 404 for /opinions/10pdf/09-893.pdf — the slip archive does not
 *         reach back to the 2010 term at that path, so the opinion is located through CourtListener
 *         instead of by further guesses at a url. that is a diagnosis, not a fallback: two 404s from
 *         a constructed path mean the path is wrong, not the document absent.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    'AT&T Mobility Concepcion class arbitration Federal Arbitration Act preemption',
    '"Telephone Consumer Protection Act" arbitration "class action waiver" compel',
    '"Telephone Consumer Protection Act" arbitration nonsignatory scope "wrong number"',
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
          meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 280),
        });
        if (out.length >= 6) break;
      }
      return out;
    });

    found.push({ query: q, hits });
  }

  const total = found.reduce((sum: number, f: any) => sum + (f.hits?.length ?? 0), 0); if (total === 0) throw new UnexpectedCodePathError("search returned zero hits across every query. treat this as a broken capture, not a proven absence. fix: snapshot the page and confirm the result selectors still match the site markup."); return { total, found };
};
