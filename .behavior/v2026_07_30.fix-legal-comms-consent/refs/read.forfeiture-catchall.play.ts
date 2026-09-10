/**
 * .what = capture (a) the CATCH-ALL forfeiture paragraph of 47 C.F.R. § 1.80(b) — the one that
 *         governs a violator who is not a broadcaster, cable operator, common carrier, or
 *         manufacturer — and (b) 47 U.S.C. § 227(b)(4) in full, the TCPA's own "Civil forfeiture"
 *         subsection, plus the limitations provision in § 503(b)(6)
 * .why  = R8. the prior pull captured § 1.80(b)(1)-(7) and found paragraphs for § 227(e) (spoofed
 *         caller id) and § 227(b)(4)(B) — but the probe for "Telephone Consumer Protection"
 *         returned NULL, so the paragraph that governs an ordinary § 227(b) robocall by a
 *         non-carrier was never captured. to state a forfeiture figure without it would be a guess
 *         about which paragraph applies, dressed as a citation — and the figures differ by more
 *         than an order of magnitude across paragraphs ($14,432 vs $251,322 vs $2,453,218).
 * .note = the statute's own numbers are STALE by design: § 503(b)(2)(D) still reads "$10,000",
 *         while § 1.80(b) carries the inflation-adjusted figures actually in force. this is the same
 *         shape as the R12-a effective-date trap — the obvious document is not the operative one —
 *         so the figure must come from § 1.80, and the statute is cited only for the framework.
 *         the limitations probe is included because a forfeiture is time-barred separately from a
 *         private claim, and that bar bounds any exposure estimate.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'cfr.47.1.80.catchall',
      url: 'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-1/subpart-A/subject-group-ECFRe23796df9028e47/section-1.80',
      probes: [
        'In any case not covered',
        'not covered in paragraph',
        'Forfeiture penalty in any other case',
        'Statutory amount',
        'inflation',
      ],
    },
    {
      slug: 'usc.47.227b4',
      url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim',
      probes: [
        'Civil forfeiture',
        'section 503(b)',
        'Any person that is determined',
        'notice of apparent liability',
      ],
    },
    {
      slug: 'usc.47.503b.limitations',
      url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section503&num=0&edition=prelim',
      probes: [
        'No forfeiture penalty shall be determined',
        'more than 1 year',
        'more than 4 years',
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
            : body.slice(Math.max(0, at - 1100), at + 2000).replace(/\s+/g, ' ').trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
