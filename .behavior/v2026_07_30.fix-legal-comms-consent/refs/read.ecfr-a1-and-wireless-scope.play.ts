/**
 * .what = pull two paragraph families of 47 C.F.R. § 64.1200 that the engagement has never captured:
 *         (a)(1) — the non-telemarketing / emergency call class, and
 *         (e) + the (f) definitions — which decide whether the (c)/(d) do-not-call program duties
 *         reach WIRELESS numbers or stop at residential ones.
 * .why  = ⛔ `floor.redlines` names both as holes in its own honest gap:
 *         "the residential/wireless boundary is unresolved, so every group-D-derived line carries an
 *          unstated scope question: § 64.1200(d) is written to a 'residential telephone subscriber'."
 *         "no line here addresses transactional or non-telemarketing messages. (a)(1)'s own text was
 *          not captured, so that message class has no floor in this file."
 *         a floor with an unresolved scope question under every line in its largest group is not a
 *         floor. these two pulls close both.
 * .note = ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
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
      // ⭐ the non-solicitation class — the message family with no floor today
      'p-64.1200(a)',
      'p-64.1200(a)(1)',
      'p-64.1200(a)(1)(i)',
      'p-64.1200(a)(1)(ii)',
      'p-64.1200(a)(1)(iii)',
      'p-64.1200(a)(1)(iv)',
      'p-64.1200(a)(2)',
      // ⭐ the wireless-scope question for the (c)/(d) program duties
      'p-64.1200(e)',
      'p-64.1200(d)',
      // the definitions those paragraphs turn on
      'p-64.1200(f)(6)',
      'p-64.1200(f)(7)',
      'p-64.1200(f)(8)',
      'p-64.1200(f)(14)',
      'p-64.1200(f)(15)',
      'p-64.1200(f)(16)',
      'p-64.1200(f)(17)',
    ];

    const paragraphs: Record<string, string | null> = {};
    for (const id of idsWanted) {
      const el = document.getElementById(id);
      paragraphs[id] = el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
    }

    const currency = (document.body.innerText.match(/current as of[^\n]{0,40}/i) || [])[0] || null;

    return { url: location.href, title: document.title, currency, paragraphs };
  });

  const paragraphs = captured.paragraphs as Record<string, string | null>;

  // ⛔ a block page yields ids that are all null. distinguish that from a genuine absence.
  const present = Object.keys(paragraphs).filter((k) => paragraphs[k]);
  if (present.length === 0)
    throw new UnexpectedCodePathError(
      `zero of ${Object.keys(paragraphs).length} paragraph ids were found at ${captured.url}.\n` +
        `  title seen: ${captured.title}\n` +
        '  fix: that is a block page or a changed id scheme, not an empty regulation. re-open headful\n' +
        '       and snapshot the html to confirm the `p-64.1200(x)` id convention still holds.',
    );

  // ⭐ the critical set. a null in ANY of these means a gap would be "closed" over a hole.
  const critical = ['p-64.1200(a)(1)', 'p-64.1200(d)', 'p-64.1200(e)'];
  const absent = critical.filter((id) => !paragraphs[id]);
  if (absent.length > 0)
    throw new UnexpectedCodePathError(
      `these critical paragraphs were absent: ${absent.join(', ')}\n` +
        `  context: ${present.length} other ids WERE found, so the page loaded — these specific\n` +
        '           anchors are the problem (renumbered, or nested under a different id).\n' +
        '  fix: snapshot the html and grep for the paragraph text directly before you author.',
    );

  return {
    url: captured.url,
    title: captured.title,
    currency: captured.currency,
    presentCount: present.length,
    askedCount: Object.keys(paragraphs).length,
    absent: Object.keys(paragraphs).filter((k) => !paragraphs[k]),
    paragraphs,
  };
};
