/**
 * .what = pull DGCL chapter 1, subchapter V — STOCK AND DIVIDENDS — WHOLE, and
 *         embed its bytes beside the briefs that quote it.
 *
 * .why  = `quote.verify` census. the evidence yield behind the
 *         notarized attestation now in the Division's hands quotes:
 *
 *           "The board of directors may authorize capital stock to be issued
 *            for cons…"                                     — 8 Del. C. § 152
 *
 *         and § 152 had NO embedded bytes. the refs dir held sc01, sc02, sc06,
 *         sc07, sc12 and ch. 5 — every subchapter except the one that settles
 *         WHEN A SHARE IS ISSUED, in a matter whose entire dispute is how many
 *         shares were issued.
 *
 * ⭐ THE URL WAS EARNED, NOT TYPED. it came out of the peer harvest in
 *    `delaware-stock-subchapter.nav.play.ts` — a two-hop walk from a page
 *    already on record (`c001/sc12`, the revival subchapter) out to the
 *    chapter-1 breadcrumb, whose unfiltered anchor list carries:
 *
 *      { text: "Subchapter V. Stock and Dividends",
 *        href: "https://delcode.delaware.gov/title8/c001/sc05/index.html" }
 *
 *    `sc05` is one keystroke from `sc02` and would almost certainly have
 *    landed. it is still a guess, and `rule.forbid.guessed-urls` does not
 *    grade a guess by whether it lands.
 *
 * ⛔ THE CONTAINER IS PULLED WHOLE. § 152 read alone is a trap: it says a
 *    board may fix the consideration, and § 153 sets the FLOOR on that
 *    consideration in PAR-VALUE terms — which binds a $0.00001-par charter
 *    differently than a $0.01-par one. § 154 then says what "capital" IS,
 *    which is the multiplicand the whole Assumed Par Value method rests on.
 *    a § 152-only pull reads as a complete answer and is not one.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-stock-subchapter.pull.play.ts"
 *   rhx browser.stop --session delaware
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(
  process.cwd(),
  'src/domain.roles/registrator/briefs/incorporation/variant=c-corp/refs',
);

/**
 * ⚠️ LENGTH-STABLE normalization ONLY. delcode separates a section number from
 *    its title with a whitespace char that is NOT U+0020, so a marker typed
 *    with a plain space misses — and the miss is invisible, because both
 *    render identically on screen and in grep output.
 *
 *    every char below maps ONE-TO-ONE onto a space, so indices stay valid.
 *    the markers are tested against THIS copy; the ORIGINAL bytes are what
 *    get written to disk. a reflow of a statute is its own defect.
 */
const asComparable = (body: string): string =>
  body.replace(/[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ');

export const action = async (input: { page: Page }) => {
  const page = input.page;

  fs.mkdirSync(OUT, { recursive: true });

  // ⭐ read out of the nav harvest, never constructed.
  const url = 'https://delcode.delaware.gov/title8/c001/sc05/index.html';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const body = await page.evaluate(() => document.body.innerText);
  const cmp = asComparable(body);

  // ⛔ the sections this brief family actually rests on. each is asserted
  //    POSITIVELY — a grep's SILENCE cannot be told apart from a bad needle.
  const wanted = ['§ 151', '§ 152', '§ 153', '§ 154', '§ 158', '§ 161'];
  const marks = wanted.map((mark) => ({ mark, at: cmp.indexOf(mark) }));
  const missed = marks.filter((m) => m.at === -1).map((m) => m.mark);

  // ⭐ THE NEGATIVE CONTROL. a matcher that finds everything looks identical
  //    to a strong one until a case it MUST NOT match is run through it.
  //    § 1999 does not exist in title 8. if this comes back `false`, the
  //    marker test above proves naught.
  const controlAbsent = cmp.indexOf('§ 1999') === -1;

  // ⛔ REFUSE a partial container. a file that promises a subchapter and holds
  //    half of it is worse than an absent file, because the absence is visible
  //    and the truncation is not.
  const wrote = missed.length === 0 && controlAbsent && body.length > 8000;
  const out = path.join(OUT, 'de-title8-ch1-sc05-stock.txt');
  if (wrote) fs.writeFileSync(out, body);

  return {
    url,
    chars: body.length,
    // ⛔ a healthy byte count says only that A page loaded. the head goes on
    //    the record so a block page cannot be read as a short document.
    head: body.slice(0, 300).replace(/\s+/g, ' '),
    marks,
    missed,
    controlAbsent,
    wrote,
    out: wrote ? out : null,
  };
};
