/**
 * .what = hunt for a PUBLISHED turnaround for Priority 7 / "Normal Processing"
 * .why  = a revival was filed at Normal. the fee schedule
 *         publishes times for Priority 1-4 and NOT for 7, and no brief or ref
 *         on disk states one. the wisher asked "how long does it usually take?"
 *
 * ⛔ every url here is EARNED, never guessed:
 *    - the ecorp banner's "More Info" href comes from a link harvest of the
 *      page whose innerText is already on disk as
 *      refs/pulledAt=2026-08-30.de-ecorp-business-services.txt:4
 *    - the corp.delaware.gov nav is harvested UNFILTERED, so a page whose link
 *      text never names the topic is still visible
 *
 * 🚨 a KEYWORD FILTER answers only about its keyword. the harvest below applies
 *    NO filter; the filtered views are reported BESIDE the raw list, never in
 *    place of it.
 *
 * 🟡 two gerunds below are VERBATIM source strings, never our prose: the
 *    soft-404 needle is the site's own copy, and the priority label is
 *    Delaware's. neither may be reworded without breaking the match.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

const SOFT404 = 'are you looking for one of these topics'; // the site's own copy

const harvest = async (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      href: (a as HTMLAnchorElement).href,
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  );

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  const seen: Record<string, unknown>[] = [];

  const pull = async (slug: string, url: string) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // ⚠️ innerText honors display:none, so a collapsed accordion is INVISIBLE
    //    to it. textContent reads every node. report BOTH — the delta IS the
    //    collapsed-content signature.
    const rendered = await page.evaluate(() => document.body.innerText);
    const whole = await page.evaluate(() => document.body.textContent ?? '');

    const links = await harvest(page);

    fs.writeFileSync(path.join(OUT, `${slug}.txt`), rendered);
    fs.writeFileSync(path.join(OUT, `${slug}.whole.txt`), whole);
    fs.writeFileSync(
      path.join(OUT, `${slug}.links.json`),
      JSON.stringify(links, null, 2),
    );

    const row = {
      slug,
      url,
      finalUrl: page.url(),
      chars: rendered.length,
      wholeChars: whole.length,
      soft404: rendered.toLowerCase().includes(SOFT404),
      linkCount: links.length,
      head: rendered.slice(0, 400).replace(/\s+/g, ' '),
    };
    seen.push(row);
    return { rendered, whole, links, row };
  };

  // 1. the ecorp home page — its banner carries the only live-load statement
  //    found anywhere. harvest to EARN the "More Info" href.
  const ecorp = await pull(
    'ecorp.home',
    'https://icis.corp.delaware.gov/ecorp/',
  );
  const moreInfo = ecorp.links.filter((l) => /more info/i.test(l.text));

  // 2. the corp.delaware.gov hub — the nav that every other page shares
  const hub = await pull('corp.home', 'https://corp.delaware.gov/');

  return {
    pulls: seen,
    // ⭐ two distinct urls that return byte-identical bodies = collapsed slugs
    sizeCollision:
      seen.length > 1 && seen[0]!.chars === seen[1]!.chars
        ? seen.map((s) => s.slug)
        : null,
    moreInfoHrefs: moreInfo,
    // the hub nav, UNFILTERED count + the subset whose TEXT names a candidate.
    // the subset is a convenience; the full list is on disk.
    hubLinkCount: hub.links.length,
    hubCandidates: hub.links.filter((l) =>
      /expedit|turn.?around|status|request|fee|how long/i.test(l.text),
    ),
  };
};
