# howto: substantiate business expenses — is a card statement enough?

## .what

what records a corporation must keep to defend a deduction, and when a
credit-card statement is **not** enough on its own.

> ⚠️ **mixed provenance.** the statutory core is bhrowser-verified (§6001,
> §179, §1.179-5 on 2026-08-01; §274(a), (d), (k), §280F(d)(4), §6651(a)/(j) on
> 2026-08-31). sections marked *(unverified)* came from IRS pages captured via
> WebFetch, and are a **lead, not authority**, until re-pulled. one of those
> pages is known **stale** — see `the heightened rule` below.

## .why

a deduction is not established by the fact that money left the account. §162
asks whether the cost was *ordinary and necessary* **for the business**, and
the burden is on the taxpayer.

| a card statement proves | a card statement does NOT prove |
|-------------------------|----------------------------------|
| payee | **what was bought** |
| amount | **business purpose** |
| date | who benefited |
| that payment occurred | whether it was personal |

---

## .the verified core — does a card statement substantiate?

**for an ordinary vendor cost: yes, the statement is a record.** the
heightened-substantiation rule is a **closed list**, and cloud/software vendors
are not on it:

> "**No deduction or credit shall be allowed**— (1) under section 162 or
> 212 for any **traveling expense** (including meals and lodging while away
> from home), (2) for any expense for **gifts**, or (3) with respect to any
> **listed property** (as defined in section 280F(d)(4)), unless the
> taxpayer substantiates by adequate records or by sufficient evidence
> corroborating the taxpayer's own statement (A) the amount of such expense
> or other item, (B) the time and place of the travel or the date and
> description of the gift, (C) the **business purpose** of the expense or
> other item, and (D) the business relationship to the taxpayer of the
> person receiving the benefit. **The Secretary may by regulations provide
> that some or all of the requirements of the preceding sentence shall not
> apply in the case of an expense which does not exceed an amount
> prescribed pursuant to such regulations.** This subsection shall not
> apply to any qualified nonpersonal use vehicle (as defined in subsection
> (i))."
> — [26 U.S.C. § 274(d)](https://www.law.cornell.edu/uscode/text/26/274)

- three items: **travel, gifts, listed property**. cloud hosts, API vendors, ad platforms, and SaaS tools are none of them
- the bolded sentence is the statutory root of the **$75 de-minimis**: §274(d) names no figure; it delegates one to Reg. §1.274-5

what governs the rest is the general record rule, which prescribes no
particular document:

> "Every person liable for any tax imposed by this title... shall **keep
> such records, render such statements, make such returns, and comply with
> such rules and regulations as the Secretary may from time to time
> prescribe.**"
> — [26 U.S.C. § 6001](https://www.law.cornell.edu/uscode/text/26/6001)

### ⛔ §274(d) DOES NOT REACH A LOCAL MEAL — read item (1) again

item (1) is a **travel** item. meals enter it only *"while away from home"*.

| the meal was... | §274(d)? | why |
|-----------------|----------|-----|
| eaten **away from home** on business travel | ✅ **yes** | it is a traveling expense under (1) |
| eaten **locally** — a client lunch across town | ❌ **no** | not travel, not a gift, not listed property |

### ⭐ BUT A LOCAL MEAL IS NOT UNGATED — §274(k) is the rule that reaches it

> "**No deduction shall be allowed under this chapter for the expense of any
> food or beverages unless**— (A) such expense is **not lavish or
> extravagant** under the circumstances, and (B) the taxpayer (or an
> employee of the taxpayer) **is present at the furnishing** of such food or
> beverages."
> — [26 U.S.C. § 274(k)(1)](https://www.law.cornell.edu/uscode/text/26/274)

| gate | subsection | what it demands |
|------|-----------|-----------------|
| **presence** | §274(k)(1)(B) | the taxpayer or an employee was **there** |
| **not lavish** | §274(k)(1)(A) | reasonable under the circumstances |
| **the 50% cap** | §274(n)(1) | half, and the year picks the rate — see the deduction catalog |
| heightened records | §274(d)(1) | **only if away from home** |

🎯 **the presence gate bites a solo founder.** a meal bought for a client the
founder did not attend is disallowed **in full** — no receipt cures it.

⚠️ §274(k)(2) carves out the expenses described in §274(e)(2), (3), (4), (7),
(8) and (9). those exceptions were **not pulled** and are not analyzed here.

### what this means in practice

| cost | §274(d) applies? | is the card statement enough to file? |
|------|------------------|---------------------------------------|
| cloud, API, ad platforms, SaaS | ❌ no | ✅ yes |
| hardware (a laptop) | ❌ no — **see below** (but capitalize) | ✅ yes |
| registered agent, franchise tax | ❌ no | ✅ yes |
| **a meal, eaten locally** | ❌ **no** — but §274(k) still gates it | ⚠️ needs **who was present** |
| **a meal, away from home** | ✅ **yes** | ❌ **no** — needs purpose + who |
| **travel** | ✅ **yes** | ❌ **no** — needs purpose + place |

- vendor invoices **strengthen** an audit position for the first group but do not **gate the return**; for the last three rows they are close to mandatory
- hold undecided meal/travel charges **out** of line 26 until classified (`assemble.1120` does this)
- a charge description rarely says whether the taxpayer was **away from home** — a ferry fare implies travel (§274(d), full record set); a local meal needs only the §274(k) presence answer. ask; do not infer
- the statement is weakest on **what was bought**: for a merchant whose name implies no business purpose (a general retailer), the statement alone leaves purpose unproven — the unclassified bucket is a decision list, not a deduction

### ✅ why a laptop is NOT listed property — the answer MOVED in 2018

§274(d)(3) reaches *"listed property (as defined in section 280F(d)(4))"*:

> "(i) any **passenger automobile**, (ii) any other property used as a
> **means of transportation**, (iii) any property of a type generally used
> for purposes of **entertainment, recreation, or amusement**, and (iv) any
> other property of a type **specified by the Secretary by regulations**."
> — [26 U.S.C. § 280F(d)(4)(A)](https://www.law.cornell.edu/uscode/text/26/280F)

- a computer is not among them. **it used to be** — TCJA §13202 struck the computer clause effective 2018, so a pre-2018 recollection demands §274(d) records for every laptop
- a needle search for `computer` over the §280F page returns zero hits, which a struck clause and a wrong selector both produce; the clause list is the evidence

---

## 🛑 the real file-blocker is NOT receipts — it is the §179 election

> "The election under section 179... shall be made on the taxpayer's
> **first income tax return for the taxable year to which the election
> applies (whether or not the return is timely)** or on an amended return
> filed within the time prescribed by law (including extensions) for filing
> the return for such taxable year."
> — [26 CFR § 1.179-5(a)](https://www.ecfr.gov/current/title-26/section-1.179-5)

- ✅ **"whether or not the return is timely"** — a delinquent original return is still a valid vehicle
- 🛑 **"first income tax return"** — once filed without the election, the only route back is an amended return within the filing period, which for a years-old year has generally closed
- so decide on each capital asset **before** that year's return goes out

### ⚠️ but §179 is likely the WRONG tool in a loss year

> "The amount allowed as a deduction under subsection (a) for any taxable year
> **(determined after the application of paragraphs (1) and (2))** shall not
> exceed the aggregate amount of taxable income of the taxpayer for such taxable
> year which is derived from the active conduct by the taxpayer of any trade or
> business during such taxable year."
> — [26 U.S.C. § 179(b)(3)(A)](https://www.law.cornell.edu/uscode/text/26/179)

- the income test is the **third** of §179(b)'s limitations: the §179(b)(1) dollar cap and (b)(2) phase-out apply first. quote the parenthetical; an ellipsis over it hides that
- in a loss year the income cap brings §179 to **$0**, and the disallowed amount carries forward
- bonus depreciation under §168(k) has **no income limitation**, so it can create or deepen an NOL where §179 cannot

### ✅ resolved — and the §179 read above is overstated

full grid and cross-publisher tests: `deductions/compare.179-vs-168k-bonus-vs-macrs.md`.

| open question | answer |
|---------------|--------|
| 2023 bonus percentage | **80%** — §168(k)(6)(A)(ii), **2023 edition** |
| does a computer qualify? | **yes** — §168(k)(2)(A)(i)(I) → §168(e)(3)(B)(iv) → §168(i)(2)(A)(i) |

1. **the §179 carryover is better than "merely carried forward" — while the dollar cap is slack.** §179(b)(3)(B) carries it over **indefinitely**, free of the **80%** ceiling an NOL faces under §172(a)(2)(B). ⚠️ **it is NOT uncapped.** §179(b)(3)(B)(ii) bounds it at the excess of

   > "(I) the limitation of paragraphs (1) and (2) (or if lesser, the
   > aggregate amount of taxable income referred to in subparagraph (A)),
   > over (II) the amount allowable as a deduction under subsection (a)
   > for such taxable year without regard to this subparagraph"

   so the carryover is also capped by the year's remaining §179(b)(1)/(b)(2) headroom — slack for a small taxpayer, **not** for one near the phase-out.
2. **there is no election to agonize over.** §168(k)(1)(A) says bonus "**shall include**" — it applies automatically; §168(k)(7) makes the affirmative act the election **out**. the §1.179-5(a) one-shot trap binds only on §179.

🛑 **the trap that IS real:** the 2023 rate is not in current law. §168(k)(6)
was **repealed 2025-07-04** (Pub. L. 119-21 §70301(b)(1)(B)) and current
§168(k)(1)(A) reads a flat **100 percent**. pull the **2023 edition** of the
Code for a 2023 asset.

---

## 🟢 there is no penalty clock on a zero-tax return

> "...there shall be added to the amount required to be shown as tax on such
> return **5 percent of the amount of such tax** if the failure is for not
> more than 1 month, with an additional 5 percent for each additional
> month... not exceeding 25 percent in the aggregate"
> — [26 U.S.C. § 6651(a)(1)](https://www.law.cornell.edu/uscode/text/26/6651)

> "In the case of a failure to file a return of tax imposed by chapter 1
> within **60 days** of the date prescribed for filing of such return...
> the addition to tax under paragraph (1) **shall not be less than the
> lesser of $435 or 100 percent of the amount required to be shown as tax
> on such return.**"
> — 26 U.S.C. § 6651(a), flush text

with **$0 tax due**, 5% of $0 is $0, and the lesser of the floor and $0 is $0.
**no failure-to-file penalty accrues on a zero-tax C corporation return.**

### ⚠️ $435 is the STATUTORY BASE, not the operative figure

> "**Adjustment for inflation.** ... In the case of any return required to
> be filed in a **calendar year beginning after 2020**, the $435 dollar
> amount under subsection (a) shall be **increased** by an amount equal to
> such dollar amount multiplied by the **cost-of-living adjustment**
> determined under section 1(f)(3)... If any amount adjusted under
> paragraph (1) is not a multiple of $5, such amount shall be **rounded to
> the next lowest multiple of $5**."
> — [26 U.S.C. § 6651(j)](https://www.law.cornell.edu/uscode/text/26/6651)

- the $0 conclusion holds whatever the indexed figure is — the floor is the *lesser* of it and 100% of tax
- 🛑 **never quote $435 for a year in which tax IS due.** take the year's figure from the IRS, and record which year it belongs to

⚠️ **this is C-corp-specific and §6651-specific:**

| entity | late-file penalty on a zero-tax return |
|--------|----------------------------------------|
| **C corporation** (§6651) | **$0** — proportional to tax |
| S corporation (§6699) | **per shareholder, per month, regardless of tax** |
| partnership (§6698) | **per partner, per month, regardless of tax** |

**practical read:** no financial clock — a reason not to rush a bad election,
*not* a reason to defer indefinitely, since an unfiled year is a year whose
loss was never established.

---

## .the general rule *(unverified)*

> "You generally must have documentary evidence, such as receipts,
> canceled checks, or bills, to support your expenses."
> — [IRS, Burden of proof][irs-burden] *(unverified)*

supporting documents should show: **payee, amount paid, proof of payment,
date incurred, and a description of the item or service that shows the
amount was for a business expense** *(unverified)*. that last element is the
one a statement line lacks.

> "A combination of supporting documents may be needed to substantiate all
> elements of the purchase." *(unverified)*

so the intended shape is **statement + invoice**, not statement alone.

## 🛑 the heightened rule — §274(d) — and an AGENCY PAGE THAT IS STALE

the verified core governs. this section records a live trap:

> "Additional evidence is required for travel, **entertainment**, gifts, and
> auto expenses."
> — [IRS, Burden of proof][irs-burden] *(unverified — and STALE)*

⛔ **entertainment is not a §274(d) category** — there is no deduction left to
substantiate:

> "**No deduction otherwise allowable under this chapter shall be allowed**
> for any item— (A) **Activity.** With respect to an activity which is of a
> type generally considered to constitute **entertainment, amusement, or
> recreation**, or (B) **Facility.** With respect to a facility used in
> connection with an activity referred to in subparagraph (A)."
> — [26 U.S.C. § 274(a)(1)](https://www.law.cornell.edu/uscode/text/26/274)

- a reader who follows the page keeps a receipt file for a deduction that cannot be claimed
- ✅ **"auto" is still right** — §280F(d)(4)(A)(i), *"any passenger automobile"*, is listed property under §274(d)(3). one item of four went stale, which is why the page passes a skim

### the $75 threshold

Reg. §1.274-5 requires documentary evidence for lodging and for any
expenditure of **$75 or more**, plus a record of the business purpose and, for
meals, the business relationship of the people present. §274(d) authorizes
such a threshold (see the verified core); the **$75 figure itself is unpulled**
— it lives in the regulation, set by a Notice.

## .so: do cloud and API vendor charges need receipts?

mostly no — but pull them for the largest lines anyway.

| factor | cloud/API vendors | verdict |
|--------|-------------------|---------|
| §274(d) category? | no | ordinary rule applies |
| business purpose evident from payee? | yes — no plausible personal use | strong |
| amount material? | often, for the top lines | **material — get the invoices** |
| payment side already reconciled? | yes, to each statement's declared total | solid |

| tier | vendors | action |
|------|---------|--------|
| **pull invoices** | the largest lines (e.g. ad spend, cloud, telephony) | material amounts; exportable in bulk |
| **statement suffices** | the $10–$500/yr SaaS tail | payee name carries business purpose on its face |
| **must have records** | unclassified meal / travel charges | §274(d) or §274(k) class |

invoices for the largest lines also give a **second independent source** to
reconcile against, as the Balance summary does for Stripe. a disagreement
found before the return goes out is a finding, not an examination issue.

## .the retention period

keep records **at least 3 years** from the file date (the ordinary
assessment period), **6 years** if income is understated by >25%, and
**indefinitely** for anything that establishes basis in a capital asset
*(unverified — confirm)*.

⚠️ for **NOL carryforwards**, records that substantiate a loss year must be kept
until the statute runs on *every year the NOL is carried into*. for example,
an NOL from year 1 consumed in year 5 needs year-1 records live into ~year 9.

## .the practical file

per tax year, keep together:

1. the card statements (the payment record)
2. the Stripe exports (the revenue record)
3. **vendor invoices for material spend**
4. **a note of business purpose for anything in the §274(d) class**
5. the computed tallies + their reconcile proof

## .sources

| ref | source | status | chars |
|-----|--------|--------|------:|
| — | [IRC § 274](https://www.law.cornell.edu/uscode/text/26/274) — (a), (d), (k) sliced whole | ✅ **bhrowser 2026-08-31** | 30,644 |
| — | [IRC § 280F](https://www.law.cornell.edu/uscode/text/26/280F) — (d)(4) sliced whole | ✅ **bhrowser 2026-08-31** | 13,408 |
| — | [IRC § 6651](https://www.law.cornell.edu/uscode/text/26/6651) — (a) flush text + (j) | ✅ **bhrowser 2026-08-31** | 9,352 |
| — | [IRC § 6001](https://www.law.cornell.edu/uscode/text/26/6001) | ✅ bhrowser 2026-08-01 | — |
| — | [IRC § 179(b)](https://www.law.cornell.edu/uscode/text/26/179) — (b)(1)–(b)(6) sliced whole | ✅ **bhrowser 2026-08-31** — re-pulled; the 08-01 quote was truncated | 39,218 |
| — | [26 CFR § 1.179-5(a)](https://www.ecfr.gov/current/title-26/section-1.179-5) | ✅ bhrowser 2026-08-01 (eCFR API) | — |
| irs-burden | [IRS — Burden of proof](https://www.irs.gov/businesses/small-businesses-self-employed/burden-of-proof) | ⛔ **unverified AND stale** — see §274(a) above | — |
| irs-records | [IRS — What kind of records should I keep](https://www.irs.gov/businesses/small-businesses-self-employed/what-kind-of-records-should-i-keep) | 🚩 unverified | — |
| irs-guide | [IRS — Guide to business expense resources](https://www.irs.gov/forms-pubs/guide-to-business-expense-resources) | 🚩 unverified | — |
| — | IRC §162; Reg. §1.6001-1; **Reg. §1.274-5** (the $75 figure) | 🚩 **not yet pulled** | — |

a ✅ records that the **source** was pulled, not that the copied quote is
complete; only a re-pull checks the quote.

### the year question

- **§274**: the 2022, 2023 and 2024 editions are byte-identical (62,286 chars), confirmed against a control that had to fail (an 1899 edition → 566-char "Page Not Found") and a different-section control (§262, 2022 → 1,457 chars). a current-text pull is sound for 2022–2024
- **§6651**: does **not** transfer — (j) indexation changes the operative figure by year. editions were not pulled, and no year-specific figure is asserted

### provenance

pulled with **bhrowser**, headful, per `rule.require.bhrowser-citations`. every
slice ran header-to-next-header with a refusal guard.

- `.scratch/irc-274d-6651-substantiation.play.ts` — §274(d), §274(k), §6651(a) flush text, §6651(j), plus every §274 subsection header
- `.scratch/irc-280f-274a-listed.play.ts` — §280F(d)(4) clause list, §274(a)

⛔ `.scratch` is gitignored, so both playbooks are absent from git and the npm
package; the quotes stand, the re-run does not. the cure is a move to
`briefs/refs/`; tracked as a task.

[irs-burden]: https://www.irs.gov/businesses/small-businesses-self-employed/burden-of-proof

## .see also

- `../revenue/howto.collect-figures.from=stripe.md` — the revenue record
- `../deductions/catalog.deductible-expenses.md` — category → 1120 line
- `skills/statement.tally` — computes + reconciles the card side
- `skills/stripe.tally` — computes + reconciles the revenue side
