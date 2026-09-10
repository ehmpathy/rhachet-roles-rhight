/**
 * .what = search the Federal Register for every FCC document that touches the TCPA consent rules
 *         and was published AFTER `90 FR 42138` (Aug 29 2025), through today
 * .why  = ⛔ a vision research item that no prior playbook answered: "the FCC's post-remand posture
 *         after the 2025 vacatur — has the Commission re-acted?". read.fedreg-conforming-order
 *         captured the order that REMOVES the vacated text, which is the last act we verified. it
 *         does not tell us whether the Commission has since re-proposed a one-to-one rule, issued
 *         guidance, or left the field alone. that gap matters because every shipped brief describes
 *         the consent regime in the present tense; if the FCC re-acted, those briefs are stale.
 * .note = the date floor is that order's own publication date, so this search covers exactly the
 *         window our evidence does not yet reach.
 *         ⚠️ a zero-hit sweep is NOT auto-returned as "the Commission has not re-acted" — a block
 *         page or a changed selector serves the same empty result as a genuine null, and
 *         `rule.require.bhrowser-citations` forbids a broken capture recorded as a conclusion. so,
 *         like every peer sweep in this folder, this throws two ways: a per-probe byte floor (an
 *         interstitial serves a near-empty body) and an all-probes-zero guard. a genuine null is
 *         confirmed by a headful snapshot and recorded in prose, never shipped from an auto-return.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const since = '2025-08-29';

  // each probe is a different way the Commission would surface a re-action, so a miss on one
  // term does not read as an absence of activity
  const probes = [
    'telephone consumer protection act consent',
    'one-to-one consent',
    'prior express written consent',
    'robocall consent revocation',
  ];

  const found: {
    probe: string;
    url: string;
    bytes: number;
    hits: { title: string; href: string; date: string; kind: string }[];
  }[] = [];

  for (const probe of probes) {
    const url =
      `https://www.federalregister.gov/documents/search` +
      `?conditions%5Bagencies%5D%5B%5D=federal-communications-commission` +
      `&conditions%5Bterm%5D=${encodeURIComponent(probe)}` +
      `&conditions%5Bpublication_date%5D%5Bgte%5D=${since}`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page
      .waitForLoadState('networkidle', { timeout: 6000 })
      .catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate(() => {
      const bytes = (document.body.innerText || '').length;
      const rows = Array.from(document.querySelectorAll('article, .document-wrapper, li'));
      const hits = rows
        .map((row) => {
          const link = row.querySelector('a[href*="/documents/"]') as HTMLAnchorElement | null;
          if (!link) return null;
          const text = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
          const dateMatch = text.match(
            /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/,
          );
          const kindMatch = text.match(/\b(Rule|Proposed Rule|Notice)\b/);
          return {
            title: (link.textContent ?? '').replace(/\s+/g, ' ').trim(),
            href: link.href,
            date: dateMatch ? dateMatch[0] : '',
            kind: kindMatch ? kindMatch[0] : '',
          };
        })
        .filter((h): h is { title: string; href: string; date: string; kind: string } =>
          Boolean(h && h.title && h.href),
        )
        .slice(0, 20);
      return { bytes, hits };
    });

    found.push({ probe, url, bytes: captured.bytes, hits: captured.hits });
  }

  // ⛔ a block page or interstitial serves a near-empty body. trust no zero from such a page —
  //    a byte floor separates a genuine empty-results page from a broken capture.
  const blocked = found.filter((f) => f.bytes < 2000);
  if (blocked.length > 0)
    throw new UnexpectedCodePathError(
      `probe(s) returned a body under 2000 bytes: ${blocked.map((b) => b.probe).join(', ')}\n` +
        '  fix: that is a block page or interstitial, not a search-results page. re-open headful\n' +
        '       and snapshot the html before you trust any hit count from this sweep.',
    );

  const total = found.reduce((sum, f) => sum + f.hits.length, 0);

  // ⛔ zero hits across EVERY probe is far more likely a changed selector than a true null, so
  //    throw like every peer sweep rather than ship "the Commission has not re-acted" as a result.
  //    a genuine null is confirmed by a headful snapshot and recorded in prose, never auto-returned.
  if (total === 0)
    throw new UnexpectedCodePathError(
      'zero hits across ALL FCC post-remand probes — treat as a broken capture, not a proven absence.\n' +
        '  fix: snapshot federalregister.gov and confirm the article/.document-wrapper/li selectors\n' +
        '       still match, then read the "0 documents" empty-state before you record any null.',
    );

  return {
    since,
    probes: probes.length,
    total,
    verdict: 'HITS',
    found,
  };
};
