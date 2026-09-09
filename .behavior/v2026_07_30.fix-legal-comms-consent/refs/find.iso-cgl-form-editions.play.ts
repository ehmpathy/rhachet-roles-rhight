/**
 * .what = probe which EDITIONS of the ISO Commercial General Liability occurrence form (`CG 00 01`)
 *         are attested in published court opinions, so the engagement can say whether the edition it
 *         quoted (`04 13`) is the latest one it can evidence — rather than assert currency from recall
 * .why  = the insurer brief's honest gap names this open: "whether `CG 00 01 04 13` is the current ISO
 *         edition was not verified. at least three editions are attested." a reader who takes an
 *         out-of-date form as current would read the wrong exclusion text.
 * .note = ⭐ this probe can only ever establish a FLOOR, never currency. ISO forms are licensed, not
 *         published; the absence of a later edition in case law means the later edition has not yet
 *         been litigated, NOT that it does not exist. a new form takes years to reach a reported
 *         decision. so the honest output of this playbook is "the latest edition ATTESTED IN CASE LAW
 *         is X" — and any brief that consumes it must carry that bound, or it converts a floor into a
 *         currency claim the evidence cannot support.
 *         ⚠️ each edition is probed on its own so a zero is attributable to that edition rather than
 *         to the sweep. an all-editions zero means the query shape is wrong (the form number is
 *         certainly litigated), so that case throws.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  // editions to probe, oldest to newest. the last three are speculative and a zero on them is
  // exactly the expected result if 04 13 is in fact the latest base edition.
  const editions = [
    'CG 00 01 10 01',
    'CG 00 01 12 04',
    'CG 00 01 12 07',
    'CG 00 01 04 13',
    'CG 00 01 04 17',
    'CG 00 01 12 19',
    'CG 00 01 04 24',
  ];

  const out: {
    edition: string;
    total: number;
    verdict: string;
    hits: { title: string; href: string }[];
  }[] = [];

  for (const edition of editions) {
    await page.goto(
      `https://www.courtlistener.com/?q=${encodeURIComponent(`"${edition}"`)}&type=o&order_by=dateFiled+desc`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
      if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
    }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const hits = await page.evaluate(() => {
      const out2: { title: string; href: string }[] = [];
      for (const a of Array.from(document.querySelectorAll('a[href*="/opinion/"]'))) {
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!title || title === 'Search Case Law') continue;
        out2.push({ title, href: (a as HTMLAnchorElement).href });
        if (out2.length >= 5) break;
      }
      return out2;
    });

    out.push({
      edition,
      total: hits.length,
      verdict:
        hits.length === 0
          ? `NOT-ATTESTED in case law — a FLOOR result, never proof the edition does not exist`
          : `attested — ${hits.length} opinion(s) name this edition`,
      hits,
    });
  }

  const total = out.reduce((s, e) => s + e.total, 0);

  // ⛔ the CGL occurrence form is among the most-litigated documents in american insurance law.
  // zero across every edition means the query shape broke, not that the form is unlitigated.
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across EVERY probed edition of CG 00 01 — treat as a broken query, not a result.\n' +
        '  context: the CGL occurrence form is among the most-litigated documents in US insurance law.\n' +
        '  fix: snapshot the result page and confirm the quoted-phrase syntax still applies.',
    );

  const attested = out.filter((e) => e.total > 0).map((e) => e.edition);

  return {
    total,
    attested,
    latestAttested: attested.length > 0 ? attested[attested.length - 1] : null,
    bound:
      'FLOOR ONLY — case law lags form release by years. an edition absent here may still be current.',
    out,
  };
};
