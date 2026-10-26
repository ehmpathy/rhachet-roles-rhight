/**
 * .what = answer ONE question with the Division's own bytes: when a document is
 *         submitted through the online upload service rather than mailed with a
 *         check, does a COVER LETTER still belong in the submission, and does it
 *         count as an additional page at $9.00?
 *
 * .why  = the route file `4.submit.on=2026-08-27…grain=draft.md` carries a table
 *         whose `cover memo?` column reads ⛔ no for the card/ACH path. that
 *         column is CORRECT and it answers a DIFFERENT QUESTION than the one
 *         asked here:
 *
 *           "Filing Cover Memo" / "Document Filing Sheet"
 *             = the Division's OWN routing form — priority squares, check #,
 *               return method. check path only, and its own instruction sheet
 *               says so: "Only use this form if sending to our office by mail
 *               or courier service and are paying by Check."
 *
 *           "cover letter"
 *             = OUR letter, on OUR letterhead, name + address + telephone.
 *               asked for by the Revival packet's cover page, with NO channel
 *               caveat attached.
 *
 *         ⭐ the repo had already drawn that distinction once — a fabricated
 *            block quote was caught earlier precisely because it said
 *            "cover letter" where the source says "Filing Cover Memo". the
 *            correction landed in the tips brief and NEVER REACHED the submit
 *            file, which then used the memo answer to settle the letter
 *            question implicitly. the cure did not move sideways.
 *
 * ⛔ BOTH URLS ARE EARNED, never constructed. each is read verbatim out of the
 *    UNFILTERED link harvest already on disk at
 *    `.scratch/refs/pulls/de.upload-service.links.json`, itself produced by
 *    `delaware-document-upload-service.pull.play.ts`:
 *
 *      "Details on How to Submit an Order"  -> corp.delaware.gov/regguide/
 *      "eCorp Business Services"            -> icis.corp.delaware.gov/ecorp2
 *
 * ⛔ NO FORM IS SUBMITTED AND NO QUERY IS TYPED. a query is a url, and a live
 *    query against a state filing system on the principal's account is a real
 *    request with real consequences. this playbook READS two public pages and
 *    stops. it does not log in, does not upload, and does not fill a field.
 *
 * ⚠️ THE SECOND PAGE MAY REFUSE TO ANSWER. `ecorp2` is a portal landing page
 *    and the upload form probably sits behind a session. a landing page that
 *    renders fine and carries no field list is a REAL RESULT — it means the
 *    field set cannot be read without an account, which is itself the answer to
 *    "can we settle this without logging in?". report it; do not push past it.
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

const SOFT404 = 'are you looking for one of these topics';

/**
 * ⭐ the needles are QUESTIONS, each one a claim some artifact in this repo
 *    already asserts an answer to. a needle that matches no text is a result.
 */
const probe = (text: string) => ({
  saysCoverLetter: /cover letter/i.test(text),
  saysCoverMemo: /cover memo|filing memo|document filing sheet/i.test(text),
  saysAdditionalPage: /additional page|each page|per page/i.test(text),
  saysMargins: /margin/i.test(text),
  saysLegible: /legible/i.test(text),
  saysAttachment: /attach|upload|pdf/i.test(text),
  saysComments: /comments|filing instructions/i.test(text),
  saysAccountRequired: /create an account|must (?:log ?in|register)/i.test(
    text,
  ),
});

const pull = async (page: Page, slug: string, url: string) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  fs.writeFileSync(path.join(OUT, `${slug}.txt`), text);
  fs.writeFileSync(path.join(OUT, `${slug}.html`), html);

  // ⭐ UNFILTERED — a keyword filter answers only about its keyword
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      text: (a.textContent ?? '').trim().replace(/\s+/g, ' '),
      href: (a as HTMLAnchorElement).href,
    })),
  );
  fs.writeFileSync(
    path.join(OUT, `${slug}.links.json`),
    JSON.stringify(links, null, 2),
  );

  return {
    slug,
    url,
    chars: text.length,
    links: links.length,
    soft404: text.toLowerCase().includes(SOFT404),
    ...probe(text),
    // ⚠️ a short pull is a TRIGGER TO INSPECT, never a verdict. carry the body
    //    head so the number is never the only thing on the record.
    head: text.slice(0, 1400).replace(/\s+/g, ' '),
  };
};

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  const pulled = [
    await pull(page, 'de.regguide', 'https://corp.delaware.gov/regguide/'),
    await pull(page, 'de.ecorp2', 'https://icis.corp.delaware.gov/ecorp2'),
  ];

  /**
   * ⭐ THE COLLISION CHECK. distinct urls that return byte-identical bodies
   *    have been COLLAPSED to one page by the site — and a collapsed page
   *    passes every other guard here: healthy size, correct content-type,
   *    no soft-404 string, and a needle probe that silently answers about
   *    the wrong document.
   */
  const bySize = new Map<number, string[]>();
  for (const p of pulled)
    bySize.set(p.chars, [...(bySize.get(p.chars) ?? []), p.slug]);
  const collided = Array.from(bySize.entries())
    .filter(([, slugs]) => slugs.length > 1)
    .map(([chars, slugs]) => ({ chars, slugs }));

  return { pulled, collided };
};
