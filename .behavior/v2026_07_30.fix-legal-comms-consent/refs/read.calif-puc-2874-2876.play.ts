/**
 * .what = read Cal. Pub. Util. Code §§ 2873–2876 — the consent, penalty, and remedy sections that
 *         sit under § 2872 — off the official California Legislative Information portal
 * .why  = R4, the state-layer sweep. § 2872 gave California's prohibition and its time window;
 *         the sweep also needs the consent term and the teeth, so the California cell can carry a
 *         verbatim cite on both dimensions rather than a partial one.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const sections = ['2873', '2874', '2875', '2876'];
  const out: Record<string, string | null> = {};

  for (const sec of sections) {
    await page.goto(
      `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=${sec}`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState("networkidle", { timeout: 3500 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const text = await page.evaluate((marker: string) => {
      const body = document.body.innerText;
      const at = body.indexOf(marker + '.');
      return at === -1
        ? null
        : body.slice(at, at + 1600).replace(/\s+/g, ' ').trim();
    }, sec);

    out[sec] = text;
  }

  return { url: page.url(), sections: out };
};
