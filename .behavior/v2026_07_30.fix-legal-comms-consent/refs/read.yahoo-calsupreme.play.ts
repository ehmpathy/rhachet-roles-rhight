/**
 * .what = read Yahoo Inc. v. National Union Fire Ins. Co. of Pittsburgh, PA, No. S253593
 *         (Cal. Nov. 17, 2022) — the California Supreme Court's answer to the question the Ninth
 *         Circuit certified in 913 F.3d 923 — and capture its answer and its stated limits
 * .why  = R10 / D6, the authority that decides whether a CGL coverage grant can reach a TCPA claim
 *         under California law. the 9th Circuit order only posed the question; this is the answer,
 *         and a coverage brief that cited the question as if it were the answer would be wrong in
 *         the same way the two prior misreads in this engagement were wrong.
 * .note = the probe set deliberately carries limit language ("we do not decide", "need not",
 *         "express no view", "remand") alongside the language that states what was decided. every
 *         authority read in this engagement so far has carried a reservation that the popular
 *         summary drops, so the reservation is searched for first rather than after.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.courtlistener.com/opinion/8512158/yahoo-inc-v-nat-union-fire-ins-co-of-pittsburgh-pa/',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 7000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const main =
      document.querySelector('#opinion-content') ||
      document.querySelector('.opinion-content') ||
      document.querySelector('article') ||
      document.body;
    const body = (main as HTMLElement).innerText;

    const probes = [
      'we conclude',
      'We conclude',
      'do not decide',
      'need not',
      'express no view',
      'seclusion',
      'coverage clause',
      'DISPOSITION',
      'answer the certified question',
      'text message',
    ];
    const hits: Record<string, string | null> = {};
    for (const p of probes) {
      const at = body.indexOf(p);
      hits[p] =
        at === -1
          ? null
          : body.slice(Math.max(0, at - 800), at + 1600).replace(/\s+/g, ' ').trim();
    }

    return {
      url: location.href,
      title: document.title,
      bytes: body.length,
      head: body.slice(0, 2400).replace(/\s+/g, ' ').trim(),
      tail: body.slice(-2400).replace(/\s+/g, ' ').trim(),
      probes: hits,
    };
  });
};
