/**
 * .what = read two coverage opinions end-to-end and capture what each held about whether a CGL
 *         policy answers a TCPA claim — Bullseye Rest. v. James River Ins. Co., 387 F. Supp. 3d 273
 *         (E.D.N.Y. 2019), which applies the exclusion by its title, and Yahoo! Inc. v. National
 *         Union Fire Ins., 913 F.3d 923 (9th Cir. 2019), which reaches the coverage grant
 * .why  = R10 / D6. the vision established that the ISO form excludes the TCPA by name, and stopped
 *         there — which is a claim about what a document says, not about what courts do with it.
 *         a coverage brief needs at least one decision that applies the exclusion and one that
 *         examines the coverage grant, or it advises from a form in a vacuum.
 * .note = the opinion body is captured whole, then probed. the probe set carries the reservation
 *         phrases ("we do not decide", "need not reach", "certify") deliberately: the two prior
 *         authorities in this engagement (IMC footnote 1, Duguid footnotes 2 and 8) were both
 *         popularly misread on exactly the language a targeted probe would have skipped.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'bullseye.edny.2019',
      url: 'https://www.courtlistener.com/opinion/7336509/bullseye-rest-inc-v-james-river-ins-co/',
      probes: [
        'RECORDING AND DISTRIBUTION',
        'Telephone Consumer Protection Act',
        'duty to defend',
        'we do not decide',
        'need not reach',
        'unambiguous',
      ],
    },
    {
      slug: 'yahoo.ca9.2019',
      url: 'https://www.courtlistener.com/opinion/4582011/yahoo-inc-v-national-union-fire-insurance/',
      probes: [
        'certify',
        'Telephone Consumer Protection Act',
        'right of privacy',
        'we do not decide',
        'need not reach',
        'Supreme Court of California',
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
        head: body.slice(0, 1200).replace(/\s+/g, ' ').trim(),
        tail: body.slice(-2200).replace(/\s+/g, ' ').trim(),
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
