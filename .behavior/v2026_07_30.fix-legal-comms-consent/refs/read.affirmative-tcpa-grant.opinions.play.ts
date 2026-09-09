/**
 * .what = read the four decisions the widened sweep surfaced as the best candidates for a policy
 *         that ANSWERED a TCPA claim rather than excluded it, and capture for each: the policy
 *         language quoted, the coverage terms construed, and — mandatorily — the DISPOSITION
 * .why  = the insurer brief records "what does such a policy actually pay?" as ⬜ unknown. these four
 *         are the only route to an answer that is citable as fact rather than as vendor copy: a
 *         court's account of a real policy that really responded (or really did not).
 * .note = ⭐ the disposition grep is encoded as a THROW, not as a report. an opinion always disposes;
 *         to quote what a court SAID without what it DECIDED is the precise failure that
 *         `rule.require.bhrowser-citations` names a blocker — the argument of the party who LOST
 *         reads exactly like what the court held, once it is lifted out of its paragraph. so a
 *         capture with no disposition language fails here rather than reaches a brief.
 *         ⭐ the reservation grep ("we do not decide" / "we need not reach") is captured for the same
 *         reason: a certified-question answer in particular decides ONE question and expressly
 *         declines the rest, and the declined part is usually what a reader wants.
 *         ⚠️ two of these are the same dispute at two levels — the Ninth Circuit certified a question
 *         and the California Supreme Court answered it. they must be read as a PAIR; either alone
 *         misstates the law.
 *         ⚠️ the term patterns below quote policy terms of art VERBATIM ("advertising injury",
 *         "Recording And Distribution"). they are the words on the form; to reword them for style
 *         would make the pattern match no policy that exists.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'yahoo-cal-2022',
      url: 'https://www.courtlistener.com/opinion/8512158/yahoo-inc-v-nat-union-fire-ins-co-of-pittsburgh-pa/',
      asks: 'did the California Supreme Court hold a CGL personal-injury grant CAN cover a TCPA claim?',
    },
    {
      slug: 'yahoo-9th-2019',
      url: 'https://www.courtlistener.com/opinion/4582011/yahoo-inc-v-national-union-fire-insurance/',
      asks: 'what did the Ninth Circuit certify, and what did it expressly decline to decide?',
    },
    {
      slug: 'illinois-union-2018',
      url: 'https://www.courtlistener.com/opinion/7328511/ill-union-ins-co-v-us-bus-charter-limo-inc/',
      asks: 'did a specialty (non-ISO) policy respond to a TCPA claim, and on what terms?',
    },
    {
      slug: 'rsui-sempris-2014',
      url: 'https://www.courtlistener.com/opinion/2724233/rsui-indemnity-co-v-sempris-llc/',
      asks: 'how did an excess/specialty form treat a TCPA claim against a marketer?',
    },
  ];

  const out: any[] = [];

  for (const target of targets) {
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
      if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
    }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const raw = await page.evaluate(() => {
      const region =
        document.querySelector('#opinion-content') ||
        document.querySelector('.opinion-content') ||
        document.querySelector('#opinion') ||
        document.body;
      return {
        title: (document.title || '').replace(/\s+/g, ' ').trim(),
        text: ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim(),
      };
    });

    const blob = String(raw.text);

    // ⛔ a capture under ~3000 bytes is a paywall or a stub, not an opinion
    if (blob.length < 3000)
      throw new UnexpectedCodePathError(
        `capture for ${target.slug} was ${blob.length} bytes at ${target.url}.\n` +
          '  fix: under ~3000 bytes means a stub or an interstitial, not the opinion body.',
      );

    // ⭐ MANDATORY — the disposition. an opinion always disposes.
    // ⚠️ the first run of this playbook THREW here on `yahoo-9th-2019`, and the throw was correct:
    // the pattern held only merits verbs, and a CERTIFICATION ORDER does not decide the merits —
    // it disposes by certifying a question to a state high court. that is a real disposition and
    // the narrow pattern could not see it. widened per this file's own instruction (widen, never
    // author around it) rather than the throw suppressed.
    // ⚠️ it then THREW a second time, on `illinois-union-2018`, and again correctly: a TRIAL court
    // disposes by an order on a motion ("the motion is GRANTED"), not by an appellate verb at all.
    // three court levels, three disposition vocabularies — the lesson this file exists to record.
    const dispositionHunted =
      /(we (?:affirm|reverse|vacate|remand|hold|conclude|answer|certify|respectfully certify|withdraw|defer)[\s\S]{0,420}|(?:certif(?:y|ied|ication) (?:the following )?question|it is (?:so |hereby )?ordered|AFFIRMED|REVERSED|VACATED|REMANDED|CERTIFIED|(?:motion|judgment)[^.]{0,80}(?:is|are) (?:hereby )?(?:granted|denied|dismissed)|the [Cc]ourt (?:grants|denies|dismisses|enters))[\s\S]{0,420})/gi;
    const disposition: string[] = [];
    let d: RegExpExecArray | null;
    while ((d = dispositionHunted.exec(blob)) !== null) {
      disposition.push(d[0]);
      if (disposition.length >= 4) break;
    }

    if (disposition.length === 0)
      throw new UnexpectedCodePathError(
        `read ${target.slug} at ${target.url} but found NO disposition language.\n` +
          '  context: an opinion always disposes. to quote what a court said without what it decided\n' +
          '           is the exact failure rule.require.bhrowser-citations names a blocker.\n' +
          '  fix: widen the pattern or snapshot the html — do NOT author around it.',
      );

    // ⭐ the reservation — what the court expressly declined
    const reservationHunted =
      /((?:we do not decide|we need not reach|we express no (?:view|opinion)|we leave (?:open|for)|is not (?:at issue|before us))[\s\S]{0,360})/gi;
    const reservation: string[] = [];
    let r: RegExpExecArray | null;
    while ((r = reservationHunted.exec(blob)) !== null) {
      reservation.push(r[0]);
      if (reservation.length >= 4) break;
    }

    // the coverage terms actually construed — verbatim form words, see .note
    const termsHunted =
      /((?:personal (?:and advertising )?injury|advertising injury|right of privacy|oral or written publication|duty to defend|statutory violation|Recording And Distribution)[\s\S]{0,420})/gi;
    const terms: string[] = [];
    const seen = new Set<number>();
    let t: RegExpExecArray | null;
    while ((t = termsHunted.exec(blob)) !== null) {
      const bucket = Math.floor(t.index / 900);
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      terms.push(t[0]);
      if (terms.length >= 7) break;
    }

    out.push({
      slug: target.slug,
      asks: target.asks,
      url: target.url,
      title: raw.title,
      bytes: blob.length,
      dispositionCount: disposition.length,
      disposition,
      reservationCount: reservation.length,
      reservation,
      termsCount: terms.length,
      terms,
    });
  }

  return { read: out.length, out };
};
