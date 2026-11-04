/**
 * .what = fetch Delaware's corporate fee schedule as BYTES and extract it
 * .why  = the three live quote.verify defects left on this route — the revival
 *         expedite columns in 4.file.revival and the good-standing prices in
 *         5.verify.restoration — all cite a fee figure whose container was
 *         never embedded. this pulls it.
 *
 * ⛔ the url was EARNED — the single pdf link on https://corp.delaware.gov/fee/,
 *    which was itself row 19 of the unfiltered link harvest of
 *    .scratch/refs/pulls/corp.corpfees.html. no slug was pattern-matched.
 *
 * ⛔ NEVER page.goto a .pdf. the tab hands back a viewer shell, and where the
 *    server sends the file as an attachment playwright raises an error that
 *    reads like a broken playbook rather than a wrong method. the request
 *    context never raises on an attachment, so fetch the bytes there.
 *
 * 🚨 n=7 — the WORST failure mode is SUCCESS AT A STALE REVISION: right form,
 *    right agency, healthy bytes, every guard green, and figures from a
 *    superseded revision. the slug says `AugustFee2026` and THAT IS NOT THE
 *    STAMP. so every date-like token in the body is reported, and the revision
 *    is read off the document before any figure is quoted.
 */

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

export const action = async (input: { page: Page }) => {
  const page = input.page;

  const url = 'https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf';

  const res = await page.request.get(url);
  const body = await res.body();
  const contentType = res.headers()['content-type'] ?? null;

  // ⭐ sniff the MAGIC BYTES, never the extension. the extension describes the
  //    handler; only the payload says what actually arrived.
  const head = body.subarray(0, 8);
  const isPdf = head.subarray(0, 4).toString('latin1') === '%PDF';

  const pdfAt = path.join(OUT, 'corp.fee.schedule.pdf');
  const txtAt = path.join(OUT, 'corp.fee.schedule.txt');

  fs.writeFileSync(pdfAt, body);

  if (!isPdf)
    return {
      url,
      ok: false,
      bytes: body.length,
      contentType,
      magic: head.toString('hex'),
      note: 'not a pdf — body written raw, do NOT quote from it',
    };

  // deterministic extract, per rule.forbid.hand-transcription
  execFileSync('pdftotext', ['-layout', pdfAt, txtAt]);
  const text = fs.readFileSync(txtAt, 'utf-8');

  // ⭐ every date-like token, so a superseded revision cannot hide behind a
  //    current-looking slug. this is the n=7 control.
  const stamps = Array.from(
    new Set(
      (
        text.match(
          /(?:rev\.?\s*)?\d{1,2}\/\d{1,2}\/?\d{0,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}?,?\s*\d{4}/gi,
        ) ?? []
      ).map((s) => s.trim()),
    ),
  );

  return {
    url,
    ok: true,
    bytes: body.length,
    chars: text.length,
    contentType,
    stamps,
    head: text.slice(0, 600).replace(/\s+/g, ' '),
  };
};
