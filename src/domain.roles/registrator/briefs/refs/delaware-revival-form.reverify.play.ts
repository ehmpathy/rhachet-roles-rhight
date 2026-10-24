/**
 * .what = re-pull the Certificate of Revival form LIVE and compare it, byte for
 *         byte, against the copy embedded at
 *         `refs/effectiveAt=2023-08-01.de-revival-void-form.pdf`.
 *
 * .why  = the embedded copy was pulled earlier. every claim about the form —
 *         the $189 fee, the `rev. 08/2023` stamp, the five articles, the
 *         execution block — rests on those bytes. a form revision would move all
 *         of them at once, silently, and the brief would keep its citation to a
 *         document the agency no longer serves.
 *
 *         ⭐ THE PRIOR FAILURE IN THIS EXACT MATTER WAS A STALE REVISION THAT
 *         PASSED EVERY GUARD. a constructed url `corpfiles.delaware.gov/
 *         renewalvoid16.pdf` returned 6,134 chars of genuine Delaware form text
 *         at a `rev. 08/16` revision, which stated a stale $169.00. healthy
 *         bytes, real agency, correct content-type, every needle found — and the
 *         wrong document. so a re-verify asks "is this the SAME document?",
 *         never "did a document arrive?".
 *
 * ⛔ THE URL IS NOT CONSTRUCTED. it is quoted verbatim in the Filing Memo PDF
 *    already on disk, and appears in 15+ unfiltered link harvests of official
 *    Delaware pages. reached by nav: /corpforms/ -> /formsdoctype09/ ->
 *    /renew09/ -> the anchor labeled "Revival for Void".
 *
 * ⛔ A `.pdf` URL MUST NOT GO THROUGH page.goto. the server sends it as an
 *    attachment, so playwright raises `page.goto: Download is starting` — which
 *    reads as a broken playbook rather than as the wrong method. fetch the bytes
 *    through the request context instead, which never raises on an attachment.
 *
 * ⛔ AND THE MAGIC BYTES ARE SNIFFED, never trusted from the extension. a 31-byte
 *    HTTP 429 committed as a `.pdf` sat green in this repo for nine months. the
 *    `%PDF` check is the control that would have caught it.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-revival-form.reverify.play.ts"
 *   rhx browser.stop --session delaware
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

// ⛔ read out of a harvest, never typed. see the header.
const URL = 'https://corpfiles.delaware.gov/Corp_Forms/Revival%20void.pdf';

// the copy every brief in this repo quotes
const EMBEDDED = path.join(
  process.cwd(),
  'src/domain.roles/registrator/briefs/incorporation/variant=c-corp/refs',
  'effectiveAt=2023-08-01.de-revival-void-form.pdf',
);

const sha = (buf: Buffer) =>
  crypto.createHash('sha256').update(buf).digest('hex');

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  const res = await page.request.get(URL);
  const body = Buffer.from(await res.body());

  // ⛔ the control: sniff the container, do not trust the extension
  const isPdf = body.subarray(0, 4).toString('latin1') === '%PDF';

  const livePath = path.join(OUT, 'de-revival-void-form.live.pdf');
  fs.writeFileSync(livePath, body);

  const embeddedBytes = fs.existsSync(EMBEDDED)
    ? fs.readFileSync(EMBEDDED)
    : null;

  return {
    url: URL,
    status: res.status(),
    contentType: res.headers()['content-type'] ?? null,
    isPdf,
    live: { bytes: body.length, sha256: sha(body) },
    embedded: embeddedBytes
      ? { bytes: embeddedBytes.length, sha256: sha(embeddedBytes) }
      : null,
    // ⭐ THE ONE ANSWER THIS PULL EXISTS FOR
    identical: embeddedBytes ? sha(body) === sha(embeddedBytes) : null,
    wrote: livePath,
  };
};
