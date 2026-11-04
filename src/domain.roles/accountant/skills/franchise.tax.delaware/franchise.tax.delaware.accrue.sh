#!/usr/bin/env bash
######################################################################
# .what = derive the penalty and interest on unpaid Delaware franchise
#         tax, and test whether a bill the State issued reconciles to
#         the statute
#
# .why  = a State assessment is a number with no arithmetic attached.
#         you cannot tell a correct bill from a wrong one, and you
#         cannot tell WHICH TAX YEARS it covers — which is the fact the
#         whole reinstatement sequence depends on.
#
#         ⚠️ the trap this skill exists to avoid: franchise tax is NOT
#         a once-a-year March 1 obligation once the liability reaches
#         $5,000. §504(a) puts 40% of it on June 1 of the tax year
#         itself, and §504(c) runs interest from EACH due date. an
#         accrual computed off a single March 1 date understates the
#         interest badly, and the error grows with the assessment.
#
# usage:
#   franchise.tax.delaware.accrue.sh --tax 85165 --years 2022,2023 \
#     --asof 2024-03-01
#
#   # test a State bill against the statute, and search for the
#   # accrual date that reproduces it
#   franchise.tax.delaware.accrue.sh --tax 85165 --years 2022,2023 \
#     --fit 191652.43
#
# options:
#   --tax     the annual franchise tax per year (required)
#   --years   comma-separated tax years, e.g. 2022,2023 (required)
#   --asof    accrual through this date, YYYY-MM-DD
#   --fit     a known total; scans accrual dates for one that
#             reproduces it, and reports the residual
#   --help    show usage and exit
#
# the statute:
#   §502(c)  $200 added per year the annual report is not filed by
#            March 1
#   §504(a)  when the year's liability is estimated at $5,000 or more,
#            the tax is due 40% Jun 1 / 20% Sep 1 / 20% Dec 1 of the
#            tax year, and the remainder Mar 1 following. below
#            $5,000 the whole tax is due Mar 1 following.
#   §504(c)  unpaid tax bears interest at 1.5% "for each month or
#            portion thereof" from the due dates in §504
#
# guarantee:
#   - prints every installment with its due date and month count, so
#     the total can be checked against the statute line by line
#   - --fit reports the BEST candidate and its residual; it never
#     claims a match it did not find
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ this DERIVES the accrual to test a bill. it does not replace the
#    State's figure. where the two disagree, the disagreement is the
#    result — take it to the Division of Corporations, do not assume
#    either side is right.
#
# ⚠️ interest is applied as SIMPLE interest on each unpaid installment.
#    whether Delaware compounds is not stated in §504(c) and has not
#    been verified. a compound reading would produce a larger figure.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=output.sh
source "$SKILL_DIR/output.sh"

TAX=""
YEARS=""
ASOF=""
FIT=""

# .what = print the doc block that sits BETWEEN the two #### banners
# .why  = ⚠️ the guard is `seen == 1`, not `seen == 0`. the doc block is
#         INSIDE the banners, so `seen == 0` matches only the shebang, and
#         --help then renders the single line `!/usr/bin/env bash`.
#         a broken help renderer is SILENT — it exits 0 and prints one
#         plausible line, so neither the exit code nor stderr reports it.
#         only a human who reads the output notices. clamped by [case0].
show_help() {
  awk '/^####/ { if (seen++) exit; next } seen == 1 && /^#/ { sub(/^# ?/, ""); print }' "${BASH_SOURCE[0]}"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --skill|--repo|--role) shift 2 ;;
    --tax)   TAX="$2";   shift 2 ;;
    --years) YEARS="$2"; shift 2 ;;
    --asof)  ASOF="$2";  shift 2 ;;
    --fit)   FIT="$2";   shift 2 ;;
    --help|-h) show_help; exit 0 ;;
    *) print_blocked "unknown argument: $1"; exit 2 ;;
  esac
done

denude() { echo "$1" | tr -d '$,' ; }

TAX=$(denude "${TAX:-}")
FIT=$(denude "${FIT:-}")

if [[ -z "$TAX" || -z "$YEARS" ]]; then
  print_blocked "--tax and --years are both required"
  exit 2
fi
if [[ -z "$ASOF" && -z "$FIT" ]]; then
  print_blocked "one of --asof or --fit is required"
  exit 2
fi
if ! [[ "$TAX" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
  print_blocked "--tax must be a number, got: $TAX"
  exit 2
fi
if [[ -n "$ASOF" ]] && ! [[ "$ASOF" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  print_blocked "--asof must be YYYY-MM-DD, got: $ASOF"
  exit 2
fi

######################################################################
# the installment schedule
######################################################################

# .what = emit the §504(a) due dates and amounts for one tax year
# .why  = ⚠️ the $5,000 threshold is the whole point. above it the tax
#         is due in FOUR pieces that start Jun 1 OF THE TAX YEAR — nine
#         months before the naive "March 1 following" date. an accrual
#         that misses this understates interest on 80% of the balance.
#
# emits: due_date \t amount \t label
installments_for_year() {
  local year="$1" tax="$2"
  awk -v y="$year" -v t="$tax" 'BEGIN {
    if (t >= 5000) {
      printf "%d-06-01\t%.2f\t40%% estimated (§504(a)(1))\n", y,     t * 0.40
      printf "%d-09-01\t%.2f\t20%% estimated (§504(a)(2))\n", y,     t * 0.20
      printf "%d-12-01\t%.2f\t20%% estimated (§504(a)(3))\n", y,     t * 0.20
      printf "%d-03-01\t%.2f\t20%% remainder (§504(a)(4))\n", y + 1, t * 0.20
    } else {
      printf "%d-03-01\t%.2f\treturn + tax due (§504(a))\n", y + 1, t
    }
  }'
}

# .what = whole months elapsed from due to asof, where any partial
#         month counts as a full one
# .why  = §504(c) says "for each month or portion thereof". a floor
#         here silently drops up to a month of interest per installment,
#         which across 8 installments is a material understatement.
months_between() {
  local due="$1" asof="$2"
  awk -v d="$due" -v a="$asof" 'BEGIN {
    split(d, D, "-"); split(a, A, "-")
    m = (A[1] - D[1]) * 12 + (A[2] - D[2])
    if (A[3] > D[3]) m += 1
    if (m < 0) m = 0
    print m
  }'
}

# .what = total penalty + interest across all years, through a date
# emits: penalty \t interest \t total_with_tax
accrue_through() {
  local asof="$1"
  local penalty=0 interest=0 taxtotal=0

  IFS=',' read -ra YEARLIST <<< "$YEARS"
  for y in "${YEARLIST[@]}"; do
    y="${y// /}"
    # §502(c): $200 per year the report was not filed by March 1
    penalty=$(awk -v p="$penalty" 'BEGIN { printf "%.2f\n", p + 200 }')
    taxtotal=$(awk -v t="$taxtotal" -v x="$TAX" 'BEGIN { printf "%.2f\n", t + x }')

    while IFS=$'\t' read -r due amt _label; do
      local m
      m=$(months_between "$due" "$asof")
      interest=$(awk -v i="$interest" -v a="$amt" -v m="$m" \
        'BEGIN { printf "%.2f\n", i + a * 0.015 * m }')
    done < <(installments_for_year "$y" "$TAX")
  done

  awk -v p="$penalty" -v i="$interest" -v t="$taxtotal" \
    'BEGIN { printf "%.2f\t%.2f\t%.2f\n", p, i, t + p + i }'
}

# .what = group digits by thousands, with no locale dependence
# .why  = printf's ' flag needs both a grouping locale and an awk that
#         honors it; mawk (the Ubuntu default) does neither, so the CI
#         runner printed $85165.00 where a reader expects $85,165.00
group_thousands() {
  awk -v n="$1" -v fmt="$2" 'BEGIN {
    s = sprintf(fmt, n); sign = ""
    if (substr(s, 1, 1) == "-") { sign = "-"; s = substr(s, 2) }
    p = index(s, "."); whole = (p ? substr(s, 1, p - 1) : s); frac = (p ? substr(s, p) : "")
    out = ""
    while (length(whole) > 3) { out = "," substr(whole, length(whole) - 2) out; whole = substr(whole, 1, length(whole) - 3) }
    print sign whole out frac
  }'
}
money() { group_thousands "$1" "%.2f" ; }

######################################################################
# report
######################################################################

if [[ -n "$FIT" ]]; then
  # .what = scan month-ends across a decade for the accrual date that
  #         reproduces the State's figure
  # .why  = the State's bill carries no "as of" date. the date that
  #         reproduces it IS a result — it tells you when accrual
  #         stopped, which tells you whether interest halted at void.
  print_eagle_header "lets test that bill,"
  print_tree_start "franchise.tax.delaware.accrue --fit \$$(money "$FIT")"
  print_tree_branch "annual tax" "\$$(money "$TAX") × years $YEARS"
  echo "   │"
  echo "   └─ closest accrual dates"

  best_date=""; best_delta=""
  for yy in 2023 2024 2025 2026; do
    for mm in 01 02 03 04 05 06 07 08 09 10 11 12; do
      cand="${yy}-${mm}-01"
      IFS=$'\t' read -r _p _i tot < <(accrue_through "$cand")
      delta=$(awk -v a="$tot" -v b="$FIT" 'BEGIN { d = a - b; printf "%.2f\n", (d < 0) ? -d : d }')
      if [[ -z "$best_delta" ]] || awk -v a="$delta" -v b="$best_delta" 'BEGIN { exit !(a < b) }'; then
        best_delta="$delta"; best_date="$cand"
      fi
    done
  done

  yearcount=$(echo "$YEARS" | tr ',' '\n' | wc -l)
  taxsum=$(awk -v t="$TAX" -v y="$yearcount" 'BEGIN { printf "%.2f", t * y }')
  IFS=$'\t' read -r P I TOT < <(accrue_through "$best_date")
  echo "      ├─ best accrual date: $best_date"
  echo "      ├─ tax          \$$(money "$taxsum")"
  echo "      ├─ penalty      \$$(money "$P")   (§502(c), \$200/yr)"
  echo "      ├─ interest     \$$(money "$I")   (§504(c), 1.5%/mo)"
  echo "      ├─ = total      \$$(money "$TOT")"
  echo "      ├─ the bill     \$$(money "$FIT")"
  echo "      └─ residual     \$$(money "$best_delta")"
  echo ""
  if awk -v d="$best_delta" 'BEGIN { exit !(d > 500) }'; then
    echo "🚩 residual over \$500 — the statute does NOT reproduce this bill."
    echo "   the year set, the annual tax, or the accrual model is wrong."
    echo "   do NOT present a derived figure as the amount owed."
  else
    echo "✅ within \$500 — the statute reproduces the bill on these"
    echo "   assumptions. still confirm the year set with the State."
  fi
  echo ""
  exit 0
fi

IFS=$'\t' read -r P I TOT < <(accrue_through "$ASOF")

print_eagle_header "reckoned the accrual,"
print_tree_start "franchise.tax.delaware.accrue --asof $ASOF"
print_tree_branch "annual tax" "\$$(money "$TAX")"
print_tree_branch "tax years" "$YEARS"
echo "   │"
echo "   └─ schedule"
IFS=',' read -ra YEARLIST <<< "$YEARS"
for y in "${YEARLIST[@]}"; do
  y="${y// /}"
  echo "      ├─ tax year $y"
  while IFS=$'\t' read -r due amt label; do
    m=$(months_between "$due" "$ASOF")
    int=$(awk -v a="$amt" -v m="$m" 'BEGIN { printf "%.2f\n", a * 0.015 * m }')
    printf "      │  ├─ %s  \$%12s  × %2s mo → \$%10s  %s\n" \
      "$due" "$(money "$amt")" "$m" "$(money "$int")" "$label"
  done < <(installments_for_year "$y" "$TAX")
  echo "      │  └─ + \$200.00 penalty (§502(c))"
done
echo "      │"
echo "      ├─ penalty   \$$(money "$P")"
echo "      ├─ interest  \$$(money "$I")"
echo "      └─ TOTAL     \$$(money "$TOT")"
echo ""
echo "⚠️ derived to TEST the State's figure, not to replace it."
echo "   simple interest assumed; §504(c) does not state compound accrual."
echo ""
