#!/usr/bin/env bash
######################################################################
# .what = tally many statements into per-tax-year deductible totals
#
# .why  = a tax year is a calendar year of CHARGE dates. a credit card
#         statement year is neither — statements close mid-month, so a
#         january statement holds december charges of the prior year.
#         this buckets by charge date and nets out credits, so the
#         figure that reaches Form 1120 line 26 is the right one.
#
#         every number here is computed, never re-typed by eye.
#         see rule.forbid.hand-transcription.
#
# usage:
#   statement.tally.sh --from ./statements                  # tally a directory
#   statement.tally.sh --from ./statements --by vendor      # vendor breakdown
#   statement.tally.sh --from ./statements --into out.md    # write a report
#   statement.tally.sh --from ./statements --rows rows.tsv  # keep the raw rows
#   statement.tally.sh --from ./statements --account 1-00007
#   statement.tally.sh --help
#
# reconciliation:
#   each statement declares its own "Total New Charges". this sums the
#   parsed charge rows per statement and compares. any mismatch is
#   reported and forces a non-zero exit — a silent undercount on a tax
#   return is the failure mode this exists to prevent.
#
# ⛔ ONE CARD PER TALLY, BY DEFAULT.
#   reconciliation catches a statement that was parsed WRONG. it cannot
#   catch a statement that was parsed PERFECTLY and belongs to someone
#   else — a personal card from the same issuer reconciles to the penny
#   and inflates the deduction by its whole balance.
#
#   the only signal is the account line, so this refuses a folder that
#   holds more than one account and names every statement per account.
#   two deliberate exits:
#
#     --account ID        pin one card; every other statement is refused
#     --accounts mixed    affirm the mix is intended (a real second
#                         corporate card), and tally them together
#
#   the safe path is the bare invocation; the mixed path costs a flag.
#
# guarantee:
#   - deterministic + offline
#   - buckets by charge date, not statement date
#   - nets credits (cash back, refunds) against charges
#   - refuses a folder with mixed accounts unless told the mix is intended
#   - exit 1 for malfunction, exit 2 for constraint, exit 3 for mismatch
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

PARSER="$SCRIPT_DIR/../statement.parse/statement.parse.sh"

# .what = scratch dir, cleared on exit
# .why  = an EXIT trap must not clobber the intended exit code, so cleanup
#         returns 0 explicitly rather than emit the last command status
WORKDIR=""
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

VENDORS_DIR="$SCRIPT_DIR/vendors"

# defaults
FROM_DIR=""
OUT_PATH=""
ROWS_PATH=""
BY="year"
ONLY=""
VENDORS="software-startup"
VENDORS_PATH=""
FORMAT="auto"
WANT_ACCOUNT=""
ACCOUNTS="one"

# .what = strip the separators an issuer prints inside an account identifier
# .why  = `1-00007` on the statement, `100007` from a human's memory. see the
#         twin in statement.parse.sh — the two must agree byte for byte, or a
#         --account that satisfies the parser is refused by the tally.
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
      --from)
        FROM_DIR="$2"
        shift 2
        ;;
      --into)
        OUT_PATH="$2"
        shift 2
        ;;
      --rows)
        ROWS_PATH="$2"
        shift 2
        ;;
      --by)
        BY="$2"
        shift 2
        ;;
      --vendors)
        VENDORS="$2"
        shift 2
        ;;
      --only)
        ONLY="$2"
        shift 2
        ;;
      --format)
        FORMAT="$2"
        shift 2
        ;;
      --account)
        WANT_ACCOUNT="$2"
        shift 2
        ;;
      --accounts)
        ACCOUNTS="$2"
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
        if [[ -z "$FROM_DIR" ]]; then
          FROM_DIR="$1"
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
usage: statement.tally.sh --from <dir> [--by MODE] [--into report.md]

tally many amex statements into per-tax-year deductible totals.
buckets by charge date (not statement date) and nets out credits.

args:
  --from DIR       directory of statements (.pdf and/or .md)
  --by MODE        year (default) | month | vendor | line
  --only PATTERN   with --by month, narrow to vendors whose label matches
                   (case-insensitive regex, e.g. `twilio` or `aws|twilio`)
  --format NAME    statement format, or `auto` to detect (default: auto)
  --account ID     tally only this card; refuse every other statement
                   (dashes and spaces ignored: 1-00007 == 100007)
  --accounts MODE  one (default) | mixed
                   `one` refuses a folder that holds more than one card.
                   `mixed` affirms the mix is intended and tallies them
                   together — use only when the second card is genuinely
                   a second CORPORATE card
  --vendors NAME   vendor map: a name in vendors/ or a path to a .vendors
                   file (default: software-startup)
  --into FILE      write a markdown report to FILE
  --rows FILE      also write the raw parsed rows as tsv
  --help           show this help

modes:
  year     per tax year — the grain a return needs
  month    per YYYY-MM, plus per vendor per month — the run-rate grain
  vendor   per vendor per year, plus the unclassified merchant list
  line     per Form 1120 line per year

reconciliation:
  compares summed charge rows against each statement's own declared
  "Total New Charges". exits 3 if any statement fails to reconcile.

examples:
  statement.tally.sh --from ./statements
  statement.tally.sh --from ./statements --by vendor
  statement.tally.sh --from ./statements --by month --only twilio
  statement.tally.sh --from ./statements --into tally.md --rows rows.tsv
  statement.tally.sh --from ./statements --account 1-00007
  statement.tally.sh --from ./statements --accounts mixed
EOF
}

validate_args() {
  if [[ -z "$FROM_DIR" ]]; then
    print_blocked "no --from directory provided"
    exit 2
  fi
  if [[ ! -d "$FROM_DIR" ]]; then
    print_blocked "not a directory: $FROM_DIR"
    exit 2
  fi
  if [[ "$BY" != "year" && "$BY" != "month" && "$BY" != "vendor" && "$BY" != "line" ]]; then
    print_blocked "unknown --by mode: $BY (want year, month, vendor or line)"
    exit 2
  fi
  # .why = --only silently does nothing in the other modes, and a filter
  #        that appears to apply but does not is worse than a refusal
  if [[ -n "$ONLY" && "$BY" != "month" ]]; then
    print_blocked "--only applies to --by month, got --by $BY"
    exit 2
  fi
  if [[ "$ACCOUNTS" != "one" && "$ACCOUNTS" != "mixed" ]]; then
    print_blocked "unknown --accounts mode: $ACCOUNTS (want one or mixed)"
    exit 2
  fi
  # .why = --account already pins a single card, so --accounts mixed beside it
  #        is a contradiction. to accept it silently would leave the caller
  #        unsure which of the two won.
  if [[ -n "$WANT_ACCOUNT" && "$ACCOUNTS" == "mixed" ]]; then
    print_blocked "--account $WANT_ACCOUNT pins one card, so --accounts mixed contradicts it"
    exit 2
  fi
  if [[ ! -f "$PARSER" ]]; then
    print_blocked "parser not found at: $PARSER"
    exit 1
  fi

  # a vendor map may be a name under vendors/, or a path to one
  if [[ -f "$VENDORS" ]]; then
    VENDORS_PATH="$VENDORS"
  elif [[ -f "$VENDORS_DIR/$VENDORS.vendors" ]]; then
    VENDORS_PATH="$VENDORS_DIR/$VENDORS.vendors"
  else
    print_blocked "unknown vendor map: $VENDORS (want a name in vendors/ or a path)"
    exit 2
  fi
}

######################################################################
# collect: run the parser over every statement, tag rows by source
#
# prefers .md when both .md and .source.pdf exist for one statement
# (already extracted, so faster and identical)
######################################################################

# list the statements to parse, one path per line
# .note = must stay separate from collect_rows, whose stdout is redirected
list_statements() {
  local f base

  for f in "$FROM_DIR"/*.md "$FROM_DIR"/*.pdf; do
    [[ -e "$f" ]] || continue

    base="$(basename "$f")"

    # skip a .source.pdf when its .md twin is present
    if [[ "$base" == *.source.pdf && -f "${f%.source.pdf}.md" ]]; then
      continue
    fi

    printf '%s\n' "$f"
  done
}

collect_rows() {
  local f base rows

  while IFS= read -r f; do
    [[ -n "$f" ]] || continue
    base="$(basename "$f")"

    # .note = --account is deliberately NOT passed down. the parser would
    #         exit 2 on a stranger's card, which lands in the || branch below
    #         and merely logs PARSE_FAILED to stderr — a stranger's card would
    #         be SKIPPED rather than refused, and the tally would report a
    #         clean success over a folder it silently narrowed. so every
    #         statement is parsed, and guard_accounts refuses by name.
    rows=$(bash "$PARSER" "$f" --format "$FORMAT" 2>/dev/null) || {
      echo "PARSE_FAILED	$base" >&2
      continue
    }

    # drop the header, prefix each row with its source statement
    printf '%s\n' "$rows" | awk -v src="$base" 'NR > 1 && NF > 0 { print src "\t" $0 }'
  done
}

######################################################################
# guard: one card per tally, unless told otherwise
#
# ⛔ this is the guard reconciliation CANNOT be. reconciliation asks
#    "was this statement read correctly?" — a personal card read
#    perfectly passes it, and adds its whole balance to the deduction.
#    the account line is the only thing that answers "whose card?"
######################################################################

# emit "<account>\t<statement>", one line per statement, deduped
accounts_seen() {
  awk -F'\t' '$3 == "account" { print $5 "\t" $1 }' "$1" | sort -u
}

# the card(s) this tally covers, as one comma-joined label
#
# .note = plural only ever reachable via --accounts mixed, and it stays
#         plural on purpose so a mixed report announces the mix on its face
#
# .note = joined in awk, NOT `paste -sd', '`. paste reads its -d value as a
#         LIST of single-char delimiters to cycle through, so ", " joins the
#         1st pair with "," and the 2nd with " " — it silently drops the
#         space and never errors.
account_label() {
  accounts_seen "$1" | awk -F'\t' '{ print $1 }' | sort -u |
    awk '{ out = (NR == 1 ? $0 : out ", " $0) } END { print out }'
}

# print "<account>" then its statements, indented, for a set of pairs
print_account_block() {
  local pairs="$1" acct
  for acct in $(printf '%s\n' "$pairs" | awk -F'\t' '{ print $1 }' | sort -u); do
    print_tree_note "$acct"
    printf '%s\n' "$pairs" | awk -F'\t' -v a="$acct" '$1 == a { print "        · " $2 }'
  done
}

guard_accounts() {
  local rows_file="$1"
  local pairs accounts n_accounts n_stmt n_named want got strangers

  pairs=$(accounts_seen "$rows_file")

  # .why = statement.parse refuses a format with no FMT_ACCOUNT and refuses a
  #        statement whose account line is absent, so an empty result here
  #        means the parser was bypassed — not that the cards are accountless.
  #        a tally that cannot name its card is exactly what this guard exists
  #        to refuse, so an absent account blocks rather than falls through.
  if [[ -z "$pairs" ]]; then
    print_blocked "no statement declared an account — cannot tell whose card this is, refused"
    exit 2
  fi

  n_stmt=$(awk -F'\t' '{ print $1 }' "$rows_file" | sort -u | wc -l | tr -d ' ')
  n_named=$(printf '%s\n' "$pairs" | awk -F'\t' '{ print $2 }' | sort -u | wc -l | tr -d ' ')
  if [[ "$n_stmt" -ne "$n_named" ]]; then
    print_blocked "$((n_stmt - n_named)) of $n_stmt statement(s) declared no account — refused"
    exit 2
  fi

  # --account pins one card; every other statement is refused, by name
  if [[ -n "$WANT_ACCOUNT" ]]; then
    want=$(as_account_comparable "$WANT_ACCOUNT")
    strangers=$(printf '%s\n' "$pairs" | while IFS=$'\t' read -r acct stmt; do
      got=$(as_account_comparable "$acct")
      [[ "$want" == "$got" ]] || printf '%s\t%s\n' "$acct" "$stmt"
    done)
    if [[ -n "$strangers" ]]; then
      print_blocked "wrong card — asked for $WANT_ACCOUNT, but these belong to another"
      print_account_block "$strangers"
      exit 2
    fi
    return 0
  fi

  accounts=$(printf '%s\n' "$pairs" | awk -F'\t' '{ print $1 }' | sort -u)
  n_accounts=$(printf '%s\n' "$accounts" | wc -l | tr -d ' ')

  if [[ "$n_accounts" -gt 1 && "$ACCOUNTS" != "mixed" ]]; then
    print_blocked "$n_accounts different cards here — a tally is one card by default"
    print_account_block "$pairs"
    print_tree_note ""
    print_tree_note "pick one:"
    print_tree_note "  --account ID       tally only that card, refuse the rest"
    print_tree_note "  --accounts mixed   affirm every card here is a CORPORATE card"
    exit 2
  fi
}

######################################################################
# reconcile: per statement, sum parsed charges vs the declared total
######################################################################

reconcile() {
  awk -F'\t' '
    $3 == "charge"           { got[$1] += $4 }
    $3 == "declared.charges" { want[$1] = $4; seen[$1] = 1 }
    END {
      for (s in seen) {
        diff = got[s] - want[s]
        if (diff < 0) diff = -diff
        if (diff > 0.005) {
          printf "%s\tparsed=%.2f\tdeclared=%.2f\tdiff=%.2f\n", s, got[s], want[s], got[s] - want[s]
        }
      }
    }
  '
}

######################################################################
# tally: bucket by charge-date year, net credits against charges
######################################################################

tally_by_year() {
  awk -F'\t' '
    { yr = substr($2, 1, 4) }
    $3 == "charge" { charge[yr] += $4; n[yr]++; yrs[yr] = 1 }
    $3 == "credit" { credit[yr] += $4; yrs[yr] = 1 }
    $3 == "fee"      { fee[yr] += $4 }
    $3 == "interest" { intr[yr] += $4 }
    END {
      for (y in yrs) {
        # credits parse as negative, so a plain add nets them out
        printf "%s\t%d\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\n", \
          y, n[y], charge[y], credit[y], charge[y] + credit[y], fee[y], intr[y]
      }
    }
  ' | sort
}

# .what = the same roll-up as tally_by_year, keyed YYYY-MM
#
# .why  = a year total answers "what goes on the return"; a month total
#         answers "what does it cost us to run". the second is an
#         operational question the year grain cannot serve — a vendor that
#         doubled mid-year reads as one flat annual number.
#
# .note = substr(...,1,7) rather than 1,4 is the ONLY difference. the row
#         format is deliberately identical so the report can share a
#         formatter and the two grains cannot drift apart.
tally_by_month() {
  awk -F'\t' '
    { mo = substr($2, 1, 7) }
    $3 == "charge" { charge[mo] += $4; n[mo]++; mos[mo] = 1 }
    $3 == "credit" { credit[mo] += $4; mos[mo] = 1 }
    $3 == "fee"      { fee[mo] += $4 }
    $3 == "interest" { intr[mo] += $4 }
    END {
      for (m in mos) {
        printf "%s\t%d\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\n", \
          m, n[m], charge[m], credit[m], charge[m] + credit[m], fee[m], intr[m]
      }
    }
  ' | sort
}

# .what = the awk map-load + vendor() lookup, shared by every vendor pass
#
# .why  = the right-to-left field read below is subtle enough that a second
#         copy would drift. one definition, sourced by both callers.
#
# .note = assigned in SINGLE quotes so its contents stay literal; callers
#         interpolate it as "$AWK_VENDOR_PRELUDE" and bash does not
#         re-expand the value, so the `$` inside its regexes is safe.
AWK_VENDOR_PRELUDE='
    BEGIN {
      # load the vendor map: "<pattern> | <line> | <label>", in file order
      #
      # .note = the pattern is an ERE, so it may itself carry "|" as
      #         alternation (e.g. "WEWORK|REGUS"). the field delimiter is
      #         also "|" — so fields are read from the RIGHT: the last is
      #         the label, the second-to-last the 1120 line, and all that
      #         precedes them rejoins as the pattern. a left-to-right split
      #         silently shifts line and label for every multi-alternative
      #         rule.
      n_rules = 0
      while ((getline line < mapfile) > 0) {
        sub(/#.*$/, "", line)                    # strip comments
        if (line ~ /^[ \t]*$/) continue          # skip blanks
        nf = split(line, f, /[ \t]*\|[ \t]*/)
        if (nf < 3) continue
        pattern = f[1]
        for (i = 2; i <= nf - 2; i++) pattern = pattern "|" f[i]
        gsub(/^[ \t]+|[ \t]+$/, "", pattern)
        gsub(/^[ \t]+|[ \t]+$/, "", f[nf - 1])
        gsub(/^[ \t]+|[ \t]+$/, "", f[nf])
        n_rules++
        pat[n_rules] = pattern
        ln[n_rules]  = f[nf - 1]
        lbl[n_rules] = f[nf]
      }
      close(mapfile)
    }
    function vendor(s,   i) {
      s = toupper(s)
      for (i = 1; i <= n_rules; i++) {
        if (s ~ toupper(pat[i])) return ln[i] " " lbl[i]
      }
      return "?? unclassified"
    }
'

# .note = the vendor map is DATA (vendors/*.vendors), never baked in here.
#         the emitted label is prefixed with its Form 1120 line, so a reader
#         sees at a glance which costs do NOT belong on line 26.
tally_by_vendor() {
  awk -F'\t' -v mapfile="$VENDORS_PATH" "$AWK_VENDOR_PRELUDE"'
    $3 == "charge" {
      yr = substr($2, 1, 4)
      v = vendor($5)
      sum[yr "\t" v] += $4
      cnt[yr "\t" v]++
    }
    END {
      for (k in sum) printf "%s\t%d\t%.2f\n", k, cnt[k], sum[k]
    }
  ' | sort -t'	' -k1,1 -k4,4nr
}

# .what = per vendor per MONTH, optionally narrowed to one vendor
#
# .why  = "what do we pay Twilio a month" is a run-rate question, and the
#         year grain hides exactly the thing it asks about: a step change.
#         a vendor that went $40 -> $400 in March reads as one annual total.
#
# .note = ONLY is matched against the mapped LABEL, not the raw merchant
#         string, so `--only twilio` catches every merchant descriptor that
#         maps to Twilio rather than only the ones that spell it out.
tally_by_vendor_month() {
  awk -F'\t' -v mapfile="$VENDORS_PATH" -v only="$ONLY" "$AWK_VENDOR_PRELUDE"'
    $3 == "charge" {
      v = vendor($5)
      if (only != "" && tolower(v) !~ tolower(only)) next
      mo = substr($2, 1, 7)
      sum[mo "\t" v] += $4
      cnt[mo "\t" v]++
    }
    END {
      for (k in sum) printf "%s\t%d\t%.2f\n", k, cnt[k], sum[k]
    }
  ' | sort -t'	' -k1,1 -k4,4nr
}

# .what = roll the vendor map up to its Form 1120 line
#
# .why  = the vendor view answers "who did we pay"; a return needs "what
#         goes on line 22". the line is already the first token of every
#         mapped label, so this groups on it rather than re-derive it.
#         a hand-sum of ~20 vendor rows into line buckets is exactly the
#         re-type this repo forbids.
tally_by_line() {
  awk -F'\t' -v mapfile="$VENDORS_PATH" "$AWK_VENDOR_PRELUDE"'
    $3 == "charge" {
      yr = substr($2, 1, 4)
      v = vendor($5)
      # .note = NOT `ln` — the shared prelude already uses `ln` as the
      #         rule-line ARRAY, and awk fatals on a scalar assignment to
      #         an array name. the error goes to stderr inside a pipeline
      #         in a command substitution, so it surfaces only as an empty
      #         table. name collisions with the prelude must be avoided.
      split(v, parts, " ")
      lineno = parts[1]
      sum[yr "\t" lineno] += $4
      cnt[yr "\t" lineno]++
    }
    END {
      for (k in sum) printf "%s\t%d\t%.2f\n", k, cnt[k], sum[k]
    }
  ' | sort -t'	' -k1,1 -k2,2
}

# .what = name the merchants that match no rule in the vendor map
#
# .why  = `?? unclassified` is a TODO list, not a category. a bucket total
#         alone cannot be swept — the sweep needs the merchant strings, so
#         each can be given a 1120 line (or shown to be immaterial).
#         without this, the only way to audit the tail is to eyeball raw
#         rows, which is how a misclassified capital asset slips through.
unclassified_detail() {
  awk -F'\t' -v mapfile="$VENDORS_PATH" "$AWK_VENDOR_PRELUDE"'
    $3 == "charge" && vendor($5) == "?? unclassified" {
      m = $5
      gsub(/^[ \t]+|[ \t]+$/, "", m)
      sum[m] += $4
      cnt[m]++
      # track which years the merchant appears in — a charge in every year
      # reads as a subscription, a lone charge as a one-off worth a look
      y = substr($2, 1, 4)
      if (index(" " yrs[m] " ", " " y " ") == 0)
        yrs[m] = (yrs[m] == "" ? y : yrs[m] " " y)
    }
    END {
      for (m in sum) printf "%s\t%d\t%.2f\t%s\n", m, cnt[m], sum[m], yrs[m]
    }
  ' | sort -t'	' -k3,3nr
}

######################################################################
# report
######################################################################

emit_report() {
  local rows_file="$1"
  local mismatches="$2"

  echo "# statement.tally"
  echo ""
  echo "source: \`$FROM_DIR\`"
  # .why = the card is the one fact a reader cannot recover from the totals.
  #        a report that names it can be checked against the corporate card;
  #        one that does not, cannot.
  echo "card: \`$(account_label "$rows_file")\`"
  echo ""
  echo "> buckets by **charge date**, not statement date."
  echo "> credits (cash back, refunds) are netted against charges."
  echo ""

  echo "## per tax year"
  echo ""
  echo "| year | charges | count | credits | **net** | fees | interest |"
  echo "|------|--------:|------:|--------:|--------:|-----:|---------:|"
  tally_by_year < "$rows_file" | awk -F'\t' '{
    printf "| %s | $%s | %d | $%s | **$%s** | $%s | $%s |\n", $1, $3, $2, $4, $5, $6, $7
  }'
  echo ""

  if [[ "$BY" == "month" ]]; then
    echo "## per month"
    echo ""
    echo "| month | charges | count | credits | **net** | fees | interest |"
    echo "|-------|--------:|------:|--------:|--------:|-----:|---------:|"
    tally_by_month < "$rows_file" | awk -F'\t' '{
      printf "| %s | $%s | %d | $%s | **$%s** | $%s | $%s |\n", $1, $3, $2, $4, $5, $6, $7
    }'
    echo ""

    if [[ -n "$ONLY" ]]; then
      echo "## per vendor per month — narrowed to \`$ONLY\`"
    else
      echo "## per vendor per month"
    fi
    echo ""
    echo "> ⚠️ a **card statement** is the payment record, not the vendor's"
    echo "> invoice. it dates a charge when it POSTED, so a monthly service"
    echo "> can land in the next month, and an annual plan shows as one"
    echo "> spike rather than a run rate. for a true monthly run rate, read"
    echo "> the vendor's own invoices."
    echo ""
    echo "| month | vendor | count | charges |"
    echo "|-------|--------|------:|--------:|"
    tally_by_vendor_month < "$rows_file" | awk -F'\t' '{
      printf "| %s | %s | %d | $%s |\n", $1, $2, $3, $4
    }'
    echo ""

    if [[ -n "$ONLY" ]]; then
      # .why = an --only that matches no rule returns an empty table, which
      #        reads identically to "we paid them nothing". say which it is.
      local anyhit
      anyhit=$(tally_by_vendor_month < "$rows_file")
      if [[ -z "$anyhit" ]]; then
        echo "> ❗ **no vendor label matched \`$ONLY\`** — this is an empty"
        echo "> result, NOT a zero. check the label spelling against"
        echo "> \`--by vendor\`, which lists every label in the map."
        echo ""
      fi
    fi
  fi

  if [[ "$BY" == "line" ]]; then
    echo "## per Form 1120 line per year"
    echo ""
    echo "> \`20/cap\` is a capital asset — depreciate via Form 4562, do NOT"
    echo "> expense in full. \`??\` matched no rule and needs a decision."
    echo ""
    echo "| year | 1120 line | count | charges |"
    echo "|------|-----------|------:|--------:|"
    tally_by_line < "$rows_file" | awk -F'\t' '{
      printf "| %s | %s | %d | $%s |\n", $1, $2, $3, $4
    }'
    echo ""
  fi

  if [[ "$BY" == "vendor" ]]; then
    echo "## per vendor per year"
    echo ""
    echo "| year | vendor | count | charges |"
    echo "|------|--------|------:|--------:|"
    tally_by_vendor < "$rows_file" | awk -F'\t' '{
      printf "| %s | %s | %d | $%s |\n", $1, $2, $3, $4
    }'
    echo ""

    # the unclassified bucket is a TODO list — name it so it can be swept
    local unmapped
    unmapped=$(unclassified_detail < "$rows_file")
    if [[ -n "$unmapped" ]]; then
      echo "## unclassified merchants"
      echo ""
      echo "> matched no rule in the vendor map. each needs a 1120 line"
      echo "> before a return goes out. a merchant seen in every year is"
      echo "> likely a subscription; a lone charge deserves a closer look."
      echo ""
      echo "| merchant | count | charges | years |"
      echo "|----------|------:|--------:|-------|"
      printf '%s\n' "$unmapped" | awk -F'\t' '{
        printf "| %s | %d | $%s | %s |\n", $1, $2, $3, $4
      }'
      echo ""
    fi
  fi

  echo "## reconciliation"
  echo ""
  if [[ -s "$mismatches" ]]; then
    echo "⚠️ **statements that failed to reconcile:**"
    echo ""
    echo '```'
    cat "$mismatches"
    echo '```'
  else
    echo "✅ every statement reconciles — summed charge rows equal each"
    echo "statement's own declared \`Total New Charges\`."
  fi
}

main() {
  parse_args "$@"
  validate_args

  WORKDIR=$(mktemp -d)

  local rows_file="$WORKDIR/rows.tsv"
  local mismatch_file="$WORKDIR/mismatch.tsv"
  local list_file="$WORKDIR/statements.txt"

  list_statements > "$list_file"

  # failfast: an empty directory must block, never report a $0.00 tally
  if [[ ! -s "$list_file" ]]; then
    print_blocked "no statements found in: $FROM_DIR"
    exit 2
  fi

  collect_rows < "$list_file" > "$rows_file"

  if [[ ! -s "$rows_file" ]]; then
    print_blocked "no rows parsed from: $FROM_DIR"
    exit 2
  fi

  # ⛔ before a single figure is summed: whose card is this?
  guard_accounts "$rows_file"

  reconcile < "$rows_file" > "$mismatch_file"

  if [[ -n "$ROWS_PATH" ]]; then
    { printf 'statement\tdate\tkind\tamount\tmerchant\n'; cat "$rows_file"; } > "$ROWS_PATH"
  fi

  local report
  report=$(emit_report "$rows_file" "$mismatch_file")

  if [[ -n "$OUT_PATH" ]]; then
    printf '%s\n' "$report" > "$OUT_PATH"
  else
    printf '%s\n' "$report"
    echo ""
  fi

  # treestruct summary
  local n_statements n_rows
  n_statements=$(awk -F'\t' '{print $1}' "$rows_file" | sort -u | wc -l | tr -d ' ')
  n_rows=$(wc -l < "$rows_file" | tr -d ' ')

  print_eagle_header "tallied it,"
  print_tree_start "statement.tally"
  print_tree_branch "from" "$FROM_DIR"
  print_tree_branch "card" "$(account_label "$rows_file")"
  print_tree_branch "statements" "$n_statements"
  print_tree_branch "rows" "$n_rows"
  print_tree_branch "by" "$BY"

  if [[ -s "$mismatch_file" ]]; then
    local n_bad
    n_bad=$(wc -l < "$mismatch_file" | tr -d ' ')
    print_tree_leaf "reconciled" "❌ $n_bad statement(s) mismatched"
    exit 3
  fi

  print_tree_leaf "reconciled" "✅ all $n_statements statements"
}

main "$@"
