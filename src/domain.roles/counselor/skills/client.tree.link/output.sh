#!/usr/bin/env bash
######################################################################
# .what = shared output functions for client.tree.link
# .why  = consistent treestruct output, one mascot per skill
######################################################################

print_turtle_header() {
  echo "🐢 $1"
  echo ""
}

print_tree_start() {
  echo "🔗 $1"
}

print_tree_branch() {
  echo "   ├─ $1: $2"
}

print_tree_leaf() {
  echo "   └─ $1: $2"
}

# a constraint the caller must fix: header, what, and the fix. exit is the caller's
print_constraint() {
  local what="$1"
  shift
  echo "🐢 bummer dude..." >&2
  echo "" >&2
  echo "✋ ConstraintError: $what" >&2
  local line
  for line in "$@"; do
    echo "   $line" >&2
  done
}

# a fault outside the caller's reach
print_malfunction() {
  echo "🐢 bummer dude..." >&2
  echo "" >&2
  echo "💥 MalfunctionError: $1" >&2
  [[ -n "${2:-}" ]] && echo "   └─ $2" >&2
  return 0
}
