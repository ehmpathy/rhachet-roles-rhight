#!/usr/bin/env bash
######################################################################
# .what = eagle vibes output functions for patent.priors skills
#
# .why  = consistent, vibey output format across all patent skills
#
# usage:
#   source output.sh
#   print_eagle_header "lets soar and see,"
#   print_tree_start "patent.priors.search"
#   print_tree_branch "query" "neural network compression"
#   print_tree_leaf "results" "12 patents"
######################################################################

# print eagle emoji + phrase
# usage: print_eagle_header "lets soar and see,"
print_eagle_header() {
  local phrase="$1"
  echo "🦅 $phrase"
  echo ""
}

# print tree root with globe emoji
# usage: print_tree_start "patent.priors.search"
print_tree_start() {
  local command="$1"
  echo "🌎 $command"
}

# print tree branch (has children)
# usage: print_tree_branch "key" "value" [is_last]
print_tree_branch() {
  local key="$1"
  local value="$2"
  local is_last="${3:-false}"
  if [[ "$is_last" == "true" ]]; then
    echo "   └─ $key: $value"
  else
    echo "   ├─ $key: $value"
  fi
}

# print tree leaf (no children, with value)
# usage: print_tree_leaf "key" "value" [prefix] [is_last]
print_tree_leaf() {
  local key="$1"
  local value="$2"
  local prefix="${3:-   }"
  local is_last="${4:-true}"
  if [[ "$is_last" == "true" ]]; then
    echo "${prefix}└─ $key: $value"
  else
    echo "${prefix}├─ $key: $value"
  fi
}

# print section header with mountain emoji
# usage: print_section_header "what peaks can we claim?"
print_section_header() {
  local phrase="$1"
  echo ""
  echo "🏔️ $phrase"
}

# print route info with globe emoji
# usage: print_route_info "we'll track it down,"
print_route_info() {
  local phrase="$1"
  echo ""
  echo "🌎 $phrase"
}

# print error in tree format
# usage: print_tree_error "patent not found"
print_tree_error() {
  local message="$1"
  echo "   └─ error: $message"
}

# print alert (for soft warnings)
# usage: print_alert "query may be too vague"
print_alert() {
  local message="$1"
  echo ""
  echo "⚠️  $message"
}

# print suggestion (for guidance)
# usage: print_suggestion "try broader terms or synonyms"
print_suggestion() {
  local message="$1"
  echo "   └─ suggestion: $message"
}

# print blocked message (to stderr, so it propagates through command substitution)
# usage: print_blocked "that wont do..."
print_blocked() {
  local message="$1"
  echo "🦅 that wont do..." >&2
  echo "   └─ $message" >&2
}

# print progress message (overwrites current line)
# usage: print_progress "fetch documents" "3/20"
print_progress() {
  local action="$1"
  local status="${2:-}"
  if [[ -n "$status" ]]; then
    printf "\r   %s... %s    " "$action" "$status"
  else
    printf "\r   %s...    " "$action"
  fi
}

# clear progress line
# usage: print_progress_done
print_progress_done() {
  printf "\r\033[K"
}
