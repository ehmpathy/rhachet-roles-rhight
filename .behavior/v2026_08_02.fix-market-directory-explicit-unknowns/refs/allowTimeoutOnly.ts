/**
 * .what = the ONE error a best-effort wait in a capture playbook may swallow —
 *         a playwright TimeoutError — with every other error rethrown
 *
 * .why  = three peer reviewers independently flagged `.catch(() => null)` on the
 *         `waitForSelector` calls in these playbooks as a failhide, and they were
 *         right on the rule as written: `rule.forbid.failhide` permits a catch
 *         only where it "allowlists errors and handles carefully, throws others."
 *         a bare `() => null` allowlists no error at all.
 *
 *         ⭐ the sharpest form of the finding came from `arch-hazards-maintenance`,
 *         and it is the reason this helper is NOT redundant with the marker
 *         assertion each playbook already carries:
 *
 *           > "the marker assertion after the capture does not detect a page crash
 *             because the evaluate still runs on the current page state"
 *
 *         the two guards cover DIFFERENT faults, and neither covers both:
 *
 *         | fault                     | caught by       |
 *         |---------------------------|-----------------|
 *         | selector never rendered   | marker assert   |
 *         | page served only a shell  | marker assert   |
 *         | browser/target crashed    | ⭐ THIS helper  |
 *         | context or page closed    | ⭐ THIS helper  |
 *         | cdp protocol failure      | ⭐ THIS helper  |
 *
 *         a timeout is the one fault the marker assertion reports BETTER than a
 *         raw throw would — it names the absent marker, the byte count, and the
 *         url, where a `TimeoutError` names only a selector. so the timeout is
 *         swallowed here deliberately and the assertion speaks for it. every
 *         other error means the browser itself is broken, which no assertion
 *         downstream can diagnose, so it must surface at its origin.
 *
 * .note  = shared rather than inlined into each playbook: 11 captures need the
 *          identical guard, which is well past `rule.prefer.wet-over-dry`'s
 *          rule-of-three, and 11 copies would drift. the cost is that a playbook
 *          is no longer a single-file copy-paste — it is reproducible from the
 *          route's `refs/` directory as a unit, which is how the route ships.
 */

/** the playwright error name for a wait that expired; stable across versions */
const TIMEOUT_ERROR_NAME = 'TimeoutError';

export const allowTimeoutOnly = (error: unknown): null => {
  // a timeout means the marker never arrived — exactly what the marker assertion
  // downstream reports, with far better context than a selector name.
  if (error instanceof Error && error.name === TIMEOUT_ERROR_NAME) return null;

  // anything else is a broken browser, not a slow page. no downstream assertion
  // can diagnose it, so it surfaces here at its origin.
  throw error;
};
