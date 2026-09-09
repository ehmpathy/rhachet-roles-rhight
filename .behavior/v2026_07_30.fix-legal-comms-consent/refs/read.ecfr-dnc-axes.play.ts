/**
 * .what = pull the do-not-call machinery of 47 C.F.R. § 64.1200 — paragraphs (c) and (d) —
 *         off the official eCFR
 * .why  = R2. the vision asserted a four-axis decision contract (purpose · dialer · number ·
 *         state) and self-review found that claim unfounded (H6). the axes it omitted —
 *         time-of-day window, internal do-not-call list duty, caller identification, and the
 *         established business relationship exemption — live in these paragraphs.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         ⚠️ a block page yields ids that are all null, which a caller could misread as "the
 *         paragraph is absent from the regulation". so, like `read.ecfr-dnc-program-duties`, this
 *         throws when every asked id is null rather than return a busted capture as a legal absence.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  await page.goto(
    'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200',
    { waitUntil: 'domcontentloaded', timeout: 90000 },
  );

  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const captured = await page.evaluate(() => {
    const idsWanted = [
      'p-64.1200(c)(1)',
      'p-64.1200(c)(2)',
      'p-64.1200(d)',
      'p-64.1200(d)(1)',
      'p-64.1200(d)(3)',
      'p-64.1200(d)(4)',
      'p-64.1200(d)(6)',
      'p-64.1200(f)(6)',
    ];

    const paragraphs: Record<string, string | null> = {};
    for (const id of idsWanted) {
      const el = document.getElementById(id);
      paragraphs[id] = el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
    }

    return { url: location.href, paragraphs };
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

  return { url: captured.url, presentCount: present.length, paragraphs };
};
