#!/usr/bin/env node
/**
 * .what = sweep every refusal site in every skill executable under a root,
 *         and report the ones whose MESSAGE no test asserts.
 *
 * .why  = `rule.require.assertions-that-discriminate` leak 6: a guard's exit
 *         code often COINCIDES with the code its dependency emits unaided, so
 *         `expect(exitCode).toBe(2)` cannot tell "the guard ran and refused"
 *         from "the guard never ran". only the MESSAGE separates them.
 *
 *         this walks the whole tree for that class at once, rather than one
 *         skill at a time.
 *
 * usage:  node sweep.js <root>
 *
 * ⛔ NINE MEASURED DEFECTS THIS FILE EXISTS TO NOT REPEAT.
 *
 *    an earlier ad-hoc form of this sweep reported "154 of 260 uncovered".
 *    that figure was an artifact of the instrument, in three ways — and a
 *    fourth was found in the committed form, the first time its own output
 *    was triaged against the source:
 *
 *    1. COMMENT LINES COUNTED AS SITES. a header that reads
 *       `# - exit 1 for malfunction, exit 2 for constraint` matched a bare
 *       /exit [12]/ and became ~40 phantom sites. so a line whose first
 *       non-space character is `#` is skipped, here and in the look-back.
 *
 *    2. THE MESSAGE WAS TRUNCATED to a 28-character prefix, so any test that
 *       asserted a later part of the message read as uncovered. the message
 *       is now captured whole.
 *
 *    3. ⭐ THE MATCH RAN IN THE WRONG DIRECTION. it asked whether any window
 *       of the skill's message appears in the test blob — which ordinary
 *       English satisfies by accident. the negative control proved it: the
 *       needle `zzz-never-appears-anywhere` was reported FOUND, because the
 *       word `anywhere` occurs in test prose.
 *
 *       the direction that carries the signal is the reverse: does the test
 *       ASSERT a literal that is part of the message? so we extract the
 *       literals a test passes to toContain/toMatch/toBe, and ask whether the
 *       message contains one of them.
 *
 *    4. ⭐ `no-msg` MEANT TWO DIFFERENT THINGS, and the sharper one was buried.
 *       the capture read `"([^"$]{6,})"`, which stops at the FIRST `$` — so a
 *       message that merely LEADS with a variable yielded under six characters
 *       and fell through to "no message at all":
 *
 *         print_blocked "--$name is required"                     -> no-msg 🚫
 *         print_blocked "no '$LABEL' line found — parse cannot..." -> no-msg 🚫
 *
 *       the second is the worse miss: a 44-character assertable literal sat
 *       just past the hole and the instrument could not see it.
 *
 *       so a BARE exit — a caller handed a code and no reason, the one case
 *       no assertion over stdout can ever discriminate — was reported
 *       alongside messages that are perfectly assertable. the fix takes the
 *       LONGEST literal run rather than the prefix, and splits the kind into
 *       `no-msg` (no call at all) and `thin-msg` (a call, nearly all holes).
 *
 *    🚩 AND IT HAD A SECOND HARM, sharper than the one it was found for. a
 *       failed prefix match does not stop the look-back — it CONTINUES. so a
 *       call the capture could not read was walked past, and the site
 *       inherited the message of the site ABOVE it:
 *
 *         :4  print_blocked "epsilon needs a real target on disk" / exit 2
 *         :6  print_blocked "$a $b"                               / exit 2
 *
 *         -> :6 no-assert · epsilon needs a real target on disk    🚫
 *
 *       that is `:4`'s reason on `:6`'s exit. so the report did not merely
 *       under-classify — it MISATTRIBUTED, and a reader who triaged `:6`
 *       would go read a message that site never emits.
 *
 *       ⚠️ this was measured, not predicted. the clamp written from the
 *          prediction excluded `:6 no-msg`, which never appeared, so that
 *          exclusion reported green over the misattributed row. the extant
 *          exclusion names what the probe actually printed.
 *
 *    🚩 AND A THIRD HARM, which is the one that matters at tree scale: an
 *       inherited message can be an ASSERTED one, so a site the instrument
 *       walked past was reported COVERED. that is the dangerous direction —
 *       a gap that reads as protection.
 *
 *       ⭐ MEASURED BY A/B ON ONE TREE, same day, 223 sites:
 *
 *              asserted   gaps   no-msg   thin-msg
 *         pre       149     74       15          1
 *         post      147     76        3         15
 *
 *       read the `asserted` delta alone and the answer is "2 sites moved".
 *       the site-by-site diff says otherwise:
 *
 *         11 FALSE GAPS     the instrument invented (dropped on the fix)
 *         13 FALSE COVERED  the instrument hid      (appeared on the fix)
 *         -- 24 misclassified sites, 11% of the tree
 *
 *       74 - 11 + 13 = 76 and 149 - 13 + 11 = 147, so the two directions
 *       nearly cancel. A NET DELTA HIDES THE GROSS CHURN, and the two
 *       directions are not equally bad: a false gap costs a reader one
 *       wasted triage, a false COVERED costs the guarantee.
 *
 *       ⚠️ so an instrument fix is never validated by its summary line.
 *          diff the ROWS.
 *
 *    ⚠️ note what carried defect 4 for as long as it lived: the skill's own
 *       header claimed *"the message is captured WHOLE, never truncated to a
 *       prefix"* while the regex truncated to a prefix. prose about
 *       correctness is the weakest evidence there is
 *       (`rule.require.verify-guarantees-comments-assert`).
 *
 *    5. ⭐ THE MATCHER SET DID NOT KNOW THE CONVENTION THIS REPO USES. it read
 *       `print_blocked` and `echo` only — not `print_tree_leaf`, which is how
 *       a treestruct skill actually carries its reason:
 *
 *         {
 *           print_eagle_header "that wont work..."
 *           print_tree_start "doc.letterhead"
 *           print_tree_leaf "blocked" "a jurat has no capacity slot — $cite"
 *           print_tree_note ...          # a dozen more lines
 *         } >&2
 *         exit 2
 *
 *       and the look-back was SIX lines, against a block that routinely runs
 *       12-20. so two independent facts each hid the leaf, and the sweep
 *       reported `no-msg`.
 *
 *       ⚠️ THAT IS THE WORST PLACE FOR THIS INSTRUMENT TO BE WRONG. `no-msg`
 *          is the one kind the report described in absolute terms — "the
 *          caller gets a bare code, NO assertion over stdout can ever
 *          discriminate here". measured 2026-09-04 against
 *          `src/domain.roles`, all THREE `no-msg` sites were false, and all
 *          three were covered:
 *
 *            doc.letterhead:342       leaf 8 lines up   asserted at test:1320
 *            doc.letterhead:373       leaf 13 lines up  asserted at test:342
 *            pii.scan.via.regex:733   report_hits 4 up  (a named emitter)
 *
 *       🚩 RE-MEASURED 2026-09-05 — the VERDICT holds and the POPULATION does
 *          not. every `no-msg` site is still false, but there are now FOUR of
 *          them and only ONE of the three named above is among them:
 *
 *            patent.priors.fetch:766   FILE RELAY   <- new
 *            patent.priors.fetch:773   FILE RELAY   <- new
 *            patent.priors.fetch:786   FILE RELAY   <- new
 *            pii.scan.via.regex:733    named emitter   (the one that held)
 *
 *          the two `doc.letterhead` rows are gone because defect 5's own fix
 *          cleared them; the three relays arrived with defect 16 (a redirect
 *          to a FILE is not a message). ⭐ so ONE instrument fix cleared two
 *          rows of this note and ANOTHER added three, and the note that
 *          measured the population never re-ran.
 *
 *       ⚠️ AND THE ROW THAT HELD IS THE ONE A SPOT-CHECK PICKS. a reader who
 *          verifies this list one row at a time has a 1-in-3 chance of a FALSE
 *          CONFIRMATION — and the odds are worse than that, because
 *          `pii.scan.via.regex`'s `hitcount` arm is cited AGAIN in defect 6
 *          below, so it is the row a reader already has in hand. the cheapest
 *          row to check is the one that did not move.
 *
 *          ⭐ the general form, twice over: a dated breakdown can rot while
 *             its headline verdict stands, and the PART of a breakdown that
 *             survives is disproportionately the part a skim reaches for.
 *             re-run the whole list, never a row of it.
 *
 *       ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS "JUST WIDEN THE WINDOW". widened
 *          alone, the walk crosses a PRIOR EXIT and hands a bare exit the
 *          previous arm's reason — harm 2 of defect 4, re-opened at a larger
 *          radius. worse, the inherited reason may be an ASSERTED one, so the
 *          misattributed site reads as COVERED and renders no row at all.
 *          the width is only safe because the walk STOPS at a prior `exit`.
 *
 *       ⚠️ RESIDUAL, on the record: a reason emitted by a NAMED FUNCTION
 *          (`report_hits`, `print_usage`) is invisible to the matcher set, so
 *          the `[[ "$hitcount" -eq 0 ]] || exit 2` arm of `pii.scan.via.regex`
 *          reports `no-msg` and is covered all the
 *          same. `no-msg` is therefore a CANDIDATE, never a verdict — the
 *          absolute wording is retracted here and in the skill header.
 *
 *          🚩 THAT PARAGRAPH WAS WRITTEN BEFORE IT WAS MEASURED, and the
 *             sweep then reported `no-msg 0`. the contradiction is what
 *             surfaced defect 6. it holds NOW, after that fix — not before.
 *
 *    6. ⭐ THE EXIT-STOP WAS NOT ENOUGH — A FUNCTION BOUNDARY IS A SECOND STOP.
 *       a 40-line look-back can walk UP OUT OF one function body and INTO the
 *       one above it. no `exit` sits between them, so the exit-stop of defect
 *       5 never fires and the bare exit adopts a message from a function it
 *       never calls:
 *
 *         :698   echo "      not become the leak. open the file at the line"
 *         :699 }                     # <- report_hits ends here
 *         :701 main() {
 *         :733   [[ "$hitcount" -eq 0 ]] || exit 2
 *
 *       ⭐ FOUND BY A ROW DIFF, not by a summary line. that `hitcount` arm
 *          was the ONE site the defect-5 note above documented as beyond that
 *          fix's reach. it cleared anyway. a site that should have stayed
 *          `no-msg` went `asserted`, and that mismatch was the whole tell.
 *
 *       ⚠️ THE VERDICT CAME OUT ACCIDENTALLY CORRECT WHILE THE MECHANISM WAS
 *          A LIE. that footer really is asserted, so the report named the
 *          right column — for a reason it invented. no part of the row could
 *          reveal that, which is why the diff had to be against a documented
 *          expectation rather than against the row's own plausibility.
 *
 *       ⛔ THE STOP MUST BE A BARE `}`, NEVER ANY `}`. a treestruct refusal
 *          block closes with `} >&2`, and a stop that matched that would
 *          blind the walk to the very leaf defect 5 taught it to read. the
 *          two shapes are ONE CHARACTER APART and pull in opposite
 *          directions; `[case7]` and `[case9]` clamp each side.
 *
 *    7. ⭐ A MESSAGE HAS AS MANY ASSERTABLE RUNS AS IT HAS HOLES, AND THE
 *       COVERAGE DECISION READ ONLY THE LONGEST ONE. a variable in the MIDDLE
 *       of a reason splits it in two, and a test may have asserted either
 *       half. the gitignore guard in `doc.pseudonymize.sh` is the witness:
 *
 *         print_blocked "map is not gitignored: $MAP — add it to .gitignore first"
 *
 *         `map is not gitignored:`         22 ch   <- what the test asserts
 *         `— add it to .gitignore first`   28 ch   <- what the instrument read
 *
 *       `asLongestLiteral` handed back the 28 and discarded the 22, so the
 *       decision ran against a run the test never picked and a COVERED site
 *       was reported as a gap.
 *
 *       ⚠️ THE HARM DIRECTION IS THE CHEAPER ONE — a false GAP costs a reader
 *          one wasted triage, where a false COVERED costs the guarantee. but
 *          it is SYSTEMATIC: "label, then value, then advice" is the ordinary
 *          shape of a refusal reason, so this fires across the whole tree.
 *
 *       ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS "MARK EVERY MULTI-RUN SITE COVERED".
 *          `[case10][t2]` rules it out: the `iota.sh` fixture also carries two runs and
 *          NO test asserts either, so it must STAY a gap. a clamp that omits
 *          that discriminator would pass the wrong fix.
 *
 *       ⭐ THE ROW STILL RENDERS THE LONGEST RUN, for a reader's sake. only
 *          the DECISION reads them all. those two are separate concerns and
 *          the fix keeps them separate — `asLiteralRuns` returns the set,
 *          `asLongestLiteral` picks the one a human sees.
 *
 *       🚩 AND THE FIRST DRAFT OF ITS OWN CLAMP HAD NO TEETH — the exclusion
 *          named `:3 no-assert`, a row the report never prints in either
 *          form, because A ROW IS KEYED ON THE **EXIT** LINE AND NOT THE
 *          MESSAGE LINE. that is leak 1 of
 *          `rule.require.assertions-that-discriminate`, reproduced inside the
 *          SECOND CONSECUTIVE clamp written to catch a leak, by the same
 *          author, on the same day. caught only by a read of the PER-ASSERTION
 *          NAMES on the probe, never by the red count.
 *
 *    8. ⛔ A `not.toContain` CLAMPS NO PART OF THE MESSAGE IT NAMES, AND THE
 *       COLLECTOR READ IT AS COVERAGE. the literal pattern was
 *       `to(?:Contain|Match|Be)\(` and it never looked LEFT of the `to`, so a
 *       negative assertion fed it a literal exactly as a positive would.
 *
 *       found 2026-09-04 on the FIRST ROW of the doc.pseudonymize triage, one
 *       defect after the last. the `--map is required` guard in
 *       `doc.pseudonymize.sh` reads:
 *
 *         [[ -n "$MAP" ]] || { print_blocked "--map is required"; exit 2; }
 *
 *       and a grep of that whole skill directory for `--map is required`
 *       returns exactly THREE hits: a comment, the source line, and
 *
 *         expect(result.stdout).not.toContain('--map is required');
 *
 *       which was written as a leak-1 discriminator for a DIFFERENT site — the
 *       unknown-argument arm — to prove it does not fall through. delete that
 *       guard's message outright and that assertion stays GREEN, because an
 *       absent string is precisely what it asserts. the site carried no clamp
 *       at all and the report called it covered.
 *
 *       ⚠️ THIS ONE RUNS IN THE EXPENSIVE DIRECTION. defect 7 INVENTED gaps,
 *          which costs a reader one wasted triage. this HIDES them, which costs
 *          the guarantee the whole sweep exists to give.
 *
 *       ⭐ AND THE LEAK-1 DISCIPLINE IS WHAT MAKES IT SYSTEMATIC. every
 *          positive in this repo is paired with an exclusion, by rule. so the
 *          harder a test file works to discriminate, the more phantom coverage
 *          it hands the instrument — THE PRACTICE THAT HARDENS THE SUITE IS
 *          THE PRACTICE THAT BLINDS THE SWEEP.
 *
 *       ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS A BLACKLIST — "drop every literal
 *          that appears in a `not.`". the `kappa.sh` fixture rules it out:
 *          its message is asserted BOTH ways, which is the ordinary shape of a
 *          leak-1 pair, so a blacklist strikes it and INVENTS a gap. the fix
 *          reads POLARITY PER CALL SITE — a lookbehind on the collector —
 *          never per token.
 *
 *       🚩 NO ONE PROBE MEASURES THE WHOLE CLAMP, so both were run:
 *
 *            assertion                        defect live   blacklist
 *            the negatively-named site is a
 *              GAP, not coverage                  ✕ red       ✓ green
 *            a message asserted BOTH ways
 *              stays covered                      ✓ green     ✕ red
 *            and the counts split one and one     ✕ red       ✕ red
 *
 *          the first goes GREEN under the wrong fix, so it cannot tell the two
 *          apart. only the second can, and it is GREEN under the defect — so a
 *          single probe against the defect would have left it unmeasured.
 *
 *       🚩 AND THE FIRST DRAFT OF THIS VERY PARAGRAPH NAMED `[t2]` WHERE THE
 *          DISCRIMINATOR IS `[t1]`, in a header two sections below the note on
 *          how ordinals drift. the assertions are named by their own words
 *          above for that reason — an insert cannot move a name.
 *
 *    9. ⛔ A RUN STOPS AT THE HOLE, AND A REAL CLAMP QUOTES PAST IT. the
 *       coverage test was `run.includes(lit)` — the asserted literal had to sit
 *       INSIDE the skill's literal run. that direction is deliberate and stays
 *       (see the anchor note below). but it reads only the test that quotes a
 *       PREFIX, and the natural way to clamp a refusal is to quote it with the
 *       hole FILLED, because that is what the skill actually prints and it is
 *       the stronger assertion. the `-*)` arm of `pdf.redact.sh`:
 *
 *         print_blocked "unknown option: $1"
 *           run = `unknown option:`            <- what the instrument holds
 *           lit = `unknown option: --bogus`    <- the real clamp, in its own test
 *
 *       the lit is LONGER, so `run.includes(lit)` is false and a correct clamp
 *       that discriminates read as no clamp at all.
 *
 *       ⚠️ DEFECT 8 WAS MASKING IT. the same arm carries three
 *          `not.toContain('unknown option')` lines as leak-1 discriminators,
 *          and THAT literal does sit inside the run — so phantom coverage stood
 *          in for real coverage and the row looked right for the wrong reason.
 *          a fix to 8 surfaces 9 in the same sweep, which is why the post-8 row
 *          diff is a MIX of real finds and false gaps.
 *
 *       📏 SIZED AT FIFTEEN on two messages alone — a grep for
 *          `toContain('unknown option: ` / `toContain('unexpected argument: `
 *          over `src/domain.roles` returns 15 genuine positive clamps, every
 *          one of which the report called a gap.
 *
 *       ⚠️ IT RUNS IN THE CHEAP DIRECTION, like defect 7 and unlike defect 8 —
 *          it INVENTS gaps, so the cost is a wasted triage rather than a lost
 *          guarantee. that is why it survived so long: a false gap gets read,
 *          dismissed, and forgotten, one row at a time.
 *
 *       ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS AN UNBOUNDED REVERSE —
 *          `lit.includes(run)`. the reverse is refused ON PURPOSE and always
 *          was: a run may be as short as six characters, and six characters of
 *          ordinary English land inside long test prose by accident, so any
 *          sentence that happens to carry the run would read as coverage. the
 *          fix is ANCHORED — `lit.startsWith(run)` — and `[case12][t1]` holds
 *          a fixture whose test prose carries the run of an UNRELATED site,
 *          which must stay a gap.
 *
 *       🚩 NO ONE PROBE MEASURES THE WHOLE CLAMP, as with defect 8:
 *
 *            assertion                        defect live   unbounded
 *            a clamp that reaches past the
 *              hole COUNTS                        ✕ red       ✓ green
 *            prose that merely CARRIES the
 *              run is NOT coverage                ✓ green     ✕ red
 *            and the counts split one and one     ✕ red       ✕ red
 *
 *  ⛔ DEFECT 10 — an asserted literal that CARRIES a quote mark other than its
 *     own delimiter was dropped WHOLE, so the clamp was invisible.
 *
 *          expect(a.stdout).toContain("no files matched '*.txt' under here");
 *
 *       the collector held ONE class that excluded ALL THREE marks, so the body
 *       could not cross the inner `\x27`; the backreference then demanded `"`,
 *       was handed `\x27`, and the match failed at that position. the engine
 *       walked on and the whole assertion was lost.
 *
 *       ⚠️ IT RUNS IN THE CHEAP DIRECTION, like 7 and 9 and unlike 8 — it
 *          INVENTS gaps. and it is SYSTEMATIC on the ordinary shape of a shell
 *          refusal that QUOTES ITS OWN INPUT, which is how it was found: a
 *          clamp landed minutes earlier, proven to bite, came back as a gap.
 *
 *       📏 SIZED AT EIGHTEEN sites, NINE of them positive — a grep for
 *          `to(?:Contain|Match|Be)\("[^"]*\x27` plus its mirror over
 *          `src/domain.roles`; the other nine are `not.` and already dropped.
 *
 *       ⛔ AND THE HEADER OF THE VERY FUNCTION ASSERTED THE OPPOSITE — "the
 *          capture stops at its own closer whichever mark opened it." prose
 *          about correctness is the weakest evidence there is, exactly as in
 *          defect 4.
 *
 *       ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS ONE SHARED PERMISSIVE CLASS —
 *          `(["\x27`])([\s\S]{6,}?)\1`. it crosses the inner quote and breaks
 *          the other way: a literal under six chars sends the lazy body past
 *          its own call to the next same-mark quote, which fabricates a capture
 *          AND eats the quote that opens the next real clamp, so a covered site
 *          turns into a gap. the fix is PER-DELIMITER, one class per mark.
 *
 *       🚩 NO ONE PROBE MEASURES THE WHOLE CLAMP, a third time:
 *
 *            assertion                        defect live   shared class
 *            a literal that carries a
 *              DIFFERENT mark COUNTS              ✕ red       ✓ green
 *            a real clamp after a SHORT
 *              literal still COUNTS               ✓ green     ✕ red
 *            and both sites report as asserted    ✕ red       ✕ red
 *
 *  ⛔ DEFECT 11 — DEFECT 9 WAS FIXED FOR ONE HALF OF ITS OWN CLASS. the
 *     accommodation was `l.startsWith(run)`, which reads a clamp that quotes
 *     past a hole on the run's RIGHT. a hole on the run's LEFT has no mirror,
 *     so a proven clamp read as a gap — the exact INVERSE of the case already
 *     handled, and invisible for the same reason a mirror always is: the shape
 *     in front of the author is the shape that gets the anchor.
 *
 *       print_blocked "--$name is required"
 *         run = `is required`                <- the hole is on the LEFT
 *         lit = `--issued is required`       <- the real clamp, PROVEN to bite
 *
 *       `run.includes(lit)`   ✕  the lit is LONGER
 *       `lit.startsWith(run)` ✕  it starts with the FILLED hole
 *       `lit.endsWith(run)`   ✓  <- no branch existed for this
 *
 *     ⭐ AND A THIRD SHAPE HAS NEITHER ANCHOR. a run with a hole on BOTH sides
 *        sits in the MIDDLE of the filled line, so no end-anchor can reach it:
 *
 *          print_blocked "--$name must be a non-negative number, got: $val"
 *            run = `must be a non-negative number, got:`
 *            lit = `--authorized must be a non-negative number, got: ten-million`
 *
 *     ⭐ SO THE ANCHOR IS NOT A PROPERTY OF THE STRING — IT IS A PROPERTY OF
 *        THE SITE. a test can only have filled a hole that was there, so the
 *        permitted extension is read off the run's FLANKS:
 *
 *          hole on the right only  ->  `lit.startsWith(run)`   (defect 9)
 *          hole on the left only   ->  `lit.endsWith(run)`
 *          holes on BOTH sides     ->  `lit.includes(run)`
 *          no hole at all          ->  no extension whatsoever
 *
 *        the last row is what keeps the middle one honest. an unbounded
 *        `l.includes(run)` for EVERY run is the plausible-but-wrong fix, and is
 *        precisely what defect 9's note refuses: 6 characters of ordinary
 *        English land inside long test prose by accident. bounded to INTERIOR
 *        runs, the reverse costs only the runs whose both flanks the skill
 *        itself left open.
 *
 *     ⚠️ IT RUNS IN THE CHEAP DIRECTION, like 7 and 9 and 10 — it INVENTS
 *        gaps. and it is SYSTEMATIC on the most ordinary shape of all, a flag
 *        name interpolated at the FRONT of its own refusal.
 *
 *     🚩 FOUND BY A CLAMP THAT WAS PROVEN TO BITE AND STILL REPORTED AS A GAP.
 *        both `franchise.tax.delaware` arg loops were clamped, each probed,
 *        each measured red — and the post-walk sweep did not move by one row.
 *        a sweep that does not move after a proven fix is a claim about the
 *        INSTRUMENT, never about the work.
 *
 *     🚩 NO ONE PROBE MEASURES THE WHOLE CLAMP, a fourth time:
 *
 *            assertion                        defect live   unbounded
 *            a LEFT-hole clamp COUNTS            ✕ red       ✓ green
 *            an INTERIOR clamp COUNTS            ✕ red       ✓ green
 *            prose that carries a WHOLLY
 *              LITERAL run is NOT coverage       ✓ green     ✕ red
 *
 *  ⛔ DEFECT 13 — THE BACKWARD WALK RETURNED ON THE LAST LINE OF THE BLOCK, so
 *     the VERDICT was never reached and a fully-clamped refusal read as a gap
 *     FOREVER.
 *
 *       the walk runs UPWARD from the `exit`, and `echo "..."` is one of the
 *       three matchers. so the first hit is the block's LAST output line — and
 *       the last line of a refusal block is never its reason:
 *
 *         :190  print_blocked "vision API keyrack failed"   <- NEVER REACHED
 *         ...
 *         :197  echo "$keyrack_json" >&2                    <- matched -> thin
 *         :198  exit 2
 *
 *     ⭐ TWO SHAPES, AND THE WORSE ONE IS THE HOUSE STYLE:
 *
 *          A — pure interpolation   `echo "$keyrack_json"`
 *              patent.priors.fetch :145 :198 · patent.priors.search :122 :129
 *
 *          B — the EMPTY STRING     `echo ""`
 *              notary.find :95 :115 :141 :154 :180
 *
 *        shape B is every treestruct refusal in this repo, because a block
 *        closes on a blank line by convention. so the defect fires HARDEST on
 *        the best-formed refusals — the first of those `notary.find` sites
 *        carries a verdict AND a `fix:` line, and the instrument saw neither.
 *
 *     ⚠️ IT RUNS IN THE CHEAP DIRECTION, like 7 and 9 and 10 and 11 — it INVENTS
 *        gaps. but it is worse than its siblings in one respect: it is
 *        SYSTEMATIC AND UN-CLEARABLE. a site in shape A or B stays listed no
 *        matter how well it is clamped, so the gap count cannot be driven to
 *        zero and the instrument ceases to measure progress at all. it also
 *        MASKS: a permanently-listed site is indistinguishable from a genuinely
 *        uncovered one of the same shape.
 *
 *     🚩 FOUND THE SAME WAY DEFECT 11 WAS — a clamp landed, was probed five
 *        ways, each probe measured red, and the row did not move.
 *
 *     ⭐ THE FIX IS A PRIORITY, NOT A WIDER WINDOW. a refusal block has two
 *        kinds of line, and only one of them discriminates:
 *
 *          the VERDICT  `print_blocked` / `print_tree_leaf`   <- the reason
 *          the REMEDY   the echoes under it                   <- the cure
 *
 *        so a verdict matcher wins outright wherever the arm holds one, and a
 *        thin line no longer terminates the walk. the roster guard in
 *        `pii.scan.via.regex` moves
 *        from the remedy tail `is a worse leak than the one it prevents` to the
 *        verdict `roster is tracked by git:` — a better row on a site that was
 *        already listed.
 *
 *     ⛔ THE PLAUSIBLE-BUT-WRONG FIX IS THE UNION OF EVERY ECHO IN THE ARM. it
 *        reads as strictly more coverage and is the leak-1 hazard in person: a
 *        remedy line like `fix: see the usage --` recurs in every arm of every
 *        skill, so ONE assertion of it would clear ALL of them — FALSE COVERED,
 *        which is the EXPENSIVE direction and the one this instrument exists to
 *        avoid. where no verdict call exists at all, the fallback is the
 *        TOPMOST assertable echo, which is the verdict by house style
 *        (`🦅 <reason>` first, the `fix:` block under it).
 *
 *     ⚠️ AND THE NET COUNT CANNOT MEASURE THIS FIX. a site that flips
 *        gap -> covered must be read by hand against a real assertion; a drop in
 *        the total is satisfied just as well by a batch of FALSE COVERED.
 *
 * ⚠️ this reports a CANDIDATE gap, never a verdict. a message may be asserted
 *    through a snapshot, or by a regex this cannot read. read the site.
 */

const fs = require('node:fs');
const path = require('node:path');

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '__fixtures__',
  '__snapshots__',
  '.git',
]);

/** collect every regular file under a directory, without follow of symlinks */
const walk = (dir, out) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const at = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(at, out);
    else if (entry.isFile()) out.push(at);
  }
  return out;
};

const norm = (str) => str.replace(/\s+/g, ' ');

/**
 * the literals a test asserts POSITIVELY.
 *
 * ⛔ ONE ALTERNATIVE PER DELIMITER, never one shared class — see defect 10 in
 *    the header. a class that excludes ALL THREE marks cannot cross an inner
 *    quote, so `toContain("no files matched '*.txt'")` fails outright and the
 *    clamp vanishes. and one shared PERMISSIVE class fails the other way: a
 *    literal under 6 chars sends the lazy body past its own call to the next
 *    same-mark quote, which fabricates a capture AND eats the clamp after it.
 *    per-delimiter is the only shape that survives both.
 *
 * ⛔ THE LOOKBEHIND IS THE WHOLE POINT — see defect 8 in the header. a
 *    `not.toContain` clamps no part of the message it names, so a literal read
 *    out of one is phantom coverage. the pattern refuses to start on a `to`
 *    that a `not.` precedes.
 *
 * ⚠️ `\\s*` inside the lookbehind because the blob is whitespace-NORMALIZED
 *    before it reaches here, so a prettier-wrapped `.not\n.toContain(` arrives
 *    as `.not .toContain(`. without it the wrapped form slips the guard —
 *    which is the very defect, in a shape a reader would wave off as a mere
 *    line break.
 *
 * ⭐ THIS IS PER CALL SITE, NEVER PER TOKEN. a literal asserted positively
 *    ANYWHERE still counts, even when the same literal also appears in a
 *    `not.` elsewhere — which is the ordinary shape of a leak-1 pair, and is
 *    what `[case11][t1]` exists to prove a blacklist would break.
 */
const asAssertedLiterals = (blob) => {
  const found = [];
  const pattern = new RegExp(
    '(?<!\\bnot\\.\\s*)to(?:Contain|Match|Be)\\(\\s*' +
      '(?:"([^"]{6,}?)"|\\x27([^\\x27]{6,}?)\\x27|`([^`]{6,}?)`)',
    'g',
  );
  let hit = pattern.exec(blob);
  while (hit) {
    const lit = norm(hit[1] ?? hit[2] ?? hit[3]).trim();
    if (lit.length >= 6) found.push(lit);
    hit = pattern.exec(blob);
  }
  return found;
};

const isComment = (line) => /^\s*#/.test(line);

const MIN_LITERAL = 6;

/**
 * the longest ASSERTABLE run inside a shell double-quoted body.
 *
 * ⚠️ a test can only assert the LITERAL part of a message, never the
 *    interpolated part — so the holes are cut out and the longest run that
 *    remains is what a test could actually have matched on.
 *
 * ⛔ AN EARLIER FORM TOOK THE PREFIX, and it was wrong in two directions at
 *    once. it read `"([^"$]{6,})"`, so it stopped at the FIRST `$`:
 *
 *      print_blocked "--$name is required"
 *        -> prefix is `--`, under the minimum -> reported as NO MESSAGE
 *
 *      print_blocked "no '$LABEL' line found — parse cannot be reconciled"
 *        -> prefix is `no '`, under the minimum -> reported as NO MESSAGE,
 *           while a 44-char assertable literal sat just past the hole
 *
 *    so a message that merely LEADS with a variable was indistinguishable
 *    from a bare exit that prints no reason at all — which buried the
 *    sharpest class in the sweep under a pile of false ones.
 *
 * ⭐ EACH RUN CARRIES WHICH OF ITS FLANKS WAS A HOLE — see defect 11. that is
 *    the whole basis on which a clamp may quote PAST the run: a test can only
 *    have filled a hole that was there. a run with a hole on its right may be
 *    extended rightward, one with a hole on its left leftward, an INTERIOR run
 *    both ways, and a wholly-literal run not at all.
 *
 * ⛔ DEFECT 12 — defects 9 and 11 BOTH assumed a clamp quotes the WHOLE run and
 *    then extends into the hole. a real clamp does the opposite: it fills the
 *    hole and quotes only as much of the ADJACENT PORTION as it needs.
 *
 *      print_blocked "$n different cards here — a tally is one card by default"
 *      expect(stdout).toContain('2 different cards here')
 *
 *    the clamp is `[filled hole "2 "] + [PREFIX of the run]`, so the whole-run
 *    rule `lit.endsWith(run.text)` refuses it and reports a `no-assert` gap
 *    over a clamp that is right there. see isRunCovered.
 */
const asLiteralRuns = (body) => {
  const parts = body.split(
    /\$\{[^}]*\}|\$\([^)]*\)|\$[A-Za-z_][A-Za-z0-9_]*|\$[@*#?!$0-9-]/,
  );
  return parts
    .map((run, at) => ({
      text: norm(run).trim(),
      holeLeft: at > 0,
      holeRight: at < parts.length - 1,
    }))
    .sort((a, b) => b.text.length - a.text.length);
};

const asLongestLiteral = (body) => asLiteralRuns(body)[0]?.text ?? '';

/**
 * how many leading characters of `run` does `lit` END with, stopping on a word
 * boundary? this is the LEFT-hole shape: `lit` = [filled hole][run prefix].
 *
 * ⚠️ THE BOUNDARY IS WHAT KEEPS THIS HONEST. with any k >= 1 admitted, a single
 *    character carries the whole verdict — an assertion that merely ends in `d`
 *    would "cover" a run beginning `different cards here`. that is a
 *    coincidence, not a clamp. so the quoted prefix must end where a word ends.
 */
const asPrefixOverlap = (lit, run) => {
  for (let k = run.length; k >= 1; k -= 1) {
    if (!lit.endsWith(run.slice(0, k))) continue;
    if (k === run.length || /\s/.test(run[k])) return k;
  }
  return 0;
};

/**
 * the mirror: how many TRAILING characters of `run` does `lit` START with?
 * this is the RIGHT-hole shape: `lit` = [run suffix][filled hole].
 */
const asSuffixOverlap = (lit, run) => {
  for (let k = run.length; k >= 1; k -= 1) {
    const at = run.length - k;
    if (!lit.startsWith(run.slice(at))) continue;
    if (k === run.length || /\s/.test(run[at - 1])) return k;
  }
  return 0;
};

/**
 * does one asserted literal cover one run of a refusal message?
 *
 * ⛔ THE PERMITTED DIRECTION IS SET BY THE RUN'S HOLES, never by the string —
 *    see defect 11. an anchor picked off the string alone handles whichever
 *    shape was in front of the author and silently refuses the mirror of it,
 *    which is exactly how `l.startsWith` shipped without `l.endsWith`.
 *
 * ⭐ THE OVERLAP IS PARTIAL — see defect 12. the whole-run rules below are the
 *    k === run.length special case of the two overlap functions, so this is
 *    strictly ADDITIVE: no site that read as covered before can start failing.
 */
const isRunCovered = (run, lit) => {
  // ✅ the test quotes a PART of the run. always safe, in every shape
  if (run.text.includes(lit)) return true;

  // ⛔ a wholly-literal run admits NO extension. the skill printed every
  //    character of it, so a longer assertion carries words the skill never
  //    emitted — which is prose, not coverage
  if (!run.holeLeft && !run.holeRight) return false;

  // an INTERIOR run may be quoted whole, with both holes filled around it
  if (run.holeLeft && run.holeRight && lit.includes(run.text)) return true;

  if (run.holeRight && asSuffixOverlap(lit, run.text) > 0) return true;
  if (run.holeLeft && asPrefixOverlap(lit, run.text) > 0) return true;
  return false;
};

/**
 * the calls that carry a refusal reason, in the order they are tried.
 *
 * ⛔ `print_tree_leaf` IS THE ONE THIS REPO ACTUALLY USES. a treestruct
 *    refusal wraps a header, a start, a leaf, and a dozen notes in a
 *    `{ ... } >&2` block. the reason rides the leaf's SECOND argument.
 */
const REFUSAL_MATCHERS = [
  /print_blocked\s+"([^"]*)"/,
  /print_tree_leaf\s+"[^"]*"\s+"([^"]*)"/,
  /echo\s+"([^"]*)"/,
];

/**
 * how many of the matchers above carry the VERDICT rather than the REMEDY.
 *
 * ⛔ THE SPLIT IS THE WHOLE OF THE DEFECT 13 FIX. the first two name the reason
 *    a refusal fired; `echo` is the cure printed under it. a verdict wins
 *    outright, so the walk can no longer settle for the block's last line.
 */
const VERDICT_MATCHERS = 2;

/**
 * ⛔ THE ECHO FALLBACK NEEDS ITS OWN, TIGHTER BOUND — the exit and bare-`}`
 *    stops are not enough for it.
 *
 *    the VERDICT walk is safe at 40 lines because `print_blocked` is a call no
 *    ordinary line resembles. an ECHO is not: a shell file is full of them, and
 *    the first defect-13 fix reached, in `patent.priors.fetch`, a status-file
 *    write inside a BACKGROUNDED SUBSHELL, 35 lines above the exit and past
 *    `) &`, `done`, a `for` and an `if`, none of which stop the walk. it read
 *    as coverage. that is FALSE COVERED, the EXPENSIVE direction, and it was
 *    caught only by the per-site diff.
 *
 *    so the fallback runs over a CONTIGUOUS block of output, and no further:
 *
 *      - a `} >&2` line opens a redirected block, and the walk is then confined
 *        to it — the `{` that opens the block ends the search outright. this is
 *        the treestruct shape, and it is what reaches `notary.find`'s
 *        no-registry verdict past
 *        the `for` loop that legitimately sits inside the block
 *      - with no such block, the fallback dies at the first line that is not
 *        output — the `rm -rf "$tmp"` above `patent.priors.fetch`'s cleanup
 *        exit kills it at
 *        once, and the site correctly stays thin
 *
 * ⚠️ THE VERDICT WALK IS NOT BOUNDED BY THIS. only the echo fallback is killed;
 *    a `print_blocked` above a non-output line is still the reason, and the
 *    `roster is tracked by git:` verdict depends on that.
 *
 * ⚠️ THE RESIDUAL, RECORDED SO THE NEXT READER DOES NOT CHASE IT. a `done` or a
 *    `cp` between the exit and the message kills the fallback even where the
 *    loop it closes emits only output. three sites read `thin-msg` for that
 *    reason rather than for an interpolated message:
 *
 *      pii.scan.via.brain :633 :661   a `for` loop of pure echoes, unwrapped
 *      patent.priors.fetch :766 :773  the reason travels by STATUS FILE, and is
 *                                     re-emitted by the parent at :823
 *
 *    each errs in the CHEAP direction and each STAYS LISTED, so no site hides
 *    behind it. a wider rule that admitted the control-flow keywords would
 *    recover one row of the five and would have to admit `cp` to recover the
 *    rest — which is the union hazard again, at a smaller radius.
 */
const isOutputLine = (line) =>
  /^\s*$/.test(line) ||
  /^\s*\{\s*$/.test(line) ||
  /^\s*\}\s*(?:>&[12])?\s*$/.test(line) ||
  /^\s*(?:echo|printf|print_[A-Za-z_]+)\b/.test(line);

/** the `} >&2` that closes a treestruct refusal block */
const isRedirectedClose = (line) => /^\s*\}\s*>&[12]\s*$/.test(line);

/** the bare `{` that opens one */
const isBlockOpen = (line) => /^\s*\{\s*$/.test(line);

/**
 * ⛔ A REDIRECT TO A FILE IS NOT A MESSAGE — instrument defect 15.
 *
 *    `echo "..." > "$status_file"` looks exactly like a printed refusal to
 *    every matcher above, and it reaches no caller at all. a skill that relays
 *    a verdict out of a backgrounded subshell does precisely this, then
 *    re-emits the payload from the parent — so the assertable literal belongs
 *    to the PARENT'S site, never to the relay.
 *
 *    observed 2026-09-04 in patent.priors.fetch, where ONE root cause graded
 *    FOUR sites wrong at once. two relay writes read `thin-msg` (false gaps,
 *    the cheap direction), and a third read ASSERTED — a false covered, which
 *    is the silent one.
 *
 * ⚠️ `>&2` MUST SURVIVE THIS. an fd duplication is a real stream and is how
 *    most of this repo refuses, so a rule that ate it would blind the walk to
 *    nearly every treestruct block. the discriminator is therefore a `>` whose
 *    target is not `&`.
 *
 * 🚩 AND IT MUST BE TESTED ON THE **TAIL**, NEVER ON THE WHOLE LINE.
 *
 *    measured 2026-09-04: the first form of this rule tested the entire line,
 *    and a `>` INSIDE THE QUOTED PAYLOAD is not a redirect at all — it is the
 *    closing half of an angle-bracket usage hint. three production sites broke
 *    at once, every one of them already asserted:
 *
 *      print_blocked "... or add formats/<name>.fmt"       statement.parse:451
 *      print_blocked "--text requires --from <file>.pdf"   pdf.redact:150
 *      print_blocked "pdf mode requires --into <file>.pdf" pdf.redact:401
 *
 *    each turned into a FALSE GAP — the loud direction, and cheap to catch,
 *    but a walk that cries wolf on covered sites is a walk nobody reads.
 *
 *    ⭐ a redirect may only sit OUTSIDE the quotes, so the tail after the
 *       matched call is the whole of where it can appear. `hit.index` plus
 *       `hit[0].length` is that boundary, and it costs no extra work.
 */
const isFileRedirect = (tail) => />>?\s*(?!&)\S/.test(tail);

/**
 * ⚠️ THE WINDOW IS WIDE, AND THAT IS ONLY SAFE BECAUSE THE WALK STOPS.
 *
 *    a treestruct block routinely runs 12-20 lines, so a 6-line look-back
 *    cannot reach its leaf. but a wider window ALONE re-opens harm 2 of
 *    defect 4 at a larger radius — the walk crosses into a prior arm and
 *    hands a bare exit somebody else's reason.
 *
 *    the stop is what makes the width safe: a prior `exit` ends a prior
 *    arm, so every line above it belongs to a different site. clamped by
 *    `[case8]`, which is SILENT under the old narrow form and decisive
 *    under a widened one that forgot the stop.
 */
const LOOK_BACK = 40;

/**
 * the refusal message adjacent to an exit site.
 *
 * returns one of THREE shapes, and the distinction is the point:
 *   - null      -> no refusal call found at all. the caller likely gets a
 *                  bare exit code with no reason attached to it
 *   - ''        -> a call was found, but no literal run is long enough for a
 *                  test to assert. the message is nearly all interpolation
 *   - an array  -> EVERY assertable run, longest first. a message with a
 *                  variable in the middle has more than one, and a test may
 *                  have picked any of them — see defect 7
 *
 * ⚠️ `null` IS A CANDIDATE, NOT A VERDICT — see defect 5 in the header. a
 *    reason emitted by a NAMED function (`report_hits`, `print_usage`) is
 *    invisible here, and reads as a bare exit.
 */
const asAdjacentMessage = (lines, at) => {
  // ⛔ DEFECT 13 — the walk no longer halts on the FIRST hit. it runs upward
  //    from the exit, so the first hit is the block's LAST output line, and a
  //    treestruct block closes on `echo ""` or a bare interpolation. the
  //    VERDICT sits at the TOP of the block and was never reached.
  let echoTop = null; // the TOPMOST assertable echo — the reason, by house style
  let sawCall = false; // a refusal call was seen at all, assertable or not
  let echoLive = true; // may the fallback still be updated? see isOutputLine
  let inBlock = false; // are we inside a `{ ... } >&2` treestruct block?

  for (let j = at; j >= Math.max(0, at - LOOK_BACK); j--) {
    if (isComment(lines[j])) continue;

    // ⛔ a prior exit ends a prior arm. stop rather than inherit its reason
    if (j < at && /\bexit\s+[0-9]/.test(lines[j])) break;

    // ⛔ a BARE `}` ends a prior function body. stop for the same reason.
    //    it must be BARE: a treestruct block closes `} >&2`, and a stop that
    //    matched that would blind the walk to the leaf it exists to read.
    if (j < at && /^\s*\}\s*$/.test(lines[j])) break;

    // ⭐ the echo fallback's OWN bound — the verdict walk is unaffected
    if (j < at) {
      if (isRedirectedClose(lines[j])) inBlock = true;
      else if (inBlock && isBlockOpen(lines[j])) echoLive = false;
      else if (!inBlock && !isOutputLine(lines[j])) echoLive = false;
    }

    for (let m = 0; m < REFUSAL_MATCHERS.length; m++) {
      const hit = lines[j].match(REFUSAL_MATCHERS[m]);
      if (!hit) continue;

      // ⛔ defect 15 — the payload went to a FILE, so no caller ever saw it.
      //    `sawCall` stays false on purpose: a relay write is not a refusal
      //    call, and to count it would grade a bare exit `thin-msg` instead
      //    of `no-msg` and hide that the site has no message at all
      //
      // ⚠️ THE TAIL, NOT THE LINE. a `>` inside the quoted payload closes an
      //    angle-bracket usage hint; only the text AFTER the call may hold a
      //    real redirect. three asserted sites became false gaps under the
      //    whole-line form — see the docblock on isFileRedirect
      if (isFileRedirect(lines[j].slice(hit.index + hit[0].length))) break;

      sawCall = true;

      // ⛔ EVERY run, not just the longest — see defect 7. the longest is what
      //    the ROW renders, but coverage is decided against them all
      const runs = asLiteralRuns(hit[1]).filter(
        (r) => r.text.length >= MIN_LITERAL,
      );

      // ⭐ a VERDICT wins outright. it is the nearest `print_blocked` above the
      //    exit, which is the reason the refusal fired
      if (m < VERDICT_MATCHERS && runs.length) return runs;

      // an ECHO is the remedy. hold the TOPMOST assertable one and walk on:
      // a later iteration sits HIGHER in the block, so the last one held is
      // the first the skill emits — which is the reason, by house style
      if (runs.length && echoLive) echoTop = runs;
      break; // one matcher per line
    }
  }

  if (echoTop) return echoTop;
  return sawCall ? '' : null;
};

/** the tests that cover a given skill executable */
const asTestBlob = (sh) => {
  const dir = path.dirname(sh);
  const stem = path.basename(sh, '.sh');
  const flat = path.basename(dir) === 'skills';
  return norm(
    walk(dir, [])
      .filter((f) => f.endsWith('.test.ts'))
      .filter((f) => (flat ? path.basename(f).startsWith(stem) : true))
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n'),
  );
};

const main = () => {
  const root = process.argv[2];
  const shs = walk(root, [])
    .filter((f) => f.endsWith('.sh'))
    .filter((f) => f.includes(`${path.sep}skills${path.sep}`))
    .filter((f) => !f.endsWith('output.sh'))
    .sort();

  let sites = 0;
  let asserted = 0;
  const gaps = [];

  for (const sh of shs) {
    const lits = asAssertedLiterals(asTestBlob(sh));
    const lines = fs.readFileSync(sh, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (isComment(lines[i])) continue;
      if (!/\bexit\s+[12]\b/.test(lines[i])) continue;
      sites++;
      const runs = asAdjacentMessage(lines, i);

      // ⛔ no refusal call at all. the caller gets a bare exit code and no
      //    reason, so NO assertion over stdout could ever discriminate here
      if (runs === null) {
        gaps.push({ sh, line: i + 1, kind: 'no-msg', msg: '' });
        continue;
      }

      // ⚠️ a message exists, but it is nearly all interpolation — no literal
      //    run reaches the minimum, so a test has almost no purchase on it.
      //    this is NOT the same as no-msg and must not be counted with it
      if (runs === '') {
        gaps.push({ sh, line: i + 1, kind: 'thin-msg', msg: '' });
        continue;
      }

      // ⛔ ANY run may be the one a test asserts. the ROW renders the longest,
      //    for readability, but the decision reads them all — see defect 7
      //
      // ⛔ THE EXTENSION A CLAMP MAY MAKE IS SET BY THE RUN'S HOLES, never by
      //    the string — see defects 9 and 11. a test can only have filled a
      //    hole that was there, so a right-hole run anchors left, a left-hole
      //    run anchors right, an INTERIOR run may sit in the middle, and a
      //    wholly-literal run admits no extension at all.
      //
      //    an UNBOUNDED `l.includes(run)` for EVERY run is the wrong fix: it
      //    reads any sentence that happens to carry a 6-char run of ordinary
      //    English — clamped by `[case12][t1]` and `[case14][t2]`.
      if (runs.some((run) => lits.some((l) => isRunCovered(run, l))))
        asserted++;
      else gaps.push({ sh, line: i + 1, kind: 'no-assert', msg: runs[0].text });
    }
  }

  const noAssert = gaps.filter((g) => g.kind === 'no-assert').length;
  const thinMsg = gaps.filter((g) => g.kind === 'thin-msg').length;
  const noMsg = gaps.filter((g) => g.kind === 'no-msg').length;

  console.log(`   ├─ root: ${root}`);
  console.log(`   ├─ skills: ${shs.length}`);
  console.log(`   ├─ refusal sites: ${sites}`);
  console.log(`   ├─ asserted: ${asserted}`);
  console.log(
    `   ├─ gaps: ${gaps.length} (no-assert ${noAssert} · thin-msg ${thinMsg} · no-msg ${noMsg})`,
  );

  if (gaps.length === 0) {
    console.log('   └─ every refusal site has an asserted message');
    return;
  }

  console.log('   └─ gaps');
  const byFile = new Map();
  for (const gap of gaps) {
    const key = path.relative(root, gap.sh);
    if (!byFile.has(key)) byFile.set(key, []);
    byFile.get(key).push(gap);
  }
  const files = [...byFile.keys()];
  files.forEach((file, fi) => {
    const lastFile = fi === files.length - 1;
    console.log(`      ${lastFile ? '└─' : '├─'} ${file}`);
    const rows = byFile.get(file);
    rows.forEach((row, ri) => {
      const lastRow = ri === rows.length - 1;
      const rail = lastFile ? '   ' : '│  ';
      const tick = lastRow ? '└─' : '├─';
      const tail = row.msg ? ` · ${row.msg}` : '';
      console.log(`      ${rail}${tick} :${row.line} ${row.kind}${tail}`);
    });
  });
};

main();
