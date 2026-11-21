/**
 * .what = pull Delaware Title 30, chapter 19 — CORPORATION INCOME TAX — WHOLE,
 *         and embed its bytes beside the briefs that quote it.
 *
 * .why  = `quote.verify` census. four published briefs quote
 *
 *           "(6) A corporation maintaining a statutory corporate office in the
 *            State but not doing business within the State"   — 30 Del. C. § 1902(b)(6)
 *
 *         and § 1902 had NO embedded bytes. every file under
 *         `variant=c-corp/refs/` is **Title 8** (plus the IRS 1120 and two DE
 *         forms), so a census run against that refs dir reports the line
 *         `NOT-IN-SOURCE` — a verdict about the SOURCE SET, never about the
 *         quote.
 *
 *         the claim itself was verified long ago: the accountant role records a
 *         46,963-char pull of this chapter in the provenance table of
 *         `income-tax/define.void-charter-vs-federal-nol`. what was absent is
 *         the committed byte file. `rule.require.embed-source-bytes` exists
 *         because a .gov url rots and the claim outlives its evidence.
 *
 * ⭐ THE URL WAS EARNED, NOT TYPED — twice over:
 *
 *      1. it is already cited, with a recorded pull, in four published briefs
 *      2. better: it appears as a HARVESTED HREF in the unfiltered anchor list
 *         at `…/.demo/<the-reinstatement-demo>/.probe/23.delaw.links.json`:
 *
 *           { "href": "http://delcode.delaware.gov/title30/c019/index.shtml#TopOfPage" }
 *
 *         i.e. it came out of delcode's OWN navigation on a prior walk, which
 *         is the standard `rule.forbid.guessed-urls` asks for. the `.html`
 *         form below is the one the recorded 46,963-char pull used.
 *
 * ⛔ THE CONTAINER IS PULLED WHOLE. § 1902(b)(6) read alone is a trap: (b) is
 *    an EIGHT-item exemption list and the briefs lean on exactly one item, so
 *    a reader cannot see which adjacent exemption might fit better — nor that
 *    § 1902(a) imposes the tax on "every domestic or foreign corporation …
 *    doing business in this State", which is the clause (b)(6) carves out of.
 *    § 1903 (taxable income) and § 1904 (returns) sit in the same chapter and
 *    decide whether a RETURN is owed even where no TAX is — the exact
 *    zero-tax-still-owes-a-return trap this repo has now hit in two states.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-income-tax-chapter.pull.play.ts"
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
 *    with a plain space misses — and the miss is invisible, because both render
 *    identically on screen and in grep output.
 *
 *    every char below maps ONE-TO-ONE onto a space, so indices stay valid. the
 *    markers are tested against THIS copy; the ORIGINAL bytes are what get
 *    written to disk. a reflow of a statute is its own defect.
 */
const asComparable = (body: string): string =>
  body.replace(/[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ');

export const action = async (input: { page: Page }) => {
  const page = input.page;

  fs.mkdirSync(OUT, { recursive: true });

  // ⭐ read out of the nav harvest, never constructed.
  const url = 'https://delcode.delaware.gov/title30/c019/index.html';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const body = await page.evaluate(() => document.body.innerText);
  const cmp = asComparable(body);

  // ⛔ every marker is asserted POSITIVELY — a grep's SILENCE cannot be told
  //    apart from a bad needle, so an absent hit must name WHICH needle missed.
  const wanted = ['§ 1901', '§ 1902', '§ 1903', '§ 1904'];
  const marks = wanted.map((mark) => ({ mark, at: cmp.indexOf(mark) }));
  const missed = marks.filter((m) => m.at === -1).map((m) => m.mark);

  // ⭐ THE QUOTE ITSELF, as its own two-sided check. the whole reason for this
  //    pull is one sentence; a container that loads at full size but renders
  //    (b)(6) behind an accordion would pass every check above.
  const needle =
    'A corporation maintaining a statutory corporate office in the State';
  const needleAt = cmp.indexOf(needle);

  // ⭐ THE NEGATIVE CONTROL. a matcher that matches every input looks identical
  //    to a strong one until a case it MUST NOT match is run through it.
  //    chapter 19 has no § 1999. if this comes back `false`, every marker above
  //    proves naught.
  const controlAbsent = cmp.indexOf('§ 1999') === -1;

  // ⛔ REFUSE a partial container. a file that promises a chapter and holds half
  //    of it is worse than an absent file, because the absence is visible and
  //    the truncation is not.
  const wrote =
    missed.length === 0 &&
    needleAt !== -1 &&
    controlAbsent &&
    body.length > 20000;
  const out = path.join(OUT, 'de-title30-ch19-income-tax.txt');
  if (wrote) fs.writeFileSync(out, body);

  return {
    url,
    chars: body.length,
    // ⛔ a healthy byte count says only that A page loaded. the head goes on the
    //    record so a block page cannot be read as a short document.
    head: body.slice(0, 300).replace(/\s+/g, ' '),
    marks,
    missed,
    needleAt,
    controlAbsent,
    wrote,
    out: wrote ? out : null,
  };
};
