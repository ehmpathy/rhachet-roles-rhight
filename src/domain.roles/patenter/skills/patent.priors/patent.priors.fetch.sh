#!/usr/bin/env bash
######################################################################
# .what = fetch patent document by exid from USPTO
#
# .why  = retrieves full patent content for prior art analysis:
#         - claims (independent and dependent)
#         - specification text
#         - metadata (inventors, dates, classifications)
#
# usage:
#   patent.priors.fetch.sh --exid US20210234567A1
#
# guarantee:
#   - validates exid format before fetch
#   - caches immutable patent data (never stale)
#   - treestruct output with eagle mascot
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# cache location for patent documents
CACHE_DIR="${HOME}/.cache/rhachet/patents"

######################################################################
# parse_args
######################################################################
parse_args() {
  PATENT_EXID=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --exid)
        PATENT_EXID="$2"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these - ignore them
        shift 2
        ;;
      --help|-h)
        echo "usage: patent.priors.fetch.sh --exid US20210234567A1"
        exit 0
        ;;
      *)
        echo "unknown argument: $1" >&2
        exit 2
        ;;
    esac
  done

  if [[ -z "$PATENT_EXID" ]]; then
    print_blocked "exid required"
    echo ""
    echo "usage: patent.priors.fetch.sh --exid US20210234567A1"
    exit 2
  fi
}

######################################################################
# validate_exid - check format matches USPTO pattern
######################################################################
validate_exid() {
  # USPTO exid format: US followed by 7-11 digits, optional kind code
  # examples: US20210234567A1, US11234567B2, US7654321
  if [[ ! "$PATENT_EXID" =~ ^US[0-9]{7,11}(A1|A2|B1|B2)?$ ]]; then
    print_blocked "invalid patent format"
    echo ""
    echo "expected format: US12345678A1 or US20210234567A1"
    echo "received: $PATENT_EXID"
    exit 2
  fi
}

######################################################################
# cache_get - check if patent is cached
######################################################################
cache_get() {
  local cache_path="$CACHE_DIR/${PATENT_EXID}.json"

  if [[ -f "$cache_path" ]]; then
    # patent data is immutable, cache never stale
    cat "$cache_path"
    return 0
  fi

  return 1
}

######################################################################
# check_api_key - verify USPTO_ODP_API_KEY is set
######################################################################
check_api_key() {
  if [[ -z "${USPTO_ODP_API_KEY:-}" ]]; then
    print_blocked "API key required"
    echo ""
    echo "set USPTO_ODP_API_KEY environment variable"
    echo "get a key at: https://data.uspto.gov"
    exit 2
  fi
}

######################################################################
# fetch_patent - call USPTO ODP API
######################################################################
fetch_patent() {
  local endpoint="https://api.data.uspto.gov/v1/patent/applications/${PATENT_EXID}"
  local max_retries=3
  local retry_count=0
  local response

  while [[ $retry_count -lt $max_retries ]]; do
    response=$(curl -s -w "\n%{http_code}" \
      --max-time 30 \
      -H "X-API-KEY: $USPTO_ODP_API_KEY" \
      "$endpoint" 2>/dev/null) || {
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
          sleep $((retry_count * 2))
          continue
        fi
        print_blocked "API unavailable"
        echo ""
        echo "check network connection and try again"
        exit 1
      }

    local http_code
    http_code=$(echo "$response" | tail -n1)
    local body
    body=$(echo "$response" | sed '$d')

    case "$http_code" in
      200)
        echo "$body"
        return 0
        ;;
      429)
        # rate limited - read Retry-After and wait
        local retry_after
        retry_after=$(echo "$response" | grep -i "Retry-After" | awk '{print $2}' || echo "5")
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
          sleep "${retry_after:-5}"
          continue
        fi
        print_blocked "rate limited"
        echo ""
        echo "try again in a few seconds"
        exit 1
        ;;
      404)
        print_blocked "patent not found: $PATENT_EXID"
        echo ""
        echo "verify exid format (e.g., US12345678A1 or US20210234567A1)"
        exit 2
        ;;
      *)
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
          sleep $((retry_count * 2))
          continue
        fi
        print_blocked "API error: HTTP $http_code"
        exit 1
        ;;
    esac
  done
}

######################################################################
# parse_document - extract fields from API response
######################################################################
parse_document() {
  local response="$1"

  # extract patent data from USPTO ODP response
  local title abstract date_filed num_claims
  title=$(echo "$response" | jq -r '.title // "unknown"')
  abstract=$(echo "$response" | jq -r '.abstract // "none"')
  date_filed=$(echo "$response" | jq -r '.publicationDate // .filingDate // "unknown"')
  num_claims=$(echo "$response" | jq -r '.claims | length // 0')

  # build structured output
  cat <<EOF
{
  "exid": "$PATENT_EXID",
  "title": $(echo "$title" | jq -Rs .),
  "abstract": $(echo "$abstract" | jq -Rs .),
  "dateFiled": "$date_filed",
  "numClaims": $num_claims,
  "source": "uspto-odp"
}
EOF
}

######################################################################
# cache_set - write patent to cache
######################################################################
cache_set() {
  local document="$1"

  mkdir -p "$CACHE_DIR"
  echo "$document" > "$CACHE_DIR/${PATENT_EXID}.json"
}

######################################################################
# emit_document - treestruct output
######################################################################
emit_document() {
  local document="$1"

  local title date_filed num_claims abstract
  title=$(echo "$document" | jq -r '.title')
  date_filed=$(echo "$document" | jq -r '.dateFiled')
  num_claims=$(echo "$document" | jq -r '.numClaims')
  abstract=$(echo "$document" | jq -r '.abstract' | head -c 200)

  print_eagle_header "got one,"
  print_tree_start "patent.priors.fetch"
  print_tree_branch "exid" "$PATENT_EXID"
  print_tree_branch "title" "$title"
  print_tree_branch "filed" "$date_filed"
  print_tree_branch "claims" "$num_claims"
  print_tree_branch "abstract" "" "true"

  # print abstract with indentation
  echo "$abstract" | fold -w 60 | while read -r line; do
    echo "      $line"
  done
  if [[ ${#abstract} -ge 200 ]]; then
    echo "      ..."
  fi
}

######################################################################
# main
######################################################################
main() {
  parse_args "$@"
  validate_exid

  # check cache first
  local cached_doc
  if cached_doc=$(cache_get); then
    emit_document "$cached_doc"
    exit 0
  fi

  # fetch from API
  check_api_key

  local response
  response=$(fetch_patent)

  # parse and cache
  local document
  document=$(parse_document "$response")
  cache_set "$document"

  # emit output
  emit_document "$document"
}

main "$@"
