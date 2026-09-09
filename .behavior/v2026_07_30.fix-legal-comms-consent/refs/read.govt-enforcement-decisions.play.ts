/**
 * .what = read the two decisions the forfeiture-review search returned, for how a GOVERNMENT
 *         plaintiff counts TCPA violations and what magnitude results:
 *           - United States v. Dish Network, L.L.C., 75 F. Supp. 3d 942 (C.D. Ill. 2014)
 *           - League of Women Voters of N.H. v. Kramer (D.N.H. 2025) — the AI-voice robocall case
 * .why  = R8. two of three queries for appellate review of an FCC forfeiture returned zero hits.
 *         that emptiness is itself a result and is recorded as one rather than retried into a
 *         confirmation: it suggests FCC forfeitures in this area are rarely reviewed on the merits
 *         by a court of appeals, which would explain why the § 1.80 cap and the nine-figure numbers
 *         I recall can both be true — different tracks, differently counted.
 *
 *         Dish is a government enforcement action under the TCPA rather than an FCC forfeiture, so
 *         it answers a neighbouring question: when the United States sues, how is the count built?
 *         that is squarely within the wish's "sizes of penalties" and was never researched.
 * .note = probes deliberately search for the count mechanics ("each call", "per violation",
 *         "number of violations") ahead of any dollar figure. the open question is not the total —
 *         it is what the total is a multiple OF. a captured total with no count rule would be a
 *         number I could not explain, which is how a brief ends up with a figure it cannot defend.
 *         no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  const targets = [
    {
      slug: 'us-v-dish.cdill.2014',
      url: 'https://www.courtlistener.com/opinion/7311150/united-states-v-dish-network-llc/',
      probes: [
        'each call',
        'number of violations',
        'civil penalt',
        'per violation',
        'statutory damages',
      ],
    },
    {
      slug: 'lwv-v-kramer.dnh.2025',
      url: 'https://www.courtlistener.com/opinion/10696904/league-of-women-voters-of-new-hampshire-league-of-women-voters-of-the/',
      probes: [
        'artificial or prerecorded',
        'each call',
        'forfeiture',
        'we hold',
        'do not decide',
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
            : body.slice(Math.max(0, at - 900), at + 1500).replace(/\s+/g, ' ').trim();
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
