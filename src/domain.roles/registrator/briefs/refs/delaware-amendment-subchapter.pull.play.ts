/**
 * .what = pull DGCL chapter 1 subchapter VIII — the AMENDMENT container — so the
 *         §241 quote in `define.why-delaware-wants-a-zero-shares-affidavit.md`
 *         has embedded bytes behind it.
 *
 * .why  = `quote.verify` census, against `refs/` alone:
 *
 *           verified: 12 · live defects: 20
 *
 *         two of those defects are Delaware primary law, in a brief that ships
 *         to npm. one — §219(c), the stock ledger — turned out to be an ALTERED
 *         quote of bytes already on disk. the other is this one:
 *
 *           "A certificate setting forth the amendment and certifying that the
 *            corpor…"                                        — 8 Del. C. § 241
 *
 *         and §241 lives in subchapter VIII, which has NEVER been pulled. the
 *         refs dir holds sc01, sc02, sc05, sc06, sc07, sc12 and ch. 5.
 *
 * ⛔ THE SLUG IS NOT CONSTRUCTED. `sc08` is one keystroke from six slugs already
 *    on record, and it would almost certainly land. it is READ OUT of a harvest
 *    instead — `.scratch/refs/pulls/de.t8.c001.index.links.json`, written by
 *    `delaware-stock-subchapter.nav.play.ts`, which walked the chapter index and
 *    returned every anchor unfiltered. the entry is:
 *
 *      href: https://delcode.delaware.gov/title8/c001/sc08/index.html
 *      text: "Subchapter VIII. Amendment of Certificate of Incorporation;
 *             Changes in Capital and Capital Stock"
 *
 *    `rule.forbid.guessed-urls`. a guess that lands teaches naught about the
 *    guess that 404s, and a 404 burst is the cleanest automation tell a server
 *    has — with the penalty on the OPERATOR's access, not on me.
 *
 * ⭐ AND THE FIRST MOVE WAS A READ OF WHAT WE HOLD. the nav walk this url comes
 *    from had ALREADY RUN, days earlier, for a different statute. no second walk
 *    was needed and none was made. a re-walk would have been a live request that
 *    bought a byte already on disk.
 *
 * ⚠️ THE CONTAINER, NOT THE SECTION. §241 authorizes an amendment BEFORE payment
 *    for stock; §242 is the general amendment power; §244 is the reduction of
 *    capital. the brief's whole "relief the zero-issued fact unlocks" section
 *    turns on which of the three applies, and that is a CONTRAST — a §241-only
 *    pull reads as a complete answer about a section whose meaning is fixed by
 *    its neighbours. `rule.require.bhrowser-citations`.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-amendment-subchapter.pull.play.ts"
 *   rhx browser.stop --session delaware
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

// ⛔ read out of the harvest, not typed. see the header.
const URL = 'https://delcode.delaware.gov/title8/c001/sc08/index.html';

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  fs.writeFileSync(path.join(OUT, 'delcode.title8.c001.sc08.txt'), text);
  fs.writeFileSync(path.join(OUT, 'delcode.title8.c001.sc08.html'), html);

  // ⛔ NEEDLES READ OFF THE BRIEF, never written from memory. a needle composed
  //    from recollection is a hypothesis; a two-sided miss is a needle bug, and
  //    that diagnostic only works if the needle came from a real document.
  const needles = {
    // the §241 clause the brief quotes
    s241certificate: 'A certificate setting forth the amendment',
    // the §241 predicate the brief leans on — zero payment received
    s241nopayment: 'has not received any payment for any of its stock',
    // the CONTRAST sections, to prove the container really is the container
    s242: '§ 242',
    s244: '§ 244',
  };

  const found = Object.fromEntries(
    Object.entries(needles).map(([k, v]) => [k, text.includes(v)]),
  );

  // ⛔ a SOFT 404 serves real chrome at exit 200. detect it by the site's own
  //    copy, and report it BESIDE the byte count rather than in place of it.
  const soft404 = /page not found|we could not find/i.test(text);

  return {
    url: URL,
    chars: text.length,
    // ⛔ a healthy byte count says only that A page loaded. the head is on the
    //    record so a block page can never be read as a short document.
    head: text.slice(0, 300).replace(/\s+/g, ' '),
    soft404,
    found,
    // ⛔ THE CONTROL WE MUST FAIL. without it, `found: all true` cannot be told
    //    apart from a matcher that returns true for any input at all.
    controlNegative: text.includes(
      'this phrase is absent from the delaware code',
    ),
  };
};
