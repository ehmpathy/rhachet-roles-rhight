/**
 * .what = read three opinions end-to-end: AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011), the
 *         rule that makes class waivers enforceable; and two appellate decisions that mark its limit
 *         against TCPA plaintiffs — Knutson v. Sirius XM Radio Inc., 771 F.3d 559 (9th Cir. 2014)
 *         and A.D. v. Credit One Bank, N.A., 885 F.3d 1054 (7th Cir. 2018)
 * .why  = R7 / H9. the vision named class aggregation as the engine of its $20M figure and never
 *         named the standard defeater. but a brief that names only the defeater would be equally
 *         one-sided, and wrong in the direction that costs a reader money: a clause binds those who
 *         agreed to it, and the TCPA plaintiff who never was a customer is the archetypal case. so
 *         the rule and its edge are read together, from the courts, in one pass.
 * .note = the probe set searches for the limit language first ("did not agree", "nonsignatory",
 *         "not bound", "we do not decide"). every authority in this engagement so far has carried a
 *         qualifier that the popular version drops, and twice I have shipped or nearly shipped the
 *         popular version.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'concepcion.us.2011',
      url: 'https://www.courtlistener.com/opinion/2959735/att-mobility-llc-v-concepcion/',
      probes: [
        'We hold',
        'held',
        'Discover Bank',
        'class arbitration',
        'do not decide',
        'unconscionab',
      ],
    },
    {
      slug: 'knutson.ca9.2014',
      url: 'https://www.courtlistener.com/opinion/2750191/erik-knutson-v-sirius-xm-radio-inc/',
      probes: [
        'did not agree',
        'no agreement',
        'mutual assent',
        'Telephone Consumer Protection Act',
        'we reverse',
        'do not decide',
      ],
    },
    {
      slug: 'credit-one.ca7.2018',
      url: 'https://www.courtlistener.com/opinion/4479918/ad-v-credit-one-bank-na/',
      probes: [
        'nonsignatory',
        'not bound',
        'third-party beneficiary',
        'equitable estoppel',
        'we affirm',
        'do not decide',
      ],
    },
  ];

  const out: any[] = [];

  for (const t of targets) {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate((probes: string[]) => {
      const main =
        document.querySelector('#opinion-content') ||
        document.querySelector('.opinion-content') ||
        document.querySelector('article') ||
        document.body;
      const body = (main as HTMLElement).innerText;

      const hits: Record<string, string | null> = {};
      for (const p of probes) {
        const at = body.indexOf(p);
        hits[p] =
          at === -1
            ? null
            : body.slice(Math.max(0, at - 700), at + 1500).replace(/\s+/g, ' ').trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        head: body.slice(0, 1100).replace(/\s+/g, ' ').trim(),
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
