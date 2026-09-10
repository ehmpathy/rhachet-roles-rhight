/**
 * .what = read 90 FR 42138 (FCC Order, Aug 29 2025) in full — the order that conforms the FCC's
 *         rules to the Eleventh Circuit decision — and capture exactly when the vacatur bit
 * .why  = ⛔ this document contradicts a claim already shipped in
 *         counselor/briefs/comms/define.what-the-2025-vacatur-did-and-did-not-do.[lesson].md.
 *         that brief argues the vacated amendment "never took effect", reasoned from two dates:
 *         an effective date of 2025-01-27 and an opinion date of 2025-01-24. this order says the
 *         court "issued its mandate on April 30, 2025, which vacated, as of that date" — i.e. the
 *         rule was live for roughly three months. a vacatur bites on the mandate, not the opinion,
 *         and the shipped brief inferred otherwise. the full text is read before the brief is fixed,
 *         so the correction rests on the document rather than on a second inference.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the url carries the document's own title and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.federalregister.gov/documents/2025/08/29/2025-16641/delete-delete-delete-targeting-and-eliminating-unlawful-text-messages-rules-and-regulations',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;

    const probes = [
      'mandate',
      'April 30, 2025',
      'January 27, 2025',
      'vacated',
      'first full paragraph',
      'effective',
      'PART 64',
    ];
    const hits: Record<string, string | null> = {};
    for (const p of probes) {
      const at = body.indexOf(p);
      hits[p] =
        at === -1
          ? null
          : body.slice(Math.max(0, at - 700), at + 1400).replace(/\s+/g, ' ').trim();
    }

    const suppAt = body.indexOf('SUPPLEMENTARY INFORMATION');

    return {
      url: location.href,
      bytes: body.length,
      supplementary:
        suppAt === -1
          ? null
          : body.slice(suppAt, suppAt + 4200).replace(/\s+/g, ' ').trim(),
      probes: hits,
    };
  });
};
