/**
 * .what = pull the verbatim consent + private-right clauses of Fla. Stat. § 501.059 (FTSA)
 *         off the official Florida Senate render, current compilation
 * .why  = the vision quoted this from the /2024/ compilation over HTTP, and the fetch itself
 *         reported the section was "last amended by ch. 2023-150" — so the quoted subsection
 *         may predate a material amendment. the extant counselor briefs cite /2025/.
 *         per rule.require.bhrowser-citations this must come off the real DOM.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the search anchors are verbatim statutory text and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto('https://www.flsenate.gov/Laws/Statutes/2025/501.059', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;

    const atConsent = body.indexOf('automated system for the selection and dialing');
    const atPrivate = body.indexOf('aggrieved by a violation');
    const atHistory = body.lastIndexOf('History.');

    return {
      url: location.href,
      bytes: body.length,
      consentClause:
        atConsent === -1
          ? null
          : body
              .slice(Math.max(0, atConsent - 700), atConsent + 500)
              .replace(/\s+/g, ' ')
              .trim(),
      privateRight:
        atPrivate === -1
          ? null
          : body
              .slice(Math.max(0, atPrivate - 300), atPrivate + 1100)
              .replace(/\s+/g, ' ')
              .trim(),
      history:
        atHistory === -1
          ? null
          : body.slice(atHistory, atHistory + 400).replace(/\s+/g, ' ').trim(),
    };
  });
};
