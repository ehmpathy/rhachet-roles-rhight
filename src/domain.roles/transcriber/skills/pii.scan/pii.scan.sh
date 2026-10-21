#!/usr/bin/env bash
######################################################################
# .what = scan a repo scope for PII, via regex and via brain, and
#         report which mechanism caught what
#
# .why  = a regex answers one question — does this text match this
#         shape? — and there are two it structurally cannot answer:
#
#           1. is this value REAL, or a synthetic fixture? 666-12-3456
#              and a live SSN have identical shape.
#           2. do these individually-harmless facts, TOGETHER, name one
#              person? {ZIP, gender, DOB} is a reported near-unique key
#              and not one of the three is PII on its own.
#
#         so neither mechanism is sufficient alone, and the pair has to
#         run in a specific order to be safe. that order is the reason
#         this dispatcher exists rather than two skills a caller
#         sequences by hand — a guarantee that lives in the caller is a
#         guarantee the next caller forgets.
#
# ⚠️ THE SEQUENCE IS THE SAFETY PROPERTY.
#    regex runs FIRST and its exit 2 is final. brain runs ONLY on a set
#    regex already called clean, so it can only ADD a block, never
#    subtract one. a wrong "clean" from a brain is therefore merely the
#    prior baseline; a "leak" from a brain is pure upside.
#
#    invert it — let a probabilistic reviewer overrule a deterministic
#    hit — and you have built a failhide at the one boundary where a
#    miss is unrecoverable.
#
# usage:
#   pii.scan.sh --diffs since-staged              # both mechanisms
#   pii.scan.sh --diffs since-staged --via regex  # deterministic, free
#   pii.scan.sh --diffs since-staged --via brain  # regex, THEN brain
#   pii.scan.sh --diffs since-staged --mode plan  # what would run
#   pii.scan.sh --diffs since-main
#   pii.scan.sh --paths-with 'src/**'
#   pii.scan.sh --help
#
# options:
#   --via WAY        auto (default) | regex | brain
#                    auto   regex, then brain if regex is clean
#                    regex  detectors + roster. offline, free, exact
#                    brain  same as auto; named for when you mean it
#   --mode MODE      plan | apply (default apply)
#   --diffs WHICH    since-staged | since-commit | since-main
#   --paths-with G   scope to G; repeatable
#   --paths-wout G   subtract G from the scope; repeatable
#   --join HOW       intersect (default) | union
#   --allow FILE     allowlist file (default: .pii-allow)
#   --roster FILE    literal values to catch by name (e.g. .pii-map)
#   --brain SLUG     a brain to ask; repeatable
#   --lockfiles      also scan lockfiles
#   --help, -h       show this help
#
# ⚠️ the scope flags are `rhx review`'s, verbatim. one canonical word
#    per concept (rule.require.ubiqlang) — this gate and that reviewer
#    are driven from the same hooks and the same guards, so a private
#    synonym would be a real cost rather than a cosmetic one.
#
# guarantee:
#   - --via brain ALWAYS runs regex first; the sequence cannot be
#     skipped by a caller, because the caller does not control it
#   - a mechanism that could not run is a MALFUNCTION, never a pass
#   - exit 0 clean, exit 1 malfunction, exit 2 hits (constraint)
#
# ⚠️ --via brain needs credentials and costs money. `--mode plan` shows
#    what would run without a spend. `--via regex` is the free path,
#    and the right one for a fast loop — but it is NOT the gate.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

VIA="auto"
MODE="apply"
PASSTHRU=()

print_usage() {
  cat <<'EOF'
🔎 pii.scan — scan a repo scope for PII before it reaches a commit

usage:
  pii.scan.sh --diffs since-staged             both mechanisms
  pii.scan.sh --diffs since-staged --via regex deterministic only, free
  pii.scan.sh --diffs since-staged --mode plan what would run, no spend
  pii.scan.sh --diffs since-main               branch scope
  pii.scan.sh --paths-with 'src/**'            explicit scope

options:
  --via WAY        auto (default) | regex | brain
  --mode MODE      plan | apply (default apply)
  --diffs WHICH    since-staged | since-commit | since-main
  --paths-with G   scope to G; repeatable
  --paths-wout G   subtract G from the scope; repeatable
  --join HOW       intersect (default) | union
  --allow FILE     allowlist file (default: .pii-allow)
  --roster FILE    literal values to catch by name (e.g. .pii-map)
  --brain SLUG     a brain to ask; repeatable
  --lockfiles      also scan lockfiles
  --help, -h       show this help

⚠️ the scope flags above are `rhx review`'s, verbatim. one word per
   concept — a caller who knows one skill can drive the other.

the two mechanisms:
  regex   detectors (ssn, ein, itin, phone, street) plus the roster's
          exact match. offline, free, deterministic, reproducible.
  brain   reviewers that read the diff for what has no fixed shape —
          a name, a derived id — and for whether a value is REAL or a
          synthetic fixture, which no pattern can decide.

⚠️ the sequence is the safety property. regex runs FIRST and its
   verdict is final; brain runs only on a set regex called clean, so
   a brain can only ADD a block, never wave one through.

exit:
  0  clean
  1  malfunction (a mechanism could not run — this BLOCKS)
  2  hits (constraint)
EOF
}

# ⚠️ scope, allowlist, and roster flags are forwarded VERBATIM to each
#    mechanism rather than re-parsed here. two parsers for one flag set
#    is two chances to drift, and a scope that means one thing to the
#    regex pass and another to the brain pass is a silent hole.
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --via)
        VIA="${2:-}"
        shift 2
        ;;
      --mode)
        MODE="${2:-}"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these, ignore
        shift 2
        ;;
      *)
        PASSTHRU+=("$1")
        shift
        ;;
    esac
  done
}

validate() {
  case "$VIA" in
    auto|regex|brain) ;;
    *)
      print_blocked "--via must be auto, regex, or brain"
      exit 2
      ;;
  esac
  case "$MODE" in
    plan|apply) ;;
    *)
      print_blocked "--mode must be plan or apply"
      exit 2
      ;;
  esac
}

main() {
  parse_args "$@"
  validate

  local regexSkill brainSkill
  regexSkill="$SCRIPT_DIR/pii.scan.via.regex.sh"
  brainSkill="$SCRIPT_DIR/pii.scan.via.brain.sh"

  # a mechanism that is absent is a gate that shrank without anyone who
  # chose to shrink it. block rather than silently run half the check.
  if [[ ! -f "$regexSkill" ]]; then
    print_blocked "the regex mechanism was not found at: $regexSkill"
    exit 1
  fi

  if [[ "$MODE" == "plan" ]]; then
    print_eagle_header "heres the plan,"
    print_tree_start "pii.scan"
    print_tree_branch "via" "$VIA"
    if [[ "$VIA" == "regex" ]]; then
      print_tree_leaf "would run" "regex only — offline, free"
    else
      print_tree_branch "would run" "regex, then brain if regex is clean"
      print_tree_leaf "cost" "the brain pass needs credentials and spends"
    fi
    exit 0
  fi

  # ── mechanism 1: regex. ALWAYS runs, whatever --via says ───────────
  local regexStatus=0
  bash "$regexSkill" "${PASSTHRU[@]}" || regexStatus=$?

  # a deterministic hit is final. the brain pass cannot overturn it,
  # and is not even asked — it has no verdict it could add.
  #
  # ⚠️ THIS EXIT MUST STAY ABOVE THE BRAIN CALL. move it below and the
  # exit code is unchanged, so every assertion but one stays green.
  # clamped by [case1]'s "the brain was never asked" in
  # .husky/check.pii.integration.test.ts — the only assertion that
  # reddens on that move, proven 2026-08-31.
  if [[ "$regexStatus" -ne 0 ]]; then
    exit "$regexStatus"
  fi

  # --via regex stops here, deliberately: the caller asked for the free
  # path and gets exactly that, with no surprise spend
  if [[ "$VIA" == "regex" ]]; then
    exit 0
  fi

  # ── mechanism 2: brain, on an already-clean set ────────────────────
  if [[ ! -f "$brainSkill" ]]; then
    print_blocked "the brain mechanism was not found at: $brainSkill"
    exit 1
  fi

  local brainStatus=0
  bash "$brainSkill" "${PASSTHRU[@]}" || brainStatus=$?
  exit "$brainStatus"
}

main "$@"
