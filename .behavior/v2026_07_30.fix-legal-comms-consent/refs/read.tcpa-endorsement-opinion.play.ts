/**
 * .what = read `Doctors Direct Ins., Inc. v. Bochenek`, 2015 IL App (1st) 142919, for the terms of
 *         an actual policy endorsement that addressed TCPA liability — what it granted, and its limit
 * .why  = the affirmative-cover survey returned two kinds of evidence, and only this kind is
 *         citable as fact. vendor pages (Munich Re, CRC Group, Risk & Insurance) show a specialty
 *         market is advertised; they do not show what any policy pays. a court that construes a
 *         real endorsement does. this is the difference `rule.require.bhrowser-citations` draws
 *         between a locator and an authority, applied to a market question.
 * .note = the capture keeps every paragraph that names an endorsement, a sublimit, or a dollar
 *         figure — those are the terms a reader needs to judge whether such cover is worth a hunt.
 *         no inner named function may be declared inside page.evaluate — the transpiler wraps
 *         such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const url =
    'https://www.courtlistener.com/opinion/3003491/doctors-direct-insurance-inc-v-bochenek/';

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  // ⚠️ this opinion's body is NOT carried in <p> tags — a first pass read 4 paragraphs and threw.
  // so read the largest opinion content region's innerText and segment it in node, and keep the
  // <p> set only as a supplement rather than the sole source.
  const raw = await page.evaluate(() => {
    const regions = Array.from(
      document.querySelectorAll(
        '#opinion, .opinion-content, #opinion-content, article, main, .tab-content, .serif-text',
      ),
    );
    const texts = regions
      .map((r) => (r as HTMLElement).innerText ?? '')
      .filter((t) => t.length > 400)
      .sort((a, b) => b.length - a.length);
    return {
      regionCount: regions.length,
      text: texts[0] ?? '',
      paras: Array.from(document.querySelectorAll('p')).map((p) => p.textContent ?? ''),
      bytes: document.body.innerHTML.length,
    };
  });

  if (raw.bytes < 2000)
    throw new UnexpectedCodePathError(
      `capture too thin to be content (${raw.bytes} bytes) for ${url}.\n` +
        `  fix: CourtListener likely returned a block page. re-run headful and confirm the render.`,
    );

  // ⚠️ this render line-wraps the opinion, so a per-line filter returns half-sentences (the first
  // pass did exactly that). so flatten to one blob and take a WINDOW around each keyword hit —
  // a term of an insurance endorsement is only legible with the words on either side of it.
  const blob = [String(raw.text), ...raw.paras].join('\n').replace(/\s+/g, ' ').trim();

  const paras = String(raw.text)
    .split(/\n+/)
    .map((t: string) => t.replace(/\s+/g, ' ').trim())
    .filter((t: string) => t.length > 0);

  const hunted = /endorsement|sublimit|limit of liability|\$[\d,]{3,}|TCPA|statutory violation/gi;
  const terms: string[] = [];
  const seen = new Set<number>();
  for (const m of blob.matchAll(hunted)) {
    const at = m.index ?? 0;
    const start = Math.max(0, at - 320);
    // one window per ~600-char neighborhood, so repeat hits do not duplicate the same passage
    const bucket = Math.floor(start / 600);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    terms.push(blob.slice(start, at + 380));
    if (terms.length >= 25) break;
  }

  if (terms.length === 0)
    throw new UnexpectedCodePathError(
      `read ${paras.length} paragraphs across ${raw.regionCount} regions but matched no ` +
        `endorsement or limit language at ${url}.\n` +
        `  fix: confirm this is the merits opinion rather than a docket stub, and that the\n` +
        `       content-region selector set above still matches CourtListener's markup.`,
    );

  // ⭐ rule.require.bhrowser-citations demands a disposition grep BEFORE the passage is quoted —
  // the terms above say what the endorsement PROMISED; only these say whether it PAID.
  const dispositionHunted =
    /we do not decide|we need not reach|which applies|we affirm|we reverse|we remand|duty to defend|no duty to|affirmed|reversed/gi;
  const disposition: string[] = [];
  const seenD = new Set<number>();
  for (const m of blob.matchAll(dispositionHunted)) {
    const at = m.index ?? 0;
    const start = Math.max(0, at - 300);
    const bucket = Math.floor(start / 600);
    if (seenD.has(bucket)) continue;
    seenD.add(bucket);
    disposition.push(blob.slice(start, at + 340));
    if (disposition.length >= 12) break;
  }

  if (disposition.length === 0)
    throw new UnexpectedCodePathError(
      `read the endorsement terms at ${url} but found NO disposition language.\n` +
        `  fix: an opinion always disposes. to quote its terms without its holding is the exact\n` +
        `       failure rule.require.bhrowser-citations forbids — widen the disposition regex\n` +
        `       above, or confirm this page is the merits opinion.`,
    );

  return {
    url,
    bytes: raw.bytes,
    regionCount: raw.regionCount,
    paraCount: paras.length,
    terms,
    disposition,
  };
};
