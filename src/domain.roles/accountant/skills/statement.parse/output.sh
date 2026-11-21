#!/usr/bin/env bash
######################################################################
# .what = shared output functions for statement.parse skill
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

# print eagle header with message
# usage: print_eagle_header "counted it,"
print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

# print tree root
print_tree_start() {
  local name="$1"
  echo "🧮 $name"
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
print_blocked() {
  local reason="$1"
  print_eagle_header "that wont work..."
  print_tree_start "statement.parse"
  print_tree_leaf "blocked" "$reason"
}
