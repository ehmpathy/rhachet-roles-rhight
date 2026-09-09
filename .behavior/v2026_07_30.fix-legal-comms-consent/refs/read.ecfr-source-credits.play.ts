/**
 * .what = capture the source-credit / editorial-note block at the foot of 47 C.F.R. § 64.1200 on
 *         eCFR, which lists every Federal Register document that amended the section
 * .why  = R12-a. 89 FR 15756 says the amendment that adds (a)(10) is "delayed indefinitely", yet
 *         eCFR carries (a)(10) as current text. the source credits name each document that amended
 *         the section and its date, so a document later than 89 FR 15756 is the candidate that
 *         lifted the delay. to state the duty as live while that conflict stands open would hide it.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  return await page.evaluate(() => {
    const body = document.body.innerText;

    // every "NN FR NNNNN" citation on the page, in order, deduped
    const cites: string[] = [];
    const re = /\d{2,3}\s+FR\s+\d{3,6}/g;
    let m = re.exec(body);
    while (m !== null) {
      if (!cites.includes(m[0])) cites.push(m[0]);
      m = re.exec(body);
    }

    const probes = [
      'Effective Date Note',
      'effective date',
      'delayed indefinitely',
      'Source:',
      'was amended',
      'Editorial Note',
    ];
    const found: Record<string, string | null> = {};
    for (const p of probes) {
      const at = body.indexOf(p);
      found[p] =
        at === -1
          ? null
          : body.slice(Math.max(0, at - 300), at + 900).replace(/\s+/g, ' ').trim();
    }

    return {
      url: location.href,
      bytes: body.length,
      cites,
      tail: body.slice(-2600).replace(/\s+/g, ' ').trim(),
      probes: found,
    };
  });
};
