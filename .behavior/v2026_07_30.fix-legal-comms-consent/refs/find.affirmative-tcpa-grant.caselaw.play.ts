/**
 * .what = a WIDER caselaw sweep for a reported decision that construes an AFFIRMATIVE TCPA grant —
 *         a policy or endorsement that answers a TCPA claim rather than excludes it. six facets,
 *         each graded on its own, so a null is attributable to a facet rather than to the sweep.
 * .why  = the prior survey (`find.affirmative-tcpa-cover.play.ts`) ran only TWO caselaw queries and
 *         returned no citable decision, so the insurer brief still records "what does such a policy
 *         actually pay?" as ⬜ unknown. that is the unanswered half of the wish's fourth question.
 *         two queries is not a search; it is one attempt. this widens the same route before the
 *         engagement is entitled to record a null as a FINDING rather than as a gap.
 * .note = ⭐ a per-facet zero is a NAMED VERDICT, not silence. the brief that consumes this must say
 *         which facet came back empty, because "we did not find X" is only useful next to "here is
 *         what we asked for". an all-six zero is a BROKEN CAPTURE, not a proven absence of the
 *         market — the selectors or the host changed — so that case throws.
 *         ⚠️ the Texas trap: in Texas state courts "TCPA" means the Texas Citizens Participation Act
 *         (anti-SLAPP), NOT the Telephone Consumer Protection Act. every facet therefore spells the
 *         statute out rather than uses the acronym, and the caller must still read each hit.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  // six facets. each asks a DIFFERENT question, so a null on one does not impeach the others.
  const facets = [
    {
      slug: 'duty-to-defend-owed',
      q: '"Telephone Consumer Protection Act" insurer "duty to defend" coverage owed policy',
      asks: 'did any policy owe a defense to a TCPA claim?',
    },
    {
      slug: 'exclusion-held-inapplicable',
      q: '"Telephone Consumer Protection Act" exclusion "does not apply" coverage policy insurer',
      asks: 'has a court held the statutory-violation exclusion did NOT reach a TCPA claim?',
    },
    {
      slug: 'advertising-injury-reached',
      q: '"Telephone Consumer Protection Act" "advertising injury" coverage "right of privacy"',
      asks: 'did Coverage B reach a TCPA claim despite the exclusion?',
    },
    {
      slug: 'endorsement-sublimit',
      q: '"Telephone Consumer Protection Act" endorsement sublimit policy coverage insurer',
      asks: 'is there a decision that quotes an affirmative TCPA endorsement or its sublimit?',
    },
    {
      slug: 'settlement-funded-by-policy',
      q: '"Telephone Consumer Protection Act" class settlement funded insurance proceeds policy limits',
      asks: 'did a policy actually FUND a TCPA class settlement?',
    },
    {
      slug: 'media-liability-reached',
      q: '"Telephone Consumer Protection Act" "media liability" OR "errors and omissions" coverage claim',
      asks: 'has an adjacent specialty product ever answered a TCPA claim?',
    },
  ];

  const found: {
    slug: string;
    asks: string;
    q: string;
    total: number;
    verdict: string;
    hits: { title: string; href: string }[];
  }[] = [];

  for (const facet of facets) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(facet.q)}&type=o&order_by=score+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
      if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
    }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out: { title: string; href: string }[] = [];
      for (const a of Array.from(document.querySelectorAll('a[href*="/opinion/"]'))) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        out.push({ title, href: (a as HTMLAnchorElement).href });
        if (out.length >= 8) break;
      }
      return out;
    });

    found.push({
      slug: facet.slug,
      asks: facet.asks,
      q: facet.q,
      total: hits.length,
      // ⭐ a zero here is a result the brief may cite, not an absence of one
      verdict:
        hits.length === 0
          ? `NO-DECISION-FOUND for "${facet.asks}" — record as a named null, never as silence`
          : `${hits.length} candidate(s) — each still needs a full-opinion read + disposition grep`,
      hits,
    });
  }

  const total = found.reduce((s, f) => s + f.total, 0);

  // ⛔ all six empty means the capture broke, not that the market is absent
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across ALL SIX facets — treat as a broken capture, not a proven absence.\n' +
        '  context: six independently-worded queries do not all come back empty against a live index.\n' +
        '  fix: snapshot courtlistener and confirm the a[href*="/opinion/"] selector still matches.',
    );

  return {
    total,
    nullFacets: found.filter((f) => f.total === 0).map((f) => f.slug),
    found,
  };
};
