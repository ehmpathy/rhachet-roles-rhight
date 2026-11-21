#!/usr/bin/env bash
######################################################################
# .what = shared output functions for memory.prune
# .why  = consistent treestruct output with the owl mascot
#
# ⚠️ the owl, not the eagle. `know thyself` is the reflector's line, and a
#    memory census is a look inward rather than a sweep outward.
######################################################################

# print owl header with message
# usage: print_owl_header "know thyself"
print_owl_header() {
  local message="$1"
  echo ""
  echo "🦉 $message"
  echo ""
}

# print tree root
print_tree_start() {
  local name="$1"
  echo "🧠 $name"
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
  print_owl_header "that path is obscured..."
  print_tree_start "$skill"
  print_tree_leaf "blocked" "$reason"
}
