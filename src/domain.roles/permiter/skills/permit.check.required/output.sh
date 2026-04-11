#!/usr/bin/env bash
######################################################################
# .what = output functions for permit.check.required skill
# .why = provides eagle mascot treestruct format
######################################################################

# emit tree output from json result
emit_tree_from_json() {
  local json="$1"

  local result confidence work_type jurisdiction
  result=$(echo "$json" | jq -r '.result')
  confidence=$(echo "$json" | jq -r '.confidence')
  work_type=$(echo "$json" | jq -r '.workType')
  jurisdiction=$(echo "$json" | jq -r '.jurisdiction')

  local result_emoji
  result_emoji=$(get_result_emoji "$result")

  echo ""
  echo "🦅 permit determination complete"
  echo ""
  echo "🏛️ permit.check.required"
  echo "   ├─ work type: $work_type"
  echo "   ├─ jurisdiction: $jurisdiction"
  echo "   ├─ result: $result $result_emoji"
  echo "   ├─ confidence: $confidence"

  # emit summary
  local summary
  summary=$(echo "$json" | jq -r '.summary')
  echo "   ├─ summary"
  echo "   │  ├─"
  echo "   │  │"
  echo "$summary" | while IFS= read -r line; do
    echo "   │  │  $line"
  done
  echo "   │  │"
  echo "   │  └─"

  # emit citations
  local citation_count
  citation_count=$(echo "$json" | jq -r '.citations | length')

  if [[ "$citation_count" -gt 0 ]]; then
    echo "   ├─ citations"

    local i=0
    while [[ $i -lt $citation_count ]]; do
      local citation code_ref relevance quote
      citation=$(echo "$json" | jq -r ".citations[$i]")
      code_ref=$(echo "$citation" | jq -r '.codeRef')
      relevance=$(echo "$citation" | jq -r '.relevance')
      quote=$(echo "$citation" | jq -r '.quote')

      local branch="├─"
      if [[ $((i + 1)) -eq $citation_count ]]; then
        branch="└─"
      fi

      echo "   │  $branch $code_ref ($relevance)"
      echo "   │     ├─"
      echo "   │     │"
      echo "$quote" | while IFS= read -r line; do
        echo "   │     │  $line"
      done
      echo "   │     │"
      echo "   │     └─"

      i=$((i + 1))
    done
  fi

  # emit disclaimer
  echo "   └─ disclaimer"
  echo "      ├─"
  echo "      │"
  echo "      │  this is not legal advice. consult a licensed attorney for guidance"
  echo "      │  specific to your situation. this research helps identify questions"
  echo "      │  to ask and areas to investigate — it does not replace professional"
  echo "      │  legal counsel."
  echo "      │"
  echo "      └─"
}

# get emoji for permit result
get_result_emoji() {
  local result="$1"
  local result_lower
  result_lower=$(echo "$result" | tr '[:upper:]' '[:lower:]')

  case "$result_lower" in
    required)
      echo "🔴"
      ;;
    not-required)
      echo "🟢"
      ;;
    conditional)
      echo "🟡"
      ;;
    unclear)
      echo "⚪"
      ;;
    *)
      echo "❓"
      ;;
  esac
}
