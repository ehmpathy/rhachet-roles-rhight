/**
 * .what = find the Federal Register documents for the FCC consent orders that bracket the 2025
 *         vacatur — the 2023 one-to-one consent order whose Part III.D was struck, and the 2024
 *         order that created the revocation duty now at 47 C.F.R. § 64.1200(a)(10)
 * .why  = D5 needs two more purely-federal sources, and these are the two most on-point ones.
 *         a first pass with a broad term returned unrelated recent FCC documents, so this pass
 *         probes narrower terms and reports which one actually surfaces the orders.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const terms = [
    'one-to-one consent robotexts',
    'revocation of consent robocalls robotexts',
  ];

  const found: { term: string; hits: { title: string; href: string }[] }[] = [];

  for (const term of terms) {
    await page.goto(
      `https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=${encodeURIComponent(
        term,
      )}`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string }[] = [];
      const anchors = Array.from(
        document.querySelectorAll('h5 a[href*="/documents/20"], h2 a[href*="/documents/20"]'),
      );
      for (const a of anchors) {
        out.push({
          title: (a.textContent || '').replace(/\s+/g, ' ').trim(),
          href: (a as HTMLAnchorElement).href,
        });
        if (out.length >= 6) break;
      }
      return out;
    });

    found.push({ term, hits });
  }

  const total = found.reduce((sum: number, f: any) => sum + (f.hits?.length ?? 0), 0); if (total === 0) throw new UnexpectedCodePathError("search returned zero hits across every query. treat this as a broken capture, not a proven absence. fix: snapshot the page and confirm the result selectors still match the site markup."); return { total, found };
};
