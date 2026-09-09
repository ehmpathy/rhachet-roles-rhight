/**
 * .what = read two more coverage opinions: Harleysville Preferred Ins. Co. v. Rams Head Savage Mill,
 *         LLC, 237 Md. App. 705 (2018), which quotes the ISO exclusion by its title, and State Farm
 *         Gen. Ins. Co. v. JT's Frames, Inc., 181 Cal.App.4th 429 (2010), the California decision
 *         that Yahoo! had to reconcile
 * .why  = two purposes at once.
 *         (1) R10 / D6 needs the California authority Yahoo! engaged, or the Yahoo! result reads as
 *             though it arrived on a blank slate.
 *         (2) ⭐ U4 — the ISO form is the weakest citation in this engagement; it rests on a specimen
 *             posted by a county, which is not an authoritative publisher. a published appellate
 *             opinion that quotes the exclusion verbatim is a better attestation of the form's text
 *             than a second posted specimen would be: a court reproduces the language of the policy
 *             actually before it, on the record, under its own seal. so the fix for U4 is a shift of
 *             source type, not another hunt for the same kind of pdf.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         the probe strings quote policy language and cannot be reworded.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'harleysville.md.2018',
      url: 'https://www.courtlistener.com/opinion/4512318/harleysville-preferred-ins-co-v-rams-head-savage-mill-llc/',
      probes: [
        'Recording and Distribution of Material',
        'Telephone Consumer Protection Act',
        'CG 00 01',
        'we hold',
        'do not decide',
      ],
    },
    {
      slug: 'jtsframes.cal.app.2010',
      url: 'https://www.courtlistener.com/opinion/2255989/state-farm-general-insurance-v-jts-frames-inc/',
      probes: [
        'seclusion',
        'secrecy',
        'Telephone Consumer Protection Act',
        'we conclude',
        'right of privacy',
      ],
    },
  ];

  const out: any[] = [];

  for (const t of targets) {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

    const captured = await page.evaluate((probes: string[]) => {
      const main =
        document.querySelector('#opinion-content') ||
        document.querySelector('.opinion-content') ||
        document.querySelector('article') ||
        document.body;
      const body = (main as HTMLElement).innerText;

      const hits: Record<string, string | null> = {};
      for (const p of probes) {
        const at = body.indexOf(p);
        hits[p] =
          at === -1
            ? null
            : body.slice(Math.max(0, at - 700), at + 1600).replace(/\s+/g, ' ').trim();
      }

      return {
        title: document.title,
        bytes: body.length,
        head: body.slice(0, 900).replace(/\s+/g, ' ').trim(),
        probes: hits,
      };
    }, t.probes);

    out.push({ slug: t.slug, url: t.url, ...captured });
  }

  return { captured: out };
};
