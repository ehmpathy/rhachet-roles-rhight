/**
 * .what = fetch the official slip opinion for AT&T Mobility LLC v. Concepcion, No. 09-893 (U.S.
 *         Apr. 27, 2011) from supremecourt.gov through the browser's own request context, and save
 *         it locally so it can be read end-to-end as a document
 * .why  = R7 / H9 — the vision's own "largest single caveat" on its headline result. the $20M
 *         per-message multiplier assumes class treatment is available, and an arbitration clause
 *         with a class waiver is the standard corporate defeater of exactly that. Concepcion is the
 *         authority that made such waivers enforceable, so the claim must rest on the opinion rather
 *         than on the widely-repeated one-line version of it.
 * .note = the action body runs in node, not in the page, so fs is available here. only
 *         page.evaluate runs in the browser. this is the same pattern that pulled the Duguid slip.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { UnexpectedCodePathError } from 'helpful-errors';
import { dirname } from 'path';

export const action = async ({ page }: { page: any }) => {
  const candidates = [
    'https://www.supremecourt.gov/opinions/10pdf/09-893.pdf',
    'https://www.supremecourt.gov/opinions/10pdf/09-893_new.pdf',
  ];

  const into =
    '.behavior/v2026_07_30.fix-legal-comms-consent/refs/concepcion.09-893.opinion.pdf';
  mkdirSync(dirname(into), { recursive: true });

  const tried: { url: string; status: number; bytes: number }[] = [];

  for (const url of candidates) {
    const res = await page.context().request.get(url, { timeout: 60000 });
    const body = await res.body();
    tried.push({ url, status: res.status(), bytes: body.length });

    if (res.status() === 200 && body.length > 50000) {
      writeFileSync(into, body);
      return { saved: into, from: url, bytes: body.length, tried };
    }
  }

  // no candidate returned a usable document — fail loud, never hand back a silent null
  throw new UnexpectedCodePathError(
    `fetch failed — no candidate url returned a usable document (200 + >50000 bytes).\n` +
      `  tried: ${JSON.stringify(tried, null, 2)}\n` +
      `  fix: confirm supremecourt.gov has not moved the slip opinion, then update the candidates list above.`,
  );
};
