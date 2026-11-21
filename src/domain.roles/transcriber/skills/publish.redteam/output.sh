#!/usr/bin/env bash
######################################################################
# .what = shared output functions for the publish.redteam skill
# .why  = consistent treestruct output with the eagle mascot (rhight
#         repo), in the same shape pii.scan prints
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

# a branch one level down, under an open `├─` layer
print_sub_branch() {
  local key="$1"
  local value="$2"
  echo "   │  ├─ $key: $value"
}

print_sub_leaf() {
  local key="$1"
  local value="$2"
  echo "   │  └─ $key: $value"
}

# a detail row two levels down (a masked sample under a check)
print_sub_row() {
  local text="$1"
  echo "   │  │  · $text"
}

print_blocked() {
  local reason="$1"
  print_eagle_header "that wont work..."
  print_tree_start "publish.redteam"
  print_tree_leaf "blocked" "$reason"
}
