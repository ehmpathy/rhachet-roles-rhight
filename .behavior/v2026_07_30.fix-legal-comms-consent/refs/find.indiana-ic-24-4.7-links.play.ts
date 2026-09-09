/**
 * .what = read the real hrefs for Ind. Code art. 24-4.7 off the official title index
 * .why  = R4. a guessed chapter url returned 404, and a first anchor scan matched zero — the
 *         portal is a javascript app whose links settle late. rather than guess a url shape,
 *         wait for the app and harvest the anchors it publishes.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto('https://iga.in.gov/laws/2025/ic/titles/24', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });

  await page.waitForLoadState("networkidle", { timeout: 9000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const sample: string[] = [];
    const hits: { text: string; href: string }[] = [];

    for (const a of anchors) {
      const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
      const href = (a as HTMLAnchorElement).getAttribute('href') || '';
      if (sample.length < 12 && href.includes('/laws/')) sample.push(href);
      if (href.includes('4.7') || text.startsWith('Article 4.7') || text.startsWith('Chapter 5'))
        hits.push({ text, href });
    }

    return {
      url: location.href,
      anchorCount: anchors.length,
      sample,
      hitCount: hits.length,
      hits: hits.slice(0, 20),
    };
  });
};
