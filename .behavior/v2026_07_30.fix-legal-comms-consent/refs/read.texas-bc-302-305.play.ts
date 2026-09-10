/**
 * .what = pull Texas Bus. & Com. Code § 305.053 (the private action on telephone solicitation)
 *         off the official Texas Legislature statutes portal
 * .why  = R4, the state-layer sweep. the vision recorded that this portal is a javascript app
 *         that returns no statutory text to an automated fetch, and that a prior brief in this
 *         repo fell back to public-law mirrors because of it. it is the second worked proof of
 *         rule.require.bhrowser-citations, after eCFR.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto('https://statutes.capitol.texas.gov/Docs/BC/htm/BC.305.htm', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;
    const at = body.indexOf('305.053');

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      hasDamages: body.includes('$500'),
      text:
        at === -1
          ? null
          : body.slice(at, at + 1800).replace(/\s+/g, ' ').trim(),
    };
  });
};
