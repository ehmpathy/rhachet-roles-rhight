/**
 * .what = read Stripe's Atlas DOCS root, and the agent-specific page it links
 *         to, for what a founder can see about their own registered agent
 *         without a sign-in — so "is LEGALINC still our agent, and is it
 *         paid?" has a first-party procedure behind it.
 *
 * .why  = `stripe-atlas-registered-agent.nav.play.ts` earned
 *         `https://stripe.com/atlas` off the apex root and found the PRICE of
 *         the agent service — *"$100 annually after your first year (renews
 *         automatically)"* — but that page is a sales page and names no agent
 *         and no procedure. the docs root was in its own link list.
 *
 * ⛔ EVERY URL HERE IS EARNED. `ROOT` below was read verbatim out of
 *    `.scratch/refs/pulls/stripe.hop3.links.json`:
 *
 *      "Docs"  ->  https://docs.stripe.com/atlas
 *
 *    the second hop is derived from THIS page's own harvest. no slug is typed.
 *
 * ⛔ AND NO SIGN-IN IS ATTEMPTED. `dashboard.stripe.com/login` is in the
 *    harvest and is deliberately excluded — the credential is the principal's,
 *    and a failed attempt lands on their account.
 *
 * ⚠️ A DOCS SITE IS THE WORST CASE FOR `innerText`. the twin playbook measured
 *    `docs.stripe.com/development` at 3,278 rendered against 450,854 whole —
 *    **99.3% hidden**, the same signature as a collapsed accordion. so the
 *    read is `textContent` and the delta is reported as a number.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

const ROOT = 'https://docs.stripe.com/atlas';

/**
 * ⛔ A ZERO-HIT NEEDLE IS NOT A RESULT UNTIL THE INSTRUMENT IS PROVEN.
 * the controls below make a "not found" readable.
 */
const NEEDLES = [
  { needle: 'registered agent', must: null as boolean | null }, // ⇐ the question
  { needle: 'legalinc', must: null as boolean | null }, // ⇐ the question
  { needle: 'resign', must: null as boolean | null }, // ⇐ the hazard
  { needle: 'atlas', must: true }, // ⇐ the page's own subject
  { needle: 'zzqxnotonthispage', must: false }, // ⇐ MUST miss
];

const read = async (page: Page, slug: string, url: string) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

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

  // ⚠️ length-STABLE whitespace only, so indices stay valid against the original
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
            .slice(Math.max(0, at - 250), at + 650)
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

  const pulled = [await read(page, 'atlasdocs.root', ROOT)];

  /**
   * ⭐ the hops are DERIVED from this page's OWN harvest. a dead end here is a
   *    real dead end rather than a bad guess.
   *
   * ⛔ `dashboard.` is excluded by name — that host is behind the principal's
   *    credential and must not be touched.
   */
  const harvested = JSON.parse(
    fs.readFileSync(path.join(OUT, 'atlasdocs.root.links.json'), 'utf-8'),
  ) as { text: string; href: string }[];

  const seen = new Set<string>();
  const unique = harvested
    .filter((l) => !/dashboard\./i.test(l.href))
    .filter((l) => /agent|company|maintain|annual|compliance/i.test(l.text))
    .filter((c) => (seen.has(c.href) ? false : (seen.add(c.href), true)));

  for (const [i, c] of unique.slice(0, 4).entries())
    pulled.push(await read(page, `atlasdocs.hop${i}`, c.href));

  // ⭐ distinct urls with byte-identical bodies were DEFAULTED, not answered
  const bySize = new Map<number, string[]>();
  for (const p of pulled)
    bySize.set(p.chars.whole, [...(bySize.get(p.chars.whole) ?? []), p.slug]);

  return {
    harvested: harvested.length,
    candidates: unique.map((u) => u.text),
    collided: Array.from(bySize.entries())
      .filter(([, slugs]) => slugs.length > 1)
      .map(([chars, slugs]) => ({ chars, slugs })),
    pulled,
  };
};
