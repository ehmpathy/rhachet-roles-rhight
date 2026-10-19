/**
 * .what = harvest the DGCL chapter-1 subchapter list from a page ALREADY on
 *         record, so the stock subchapter's url is EARNED rather than typed.
 *
 * .why  = `quote.verify` census. the evidence yield that backs the
 *         notarized attestation now in the Division's hands quotes:
 *
 *           "The board of directors may authorize capital stock to be issued
 *            for cons…"                                     — 8 Del. C. § 152
 *
 *         and § 152 lives in chapter 1 subchapter V, which **has never been
 *         pulled**. the refs dir holds sc01, sc02, sc06, sc07, sc12 and ch. 5.
 *         so the one statute that settles WHEN A SHARE IS ISSUED has no
 *         embedded bytes, in the matter whose entire dispute is how many
 *         shares were issued.
 *
 * ⛔ THE SLUG IS NOT CONSTRUCTED. `sc01`, `sc02`, `sc12` are all on record, so
 *    `sc05` is one keystroke away and would almost certainly land. it is still
 *    a guess, and a guess that lands teaches nothing about the guess that 404s.
 *    a 404 burst on invented paths is the cleanest automation tell a server
 *    has, and the penalty falls on the OPERATOR's access, not on me.
 *    `rule.forbid.guessed-urls`.
 *
 * ⛔ AND THE HARVEST IS UNFILTERED. a filter on `stock` answers only about the
 *    word `stock` — and Delaware titles that subchapter "STOCK AND DIVIDENDS",
 *    which a filter on `§ 152` or `issued` would miss entirely. every anchor is
 *    returned with its text and read by eye afterward.
 *
 * ⚠️ the seed url below is itself on record — it is the revival subchapter
 *    already pulled by `delaware-void-period-accrual.play.ts` and already cited
 *    in `define.void-charter-vs-federal-nol.md`. a peer page knows its own
 *    siblings even when the directory root does not.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-stock-subchapter.nav.play.ts"
 *   rhx browser.stop --session delaware
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

export const action = async (input: { page: Page }) => {
  const page = input.page;

  fs.mkdirSync(OUT, { recursive: true });

  // ⭐ a page ALREADY on record — the revival subchapter. not a new guess.
  const seed = 'https://delcode.delaware.gov/title8/c001/sc12/index.html';
  await page.goto(seed, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  fs.writeFileSync(path.join(OUT, 'de.t8.c001.sc12.seed.txt'), text);
  fs.writeFileSync(path.join(OUT, 'de.t8.c001.sc12.seed.html'), html);

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      href: (a as HTMLAnchorElement).href,
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  );

  fs.writeFileSync(
    path.join(OUT, 'de.t8.c001.sc12.links.json'),
    JSON.stringify(links, null, 2),
  );

  // ⚠️ REPORTED, never filtered down to. the subchapter roman numerals are the
  //    only stable handle — Delaware labels them "Subchapter V. Stock and
  //    Dividends" — so the whole c001 set is returned and read by eye.
  const subchapters = links.filter((l) =>
    /\/title8\/c001\/sc\d+/i.test(l.href),
  );

  // 🚩 MEASURED: the seed page lists only its OWN sections (§ 311-§ 314) and
  //    names no sibling subchapter. so the peer-walk needs a second hop — the
  //    BREADCRUMB, which the harvest above does carry as `text: "Chapter 1"`.
  //
  // ⛔ the hop url is READ OUT of the harvest, never typed. that is the whole
  //    discipline: `c001/index.html` is obvious, and it is still taken from the
  //    page rather than from my fingers.
  const crumb = links.find((l) => /^chapter 1$/i.test(l.text));
  if (!crumb) {
    // ⛔ REFUSE rather than fall back to a typed slug. a nav walk that silently
    //    degrades into a guess is worse than one that stops, because the guess
    //    inherits the credibility of the walk.
    return {
      seed,
      chars: text.length,
      linkCount: links.length,
      crumb: null,
      hop: 'REFUSED',
    };
  }

  await page.goto(crumb.href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const chapText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(path.join(OUT, 'de.t8.c001.index.txt'), chapText);
  fs.writeFileSync(
    path.join(OUT, 'de.t8.c001.index.html'),
    await page.content(),
  );

  const chapLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      href: (a as HTMLAnchorElement).href,
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  );
  fs.writeFileSync(
    path.join(OUT, 'de.t8.c001.index.links.json'),
    JSON.stringify(chapLinks, null, 2),
  );

  // ⚠️ every `sc**` sibling, unfiltered by topic. the roman numeral and the
  //    title are both returned so the stock subchapter is identified by what
  //    Delaware CALLS it, not by a word I expected it to contain.
  const sibs = chapLinks.filter((l) =>
    /\/title8\/c001\/sc\d+\/index\.html$/i.test(l.href),
  );

  return {
    seed,
    chars: text.length,
    // ⛔ a healthy byte count says only that A page loaded. the head is on the
    //    record so a block page cannot be read as a short document.
    head: text.slice(0, 300).replace(/\s+/g, ' '),
    linkCount: links.length,
    // ⛔ a ZERO here is a broken selector, never an absent nav. the control is
    //    that the seed page must know at least its OWN subchapter.
    subchapterCount: subchapters.length,
    knowsItsOwn: subchapters.some((l) => /sc12/i.test(l.href)),
    crumb: crumb.href,
    chapChars: chapText.length,
    // ⛔ the control for the hop: the chapter index must name the subchapter we
    //    ARRIVED from. if it cannot see sc12, its list is not a sibling list.
    hopKnowsSeed: sibs.some((l) => /sc12/i.test(l.href)),
    sibCount: sibs.length,
    sibs,
  };
};
