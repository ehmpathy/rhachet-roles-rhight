/**
 * .what = locate the Consumer and Governmental Affairs Bureau order that delayed part of
 *         `47 CFR 64.1200(a)(10)` to April 11, 2026, and capture its own words
 * .why  = ⛔ this corrects a shipped brief. `define.what-the-2025-vacatur-did-and-did-not-do`
 *         states flatly that the ten-business-day revocation duty "is live, effective April 11,
 *         2025". the FCC's own Dec 2025 further notice (`2025-22063` ¶79) says the Bureau
 *         "delayed until April 11, 2026 implementation of this rule 'to the extent that it
 *         requires callers to treat a request to revoke consent made by a called party in response
 *         to one type of message as applicable to all future robocalls and robotexts from that
 *         caller on unrelated matters.'" so the duty split into two clocks and the brief records
 *         only the earlier one. per rule.require.bhrowser-citations the correction must cite the
 *         delay order itself, not merely the later notice that describes it.
 * .note = declares no inner named function inside page.evaluate — see the note on
 *         read.fcc-post-remand-orders for why esbuild keepNames breaks that in the browser realm.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const probes = [
    'revocation of consent waiver order effective date April 11 2026',
    'stop robocalls revocation implementation delay',
    'consumers stop robocalls order revocation scope',
  ];

  const found: { probe: string; url: string; hits: { title: string; href: string }[] }[] = [];

  for (const probe of probes) {
    const url =
      `https://www.federalregister.gov/documents/search` +
      `?conditions%5Bagencies%5D%5B%5D=federal-communications-commission` +
      `&conditions%5Bterm%5D=${encodeURIComponent(probe)}` +
      `&conditions%5Bpublication_date%5D%5Bgte%5D=2025-01-01`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page
      .waitForLoadState('networkidle', { timeout: 6000 })
      .catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const raw = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="/documents/20"]')).map((a) => ({
        title: (a as HTMLAnchorElement).textContent ?? '',
        href: (a as HTMLAnchorElement).href,
      })),
    );

    const hits = raw
      .map((h: { title: string; href: string }) => ({
        title: h.title.replace(/\s+/g, ' ').trim(),
        href: h.href,
      }))
      .filter((h: { title: string; href: string }) => h.title.length > 25)
      .slice(0, 12);

    found.push({ probe, url, hits });
  }

  const total = found.reduce((sum, f) => sum + f.hits.length, 0);
  if (total === 0)
    throw new UnexpectedCodePathError(
      `no candidate delay order found across ${probes.length} probes.\n` +
        `  fix: widen the date floor or probe the FCC's own docket (CG Docket 02-278) directly.`,
    );

  return { total, found };
};
