/**
 * .what = pull DGCL chapter 1 subchapter III — the REGISTERED OFFICE AND
 *         REGISTERED AGENT container, §§ 131-136 — so article 2 of a certificate
 *         of revival has the statute behind it rather than a form's instructions.
 *
 * .why  = § 312(d)(2) does not state the address format itself. it DELEGATES:
 *
 *           "The address (which shall be stated in accordance with § 131(c) of
 *            this title) of the corporation's registered office in this State
 *            and the name of its registered agent at such address"
 *
 *         and § 131(c) was NOT on disk. the refs dir holds sc01, sc02, sc05,
 *         sc06, sc07, sc08, sc12 and ch. 5 — the §§ 121-127 of sc02 stop one
 *         subchapter short of the sections this delegation points at.
 *
 *         so every article-2 value in the SANDPINE certificate was sourced from
 *         the Division's own form instructions rather than from the section
 *         those instructions implement. probably right, and NOT verified —
 *         which is the state this pull exists to end.
 *
 * ⭐ A SECOND, INDEPENDENT REASON THE DELEGATION BINDS. § 103(j), already on
 *    disk at `de-title8-ch1-sc01-formation.txt:163`:
 *
 *      "any certificate or other document filed under this chapter on or after
 *       August 1, 2011, and changing the address of a registered office shall
 *       comply with § 131(c) of this title."
 *
 *    ⇒ the requirement is not peculiar to § 312. it reaches every ch. 1 document
 *      that carries a registered-office address, which a revival certificate is.
 *
 * ⛔ THE SLUG IS NOT CONSTRUCTED. `sc03` is one keystroke from eight slugs
 *    already on record and would almost certainly land. it is READ OUT of a
 *    harvest instead — `.scratch/refs/pulls/de.t8.c001.index.links.json`, the
 *    unfiltered anchor walk written by `delaware-stock-subchapter.nav.play.ts`.
 *    the entry, verbatim:
 *
 *      href: https://delcode.delaware.gov/title8/c001/sc03/index.html
 *      text: "Subchapter III. Registered Office and Registered Agent"
 *
 *    `rule.forbid.guessed-urls`. a guess that lands teaches naught about the
 *    guess that 404s, and the penalty for a 404 burst lands on the OPERATOR.
 *
 * ⭐ AND THE FIRST MOVE WAS A READ OF WHAT WE HOLD — twice, and the second read
 *    nearly cancelled this pull. an anchored grep (`^§ 1[23][0-9]\.`) returned
 *    only sc02's §§ 121-127. a LOOSER grep then hit `sc01-formation.txt`, which
 *    reads like the body had been on disk all along. it had not: both hits are
 *    CROSS-REFERENCES (§ 102(a)(2) and § 103(j)), not the section. the looser
 *    grep still earned its keep — it bought § 103(j) above.
 *
 * ⚠️ THE CONTAINER, NOT THE SECTION. a § 131-only pull answers the address
 *    format and leaves the neighbours dark — and the neighbours are live in this
 *    matter. §§ 132-136 carry the registered agent's own duties, and the open
 *    question "should LEGALINC have warned me before the charter went void?" has
 *    been UNANSWERABLE for exactly as long as this subchapter has been absent.
 *    `rule.require.bhrowser-citations`.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session delaware
 *   rhx browser.action --session delaware \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/delaware-agent-subchapter.pull.play.ts"
 *   rhx browser.stop --session delaware
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from 'playwright';

const OUT = path.join(process.cwd(), '.scratch/refs/pulls');

// ⛔ read out of the harvest, not typed. see the header.
const URL = 'https://delcode.delaware.gov/title8/c001/sc03/index.html';

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  fs.writeFileSync(path.join(OUT, 'delcode.title8.c001.sc03.txt'), text);
  fs.writeFileSync(path.join(OUT, 'delcode.title8.c001.sc03.html'), html);

  // ⛔ NEEDLES READ OFF DOCUMENTS ALREADY ON DISK, never written from memory.
  //    a needle composed from recollection is a hypothesis, and the two-sided
  //    miss diagnostic only discriminates when the needle came from real bytes.
  const needles = {
    // the section the delegation points at — the whole reason for this pull
    s131: '§ 131.',
    // the CONTRAST sections, to prove the container really is the container
    s132: '§ 132.',
    s136: '§ 136.',
    // the subchapter's own title, read off the harvest entry verbatim
    title: 'Registered Office and Registered Agent',
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
    // ⛔ a healthy byte count says only that A page loaded. the head goes on the
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
