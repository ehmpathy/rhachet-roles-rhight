/**
 * .what = locate appellate decisions that compelled a TCPA plaintiff to arbitrate — the opposite
 *         outcome from Knutson (9th Cir.) and Credit One (7th Cir.), which both reversed such orders
 * .why  = R7. the three opinions read so far all cut one way: Concepcion validates the class waiver,
 *         then two circuits refuse to apply a clause to a plaintiff who never agreed. a brief built
 *         on that set alone would tell a reader "arbitration does not stop TCPA claims", which is
 *         false and would cost a defendant a defense it actually holds. the set needs at least one
 *         decision where the clause did bind, so the brief states a boundary rather than a slogan.
 * .note = the queries deliberately pair "compel arbitration" with terms that mark an actual
 *         customer relationship (cardholder, subscriber, terms of service), because that is the
 *         population the defense reaches. a hit whose plaintiff is a stranger to the contract is
 *         the wrong side of the line and is discarded at the read stage.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    '"Telephone Consumer Protection Act" "compel arbitration" affirmed "terms of service"',
    '"Telephone Consumer Protection Act" arbitration "class action waiver" enforceable customer',
    '"Telephone Consumer Protection Act" "motion to compel arbitration" granted subscriber agreement',
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
