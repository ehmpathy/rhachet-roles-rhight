#!/usr/bin/env bash
######################################################################
# .what = link a client's private worktree into this repo's route dir
#
# .why  = this repo is public. client facts live in the client's PRIVATE
#         repo, in a tree the director made, reached from here through a
#         gitignored link: $route/.client/$org → that tree.
#         see rule.require.client-facts-in-a-private-tree
#
# usage:
#   client.tree.link.sh --org acme --tree ~/git/acme/_worktrees/briefs.x       # plan
#   client.tree.link.sh --org acme --tree ~/git/acme/_worktrees/briefs.x --mode apply
#   client.tree.link.sh --org acme                                             # no tree: the director ask
#
# options:
#   --org ORG       the client org; names the link. [a-z0-9-] only
#   --tree PATH     the worktree the director made for this work
#   --route PATH    the route dir that holds the link (default: the bound route)
#   --repo PATH     the client's private repo, for the director ask
#                   (default: ~/git/$org/rhachet-briefs-$org)
#   --mode          plan | apply (default plan)
#   --help, -h      show this help
#
# guarantee:
#   - ⛔ never creates a tree. with no --tree it prints the ask for the
#     director and exits 2. which trees exist is the director's call
#   - ⛔ refuses a tree whose origin is not PRIVATE (exit 2), and a link
#     path this repo does not gitignore (exit 2)
#   - findsert: the same link again is a no-op; a link to elsewhere, or a
#     non-link at the path, is refused (exit 2), never overwritten
#   - the link is relative, so it survives a move of the parent dirs
#   - plan by default; apply reads the link back
#   - exit 0 linked or planned, 1 malfunction, 2 constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

ORG=""
TREE=""
ROUTE=""
REPO=""
MODE="plan"

print_usage() {
  cat <<'USAGE'
🔗 client.tree.link — link a client's private worktree into the route dir

usage:
  client.tree.link.sh --org acme --tree <worktree>                 plan
  client.tree.link.sh --org acme --tree <worktree> --mode apply    link
  client.tree.link.sh --org acme                                   the ask for the director

options:
  --org ORG       the client org; names the link ($route/.client/$org)
  --tree PATH     the worktree the director made for this work
  --route PATH    the route dir (default: the bound route)
  --repo PATH     the client's private repo (default: ~/git/$org/rhachet-briefs-$org)
  --mode          plan | apply (default plan)
  --help, -h      show this help

it never creates a tree, and it refuses a tree that is not PRIVATE.
see rule.require.client-facts-in-a-private-tree
USAGE
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --org) ORG="${2:-}"; shift 2 ;;
      --tree) TREE="${2:-}"; shift 2 ;;
      --route) ROUTE="${2:-}"; shift 2 ;;
      --repo) REPO="${2:-}"; shift 2 ;;
      --mode) MODE="${2:-}"; shift 2 ;;
      --help|-h) print_usage; exit 0 ;;
      --skill|--repo-name|--role) shift 2 ;; # rhachet passes these
      *)
        print_constraint "unknown option: $1" "└─ fix: see --help"
        exit 2
        ;;
    esac
  done
}

validate() {
  # the org names a path segment, so it must be one
  if [[ ! "$ORG" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
    print_constraint "--org must be lowercase letters, digits, and dashes" \
      "├─ got: '${ORG}'" \
      "└─ fix: --org acme"
    exit 2
  fi

  if [[ "$MODE" != "plan" && "$MODE" != "apply" ]]; then
    print_constraint "--mode must be plan or apply" "└─ got: '$MODE'"
    exit 2
  fi

  # no route given: the bound route is the common case
  if [[ -z "$ROUTE" ]]; then
    ROUTE="$(rhx route.bind.get 2>/dev/null | sed -n 's/^bound to: //p' | head -1 || true)"
  fi
  if [[ -z "$ROUTE" || ! -d "$ROUTE" ]]; then
    print_constraint "no route dir to hold the link" \
      "├─ got: '${ROUTE}'" \
      "└─ fix: pass --route <dir>, or bind one: rhx route.bind.set --route <dir>"
    exit 2
  fi

  [[ -z "$REPO" ]] && REPO="$HOME/git/$ORG/rhachet-briefs-$ORG"
  return 0
}

# .what = the director ask, printed when no tree was given
ask_director() {
  local repoState="absent — ask the human where $ORG's private repo lives"
  [[ -d "$REPO/.git" || -f "$REPO/.git" ]] && repoState="found"
  print_constraint "no client tree given, and this skill never creates one" \
    "├─ org: $ORG" \
    "├─ repo: $REPO ($repoState)" \
    "├─ ask the director for a dedicated tree, e.g." \
    "│  └─ git -C $REPO worktree add ../_worktrees/rhachet-briefs-$ORG.<who>.<slug> -b <who>/<slug>" \
    "└─ then: rhx client.tree.link --org $ORG --tree <that tree> --mode apply"
  exit 2
}

# .what = owner/name of a tree's origin, from its remote url
asRepoSlug() {
  sed -E 's#^(git@[^:]+:|https?://[^/]+/|ssh://[^/]+/)##; s#\.git$##' <<< "$1"
}

check_tree() {
  if [[ ! -d "$TREE" ]] || ! git -C "$TREE" rev-parse --show-toplevel >/dev/null 2>&1; then
    print_constraint "--tree is not a git work tree" \
      "├─ got: $TREE" \
      "└─ fix: pass the worktree the director made"
    exit 2
  fi
  TREE="$(cd "$TREE" && pwd -P)"

  local url
  url="$(git -C "$TREE" remote get-url origin 2>/dev/null || true)"
  if [[ -z "$url" ]]; then
    print_constraint "the tree has no origin remote, so its privacy cannot be checked" \
      "├─ tree: $TREE" \
      "└─ fix: use a worktree of the client's private github repo"
    exit 2
  fi
  SLUG="$(asRepoSlug "$url")"

  local visibility
  if ! visibility="$(gh repo view "$SLUG" --json visibility -q .visibility 2>&1)"; then
    print_malfunction "could not read the visibility of $SLUG" "$visibility"
    exit 1
  fi
  if [[ "$visibility" != "PRIVATE" ]]; then
    print_constraint "the tree's repo is not PRIVATE, so it is no home for client facts" \
      "├─ repo: $SLUG" \
      "├─ visibility: $visibility" \
      "└─ fix: ask the human for the client's private repo"
    exit 2
  fi
}

main() {
  parse_args "$@"
  validate
  [[ -z "$TREE" ]] && ask_director

  check_tree

  local linkDir linkAt target
  linkDir="$ROUTE/.client"
  linkAt="$linkDir/$ORG"

  # the link must never be tracked: refuse a path this repo does not ignore
  if ! git check-ignore -q "$linkAt" 2>/dev/null; then
    print_constraint "this repo does not gitignore $linkAt" \
      "└─ fix: add '.client' to .gitignore, so the link never ships"
    exit 2
  fi

  # relative, so the link survives a move of the parent dirs
  target="$(realpath -m --relative-to="$(realpath -m "$linkDir")" "$TREE")"

  # findsert: same link → no-op; aught else at the path → refuse
  if [[ -L "$linkAt" ]]; then
    local current
    current="$(readlink "$linkAt")"
    if [[ "$(realpath -m "$linkDir/$current")" == "$TREE" ]]; then
      print_turtle_header "already linked, shell yeah"
      print_tree_start "client.tree.link --org $ORG"
      print_tree_branch "repo" "$SLUG (PRIVATE)"
      print_tree_branch "link" "$linkAt"
      print_tree_leaf "target" "$current (unchanged)"
      exit 0
    fi
    print_constraint "$linkAt already links elsewhere" \
      "├─ current: $current" \
      "├─ wanted: $target" \
      "└─ fix: remove the old link by hand, if the director agrees"
    exit 2
  fi
  if [[ -e "$linkAt" ]]; then
    print_constraint "$linkAt exists and is not a link" \
      "└─ fix: move it into the client tree, then rerun"
    exit 2
  fi

  if [[ "$MODE" == "plan" ]]; then
    print_turtle_header "heres the wave..."
    print_tree_start "client.tree.link --org $ORG --mode plan"
    print_tree_branch "repo" "$SLUG (PRIVATE)"
    print_tree_branch "tree" "$TREE"
    print_tree_branch "link" "$linkAt"
    print_tree_branch "target" "$target"
    print_tree_leaf "mode" "plan — no link made; rerun with --mode apply"
    exit 0
  fi

  mkdir -p "$linkDir"
  ln -s "$target" "$linkAt"

  # read back: the link must land on the tree
  if [[ "$(realpath -m "$linkAt")" != "$TREE" ]]; then
    print_malfunction "the link did not resolve to the tree" "$linkAt → $(readlink "$linkAt")"
    exit 1
  fi

  print_turtle_header "cowabunga!"
  print_tree_start "client.tree.link --org $ORG --mode apply"
  print_tree_branch "repo" "$SLUG (PRIVATE)"
  print_tree_branch "tree" "$TREE"
  print_tree_branch "link" "$linkAt"
  print_tree_branch "target" "$target"
  print_tree_leaf "linked" "client facts go through this link; persist freely there"
}

main "$@"
