import type { Page } from 'playwright';

/**
 * .what = pull the Florida statutes and Department of Revenue guidance that
 *         fix what a corporation with a Florida office actually owes
 * .why  = `rule.require.bhrowser-citations` — a summarizer's account of a
 *         statute is not the statute. every quote in the Florida tax briefs
 *         traces to a dump this playbook wrote.
 *
 * .note = the decisive question is NOT the rate. it is WHICH DUTIES ATTACH,
 *         and they come from three different chapters administered by two
 *         different agencies:
 *           ch. 220 — corporate income tax        (Dept of Revenue)
 *           ch. 607 — the right to operate here   (Dept of State)
 *           ch. 212 — sales and use tax           (Dept of Revenue)
 *         a review that reads only ch. 220 answers a third of the question.
 *
 * .note = §220.14's exemption and §220.222's due date are pulled because a
 *         zero-tax outcome does NOT imply a zero-return outcome — the same
 *         trap already documented for Texas in
 *         `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report`.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session fltax
 *   rhx browser.action --session fltax \
 *     --play "$PWD/src/domain.roles/accountant/briefs/refs/florida-corporate-tax.research.play.ts"
 *   rhx browser.stop --session fltax
 *
 * ⚠️ `--play` takes an ABSOLUTE path, or one that starts `./`. a repo-relative
 *    path like `src/...` is read as a MODULE SPECIFIER by the loader and fails
 *    with `Cannot find package 'src'` — which reads like a broken dependency
 *    rather than a bad path.
 */
const OUT = `${process.cwd()}/.temp/fltax`;

// the agency hubs, walked at the foot of this playbook rather than guessed.
// two url guesses were 404s in the Texas pass; the fix is permanent.
const HUBS: [slug: string, url: string][] = [
  ['dor-hub', 'https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx'],
];

// ⚠️ the tuple shape is declared, not inferred. `string[][]` makes each
//    destructured element `string | undefined`, which fails the build
const SOURCES: [slug: string, url: string][] = [
  // ── ch. 220, corporate income tax ────────────────────────────────────
  // who is a taxpayer, and how far the statutory reach extends
  ['fl-220.03', 'https://www.flsenate.gov/Laws/Statutes/2024/220.03'],
  // the tax imposed, and on whom
  ['fl-220.11', 'https://www.flsenate.gov/Laws/Statutes/2024/220.11'],
  // the exemption — the reason a small corp often owes $0
  ['fl-220.14', 'https://www.flsenate.gov/Laws/Statutes/2024/220.14'],
  // ⭐ WHO MUST FILE. the sentence that decides whether $0 tax still owes a
  //    return
  ['fl-220.22', 'https://www.flsenate.gov/Laws/Statutes/2024/220.22'],
  // when the return is due
  ['fl-220.222', 'https://www.flsenate.gov/Laws/Statutes/2024/220.222'],
  // the penalty for a return not filed
  ['fl-220.801', 'https://www.flsenate.gov/Laws/Statutes/2024/220.801'],

  // ── ch. 607, the right to operate in Florida at all ──────────────────
  // ⭐ a foreign corporation may not transact business until authorized —
  //    and the statutory list of what does NOT count
  ['fl-607.1501', 'https://www.flsenate.gov/Laws/Statutes/2024/607.1501'],
  // ⭐ the consequences of operation without authority
  ['fl-607.1502', 'https://www.flsenate.gov/Laws/Statutes/2024/607.1502'],
  // the annual report every authorized entity owes
  ['fl-607.1622', 'https://www.flsenate.gov/Laws/Statutes/2024/607.1622'],
  // the fee schedule behind the annual report and the late penalty
  ['fl-607.0122', 'https://www.flsenate.gov/Laws/Statutes/2024/607.0122'],

  // ── ch. 212, sales and use tax ───────────────────────────────────────
  // who must register as a dealer
  ['fl-212.18', 'https://www.flsenate.gov/Laws/Statutes/2024/212.18'],

  // ── the agency's own guidance ────────────────────────────────────────
  [
    'dor-corporate',
    'https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx',
  ],
  [
    'dor-registration',
    'https://floridarevenue.com/taxes/registration/Pages/default.aspx',
  ],
];

export const action = async (input: {
  page: Page;
}): Promise<{
  out: string;
  pulled: { slug: string; chars: number; ok: boolean; url: string }[];
  hubLinks: { text: string; href: string }[];
}> => {
  const fs = await import('node:fs');
  fs.mkdirSync(OUT, { recursive: true });

  const pulled: { slug: string; chars: number; ok: boolean; url: string }[] =
    [];

  for (const [slug, url] of SOURCES) {
    /*
      ⚠️ A `.pdf` URL MUST NOT GO THROUGH `page.goto`.
      per the server's headers it fails one of two ways: a viewer shell (a
      short, useless pull) or a `page.goto` throw that reads as a broken
      playbook rather than a wrong method. branch on the extension and both
      are avoided.
    */
    if (url.endsWith('.pdf')) {
      const res = await input.page.request.get(url);
      const pdfAt = `${OUT}/${slug}.pdf`;
      fs.writeFileSync(pdfAt, await res.body());
      const { execFileSync } = await import('node:child_process');
      execFileSync('pdftotext', ['-layout', pdfAt, `${OUT}/${slug}.txt`]);
      const bytes = fs.readFileSync(`${OUT}/${slug}.txt`, 'utf-8');
      pulled.push({ slug, chars: bytes.length, ok: bytes.length > 2000, url });
      continue;
    }

    await input.page.goto(url, { waitUntil: 'networkidle' });
    await input.page.waitForTimeout(1200);

    const text = await input.page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`${OUT}/${slug}.txt`, text);

    pulled.push({
      slug,
      chars: text.length,
      // the byte-count check. a short pull is a TRIGGER TO INSPECT, not a
      // verdict — some statutes really are short, and the most decisive page
      // of the Texas pull came back under this threshold. open the body.
      ok: text.length > 2000,
      url,
    });
  }

  // the nav walk. runs LAST so a hub reshuffle cannot disturb the pulls above.
  // this exists because two invented slugs 404'd in the Texas pass; an agency's
  // own link list is the only reliable source of its urls.
  const hubLinks: { text: string; href: string }[] = [];
  for (const [, hubUrl] of HUBS) {
    await input.page.goto(hubUrl, { waitUntil: 'networkidle' });
    const links = await input.page.evaluate(() =>
      Array.from(document.querySelectorAll('a'))
        .map((a) => ({ text: (a.textContent ?? '').trim(), href: a.href }))
        .filter((l) => l.text.length > 0),
    );
    hubLinks.push(...links);
  }

  return { out: OUT, pulled, hubLinks };
};
