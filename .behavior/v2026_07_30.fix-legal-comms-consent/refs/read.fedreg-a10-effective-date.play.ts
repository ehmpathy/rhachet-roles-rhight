/**
 * .what = read the FCC document of 2024-10-11 that announces an effective date for the revocation
 *         rules, and capture which paragraphs of 47 C.F.R. § 64.1200 it names and from what date
 * .why  = R12-a, the last open item on the revocation duty. 89 FR 15756 published the paragraphs at
 *         (a)(10) and (a)(11) as "delayed indefinitely" until the Commission published a Federal
 *         Register document that announces approval of the information collection and the relevant
 *         effective date. this is a candidate for that document. it does not appear in the eCFR
 *         source credit, which is expected — a document that announces an effective date amends no
 *         text, so it earns no source credit, which is exactly why the credit list could not settle
 *         this and a search was needed.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the url carries the document's own title and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.federalregister.gov/documents/2024/10/11/2024-23605/strengthening-the-ability-of-consumers-to-stop-robocalls',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;

    const summaryAt = body.indexOf('SUMMARY:');
    const datesAt = body.indexOf('DATES:');
    const suppAt = body.indexOf('SUPPLEMENTARY INFORMATION');

    const probes = [
      '(a)(10)',
      '(a)(11)',
      '(a)(9)(i)(F)',
      '(d)(3)',
      'ten business days',
      'April 11, 2025',
      'Office of Management and Budget',
    ];
    const hits: Record<string, string | null> = {};
    for (const p of probes) {
      const at = body.indexOf(p);
      hits[p] =
        at === -1
          ? null
          : body.slice(Math.max(0, at - 600), at + 900).replace(/\s+/g, ' ').trim();
    }

    return {
      url: location.href,
      bytes: body.length,
      summary:
        summaryAt === -1
          ? null
          : body.slice(summaryAt, summaryAt + 800).replace(/\s+/g, ' ').trim(),
      dates:
        datesAt === -1
          ? null
          : body.slice(datesAt, datesAt + 800).replace(/\s+/g, ' ').trim(),
      supplementary:
        suppAt === -1
          ? null
          : body.slice(suppAt, suppAt + 2600).replace(/\s+/g, ' ').trim(),
      probes: hits,
    };
  });
};
