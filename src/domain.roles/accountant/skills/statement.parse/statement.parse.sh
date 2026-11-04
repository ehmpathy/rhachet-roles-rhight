#!/usr/bin/env bash
######################################################################
# .what = extract transaction rows from one credit card statement
#
# .why  = tax returns need per-charge figures, not per-statement totals.
#         a statement's stated period total is gross of credits and is
#         bucketed by statement date, not charge date — neither matches
#         what belongs on a return. this reads the actual transaction
#         detail so downstream math is exact and reviewable.
#
#         deterministic: no brain, no network, no re-type by eye.
#         see rule.forbid.hand-transcription.
#
# usage:
#   statement.parse.sh statement.pdf                     # auto-detect format
#   statement.parse.sh statement.pdf --format amex       # pin the format
#   statement.parse.sh statement.md --into rows.tsv      # write to file
#   statement.parse.sh statement.pdf --account 1-00007   # refuse another card
#   statement.parse.sh --formats                         # list known formats
#   statement.parse.sh --help
#
# formats:
#   a format is DATA, not code — see formats/*.fmt. to support a new
#   issuer, add a .fmt file; this parser needs no change.
#
# output: tab-separated, one row per transaction, with header
#   date        iso charge date (YYYY-MM-DD)
#   kind        charge | credit | payment | fee | interest
#               | declared.charges | account
#   amount      signed decimal, no currency symbol or separators
#   merchant    raw merchant text as printed
#
# the `declared.charges` row carries the issuer's own stated period total
# so a caller can reconcile parsed charges against it. a mismatch means
# the parse missed rows. a format with no such line is refused, since an
# unverifiable parse is worse than none.
#
# ⛔ THE `account` ROW IS THE ONE THAT KEEPS A PERSONAL CHARGE OFF A
#    CORPORATE RETURN. a taxpayer may hold two cards from one issuer whose
#    statements are byte-identical in layout and differ only in the account
#    line. drop the wrong pdf into a folder and, without this row, every
#    downstream total is wrong by the whole card — silently, and in the
#    direction that overstates a deduction.
#
#    so the account is extracted, emitted, and — with `--account` — checked.
#    a format that declares no account line is refused outright: a parse
#    that cannot say WHICH CARD it read is not a parse a return can rest on.
#
# guarantee:
#   - deterministic + offline (pdftotext for pdf input)
#   - refuses a document whose format it does not recognize (never guesses)
#   - refuses a document with no declared total (never unverifiable)
#   - refuses a document with no account line (never unattributable)
#   - refuses a document whose account is not the one you named
#   - payments are emitted but are NOT expenses (money paid to the card)
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

FORMATS_DIR="$SCRIPT_DIR/formats"

# defaults
SRC_PATH=""
OUT_PATH=""
FORMAT="auto"
WANT_ACCOUNT=""

# .what = strip the separators an issuer prints inside an account identifier
# .why  = the same card reads as `1-00007` on the statement and `100007` when
#         a human types it from memory. a raw string compare would reject a
#         correct answer, and a guard that cries wolf about the right card is
#         a guard the caller learns to route around.
as_account_comparable() {
  printf '%s' "$1" | tr -d '[:space:]-'
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --formats)
        print_formats
        exit 0
        ;;
      --format)
        FORMAT="$2"
        shift 2
        ;;
      --account)
        WANT_ACCOUNT="$2"
        shift 2
        ;;
      --into)
        OUT_PATH="$2"
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
        if [[ -z "$SRC_PATH" ]]; then
          SRC_PATH="$1"
        else
          print_blocked "unexpected argument: $1"
          exit 2
        fi
        shift
        ;;
    esac
  done
}

print_usage() {
  cat <<'EOF'
usage: statement.parse.sh <statement-path> [--format NAME] [--into rows.tsv]

extract transaction rows from one credit card statement.
deterministic, offline, no OCR, no re-type.

args:
  <statement-path>  path to the statement (.pdf, .md, or .txt)
  --format NAME     statement format, or `auto` to detect (default: auto)
  --account ID      refuse the statement unless it belongs to this card
                    (dashes and spaces are ignored: 1-00007 == 100007)
  --formats         list known formats and exit
  --into FILE       write tsv to FILE (default: stdout)
  --help            show this help

output columns (tab separated):
  date       iso charge date (YYYY-MM-DD)
  kind       charge | credit | payment | fee | interest
             | declared.charges | account
  amount     signed decimal (no $ or commas)
  merchant   raw merchant text

notes:
  - `payment` rows are money paid TO the card; they are not expenses
  - `credit` rows (cash back, refunds) reduce the deductible basis
  - the `declared.charges` row is the issuer's own stated period total,
    for reconciliation against the sum of parsed `charge` rows
  - the `account` row names WHICH CARD this statement came from. two
    cards from one issuer print identical layouts, so this is the only
    field that keeps a personal statement out of a corporate total
  - a format is data: add formats/<name>.fmt to support a new issuer

examples:
  statement.parse.sh statement.pdf
  statement.parse.sh statement.md --format amex --into rows.tsv
  statement.parse.sh statement.pdf --account 1-00007
EOF
}

print_formats() {
  print_eagle_header "these are the formats i know,"
  print_tree_start "statement.parse --formats"
  local f name label
  local -a known=()
  for f in "$FORMATS_DIR"/*.fmt; do
    [[ -e "$f" ]] || continue
    known+=("$f")
  done
  local i=0
  for f in "${known[@]}"; do
    i=$((i + 1))
    # shellcheck disable=SC1090
    name=$(FMT_NAME=""; source "$f"; printf '%s' "$FMT_NAME")
    label=$(FMT_LABEL=""; source "$f"; printf '%s' "$FMT_LABEL")
    if [[ "$i" -eq "${#known[@]}" ]]; then
      print_tree_leaf "$name" "$label"
    else
      print_tree_branch "$name" "$label"
    fi
  done
}

validate_src() {
  if [[ -z "$SRC_PATH" ]]; then
    print_blocked "no statement path provided"
    exit 2
  fi
  if [[ ! -f "$SRC_PATH" ]]; then
    print_blocked "file not found: $SRC_PATH"
    exit 2
  fi
  local ext="${SRC_PATH##*.}"
  if [[ "$ext" != "pdf" && "$ext" != "md" && "$ext" != "txt" ]]; then
    print_blocked "unsupported extension .$ext — want .pdf, .md, or .txt"
    exit 2
  fi
}

######################################################################
# read: get plain text from either a pdf or an already-extracted md
######################################################################

# .what = refuse up front when a tool this source needs is absent
#
# .why  = ⛔ THIS CHECK CANNOT LIVE INSIDE read_text. that function is called
#         as `raw=$(read_text)`, and inside a command substitution:
#           1. print_blocked writes to STDOUT, so its one actionable sentence
#              is captured into $raw and thrown away, never seen by a caller
#           2. `exit 2` leaves only the SUBSHELL. it merely sets $? for the
#              assignment, so the `|| { ... exit 1; }` fires and rewrites a
#              CONSTRAINT as a MALFUNCTION
#         net: an absent poppler PACKAGE was reported as a corrupt DOCUMENT,
#         at exit 1, with the cure discarded. those are different faults with
#         different cures, and only one of them is the caller's to fix.
#
# .note = the `||` on read_text stays, and is correct there — a `cat` that
#         genuinely fails IS a read malfunction, and exit 1 IS its code.
#
# clamped by [case8] of statement.parse.integration.test.ts
check_tools() {
  local ext="${SRC_PATH##*.}"
  if [[ "$ext" == "pdf" ]] && ! command -v pdftotext &>/dev/null; then
    print_blocked "pdftotext not found: install poppler-utils"
    exit 2
  fi
}

read_text() {
  local ext="${SRC_PATH##*.}"
  if [[ "$ext" == "pdf" ]]; then
    pdftotext -layout -enc UTF-8 "$SRC_PATH" - 2>/dev/null
  else
    cat "$SRC_PATH"
  fi
}

######################################################################
# format: load a declaration, or detect which one fits
######################################################################

load_format() {
  local name="$1"
  local path="$FORMATS_DIR/$name.fmt"
  if [[ ! -f "$path" ]]; then
    print_blocked "unknown format: $name (see --formats)"
    exit 2
  fi
  # shellcheck disable=SC1090
  source "$path"

  # failfast: a format with no declared-total line yields an unverifiable
  # parse. refuse it rather than emit figures that no check can verify.
  if [[ -z "${FMT_DECLARED:-}" ]]; then
    print_blocked "format $name declares no FMT_DECLARED — an unverifiable parse is refused"
    exit 2
  fi

  # failfast: a format with no account line yields an UNATTRIBUTABLE parse.
  # the figures may all be right and still belong to the wrong card, and no
  # downstream check can catch that — the layouts are identical.
  if [[ -z "${FMT_ACCOUNT:-}" ]]; then
    print_blocked "format $name declares no FMT_ACCOUNT — a parse that cannot name its card is refused"
    exit 2
  fi
}

# echo the name of the first format whose fingerprint fits the text, else empty
#
# .note = matches with a bash pattern, not `grep -q`. under `set -o pipefail`,
#         `printf ... | grep -q` fails the pipeline once grep exits early on
#         a match and printf takes SIGPIPE — so a correct match reads as a
#         miss. pure bash avoids the pipe entirely.
detect_format() {
  local text="$1"
  local f name
  for f in "$FORMATS_DIR"/*.fmt; do
    [[ -e "$f" ]] || continue
    name=$(
      # shellcheck disable=SC1090
      FMT_NAME=""; FMT_FINGERPRINT_1=""; FMT_FINGERPRINT_2=""
      source "$f"
      if [[ -n "$FMT_FINGERPRINT_1" && "$text" == *"$FMT_FINGERPRINT_1"* ]] &&
         { [[ -z "$FMT_FINGERPRINT_2" ]] ||
           [[ "$text" == *"$FMT_FINGERPRINT_2"* ]]; }; then
        printf '%s' "$FMT_NAME"
      fi
    )
    if [[ -n "$name" ]]; then
      printf '%s' "$name"
      return 0
    fi
  done
  return 0
}

######################################################################
# extract: walk the statement, track which detail section applies,
#          and emit one row per dated transaction line
######################################################################

#
# .note = format regexes reach awk via ENVIRON, never via -v. awk applies
#         escape-sequence processing to -v assignments, so a `\t` in a .fmt
#         would arrive as a literal tab and a `\*` as a bare `*` — quietly
#         corrupting every pattern. ENVIRON passes bytes through verbatim.
to_rows() {
  FMT_SECTION_PAYMENT="$FMT_SECTION_PAYMENT" \
  FMT_SECTION_CREDIT="$FMT_SECTION_CREDIT" \
  FMT_SECTION_CHARGE="$FMT_SECTION_CHARGE" \
  FMT_SECTION_FEE="$FMT_SECTION_FEE" \
  FMT_SECTION_INTEREST="$FMT_SECTION_INTEREST" \
  FMT_ROW="$FMT_ROW" \
  FMT_DECLARED="$FMT_DECLARED" \
  FMT_SHUTDATE="$FMT_SHUTDATE" \
  FMT_ACCOUNT="$FMT_ACCOUNT" \
  FMT_DECLARED_LABEL="$FMT_DECLARED_LABEL" \
  FMT_SHUTDATE_LABEL="$FMT_SHUTDATE_LABEL" \
  FMT_ACCOUNT_LABEL="$FMT_ACCOUNT_LABEL" \
  awk '
    BEGIN {
      re_pay   = ENVIRON["FMT_SECTION_PAYMENT"]
      re_cred  = ENVIRON["FMT_SECTION_CREDIT"]
      re_chg   = ENVIRON["FMT_SECTION_CHARGE"]
      re_fee   = ENVIRON["FMT_SECTION_FEE"]
      re_int   = ENVIRON["FMT_SECTION_INTEREST"]
      re_row   = ENVIRON["FMT_ROW"]
      re_decl  = ENVIRON["FMT_DECLARED"]
      re_shut  = ENVIRON["FMT_SHUTDATE"]
      re_acct  = ENVIRON["FMT_ACCOUNT"]
      lbl_decl = ENVIRON["FMT_DECLARED_LABEL"]
      lbl_shut = ENVIRON["FMT_SHUTDATE_LABEL"]
      lbl_acct = ENVIRON["FMT_ACCOUNT_LABEL"]
      state = "none"
      shut_date = ""
      account = ""
    }
    function clean_amount(s,   t) {
      t = s
      gsub(/[$,]/, "", t)
      return t + 0
    }
    function iso_date(s,   mm, dd, yy) {
      mm = substr(s, 1, 2)
      dd = substr(s, 4, 2)
      yy = substr(s, 7, 2)
      return "20" yy "-" mm "-" dd
    }
    function trim(s) {
      gsub(/^[ \t]+|[ \t]+$/, "", s)
      return s
    }

    # which card this statement belongs to
    #
    # .note = FIRST match wins. the account line sits in the page header,
    #         which repeats on every page; a last-match read would be
    #         identical here but would drift the moment an issuer prints a
    #         second account reference in a footer or a promo block.
    account == "" && $0 ~ re_acct {
      if (match($0, re_acct)) {
        raw = substr($0, RSTART, RLENGTH)
        sub("^" lbl_acct "[ \t]+", "", raw)
        account = trim(raw)
      }
    }

    # period close date, used to date the declared-total row
    shut_date == "" && $0 ~ re_shut {
      if (match($0, re_shut)) {
        raw = substr($0, RSTART, RLENGTH)
        sub(lbl_shut "[ \t]+", "", raw)
        shut_date = iso_date(raw)
      }
    }

    # the issuer own stated total for the period
    $0 ~ re_decl {
      line = $0
      sub("^[ \t]*" lbl_decl "[ \t]+", "", line)
      declared = clean_amount(trim(line))
      have_declared = 1
    }

    # --- section transitions (detail headers only, not summary lines) ---
    $0 ~ re_pay  { state = "payment";  next }
    $0 ~ re_cred { state = "credit";   next }
    $0 ~ re_chg  { state = "charge";   next }
    $0 ~ re_fee  { state = "fee";      next }
    $0 ~ re_int  { state = "interest"; next }

    # --- transaction rows ---
    $0 ~ re_row {
      if (state == "none") next

      # the amount is the final whitespace-delimited token
      n = split($0, tok, /[ \t]+/)
      amt = tok[n]
      if (amt !~ /^-?\$[0-9,]+\.[0-9][0-9]$/) next

      date = iso_date(substr(tok[1], 1, 8))

      # merchant = all tokens between the date and the amount
      merchant = ""
      for (i = 2; i < n; i++) {
        merchant = (merchant == "" ? tok[i] : merchant " " tok[i])
      }

      printf "%s\t%s\t%.2f\t%s\n", date, state, clean_amount(amt), merchant
    }

    END {
      if (account != "") {
        printf "%s\t%s\t%.2f\t%s\n", shut_date, "account", 0, account
      }
      if (have_declared) {
        printf "%s\t%s\t%.2f\t%s\n", shut_date, "declared.charges", declared, lbl_decl
      }
    }
  '
}

main() {
  parse_args "$@"
  validate_src
  check_tools

  local raw
  raw=$(read_text) || {
    print_blocked "failed to read: $SRC_PATH"
    exit 1
  }

  # failfast: empty text means an image-based pdf (needs OCR) or a bad file
  local stripped
  stripped=$(printf '%s' "$raw" | tr -d '[:space:]')
  if [[ -z "$stripped" ]]; then
    print_blocked "no text found — image-based pdf? run pdf.transcribe first (it routes each page to OCR only where needed)"
    exit 2
  fi

  # pick a format. auto-detect refuses to guess: an unrecognized issuer
  # could partially match another format and undercount silently.
  if [[ "$FORMAT" == "auto" ]]; then
    local detected
    detected=$(detect_format "$raw")
    if [[ -z "$detected" ]]; then
      print_blocked "unrecognized statement format — see --formats, or add formats/<name>.fmt"
      exit 2
    fi
    FORMAT="$detected"
  fi
  load_format "$FORMAT"

  local rows
  rows=$(printf '%s\n' "$raw" | to_rows)

  # failfast: a statement with zero transaction rows means the layout
  # changed and the parse is silently wrong — never report an empty tally
  #
  # ⚠️ counts TRANSACTION rows only. `account` and `declared.charges` are
  #    metadata, emitted from header lines that survive a total layout
  #    change — so a bare `-z "$rows"` test would read "0 charges, but the
  #    header parsed" as a healthy parse and hand the check to a later,
  #    less specific guard. observed the moment the account row was added.
  local n_txn
  n_txn=$(printf '%s\n' "$rows" |
    awk -F'\t' '$2 != "account" && $2 != "declared.charges" && NF > 0' | wc -l | tr -d ' ')
  if [[ "$n_txn" -eq 0 ]]; then
    print_blocked "no transaction rows found in: $SRC_PATH (layout may have changed)"
    exit 2
  fi

  # failfast: no declared total means the parse cannot be reconciled.
  # .note = bash pattern, not `grep -q` — see the SIGPIPE note on detect_format
  if [[ "$rows" != *"declared.charges"* ]]; then
    print_blocked "no '$FMT_DECLARED_LABEL' line found — parse cannot be reconciled, refused"
    exit 2
  fi

  # failfast: no account line means the rows cannot be attributed to a card.
  # the figures would look perfect and could belong to anyone.
  local account
  account=$(printf '%s\n' "$rows" | awk -F'\t' '$2 == "account" { print $4; exit }')
  if [[ -z "$account" ]]; then
    print_blocked "no '$FMT_ACCOUNT_LABEL' line found — cannot tell which card this is, refused"
    exit 2
  fi

  # ⛔ the guard the whole account row exists for. two cards from one issuer
  #    print the same layout, so this comparison is the only thing between a
  #    personal statement and a corporate deduction.
  if [[ -n "$WANT_ACCOUNT" ]]; then
    local want got
    want=$(as_account_comparable "$WANT_ACCOUNT")
    got=$(as_account_comparable "$account")
    if [[ "$want" != "$got" ]]; then
      print_blocked "wrong card: wanted $WANT_ACCOUNT, statement is $account ($SRC_PATH)"
      exit 2
    fi
  fi

  local header
  header=$(printf 'date\tkind\tamount\tmerchant')

  if [[ -n "$OUT_PATH" ]]; then
    printf '%s\n%s\n' "$header" "$rows" > "$OUT_PATH"
    local count
    count=$(printf '%s\n' "$rows" | wc -l | tr -d ' ')
    print_eagle_header "counted it,"
    print_tree_start "statement.parse"
    print_tree_branch "source" "$SRC_PATH"
    print_tree_branch "format" "$FMT_NAME ($FMT_LABEL)"
    print_tree_branch "account" "$account"
    print_tree_branch "rows" "$count"
    print_tree_leaf "into" "$OUT_PATH"
  else
    printf '%s\n%s\n' "$header" "$rows"
  fi
}

main "$@"
