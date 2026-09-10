/**
 * .what = a single fresh pull of the mini-TCPA layer across the five baseline states (TX · IN · FL ·
 *         CA · NY), which captures BOTH halves the shipped briefs disclaim: the state CONSENT
 *         standard and the state PENALTY teeth, graded per state
 * .why  = every shipped comms brief is federal-only and says so. a sender's real standard is the
 *         strictest that applies in a served state, so both "how to prove consent" and "what is
 *         exposure" are incomplete without this layer. `rule.require.five-state-baseline` requires
 *         a verbatim cite per cell or an explicit "none found".
 * .note = ⛔ this is a DELIBERATE RE-PULL. playbooks for four of these states already sit in refs/,
 *         and their existence does NOT establish what their output says. the rule in force is that a
 *         source not read from a capture THIS session is a source asserted from memory, and this
 *         engagement has already shipped three wrong URLs written exactly that way.
 *         ⭐ every target is graded ON ITS OWN and a failure is CAPTURED, never thrown. Indiana has
 *         blocked repeatedly on this engagement; a throw there would destroy four good captures to
 *         report one known problem. a per-target `ok:false` is itself the result.
 *         ⚠️ Indiana gets FOUR candidate urls because the prior attempts all aimed at IC 24-4.7 (the
 *         do-not-call registry) — the autodialer chapter is IC 24-5-14, a different article that no
 *         prior playbook requested. this may be why Indiana "blocked": the wrong page was asked for.
 *         ⚠️ no inner named function may be declared inside page.evaluate — the transpiler wraps such
 *         functions in a `__name` helper that does not exist in the page realm.
 *         ⚠️ `helpful-errors@1.5.3` exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      state: 'FL',
      cite: 'Fla. Stat. § 501.059',
      url: 'https://www.flsenate.gov/Laws/Statutes/2025/501.059',
    },
    {
      state: 'TX',
      cite: 'Tex. Bus. & Com. Code ch. 305',
      url: 'https://statutes.capitol.texas.gov/Docs/BC/htm/BC.305.htm',
    },
    {
      state: 'TX',
      cite: 'Tex. Bus. & Com. Code ch. 302',
      url: 'https://statutes.capitol.texas.gov/Docs/BC/htm/BC.302.htm',
    },
    {
      state: 'CA',
      cite: 'Cal. Pub. Util. Code § 2872',
      url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2872',
    },
    {
      state: 'CA',
      cite: 'Cal. Pub. Util. Code § 2874',
      url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2874',
    },
    {
      state: 'NY',
      cite: 'N.Y. Gen. Bus. Law § 399-p',
      url: 'https://www.nysenate.gov/legislation/laws/GBS/399-P',
    },
    {
      state: 'NY',
      cite: 'N.Y. Gen. Bus. Law § 399-z',
      url: 'https://www.nysenate.gov/legislation/laws/GBS/399-Z',
    },
    // ⭐ Indiana — four candidates. the autodialer chapter (24-5-14) was never requested before.
    {
      state: 'IN',
      cite: 'Ind. Code § 24-5-14 (autodialer)',
      url: 'https://iga.in.gov/laws/2025/ic/titles/24/articles/5/chapters/14',
    },
    {
      state: 'IN',
      cite: 'Ind. Code § 24-4.7 (do-not-call)',
      url: 'https://iga.in.gov/laws/2025/ic/titles/24/articles/4.7/chapters/5',
    },
    {
      state: 'IN',
      cite: 'Ind. Code § 24-5-14 (justia mirror)',
      url: 'https://law.justia.com/codes/indiana/title-24/article-5/chapter-14/',
    },
    {
      state: 'IN',
      cite: 'Ind. Code § 24-4.7-4 (justia mirror)',
      url: 'https://law.justia.com/codes/indiana/title-24/article-4-7/chapter-4/',
    },
  ];

  const out: any[] = [];

  for (const target of targets) {
    let blob = '';
    let title = '';
    let failure: string | null = null;

    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch((e: any) => {
        if (!String(e?.message).toLowerCase().includes('timeout')) throw e;
      }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

      const raw = await page.evaluate(() => {
        return {
          title: (document.title || '').replace(/\s+/g, ' ').trim(),
          text: (document.body?.innerText || '').replace(/\s+/g, ' ').trim(),
        };
      });
      blob = String(raw.text);
      title = String(raw.title);
    } catch (e: any) {
      // ⭐ captured, never thrown — one bad host must not destroy the other captures
      failure = String(e?.message || e).slice(0, 300);
    }

    // ⛔ under ~2000 bytes is a block page or an interstitial, not a statute
    const ok = failure === null && blob.length >= 2000;

    // the CONSENT half
    const consentHunted =
      /((?:prior express written consent|prior express consent|written consent|bears the signature|signature of the called party|text message|voicemail transmission|unsolicited)[\s\S]{0,340})/gi;
    const consent: string[] = [];
    const seenC = new Set<number>();
    let c: RegExpExecArray | null;
    while (ok && (c = consentHunted.exec(blob)) !== null) {
      const bucket = Math.floor(c.index / 900);
      if (seenC.has(bucket)) continue;
      seenC.add(bucket);
      consent.push(c[0]);
      if (consent.length >= 5) break;
    }

    // the PENALTY half
    const penaltyHunted =
      /((?:\$500|\$1,500|\$5,000|\$10,000|\$11,000|treble|three times|actual damages|civil penalty|statutory damages|injunctive relief|attorney'?s? fees)[\s\S]{0,340})/gi;
    const penalty: string[] = [];
    const seenP = new Set<number>();
    let p: RegExpExecArray | null;
    while (ok && (p = penaltyHunted.exec(blob)) !== null) {
      const bucket = Math.floor(p.index / 900);
      if (seenP.has(bucket)) continue;
      seenP.add(bucket);
      penalty.push(p[0]);
      if (penalty.length >= 5) break;
    }

    out.push({
      state: target.state,
      cite: target.cite,
      url: target.url,
      ok,
      bytes: blob.length,
      title,
      failure,
      // ⭐ a named verdict per target — never silence
      verdict: !ok
        ? failure
          ? `FETCH-FAILED — ${failure}`
          : `BLOCK-PAGE-OR-STUB — ${blob.length} bytes, under the 2000-byte floor`
        : `captured ${blob.length} bytes · consent hits ${consent.length} · penalty hits ${penalty.length}`,
      consentCount: consent.length,
      consent,
      penaltyCount: penalty.length,
      penalty,
    });
  }

  const good = out.filter((o) => o.ok);
  if (good.length === 0)
    throw new UnexpectedCodePathError(
      'ZERO of the eleven state targets captured — treat as a broken run, not a legal result.\n' +
        '  fix: confirm the browser session is live and re-run; do NOT author a five-state matrix\n' +
        '       from an empty sweep.',
    );

  return {
    captured: good.length,
    failed: out.filter((o) => !o.ok).map((o) => `${o.state} ${o.cite}: ${o.verdict}`),
    statesWithAnyCapture: Array.from(new Set(good.map((o) => o.state))).sort(),
    out,
  };
};
