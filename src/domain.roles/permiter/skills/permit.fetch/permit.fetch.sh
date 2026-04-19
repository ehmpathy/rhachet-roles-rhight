#!/usr/bin/env bash
######################################################################
# .what = fetch permit details by permit ID
#
# .why  = get full permit record with status, contacts, inspections
#
# .status = BLOCKED — requires Accela API access or webscrape
#
# todo: use rhachet-roles-kermet to webscrape
#
# usage:
#   permit.fetch.sh --permit-number "BLDG-2023-00012345" --postal 46220
#
# guarantee:
#   - exit 2 (constraint) until unblocked
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# parse args
PERMIT_ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role)
      shift 2
      ;;
    --permit-number|--id)
      PERMIT_ID="$2"
      shift 2
      ;;
    --postal|--format)
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# emit blocked
emit_blocked "${PERMIT_ID:-unknown}"
exit 2
