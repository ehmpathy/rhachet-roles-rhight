#!/usr/bin/env bash
######################################################################
# .what = shared output functions for the pdf.transcribe skill family
# .why  = consistent treestruct output with eagle mascot (rhight repo)
#
# .note = three executables source this file — the dispatcher and its
#         two via.* leaves. each sets SKILL_NAME before it sources, so
#         a blocked message names the one that actually blocked rather
#         than the family. without that, a failure inside via.optical
#         would report itself as "pdf.transcribe" and send the reader
#         to the wrong file.
######################################################################

: "${SKILL_NAME:=pdf.transcribe}"

# print eagle header with message
# usage: print_eagle_header "let me read that..."
print_eagle_header() {
  local message="$1"
  echo ""
  echo "🦅 $message"
  echo ""
}

# print tree root
print_tree_start() {
  local name="$1"
  echo "🔎 $name"
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
  print_tree_start "$SKILL_NAME"
  print_tree_leaf "blocked" "$reason"
}
