#!/usr/bin/env bash
######################################################################
# .what = check every path a role's boot.yml names against disk
#
# .why  = a boot.yml entry is a POINTER, and the boot does not refuse
#         when its target is absent. so a brief that was renamed, moved,
#         or deleted by an edit that never opened the manifest IS NO
#         LONGER LOADED — and the only visible change is a count that
#         drops by one, in a hook nobody reads a diff of.
#
#         that is a SILENT loss of context, which is the direction that
#         costs a defect. #40 already fixed two such manifests by hand;
#         this makes the check repeatable.
#
# usage:
#   audit.boot.manifests.sh
#   audit.boot.manifests.sh --in src/domain.roles
#   audit.boot.manifests.sh --help
#
# options:
#   --in DIR   root to walk (default src/domain.roles)
#   --help     show usage and exit
#
# guarantee:
#   - EVERY `- value` list item that looks like a relative path is checked,
#     whatever key it sits under. the section label is carried for the
#     REPORT only, so an unforeseen key cannot mute a row
#   - a role with no boot.yml is NAMED, not skipped in silence. a role
#     that lost its manifest looks identical to a role that never had one,
#     and only the first is a defect
#   - there is NO CAP on the rows, so no dead entry can be hidden
#   - exit 0 swept, exit 1 malfunction, exit 2 constraint
#
# ⚠️ a dead row is a CANDIDATE, never a verdict. a path may be produced
#    at build time, or read by the role loader from a second root.
#    read the site.
#
# ⛔ WHAT THIS DOES NOT CHECK — the inverse.
#    a brief on disk that NO manifest names is not a defect: the Role
#    globs its whole briefs dir, so an unlisted brief is still available
#    as a `ref`. only the dead POINTER has a cost.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="audit.boot.manifests"
source "$SKILL_DIR/output.sh"

ROOT="src/domain.roles"
BODY=""

# render the header block above as help.
# bounded by its OWN fences, not a hardcoded line count, so the help
# cannot drift out of sync when the header grows.
# note: `/^#####/` not `/^#{5,}/` — mawk (the default awk on debian and
# ubuntu) does not support interval expressions. the pattern would not
# error; it would silently match no line and dump the whole executable.
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        show_help
        exit 0
        ;;
      --in)
        ROOT="$2"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these, ignore
        shift 2
        ;;
      -*)
        print_blocked "unknown option: $1"
        exit 2
        ;;
      *)
        print_blocked "unexpected argument: $1"
        exit 2
        ;;
    esac
  done
}

check_tools() {
  if ! command -v node &>/dev/null; then
    print_blocked "node not found: this sweep needs node on PATH"
    exit 2
  fi
}

validate_input() {
  if [[ -z "$ROOT" ]]; then
    print_blocked "--in needs a directory"
    exit 2
  fi
  if [[ ! -d "$ROOT" ]]; then
    print_blocked "root directory not found: $ROOT"
    exit 2
  fi
}

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one, `set -e` aborts on the assignment line itself when
#    node exits non-zero, so the refusal below never prints and the
#    caller gets a bare exit code with no reason attached to it.
#    `|| out=""` is what makes the failure survivable.
sweep() {
  local out
  out="$(node "$SKILL_DIR/sweep.js" "$ROOT" 2>&1)" || {
    print_blocked "sweep failed: $out"
    exit 1
  }
  BODY="$out"
}

main() {
  parse_args "$@"
  check_tools
  validate_input
  sweep

  print_eagle_header "read every manifest,"
  print_tree_start "$SKILL_NAME"
  printf '%s\n' "$BODY"
}

main "$@"
