/**
 * .what = read the two documents that set the size of a federal government penalty for a TCPA
 *         violation, end-to-end off official publishers:
 *           - 47 U.S.C. § 503(b)  (House OLRC) — the forfeiture statute the TCPA routes to
 *           - 47 C.F.R. § 1.80    (eCFR)       — the inflation-adjusted maxima actually in force
 * .why  = R8 / H1. the wish asked "what are the sizes of penalties?" and the vision answered only
 *         with private statutory damages ($500 per violation). the word "penalties" maps at least
 *         as naturally onto government fines, and R12 located the authority — § 227(b)(4), titled
 *         "Civil forfeiture", cross-refs section 503(b) — without any fetch of the magnitude.
 *         the authority was found; the number was not. this pull gets the number.
 * .note = § 1.80 is where the operative figures live, not § 503(b): the statute sets a base amount
 *         and the Commission adjusts it for inflation by rule, so a quote of the statute alone
 *         would state a stale number as current. that is the same defect shape as the effective-date
 *         trap in R12-a — the obvious document is not the operative one.
 *         probes search the per-violation and the per-day caps separately, because those are
 *         different numbers and are easy to conflate.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'usc.47.503b',
      url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section503&num=0&edition=prelim',
      probes: [
        'shall be liable to the United States for a forfeiture penalty',
        'willfully or repeatedly',
        'not exceed',
        'statute of limitations',
      ],
    },
    {
      slug: 'cfr.47.1.80',
      url: 'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-1/subpart-A/subject-group-ECFR7ff8b7fb03d9c60/section-1.80',
      probes: [
        'section 227(b)',
        'section 227(e)',
        'each violation',
        'any single act',
        'Telephone Consumer Protection',
      ],
    },
  ];

  const out: any[] = [];

  for (const t of targets) {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate((probes: string[]) => {
      const body = document.body.innerText;

      const hits: Record<string, string | null> = {};
      for (const p of probes) {
        const at = body.indexOf(p);
        hits[p] =
          at === -1
            ? null
            : body.slice(Math.max(0, at - 1000), at + 1800).replace(/\s+/g, ' ').trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        head: body.slice(0, 1200).replace(/\s+/g, ' ').trim(),
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
