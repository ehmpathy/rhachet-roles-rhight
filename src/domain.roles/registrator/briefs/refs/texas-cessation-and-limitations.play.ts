import type { Page } from 'playwright';

/**
 * .what = pulls the Texas provisions that decide whether an entity which
 *         transacted business briefly and STOPPED still owes anything.
 * .why  = `rule.require.bhrowser-citations`. both questions below are
 *         answerable from statute alone, for any entity.
 *
 * .the two questions — suppose an out-of-state entity transacted business in
 *   Texas for a short period, then stopped, and filed no Texas report
 *
 *   1. ⭐ does the §9.001 duty SURVIVE cessation? the section is written in
 *      the present tense ("transacts business in this state"). if the duty
 *      runs only while the entity transacts, such an entity has no present
 *      duty to register — and with no application to file, there is no
 *      §9.054(b) late fee to attach to.
 *
 *   2. ⭐ is the franchise-tax half TIME-BARRED? Tax Code §111.201 sets a
 *      four-year assessment limit, which on its face would run out four
 *      years after the activity.
 *
 *      🚩 do NOT stop at §111.201. limitations periods characteristically do
 *      not run while a return is unfiled. the naive read is the dangerous one
 *      here — so §111.203 through §111.207 are pulled WITH it, and the
 *      exceptions are extracted rather than assumed absent.
 *
 * .also = the BOC ch. 9 bytes were never embedded beside the Texas brief,
 *         though the Florida brief embeds its two statutes. this pull closes
 *         that gap so the claims outlive the .gov urls.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session texas
 *   rhx browser.action --session texas \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/texas-cessation-and-limitations.play.ts"
 *   rhx browser.stop --session texas
 */
const OUT = `${process.cwd()}/.temp/texas-cessation`;

const SOURCES: [slug: string, url: string][] = [
  // ⭐ q1 — the registration duty, and whether it is present-tense
  ['boc-9', 'https://statutes.capitol.texas.gov/Docs/BO/htm/BO.9.htm'],

  // ⭐ q2 — the limitations subchapter. pulled WHOLE, so the exceptions
  //         arrive in the same document as the four-year rule and cannot be
  //         read in isolation from it.
  ['tax-111', 'https://statutes.capitol.texas.gov/Docs/TX/htm/TX.111.htm'],

  // the franchise tax itself — §171.001 nexus, §171.203 report duty,
  // §171.255 officer liability. re-pulled so all three live in one artifact.
  ['tax-171', 'https://statutes.capitol.texas.gov/Docs/TX/htm/TX.171.htm'],

  // the agency gloss whose wording diverges 7x from §9.054(b)
  ['sos-foreign', 'https://www.sos.state.tx.us/corp/foreign_outofstate.shtml'],
];

/**
 * .what = the sentences the two questions turn on.
 * .why  = a 44k-char chapter cannot be read by eye without the read itself
 *         becoming the unreliable step. each needle is extracted verbatim so
 *         the brief quotes bytes rather than a recollection of them.
 */
const NEEDLES: [slug: string, label: string, needle: string][] = [
  ['boc-9', 'q1 · the registration trigger', 'must register'],
  ['boc-9', 'q1 · the late fee measure', 'partial calendar year'],
  ['boc-9', 'q1 · the 90-day fee trigger', 'more than 90 days'],
  ['tax-111', 'q2 · the four-year rule', 'four years'],
  ['tax-111', 'q2 · the unfiled-return exception', 'not filed'],
  ['tax-111', 'q2 · fraud / intent exception', 'intent to avoid'],
];

/**
 * .what = the slices that get COMMITTED beside the briefs as source bytes.
 * .why  = `rule.require.embed-source-bytes`. a .gov url rots and the claim
 *         outlives its evidence, so the operative text ships with the brief.
 *
 *         but ch. 171 is 242k chars and ch. 111 is 143k — too large to ship
 *         whole in an npm package. so each is sliced to the subchapter the
 *         brief actually quotes.
 *
 * ⛔ the slice is done HERE, in code, and never by hand. a hand-copied
 *    statute is a corrupted statute waiting to happen —
 *    `rule.forbid.hand-transcription`. re-running this playbook regenerates
 *    every committed ref byte-for-byte.
 */
const SLICES: [slug: string, from: string, to: string, into: string][] = [
  // the whole chapter — 44k is small enough to ship intact, and it is the
  // chapter the Texas registration brief is entirely about
  [
    'boc-9',
    'BUSINESS ORGANIZATIONS CODE',
    '\u0000never-matches\u0000',
    'registrator/briefs/incorporation/foreign-registration/refs/effectiveAt=2007-09-01.tx-boc-9.txt',
  ],
  // the limitations sections — the four-year rule AND its exceptions,
  // together, so §111.201 can never be read apart from §111.205.
  //
  // ⚠️ the end marker is §111.251 (the assignment sections), NOT §111.301.
  // §111.301 also terminates the slice correctly in the sense that it is
  // downstream, but it drags in ~50 sections on assignment and enforcement
  // that this brief never cites — and a file named for limitations that holds
  // the enforcement subchapter is a file whose name lies about its bytes.
  [
    'tax-111',
    'Sec. 111.201.',
    'Sec. 111.251.',
    'accountant/briefs/franchise-tax/state=texas/refs/effectiveAt=1993-09-01.tx-tax-111-limitations.txt',
  ],
  // the report duties — §171.201, .202, .2022, .203, .204 in one slice, so
  // the 2024 carve-out sits beside the duty it does NOT reach
  [
    'tax-171',
    'Sec. 171.201.',
    'Sec. 171.205.',
    'accountant/briefs/franchise-tax/state=texas/refs/effectiveAt=2024-01-01.tx-tax-171-reports.txt',
  ],
];

const ROLES = `${process.cwd()}/src/domain.roles`;

export const action = async (input: {
  page: Page;
}): Promise<{
  out: string;
  pulled: { slug: string; chars: number; ok: boolean; url: string }[];
  found: { slug: string; label: string; needle: string; line: string | null }[];
  sliced: { into: string; chars: number; ok: boolean }[];
}> => {
  const fs = await import('node:fs');
  fs.mkdirSync(OUT, { recursive: true });

  const pulled: { slug: string; chars: number; ok: boolean; url: string }[] =
    [];

  for (const [slug, url] of SOURCES) {
    /*
      ⚠️ branch on the extension. a `.pdf` url fails TWO ways per the server's
      headers — a viewer shell, or a `page.goto` throw of "Download is
      starting" — and only one of them looks like a pull problem. no url here
      is a pdf today, but the branch is free and the last batch that lacked it
      lost three good pulls to a fourth bad one.
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

    // `domcontentloaded` + an explicit settle. `networkidle` is unreliable on
    // hosts that keep a socket warm, and it buys no accuracy on static html.
    await input.page.goto(url, { waitUntil: 'domcontentloaded' });
    await input.page.waitForTimeout(2500);

    const text = await input.page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`${OUT}/${slug}.txt`, text);

    pulled.push({ slug, chars: text.length, ok: text.length > 2000, url });
  }

  const found = NEEDLES.map(([slug, label, needle]) => {
    const at = `${OUT}/${slug}.txt`;
    const line = !fs.existsSync(at)
      ? null
      : (fs
          .readFileSync(at, 'utf-8')
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.toLowerCase().includes(needle.toLowerCase())) ?? null);
    return { slug, label, needle, line };
  });

  const sliced = SLICES.map(([slug, from, to, into]) => {
    const at = `${OUT}/${slug}.txt`;
    const outAt = `${ROLES}/${into}`;
    if (!fs.existsSync(at)) return { into, chars: 0, ok: false };

    const whole = fs.readFileSync(at, 'utf-8');
    const start = whole.indexOf(from);
    const endRaw = whole.indexOf(to, start + 1);
    // a `to` marker that is absent means "run to the end of the document",
    // which is how the whole-chapter case is expressed
    const end = endRaw === -1 ? whole.length : endRaw;

    // ⚠️ a start marker that missed would silently emit the WHOLE document
    // under a name promising a slice. refuse instead.
    if (start === -1) return { into, chars: 0, ok: false };

    const body = whole.slice(start, end);
    fs.mkdirSync(outAt.slice(0, outAt.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(outAt, body);
    return { into, chars: body.length, ok: body.length > 1000 };
  });

  return { out: OUT, pulled, found, sliced };
};
