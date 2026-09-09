/**
 * .what = re-read `Horn v. Liberty Ins. Underwriters` with a pattern aimed at TWO specific questions
 *         the first read left open: (1) was the barred underlying action a TCPA claim, and (2) what
 *         exactly does the "invasion of privacy" exclusion say
 * .why  = the first read captured a sharp passage — an invasion-of-privacy exclusion that "bars
 *         coverage for the entire action" — and the case surfaced on a query that paired the TCPA
 *         with defence costs. ⛔ BUT the capture never showed the passage that names the underlying
 *         claim. to write "a TCPA claim was barred by a privacy exclusion" on that basis would be an
 *         inference presented as an observation — the precise defect this engagement has already
 *         committed once (a truncation was diagnosed from a phrase's shape and shipped into a
 *         blocker-severity rule before it was checked; the source later disproved it).
 * .note = ⭐ this playbook exists to make a NEGATIVE answer as usable as a positive one. if the
 *         underlying action turns out NOT to be a TCPA claim, that is a result: the case may still be
 *         cited for the exclusion mechanic, but NOT as a TCPA precedent. both outcomes are returned
 *         as named verdicts rather than left for the author to interpret.
 *         ⚠️ "underlying action" is the term of art coverage law uses for the suit a policy is asked
 *         to answer. it is kept because renaming it would break the search path to the doctrine.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const url = 'https://www.courtlistener.com/opinion/7336922/horn-v-liberty-ins-underwriters-inc/';

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
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
      `Horn capture was ${blob.length} bytes at ${url}.\n` +
        '  fix: under ~3000 bytes means a stub or an interstitial, not the opinion body.',
    );

  // (1) is the TCPA actually the claim the policy was asked to answer?
  const tcpaHunted = /([\s\S]{0,260}Telephone Consumer Protection Act[\s\S]{0,300})/gi;
  const tcpa: string[] = [];
  const seenT = new Set<number>();
  let t: RegExpExecArray | null;
  while ((t = tcpaHunted.exec(blob)) !== null) {
    const bucket = Math.floor(t.index / 700);
    if (seenT.has(bucket)) continue;
    seenT.add(bucket);
    tcpa.push(t[0]);
    if (tcpa.length >= 5) break;
  }

  // (2) the exclusion's own terms
  const exclusionHunted =
    /((?:invasion of privacy|Exclusion B\.4|B\.4|right of privacy|oral or written publication)[\s\S]{0,420})/gi;
  const exclusion: string[] = [];
  const seenE = new Set<number>();
  let e: RegExpExecArray | null;
  while ((e = exclusionHunted.exec(blob)) !== null) {
    const bucket = Math.floor(e.index / 800);
    if (seenE.has(bucket)) continue;
    seenE.add(bucket);
    exclusion.push(e[0]);
    if (exclusion.length >= 6) break;
  }

  if (exclusion.length === 0)
    throw new UnexpectedCodePathError(
      `read Horn but found NO exclusion language in ${blob.length} bytes.\n` +
        '  context: the first read captured "the invasion of privacy exclusion in Exclusion B.4",\n' +
        '           so a zero here means the pattern or the capture broke, not that the clause is absent.\n' +
        '  fix: widen the pattern or snapshot the html.',
    );

  return {
    url,
    title: raw.title,
    bytes: blob.length,
    // ⭐ the whole point of this pull — a named verdict either way
    tcpaVerdict:
      tcpa.length === 0
        ? 'NOT-A-TCPA-CASE (as captured) — cite Horn for the exclusion mechanic ONLY, never as TCPA precedent'
        : `TCPA NAMED in ${tcpa.length} passage(s) — read them before any claim about what was barred`,
    tcpaCount: tcpa.length,
    tcpa,
    exclusionCount: exclusion.length,
    exclusion,
  };
};
