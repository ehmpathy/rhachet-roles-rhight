#!/usr/bin/env bash
######################################################################
# .what = shared output functions for the notary.find skill
# .why  = consistent treestruct output with the rhight eagle mascot
######################################################################

# print eagle header with a phrase
# usage: print_eagle_header "found your officer,"
print_eagle_header() {
  echo ""
  echo "🦅 $1"
  echo ""
}

# print the artifact header line
# usage: print_artifact_header "notary.find --state florida"
print_artifact_header() {
  echo "🖋️ $1"
}

# print a branch line
# usage: print_branch "state: florida"
print_branch() {
  echo "   ├─ $1"
}

# print the final branch line
# usage: print_leaf "verify at: <url>"
print_leaf() {
  echo "   └─ $1"
}

# print a nested line under the current branch
print_sub() {
  echo "   │  $1"
}

# print a nested line under the FINAL branch
print_sub_last() {
  echo "      $1"
}
