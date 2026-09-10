/**
 * .what = capture the two Federal Register documents that bracket the January 2025 vacatur:
 *         the 2023 order that added the one-to-one consent restriction (later struck), and the
 *         2024 order that created the revocation duty now at 47 C.F.R. § 64.1200(a)(10)
 * .why  = D5 is a purely-federal brief about what the vacatur did and did not do, and these are
 *         the primary documents on both sides of it. federalregister.gov renders full document
 *         text as html, so the browser reads the real page rather than a 100-page pdf.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the urls below carry the documents' own titles and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'order.2023.one-to-one',
      url: 'https://www.federalregister.gov/documents/2024/01/26/2023-28832/targeting-and-eliminating-unlawful-text-messages-implementation-of-the-telephone-consumer-protection',
      probes: ['one-to-one', 'logically and topically', 'single seller'],
    },
    {
      slug: 'order.2024.revocation',
      url: 'https://www.federalregister.gov/documents/2024/03/05/2024-04586/strengthening-the-ability-of-consumers-to-stop-robocalls',
      probes: ['ten business days', 'any reasonable method', 'revoke'],
    },
  ];

  const out: any[] = [];

  for (const t of targets) {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate((probes: string[]) => {
      const body = document.body.innerText;

      const cite = body.match(/\d+\s+FR\s+\d+/);
      const summaryAt = body.indexOf('SUMMARY:');
      const datesAt = body.indexOf('DATES:');

      const found: Record<string, string | null> = {};
      for (const p of probes) {
        const at = body.indexOf(p);
        found[p] =
          at === -1
            ? null
            : body
                .slice(Math.max(0, at - 320), at + 420)
                .replace(/\s+/g, ' ')
                .trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        frCite: cite ? cite[0] : null,
        summary:
          summaryAt === -1
            ? null
            : body.slice(summaryAt, summaryAt + 700).replace(/\s+/g, ' ').trim(),
        dates:
          datesAt === -1
            ? null
            : body.slice(datesAt, datesAt + 320).replace(/\s+/g, ' ').trim(),
        probes: found,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
