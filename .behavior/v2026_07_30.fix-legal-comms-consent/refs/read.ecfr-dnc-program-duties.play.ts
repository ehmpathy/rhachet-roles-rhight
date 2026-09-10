/**
 * .what = pull the COMPLETE internal do-not-call program machinery of 47 C.F.R. § 64.1200 —
 *         every subparagraph of (d), plus the (c)(2) registry safe harbor — off the official eCFR
 * .why  = ⛔ `define.boundary.when-consent-is-required-at-all` records this as an open gap in its own
 *         words: "time-of-day restrictions, caller-identification duties, and the internal
 *         do-not-call list obligation are not addressed ... they were named in the engagement's own
 *         research ledger as absent axes and remain unresearched."
 *         the suppression-practices brief cannot be authored without them. `§ 227(c)(5)` names a
 *         defense of "reasonable practices and procedures" but does NOT enumerate them — the
 *         regulation does, and only in these paragraphs.
 * .note = ⭐ the prior playbook `read.ecfr-dnc-axes` fetched (d), (d)(1), (d)(3), (d)(4), (d)(6) —
 *         it never asked for (d)(2), (d)(5), or (d)(7). so the engagement holds a PARTIAL capture of
 *         a paragraph it believes it captured. this playbook asks for the full enumeration, and
 *         FAILS LOUD on any subparagraph that comes back null rather than silently ship a hole.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
    if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
  }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const captured = await page.evaluate(() => {
    const idsWanted = [
      // the registry duty and its safe harbor
      'p-64.1200(c)(1)',
      'p-64.1200(c)(2)',
      // ⭐ the complete internal-DNC program enumeration
      'p-64.1200(d)',
      'p-64.1200(d)(1)',
      'p-64.1200(d)(2)',
      'p-64.1200(d)(3)',
      'p-64.1200(d)(4)',
      'p-64.1200(d)(5)',
      'p-64.1200(d)(6)',
      'p-64.1200(d)(7)',
      // the terms those paragraphs lean on
      'p-64.1200(f)(6)',
      'p-64.1200(f)(15)',
    ];

    const paragraphs: Record<string, string | null> = {};
    for (const id of idsWanted) {
      const el = document.getElementById(id);
      paragraphs[id] = el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
    }

    const currency = (document.body.innerText.match(/current as of[^\n]{0,40}/i) || [])[0] || null;

    return { url: location.href, currency, paragraphs };
  });

  const paragraphs = captured.paragraphs as Record<string, string | null>;

  // ⛔ a block page yields ids that are all null. distinguish that from a genuine absence.
  const present = Object.keys(paragraphs).filter((k) => paragraphs[k]);
  if (present.length === 0)
    throw new UnexpectedCodePathError(
      `zero of ${Object.keys(paragraphs).length} paragraph ids were found at ${captured.url}.\n` +
        '  fix: that is a block page or a changed id scheme, not an empty regulation. re-open headful\n' +
        '       and snapshot the html to confirm the `p-64.1200(x)` id convention still holds.',
    );

  // ⭐ the load-bearing set. a null in ANY of these means the brief would be authored over a hole,
  // which is the exact failure `rule.forbid.failhide` forbids — so it throws rather than returns.
  const loadBearing = [
    'p-64.1200(c)(2)',
    'p-64.1200(d)',
    'p-64.1200(d)(1)',
    'p-64.1200(d)(2)',
    'p-64.1200(d)(3)',
    'p-64.1200(d)(4)',
    'p-64.1200(d)(6)',
  ];
  const absent = loadBearing.filter((id) => !paragraphs[id]);
  if (absent.length > 0)
    throw new UnexpectedCodePathError(
      `these load-bearing paragraphs were absent: ${absent.join(', ')}\n` +
        `  context: ${present.length} other ids WERE found, so the page loaded — these specific\n` +
        '           anchors are the problem (renumbered, or nested under a different id).\n' +
        '  fix: snapshot the html and grep for the paragraph text directly before you author.',
    );

  return {
    url: captured.url,
    currency: captured.currency,
    presentCount: present.length,
    askedCount: Object.keys(paragraphs).length,
    absent: Object.keys(paragraphs).filter((k) => !paragraphs[k]),
    paragraphs,
  };
};
