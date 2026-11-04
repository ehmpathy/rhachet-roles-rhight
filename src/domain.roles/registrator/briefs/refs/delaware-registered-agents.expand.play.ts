/**
 * .what = read the Division's registered-agent directory as a STRUCTURED
 *         TABLE — one row per agent, with the name beside its published
 *         phone, e-mail, and website — so a named agent's row can be read
 *         rather than inferred from the position of a link.
 *
 * .why  = `delaware-registered-agents.pull.play.ts` captured the page with
 *         `innerText` and got 3,593 characters against a directory of ~180
 *         agents. the entries sit in COLLAPSED ACCORDIONS, and `innerText`
 *         is a rendered-text read — it honors `display: none`, so a closed
 *         panel contributes no text at all.
 *
 *         ⚠️ the pull still LOOKED healthy. over the byte-count floor, real
 *            agency content, correct content-type, no soft-404 string, and a
 *            509-link harvest that genuinely held every agent's e-mail and
 *            website. the only tell was a STRUCTURAL one: the link list had
 *            entries the body text could not account for.
 *
 *         ⛔ and the link harvest ALONE cannot answer a question about ONE
 *            NAMED agent. the hrefs arrive in DOM order with no name attached,
 *            so the only way to attribute a row is to count positions between
 *            two neighbors — which is an inference dressed as a reading, and
 *            it silently fails on any agent that publishes neither channel.
 *
 * ⭐ THE CURE IS `textContent`, NOT A CLICK. the panels are in the DOM the
 *    whole time; only their rendering is suppressed. so no interaction is
 *    needed, no form is touched, and the read stays a read.
 *
 *    ⇒ generalize it: when a body-text pull under-reports a link harvest, the
 *      content is present and hidden. reach for `textContent` before you reach
 *      for a click, because a click is an ACT and a read is not.
 *
 * ⛔ NO QUERY IS TYPED AND NO FORM IS FILLED. the url is the one already
 *    earned from the unfiltered harvest at `.scratch/refs/pulls/de.regguide.links.json`
 *    ("Registered Agents" -> corp.delaware.gov/agents/). the agent's OWN domain
 *    is not visited.
 *
 * ⚠️ THE ROW MAY CARRY NO E-MAIL AND NO WEBSITE. that is a REAL RESULT, not a
 *    defect in this playbook — the Division's own disclaimer says the list is
 *    "provided solely as a convenience" and § 132 obliges an agent to keep only
 *    a street address and an open office. report the absence; do not go hunt a
 *    domain to fill the cell.
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

const URL = 'https://corp.delaware.gov/agents/';

/**
 * ⛔ A ZERO-HIT NEEDLE IS NOT A RESULT UNTIL THE INSTRUMENT IS PROVEN.
 *
 * the first run of this file returned `hits: 0` for the one agent this matter
 * turns on — which has TWO causes that look identical from the number alone:
 *
 *   1. the agent is genuinely absent from the Division's list
 *   2. the read, the slice, or the needle is broken
 *
 * so the needle travels with COMPANIONS, and the run is only readable if they
 * behave as declared:
 *
 *   must=true   a string read OFF the page's own link harvest. if this misses,
 *               the instrument is broken and every other cell is void.
 *   must=false  a string that CANNOT be on an agent directory. if this HITS,
 *               the matcher is over-broad and a positive proves little.
 *
 * ⚠️ a probe with only positive controls cannot fail, which is the same defect
 *    as a guard that cannot fail. both controls are owed.
 */
const NEEDLES = [
  { needle: 'legalinc', must: null as boolean | null }, // ⇐ the question
  { needle: 'legalcorpsolutions', must: true }, // ⇐ from the link harvest
  { needle: 'incserv', must: true }, // ⇐ from the link harvest
  { needle: 'registered agent', must: true }, // ⇐ the page's own subject
  { needle: 'zzqxnotanagent', must: false }, // ⇐ MUST miss
];

export const action = async (input: { page: Page }) => {
  const page = input.page;
  fs.mkdirSync(OUT, { recursive: true });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  /**
   * ⭐ read the WHOLE document via textContent, so hidden panels are included,
   *    and keep the rendered-text read beside it — the DELTA between the two
   *    is the measure of how much was hidden, and it is the number that proves
   *    the cure worked.
   */
  const { rendered, whole } = await page.evaluate(() => ({
    rendered: document.body.innerText,
    whole: document.body.textContent ?? '',
  }));

  fs.writeFileSync(path.join(OUT, 'de.agents.whole.txt'), whole);

  /**
   * ⭐ SLICE THE ROW, with a REFUSAL on a missed start marker. a silent miss
   *    would emit the whole document under a name that promises one agent —
   *    which is the exact defect this file exists to avoid.
   *
   * ⚠️ map only a length-STABLE whitespace class, so the indices stay valid
   *    against the original and the slice is faithful to the bytes.
   */
  const comparable = whole.replace(
    /[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g,
    ' ',
  );

  const hay = comparable.toLowerCase();

  const found = NEEDLES.map(({ needle, must }) => {
    /**
     * ⚠️ a SECOND occurrence would mean the needle is ambiguous — two agents
     *    whose names share it — and a slice of the first would be a correct
     *    quote of the wrong row. count them, so ambiguity is loud.
     */
    const hits = hay.split(needle).length - 1;
    const at = hay.indexOf(needle);
    const sliced = at !== -1;
    return {
      needle,
      must,
      hits,
      sliced,
      // ⛔ a control that misbehaves VOIDS the run. name it here rather than
      //    leave a reader to compare two columns by eye.
      controlHeld: must === null ? null : must === sliced,
      row: sliced
        ? whole
            .slice(Math.max(0, at - 200), at + 600)
            .replace(/\s+/g, ' ')
            .trim()
        : null,
    };
  });

  return {
    url: URL,
    // ⭐ the delta IS the proof. a small rendered read beside a large whole
    //    read is the collapsed-accordion signature, stated as a number.
    chars: { rendered: rendered.length, whole: whole.length },
    hidden: whole.length - rendered.length,
    // ⛔ READ THIS CELL FIRST. false ⇒ every verdict below it is void.
    instrumentHeld: found.every((f) => f.controlHeld !== false),
    found,
  };
};
