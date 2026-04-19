#!/usr/bin/env bash
######################################################################
# .what = search for permits by address in a jurisdiction
#
# .why  = find permit history for a property:
#         - verify prior work was permitted
#         - research permit status
#         - monitor permit activity
#
# .status = BLOCKED — requires Accela API access or webscrape
#
# todo: use rhachet-roles-kermet to webscrape
#
# usage:
#   permit.search.sh --address "123 Main St" --postal 46220
#   permit.search.sh --street-number 123 --street-name "Main St" --postal 46220
#
# guarantee:
#   - exit 2 (constraint) until unblocked
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# parse args
ADDRESS=""
POSTAL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role)
      shift 2
      ;;
    --address)
      ADDRESS="$2"
      shift 2
      ;;
    --postal)
      POSTAL="$2"
      shift 2
      ;;
    --street-number|--street-name|--since|--until|--limit|--cursor|--format)
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# emit blocked
emit_blocked "${ADDRESS:-unknown}" "${POSTAL:-unknown}"
exit 2
