/**
 * .what = read three more appellate decisions on arbitration in TCPA cases, chosen to complete the
 *         boundary the first three left one-sided:
 *           - Dahdah v. Rocket Mortgage (6th Cir. 2026)  — reversed a denial; arbitration ordered
 *           - Breda v. Cellco Partnership (1st Cir. 2019), 934 F.3d 1 — the recycled-number posture
 *           - Soliman v. Subway Franchisee Advert. Fund Tr. (2d Cir. 2021), 999 F.3d 828 — assent
 *             by text-message enrollment, the exact channel this engagement is about
 * .why  = R7. Concepcion + Knutson + Credit One all cut one way, and a brief on that set alone
 *         would tell a defendant it has no defense, which is false and expensive. Dahdah supplies
 *         the other side of the line from the most current published source available. Breda and
 *         Soliman test the line at the two places a phone campaign actually touches it: a number
 *         that changed hands, and a consumer who enrolled by text.
 * .note = the probe sets search for the disposition verb FIRST ("we reverse" / "we affirm") and for
 *         reservation language, because twice in this engagement a document has turned out to be a
 *         different kind of document than its title implied — a certification order read as a
 *         decision, and a notice read as an order. the disposition is what settles which it is.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'dahdah.ca6.2026',
      url: 'https://www.courtlistener.com/opinion/10779557/michael-dahdah-v-rocket-mortgage-llc/',
      probes: [
        'We reverse',
        'we hold',
        'compel arbitration',
        'assent',
        'do not decide',
      ],
    },
    {
      slug: 'breda.ca1.2019',
      url: 'https://www.courtlistener.com/opinion/4648199/breda-v-cellco-partnership/',
      probes: [
        'we affirm',
        'we reverse',
        'reassigned',
        'did not agree',
        'do not decide',
      ],
    },
    {
      slug: 'soliman.ca2.2021',
      url: 'https://www.courtlistener.com/opinion/4889886/soliman-v-subway-franchisee-advert-fund-tr-ltd/',
      probes: [
        'we affirm',
        'reasonably prudent',
        'inquiry notice',
        'text message',
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
            : body.slice(Math.max(0, at - 800), at + 1600).replace(/\s+/g, ' ').trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        head: body.slice(0, 1400).replace(/\s+/g, ' ').trim(),
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
