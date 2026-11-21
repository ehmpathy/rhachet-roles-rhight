#!/usr/bin/env bash
######################################################################
# .what = audit every refusal site in every skill for an ASSERTED MESSAGE
#
# .why  = a guard's exit code often COINCIDES with the code its own
#         dependency emits unaided, so an assertion on the code cannot
#         tell "the guard ran and refused" from "the guard never ran".
#         only the MESSAGE separates the two.
#
#         `rule.require.assertions-that-discriminate` calls that leak 6.
#         it has been found one skill at a time, by hand, more than a
#         dozen times. this sweeps the whole tree for it at once.
#
# usage:
#   audit.refusal.messages.sh
#   audit.refusal.messages.sh --in src/domain.roles
#   audit.refusal.messages.sh --help
#
# options:
#   --in DIR   root to walk (default src/domain.roles)
#   --help     show usage and exit
#
# guarantee:
#   - a comment line is never counted as a refusal site. a header that
#     reads "exit 1 for malfunction" is documentation, not a guard
#   - the LONGEST literal run is captured, never a prefix. a message that
#     leads with a variable still yields whatever a test could assert
#   - a test's asserted literal is matched INSIDE the skill's message,
#     never the reverse. the reverse is satisfied by accident: ordinary
#     English in test prose contains windows of ordinary English in a
#     refusal message
#   - a bare exit and an all-interpolation message are reported as
#     DIFFERENT kinds. only the first is a caller with no reason at all
#   - every gap is reported. there is NO CAP, so no gap can be hidden
#   - exit 0 swept, exit 1 malfunction, exit 2 constraint
#
# the three gap kinds, sharpest first:
#   no-msg    no refusal call adjacent to the exit, so the caller likely gets
#             a bare code no assertion over stdout could discriminate.
#             ⚠️ THE WEAKEST OF THE THREE, and it used to be stated as a
#             certainty. measured 2026-09-04, all 3 were false: 2 emitted a
#             treestruct leaf the matcher set did not know, and 1 emits its
#             reason from a NAMED FUNCTION, which no matcher here can read.
#             read the site before you act on this kind
#             🚩 RE-MEASURED 2026-09-05 — the count above is now 4, and its
#             2+1 breakdown describes a population that no longer exists.
#             instrument defect 16 (a FILE RELAY is not a message) CHANGED
#             which sites land here: the 2 treestruct leaves left, and 3
#             relay sites in patent.priors.fetch arrived. today it reads
#             3 relays + 1 named function, and all 4 are still false.
#             ⭐ so a fix for ONE instrument defect MOVED the population of
#             ANOTHER, and the note that measured it never re-ran. a dated
#             count is a claim with a timestamp: re-measure it, never carry
#             it forward.
#   thin-msg  a message exists but is nearly all interpolation, so a test
#             has almost no literal to hold onto
#   no-assert a message exists with an assertable literal, and no test in
#             the skill's own test files asserts any part of it.
#             ⚠️ "the skill's OWN" is literal, and it is an ASSUMPTION: only
#             the `.test.ts` files under the executable's own directory are
#             read. a clamp that lives anywhere else is invisible to this
#             sweep, so a site that IS covered reports here as a gap.
#             measured 2026-09-04 — of 29 test files in this repo, exactly 2
#             sit outside a skill directory, both under `.husky/`. one of them
#             (`check.pii.integration.test.ts` [case8]) does assert the
#             `the brain mechanism was not found at:` refusal in `pii.scan.sh`,
#             which this sweep reports as a gap regardless.
#             🚩 RE-MEASURED 2026-09-05. the HEADLINE held and the BREAKDOWN
#             did not: still 29 test files, but THREE sit outside a skill
#             directory — the 2 under `.husky/`, plus
#             `src/publish.set.integration.test.ts` at the src root. that
#             third one asserts no refusal message, so it adds no false gap;
#             the count is simply wrong.
#             ⭐ so a reader who re-checks the CHEAP number gets a FALSE
#             CONFIRMATION. 29 was right on both dates, so the one figure a
#             skim verifies is the one that did not move.
#             ⚠️ and 6 of the 29 are UNTRACKED, so a dated count over this
#             corpus cannot be re-measured against its own date — git holds no
#             record of them. a later reader can establish "false now", never
#             "true when written".
#             ⛔ the [case8] half DOES hold — but its quoted needle defeats
#             the very check it invites. the test asserts `the brain mechanism
#             was not found` WITHOUT the ` at:` suffix, so a repo-wide grep
#             for the string as quoted above returns 3 hits and NOT the test,
#             which reads as a falsification. that is a NEEDLE error, not a
#             result. read the site.
#             ⛔ NOT widened, on purpose. the per-skill blob joins every test
#             in a directory and looks for the message INSIDE it, so a wider
#             root trades a false GAP for a false COVERED — and a false
#             covered is silent, which is the direction that costs a defect.
#
# 🎯 THE ADJUDICATED FLOOR — 7 gaps, every one already ruled FALSE
#
#    measured 2026-09-05, each read at its own site. keyed by FILE + KIND +
#    CAUSE, and never by line number: a line number freezes, and a frozen
#    coordinate then mutes the WRONG site
#    (`rule.forbid.line-offset-cross-references`).
#
#      patent.priors.fetch  no-msg    x3  FILE RELAY — the reason goes to a
#                                         status file, and the parent hands
#                                         it to print_blocked
#      patent.priors.fetch  thin-msg  x1  that relay itself: all interpolation
#                                         by construction
#      pii.scan             no-assert x1  asserted by [case8] of
#                                         check.pii.integration.test.ts, which
#                                         sits under .husky/ and so is outside
#                                         this sweep's per-skill root
#      pii.scan.via.brain   thin-msg  x1  the print nearest the exit is a loop
#                                         tail
#      pii.scan.via.regex   no-msg    x1  the reason comes from report_hits,
#                                         a NAMED FUNCTION
#
#    ⛔ this is a FLOOR, not a MUTE, and the difference is deliberate. the
#       no-assert note above already states the principle: a wider matcher
#       "trades a false GAP for a false COVERED — and a false covered is
#       silent, which is the direction that costs a defect." a mute
#       manufactures exactly that. so the seven stay on the list, and this
#       table is how a reader tells them apart from a NEW one.
#
#    ⭐ read the COUNT against this floor: 7 is the steady state, and an 8th
#       row is the signal. when one of the seven is closed for real, drop it
#       from this table in the SAME edit — an uncorrected floor hides the
#       very row it exists to surface.
#
# ⚠️ a gap is a CANDIDATE, never a verdict. a message may be asserted
#    through a snapshot, by a regex this cannot read, or by a test that
#    lives outside the skill's directory. read the site.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="audit.refusal.messages"
source "$SKILL_DIR/output.sh"

ROOT="src/domain.roles"
BODY=""

# render the header block above as help.
# bounded by its OWN fences, not a hardcoded line count, so the help
# cannot drift out of sync when the header grows.
# note: `/^#####/` not `/^#{5,}/` — mawk (the default awk on debian and
# ubuntu) does not support interval expressions. the pattern would not
# error; it would silently match no line and dump the whole executable.
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        show_help
        exit 0
        ;;
      --in)
        ROOT="$2"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these, ignore
        shift 2
        ;;
      -*)
        print_blocked "unknown option: $1"
        exit 2
        ;;
      *)
        print_blocked "unexpected argument: $1"
        exit 2
        ;;
    esac
  done
}

check_tools() {
  if ! command -v node &>/dev/null; then
    print_blocked "node not found: this sweep needs node on PATH"
    exit 2
  fi
}

validate_input() {
  if [[ -z "$ROOT" ]]; then
    print_blocked "--in needs a directory"
    exit 2
  fi
  if [[ ! -d "$ROOT" ]]; then
    print_blocked "root directory not found: $ROOT"
    exit 2
  fi
}

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one, `set -e` aborts on the assignment line itself when
#    node exits non-zero, so the refusal below never prints and the
#    caller gets a bare exit code with no reason attached to it.
#    `|| out=""` is what makes the failure survivable.
sweep() {
  local out
  out="$(node "$SKILL_DIR/sweep.js" "$ROOT" 2>&1)" || {
    print_blocked "sweep failed: $out"
    exit 1
  }
  BODY="$out"
}

main() {
  parse_args "$@"
  check_tools
  validate_input
  sweep

  print_eagle_header "swept them all,"
  print_tree_start "$SKILL_NAME"
  printf '%s\n' "$BODY"
}

main "$@"
