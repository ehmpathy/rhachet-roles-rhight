/**
 * .what = walk Stripe's OWN navigation to find what it publishes about the
 *         registered agent an Atlas-formed corporation is assigned — so a
 *         question about "who is our agent, and where do we reach them"
 *         can be answered from a first-party page rather than a guess.
 *
 * .why  = an entity formed through a formation service is assigned a
 *         registered agent by that service. the STATE's record names the
 *         agent (it must — 8 Del. C. § 132), but the state publishes no
 *         credential, no portal, and no account relationship. the account
 *         that is charged each year does, and it belongs to the service.
 *
 * ⛔ NO URL IS CONSTRUCTED. the walk opens ONE well-known company root and
 *    then follows links READ OFF THAT PAGE. a docs host, a help host, and a
 *    support path are all plausible slugs and all guesses — and a burst of
 *    404s against a vendor is the cleanest automation tell a server has.
 *    see `rule.forbid.guessed-urls`.
 *
 * ⛔ AND NO LOGIN IS ATTEMPTED. the dashboard is behind a credential the
 *    principal holds and this playbook does not. a wrong guess against a
 *    credential form is a failed sign-in ON THE PRINCIPAL'S ACCOUNT, which
 *    is a worse failure than no answer at all.
 *
 * ⭐ READ WITH `textContent`, NOT `innerText`. a vendor site is the exact
 *    shape that hides content behind disclosure widgets, and `innerText` is
 *    a RENDERED-text read — it honors `display: none`, so a closed panel
 *    contributes no text. the DELTA between the two reads is the measure of
 *    how much was hidden, and it is reported as a number rather than left to
 *    a reader's hunch.
 *
 * ⚠️ AN UNFILTERED HARVEST, ALWAYS. a keyword filter answers only about its
 *    keyword — a hunt for `agent` cannot find a link whose text is `Atlas`
 *    or `Legal`. harvest every link, then read the list.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play '<abs path to this file>'
 *   rhx browser.stop --session delaware
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

/**
 * the one url that is not earned, and why that is acceptable here: it is the
 * company's own apex domain, which is not a slug guess — there is no path to
 * get wrong, and a 404 is not reachable. every OTHER url in this run is read
 * off a page.
 */
const ROOT = 'https://stripe.com/';

/**
 * ⛔ A ZERO-HIT NEEDLE IS NOT A RESULT UNTIL THE INSTRUMENT IS PROVEN.
 *
 * each needle travels with a declared expectation, so a run that reports
 * "not found" can be told apart from a run whose read, slice, or matcher is
 * broken:
 *
 *   must=true   a string that MUST be on any Stripe page. if this misses,
 *               the read is broken and every other cell is void.
 *   must=false  a string that CANNOT be on it. if this HITS, the matcher is
 *               over-broad and a positive proves little.
 *   must=null   the actual question.
 */
const NEEDLES = [
  { needle: 'registered agent', must: null as boolean | null }, // ⇐ the question
  { needle: 'atlas', must: null as boolean | null }, // ⇐ the question
  { needle: 'stripe', must: true }, // ⇐ the site's own name
  { needle: 'zzqxnotonthispage', must: false }, // ⇐ MUST miss
];

const read = async (page: Page, slug: string, url: string) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  const { rendered, whole, links, title } = await page.evaluate(() => ({
    rendered: document.body.innerText,
    whole: document.body.textContent ?? '',
    title: document.title,
    links: Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 90),
      href: (a as HTMLAnchorElement).href,
    })),
  }));

  fs.writeFileSync(path.join(OUT, `${slug}.whole.txt`), whole);
  fs.writeFileSync(
    path.join(OUT, `${slug}.links.json`),
    JSON.stringify(links, null, 2),
  );

  /**
   * ⚠️ map only a length-STABLE whitespace class, so indices stay valid
   *    against the original and any slice is faithful to the bytes.
   */
  const hay = whole
    .replace(/[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
    .toLowerCase();

  const found = NEEDLES.map(({ needle, must }) => {
    const hits = hay.split(needle).length - 1;
    const at = hay.indexOf(needle);
    const sliced = at !== -1;
    return {
      needle,
      must,
      hits,
      controlHeld: must === null ? null : must === sliced,
      row: sliced
        ? whole
            .slice(Math.max(0, at - 150), at + 450)
            .replace(/\s+/g, ' ')
            .trim()
        : null,
    };
  });

  return {
    slug,
    url,
    title,
    chars: { rendered: rendered.length, whole: whole.length },
    hidden: whole.length - rendered.length,
    links: links.length,
    // ⛔ READ THIS CELL FIRST. false ⇒ every verdict below it is void.
    instrumentHeld: found.every((f) => f.controlHeld !== false),
    found,
  };
};

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  const pulled = [await read(page, 'stripe.root', ROOT)];

  /**
   * ⭐ the SECOND hop is DERIVED, never typed. every candidate below was read
   *    off the root's own link list — so a dead end here is a real dead end,
   *    not a bad guess.
   */
  const harvested = JSON.parse(
    fs.readFileSync(path.join(OUT, 'stripe.root.links.json'), 'utf-8'),
  ) as { text: string; href: string }[];

  const candidates = harvested.filter((l) =>
    /atlas|incorporat|docs|support|help/i.test(l.text + ' ' + l.href),
  );

  /**
   * ⚠️ DEDUPE by href. a nav that repeats a link in a header and a footer
   *    would otherwise spend the whole budget on one page.
   */
  const seen = new Set<string>();
  const unique = candidates.filter((c) =>
    seen.has(c.href) ? false : (seen.add(c.href), true),
  );

  for (const [i, c] of unique.slice(0, 5).entries())
    pulled.push(await read(page, `stripe.hop${i}`, c.href));

  /**
   * ⭐ A SIZE COLLISION MEANS THE SITE COLLAPSED YOUR SLUGS. distinct urls
   *    that return byte-identical bodies have not been answered; they have
   *    been defaulted. a single-url pull cannot detect this at all.
   */
  const bySize = new Map<number, string[]>();
  for (const p of pulled)
    bySize.set(p.chars.whole, [...(bySize.get(p.chars.whole) ?? []), p.slug]);

  return {
    harvested: harvested.length,
    candidates: unique.length,
    collided: Array.from(bySize.entries())
      .filter(([, slugs]) => slugs.length > 1)
      .map(([chars, slugs]) => ({ chars, slugs })),
    pulled,
  };
};
