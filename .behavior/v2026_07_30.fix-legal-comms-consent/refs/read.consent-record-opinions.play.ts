/**
 * .what = read the two opinions that `find.consent-record-sufficiency` surfaced on the question of
 *         what a TCPA consent RECORD must show — `Thomas v. Abercrombie & Fitch` (E.D. Mich. 2018,
 *         301 F. Supp. 3d 749) and `United States v. Dish Network` (C.D. Ill. 2017, 256 F. Supp. 3d
 *         810) — and capture the passages that bear on proof, plus each one's disposition
 * .why  = D10 is an operational runbook for a consent record. the regulation says what the record
 *         must CONTAIN; only a decision says what a court did when a real record was put in front of
 *         it. without that, the runbook is design opinion with a statutory citation stapled on.
 * .note = ⭐ `rule.require.bhrowser-citations` requires a DISPOSITION grep before any passage is
 *         quoted — a court's logic can cut opposite to what it actually held, and a snippet cannot
 *         show what a court DECLINED to decide. that grep is encoded as a throw below, so a capture
 *         that yields terms without a disposition FAILS rather than ships.
 *         ⚠️ FALSE-POSITIVE TRAP recorded from the search pass: in Texas state courts "TCPA" means
 *         the Texas Citizens Participation Act (anti-SLAPP), NOT the Telephone Consumer Protection
 *         Act. `in Re Benevis` (Tex. App. 2015) surfaced on the same query and is a different statute
 *         entirely. any state-court "TCPA" hit must be confirmed against the federal act before use.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` resolves only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'thomas-v-abercrombie',
      url: 'https://www.courtlistener.com/opinion/7329426/thomas-v-abercrombie-fitch-co/',
    },
    {
      slug: 'us-v-dish-network-2017',
      url: 'https://www.courtlistener.com/opinion/7325900/united-states-v-dish-network-llc/',
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
        document.querySelector('article') ||
        document.body;
      return {
        title: (document.title || '').replace(/\s+/g, ' ').trim(),
        text: ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim(),
      };
    });

    const blob = String(raw.text);

    // ⛔ a capture under ~2000 bytes is a block page, not content
    if (blob.length < 2000)
      throw new UnexpectedCodePathError(
        `capture for ${target.slug} was ${blob.length} bytes at ${target.url}.\n` +
          '  fix: under ~2000 bytes means a block/interstitial page, not the opinion. re-open headful.',
      );

    // the substantive terms — what the record had to show
    const termsHunted =
      /consent|record|evidence|burden|summary judgment|prior express|authenticat|business record|hearsay|declaration|affidavit/gi;
    const terms: string[] = [];
    const seenBuckets = new Set<number>();
    let m: RegExpExecArray | null;
    while ((m = termsHunted.exec(blob)) !== null) {
      const bucket = Math.floor(m.index / 900);
      if (seenBuckets.has(bucket)) continue;
      seenBuckets.add(bucket);
      terms.push(blob.slice(Math.max(0, m.index - 320), m.index + 380));
      if (terms.length >= 14) break;
    }

    // ⭐ the disposition grep the rule demands, encoded as a gate rather than a habit
    const dispositionHunted =
      /we do not decide|we need not reach|which applies|we affirm|we reverse|we remand|is granted|is denied|granted in part|denied in part|judgment (is )?entered/gi;
    const disposition: string[] = [];
    const seenDisp = new Set<number>();
    let d: RegExpExecArray | null;
    while ((d = dispositionHunted.exec(blob)) !== null) {
      const bucket = Math.floor(d.index / 900);
      if (seenDisp.has(bucket)) continue;
      seenDisp.add(bucket);
      disposition.push(blob.slice(Math.max(0, d.index - 300), d.index + 360));
      if (disposition.length >= 8) break;
    }

    if (disposition.length === 0)
      throw new UnexpectedCodePathError(
        `read the record terms at ${target.url} but found NO disposition language.\n` +
          '  fix: an opinion always disposes. to quote what a court said without what it decided is\n' +
          '       the exact failure rule.require.bhrowser-citations forbids — widen the pattern, re-pull.',
      );

    out.push({
      slug: target.slug,
      url: target.url,
      title: raw.title,
      bytes: blob.length,
      termCount: terms.length,
      terms,
      disposition,
    });
  }

  return { read: out.length, out };
};
