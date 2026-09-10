/**
 * .what = survey whether any carrier writes AFFIRMATIVE TCPA cover — a product that answers a TCPA
 *         claim rather than excludes it — across two independent evidence routes:
 *           (a) decisions where a policy actually responded to a TCPA claim, and
 *           (b) the open web, for a named product / endorsement that grants such cover
 * .why  = ⛔ the vision's R9, and the unanswered half of the wish's fourth question ("what insurers
 *         cover these suits"). D6 proves the ISO CGL exclusion bites; it never asks whether a
 *         different instrument grants cover back. a reader told only "your GL policy excludes this"
 *         may conclude the risk is uninsurable, which is a stronger claim than the evidence supports.
 * .note = ⚠️ the two routes have very different citation quality, and they are kept apart on purpose.
 *         route (a) is a court's account of a real policy and is citable as fact. route (b) is
 *         vendor copy — evidence that a product is advertised, never evidence of what it pays. any
 *         brief built on this must carry that split, per rule.require.bhrowser-citations, which
 *         treats a vendor page as a locator and not as authority.
 *         no inner named function may be declared inside page.evaluate — the transpiler wraps
 *         such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  // route (a) — decisions where cover was actually found for a TCPA claim
  const caselaw = [
    '"Telephone Consumer Protection Act" "duty to defend" insurer owed coverage',
    '"Telephone Consumer Protection Act" endorsement coverage granted policy limits',
  ];

  // route (b) — is such a product offered at all?
  const market = [
    'TCPA liability insurance endorsement affirmative coverage carrier',
    'media liability policy TCPA class action coverage limits',
  ];

  const found: {
    route: 'caselaw' | 'market';
    q: string;
    total: number;
    hits: { title: string; href: string }[];
  }[] = [];

  for (const q of caselaw) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(q)}&type=o&order_by=score+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string }[] = [];
      for (const a of Array.from(document.querySelectorAll('a[href*="/opinion/"]'))) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        out.push({ title, href: (a as HTMLAnchorElement).href });
        if (out.length >= 6) break;
      }
      return out;
    });

    found.push({ route: 'caselaw', q, total: hits.length, hits });
  }

  for (const q of market) {
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string }[] = [];
      for (const a of Array.from(
        document.querySelectorAll('a[data-testid="result-title-a"], h2 a'),
      )) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        const href = (a as HTMLAnchorElement).href;
        if (!title || !href.startsWith('http')) continue;
        out.push({ title, href });
        if (out.length >= 8) break;
      }
      return out;
    });

    found.push({ route: 'market', q, total: hits.length, hits });
  }

  const caselawTotal = found.filter((f) => f.route === 'caselaw').reduce((s, f) => s + f.total, 0);
  const marketTotal = found.filter((f) => f.route === 'market').reduce((s, f) => s + f.total, 0);

  if (caselawTotal + marketTotal === 0)
    throw new UnexpectedCodePathError(
      'zero hits on BOTH routes — treat as a broken capture, not a proven absence of the market.\n' +
        '  fix: snapshot each engine and confirm the result selectors still match.',
    );

  return { caselawTotal, marketTotal, found };
};
