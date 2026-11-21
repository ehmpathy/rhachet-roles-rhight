import type { Page } from 'playwright';

/**
 * .what = pulls 8 Del. C. ch. 5 WHOLE, plus the revival subchapter, to settle
 *         whether Delaware franchise tax and the annual-report duty keep
 *         running while a charter is VOID.
 *
 * .why  = `rule.require.bhrowser-citations`. three briefs once disagreed on
 *         whether tax still accrues while void (reinstate said "taxes stop",
 *         tips and delinquency hedged). this pull settled it via §312(g);
 *         the settled answer now lives in `delaware.franchise.tax.delinquency.md`.
 *
 * .the gap this closes = `delaware.franchise.tax.[tips].md` states its own
 *         exit criterion — "a pull of §312 and §502 to establish whether the
 *         annual-report duty runs during the void period. neither has been
 *         pulled for this page." this playbook is that pull.
 *
 * ⚠️ NO Delaware bytes are embedded anywhere in this repo. `refs/effectiveAt=*`
 *    holds FL, TX, MD and WY and not one DE file — so the ch. 5 container pull
 *    done for the §510 correction was never committed and cannot be re-read.
 *    that is why this playbook SLICES and COMMITS, and does not merely quote.
 *
 * .the container discipline
 *
 *   ⛔ the operative question is NOT answerable from §510 alone. §510 says the
 *   charter becomes void; whether the TAX keeps accruing is a separate fact,
 *   and if it is stated at all it is stated in the imposition section (§501),
 *   the report duty (§502), or the revival section (§312) — none of which a
 *   §510-shaped pull returns. so ch. 5 is pulled WHOLE.
 *
 *   ⚠️ and the needle is scoped to a SLICE, never run over the container.
 *   ch. 5's sections are drafted in parallel and a bare `.find()` over 40k
 *   chars returns a verbatim, correct quote of the wrong section — the n=7
 *   failure. every needle below names the section it must match inside.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-void-period-accrual.play.ts"
 *   rhx browser.stop --session delaware
 */
const OUT = `${process.cwd()}/.temp/delaware-void`;

const SOURCES: [slug: string, url: string][] = [
  // ⭐ the container. §501 imposition · §502 report duty · §503 rates ·
  //    §504 payment + due dates · §505 review · §510 void · §511 penalty.
  //    pulled WHOLE so the imposition section arrives beside the void
  //    section and neither can be read in isolation from the other.
  ['t8-c005', 'https://delcode.delaware.gov/title8/c005/index.html'],

  // the revival subchapter — §311 renewal, §312 revival + retroactivity,
  // §313 exempt-corp revival, §314 revival of a §284 forfeiture.
  ['t8-c001-sc12', 'https://delcode.delaware.gov/title8/c001/sc12/index.html'],

  // ⭐ a SECOND PUBLISHER for the decisive sentence. an equality test needs
  //    two independently-fetched strings held by one program; two of my own
  //    reads corroborate only my own bookkeeping.
  //
  //    ⚠️ `agree: false` is MOST OFTEN A DEAD URL, not a divergence. check
  //    the byte count and open the body before reading it as a conflict.
  ['justia-c005', 'https://law.justia.com/codes/delaware/title-8/chapter-5/'],
];

/**
 * .what = the sentences the question turns on, each scoped to its section.
 * .why  = the container is ~40k chars. an eye-read of it IS the unreliable
 *         step this rule exists to remove.
 *
 * .how to read the answer
 *
 *   the tax is imposed on a class of corporations. a §510 void is not a
 *   dissolution — `define.void-charter-vs-federal-nol.md` establishes that
 *   from §275 and §510 — so if the imposition section keys on membership in
 *   that class, the tax runs during the void window and "taxes stop when
 *   voided" is FALSE.
 *
 *   if instead some section expressly suspends the duty on void, that is
 *   the sentence that makes it TRUE. either way the answer is a quote, and
 *   the needles below are chosen so that BOTH answers are reachable.
 */
const NEEDLES: [
  slug: string,
  section: [from: string, until: string],
  label: string,
  needle: string,
][] = [
  [
    't8-c005',
    ['§ 501', '§ 502'],
    '⭐ §501 · who the tax is imposed on',
    'annual tax',
  ],
  [
    't8-c005',
    ['§ 502', '§ 503'],
    '⭐ §502 · the annual report duty, and on whom',
    'shall file',
  ],
  ['t8-c005', ['§ 502', '§ 503'], '§502 · the report penalty', 'penalty'],
  [
    't8-c005',
    ['§ 504', '§ 505'],
    '§504(a) · the installment trigger',
    '$5,000',
  ],
  ['t8-c005', ['§ 510', '§ 511'], '§510 · the void trigger', 'shall be void'],
  [
    't8-c001-sc12',
    ['§ 312', '§ 313'],
    '⭐ §312 · what revival requires be PAID',
    'all franchise taxes',
  ],
  [
    't8-c001-sc12',
    ['§ 312', '§ 313'],
    '⭐ §312(e) · retroactivity',
    'at all times remained',
  ],
];

/**
 * .what = the slices COMMITTED beside the briefs as source bytes.
 * .why  = `rule.require.embed-source-bytes`. a .gov url rots and the claim
 *         outlives its evidence.
 *
 * ⛔ sliced HERE, in code, never by hand — `rule.forbid.hand-transcription`.
 *    a re-run regenerates every committed ref byte-for-byte.
 *
 * ⚠️ each `effectiveAt=` is the LATEST AMENDMENT to the sections in that
 *    slice, not the date of the pull.
 */
const SLICES: [slug: string, from: string, to: string, into: string][] = [
  // the whole franchise-tax chapter. the imposition section and the void
  // section MUST ship together — that is the entire lesson of this pull.
  [
    't8-c005',
    '§ 501',
    '\u0000never-matches\u0000',
    'registrator/briefs/incorporation/variant=c-corp/refs/de-title8-ch5-franchise-tax.txt',
  ],
  // the revival subchapter, whole. §312(e) is quoted in five files and
  // §312(b)'s §284 carve-out sits behind all five of them.
  [
    't8-c001-sc12',
    '§ 311',
    '\u0000never-matches\u0000',
    'registrator/briefs/incorporation/variant=c-corp/refs/de-title8-ch1-sc12-revival.txt',
  ],
];

const ROLES = `${process.cwd()}/src/domain.roles`;

/**
 * .what = cut ONE section out of a container before any needle runs in it.
 * .why  = n=7. ch. 5's sections are parallel-drafted, so an unscoped search
 *         returns a correct quote of the WRONG section — an error no
 *         fact-check of the quote can catch.
 *
 * ⛔ REFUSES on a missed start marker. a silent miss searches the whole
 *    document under a name that promises one section, which IS the defect.
 */
const sliceSection = (
  lines: string[],
  from: string,
  until: string,
): { lines: string[]; ok: boolean } => {
  const at = lines.findIndex((l) => l.trim().startsWith(from));
  if (at === -1) return { lines: [], ok: false };
  const rest = lines.slice(at);
  const end = rest.findIndex((l, i) => i > 0 && l.trim().startsWith(until));
  return { lines: end === -1 ? rest : rest.slice(0, end), ok: true };
};

export const action = async (input: {
  page: Page;
}): Promise<{
  out: string;
  pulled: { slug: string; chars: number; ok: boolean; head: string }[];
  collided: { chars: number; slugs: string[] }[];
  found: {
    label: string;
    sliced: boolean;
    sliceChars: number;
    line: string | null;
  }[];
  slices: { into: string; chars: number; ok: boolean }[];
}> => {
  const fs = await import('node:fs');
  fs.mkdirSync(OUT, { recursive: true });

  const pulled: { slug: string; chars: number; ok: boolean; head: string }[] =
    [];

  for (const [slug, url] of SOURCES) {
    // `domcontentloaded` + an explicit settle. `networkidle` never fires on
    // hosts that keep an ad socket warm, and buys no accuracy on static html.
    await input.page.goto(url, { waitUntil: 'domcontentloaded' });
    await input.page.waitForTimeout(2500);

    const text = await input.page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`${OUT}/${slug}.txt`, text);

    pulled.push({
      slug,
      chars: text.length,
      ok: text.length > 2000,
      // ⚠️ a short pull's BODY, on the record. without this the byte count is
      // an unexplained number and cannot distinguish a block page from a
      // genuinely short document.
      head: text.slice(0, 300).replace(/\s+/g, ' '),
    });
  }

  /*
    ⭐ the COLLISION check. a site can serve a real, healthy, correctly-typed
    page for a url that does not exist — every other guard passes. distinct
    urls that return byte-identical bodies have been collapsed, not answered.
  */
  const bySize = new Map<number, string[]>();
  for (const p of pulled)
    bySize.set(p.chars, [...(bySize.get(p.chars) ?? []), p.slug]);
  const collided = Array.from(bySize.entries())
    .filter(([, slugs]) => slugs.length > 1)
    .map(([chars, slugs]) => ({ chars, slugs }));

  const found = NEEDLES.map(([slug, [from, until], label, needle]) => {
    const at = `${OUT}/${slug}.txt`;
    if (!fs.existsSync(at))
      return { label, sliced: false, sliceChars: 0, line: null };

    const whole = fs.readFileSync(at, 'utf-8').split('\n');
    const cut = sliceSection(whole, from, until);

    // ⚠️ the slice verdict is REPORTED. `sliced: false` means every quoted
    // line under it is untrustworthy, and without the flag a bad run looks
    // identical to a clean one.
    if (!cut.ok) return { label, sliced: false, sliceChars: 0, line: null };

    /*
      the comparable copy maps every LENGTH-STABLE whitespace char onto a
      space, so an exotic separator cannot defeat a needle that reads
      correctly on screen. indices stay valid, so the ORIGINAL is what gets
      quoted.
    */
    const line =
      cut.lines
        .map((l) => ({
          raw: l.trim(),
          cmp: l
            .replace(
              /[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g,
              ' ',
            )
            .trim()
            .toLowerCase(),
        }))
        .find((l) => l.cmp.includes(needle.toLowerCase()))?.raw ?? null;

    return {
      label,
      sliced: true,
      sliceChars: cut.lines.join('\n').length,
      line,
    };
  });

  const slices = SLICES.map(([slug, from, to, into]) => {
    const at = `${OUT}/${slug}.txt`;
    const outAt = `${ROLES}/${into}`;
    if (!fs.existsSync(at)) return { into, chars: 0, ok: false };

    const whole = fs.readFileSync(at, 'utf-8');
    const start = whole.indexOf(from);
    if (start === -1) return { into, chars: 0, ok: false };

    const endRaw = whole.indexOf(to, start + 1);
    const body = whole.slice(start, endRaw === -1 ? whole.length : endRaw);

    fs.mkdirSync(outAt.slice(0, outAt.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(outAt, body);
    return { into, chars: body.length, ok: body.length > 1000 };
  });

  return { out: OUT, pulled, collided, found, slices };
};
