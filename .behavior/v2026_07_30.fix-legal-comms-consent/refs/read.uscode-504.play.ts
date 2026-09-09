/**
 * .what = pull the verbatim text of 47 U.S.C. § 504, the forfeiture-collection provision
 * .why  = D3a's honest gap invokes `§ 504(a)` by name — as the mechanism by which an FCC
 *         forfeiture is collected, and therefore as the reason such forfeitures may rarely be
 *         reviewed on the merits by a court of appeals. that reference shipped uncited.
 *         `rule.require.bhrowser-citations` makes an uncited statutory claim a blocker, so the
 *         section is pulled here off the official House OLRC text.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section504&num=0&edition=prelim',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;
    const at = body.indexOf('Recovery of forfeitures');

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      text:
        at === -1
          ? body.slice(0, 2500).replace(/\s+/g, ' ').trim()
          : body.slice(at, at + 2500).replace(/\s+/g, ' ').trim(),
    };
  });
};
