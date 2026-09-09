/**
 * .what = read, in full, the two FCC Federal Register documents that the post-remand sweep returned
 *         as consent-relevant and later than `90 FR 42138`:
 *           - `2025-22063` — "Advanced Methods To Target and Eliminate Robocalls" (Dec 5, 2025)
 *           - `2025-16641` — the "Delete, Delete, Delete" TCPA / unlawful-text order (Aug 29, 2025)
 * .why  = find.fcc-post-remand-posture proved the Commission DID act after the vacatur conformance,
 *         which is the opposite of the null answer the vision half-expected. a hit list is not an
 *         answer though — per rule.require.bhrowser-citations a claim about what an order does must
 *         rest on the order's own words. these two are the only post-Aug-2025 documents that
 *         surfaced under BOTH the "prior express written consent" and "robocall consent revocation"
 *         probes, so they are where a re-action to the consent regime would live.
 * .note = the page.evaluate body declares NO inner named functions. tsx compiles this file with
 *         esbuild keepNames, which wraps a named `const fn = ...` in a `__name(...)` call; that
 *         symbol does not exist in the browser realm, so any such declaration inside evaluate dies
 *         with "__name is not defined". text cleanup therefore happens in node, on raw strings.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const docs = [
    {
      id: '2025-22063',
      url: 'https://www.federalregister.gov/documents/2025/12/05/2025-22063/advanced-methods-to-target-and-eliminate-robocalls',
    },
    {
      id: '2025-16641',
      url: 'https://www.federalregister.gov/documents/2025/08/29/2025-16641/delete-delete-delete-targeting-and-eliminating-unlawful-text-messages-rules-and-regulations',
    },
  ];

  const read: {
    id: string;
    url: string;
    title: string;
    consentParas: string[];
    bytes: number;
  }[] = [];

  for (const doc of docs) {
    await page.goto(doc.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const raw = await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent ?? '',
      paras: Array.from(document.querySelectorAll('p')).map((p) => p.textContent ?? ''),
      bytes: document.body.innerHTML.length,
    }));

    const paras = raw.paras
      .map((t: string) => t.replace(/\s+/g, ' ').trim())
      .filter((t: string) => t.length > 60);

    read.push({
      id: doc.id,
      url: doc.url,
      title: raw.title.replace(/\s+/g, ' ').trim(),
      consentParas: paras
        .filter((t: string) => /consent|revocation|revoke|64\.1200/i.test(t))
        .slice(0, 30),
      bytes: raw.bytes,
    });
  }

  // a capture under ~2000 bytes means a block page, not content — refuse to treat it as evidence
  const thin = read.filter((r) => r.bytes < 2000).map((r) => r.id);
  if (thin.length)
    throw new UnexpectedCodePathError(
      `capture too thin to be content for: ${thin.join(', ')}.\n` +
        `  fix: the page likely returned a block or interstitial. re-run headful and confirm the render.`,
    );

  return read;
};
