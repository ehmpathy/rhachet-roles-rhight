#!/usr/bin/env bash
######################################################################
# .what = check a Remote Online Notarization vendor against the STATE's
#         own registry of registered RON service providers, or list the
#         registered vendors for a state
#
# .why  = a RON act is valid because the notary is commissioned AND the
#         platform is a registered RON service provider. a polished site
#         with a checkout page is evidence of neither.
#
#         the state publishes the list. nobody else does — a "best online
#         notary 2026" ranking is an affiliate table, and it will happily
#         sell a signer a vendor that is not registered where they stand.
#
#         ⛔ THE REGISTRY CANNOT BE FETCHED. verified 2026-08-30: the
#         page is a search form whose list appears only after a "View
#         All" click. a raw GET returns 200 OK with ZERO table rows, on
#         every query-string variant tried. so this skill answers from a
#         COMMITTED SNAPSHOT and tells you how stale it is.
#
# usage:
#   notary.find.sh --state florida
#   notary.find.sh --state florida --vendor 'Proof'
#   notary.find.sh --state florida --retail
#   notary.find.sh --help
#
# options:
#   --state    jurisdiction (required). currently: florida
#   --vendor   check one vendor by substring, case-insensitive
#   --retail   list only the vendors known to serve retail customers
#   --help,-h  show usage and exit
#
# ⚠️ THE ANSWER IS ASYMMETRIC, and the output says so:
#
#   a MATCH  = the vendor was state-registered on the snapshot date.
#              strong, but a registration can lapse — re-verify.
#   a MISS   = ALMOST NOTHING. the registry grows continuously, and
#              vendors register under a parent name, a d/b/a, or a
#              product name. a miss is a prompt to go look by hand, and
#              is NEVER evidence that a vendor is unregistered.
#
#   a tool that rendered a miss as "not registered" would be confidently
#   wrong in the direction that costs a signer a valid notarization. so
#   this one exits 0 on a miss and prints the manual-check URL.
#
# guarantee:
#   - never claims a vendor is unregistered; only that it is absent from
#     a dated snapshot
#   - always prints the snapshot's age and the live URL
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./output.sh
source "$SKILL_DIR/output.sh"

STATE=""
VENDOR=""
RETAIL_ONLY="false"

# the vendors observed to serve retail customers. the registry itself does
# not carry this facet — most of its 100 names are title/mortgage platforms
# with no retail path — so this list is curated and is documented as such in
# howto.get-a-remote-online-notarization.jurisdiction=usa-florida.md
#
# ⚠️ ANCHORED AT LINE START, and each alternative is spelled to its boundary.
#    an unanchored `Notarize` matched two firms nobody here has checked —
#    `JustNotarized Inc.` and `NOTARIZE NORD` — which silently seeded a list
#    that CLAIMS curation with uncurated rows. a curated list that quietly
#    admits strangers is worse than no filter at all, because its whole value
#    is the claim that a human looked.
RETAIL_PATTERN='^(Proof\.com|Notarize[,.]|Notarize Genie|NotaryLive|Blue ?Notary|One ?Notary|NotaryCam|Notary Central|ProNotary|USA NOTARY)'

show_help() {
  awk '/^#####/ { if (seen++) exit; next } /^#/ { sub(/^# ?/, ""); print }' "${BASH_SOURCE[0]}"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role) shift 2 ;;
    --state)  STATE="$2"; shift 2 ;;
    --vendor) VENDOR="$2"; shift 2 ;;
    --retail) RETAIL_ONLY="true"; shift ;;
    --help|-h) show_help; exit 0 ;;
    *)
      {
        echo ""
        echo "🦅 unknown argument: $1"
        echo ""
        echo "  fix: see the usage --"
        echo "    rhx notary.find --help"
        echo ""
      } >&2
      exit 2
      ;;
  esac
done

if [[ -z "$STATE" ]]; then
  {
    echo ""
    echo "🦅 which state? --state is required"
    echo ""
    echo "  why: a notarization is governed by the law of the state where"
    echo "       the ACT happens, so the registry to check is that state's."
    echo ""
    echo "  fix: name it --"
    echo "    rhx notary.find --state florida"
    echo ""
    echo "  states with a registry shipped here:"
    echo "    florida"
    echo ""
  } >&2
  exit 2
fi

STATE_SLUG="$(echo "$STATE" | tr '[:upper:]' '[:lower:]')"
REGISTRY="$SKILL_DIR/registry/jurisdiction=usa-${STATE_SLUG}.json"

if [[ ! -f "$REGISTRY" ]]; then
  {
    echo ""
    echo "🦅 no registry shipped for state: $STATE"
    echo ""
    echo "  why: each state publishes its RON providers differently, and"
    echo "       several do not publish a list at all. a registry is added"
    echo "       here only once its source has been pulled and verified."
    echo ""
    echo "  states available:"
    for f in "$SKILL_DIR"/registry/jurisdiction=usa-*.json; do
      [[ -e "$f" ]] || continue
      b="$(basename "$f" .json)"
      echo "    ${b#jurisdiction=usa-}"
    done
    echo ""
    echo "  fix: to add one, pull its registry per"
    echo "       briefs/ronproviders/refs/<jurisdiction>/readme.md"
    echo ""
  } >&2
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  {
    echo ""
    echo "🦅 jq is required to read the registry snapshot"
    echo ""
    echo "  fix: install it --"
    echo "    sudo apt-get install jq    # debian/ubuntu"
    echo "    brew install jq            # macos"
    echo ""
  } >&2
  exit 1
fi

PULLED_AT="$(jq -r '.pulledAt // "unknown"' "$REGISTRY")"
PULLED_DAY="${PULLED_AT%%T*}"
SOURCE_URL="$(jq -r '.url // "unknown"' "$REGISTRY")"
TOTAL="$(jq -r '.statedTotal // 0' "$REGISTRY")"
COMPLETE="$(jq -r '.complete // false' "$REGISTRY")"
NAME_COUNT="$(jq -r '.uniqueNameCount // 0' "$REGISTRY")"

# ⛔ refuse to answer from a snapshot that was never verified complete. a
#    partial registry produces MISSES THAT LOOK LIKE ANSWERS, which is the
#    one failure this skill exists to prevent.
if [[ "$COMPLETE" != "true" ]]; then
  {
    echo ""
    echo "🦅 the shipped registry for $STATE is INCOMPLETE"
    echo ""
    echo "  why: its harvest did not match the source's own stated total,"
    echo "       so a 'not listed' result would be unreliable in exactly"
    echo "       the way this skill exists to avoid."
    echo ""
    echo "  fix: re-pull it, and confirm 'complete: true' --"
    echo "    see briefs/ronproviders/refs/jurisdiction=usa-${STATE_SLUG}/readme.md"
    echo ""
  } >&2
  exit 1
fi

# how stale is the snapshot? a date is not enough — a reader should not have
# to do the arithmetic to know whether to re-check.
AGE_DAYS="unknown"
if [[ "$PULLED_DAY" != "unknown" ]]; then
  if PULLED_EPOCH="$(date -d "$PULLED_DAY" +%s 2>/dev/null)"; then
    AGE_DAYS="$(( ( $(date +%s) - PULLED_EPOCH ) / 86400 ))"
  fi
fi

# ── one vendor ───────────────────────────────────────────────────────
if [[ -n "$VENDOR" ]]; then
  MATCHES="$(jq -r --arg v "$VENDOR" \
    '.names[] | select(ascii_downcase | contains($v | ascii_downcase))' \
    "$REGISTRY" || true)"

  if [[ -n "$MATCHES" ]]; then
    print_eagle_header "registered,"
    print_artifact_header "notary.find --state $STATE_SLUG --vendor '$VENDOR'"
    print_branch "match: yes"
    # ⚠️ these are DISTINCT NAMES, not registrations. the registry lists a
    #    vendor once per registration and this snapshot dedupes to names, so
    #    "2 names" here sits under "121 registrations" overall. to label them
    #    "rows" would invite the reader to read 2 as a registration count.
    MATCH_COUNT="$(echo "$MATCHES" | wc -l | tr -d ' ')"
    print_branch "names matched: $MATCH_COUNT"
    print_branch "as registered"
    while IFS= read -r line; do
      print_sub "   $line"
    done <<< "$MATCHES"
    print_branch "snapshot: $PULLED_DAY (${AGE_DAYS}d old)"
    print_leaf "re-verify (a registration can lapse)"
    print_sub_last "└─ $SOURCE_URL"
    echo ""
    exit 0
  fi

  # ⚠️ a miss is NOT a verdict. say so, loudly, and hand over the manual path.
  print_eagle_header "not in this snapshot,"
  print_artifact_header "notary.find --state $STATE_SLUG --vendor '$VENDOR'"
  print_branch "match: none"
  print_branch "snapshot: $PULLED_DAY (${AGE_DAYS}d old, $TOTAL registrations)"
  print_branch "⚠️  this is NOT evidence the vendor is unregistered"
  print_sub "   the registry grows continuously, and vendors register"
  print_sub "   under a parent name, a d/b/a, or a product name."
  # ⚠️ this spread is COMPUTED from the snapshot, never hard-typed. a prose
  #    claim like "one firm holds 5 rows" is a hand-counted figure that goes
  #    stale on the next pull and cannot be checked — the exact defect
  #    rule.forbid.hand-computed-figures exists to prevent.
  print_sub "   $TOTAL registrations here carry only $NAME_COUNT distinct names."
  print_leaf "check by hand"
  print_sub_last "├─ open $SOURCE_URL"
  print_sub_last "└─ click 'View All' — the list is empty until you do"
  echo ""
  exit 0
fi

# ── list ─────────────────────────────────────────────────────────────
print_eagle_header "here's who the state has on file,"
print_artifact_header "notary.find --state $STATE_SLUG$([[ "$RETAIL_ONLY" == "true" ]] && echo ' --retail')"
print_branch "snapshot: $PULLED_DAY (${AGE_DAYS}d old)"
print_branch "registrations: $TOTAL"
print_branch "distinct names: $NAME_COUNT"

if [[ "$RETAIL_ONLY" == "true" ]]; then
  print_branch "filter: retail-facing only (curated, not a registry facet)"
  # ⚠️ the filter can only OMIT, never disqualify. a vendor absent from this
  #    list was not judged wholesale — it was simply never checked, and the
  #    full list is one dropped flag away.
  print_sub "   an absent vendor was not judged — only never checked."
  print_sub "   drop --retail to see all $NAME_COUNT registered names."
  NAMES="$(jq -r '.names[]' "$REGISTRY" | grep -Ei "$RETAIL_PATTERN" || true)"
else
  NAMES="$(jq -r '.names[]' "$REGISTRY")"
fi

print_branch "vendors"
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  print_sub "   $line"
done <<< "$NAMES"

print_leaf "verify live before you buy"
print_sub_last "├─ open $SOURCE_URL"
print_sub_last "└─ click 'View All' — the list is empty until you do"
echo ""
exit 0
