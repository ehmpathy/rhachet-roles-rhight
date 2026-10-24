/**
 * .what = answer TWO questions about the entity's registered agent, from the
 *         STATE's own directory rather than from the agent's marketing site:
 *
 *           1. what contact channels has the agent published with Delaware?
 *           2. does the Division publish a list that names a website, so a
 *              portal url can be EARNED rather than constructed?
 *
 * .why  = `corp.delaware.gov/regguide/` line 38 turned the agent contact from
 *         a parallel errand into a PRECONDITION of the filing:
 *
 *           > "Prior to submitting a document that appoints a Registered Agent,
 *           >  the submitter must contact the Registered Agent to verify they
 *           >  agree to act on behalf of the entity."
 *
 *         the revival certificate's Article 2 appoints the agent, so the
 *         certificate cannot go in until that contact has happened. which makes
 *         "which channel do we reach them on?" a blocker rather than a
 *         convenience — and a channel is a url, so it has to be earned.
 *
 * ⛔ THE URL IS EARNED, never constructed. it is read verbatim out of the
 *    UNFILTERED link harvest already on disk at
 *    `.scratch/refs/pulls/de.regguide.links.json`:
 *
 *      "Registered Agents"  ->  https://corp.delaware.gov/agents/
 *
 *    ⚠️ the agent's OWN domain is deliberately NOT visited. a registered-agent
 *       company's login page is exactly the kind of url a plausible guess gets
 *       wrong, and a wrong guess against a credential form is a failed sign-in
 *       attempt on the principal's account. if the Division publishes the
 *       website, we have it. if it does not, that is a real answer and the
 *       phone number on the state's own record is the channel.
 *
 * ⭐ THE DIRECTORY IS LIKELY A FILE, NOT A PAGE. the Division publishes its
 *    agent list as a download. so the pull BRANCHES ON THE RESPONSE rather than
 *    on the url's extension — a `.aspx` or a query-string url may serve a PDF,
 *    and `page.goto` on an attachment raises "Download is starting", which
 *    reads as a broken playbook rather than as the wrong method.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play '<abs path to this file>'
 *   rhx browser.stop --session delaware
 */

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

const SOFT404 = 'are you looking for one of these topics';

/**
 * ⭐ the needles are QUESTIONS. each one is a claim the next step of this
 *    matter would rest on, so a needle that matches no text is a result.
 */
const probe = (text: string) => ({
  saysList: /list of registered agents|agent list|registered agent list/i.test(
    text,
  ),
  saysWebsite: /website|www\.|https?:\/\//i.test(text),
  saysEmail: /@|e-?mail/i.test(text),
  saysPhone: /\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}/.test(text),
  saysDuty: /duty|duties|responsib|§ ?132|section 132/i.test(text),
  saysResign: /resign|resignation/i.test(text),
  saysChange: /change of (?:registered )?agent|change agent/i.test(text),
});

/**
 * ⛔ BRANCH ON THE RESPONSE, NEVER ON THE URL. the extension names the
 *    handler, not the payload — so sniff the magic bytes and report the
 *    content-type either way, so an unhandled shape is on the record rather
 *    than silently guessed at.
 */
const pull = async (page: Page, slug: string, url: string) => {
  const res = await page.request.get(url);
  const body = await res.body();
  const head = body.subarray(0, 8);
  const type = res.headers()['content-type'] ?? '(none)';

  const isPdf = head.subarray(0, 4).toString('latin1') === '%PDF';

  if (isPdf) {
    const pdfAt = path.join(OUT, `${slug}.pdf`);
    const txtAt = path.join(OUT, `${slug}.txt`);
    fs.writeFileSync(pdfAt, body);
    execFileSync('pdftotext', ['-layout', pdfAt, txtAt]);
    const text = fs.readFileSync(txtAt, 'utf-8');
    return {
      slug,
      url,
      kind: 'pdf' as const,
      type,
      chars: text.length,
      links: 0,
      soft404: false,
      ...probe(text),
      head: text.slice(0, 1400).replace(/\s+/g, ' '),
    };
  }

  // ⇒ html: render it, so javascript-built nav is present in the harvest
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(path.join(OUT, `${slug}.txt`), text);
  fs.writeFileSync(path.join(OUT, `${slug}.html`), await page.content());

  // ⭐ UNFILTERED — a keyword filter answers only about its keyword, and the
  //    link that matters here may carry no word we thought to search for
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
    kind: 'html' as const,
    type,
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
    await pull(page, 'de.agents', 'https://corp.delaware.gov/agents/'),
  ];

  /**
   * ⭐ THE SECOND HOP IS DERIVED FROM THE FIRST, never typed. whatever the
   *    agents page links that looks like the directory itself gets pulled on
   *    this same run — and the CANDIDATE SET is reported, so a wrong pick is
   *    visible rather than hidden behind one chosen link.
   */
  const candidates = fs.existsSync(path.join(OUT, 'de.agents.links.json'))
    ? (
        JSON.parse(
          fs.readFileSync(path.join(OUT, 'de.agents.links.json'), 'utf-8'),
        ) as { text: string; href: string }[]
      ).filter((l) => /agent/i.test(l.text) || /agent/i.test(l.href))
    : [];

  for (const [i, c] of candidates.slice(0, 4).entries())
    pulled.push(await pull(page, `de.agents.hop${i}`, c.href));

  /**
   * ⭐ THE COLLISION CHECK. distinct urls that return byte-identical bodies
   *    have been COLLAPSED to one page by the site — and a collapsed page
   *    passes every other guard here.
   */
  const bySize = new Map<number, string[]>();
  for (const p of pulled)
    bySize.set(p.chars, [...(bySize.get(p.chars) ?? []), p.slug]);
  const collided = Array.from(bySize.entries())
    .filter(([, slugs]) => slugs.length > 1)
    .map(([chars, slugs]) => ({ chars, slugs }));

  return { pulled, candidates, collided };
};
