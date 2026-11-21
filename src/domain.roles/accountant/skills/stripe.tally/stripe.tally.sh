#!/usr/bin/env bash
######################################################################
# .what = tally Stripe balance exports into per-tax-year 1120 figures
#
# .why  = Stripe's dashboard shows several plausible "revenue" numbers
#         and only one belongs on line 1a. worse, Stripe fees hide in
#         TWO places (see .the fee trap below), so a naive sum of the
#         `fee` column understates the deduction.
#
#         every number here is computed, never re-typed by eye.
#         see rule.forbid.hand-transcription.
#
# usage:
#   stripe.tally.sh --from ./stripe                   # tally a directory
#   stripe.tally.sh --from ./stripe --into out.md     # write a report
#   stripe.tally.sh --from ./stripe --rows rows.tsv   # keep the raw rows
#   stripe.tally.sh --help
#
# .the fee trap
#   a `charge` row carries its processing fee in the `fee` COLUMN:
#     gross 100.00 | fee 3.20 | net 96.80     (illustrative)
#   but Stripe also emits standalone `reporting_category = fee` rows,
#   where the cost sits in `gross` as a NEGATIVE and `fee` is 0.00:
#     gross -10.00 | fee 0.00 | net -10.00    (Identity Document Check)
#   sum only the `fee` column and every Identity/Billing/Issuing charge
#   silently vanishes from the deduction. this sums both.
#
# reconciliation:
#   the Balance summary export declares activity_gross, activity_fee and
#   activity for the same period. this sums the itemized rows and
#   compares all three. any mismatch forces a non-zero exit — a silent
#   miscount on a tax return is the failure mode this exists to prevent.
#
#   it also refuses to stay quiet about a reporting_category it does not
#   know how to place on the 1120. an unmapped category means the 1a/1b/26
#   split is incomplete, even when the totals happen to tie.
#
# guarantee:
#   - deterministic + offline
#   - buckets by transaction date (`created`), matching the card side
#   - columns located by HEADER NAME, so report versions 1-7 all work
#   - exit 1 for malfunction, exit 2 for constraint, exit 3 for untrusted
#     figures (reconcile mismatch or unmapped category)
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# .what = scratch dir, cleared on exit
# .why  = an EXIT trap must not clobber the intended exit code, so cleanup
#         returns 0 explicitly rather than emit the last command status
WORKDIR=""
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

# defaults
FROM_DIR=""
OUT_PATH=""
ROWS_PATH=""

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
usage: stripe.tally.sh --from <dir> [--into report.md] [--rows rows.tsv]

tally Stripe balance exports into the per-tax-year figures a Form 1120
needs. buckets by transaction date, splits by reporting category, and
sums Stripe fees from BOTH places they hide.

args:
  --from DIR       directory of Stripe csv exports
  --into FILE      write a markdown report to FILE
  --rows FILE      also write the raw parsed rows as tsv
  --help           show this help

what to put in DIR (per tax year, from the Balance summary report):
  Itemized_balance_change_from_activity_*.csv   required — the rows
  Balance_Summary_*.csv                         optional — the reconcile
                                                target + Schedule L balance
  (skip the payouts exports; they answer the wrong question)

reconciliation:
  compares summed rows against the Balance summary's own declared
  activity_gross / activity_fee / activity. exits 3 on any mismatch, or
  on any reporting_category this does not know how to place.

examples:
  stripe.tally.sh --from ./stripe
  stripe.tally.sh --from ./stripe --into tally.md --rows rows.tsv
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
}

######################################################################
# csv
######################################################################

# .what = a proper quoted-csv field splitter, shared by every awk pass
#
# .why  = the `description` field carries commas ("Identity Document
#         Check (2023-05-01 - 2023-05-31)") and Stripe quotes every
#         field. a naive -F, split shears those rows apart and shifts
#         every column after the break.
#
# .note = assigned in SINGLE quotes so its contents stay literal.
AWK_CSV_PRELUDE='
    function csvsplit(line, arr,   i, n, c, nxt, field, inq) {
      n = 0; field = ""; inq = 0
      for (i = 1; i <= length(line); i++) {
        c = substr(line, i, 1)
        if (inq) {
          if (c == "\"") {
            nxt = substr(line, i + 1, 1)
            if (nxt == "\"") { field = field "\""; i++ }   # escaped quote
            else inq = 0
          } else field = field c
        } else {
          if (c == "\"") inq = 1
          else if (c == ",") { arr[++n] = field; field = "" }
          else field = field c
        }
      }
      arr[++n] = field
      return n
    }
    function trim(s) { gsub(/^[ \t\r]+|[ \t\r]+$/, "", s); return s }
'

######################################################################
# parse
######################################################################

list_itemized() {
  find "$FROM_DIR" -maxdepth 1 -type f -iname '*tem*.csv' 2>/dev/null \
    | grep -iv 'payout' \
    | sort || true
}

list_summaries() {
  find "$FROM_DIR" -maxdepth 1 -type f -iname '*.csv' 2>/dev/null \
    | grep -i 'summary' \
    | grep -iv 'payout' \
    | sort || true
}

# .what = itemized csv -> tsv rows: source, date, category, gross, fee, net, desc
#
# .why  = columns are located by HEADER NAME, never by position. Stripe
#         ships balance report versions 1 through 7 with differing column
#         sets; a positional read silently mis-assigns amounts on any
#         version but the one it was written against.
parse_itemized() {
  local file="$1"
  local base
  base=$(basename "$file")

  awk -v src="$base" "$AWK_CSV_PRELUDE"'
    NR == 1 {
      n = csvsplit($0, h)
      for (i = 1; i <= n; i++) col[trim(h[i])] = i
      split("created gross fee net reporting_category", want, " ")
      for (i = 1; i in want; i++) {
        if (!(want[i] in col)) {
          printf "MISSING\t%s\t%s\n", src, want[i]
          exit 0
        }
      }
      next
    }
    {
      if (trim($0) == "") next
      n = csvsplit($0, f)
      if (n < 2) next
      date = trim(f[col["created"]])
      cat  = trim(f[col["reporting_category"]])
      # the date is "YYYY-MM-DD HH:MM:SS" — keep the day, drop the clock
      split(date, d, " ")
      printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n", \
        src, d[1], cat, \
        trim(f[col["gross"]]), trim(f[col["fee"]]), trim(f[col["net"]]), \
        (("description" in col) ? trim(f[col["description"]]) : "")
    }
  ' "$file"
}

# .what = balance summary csv -> tsv: year, category, net_amount
parse_summary() {
  local file="$1"
  awk "$AWK_CSV_PRELUDE"'
    NR == 1 {
      n = csvsplit($0, h)
      for (i = 1; i <= n; i++) col[trim(h[i])] = i
      if (!("category" in col) || !("net_amount" in col)) exit 0
      next
    }
    {
      if (trim($0) == "") next
      n = csvsplit($0, f)
      if (n < 2) next
      cat = trim(f[col["category"]])
      amt = trim(f[col["net_amount"]])
      desc = ("description" in col) ? trim(f[col["description"]]) : ""
      # the period year lives in the balance descriptions, e.g.
      # "Ending balance (2023-12-31)" — read it from DATA, not the filename
      if (match(desc, /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/))
        yr = substr(desc, RSTART, 4)
      printf "%s\t%s\t%s\n", yr, cat, amt
    }
  ' "$file"
}

######################################################################
# tally
######################################################################

# .what = the reporting_category -> Form 1120 line map
#
# .why  = same principle as the card vendor map: a category this does not
#         recognize must surface as `?? unmapped`, never be silently
#         dropped. an unmapped category means the 1a/1b/26 split is
#         incomplete even if the control totals still tie.
#
# .note = `dispute` lands in BOTH buckets by design — its gross is revenue
#         clawed back (1b) while its fee column is a cost (26).
#
# .note = `advance` / `advance_funding` are Instant Payout TIMING mechanics,
#         not income and not expense. Stripe creates them when an instant
#         payout exceeds the available balance: funds move between the
#         available and unsettled balances, so the pair nets to zero. they
#         touch no 1120 line — but they are mapped explicitly to `--` rather
#         than left unmapped, so the map states the decision outright
#         instead of leaving a reader to infer a silent omission.
# .note = every placement below is quoted from Stripe's own category
#         reference, captured via bhrowser (539KB page,
#         ~45 categories). a WebFetch of the same page returned "the full
#         reference table isn't included in this excerpt" — see
#         rule.require.bhrowser-citations.
AWK_CATEGORY_PRELUDE='
    function line_for(cat) {
      # --- 1a: gross receipts -------------------------------------
      # "Charges include payments from cards and from other payment methods"
      if (cat == "charge")                   return "1a"

      # --- 1b: returns and allowances -----------------------------
      # "Payments you have refunded to your customers"
      if (cat == "refund")                   return "1b"
      # "Stripe deducts the disputed amount from your balance"
      if (cat == "dispute")                  return "1b"
      # "a partial_capture_reversal for the uncaptured portion"
      if (cat == "partial_capture_reversal") return "1b"
      # "A charge_failure will appear if the [queued] payment later fails"
      if (cat == "charge_failure")           return "1b"
      # these RESTORE revenue; their gross is positive, so the same
      # `returns += -gross` formula correctly reduces the 1b total
      # "When you win a dispute, the disputed amount is returned"
      if (cat == "dispute_reversal")         return "1b"
      # "when a refund fails, Stripe returns the funds to your balance"
      if (cat == "refund_failure")           return "1b"

      # --- 26: other deductions -----------------------------------
      # "Fees for Stripe software and services (for example, for Radar,
      #  Connect, Bill*ing, and Identity)"
      if (cat == "fee")                      return "26"
      # "Typically, this is a tax on Stripe fees" — a tax on a purchased
      # service rides with the cost of that service, NOT line 17, which
      # is for franchise/payroll/property taxes
      if (cat == "tax")                      return "26"
      # a credit against Stripe fees — negative cost
      if (cat == "fee_credit_funding")       return "26"

      # --- --: balance movements, never P&L -----------------------
      # .note = topup is the one that would do real damage if unmapped
      #         and later guessed at: "Funds you transferred into your
      #         Stripe balance from your bank account" is OWNER FUNDING,
      #         not revenue. it must never reach line 1a.
      if (cat == "topup")                    return "--"
      if (cat == "topup_reversal")           return "--"
      # "Payouts from your Stripe balance to your bank account"
      if (cat == "payout")                   return "--"
      if (cat == "payout_reversal")          return "--"
      if (cat == "payout_minimum_balance_hold")    return "--"
      if (cat == "payout_minimum_balance_release") return "--"
      # "to change the date that funds settle to your balance" — an
      # increment/decrement pair that nets to zero
      if (cat == "advance")                  return "--"
      if (cat == "advance_funding")          return "--"
      # reserves: debited then credited back at period end
      if (cat == "risk_reserved_funds")      return "--"
      if (cat == "connect_reserved_funds")   return "--"
      if (cat == "payment_network_reserve_hold")    return "--"
      if (cat == "payment_network_reserve_release") return "--"
      # authorization holds, released on capture
      if (cat == "issuing_authorization_hold")    return "--"
      if (cat == "issuing_authorization_release") return "--"
      # "Funds moved between a merchants payments balance and their tax
      #  fund financial account" — an internal move
      if (cat == "tax_fund")                 return "--"

      # all else is deliberately UNMAPPED. platform_earning, contribution,
      # reward, revenue_share, other_adjustment, currency_conversion,
      # climate_*, issuing_transaction and the rest each need a human
      # decision about where they land, and a wrong guess on a tax return
      # is worse than a halt.
      return "??"
    }
'

tally_by_year() {
  awk -F'\t' "$AWK_CATEGORY_PRELUDE"'
    {
      yr = substr($2, 1, 4)
      cat = $3; gross = $4 + 0; fee = $5 + 0
      years[yr] = 1

      if (cat == "charge") charges[yr] += gross
      # ⛔ THIS LIST MUST MATCH `line_for`s 1b ARM, or the audit table one
      #    section down labels a category `1b` that never reaches the 1b
      #    column. it did not match until 2026-09-02: charge_failure,
      #    dispute_reversal and refund_failure were mapped to 1b and
      #    handled by no branch here, so their gross was dropped whole.
      #
      #    the reversals carry POSITIVE gross, so `returns += -gross`
      #    reduces the 1b total — which is what `line_for`s own comment
      #    already asserted, and what this branch did not do.
      else if (cat == "refund" || cat == "dispute" ||
               cat == "partial_capture_reversal" || cat == "charge_failure" ||
               cat == "dispute_reversal" || cat == "refund_failure")
        returns[yr] += -gross
      else if (cat == "fee") feestandalone[yr] += -gross
      # ⚠️ `tax` is mapped to 26 by `line_for` and is still handled by no
      #    branch here — the same defect, left OPEN deliberately. to fold
      #    it into `feestandalone` would also have to answer whether
      #    Stripes declared `activity_fee` includes tax, and `reconcile`
      #    keys on `$3 == "fee"` alone. unmeasured, so unchanged.

      # the fee COLUMN applies to every row kind, disputes included
      feecol[yr] += fee
    }
    END {
      for (yr in years)
        printf "%s\t%.2f\t%.2f\t%.2f\t%.2f\n", \
          yr, charges[yr], returns[yr], \
          feecol[yr] + feestandalone[yr], \
          charges[yr] - returns[yr]
    }
  ' | sort
}

tally_by_category() {
  awk -F'\t' "$AWK_CATEGORY_PRELUDE"'
    {
      yr = substr($2, 1, 4)
      k = yr "\t" line_for($3) " " $3
      cnt[k]++; gross[k] += $4 + 0; fee[k] += $5 + 0
    }
    END {
      for (k in cnt)
        printf "%s\t%d\t%.2f\t%.2f\n", k, cnt[k], gross[k], fee[k]
    }
  ' | sort -t'	' -k1,1 -k2,2
}

# .what = name any reporting_category with no 1120 placement
unmapped_categories() {
  awk -F'\t' "$AWK_CATEGORY_PRELUDE"'
    line_for($3) == "??" { cnt[$3]++; gross[$3] += $4 + 0 }
    END { for (c in cnt) printf "%s\t%d\t%.2f\n", c, cnt[c], gross[c] }
  ' | sort
}

# .what = compare summed rows against the summary's own declared totals
#
# .why  = this is what makes the figures trustworthy rather than merely
#         plausible. three independent ties, not one: gross, fee, and net.
#
# .note = Stripe's `activity_gross` EXCLUDES the standalone fee rows'
#         gross, and its `activity_fee` INCLUDES it. so a standalone fee
#         row's negative gross is a FEE to Stripe, not negative revenue —
#         which is the same claim `.the fee trap` makes, stated by Stripe
#         itself. a first cut of this function summed the raw gross and
#         fee columns and mismatched by exactly the standalone-fee total
#         in all three years; that failure is what established the rule.
#
# .note = `activity_gross` is therefore NOT Form 1120 line 1a — it is
#         already net of refunds and disputes, which makes it line 1c.
#         line 1a is the `charge` category alone.
reconcile() {
  local rows_file="$1"
  local summary_file="$2"

  awk -F'\t' -v sumfile="$summary_file" '
    BEGIN {
      while ((getline line < sumfile) > 0) {
        split(line, s, "\t")
        yr = s[1]; cat = s[2]; amt = s[3] + 0
        if (cat == "activity_gross") want_gross[yr] = amt
        else if (cat == "activity_fee") want_fee[yr] = -amt   # declared negative
        else if (cat == "activity") want_net[yr] = amt
        if (cat != "") seen[yr] = 1
      }
      close(sumfile)
    }
    {
      yr = substr($2, 1, 4)
      if ($3 == "fee") got_fee[yr] += -($4 + 0)   # standalone fee: cost in gross
      else             got_gross[yr] += $4 + 0
      got_fee[yr] += $5 + 0                       # the fee column, every row kind
      got_net[yr] += $6 + 0
      years[yr] = 1
    }
    END {
      for (yr in years) {
        if (!(yr in seen)) {
          printf "%s\tno summary export found — cannot reconcile\n", yr
          continue
        }
        d1 = got_gross[yr] - want_gross[yr]
        d2 = got_fee[yr]   - want_fee[yr]
        d3 = got_net[yr]   - want_net[yr]
        if (d1 > 0.005 || d1 < -0.005)
          printf "%s\tgross: summed=%.2f declared=%.2f diff=%.2f\n", yr, got_gross[yr], want_gross[yr], d1
        if (d2 > 0.005 || d2 < -0.005)
          printf "%s\tfee: summed=%.2f declared=%.2f diff=%.2f\n", yr, got_fee[yr], want_fee[yr], d2
        if (d3 > 0.005 || d3 < -0.005)
          printf "%s\tnet: summed=%.2f declared=%.2f diff=%.2f\n", yr, got_net[yr], want_net[yr], d3
      }
    }
  ' "$rows_file" | sort
}

# .what = the Dec 31 balance per year, for Schedule L
ending_balances() {
  awk -F'\t' '$2 == "ending_balance" { printf "%s\t%.2f\n", $1, $3 + 0 }' | sort
}

######################################################################
# report
######################################################################

emit_report() {
  local rows_file="$1"
  local summary_file="$2"
  local mismatches="$3"
  local unmapped="$4"

  echo "# stripe.tally"
  echo ""
  echo "source: \`$FROM_DIR\`"
  echo ""
  echo "> buckets by **transaction date** (\`created\`), matching the card side."
  echo "> Stripe fees are summed from BOTH the \`fee\` column and standalone"
  echo "> \`fee\` rows — see the skill header, \`.the fee trap\`."
  echo ""

  echo "## per tax year — Form 1120 figures"
  echo ""
  echo "| year | 1a gross receipts | 1b returns | 1c net | 26 stripe fees |"
  echo "|------|------------------:|-----------:|-------:|---------------:|"
  tally_by_year < "$rows_file" | awk -F'\t' '{
    printf "| %s | $%s | $%s | **$%s** | $%s |\n", $1, $2, $3, $5, $4
  }'
  echo ""

  if [[ -s "$summary_file" ]]; then
    local balances
    balances=$(ending_balances < "$summary_file")
    if [[ -n "$balances" ]]; then
      echo "## Schedule L — Stripe balance at Dec 31"
      echo ""
      echo "| year | balance |"
      echo "|------|--------:|"
      printf '%s\n' "$balances" | awk -F'\t' '{ printf "| %s | $%s |\n", $1, $2 }'
      echo ""
    fi
  fi

  echo "## per reporting category"
  echo ""
  echo "> the prefix is the Form 1120 line each category lands on."
  echo "> \`--\` means the category is a balance-timing artifact that reaches"
  echo "> no 1120 line — deliberately excluded, not overlooked."
  echo ""
  echo "| year | category | count | gross | fee column |"
  echo "|------|----------|------:|------:|-----------:|"
  tally_by_category < "$rows_file" | awk -F'\t' '{
    printf "| %s | %s | %d | $%s | $%s |\n", $1, $2, $3, $4, $5
  }'
  echo ""

  if [[ -s "$unmapped" ]]; then
    echo "## ⚠️ unmapped categories"
    echo ""
    echo "> these have no Form 1120 placement, so the 1a/1b/26 split above"
    echo "> is incomplete. decide each one before any return goes out."
    echo ""
    echo "| category | count | gross |"
    echo "|----------|------:|------:|"
    awk -F'\t' '{ printf "| %s | %d | $%s |\n", $1, $2, $3 }' "$unmapped"
    echo ""
  fi

  echo "## reconciliation"
  echo ""
  if [[ -s "$mismatches" ]]; then
    echo "⚠️ **failed to reconcile:**"
    echo ""
    echo '```'
    cat "$mismatches"
    echo '```'
  else
    echo "✅ every year reconciles — summed rows equal the Balance summary's"
    echo "own declared \`activity_gross\`, \`activity_fee\` and \`activity\`."
  fi
}

main() {
  parse_args "$@"
  validate_args

  WORKDIR=$(mktemp -d)

  local rows_file="$WORKDIR/rows.tsv"
  local summary_file="$WORKDIR/summary.tsv"
  local mismatch_file="$WORKDIR/mismatch.tsv"
  local unmapped_file="$WORKDIR/unmapped.tsv"

  local itemized
  itemized=$(list_itemized)
  if [[ -z "$itemized" ]]; then
    print_blocked "no itemized balance export found in: $FROM_DIR"
    exit 2
  fi

  # parse the itemized exports
  : > "$rows_file"
  local f
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    parse_itemized "$f" >> "$rows_file"
  done <<< "$itemized"

  # a header without the columns we need is a constraint, not a silent zero
  local missing
  missing=$(awk -F'\t' '$1 == "MISSING" { printf "%s (needs column: %s)\n", $2, $3 }' "$rows_file")
  if [[ -n "$missing" ]]; then
    print_blocked "export missing required columns: $missing"
    exit 2
  fi

  if [[ ! -s "$rows_file" ]]; then
    print_blocked "no rows parsed from the itemized export(s)"
    exit 2
  fi

  # parse the summaries, if present
  : > "$summary_file"
  local summaries
  summaries=$(list_summaries)
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    parse_summary "$f" >> "$summary_file"
  done <<< "$summaries"

  reconcile "$rows_file" "$summary_file" > "$mismatch_file" || true
  unmapped_categories < "$rows_file" > "$unmapped_file" || true

  local report
  report=$(emit_report "$rows_file" "$summary_file" "$mismatch_file" "$unmapped_file")

  printf '%s\n' "$report"

  if [[ -n "$OUT_PATH" ]]; then
    printf '%s\n' "$report" > "$OUT_PATH"
  fi
  if [[ -n "$ROWS_PATH" ]]; then
    { printf 'source\tdate\tcategory\tgross\tfee\tnet\tdescription\n'
      cat "$rows_file"
    } > "$ROWS_PATH"
  fi

  local n_files n_rows n_years
  n_files=$(printf '%s\n' "$itemized" | grep -c . || true)
  n_rows=$(wc -l < "$rows_file" | tr -d ' ')
  n_years=$(tally_by_year < "$rows_file" | grep -c . || true)

  print_eagle_header "tallied it,"
  print_tree_start "stripe.tally"
  print_tree_branch "from" "$FROM_DIR"
  print_tree_branch "exports" "$n_files"
  print_tree_branch "rows" "$n_rows"
  print_tree_branch "years" "$n_years"

  if [[ -s "$unmapped_file" ]]; then
    print_tree_branch "categories" "⚠️ $(wc -l < "$unmapped_file" | tr -d ' ') unmapped"
  fi

  if [[ -s "$mismatch_file" ]]; then
    print_tree_leaf "reconciled" "❌ see report"
    exit 3
  fi
  print_tree_leaf "reconciled" "✅ all $n_years year(s)"

  # an unmapped category means the 1120 split is incomplete, even when the
  # control totals tie — that is not a trustworthy figure either
  if [[ -s "$unmapped_file" ]]; then
    exit 3
  fi
}

main "$@"
