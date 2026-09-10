/**
 * .what = read the two decisions that best answer "are defence costs inside or outside the limit?" —
 *         one on a TCPA claim specifically, one on the architecture generally — and capture the
 *         policy language, the erosion mechanic, and the DISPOSITION
 * .why  = the coverage-attainment brief tells a reader which questions to put to a carrier. the
 *         defence-cost question is the one with the largest dollar consequence on a TCPA class claim,
 *         because a per-message statute produces a defence spend that can rival the indemnity — and
 *         the engagement held no citation for the concept at all.
 * .note = ⭐ `Horn` is the priority target: it is the only hit in the sweep that pairs the TCPA with
 *         defence costs. `Southern Healthcare` is read alongside it because a single case on a policy
 *         ARCHITECTURE risks over-reading one policy's terms as the general rule.
 *         ⚠️ the erosion pattern quotes industry TERMS OF ART verbatim ("self-consuming", "wasting").
 *         they are what the documents and the courts call this architecture; to reword them for style
 *         would make the pattern match no opinion that exists.
 *         ⚠️ the disposition grep spans three court levels — appellate merits verbs alone missed a
 *         certification order and a trial-court order on a motion earlier in this engagement.
 *         ⚠️ a per-target zero on the erosion terms is REPORTED, never silently dropped: if a case
 *         turns out not to construe erosion at all, the brief must not cite it as though it did.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'horn-2019-tcpa-defense-costs',
      url: 'https://www.courtlistener.com/opinion/7336922/horn-v-liberty-ins-underwriters-inc/',
      asks: 'how were defence costs treated on a TCPA claim?',
    },
    {
      slug: 'southern-healthcare-2013-architecture',
      url: 'https://www.courtlistener.com/opinion/5105115/southern-healthcare-services-inc-v-lloyds-of-london/',
      asks: 'how does a court describe a policy where defence costs reduce the limit?',
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
        document.body;
      return {
        title: (document.title || '').replace(/\s+/g, ' ').trim(),
        text: ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim(),
      };
    });

    const blob = String(raw.text);
    if (blob.length < 3000)
      throw new UnexpectedCodePathError(
        `capture for ${target.slug} was ${blob.length} bytes at ${target.url}.\n` +
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
        `read ${target.slug} at ${target.url} but found NO disposition language.\n` +
          '  fix: widen the pattern or snapshot the html — do NOT author around it.',
      );

    const reservationHunted =
      /((?:we do not decide|we need not reach|we express no (?:view|opinion)|is not (?:at issue|before us))[\s\S]{0,320})/gi;
    const reservation: string[] = [];
    let r: RegExpExecArray | null;
    while ((r = reservationHunted.exec(blob)) !== null) {
      reservation.push(r[0]);
      if (reservation.length >= 3) break;
    }

    // the erosion mechanic — how defence spend interacts with the limit. terms of art, see .note
    const erosionHunted =
      /((?:defense costs|defence costs|costs of defense|reduce the limit|within the limit|erode|in addition to the limit|Claims Expenses|self-consuming|wasting)[\s\S]{0,400})/gi;
    const erosion: string[] = [];
    const seen = new Set<number>();
    let e: RegExpExecArray | null;
    while ((e = erosionHunted.exec(blob)) !== null) {
      const bucket = Math.floor(e.index / 900);
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      erosion.push(e[0]);
      if (erosion.length >= 7) break;
    }

    out.push({
      slug: target.slug,
      asks: target.asks,
      url: target.url,
      title: raw.title,
      bytes: blob.length,
      disposition,
      reservationCount: reservation.length,
      reservation,
      erosionCount: erosion.length,
      // ⚠️ a zero here is REPORTED, so the brief cannot cite this case for a point it never made
      erosionVerdict:
        erosion.length === 0
          ? 'NO-EROSION-LANGUAGE — this case does NOT construe defence-cost erosion; do not cite it for that'
          : `${erosion.length} passage(s) touch the erosion mechanic`,
      erosion,
    });
  }

  return { read: out.length, out };
};
