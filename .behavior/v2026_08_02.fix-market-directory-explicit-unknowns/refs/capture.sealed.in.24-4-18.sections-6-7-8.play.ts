/**
 * .what = capture the three operative sections of Ind. Code ch. 24-4-18 (Criminal History
 *         Providers): § -6 (prohibited information), § -7 (data updates), § -8 (violation
 *         is a deceptive act; application of the federal FCRA)
 *
 * .why  = the chapter-index capture confirmed the chapter exists and named its sections, but
 *         an index is not citable text. these three carry the whole Indiana cell:
 *
 *           -6  what a provider may NOT publish        → the prohibition itself
 *           -7  the duty to update stale data          → the decay obligation
 *           -8  remedy + how it meshes with the FCRA   → whether this stacks on the federal
 *                                                        gate or is displaced by it
 *
 *         § -8 is the sharpest of the three: if a state statute expressly speaks to the
 *         federal FCRA's application, then the federal-only analysis in
 *         hazard.consumer-report-gate is incomplete for Indiana, and the same question is
 *         probably live in the other four states.
 *
 * .note  = one playbook, three navigations, three outputs. kept batched because the three
 *          sections are read as a unit, and split captures would invite a partial read of a
 *          chapter whose sense depends on all three.
 *          iga.in.gov remains a javascript app that yields navigation chrome only; the
 *          Justia section-grain mirror is the sanctioned fallback under
 *          rule.require.five-state-baseline, per the IC 32-36-1-* captures.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { HelpfulError } from 'helpful-errors';
import type { Browser, Page } from 'playwright';
import { allowTimeoutOnly } from './allowTimeoutOnly';

const TARGETS = [
  {
    section: '24-4-18-6',
    url: 'https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/section-24-4-18-6/',
    output: '.temp/capture/sealed.in.24-4-18-6.txt',
  },
  {
    section: '24-4-18-7',
    url: 'https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/section-24-4-18-7/',
    output: '.temp/capture/sealed.in.24-4-18-7.txt',
  },
  {
    section: '24-4-18-8',
    url: 'https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/section-24-4-18-8/',
    output: '.temp/capture/sealed.in.24-4-18-8.txt',
  },
];

export const action = async (input: { page: Page; browser: Browser }) => {
  const results = [];

  for (const target of TARGETS) {
    await input.page.goto(target.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });

    // best-effort only — the marker assertion below is the gate.
    await input.page
      .waitForSelector('#codes-content', { timeout: 30_000 })
      .catch(allowTimeoutOnly);

    const text = await input.page.evaluate(() => {
      const node = document.querySelector('#codes-content') ?? document.body;
      return (node as HTMLElement).innerText;
    });

    // fail loud rather than persist a shell read as if it were a citable capture.
    //
    // ⭐ assert the MARKER, not a byte floor — and THIS playbook is the proof of
    // why. §§ 24-4-18-7 and -8 capture at 704 and 378 bytes; both are valid and
    // both bear weight in the brief. any floor above ~1kb would have rejected
    // them. short statutes are legitimately short, so length cannot tell a
    // two-sentence statute from a shell. the section number can.
    if (!text.includes(target.section))
      HelpfulError.throw('capture lacks its section marker', {
        marker: target.section,
        bytes: text.length,
        url: target.url,
        hint: 'the mirror may have redirected to a search or 404 page — confirm the section path, and note the mirror fallback in the brief .sources',
      });

    mkdirSync(dirname(target.output), { recursive: true });
    writeFileSync(target.output, `SOURCE: ${target.url}\n\n${text}`, 'utf8');

    results.push({
      section: target.section,
      bytes: text.length,
      output: target.output,
    });
  }

  return { results };
};
