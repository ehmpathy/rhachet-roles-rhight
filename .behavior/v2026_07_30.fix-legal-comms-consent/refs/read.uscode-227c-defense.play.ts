/**
 * .what = re-pull `47 U.S.C. § 227(c)` off the official House OLRC text and capture (1) the private
 *         right of action in (c)(5), (2) the affirmative-defense sentence that closes it, and
 *         (3) the neighbouring (c) subsections that say what the regulations are FOR
 * .why  = the suppression-practices brief turns entirely on the (c)(5) defense. that sentence was
 *         missed on this engagement's first pass — a fetch-based read returned the damages clause and
 *         dropped the defense that follows it — and was recovered only on a re-pull off the source.
 *         so it is re-pulled again here rather than carried over from a shipped brief.
 * .note = ⭐ this is a deliberate RE-PULL of text the engagement believes it already has. the rule in
 *         force is that a source not read from the capture THIS session is a source asserted from
 *         memory, and this engagement has already shipped three wrong URLs written that way.
 *         ⚠️ the OLRC page is one long document; paragraph anchors are unreliable, so this captures
 *         the whole body and windows around the terms rather than a trust of an id scheme.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const url =
    'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim';

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
    if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
  }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const raw = await page.evaluate(() => {
    const region = document.querySelector('.section') || document.body;
    return {
      title: (document.title || '').replace(/\s+/g, ' ').trim(),
      text: ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim(),
    };
  });

  const blob = String(raw.text);

  // ⛔ a capture under ~2000 bytes is a block page, not the statute
  if (blob.length < 2000)
    throw new UnexpectedCodePathError(
      `capture was ${blob.length} bytes at ${url}.\n` +
        '  fix: under ~2000 bytes means a block/interstitial page, not the statute. re-open headful.',
    );

  // ⭐ the defense sentence is the whole point of this pull — assert it is PRESENT rather than
  // report a window that may have missed it. a silent miss here is what happened the first time.
  const defenseHunted =
    /affirmative defense[\s\S]{0,600}?reasonable practices and procedures[\s\S]{0,200}?\./i;
  const defenseMatched = blob.match(defenseHunted);
  if (!defenseMatched)
    throw new UnexpectedCodePathError(
      `the § 227(c)(5) affirmative-defense sentence was NOT found in a ${blob.length}-byte capture.\n` +
        '  context: this exact sentence was dropped once already by a summarizer on this engagement.\n' +
        '  fix: the statute has it. widen the pattern or snapshot the html — do NOT author around it.',
    );

  // the private right of action and its threshold
  const rightHunted = /more than one telephone call within any 12-month period[\s\S]{0,900}/i;
  const rightMatched = blob.match(rightHunted);

  // what the (c) regulations are directed at, for scope
  const scopeHunted =
    /(single national database|do-not-call|telephone solicitation|residential telephone subscriber)/gi;
  const scope: string[] = [];
  const seen = new Set<number>();
  let m: RegExpExecArray | null;
  while ((m = scopeHunted.exec(blob)) !== null) {
    const bucket = Math.floor(m.index / 1100);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    scope.push(blob.slice(Math.max(0, m.index - 300), m.index + 420));
    if (scope.length >= 8) break;
  }

  return {
    url,
    title: raw.title,
    bytes: blob.length,
    defense: defenseMatched[0],
    right: rightMatched ? rightMatched[0] : null,
    scopeCount: scope.length,
    scope,
  };
};
