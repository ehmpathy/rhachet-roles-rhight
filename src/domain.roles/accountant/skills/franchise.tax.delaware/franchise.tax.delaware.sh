#!/usr/bin/env bash
######################################################################
# .what = compute Delaware franchise tax by both statutory methods and
#         report which one governs, plus the sensitivity band
#
# .why  = Delaware bills you under the Authorized Shares Method by
#         default, which for a standard 10,000,000-share startup charter
#         is $85,165/yr. the Assumed Par Value Method usually lands on
#         the $400 minimum instead. the gap is ~200x, and the state
#         does not volunteer it.
#
#         hand arithmetic here is how a wrong figure ends up in a sworn
#         submission. the six APV steps have a branch (par below vs
#         above the assumed par) that is easy to take the wrong way, and
#         the answer feeds a petition under 8 Del. C. §505.
#
#         the SENSITIVITY output is the part that matters most. it
#         answers "how wrong can my gross-assets figure be before the
#         tax RISES?" — which is the question the clerk will probe,
#         and the one a bare number cannot answer.
#
# ⚠️ the band is "does not RAISE", never "does not change". below the
#    band the tax can still fall: in the step-2 regime capital tracks
#    assets, so a downward revision genuinely lowers the bill. the
#    upward claim is the one that holds in both regimes, and it is the
#    one a forgotten asset actually threatens.
#
# usage:
#   franchise.tax.delaware.sh --authorized 10000000 --par 0.00001 \
#     --issued 8000000 --assets 0
#
#   franchise.tax.delaware.sh --authorized 10000000 --par 0.00001 \
#     --issued 8000000 --assets 0 --years 2
#
# options:
#   --authorized  total authorized shares (required)
#   --par         stated par value per share, e.g. 0.00001 (required)
#   --issued      total issued shares (required for the APV method)
#   --assets      total gross assets = Form 1120 Schedule L "total
#                 assets", per 8 Del. C. §503(i) (required for APV)
#   --years       number of tax years owed; multiplies the annual
#                 figure (default 1)
#   --help        show usage and exit
#
# guarantee:
#   - prints BOTH methods; the taxpayer may elect the lesser
#   - prints each of Delaware's six APV steps, so the figure can be
#     checked against corp.delaware.gov/frtaxcalc line by line
#   - prints the gross-assets band over which the answer is stable
#   - refuses no-par stock (APV is unavailable; the state requires a
#     specialist) rather than emit a number that does not apply
#   - refuses issued = 0 (the APV first step divides by it)
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ single class of stock only. a multi-class charter needs step 3
#    applied per class; this skill blocks rather than guess.
#
# ⚠️ this computes the TAX. it does not compute penalties ($200/yr) or
#    interest (1.5%/mo), which the state fixes and which you should
#    take from the state rather than derive.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=output.sh
source "$SKILL_DIR/output.sh"

AUTHORIZED=""
PAR=""
ISSUED=""
ASSETS=""
YEARS="1"

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
    --authorized) AUTHORIZED="$2"; shift 2 ;;
    --par)        PAR="$2";        shift 2 ;;
    --issued)     ISSUED="$2";     shift 2 ;;
    --assets)     ASSETS="$2";     shift 2 ;;
    --years)      YEARS="$2";      shift 2 ;;
    --help|-h)    show_help; exit 0 ;;
    *) print_blocked "unknown argument: $1"; exit 2 ;;
  esac
done

# .what = strip the punctuation humans type into share counts and dollars
# .why  = "10,000,000" and "$85,165" are what a person copies off the
#         Delaware page. a refusal there is friction with no upside; the
#         alternative is that they get hand-stripped, which is the exact
#         re-type step that corrupts figures.
denude() { echo "$1" | tr -d '$,' ; }

is_number() { [[ "$1" =~ ^[0-9]+(\.[0-9]+)?$ ]]; }

# validate presence
for pair in "authorized:$AUTHORIZED" "par:$PAR" "issued:$ISSUED" "assets:$ASSETS"; do
  name="${pair%%:*}"; val="${pair#*:}"
  if [[ -z "$val" ]]; then
    print_blocked "--$name is required"
    exit 2
  fi
done

AUTHORIZED=$(denude "$AUTHORIZED")
PAR=$(denude "$PAR")
ISSUED=$(denude "$ISSUED")
ASSETS=$(denude "$ASSETS")
YEARS=$(denude "$YEARS")

for pair in "authorized:$AUTHORIZED" "par:$PAR" "issued:$ISSUED" "assets:$ASSETS" "years:$YEARS"; do
  name="${pair%%:*}"; val="${pair#*:}"
  if ! is_number "$val"; then
    print_blocked "--$name must be a non-negative number, got: $val"
    exit 2
  fi
done

# .what = refuse no-par stock outright
# .why  = Delaware assigns no-par stock a deemed value of $100/share for
#         APV purposes, which pins essentially every charter at the
#         $200,000 maximum. the state's own calculator declines the case
#         and routes it to a specialist. a number emitted here would be
#         confidently wrong in the expensive direction.
if awk -v p="$PAR" 'BEGIN { exit !(p == 0) }'; then
  print_blocked "no-par stock: the Assumed Par Value method is unavailable. Delaware deems no-par shares worth \$100 each — call a Franchise Tax Specialist at (302) 739-3073 x3"
  exit 2
fi

if [[ "$ISSUED" == "0" ]]; then
  print_blocked "--issued is 0: the APV first step divides gross assets by issued shares. Delaware routes zero-issued cases to a specialist (corp.delaware.gov/taxcalc)"
  exit 2
fi

if awk -v i="$ISSUED" -v a="$AUTHORIZED" 'BEGIN { exit !(i > a) }'; then
  print_blocked "--issued ($ISSUED) exceeds --authorized ($AUTHORIZED): a corporation cannot issue more shares than its charter authorizes (8 Del. C. §161)"
  exit 2
fi

######################################################################
# the two methods
######################################################################

# .what = Authorized Shares Method, 8 Del. C. §503(a)(1)
# .why  = this is the DEFAULT. it is what Delaware bills when no APV
#         statement is submitted, and it is why the assessment is large:
#         it counts authorized shares and ignores assets entirely.
#
# .note = the "each additional 10,000 or fraction thereof" is a CEILING,
#         not a floor. 10,001 authorized shares costs the same as 20,000.
tax_authorized_shares() {
  awk -v n="$1" 'BEGIN {
    if (n <= 5000)  { t = 175 }
    else if (n <= 10000) { t = 250 }
    else {
      extra = n - 10000
      blocks = int(extra / 10000)
      if (extra % 10000 != 0) blocks += 1
      t = 250 + blocks * 85
    }
    if (t > 200000) t = 200000
    printf "%.2f\n", t
  }'
}

# .what = Assumed Par Value Method, 8 Del. C. §503(a)(2), which emits
#         each of the six steps Delaware publishes
# .why  = a bare total cannot be checked. the steps can be laid beside
#         corp.delaware.gov/frtaxcalc and compared line for line, which
#         is what makes the figure defensible in a §505 petition.
#
# .note = step 2 vs step 3 is the branch that gets taken wrongly. shares
#         whose STATED par is BELOW the assumed par are valued at the
#         ASSUMED par; shares at or above keep their stated par. the
#         reverse read understates the tax on exactly the charters that
#         owe more than the minimum.
#
# emits: assumed_par \t step2 \t step3 \t capital \t tax
tax_assumed_par_value() {
  awk -v assets="$1" -v issued="$2" -v authorized="$3" -v par="$4" 'BEGIN {
    raw = assets / issued
    # Delaware states the assumed par to 6 decimal places
    assumed = int(raw * 1000000 + 0.5) / 1000000

    if (par < assumed) { s2 = authorized * assumed; s3 = 0 }
    else               { s2 = 0; s3 = authorized * par }

    capital = s2 + s3

    # $400 per $1,000,000 or fraction thereof
    blocks = int(capital / 1000000)
    if (capital % 1000000 != 0) blocks += 1
    if (blocks < 1) blocks = 1
    t = blocks * 400

    if (t < 400) t = 400
    if (t > 200000) t = 200000

    printf "%.6f\t%.2f\t%.2f\t%.2f\t%.2f\n", assumed, s2, s3, capital, t
  }'
}

# .what = the largest gross-assets figure at which this charter's tax
#         cannot rise above the figure already computed
# .why  = ⚠️ THE HIGHEST-VALUE OUTPUT. the gross-assets number is the one
#         a clerk probes and the one most likely to be revised (a bank
#         balance was forgotten, a receivable was omitted). if the answer
#         is stable across the whole plausible range, a revision is not a
#         threat — and you can say so on the call instead of a re-run
#         every time the figure moves.
#
# 🚩 this was `1,000,000 x issued / authorized`, which is the T = $400
#    SPECIAL CASE, and it printed unconditionally. on any charter whose
#    tax is above the minimum it was wrong twice in one line: it named
#    the $400 floor where the real tax was higher, and it stopped at
#    the FIRST $1,000,000 block of capital rather than the block the
#    charter actually sits in.
#
#    measured 2026-08-31 — 10,000,000 authorized @ $0.50, 5,000,000
#    issued: the tax is $2,000 flat from $0 assets through $2,500,000,
#    and the old line said "$400 minimum ... up to $500,000.00" at
#    every point of that range.
#
# ⭐ the general form is derived from the TAX, not from the capital:
#
#      tax = blocks x $400        (blocks = $1M of capital, rounded up)
#      so capital may reach  blocks x $1,000,000  before the next
#      block is charged, and
#
#      band = (tax / 400) x $1,000,000 x issued / authorized
#
# ⭐ and THAT is why this helper needs no --par argument, even though
#    the §503(a)(2) step-3 branch depends on par. where stated par is
#    at or above the assumed par, capital is flat at `authorized x par`
#    and the tax cannot move until assets exceed `par x issued` — and
#    since tax = ceil(authorized x par / $1M) x $400 there, the formula
#    above returns exactly that point. a band derived from the tax
#    makes the branch a NON-QUESTION rather than a second code path
#    that can silently disagree with the first.
#
# ⚠️ this is valid ONLY when the APV method wins and the tax is under
#    the $200,000 statutory maximum. the caller branches; see the
#    sensitivity block below.
assets_band_for_tax() {
  awk -v issued="$1" -v authorized="$2" -v tax="$3" 'BEGIN {
    blocks = tax / 400
    printf "%.2f\n", blocks * 1000000 * issued / authorized
  }'
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
count() { group_thousands "$1" "%d" ; }

######################################################################
# report
######################################################################

TAX_ASM=$(tax_authorized_shares "$AUTHORIZED")
IFS=$'\t' read -r ASSUMED S2 S3 CAPITAL TAX_APV < <(tax_assumed_par_value "$ASSETS" "$ISSUED" "$AUTHORIZED" "$PAR")

GOVERNS=$(awk -v a="$TAX_ASM" -v b="$TAX_APV" 'BEGIN { print (b <= a) ? "assumed-par-value" : "authorized-shares" }')
ANNUAL=$(awk -v a="$TAX_ASM" -v b="$TAX_APV" 'BEGIN { printf "%.2f\n", (b <= a) ? b : a }')

# ⚠️ the band is derived from the TAX, so it must be computed AFTER the
#    two methods are compared — never before.
BAND=$(assets_band_for_tax "$ISSUED" "$AUTHORIZED" "$ANNUAL")
TOTAL=$(awk -v t="$ANNUAL" -v y="$YEARS" 'BEGIN { printf "%.2f\n", t * y }')
SAVED=$(awk -v a="$TAX_ASM" -v b="$ANNUAL" -v y="$YEARS" 'BEGIN { printf "%.2f\n", (a - b) * y }')

print_eagle_header "reckoned it,"
print_tree_start "franchise.tax.delaware --years $YEARS"
print_tree_branch "authorized" "$(count "$AUTHORIZED") shares @ \$$PAR par"
print_tree_branch "issued" "$(count "$ISSUED") shares"
print_tree_branch "gross assets" "\$$(money "$ASSETS")  (Form 1120 Sch. L, per §503(i))"
echo "   │"
echo "   ├─ method A · authorized shares  §503(a)(1)"
echo "   │  └─ \$$(money "$TAX_ASM") / year"
echo "   │"
echo "   ├─ method B · assumed par value  §503(a)(2)"
echo "   │  ├─ 1. assumed par = \$$(money "$ASSETS") ÷ $(count "$ISSUED") = \$$ASSUMED"
echo "   │  ├─ 2. authorized w/ par BELOW assumed  = \$$(money "$S2")"
echo "   │  ├─ 3. authorized w/ par AT-OR-ABOVE it = \$$(money "$S3")"
echo "   │  ├─ 4. assumed par value capital = \$$(money "$CAPITAL")"
echo "   │  ├─ 5. \$400 per \$1,000,000 or fraction"
echo "   │  └─ 6. \$$(money "$TAX_APV") / year  (min \$400, max \$200,000)"
echo "   │"
echo "   ├─ governs: $GOVERNS  →  \$$(money "$ANNUAL") / year"
echo "   ├─ × $YEARS year(s) = \$$(money "$TOTAL")  ⬅️ tax only"
echo "   ├─ vs method A = \$$(money "$SAVED") avoided"
echo "   │"
echo "   └─ sensitivity"
if [[ "$GOVERNS" == "authorized-shares" ]]; then
  # method A counts authorized shares and ignores assets entirely, so
  # once it wins there is no assets figure that can raise the bill.
  echo "      ├─ method A governs at \$$(money "$ANNUAL") / year, and method A"
  echo "      │  does not count assets at all"
  echo "      └─ so NO gross-assets figure raises this tax"
elif awk -v t="$ANNUAL" 'BEGIN { exit !(t >= 200000) }'; then
  echo "      ├─ this charter is already at the \$200,000 statutory maximum"
  echo "      └─ so no gross-assets figure raises it further"
else
  # ⚠️ "does NOT RAISE", never "does not change". below the band the tax
  #    can still FALL — in the step-2 regime capital tracks assets, so a
  #    downward revision genuinely lowers the bill. the useful claim, and
  #    the only one that holds in both regimes, is the upward one: this
  #    is what a clerk probes when a forgotten asset surfaces.
  echo "      ├─ the tax holds at \$$(money "$ANNUAL") / year for any gross"
  echo "      │  assets up to \$$(money "$BAND")"
  echo "      └─ so a revision to the assets figure below that line"
  echo "         does NOT raise the tax"
fi
echo ""
echo "⚠️ tax only. penalties (\$200/yr) and interest (1.5%/mo) are fixed"
echo "   by the state — take them from Delaware, do not derive them."
echo ""
