/**
 * .what = read Ind. Code § 24-4.7-5-2 ("Remedies") and § 24-4.7-5-4 ("Statute of Limitations")
 *         out of the content region of the official Indiana General Assembly portal
 * .why  = R4, the state-layer sweep. a body-wide text slice on this portal captures the navigation
 *         sidebar, which repeats every article title and drowns the section text. the statutory
 *         text renders into a separate content region, so address that region rather than the body.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  await page.goto('https://iga.in.gov/laws/2025/ic/titles/24#24-4.7-5-2', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.waitForLoadState("networkidle", { timeout: 9000 }).catch((e: any) => { if (!String(e?.message).toLowerCase().includes("timeout")) throw e; }); // allowlist: the settle bound reached is expected; any OTHER rejection rethrows

  const captured = await page.evaluate(() => {
    // the sidebar repeats every title in the code; the section text is the region that does not
    const regions = Array.from(
      document.querySelectorAll('main, article, [role="main"], .content, #content'),
    );

    const found: { tag: string; bytes: number; text: string }[] = [];
    for (const r of regions) {
      const text = (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
      if (text.length > 80 && text.length < 20000) {
        found.push({
          tag: r.tagName + (r.className ? '.' + String(r.className).slice(0, 40) : ''),
          bytes: text.length,
          text: text.slice(0, 2400),
        });
      }
    }

    return { url: location.href, regionCount: regions.length, found: found.slice(0, 4) };
  });

  // a read that captured no text is a broken capture, never an empty statute.
  // to return an empty `found` here would let a caller believe the Indiana code was read.
  if (captured.found.length === 0)
    throw new UnexpectedCodePathError(
      `captured no statutory text from ${captured.url} (${captured.regionCount} candidate regions scanned).\n` +
        `  fix: the IGA portal is a javascript app whose content region may have moved. snapshot the\n` +
        `       dom and confirm the 'main, article, [role="main"], .content, #content' set still matches.`,
    );

  return captured;
};
