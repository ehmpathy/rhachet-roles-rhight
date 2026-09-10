/**
 * .what = reach Ind. Code § 24-4.7-5-2 through the Indiana General Assembly portal's own
 *         "Code Search" box, rather than through a constructed url
 * .why  = R4. the tree route renders no section body (proved by a dom snapshot where `Sec. 2.`
 *         matched zero times) and a constructed chapter path returns 404. per
 *         rule.require.solve-at-cause, the fix is to use the navigation the portal itself
 *         publishes instead of a fifth guess at its url shape.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto('https://iga.in.gov/laws/2025/ic/titles/24', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  // the portal exposes a "Code Search" autocomplete; a full citation returns 0 options,
  // so probe the term forms it does accept and report which one yields options
  const box = page.locator('input[type="text"], input[type="search"]').first();
  const probes = ['IC 24-4.7-5-2', '24-4.7', 'telephone solicitation'];
  const probed: { term: string; readout: string }[] = [];

  for (const term of probes) {
    await box.fill('', { timeout: 30000 });
    await box.fill(term, { timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 3500 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const readout = await page.evaluate(() => {
      const body = document.body.innerText;
      const at = body.indexOf('results available for search term');
      return at === -1
        ? 'no readout'
        : body.slice(Math.max(0, at - 40), at + 260).replace(/\s+/g, ' ').trim();
    });

    probed.push({ term, readout });
  }

  await page.waitForLoadState("networkidle", { timeout: 2000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;
    const at = body.indexOf('24-4.7-5-2');
    const anchors = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => (a as HTMLAnchorElement).getAttribute('href') || '')
      .filter((h) => h.includes('4.7'))
      .slice(0, 10);

    return {
      url: location.href,
      bytes: body.length,
      candidateHrefs: anchors,
      around:
        at === -1
          ? body.slice(0, 600).replace(/\s+/g, ' ').trim()
          : body.slice(Math.max(0, at - 200), at + 1800).replace(/\s+/g, ' ').trim(),
    };
  }).then((r: any) => ({ ...r, probed }));
};
