/**
 * .what = close the one cell the five-state sweep left empty: Indiana's ENFORCEMENT and PENALTY
 *         provisions, across both chapters that reach a telephone solicitation
 * .why  = the section walk captured Indiana's prohibitions and disclosure duties but stopped at a
 *         six-link cap, which landed before the enforcement sections. `rule.require.five-state-baseline`
 *         accepts a verbatim cite OR an explicit "none found" per cell — it does not accept a cell
 *         left blank because a loop bound ran out.
 * .note = ⭐ the correction this file records is about a DIAGNOSIS, not a fact. this engagement's
 *         notes said Indiana "blocked on a credential/bot wall". it did not. the official
 *         iga.in.gov urls return "IGA | Not Found" at 425 bytes — a plain 404 from a url shape that
 *         no longer exists. the state was reachable the whole time through a mirror. a wrong
 *         diagnosis of a failure costs as much as a wrong fact, because every later attempt is aimed
 *         at the wrong fix — three prior playbooks in refs/ all retried variants of the dead url.
 *         ⚠️ Justia is a MIRROR, not the official publisher. it is used here because the official
 *         host's url scheme is broken for these chapters, and every quote is marked as mirror-sourced
 *         in the brief that consumes it. that is a stated limitation, not a silent substitution.
 *         ⚠️ the teeth pattern quotes statutory TERMS OF ART verbatim ("knowing", "treble", "deceptive
 *         act"). they are the words the codes use; to reword them would match no statute.
 *         ⚠️ failures are captured per target, never thrown.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const chapters = [
    {
      cite: 'Ind. Code § 24-4.7-5 (enforcement of the do-not-call chapter)',
      url: 'https://law.justia.com/codes/indiana/title-24/article-4-7/chapter-5/',
    },
    {
      cite: 'Ind. Code § 24-5-14 (autodialer chapter, later sections)',
      url: 'https://law.justia.com/codes/indiana/title-24/article-5/chapter-14/',
    },
  ];

  const out: any[] = [];

  for (const chapter of chapters) {
    let links: string[] = [];
    let indexFailure: string | null = null;

    try {
      await page.goto(chapter.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
        if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
      }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

      links = await page.evaluate(() => {
        const acc: string[] = [];
        for (const a of Array.from(document.querySelectorAll('a[href*="/section-"]'))) {
          const href = (a as HTMLAnchorElement).href;
          if (href && acc.indexOf(href) === -1) acc.push(href);
        }
        return acc;
      });
    } catch (e: any) {
      indexFailure = String(e?.message || e).slice(0, 240);
    }

    const hits: any[] = [];
    for (const link of links) {
      let text = '';
      let failure: string | null = null;
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch((e: any) => {
          if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
        }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows
        text = await page.evaluate(() => {
          const region = document.querySelector('.codes-content') || document.body;
          return ((region as HTMLElement)?.innerText || '').replace(/\s+/g, ' ').trim();
        });
      } catch (e: any) {
        failure = String(e?.message || e).slice(0, 200);
      }

      // keep only the sections that actually carry teeth. terms of art, see .note
      const teethHunted =
        /((?:deceptive act|civil penalty|damages|injunction|attorney general|knowing|treble|violation of this chapter|three times|\$500|\$1,000|\$5,000|\$25,000)[\s\S]{0,320})/gi;
      const teeth: string[] = [];
      let t: RegExpExecArray | null;
      while ((t = teethHunted.exec(text)) !== null) {
        teeth.push(t[0]);
        if (teeth.length >= 3) break;
      }

      if (teeth.length > 0 || failure)
        hits.push({ url: link, bytes: text.length, failure, teethCount: teeth.length, teeth });
    }

    out.push({
      cite: chapter.cite,
      indexUrl: chapter.url,
      indexFailure,
      sectionsSeen: links.length,
      // ⭐ a named verdict — a blank cell is never acceptable
      verdict: indexFailure
        ? `INDEX-FAILED — ${indexFailure}`
        : links.length === 0
          ? 'NO-SECTION-LINKS — the index rendered but exposed no section anchors'
          : hits.length === 0
            ? `NO-TEETH-FOUND across ${links.length} sections — record as an explicit "none found", never as a blank cell`
            : `${hits.length} of ${links.length} section(s) carry enforcement or penalty language`,
      hits,
    });
  }

  const anySections = out.some((o) => o.sectionsSeen > 0);
  if (!anySections)
    throw new UnexpectedCodePathError(
      'neither Indiana chapter index exposed a single section link.\n' +
        '  context: the same host and selector walked 12 Indiana sections minutes ago.\n' +
        '  fix: re-run; do NOT record "Indiana has no penalties" from a broken capture.',
    );

  return { chapters: out.length, out };
};
