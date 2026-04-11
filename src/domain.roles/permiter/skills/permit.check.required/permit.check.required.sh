#!/usr/bin/env bash
######################################################################
# .what = determine if permit is required for work in jurisdiction
#
# .why  = enables permit requirement determination:
#         - parses work description to identify work type
#         - looks up applicable code sections
#         - analyzes exemptions
#         - returns structured determination with citations
#
# usage:
#   permit.check.required.sh --work "upgrade fuse box to breaker panel" --postal 46220
#   permit.check.required.sh --work "replace outdoor outlet" --postal 46220 --format json
#
# guarantee:
#   - treestruct output with eagle mascot
#   - cites exact code sections
#   - includes confidence level and disclaimer
#   - exit 0 = success, exit 1 = malfunction, exit 2 = constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# source output functions
source "$SCRIPT_DIR/output.sh"

# parse args
WORK=""
POSTAL=""
FORMAT="tree"

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role)
      shift 2
      ;;
    --work)
      WORK="$2"
      shift 2
      ;;
    --postal)
      POSTAL="$2"
      shift 2
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    --help|-h)
      echo "usage: permit.check.required.sh --work 'upgrade fuse box to breaker panel' --postal 46220"
      echo ""
      echo "options:"
      echo "  --work    description of work to be done"
      echo "  --postal  postal code (required)"
      echo "  --format  output format: tree (default) or json"
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# validate required args
if [[ -z "$WORK" ]]; then
  echo "error: --work is required" >&2
  exit 2
fi

if [[ -z "$POSTAL" ]]; then
  echo "error: --postal is required" >&2
  exit 2
fi

# determine jurisdiction from postal code
# for now, only indianapolis is supported (462xx)
if [[ "$POSTAL" =~ ^462 ]]; then
  JURISDICTION="indianapolis-marion-in"
else
  echo "error: postal code $POSTAL not supported. only Indianapolis (462xx) is currently supported." >&2
  exit 2
fi

# run the check via compiled js (dist) or tsx (src)
cd "$REPO_ROOT"
if [[ -f "$SCRIPT_DIR/permit.check.required.js" ]]; then
  RESULT=$(node "$SCRIPT_DIR/permit.check.required.js" \
    --work "$WORK" \
    --postal "$POSTAL" \
    --jurisdiction "$JURISDICTION")
else
  RESULT=$(npx tsx "$SCRIPT_DIR/permit.check.required.ts" \
    --work "$WORK" \
    --postal "$POSTAL" \
    --jurisdiction "$JURISDICTION")
fi

# output
if [[ "$FORMAT" == "json" ]]; then
  echo "$RESULT"
else
  emit_tree_from_json "$RESULT"
fi
