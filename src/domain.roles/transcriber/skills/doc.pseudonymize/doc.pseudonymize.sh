#!/usr/bin/env bash
######################################################################
# .what = swap real identifiers for synthetic ones across a document
#         set, deterministically, and PROVE none survived
#
# .why  = a real executed document is the best example artifact there
#         is — it shows what an actual charter, consent, or return
#         looks like, which no invented sample can. it is also the
#         worst candidate to publish, because it carries a real
#         person's SSN, a real EIN, a real home address, and a real
#         state file number that indexes a public registry.
#
#         a hand swap of those values is the same defect as a hand
#         transcription: it looks complete and carries no guarantee.
#         you miss the second casing, the unformatted variant, the
#         derived IRS name control, the DocuSign envelope id in the
#         page footer — and you never learn that you missed them.
#
#         this skill swaps from a map, then greps the OUTPUT for
#         every real value and refuses to report success while one
#         survives.
#
# ⚠️ the defect this exists for: SUBSTRING COLLISION. a map that
#    carries both `ACMEWIDGET -> NORTHWIND` and `ACME -> NORT` will,
#    applied shortest-first, turn ACMEWIDGET into NORTWIDGET — a
#    value that is neither real nor synthetic, and that no verify
#    pass will flag, because the real value is genuinely gone. the
#    map is therefore ALWAYS applied longest-first.
#
# usage:
#   doc.pseudonymize.sh --map .pii-map --from evidence/ --into example/
#   doc.pseudonymize.sh --map .pii-map --from evidence/ --into example/ --mode apply
#   doc.pseudonymize.sh --map .pii-map --verify example/
#
# options:
#   --map     TSV of <real><TAB><synthetic>; one pair per line;
#             blank lines and # comments skipped (required)
#   --from    source directory (required, unless --verify)
#   --into    output directory (required, unless --verify)
#   --verify  check a directory for survivors and exit; no writes
#   --glob    filename pattern to process (default '*.md')
#   --marker  prepend a synthetic-document notice (default true)
#   --mode    plan | apply (default plan)
#   --help    show usage and exit
#
# guarantee:
#   - refuses a map that git tracks, or that git does not ignore —
#     the map is the re-identification key and must never be committed
#   - refuses --into equal to --from; the source stays intact
#   - applies pairs longest-real-first, always
#   - verify greps the output for every real value and exits 2 on a
#     survivor, with the value MASKED so this skill's own output
#     cannot become the leak
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ this handles TEXT. a PDF carries the same values in its metadata
#    (author, producer, original filename) and in its pixels. do not
#    publish a source PDF because its transcript came back clean.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./output.sh
source "$SCRIPT_DIR/output.sh"

MAP=""
DIR_FROM=""
DIR_INTO=""
DIR_VERIFY=""
GLOB='*.md'
MARKER="true"
MODE="plan"

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role) shift 2 ;;
    --map)     MAP="$2";        shift 2 ;;
    --from)    DIR_FROM="$2";   shift 2 ;;
    --into)    DIR_INTO="$2";   shift 2 ;;
    --verify)  DIR_VERIFY="$2"; shift 2 ;;
    --glob)    GLOB="$2";       shift 2 ;;
    --marker)  MARKER="$2";     shift 2 ;;
    --mode)    MODE="$2";       shift 2 ;;
    --help|-h)
      awk '/^####/ { n++; if (n==2) exit } n==1' "${BASH_SOURCE[0]}" \
        | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) print_blocked "unknown argument: $1"; exit 2 ;;
  esac
done

######################################################################
# validate
######################################################################

# ⛔ `perl` IS the swap. an absent one does not degrade the output, it
#    aborts the run partway through — and an abort partway through is
#    exactly the state this skill must never leave behind. check first,
#    the way `doc.sign:119` and eight neighbor skills already do.
for tool in perl grep; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    print_blocked "$tool is required but was not found on PATH"
    exit 2
  fi
done

[[ -n "$MAP" ]] || { print_blocked "--map is required"; exit 2; }
[[ -f "$MAP" ]] || { print_blocked "map not found: $MAP"; exit 2; }

# the map is the re-identification key. if it lands in a commit, every
# pseudonymized artifact in the repo becomes reversible in one step.
if git ls-files --error-unmatch "$MAP" >/dev/null 2>&1; then
  print_blocked "map is tracked by git: $MAP — it must never be committed"
  exit 2
fi
if ! git check-ignore -q "$MAP"; then
  print_blocked "map is not gitignored: $MAP — add it to .gitignore first"
  exit 2
fi

if [[ -z "$DIR_VERIFY" ]]; then
  [[ -n "$DIR_FROM" ]] || { print_blocked "--from is required"; exit 2; }
  [[ -n "$DIR_INTO" ]] || { print_blocked "--into is required"; exit 2; }
  [[ -d "$DIR_FROM" ]] || { print_blocked "source not found: $DIR_FROM"; exit 2; }
  if [[ "$(cd "$DIR_FROM" && pwd)" == "$(cd "$DIR_INTO" 2>/dev/null && pwd || echo _)" ]]; then
    print_blocked "--into must differ from --from; the source stays intact"
    exit 2
  fi
fi

case "$MODE" in
  plan|apply) ;;
  *) print_blocked "--mode must be plan or apply, got: $MODE"; exit 2 ;;
esac

######################################################################
# read the map, longest real value first
#
# a shorter real value that is a prefix of a longer one would
# otherwise corrupt the longer one mid-swap. see the header.
######################################################################

read_map_sorted() {
  awk -F'\t' '
    /^#/   { next }
    NF < 2 { next }
    { print length($1) "\t" $1 "\t" $2 }
  ' "$MAP" | sort -rn -k1,1
}

mask() {
  local value="$1"
  local head="${value:0:2}"
  local rest="${#value}"
  rest=$((rest - 2))
  [[ $rest -lt 0 ]] && rest=0
  printf '%s%s' "$head" "$(printf '%*s' "$rest" '' | tr ' ' '*')"
}

PAIRS_TOTAL=$(read_map_sorted | wc -l | tr -d ' ')
[[ "$PAIRS_TOTAL" -gt 0 ]] || { print_blocked "map holds no pairs: $MAP"; exit 2; }

######################################################################
# verify — the proof half
######################################################################

# .what = find files where a mapped value survives, WRAPPED across lines
#
# .why  = a verification that reuses the edit's matcher inherits the
#         edit's blind spot and always reports clean.
#
#         the swap is `perl -pe`, which wraps its body in `while(<>)`,
#         so a pattern can never span a newline. the `grep -F` below is
#         line-scoped for the same reason. so a mapped value that
#         HARD-WRAPS survives the swap AND verifies clean — and an
#         address block in an OCR transcript wraps as a matter of
#         course:
#
#             Address:  1200 Sandpine Harbor Way,
#                       Suite 400
#
#         this is the second matcher: collapse every run of whitespace
#         to one space, then search the collapsed copy. same value, a
#         deliberately different orientation.
#
# ⛔ .note = DETECT ONLY. the collapsed copy has lost the document's
#           line structure, so no edit may be written back through it —
#           a reflow of a legal transcript is its own defect. a wrap hit
#           is reported as a survivor so a human fixes the source, the
#           way the [path] channel is already handled below.
wrap_hits() {
  local real="$1" dir="$2"
  local needle f
  # ⚠️ the real value is collapsed TOO. without this, a pair holding a
  #    normal space would not match the collapsed copy
  needle=$(printf '%s' "$real" | tr -s '[:space:]' ' ')
  while IFS= read -r f; do
    # ⚠️ -i for the same reason the [content] pass takes it: a LEAK does
    #    not care about letter-case. see the note above run_verify
    if tr -s '[:space:]' ' ' < "$f" 2>/dev/null | grep -Fqi -- "$needle"; then
      printf '%s\n' "$f"
    fi
  done < <(find "$dir" -type f | sort)
}

# ⛔ .note = THE THREE MATCHERS BELOW MATCH CASE-INSENSITIVELY. the SWAP
#           does not, and that asymmetry is deliberate.
#
#           a matcher and the check that clears it must agree with EACH
#           OTHER only when they answer the same question. these do not:
#
#             the swap asks  "what may I safely REWRITE?"
#             the verify asks "did a real value SURVIVE?"
#
#           a swap that folded case would rewrite `JANE DOE` to the
#           title-case `Pat Roe` and silently destroy the document's own
#           emphasis — a signature block, a caption, a form field. so the
#           swap stays exact, and the map holds one row per casing.
#
#           but a LEAK does not care about letter-case. a real name that
#           survives in upper case is the same person, and a verify that
#           reads `JANE DOE` as clean reports `survivors: 0` over a
#           document that names her.
#
# 🚩 observed 2026-09-02. this file's [path] channel already took `-i`
#    three lines below, while [content] and [wrap] did not — so the
#    principle was stated once and applied to one of three channels.
run_verify() {
  local dir="$1"
  [[ -d "$dir" ]] || { print_blocked "verify target not found: $dir"; exit 2; }

  local survivors=0
  local reported=""

  # the PATH is a leak channel too. a transcript whose content is clean
  # still names the person if the file is called `deed.jane-doe.md`.
  local paths_all
  paths_all=$(find "$dir" -type f | sort)

  while IFS=$'\t' read -r _len real _fake; do
    [[ -n "$real" ]] || continue

    local hits
    hits=$(grep -Fril -- "$real" "$dir" 2>/dev/null || true)

    local hits_path
    hits_path=$(printf '%s\n' "$paths_all" | grep -Fi -- "$real" 2>/dev/null || true)

    # the wrap-aware pass, minus whatever the line-scoped pass already
    # named — so a value is reported once, under its most specific label
    local hits_wrap
    hits_wrap=$(wrap_hits "$real" "$dir")
    if [[ -n "$hits" && -n "$hits_wrap" ]]; then
      hits_wrap=$(printf '%s\n' "$hits_wrap" \
        | grep -Fxv -f <(printf '%s\n' "$hits") 2>/dev/null || true)
    fi

    if [[ -n "$hits" || -n "$hits_path" || -n "$hits_wrap" ]]; then
      survivors=$((survivors + 1))
      reported+="      ├─ $(mask "$real") survives in:"$'\n'
      # label the channel. a path hit and a content hit have different
      # cures — a path hit is often the CONTAINING directory, which this
      # skill never wrote and cannot fix.
      while IFS= read -r f; do
        [[ -n "$f" ]] && reported+="      │  └─ [content] $f"$'\n'
      done <<< "$hits"
      while IFS= read -r f; do
        [[ -n "$f" ]] && reported+="      │  └─ [path]    $f"$'\n'
      done <<< "$hits_path"
      # ⚠️ a wrap hit means the SWAP never landed — the value spans a
      #    line break, so no line-scoped edit could reach it. the cure
      #    is in the source document, not in a re-run of this skill.
      while IFS= read -r f; do
        [[ -n "$f" ]] && reported+="      │  └─ [wrap]    $f"$'\n'
      done <<< "$hits_wrap"
    fi
  done < <(read_map_sorted)

  if [[ "$survivors" -gt 0 ]]; then
    print_eagle_header "that wont work..."
    print_tree_start "doc.pseudonymize --verify"
    print_tree_branch "target" "$dir"
    print_tree_branch "pairs checked" "$PAIRS_TOTAL"
    print_tree_leaf "survivors" "$survivors"
    echo ""
    printf '%s' "$reported"
    echo ""
    # ⚠️ do NOT say "the swap did not land" — that is true for [content]
    #    only. a [path] hit is a filename this skill never wrote, and a
    #    [wrap] hit spans a line break no line-scoped edit can reach. for
    #    both, a re-run is a no-op and the cure is in the source.
    echo "   a real value survives. do NOT publish this directory."
    echo "   [content] = a re-run may fix · [path] + [wrap] = fix the source"
    exit 2
  fi

  print_eagle_header "clean."
  print_tree_start "doc.pseudonymize --verify"
  print_tree_branch "target" "$dir"
  print_tree_branch "pairs checked" "$PAIRS_TOTAL"
  print_tree_leaf "survivors" "0"
  exit 0
}

if [[ -n "$DIR_VERIFY" ]]; then
  run_verify "$DIR_VERIFY"
fi

######################################################################
# collect the source set
######################################################################

FILES=()
while IFS= read -r f; do
  [[ -n "$f" ]] && FILES+=("$f")
done < <(find "$DIR_FROM" -type f -name "$GLOB" | sort)

[[ ${#FILES[@]} -gt 0 ]] || {
  print_blocked "no files matched '$GLOB' under $DIR_FROM"
  exit 2
}

######################################################################
# plan
######################################################################

if [[ "$MODE" == "plan" ]]; then
  print_eagle_header "heres the swap..."
  print_tree_start "doc.pseudonymize"
  print_tree_branch "from" "$DIR_FROM"
  print_tree_branch "into" "$DIR_INTO"
  print_tree_branch "glob" "$GLOB"
  print_tree_branch "pairs" "$PAIRS_TOTAL (applied longest-real-first)"
  print_tree_branch "marker" "$MARKER"
  print_tree_leaf "files" "${#FILES[@]}"
  echo ""
  echo "   files"
  for f in "${FILES[@]}"; do
    echo "      ├─ $f"
  done
  echo ""
  echo "   pairs (real values masked)"
  while IFS=$'\t' read -r _len real fake; do
    [[ -n "$real" ]] || continue
    printf '      ├─ %-24s -> %s\n' "$(mask "$real")" "$fake"
  done < <(read_map_sorted)
  echo ""
  echo "   run with --mode apply to write, then --verify to prove it"
  exit 0
fi

######################################################################
# apply
######################################################################

mkdir -p "$DIR_INTO"

# ⛔ the swap runs on a TEMP file. $DIR_INTO never holds unswapped bytes.
#
# .why  = a `cp "$src" "$dst"` followed by an in-place swap puts a
#         byte-for-byte copy of the REAL document in the publish
#         directory for the full width of the swap loop. any abort in
#         that window — a full disk, a non-zero perl, or a human who
#         hits ctrl-C — leaves file N as the real document, sitting
#         among correctly-swapped neighbors with no marker to tell them
#         apart. that reads as a partial success, not as a crash.
#
#         with one `mv` at the end, an abort leaves file N ABSENT
#         instead. that is both the safe direction and a detectable one
#         — the file count will not match.
#
# .note = the `mv` may cross a filesystem and so may not be atomic. it
#         does not need to be: what it moves is already swapped, so the
#         worst case is a truncated SYNTHETIC file, never a real one.
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT
WORKFILE="$WORKDIR/doc"

SWAPS_TOTAL=0

for src in "${FILES[@]}"; do
  # .what = how many mapped pairs actually matched THIS file
  # .why  = the marker below states a counted figure rather than a
  #         warranty. SWAPS_TOTAL accumulates across every file, so it
  #         cannot answer "what happened to this document" — and the
  #         marker is written INTO this document.
  swaps_file=0

  rel="${src#"$DIR_FROM"}"
  rel="${rel#/}"

  # swap the PATH as well as the content. a transcript whose body is clean
  # still names the person if the file is called `deed.jane-doe.md`.
  while IFS=$'\t' read -r _len real fake; do
    [[ -n "$real" ]] || continue
    rel="${rel//"$real"/"$fake"}"
    real_lower="$(printf '%s' "$real" | tr '[:upper:]' '[:lower:]')"
    fake_lower="$(printf '%s' "$fake" | tr '[:upper:]' '[:lower:]')"
    rel="${rel//"$real_lower"/"$fake_lower"}"
  done < <(read_map_sorted)

  dst="$DIR_INTO/$rel"
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$WORKFILE"

  while IFS=$'\t' read -r _len real fake; do
    [[ -n "$real" ]] || continue
    if grep -Fq -- "$real" "$WORKFILE" 2>/dev/null; then
      REAL="$real" FAKE="$fake" perl -i -pe \
        'BEGIN { $r = quotemeta($ENV{REAL}); $s = $ENV{FAKE}; } s/$r/$s/g;' "$WORKFILE"
      SWAPS_TOTAL=$((SWAPS_TOTAL + 1))
      swaps_file=$((swaps_file + 1))
    fi
  done < <(read_map_sorted)

  # ⚠️ the marker states the MECHANISM and its LIMIT, never a warranty.
  #
  #    it used to read "every name, number, address, and identifier below
  #    was replaced" — a claim no code here can establish, and the widest
  #    claim in the skill. `run_verify` iterates `read_map_sorted`, so it
  #    can only ever find values that are IN the map; an identifier nobody
  #    mapped is invisible to the swap AND to the check. a derived IRS
  #    name control, an unformatted EIN variant, a DocuSign envelope id —
  #    `rule.require.provable-pseudonymization` names all three.
  #
  #    and this warranty is worse-placed than the stdout ones on
  #    `pii.scan` and `doc.sign`: it is written INTO the artifact, so a
  #    downstream reader inherits the false assurance as text. that turns
  #    a variant that survived into a CONFIDENT leak.
  #
  #    so: a counted figure, the map width it is measured against, and the
  #    limit said out loud. the "NOT a record of any real entity or
  #    person" line is kept verbatim and unconditional — it is true of
  #    every output regardless of swap count, and it is the load-bearing
  #    sentence. ⛔ do NOT gate the marker on a nonzero count: a file that
  #    matched no pair needs that line MOST.
  if [[ "$MARKER" == "true" ]]; then
    {
      echo "<!-- SYNTHETIC DOCUMENT — $swaps_file of $PAIRS_TOTAL mapped pair(s)"
      echo "     matched this file and were replaced with invented values by"
      echo "     \`rhx doc.pseudonymize\`. this is an example artifact."
      echo ""
      echo "     ⚠️ the guarantee is exactly as wide as that map. an"
      echo "     identifier that was never mapped was never swapped, and no"
      echo "     check in this skill can see it. run \`--verify\` to prove"
      echo "     the mapped pairs landed; it proves no more than them."
      echo ""
      echo "     it is NOT a record of any real entity or person. -->"
      echo ""
      cat "$WORKFILE"
    } > "$WORKDIR/marked"
    mv "$WORKDIR/marked" "$WORKFILE"
  fi

  # the ONE write into the publish directory, and the last step taken on
  # this file. every step above it touched only $WORKDIR.
  mv "$WORKFILE" "$dst"
done

print_eagle_header "swapped."
print_tree_start "doc.pseudonymize"
print_tree_branch "from" "$DIR_FROM"
print_tree_branch "into" "$DIR_INTO"
print_tree_branch "files" "${#FILES[@]}"
print_tree_branch "swaps applied" "$SWAPS_TOTAL"
print_tree_leaf "next" "rhx doc.pseudonymize --map $MAP --verify $DIR_INTO"
