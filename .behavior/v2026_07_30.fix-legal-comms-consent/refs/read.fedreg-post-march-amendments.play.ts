/**
 * .what = for each Federal Register citation that amended 47 C.F.R. § 64.1200 after the March 2024
 *         revocation order, look up the FCC document behind that citation and probe the document for
 *         whether it sets an effective date for the paragraph at (a)(10)
 * .why  = R12-a. the eCFR source credit for § 64.1200 lists four documents later than
 *         "89 FR 15762, Mar. 5, 2024" — 89 FR 17762, 89 FR 87983, 90 FR 13425, 90 FR 42138. one of
 *         them is the candidate that lifted the "delayed indefinitely" status that the order which
 *         adopted the rule had published. a duty stated as live while that conflict stands open
 *         rests on two official publications that disagree.
 * .note = /citation/<vol>-FR-<page> is a disambiguation page, not the document — a snapshot proved
 *         it renders "Multiple documents found" plus a list of anchors, several of them from other
 *         agencies that share the page number. so each citation takes two hops, and only the FCC
 *         entries are followed.
 *         no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const cites = ['89-FR-17762', '89-FR-87983', '90-FR-13425', '90-FR-42138'];

  const out: any[] = [];

  for (const cite of cites) {
    // hop 1 — look up the citation's candidate documents
    await page.goto(`https://www.federalregister.gov/citation/${cite}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await page.waitForLoadState("networkidle", { timeout: 3500 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const candidates = await page.evaluate(() => {
      const found: { title: string; href: string; fcc: boolean }[] = [];
      const items = Array.from(document.querySelectorAll('li'));
      for (const li of items) {
        const a = li.querySelector('a[href*="/documents/20"]');
        if (!a) continue;
        found.push({
          title: (a.textContent || '').replace(/\s+/g, ' ').trim(),
          href: (a as HTMLAnchorElement).href,
          fcc: (li.textContent || '').includes('Federal Communications Commission'),
        });
      }
      // the citation route also 302s straight to a document when only one matches
      if (found.length === 0 && location.pathname.includes('/documents/'))
        found.push({ title: document.title, href: location.href, fcc: true });
      return found;
    });

    const targets = candidates.filter((c: any) => c.fcc);

    for (const t of targets) {
      // hop 2 — read the FCC document itself
      await page.goto(t.href, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForLoadState("networkidle", { timeout: 4500 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

      const captured = await page.evaluate(() => {
        const body = document.body.innerText;
        const summaryAt = body.indexOf('SUMMARY:');
        const datesAt = body.indexOf('DATES:');

        const probes = [
          '64.1200(a)(10)',
          '(a)(10)',
          'delayed indefinitely',
          'amendatory instruction 3',
          'ten business days',
          'revocation',
        ];
        const hits: Record<string, string | null> = {};
        for (const p of probes) {
          const at = body.indexOf(p);
          hits[p] =
            at === -1
              ? null
              : body.slice(Math.max(0, at - 450), at + 750).replace(/\s+/g, ' ').trim();
        }

        return {
          url: location.href,
          bytes: body.length,
          summary:
            summaryAt === -1
              ? null
              : body.slice(summaryAt, summaryAt + 700).replace(/\s+/g, ' ').trim(),
          dates:
            datesAt === -1
              ? null
              : body.slice(datesAt, datesAt + 700).replace(/\s+/g, ' ').trim(),
          probes: hits,
        };
      });

      out.push({ cite, title: t.title, ...captured });
    }

    if (targets.length === 0) out.push({ cite, title: null, noFccCandidate: candidates });
  }

  return { captured: out };
};
