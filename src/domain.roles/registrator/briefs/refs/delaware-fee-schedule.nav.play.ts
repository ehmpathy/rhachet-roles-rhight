/**
 * .what = walk Delaware's corporate-fees hub and harvest its UNFILTERED links
 * .why  = three live quote.verify defects across this route (the revival
 *         expedite columns in 4.file.revival, and the good-standing prices in
 *         5.verify.restoration) all rest on one artifact that was never
 *         embedded: the fee schedule.
 *
 * ⛔ the hub url was EARNED — row 19 of the link harvest of
 *    .scratch/refs/pulls/corp.corpfees.html, which is already on disk.
 *
 * 🚨 n=7 — the WORST failure mode here is SUCCESS AT A STALE REVISION: right
 *    form, right agency, healthy bytes, every guard green, and figures from a
 *    superseded revision. so this harvests EVERY pdf link with its text, and
 *    the revision stamp is read off the document before any figure is used.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

const SOFT404 = 'are you looking for one of these topics';

export const action = async (input: { page: Page }) => {
  const page = input.page;

  const hub = 'https://corp.delaware.gov/fee/';
  await page.goto(hub, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      href: (a as HTMLAnchorElement).href,
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  );

  fs.writeFileSync(path.join(OUT, 'corp.fee.hub.txt'), text);
  fs.writeFileSync(path.join(OUT, 'corp.fee.hub.html'), html);

  return {
    hub,
    chars: text.length,
    soft404: text.toLowerCase().includes(SOFT404),
    linkCount: links.length,
    pdfLinks: links.filter((l) => /\.pdf/i.test(l.href)),
    // ⚠️ the pdf filter answers only about pdfs. the schedule may be an html
    //    table or a .docx, so the raw count above is reported beside it and
    //    the body is written to disk for a read either way.
    head: text.slice(0, 500).replace(/\s+/g, ' '),
  };
};
