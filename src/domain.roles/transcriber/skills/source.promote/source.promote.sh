#!/usr/bin/env bash
######################################################################
# .what = promote pulled source bytes out of a gitignored scratch tree and
#         into the PUBLISHED `refs/` dir beside the brief that cites them
#
# .why  = a brief that ships to npm with its evidence in a gitignored tree
#         ships with NO evidence. the reader cannot check it, and neither
#         can a quote census — which reports the whole file as unsourced.
#
#         measured: an npm-published brief censused `11 live defects` and
#         every one was a CORRECT quote. its four agency pulls sat in a
#         route's `.probe/`, excluded by `**/.demo/*`. the cure is
#         PROMOTION, never a declared gap — a declaration keeps you honest
#         and leaves the reader empty-handed.
#
#         `git check-ignore -v <source>` is the whole test for whether a
#         brief needs this.
#
# usage:
#   source.promote --from a.txt --into refs/pulledAt=2026-01-15.a.txt
#   source.promote --manifest refs/promote.jobs.json          # ⭐ a batch
#   source.promote --manifest refs/promote.jobs.json --mode apply
#   source.promote --from big.txt --into refs/pulledAt=2026-01-15.b.txt \
#     --slice-from 'Company incorporation in Delaware' \
#     --slice-to   'annually after your first year' \
#     --why        'a hydration payload rides along; whole is 268 KB'
#   source.promote --help
#
# options:
#   --manifest PATH  a JSON job set: `{ "jobs": [ { src, dst, slice, why } ] }`
#                    `slice` is `null` or `{ "from": "...", "to": "..." }`.
#
#                    ⭐ REACH FOR THIS. the manifest is the re-runnable record
#                    of which pull became which ref, and its `why` field is
#                    where a slice states its own justification. a promotion
#                    you cannot re-run is a promotion nobody can audit.
#   --from PATH      one source, the pulled bytes
#   --into PATH      where it lands, under the published tree
#   --slice-from S   the start marker. the slice begins AT it, inclusive
#   --slice-to S     the end marker. the slice ends AFTER it, inclusive
#   --why TEXT       why this slice omits what it omits. REQUIRED on a slice
#   --mode plan      report and write no file (DEFAULT)
#   --mode apply     write the files
#   --root PATH      the dir relative paths hang off (default: cwd)
#   --help           show usage and exit
#
# guarantee:
#   - ⛔ A MISSED MARKER REFUSES, and writes no file. a fall-through emits
#     the WHOLE document under a filename that promises a section — a
#     filename that lies about its own bytes, which is worse than absent
#   - a missed marker reports the LONGEST PREFIX that did match, plus the
#     60 chars the source actually carries there. that turns "missed" into
#     a read rather than a guess
#   - markers are matched over a LENGTH-STABLE whitespace map, so a marker
#     typed with a plain space still finds a document that separates its
#     words with U+00A0 or a tab. the ORIGINAL bytes are what get sliced
#   - a sliced job with no `why` REFUSES. a slice is a judgment about what
#     a reader may omit; an unstated judgment cannot be audited
#   - an `effectiveAt=` destination whose year appears nowhere in the
#     promoted bytes REFUSES. a stamp is a CLAIM about the artifact
#   - plan mode is the default; no file is written without `--mode apply`
#   - ⛔ a PARTIAL promotion exits 2. one refused job means a published
#     brief is short a piece of its own evidence
#   - exit 0 clean, exit 1 malfunction, exit 2 constraint
#
# ⚠️ SLICE ONLY WHEN THE WHOLE IS GENUINELY TOO LARGE.
#
#    `rule.require.bhrowser-citations` is explicit that when a rule has
#    adjacent provisions that qualify it, the unit of retrieval is the
#    CONTAINER, never the section. a first pass here sliced 8 Del. C. § 132
#    alone, because § 132 is the section that "answers the question" — and
#    it is § 136, four sections later, that carries the hazard: an agent may
#    resign from a corporation that is ALREADY VOID.
#
#    a § 132-only slice reads as a complete answer and omits the one
#    provision that can cost you the agent. so the bar for a slice is a
#    SIZE problem, never a relevance one — a `textContent` read of a docs
#    page returns 268 KB against ~12 KB of prose, because a hydration
#    payload rides along, and that is what a slice is for.
#
# ⛔ WHAT THIS DOES NOT CHECK — whether the PULL was any good.
#    a blocked page, a soft 404, and a collapsed slug all promote cleanly.
#    the byte-count and body checks belong upstream, at the pull.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="source.promote"
source "$SKILL_DIR/output.sh"

MANIFEST=""
FROM=""
INTO=""
SLICE_FROM=""
SLICE_TO=""
WHY=""
MODE="plan"
ROOT=""
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
      --manifest) MANIFEST="${2:-}"; shift 2 ;;
      --from) FROM="${2:-}"; shift 2 ;;
      --into) INTO="${2:-}"; shift 2 ;;
      --slice-from) SLICE_FROM="${2:-}"; shift 2 ;;
      --slice-to) SLICE_TO="${2:-}"; shift 2 ;;
      --why) WHY="${2:-}"; shift 2 ;;
      --mode) MODE="${2:-}"; shift 2 ;;
      --root) ROOT="${2:-}"; shift 2 ;;
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
    print_blocked "node not found: this promotion needs node on PATH"
    exit 2
  fi
}

validate_input() {
  if [[ "$MODE" != "plan" && "$MODE" != "apply" ]]; then
    print_blocked "--mode takes plan or apply, got: $MODE"
    exit 2
  fi

  # ⛔ the two input shapes are EXCLUSIVE. a manifest silently beside a
  #    --from would run the manifest and drop the flag, so the caller sees a
  #    clean green run over a job they believe they asked for and did not get.
  if [[ -n "$MANIFEST" && ( -n "$FROM" || -n "$INTO" ) ]]; then
    print_blocked "--manifest and --from/--into are exclusive; pick one shape"
    exit 2
  fi

  if [[ -n "$MANIFEST" ]]; then
    if [[ ! -f "$MANIFEST" ]]; then
      print_blocked "manifest not found: $MANIFEST"
      exit 2
    fi
    return 0
  fi

  if [[ -z "$FROM" ]]; then
    print_blocked "--from needs the source file (the pulled bytes), or pass --manifest"
    exit 2
  fi
  if [[ -z "$INTO" ]]; then
    print_blocked "--into needs the published path it lands at"
    exit 2
  fi
  # ⛔ half a slice is not a slice. an unbounded tail under a filename that
  #    promises a section is the same lie as a missed start marker.
  if [[ -n "$SLICE_FROM" && -z "$SLICE_TO" ]]; then
    print_blocked "--slice-from needs a --slice-to; an unbounded tail is not a slice"
    exit 2
  fi
  if [[ -z "$SLICE_FROM" && -n "$SLICE_TO" ]]; then
    print_blocked "--slice-to needs a --slice-from"
    exit 2
  fi
}

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one, `set -e` aborts on the assignment line itself when node
#    exits non-zero, so the refusal below never prints and the caller gets a
#    bare exit code with no reason attached to it.
promote() {
  local out
  local code
  local flags=()
  if [[ -n "$MANIFEST" ]]; then
    flags+=(--manifest "$MANIFEST")
  else
    flags+=(--from "$FROM" --into "$INTO")
    [[ -n "$SLICE_FROM" ]] && flags+=(--slice-from "$SLICE_FROM")
    [[ -n "$SLICE_TO" ]] && flags+=(--slice-to "$SLICE_TO")
    [[ -n "$WHY" ]] && flags+=(--why "$WHY")
  fi
  flags+=(--mode "$MODE")
  [[ -n "$ROOT" ]] && flags+=(--root "$ROOT")
  set +e
  out="$(node "$SKILL_DIR/promote.js" "${flags[@]}" 2>&1)"
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
  promote || code=$?

  if [[ "$code" == "1" ]]; then
    print_blocked "promote failed: $BODY"
    exit 1
  fi

  if [[ "$code" == "0" ]]; then
    if [[ "$MODE" == "apply" ]]; then
      print_eagle_header "the evidence ships with the claim,"
    else
      print_eagle_header "heres what would land,"
    fi
  else
    print_eagle_header "a marker missed, so no file was written..."
  fi

  print_tree_start "$SKILL_NAME"
  print_tree_branch "mode" "$MODE"
  [[ -n "$MANIFEST" ]] && print_tree_branch "manifest" "$MANIFEST"
  echo "   │"
  printf '%s\n' "$BODY"

  exit "$code"
}

main "$@"
