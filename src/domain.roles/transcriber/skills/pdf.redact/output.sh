#!/usr/bin/env bash
######################################################################
# .what = shared output functions for pdf.redact skill
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

print_tree_start() {
  local name="$1"
  echo "🔎 $name"
}

print_tree_branch() {
  local key="$1"
  local value="$2"
  echo "   ├─ $key: $value"
}

print_tree_leaf() {
  local key="$1"
  local value="$2"
  echo "   └─ $key: $value"
}

print_blocked() {
  local reason="$1"
  print_eagle_header "that wont work..."
  print_tree_start "pdf.redact"
  print_tree_leaf "blocked" "$reason"
}
