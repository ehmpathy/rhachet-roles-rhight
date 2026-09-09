/**
 * .what = search CourtListener for decisions that construe a safe harbor, affirmative defense, or
 *         pre-suit cure condition under a state mini-TCPA in TX / CA / NY / IN — the four mandated
 *         states whose analogue to `§ 227(c)(5)` and `Fla. Stat. § 501.059(10)(c)` is unrecorded
 * .why  = ⛔ a vision research item no prior playbook answered. the state scripts already in this
 *         folder (`read.texas-bc-302-305`, `read.calif-puc-2872`, `read.ny-gbs-399`,
 *         `read.indiana-ic-24-4.7-5`) capture each statute's general text; none of them asks the
 *         safe-harbor question. that matters because the federal `§ 227(c)(5)` defense reframed the
 *         whole deliverable from pure exposure to exposure-and-defense, and a sender served by four
 *         more states needs to know whether the same mitigant exists there.
 * .note = a decision is the right document class here rather than the statute alone: a safe harbor
 *         that no court has construed is a text, and the vision asked what "due care" has been HELD
 *         to require. a NIL result per state is itself citable — it means the mitigant is unproven
 *         in that state, which is what a reader must be told.
 *         the search terms quote statutory language and cannot be reworded.
 *         no inner named function may be declared inside page.evaluate — the transpiler wraps
 *         such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const probes = [
    {
      state: 'TX',
      q: 'Texas "Business and Commerce Code" telephone solicitation "affirmative defense" chapter 305',
    },
    {
      state: 'CA',
      q: 'California "Public Utilities Code" 2872 telephone "affirmative defense" good faith',
    },
    {
      state: 'NY',
      q: 'New York "General Business Law" 399-p telephone solicitation "affirmative defense"',
    },
    {
      state: 'IN',
      q: 'Indiana "24-4.7" telephone solicitation "affirmative defense" good faith error',
    },
  ];

  const found: {
    state: string;
    q: string;
    total: number;
    hits: { title: string; href: string; meta: string }[];
  }[] = [];

  for (const probe of probes) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(probe.q)}&type=o&order_by=score+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string; meta: string }[] = [];
      const anchors = Array.from(document.querySelectorAll('a[href*="/opinion/"]'));
      for (const a of anchors) {
        const row = a.closest('article') || a.closest('div');
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        out.push({
          title,
          href: (a as HTMLAnchorElement).href,
          meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 260),
        });
        if (out.length >= 6) break;
      }
      return out;
    });

    found.push({ state: probe.state, q: probe.q, total: hits.length, hits });
  }

  // ⭐ a per-state zero is a real answer here (the mitigant is unproven in that state), so it is
  // reported as a named verdict. a zero across ALL FOUR states is a different claim — that reads as
  // a broken capture, because four independent statutes are unlikely to be uniformly unlitigated.
  const total = found.reduce((sum, f) => sum + f.total, 0);
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across all four states — treat as a broken capture, not a proven absence.\n' +
        '  fix: snapshot CourtListener and confirm the opinion anchors still match.',
    );

  return {
    total,
    perState: found.map((f) => ({
      state: f.state,
      total: f.total,
      verdict: f.total === 0 ? 'NO-CONSTRUCTION-FOUND' : 'HITS',
    })),
    found,
  };
};
