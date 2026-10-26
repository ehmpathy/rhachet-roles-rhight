#!/usr/bin/env bash
######################################################################
# .what = shared output functions for doc.sign skill
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

# print eagle header with message
print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

# print tree root
print_tree_start() {
  local name="$1"
  echo "⚖️ $name"
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

# print a sub item under a branch
print_tree_sub() {
  local text="$1"
  echo "   │  ├─ $text"
}

# print the last sub item under a branch
print_tree_sub_last() {
  local text="$1"
  echo "   │  └─ $text"
}

# print blocked message
print_blocked() {
  local reason="$1"
  print_eagle_header "that wont work..."
  print_tree_start "doc.sign"
  print_tree_leaf "blocked" "$reason"
}
