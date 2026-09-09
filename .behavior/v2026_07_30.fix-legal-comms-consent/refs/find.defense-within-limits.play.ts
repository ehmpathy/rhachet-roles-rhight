/**
 * .what = two jobs in one pull: (a) locate a decision that construes a DEFENSE-WITHIN-LIMITS
 *         provision — a policy where defence costs erode the indemnity limit — and (b) RE-PULL the
 *         `Bochenek` cyber-endorsement opinion so its terms are read from source this session rather
 *         than carried from a prior session's summary
 * .why  = the coverage-attainment brief must tell a reader what to ask about a privacy-labelled
 *         product, and "are defence costs inside or outside the limit?" is the question with the
 *         largest dollar consequence on a TCPA claim — where the defence spend on a class action can
 *         rival the indemnity. the engagement holds NO citation for that concept.
 *         the `Bochenek` half exists because `rule.require.bhrowser-citations` treats a source not
 *         read from a capture THIS session as a source asserted from memory. this engagement has
 *         already shipped three wrong URLs written that way.
 * .note = ⭐ facet (a) is deliberately NOT restricted to the TCPA. defence-within-limits is a policy
 *         architecture, not a claim type, and a TCPA-only query would return a narrow null that says
 *         more about the query than about the law — the exact failure the two-query affirmative-cover
 *         survey already committed on this engagement.
 *         ⚠️ the second facet quotes industry TERMS OF ART verbatim ("wasting policy", "burning
 *         limits", "self-consuming"). they are what the documents and the courts call this
 *         architecture; to reword them for style would make the query match no decision that exists.
 *         ⚠️ each facet is graded on its own so a null is attributable. an all-facet zero throws.
 *         ⚠️ the disposition grep spans THREE court levels, because this engagement learned the hard
 *         way that appellate merits verbs miss a certification order and miss a trial-court order on
 *         a motion.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const facets = [
    {
      slug: 'defense-within-limits-general',
      q: '"defense costs" "within the limits" policy erode indemnity insurer',
      asks: 'does a decision construe a policy where defence costs reduce the limit?',
    },
    {
      slug: 'terms-of-art-for-the-architecture',
      q: '"wasting policy" OR "burning limits" OR "self-consuming" defense costs coverage',
      asks: 'is this architecture named and construed under its industry terms of art?',
    },
    {
      slug: 'tcpa-defense-costs',
      q: '"Telephone Consumer Protection Act" "defense costs" insurer coverage limits',
      asks: 'has a court addressed defence costs on a TCPA claim specifically?',
    },
  ];

  const found: {
    slug: string;
    asks: string;
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
      const out2: { title: string; href: string }[] = [];
      for (const a of Array.from(document.querySelectorAll('a[href*="/opinion/"]'))) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        out2.push({ title, href: (a as HTMLAnchorElement).href });
        if (out2.length >= 6) break;
      }
      return out2;
    });

    found.push({
      slug: facet.slug,
      asks: facet.asks,
      total: hits.length,
      verdict:
        hits.length === 0
          ? `NO-DECISION-FOUND for "${facet.asks}" — record as a named null, never as silence`
          : `${hits.length} candidate(s)`,
      hits,
    });
  }

  // (b) the RE-PULL of Bochenek — read from source, not from a prior session's account
  const bochenekUrl =
    'https://www.courtlistener.com/opinion/3003491/doctors-direct-insurance-inc-v-bochenek/';
  await page.goto(bochenekUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
    if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
  }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const raw = await page.evaluate(() => {
    const region =
      document.querySelector('#opinion-content') ||
      document.querySelector('.opinion-content') ||
      document.body;
    return {
      title: (document.title || '').replace(/\s+/g, ' ').trim(),
      text: ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim(),
    };
  });

  const blob = String(raw.text);
  if (blob.length < 3000)
    throw new UnexpectedCodePathError(
      `Bochenek capture was ${blob.length} bytes at ${bochenekUrl}.\n` +
        '  fix: under ~3000 bytes means a stub or an interstitial, not the opinion body.',
    );

  const dispositionHunted =
    /(we (?:affirm|reverse|vacate|remand|hold|conclude|answer)[\s\S]{0,380}|(?:it is (?:so |hereby )?ordered|AFFIRMED|REVERSED|(?:motion|judgment)[^.]{0,80}(?:is|are) (?:hereby )?(?:granted|denied))[\s\S]{0,380})/gi;
  const disposition: string[] = [];
  let d: RegExpExecArray | null;
  while ((d = dispositionHunted.exec(blob)) !== null) {
    disposition.push(d[0]);
    if (disposition.length >= 3) break;
  }

  if (disposition.length === 0)
    throw new UnexpectedCodePathError(
      `re-pulled Bochenek but found NO disposition language in ${blob.length} bytes.\n` +
        "  fix: widen the pattern or snapshot the html — do NOT carry the prior session's account.",
    );

  // the grant terms the brief turns on — what the cyber endorsement was keyed to
  const grantHunted =
    /((?:privacy wrongful act|personal information|cyber|electronic data|Telephone Consumer Protection Act)[\s\S]{0,380})/gi;
  const grant: string[] = [];
  const seen = new Set<number>();
  let g: RegExpExecArray | null;
  while ((g = grantHunted.exec(blob)) !== null) {
    const bucket = Math.floor(g.index / 800);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    grant.push(g[0]);
    if (grant.length >= 6) break;
  }

  const total = found.reduce((s, f) => s + f.total, 0);
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across ALL defence-cost facets — treat as a broken capture, not a proven absence.\n' +
        '  fix: snapshot courtlistener and confirm the a[href*="/opinion/"] selector still matches.',
    );

  return {
    defenseCostFacets: found,
    nullFacets: found.filter((f) => f.total === 0).map((f) => f.slug),
    bochenek: {
      url: bochenekUrl,
      title: raw.title,
      bytes: blob.length,
      disposition,
      grant,
    },
  };
};
