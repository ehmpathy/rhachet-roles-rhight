#!/usr/bin/env bash
######################################################################
# .what = shared output functions for audit.role.declarations
# .why  = consistent treestruct output with the eagle mascot
######################################################################

# print eagle header with message
# usage: print_eagle_header "read every declaration,"
print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

# print tree root
print_tree_start() {
  local name="$1"
  echo "🧪 $name"
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
#    caller, so a refusal is never branded with a neighbor's name.
print_blocked() {
  local reason="$1"
  local skill="${SKILL_NAME:-$(basename "${0%.sh}")}"
  print_eagle_header "that wont work..."
  print_tree_start "$skill"
  print_tree_leaf "blocked" "$reason"
}
