import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useThen, when } from 'test-fns';

/**
 * .what = integration tests for the audit.refusal.messages skill
 *
 * .why  = this skill exists to find leak-6 gaps across the whole tree. an
 *         earlier ad-hoc form of it reported "154 of 260 uncovered" and that
 *         figure was an artifact of the instrument, in three ways. each of
 *         the three now has a case below, and the third one — the match
 *         direction — is the one that no ordinary case would catch, because
 *         a wrong direction reports MORE coverage, not less.
 *
 * hermetic: every fixture is built at runtime under a temp dir; the sweep is
 * never pointed at the real repo, so its counts cannot drift with the tree.
 */

const scriptPath = path.join(__dirname, 'audit.refusal.messages.sh');
const UTF8 = 'utf-8' as const;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-refusal-'));

const write = (at: string, body: string): void => {
  fs.mkdirSync(path.dirname(at), { recursive: true });
  fs.writeFileSync(at, body, UTF8);
};

/**
 * ⭐ THE MIXED FIXTURE — one skill per defect the instrument had.
 *
 * `alpha.sh` carries THREE lines that a naive /exit [12]/ would count and
 * only TWO that are real:
 *
 *   :3   a COMMENT that documents the exit codes  -> not a site
 *   :7   a refusal whose message a test asserts   -> covered
 *   :11  a refusal whose message no test asserts  -> a gap
 *
 * ⚠️ :11's message is chosen, not incidental. its words — "not found",
 *    "anywhere", "on disk" — all appear in `alpha`'s test file as PROSE, in
 *    a `then` string. so a matcher that looks for windows of the MESSAGE
 *    inside the TEST BLOB reports it COVERED, which is exactly the defect
 *    the ad-hoc instrument shipped with. only the correct direction — a
 *    test's ASSERTED literal, found inside the message — reports it as a gap.
 */
const rolesRoot = path.join(tempDir, 'roles');
const alphaSh = path.join(rolesRoot, 'demo/skills/alpha/alpha.sh');
const betaSh = path.join(rolesRoot, 'demo/skills/beta/beta.sh');

write(
  alphaSh,
  [
    '#!/usr/bin/env bash',
    '# guarantee:',
    '#   - exit 1 for malfunction, exit 2 for constraint',
    'set -euo pipefail',
    'if [[ -z "${1:-}" ]]; then',
    '  print_blocked "no target given"',
    '  exit 2',
    'fi',
    'if [[ ! -f "$1" ]]; then',
    '  print_blocked "target not found anywhere on disk"',
    '  exit 2',
    'fi',
    '',
  ].join('\n'),
);

write(
  path.join(rolesRoot, 'demo/skills/alpha/alpha.integration.test.ts'),
  [
    "then('it refuses when no target was handed to it', () => {",
    "  expect(outcome.stdout).toContain('no target given');",
    '});',
    "then('it says the target was not found anywhere on disk', () => {",
    '  expect(outcome.exitCode).toBe(2);',
    '});',
    '',
  ].join('\n'),
);

write(
  betaSh,
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'if [[ -z "${1:-}" ]]; then',
    '  exit 2',
    'fi',
    '',
  ].join('\n'),
);

write(
  path.join(rolesRoot, 'demo/skills/beta/beta.integration.test.ts'),
  ["expect(outcome.stdout).toContain('beta rendered it');", ''].join('\n'),
);

/** a root whose every refusal message IS asserted — the positive control */
const cleanRoot = path.join(tempDir, 'clean');
write(
  path.join(cleanRoot, 'demo/skills/gamma/gamma.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "gamma needs a target"',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(cleanRoot, 'demo/skills/gamma/gamma.integration.test.ts'),
  ["expect(outcome.stdout).toContain('gamma needs a target');", ''].join('\n'),
);

/**
 * ⭐ THE LEAD-INTERPOLATION FIXTURE — instrument defect 4.
 *
 * `delta.sh`'s message opens with a variable and then carries a 44-character
 * literal a test can assert. an earlier capture read `"([^"$]{6,})"`, which
 * stops at the FIRST `$` — so it saw 4 characters, fell under the minimum,
 * and reported the site as `no-msg`: a caller with NO reason at all.
 *
 * that is the sharpest class in the sweep, and this fixture is what keeps a
 * perfectly assertable message out of it.
 */
const leadRoot = path.join(tempDir, 'lead');
write(
  path.join(leadRoot, 'demo/skills/delta/delta.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "no \'$LABEL\' line found — parse cannot be reconciled"',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(leadRoot, 'demo/skills/delta/delta.integration.test.ts'),
  [
    "expect(outcome.stdout).toContain('line found — parse cannot be reconciled');",
    '',
  ].join('\n'),
);

/**
 * ⭐ THE THREE-KIND FIXTURE — one skill, one site per kind.
 *
 *   :4   a message with a long literal that no test asserts -> no-assert
 *   :6   a message that is ENTIRELY interpolation           -> thin-msg
 *   :13  a bare exit with no refusal call above it          -> no-msg
 *
 * ⚠️ the six filler lines above `:13` carry weight. the look-back window is
 *    six lines, so a shorter gap would let `:6`'s call be read as `:13`'s
 *    message and the bare exit would never be reported.
 *
 * ⛔ before the fix, `:6` and `:13` were BOTH `no-msg` — an all-interpolation
 *    message and a bare exit shared one bucket. only the `:6 thin-msg` row
 *    tells the two apart, so that row is the discriminator this case exists
 *    for.
 */
const kindRoot = path.join(tempDir, 'kinds');
write(
  path.join(kindRoot, 'demo/skills/epsilon/epsilon.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "epsilon needs a real target on disk"',
    'exit 2',
    'print_blocked "$a $b"',
    'exit 2',
    'check_one',
    'check_two',
    'check_three',
    'check_four',
    'check_five',
    'check_six',
    'exit 1',
    '',
  ].join('\n'),
);
write(
  path.join(kindRoot, 'demo/skills/epsilon/epsilon.integration.test.ts'),
  [
    "expect(outcome.stdout).toContain('epsilon rendered its tree');",
    '',
  ].join('\n'),
);

/**
 * ⛔ A FUNCTION BOUNDARY, which the exit-stop alone does NOT catch.
 *
 *    `report_theta` ends with an echo and a bare `}`. `main` then exits with
 *    no reason of its own. there is no `exit` between the two, so an
 *    exit-only stop walks straight out of one function body into another and
 *    hands `main`'s bare exit a footer `report_theta` prints.
 *
 *    ⚠️ THE VERDICT COMES OUT ACCIDENTALLY RIGHT, which is what makes it
 *       dangerous: the borrowed footer IS asserted, so the site reads COVERED
 *       and renders no row. only the count can see it.
 *
 *    ⛔ THE STOP MUST BE A BARE `}`, NEVER ANY `}`. a treestruct block closes
 *       with `} >&2`, and a stop that matched that would break [case7] — the
 *       two shapes are one character apart and pull in opposite directions.
 */
const scopeRoot = path.join(tempDir, 'scope');
write(
  path.join(scopeRoot, 'demo/skills/theta/theta.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'report_theta() {',
    '  echo "theta printed a footer nobody exits on"',
    '}',
    '',
    'main() {',
    '  report_theta',
    '  local n',
    '  n=1',
    '  [[ "$n" -eq 0 ]] || exit 2',
    '}',
    'main "$@"',
    '',
  ].join('\n'),
);
write(
  path.join(scopeRoot, 'demo/skills/theta/theta.integration.test.ts'),
  ["expect(outcome.stdout).toContain('theta printed a footer');", ''].join('\n'),
);

/**
 * ⛔ A TREESTRUCT REFUSAL BLOCK, which is how this repo actually refuses.
 *
 *    the reason is carried by `print_tree_leaf "blocked" "<why>"` and the
 *    block runs a dozen lines before the exit. a 6-line look-back over a
 *    `print_blocked`-only matcher cannot see either fact, so it reports
 *    `no-msg` — the ONE kind the report describes in absolute terms.
 */
const blockRoot = path.join(tempDir, 'block');
write(
  path.join(blockRoot, 'demo/skills/zeta/zeta.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '{',
    '  print_eagle_header "that wont work..."',
    '  print_tree_start "zeta"',
    '  print_tree_leaf "blocked" "zeta cannot borrow a certificate from another state"',
    '  print_tree_note ""',
    '  print_tree_note "note one"',
    '  print_tree_note "note two"',
    '  print_tree_note "note three"',
    '  print_tree_note "note four"',
    '  print_tree_note "note five"',
    '  print_tree_note "note six"',
    '} >&2',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(blockRoot, 'demo/skills/zeta/zeta.integration.test.ts'),
  [
    "expect(outcome.stderr).toContain('cannot borrow a certificate from another state');",
    '',
  ].join('\n'),
);

/**
 * ⭐ THE CONTROL FOR THE PLAUSIBLE-BUT-WRONG FIX.
 *
 *    the obvious cure for `blockRoot` is "widen the window". widened alone,
 *    the walk reaches BACKWARD PAST A PRIOR EXIT and hands this bare exit
 *    the previous arm's reason — which is harm 2 of defect 4, re-opened at
 *    a larger radius. the walk needs a stop, and a prior `exit` is it.
 */
const stopRoot = path.join(tempDir, 'stop');
write(
  path.join(stopRoot, 'demo/skills/eta/eta.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "eta found a real reason to refuse"',
    'exit 2',
    'run_one',
    'run_two',
    'run_three',
    'run_four',
    'run_five',
    'run_six',
    'run_seven',
    'run_eight',
    'exit 1',
    '',
  ].join('\n'),
);
write(
  path.join(stopRoot, 'demo/skills/eta/eta.integration.test.ts'),
  ["expect(outcome.stdout).toContain('eta found a real reason');", ''].join(
    '\n',
  ),
);

/**
 * ⛔ A MESSAGE WITH A VARIABLE IN THE MIDDLE HAS **TWO** ASSERTABLE RUNS, and
 *    `asLongestLiteral` hands back only one of them.
 *
 *    `iota.sh:3` carries (and the report keys its row on the EXIT at `:4`):
 *
 *      print_blocked "iota is not gitignored: $MAP — add it to the ignore list"
 *
 *    which cuts into two runs a test could match on:
 *
 *      `iota is not gitignored:`          23 ch   <- what the test asserts
 *      `— add it to the ignore list`      27 ch   <- what the instrument reads
 *
 *    so the coverage decision runs against the run the test did NOT pick, and
 *    a covered site is reported as a gap.
 *
 * ⚠️ THE HARM DIRECTION IS THE CHEAPER ONE — a FALSE GAP costs a reader one
 *    wasted triage, where a false COVERED costs the guarantee. but it is
 *    SYSTEMATIC: it fires on every refusal whose reason leads with a label and
 *    carries the value in the middle, which is the ordinary shape.
 *
 * ⛔ THE DISCRIMINATOR IS `iota.sh:7` (row `:8`). its two runs are asserted by
 *    no test at all, so it must STAY a gap. without it, a fix that simply
 *    reports every multi-run site as covered would pass.
 */
const runRoot = path.join(tempDir, 'runs');
write(
  path.join(runRoot, 'demo/skills/iota/iota.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "iota is not gitignored: $MAP — add it to the ignore list"',
    'exit 2',
    '',
    'if [[ -z "${TARGET:-}" ]]; then',
    '  print_blocked "iota cannot reach $TARGET over the wire just now"',
    '  exit 2',
    'fi',
    '',
  ].join('\n'),
);
write(
  path.join(runRoot, 'demo/skills/iota/iota.integration.test.ts'),
  ["expect(outcome.stdout).toContain('iota is not gitignored');", ''].join('\n'),
);

/**
 * ⛔ A `not.toContain` CLAMPS NO PART OF THE MESSAGE IT NAMES, and the literal
 *    collector counted it as coverage all the same.
 *
 *    the collector's regex is `to(?:Contain|Match|Be)\(` and it never looks
 *    LEFT of the `to`, so `expect(x).not.toContain('...')` feeds it a literal
 *    exactly as a positive would.
 *
 *    delete the refusal that literal names and the negative assertion stays
 *    GREEN — an absent string is precisely what it asserts. so the site had no
 *    clamp at all and the report called it covered.
 *
 * ⚠️ THIS ONE RUNS IN THE EXPENSIVE DIRECTION. defect 7 invented gaps, which
 *    costs a reader one wasted triage. this HIDES them, which costs the
 *    guarantee the whole sweep exists to give.
 *
 * ⭐ AND IT IS SYSTEMATIC **BECAUSE OF** THE LEAK-1 DISCIPLINE. every positive
 *    in this repo is paired with an exclusion, by rule. so the harder a test
 *    file works to discriminate, the more phantom coverage it hands the
 *    instrument. the practice that hardens the suite blinds the sweep.
 *
 * ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS A BLACKLIST — "drop every literal that
 *    appears in a `not.`". `kappa.sh:7` (row `:8`) rules it out: its message is
 *    asserted BOTH ways, positively and negatively, which is the ordinary shape
 *    of a leak-1 pair. a blacklist would strike it and turn a genuinely covered
 *    site into a gap. the fix must read POLARITY per call site, never per token.
 */
const polRoot = path.join(tempDir, 'pols');
write(
  path.join(polRoot, 'demo/skills/kappa/kappa.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "kappa needs a target before it can reach the wire"',
    'exit 2',
    '',
    'if [[ -z "${DIR:-}" ]]; then',
    '  print_blocked "kappa refuses a path outside of the work tree"',
    '  exit 2',
    'fi',
    '',
  ].join('\n'),
);
write(
  path.join(polRoot, 'demo/skills/kappa/kappa.integration.test.ts'),
  [
    // ⛔ the ONLY mention of the first message, and it is a NEGATIVE
    "expect(a.stdout).not.toContain('kappa needs a target before it can');",
    // ✅ the second message is asserted BOTH ways — the ordinary leak-1 pair
    "expect(b.stdout).toContain('kappa refuses a path outside of');",
    "expect(c.stdout).not.toContain('kappa refuses a path outside of');",
    '',
  ].join('\n'),
);

/**
 * ⛔ A TEST LITERAL THAT REACHES PAST AN INTERPOLATION HOLE MATCHES NO RUN, so a
 *    correct clamp that discriminates was reported as a gap.
 *
 *    the coverage test is `run.includes(lit)` — the asserted literal must sit
 *    INSIDE the skill's literal run. but a run STOPS AT THE HOLE, while a test
 *    naturally quotes the message with the hole FILLED, because that is what the
 *    skill actually prints and it is the stronger assertion:
 *
 *      print_blocked "unknown lambda option: $1"
 *        run = `unknown lambda option:`          <- what the instrument holds
 *        lit = `unknown lambda option: --wat`    <- what a real clamp asserts
 *
 *    the lit is LONGER, so `run.includes(lit)` is false and a genuine clamp
 *    reads as no clamp.
 *
 * ⚠️ DEFECT 8 WAS MASKING THIS. the same arms carry a `not.toContain('unknown
 *    option')` as a leak-1 discriminator, and THAT literal does sit inside the
 *    run — so phantom coverage stood in for real coverage. fix 8 and this
 *    surfaces at once.
 *
 * ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS AN UNBOUNDED REVERSE — `lit.includes(run)`.
 *    it is refused on purpose: a 6-char run of ordinary English lands inside
 *    long test prose by accident, so any sentence that happens to carry the run
 *    would read as coverage. `:7` below is exactly that shape and must stay a
 *    gap. the fix is ANCHORED — `lit.startsWith(run)`.
 */
const spanRoot = path.join(tempDir, 'spans');
write(
  path.join(spanRoot, 'demo/skills/lambda/lambda.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "unknown lambda option: $1"',
    'exit 2',
    '',
    'print_blocked "failed to reach $HOST"',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(spanRoot, 'demo/skills/lambda/lambda.integration.test.ts'),
  [
    // ✅ a real clamp whose literal reaches PAST the hole — must count
    "expect(a.stdout).toContain('unknown lambda option: --wat');",
    // ⛔ ordinary prose about an UNRELATED failure. it happens to carry the run
    //    `failed to reach`, so an UNBOUNDED reverse would read it as coverage
    //    of `:7`. it is not — `:7` must stay a gap
    "expect(b.stdout).toContain('the job failed to reach a verdict on time');",
    '',
  ].join('\n'),
);

/**
 * ⛔ THE COLLECTOR'S CAPTURE CLASS EXCLUDED ALL THREE QUOTE MARKS, so an asserted
 *    literal that CARRIES a quote mark other than its own delimiter was dropped
 *    WHOLE and the clamp was invisible to the sweep.
 *
 *      expect(a.stdout).toContain("no files matched '*.txt' under here");
 *
 *    the body class `[^"\x27`]` cannot cross the inner `\x27`, the backreference
 *    then demands `"` and is handed `\x27`, and the match fails at that position.
 *    the engine walks on and the whole assertion is lost.
 *
 * ⚠️ THE DIRECTION IS CHEAP, WHICH IS WHY IT SURVIVED — it INVENTS gaps rather
 *    than hides them, so the cost is a wasted triage rather than a lost
 *    guarantee. but it is SYSTEMATIC on the ordinary shape of a shell refusal
 *    that quotes its own input, which is how it was found: a clamp landed
 *    minutes earlier, proven to bite, was reported as a gap.
 *
 * ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS ONE SHARED PERMISSIVE CLASS — `(["\x27`])
 *    ([\s\S]{6,}?)\1`. it handles the inner quote and breaks on a SHORT literal:
 *    with fewer than 6 chars before its own closer, the lazy body runs PAST the
 *    call boundary to the next same-mark quote, which manufactures a garbage
 *    capture AND consumes the quote that opens the next real clamp — so a
 *    covered site turns into a gap. `:7` below is exactly that shape.
 *
 *    the correct fix is a PER-DELIMITER alternation, one class per mark.
 */
const quoteRoot = path.join(tempDir, 'quotes');
write(
  path.join(quoteRoot, 'demo/skills/mu/mu.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "no files matched \'$GLOB\' under here"',
    'exit 2',
    '',
    'print_blocked "mu declines the request"',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(quoteRoot, 'demo/skills/mu/mu.integration.test.ts'),
  [
    // ✅ a real clamp whose literal CARRIES a quote mark — must count
    'expect(a.stdout).toContain("no files matched \'*.txt\' under here");',
    // ⛔ a short literal, under 6 chars. harmless to a per-delimiter class; a
    //    shared permissive class runs past it and eats the clamp below
    "expect(b.stdout).toBe('ok');",
    // ✅ an ordinary clamp that must survive whatever the line above does
    "expect(b.stdout).toContain('mu declines the request');",
    '',
  ].join('\n'),
);

/**
 * ⛔ DEFECT 9 WAS FIXED FOR ONE HALF OF ITS OWN CLASS. its accommodation was
 *    `lit.startsWith(run)`, which reads a clamp that quotes past a hole on the
 *    run's RIGHT. a hole on the run's LEFT had no mirror, so a clamp PROVEN to
 *    bite reported as a gap:
 *
 *      print_blocked "--$name is required"
 *        run = `is required`             <- the hole is on the LEFT
 *        lit = `--issued is required`    <- LONGER, and starts with the hole
 *
 *    and a run with a hole on BOTH sides sits in the MIDDLE of the filled
 *    line, so neither end-anchor can reach it at all.
 *
 * ⭐ THE ANCHOR IS A PROPERTY OF THE SITE, NOT OF THE STRING. a test can only
 *    have filled a hole that was there, so the permitted extension is read off
 *    the run's FLANKS — right-hole anchors left, left-hole anchors right, an
 *    interior run may sit in the middle, and a WHOLLY-LITERAL run admits none.
 *
 * ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS AN UNBOUNDED REVERSE FOR EVERY RUN. `:10`
 *    below is that probe: its message carries no hole at all, so the skill
 *    printed every character of it, and a longer assertion carries words the
 *    skill never emitted. that is prose, and it must STAY a gap.
 */
const flankRoot = path.join(tempDir, 'flanks');
write(
  path.join(flankRoot, 'demo/skills/nu/nu.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "--$name is required"',
    'exit 2',
    '',
    'print_blocked "--$name must be in range: $val"',
    'exit 2',
    '',
    'print_blocked "the archive is sealed shut"',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(flankRoot, 'demo/skills/nu/nu.integration.test.ts'),
  [
    // ✅ a LEFT-hole run. the clamp quotes the filled line, which ENDS with it
    "expect(a.stdout).toContain('--issued is required');",
    // ✅ an INTERIOR run. both flanks are holes, so the clamp carries it in the
    //    MIDDLE and no end-anchor can reach it
    "expect(b.stdout).toContain('--par must be in range: 0.5');",
    // ⛔ a WHOLLY-LITERAL run, carried by ordinary prose about a DIFFERENT
    //    failure. an unbounded reverse would read it as coverage of `:10`
    "expect(c.stdout).toContain('we found the archive is sealed shut and quit');",
    '',
  ].join('\n'),
);

/**
 * ⛔ DEFECT 12 — THE OVERLAP IS PARTIAL, AND DEFECTS 9 AND 11 BOTH MISSED IT.
 *
 *    each of those fixes assumed a clamp quotes the WHOLE run and then extends
 *    into the hole beside it. a real clamp does the reverse: it fills the hole
 *    and quotes only as much of the ADJACENT PORTION as it needs.
 *
 *      print_blocked "$n different cards here — a tally is one card by default"
 *      expect(stdout).toContain('2 different cards here')
 *
 *    the clamp is [filled hole `2 `] + [PREFIX of the run], so a whole-run rule
 *    refuses it. `:4` and `:7` below are the two probes for that — one on each
 *    flank, since a fix applied to one direction alone was the whole of harm 11.
 *
 * ⛔ THE PLAUSIBLE-BUT-WRONG FIX ADMITS ANY OVERLAP AT ALL. with k >= 1 allowed,
 *    a single character carries the verdict: `:10`'s clamp merely ENDS with the
 *    letter `d`, and the run merely BEGINS with one. that is a coincidence, so
 *    `:10` must STAY a gap, and only a word boundary keeps it one.
 */
const partialRoot = path.join(tempDir, 'partials');
write(
  path.join(partialRoot, 'demo/skills/pa/pa.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "$n different cards here — a tally is one card by default"',
    'exit 2',
    '',
    'print_blocked "the ledger row count differs from $expected"',
    'exit 2',
    '',
    'print_blocked "$name dwells outside the vault"',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(partialRoot, 'demo/skills/pa/pa.integration.test.ts'),
  [
    // ✅ a LEFT hole, quoted PARTIALLY. the clamp fills `$n`, then takes the
    //    first four words of the run and halts well short of its end
    "expect(a.stdout).toContain('2 different cards here');",
    // ✅ the MIRROR: a RIGHT hole, quoted partially. the clamp opens inside the
    //    run and carries on into the filled hole
    "expect(b.stdout).toContain('row count differs from 7');",
    // ⛔ a clamp about a DIFFERENT refusal, whose last letter happens to be the
    //    run's first. an unbounded overlap would read it as coverage of `:10`
    "expect(c.stdout).toContain('the sealed lid');",
    '',
  ].join('\n'),
);

/**
 * ⛔ DEFECT 13 — THE BACKWARD WALK RETURNED ON THE **LAST** LINE OF THE BLOCK.
 *
 *    `asAdjacentMessage` walks UPWARD from the exit and used to return on the
 *    first matcher hit. `/echo\s+"([^"]*)"/` is one of the three matchers, so
 *    the first hit is the block's **final output line** — and the VERDICT, which
 *    sits at the TOP, was never reached. two shapes, both live in this repo:
 *
 *      A  a pure interpolation      `echo "$keyrack_json"`   (:8 below)
 *      B  the EMPTY string          `echo ""`                (:4 below)
 *
 *    B is the treestruct HOUSE STYLE — a refusal block routinely closes on a
 *    blank line — so the defect fires on the ordinary shape, not an exotic one.
 *
 * ⭐ THE CURE IS A PRIORITY, NOT A WIDER WINDOW. a refusal block holds two kinds
 *    of line: the VERDICT (`print_blocked` / `print_tree_leaf` — the reason) and
 *    the REMEDY (the echoes under it — the cure). a verdict wins outright; a
 *    thin echo no longer halts the walk.
 *
 * ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS THE UNION OF EVERY ECHO IN THE ARM. a remedy
 *    line recurs across every arm of every skill, so ONE assertion of it would
 *    clear ALL of them — FALSE COVERED, the expensive direction. `:15` is the
 *    probe for that: its echoes sit above a NON-OUTPUT line, and a fallback with
 *    no bound adopts them and reports the site covered.
 *
 *    ⚠️ this is not hypothetical. the FIRST defect-13 fix had no bound and
 *       reached, in `patent.priors.fetch`, a status-file write inside a
 *       BACKGROUNDED SUBSHELL, 35 lines above the exit and past `) &`, `done`, a
 *       `for` and an `if`. only the per-site diff could see it.
 *
 * ⚠️ AND THE BOUND MUST NOT BLIND THE TREESTRUCT SHAPE. `:23` closes a
 *    `{ ... } >&2` block that legitimately holds a `for` loop, so inside such a
 *    block the walk tolerates a non-output line and still reaches the TOPMOST
 *    echo. the inner echo is asserted by no test, so a walk that halted at the
 *    NEAREST one would report `:23` as a gap.
 */
const topRoot = path.join(tempDir, 'tops');
write(
  path.join(topRoot, 'demo/skills/tau/tau.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'print_blocked "the vault door refuses a second turn of the key"',
    'echo ""',
    'exit 2',
    '',
    'print_blocked "the ledger will not open while another hand holds it"',
    'echo "$detail"',
    'exit 2',
    '',
    'echo "the archive was swept and every shard accounted for"',
    'echo "   the scratch dir is gone now"',
    'rm -rf "$scratch"',
    'print_blocked "$reason: $target"',
    'exit 1',
    '',
    '{',
    '  echo "the roster names three vendors we could not reach"',
    '  for v in "${vendors[@]}"; do',
    '    echo "      · unreachable vendor row"',
    '  done',
    '} >&2',
    'exit 2',
    '',
  ].join('\n'),
);
write(
  path.join(topRoot, 'demo/skills/tau/tau.integration.test.ts'),
  [
    // ✅ shape B — the block closes on `echo ""`, and the verdict is 2 lines up
    "expect(a.stdout).toContain('refuses a second turn of the key');",
    // ✅ shape A — the block closes on a pure interpolation
    "expect(b.stdout).toContain('while another hand holds it');",
    // ⛔ THE PROBE. these two echoes sit ABOVE a non-output line, so they are
    //    NOT this arm's remedy. an unbounded fallback adopts them and turns a
    //    thin site COVERED
    "expect(c.stdout).toContain('the archive was swept and every shard');",
    // ✅ the TOPMOST echo of a redirected block, reached past a `for` loop. the
    //    inner `· unreachable vendor row` is asserted by nobody on purpose
    "expect(d.stdout).toContain('three vendors we could not reach');",
    '',
  ].join('\n'),
);

/**
 * ⛔ INSTRUMENT DEFECT 15 — an `echo` REDIRECTED TO A FILE is not a message.
 *
 *    `:3` writes a verdict into a relay file. no caller sees it; the parent
 *    re-emits the payload from elsewhere. yet it satisfies the echo matcher
 *    word for word, so under the defect the bare exit at `:4` adopts it and
 *    grades ASSERTED the moment the payload text appears in any test — which
 *    it does here, for a reason unrelated to this site.
 *
 *    that is a FALSE COVERED, the silent direction: the row vanishes from the
 *    report and the site reads as done.
 *
 * ⚠️ AND THE FIX MUST NOT EAT `>&2`. an fd duplication is a REAL stream, and
 *    it is how most of this repo refuses. a discriminator that keyed on a bare
 *    `>` would blind the walk to nearly every one of them.
 *
 * 🚩 THE REGRESSION HALF NEEDS THE **INLINE** SHAPE, and my first draft used
 *    only the BLOCK one. measured 2026-09-04: under a deliberately greedy
 *    `/>/` the whole suite stayed GREEN at 98/0, so that clamp had NO TEETH
 *    against the very fix it was written to rule out.
 *
 *    the cause is where the redirection SITS. in `{ … } >&2` the `>&2` is on
 *    the CLOSING BRACE — a different line from the echo — and the walk tests
 *    the ECHO's line, so a greedy rule cannot reach it. the block form is
 *    structurally immune, which makes it a control that can never bite.
 *
 *    `echo "…" >&2` puts both on ONE line, and that is the shape a greedy fix
 *    actually breaks. it is also the common one: `patent.priors.search.sh`
 *    refuses that way at three of its remedy sites — the ones whose coverage
 *    task #205 exists for.
 *
 *    so `:15` is the decisive regression half. `:12` is kept as the weaker
 *    control: it rules out a walk that halted AT the relay line rather than
 *    past it.
 */
const relayRoot = path.join(tempDir, 'relay');
write(
  path.join(relayRoot, 'demo/skills/rho/rho.sh'),
  [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'echo "the courier never reached the gate" > "$relay_file"',
    'exit 1',
    '',
    'print_blocked "the gate was shut before the courier arrived"',
    'exit 1',
    '',
    '{',
    '  echo "the seal on the pouch was already broken"',
    '} >&2',
    'exit 1',
    '',
    'echo "the lantern went dark on the north road" >&2',
    'exit 1',
    '',
    'print_blocked "no ferry today, take --route <name>.path"',
    'exit 1',
    '',
  ].join('\n'),
);
write(
  path.join(relayRoot, 'demo/skills/rho/rho.integration.test.ts'),
  [
    // ⛔ THE PROBE. this quotes the RELAY PAYLOAD, which the parent re-emits
    //    somewhere else entirely. under the defect it turns `:4` covered
    "expect(a.stderr).toContain('the courier never reached the gate');",
    // ✅ a real verdict, on the stream a caller reads
    "expect(b.stderr).toContain('shut before the courier arrived');",
    // ✅ a `>&2` BLOCK — the weak control; a greedy rule cannot reach it
    "expect(c.stderr).toContain('the seal on the pouch was already broken');",
    // ⭐ an INLINE `>&2` — the decisive control, and the one a greedy rule
    //    DOES break, because both halves share a line
    "expect(d.stderr).toContain('the lantern went dark on the north road');",
    // ⭐ AN ANGLE-BRACKET USAGE HINT, on the plain stream. the `>` that shuts
    //    `<name>` sits INSIDE the quotes, so it is not a redirect at all —
    //    and a whole-line discriminator reads it as one. three asserted
    //    production sites broke exactly this way
    "expect(e.stdout).toContain('no ferry today, take --route');",
    '',
  ].join('\n'),
);

const runSkill = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...args], {
    cwd: tempDir,
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

describe('audit.refusal.messages.sh', () => {
  given('[case1] a root whose every refusal message is asserted', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', cleanRoot]),
      );

      then('exit code is 0', () => {
        expect(outcome.exitCode).toBe(0);
      });

      then('it reports the one skill and its one site', () => {
        expect(outcome.stdout).toContain('skills: 1');
        expect(outcome.stdout).toContain('refusal sites: 1');
        expect(outcome.stdout).toContain('asserted: 1');
      });

      then('⭐ it reports zero gaps, and says so in words', () => {
        expect(outcome.stdout).toContain(
          'gaps: 0 (no-assert 0 · thin-msg 0 · no-msg 0)',
        );
        expect(outcome.stdout).toContain(
          'every refusal site has an asserted message',
        );
      });

      then('⭐ it renders NO gap detail block', () => {
        expect(outcome.stdout).not.toContain('no-assert ·');
      });
    });
  });

  given('[case2] a root with a covered site, a gap, and a bare exit', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', rolesRoot]),
      );

      then('exit code is 0 — a gap is a result, not a refusal', () => {
        expect(outcome.exitCode).toBe(0);
      });

      /**
       * ⭐ THE COMMENT-SKIP CLAMP.
       *
       * `alpha.sh:3` reads `#   - exit 1 for malfunction, exit 2 for
       * constraint`. a bare /exit [12]/ counts it, and the count becomes 4.
       * three is the count that says documentation was excluded.
       */
      then('⭐ a COMMENT line is NOT counted as a refusal site', () => {
        expect(outcome.stdout).toContain('refusal sites: 3');
      });

      then('it counts the one site whose message a test asserts', () => {
        expect(outcome.stdout).toContain('asserted: 1');
      });

      then('it splits the gap count by kind', () => {
        expect(outcome.stdout).toContain(
          'gaps: 2 (no-assert 1 · thin-msg 0 · no-msg 1)',
        );
      });

      then('it names the un-asserted site, with its file and line', () => {
        expect(outcome.stdout).toContain('demo/skills/alpha/alpha.sh');
        expect(outcome.stdout).toContain(
          ':11 no-assert · target not found anywhere on disk',
        );
      });

      /**
       * ⭐ THE DISCRIMINATOR FOR THE COVERED SITE.
       *
       * `alpha.sh:7` must NOT appear. without this, a build that reported
       * EVERY site as a gap would satisfy every assertion above.
       */
      then('⭐ it does NOT report the site whose message IS asserted', () => {
        expect(outcome.stdout).not.toContain(':7 no-assert');
        expect(outcome.stdout).not.toContain('no target given');
      });

      then('it names the exit site that carries no message at all', () => {
        expect(outcome.stdout).toContain('demo/skills/beta/beta.sh');
        expect(outcome.stdout).toContain(':4 no-msg');
      });
    });

    /**
     * ⭐ THE MATCH-DIRECTION CLAMP — the negative control the ad-hoc
     *    instrument FAILED.
     *
     * `alpha.sh:11`'s message is "target not found anywhere on disk". every
     * window of it — `anywhere`, `not found`, ` on disk` — occurs in
     * `alpha.integration.test.ts`, inside a `then` string that asserts only
     * an EXIT CODE.
     *
     * so a matcher that searches the TEST BLOB for windows of the MESSAGE
     * reports this site COVERED. the correct direction searches the MESSAGE
     * for a literal the test ASSERTS, and finds none.
     *
     * ⚠️ the wrong direction fails in the direction that LOOKS BETTER — it
     *    reports more coverage, so no count check catches it. only this
     *    fixture does.
     */
    when('[t1] a message whose words appear in test PROSE', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', rolesRoot]),
      );

      then('⭐ it is a gap — prose is not an assertion', () => {
        expect(outcome.stdout).toContain(
          'no-assert · target not found anywhere on disk',
        );
      });

      /**
       * ⚠️ this reads a PER-SITE fact, never the `asserted: N` count.
       *
       *    it used to assert `asserted: 1`, under this same name. that is a
       *    GLOBAL COUNT wearing a PER-ITEM name, and the two come apart under
       *    exactly the defect above: the wrong direction leaves the covered
       *    site covered and swallows the gap, so the count moves while the
       *    claim in the name stays true.
       *
       *    measured 2026-09-03. under the window-matcher probe this line went
       *    red beside the [t1] clamp, for the SAME cause — so it was a second
       *    reading of one defect rather than the control it is named for.
       *    `rule.require.assertions-that-discriminate`, the uniform-fixture row.
       */
      then('⭐ and the COVERED site is NOT a gap, so the fixture is real', () => {
        expect(outcome.stdout).not.toContain('no target given');
      });
    });
  });

  /**
   * ⭐ THE ARG-PARSE ARMS.
   *
   * every arm gets a case at the moment the skill is written, rather than a
   * walk months later. the two that every prior walk in this repo found dead
   * are the `-h` alias and the rhachet passthrough.
   *
   * ⚠️ THIS SKILL'S `*)` REFUSES ON SIGHT — it is not a positional
   *    accumulator. so under a `shift` defect on the passthrough arm the
   *    stray token is the FIRST passthrough flag's VALUE, and `--repo
   *    bhrain` must come first for `bhrain` to be the token named.
   */
  given('[case3] the arg-parse arms', () => {
    when('[t0] --help is passed', () => {
      const outcome = useThen('it succeeds', () => runSkill(['--help']));

      then('exit code is 0 and it renders the usage block', () => {
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('--in DIR');
      });

      then('⭐ it does NOT dump the shebang instead of the header', () => {
        expect(outcome.stdout).not.toContain('/usr/bin/env bash');
        expect(outcome.stdout).toContain('exit 0 swept');
      });
    });

    when('[t1] the -h alias is used', () => {
      const outcome = useThen('it succeeds', () => runSkill(['-h']));

      then('exit code is 0 and it renders the usage block', () => {
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('--in DIR');
      });

      then('⭐ it does NOT fall through to the unknown-option arm', () => {
        expect(outcome.stdout).not.toContain('unknown option');
      });
    });

    when('[t2] rhachet passes --repo, --skill and --role', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill([
          '--repo',
          'bhrain',
          '--skill',
          'audit.refusal.messages',
          '--role',
          'any',
          '--in',
          cleanRoot,
        ]),
      );

      then('⭐ it sweeps, rather than refuse', () => {
        expect(outcome.exitCode).toBe(0);
        expect(outcome.stdout).toContain('swept them all,');
      });

      then('⭐ it does NOT read a flag VALUE as a positional argument', () => {
        expect(outcome.stdout).not.toContain('bhrain');
      });
    });

    when('[t3] an unknown option is passed', () => {
      const outcome = useThen('it refuses', () => runSkill(['--zoom']));

      then('exit code is 2 and it names the option', () => {
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('unknown option: --zoom');
      });

      then('⭐ it is NOT reported as an unexpected ARGUMENT', () => {
        expect(outcome.stdout).not.toContain('unexpected argument');
      });

      then('⭐ the refusal is branded with THIS skill', () => {
        expect(outcome.stdout).toContain('🧪 audit.refusal.messages');
      });
    });

    when('[t4] a bare token is passed', () => {
      const outcome = useThen('it refuses', () => runSkill(['stray']));

      then('exit code is 2 and it names the token', () => {
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('unexpected argument: stray');
      });

      then('⭐ it is NOT reported as an unknown OPTION', () => {
        expect(outcome.stdout).not.toContain('unknown option');
      });
    });

    when('[t5] --in names a directory that is absent', () => {
      const at = path.join(tempDir, 'no-such-root');
      const outcome = useThen('it refuses', () => runSkill(['--in', at]));

      then('exit code is 2 and it names the path', () => {
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('root directory not found');
        expect(outcome.stdout).toContain('no-such-root');
      });

      then('⭐ it does NOT report an empty-value refusal instead', () => {
        expect(outcome.stdout).not.toContain('--in needs a directory');
      });
    });

    when('[t6] --in is handed an empty value', () => {
      const outcome = useThen('it refuses', () => runSkill(['--in', '']));

      then('exit code is 2 and it says the value is absent', () => {
        expect(outcome.exitCode).toBe(2);
        expect(outcome.stdout).toContain('--in needs a directory');
      });

      then('⭐ it does NOT report a not-found path instead', () => {
        expect(outcome.stdout).not.toContain('root directory not found');
      });
    });
  });

  /**
   * ⛔ THE ONE PROPERTY EVERY OTHER CASE IN THIS FILE IS BLIND TO.
   *
   *    every case above reaches the skill through `spawnSync('bash', [path])`.
   *    that route hands the file to an interpreter, so it never consults the
   *    executable bit — a 644 file passes all of them.
   *
   *    `rhx` does not. it execs the file directly, so a 644 file exits 126
   *    with "Permission denied" before a single line of the skill is read.
   *
   * ⭐ so the harness itself bypasses the property under test. that is a twin
   *    of leak 4 in `rule.require.assertions-that-discriminate` — a channel
   *    the operation destroys before the assertion reads it — except here the
   *    dead channel is the INVOCATION METHOD rather than an output.
   *
   *    the cure cannot be a better needle over stdout. it has to read a
   *    DIFFERENT observable: the file mode on disk.
   *
   * 🚩 measured 2026-09-03. this skill shipped at 100644 with 38 green tests,
   *    and `rhx audit.refusal.messages` failed at exit 126.
   */
  given('[case4] the skill is reached the way rhx reaches it', () => {
    when('[t0] the file mode on disk is read', () => {
      /**
       * ⚠️ the mode is read INSIDE the `then`, deliberately.
       *
       *    `useThen` hands back a PROXY, and a proxy coerced by a bitwise
       *    operator yields NaN — so `proxy & 0o111` is 0 whatever the real
       *    mode is, and the clamp reports red on a file that IS executable.
       *
       * 🚩 measured 2026-09-03. this clamp was first written with `useThen`.
       *    it went red before the fix and red AFTER it too, so its first red
       *    proved none of what it claimed. a positive control the WRONG
       *    CAUSE can satisfy — the same class as task #140.
       */
      then('⭐ it carries the executable bit — no spawn-through-bash case can see this', () => {
        const mode = fs.statSync(scriptPath).mode;
        // eslint-disable-next-line no-bitwise
        expect(mode & 0o111).not.toBe(0);
      });
    });
  });

  given('[case5] a message that LEADS with an interpolation', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', leadRoot]),
      );

      then('it reads past the hole and finds the site asserted', () => {
        expect(outcome.stdout).toContain('asserted: 1');
        expect(outcome.stdout).toContain(
          'every refusal site has an asserted message',
        );
      });

      /**
       * ⭐ THE DISCRIMINATOR.
       *
       * before the fix this site was `no-msg` — reported as a caller with no
       * reason at all, when a 44-character assertable literal sat one
       * character past the `$`. the count assertion above would go red too,
       * but only THIS row says WHY.
       *
       * 🚩 measured 2026-09-03 under the reverted capture:
       *    `gaps: 1 (no-assert 0 · thin-msg 0 · no-msg 1)` and `:4 no-msg`.
       */
      then('⭐ it does NOT count a no-msg gap', () => {
        expect(outcome.stdout).not.toContain('no-msg 1');
      });

      then('⭐ it does NOT render the site as a bare exit', () => {
        expect(outcome.stdout).not.toContain(':4 no-msg');
      });
    });
  });

  given('[case6] one skill with a site of each gap kind', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', kindRoot]),
      );

      then('it counts one of each kind', () => {
        expect(outcome.stdout).toContain('refusal sites: 3');
        expect(outcome.stdout).toContain(
          'gaps: 3 (no-assert 1 · thin-msg 1 · no-msg 1)',
        );
      });

      then('it names the site whose long literal no test asserts', () => {
        expect(outcome.stdout).toContain(
          ':4 no-assert · epsilon needs a real target on disk',
        );
      });

      then('it names the bare exit that carries no message at all', () => {
        expect(outcome.stdout).toContain(':13 no-msg');
      });

      /**
       * ⭐ THE DECISIVE ROW.
       *
       * `:6` is `print_blocked "$a $b"` — a call with a real message and no
       * literal a test could hold onto.
       *
       * 🚩 the measured fall-through is WORSE than the one predicted, and the
       *    prediction's exclusion had no teeth. the old capture required six
       *    literal characters, so `"$a $b"` did not match it at all — and the
       *    look-back then WALKED PAST the call to the one above it:
       *
       *      :6 no-assert · epsilon needs a real target on disk
       *
       *    that is `:4`'s message, on `:6`'s exit. so `:6 no-msg` never
       *    appeared, and an exclusion written from the prediction reports
       *    green over a row that attributes one site's reason to another.
       *    the exclusion below names what was actually observed.
       */
      then('⭐ the all-interpolation message is thin-msg', () => {
        expect(outcome.stdout).toContain(':6 thin-msg');
      });

      then('⭐ it does NOT attribute the PRIOR site\'s message to this exit', () => {
        expect(outcome.stdout).not.toContain(
          ':6 no-assert · epsilon needs a real target on disk',
        );
      });
    });
  });

  /**
   * ⛔ THE SHAPE THIS REPO ACTUALLY USES TO REFUSE.
   *
   *    measured 2026-09-04 against `src/domain.roles`: all THREE `no-msg`
   *    sites left after the defect-4 fix were false. each emitted a rich
   *    reason, and each was asserted by a test:
   *
   *      doc.letterhead:342          leaf 8 lines up   asserted at test:1320
   *      doc.letterhead:373          leaf 13 lines up  asserted at test:342
   *      pii.scan.via.regex:733      report_hits 4 up  (a named emitter)
   *
   *    ⚠️ that is the WORST place for the instrument to be wrong. `no-msg` is
   *       the one kind the report describes in absolute terms — "the caller
   *       gets a bare code, NO assertion over stdout can ever discriminate
   *       here" — and it was 3-for-3 false.
   *
   * 🚩 RE-MEASURED 2026-09-05 — the VERDICT holds and the POPULATION does not.
   *    `no-msg` is now **4**, and only ONE of the three rows above is among
   *    them: the two `doc.letterhead` rows were cleared by defect 5's own fix,
   *    and three FILE RELAYS in `patent.priors.fetch` arrived with defect 16.
   *    every one of the four is still false, so the point this case makes is
   *    untouched — the census under it is not.
   *
   * ⛔ AND THIS EXACT BREAKDOWN LIVES IN THREE FILES. the identical three rows
   *    are in `audit.refusal.messages.sh`'s header and in `sweep.js`'s
   *    defect-5 note. one instrument fix rotted all three at once, and each
   *    copy reads as INDEPENDENT CORROBORATION of the other two — so a reader
   *    who cross-checks them finds perfect agreement and is no better off.
   *
   *    ⭐ a copy-pasted measurement does not merely rot in N places. it
   *       manufactures N-1 false witnesses. when a dated count is worth
   *       repeating, repeat the POINTER, never the census.
   */
  given('[case7] a treestruct refusal block, a dozen lines above its exit', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', blockRoot]),
      );

      then('it reads the leaf and finds the site asserted', () => {
        expect(outcome.stdout).toContain('asserted: 1');
        expect(outcome.stdout).toContain(
          'every refusal site has an asserted message',
        );
      });

      then('⭐ it does NOT report a bare exit', () => {
        expect(outcome.stdout).not.toContain('no-msg 1');
      });

      then('⭐ it does NOT render the site as a gap of any kind', () => {
        expect(outcome.stdout).not.toContain(':15 ');
      });
    });
  });

  /**
   * ⭐ THE CONTROL THAT RULES OUT THE PLAUSIBLE FIX.
   *
   *    "widen the window" cures [case7] and re-opens harm 2 of defect 4 at a
   *    larger radius: the walk crosses a PRIOR EXIT and hands a bare exit the
   *    previous arm's reason. so the walk stops at a prior `exit`, and this
   *    case is what holds that stop in place.
   *
   *    the gap here is 10 lines — wider than the old 6-line window, so this
   *    case is silent under the old form, and decisive under a widened one
   *    that forgot the stop.
   */
  given('[case8] a bare exit ten lines below a PRIOR exit that has a message', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', stopRoot]),
      );

      then('the covered site is still covered', () => {
        expect(outcome.stdout).toContain('asserted: 1');
        expect(outcome.stdout).toContain('refusal sites: 2');
      });

      then('⭐ the bare exit is reported as a bare exit', () => {
        expect(outcome.stdout).toContain(':13 no-msg');
      });

      /**
       * ⛔ THE INHERITED MESSAGE IS AN ASSERTED ONE, so the misattributed site
       *    reads as COVERED and renders NO ROW AT ALL. that is harm 3, and it
       *    is why the exclusion has to name the COUNT rather than a row.
       *
       *    measured 2026-09-04: a first draft of this `then` excluded
       *    `:13 no-assert · eta found a real reason to refuse` — a row that
       *    NEITHER form ever prints. it was GREEN under the wrong fix, which
       *    is `rule.require.assertions-that-discriminate` leak 1 reproduced
       *    inside the clamp written to catch a different leak.
       */
      then('⭐ the inherited reason does NOT make the bare exit read COVERED', () => {
        expect(outcome.stdout).not.toContain('asserted: 2');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 0 · thin-msg 0 · no-msg 1)',
        );
      });
    });
  });

  /**
   * ⛔ THE EXIT-STOP IS NOT ENOUGH — a FUNCTION BOUNDARY is a second stop.
   *
   *    found 2026-09-04 by a row diff of the tree-wide sweep after the
   *    defect-5 fix. the `[[ "$hitcount" -eq 0 ]] || exit 2` arm of
   *    `pii.scan.via.regex` was the ONE site the fix was
   *    documented as unable to reach — its reason comes from `report_hits`, a
   *    named function. it cleared anyway, which is the tell: a site that
   *    should have stayed `no-msg` went `asserted`.
   *
   *    the cause is that a 40-line look-back walked UP OUT OF `main` AND INTO
   *    `report_hits`, and adopted its final echo. no `exit` sits between
   *    them, so the exit-stop never fires.
   *
   *    ⚠️ the verdict was accidentally CORRECT — that footer really is
   *       asserted (task #172) — while the mechanism was a lie. so the report
   *       named the right column for the wrong reason, and no part of the row
   *       itself could reveal it.
   */
  given('[case9] a bare exit in one function, below a message in ANOTHER', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', scopeRoot]),
      );

      then('⭐ the bare exit does NOT borrow the other function\u2019s message', () => {
        expect(outcome.stdout).toContain(':11 no-msg');
      });

      then('⭐ and it does NOT read as covered', () => {
        expect(outcome.stdout).not.toContain('asserted: 1');
        expect(outcome.stdout).toContain('asserted: 0');
      });
    });
  });

  /**
   * ⛔ A MESSAGE HAS AS MANY ASSERTABLE RUNS AS IT HAS HOLES, AND THE COVERAGE
   *    DECISION READ ONLY THE LONGEST ONE.
   *
   *    found 2026-09-04 on the FIRST ROW of the first real triage after the
   *    defect-6 fix. the gitignore guard in `doc.pseudonymize` reads:
   *
   *      print_blocked "map is not gitignored: $MAP — add it to .gitignore first"
   *
   *    `asLongestLiteral` hands back `— add it to .gitignore first` (28 ch) and
   *    discards `map is not gitignored:` (22 ch). the test asserts
   *    `'not gitignored'`, which lives in the run that was discarded — so a
   *    covered site was reported as a gap.
   *
   *    ⚠️ THE HARM DIRECTION IS THE CHEAPER ONE — a false GAP costs a reader
   *       one wasted triage; a false COVERED costs the guarantee. but it is
   *       SYSTEMATIC, because "label, then value, then advice" is the ordinary
   *       shape of a refusal reason.
   *
   *    ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS "MARK A MULTI-RUN SITE COVERED".
   *       `[t1]` rules it out: `iota.sh:7` also has two runs and neither is
   *       asserted by any test, so it must STAY a gap.
   */
  given('[case10] a message split by a variable into TWO assertable runs', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', runRoot]),
      );

      /**
       * ⚠️ THE ROW IS KEYED ON THE **EXIT** LINE, NEVER THE MESSAGE LINE. the
       *    message sits at `:3` and the row reads `:4`.
       *
       *    measured 2026-09-04: a first draft of this `then` excluded
       *    `:3 no-assert`, a row the report never prints in either form — so
       *    it was GREEN under the very defect it names. that is
       *    `rule.require.assertions-that-discriminate` leak 1, reproduced
       *    inside the SECOND consecutive clamp written to catch a leak, by
       *    the same author, on the same day.
       */
      then('⭐ a test that asserts the SHORTER run still reads as covered', () => {
        expect(outcome.stdout).not.toContain(':4 no-assert');
      });

      then('⭐ and the site is counted as asserted, not as a gap', () => {
        expect(outcome.stdout).toContain('asserted: 1');
      });

      then('⭐ a site whose runs NO test asserts stays a gap', () => {
        expect(outcome.stdout).toContain(':8 no-assert');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 1 · thin-msg 0 · no-msg 0)',
        );
      });
    });
  });

  /**
   * ⛔ A NEGATIVE ASSERTION IS NOT COVERAGE, AND THE COLLECTOR READ IT AS SOME.
   *
   *    found 2026-09-04 on the doc.pseudonymize triage, one defect after the
   *    last. the `--map is required` guard in `doc.pseudonymize.sh` reads:
   *
   *      [[ -n "$MAP" ]] || { print_blocked "--map is required"; exit 2; }
   *
   *    and the ONLY mention of that message in its whole test file is:
   *
   *      expect(result.stdout).not.toContain('--map is required');
   *
   *    written as a leak-1 discriminator for a DIFFERENT site — the unknown
   *    argument arm — to prove it does not fall through. delete that guard's
   *    message outright and that assertion stays GREEN, because an absent string
   *    is exactly what it asserts. the site was reported as covered with no
   *    clamp on it at all.
   *
   *    ⚠️ THE EXPENSIVE DIRECTION. defect 7 invented gaps; this HIDES them.
   *
   *    ⭐ AND THE LEAK-1 DISCIPLINE IS WHAT MAKES IT SYSTEMATIC — every
   *       positive in this repo is paired with an exclusion, by rule, so the
   *       more rigorous the test file the more phantom coverage it donates.
   *
   *    ⛔ `[t2]` RULES OUT THE BLACKLIST FIX. `kappa.sh:7` carries both a
   *       positive and a negative for one message, which is the ordinary shape
   *       of a leak-1 pair. "drop every literal seen after a `not.`" would
   *       strike it and invent a gap, so the fix reads POLARITY PER CALL SITE.
   */
  given('[case11] a refusal named ONLY by a `not.toContain`', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', polRoot]),
      );

      then('⭐ the negatively-named site is a GAP, not coverage', () => {
        expect(outcome.stdout).toContain(':4 no-assert');
      });

      /**
       * ⚠️ THIS ONE DOES NOT BITE UNDER THE DEFECT — it bites under the WRONG
       *    FIX. with the defect live both sites read as asserted, so `:8` is
       *    absent from the report either way. it goes red only on a blacklist,
       *    which is why the fix needs a SECOND probe.
       */
      then('⭐ a message asserted BOTH ways stays covered', () => {
        expect(outcome.stdout).not.toContain(':8 no-assert');
      });

      then('⭐ and the counts split one and one', () => {
        expect(outcome.stdout).toContain('asserted: 1');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 1 · thin-msg 0 · no-msg 0)',
        );
      });
    });
  });

  given('[case12] a clamp whose literal reaches PAST the hole', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', spanRoot]),
      );

      then('⭐ a clamp that reaches past the hole COUNTS', () => {
        expect(outcome.stdout).not.toContain(':4 no-assert');
      });

      /**
       * ⚠️ THIS ONE DOES NOT BITE UNDER THE DEFECT — it bites under the WRONG
       *    FIX. with the defect live `:7` already reads as a gap, so it is
       *    present either way. it goes red only on an UNBOUNDED reverse, which
       *    is why the fix needs a SECOND probe.
       */
      then('⭐ prose that merely CARRIES the run is NOT coverage', () => {
        expect(outcome.stdout).toContain(':7 no-assert');
      });

      then('⭐ and the counts split one and one', () => {
        expect(outcome.stdout).toContain('asserted: 1');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 1 · thin-msg 0 · no-msg 0)',
        );
      });
    });
  });

  given('[case13] a clamp whose literal CARRIES another quote mark', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', quoteRoot]),
      );

      then('⭐ a literal that carries a DIFFERENT quote mark COUNTS', () => {
        expect(outcome.stdout).not.toContain(':4 no-assert');
      });

      /**
       * ⚠️ THIS ONE IS GREEN UNDER THE DEFECT — it bites under the WRONG FIX.
       *    one shared permissive class lets the short `toBe('ok')` body run past
       *    its own call and consume the quote that opens the clamp below, so a
       *    covered site turns into a gap. that is why the fix needs a SECOND
       *    probe rather than an argument.
       */
      then('⭐ a real clamp after a SHORT literal still COUNTS', () => {
        expect(outcome.stdout).not.toContain(':7 no-assert');
      });

      then('⭐ and both sites report as asserted', () => {
        expect(outcome.stdout).toContain('asserted: 2');
        expect(outcome.stdout).toContain(
          'gaps: 0 (no-assert 0 · thin-msg 0 · no-msg 0)',
        );
      });
    });
  });

  given('[case14] a run whose hole is on the LEFT, and one on BOTH sides', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', flankRoot]),
      );

      /**
       * ⛔ THE MIRROR OF DEFECT 9, AND IT SURVIVED THAT FIX. `lit.startsWith`
       *    reads a right-hole run only. this line is the one that was found by
       *    a clamp PROVEN to bite that the sweep still called a gap.
       */
      then('⭐ a LEFT-hole clamp COUNTS', () => {
        expect(outcome.stdout).not.toContain(':4 no-assert');
      });

      /**
       * ⛔ NEITHER END-ANCHOR REACHES THIS ONE. the run sits in the MIDDLE of
       *    the filled line, so `startsWith` and `endsWith` both refuse it.
       */
      then('⭐ an INTERIOR clamp COUNTS', () => {
        expect(outcome.stdout).not.toContain(':7 no-assert');
      });

      /**
       * ⚠️ THIS ONE DOES NOT BITE UNDER THE DEFECT — it bites under the WRONG
       *    FIX. with the defect live `:10` already reads as a gap, so it is
       *    present either way. it goes red only on an UNBOUNDED reverse
       *    applied to every run, which is why the fix needs a SECOND probe.
       */
      then('⭐ prose that carries a WHOLLY LITERAL run is NOT coverage', () => {
        expect(outcome.stdout).toContain(':10 no-assert');
      });

      then('⭐ and the counts split two and one', () => {
        expect(outcome.stdout).toContain('asserted: 2');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 1 · thin-msg 0 · no-msg 0)',
        );
      });
    });
  });

  given('[case15] a clamp that quotes only PART of the run beside its hole', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', partialRoot]),
      );

      /**
       * ⛔ DEFECT 12, ON THE LEFT FLANK. `lit.endsWith(run.text)` demands the
       *    WHOLE run, and this clamp took four words of a fifty-two character
       *    one. the sweep called it a gap over a clamp that is right there.
       */
      then('⭐ a PARTIAL left-hole clamp COUNTS', () => {
        expect(outcome.stdout).not.toContain(':4 no-assert');
      });

      /**
       * ⛔ THE MIRROR, and it needs its own assertion for the reason harm 11
       *    exists: a fix aimed at the flank in front of the author leaves the
       *    other flank exactly as broken, and no extant case can see it.
       */
      then('⭐ a PARTIAL right-hole clamp COUNTS', () => {
        expect(outcome.stdout).not.toContain(':7 no-assert');
      });

      /**
       * ⚠️ THIS ONE BITES UNDER THE WRONG FIX, not under the defect. with the
       *    defect live `:10` is already a gap, so it reads the same either way.
       *    it goes red only when the word boundary is dropped and any k >= 1 is
       *    admitted — which is the cheapest way to make the two above pass.
       */
      then('⭐ a ONE-LETTER coincidence is NOT coverage', () => {
        expect(outcome.stdout).toContain(':10 no-assert');
      });

      then('⭐ and the counts split two and one', () => {
        expect(outcome.stdout).toContain('asserted: 2');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 1 · thin-msg 0 · no-msg 0)',
        );
      });
    });
  });

  given('[case16] a refusal block whose LAST line is a thin echo', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', topRoot]),
      );

      /**
       * ⛔ SHAPE B — `echo ""`, the treestruct HOUSE STYLE. under the defect the
       *    walk halted on the blank echo and reported the site thin, so the
       *    RICHEST message in the block was invisible to the instrument.
       */
      then('⭐ the verdict above an EMPTY echo is reached', () => {
        expect(outcome.stdout).not.toContain(':5 thin-msg');
        expect(outcome.stdout).not.toContain(':5 no-assert');
      });

      /**
       * ⛔ SHAPE A — a pure interpolation. same halt, different closer, and this
       *    is the one that hid four `keyrack failed` sites across two skills.
       */
      then('⭐ the verdict above an INTERPOLATED echo is reached', () => {
        expect(outcome.stdout).not.toContain(':9 thin-msg');
        expect(outcome.stdout).not.toContain(':9 no-assert');
      });

      /**
       * ⛔ THE REGRESSION GUARD, and the only one here that bites under the
       *    plausible-but-wrong fix rather than under the defect. with the defect
       *    live `:15` is already thin; it flips COVERED the moment the echo
       *    fallback is allowed to cross a non-output line.
       *
       *    ⚠️ that is exactly what my first defect-13 fix did, and the net gap
       *       count went the RIGHT direction while this class went the wrong one.
       */
      then('⭐ an echo above a NON-OUTPUT line is NOT this arm remedy', () => {
        expect(outcome.stdout).toContain(':15 thin-msg');
      });

      /**
       * ⚠️ THE BOUND MUST NOT BLIND THE REDIRECTED BLOCK. inside `{ ... } >&2` a
       *    `for` and a `done` are ordinary, so the walk tolerates them and takes
       *    the TOPMOST echo. the inner row is asserted by no test on purpose, so
       *    a halt at the NEAREST echo renders this site a gap.
       */
      then('⭐ a redirected block is NOT a gap of any kind', () => {
        expect(outcome.stdout).not.toContain(':23 ');
      });

      /**
       * ⚠️ SPLIT FROM THE ABOVE ON PURPOSE. jest halts a `then` at its first
       *    red, so co-located these two could never be measured apart — and
       *    they answer different questions. the one above bites when the bound
       *    is too TIGHT (the block dies at its `done`); this one bites when the
       *    walk halts at the NEAREST echo instead of the topmost.
       */
      then('⭐ and the INNER echo is not mistaken for the reason', () => {
        expect(outcome.stdout).not.toContain('unreachable vendor row');
      });

      then('⭐ and the counts split three and one', () => {
        expect(outcome.stdout).toContain('refusal sites: 4');
        expect(outcome.stdout).toContain('asserted: 3');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 0 · thin-msg 1 · no-msg 0)',
        );
      });
    });
  });

  given('[case17] a verdict relayed to a FILE, not to a stream', () => {
    when('[t0] the root is swept', () => {
      const outcome = useThen('it succeeds', () =>
        runSkill(['--in', relayRoot]),
      );

      /**
       * ⛔ THE DECISIVE ONE. under the defect this site is ABSENT from the
       *    report — a false covered, which prints as silence, so the check
       *    has to be a POSITIVE assertion that the row exists at all.
       */
      then('⭐ the relay write does NOT supply the message', () => {
        expect(outcome.stdout).toContain(':4 no-msg');
      });

      /**
       * ⭐ THE DECISIVE REGRESSION HALF — an INLINE `echo "…" >&2`, where the
       *    verdict and the fd duplication share ONE line. that is the only
       *    shape a too-greedy discriminator can reach, and it is the common
       *    one in this repo.
       *
       * ⚠️ SPLIT ON PURPOSE. jest halts a `then` at its first red, so a
       *    regression half co-located with the probe could never be measured
       *    apart from it — and the two fail under OPPOSITE wrong fixes.
       *
       * 🚩 PROVEN 2026-09-04 by a probe that swapped the rule for a bare
       *    `/>/`: this clamp goes red while every other assertion here holds.
       */
      then('⭐ an INLINE `>&2` verdict is still read', () => {
        expect(outcome.stdout).not.toContain(':15 ');
      });

      /**
       * ⚠️ THE WEAK CONTROL — a `>&2` BLOCK, whose redirection sits on the
       *    closing brace rather than on the echo. the walk tests the ECHO's
       *    line, so no greedy rule can reach this shape: it is structurally
       *    immune and therefore CANNOT bite on that fix.
       *
       *    measured, not assumed — under the bare `/>/` this stayed GREEN at
       *    98/0, which is exactly why `:15` above had to be added.
       *
       *    it is kept because it still rules out a DIFFERENT wrong fix: a
       *    walk that halted AT the relay line instead of past it.
       */
      then('⭐ a `>&2` block is untouched by the discriminator', () => {
        expect(outcome.stdout).not.toContain(':12 ');
      });

      /**
       * ⚠️ THE THIRD CONTROL — an unredirected verdict, on the plain stream.
       *    weaker still; it earns its place by proving the walk reads a site
       *    with no redirection on it at all.
       */
      then('⭐ and an ordinary verdict is still read', () => {
        expect(outcome.stdout).not.toContain(':7 ');
      });

      /**
       * ⭐ THE SECOND REGRESSION HALF — an ANGLE-BRACKET USAGE HINT.
       *
       *    `<name>` shuts with a `>`, and that `>` sits INSIDE the quoted
       *    payload, where a redirect can never appear. a discriminator that
       *    tests the WHOLE LINE reads it as one and drops the message.
       *
       * 🚩 MEASURED 2026-09-04, on production. the whole-line form of this
       *    rule broke THREE asserted sites at once:
       *
       *      statement.parse:451  "... or add formats/<name>.fmt"
       *      pdf.redact:150       "--text requires --from <file>.pdf"
       *      pdf.redact:401       "pdf mode requires --into <file>.pdf"
       *
       *    each became a FALSE GAP — loud rather than silent, and still
       *    corrosive: a walk that cries wolf over covered sites is a walk
       *    its readers learn to skip.
       *
       * ⚠️ SPLIT FROM ITS SIBLINGS ON PURPOSE — jest halts a `then` at its
       *    first red, and this one fails under a DIFFERENT wrong fix than
       *    `:15` above does.
       */
      then('⭐ a `>` inside the quoted payload is not a redirect', () => {
        expect(outcome.stdout).not.toContain(':18 ');
      });

      then('⭐ and the counts split four and one', () => {
        expect(outcome.stdout).toContain('refusal sites: 5');
        expect(outcome.stdout).toContain('asserted: 4');
        expect(outcome.stdout).toContain(
          'gaps: 1 (no-assert 0 · thin-msg 0 · no-msg 1)',
        );
      });
    });
  });
});
