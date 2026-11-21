/**
 * .what = confirm Delaware's OWN answer to "how long for regular work?"
 * .why  = a revival was filed at Normal (Priority 7). the fee schedule
 *         publishes times for Priority 1-4 and NOT for 7. a prior scratch pull
 *         holds the answer; this re-pulls it live so the bytes can be committed
 *         with a pulledAt= stamp read off the artifact.
 *
 * ⛔ both urls are EARNED, from the UNFILTERED link harvest of
 *    https://corp.delaware.gov/ — see delaware-turnaround.nav.play.ts and
 *    .scratch/refs/pulls/corp.home.links.json. neither was guessed.
 *
 * ⚠️ the FAQ page is an ACCORDION. innerText honors display:none, so a
 *    collapsed answer is INVISIBLE to it while textContent reads every node.
 *    both are captured; the delta IS the collapsed-content signature, and the
 *    needle assertions below run against the WHOLE text.
 *
 * 🟡 every needle is a VERBATIM source string, never our prose. several carry
 *    gerunds that are Delaware's own words and cannot be reworded without
 *    breakage of the match.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

const SOFT404 = 'are you looking for one of these topics'; // the site's own copy

// verbatim fragments off the page — each is a claim we intend to quote
const NEEDLES = [
  'How long will it take to process my Filing/Document request',
  'varies based upon the volume of items received',
  'what date is currently being processed for regular work',
  'upgrading your item to expedited service',
  'All requests are returned regular USPS mail',
  'an e-mail notice will be sent with the amount charged',
];

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  const seen: Record<string, unknown>[] = [];

  const pull = async (slug: string, url: string) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const rendered = await page.evaluate(() => document.body.innerText);
    const whole = await page.evaluate(() => document.body.textContent ?? '');

    fs.writeFileSync(path.join(OUT, `${slug}.txt`), rendered);
    fs.writeFileSync(path.join(OUT, `${slug}.whole.txt`), whole);

    const row = {
      slug,
      url,
      finalUrl: page.url(),
      chars: rendered.length,
      wholeChars: whole.length,
      hiddenChars: whole.length - rendered.length,
      soft404: rendered.toLowerCase().includes(SOFT404),
      // ⚠️ needles run against WHOLE, since a collapsed answer never renders
      needles: NEEDLES.map((n) => ({ n, hit: whole.includes(n) })),
      head: rendered.slice(0, 300).replace(/\s+/g, ' '),
    };
    seen.push(row);
    return { rendered, whole, row };
  };

  const faq = await pull('de.faqs.live', 'https://corp.delaware.gov/faqs/');
  await pull('de.expserv.live', 'https://corp.delaware.gov/expserv/');

  // ⭐ slice the FAQ answer out of the WHOLE text, so the quote is off disk
  //    rather than retyped. a missed marker REFUSES rather than falls through.
  const from = faq.whole.indexOf(NEEDLES[0]!);
  const until = faq.whole.indexOf('When will my credit card or ACH be charged');
  const slice =
    from === -1 || until === -1 || until < from
      ? null
      : faq.whole.slice(from, until).replace(/\s+/g, ' ').trim();

  if (slice) fs.writeFileSync(path.join(OUT, 'de.faqs.answer.txt'), slice);

  return {
    pulls: seen,
    sizeCollision:
      seen[0]!.chars === seen[1]!.chars ? seen.map((s) => s.slug) : null,
    sliced: slice !== null,
    sliceChars: slice?.length ?? 0,
    slice,
  };
};
