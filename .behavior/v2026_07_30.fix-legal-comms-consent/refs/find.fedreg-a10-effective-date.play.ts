/**
 * .what = search the Federal Register for the FCC document that announces the effective date of
 *         47 C.F.R. § 64.1200(a)(10) and (a)(11) — the revocation-of-consent paragraphs
 * .why  = R12-a. 89 FR 15756 says those paragraphs are "delayed indefinitely", and 90 FR 13425
 *         spells out the mechanism the FCC uses for exactly this: a paragraph is delayed until the
 *         Commission publishes "a document in the Federal Register announcing approval of the
 *         information collection and the relevant effective date". so a fit for that description
 *         should exist for (a)(10). without it, the ten-business-day duty rests on eCFR alone
 *         against a contrary DATES line.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const terms = [
    '64.1200(a)(10) effective date information collection',
    'revocation of consent robocalls effective date announcement',
  ];

  const found: { term: string; hits: { title: string; href: string; meta: string }[] }[] = [];

  for (const term of terms) {
    await page.goto(
      `https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=${encodeURIComponent(
        term,
      )}&conditions%5Bagencies%5D%5B%5D=federal-communications-commission`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string; meta: string }[] = [];
      const anchors = Array.from(
        document.querySelectorAll('h5 a[href*="/documents/20"], h2 a[href*="/documents/20"]'),
      );
      for (const a of anchors) {
        const row = a.closest('li') || a.parentElement?.parentElement;
        out.push({
          title: (a.textContent || '').replace(/\s+/g, ' ').trim(),
          href: (a as HTMLAnchorElement).href,
          meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 260),
        });
        if (out.length >= 8) break;
      }
      return out;
    });

    found.push({ term, hits });
  }

  const total = found.reduce((sum: number, f: any) => sum + (f.hits?.length ?? 0), 0); if (total === 0) throw new UnexpectedCodePathError("search returned zero hits across every query. treat this as a broken capture, not a proven absence. fix: snapshot the page and confirm the result selectors still match the site markup."); return { total, found };
};
