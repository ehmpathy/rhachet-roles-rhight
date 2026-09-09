/**
 * .what = search CourtListener for federal decisions that approve or review a TCPA class
 *         settlement, so the exposure brief can quote real fund sizes and real per-claimant
 *         recoveries instead of the nominal per-message multiplier
 * .why  = ⛔ a vision research item no prior playbook answered: "settlement/verdict data —
 *         realistic ranges, since a nominal $20M rarely equals a paid $20M". the wish asked
 *         "what are the sizes of penalties?" and `ref.tcpa-exposure-tracks` currently answers with
 *         statutory units and caps only. a sender who reads $500-1500 per message and multiplies
 *         gets a number no case has ever produced; a final-approval order states what a class
 *         actually recovered, which is the figure that belongs beside the statutory one.
 * .note = a settlement approval order is the right document class because it must, by Rule 23(e),
 *         state the fund and assess its adequacy against the maximum statutory exposure — so the
 *         two numbers the brief needs sit in the same opinion.
 *         the search terms quote court language and cannot be reworded.
 *         no inner named function may be declared inside page.evaluate — the transpiler wraps
 *         such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const queries = [
    '"Telephone Consumer Protection Act" "final approval" class settlement fund',
    '"TCPA" settlement "per class member" claims rate approval',
    '"Telephone Consumer Protection Act" "maximum statutory damages" settlement reasonable',
  ];

  const found: { query: string; hits: { title: string; href: string; meta: string }[] }[] = [];

  for (const q of queries) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(q)}&type=o&order_by=score+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

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

  const total = found.reduce((sum, f) => sum + f.hits.length, 0);
  if (total === 0)
    throw new UnexpectedCodePathError(
      `no settlement decisions found across ${queries.length} queries.\n` +
        `  fix: CourtListener may have changed its result markup — snapshot the page and confirm the\n` +
        `       opinion anchors still match 'a[href*="/opinion/"]'.`,
    );

  return { total, found };
};
