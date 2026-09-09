/**
 * .what = capture Federal Register doc 2024-04587, the companion to 2024-04586, to identify which
 *         of the two is the report and order that created the revocation duty at
 *         47 C.F.R. § 64.1200(a)(10)
 * .why  = 2024-04586 turned out to be a further notice that only *seeks comment* — its probes for
 *         "ten business days" and "any reasonable method" both returned null. to cite a notice as
 *         the source of a duty that binds would be exactly the error a summary invites, so the
 *         companion document is read before either is cited.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the url carries the document's own title and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.federalregister.gov/documents/2024/03/05/2024-04587/strengthening-the-ability-of-consumers-to-stop-robocalls',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;
    const cite = body.match(/\d+\s+FR\s+\d+/);
    const summaryAt = body.indexOf('SUMMARY:');
    const datesAt = body.indexOf('DATES:');

    const probes = ['ten business days', 'any reasonable method', 'revocation of consent'];
    const found: Record<string, string | null> = {};
    for (const p of probes) {
      const at = body.indexOf(p);
      found[p] =
        at === -1
          ? null
          : body.slice(Math.max(0, at - 340), at + 440).replace(/\s+/g, ' ').trim();
    }

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      frCite: cite ? cite[0] : null,
      summary:
        summaryAt === -1
          ? null
          : body.slice(summaryAt, summaryAt + 620).replace(/\s+/g, ' ').trim(),
      dates:
        datesAt === -1
          ? null
          : body.slice(datesAt, datesAt + 300).replace(/\s+/g, ' ').trim(),
      probes: found,
    };
  });
};
