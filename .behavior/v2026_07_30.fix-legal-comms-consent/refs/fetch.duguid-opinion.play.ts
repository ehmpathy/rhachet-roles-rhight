/**
 * .what = fetch the official slip opinion pdf for Facebook, Inc. v. Duguid, No. 19-511, from
 *         supremecourt.gov through the browser's own request context, and save it locally so it
 *         can be read end-to-end as a document
 * .why  = R1 / U2. the autodialer definition is the most load-bearing open item, and the vision's
 *         pin cite (592 U.S. 395) was recall. per rule.require.bhrowser-citations a claim about
 *         what a court decided may not rest on a snippet; the narrow document exception permits a
 *         full pdf read, so the pdf is pulled through the browser context (real headers, real
 *         session) and then read as a whole document rather than summarized.
 * .note = the action body runs in node, not in the page, so fs is available here. only
 *         page.evaluate runs in the browser.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { UnexpectedCodePathError } from 'helpful-errors';
import { dirname } from 'path';

export const action = async ({ page }: { page: any }) => {
  const candidates = [
    'https://www.supremecourt.gov/opinions/20pdf/19-511_p86b.pdf',
    'https://www.supremecourt.gov/opinions/20pdf/19-511_new.pdf',
  ];

  const into =
    '.behavior/v2026_07_30.fix-legal-comms-consent/refs/duguid.19-511.opinion.pdf';
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
