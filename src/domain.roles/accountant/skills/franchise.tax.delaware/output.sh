#!/usr/bin/env bash
######################################################################
# .what = shared output functions for franchise.tax.delaware skill
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

# print eagle header with message
# usage: print_eagle_header "reckoned it,"
print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

# print tree root
print_tree_start() {
  local name="$1"
  echo "🏛️ $name"
}

# print tree branch (not last)
print_tree_branch() {
  local key="$1"
  local value="$2"
  echo "   ├─ $key: $value"
}

# print tree leaf (last item)
print_tree_leaf() {
  local key="$1"
  local value="$2"
  echo "   └─ $key: $value"
}

# print blocked message
#
# ⚠️ the tree root names the skill that ACTUALLY refused, derived from the
#    caller. this file is sourced by two skills whose names are in a PREFIX
#    relationship — `franchise.tax.delaware` and `franchise.tax.delaware.accrue`
#    — so a hardcoded root brands one skill's refusals with the other's name,
#    and a `toContain` on the shorter name cannot tell the two apart.
print_blocked() {
  local reason="$1"
  local skill="${SKILL_NAME:-$(basename "${0%.sh}")}"
  print_eagle_header "that wont work..."
  print_tree_start "$skill"
  print_tree_leaf "blocked" "$reason"
}
