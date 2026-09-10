/**
 * .what = read N.Y. Gen. Bus. Law § 399-p (automatic dialing-announcing devices) and § 399-z
 *         (telemarketing / do-not-call) off the official New York Senate portal
 * .why  = R4, the state-layer sweep. New York is one of the five mandated states under
 *         rule.require.five-state-baseline. the sweep needs the prohibition, the consent term,
 *         and the teeth, so both sections are read.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the statutory terms of art above cannot be reworded without loss of the search path.
 */
export const action = async ({ page }: { page: any }) => {
  const sections = ['399-P', '399-Z'];
  const out: Record<string, { bytes: number; text: string | null }> = {};

  for (const sec of sections) {
    await page.goto(`https://www.nysenate.gov/legislation/laws/GBS/${sec}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await page.waitForLoadState("networkidle", { timeout: 4500 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate(() => {
      const body = document.body.innerText;
      const at = body.indexOf('§');
      return {
        bytes: body.length,
        text:
          at === -1
            ? body.slice(0, 2600).replace(/\s+/g, ' ').trim()
            : body.slice(at, at + 3200).replace(/\s+/g, ' ').trim(),
      };
    });

    out[sec] = captured;
  }

  return { url: page.url(), sections: out };
};
