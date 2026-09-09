/**
 * .what = pull the verbatim text of 28 U.S.C. § 1658, the federal catch-all limitations period
 * .why  = R3 / H2. the TCPA states no limitations period of its own, so a claim under it runs on
 *         the general federal statute of limitations. that period sets two numbers the vision left
 *         unquantified: the window in which a claim may be brought, and therefore the floor under
 *         any consent-record retention.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title28-section1658&num=0&edition=prelim',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;
    const at = body.indexOf('Except as otherwise provided by law');

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      text:
        at === -1
          ? null
          : body.slice(at, at + 900).replace(/\s+/g, ' ').trim(),
    };
  });
};
