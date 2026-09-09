/**
 * .what = pull the verbatim § 227(b)(3) and § 227(c)(5) private-right-of-action clauses
 *         off the official House OLRC render
 * .why  = the (c)(5) quote the vision carried does not parse standalone — the truncation
 *         tell named in rule.require.bhrowser-citations. the House page has no per-clause
 *         dom ids, so we anchor on the damages phrase itself, which appears once per
 *         track, and take a window wide enough to carry the whole clause on both sides.
 * .note = no inner named function may be declared inside page.evaluate — the transpiler
 *         wraps such functions in a `__name` helper that does not exist in the page.
 */
export const action = async ({ page }: { page: any }) => {
  return await page.evaluate(() => {
    const body = document.body.innerText;
    const anchor = '$500 in damages for each such violation';

    const at1 = body.indexOf(anchor);
    const at2 = at1 === -1 ? -1 : body.indexOf(anchor, at1 + 1);

    return {
      url: location.href,
      count: (body.match(/\$500 in damages for each such violation/g) || []).length,
      clause1:
        at1 === -1
          ? null
          : body
              .slice(Math.max(0, at1 - 900), at1 + 700)
              .replace(/\s+/g, ' ')
              .trim(),
      clause2:
        at2 === -1
          ? null
          : body
              .slice(Math.max(0, at2 - 1100), at2 + 700)
              .replace(/\s+/g, ' ')
              .trim(),
    };
  });
};
