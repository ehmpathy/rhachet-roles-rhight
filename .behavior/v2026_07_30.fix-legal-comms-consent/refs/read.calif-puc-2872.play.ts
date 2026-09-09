/**
 * .what = read California's automatic-dialing statute, Cal. Pub. Util. Code § 2872, off the
 *         official California Legislative Information portal
 * .why  = R4, the state-layer sweep. California is one of the five mandated states under
 *         rule.require.five-state-baseline. its phone-solicitation regime sits in the Public
 *         Utilities Code rather than a single mini-TCPA, so the cell must be read, not assumed.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         "automatic dialing-announcing device" is the statute's own term and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2872',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;
    const at = body.indexOf('2872.');

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      hasConsent: body.toLowerCase().includes('consent'),
      text:
        at === -1
          ? body.slice(0, 2000).replace(/\s+/g, ' ').trim()
          : body.slice(at, at + 2600).replace(/\s+/g, ' ').trim(),
    };
  });
};
