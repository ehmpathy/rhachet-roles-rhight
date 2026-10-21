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
#   --mode          plan | apply (default apply)
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
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

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
  --mode          plan | apply (default apply)
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

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --diffs)
        DIFFS="${2:-}"
        shift 2
        ;;
      --brain)
        BRAINS+=("${2:-}")
        shift 2
        ;;
      --rubric)
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
    print_blocked "not inside a git work tree"
    exit 2
  fi
  if [[ -z "$DIFFS" ]]; then
    print_blocked "needs a scope: --diffs since-staged|since-commit|since-main"
    exit 2
  fi
  case "$DIFFS" in
    since-staged|since-commit|since-main) ;;
    *)
      print_blocked "--diffs must be since-staged, since-commit, or since-main"
      exit 2
      ;;
  esac
  if [[ ! -f "$RUBRIC" ]]; then
    # ⚠️ an absent rubric would make every reviewer grade against
    #    no rules and return a clean 0/0 — a silent pass at the gate
    print_blocked "rubric not found: $RUBRIC"
    exit 1
  fi
  case "$MODE" in
    plan|apply) ;;
    *)
      print_blocked "--mode must be plan or apply"
      exit 2
      ;;
  esac
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
    since-staged) git diff --cached --name-only --diff-filter=ACM ;;
    since-commit) git diff --name-only --diff-filter=ACM HEAD ;;
    since-main)   git diff --name-only --diff-filter=ACM "$(diff_base)...HEAD" ;;
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

# a reviewer's slug, flattened for use in a filename
brain_slug() {
  printf '%s' "$1" | tr '/' '-'
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
  local slug verdict raw report blockers nitpicks
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
  # ⛔ --optional is NEVER passed. it turns a zero-match rules glob into
  #    `0 blockers / 0 nitpicks, exit 0` — the exact failhide this gate
  #    exists to stop. `validate()` already refuses an absent rubric.
  local attempt
  for attempt in 1 2; do
    if ! rhx review \
          --rules "$RUBRIC" \
          --refs "$REFS" \
          --diffs "$DIFFS" \
          --brain "$brain" \
          --focus push \
          --goal exhaustive \
          --output "$report" > "$raw" 2>&1; then
      : # a non-zero exit is expected when hits exist; read the counts
    fi

    # ⛔ THE SKIP GUARD. a skipped review prints the SAME two count lines
    #    as a clean pass — `0 blockers / 0 nitpicks`, exit 0 — so the
    #    parse below cannot tell them apart, and a skip would read as a
    #    green gate over a diff nobody graded.
    #
    #    the one discriminator is the `logs:` line: a skip writes no log
    #    artifacts, so it advertises none. the `review:` line is NOT
    #    usable — a skip writes that file, so its presence proves naught.
    #
    #    an absent `logs:` line is scored a MALFUNCTION below, alongside
    #    an unreadable verdict, because both mean the same thing: the
    #    diff was never examined.
    if ! grep -q 'logs:' "$raw" 2>/dev/null; then
      blockers=""
      nitpicks=""
      continue
    fi

    # per contract.reviewer-output: a NUMERIC count for both dimensions.
    # word forms ("no blockers") deliberately do not satisfy it — they
    # carry no number, so there is nothing to read.
    #
    # ⚠️ the `[^0-9a-z]{0,6}` gap is what tolerates MARKDOWN, and it is
    #    load-bearing. a reviewer writes prose, and prose is emphasized:
    #    "**Blockers:** 0" puts `:** ` between the label and the number.
    #    the earlier `blockers?:[[:space:]]*` demanded a digit straight
    #    after the colon, found `*`, and reported the verdict unreadable
    #    — so a reviewer that had answered CORRECTLY was scored a
    #    malfunction, and a clean commit was blocked for it.
    #    observed 2026-08-30, on the clean control of the live suite.
    #
    # ⛔ the gap admits punctuation and space ONLY. it can never bridge a
    #    word, so "no blockers" still fails to parse, and "blockers" in a
    #    sentence cannot borrow a digit from a neighboring clause.
    blockers="$(grep -oiE '([0-9]+)[^0-9a-z]{0,6}blockers?|blockers?[^0-9a-z]{0,6}([0-9]+)' "$raw" 2>/dev/null \
      | grep -oE '[0-9]+' | head -1 || true)"
    nitpicks="$(grep -oiE '([0-9]+)[^0-9a-z]{0,6}nitpicks?|nitpicks?[^0-9a-z]{0,6}([0-9]+)' "$raw" 2>/dev/null \
      | grep -oE '[0-9]+' | head -1 || true)"

    [[ -n "$blockers" && -n "$nitpicks" ]] && break
  done

  if [[ -z "$blockers" || -z "$nitpicks" ]]; then
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
    printf 'MALFUNCTION\t0\t0\n' > "$verdict"
    {
      echo "── $brain: no readable verdict, on 2 attempts ──"
      tail -n 12 "$raw" 2>/dev/null | cut -c1-160
    } > "$outdir/$slug.whyfail.txt"
    return 0
  fi

  printf 'OK\t%s\t%s\n' "$blockers" "$nitpicks" > "$verdict"
}

main() {
  parse_args "$@"
  validate

  WORKDIR=$(mktemp -d)

  local files filecount
  files="$WORKDIR/files.txt"
  collect_files | sort -u > "$files"
  filecount=$(grep -c . "$files" 2>/dev/null || true)
  [[ -z "$filecount" ]] && filecount=0

  # an empty scope is genuinely clean. to block here would block every
  # commit that touches only deleted files, and a gate that blocks a
  # clean commit gets disabled within a day
  if [[ "$filecount" -eq 0 ]]; then
    print_eagle_header "clear skies,"
    print_tree_start "pii.review"
    print_tree_branch "scope" "$(scope_label)"
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
  local binaries binarycount f
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
    print_binaries_branch "$binarycount" "$binaries"
    print_tree_branch "rubric" "$(basename "$RUBRIC")"
    print_tree_branch "refs" "$(basename "$REFS")"
    print_tree_branch "brains" "${#BRAINS[@]}"
    local b
    for b in "${BRAINS[@]}"; do
      echo "   │  ├─ $b"
    done
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
    print_binaries_branch "$binarycount" "$binaries"
    print_tree_branch "reviewers" "${#BRAINS[@]}"
    echo "   │"
    printf '%s' "$lines"
    echo "   │"
    echo "   ├─ results are UNIONED: any blocker from any reviewer blocks"
    echo "   └─ read the reports:"
    # ⚠️ the REPORT, not the stdout. `rhx review` puts what it found in
    #    its --output file and prints only counts and paths to stdout —
    #    so a copy of stdout would name a count and no hit, and a human
    #    handed it could not tell WHICH value tripped the gate.
    #
    #    the fallback to stdout is the malfunction case: when the report
    #    was never written, the stdout is the only evidence there is.
    for brain in "${BRAINS[@]}"; do
      slug="$(brain_slug "$brain")"
      if [[ -s "$outdir/$slug.report.md" ]]; then
        cp "$outdir/$slug.report.md" "./.pii-review.$slug.md" 2>/dev/null || true
      elif [[ -f "$outdir/$slug.stdout.txt" ]]; then
        cp "$outdir/$slug.stdout.txt" "./.pii-review.$slug.md" 2>/dev/null || true
      else
        continue
      fi
      echo "      └─ .pii-review.$slug.md"
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
    echo "   ├─ this is a MALFUNCTION, not a detected leak — the diff"
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
    echo "   ├─ most often: keyrack is locked. unlock and retry:"
    echo "   │     rhx keyrack unlock --owner ehmpath --env test"
    echo "   └─ a check that could not run must never look like one that"
    echo "      passed, so this blocks"
    exit 1
  fi

  print_eagle_header "clear skies,"
  print_tree_start "pii.review"
  print_tree_branch "scope" "$(scope_label)"
  print_tree_branch "files" "$filecount"
  print_binaries_branch "$binarycount" "$binaries"
  print_tree_branch "reviewers" "${#BRAINS[@]}"
  echo "   │"
  printf '%s' "$lines"
  echo "   │"
  print_tree_leaf "blockers" "0"
}

main "$@"
