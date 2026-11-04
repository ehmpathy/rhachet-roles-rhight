#!/usr/bin/env bash
######################################################################
# .what = shared output functions for doc.letterhead skill
# .why  = consistent treestruct output with eagle mascot (rhight repo)
######################################################################

# print eagle header with message
# usage: print_eagle_header "on letterhead..."
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

# print a sub item under the final branch
print_tree_sub() {
  local text="$1"
  echo "      ├─ $text"
}

# print the final sub item under the final branch
print_tree_sub_last() {
  local text="$1"
  echo "      └─ $text"
}

# print an indented detail line beneath a tree leaf
print_tree_note() {
  local text="$1"
  echo "      $text"
}

# print blocked message
# .note = goes to stderr, per rule.forbid.stdout-on-errors
print_blocked() {
  local reason="$1"
  {
    print_eagle_header "that wont work..."
    print_tree_start "doc.letterhead"
    print_tree_leaf "blocked" "$reason"
  } >&2
}
