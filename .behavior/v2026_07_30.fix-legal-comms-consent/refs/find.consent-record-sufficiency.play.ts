/**
 * .what = search CourtListener for decisions that evaluate a real TCPA consent RECORD — screenshots,
 *         database entries, vendor lead certifications, audit logs — and say whether it carried the
 *         sender's burden at summary judgment
 * .why  = ⛔ `hazard.unprovable-consent-record` names this as its OWN LARGEST GAP, verbatim: "no case
 *         law on what satisfies a record was read ... how courts have evaluated real consent records
 *         — screenshots, database rows, vendor attestations, audit logs — is a separate question and
 *         is not answered here."
 *         D10 is an operational runbook. a runbook that says "keep a screenshot" without a court that
 *         has ACCEPTED one is design opinion dressed as a citation. this playbook grounds it.
 * .note = the target document class is a decision on an evidentiary record, not a statute. the
 *         statutory elements are already captured (`read.ecfr-paragraphs`, `goto.ecfr-64-1200`);
 *         what is absent is judicial treatment of the PROOF.
 *         a NIL result is citable and must be reported as a named verdict — it would mean the runbook
 *         rests on the regulation's text alone, which a reader must be told rather than left to infer.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` resolves only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time; MalfunctionError and
 *         ConstraintError are in the .d.ts and throw "is not a constructor".
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const probes = [
    {
      facet: 'burden-at-summary-judgment',
      q: 'TCPA "prior express written consent" "summary judgment" "burden" record evidence authenticate',
    },
    {
      facet: 'screenshot-or-webform-capture',
      q: 'TCPA consent "screenshot" website "terms and conditions" evidence "genuine issue" telephone',
    },
    {
      facet: 'vendor-lead-certification',
      q: 'TCPA "lead generator" consent evidence hearsay business records vendor certification',
    },
    {
      facet: 'per-number-mismatch',
      q: 'TCPA consent "telephone number" reassigned "wrong number" record match evidence',
    },
  ];

  const found: {
    facet: string;
    q: string;
    total: number;
    hits: { title: string; href: string; meta: string }[];
  }[] = [];

  for (const probe of probes) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(probe.q)}&type=o&order_by=score+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch((e: any) => {
      if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
    }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string; meta: string }[] = [];
      const anchors = Array.from(document.querySelectorAll('a[href*="/opinion/"]'));
      for (const a of anchors) {
        const row = a.closest('article') || a.closest('div');
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        out.push({
          title,
          href: (a as HTMLAnchorElement).href,
          meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 300),
        });
        if (out.length >= 6) break;
      }
      return out;
    });

    found.push({ facet: probe.facet, q: probe.q, total: hits.length, hits });
  }

  // ⭐ calibrated by scope, per the pattern in `find.state-safe-harbors`:
  // a per-facet zero is a real result (that facet is unlitigated, or the search terms missed it).
  // a zero across ALL FOUR facets reads as a broken selector, not as proof that no court has ever
  // weighed a TCPA consent record — that claim is implausible on its face.
  const total = found.reduce((sum, f) => sum + f.total, 0);
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across all four facets — treat as a broken capture, not a proven absence.\n' +
        '  fix: snapshot CourtListener and confirm the `a[href*="/opinion/"]` anchors still match.',
    );

  return {
    total,
    perFacet: found.map((f) => ({
      facet: f.facet,
      total: f.total,
      verdict: f.total === 0 ? 'NO-DECISION-FOUND' : 'HITS',
    })),
    found,
  };
};
