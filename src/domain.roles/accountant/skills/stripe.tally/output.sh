#!/usr/bin/env bash
######################################################################
# .what = shared output functions for stripe.tally skill
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

# print eagle header with message
# usage: print_eagle_header "tallied it,"
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

# print a section opener under the tree
print_tree_section() {
  local name="$1"
  echo "   └─ $name"
}

# print blocked message
print_blocked() {
  local reason="$1"
  print_eagle_header "that wont work..."
  print_tree_start "stripe.tally"
  print_tree_leaf "blocked" "$reason"
}
