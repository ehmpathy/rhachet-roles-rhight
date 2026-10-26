#!/usr/bin/env bash
######################################################################
# .what = census the memory directory, and archive a memory on request
#
# .why  = MEMORY.md is loaded into EVERY session and truncated after a fixed
#         line count. an entry past that cap is a memory that exists, is
#         indexed, and is never read.
#
#         that failure is invisible from both ends: the file is on disk, the
#         index names it, and no check on either alone can see it. it reads
#         as coverage. this sweeps for it, plus the three cheaper structural
#         defects an index accrues.
#
# usage:
#   memory.prune.sh
#   memory.prune.sh --at ~/.claude/projects/<slug>/memory
#   memory.prune.sh --cap 200
#   memory.prune.sh --archive feedback_old-lesson.md
#   memory.prune.sh --help
#
# options:
#   --at DIR      the memory directory. when omitted, ONE directory matched
#                 by `$HOME/.claude/projects/*/memory` is used; zero or many
#                 is a REFUSAL, never a pick
#   --cap N       the index line budget (default 200)
#   --archive F   move ONE file into `.archive/`. refuses if the index still
#                 names it — see below
#   --help        show usage and exit
#
# guarantee:
#   - ⛔ NO FILE IS EVER DELETED. `--archive` MOVES into `.archive/`, so every
#     prune is reversible with a `mv` back. the memory directory sits outside
#     git, so a delete here has no undo at all and is not on offer
#   - ⛔ --archive REFUSES a file the index still names. to archive an indexed
#     memory converts a clean directory into one with a DEAD POINTER, which is
#     a strictly worse defect than the orphan it cured. drop the index line
#     first, then archive
#   - one file per --archive call. no batch, no glob, no `--all`. a prune is a
#     decision per memory, and a batch hides the one you did not mean
#   - ⛔ CONTENT STALENESS IS NEVER JUDGED. this cannot tell a live lesson from
#     a dead one and does not guess. it reports structure; a human prunes
#   - the census is READ-ONLY. it opens no file for write under any flag
#   - exit 0 clean, exit 1 malfunction, exit 2 constraint or defects found
#
# the four structural defects, sharpest first:
#   past-cap   an index entry on a line at or beyond the cap. it is indexed
#              and NOT LOADED, so it reads as covered from the index and as
#              reachable from the file. ⛔ the only one whose failure is
#              wholly SILENT — every other check on this page can be
#              satisfied while this one bites
#   dead       the index names a file that is absent. a row that sends its
#              reader to a dead end, and it inherits the authority of the
#              index it sits in
#   orphan     a file no index entry names. never fetched, so written for
#              nobody. ⚠️ ADVISORY — the cure is usually to INDEX it, not to
#              archive it. a memory you wrote and forgot to index looks
#              identical to one you meant to retire
#   duplicate  two entries, one target. the index claims two memories and
#              holds one
#
# ⚠️ a fat index line (>~150 chars) is reported and is NOT a defect. it is
#    content that would serve better inside the file it points at — but the
#    line budget is counted in LINES, so a fat line costs no more of the cap
#    than a thin one. it costs tokens, which is a different bill.
#
# ⛔ the count is a CANDIDATE, never a verdict. read the sites.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="memory.prune"
source "$SKILL_DIR/output.sh"

AT=""
CAP="200"
ARCHIVE=""
BODY=""

# render the header block above as help.
# bounded by its OWN fences, not a hardcoded line count, so the help cannot
# drift out of sync when the header grows.
# note: `/^#####/` not `/^#{5,}/` — mawk (the default awk on debian and
# ubuntu) does not support interval expressions. the pattern would not error;
# it would silently match no line and dump the whole executable.
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
      --at)
        AT="$2"
        shift 2
        ;;
      --cap)
        CAP="$2"
        shift 2
        ;;
      --archive)
        ARCHIVE="$2"
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
    print_blocked "node not found: this census needs node on PATH"
    exit 2
  fi
}

# ⛔ ZERO OR MANY IS A REFUSAL, NEVER A PICK.
#
#    a default that guesses between two memory directories writes a census
#    about one project under the name of another, and the output looks
#    correct either way. the refusal names what was found so the caller can
#    pass --at without a hunt.
resolve_at() {
  if [[ -n "$AT" ]]; then return; fi

  local found=()
  local d
  for d in "$HOME"/.claude/projects/*/memory; do
    [[ -d "$d" ]] && found+=("$d")
  done

  if [[ ${#found[@]} -eq 0 ]]; then
    print_blocked "no memory dir found under $HOME/.claude/projects/*/memory — pass --at DIR"
    exit 2
  fi
  if [[ ${#found[@]} -gt 1 ]]; then
    print_blocked "found ${#found[@]} memory dirs, so --at is required. candidates: ${found[*]}"
    exit 2
  fi
  AT="${found[0]}"
}

validate_input() {
  if [[ ! -d "$AT" ]]; then
    print_blocked "memory dir not found: $AT"
    exit 2
  fi
  if [[ ! -f "$AT/MEMORY.md" ]]; then
    print_blocked "no MEMORY.md in: $AT"
    exit 2
  fi
  if ! [[ "$CAP" =~ ^[0-9]+$ ]]; then
    print_blocked "--cap needs a whole number, got: $CAP"
    exit 2
  fi
}

# ⛔ the one mutation this skill offers, and every guard on it.
#
#    the order matters: the INDEX check comes before the move, because to
#    move an indexed file manufactures a dead pointer — a worse defect than
#    the orphan it was meant to cure.
do_archive() {
  local at="$AT/$ARCHIVE"

  if [[ "$ARCHIVE" == */* ]]; then
    print_blocked "--archive takes a bare filename inside the memory dir, got a path: $ARCHIVE"
    exit 2
  fi
  if [[ "$ARCHIVE" == "MEMORY.md" ]]; then
    print_blocked "MEMORY.md is the index itself and is never archived"
    exit 2
  fi
  if [[ ! -f "$at" ]]; then
    print_blocked "no such memory: $at"
    exit 2
  fi

  # ⛔ THE GUARD THAT MATTERS. an indexed file, once moved, leaves the index
  #    pointed at a path that is gone.
  if grep -qF "($ARCHIVE)" "$AT/MEMORY.md"; then
    print_blocked "the index still names $ARCHIVE — drop its MEMORY.md line first, else this move creates a dead pointer"
    exit 2
  fi

  mkdir -p "$AT/.archive"
  if [[ -e "$AT/.archive/$ARCHIVE" ]]; then
    print_blocked "already in .archive, so this move would overwrite it: $ARCHIVE"
    exit 2
  fi
  mv "$at" "$AT/.archive/$ARCHIVE"

  print_owl_header "set aside, not forgotten"
  print_tree_start "$SKILL_NAME"
  print_tree_branch "moved" "$ARCHIVE"
  print_tree_branch "into" "$AT/.archive/"
  print_tree_leaf "undo" "mv '$AT/.archive/$ARCHIVE' '$at'"
  exit 0
}

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one, `set -e` aborts on the assignment line itself when node
#    exits non-zero, so the refusal below never prints and the caller gets a
#    bare exit code with no reason attached to it.
#
# ⛔ exit 2 from the census is a RESULT (defects found), not a malfunction, so
#    it is carried through rather than converted into a crash.
sweep() {
  local out
  local code
  set +e
  out="$(node "$SKILL_DIR/sweep.js" "$AT" "$CAP" 2>&1)"
  code=$?
  set -e
  if [[ $code -eq 1 ]]; then
    print_blocked "census failed: $out"
    exit 1
  fi
  BODY="$out"
  return "$code"
}

main() {
  parse_args "$@"
  check_tools
  resolve_at
  validate_input

  if [[ -n "$ARCHIVE" ]]; then
    do_archive
  fi

  local code=0
  sweep || code=$?

  if [[ $code -eq 0 ]]; then
    print_owl_header "know thyself"
  else
    print_owl_header "a memory is indexed and unread..."
  fi
  print_tree_start "$SKILL_NAME"
  printf '%s\n' "$BODY"
  exit "$code"
}

main "$@"
