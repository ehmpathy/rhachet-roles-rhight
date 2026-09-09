#!/usr/bin/env bash
######################################################################
# .what = output functions for briefs.integrity skill
# .why = provides the counselor scales treestruct format
######################################################################

# emit tree output from json result
emit_tree_from_json() {
  local json="$1"

  local root severity blockers nitpicks files reached
  root=$(echo "$json" | jq -r '.root')
  severity=$(echo "$json" | jq -r '.severity')
  blockers=$(echo "$json" | jq -r '.blockers')
  nitpicks=$(echo "$json" | jq -r '.nitpicks')
  files=$(echo "$json" | jq -r '.briefsWithDefects')

  # ⭐ the reach is READ from the set that was opened, never from the defects.
  #    a clean corpus and an unreached one both report zero defects; only this
  #    number separates them, so it leads the tally.
  reached=$(echo "$json" | jq -r '.briefsReached')

  echo ""
  if [[ "$blockers" -eq 0 ]]; then
    echo "⚖️ the briefs hold"
  else
    echo "⚖️ the briefs do not hold"
  fi
  echo ""
  echo "📋 briefs.integrity --path $root --severity $severity"
  echo "   ├─ scope: $root"
  echo "   ├─ briefs reached: $reached"
  echo "   ├─ briefs with defects: $files"
  echo "   ├─ blockers: $blockers"
  echo "   ├─ nitpicks: $nitpicks"

  # emit the per-check tally
  local check_count
  check_count=$(echo "$json" | jq -r '.countByCheck | length')

  if [[ "$check_count" -gt 0 ]]; then
    echo "   ├─ by check"
    # ⭐ close the LAST per-check row with └─, the rest with ├─ — per treestruct
    #    branch convention. keyed on an index, so it holds for any row count.
    local check_idx=0
    echo "$json" | jq -r '.countByCheck | to_entries | .[] | "\(.key)\t\(.value)"' \
      | while IFS=$'\t' read -r check count; do
        check_idx=$((check_idx + 1))
        if [[ "$check_idx" -eq "$check_count" ]]; then
          echo "   │  └─ $check: $count"
        else
          echo "   │  ├─ $check: $count"
        fi
      done
  fi

  # emit each defect
  local defect_count
  defect_count=$(echo "$json" | jq -r '.defects | length')

  if [[ "$defect_count" -eq 0 ]]; then
    echo "   └─ no defect detected in scope"
    return 0
  fi

  echo "   └─ defects"
  # ⭐ render each defect as a labeled branch, the last closed with └─ — per treestruct
  #    branch convention. keyed on an index against $defect_count, so every row carries a
  #    label rather than a bare frame glyph.
  local defect_idx=0
  echo "$json" | jq -r '.defects[] | "\(.severity)\t\(.path)\t\(.line // "-")\t\(.check)\t\(.detail)"' \
    | while IFS=$'\t' read -r sev path line check detail; do
      defect_idx=$((defect_idx + 1))
      local emoji branch cont
      emoji=$(get_severity_emoji "$sev")
      if [[ "$defect_idx" -eq "$defect_count" ]]; then
        branch="└─"
        cont="      "
      else
        branch="├─"
        cont="│     "
      fi
      echo "      $branch $emoji $path:$line"
      echo "      $cont$check"
      echo "      $cont$detail"
    done
}

# get emoji for a defect severity
get_severity_emoji() {
  local severity="$1"

  case "$severity" in
    blocker)
      echo "🔴"
      ;;
    nitpick)
      echo "🟡"
      ;;
    *)
      echo "❓"
      ;;
  esac
}
