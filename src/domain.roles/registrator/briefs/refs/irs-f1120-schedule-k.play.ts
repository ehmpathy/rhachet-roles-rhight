/**
 * .what = embed the bytes of IRS Form 1120 so the Schedule K question-13 line
 *         quoted in `0.gather.position.stone` has a source that ships
 *
 * .why  = that stone quotes question 13 — "If "Yes," the corporation is not
 *         required to complete Schedules L, M-1, and M-2" — to prove that a
 *         ZEROED Schedule L may be a placeholder rather than a computed
 *         balance. the claim decides real money: line 15 is the figure
 *         Delaware reads under § 503(i) and the figure an officer later
 *         attests to under § 502(b).
 *
 *         this route's embedded refs are all Delaware statutes, so a
 *         `quote.verify` census over them reports that line NOT-IN-SOURCE.
 *         that is an ABSENT-SOURCE verdict, never a fabrication one — and the
 *         cure is to ship the bytes, never to widen the detector.
 *
 * .note = the url is EARNED, not guessed. irs.gov/pub/irs-pdf/f1120.pdf is
 *         already cited from a prior bhrowser pull in this repo, in the
 *         accountant role's `define.void-charter-vs-federal-nol` provenance
 *         table (46,942 chars).
 *
 * ⛔ a .pdf url must NOT go through page.goto — the server sends it as an
 *    attachment, so playwright raises "Download is starting", which reads as a
 *    broken playbook rather than the wrong method. fetch the bytes through the
 *    request context, sniff the magic bytes, then extract with pdftotext per
 *    `rule.forbid.hand-transcription`.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import { chromium } from 'playwright';

const REPO = process.cwd();
const OUT = `${REPO}/src/domain.roles/registrator/briefs/incorporation/variant=c-corp/refs`;

const URL = 'https://www.irs.gov/pub/irs-pdf/f1120.pdf';

export const action = async () => {
  const ws = fs
    .readFileSync(`${REPO}/.cache/browser.detax/ws-endpoint`, 'utf-8')
    .trim();
  const browser = await chromium.connectOverCDP(ws);
  const page = await browser.contexts()[0]!.newPage();

  const res = await page.request.get(URL);
  const body = await res.body();
  const head = body.subarray(0, 8);
  const isPdf = head.subarray(0, 4).toString('latin1') === '%PDF';

  await page.close();

  // ⛔ refuse rather than write a non-pdf under a .pdf name. a 31-byte HTTP 429
  //    committed as a .pdf sat green for nine months once already.
  if (!isPdf)
    return {
      url: URL,
      ok: false,
      why: 'response is not a PDF',
      contentType: res.headers()['content-type'] ?? null,
      bytes: body.length,
      head: head.toString('hex'),
    };

  // ⚠️ the stamp is read OFF the form, never assumed. this pull returned a
  //    body whose page header says "Form 1120 (2025)" — a first draft of this
  //    playbook had stamped it 2024 out of habit alone, which is the
  //    stale-revision defect wearing a correct-looking filename.
  const stem = `${OUT}/effectiveAt=2025-01-01.irs-f1120`;
  fs.writeFileSync(`${stem}.pdf`, body);
  execFileSync('pdftotext', ['-layout', `${stem}.pdf`, `${stem}.txt`]);

  const text = fs.readFileSync(`${stem}.txt`, 'utf-8');

  // length-stable whitespace normalization: every char below maps ONE-TO-ONE
  // onto a space, so indices stay valid against the original
  const comparable = text.replace(
    /[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g,
    ' ',
  );

  // ⚠️ the needle is copied off the quoted passage, never typed from memory.
  //    a needle written from recollection is a hypothesis; two-sided misses in
  //    this repo have all been needle bugs rather than publisher divergence.
  const needles = [
    'not required to complete Schedules L, M-1, and M-2',
    'Schedule K',
    'Total assets',
  ];

  const hits = needles.map((n) => {
    const at = comparable.indexOf(n);
    return {
      needle: n,
      found: at !== -1,
      context:
        at === -1
          ? null
          : comparable.slice(Math.max(0, at - 240), at + 240).trim(),
    };
  });

  return {
    url: URL,
    ok: true,
    bytes: body.length,
    chars: text.length,
    pdfAt: `${stem}.pdf`,
    txtAt: `${stem}.txt`,
    hits,
  };
};
