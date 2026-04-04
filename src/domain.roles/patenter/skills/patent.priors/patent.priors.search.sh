#!/usr/bin/env bash
######################################################################
# .what = search for patents by keyword query
#
# .why  = find prior art for patentability analysis:
#         - returns relevant patents sorted by relevance
#         - surfaces alerts for vague queries
#         - provides suggestions when no results found
#
# usage:
#   patent.priors.search.sh --query "neural network compression"
#   patent.priors.search.sh --query "machine learning" --limit 50
#
# guarantee:
#   - validates query length
#   - results sorted by relevance (high to low)
#   - treestruct output with eagle mascot
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

######################################################################
# parse_args
######################################################################
parse_args() {
  QUERY_TEXT=""
  PAGE_LIMIT=20
  DATE_SINCE=""
  DATE_UNTIL=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --query)
        QUERY_TEXT="$2"
        shift 2
        ;;
      --limit)
        PAGE_LIMIT="$2"
        shift 2
        ;;
      --since)
        DATE_SINCE="$2"
        shift 2
        ;;
      --until)
        DATE_UNTIL="$2"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these - ignore them
        shift 2
        ;;
      --help|-h)
        echo "usage: patent.priors.search.sh --query \"search terms\""
        echo ""
        echo "options:"
        echo "  --query   search terms (required)"
        echo "  --limit   max results (default: 20)"
        echo "  --since   filter by date (YYYY-MM-DD)"
        echo "  --until   filter by date (YYYY-MM-DD)"
        exit 0
        ;;
      *)
        echo "unknown argument: $1" >&2
        exit 2
        ;;
    esac
  done

  if [[ -z "$QUERY_TEXT" ]]; then
    print_blocked "query required"
    echo ""
    echo "usage: patent.priors.search.sh --query \"search terms\""
    exit 2
  fi
}

######################################################################
# validate_query - check length, sanitize
######################################################################
validate_query() {
  local len=${#QUERY_TEXT}

  if [[ $len -lt 3 ]]; then
    print_blocked "query too short"
    echo ""
    echo "query must be at least 3 characters"
    exit 2
  fi

  if [[ $len -gt 1000 ]]; then
    print_blocked "query too long"
    echo ""
    echo "query must be under 1000 characters"
    exit 2
  fi

  # extract keywords for relevance score later
  KEYWORDS=$(echo "$QUERY_TEXT" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' ' ' | tr -s ' ')
  KEYWORD_COUNT=$(echo "$KEYWORDS" | wc -w | tr -d ' ')

  # set alert if query has fewer than 3 keywords
  if [[ $KEYWORD_COUNT -lt 3 ]]; then
    ALERT="query may be too vague (only $KEYWORD_COUNT keywords)"
  fi
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
# search_uspto - call USPTO ODP API
######################################################################
search_uspto() {
  local endpoint="https://api.data.uspto.gov/v1/patent/applications/search"
  local max_retries=3
  local retry_count=0
  local response

  # build query params
  local query_encoded
  query_encoded=$(printf '%s' "$QUERY_TEXT" | jq -sRr @uri)

  local url="${endpoint}?q=${query_encoded}&rows=${PAGE_LIMIT}"

  # add date filters if provided
  if [[ -n "$DATE_SINCE" ]]; then
    url="${url}&publicationDateStart=${DATE_SINCE}"
  fi
  if [[ -n "$DATE_UNTIL" ]]; then
    url="${url}&publicationDateEnd=${DATE_UNTIL}"
  fi

  while [[ $retry_count -lt $max_retries ]]; do
    response=$(curl -s -w "\n%{http_code}" \
      --max-time 30 \
      -H "X-API-KEY: $USPTO_ODP_API_KEY" \
      "$url" 2>/dev/null) || {
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
        # rate limited
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
          sleep 5
          continue
        fi
        print_blocked "rate limited"
        echo ""
        echo "try again in a few seconds"
        exit 1
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
# parse_results - extract and format results
######################################################################
parse_results() {
  local response="$1"

  local count
  count=$(echo "$response" | jq -r '.totalCount // .count // 0')

  if [[ "$count" == "0" ]] || [[ "$count" == "null" ]]; then
    RESULTS="[]"
    SUGGESTION="try broader terms, synonyms, or check for typos"
    return 0
  fi

  # extract patents array - handle USPTO ODP response format
  RESULTS=$(echo "$response" | jq -c '[(.results // .patents // [])[] | {
    exid: (.applicationNumber // .patent_number // "unknown"),
    title: (.title // .patent_title // "untitled"),
    abstract: (.abstract // .patent_abstract // ""),
    date: (.publicationDate // .patent_date // "")
  }]')
}

######################################################################
# sort_by_relevance - compute relevance score and sort
######################################################################
sort_by_relevance() {
  if [[ "$RESULTS" == "[]" ]]; then
    return 0
  fi

  # compute relevance for each result
  # title match = 2x weight, abstract match = 1x weight
  local scored_results
  scored_results=$(echo "$RESULTS" | jq -c --arg keywords "$KEYWORDS" '
    def count_matches(text; words):
      (text | ascii_downcase) as $lower |
      [words | split(" ")[] | select(length > 0) | select($lower | contains(.))] | length;

    [.[] | . + {
      relevance: (
        (count_matches(.title // ""; $keywords) * 2) +
        (count_matches(.abstract // ""; $keywords))
      )
    }] | sort_by(-.relevance)
  ')

  # scale to 0-1 range
  local max_score
  max_score=$(echo "$scored_results" | jq '[.[].relevance] | max // 1')

  RESULTS=$(echo "$scored_results" | jq -c --argjson max "$max_score" '
    [.[] | .relevance = (if $max > 0 then (.relevance / $max) else 0 end)]
  ')
}

######################################################################
# emit_results - treestruct output
######################################################################
emit_results() {
  local result_count
  result_count=$(echo "$RESULTS" | jq 'length')

  print_eagle_header "lets soar and see,"
  print_tree_start "patent.priors.search"
  print_tree_branch "query" "$QUERY_TEXT"
  print_tree_branch "results" "$result_count patents"

  if [[ "$result_count" == "0" ]]; then
    print_tree_branch "patents" "(none found)" "true"
  else
    echo "   └─ patents"

    # emit each result
    local i=0
    echo "$RESULTS" | jq -c '.[]' | while read -r patent; do
      local exid title relevance
      exid=$(echo "$patent" | jq -r '.exid')
      title=$(echo "$patent" | jq -r '.title' | head -c 50)
      relevance=$(echo "$patent" | jq -r '.relevance' | xargs printf "%.2f")

      i=$((i + 1))
      local is_last="false"
      if [[ $i -eq $result_count ]]; then
        is_last="true"
      fi

      if [[ "$is_last" == "true" ]]; then
        echo "      └─ $exid ($relevance)"
      else
        echo "      ├─ $exid ($relevance)"
      fi
      echo "         └─ $title"
    done
  fi

  # emit alert if set
  if [[ -n "${ALERT:-}" ]]; then
    print_alert "$ALERT"
  fi

  # emit suggestion if set
  if [[ -n "${SUGGESTION:-}" ]]; then
    print_suggestion "$SUGGESTION"
  fi
}

######################################################################
# main
######################################################################
main() {
  ALERT=""
  SUGGESTION=""

  parse_args "$@"
  validate_query
  check_api_key

  local response
  response=$(search_uspto)

  parse_results "$response"
  sort_by_relevance
  emit_results
}

main "$@"
