#!/usr/bin/env bash
######################################################################
# .what = ask a brain, through `rhx review`, whether a diff carries PII
#         that the deterministic scanner structurally cannot see
#
# .why  = a regex answers "does this match this shape?". it cannot
#         answer the two questions that decide a real leak:
#
#           1. is this value REAL, or a synthetic fixture? identical
#              shape, opposite verdict.
#           2. do these individually-harmless facts, TOGETHER, name one
#              person? {ZIP, gender, DOB} is a reported near-unique key
#              and not one of the three is PII on its own.
#
#         so `pii.scan` catches the shapes and this catches the sense.
#         both run before the commit object exists, because after the
#         push there is no remedy — an SSN cannot be rotated.
#
# ⚠️ THIS LAYER CAN ONLY ADD BLOCKS, NEVER SUBTRACT ONE.
#    `pii.scan` runs first and its exit 2 is final; this runs only on a
#    set the scanner already called clean. so a wrong "clean" from a
#    brain never overrides a real hit — at worst it fails to catch what
#    the regexes already missed, which is exactly the prior baseline.
#    that sequence is what makes a probabilistic check safe at a gate
#    that blocks.
#
# ⛔ AN API BRAIN, THROUGH `rhx review` — NOT AN ENROLLED CLONE.
#    `rhx enroll claude` spawns a Claude Code clone, and a clone carries
#    a cwd jail. twice that jail turned a CLEAN tree into a BLOCKED
#    commit: the reviewer stalled to ask permission for a path outside
#    its sandbox, emitted no numeric verdict, and the gate — correctly,
#    per contract.reviewer-output — scored the unreadable answer a
#    MALFUNCTION.
#
#    the fix is the brain KIND, never the hook stage. an API brain is a
#    plain completion call: no tools, no filesystem, so no path to be
#    denied and no permission to stall on. THE GATE STAYS AT COMMIT —
#    after a push there is no remedy, and an SSN cannot be rotated.
#
# ⚠️ ONE brain, not three. a union of three catches more and costs three
#    times the latency and spend at every commit. `--brain` is
#    repeatable, so the union is one flag away when a tree warrants it.
#
# ⚠️ the role's briefs arrive as --refs. an enrolled clone booted them;
#    an API brain boots none of them, so the same files are handed to
#    `rhx review`, which reads them off disk on every run. that keeps
#    the reviewer current with the briefs rather than with a hand-copied
#    fraction of them.
#
# usage:
#   pii.scan.via.brain.sh --diffs since-staged
#   pii.scan.via.brain.sh --diffs since-main
#   pii.scan.via.brain.sh --diffs since-staged --brain 'anthropic/claude/haiku'
#   pii.scan.via.brain.sh --diffs since-staged --mode plan
#
# options:
#   --diffs WHICH   since-staged | since-commit | since-main
#   --paths-with G  accepted and dropped; the brain pass reviews a diff
#   --brain SLUG    a brain to ask; repeatable. defaults to one
#   --rubric PATH   the rules that focus the reviewer
#   --mode MODE     plan | apply (default apply)
#   --help, -h      show this help
#
# ⚠️ --diffs is `rhx review`'s flag, with `rhx review`'s value set. one
#    canonical word per concept (rule.require.ubiqlang) — the reviewer
#    skill named this idea first, and a private synonym here would cost
#    every caller that drives both.
#
# guarantee:
#   - a reviewer that cannot run is a MALFUNCTION, never a pass. an
#     unreadable verdict blocks, per contract.reviewer-output — "the
#     scan could not run" and "the scan found no PII" must never look
#     alike at a gate where a miss is unrecoverable
#   - a SKIPPED review is a malfunction too. `rhx review` skips when its
#     rules glob matches zero files, and a skip prints the same
#     `0 blockers / 0 nitpicks` as a clean pass. the one discriminator
#     is the `logs:` line: a skip writes no logs, so it advertises none.
#     this skill demands that line, so a skip can never read as a pass
#   - the verdict is read from the reviewer json (`<logs>/output.response.json`:
#     `.blockers | length`, `.nitpicks | length`), never from stdout. a
#     staged path like `blocker/5.x.md` is echoed to stdout and must
#     never read as a count. an absent, unparseable, or non-array json
#     is a malfunction, with its cause named
#   - an empty scope is a clean pass, not a malfunction
#   - exit 0 clean, exit 1 malfunction, exit 2 hits (constraint)
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

DIFFS=""
BRAINS=()
RUBRIC="$SCRIPT_DIR/rubric/rule.forbid.pii-in-a-diff.md"
MODE="apply"

# ⚠️ the transcriber's own practice briefs, handed to the reviewer as
#    reference supplies. an enrolled clone booted these; an API brain
#    boots none of them, so `rhx review` reads them off disk instead.
#
#    the glob matters more than the list: a brief added tomorrow is
#    picked up with no edit here, so the reviewer cannot drift behind
#    the rules it is meant to enforce.
REFS="$SCRIPT_DIR/../../briefs/practices/rule.*.md"

# fall back to the rubric when the role ships no practice rules yet.
# `rhx review` refuses a refs glob that matches zero files, so an absent
# briefs dir would turn every commit into a malfunction.
if ! compgen -G "$REFS" >/dev/null; then
  REFS="$SCRIPT_DIR/rubric/rule.*.md"
fi

# one by default.
#
# ⚠️ `anthropic/claude/opus` is an ALIAS THAT MOVES — upstream pins it to
#    the newest opus, so this gate auto-upgrades on their release with no
#    edit here. that is the intent: the strongest available reviewer, on
#    the one check whose miss is permanent.
#
#    it is an API brain (`○` in `rhx review --help`), never a repl brain
#    (`↻`). a repl brain re-introduces the cwd jail this skill moved off.
DEFAULT_BRAINS=(
  "anthropic/claude/opus"
)

WORKDIR=""
######################################################################
# .what = remove the temp workdir on exit
# .why  = returns 0 so a cleanup failure never masks the real exit code
######################################################################
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

######################################################################
# .what = print the --help text
# .why  = flags, defaults, and exit codes, on demand
######################################################################
print_usage() {
  cat <<'EOF'
🧠 pii.scan --via brain — ask a brain whether a diff carries PII

usage:
  pii.scan.via.brain.sh --diffs since-staged   review the staged set
  pii.scan.via.brain.sh --diffs since-main     review a branch range

options:
  --diffs WHICH   since-staged | since-commit | since-main
  --brain SLUG    a brain to ask; repeatable
  --rubric PATH   the rules to grade against
  --mode MODE     plan | apply (default apply)
  --help, -h      show this help

⚠️ --diffs is `rhx review`'s flag, verbatim. one word per concept.

why a brain, when pii.scan already ran:
  a regex cannot tell a real SSN from a synthetic fixture — same
  shape, opposite verdict. and it cannot see a quasi-identifier: a
  ZIP, a gender, and a birth date are each harmless and together
  name one person. those are the misses that matter, because a
  name or a birth date can never be rotated.

  this layer can only ADD blocks. pii.scan runs first and its
  verdict is final, so a brain that says "clean" can never wave
  through a hit the scanner already caught.

brains:
  one by default: anthropic/claude/opus, an API brain. --brain is
  repeatable, and several are run in parallel with their results
  UNIONED — any blocker from any reviewer blocks.

  an API brain has no filesystem, so it can never stall to ask
  permission for a path outside a sandbox. that is why this gate
  can run at pre-commit without a privilege prompt.

exit:
  0  clean
  1  malfunction (a reviewer could not run — this BLOCKS)
  2  hits (constraint)
EOF
}

######################################################################
# .what = fail fast when a flag that takes a value has none
# .why  = `shift 2` past the last argument dies under `set -e` with no
#         message, and a next flag read as the value hides the error
######################################################################
need_value() {
  local flag="$1"
  local value="${2-}"
  if [[ -z "$value" || "$value" == -* ]]; then
    print_blocked "✋ ConstraintError: $flag needs a value. run --help for the values it takes"
    exit 2
  fi
}

######################################################################
# .what = close a quoted tree whose last lines a filter removed
# .why  = the tail drops the reviewer's `summary` header and counts, so
#         its last surviving child would end on an open `├─`. trailing
#         spacer lines go, and the last child closes on `└─`
######################################################################
as_tree_tail_closed() {
  awk '
    { lines[NR] = $0 }
    END {
      last = NR
      while (last > 0 && lines[last] ~ /^[[:space:]│]*$/) last--
      for (i = 1; i <= last; i++) {
        line = lines[i]
        if (i == last) sub(/├─/, "└─", line)
        print line
      }
    }
  '
}

######################################################################
# .what = read the flags into DIFFS, BRAINS, RUBRIC, MODE
# .why  = the guard ahead of validate(); unknown flags block at exit 2
######################################################################
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --diffs)
        need_value "$1" "${2-}"
        DIFFS="${2:-}"
        shift 2
        ;;
      --brain)
        need_value "$1" "${2-}"
        BRAINS+=("${2:-}")
        shift 2
        ;;
      --rubric)
        need_value "$1" "${2-}"
        RUBRIC="${2:-}"
        shift 2
        ;;
      # forwarded by the dispatcher, and meaningless to a diff review.
      # accept and drop, rather than reject a flag the caller could not
      # have known to withhold
      --paths-with|--paths-wout|--join|--allow|--roster)
        shift 2
        ;;
      --lockfiles)
        shift
        ;;
      --mode)
        need_value "$1" "${2-}"
        MODE="${2:-}"
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these, ignore
        shift 2
        ;;
      -*)
        print_blocked "✋ ConstraintError: unknown option: $1. run --help for the flags"
        exit 2
        ;;
      *)
        print_blocked "✋ ConstraintError: unexpected argument: $1. run --help for the flags"
        exit 2
        ;;
    esac
  done

  # ⚠️ a full `if`, deliberately, NOT `[[ cond ]] && action`. as the
  #    LAST statement of a function the short-circuit form returns the
  #    status of the test, so a FALSE condition returns 1 — and under
  #    `set -e` the caller then dies with no message on either stream.
  #    that is what makes it dangerous rather than merely wrong: an
  #    empty stdout plus an empty stderr plus exit 1 reads exactly like
  #    a gate that blocked, so the failure hides inside the shape of
  #    the intended behavior.
  if [[ ${#BRAINS[@]} -eq 0 ]]; then
    BRAINS=("${DEFAULT_BRAINS[@]}")
  fi
}

validate() {
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    print_blocked "✋ ConstraintError: not inside a git work tree. run from inside the repo"
    exit 2
  fi
  if [[ -z "$DIFFS" ]]; then
    print_blocked "✋ ConstraintError: needs a scope: --diffs since-staged|since-commit|since-main"
    exit 2
  fi
  case "$DIFFS" in
    since-staged|since-commit|since-main) ;;
    *)
      print_blocked "✋ ConstraintError: --diffs must be since-staged, since-commit, or since-main"
      exit 2
      ;;
  esac
  if [[ ! -f "$RUBRIC" ]]; then
    # ⚠️ an absent rubric would make every reviewer grade against
    #    no rules and return a clean 0/0 — a silent pass at the gate
    print_blocked "💥 MalfunctionError: rubric not found; pass --rubric PATH, or reinstall the role package so its rubric ships with it. looked at: $RUBRIC"
    exit 1
  fi
  # the staged paths, the log dir, and the report are repo-relative, so
  # the skill runs from the repo top. a caller's relative --rubric is
  # made absolute first, so the move never loses it
  RUBRIC="$(cd "$(dirname -- "$RUBRIC")" && pwd)/$(basename -- "$RUBRIC")"
  [[ "$REFS" == /* ]] || REFS="$PWD/$REFS"
  cd "$(git rev-parse --show-toplevel)" || {
    print_blocked "💥 MalfunctionError: could not enter the repo top. run from inside the repo"
    exit 1
  }

  case "$MODE" in
    plan|apply) ;;
    *)
      print_blocked "✋ ConstraintError: --mode must be plan or apply"
      exit 2
      ;;
  esac
  if [[ "$MODE" == "apply" ]] && ! command -v jq >/dev/null 2>&1; then
    # ⚠️ the verdict is read from the reviewer json, and jq reads it. with
    #    no jq every read would fail as "unparseable" — a cause that sends
    #    a human to hunt a corrupt file that does not exist
    print_blocked "💥 MalfunctionError: jq not found: the verdict is read from the reviewer json with jq. install jq, then retry"
    exit 1
  fi

  # with no `rhx` the review exits 127 and prints no logs line, which reads
  # as a locked keyrack. name the absent tool instead, before any ask
  if [[ "$MODE" == "apply" ]] && ! command -v rhx >/dev/null 2>&1; then
    print_blocked "💥 MalfunctionError: rhx not found: the brain pass asks through rhx review. run pnpm install so node_modules/.bin holds rhx, or put rhx on PATH, then retry"
    exit 1
  fi
}

diff_base() {
  # origin/main, not main. a local main drifts behind the real trunk,
  # and a scope drawn from a stale ref quietly drags in files that
  # merged weeks ago
  local base="main"
  git rev-parse --verify --quiet origin/main >/dev/null && base="origin/main"
  printf '%s' "$base"
}

collect_files() {
  case "$DIFFS" in
    since-staged) git diff --cached --name-only --diff-filter=ACMR ;;
    since-commit) git diff --name-only --diff-filter=ACMR HEAD ;;
    since-main)   git diff --name-only --diff-filter=ACMR "$(diff_base)...HEAD" ;;
  esac
}

scope_label() {
  printf '%s' "diffs $DIFFS"
}

# .what = name the files NO pass has read, and only when there are some
#
# .why  = a line that prints on every run is noise, and noise trains a
#         reader to skim past the one run where it mattered. the same
#         reason `[case15]` of the regex suite asserts the skip line is
#         ABSENT on an all-text scan.
#
# ⛔ A BINARY IS THE ONE THING NEITHER PASS SEES.
#
#    every text file reaches a gate twice: the regexes read it, and it
#    appears in the diff this pass grades. a binary reaches neither —
#    `grep -I` refuses to open it upstream, and `git diff` emits one
#    line, "Binary files a/x and b/x differ", which names no value.
#
# ⚠️ THE PRIOR FORM ASKED THE REVIEWER TO OPEN THEM. an enrolled clone
#    had a read tool; an API brain has no filesystem, so that
#    instruction is one it CANNOT obey — and an unfulfillable
#    instruction at a gate is worse than an absent one, because the
#    report then claims a check that never happened.
#
#    so the ask is replaced by a COUNT, deterministically, from this
#    skill. it is the same trade `is_scannable` makes in the regex pass:
#    a prompt makes examination LIKELY, a counter makes blindness
#    VISIBLE. bank the second.
#
# ⚠️ it does NOT block. a staged PDF is ordinary, and a gate that
#    refuses every one of them is a gate that gets bypassed within a
#    day. the remedy is named instead, so the human can act on it.
#
# .note = one function for three call sites on purpose. three copies of
#         this is three chances for them to disagree about one number.
# .what = the reason `rhx review` drops this path from its scope, or naught
# .why  = a lockfile is cut by --paths-wout, and a dir (a staged dir
#         symlink, a submodule) is never a target file upstream. a set
#         made only of such paths is clean, never an empty-scope refusal
as_skip_kind_of_review() {
  local f="$1" glob
  [[ -d "$f" ]] && { printf 'dir'; return 0; }
  for glob in "${LOCKFILE_GLOBS[@]}"; do
    [[ "$(basename -- "$f")" == "${glob##*/}" ]] && { printf 'lockfile'; return 0; }
  done
  return 0
}

# .what = name each path the brain is never handed, and why
# .why  = a counter makes blindness visible. the label and the tally match
#         the regex pass's `skipped: N (lockfile N)`, so one concept reads
#         one way across both passes
print_skipped_branch() {
  local n="$1" listFile="$2" tally
  [[ "$n" -gt 0 ]] || return 0
  tally="$(cut -f1 "$listFile" | sort | uniq -c | sort -rn \
    | awk '{ printf "%s%s %s", (NR > 1 ? " · " : ""), $2, $1 }')"
  print_tree_branch "skipped" "$n ($tally) — never sent to the brain"
  cut -f2 "$listFile" | while IFS= read -r f; do
    echo "   │  · $f"
  done
  echo "   │"
}

# .what = remove every artifact but the figures from each log dir a review wrote
# .why  = once read, the prompt is a copy of what this gate contains.
#         only a dir at upstream's own known shape is touched; the figures
#         stay for upstream's spend meter
del_content_of_review_logs() {
  local dir file kept name figure
  for dir in "$@"; do
    [[ "$dir" =~ ^\.log/bhrain/review/[^/]+$ && -d "$dir" ]] || continue
    for file in "$dir"/* "$dir"/.[!.]*; do
      [[ -f "$file" ]] || continue
      name="$(basename -- "$file")"
      kept=""
      for figure in "${ARTIFACTS_OF_FIGURES[@]}"; do
        [[ "$name" == "$figure" ]] && kept=1
      done
      [[ -n "$kept" ]] || rm -f -- "$file"
    done
  done
}

# .what = the log dir a review names, off its last `├─ logs: ` line
# .why  = the json path is read off stdout, so an echoed path ahead of the
#         summary must never outrank the summary's own line. one decode, so
#         the read and the prune can never disagree on which dir it is
as_logs_dir_of_review() {
  grep -F "$ANCHOR_OF_LOGS_LINE" "$1" 2>/dev/null | tail -n 1 | sed -E "s/.*$ANCHOR_OF_LOGS_LINE//; s/[[:space:]]+\$//" || true
}

print_binaries_branch() {
  local n="$1" listFile="${2:-}" f
  [[ "$n" -gt 0 ]] || return 0
  print_tree_branch "unread" "$n — no pass has looked inside these"
  if [[ -n "$listFile" && -s "$listFile" ]]; then
    while IFS= read -r f; do
      echo "   │  · $f"
    done < "$listFile"
    echo "   │"
    echo "   │  a regex cannot read them and the diff does not carry them."
    echo "   │  to put them under both gates: transcribe, then stage the"
    echo "   │  transcript —"
    echo "   │     rhx pdf.transcribe <file> --into <file>.md"
    echo "   │  otherwise, look at them yourself before you commit."
  fi
}

# the keyrack key a brain's provider reads, e.g.
#   anthropic/claude/opus      → ANTHROPIC_API_KEY
#   openrouter/deepseek/flash  → OPENROUTER_API_KEY
asBrainKeyName() {
  local provider="${1%%/*}"
  printf '%s_API_KEY' "$(printf '%s' "$provider" | tr '[:lower:]-' '[:upper:]_')"
}

# a reviewer's slug, flattened for use in a filename
brain_slug() {
  printf '%s' "$1" | tr '/' '-'
}

# the upstream contract this gate reads, named once. each literal is
# pinned against the installed rhachet-roles-bhrain by the integration
# suite ([case25]), so an upstream rename fails a test, not a commit.
ANCHOR_OF_LOGS_LINE='├─ logs: '
NAME_OF_VERDICT_JSON='output.response.json'
REFUSAL_OF_ZERO_SCOPE='combined scope resolves to zero files'
REFUSAL_OF_OVERFLOW='prompt exceeds 75% of context window'

# the exit code `rhx review` uses for a refusal it prints instead of a run
EXIT_OF_REFUSAL=2

# lockfiles, cut from the review scope. each holds package names and
# hashes, never a person; `pnpm-lock.yaml` alone measured ~90k tokens,
# which pushed a routine commit past the opus window. the regex pass
# skips them by default too.
LOCKFILE_GLOBS=('**/pnpm-lock.yaml' '**/package-lock.json' '**/yarn.lock')

# the log artifacts a clean read keeps: args, scope, metrics, and token
# counts hold only paths and figures, and upstream's spend meter reads
# them. every other file goes, so an artifact upstream adds later — which
# may hold the staged diff — is removed by default, never kept by default.
ARTIFACTS_OF_FIGURES=('input.args.json' 'input.scope.json' 'input.scope.debug.json' 'metrics.compiled.json' 'metrics.realized.json' 'metrics.expected.json' 'tokens.expected.json' 'tokens.expected.md')

# a jq program: empty on a well-shaped verdict, else one fault per key, e.g.
#   "is null, not an object"
#   ".blockers is number, not an array; .nitpicks is absent"
JQ_VERDICT_SHAPE_FAULT='
  def fault($k):
    if has($k) | not then "." + $k + " is absent"
    elif (.[$k] | type) != "array" then "." + $k + " is " + (.[$k] | type) + ", not an array"
    else empty end;
  if type != "object" then "is " + type + ", not an object"
  else [fault("blockers"), fault("nitpicks")] | join("; ")
  end'

######################################################################
# read one review's verdict off the json it wrote. emits one line, in
# one of three shapes:
#   OK<TAB>BLOCKERS<TAB>NITPICKS    the verdict was read
#   RETRY<TAB>KIND<TAB>CAUSE        unread; a second ask may change it
#   FIXED<TAB>KIND<TAB>CAUSE        unread; a second ask returns the same
# KIND picks the recovery hint: key | capture | contract | scope | overflow | refusal.
# every field is non-empty, so `read` never collapses one away.
#
# ⛔ THE VERDICT COMES FROM output.response.json, NEVER FROM STDOUT.
#    stdout is a human summary that also echoes staged paths, rule
#    names, and reviewer prose, so any digit in it can sit beside the
#    word "blocker": a staged `blocker/5.briefs.short.md` reads as 5
#    over a clean review, and `blocker/0…` ahead of a real `2 blockers`
#    reads as 0 — a fail OPEN. the json is the one object `rhx review`
#    both writes to disk and tallies its own summary from
#    (`blockers.length`), so no staged text can reach it.
#
# ⛔ THE `logs:` LINE IS THE SKIP DISCRIMINATOR, and also the
#    pointer to the json. a skip prints the same `0 blockers / 0
#    nitpicks` as a clean pass and writes no log dir, so it advertises
#    no `logs:` line. the LAST `├─ logs: ` line is read, anchored on its
#    tree glyph, because `rhx review` prints it in its closing summary,
#    after any echoed path.
#
# ⚠️ every unread state is UNREAD, never 0/0 — absent, unparseable, or
#    a json whose fields are not arrays. the shape check comes FIRST:
#    `jq '.blockers | length'` on null is 0, which would read a
#    reshaped json as clean. each state names its own cause, because
#    "the tool changed" and "the run died" need different fixes.
######################################################################
get_verdict_of_review() {
  local raw="$1" exitCode="$2"
  local logs json shapeFault

  # a capture the skill cannot read is its own cause, not a skip.
  # untested on purpose: the skill's own redirect writes this file, so
  # only a full or yanked temp dir makes it unreadable
  if [[ ! -r "$raw" ]]; then
    printf 'RETRY\tcapture\t%s\n' "review capture unreadable at $raw"
    return 0
  fi

  # a skip writes no log dir, so it prints no logs line; no match is not an error
  logs="$(as_logs_dir_of_review "$raw")"

  # with no logs line, the exit code says whether rhx review refused. a
  # refusal recurs on a second ask; its own header names the cause, and
  # two known headers pick a sharper hint. read only then, so no echoed
  # text outranks a written json
  if [[ -z "$logs" ]]; then
    if [[ "$exitCode" == "$EXIT_OF_REFUSAL" ]]; then
      local header
      # the class is read to find the header, then dropped: the cause line
      # carries one label, and the evidence tail below quotes the header whole
      header="$(grep -m1 -oE 'ConstraintError: .*' "$raw" | sed -E 's/^ConstraintError: //' | cut -c1-160 || true)"
      if [[ "$header" == *"$REFUSAL_OF_ZERO_SCOPE"* ]]; then
        printf 'FIXED\tscope\t%s\n' "rhx review dropped every staged path from its scope ($REFUSAL_OF_ZERO_SCOPE)"
        return 0
      fi
      if [[ "$header" == *"$REFUSAL_OF_OVERFLOW"* ]]; then
        printf 'FIXED\toverflow\t%s\n' "the staged diff overflows the review brain ($REFUSAL_OF_OVERFLOW)"
        return 0
      fi
      if grep -qiE 'keyrack|api.?key|credential' <<< "$header"; then
        printf 'FIXED\tkey\t%s\n' "rhx review refused: ${header:-no header}"
        return 0
      fi
      printf 'FIXED\trefusal\t%s\n' "rhx review refused: ${header:-no header}"
      return 0
    fi
    printf 'RETRY\tkey\t%s\n' "no logs: line — the review skipped, or crashed before it wrote logs"
    return 0
  fi

  # the verdict json lives in that log dir. name what the dir holds, so
  # a renamed artifact reads apart from a run that died before it wrote
  json="$logs/$NAME_OF_VERDICT_JSON"
  if [[ ! -f "$json" ]]; then
    local held
    held="$(ls -A "$logs" 2>/dev/null | tr '\n' ' ' || true)"
    held="${held% }"
    # an output.* file beside an absent json is a rename upstream; it recurs
    if grep -qE '(^| )output\.' <<< "$held"; then
      printf 'FIXED\tcontract\t%s\n' "no verdict json at $json (the log dir holds: $held)"
      return 0
    fi
    printf 'RETRY\tkey\t%s\n' "no verdict json at $json (the log dir holds: ${held:-naught})"
    return 0
  fi
  # `jq empty` tests parse alone; `jq -e .` would also reject a valid `null`
  if ! jq empty "$json" >/dev/null 2>&1; then
    printf 'RETRY\tcontract\t%s\n' "verdict json unparseable at $json"
    return 0
  fi
  # name each key that is absent or mistyped, and what it held instead —
  # a cause that names no key sends a human to hunt one that is present.
  # a json written whole and misshaped is an upstream contract change, so
  # a second ask returns the same shape
  shapeFault="$(jq -r "$JQ_VERDICT_SHAPE_FAULT" "$json")"
  if [[ -n "$shapeFault" ]]; then
    printf 'FIXED\tcontract\t%s\n' "verdict json $shapeFault, at $json"
    return 0
  fi

  # count the findings
  printf 'OK\t%s\t%s\n' "$(jq '.blockers | length' "$json")" "$(jq '.nitpicks | length' "$json")"
}

######################################################################
# run one reviewer. writes its report, and a one-line verdict of the
# form STATUS<TAB>BLOCKERS<TAB>NITPICKS
#
# ⚠️ an unparsed verdict is MALFUNCTION, never 0/0. the whole hazard of
#    a probabilistic gate is that "could not run" reads as "found no
#    PII", so a reviewer whose count cannot be read must block.
######################################################################
run_one_reviewer() {
  local brain="$1" outdir="$2"
  local slug verdict raw report blockers nitpicks verdictRead readStatus cause
  slug="$(brain_slug "$brain")"
  verdict="$outdir/$slug.verdict.tsv"

  # ⛔ NO PROMPT IS BUILT HERE, AND THAT IS THE POINT OF THE SWAP.
  #
  #    the prior form hand-assembled a prompt and handed it to an
  #    enrolled clone, which meant every supply had to be INLINED —
  #    the rubric pasted in whole, because a clone confined to its cwd
  #    could not be trusted to open a path under the installed role.
  #
  #    `rhx review` reads its own supplies, from OUTSIDE any sandbox,
  #    before the brain is ever called. so the rubric and the briefs
  #    arrive as PATHS, are read off disk on every run, and cannot
  #    drift behind the files they name.
  raw="$outdir/$slug.stdout.txt"
  report="$outdir/$slug.report.md"

  # ⚠️ ONE bounded retry, and it is NOT a nicety.
  #
  #    an unreadable verdict blocks the commit — correctly, because at
  #    this boundary "could not check" must never read as "found no
  #    PII". but that makes a TRANSIENT failure expensive in a way a
  #    normal flake is not: it blocks a clean tree, for a reason the
  #    human cannot act on, and a gate that blocks clean commits is a
  #    gate that gets bypassed within a day.
  #
  #    observed 2026-08-30: two live calls returned no numeric verdict,
  #    and the identical invocation succeeded on the next two runs. the
  #    cause was never pinned down, which is exactly why a retry is the
  #    right shape — it costs seconds against a transient and changes
  #    the verdict not at all against a real outage.
  #
  # ⛔ the retry does NOT weaken the gate: a second unreadable verdict
  #    still blocks. it only refuses to let one dropped call speak for
  #    the whole check.
  #
  # ⛔ EVERY FLAG BELOW IS LOAD-BEARING, and two of them are set to the
  #    value that is ALREADY the default. that is deliberate: an upstream
  #    default that moves must not silently change what this gate does.
  #
  #    --focus push      the diff is PUSHED into the prompt. `pull` hands
  #                      the brain paths and expects it to open them,
  #                      which an API brain has no tools to do — it would
  #                      grade a diff it never read.
  #    --goal exhaustive a REPRESENTATIVE sample of leaks is not a gate.
  #                      one missed SSN is the whole failure.
  #
  #    --polluters keep  route paperwork and dreams are part of what a
  #                      commit captures. the default drops them from
  #                      scope, so a commit of only such paths would
  #                      review naught, and a mixed one would hide them
  #                      from the brain.
  #    --paths-wout      lockfiles stay out: see LOCKFILE_GLOBS.
  #
  # ⛔ --optional is NEVER passed. it turns a zero-match rules glob into
  #    `0 blockers / 0 nitpicks, exit 0` — the exact failhide this gate
  #    exists to stop. `validate()` already refuses an absent rubric.
  local attempt causeKind reviewExit glob logsOfAttempt
  local pathsWout=() logsSeen=()
  for glob in "${LOCKFILE_GLOBS[@]}"; do pathsWout+=(--paths-wout "$glob"); done
  for attempt in 1 2; do
    # `rhx review` exits 0 on a completed review, blockers or not, and 2 on
    # a refusal. the code never carries the verdict; it only tells a
    # refusal apart from a crash when no logs line was printed
    reviewExit=0
    rhx review \
      --rules "$RUBRIC" \
      --refs "$REFS" \
      --diffs "$DIFFS" \
      --brain "$brain" \
      --focus push \
      --goal exhaustive \
      --polluters keep \
      "${pathsWout[@]}" \
      --output "$report" > "$raw" 2>&1 || reviewExit=$?

    # note each attempt's log dir, so a retry leaves no prompt behind
    logsOfAttempt="$(as_logs_dir_of_review "$raw")"
    [[ -n "$logsOfAttempt" ]] && logsSeen+=("$logsOfAttempt")

    # read the verdict off the reviewer json, never off stdout prose
    verdictRead="$(get_verdict_of_review "$raw" "$reviewExit")"
    readStatus="${verdictRead%%$'\t'*}"
    if [[ "$readStatus" == "OK" ]]; then
      IFS=$'\t' read -r readStatus blockers nitpicks <<< "$verdictRead"
      break
    fi
    IFS=$'\t' read -r readStatus causeKind cause <<< "$verdictRead"

    # a fault no second ask can change is not retried, and not billed twice
    [[ "$readStatus" == "FIXED" ]] && break
  done

  if [[ "$readStatus" != "OK" ]]; then
    # ⚠️ keep WHY. "verdict unreadable" with no evidence is a block a
    #    human cannot act on, and a gate nobody can clear gets bypassed.
    #    the causes are wildly unalike — a locked keyrack, a role that
    #    could not be found, a brain that answered in prose — and only
    #    the raw output tells them apart.
    #
    # ⛔ the tail is CAPPED and the whole file is never echoed. the raw
    #    output is a reviewer's account of a diff that may carry PII;
    #    to print it in full would make this report a second copy of the
    #    thing the gate exists to contain.
    #
    # ⛔ the tail drops the reviewer's own count lines: a "0 blockers"
    #    under a malfunction banner is the 0/0 read this gate refuses.
    printf 'MALFUNCTION\t0\t0\n' > "$verdict"
    printf '%s\n' "$causeKind" > "$outdir/$slug.causekind.txt"
    {
      echo "── $brain: no readable verdict, on $attempt attempt(s) ──"
      echo "cause: $cause"
      if [[ "$causeKind" == "overflow" ]]; then
        # the share of the window, and the heaviest staged dirs: the split
        grep -E '% of [0-9,]+ tokens|^[[:space:]│├└─]+[0-9.]+%[[:space:]]' "$raw" 2>/dev/null \
          | head -n 8 | cut -c1-120 || true
      else
        # stack frames, the node banner, and lone braces bury the error
        # line a human acts on, so they are dropped before the cap
        grep -vE '^[[:space:]]+at |^Node\.js v[0-9]|^[[:space:]]*[{}][[:space:]]*$|^[[:space:]]*$' "$raw" 2>/dev/null \
          | tail -n 12 \
          | grep -vE '[0-9]+ (blocker|nitpick)s?' \
          | grep -vE '^[[:space:]│├└─]*summary[[:space:]]*$' \
          | grep -vxF "✋ ConstraintError: ${cause#rhx review refused: }" \
          | as_tree_tail_closed \
          | cut -c1-160 || true
      fi
    } > "$outdir/$slug.whyfail.txt"
    return 0
  fi

  printf 'OK\t%s\t%s\n' "$blockers" "$nitpicks" > "$verdict"

  # once the verdict is read, each attempt's prompt is a copy of what
  # this gate contains. kept on a malfunction, for the cause
  del_content_of_review_logs "${logsSeen[@]}"
}

main() {
  parse_args "$@"
  validate

  WORKDIR=$(mktemp -d)

  local files filecount skips skipcount f kind
  files="$WORKDIR/files.txt"
  skips="$WORKDIR/skips.tsv"
  : > "$files"
  : > "$skips"
  while IFS= read -r f; do
    [[ -n "$f" ]] || continue
    kind="$(as_skip_kind_of_review "$f")"
    if [[ -n "$kind" ]]; then printf '%s\t%s\n' "$kind" "$f" >> "$skips"; continue; fi
    printf '%s\n' "$f" >> "$files"
  done < <(collect_files | sort -u)
  filecount=$(grep -c . "$files" 2>/dev/null || true)
  [[ -z "$filecount" ]] && filecount=0
  skipcount=$(grep -c . "$skips" 2>/dev/null || true)
  [[ -z "$skipcount" ]] && skipcount=0

  # an empty scope is genuinely clean. to block here would block every
  # commit that touches only deleted files, and a gate that blocks a
  # clean commit gets disabled within a day
  if [[ "$filecount" -eq 0 ]]; then
    print_eagle_header "clear skies,"
    print_tree_start "pii.review"
    print_tree_branch "scope" "$(scope_label)"
    print_skipped_branch "$skipcount" "$skips"
    print_tree_leaf "files" "0 — no review needed"
    exit 0
  fi

  # ── which of those files can no upstream check read? ───────────────
  #
  # ⚠️ the predicate is `grep -Iq .`, character for character the one in
  #    `is_scannable` of the regex pass. that is deliberate: the two
  #    numbers a human reads — "skipped: N (binary N)" there and
  #    "binaries: N" here — must be the SAME N. two predicates for one
  #    question is two chances to drift, and a drift here reads as a file
  #    the counter flagged and the reviewer was never handed.
  local binaries binarycount
  binaries="$WORKDIR/binaries.txt"
  : > "$binaries"
  while IFS= read -r f; do
    [[ -f "$f" ]] || continue
    grep -Iq . -- "$f" 2>/dev/null || printf '%s\n' "$f" >> "$binaries"
  done < "$files"
  binarycount=$(grep -c . "$binaries" 2>/dev/null || true)
  [[ -z "$binarycount" ]] && binarycount=0

  if [[ "$MODE" == "plan" ]]; then
    print_eagle_header "heres the plan,"
    print_tree_start "pii.review"
    print_tree_branch "scope" "$(scope_label)"
    print_tree_branch "files" "$filecount"
    print_skipped_branch "$skipcount" "$skips"
    print_binaries_branch "$binarycount" "$binaries"
    print_tree_branch "rubric" "$(basename "$RUBRIC")"
    print_tree_branch "refs" "$(basename "$REFS")"
    print_tree_branch "brains" "${#BRAINS[@]}"
    # each brain is a child of its label; the last closes the branch
    local i
    for i in "${!BRAINS[@]}"; do
      if [[ "$i" -eq $((${#BRAINS[@]} - 1)) ]]; then echo "   │  └─ ${BRAINS[$i]}"; continue; fi
      echo "   │  ├─ ${BRAINS[$i]}"
    done
    echo "   │"
    print_tree_leaf "mode" "plan — no brain was asked"
    exit 0
  fi

  # ── ask every brain at once ────────────────────────────────────────
  local outdir brain pids=()
  outdir="$WORKDIR/reviews"
  mkdir -p "$outdir"

  for brain in "${BRAINS[@]}"; do
    run_one_reviewer "$brain" "$outdir" &
    pids+=("$!")
  done

  local pid
  for pid in "${pids[@]}"; do
    wait "$pid" || true
  done

  # ── union the verdicts ─────────────────────────────────────────────
  local totalBlockers=0 malfunctions=0 status blockers nitpicks slug
  local lines=""

  for brain in "${BRAINS[@]}"; do
    slug="$(brain_slug "$brain")"
    if [[ ! -f "$outdir/$slug.verdict.tsv" ]]; then
      malfunctions=$((malfunctions + 1))
      lines="$lines   │  ├─ 💥 $brain — no verdict written"$'\n'
      continue
    fi
    IFS=$'\t' read -r status blockers nitpicks < "$outdir/$slug.verdict.tsv"
    if [[ "$status" == "MALFUNCTION" ]]; then
      malfunctions=$((malfunctions + 1))
      lines="$lines   │  ├─ 💥 $brain — verdict unreadable"$'\n'
      continue
    fi
    totalBlockers=$((totalBlockers + blockers))
    if [[ "$blockers" -gt 0 ]]; then
      lines="$lines   │  ├─ 🚨 $brain — $blockers blocker(s), $nitpicks nitpick(s)"$'\n'
    else
      lines="$lines   │  ├─ ✅ $brain — clean ($nitpicks nitpick(s))"$'\n'
    fi
  done

  # hits first: a real hit outranks a malfunction, because it is
  # actionable and the malfunction is not
  if [[ "$totalBlockers" -gt 0 ]]; then
    print_eagle_header "hold up — a brain saw PII"
    print_tree_start "pii.review"
    print_tree_branch "scope" "$(scope_label)"
    print_tree_branch "files" "$filecount"
    print_skipped_branch "$skipcount" "$skips"
    print_binaries_branch "$binarycount" "$binaries"
    print_tree_branch "reviewers" "${#BRAINS[@]}"
    echo "   │"
    printf '%s' "$lines"
    echo "   │"
    echo "   ├─ results are UNIONED: any blocker from any reviewer blocks"
    echo "   ├─ fix each value, or add it to .pii-map with its stand-in"
    echo "   └─ read the reports"
    # ⚠️ the REPORT, not the stdout. `rhx review` puts what it found in
    #    its --output file and prints only counts and paths to stdout —
    #    so a copy of stdout would name a count and no hit, and a human
    #    handed it could not tell WHICH value tripped the gate.
    #
    #    the fallback to stdout is the malfunction case: when the report
    #    was never written, the stdout is the only evidence there is.
    local reports=() report glyph
    for brain in "${BRAINS[@]}"; do
      slug="$(brain_slug "$brain")"
      if [[ -s "$outdir/$slug.report.md" ]]; then
        cp "$outdir/$slug.report.md" "./.pii-review.$slug.md" 2>/dev/null || true
      elif [[ -f "$outdir/$slug.stdout.txt" ]]; then
        cp "$outdir/$slug.stdout.txt" "./.pii-review.$slug.md" 2>/dev/null || true
      else
        continue
      fi
      reports+=(".pii-review.$slug.md")
    done
    # the last report closes the list; every one before it branches
    for report in "${reports[@]}"; do
      glyph="├─"
      [[ "$report" == "${reports[-1]}" ]] && glyph="└─"
      echo "      $glyph $report"
    done
    exit 2
  fi

  if [[ "$malfunctions" -gt 0 ]]; then
    print_eagle_header "the review could not run"
    print_tree_start "pii.review"
    print_tree_branch "scope" "$(scope_label)"
    print_tree_branch "reviewers" "${#BRAINS[@]}"
    echo "   │"
    printf '%s' "$lines"
    echo "   │"
    echo "   ├─ this is a malfunction, not a PII hit — the diff"
    echo "   │  was never actually examined by those reviewers"
    echo "   │"
    # the evidence. a block with no cause is a block a human cannot
    # clear, and a gate nobody can clear is a gate that gets bypassed
    for brain in "${BRAINS[@]}"; do
      slug="$(brain_slug "$brain")"
      [[ -f "$outdir/$slug.whyfail.txt" ]] || continue
      while IFS= read -r line; do
        echo "   │  $line"
      done < "$outdir/$slug.whyfail.txt"
      echo "   │"
    done
    # one hint per cause kind seen, so the fix named fits the cause found
    local kinds
    kinds="$(cat "$outdir"/*.causekind.txt 2>/dev/null | sort -u)"
    if grep -qx key <<< "$kinds" && grep -qh 'not found in keyrack' "$outdir"/*.whyfail.txt 2>/dev/null; then
      # the cause says the key is absent, so an unlock cannot help
      echo "   ├─ the review brain's key is absent from keyrack env prep, where"
      echo "   │  rhx review boots its brain. a human fills it:"
      for brain in "${BRAINS[@]}"; do
        grep -qx key "$outdir/$(brain_slug "$brain").causekind.txt" 2>/dev/null || continue
        asBrainKeyName "$brain"
      done | sort -u | while IFS= read -r keyName; do
        echo "   │     rhx keyrack set --owner ehmpath --key $keyName --env prep"
      done
    elif grep -qx key <<< "$kinds"; then
      echo "   ├─ no logs or no verdict json: most often the review brain has"
      echo "   │  no key. rhx review boots its brain under keyrack env prep,"
      echo "   │  so unlock prep and retry:"
      echo "   │     rhx keyrack unlock --owner ehmpath --env prep"
      echo "   │  if the brain key is absent there, a human fills it:"
      # one line per key a keyless brain needs; a clean brain needs none
      for brain in "${BRAINS[@]}"; do
        grep -qx key "$outdir/$(brain_slug "$brain").causekind.txt" 2>/dev/null || continue
        asBrainKeyName "$brain"
      done | sort -u | while IFS= read -r keyName; do
        echo "   │     rhx keyrack set --owner ehmpath --key $keyName --env prep"
      done
    fi
    if grep -qx capture <<< "$kinds"; then
      echo "   ├─ the review capture could not be read from the temp dir."
      echo "   │  check that TMPDIR is writable and has space, then retry"
    fi
    if grep -qx contract <<< "$kinds"; then
      echo "   ├─ the verdict json is unparseable or reshaped: rhx review's"
      echo "   │  artifact contract changed upstream. a retry will not help."
      echo "   │  report it to the gate's owners; in a genuine emergency:"
      echo "   │     git commit --no-verify"
    fi
    if grep -qx scope <<< "$kinds"; then
      echo "   ├─ rhx review dropped every staged path from its scope, though"
      echo "   │  this gate pins --polluters keep: a new upstream filter."
      echo "   │  report it to the gate's owners; in a genuine emergency:"
      echo "   │     git commit --no-verify"
    fi
    if grep -qx overflow <<< "$kinds"; then
      echo "   ├─ the staged diff is too large for one review. the heaviest"
      echo "   │  dirs are listed above; split them into separate commits,"
      echo "   │  then retry each"
    fi
    if grep -qx refusal <<< "$kinds"; then
      echo "   ├─ rhx review refused its input (the header above names why)."
      echo "   │  a retry will not help. report it to the gate's owners; in a"
      echo "   │  genuine emergency:"
      echo "   │     git commit --no-verify"
    fi
    # a refusal is the one cause a human may not place (an unlisted
    # header, a skill not found), so it keeps a first step; a certain
    # cause (scope, overflow, contract) gets its fitted fix alone
    if grep -qx refusal <<< "$kinds" && ! grep -qx key <<< "$kinds"; then
      echo "   ├─ if the cause above is unclear — most often: keyrack is locked:"
      echo "   │     rhx keyrack unlock --owner ehmpath --env prep"
    fi
    echo "   └─ a check that could not run must never look like one that"
    echo "      passed, so this blocks"
    exit 1
  fi

  # a report a prior block left behind may quote the value it caught. a
  # clean read of this set retires it, so no stale copy outlives the fix
  for brain in "${BRAINS[@]}"; do
    rm -f -- "./.pii-review.$(brain_slug "$brain").md"
  done

  print_eagle_header "clear skies,"
  print_tree_start "pii.review"
  print_tree_branch "scope" "$(scope_label)"
  print_tree_branch "files" "$filecount"
  print_skipped_branch "$skipcount" "$skips"
  print_binaries_branch "$binarycount" "$binaries"
  print_tree_branch "reviewers" "${#BRAINS[@]}"
  echo "   │"
  printf '%s' "$lines"
  echo "   │"
  print_tree_leaf "blockers" "0"
}

main "$@"
