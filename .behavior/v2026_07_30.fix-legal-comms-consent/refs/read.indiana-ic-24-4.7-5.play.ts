/**
 * .what = navigate to Ind. Code art. 24-4.7 ch. 5 ("Civil Remedies") by click-through on the
 *         official Indiana General Assembly portal, and read its operative text
 * .why  = R4, the state-layer sweep. the portal is a javascript app: a guessed chapter url 404'd
 *         and an anchor scan found no hrefs for the article, so the chapter list is not linked —
 *         it is click-driven. this is the third worked proof of rule.require.bhrowser-citations,
 *         after eCFR and the Texas portal.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 *         clicks are by text, never by coordinate (rule.forbid.coordinate-clicks).
 */
export const action = async ({ page }: { page: any }) => {
  await page.goto('https://iga.in.gov/laws/2025/ic/titles/24', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  // open the telephone-solicitation article
  const article = page
    .getByText('Article 4.7. Telephone Solicitation of Consumers', { exact: false })
    .first();
  await article.click({ timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  // open its civil-remedies chapter
  const chapter = page.getByText('Chapter 5. Civil Remedies', { exact: false }).first();
  await chapter.click({ timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  // open the remedies section, then the limitations section
  const remedies = page.getByText('Section 2. Remedies', { exact: false }).first();
  await remedies.click({ timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const afterRemedies = await page.evaluate(() => document.body.innerText);

  const limits = page.getByText('Section 4. Statute of Limitations', { exact: false }).first();
  await limits.click({ timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const afterLimits = await page.evaluate(() => document.body.innerText);

  const tail = (text: string, marker: string) => {
    const at = text.lastIndexOf(marker);
    return at === -1
      ? null
      : text.slice(at, at + 2200).replace(/\s+/g, ' ').trim();
  };

  return {
    url: page.url(),
    remedies: tail(afterRemedies, 'Sec. 2.') || tail(afterRemedies, 'Section 2. Remedies'),
    limitations:
      tail(afterLimits, 'Sec. 4.') || tail(afterLimits, 'Section 4. Statute of Limitations'),
  };
};
