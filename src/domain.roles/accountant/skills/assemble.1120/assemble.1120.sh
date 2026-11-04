#!/usr/bin/env bash
######################################################################
# .what = roll the card + revenue tallies up into Form 1120 line totals
#
# .why  = the two tally skills each reconcile their own source, but the
#         RETURN needs them added together — line 26 alone is four
#         separate figures from two skills. that addition by hand is
#         where a single-line error slips in unseen.
#
#         every number here is computed, never re-typed by eye.
#         see rule.forbid.hand-transcription.
#
# usage:
#   assemble.1120.sh --cards ./statements --stripe ./stripe
#   assemble.1120.sh --cards ./statements --stripe ./stripe --into out.md
#   assemble.1120.sh --cards ./s --stripe ./r --prior 2022=10000
#   assemble.1120.sh --help
#
# .prior years
#   a year already filed elsewhere has no statements here, but its loss is
#   still part of the same carryforward chain. `--prior` folds it into the
#   cumulative column without a claim to recompute it: the row carries an
#   em-dash for income and deductions, and only the loss is asserted.
#   this exists so the chain never has to be totalled by hand.
#
# .the credits trap
#   card credits (cash back, refunds) reduce the purchase-price basis, so
#   they are subtracted ONCE, from the total. the per-line card figures
#   are GROSS charges, so credits must not also be netted inside a line.
#   the hand-draft subtracted them in both places. this subtracts once and
#   shows the arithmetic.
#
# reconciliation:
#   line 27 is checked against an independent path: the card tally's own
#   per-year net, plus fees and interest and Stripe fees. if the
#   line-by-line sum disagrees with that total, the split is wrong even
#   when each part reconciled — and the run exits non-zero.
#
# guarantee:
#   - deterministic + offline
#   - delegates to statement.tally and stripe.tally; never re-parses
#   - refuses to emit totals if either upstream tally fails to reconcile
#   - exit 1 for malfunction, exit 2 for constraint, exit 3 for untrusted
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

CARD_TALLY="$SCRIPT_DIR/../statement.tally/statement.tally.sh"
STRIPE_TALLY="$SCRIPT_DIR/../stripe.tally/stripe.tally.sh"

WORKDIR=""
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

CARDS_DIR=""
STRIPE_DIR=""
OUT_PATH=""
PRIORS=()

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h) print_usage; exit 0 ;;
      --cards)  CARDS_DIR="$2";  shift 2 ;;
      --stripe) STRIPE_DIR="$2"; shift 2 ;;
      --into)   OUT_PATH="$2";   shift 2 ;;
      --prior)  PRIORS+=("$2");  shift 2 ;;
      --skill|--repo|--role) shift 2 ;;
      -*) print_blocked "unknown option: $1"; exit 2 ;;
      *)  print_blocked "unexpected argument: $1"; exit 2 ;;
    esac
  done
}

# .what = turn each --prior YEAR=AMOUNT into a "year<TAB>nol" row
#
# .why  = a year already filed elsewhere still belongs in the carryforward
#         chain. without it the cumulative silently understates, and the
#         only alternative is to add it by hand — which is the failure mode
#         this whole skill exists to prevent.
#
# .note = the amount is normalized to NEGATIVE. a loss is a loss whether the
#         caller writes 10000 or -10000; the sign is not the caller's problem
#         to get right, because a sign slip here would OVERSTATE the
#         carryforward. see the credit() note above for the same trap.
write_priors() {
  local out="$1" spec year amount
  : > "$out"
  for spec in ${PRIORS+"${PRIORS[@]}"}; do
    if [[ "$spec" != *=* ]]; then
      print_blocked "--prior needs YEAR=AMOUNT, got: $spec"; exit 2
    fi
    year="${spec%%=*}"
    amount="${spec#*=}"
    if [[ ! "$year" =~ ^[0-9]{4}$ ]]; then
      print_blocked "--prior year must be 4 digits, got: $year"; exit 2
    fi
    if [[ ! "$amount" =~ ^-?[0-9]+(\.[0-9]+)?$ ]]; then
      print_blocked "--prior amount must be a number, got: $amount"; exit 2
    fi
    awk -v y="$year" -v a="$amount" 'BEGIN {
      v = a + 0
      if (v > 0) v = -v
      printf "%s\t%.2f\n", y, v
    }' >> "$out"
  done
}

print_usage() {
  cat <<'EOF'
usage: assemble.1120.sh --cards <dir> --stripe <dir> [--into report.md]

roll the card and revenue tallies up into Form 1120 line totals.

args:
  --cards DIR      directory of card statements
  --stripe DIR     directory of Stripe csv exports
  --into FILE      write a markdown report to FILE
  --prior Y=AMT    a year already filed, whose loss joins the carryforward
                   (repeatable; sign is normalized, so 10000 == -10000)
  --help           show this help

reconciliation:
  cross-checks the line-by-line sum against an independent total.
  exits 3 if they disagree, or if either upstream tally fails.

examples:
  assemble.1120.sh --cards ./statements --stripe ./stripe
EOF
}

validate_args() {
  if [[ -z "$CARDS_DIR" ]]; then
    print_blocked "no --cards directory provided"; exit 2
  fi
  if [[ ! -d "$CARDS_DIR" ]]; then
    print_blocked "not a directory: $CARDS_DIR"; exit 2
  fi
  if [[ -z "$STRIPE_DIR" ]]; then
    print_blocked "no --stripe directory provided"; exit 2
  fi
  if [[ ! -d "$STRIPE_DIR" ]]; then
    print_blocked "not a directory: $STRIPE_DIR"; exit 2
  fi
  if [[ ! -f "$CARD_TALLY" ]]; then
    print_blocked "card tally not found at: $CARD_TALLY"; exit 1
  fi
  if [[ ! -f "$STRIPE_TALLY" ]]; then
    print_blocked "stripe tally not found at: $STRIPE_TALLY"; exit 1
  fi
}

######################################################################
# collect: run each tally, keep its markdown, fail if it did not reconcile
######################################################################

# .note = a tally that exits non-zero has ALREADY told us its figures are
#         untrustworthy. to roll those up anyway would launder a known
#         defect into a clean-looking total.
run_tally() {
  local label="$1" runner="$2" out="$3"
  shift 3
  local status=0
  bash "$runner" "$@" > "$out" || status=$?
  if [[ $status -ne 0 ]]; then
    print_blocked "$label tally did not reconcile (exit $status) — refusing to roll up"
    exit 3
  fi
}

# .what = pull "| year | value | ..." rows out of a tally's markdown table
#
# .why  = the tallies are the source of record; this reads their published
#         output rather than re-derive figures a second way. one parser,
#         one set of numbers.
read_table() {
  local file="$1" heading="$2"
  awk -v want="$heading" '
    /^## / { inside = (index($0, want) > 0); next }
    !inside { next }
    /^\|/ {
      if ($0 ~ /^\|[- :|]+\|$/) next            # separator row
      gsub(/\*\*/, "")                          # bold markers
      gsub(/\$/, "")                            # currency
      n = split($0, f, /[ \t]*\|[ \t]*/)
      line = ""
      for (i = 2; i < n; i++) line = line (line == "" ? "" : "\t") f[i]
      if (line ~ /^[0-9][0-9][0-9][0-9]\t/) print line
    }
  ' "$file"
}

######################################################################
# assemble
######################################################################

# .what = emit "year<TAB>key<TAB>value" facts from both tallies
gather_facts() {
  local card_year="$1" card_line="$2" stripe_year="$3"

  # card, per year: charges | count | credits | net | fees | interest
  awk -F'\t' '{
    printf "%s\tcard.charges\t%s\n", $1, $2
    printf "%s\tcard.credits\t%s\n", $1, $4
    printf "%s\tcard.net\t%s\n",     $1, $5
    printf "%s\tcard.fees\t%s\n",    $1, $6
    printf "%s\tcard.interest\t%s\n",$1, $7
  }' "$card_year"

  # card, per 1120 line: year | line | count | charges
  awk -F'\t' '{ printf "%s\tcardline.%s\t%s\n", $1, $2, $4 }' "$card_line"

  # stripe, per year: 1a | 1b | 1c | fees
  awk -F'\t' '{
    printf "%s\trev.1a\t%s\n",   $1, $2
    printf "%s\trev.1b\t%s\n",   $1, $3
    printf "%s\trev.1c\t%s\n",   $1, $4
    printf "%s\trev.fees\t%s\n", $1, $5
  }' "$stripe_year"
}

# .what = fold the facts into per-year 1120 lines
#
# .note = the credits subtraction happens exactly ONCE, here, against the
#         line-26 bucket. see `.the credits trap` in the header.
compute_lines() {
  awk -F'\t' '
    { v[$1 "\t" $2] = $3 + 0; years[$1] = 1 }
    function f(yr, k) { return v[yr "\t" k] + 0 }
    # .what = a credit as a positive magnitude
    # .why  = the card tally prints credits already-signed ("$-50.00").
    #         a caller who subtracts that value ADDS it. that sign slip doubles
    #         the credit on line 26 rather than removes it. credits are
    #         reductions by definition, so take the magnitude and subtract it
    #         explicitly, whichever sign the upstream table happens to carry.
    function credit(yr,   c) { c = f(yr, "card.credits"); return c < 0 ? -c : c }
    END {
      for (yr in years) {
        l1a = f(yr, "rev.1a")
        l1b = f(yr, "rev.1b")
        l1c = l1a - l1b

        l16 = f(yr, "cardline.16")
        l17 = f(yr, "cardline.17")
        l18 = f(yr, "card.interest")
        l20 = f(yr, "cardline.20/cap")      # capital — excluded from 27
        l22 = f(yr, "cardline.22")

        # line 26 = card other-deduction vendors
        #         + stripe fees + card fees
        #         - card credits (ONCE)
        l26 = f(yr, "cardline.26") \
            + f(yr, "rev.fees") \
            + f(yr, "card.fees") \
            - credit(yr)
        open = f(yr, "cardline.??")

        l27 = l16 + l17 + l18 + l22 + l26
        l28 = l1c - l27

        printf "%s\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\n", \
          yr, l1a, l1b, l1c, l16, l17, l18, l22, l26, l27, l28, open
        printf "%s\tCAP\t%.2f\n", yr, l20 > "/dev/stderr"
      }
    }
  ' | sort
}

# .what = check the line split against an independent total
#
# .why  = each tally reconciled its own source, but a bad SPLIT can still
#         produce lines that do not sum to the whole. the card tally's own
#         per-year `net` (charges less credits) plus fees, interest and
#         Stripe fees is the same total by a different route.
reconcile_lines() {
  local facts="$1" lines="$2"

  awk -F'\t' -v factfile="$facts" '
    BEGIN {
      while ((getline l < factfile) > 0) {
        split(l, s, "\t")
        v[s[1] "\t" s[2]] = s[3] + 0
      }
      close(factfile)
    }
    function f(yr, k) { return v[yr "\t" k] + 0 }
    {
      yr = $1; got27 = $10 + 0
      # independent path: card net (charges already less credits) + card fees
      #                 + card interest + stripe fees, less the two buckets
      #                 line 27 deliberately holds out — the capital asset and
      #                 the unclassified charges that still need a decision.
      want27 = f(yr, "card.net") + f(yr, "card.fees") \
             + f(yr, "card.interest") + f(yr, "rev.fees") \
             - f(yr, "cardline.20/cap") - f(yr, "cardline.??")
      d = got27 - want27
      if (d > 0.005 || d < -0.005)
        printf "%s\tline 27: by-line=%.2f independent=%.2f diff=%.2f\n", yr, got27, want27, d
    }
  ' "$lines" | sort
}

######################################################################
# report
######################################################################

# .what = merge the computed years with the prior years into one chain
#
# .why  = the carryforward does not care which years this skill could
#         compute. a prior year contributes a loss and no other figure, so
#         it gets a row with income and deductions blank — visibly NOT a
#         figure this run derived, while still carried in the total.
#
# emits: year | origin | 1c | 27 | 30
merge_chain() {
  local lines="$1" priors="$2"
  awk -F'\t' '{ printf "%s\tcomputed\t%s\t%s\t%s\n", $1, $4, $10, $11 }' "$lines"
  if [[ -s "$priors" ]]; then
    awk -F'\t' '{ printf "%s\tprior\t\t\t%s\n", $1, $2 }' "$priors"
  fi
}

emit_report() {
  local lines="$1" mismatches="$2" capital="$3" priors="$4"

  echo "# assemble.1120"
  echo ""
  echo "source: cards \`$CARDS_DIR\` + stripe \`$STRIPE_DIR\`"
  echo ""
  echo "> every figure is computed from the two tallies, each of which"
  echo "> reconciled against its own source. the line split is then"
  echo "> cross-checked against an independent total."
  echo ""

  echo "## the bottom line"
  echo ""
  # .note = the cumulative column is a RUNNING total, per year. a single
  #         "through YYYY" figure would silently fold in a partial current
  #         year; a per-year column lets the reader take the year they file.
  #
  # .why  = the carryforward is the entire reason a loss year gets filed, so
  #         it is a figure bound for a future return — computed, never summed
  #         by eye. see rule.forbid.hand-transcription.
  echo "| year | total income (11) | total deductions (27) | taxable income (30) | NOL generated | NOL cumulative |"
  echo "|------|------------------:|----------------------:|--------------------:|--------------:|---------------:|"
  merge_chain "$lines" "$priors" | sort | awk -F'\t' '{
    t   = $5 + 0
    nol = (t < 0) ? t : 0
    ti  = (t < 0) ? 0 : t
    carry += nol
    # a prior year has no computable income or deduction total here — an
    # em-dash says "not derived by this run" where a $0.00 would lie.
    inc = ($2 == "prior") ? "—" : "$" $3
    ded = ($2 == "prior") ? "—" : "$" $4
    tag = ($2 == "prior") ? " ᵖ" : ""
    printf "| %s%s | %s | %s | **$%.2f** | $%.2f | **$%.2f** |\n", \
      $1, tag, inc, ded, ti, nol, carry
  }'
  if [[ -s "$priors" ]]; then
    echo ""
    echo "> ᵖ = a **prior** year, already filed. its loss is asserted by the"
    echo "> caller via \`--prior\`, not derived from statements here — so its"
    echo "> income and deduction cells are left blank rather than zeroed."
  fi
  echo ""

  echo "## income"
  echo ""
  echo "| line | item | $(awk -F'\t' '{printf "%s | ", $1}' "$lines")"
  echo "|------|------|$(awk -F'\t' '{printf "---:|"}' "$lines")"
  echo "| 1a | gross receipts | $(awk -F'\t' '{printf "$%s | ", $2}' "$lines")"
  echo "| 1b | returns and allowances | $(awk -F'\t' '{printf "$%s | ", $3}' "$lines")"
  echo "| 1c | **net receipts** | $(awk -F'\t' '{printf "**$%s** | ", $4}' "$lines")"
  echo ""

  echo "## deductions"
  echo ""
  echo "| line | item | $(awk -F'\t' '{printf "%s | ", $1}' "$lines")"
  echo "|------|------|$(awk -F'\t' '{printf "---:|"}' "$lines")"
  echo "| 16 | rents | $(awk -F'\t' '{printf "$%s | ", $5}' "$lines")"
  echo "| 17 | taxes and licenses | $(awk -F'\t' '{printf "$%s | ", $6}' "$lines")"
  echo "| 18 | interest | $(awk -F'\t' '{printf "$%s | ", $7}' "$lines")"
  echo "| 22 | advertising | $(awk -F'\t' '{printf "$%s | ", $8}' "$lines")"
  echo "| 26 | other deductions | $(awk -F'\t' '{printf "$%s | ", $9}' "$lines")"
  echo "| 27 | **total deductions** | $(awk -F'\t' '{printf "**$%s** | ", $10}' "$lines")"
  echo ""

  if [[ -s "$capital" ]]; then
    echo "## ⚠️ line 20 — capital assets, EXCLUDED from line 27 above"
    echo ""
    echo "> depreciate via Form 4562. a §179 or bonus-depreciation election"
    echo "> may permit full expensing, but that is an election, not a"
    echo "> default — so it is held out of the totals until made."
    echo ""
    echo "| year | amount |"
    echo "|------|-------:|"
    awk -F'\t' '$3 + 0 != 0 { printf "| %s | $%.2f |\n", $1, $3 }' "$capital"
    echo ""
  fi

  local anyopen
  anyopen=$(awk -F'\t' '$12 + 0 != 0 { print }' "$lines" || true)
  if [[ -n "$anyopen" ]]; then
    echo "## ⚠️ unclassified card charges — NOT in line 26 above"
    echo ""
    echo "> these matched no vendor rule and need a human decision. any in"
    echo "> the §274(d) class — travel, a TRAVEL meal, gifts, or a passenger"
    echo "> automobile — also need a contemporaneous business-purpose record."
    echo ""
    # ⚠️ a MEAL is not flatly a §274(d) item. §274(d)(1) reaches a travel
    #    expense, and meals enter it only "while away from home". a local
    #    meal sits OUTSIDE §274(d) — but §274(k)(1)(B) still disallows the
    #    WHOLE amount unless the taxpayer or an employee was present. so a
    #    human owes two answers per charge, not one, and the second one can
    #    zero the deduction rather than merely halve it.
    echo "> ⚠️ a local meal is OUTSIDE §274(d) — but §274(k)(1)(B) disallows"
    echo "> it in full unless the taxpayer or an employee was PRESENT. so"
    echo "> answer two questions per charge: was it away from home, and was"
    echo "> someone present? see briefs/records/howto.substantiate-expenses.md"
    echo ""
    echo "| year | amount |"
    echo "|------|-------:|"
    printf '%s\n' "$anyopen" | awk -F'\t' '{ printf "| %s | $%s |\n", $1, $12 }'
    echo ""
  fi

  echo "## reconciliation"
  echo ""
  if [[ -s "$mismatches" ]]; then
    echo "⚠️ **the line split does not tie to the independent total:**"
    echo ""
    echo '```'
    cat "$mismatches"
    echo '```'
  else
    echo "✅ every year ties — the line-by-line total equals an"
    echo "independently computed total from the card net plus fees."
  fi
}

main() {
  parse_args "$@"
  validate_args

  WORKDIR=$(mktemp -d)

  local card_md="$WORKDIR/card.md" stripe_md="$WORKDIR/stripe.md"
  run_tally "card"   "$CARD_TALLY"   "$card_md"   --from "$CARDS_DIR" --by line
  run_tally "stripe" "$STRIPE_TALLY" "$stripe_md" --from "$STRIPE_DIR"

  local card_year="$WORKDIR/card.year.tsv"
  local card_line="$WORKDIR/card.line.tsv"
  local stripe_year="$WORKDIR/stripe.year.tsv"
  read_table "$card_md"   "per tax year"        > "$card_year"
  read_table "$card_md"   "per Form 1120 line"  > "$card_line"
  read_table "$stripe_md" "per tax year"        > "$stripe_year"

  if [[ ! -s "$card_year" || ! -s "$stripe_year" ]]; then
    print_blocked "could not read the tally tables — upstream output shape changed?"
    exit 1
  fi

  local facts="$WORKDIR/facts.tsv"
  gather_facts "$card_year" "$card_line" "$stripe_year" > "$facts"

  local lines="$WORKDIR/lines.tsv" capital="$WORKDIR/capital.tsv"
  compute_lines < "$facts" > "$lines" 2> "$capital"

  local mismatch="$WORKDIR/mismatch.tsv"
  reconcile_lines "$facts" "$lines" > "$mismatch" || true

  local priors="$WORKDIR/priors.tsv"
  write_priors "$priors"

  # .why = a year claimed as `--prior` that this run ALSO computed would be
  #        counted twice in the carryforward — the exact overstatement the
  #        sign normalization above guards against, by another route.
  local collision
  collision=$(awk -F'\t' 'NR==FNR { c[$1]=1; next } ($1 in c) { print $1 }' \
    "$lines" "$priors" || true)
  if [[ -n "$collision" ]]; then
    print_blocked "--prior year already computed from statements: $(printf '%s' "$collision" | tr '\n' ' ')"
    exit 2
  fi

  local report
  report=$(emit_report "$lines" "$mismatch" "$capital" "$priors")
  printf '%s\n' "$report"
  if [[ -n "$OUT_PATH" ]]; then
    printf '%s\n' "$report" > "$OUT_PATH"
  fi

  local n_years
  n_years=$(wc -l < "$lines" | tr -d ' ')

  print_eagle_header "assembled it,"
  print_tree_start "assemble.1120"
  print_tree_branch "cards" "$CARDS_DIR"
  print_tree_branch "stripe" "$STRIPE_DIR"
  print_tree_branch "years" "$n_years"

  if [[ -s "$mismatch" ]]; then
    print_tree_leaf "reconciled" "❌ see report"
    exit 3
  fi
  print_tree_leaf "reconciled" "✅ all $n_years year(s)"
}

main "$@"
