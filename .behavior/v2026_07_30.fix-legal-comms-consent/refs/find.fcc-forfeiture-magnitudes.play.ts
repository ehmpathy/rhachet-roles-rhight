/**
 * .what = locate decisions that carry a REAL FCC forfeiture AMOUNT for a telephone/robocall
 *         violation, and — separately — any decision that construes the phrase
 *         "single act or failure to act", the term on which `47 C.F.R. § 1.80`'s $188,491 cap turns
 * .why  = `ref.tcpa-exposure-tracks` names this as its own largest gap: the per-unit ($25,132) and
 *         cap ($188,491) figures are captured from the rules, but what the Commission ACTUALLY
 *         imposes is unverified. the brief also says where to aim, and that instruction is followed
 *         literally here: `47 U.S.C. § 504(a)` routes collection to "a civil suit in the name of the
 *         United States" that "shall be a trial de novo", so the magnitudes live in DISTRICT-court
 *         collection suits, not in courts-of-appeals merits opinions. a prior pass searched appellate
 *         review and returned near-zero — which the collection route predicts.
 * .note = ⭐ the second half of this sweep is the more valuable half. an amount alone tells you what
 *         one respondent paid; a construction of "single act or failure to act" tells you whether
 *         the cap is a real limit or a formality, which is the question the brief flags as ⛔ open.
 *         ⚠️ six facets, not two. this engagement already proved a two-query null untrustworthy — a
 *         later six-facet sweep on the same subject found four decisions the narrow pass missed.
 *         ⚠️ per-facet named verdicts. a null must be attributable to a specific query, never to
 *         "the sweep", or a reader cannot tell which question came back empty.
 *         ⚠️ failures are CAPTURED per facet, never thrown — one bad response must not destroy the
 *         other captures. a throw fires only if EVERY facet returns zero, which reads as a broken
 *         capture rather than a legal result.
 *         ⚠️ the query strings quote statutory language and terms of art ("continuing violation",
 *         "spoofing"); to reword them is to search for a phrase no document contains.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const facets = [
    {
      slug: 'collection-suit-504',
      // the route § 504(a) actually prescribes — a civil suit, tried de novo, in a district court
      q: '"recovery of a forfeiture" "Federal Communications Commission" telephone "trial de novo"',
    },
    {
      slug: 'single-act-construction',
      // ⭐ the phrase the $188,491 cap turns on. a construction of it resolves the brief's ⛔ item
      q: '"single act or failure to act" forfeiture "Communications Act"',
    },
    {
      slug: 'forfeiture-order-amount',
      q: '"forfeiture order" "Telephone Consumer Protection Act" Commission penalty amount',
    },
    {
      slug: 'notice-apparent-liability',
      q: '"notice of apparent liability" robocall forfeiture spoofing',
    },
    {
      slug: 'per-day-count',
      // whether the agency counts per call or per day is the same question in other clothes
      q: 'forfeiture "per day" "continuing violation" "Communications Act" section 503',
    },
    {
      slug: 'us-v-collection-telephone',
      q: '"United States" collect forfeiture "47 U.S.C." 504 telephone consumer',
    },
  ];

  const out: any[] = [];

  for (const facet of facets) {
    let hits: { title: string; href: string; meta: string }[] = [];
    let failure: string | null = null;

    try {
      await page.goto(
        `https://www.courtlistener.com/?q=${encodeURIComponent(facet.q)}&type=o&order_by=score+desc`,
        { waitUntil: 'domcontentloaded', timeout: 90000 },
      );
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
        if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
      }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

      hits = await page.evaluate(() => {
        const acc: { title: string; href: string; meta: string }[] = [];
        for (const a of Array.from(document.querySelectorAll('a[href*="/opinion/"]'))) {
          const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
          if (!title || title === 'Search Case Law') continue;
          const row = a.closest('article') || a.closest('div');
          acc.push({
            title,
            href: (a as HTMLAnchorElement).href,
            meta: ((row && row.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 300),
          });
          if (acc.length >= 8) break;
        }
        return acc;
      });
    } catch (e: any) {
      failure = String(e?.message || e).slice(0, 260);
    }

    out.push({
      slug: facet.slug,
      q: facet.q,
      count: hits.length,
      failure,
      // ⭐ a named verdict per facet — a blank cell is never acceptable
      verdict: failure
        ? `FETCH-FAILED — ${failure}`
        : hits.length === 0
          ? `NO-DECISION-FOUND for facet "${facet.slug}" — record as an explicit null attributable to THIS query, never to "the sweep"`
          : `${hits.length} candidate decision(s)`,
      hits,
    });
  }

  const total = out.reduce((sum, o) => sum + o.count, 0);
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across all six facets — treat as a broken capture, not a proven absence.\n' +
        '  context: six independent phrasings that all come back empty is far more likely a\n' +
        '           selector or host problem than six true nulls.\n' +
        '  fix: snapshot CourtListener and confirm the opinion anchors still match; re-run.',
    );

  return {
    total,
    perFacet: out.map((o) => ({ slug: o.slug, count: o.count, verdict: o.verdict })),
    out,
  };
};
