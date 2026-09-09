/**
 * .what = navigate to the official eCFR text of 47 C.F.R. § 64.1200
 * .why  = the HTTP path returned a 302 to an unblock interstitial, so the
 *         official text was unreachable and a mirror had to be substituted.
 *         per rule.require.bhrowser-citations, the browser is the backbone.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  // the regulation body renders client-side; wait for real statutory text
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const text = await page.evaluate(() => document.body.innerText);

  return {
    url: page.url(),
    title: await page.title(),
    bytes: text.length,
    // the truncation tell: does the page hold the phrases we came for?
    hasPriorExpressWritten: text.includes('prior express written consent'),
    hasRevocation: text.includes('revoke'),
    hasTenBusinessDays: text.includes('ten business days'),
  };
};
