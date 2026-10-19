/**
 * .what = pull the BODY of Delaware's Document Filing and Certificate Request
 *         Service page, and enumerate every form on it
 * .why  = the route asserts "or file online" and cites this service. the url is
 *         nav-earned and quoted from the Filing Memo PDF — but the PAGE ITSELF
 *         was never pulled. so nobody in this repo has read who may use it,
 *         what it accepts, or what it costs. a link harvest proves a url exists;
 *         it answers no question about the service behind it.
 *
 * ⛔ the url was EARNED, never guessed. it appears in 15+ unfiltered link
 *    harvests of official DE pages already on disk (corp-home, fees, paytaxes,
 *    onlinestatus, cvrmemo, entity-search, renew09, …) AND is quoted verbatim
 *    inside the Filing Memo instruction sheet PDF at
 *    refs/pulledAt=2026-08-23.de-filing-cover-memo.txt:5.
 *
 * ⭐ the harvest is UNFILTERED on purpose. a keyword filter answers only about
 *    its keyword; the question here is "what does this page actually offer",
 *    which only the whole link table can answer.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

const SOFT404 = 'are you looking for one of these topics';

export const action = async (input: { page: Page }) => {
  const page = input.page;

  const url = 'https://corp.delaware.gov/document-upload-service-information/';

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'de.upload-service.txt'), text);
  fs.writeFileSync(path.join(OUT, 'de.upload-service.html'), html);

  // ⭐ UNFILTERED link harvest — every anchor, no keyword screen
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      text: (a.textContent ?? '').trim().replace(/\s+/g, ' '),
      href: (a as HTMLAnchorElement).href,
    })),
  );
  fs.writeFileSync(
    path.join(OUT, 'de.upload-service.links.json'),
    JSON.stringify(links, null, 2),
  );

  // ⚠️ an empty harvest has three causes, and only a body read separates them:
  //    a wrong selector, a genuine absence, or a page that dropped the request.
  //    so report the count AND the head of the body.
  return {
    url,
    chars: text.length,
    links: links.length,
    soft404: text.toLowerCase().includes(SOFT404),
    // named probes — each is a QUESTION the route asserts an answer to
    saysWhoMayUse:
      /who\s+(?:may|can)\s+use|any(?:one|\s+person)|customer/i.test(text),
    saysRegisteredAgent: /registered agent/i.test(text),
    saysCreditCard: /credit card|ACH/i.test(text),
    saysRevival: /revival/i.test(text),
    saysAccount: /create an account|log ?in|register/i.test(text),
    head: text.slice(0, 1200).replace(/\s+/g, ' '),
  };
};
