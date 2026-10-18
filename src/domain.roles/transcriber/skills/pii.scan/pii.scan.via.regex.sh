#!/usr/bin/env bash
######################################################################
# .what = scan a repo scope for PII (ssn, ein, itin, phone, street)
#
# .why  = a commit is the irreversible boundary. once a real SSN lands
#         in a commit object it is pushed, cloned, and cached — and the
#         cheap fix (edit the file) becomes a history rewrite.
#
#         so this fires BEFORE the commit object exists: from the husky
#         pre-commit hook, and from any agent commit path. the CI test
#         is a backstop, not the guard — by the time CI fails, the value
#         already sits in a commit.
#
# ⚠️ the defect this exists for: IRS Form SS-4 field 7b stores an SSN
#    WITHOUT dashes. a [0-9]{3}-[0-9]{2}-[0-9]{4} pattern misses the
#    9-digit run entirely. every numeric detector here matches both the
#    formatted and the unformatted form. a detector that reads only the
#    dashed shape is theatre.
#
# usage:
#   pii.scan.via.regex.sh                            # tracked + untracked
#   pii.scan.via.regex.sh --diffs since-staged       # pre-commit scope
#   pii.scan.via.regex.sh --diffs since-main         # branch scope (CI scope)
#   pii.scan.via.regex.sh --paths-with 'src/**'      # explicit scope
#   pii.scan.via.regex.sh --allow .pii-allow         # default: .pii-allow
#   pii.scan.via.regex.sh --lockfiles                # include lockfiles too
#   pii.scan.via.regex.sh --help
#
# ⚠️ the scope flags are `rhx review`'s, verbatim — --diffs, --paths-with,
#    --paths-wout, --join. one canonical word per concept
#    (rule.require.ubiqlang). the reviewer skill already owns this idea,
#    and the two skills are composed in the same hooks and the same
#    guards, so a private synonym here is a real cost.
#
# guarantee:
#   - never prints a full matched value; prints a masked form
#     (123-**-****) so the scanner's own output cannot become the leak
#   - allowlist is by VALUE, not by file — a file-scoped mute would
#     blind a whole file forever; a value-scoped one costs one
#     deliberate, reviewable line per new number
#   - an allowlist entry matches on its digits, so 666-12-3456 also
#     mutes 666123456
#   - exit 0 clean, exit 1 malfunction, exit 2 constraint (hits found)
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# defaults — the scope flags mirror `rhx review`
DIFFS=""
PATHS_WITH=()
PATHS_WOUT=()
JOIN="intersect"
ALLOW_FILE=".pii-allow"
ROSTER_FILE=""
SKIP_LOCKFILES=1
# how many hit lines the report prints before it truncates
MAX_REPORT_LINES=60

WORKDIR=""
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

print_usage() {
  cat <<'EOF'
🔎 pii.scan — scan a repo scope for PII before it reaches a commit

usage:
  pii.scan.via.regex.sh                        tracked + untracked files
  pii.scan.via.regex.sh --diffs since-staged   only the staged set
  pii.scan.via.regex.sh --diffs since-main     files changed vs origin/main
  pii.scan.via.regex.sh --paths-with 'src/**'  an explicit scope

args:
  --diffs WHICH      since-staged | since-commit | since-main
  --paths-with GLOB  scope to GLOB; repeatable
  --paths-wout GLOB  subtract GLOB from the scope; repeatable
  --join HOW         intersect (default) | union — how --diffs and
                     --paths-with combine
  --allow FILE       allowlist file (default: .pii-allow)
  --roster FILE      literal values to catch by name (e.g. .pii-map)
  --lockfiles        also scan pnpm-lock.yaml / package-lock.json
  --help, -h         show this help

⚠️ the scope flags above are `rhx review`'s, verbatim. one canonical
   word per concept — a private --staged here would be a second word
   for an idea the reviewer skill already named.

detectors:
  ssn      NNN-NN-NNNN and the bare 9-digit run
  ein      NN-NNNNNNN and the bare 9-digit run
  itin     9NN-7N-NNNN / 9NN-8N-NNNN, formatted or bare
  phone    (NNN) NNN-NNNN and NNN-NNN-NNNN
  street   a street line that carries both a street type and a unit
  roster   literal values from --roster, matched case-insensitively

  ssn and ein overlap on the bare 9-digit shape. both get reported; a
  human decides which it is.

  ⭐ a 9-digit FIGURE trips both — an amount, a count, a share total.
     an allowlist entry is usually the WRONG cure there: it mutes that
     shape globally to settle one fixture. where the consumer accepts
     punctuation, write it punctuated (600,000,000) and no detector
     matches at all. reserve .pii-allow for a value that is genuinely
     identifier-shaped, per its own header.

roster:
  a regex cannot answer "is there a person's name here?" — that is
  open-world and needs a brain. but the real question is "is THIS
  person's name here?", which is closed-world and is just a literal
  match. --roster supplies that list, so names, home addresses, and
  derived values (an IRS name control, a DocuSign envelope id) get
  caught exactly, offline, with no new regex.

  reads a doc.pseudonymize map directly: on a TSV line the LEFT field
  is the real value. a plain one-per-line list works too.

  ⛔ the roster is the re-identification key. it must be gitignored;
     the scan refuses to run against one that git tracks.

allowlist:
  .pii-allow holds one value per line, each with a comment saying why
  it is safe. an entry matches on its digits, so one line mutes both
  the formatted and the bare form of the same number.

    # SSA never issues a 666 prefix — permanently synthetic
    666-12-3456

exit:
  0  clean
  1  malfunction
  2  hits found (constraint)

example:
  # what the pre-commit hook runs
  pii.scan.via.regex.sh --diffs since-staged
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      # ⚠️ scope vocabulary is BORROWED from `rhx review`, deliberately.
      #    one canonical word per concept (rule.require.ubiqlang): a
      #    `--staged` here and a `--diffs since-staged` there would be
      #    two words for one idea, and the reviewer skill already owns
      #    the idea. the two are composed in the same guards and the
      #    same hooks, so a synonym is a real cost, not a cosmetic one.
      --diffs)
        DIFFS="${2:-}"
        shift 2
        ;;
      --paths-with)
        PATHS_WITH+=("${2:-}")
        shift 2
        ;;
      --paths-wout)
        PATHS_WOUT+=("${2:-}")
        shift 2
        ;;
      --join)
        JOIN="${2:-}"
        shift 2
        ;;
      --allow)
        ALLOW_FILE="${2:-}"
        shift 2
        ;;
      --roster)
        ROSTER_FILE="${2:-}"
        shift 2
        ;;
      --lockfiles)
        SKIP_LOCKFILES=0
        shift
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

validate() {
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    print_blocked "not inside a git work tree"
    exit 2
  fi
  # the --diffs value set is `rhx review`'s, so a caller who knows one
  # skill can drive the other without a second vocabulary to learn
  if [[ -n "$DIFFS" ]]; then
    case "$DIFFS" in
      since-staged|since-commit|since-main) ;;
      *)
        print_blocked "--diffs must be since-staged, since-commit, or since-main"
        exit 2
        ;;
    esac
  fi
  case "$JOIN" in
    intersect|union) ;;
    *)
      print_blocked "--join must be intersect or union"
      exit 2
      ;;
  esac

  [[ -z "$ROSTER_FILE" ]] && return 0

  if [[ ! -f "$ROSTER_FILE" ]]; then
    print_blocked "roster not found: $ROSTER_FILE"
    exit 2
  fi

  # ⛔ the roster IS the re-identification key — it lists the real
  #    values verbatim. to commit it would hand over, in one file, the
  #    whole set the scanner exists to keep out. so the same refusal
  #    doc.pseudonymize applies to its map applies here.
  if git ls-files --error-unmatch -- "$ROSTER_FILE" &>/dev/null; then
    print_blocked "roster is tracked by git: $ROSTER_FILE"
    echo "   the roster names the real values verbatim. a tracked roster"
    echo "   is a worse leak than the one it prevents — gitignore it."
    exit 2
  fi
  if ! git check-ignore -q -- "$ROSTER_FILE"; then
    print_blocked "roster is not gitignored: $ROSTER_FILE"
    echo "   an untracked roster is one \`git add -A\` from a commit."
    echo "   add it to .gitignore before you point the scanner at it."
    exit 2
  fi
}

######################################################################
# detectors
#
# each numeric shape is an alternation of the FORMATTED form and the
# BARE 9-digit run, so one pattern catches both. the bare branch is the
# whole point — see the header note about SS-4 field 7b.
#
# ⚠️ the separator is NOT written as an optional dash ([0-9]{3}-?...).
#    that looser form also matches a ZIP+4 — 19899-2044 splits as
#    198 + 99 + 2044 and reads as a perfect SSN. every postal address
#    in the repo would then be a hit, the report would cry wolf, and a
#    report nobody reads is worse than no report at all.
#
#    so a separator, where present, must sit where the real format puts
#    it. a number that breaks elsewhere is a different kind of number.
######################################################################
pattern_for() {
  case "$1" in
    ssn)    printf '%s' '\b([0-9]{3}[- ][0-9]{2}[- ][0-9]{4}|[0-9]{9})\b' ;;
    ein)    printf '%s' '\b([0-9]{2}-[0-9]{7}|[0-9]{9})\b' ;;
    itin)   printf '%s' '\b(9[0-9]{2}[- ][78][0-9][- ][0-9]{4}|9[0-9]{2}[78][0-9][0-9]{4})\b' ;;
    phone)  printf '%s' '(\([0-9]{3}\)[[:space:]]?[0-9]{3}-?[0-9]{4}|\b[0-9]{3}-[0-9]{3}-[0-9]{4}\b)' ;;
    street) printf '%s' '\b[0-9]+[[:space:]]+[A-Za-z][A-Za-z.]*([[:space:]]+[A-Za-z][A-Za-z.]*)*[[:space:]]+(Blvd|Street|St|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Way|Ct|Court)\b.*\b(Apt|Suite|Ste|Unit|#)\b' ;;
  esac
}

DETECTORS=(ssn ein itin phone street)

######################################################################
# scope -> the file list to scan
#
# the three inputs compose exactly as they do in `rhx review`:
#
#   --diffs        a change set
#   --paths-with   a glob set
#   --join         how the two combine (intersect by default)
#   --paths-wout   subtracted from whatever the above produced
#
# with neither --diffs nor --paths-with, the scope is the whole tree —
# tracked and untracked. that is the right default for a PII sweep,
# because an untracked file is one `git add -A` away from a commit.
######################################################################
files_from_diffs() {
  case "$DIFFS" in
    since-staged)
      git diff --cached --name-only --diff-filter=ACM
      ;;
    since-commit)
      git diff --name-only --diff-filter=ACM HEAD
      ;;
    since-main)
      # origin/main, not main. a local main drifts behind the real
      # trunk, and a scope drawn from a stale ref quietly drags in
      # files that merged weeks ago
      local base="main"
      git rev-parse --verify --quiet origin/main >/dev/null && base="origin/main"
      git diff --name-only --diff-filter=ACM "$base...HEAD"
      ;;
  esac
}

files_from_paths_with() {
  git ls-files -- "${PATHS_WITH[@]}"
  git ls-files --others --exclude-standard -- "${PATHS_WITH[@]}"
}

files_from_tree() {
  git ls-files
  git ls-files --others --exclude-standard
}

apply_paths_wout() {
  if [[ ${#PATHS_WOUT[@]} -eq 0 ]]; then
    cat
    return 0
  fi
  local excluded="$WORKDIR/excluded.txt"
  {
    git ls-files -- "${PATHS_WOUT[@]}"
    git ls-files --others --exclude-standard -- "${PATHS_WOUT[@]}"
  } | sort -u > "$excluded"
  sort -u | comm -23 - "$excluded"
}

collect_files() {
  local selected="$WORKDIR/selected.txt"

  if [[ -n "$DIFFS" && ${#PATHS_WITH[@]} -gt 0 ]]; then
    local a="$WORKDIR/scope.diffs.txt" b="$WORKDIR/scope.paths.txt"
    files_from_diffs | sort -u > "$a"
    files_from_paths_with | sort -u > "$b"
    if [[ "$JOIN" == "union" ]]; then
      sort -u "$a" "$b" > "$selected"
    else
      comm -12 "$a" "$b" > "$selected"
    fi
  elif [[ -n "$DIFFS" ]]; then
    files_from_diffs | sort -u > "$selected"
  elif [[ ${#PATHS_WITH[@]} -gt 0 ]]; then
    files_from_paths_with | sort -u > "$selected"
  else
    files_from_tree | sort -u > "$selected"
  fi

  apply_paths_wout < "$selected"
}

# .what = record that a file was NOT examined, and why
#
# .why  = a scanner that drops an input on the floor and then reports
#         `files: 0, hits: 0` prints the same green as a real pass. the
#         epistemic states differ completely — "examined and clean" vs
#         "never opened" — and an unread input must never wear the
#         verdict of a read one.
#
# .note = the CAUSE is recorded, not merely a count. a bare `skipped: 12`
#         reads as "lockfiles" and gets waved through; `binary 2` does
#         not. `is_scannable` returns 1 for five distinct reasons and
#         only one of them is a hazard.
note_skip() {
  [[ -n "${SKIP_LOG:-}" ]] || return 0
  printf '%s\t%s\n' "$1" "$2" >> "$SKIP_LOG"
}

# .what = a compact "cause count · cause count" tally of what was skipped
# .why  = one line, ordered by count, so the hazard is legible at a glance
skip_tally() {
  cut -f1 "$SKIP_LOG" | sort | uniq -c | sort -rn \
    | awk '{ printf "%s%s %s", (NR > 1 ? " · " : ""), $2, $1 } END { print "" }'
}

# a file is scannable when it exists, holds text, and is not a
# deliberately-skipped noise source
is_scannable() {
  local file="$1"

  [[ -f "$file" ]] || { note_skip absent "$file"; return 1; }

  # the allowlist names the very values it mutes; to scan it is circular
  [[ "$file" == "$ALLOW_FILE" ]] && { note_skip allowlist "$file"; return 1; }

  # likewise the roster: it names every real value by design, so it
  # would report itself as one hit per entry, every run
  [[ -n "$ROSTER_FILE" && "$file" == "$ROSTER_FILE" ]] && { note_skip roster "$file"; return 1; }

  # lockfile integrity strings are long digit runs; they cry wolf.
  # skipped by default, reachable via --lockfiles
  if [[ "$SKIP_LOCKFILES" -eq 1 ]]; then
    case "$file" in
      *pnpm-lock.yaml|*package-lock.json|*yarn.lock)
        note_skip lockfile "$file"; return 1 ;;
    esac
  fi

  # binary: grep -I treats a binary file as non-matching
  grep -Iq . -- "$file" 2>/dev/null || { note_skip binary "$file"; return 1; }

  return 0
}

######################################################################
# allowlist: keep each entry twice — as written, and as digits only —
# so one line mutes both 666-12-3456 and 666123456
######################################################################
load_allowlist() {
  local out="$WORKDIR/allow.txt"
  : > "$out"
  if [[ -n "$ALLOW_FILE" && -f "$ALLOW_FILE" ]]; then
    local line bare
    while IFS= read -r line || [[ -n "$line" ]]; do
      line="${line%%#*}"
      line="$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
      [[ -z "$line" ]] && continue
      printf '%s\n' "$line" >> "$out"
      bare="$(printf '%s' "$line" | tr -cd '0-9')"
      [[ -n "$bare" ]] && printf '%s\n' "$bare" >> "$out"
    done < "$ALLOW_FILE"
  fi
  printf '%s' "$out"
}

######################################################################
# roster: the CLOSED-WORLD half of the scan
#
# a regex detector answers an open-world question — "is there a
# person's name here?" — which needs a brain and is never certain. but
# that is not the question a repo actually has. the question is "is
# THIS person's name here?", and the roster makes it closed-world: a
# literal string match, exact, offline, reproducible.
#
# that matters because the values a regex CANNOT see — a name, a home
# address without a unit word, an IRS-derived name control, a DocuSign
# envelope id — are the ones that are least rotatable and so cost the
# most when they escape.
#
# the roster reads a doc.pseudonymize map directly: for a TSV line the
# LEFT field is the real value (the right is its synthetic swap, which
# must never be matched on). a plain one-value-per-line list works too.
#
# ⚠️ matched case-INSENSITIVELY on purpose. the same corpus prints a
#    name in three casings, and a case-sensitive sweep reports clean on
#    the two it did not think of.
######################################################################
load_roster() {
  local out="$WORKDIR/roster.txt"
  : > "$out"
  local line value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    value="${line%%$'\t'*}"
    value="$(printf '%s' "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    # a 1-2 char entry would match half the tree; that is a malformed
    # roster, not a detection, so skip rather than cry wolf
    [[ ${#value} -lt 3 ]] && continue
    printf '%s\n' "$value" >> "$out"
  done < "$ROSTER_FILE"
  printf '%s' "$out"
}

scan_file_for_roster() {
  local file="$1" roster="$2" allow="$3"

  [[ -s "$roster" ]] || return 0

  grep -noFif "$roster" -- "$file" 2>/dev/null |
    awk -v file="$file" -v allowfile="$allow" '
      function mask(s,   i, out, c, n) {
        out = ""
        n = length(s)
        for (i = 1; i <= n; i++) {
          c = substr(s, i, 1)
          if (i <= 3)                 out = out c
          else if (c ~ /[0-9A-Za-z]/) out = out "*"
          else                        out = out c
        }
        return out
      }
      BEGIN {
        while ((getline a < allowfile) > 0) {
          if (a != "") allowed[tolower(a)] = 1
        }
        close(allowfile)
      }
      {
        p = index($0, ":")
        if (p == 0) next
        line = substr($0, 1, p - 1)
        val  = substr($0, p + 1)
        if (val == "") next
        # ⚠️ tolower on BOTH sides, because the match above is `grep -i`.
        #    an awk array subscript is an exact string, so a case-sensitive
        #    mute under a case-insensitive match clears exactly the one
        #    letter-case the human happened to type and no other — the
        #    value stays blocked in every other form, and the only cure
        #    available is one allowlist line per form.
        #
        #    ⛔ this is NOT "be case-insensitive everywhere". the regex
        #    detectors mute case-SENSITIVELY and that is correct, because
        #    `scan_file_for` matches with `grep -noE` and no -i. the
        #    property is that a mute agrees with ITS OWN matcher.
        #    clamped by [case18].
        if (tolower(val) in allowed) next
        printf "%s\t%s\t%s\t%s\n", file, line, "roster", mask(val)
      }
    ' || true
}

######################################################################
# scan one file for one detector
# emits: FILE<TAB>LINE<TAB>DETECTOR<TAB>MASKED
######################################################################
scan_file_for() {
  local file="$1" detector="$2" allow="$3"
  local pattern
  pattern="$(pattern_for "$detector")"

  # grep -o with -n yields LINE:MATCH, one record per match
  grep -noE "$pattern" -- "$file" 2>/dev/null |
    awk -v file="$file" -v det="$detector" -v allowfile="$allow" '
      function mask(s,   i, out, c, n) {
        out = ""
        n = length(s)
        for (i = 1; i <= n; i++) {
          c = substr(s, i, 1)
          if (i <= 3)                 out = out c
          else if (c ~ /[0-9A-Za-z]/) out = out "*"
          else                        out = out c
        }
        return out
      }
      function digits(s,   i, out, c, n) {
        out = ""
        n = length(s)
        for (i = 1; i <= n; i++) {
          c = substr(s, i, 1)
          if (c ~ /[0-9]/) out = out c
        }
        return out
      }
      BEGIN {
        while ((getline a < allowfile) > 0) {
          if (a != "") allowed[a] = 1
        }
        close(allowfile)
      }
      {
        # split once on the first colon: grep -n prefixes LINE:
        p = index($0, ":")
        if (p == 0) next
        line = substr($0, 1, p - 1)
        val  = substr($0, p + 1)
        if (val == "") next
        if (val in allowed) next
        d = digits(val)
        if (d != "" && d in allowed) next
        printf "%s\t%s\t%s\t%s\n", file, line, det, mask(val)
      }
    ' || true
}

######################################################################
# report
######################################################################
scope_label() {
  local parts=()
  [[ -n "$DIFFS" ]] && parts+=("diffs $DIFFS")
  [[ ${#PATHS_WITH[@]} -gt 0 ]] && parts+=("paths-with ${PATHS_WITH[*]}")
  if [[ ${#parts[@]} -eq 2 ]]; then
    parts=("${parts[0]} $JOIN ${parts[1]}")
  fi
  [[ ${#parts[@]} -eq 0 ]] && parts=("tree (tracked + untracked)")
  [[ ${#PATHS_WOUT[@]} -gt 0 ]] && parts+=("minus ${PATHS_WOUT[*]}")
  printf '%s' "${parts[*]}"
}

# .what = report what was skipped, and warn loudly when a binary was
# .why  = `files: N` counts only what was OPENED. without this line a
#         reader cannot tell N-of-N from N-of-N+12, and the skipped set
#         is exactly where an unexamined document hides.
report_skips() {
  local skipped
  skipped=$(wc -l < "$SKIP_LOG" | tr -d ' ')
  [[ "$skipped" -gt 0 ]] || return 0

  print_tree_branch "skipped" "$skipped ($(skip_tally)) — not judged, only never opened"

  local binaries
  binaries=$(cut -f1 "$SKIP_LOG" | grep -c '^binary$' || true)
  [[ "$binaries" -gt 0 ]] || return 0

  echo "   │  └─ ⚠️ a binary carries no text for a regex to read. these"
  echo "   │     $binaries file(s) were NOT scanned — open them by hand,"
  echo "   │     or re-run with --via brain, which can see a document."
}

# .what = a per-detector tally for the header, e.g. "roster 104 · ein 1"
# .why  = the detail below renders a PATH-ORDERED PREFIX, so the rows a
#         reader sees are not a sample of the whole. this tally is the one
#         line that describes EVERY hit — the ones no row shows too.
#         without it the header carries the verdict (blocked or clear) but
#         never the triage (are any of these real?) — and triage is the
#         entire job of a sweep.
hit_tally() {
  local hits="$1"
  cut -f3 "$hits" | sort | uniq -c | sort -k1,1nr -k2,2 | awk '
    { part[NR] = $2 " " $1 }
    END {
      out = ""
      for (i = 1; i <= NR; i++) out = out (i > 1 ? " · " : "") part[i]
      printf "%s", out
    }
  '
}

report_hits() {
  local hits="$1" filecount="$2"
  local hitcount
  hitcount=$(wc -l < "$hits" | tr -d ' ')

  if [[ "$hitcount" -eq 0 ]]; then
    print_eagle_header "clear skies,"
    print_tree_start "pii.scan"
    print_tree_branch "scope" "$(scope_label)"
    print_tree_branch "files" "$filecount"
    report_skips
    print_tree_leaf "hits" "0"
    return 0
  fi

  local filesWithHits
  filesWithHits=$(cut -f1 "$hits" | sort -u | wc -l | tr -d ' ')

  print_eagle_header "hold up — that carries PII"
  print_tree_start "pii.scan"
  print_tree_branch "scope" "$(scope_label)"
  print_tree_branch "files" "$filecount"
  report_skips
  print_tree_branch "hits" "$hitcount across $filesWithHits file(s) ($(hit_tally "$hits"))"
  echo "   │"

  # cap the detail — but FLOOR it first.
  #
  # a report of thousands of lines is not read, and an unread report
  # protects nobody. the cap ALONE, though, renders a PATH-ORDERED PREFIX:
  # whichever files sort last get no row at all, so a whole file can be
  # counted in the header and never appear on the page.
  #
  # ⛔ observed 2026-08-31: a real survivor sat in a file that sorted last,
  #    behind ~100 benign roster collisions on an ordinary English word. a
  #    sweep read the rendered rows, classified each one correctly, and
  #    recorded the scope clean. the false positives were not noise — they
  #    were the mechanism that spent the budget.
  #
  # so: every file with a hit is guaranteed ONE row, and the rest of the
  # budget is spent in path order on the extra rows. a file can lose its
  # detail; a file can never lose its presence.
  local budget=$MAX_REPORT_LINES
  [[ "$filesWithHits" -gt "$budget" ]] && budget=$filesWithHits
  local extra=$((budget - filesWithHits))

  local shown=0
  local current=""
  local file line det masked
  while IFS=$'\t' read -r file line det masked; do
    if [[ "$file" != "$current" ]]; then
      [[ -n "$current" ]] && echo "   │"
      echo "   ├─ $file"
      current="$file"
    else
      # a later row of a file already on the page — only if budget is left
      [[ "$extra" -gt 0 ]] || continue
      extra=$((extra - 1))
    fi
    printf '   │  ├─ L%-6s %-7s %s\n' "$line" "$det" "$masked"
    shown=$((shown + 1))
  done < <(sort -t"$(printf '\t')" -k1,1 -k2,2n "$hits")

  if [[ "$hitcount" -gt "$shown" ]]; then
    echo "   │"
    echo "   ├─ … $((hitcount - shown)) more hit(s) not shown"
    echo "   │  ├─ every file with a hit has a row above — no file is hidden"
    echo "   │  └─ narrow the scope with --paths-with to see every row"
  fi

  echo "   │"
  echo "   └─ fix each, or add the value to $ALLOW_FILE with a reason"
  echo ""
  echo "      the values above are masked on purpose — this output must"
  echo "      not become the leak. open the file at the line to see it."
}

main() {
  parse_args "$@"
  validate

  WORKDIR=$(mktemp -d)
  local allow roster hits files filecount file detector
  allow="$(load_allowlist)"
  roster=""
  [[ -n "$ROSTER_FILE" ]] && roster="$(load_roster)"
  hits="$WORKDIR/hits.tsv"
  files="$WORKDIR/files.txt"
  SKIP_LOG="$WORKDIR/skipped.tsv"
  : > "$hits"
  : > "$SKIP_LOG"

  collect_files | sort -u > "$files"

  filecount=0
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    is_scannable "$file" || continue
    filecount=$((filecount + 1))
    for detector in "${DETECTORS[@]}"; do
      scan_file_for "$file" "$detector" "$allow" >> "$hits"
    done
    [[ -n "$roster" ]] && scan_file_for_roster "$file" "$roster" "$allow" >> "$hits"
  done < "$files"

  report_hits "$hits" "$filecount"

  local hitcount
  hitcount=$(wc -l < "$hits" | tr -d ' ')
  [[ "$hitcount" -eq 0 ]] || exit 2
}

main "$@"
