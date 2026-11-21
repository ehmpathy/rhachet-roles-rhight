#!/usr/bin/env bash
######################################################################
# .what = check every block quote in an artifact against the source it cites
#
# .why  = a fabricated quotation passes EVERY other guard. the section
#         number is right, the url is right, the gloss is right, the
#         argument is right — and the words inside the quote marks were
#         never written by the authority named beside them.
#
#         no grep finds it, because a grep proves only that RESEARCH
#         happened. only a PULL proves correctness, and only a
#         two-sided read proves the pull reached the artifact intact.
#
# ⚠️ the defect this exists for, observed: a lint hook blocked the exact
#    word a statute uses, so the word was reworded INSIDE a block quote.
#    a CORRECT document, read CORRECTLY, altered by a guard that did its
#    job — and true in substance, which is why it felt allowed.
#    a tool constraint is never a licence to alter quoted text.
#
# usage:
#   quote.verify.sh --from refs/ --in brief.md            # ⭐ the common case
#   quote.verify.sh --from refs/ --in templates/          # ⭐ the CENSUS
#   quote.verify.sh --from law.txt --in brief.md          # every quote
#   quote.verify.sh --from a.txt --from b.txt --in brief.md   # several sources
#   quote.verify.sh --from refs/ --in a.md --in b.md      # several artifacts
#   quote.verify.sh --from law.txt --in brief.md --needle 'exact phrase'
#   quote.verify.sh --from law.txt --in brief.md --min 60
#   quote.verify.sh --help
#
# options:
#   --from PATH    a source of record (the pulled bytes). REPEATABLE, and
#                  repeat it whenever the artifact cites several containers.
#                  a quote is faithful if ANY source holds it — so a single
#                  --from against a multi-source artifact reports every quote
#                  from the other sources as a fabrication
#
#                  ⭐ PATH may be a DIRECTORY, and usually should be. it
#                  expands to every `*.txt` AND `*.md` directly inside —
#                  NON-recursive, so a neighbor tree cannot slip sources in
#                  unasked. an empty directory BLOCKS rather than reports a
#                  wall of false fabrications
#
#                  ⚠️ `*.md` is in that list because a deterministic
#                  transcript is the ARTIFACT OF RECORD for a scanned
#                  document (rule.forbid.hand-transcription), and those land
#                  as `.md`. a `*.txt`-only expansion silently omits every
#                  one of them — see the SHORT-SOURCE hazard below.
#   --in PATH      the artifact whose quotes are checked. REPEATABLE.
#
#                  ⭐ PATH may be a DIRECTORY — the CENSUS. it expands to every
#                  `*.md` and `*.stone` directly inside, NON-recursive, same
#                  bound and same empty-BLOCKS guarantee as --from.
#
#                  ⚠️ the census exists because the loop it replaces is an
#                  ADHOC COMMAND, and an adhoc loop over a real route is a
#                  measurement nobody can re-run the same way twice. one
#                  artifact per invocation also hides the comparison that
#                  matters: which file in a set is the dirty one.
#   --except PATH  SUBTRACT one path from the expanded --from set. REPEATABLE.
#
#                  ⭐ this is how you check an artifact against the directory
#                  it LIVES IN. a route's own comms yields are the clerk's
#                  verbatim emails — the source of record for every quote of
#                  her — and they sit beside the page that quotes them. so the
#                  obvious call is also a REFUSED one: the expansion pulls in
#                  the artifact itself and the overlap guard fires, correctly.
#
#                    rhx quote.verify --from route/ \
#                      --except route/4.stone.md --in route/4.stone.md
#
#                  ⚠️ the workaround was one --from per yield. the failure
#                  mode when a caller does not know to write them is not an
#                  error — it is a WALL OF RED against a correct document.
#                  measured at 61:1 on one page: 62 defects reported, 61 of
#                  them the tool's own input.
#
#                  ⛔ a --except that matches no source BLOCKS, and so does one
#                  that would empty the set. a silently-ignored exclusion is
#                  the empty-expansion defect under a second name.
#   --needle TEXT  check one explicit phrase, two-sided. repeatable.
#                  when absent, EVERY block quote in the artifact is checked
#   --min N        the fragment floor, in chars (default 40). fragments
#                  under it are COUNTED and reported, never dropped silent
#   --help         show usage and exit
#
# the two-sided read, and how to act on each verdict:
#
#   src  art   verdict                what it means
#   ---  ---   -------                -------------
#    T    T    ok                     the quote is faithful
#    F    T    🚨 NOT-IN-SOURCE       fabricated, truncated, or reworded
#    T    F    ⛔ absent-from-artifact the needle never landed
#    F    F    ⚠️  needle-bug          your needle, not the artifact
#
# guarantee:
#   - an ELLIPSIS is a legitimate elision, so a quote that carries `...`
#     is split into fragments and EACH is checked. to test the whole
#     string would report every elided quote as fabricated
#   - an ATTRIBUTION line (`> — 8 Del. C. § 103`) is dropped before the
#     check. it is never in the source and is not a claim about it
#   - a quote under a RETRACTION banner (🚩 🛑 RETRACTED) is reported as
#     CITED, not live. permanent-yields demands a corrected error stay on
#     the record, so a fabrication sweep must tell a CITATION of a defect
#     apart from an INSTANCE of one
#   - a path that is BOTH a `--from` and an `--in` is REFUSED, so a corpus
#     can never be verified against itself
#   - both a POSITIVE and a NEGATIVE control run every time. a detector
#     that can only report zero cannot be told from one that found zero
#   - exit 0 clean, exit 1 malfunction, exit 2 constraint (a defect found)
#
# 🟡 THE COVERAGE CHANNEL — quoted runs OUTSIDE a block quote.
#
#    the checks above read a line that begins with `>`. so a quotation in a
#    TABLE CELL, a list item, or a sentence of prose was never checked, never
#    counted as an aside, and never reported as skipped. it was INVISIBLE, and
#    an invisible skip is the failure this whole skill exists to refuse.
#
#    measured on one route stone: 55 such runs, against a census that printed
#    `verified: 155` and said not one word about them.
#
#    so every run now reports `quoted OUTSIDE a block quote: N (X in source ·
#    Y not)`. it is ADVISORY and moves NO exit code, because a quotation mark
#    out there does THREE jobs and only one is a source claim:
#
#      · a quotation OF a source          -> checkable
#      · a SCARE quote, or a term of art  -> cites no source
#      · a quotation of THE AUTHOR        -> no source will ever hold it
#
#    ⭐ the useful number is usually X, not Y. it says how much of the page the
#    established census had never examined.
#
#    ⛔ a row that IS a source claim belongs in a block quote with an
#    attribution — MOVE IT. do not widen the detector to admit it, or the
#    author-quote class becomes a permanent false alarm.
#
# ⛔ THE SHORT-SOURCE HAZARD — a `NOT-IN-SOURCE` has TWO causes.
#
#    the quote was altered, OR the source was never handed to the tool. the
#    two are INDISTINGUISHABLE in the output, and the second one arrives as
#    a wall of red under the most serious verdict this tool has.
#
#    ⚠️ measured: one artifact reported 17 fabrications against a
#       `*.txt`-only source set. TWELVE of them were correct, faithfully
#       transcribed bylaws quotes whose source sat on disk, un-passed,
#       because the transcript is a `.md`. the union was short one file.
#
#    so the FIRST read of a live defect is *check the --from set*, never
#    *the author fabricated this*. the source manifest is printed above the
#    verdicts for exactly this reason — read it before you read them.
#
# ⛔ A SOURCE MAY NEVER ALSO BE AN ARTIFACT.
#
#    the widened `*.md` expansion opens a failure worse than any it closes:
#    point `--from` and `--in` at one directory and every quote verifies
#    against the file it was quoted in. that is a check which cannot fail —
#    green, always, on a fabricated corpus.
#
#    so an overlap is REFUSED rather than warned about. a guard that relies
#    on the caller's care is the guard this tool exists to replace.
#
# ⛔ WHAT THIS DOES NOT CHECK — the GLOSS.
#    a quote can be verbatim-perfect and the sentence beneath it can say
#    the opposite of what it means. this verifies the QUOTE. a reader
#    still owes the prose around it an independent read.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="quote.verify"
source "$SKILL_DIR/output.sh"

FROMS=()
INS=()
EXCEPTS=()
MIN=40
NEEDLES=()
BODY=""

# render the header block above as help, bounded by its OWN fences so the
# help cannot drift out of sync when the header grows.
# note: `/^#####/` not `/^#{5,}/` — mawk (debian/ubuntu default) has no
# interval expressions; the pattern would silently match no line and dump
# the whole executable.
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
      --from)
        FROMS+=("${2:-}")
        shift 2
        ;;
      --in)
        INS+=("${2:-}")
        shift 2
        ;;
      --except)
        EXCEPTS+=("${2:-}")
        shift 2
        ;;
      --min)
        MIN="${2:-}"
        shift 2
        ;;
      --needle)
        NEEDLES+=("${2:-}")
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
    print_blocked "node not found: this check needs node on PATH"
    exit 2
  fi
}

validate_input() {
  if [[ ${#FROMS[@]} -eq 0 ]]; then
    print_blocked "--from needs the source file (the pulled bytes)"
    exit 2
  fi
  if [[ ${#INS[@]} -eq 0 ]]; then
    print_blocked "--in needs the artifact to check"
    exit 2
  fi
  # ⭐ a --from may name a DIRECTORY, and that is the COMMON CASE.
  #
  #    "check this artifact against every source I hold" is the invocation
  #    this skill is reached for most often, and one --from per file made it
  #    cost 163 flags on a real route — past what a shell will take without
  #    a loop, which is itself an adhoc command. a directory expands to every
  #    `*.txt` directly inside it.
  #
  # ⛔ NON-RECURSIVE, deliberately. a recursive walk would pull in whatever a
  #    neighbor tree happens to hold, and a source set you did not choose is
  #    the one whose absence you will not notice.
  #
  # ⚠️ `*.md` is expanded alongside `*.txt` because a deterministic transcript
  #    of a scanned document is the ARTIFACT OF RECORD for it, and lands as a
  #    `.md`. a `*.txt`-only expansion omitted every such transcript SILENTLY,
  #    which surfaced as twelve correct quotes reported as fabrications. the
  #    overlap refusal below is what makes the wider glob safe.
  local f
  local g
  local expanded=()
  local hit=()
  for f in "${FROMS[@]}"; do
    if [[ -d "$f" ]]; then
      hit=()
      for g in "$f"/*.txt "$f"/*.md; do
        [[ -f "$g" ]] && hit+=("$g")
      done
      # ⛔ an EMPTY expansion must BLOCK, never pass quietly.
      #
      #    a source set of zero reports EVERY quote in the artifact as a
      #    fabrication — a wall of red whose real cause is an empty
      #    directory, not a defect in the artifact. and the inverse error is
      #    worse: `sources: 0` read as clean is a check that never examined
      #    one source.
      if [[ ${#hit[@]} -eq 0 ]]; then
        print_blocked "no .txt sources directly inside: $f"
        exit 2
      fi
      expanded+=("${hit[@]}")
    elif [[ -f "$f" ]]; then
      expanded+=("$f")
    else
      print_blocked "source not found: $f"
      exit 2
    fi
  done
  FROMS=("${expanded[@]}")

  # ⭐ --except SUBTRACTS from the expanded source set, and it exists because
  #    the correct source was UNREACHABLE by the convenient invocation.
  #
  #    measured: a route's own comms yields are the clerk's verbatim emails, so
  #    they are the source of record for every quote of her. they live IN the
  #    route directory, beside the artifact that quotes them. so
  #    `--from route/ --in route/4.stone.md` is both the obvious call and a
  #    REFUSED one — the expansion pulls in 4.stone.md itself, the overlap
  #    guard fires, and it is right to fire.
  #
  #    the workaround was to name each yield as its own --from. that is six
  #    flags a caller must know to write, and the failure mode when they do not
  #    is not an error — it is a WALL OF RED against a correct document. that
  #    exact miss produced a 61:1 ratio on one page: 62 reported defects, 61 of
  #    them the tool's own input.
  #
  # ⇒ so: expand the directory, then subtract the artifact by name.
  #
  #     rhx quote.verify --from route/ --except route/4.stone.md --in route/4.stone.md
  #
  # ⛔ AND A --except THAT MATCHES NO SOURCE MUST BLOCK. a silently-ignored
  #    exclusion is the same defect as a silently-empty expansion: the caller
  #    believes the corpus was narrowed, the run says so nowhere, and the
  #    overlap guard then refuses with a message about a path the caller
  #    thought they had already removed. a typo'd path must be loud.
  local e
  local k
  local kept=()
  local dropped=0
  for e in "${EXCEPTS[@]+"${EXCEPTS[@]}"}"; do
    local found=0
    for k in "${FROMS[@]}"; do
      [[ "$k" == "$e" ]] && found=1
    done
    if [[ $found -eq 0 ]]; then
      print_blocked "--except names a path that is not in the source set: $e"
      exit 2
    fi
  done
  for k in "${FROMS[@]}"; do
    local skip=0
    for e in "${EXCEPTS[@]+"${EXCEPTS[@]}"}"; do
      [[ "$k" == "$e" ]] && skip=1
    done
    if [[ $skip -eq 1 ]]; then
      dropped=$((dropped + 1))
    else
      kept+=("$k")
    fi
  done
  if [[ $dropped -gt 0 ]]; then
    # ⛔ a subtraction that leaves ZERO sources is the empty-expansion defect
    #    by another route, and it reports every quote as a fabrication.
    if [[ ${#kept[@]} -eq 0 ]]; then
      print_blocked "--except removed every source, so none would be left to check against"
      exit 2
    fi
    FROMS=("${kept[@]}")
  fi

  # ⭐ an --in may name a DIRECTORY too — the CENSUS.
  #
  #    the loop this replaces was written by hand on every sweep of a route's
  #    templates, and a hand-written loop is an adhoc command: it is not the
  #    same measurement twice, it carries no test, and the shell refuses it
  #    outright under a permission allowlist — which is where the gap was
  #    finally felt rather than reasoned about.
  #
  # ⛔ NON-RECURSIVE and empty-BLOCKS, for the same two reasons as --from: an
  #    artifact set you did not choose is the one whose absence you will not
  #    notice, and `verified: 0` read as clean is a check that never opened a
  #    file.
  expanded=()
  for f in "${INS[@]}"; do
    if [[ -d "$f" ]]; then
      hit=()
      for g in "$f"/*.md "$f"/*.stone; do
        [[ -f "$g" ]] && hit+=("$g")
      done
      if [[ ${#hit[@]} -eq 0 ]]; then
        print_blocked "no .md or .stone artifacts directly inside: $f"
        exit 2
      fi
      expanded+=("${hit[@]}")
    elif [[ -f "$f" ]]; then
      expanded+=("$f")
    else
      print_blocked "artifact not found: $f"
      exit 2
    fi
  done
  INS=("${expanded[@]}")

  # ⛔ REFUSE a path that is BOTH a source and an artifact.
  #
  #    a file checked against itself verifies every quote it holds, so the
  #    run reports a clean corpus no matter what is in it. that is not a weak
  #    check — it is a check that CANNOT FAIL, which is strictly worse than
  #    none, because it ships a green verdict over unread text.
  #
  #    the overlap is reachable by accident now that `--from DIR` expands
  #    `*.md`: one `--from .` and one `--in .` is enough. so it is refused
  #    here rather than left to the caller to avoid.
  local i
  local j
  for i in "${FROMS[@]}"; do
    for j in "${INS[@]}"; do
      if [[ "$i" == "$j" ]]; then
        print_blocked "a path is both a source and an artifact, so it would verify against itself: $i"
        exit 2
      fi
    done
  done

  if ! [[ "$MIN" =~ ^[0-9]+$ ]]; then
    print_blocked "--min needs a whole number, got: $MIN"
    exit 2
  fi
}

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one, `set -e` aborts on the assignment line itself when
#    node exits non-zero, so the refusal below never prints and the
#    caller gets a bare exit code with no reason attached to it.
verify() {
  local out
  local code
  local flags=()
  local f
  for f in "${FROMS[@]}"; do flags+=(--from "$f"); done
  for f in "${INS[@]}"; do flags+=(--in "$f"); done
  flags+=(--min "$MIN")
  for f in "${NEEDLES[@]+"${NEEDLES[@]}"}"; do flags+=(--needle "$f"); done
  set +e
  out="$(node "$SKILL_DIR/verify.js" "${flags[@]}" 2>&1)"
  code=$?
  set -e
  BODY="$out"
  return "$code"
}

main() {
  parse_args "$@"
  check_tools
  validate_input

  local code=0
  verify || code=$?

  if [[ "$code" == "1" ]]; then
    print_blocked "verify failed: $BODY"
    exit 1
  fi

  if [[ "$code" == "0" ]]; then
    print_eagle_header "read every quote,"
  else
    print_eagle_header "a quote did not match its source..."
  fi
  print_tree_start "$SKILL_NAME"
  local f
  for f in "${FROMS[@]}"; do print_tree_branch "from" "$f"; done
  for f in "${INS[@]}"; do print_tree_branch "in" "$f"; done
  echo "   │"
  printf '%s\n' "$BODY"

  exit "$code"
}

main "$@"
