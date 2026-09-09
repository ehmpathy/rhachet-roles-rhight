/**
 * .what = pull Indiana's telephone-solicitation article, Ind. Code § 24-4.7, off the official
 *         Indiana General Assembly portal, and report which private-remedy terms it carries
 * .why  = R4, the state-layer sweep. Indiana is one of the five mandated states under
 *         rule.require.five-state-baseline. the sweep records a verbatim cite per cell, or an
 *         explicit "none found" — a state is never simply omitted.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto('https://iga.in.gov/laws/2025/ic/titles/24#24-4.7', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  await page.waitForLoadState("networkidle", { timeout: 7000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      hasArticle: body.includes('24-4.7'),
      hasDoNotCall: body.toLowerCase().includes('do not call'),
      head: body.slice(0, 1500).replace(/\s+/g, ' ').trim(),
    };
  });
};
