#!/usr/bin/env bash
######################################################################
# .what = shared output functions for transcriber skills
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

# print eagle header with message
# usage: print_eagle_header "let me see..."
print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

# print tree root
# usage: print_tree_start "transcribe.pdf"
print_tree_start() {
  local name="$1"
  echo "🔎 $name"
}

# print tree branch (not last)
# usage: print_tree_branch "key" "value"
print_tree_branch() {
  local key="$1"
  local value="$2"
  echo "   ├─ $key: $value"
}

# print tree leaf (last item)
# usage: print_tree_leaf "key" "value"
print_tree_leaf() {
  local key="$1"
  local value="$2"
  echo "   └─ $key: $value"
}

# print blocked message
# usage: print_blocked "reason"
print_blocked() {
  local reason="$1"
  print_eagle_header "that wont work..."
  print_tree_start "transcribe.pdf"
  print_tree_leaf "blocked" "$reason"
}
