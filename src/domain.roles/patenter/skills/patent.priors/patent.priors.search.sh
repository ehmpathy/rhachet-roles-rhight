#!/usr/bin/env bash
######################################################################
# .what = search for patents by keyword query
#
# .why  = find prior art for patentability analysis:
#         - returns patents matching query (API order preserved)
#         - filters to patents with keywords in title
#         - surfaces alerts for vague queries
#         - provides suggestions when no results found
#
# usage:
#   patent.priors.search.sh --query "neural network compression"
#   patent.priors.search.sh --query "machine learning" --limit 50
#
# guarantee:
#   - validates query length
#   - filters to patents with query keywords in title
#   - preserves API result order
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
# check_api_key - get USPTO_ODP_API_KEY from keyrack
######################################################################
check_api_key() {
  local keyrack_json
  keyrack_json=$(rhx keyrack get --key USPTO_ODP_API_KEY --env test --owner ehmpath --json 2>&1) || {
    print_blocked "keyrack failed"
    echo ""
    echo "$keyrack_json"
    exit 2
  }
  USPTO_ODP_API_KEY=$(echo "$keyrack_json" | jq -r '.grant.key.secret')
  if [[ -z "$USPTO_ODP_API_KEY" || "$USPTO_ODP_API_KEY" == "null" ]]; then
    print_blocked "keyrack returned no secret"
    echo ""
    echo "$keyrack_json"
    exit 2
  fi
  export USPTO_ODP_API_KEY
}

######################################################################
# search_uspto - call USPTO ODP API
######################################################################
search_uspto() {
  local endpoint="https://api.uspto.gov/api/v1/patent/applications/search"
  local max_retries=3
  local retry_count=0
  local response

  # use free-form query (API uses simplified query syntax)
  local query_encoded
  query_encoded=$(printf '%s' "$QUERY_TEXT" | jq -sRr @uri)

  local url="${endpoint}?q=${query_encoded}&pagination.limit=${PAGE_LIMIT}&pagination.offset=0"

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
      -H "X-Api-Key: $USPTO_ODP_API_KEY" \
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
      401|403)
        print_blocked "API authentication failed: HTTP $http_code"
        echo ""
        echo "verify USPTO_ODP_API_KEY is valid"
        echo "get a key at: https://data.uspto.gov"
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
  # include inventor/applicant info when available from applicationMetaData
  RESULTS=$(echo "$response" | jq -c '[(.results // .patents // .patentFileWrapperDataBag // [])[] | {
    exid: (.applicationNumber // .applicationNumberText // "unknown"),
    title: (.title // .applicationMetaData.inventionTitle // "untitled"),
    abstract: (.abstract // ""),
    created: (.applicationMetaData.filingDate // .filingDate // null),
    updated: (.applicationMetaData.applicationStatusDate // null),
    published: (.applicationMetaData.earliestPublicationDate // .publicationDate // null),
    status: (.applicationMetaData.applicationStatusDescriptionText // .applicationStatus // null),
    inventor: (.applicationMetaData.firstInventorName // null),
    applicant: (.applicationMetaData.firstApplicantName // null)
  }]')
}

######################################################################
# filter_and_score - filter results that have keyword in title, then score
######################################################################
filter_and_score() {
  if [[ "$RESULTS" == "[]" ]]; then
    return 0
  fi

  # filter: require at least ONE keyword in title (title relevance gate)
  # preserve API order (don't re-sort)
  # apply limit after filter
  RESULTS=$(echo "$RESULTS" | jq -c --arg keywords "$KEYWORDS" --argjson limit "$PAGE_LIMIT" '
    def any_keyword_in_title(title; words):
      (title | ascii_downcase) as $lower |
      [words | split(" ")[] | select(length > 0) | select($lower | contains(.))] | length > 0;

    # filter: require at least one keyword in title, then limit
    [.[] | select(
      any_keyword_in_title(.title // ""; $keywords)
    )] | .[:$limit]
  ')

  # check if filter removed all results
  local result_count
  result_count=$(echo "$RESULTS" | jq 'length')
  if [[ "$result_count" == "0" ]]; then
    SUGGESTION="no patents have search terms in title; try different terms"
  fi
}

######################################################################
# emit_results - treestruct output
######################################################################
emit_results() {
  local result_count
  result_count=$(echo "$RESULTS" | jq 'length')

  # build resolved args string
  local resolved_args="--query \"$QUERY_TEXT\" --limit $PAGE_LIMIT"
  if [[ -n "$DATE_SINCE" ]]; then
    resolved_args="$resolved_args --since $DATE_SINCE"
  fi
  if [[ -n "$DATE_UNTIL" ]]; then
    resolved_args="$resolved_args --until $DATE_UNTIL"
  fi

  print_eagle_header "lets soar and see,"
  print_tree_start "patent.priors.search $resolved_args"
  print_tree_branch "results" "$result_count patents"

  if [[ "$result_count" == "0" ]]; then
    print_tree_branch "patents" "(none found)" "true"
  else
    echo "   └─ patents"

    # emit each result
    local i=0
    echo "$RESULTS" | jq -c '.[]' | while read -r patent; do
      local exid title filed published status inventor applicant
      exid=$(echo "$patent" | jq -r '.exid')
      title=$(echo "$patent" | jq -r '.title')
      created=$(echo "$patent" | jq -r '.created // empty')
      updated=$(echo "$patent" | jq -r '.updated // empty')
      published=$(echo "$patent" | jq -r '.published // empty')
      status=$(echo "$patent" | jq -r '.status // empty')
      inventor=$(echo "$patent" | jq -r '.inventor // empty')
      applicant=$(echo "$patent" | jq -r '.applicant // empty')

      i=$((i + 1))
      local is_last="false"
      if [[ $i -eq $result_count ]]; then
        is_last="true"
      fi

      # determine grain from application number prefix
      local grain=""
      local grain_emoji=""
      case "$exid" in
        90*)
          grain="reexam"
          grain_emoji="🔬" ;;
        35*)
          grain="design"
          grain_emoji="🎨" ;;
        *)
          grain="utility"
          grain_emoji="⚙️ " ;;
      esac

      # build parties line (inventor + applicant)
      local parties=""
      if [[ -n "$inventor" ]]; then
        parties="inventor = $inventor"
      fi
      if [[ -n "$applicant" ]]; then
        [[ -n "$parties" ]] && parties="$parties, "
        parties="${parties}applicant = $applicant"
      fi

      # build dates line (created on, updated on, published on)
      local dates=""
      if [[ -n "$created" ]]; then
        dates="created on = $created"
      fi
      if [[ -n "$updated" ]]; then
        [[ -n "$dates" ]] && dates="$dates, "
        dates="${dates}updated on = $updated"
      fi
      if [[ -n "$published" ]]; then
        [[ -n "$dates" ]] && dates="$dates, "
        dates="${dates}published on = $published"
      fi

      # map status to emoji
      local status_emoji=""
      case "$status" in
        *"New Case"*|*"Ready for Examination"*)
          status_emoji="🌱" ;;
        *"Dispatched"*|*"Not Yet Docketed"*|*"Preexam"*|*"Non Final Action"*|*"Non-Final Action"*)
          status_emoji="⏳" ;;
        *"Final Rejection"*|*"Final Action"*)
          status_emoji="🚫" ;;
        *"Notice of Allowance"*)
          status_emoji="✨" ;;
        *"Patented"*|*"Patent Issued"*)
          status_emoji="🏆" ;;
        *"Abandoned"*)
          status_emoji="💀" ;;
        *)
          status_emoji="📋" ;;
      esac

      # tree prefix based on position
      local prefix="      ├─"
      local cont="      │"
      if [[ "$is_last" == "true" ]]; then
        prefix="      └─"
        cont="       "
      fi

      # blank line before each application for visual separation
      # always use │ for visual connection (not cont, which may be spaces for last item)
      echo "      │"
      echo "${prefix} application $exid"
      echo "${cont}  ├─ title = $title"
      echo "${cont}  ├─ grain = $grain_emoji $grain"
      if [[ -n "$status" ]]; then
        echo "${cont}  ├─ status = $status_emoji $status"
      fi
      if [[ -n "$parties" ]]; then
        echo "${cont}  ├─ $parties"
      fi
      if [[ -n "$dates" ]]; then
        echo "${cont}  └─ $dates"
      fi
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
  filter_and_score
  emit_results
}

main "$@"
