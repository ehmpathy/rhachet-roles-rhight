#!/usr/bin/env bash
######################################################################
# .what = red-team a repo for dox and social-engineer risk before it is
#         published — layered passes, cheapest first, each one aimed at
#         what the prior one structurally cannot see
#
# .why  = a clean `pii.scan` says the TREE carries no known shape. it
#         says naught about what actually ships:
#
#           - the commit ships the INDEX, not the tree. a fix left
#             unstaged leaves the leaky version staged
#           - the npm package ships `dist/`, which can be stale and still
#             carry a value the source dropped weeks ago
#           - the history ships with the repo. a value removed in the
#             latest commit is still one `git log -p` away
#           - a pseudonym whose TRANSFORM is published (its offset, its
#             shape) is reversible by anyone who reads that sentence
#           - a hash of a short real name in a test is a confirmation
#             oracle: guess, hash, compare
#
#         each of those passes every per-file check. so this skill
#         checks the PUBLICATION SURFACE, and emits the prompt for the
#         one layer no executable can run: a blind stranger's read.
#
# the layers:
#   L1 deterministic  roster over the INDEX snapshot · shape detectors
#                     via pii.scan · `doc.pseudonymize --verify` per demo
#   L2 surface        a drift · b history · c dist · d transform ·
#                     e twins · f oracles · g evidence dirs · h money
#   L3 blind review   EMIT-ONLY. a prompt + the published file list, for
#                     a fresh brain with no map, no history, no folders
#   L4 triage         P0 fix before release · P1 owner decision ·
#                     P2 human review, never an auto-fail
#
# usage:
#   publish.redteam.sh                                  # all of L1 + L2
#   publish.redteam.sh --roster .pii-map --demo docs/.demo/v1.public
#   publish.redteam.sh --history                        # + every ref
#   publish.redteam.sh --emit-blind .temp/blind.md      # + the L3 prompt
#   publish.redteam.sh --mode plan                      # what would run
#   publish.redteam.sh --help
#
# guarantee:
#   - NEVER prints a real value. every match is masked to its first two
#     characters plus `***`, and a path that holds a roster value is
#     masked the same way. the report must not become the leak
#   - refuses a roster that git tracks or does not ignore — the roster
#     is the re-identification key
#   - a layer that could not run is a MALFUNCTION, never a pass
#   - exit 0 clean, exit 1 malfunction, exit 2 findings (constraint)
#
# ⚠️ the mask is FIXED WIDTH (`Ab***`), where pii.scan keeps the length.
#    a length-true mask of a six-letter name is itself a clue; a red-team
#    report is the one output most likely to be pasted into an issue.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

ROSTER_ARG=".pii-map"
DEMO_ARGS=()
DIST_ARG=""
DIST_GIVEN=0
HISTORY=0
EMIT_ARG=""
EVIDENCE=()
ENTITIES=()
MODE="apply"
# how many sample rows each check prints before it truncates
MAX_ROWS=8

WORKDIR=""
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

print_usage() {
  cat <<'EOF'
🔎 publish.redteam — red-team a repo for dox + social-engineer risk before release

usage:
  publish.redteam.sh                                 L1 + L2 over the published set
  publish.redteam.sh --demo docs/.demo/v1.public     + verify a pseudonymized demo
  publish.redteam.sh --history                       + scan every ref's history
  publish.redteam.sh --emit-blind .temp/blind.md     + write the L3 blind-review prompt
  publish.redteam.sh --mode plan                     what would run, no scan

options:
  --roster FILE      real values to hunt (default: .pii-map). a doc.pseudonymize
                     map works as-is: the LEFT field of a TSV line is the real value
  --demo DIR         a declared public demo; repeatable. runs
                     `doc.pseudonymize --verify` on it, and exempts it from
                     the evidence-dir check
  --dist DIR         the build output to scan (default: dist, if present).
                     `--dist none` skips it
  --history          also scan `git log --all -p` and every ref (slower)
  --emit-blind FILE  write the L3 prompt + the published file list to FILE
  --evidence GLOB    a path glob for real-evidence dirs that must stay
                     ignored; repeatable (default: '**/.demo/**')
  --entity NAME      a depicted entity for the money triage; repeatable
                     (default: the last dot-segment of each --demo dir)
  --mode MODE        plan | apply (default apply)
  --help, -h         show this help

the layers, cheapest first:
  L1 deterministic   roster over the INDEX snapshot (what a commit ships),
                     shape detectors via pii.scan, demo verify
  L2 surface         a  drift     a path staged AND changed in the worktree
                     b  history   a roster value in any commit of any ref
                     c  dist      a roster value in the build output
                     d  transform published size or shape of the pseudonym
                                  transform (a magnitude fails; a hint is
                                  flagged for review)
                     e  twins     a real date in another format; a date
                                  pair that spans a mapped offset (review)
                     f  oracles   a md5/sha1/sha256 digest of a roster value
                     g  evidence  a real-evidence dir that is tracked or
                                  not ignored
                     h  money     profit / loss / NOL / filed-status terms
                                  beside a depicted entity (review only)
  L3 blind review    EMIT-ONLY. this skill cannot be the stranger — it
                     knows the map. --emit-blind writes the prompt; run it
                     in a fresh brain that sees only the published list
  L4 triage          P0 fix before release · P1 owner decision ·
                     P2 human review (never fails the run)

⚠️ every value in this report is masked (first two chars + ***). the
   report must not become the leak.

exit:
  0  clean (no P0 or P1)
  1  malfunction (a layer could not run — this BLOCKS)
  2  findings (constraint)
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --roster)
        ROSTER_ARG="${2:-}"
        shift 2
        ;;
      --demo)
        DEMO_ARGS+=("${2:-}")
        shift 2
        ;;
      --dist)
        DIST_ARG="${2:-}"
        DIST_GIVEN=1
        shift 2
        ;;
      --history)
        HISTORY=1
        shift
        ;;
      --emit-blind)
        EMIT_ARG="${2:-}"
        shift 2
        ;;
      --evidence)
        EVIDENCE+=("${2:-}")
        shift 2
        ;;
      --entity)
        ENTITIES+=("${2:-}")
        shift 2
        ;;
      --mode)
        MODE="${2:-}"
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

######################################################################
# paths. every input is anchored to the CALLER's cwd, then the skill
# moves to the repo root, because `git checkout-index` and
# `git ls-files` speak root-relative paths and the two must agree.
######################################################################
abs_of() {
  local p="$1"
  if [[ -d "$p" ]]; then
    (cd "$p" && pwd -P)
    return 0
  fi
  local d b
  d="$(dirname -- "$p")"
  b="$(basename -- "$p")"
  if [[ -d "$d" ]]; then
    printf '%s/%s' "$(cd "$d" && pwd -P)" "$b"
    return 0
  fi
  printf '%s' "$p"
}

rel_to_root() {
  local abs="$1"
  case "$abs" in
    "$ROOT") printf '.' ;;
    "$ROOT"/*) printf '%s' "${abs#"$ROOT"/}" ;;
    *) printf '%s' "$abs" ;;
  esac
}

ROOT=""
ROSTER=""
ROSTER_INSIDE=0
DEMOS=()
DIST=""
EMIT=""

validate() {
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    print_blocked "not inside a git work tree"
    exit 2
  fi
  case "$MODE" in
    plan|apply) ;;
    *)
      print_blocked "--mode must be plan or apply"
      exit 2
      ;;
  esac

  # anchor to the caller's cwd before the move to the root
  local rosterAbs demo demoAbs distAbs=""
  rosterAbs="$(abs_of "$ROSTER_ARG")"
  local demoAbsList=()
  for demo in ${DEMO_ARGS[@]+"${DEMO_ARGS[@]}"}; do
    if [[ ! -d "$demo" ]]; then
      print_blocked "demo dir not found: $demo"
      exit 2
    fi
    demoAbsList+=("$(abs_of "$demo")")
  done
  if [[ "$DIST_GIVEN" -eq 1 && "$DIST_ARG" != "none" ]]; then
    if [[ ! -d "$DIST_ARG" ]]; then
      print_blocked "dist dir not found: $DIST_ARG (pass --dist none to skip)"
      exit 2
    fi
    distAbs="$(abs_of "$DIST_ARG")"
  fi
  local emitAbs=""
  [[ -n "$EMIT_ARG" ]] && emitAbs="$(abs_of "$EMIT_ARG")"

  ROOT="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
  cd "$ROOT"

  if [[ ! -f "$rosterAbs" ]]; then
    print_blocked "roster not found: $ROSTER_ARG (pass --roster FILE)"
    exit 2
  fi
  ROSTER="$(rel_to_root "$rosterAbs")"

  # ⛔ the roster IS the re-identification key. the same refusal pii.scan
  #    and doc.pseudonymize apply. a roster outside the repo cannot be
  #    committed, so it needs no ignore line
  case "$rosterAbs" in
    "$ROOT"/*) ROSTER_INSIDE=1 ;;
  esac
  if [[ "$ROSTER_INSIDE" -eq 1 ]]; then
    if git ls-files --error-unmatch -- "$ROSTER" &>/dev/null; then
      print_blocked "roster is tracked by git: $ROSTER"
      echo "   the roster names the real values verbatim. a tracked roster"
      echo "   is a worse leak than any this scan can find — gitignore it."
      exit 2
    fi
    if ! git check-ignore -q -- "$ROSTER"; then
      print_blocked "roster is not gitignored: $ROSTER"
      echo "   an untracked roster is one \`git add -A\` from a commit."
      echo "   add it to .gitignore before you point the red team at it."
      exit 2
    fi
  fi

  for demoAbs in ${demoAbsList[@]+"${demoAbsList[@]}"}; do
    DEMOS+=("$(rel_to_root "$demoAbs")")
  done

  if [[ -n "$distAbs" ]]; then
    DIST="$(rel_to_root "$distAbs")"
  elif [[ "$DIST_GIVEN" -eq 0 && -d "$ROOT/dist" ]]; then
    DIST="dist"
  fi

  [[ -n "$emitAbs" ]] && EMIT="$emitAbs"

  if [[ ${#EVIDENCE[@]} -eq 0 ]]; then
    EVIDENCE=('**/.demo/**')
  fi

  # the money triage needs a name to tie a term to. default: the last
  # dot-segment of each declared demo (`v2020_01_01.acme` -> `acme`)
  if [[ ${#ENTITIES[@]} -eq 0 ]]; then
    local base
    for demo in ${DEMOS[@]+"${DEMOS[@]}"}; do
      base="$(basename -- "$demo")"
      base="${base##*.}"
      [[ ${#base} -ge 3 ]] && ENTITIES+=("$base")
    done
  fi
  return 0
}

######################################################################
# roster -> real values (and, for a TSV map, the real->synthetic pairs)
######################################################################
load_roster() {
  : > "$WORKDIR/roster.real"
  : > "$WORKDIR/roster.pairs"
  local line real synth
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    real="${line%%$'\t'*}"
    synth=""
    [[ "$line" == *$'\t'* ]] && synth="${line#*$'\t'}"
    real="$(printf '%s' "$real" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    synth="$(printf '%s' "$synth" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    # a 1-2 char entry would match half the tree — skip, as pii.scan does
    [[ ${#real} -lt 3 ]] && continue
    printf '%s\n' "$real" >> "$WORKDIR/roster.real"
    [[ -n "$synth" ]] && printf '%s\t%s\n' "$real" "$synth" >> "$WORKDIR/roster.pairs"
  done < "$ROSTER"
  sort -u -o "$WORKDIR/roster.real" "$WORKDIR/roster.real"
  ROSTER_COUNT=$(grep -c . "$WORKDIR/roster.real" || true)
}

######################################################################
# masks. first two characters, then `***`, at a fixed width
######################################################################

# .what = mask every roster value inside each input line (a path)
# .why  = a path is a leak channel too. a report that prints
#         `deed.jane-doe.md` has printed the name
mask_paths() {
  awk -v rf="$WORKDIR/roster.real" '
    BEGIN { while ((getline v < rf) > 0) if (v != "") { n++; val[n] = tolower(v) } }
    {
      line = $0
      for (i = 1; i <= n; i++) {
        guard = 0
        while ((p = index(tolower(line), val[i])) > 0 && guard < 50) {
          line = substr(line, 1, p - 1) substr(line, p, 2) "***" substr(line, p + length(val[i]))
          guard++
        }
      }
      print line
    }
  '
}

# .what = turn grep -rno output (`./path:LINE:MATCH`) into masked rows
#         of the form PATH<TAB>LINE<TAB>MASKED
to_rows() {
  awk '
    {
      s = $0
      sub(/^\.\//, "", s)
      p = index(s, ":"); if (p == 0) next
      file = substr(s, 1, p - 1); rest = substr(s, p + 1)
      q = index(rest, ":"); if (q == 0) next
      line = substr(rest, 1, q - 1); m = substr(rest, q + 1)
      if (m == "") next
      printf "%s\t%s\t%s***\n", file, line, substr(m, 1, 2)
    }
  '
}

# rows for a fixed-text pattern file, case-insensitive, over a dir
rows_fixed() {
  local dir="$1" pats="$2"
  [[ -s "$pats" ]] || return 0
  (cd "$dir" && grep -rnoiIF -f "$pats" . 2>/dev/null || true) | to_rows
}

# rows for one extended regex, case-insensitive, over a dir
rows_regex() {
  local dir="$1" re="$2"
  (cd "$dir" && grep -rnoiIE -e "$re" . 2>/dev/null || true) | to_rows
}

# path rows: a file whose NAME holds a roster value
rows_paths() {
  local list="$1"
  [[ -s "$list" ]] || return 0
  grep -iF -f "$WORKDIR/roster.real" "$list" 2>/dev/null \
    | awk '{ printf "%s\t-\t[path]\n", $0 }' || true
}

# .what = print up to MAX_ROWS rows of a row file, then a remainder line
render_rows() {
  local rows="$1"
  local n shown=0 file line masked
  n=$(grep -c . "$rows" 2>/dev/null || true)
  [[ -z "$n" || "$n" -eq 0 ]] && return 0
  while IFS=$'\t' read -r file line masked; do
    [[ "$shown" -ge "$MAX_ROWS" ]] && break
    if [[ "$line" == "-" ]]; then
      print_sub_row "$(printf '%s' "$file" | mask_paths)  $masked"
    else
      print_sub_row "$(printf '%s' "$file" | mask_paths)  L$line  $masked"
    fi
    shown=$((shown + 1))
  done < <(sort -t"$(printf '\t')" -k1,1 -k2,2n "$rows")
  if [[ "$n" -gt "$shown" ]]; then
    print_sub_row "… $((n - shown)) more"
  fi
}

count_rows() {
  local n
  n=$(grep -c . "$1" 2>/dev/null || true)
  printf '%s' "${n:-0}"
}

files_in_rows() {
  local n
  n=$(cut -f1 "$1" 2>/dev/null | sort -u | grep -c . || true)
  printf '%s' "${n:-0}"
}

######################################################################
# the published set: the INDEX (what a commit ships), plus untracked
# files git does not ignore (one `git add -A` from the index)
######################################################################
build_published_set() {
  git ls-files > "$WORKDIR/index.list"
  git ls-files --others --exclude-standard > "$WORKDIR/untracked.list"
  SNAP="$WORKDIR/snap"
  mkdir -p "$SNAP"
  # ⚠️ the index, not the worktree. `git checkout-index` writes the
  #    STAGED blob of every path, so a fix left unstaged does not hide
  #    the leak the commit would actually carry
  if ! git checkout-index --all --prefix="$SNAP/" 2>"$WORKDIR/checkout.err"; then
    MALFUNCTIONS+=("L1: could not export the index ($(head -1 "$WORKDIR/checkout.err"))")
  fi
  local f
  while IFS= read -r f; do
    [[ -n "$f" && -f "$f" ]] || continue
    mkdir -p "$SNAP/$(dirname -- "$f")"
    cp -p -- "$f" "$SNAP/$f" 2>/dev/null || true
  done < "$WORKDIR/untracked.list"
  cat "$WORKDIR/index.list" "$WORKDIR/untracked.list" | sort -u > "$WORKDIR/published.list"
}

######################################################################
# L1 — deterministic
######################################################################
layer_l1() {
  echo "   ├─ L1 deterministic"

  # roster over the index snapshot, content and path
  local r="$WORKDIR/l1.roster.rows"
  { rows_fixed "$SNAP" "$WORKDIR/roster.real"; rows_paths "$WORKDIR/published.list"; } > "$r"
  local n; n="$(count_rows "$r")"
  P0=$((P0 + n))
  print_sub_branch "roster" "$n hit(s) across $(files_in_rows "$r") file(s) of the published set"
  render_rows "$r"

  # shapes, delegated to pii.scan — one set of detectors, not two
  local regexSkill="$SCRIPT_DIR/../pii.scan/pii.scan.via.regex.sh"
  if [[ ! -f "$regexSkill" ]]; then
    MALFUNCTIONS+=("L1: pii.scan regex mechanism not found")
    print_sub_branch "shapes" "💥 pii.scan not found — the shape detectors did not run"
  else
    local out="$WORKDIR/l1.shapes.out" status=0
    bash "$regexSkill" > "$out" 2>&1 || status=$?
    if [[ "$status" -eq 0 ]]; then
      print_sub_branch "shapes" "clean (pii.scan --via regex, tracked + untracked)"
    elif [[ "$status" -eq 2 ]] && grep -q 'hits:' "$out"; then
      local hitline
      hitline="$(grep -m1 'hits:' "$out" | sed -e 's/^.*hits: //')"
      P0=$((P0 + 1))
      print_sub_branch "shapes" "$hitline"
      print_sub_row "rows: rhx pii.scan --via regex (masked)"
    else
      MALFUNCTIONS+=("L1: pii.scan could not run (exit $status)")
      print_sub_branch "shapes" "💥 pii.scan could not run (exit $status)"
    fi
  fi

  # the proof half of each pseudonymized demo
  local verifySkill="$SCRIPT_DIR/../doc.pseudonymize/doc.pseudonymize.sh"
  if [[ ${#DEMOS[@]} -eq 0 ]]; then
    print_sub_leaf "demo verify" "none declared (--demo DIR)"
    return 0
  fi
  if [[ ! -f "$verifySkill" ]]; then
    MALFUNCTIONS+=("L1: doc.pseudonymize not found")
    print_sub_leaf "demo verify" "💥 doc.pseudonymize not found"
    return 0
  fi
  print_sub_leaf "demo verify" "${#DEMOS[@]} dir(s)"
  local demo vout vstatus survivors reason
  for demo in "${DEMOS[@]}"; do
    vout="$WORKDIR/l1.verify.out"
    vstatus=0
    bash "$verifySkill" --map "$ROSTER" --verify "$demo" > "$vout" 2>&1 || vstatus=$?
    survivors="$(grep -m1 'survivors:' "$vout" | sed -e 's/^.*survivors: //' || true)"
    if [[ "$vstatus" -eq 0 || ( "$vstatus" -eq 2 && -n "$survivors" ) ]]; then
      [[ "$vstatus" -eq 2 ]] && P0=$((P0 + survivors))
      echo "   │     · $(printf '%s' "$demo" | mask_paths) → survivors ${survivors:-0}"
    else
      reason="$(grep -m1 'blocked:' "$vout" | sed -e 's/^.*blocked: //' || true)"
      MALFUNCTIONS+=("L1: demo verify could not run on $demo (${reason:-exit $vstatus})")
      echo "   │     · $(printf '%s' "$demo" | mask_paths) → 💥 could not verify: ${reason:-exit $vstatus}"
    fi
  done
}

######################################################################
# L2 — the publication surface
######################################################################

# a. INDEX vs WORKTREE drift
check_drift() {
  git diff --cached --name-only 2>/dev/null | sort -u > "$WORKDIR/staged.list" || true
  git diff --name-only 2>/dev/null | sort -u > "$WORKDIR/unstaged.list" || true
  comm -12 "$WORKDIR/staged.list" "$WORKDIR/unstaged.list" > "$WORKDIR/drift.list"
  local rows="$WORKDIR/l2a.rows" p leaks=0 drifts=0
  : > "$rows"
  while IFS= read -r p; do
    [[ -n "$p" ]] || continue
    if [[ -f "$SNAP/$p" ]] && grep -qiIF -f "$WORKDIR/roster.real" -- "$SNAP/$p" 2>/dev/null \
      && ! grep -qiIF -f "$WORKDIR/roster.real" -- "$p" 2>/dev/null; then
      printf '%s\t-\t[staged leak — fixed only in the worktree]\n' "$p" >> "$rows"
      leaks=$((leaks + 1))
    else
      printf '%s\t-\t[drift]\n' "$p" >> "$rows"
      drifts=$((drifts + 1))
    fi
  done < "$WORKDIR/drift.list"
  P0=$((P0 + leaks))
  P1=$((P1 + drifts))
  print_sub_branch "a. drift" "$((leaks + drifts)) path(s) staged AND changed after ($leaks staged leak)"
  render_rows "$rows"
}

# b. HISTORY — opt-in, since a full `log -p` is the slow pass
check_history() {
  if [[ "$HISTORY" -eq 0 ]]; then
    print_sub_branch "b. history" "skipped (pass --history)"
    return 0
  fi
  local pats="$WORKDIR/history.pats" flagged="$WORKDIR/history.flagged"
  { printf '%s\n' '@@rt@@ '; cat "$WORKDIR/roster.real"; } > "$pats"
  git log --all --no-color -p --format='@@RT@@ %H%n%an <%ae>%n%B' 2>/dev/null \
    | grep -iF -f "$pats" 2>/dev/null \
    | awk '/^@@RT@@ / { sha = $2; next } { if (sha != "") hit[sha] = 1 } END { for (s in hit) print s }' \
    | sort -u > "$flagged" || true
  local paths="$WORKDIR/history.paths"
  git log --all --name-only --format= 2>/dev/null | sort -u \
    | grep -iF -f "$WORKDIR/roster.real" 2>/dev/null > "$paths" || true
  local commits pathn
  commits="$(count_rows "$flagged")"
  pathn="$(count_rows "$paths")"
  P1=$((P1 + commits + pathn))
  print_sub_branch "b. history" "$commits commit(s) carry a roster value · $pathn historical path(s) name one"
  [[ "$commits" -gt 0 || "$pathn" -gt 0 ]] || return 0

  local ref refs="$WORKDIR/history.refs"
  : > "$refs"
  if [[ "$commits" -gt 0 ]]; then
    while IFS= read -r ref; do
      [[ -n "$ref" ]] || continue
      if git rev-list "$ref" 2>/dev/null | grep -qFx -f "$flagged"; then
        printf '%s\n' "$ref" >> "$refs"
      fi
    done < <(git for-each-ref --format='%(refname)')
  fi
  local line
  while IFS= read -r line; do
    print_sub_row "ref: $(printf '%s' "$line" | mask_paths)"
  done < <(head -n "$MAX_ROWS" "$refs")
  local nrefs; nrefs="$(count_rows "$refs")"
  [[ "$nrefs" -gt "$MAX_ROWS" ]] && print_sub_row "… $((nrefs - MAX_ROWS)) more ref(s)"
  if git rev-parse --verify --quiet refs/remotes/origin/main >/dev/null; then
    if grep -qFx 'refs/remotes/origin/main' "$refs"; then
      print_sub_row "origin/main: CARRIES it — already public if the repo is"
    else
      print_sub_row "origin/main: clean — the exposure is in other refs"
    fi
  else
    print_sub_row "origin/main: absent"
  fi
  print_sub_row "owner decision — a history rewrite cannot be done from here"
}

# c. BUILD ARTIFACT — dist can be stale and carry what the source dropped
check_dist() {
  if [[ -z "$DIST" ]]; then
    print_sub_branch "c. dist" "skipped (no dist dir; --dist DIR to name one)"
    return 0
  fi
  local rows="$WORKDIR/l2c.rows" list="$WORKDIR/dist.list"
  (cd "$DIST" && find . -type f | sed -e 's|^\./||') > "$list"
  { rows_fixed "$DIST" "$WORKDIR/roster.real"; rows_paths "$list"; } > "$rows"
  local n; n="$(count_rows "$rows")"
  P0=$((P0 + n))
  print_sub_branch "c. dist" "$n hit(s) across $(files_in_rows "$rows") file(s) of $(printf '%s' "$DIST" | mask_paths)/ — rebuild before release"
  render_rows "$rows"
}

# d. TRANSFORM DISCLOSURE — a published offset is a published inverse
#
# ⚠️ the magnitude patterns demand DIGITS. a brief that teaches the
#    rule in the abstract ("shifted −N days") must not trip it. the
#    digit-free structure hints go to review, not to a fail.
TRANSFORM_MAGNITUDE=(
  'shift(ed)?[[:space:]]+(by[[:space:]]+)?(-|−|\+)?[0-9]+[[:space:]]*(days?|weeks?|months?|years?)'
  '(-|−|\+)[0-9]+[[:space:]]*days?[[:space:]]+(shift|offset)'
  '(date|day)[[:space:]]+(shift|offset)[[:space:]]*(of|=|:)?[[:space:]]*(-|−|\+)?[0-9]+'
  '(perturbed|nudged|jittered|offset)[[:space:]]+by[[:space:]]+\$?(-|−|\+)?[0-9]'
)
TRANSFORM_HINT=(
  'weekdays?[[:space:]]+(kept|preserved|retained|unchanged)'
  '(fixed|constant|single|same)[[:space:]]+(date[[:space:]]+)?offset'
  'multiples?[[:space:]]+of[[:space:]]+(7|seven)[[:space:]]+days'
)
check_transform() {
  local mag="$WORKDIR/l2d.mag.rows" hint="$WORKDIR/l2d.hint.rows" re
  : > "$mag"; : > "$hint"
  for re in "${TRANSFORM_MAGNITUDE[@]}"; do rows_regex "$SNAP" "$re" >> "$mag"; done
  for re in "${TRANSFORM_HINT[@]}"; do rows_regex "$SNAP" "$re" >> "$hint"; done
  local n h
  n="$(count_rows "$mag")"; h="$(count_rows "$hint")"
  P0=$((P0 + n))
  P2=$((P2 + h))
  print_sub_branch "d. transform" "$n magnitude disclosure(s) · $h structure hint(s) for review"
  render_rows "$mag"
  render_rows "$hint"
}

# e. TWINS — a real value beside its synthetic twin solves the offset
awk_jdn='
  function jdn(y, m, d,   a, yy, mm) {
    a = int((14 - m) / 12); yy = y + 4800 - a; mm = m + 12 * a - 3
    return d + int((153 * mm + 2) / 5) + 365 * yy + int(yy / 4) - int(yy / 100) + int(yy / 400) - 32045
  }
  function jdnOf(s,   t, ymd) { t = s; gsub(/_/, "-", t); split(t, ymd, "-"); return jdn(ymd[1] + 0, ymd[2] + 0, ymd[3] + 0) }
'
check_twins() {
  local dateRe='^[0-9]{4}[-_][0-9]{2}[-_][0-9]{2}$'
  local keys="$WORKDIR/datekeys" variants="$WORKDIR/datevariants" deltas="$WORKDIR/deltas"
  grep -E "$dateRe" "$WORKDIR/roster.real" > "$keys" 2>/dev/null || true
  : > "$variants"
  local key y m d mi di month mon
  local months=(January February March April May June July August September October November December)
  while IFS= read -r key; do
    [[ -n "$key" ]] || continue
    y="${key:0:4}"; m="${key:5:2}"; d="${key:8:2}"
    mi=$((10#$m)); di=$((10#$d))
    [[ "$mi" -ge 1 && "$mi" -le 12 ]] || continue
    month="${months[$((mi - 1))]}"; mon="${month:0:3}"
    {
      printf '%s-%s-%s\n%s_%s_%s\n%s/%s/%s\n%s/%s/%s\n' "$y" "$m" "$d" "$y" "$m" "$d" "$m" "$d" "$y" "$mi" "$di" "$y"
      printf '%s %s, %s\n%s %s, %s\n%s %s %s\n' "$month" "$di" "$y" "$mon" "$di" "$y" "$di" "$month" "$y"
    } | grep -vxF -- "$key" >> "$variants" || true
  done < "$keys"
  sort -u -o "$variants" "$variants"

  local vrows="$WORKDIR/l2e.variant.rows"
  rows_fixed "$SNAP" "$variants" > "$vrows"
  local nv; nv="$(count_rows "$vrows")"
  P0=$((P0 + nv))

  # offsets from the map's date pairs — never printed, only compared
  awk -F'\t' -v re='^[0-9][0-9][0-9][0-9][-_][0-9][0-9][-_][0-9][0-9]$' "$awk_jdn"'
    $1 ~ re && $2 ~ re { dd = jdnOf($2) - jdnOf($1); if (dd < 0) dd = -dd; if (dd > 0) print dd }
  ' "$WORKDIR/roster.pairs" | sort -u > "$deltas"

  local trows="$WORKDIR/l2e.twin.rows"
  : > "$trows"
  if [[ -s "$deltas" ]]; then
    (cd "$SNAP" && grep -rnoIE '[0-9]{4}[-_][0-9]{2}[-_][0-9]{2}' . 2>/dev/null || true) \
      | awk -v df="$deltas" "$awk_jdn"'
          BEGIN { while ((getline x < df) > 0) if (x != "") delta[x + 0] = 1 }
          {
            s = $0; sub(/^\.\//, "", s)
            p = index(s, ":"); file = substr(s, 1, p - 1); rest = substr(s, p + 1)
            q = index(rest, ":"); dt = substr(rest, q + 1)
            j = jdnOf(dt)
            if (!((file SUBSEP j) in seen)) { seen[file, j] = 1; n[file]++; if (n[file] <= 400) list[file, n[file]] = j }
          }
          END {
            for (f in n) {
              lim = n[f] > 400 ? 400 : n[f]; found = 0
              for (a = 1; a <= lim && !found; a++)
                for (b = a + 1; b <= lim && !found; b++) {
                  dd = list[f, a] - list[f, b]; if (dd < 0) dd = -dd
                  if (dd in delta) found = 1
                }
              if (found) printf "%s\t-\t[a date pair spans a mapped offset]\n", f
            }
          }
        ' > "$trows"
  fi
  local nt; nt="$(count_rows "$trows")"
  P2=$((P2 + nt))
  print_sub_branch "e. twins" "$nv real date(s) in another format · $nt file(s) with a date pair on a mapped offset (review) · $(count_rows "$keys") date key(s)"
  render_rows "$vrows"
  render_rows "$trows"
}

# f. ORACLES — a digest of a short real value is a confirmation oracle
have_cmd() { command -v "$1" >/dev/null 2>&1; }
digest_tool() {
  case "$1" in
    sha256)
      if have_cmd sha256sum; then echo "sha256sum"
      elif have_cmd shasum; then echo "shasum -a 256"
      elif have_cmd openssl; then echo "openssl dgst -sha256 -r"; fi ;;
    sha1)
      if have_cmd sha1sum; then echo "sha1sum"
      elif have_cmd shasum; then echo "shasum -a 1"
      elif have_cmd openssl; then echo "openssl dgst -sha1 -r"; fi ;;
    md5)
      if have_cmd md5sum; then echo "md5sum"
      elif have_cmd md5; then echo "md5 -q"
      elif have_cmd openssl; then echo "openssl dgst -md5 -r"; fi ;;
  esac
}
check_oracles() {
  local table="$WORKDIR/oracle.table" pats="$WORKDIR/oracle.pats"
  : > "$table"
  local algo tool algos=() absentAlgos=()
  for algo in md5 sha1 sha256; do
    tool="$(digest_tool "$algo")"
    if [[ -n "$tool" ]]; then algos+=("$algo:$tool"); else absentAlgos+=("$algo"); fi
  done
  if [[ ${#algos[@]} -eq 0 ]]; then
    MALFUNCTIONS+=("L2f: no md5/sha1/sha256 tool on PATH")
    print_sub_branch "f. oracles" "💥 no digest tool found (sha256sum, shasum, md5, openssl)"
    return 0
  fi
  local value form hex label entry cmd
  while IFS= read -r value; do
    [[ -n "$value" ]] || continue
    label="$(printf '%s' "$value" | cut -c1-2)***"
    for form in "$value" "$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')" "$(printf '%s' "$value" | tr '[:lower:]' '[:upper:]')"; do
      for entry in "${algos[@]}"; do
        algo="${entry%%:*}"; cmd="${entry#*:}"
        # with and without a trailed newline — `echo x | sha256sum` is the usual slip
        hex="$(printf '%s' "$form" | $cmd | awk '{ print tolower($1) }')"
        printf '%s\t%s(%s)\n' "${hex:0:12}" "$algo" "$label" >> "$table"
        hex="$(printf '%s\n' "$form" | $cmd | awk '{ print tolower($1) }')"
        printf '%s\t%s(%s)\n' "${hex:0:12}" "$algo" "$label" >> "$table"
      done
    done
  done < "$WORKDIR/roster.real"
  sort -u -o "$table" "$table"
  cut -f1 "$table" | sort -u > "$pats"

  local rows="$WORKDIR/l2f.rows"
  (cd "$SNAP" && grep -rnoiIF -f "$pats" . 2>/dev/null || true) \
    | awk -v tf="$table" '
        BEGIN { while ((getline t < tf) > 0) { split(t, kv, "\t"); lab[kv[1]] = kv[2] } }
        {
          s = $0; sub(/^\.\//, "", s)
          p = index(s, ":"); file = substr(s, 1, p - 1); rest = substr(s, p + 1)
          q = index(rest, ":"); line = substr(rest, 1, q - 1); m = tolower(substr(rest, q + 1))
          printf "%s\t%s\t%s\n", file, line, (m in lab ? lab[m] : "digest")
        }
      ' > "$rows"
  local n; n="$(count_rows "$rows")"
  P0=$((P0 + n))
  local note=""
  [[ ${#absentAlgos[@]} -gt 0 ]] && note=" · no tool for: ${absentAlgos[*]}"
  print_sub_branch "f. oracles" "$n digest(s) of a roster value$note"
  render_rows "$rows"
}

# g. EVIDENCE DIRS — real sources must be ignored AND untracked
check_evidence() {
  local rows="$WORKDIR/l2g.rows" g p demo exempt tag
  : > "$rows"
  for g in "${EVIDENCE[@]}"; do
    git ls-files -- ":(glob)$g" 2>/dev/null | awk '{ printf "%s\t-\t[tracked]\n", $0 }' >> "$rows" || true
    git ls-files --others --exclude-standard -- ":(glob)$g" 2>/dev/null \
      | awk '{ printf "%s\t-\t[untracked, not ignored]\n", $0 }' >> "$rows" || true
  done
  # the declared public demos are the ONE place evidence-shaped paths may live
  local kept="$WORKDIR/l2g.kept"
  : > "$kept"
  while IFS=$'\t' read -r p _l tag; do
    exempt=0
    for demo in ${DEMOS[@]+"${DEMOS[@]}"}; do
      case "$p" in "$demo"/*) exempt=1 ;; esac
    done
    [[ "$exempt" -eq 1 ]] || printf '%s\t-\t%s\n' "$p" "$tag" >> "$kept"
  done < <(sort -u "$rows")
  local n; n="$(count_rows "$kept")"
  P0=$((P0 + n))
  print_sub_branch "g. evidence" "$n path(s) under ${EVIDENCE[*]} outside a declared --demo"
  render_rows "$kept"
}

# h. MONEY — financial position or filed status beside a depicted entity
FIN_RE='(profit|net loss|losses|operating loss|NOL|delinquent|unfiled|e-filed|efiled|balance due|taxable income|carryforward|carry-forward)'
check_money() {
  local rows="$WORKDIR/l2h.rows"
  : > "$rows"
  if [[ ${#ENTITIES[@]} -eq 0 && ${#DEMOS[@]} -eq 0 ]]; then
    print_sub_leaf "h. money" "skipped (no --entity and no --demo to tie terms to)"
    return 0
  fi
  local ents="$WORKDIR/entities" demos="$WORKDIR/demos.list"
  printf '%s\n' ${ENTITIES[@]+"${ENTITIES[@]}"} | tr '[:upper:]' '[:lower:]' | grep . > "$ents" || true
  printf '%s\n' ${DEMOS[@]+"${DEMOS[@]}"} | grep . > "$demos" || true
  (cd "$SNAP" && grep -rniIE -e "$FIN_RE" . 2>/dev/null || true) \
    | awk -v ef="$ents" -v dl="$demos" '
        BEGIN {
          while ((getline e < ef) > 0) if (e != "") { ne++; ent[ne] = e }
          while ((getline d < dl) > 0) if (d != "") { nd++; dem[nd] = d "/" }
        }
        {
          s = $0; sub(/^\.\//, "", s)
          p = index(s, ":"); file = substr(s, 1, p - 1); rest = substr(s, p + 1)
          q = index(rest, ":"); text = tolower(substr(rest, q + 1))
          tied = 0
          for (i = 1; i <= ne; i++) if (index(text, ent[i]) > 0) tied = 1
          for (i = 1; i <= nd; i++) if (index(file, dem[i]) == 1) tied = 1
          if (tied) c[file]++
        }
        END { for (f in c) printf "%d\t%s\n", c[f], f }
      ' | sort -t"$(printf '\t')" -k1,1nr -k2,2 > "$rows"
  local n; n="$(count_rows "$rows")"
  P2=$((P2 + n))
  print_sub_leaf "h. money" "$n file(s) tie a profit/loss/filed-status term to a depicted entity (review)"
  local cnt file shown=0
  while IFS=$'\t' read -r cnt file; do
    [[ "$shown" -ge "$MAX_ROWS" ]] && break
    echo "   │     · $(printf '%s' "$file" | mask_paths)  [$cnt line(s)]"
    shown=$((shown + 1))
  done < "$rows"
  if [[ "$n" -gt "$shown" ]]; then
    echo "   │     · … $((n - shown)) more"
  fi
  return 0
}

layer_l2() {
  echo "   │"
  echo "   ├─ L2 publication surface"
  check_drift
  check_history
  check_dist
  check_transform
  check_twins
  check_oracles
  check_evidence
  check_money
}

######################################################################
# L3 — the blind review. EMIT-ONLY.
#
# ⛔ this skill cannot be the stranger. it holds the roster, the
#    history, and the local folders — all a stranger lacks. a reviewer
#    run from here would read the map and grade what it knows, not what
#    the published set gives away. so it WRITES the prompt, and a fresh
#    brain with only the published list runs it.
######################################################################
write_blind_prompt() {
  local out="$1" count
  count="$(count_rows "$WORKDIR/index.list")"
  mkdir -p "$(dirname -- "$out")"
  {
    cat <<'EOF'
# blind red-team review — dossier from the published set only

you are a stranger with bad intent. you hold ONLY the files listed at the
end of this prompt, exactly as a public clone or an npm install would give
them to you. build the strongest dossier you can.

## constraints

- read ONLY the listed paths. no other file in the repo exists for you
- forbidden: git history, other branches, the reflog, stashes, any
  pseudonym map or roster, gitignored or untracked paths, scratch and temp
  dirs, any local folder outside the list
- no web access. no registry lookups. reason about what a web search
  WOULD return, and say so, but do not run one
- a value that looks real stays masked in your output: first two
  characters, then `***`. your dossier must not become the leak

## output sections

1. **depicted parties** — every corporation and person the set depicts.
   per party: every fact the set states or implies (dates, places, share
   counts, agents, services, amounts, filed status, contacts, habits)
2. **re-identification** — the queries you would run (registry, search,
   social) and an estimate of the anonymity set after each join. name the
   join that collapses it to one — often the author line, the LICENSE, or
   the issue tracker
3. **malicious uses** — per party: knowledge-based-auth answers you now
   hold, pretext calls you could place, filings you could make in their
   name, reputational harm you could do
4. **top 10** — the ten most dangerous facts, ranked by likelihood x impact,
   each with its path
5. **suspected real slips** — any value you believe is real rather than
   synthetic, masked, with its path and why you think so

## the published set
EOF
    echo ""
    echo "$count path(s), from the index (what a commit ships):"
    echo ""
    mask_paths < "$WORKDIR/index.list" | sed -e 's/^/- /'
  } > "$out"
  # ⛔ self-check. the prompt goes to a brain; it must carry no roster value
  if grep -qiF -f "$WORKDIR/roster.real" -- "$out" 2>/dev/null; then
    rm -f -- "$out"
    MALFUNCTIONS+=("L3: the emitted prompt carried a roster value and was deleted")
    return 1
  fi
  return 0
}

layer_l3() {
  echo "   │"
  if [[ -z "$EMIT" ]]; then
    print_tree_branch "L3 blind review" "not emitted (pass --emit-blind FILE) — emit-only by design"
    return 0
  fi
  local shown
  shown="$(rel_to_root "$EMIT")"
  if write_blind_prompt "$EMIT"; then
    print_tree_branch "L3 blind review" "emitted → $shown ($(count_rows "$WORKDIR/index.list") published path(s))"
    echo "   │  └─ emit-only: run it in a fresh brain that holds no map, no history, no folders"
  else
    print_tree_branch "L3 blind review" "💥 not emitted — the prompt failed its own leak check"
  fi
}

######################################################################
# L4 — triage
######################################################################
layer_l4() {
  echo "   │"
  echo "   └─ L4 triage"
  echo "      ├─ P0 fix before release: $P0"
  echo "      ├─ P1 owner decision: $P1"
  echo "      ├─ P2 human review: $P2"
  if [[ "$P1" -gt 0 ]]; then
    echo "      ├─ owner decisions: history rewrite · repo visibility ·"
    echo "      │  unpublish a package version · rotate what can rotate"
  fi
  if [[ ${#MALFUNCTIONS[@]} -gt 0 ]]; then
    local m
    echo "      ├─ 💥 malfunctions: ${#MALFUNCTIONS[@]}"
    for m in "${MALFUNCTIONS[@]}"; do
      echo "      │  · $(printf '%s' "$m" | mask_paths)"
    done
  fi
  echo "      └─ every value above is masked (first two chars + ***)"
}

print_plan() {
  local l3="not requested"
  [[ -n "$EMIT" ]] && l3="emit → $(rel_to_root "$EMIT")"
  local hist="off"
  [[ "$HISTORY" -eq 1 ]] && hist="on"
  print_eagle_header "heres the plan,"
  print_tree_start "publish.redteam"
  print_tree_branch "roster" "$(printf '%s' "$ROSTER" | mask_paths) ($ROSTER_COUNT value(s))"
  print_tree_branch "L1" "roster over the index · pii.scan shapes · verify ${#DEMOS[@]} demo(s)"
  print_tree_branch "L2" "drift · history $hist · dist ${DIST:-off} · transform · twins · oracles · evidence · money"
  print_tree_branch "L3" "$l3"
  print_tree_leaf "mode" "plan — no scan ran"
}

main() {
  parse_args "$@"
  validate

  WORKDIR=$(mktemp -d)
  P0=0; P1=0; P2=0
  MALFUNCTIONS=()
  load_roster
  if [[ "$ROSTER_COUNT" -eq 0 ]]; then
    print_blocked "roster holds no value of 3+ characters: $ROSTER"
    exit 2
  fi

  if [[ "$MODE" == "plan" ]]; then
    print_plan
    exit 0
  fi

  local body="$WORKDIR/report.body"
  {
    build_published_set
    print_tree_branch "roster" "$(printf '%s' "$ROSTER" | mask_paths) ($ROSTER_COUNT value(s))"
    print_tree_branch "published" "$(count_rows "$WORKDIR/index.list") indexed + $(count_rows "$WORKDIR/untracked.list") untracked, not ignored"
    echo "   │"
    layer_l1
    layer_l2
    layer_l3
    layer_l4
  } > "$body"

  if [[ $((P0 + P1)) -gt 0 ]]; then
    print_eagle_header "hold up — this would publish a dox risk"
  elif [[ ${#MALFUNCTIONS[@]} -gt 0 ]]; then
    print_eagle_header "the red team could not finish"
  else
    print_eagle_header "clear skies,"
  fi
  print_tree_start "publish.redteam"
  cat "$body"

  # findings outrank a malfunction: they are actionable, it is not
  if [[ $((P0 + P1)) -gt 0 ]]; then
    exit 2
  fi
  if [[ ${#MALFUNCTIONS[@]} -gt 0 ]]; then
    exit 1
  fi
  exit 0
}

main "$@"
