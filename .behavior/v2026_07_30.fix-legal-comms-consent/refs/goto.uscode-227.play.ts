/**
 * .what = navigate to the official House OLRC text of 47 U.S.C. § 227 and report reachability
 * .why  = the vision quoted § 227(b)(3) and § 227(c)(5) from Cornell LII, and the (c)(5)
 *         quote came back as "up to $500 in damages for each such violation, whichever is
 *         greater" — which does not parse standalone, the tell that the clause around it
 *         was cut. per rule.require.bhrowser-citations, a truncated quote must be re-pulled
 *         off the real DOM before it can ship.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const text = await page.evaluate(() => document.body.innerText);

  return {
    url: page.url(),
    title: await page.title(),
    bytes: text.length,
    // the tells: does the page hold the two damages clauses we came for?
    hasPrivateRight: text.includes('$500 in damages for each such violation'),
    hasTreble: text.includes('3 times the amount'),
    hasDncThreshold: text.includes('more than one telephone call'),
  };
};
