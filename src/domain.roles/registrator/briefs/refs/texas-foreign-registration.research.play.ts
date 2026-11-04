import type { Page } from 'playwright';

/**
 * .what = pull the Texas foreign-entity registration statutes and the
 *         Secretary of State's own guidance, verbatim
 * .why  = `rule.require.bhrowser-citations` — a summarizer's account of a
 *         statute is not the statute. every quote in the Texas
 *         foreign-registration brief traces to a dump this playbook wrote.
 *
 * .note = the decisive source is BOC ch. 9, and specifically §9.251 — the
 *         statutory list of activities that do NOT constitute "transacting
 *         business". a registration question is answered by that list, never
 *         by a general impression of what an entity does in the state.
 *
 * .note = ch. 9 is pulled WHOLE rather than section by section. the chapter
 *         page carries every section, so one round trip supplies §9.001
 *         (registration required), §9.051/§9.054 (late fee), §9.251 (the
 *         exclusion list), and §9.301 (the bar on court access) at once.
 *
 * to re-run:
 *
 *   rhx browser.start --mode HEADFUL --session texas
 *   rhx browser.action --session texas \
 *     --play "$PWD/src/domain.roles/registrator/briefs/refs/texas-foreign-registration.research.play.ts"
 *   rhx browser.stop --session texas
 *
 * ⚠️ `--play` takes an ABSOLUTE path, or one that starts `./`. a repo-relative
 *    path like `src/...` is read as a MODULE SPECIFIER by the loader and fails
 *    with `Cannot find package 'src'` — which reads like a broken dependency
 *    rather than a bad path.
 */
const OUT = `${process.cwd()}/.temp/texas`;

// ⚠️ the tuple shape is declared, not inferred. `string[][]` makes each
//    destructured element `string | undefined`, which fails the build
const SOURCES: [slug: string, url: string][] = [
  // BOC ch. 9 — foreign entities. carries §9.001, §9.051, §9.054, §9.251,
  // §9.301 in one document
  ['boc-ch9', 'https://statutes.capitol.texas.gov/Docs/BO/htm/BO.9.htm'],
  // the SoS's own page on registration of an out-of-state entity
  ['sos-foreign', 'https://www.sos.state.tx.us/corp/foreign_outofstate.shtml'],
  // the SoS FAQ, which states the consequences of an absent registration
  ['sos-foreign-faq', 'https://www.sos.state.tx.us/corp/foreignfaqs.shtml'],
];

export const action = async (input: {
  page: Page;
}): Promise<{
  out: string;
  pulled: { slug: string; chars: number; ok: boolean; url: string }[];
}> => {
  const fs = await import('node:fs');
  fs.mkdirSync(OUT, { recursive: true });

  const pulled: { slug: string; chars: number; ok: boolean; url: string }[] =
    [];

  for (const [slug, url] of SOURCES) {
    await input.page.goto(url, { waitUntil: 'networkidle' });
    await input.page.waitForTimeout(1200);

    const text = await input.page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`${OUT}/${slug}.txt`, text);

    pulled.push({
      slug,
      chars: text.length,
      // the byte-count check. a short pull is a TRIGGER TO INSPECT, not a
      // verdict — some pages really are short. open the body and look.
      ok: text.length > 2000,
      url,
    });
  }

  return { out: OUT, pulled };
};
