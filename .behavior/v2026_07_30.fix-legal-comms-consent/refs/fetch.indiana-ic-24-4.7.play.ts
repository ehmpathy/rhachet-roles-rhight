/**
 * .what = fetch Ind. Code art. 24-4.7 through the browser's own request context, from the data
 *         routes the IGA javascript app itself consumes, and save whatever returns
 * .why  = R4, the last open cell. seven attempts against the rendered portal failed: the tree route
 *         injects no section body (proved by a dom snapshot), a constructed chapter path 404s, and
 *         the portal search returns 0 results for every probe form. per rule.require.solve-at-cause,
 *         the cause is that the section text never enters that page's dom — so it must come from
 *         wherever the app fetches it, or from the pdf publication.
 * .note = the action body runs in node, so fs is available here.
 * .note = ⚠️ `helpful-errors@1.5.3` ships a `dist/index.js` that is concatenated three times, and
 *         the FIRST block — the one the runtime actually resolves — exports only `HelpfulError`,
 *         `UnexpectedCodePathError`, `BadRequestError`, `getError`, `withHelpfulError`.
 *         `MalfunctionError` and `ConstraintError` are present in the `.d.ts`, so `tsc` accepts
 *         them, and then throw `is not a constructor` at run time. every playbook in this folder
 *         therefore throws `UnexpectedCodePathError` (server-fixable) or `BadRequestError`
 *         (caller-fixable) instead. an error class that cannot be constructed is strictly worse
 *         than a plain `Error`: it converts a diagnosis into a `TypeError`.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { BadRequestError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  // prime the browser context against the origin so the request carries real session state
  await page.goto('https://iga.in.gov/laws/2025/ic/titles/24', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const candidates = [
    'https://iga.in.gov/pdf-documents/124/2025/ic/24/4.7/IC24-4.7.pdf',
    'https://iga.in.gov/api/v1/laws/2025/ic/24/4.7/5/2',
    'https://iga.in.gov/laws/2025/ic/titles/24/articles/4.7/chapters/5/sections/2',
    'https://api.iga.in.gov/2025/code/ic/24/4.7/5/2',
    'https://iga.in.gov/laws/2025/ic/24-4.7-5-2',
  ];

  mkdirSync('.behavior/v2026_07_30.fix-legal-comms-consent/refs', { recursive: true });

  const tried: { url: string; status: number; bytes: number; head: string }[] = [];

  for (const url of candidates) {
    const res = await page.context().request.get(url, { timeout: 45000 });
    const body = await res.body();
    const head = body.slice(0, 220).toString('utf8').replace(/\s+/g, ' ').trim();
    tried.push({ url, status: res.status(), bytes: body.length, head });

    if (res.status() === 200 && body.length > 3000) {
      const into =
        '.behavior/v2026_07_30.fix-legal-comms-consent/refs/indiana.ic-24-4.7.raw';
      writeFileSync(into, body);
      return { saved: into, from: url, bytes: body.length, tried };
    }
  }

  // no candidate returned a usable document — fail loud, never hand back a silent null.
  // .note = this playbook DID fail this way in practice: every IGA route is key-gated, so the
  //   throw below is the honest terminal state, and its `tried` dump is the evidence that R4's
  //   Indiana cell is blocked on a credential rather than on an unfinished search.
  // BadRequestError, not UnexpectedCodePathError: the blocker is a credential the caller must
  // supply, so this is caller-fixable, never a fault in the routes themselves.
  // `ConstraintError` would be the truer name, but it is NOT constructible at runtime — see the
  // .note at the head of this file.
  throw new BadRequestError(
    `fetch failed — no candidate url returned a usable document (200 + >3000 bytes).\n` +
      `  tried: ${JSON.stringify(tried, null, 2)}\n` +
      `  fix: the IGA data routes are key-gated ("x-api-key not found"). obtain an api.iga.in.gov\n` +
      `       key, pass it as a request header above, and re-run.`,
  );
};
