#!/usr/bin/env bash
######################################################################
# .what = check every path a role's Role.build declaration names
#
# .why  = a `uri: ${__dirname}/x` is a POINTER, and Role.build does not
#         refuse when its target is absent. so a role whose readme, boot,
#         keyrack, briefs dir, skills dir, or inits dir was never created
#         — or was renamed by an edit that never opened the declaration —
#         LOADS CLEANLY and silently carries less than it says it does.
#
#         measured 2026-09-08 on src/domain.roles: all 3 declared `inits`
#         dirs are dead — 2 ABSENT, 1 EMPTY — on roles that route fine today.
#
# ⛔ AN EMPTY DIRECTORY IS A DEAD POINTER, and that result is what justifies
#    the sweep. git cannot track an empty directory, so a dir that exists
#    here and holds no entry WILL NOT EXIST after a clone. `fs.existsSync`
#    reports it covered — a false COVERED, which is the silent direction.
#    the first version of this sweep passed it, and reported `dead: 2`
#    against a hand measurement that said 3.
#
# usage:
#   audit.role.declarations.sh
#   audit.role.declarations.sh --in src/domain.roles
#   audit.role.declarations.sh --help
#
# options:
#   --in DIR   root to walk (default src/domain.roles)
#   --help     show usage and exit
#
# guarantee:
#   - EVERY `${__dirname}/...` pointer is checked, whatever key it sits
#     under. the section label is carried for the REPORT only, so an
#     unforeseen key cannot mute a row
#   - a declared DIRECTORY that is EMPTY is graded dead, not covered.
#     the two verdicts are counted separately, since an `absent` pointer
#     is absent everywhere and an `empty` one is present here and absent
#     after a clone — a different defect with a different cure
#   - a role with no get*Role.ts is NAMED, not skipped in silence
#   - there is NO CAP on the rows, so no dead pointer can be hidden
#   - exit 0 swept, exit 1 malfunction, exit 2 constraint
#
# ⚠️ a dead row is a CANDIDATE, never a verdict. a path may be produced at
#    build time, or the block that names it may be inert template residue
#    whose cure is DELETION rather than creation. read the site.
#
# ⛔ WHAT THIS DOES NOT CHECK — the boot.yml entries.
#    `audit.boot.manifests` reads boot.yml and cannot see a declaration;
#    this reads the declaration and cannot see a boot.yml entry. the two
#    are siblings over one class in two files, and you owe both.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="audit.role.declarations"
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

  print_eagle_header "read every declaration,"
  print_tree_start "$SKILL_NAME"
  printf '%s\n' "$BODY"
}

main "$@"
