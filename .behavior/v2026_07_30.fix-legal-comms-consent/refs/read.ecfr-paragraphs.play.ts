/**
 * .what = pull verbatim paragraph text from the official eCFR render of 47 C.F.R. § 64.1200
 * .why  = the vision quoted this section from a mirror (Cornell LII) whose text passed
 *         through a summarizer, and whose currency date was never captured. per
 *         rule.require.bhrowser-citations, a quote destined for a brief must come off
 *         the real DOM. eCFR keys each paragraph to a stable dom id, so we address the
 *         paragraphs directly rather than slice a text window.
 * .note = precondition: goto.ecfr-64-1200 must have loaded the section page first. this
 *         playbook evaluates against the page the browser already holds; it does not
 *         navigate, so run it after that goto.
 *         ⚠️ a block page (or a page the goto never reached) yields ids that are all null,
 *         which a caller could misread as "the paragraph is absent from the regulation". so,
 *         like read.ecfr-dnc-axes, this throws when every asked id is null rather than return
 *         a busted capture as a legal absence.
 *         ⚠️ helpful-errors@1.5.3 exports only HelpfulError / UnexpectedCodePathError /
 *         BadRequestError / getError / withHelpfulError at run time.
 */
import { UnexpectedCodePathError } from 'helpful-errors';

export const action = async ({ page }: { page: any }) => {
  const captured = await page.evaluate(() => {
    const idsWanted = [
      'p-64.1200(a)(2)',
      'p-64.1200(a)(3)',
      'p-64.1200(a)(10)',
      'p-64.1200(f)(9)',
    ];

    const paragraphs: Record<string, string | null> = {};
    for (const id of idsWanted) {
      const el = document.getElementById(id);
      paragraphs[id] = el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
    }

    // the currency stamp: eCFR prints an "as of" / "up to date as of" line in the header
    const body = document.body.innerText;
    const currencyMatch = body.match(/[^\n]*(?:up to date as of|as of)[^\n]*/i);

    return {
      url: location.href,
      currency: currencyMatch ? currencyMatch[0].trim() : null,
      paragraphs,
    };
  });

  const paragraphs = captured.paragraphs as Record<string, string | null>;

  // ⛔ zero of the asked ids resolved is far more likely a block page (or a goto that never
  //    reached the section) than an empty regulation, so throw like read.ecfr-dnc-axes rather
  //    than return all-null as though the paragraphs were absent from the rule.
  const present = Object.keys(paragraphs).filter((k) => paragraphs[k]);
  if (present.length === 0)
    throw new UnexpectedCodePathError(
      `zero of ${Object.keys(paragraphs).length} paragraph ids were found at ${captured.url}.\n` +
        '  fix: that is a block page or a changed id scheme, not an empty regulation. re-open headful\n' +
        '       and snapshot the html to confirm the `p-64.1200(x)` id convention still holds.',
    );

  return { ...captured, presentCount: present.length };
};
