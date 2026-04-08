#!/usr/bin/env bash
######################################################################
# .what = instantiate a patent proposal route
#
# .why  = creates structured workspace for patent analysis:
#         - copies template stones for each phase
#         - binds route to current branch
#         - optionally opens editor on 0.idea.md
#
# usage:
#   patent.propose.sh                    # create route
#   patent.propose.sh --open nvim        # create and open in nvim
#   patent.propose.sh --open code        # create and open in vscode
#
# guarantee:
#   - creates all 9 template files atomically
#   - binds branch to route via symlink
#   - treestruct output with eagle mascot
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIORS_DIR="$(dirname "$SCRIPT_DIR")/patent.priors"
source "$PRIORS_DIR/output.sh"

######################################################################
# parse_args
######################################################################
parse_args() {
  OPEN_EDITOR=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --open)
        OPEN_EDITOR="$2"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these - ignore them
        shift 2
        ;;
      --help|-h)
        echo "usage: patent.propose.sh [--open EDITOR]"
        echo ""
        echo "options:"
        echo "  --open   editor to open 0.idea.md (e.g., nvim, code)"
        exit 0
        ;;
      *)
        echo "unknown argument: $1" >&2
        exit 2
        ;;
    esac
  done
}

######################################################################
# check_git_repo - ensure we're in a git repository
######################################################################
check_git_repo() {
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    print_blocked "must run from git repository"
    exit 2
  fi

  GIT_ROOT=$(git rev-parse --show-toplevel)
  BRANCH=$(git branch --show-current)

  if [[ -z "$BRANCH" ]]; then
    print_blocked "not on a branch (detached HEAD)"
    exit 2
  fi
}

######################################################################
# check_route_extant - ensure route doesn't already exist
######################################################################
check_route_extant() {
  local found
  found=$(ls -d "$GIT_ROOT"/.route/v*.patent.propose 2>/dev/null | head -1 || true)

  if [[ -n "$found" ]]; then
    print_blocked "patent route already exists"
    echo ""
    echo "found: $found"
    echo ""
    echo "use the route or delete it first"
    exit 2
  fi
}

######################################################################
# create_route_dir - create route directory
######################################################################
create_route_dir() {
  DATE=$(date +%Y_%m_%d)
  ROUTE_PATH="$GIT_ROOT/.route/v${DATE}.patent.propose"

  mkdir -p "$ROUTE_PATH"
}

######################################################################
# copy_templates - copy all template stones
######################################################################
copy_templates() {
  local template_dir="$SCRIPT_DIR/templates"

  if [[ ! -d "$template_dir" ]]; then
    print_blocked "templates not found"
    echo ""
    echo "expected: $template_dir"
    exit 1
  fi

  # copy all template files
  for file in "$template_dir"/*; do
    if [[ -f "$file" ]]; then
      cp "$file" "$ROUTE_PATH/"
    fi
  done
}

######################################################################
# bind_branch - bind route to current branch via symlink
######################################################################
bind_branch() {
  # create bind directory
  local bind_dir="$GIT_ROOT/.branch/.bind"
  mkdir -p "$bind_dir"

  # create symlink from branch name to route path
  # handle branch names with slashes by use of underscores for symlink name
  local safe_branch="${BRANCH//\//_}"
  local bind_path="$bind_dir/$safe_branch"

  # remove extant symlink if any
  if [[ -L "$bind_path" ]]; then
    rm "$bind_path"
  fi

  # create relative symlink
  local route_rel
  route_rel=$(realpath --relative-to="$bind_dir" "$ROUTE_PATH")
  ln -s "$route_rel" "$bind_path"
}

######################################################################
# emit_success - treestruct output
######################################################################
emit_success() {
  # build resolved args string
  local resolved_args=""
  if [[ -n "$OPEN_EDITOR" ]]; then
    resolved_args="--open $OPEN_EDITOR"
  fi

  print_eagle_header "take to the sky,"
  if [[ -n "$resolved_args" ]]; then
    print_tree_start "patent.propose $resolved_args"
  else
    print_tree_start "patent.propose"
  fi
  print_tree_branch "route" ".route/v${DATE}.patent.propose/"
  print_tree_branch "branch" "$BRANCH"
  echo "   └─ stones"

  # list all created files
  local files
  files=$(ls "$ROUTE_PATH" | sort)
  local count
  count=$(echo "$files" | wc -l)
  local i=0

  echo "$files" | while read -r file; do
    i=$((i + 1))
    if [[ $i -eq $count ]]; then
      echo "      └─ ✓ $file"
    else
      echo "      ├─ ✓ $file"
    fi
  done

  print_section_header "what peaks can we claim?"
  echo "   ├─ $ROUTE_PATH/0.idea.md"
  if [[ -n "$OPEN_EDITOR" ]]; then
    echo "   └─ opened in $OPEN_EDITOR"
  else
    echo "   └─ ready for you to fill out"
  fi

  print_route_info "we'll track it down,"
  echo "   ├─ branch $BRANCH <-> route v${DATE}.patent.propose"
  echo "   └─ branch bound to route, to drive via hooks"
}

######################################################################
# validate_editor - check editor exists before route creation
######################################################################
validate_editor() {
  if [[ -z "$OPEN_EDITOR" ]]; then
    return 0
  fi

  if ! command -v "$OPEN_EDITOR" >/dev/null 2>&1; then
    print_blocked "editor not found: $OPEN_EDITOR"
    exit 2
  fi
}

######################################################################
# open_editor - open editor if requested (validation already done)
######################################################################
open_editor() {
  if [[ -z "$OPEN_EDITOR" ]]; then
    return 0
  fi

  "$OPEN_EDITOR" "$ROUTE_PATH/0.idea.md"
}

######################################################################
# main
######################################################################
main() {
  parse_args "$@"
  check_git_repo
  check_route_extant
  validate_editor
  create_route_dir
  copy_templates
  bind_branch
  emit_success
  open_editor
}

main "$@"
