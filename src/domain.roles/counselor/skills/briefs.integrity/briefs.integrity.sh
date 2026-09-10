#!/usr/bin/env bash
######################################################################
# .what = check every markdown brief against the mechanical invariants
#
# .why  = the automated peer rubrics are globbed to '**/*.{ts,sh}'. a
#         brief corpus is markdown, so those rubrics report 0/0 "approved"
#         every round while they read no brief at all. a check that cannot
#         reach its subject passes forever, and its passes carry no
#         information. this skill reaches the briefs.
#
#         what it detects:
#           - a `.see also` target that does not open
#           - fewer than 7 numbered sources
#           - a source no body sentence uses (a citation pad)
#           - an absent not-advice callout / .date researched / triage tag
#           - a file that claims text is absent while it holds that text
#           - a fullsun brief that names an obscure or protect brief
#           - a fullsun brief that leaks an internal engagement path
#
# usage:
#   briefs.integrity.sh                                  # whole roles tree
#   briefs.integrity.sh --path src/domain.roles/counselor
#   briefs.integrity.sh --severity blocker
#   briefs.integrity.sh --format json
#
# options:
#   --path      directory to check (default: src/domain.roles)
#   --severity  all (default) | blocker | nitpick
#   --format    tree (default) | json
#
# guarantee:
#   - treestruct output with the counselor scales
#   - reports `briefs reached` (measured from the set READ) alongside
#     `briefs with defects` (derived from the defects) — two distinct
#     numbers, because a clean corpus and an unreached one both report
#     zero defects and only the first tells them apart
#   - exit 0 = no blocker, exit 1 = malfunction, exit 2 = blocker or bad input
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"

# source output functions
source "$SCRIPT_DIR/output.sh"

# parse args
CHECK_PATH=""
SEVERITY="all"
FORMAT="tree"
CHECK_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role)
      shift 2
      ;;
    --path)
      CHECK_PATH="$2"
      shift 2
      ;;
    --severity)
      SEVERITY="$2"
      shift 2
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    --check)
      CHECK_ARGS+=(--check "$2")
      shift 2
      ;;
    --help|-h)
      echo "⚖️ briefs.integrity — check briefs against the mechanical invariants"
      echo ""
      echo "usage:"
      echo "  briefs.integrity.sh [--path <dir>] [--severity <level>] [--check <slug>] [--format <fmt>]"
      echo ""
      echo "options:"
      echo "  --path      directory to check         (default: src/domain.roles)"
      echo "  --severity  all | blocker | nitpick    (default: all)"
      echo "  --check     report only this check     (repeatable; default: all)"
      echo "  --format    tree | json                (default: tree)"
      echo ""
      echo "checks:"
      echo "  see-also-target-absent               a .see also target that does not open"
      echo "  sources-below-seven                  fewer than 7 numbered sources"
      echo "  source-anchor-unreferenced           a source no body sentence uses"
      echo "  not-advice-callout-absent            no 'not legal advice' callout"
      echo "  date-researched-absent               no '## .date researched' section"
      echo "  publishability-tag-absent            no triage tag"
      echo "  non-fullsun-in-published-path        a withheld brief that would ship"
      echo "  absence-claim-falsified-exact        claims text is absent while it holds it"
      echo "  fullsun-names-non-fullsun            a public brief names a withheld one"
      echo "  internal-scaffold-leaked-in-fullsun  a fullsun brief names a .behavior/ or .route/ path"
      echo ""
      echo "examples:"
      echo "  briefs.integrity.sh --path src/domain.roles/counselor --severity blocker"
      echo "  briefs.integrity.sh --check non-fullsun-in-published-path --severity blocker"
      exit 0
      ;;
    *)
      echo "⚖️ blocked — unknown argument: $1" >&2
      echo "   fix: run with --help to see the accepted options" >&2
      exit 2
      ;;
  esac
done

# default to the whole roles tree
# .why = the cross-file check (a fullsun brief that names a withheld one)
#        can only see the set it is given. a narrower default would leave
#        that check silently weaker than it appears — the exact failure
#        this skill exists to end. so the default is the widest sound scope.
if [[ -z "$CHECK_PATH" ]]; then
  CHECK_PATH="src/domain.roles"
fi

# validate the path before we hand it to node
if [[ ! -d "$REPO_ROOT/$CHECK_PATH" && ! -d "$CHECK_PATH" ]]; then
  echo "⚖️ blocked — no directory at: $CHECK_PATH" >&2
  echo "   fix: pass a directory that exists, e.g." >&2
  echo "     briefs.integrity.sh --path src/domain.roles/counselor" >&2
  exit 2
fi

# warn when the scope is narrowed below the cross-file check's reach
if [[ "$CHECK_PATH" != "src/domain.roles" ]]; then
  echo "⚖️ note — scope narrowed to $CHECK_PATH" >&2
  echo "   the cross-file check (fullsun-names-non-fullsun) only sees this" >&2
  echo "   subtree; a reference from a brief outside it will not be detected." >&2
fi

# run the checks via compiled js (dist) or tsx (src)
cd "$REPO_ROOT"
if [[ -f "$SCRIPT_DIR/briefs.integrity.js" ]]; then
  RESULT=$(node "$SCRIPT_DIR/briefs.integrity.js" \
    --path "$CHECK_PATH" \
    --severity "$SEVERITY" \
    "${CHECK_ARGS[@]}")
else
  RESULT=$(npx tsx "$SCRIPT_DIR/briefs.integrity.ts" \
    --path "$CHECK_PATH" \
    --severity "$SEVERITY" \
    "${CHECK_ARGS[@]}")
fi

# output
if [[ "$FORMAT" == "json" ]]; then
  echo "$RESULT"
else
  emit_tree_from_json "$RESULT"
fi

# exit 2 when a blocker was detected — a caller must fix it
BLOCKERS=$(echo "$RESULT" | jq -r '.blockers')
if [[ "$BLOCKERS" -gt 0 ]]; then
  exit 2
fi
