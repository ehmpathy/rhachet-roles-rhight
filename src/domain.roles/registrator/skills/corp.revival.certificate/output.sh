#!/usr/bin/env bash
######################################################################
# .what = shared output functions for corp.revival.certificate
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

print_tree_start() {
  echo "⚖️ $1"
}

print_tree_branch() {
  echo "   ├─ $1: $2"
}

print_tree_leaf() {
  echo "   └─ $1: $2"
}

print_tree_sub() {
  echo "      ├─ $1"
}

print_tree_sub_last() {
  echo "      └─ $1"
}

print_tree_note() {
  echo "      $1"
}

# .note = goes to stderr, per rule.forbid.stdout-on-errors
print_blocked() {
  local reason="$1"
  {
    print_eagle_header "that wont fly..."
    print_tree_start "corp.revival.certificate"
    print_tree_leaf "blocked" "$reason"
    echo ""
  } >&2
}
