/**
 * .what = read the two TCPA class-settlement approval opinions the magnitude search returned, and
 *         capture every paragraph that carries a dollar figure, a class size, or a claims rate:
 *           - Amadeck v. Capital One Fin. Corp., 80 F. Supp. 3d 781 (N.D. Ill. 2015) — the MDL
 *           - Stinson v. Delta Mgmt. Assocs., 302 F.R.D. 160 (S.D. Ohio 2014)
 * .why  = the wish asked "what are the sizes of penalties?". `ref.tcpa-exposure-tracks` answers
 *         with statutory units ($500 / $1,500 per message, uncapped on the private track). that is
 *         the upper bound, not the outcome. a final-approval opinion must weigh the fund against
 *         the maximum statutory exposure under Rule 23(e), so it states BOTH numbers — exactly the
 *         comparison the vision flagged as owed: "a nominal $20M rarely equals a paid $20M".
 * .note = these opinions are read to source figures, not to state what a court held. per
 *         rule.require.bhrowser-citations any figure quoted in a brief must come from the opinion
 *         text captured here, never from a summary of it.
 *         ⚠️ a CourtListener opinion body is NOT always carried in <p> tags — read.tcpa-endorsement-opinion
 *         documented a first pass that read only 4 paragraphs and threw. so this reads the largest
 *         content region's innerText as the primary source and keeps the <p> set as a supplement,
 *         then throws when a full-byte capture yields zero money paragraphs rather than author a
 *         brief with no figures off a busted <p>-only read.
 *         no inner named function may be declared inside page.evaluate — the transpiler wraps
 *         such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const opinions = [
    {
      cite: 'Amadeck v. Capital One Fin. Corp., 80 F. Supp. 3d 781 (N.D. Ill. 2015)',
      url: 'https://www.courtlistener.com/opinion/7311505/amadeck-v-capital-one-financial-corp/',
    },
    {
      cite: 'Stinson v. Delta Mgmt. Assocs., 302 F.R.D. 160 (S.D. Ohio 2014)',
      url: 'https://www.courtlistener.com/opinion/8787699/stinson-v-delta-management-associates-inc/',
    },
  ];

  const read: {
    cite: string;
    url: string;
    bytes: number;
    regionCount: number;
    moneyParas: string[];
  }[] = [];

  for (const op of opinions) {
    await page.goto(op.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const raw = await page.evaluate(() => {
      const regions = Array.from(
        document.querySelectorAll(
          '#opinion, .opinion-content, #opinion-content, article, main, .tab-content, .serif-text',
        ),
      );
      const regionTexts = regions
        .map((r) => (r as HTMLElement).innerText ?? '')
        .filter((t) => t.length > 400)
        .sort((a, b) => b.length - a.length);
      return {
        text: regionTexts[0] ?? '',
        regionCount: regions.length,
        paras: Array.from(document.querySelectorAll('p')).map((p) => p.textContent ?? ''),
        bytes: document.body.innerHTML.length,
      };
    });

    // segment from the region innerText FIRST (the reliable source), then the <p> set as a supplement
    const paras = [...String(raw.text).split(/\n+/), ...raw.paras]
      .map((t: string) => t.replace(/\s+/g, ' ').trim())
      .filter((t: string) => t.length > 60);

    read.push({
      cite: op.cite,
      url: op.url,
      bytes: raw.bytes,
      regionCount: raw.regionCount,
      // keep only paragraphs that carry a figure the exposure brief could actually quote
      moneyParas: paras
        .filter((t: string) =>
          /\$[\d,]{3,}|class members|claims rate|per class member|statutory damages/i.test(t),
        )
        .slice(0, 30),
    });
  }

  // a capture under ~2000 bytes means a block page, not content — refuse to treat it as evidence
  const thin = read.filter((r) => r.bytes < 2000).map((r) => r.cite);
  if (thin.length)
    throw new UnexpectedCodePathError(
      `capture too thin to be content for: ${thin.join('; ')}.\n` +
        `  fix: CourtListener likely returned a block or an interstitial. re-run headful and confirm.`,
    );

  // ⛔ a full-byte capture that still matched zero money/class paragraphs is a broken read (the
  //    known <p>-only CourtListener shape), never a genuine "this opinion states no figures". throw
  //    rather than return an empty result a brief would be authored against.
  const empty = read
    .filter((r) => r.bytes >= 2000 && r.moneyParas.length === 0)
    .map((r) => r.cite);
  if (empty.length)
    throw new UnexpectedCodePathError(
      `a full-byte capture matched zero money/class paragraphs for: ${empty.join('; ')}.\n` +
        `  fix: the opinion likely renders its body outside <p> tags. confirm the content-region\n` +
        `       selector set above matched this page's markup, or re-run headful.`,
    );

  return read;
};
