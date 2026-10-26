/**
 * .what = pull the Division of Corporations' own gloss on WHICH fiscal year's
 *         Schedule L anchors a franchise tax report's gross-assets figure
 *
 * .why  = 8 Del. C. § 503(i) anchors it to "the calendar year prior to FILING
 *         with the Secretary of State". for a delinquent filer who amends a
 *         2022 report in 2026, the literal text points at fiscal year 2025 —
 *         four years off the report's own tax year.
 *
 *         the Division's calculator page is widely reported to gloss this as
 *         "prior to the DUE DATE of the report", which would settle the
 *         ambiguity in the intuitive direction. that gloss is NOT on disk
 *         anywhere in this repo, so it must be pulled, never recalled.
 *
 * .note = the url is EARNED, not guessed — corp.delaware.gov/frtaxcalc/ is
 *         already cited from prior bhrowser pulls in 6 places in this repo.
 */

import * as fs from 'fs';
import { chromium } from 'playwright';

const REPO = process.cwd();
const OUT = `${REPO}/src/domain.roles/registrator/briefs/incorporation/variant=c-corp/refs`;

export const action = async () => {
  const ws = fs
    .readFileSync(`${REPO}/.cache/browser.detax/ws-endpoint`, 'utf-8')
    .trim();
  const browser = await chromium.connectOverCDP(ws);
  const page = await browser.contexts()[0]!.newPage();

  await page.goto('https://corp.delaware.gov/frtaxcalc/', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body.innerText);

  // length-stable whitespace normalization: every char below maps ONE-TO-ONE
  // onto a space, so indices stay valid against the original
  const comparable = text.replace(
    /[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g,
    ' ',
  );

  const SOFT404 = 'are you looking for one of these topics';

  const needles = [
    'Total Gross Assets',
    'Schedule L',
    'calendar year prior',
    'due date',
    'fiscal year',
  ];

  const hits = needles.map((n) => {
    const at = comparable.indexOf(n);
    return {
      needle: n,
      found: at !== -1,
      context:
        at === -1
          ? null
          : comparable.slice(Math.max(0, at - 260), at + 400).trim(),
    };
  });

  fs.writeFileSync(`${OUT}/pulledAt=2026-08-26.de-frtaxcalc.txt`, text);

  await page.close();

  return {
    url: 'https://corp.delaware.gov/frtaxcalc/',
    chars: text.length,
    soft404: comparable.toLowerCase().includes(SOFT404),
    head: comparable.slice(0, 400),
    hits,
  };
};
