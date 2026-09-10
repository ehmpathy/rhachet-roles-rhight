/**
 * .what = read the nine decisions the magnitude sweep located, and pull from each: the DISPOSITION,
 *         every dollar figure, any construction of "single act or failure to act", and any passage
 *         on whether a forfeiture is counted per call, per day, or per campaign
 * .why  = `ref.tcpa-exposure-tracks` states the $25,132 unit and the $188,491 cap from the rules and
 *         says plainly that what the Commission ACTUALLY imposes is unverified. amounts are the point
 *         of this pass — but the disposition is the gate, because a vacated forfeiture order is not
 *         evidence of what the agency can collect, it is evidence of the opposite.
 * .note = ⛔ the disposition grep is a THROW, not a mere warn. this engagement has already been burned
 *         twice by a quote whose logic pointed one way and whose disposition pointed the other.
 *         the pattern below covers THREE court-level vocabularies, because they dispose differently:
 *         an appellate court affirms/reverses/vacates/remands; a certification order disposes by
 *         CERTIFYING a question; a district court disposes by ORDER on a motion. a pattern built for
 *         one level silently passes the other two.
 *         ⭐ the two 5th-Cir entries share docket 24-60223 with different dates — they are read as
 *         separate targets on purpose. a later opinion can supersede and change a disposition, and to
 *         assume the two are one document is exactly the recall-over-capture error this rule exists
 *         to prevent.
 *         ⚠️ "continuing violation" and "single act or failure to act" are statutory terms of art;
 *         to reword them is to search for a phrase no document contains.
 *         ⚠️ failures are captured per target, never thrown.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'att-5th-apr2025',
      cite: 'AT&T v. FCC, 135 F.4th 230 (5th Cir. Apr. 17, 2025)',
      url: 'https://www.courtlistener.com/opinion/10380754/att-v-fcc/',
    },
    {
      slug: 'att-5th-aug2025',
      cite: 'AT&T v. FCC (5th Cir. Aug. 22, 2025) — same docket 24-60223',
      url: 'https://www.courtlistener.com/opinion/10658934/att-v-fcc/',
    },
    {
      slug: 'verizon-2d-2025',
      cite: "Verizon Commc'ns Inc. v. FCC (2d Cir. Sept. 10, 2025)",
      url: 'https://www.courtlistener.com/opinion/10669161/verizon-commcns-inc-v-fed-commcns-commn/',
    },
    {
      slug: 'sprint-dc-2025',
      cite: 'Sprint Corp. v. FCC (D.C. Cir. Aug. 15, 2025)',
      url: 'https://www.courtlistener.com/opinion/10654759/sprint-corporation-v-fcc/',
    },
    {
      slug: 'gray-11th-2025',
      cite: 'Gray Television, Inc. v. FCC, 130 F.4th 1201 (11th Cir. 2025)',
      url: 'https://www.courtlistener.com/opinion/10352035/gray-television-inc-v-federal-communications-commission/',
    },
    {
      slug: 'us-v-neely-2009',
      cite: 'United States v. Neely, 595 F. Supp. 2d 662 (D.S.C. 2009)',
      url: 'https://www.courtlistener.com/opinion/2517119/united-states-v-neely/',
    },
    {
      slug: 'us-v-travelcenters-2007',
      cite: 'United States v. TravelCenters of America, 597 F. Supp. 2d 1222 (D. Or. 2007)',
      url: 'https://www.courtlistener.com/opinion/2447523/united-states-v-travelcenters-of-america/',
    },
    {
      slug: 'us-v-unipoint-2016',
      cite: 'United States v. Unipoint Techs., Inc., 159 F. Supp. 3d 262 (D. Mass. 2016)',
      url: 'https://www.courtlistener.com/opinion/7318108/united-states-v-unipoint-technologies-inc/',
    },
    {
      slug: 'us-v-worldwide-2016',
      cite: 'United States v. Worldwide Indus. Enters., Inc., 220 F. Supp. 3d 335 (E.D.N.Y. 2016)',
      url: 'https://www.courtlistener.com/opinion/7322857/united-states-v-worldwide-industrial-enterprises-inc/',
    },
  ];

  // ⛔ three court-level vocabularies in one pattern — see .note
  const dispositionHunted =
    /(we (?:affirm|reverse|vacate|remand|hold|conclude|answer|grant|deny|certify)[\s\S]{0,420}|(?:it is (?:so |hereby )?ordered|AFFIRMED|REVERSED|VACATED|REMANDED|GRANTED|DENIED|petition (?:for review )?is (?:hereby )?(?:granted|denied|dismissed)|(?:motion|judgment)[^.]{0,80}(?:is|are) (?:hereby )?(?:granted|denied|dismissed)|the [Cc]ourt (?:grants|denies|dismisses|enters))[\s\S]{0,420})/gi;

  const reservationHunted =
    /((?:we do not decide|we need not reach|we express no (?:opinion|view)|we leave (?:for another day|open))[\s\S]{0,300})/gi;

  const amountHunted = /([\s\S]{0,160}\$[\d][\d,]*(?:\.\d{2})?(?: million| billion)?[\s\S]{0,200})/gi;

  const countHunted =
    /([\s\S]{0,200}(?:single act or failure to act|per day|per call|continuing violation|each day|separate violation)[\s\S]{0,260})/gi;

  const juryHunted = /([\s\S]{0,200}(?:Seventh Amendment|jury trial|Jarkesy)[\s\S]{0,300})/gi;

  const out: any[] = [];

  for (const target of targets) {
    let text = '';
    let failure: string | null = null;

    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
        if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
      }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

      text = await page.evaluate(() => {
        const region =
          document.querySelector('#opinion') ||
          document.querySelector('.opinion-content') ||
          document.querySelector('article') ||
          document.body;
        return ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim();
      });
    } catch (e: any) {
      failure = String(e?.message || e).slice(0, 240);
    }

    const collect = (re: RegExp, cap: number) => {
      const acc: string[] = [];
      const seen = new Set<number>();
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        const bucket = Math.floor(m.index / 700);
        if (seen.has(bucket)) continue;
        seen.add(bucket);
        acc.push(m[0]);
        if (acc.length >= cap) break;
      }
      return acc;
    };

    const disposition = text ? collect(dispositionHunted, 4) : [];
    const reservation = text ? collect(reservationHunted, 3) : [];
    const amounts = text ? collect(amountHunted, 6) : [];
    const counts = text ? collect(countHunted, 5) : [];
    const jury = text ? collect(juryHunted, 3) : [];

    // ⛔ a captured opinion with no readable disposition is a trap, not a source
    if (!failure && text.length > 4000 && disposition.length === 0)
      throw new UnexpectedCodePathError(
        `no disposition matched in ${target.slug} (${text.length} bytes captured).\n` +
          '  do NOT quote this opinion until the disposition is visible — the logic can point\n' +
          '  one way while the outcome points the other.\n' +
          '  fix: widen the disposition pattern to cover this court\u2019s vocabulary. do NOT\n' +
          '       author around the gate by removal of this check.',
      );

    out.push({
      slug: target.slug,
      cite: target.cite,
      url: target.url,
      bytes: text.length,
      failure,
      verdict: failure
        ? `FETCH-FAILED — ${failure}`
        : text.length < 2000
          ? `THIN-CAPTURE (${text.length} bytes) — under the 2000-byte floor, treat as a block page`
          : `captured · disposition ${disposition.length} · amounts ${amounts.length} · count-language ${counts.length} · jury ${jury.length}`,
      disposition,
      reservation,
      amounts,
      counts,
      jury,
    });
  }

  const usable = out.filter((o) => !o.failure && o.bytes >= 2000);
  if (usable.length === 0)
    throw new UnexpectedCodePathError(
      'zero of the nine opinions captured above the byte floor — a broken run, not a legal result.\n' +
        '  fix: confirm the browser session is live and re-run; do NOT record "no amounts found".',
    );

  return {
    captured: usable.length,
    failed: out.filter((o) => o.failure || o.bytes < 2000).map((o) => `${o.slug}: ${o.verdict}`),
    out,
  };
};
