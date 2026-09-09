/**
 * .what = read 9 U.S.C. § 2 (the Federal Arbitration Act's enforceability provision) and
 *         9 U.S.C. § 4 (the order that compels arbitration) end-to-end off the official
 *         House OLRC text
 * .why  = R7. Concepcion holds the FAA preempts a state rule that conditions enforceability on
 *         classwide procedures — but the engine of that rule is § 2's own text, which makes an
 *         arbitration provision valid "save upon such grounds as exist at law or in equity for the
 *         revocation of any contract". that savings clause is exactly where the Knutson /
 *         Credit One limit lives: a contract never formed cannot be revoked, so the clause never
 *         reaches a plaintiff who did not agree. the brief must rest that limit on the statute,
 *         not on my paraphrase of two opinions.
 * .note = the probe set searches for the savings clause first, and for the formation language in
 *         § 4, because the limit is a formation point and the statute states it in those terms.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'faa.9usc2',
      url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title9-section2&num=0&edition=prelim',
      probes: [
        'save upon such grounds',
        'valid, irrevocable',
        'written provision',
      ],
    },
    {
      slug: 'faa.9usc4',
      url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title9-section4&num=0&edition=prelim',
      probes: [
        'making of the agreement',
        'in issue',
        'satisfied that the making',
      ],
    },
  ];

  const out: any[] = [];

  for (const t of targets) {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate((probes: string[]) => {
      const body = document.body.innerText;

      const hits: Record<string, string | null> = {};
      for (const p of probes) {
        const at = body.indexOf(p);
        hits[p] =
          at === -1
            ? null
            : body.slice(Math.max(0, at - 900), at + 1400).replace(/\s+/g, ' ').trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        head: body.slice(0, 2600).replace(/\s+/g, ' ').trim(),
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
