# define.authorized-vs-issued-vs-outstanding-shares

## .what

three different share counts that solo founders routinely conflate:

| count | definition | where it lives |
|-------|------------|----------------|
| **authorized** | the cap — the maximum number of shares the certificate of incorporation permits the corporation to issue | certificate of incorporation (public) |
| **issued** | shares the board has actually issued, for which the corporation has received consideration, recorded in the stock ledger | corporate records (private) |
| **outstanding shares** | issued shares still held by someone other than the corporation itself | corporate records (private) |
| **treasury** | issued shares the corporation has reacquired and holds — `issued − outstanding shares` | corporate records (private) |

the identity: `issued = outstanding shares + treasury`. and always `issued ≤ authorized`.

---

## .why

Delaware computes franchise tax from **authorized** shares under one method and from **issued** shares under the other. a corporation that mixes up the two counts on its annual report can be assessed a tax two to three orders of magnitude larger than it owes.

the real-world driver for this brief: a solo-founder Delaware C-corp with **10,000,000 authorized shares** was assessed **~$191,652** in back franchise tax. its annual reports declared **8,000,000 issued shares** and **$0 total gross assets** for three consecutive years.

> ⚠️ the founder believed no shares were ever issued. the board consent and the
> stock ledger show **8,000,000 shares issued 2020-05-28**, unchanged since — the
> annual reports were right. the remedy is an **attestation of 8,000,000 issued
> shares**; a zero-shares affidavit would have sworn to a falsehood.
>
> so read *"what changes if issued shares is actually 0"* below as a
> **hypothetical** — an open question of Delaware law, not this corporation's
> posture.

that gap — between what the charter authorizes, what the report declares, and what the stock ledger actually shows — is the whole subject here.

---

## .the three counts, precisely

### authorized

the number set by the certificate of incorporation. it is a **grant of capacity**, not a fact about ownership. it changes only by charter amendment filed with the Delaware Secretary of State.

### issued

a share is issued when the corporation has completed the act of issuance and received the consideration for it. DGCL §152:

> "The board of directors may authorize capital stock to be issued for consideration consisting of cash, any tangible or intangible property or any benefit to the corporation, or any combination thereof."
>
> "The capital stock issued in accordance with this section shall be deemed to be fully paid and nonassessable stock upon receipt by the corporation of such consideration."
>
> — [8 Del. C. §152](https://delcode.delaware.gov/title8/c001/sc05/index.html)

DGCL §153 sets the consideration floor:

> "Shares of stock with par value may be issued for such consideration, having a value not less than the par value of the shares so issued, as determined from time to time in accordance with § 152 of this title."
>
> — [8 Del. C. §153](https://delcode.delaware.gov/title8/c001/sc05/index.html)

### outstanding shares

issued shares held by a person other than the corporation. treasury shares are issued but not outstanding, and DGCL §160(c) strips their governance weight:

> "Shares of a corporation's capital stock shall neither be entitled to vote nor be counted for quorum purposes if such shares belong to: (1) The corporation..."
>
> — [8 Del. C. §160(c)](https://delcode.delaware.gov/title8/c001/sc05/index.html)

---

## .where each number lives — and the asymmetry that matters

| count | public record? | how a third party verifies it |
|-------|----------------|-------------------------------|
| authorized | **yes** — on the certificate of incorporation held by the Delaware Division of Corporations | order a certified copy of the charter |
| issued | **no** — corporate books only | ask the corporation; there is no state registry |
| outstanding shares | **no** — corporate books only | ask the corporation |
| treasury | **no** — derived from the two above | ask the corporation |

Delaware knows your authorized count with certainty because it holds the document that sets it. Delaware knows your issued count **only because you told it** on the annual report.

that asymmetry has two consequences:

1. **the authorized-shares tax is unfalsifiable by the taxpayer.** you cannot argue the number down; the state holds the charter.
2. **the issued-shares figure is self-attested, so the state polices it by pattern detection and by demand for sworn statements.** when the self-reported numbers look implausible — a fixed asset figure repeated year over year, or a share count that jumps to or from zero — the state escalates.

> "An example is 10,000,000 shares showing issued one year on the annual report and then 0 shares showing issued the next year." ... such discrepancies "will trigger the state to request additional information about share issuance or require a correction to be filed."
>
> "Clients may also claim Zero gross assets in multiple years. This will also trigger additional scrutiny and may require corrections to be filed."
>
> — [Harvard Business Services: Common Mistakes on the Delaware Annual Report](https://www.delawareinc.com/blog/common-annual-report-mistakes/)

that second quote maps exactly onto the case at hand: **$0 gross assets, three consecutive years.**

---

## .how a share actually becomes "issued"

| step | what happens | authority |
|------|--------------|-----------|
| 1 | board resolution authorizes the issuance and fixes consideration | DGCL §152 |
| 2 | subscription, purchase, or restricted-stock agreement executed | contract |
| 3 | corporation **receives** the consideration — cash, property, or benefit | DGCL §152 (stock becomes fully paid and nonassessable "upon receipt") |
| 4 | consideration is at least par value, if the shares carry par | DGCL §153 |
| 5 | entry made in the stock ledger | DGCL §219(c), §224 |
| 6 | certificate delivered, or book-entry record made for uncertificated shares | DGCL §158 |

step 5 is the one that decides the count. the stock ledger is the statutory system of record, and §219(c) makes it **"the only evidence as to who are the stockholders"** — ⚠️ **for two enumerated rights, and only those two.** the sentence ends *"entitled by this section to examine the list required by this section or to vote in person or by proxy at any meeting of stockholders."*

> ⚠️ it is not a general evidentiary bar: for the **§502(a) report question** — *were shares issued, and how many* — a board consent, a CSPA, or an Exhibit A is competent evidence, and §224 lets the ledger itself be an electronic record. see `define.stock-ledger` § 1.

> 📖 see `define.stock-ledger` for what the ledger is, the four fields §219(c) requires, the permitted forms under §224, and why formation packages routinely omit it.

**the practical test.** absent step 3 and step 5 — no consideration received, no ledger entry — there is little basis to call the shares issued. **the ledger is the test.** the tax return is not.

⛔ **do not use the balance sheet as the test.** "$0 paid-in capital on Schedule
L, therefore no shares were issued" cannot discriminate:

- founder stock is issued at a **nominal** par. at `$0.00001`, an entire
  8,000,000-share issuance is a **two-figure dollar amount** — on a Schedule L in
  whole dollars it looks the same as no issuance at all
- shares can also be issued for non-cash consideration (services, intangible
  property) booked at nominal or zero value, or never booked

⭐ **a check whose result is identical under both hypotheses is no evidence** —
and it reads as strong because it is specific and true. measured: this exact
inference was refuted on a live matter by the ledger (see
`casestudy.delaware-franchise-recalculation-runaround` → *"the theory that was
WRONG"*). the stock ledger, board minutes, and any stock purchase agreement are
the decisive evidence.

---

## .why 10,000,000 authorized and 0 issued is entirely normal

the authorized pool is a **reservoir**, not a balance sheet item. an undrawn reservoir costs zero.

| reason founders over-authorize | detail |
|-------------------------------|--------|
| the 10M template | standard startup incorporation packages default to 10,000,000 authorized shares so that later grants use round, human-legible numbers |
| headroom for future rounds | preferred series, option pools, and convertible conversions all draw from authorized-but-unissued |
| charter amendments cost money and board time | a **$214.00** Certificate of Amendment plus board consent for every increase — and the schedule marks that fee `*VARIES BASED ON STOCK`, so an amendment that *raises* the count can land above it |
| psychological granularity | 1,000,000 founder shares "feels" more divisible than 100 |

> the $214.00 figure: Delaware's fee schedule, revised 2026-08-01
> ([source](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf)).

> "authorized shares generally remain available indefinitely unless the corporation amends its Certificate of Incorporation or ceases to exist"
>
> — [Wolters Kluwer: why the number of authorized shares matters](https://www.wolterskluwer.com/en/expert-insights/delaware-incorporation-why-the-number-of-authorized-shares-matters)

so a corporation can sit at 10,000,000 authorized / 0 issued indefinitely — a shelf corp, a dormant vehicle, or a founder who incorporated and then never executed the stock purchase agreement. **that is a lawful and common state.** it is also the state that breaks the franchise tax arithmetic (see below).

---

## .the two Delaware franchise tax methods

a corporation may use whichever method produces the lower tax.

### method 1 — authorized shares method

this is the **default**. it looks only at the charter.

| authorized shares | tax |
|-------------------|-----|
| 5,000 or fewer (minimum tax) | **$175.00** |
| 5,001 – 10,000 | **$250.00** |
| each additional 10,000 shares or portion thereof | **+$85.00** |
| maximum | **$200,000.00** |
| maximum, Large Corporate Filer | **$250,000.00** |

> "5,000 shares or less (minimum tax) $175.00"
> "5,001 – 10,000 shares – $250.00"
> "each additional 10,000 shares or portion thereof add $85.00"
> "maximum annual tax is $200,000.00"
>
> — [Delaware Division of Corporations: How to Calculate Franchise Taxes](https://corp.delaware.gov/frtaxcalc/)

the statute matches: §503(a)(1) sets "$85 on each 10,000 shares or part thereof" beyond 10,000.

the Large Corporate Filer surcharge is statutory:

> "For each corporation satisfying the requirements of paragraphs (c)(1) and (c)(2) of this section for a fiscal year for which its annual franchise tax would otherwise be $200,000 as computed under paragraph (a)(1) or (2) of this section (each, a 'large corporate filer'), the Secretary of State shall fix the annual franchise tax for such taxable year at $250,000."
>
> — [8 Del. C. §503(c)](https://delcode.delaware.gov/title8/c005/index.html)

a Large Corporate Filer must have a class of stock listed on a national securities exchange **and** meet consolidated revenue/asset thresholds ($750,000,000 and $250,000,000). a solo-founder corp will never be one.

### method 2 — assumed par value capital method

Delaware's own six steps, verbatim:

| # | step |
|---|------|
| 1 | "Divide your total gross assets by your total **issued** shares carrying to 6 decimal places." |
| 2 | "Multiply the assumed par by the number of **authorized** shares having a par value of less than the assumed par." |
| 3 | "Multiply the number of authorized shares with a par value greater than the assumed par by their respective par value." |
| 4 | "Add the results of #2 and #3 above. The result is your assumed par value capital." |
| 5 | "Figure your tax by dividing the assumed par value capital, rounded up to the next million if it is over $1,000,000, by 1,000,000 and then multiply by $400.00." |
| 6 | "The minimum tax for the Assumed Par Value Capital Method of calculation is $400.00." |

— [Delaware Division of Corporations: How to Calculate Franchise Taxes](https://corp.delaware.gov/frtaxcalc/)

rate: **"$400.00 per million or portion of a million."** maximum: $200,000 ($250,000 Large Corporate Filer).

**"total gross assets" is a defined term** — it is not the founder's estimate:

> "Total assets and total gross assets shall be those 'total assets' reported to the United States on U.S. Form 1120 Schedule L, relative to the company's fiscal year ending in the calendar year prior to filing."
>
> — [Delaware Division of Corporations: Franchise Tax FAQ](https://corp.delaware.gov/taxfaq/)

issued shares for this purpose **includes treasury shares** — the method uses issued, not outstanding shares.

**access to method 2 is conditional on the declared issued-share count.** this is the pivotal statutory hook:

> "Unless a corporation shall submit to the Secretary of State, at the time of filing its annual franchise tax report, a statement setting forth the number of shares of each class of stock actually issued, if any, and the amount of the total gross assets of the corporation, as of the nearest date on which the amount is obtainable ... it shall pay a franchise tax for such year computed in the manner prescribed by paragraph (a)(1) of this section."
>
> — [8 Del. C. §503(b)](https://delcode.delaware.gov/title8/c005/index.html)

read that carefully: **no valid statement of issued shares and gross assets ⇒ authorized shares method applies.** the punitive method is the fallback, not the exception.

### minimums, maximums, fees — which figure attaches to which

| figure | applies to | source |
|--------|-----------|--------|
| **$175** minimum tax | authorized shares method | corp.delaware.gov/paytaxes |
| **$400** minimum tax | assumed par value capital method | corp.delaware.gov/frtaxcalc |
| **$200,000** maximum tax | both methods | 8 Del. C. §503(c) |
| **$250,000** maximum tax | both methods, Large Corporate Filer only | 8 Del. C. §503(c) |
| **$50** annual report fee | non-exempt domestic corporation | corp.delaware.gov/paytaxes |
| **$25** annual report fee | exempt domestic corporation | corp.delaware.gov/paytaxes |
| **$200** penalty | failure to file by March 1 | corp.delaware.gov/paytaxes |
| **1.5% per month** interest | unpaid tax and penalty | corp.delaware.gov/taxfaq |

> "Exempt Domestic Corporations – $25.00" / "Non-Exempt Domestic Corporations – $50.00"
>
> "The minimum tax is $175.00, using the Authorized Shares Method" ... "the Minimum Tax using the Assumed Par Value Capital Method is $400.00 with a maximum tax of $200,000.00"
>
> "Failure to file the report and pay the required franchise taxes will result in a penalty of $200.00 plus 1.5% interest per month on tax and penalty."
>
> — [Delaware Division of Corporations: Annual Report and Tax Instructions](https://corp.delaware.gov/paytaxes/)

so the floor for a live, compliant non-exempt domestic corporation is **$175 tax
+ $50 report fee = $225/year**.

### ⚠️ `$225/year` denotes a DIFFERENT quantity in the neighbor briefs

| the file | what `$225` is | the arithmetic |
|---|---|---|
| **this one** | the annual **cost** floor | $175 tax **+** $50 report fee |
| `howto.reduce-franchise-tax-for-delaware-corp-solofounder.md` · the solo-founder guide | the annual **reduction** from the amendment | $400 **−** $175 |

a cost read as a reduction inverts the sign of the comparison. the $50 report
fee is owed before and after the amendment, so it cancels out of the delta.
run the calculator for the tax and add the fee; do not carry either number
across files.

### ⚠️ the "March 1" in the penalty row is the REPORT's date, not the tax's

the `$200 penalty | failure to file by March 1` row is **§502(c)**, and March 1
is unconditional for the *report*. the interest row below it is **§504(c)**,
which runs from **each** §504(a) due date — and once the year's estimated
liability reaches **$5,000** those dates are **Jun 1 · Sep 1 · Dec 1** of the
tax year, then March 1 after. see `delaware.franchise.tax.[howto].renew.md`.

⛔ the agency page quoted above states the rate and not the accrual start, so it
cannot settle that question — an agency summary is authority for what it says,
never for what it omits.

---

## .the division-by-zero problem

step 1 of the assumed par value capital method divides total gross assets by **total issued shares**. with **zero issued shares**, that quotient is undefined. the method has no defined output.

**what Delaware publishes about it — confirmed.** Delaware does not publish an arithmetic rule. it publishes a phone number:

> "If the total gross assets and/or issued shares equal zero, then please contact Franchise Tax at (302) 739-3073, option 3."
>
> — [Delaware Division of Corporations: Franchise Tax Calculator disclaimer](https://corp.delaware.gov/taxcalc/)

**what the statute says — confirmed.** §503(b) contemplates that the issued-share count may be zero — it says "the number of shares of each class of stock actually issued, **if any**." but neither §503 nor the Division's published instructions state what happens next when that number is zero. i checked §502, §503, §504, the franchise tax calculation page, the tax instructions page, and the franchise tax FAQ. **no primary source states a computational rule for zero issued shares.**

**what i could not confirm.** there are two defensible interpretations, and Delaware has published neither:

| interpretation | mechanics | result at 10,000,000 authorized |
|---------|-----------|--------------------------------|
| **A — method 2 unavailable** | assumed par cannot be derived, so §503(b) drops the corporation to the authorized shares method under §503(a)(1) | **$85,165/year** |
| **B — step 3 absorbs all authorized shares** | with no assumed par, every authorized share falls under step 3 ("par value greater than the assumed par") and is valued at its stated par; at any par ≤ $0.10, assumed par value capital ≤ $1,000,000 | **$400/year** (the method-2 minimum) |

> ⚠️ **inferred, unconfirmed:** both interpretations above are my construction from the statutory and instruction text. neither is stated by Delaware. interpretation A is the more conservative assumption for budget purposes and is the one that matches the §503(b) fallback structure on its face. interpretation B is the one a taxpayer would argue. **the only way to settle this is the phone call Delaware itself directs you to make** — and to get the answer documented.

> ⚠️ **inferred, unconfirmed:** this produces a counterintuitive hazard that deserves a plain statement. if interpretation A is correct, then proof that **zero** shares were issued makes the tax **worse**, not better — it forecloses method 2 and locks in $85,165/year at 10,000,000 authorized. a corporation that considers a zero-shares affidavit should confirm Delaware's treatment **before** it swears to the number.

---

## .the §241 angle — charter amendment before payment for stock

DGCL §241 is the provision built precisely for a corporation that has never received payment for its stock.

> "(a) Before a corporation has received any payment for any of its stock, it may amend its certificate of incorporation at any time or times, in any and as many respects as may be desired, so long as its certificate of incorporation as amended would contain only such provisions as it would be lawful and proper to insert in an original certificate of incorporation filed at the time of filing the amendment."
>
> "(b) The amendment of a certificate of incorporation authorized by this section shall be adopted by a majority of the incorporators, if directors were not named in the original certificate of incorporation or have not yet been elected, or, if directors were named in the original certificate of incorporation or have been elected and have qualified, by a majority of the directors."
>
> — [8 Del. C. §241](https://delcode.delaware.gov/title8/c001/sc08/index.html)

contrast §242, which governs amendments **after** payment for stock has been received and requires a stockholder vote — a majority of the outstanding shares entitled to vote, with class-by-class votes where a class is adversely affected.

| | §241 | §242 |
|---|------|------|
| precondition | no payment received for any stock | payment received |
| who adopts | majority of directors (or incorporators) | board + stockholder vote |
| stockholder vote | **none required** | required |
| can it change the authorized share count | yes — "in any and as many respects as may be desired" | yes, expressly |
| practical fit for a solo founder with no issuance | ideal — a sole-director consent suffices | needs a stockholder who may not exist |

### the retroactivity question

§241(b) contains an unusual effective-date clause:

> "Upon such filing, the corporation's certificate of incorporation shall be deemed to be amended accordingly as of the date on which the original certificate of incorporation became effective, except as to those persons who are substantially and adversely affected by the amendment and as to those persons the amendment shall be effective from the filing date."
>
> — [8 Del. C. §241(b)](https://delcode.delaware.gov/title8/c001/sc08/index.html)

on its face this is **retroactive as a matter of corporate law** — the charter is deemed to have always read as amended, back to original incorporation.

> ⚠️ **inferred, unconfirmed — this is the single most important open question in this brief.** whether a §241 amendment retroactively reduces **franchise tax already assessed for prior years** is **not addressed** by §241, by §503, or by any Delaware Division of Corporations publication i could locate. i searched the statute, the tax instructions, the tax FAQ, and the calculation page. i found no rule either way.

the opposed signals, each tagged:

| signal | status |
|--------|--------|
| §241(b) deems the charter amended "as of the date on which the original certificate of incorporation became effective" | ✅ confirmed statutory text |
| the same sentence carves out "those persons who are substantially and adversely affected," for whom the amendment runs only from the date the certificate is filed | ✅ confirmed statutory text |
| whether the State of Delaware, as franchise tax creditor, is such a "person" | ⚠️ **inferred, unconfirmed** — plausible interpretation, but i found no case or agency determination on it. if the state qualifies, the amendment is prospective for tax purposes |
| Delaware prorates franchise tax within a year when a stock amendment is filed mid-year: "issued shares and total gross assets within 30 days of the amendment must be given for each portion of the year during which each distinct authorized amount of capital stock or par value was in effect" | ✅ confirmed ([frtaxcalc](https://corp.delaware.gov/frtaxcalc/)) |
| that proration rule implies the tax division tracks authorized shares **by calendar period**, which cuts against retroactive relief for closed years | ⚠️ **inferred** from the proration rule; not stated |
| amended annual reports are accepted for up to one year after the original, at $50 (or $25 exempt) | ✅ confirmed ([Harvard Business Services](https://www.delawareinc.com/blog/how-to-amend-annual-report/)) — note this is a **secondary** source |

> ⚠️ **inferred, unconfirmed:** my provisional assumption is that a §241 amendment reduces franchise tax **prospectively only**, and that relief for prior assessed years must come through a **correction of the issued-shares/gross-assets data on an amended annual report** (or a negotiated settlement with the franchise tax division), not through the charter amendment. i cannot cite a source for this. treat it as a hypothesis to verify with the Division before any position is taken.

⚠️ the "one-year amendment window" is a secondary-source claim. §502(c) attaches **no deadline** to the election it grants (*"shall thereafter elect"*), and amended reports for multi-year-old delinquent years have been accepted — see `define.amended-annual-report.state=delaware` and `casestudy.delaware-amended-reports-executed`. confirm with the Division before you treat an old year as closed.

---

## .the common solo-founder error

| what happens | why |
|--------------|-----|
| the founder enters the **authorized** count in the **issued** box | the labels sit adjacent on the online form and both say "shares" |
| the founder enters a **placeholder** — a round number, the intended future issuance, the cap-table target | the form will not accept a blank, and the founder has no ledger to consult |
| the next year's report is **copied from the prior year** | the online system prefills prior-year data; the founder clicks through |
| the same **$0 gross assets** figure repeats for years | the corp is pre-revenue and no Form 1120 was ever prepared, so the founder types zero every year |

each of these is individually innocuous and collectively catastrophic, because:

1. an inflated issued-share count **raises** assumed par value's denominator, which usually **lowers** method-2 tax — so the error stays invisible while the corp remains current.
2. but a **$0** gross assets numerator repeated across years is the pattern Delaware flags. once flagged, the corp's method-2 data is questioned, and §503(b) puts the corp back on the authorized shares method — where 10,000,000 authorized shares is catastrophic.
3. penalty and interest then compound at $200 + 1.5%/month.

**the correction path** (each step confirmed where cited; the order is my recommendation):

| step | action |
|------|--------|
| 1 | reconstruct the truth from primary corporate records — stock ledger, board minutes, any stock purchase or subscription agreement, bank records of consideration received |
| 2 | reconcile against Form 1120 Schedule L (paid-in capital, total assets) |
| 3 | call the franchise tax division at **(302) 739-3073, option 3** — this is Delaware's own published instruction for zero-asset/zero-share cases |
| 4 | file amended annual report(s) where the one-year window is still open ($50 non-exempt / $25 exempt) |
| 5 | supply the notarized affidavit if the state has demanded one — but only after step 1 actually supports the sworn statement, and after confirmation of the tax consequence of a zero-issued declaration |
| 6 | reduce authorized shares prospectively — by §241 board consent if no payment was ever received for stock, else by §242 |

---

## .worked example — the case at hand

inputs. authorized 10,000,000. reported issued 8,000,000. reported total gross assets $0. par value is not stated in the record available to me; the example below shows the result is insensitive to par for any value ≤ $0.10.

### under the authorized shares method

| component | arithmetic | amount |
|-----------|------------|--------|
| first 10,000 shares | flat | $250 |
| residual 9,990,000 shares | 999 increments of 10,000 × $85 | $84,915 |
| **annual tax** | | **$85,165** |
| annual report fee | | $50 |

### under the assumed par value capital method, as reported (8,000,000 issued, $0 assets)

| step | arithmetic | result |
|------|------------|--------|
| 1 | $0 ÷ 8,000,000 | assumed par = $0.000000 |
| 2 | no authorized shares have par below $0.000000 | $0 |
| 3 | 10,000,000 × stated par (illustrate $0.0001) | $1,000 |
| 4 | assumed par value capital | $1,000 |
| 5 | $1,000 is under $1,000,000 → 1 × $400 | $400 |
| 6 | $400 minimum applies | **$400** |

at any stated par value from $0.000001 through $0.10, step 3 yields $10 to $1,000,000, so step 5 still lands on one million-or-part-thereof and the tax stays at **$400**.

### the gap

| method | annual tax | ratio |
|--------|-----------|-------|
| assumed par value capital | $400 | 1× |
| authorized shares | $85,165 | **213×** |

> ⚠️ **inferred, unconfirmed:** the ~$191,652 assessment is near **two years** of authorized-shares-method tax plus $200/year penalty plus 1.5%/month interest — but it does **not** close:
>
> ```sh
> rhx franchise.tax.delaware.accrue --tax 85165 --years 2022,2023 --fit 191652.43
> #   best accrual 2023-11-01
> #   tax $170,330.00 + penalty $400.00 + interest $20,184.10 = $190,914.10
> #   the bill  $191,652.43   →   residual $738.33
> ```
>
> **$738.33 is unexplained.** only Delaware's itemized statement establishes the actual composition. **request that itemization.**

### what changes if issued shares is actually 0

| interpretation | annual tax at 10,000,000 authorized |
|---------|-------------------------------------|
| **A** — method 2 unavailable, §503(b) fallback to §503(a)(1) | **$85,165** — same as the assessment |
| **B** — step 3 values all authorized shares at stated par, method-2 minimum applies | **$400** |

> ⚠️ **inferred, unconfirmed:** the choice between A and B is not settled by any source i located. under interpretation A, a zero-shares affidavit does not reduce the back tax at all — it merely explains it. under interpretation B, the corp owes $400/year and the assessment collapses. **do not assert either to the state as settled.**

### what changes if authorized shares is reduced to 5,000

| period | tax |
|--------|-----|
| prior assessed years | **unchanged** — ⚠️ inferred, unconfirmed, per the §241 retroactivity discussion above |
| subsequent years | **$175** authorized shares method + $50 report fee = **$225/year** |

---

## .provenance summary

| claim | status |
|-------|--------|
| the three counts and the `issued = outstanding shares + treasury` identity | ✅ confirmed — DGCL §152, §153, §160(c) |
| stock ledger definition and content | ✅ confirmed — DGCL §219(c), §224 |
| authorized shares method schedule, $175 / $250 / +$85 / $200,000 | ✅ confirmed — corp.delaware.gov/frtaxcalc, 8 Del. C. §503(a)(1) |
| $250,000 Large Corporate Filer cap and its two prerequisites | ✅ confirmed — 8 Del. C. §503(c) |
| assumed par value capital six-step method, $400/million, $400 minimum | ✅ confirmed — corp.delaware.gov/frtaxcalc |
| total gross assets = Form 1120 Schedule L "total assets" | ✅ confirmed — corp.delaware.gov/taxfaq |
| $50 / $25 annual report fee, $200 penalty, 1.5%/month interest | ✅ confirmed — corp.delaware.gov/paytaxes, corp.delaware.gov/taxfaq |
| §503(b): absent a statement of issued shares and gross assets, the authorized shares method applies | ✅ confirmed — 8 Del. C. §503(b) |
| Delaware's published response to zero assets and/or zero issued shares is "call (302) 739-3073, option 3" | ✅ confirmed — corp.delaware.gov/taxcalc |
| **the computational treatment of zero issued shares under method 2** | ❌ **not confirmed by any primary source** — two interpretations presented, neither published |
| §241 permits board-only charter amendment before any payment for stock | ✅ confirmed — 8 Del. C. §241(a)–(b) |
| §241(b) deems the amendment effective as of original incorporation, with a carve-out for adversely affected persons | ✅ confirmed — 8 Del. C. §241(b) |
| **whether §241 retroactivity reaches prior-year franchise tax assessments** | ❌ **not confirmed** — no statute, regulation, or Division publication located |
| **whether the State is a "person substantially and adversely affected" under §241(b)** | ❌ **not confirmed** — no authority located |
| mid-year stock amendments are prorated across the periods each authorized amount was in effect | ✅ confirmed — corp.delaware.gov/frtaxcalc |
| one-year window to amend an annual report | ⚠️ secondary source only — Harvard Business Services; not confirmed against a Delaware publication |
| repeated $0 gross assets and share-count jumps trigger state scrutiny | ⚠️ secondary source only — Harvard Business Services |
| the ~$191,652 decomposition | ⚠️ **inferred** arithmetic; request Delaware's itemization |

---

## .see also

- [delaware.franchise.tax.purpose.md](./delaware.franchise.tax.purpose.md) — why the tax exists and what it buys
- [delaware.franchise.tax.delinquency.md](./delaware.franchise.tax.delinquency.md) — what happens when it goes unpaid
- [howto.reduce-franchise-tax-for-delaware-corp-solofounder.md](./howto.reduce-franchise-tax-for-delaware-corp-solofounder.md) — the prospective fix: reduce authorized shares to 5,000
- [howto.reinstate-void-delaware-corp.md](./howto.reinstate-void-delaware-corp.md) — revival after voidance
- [define.why-delaware-wants-a-zero-shares-affidavit.md](./define.why-delaware-wants-a-zero-shares-affidavit.md) — the sworn-statement demand and what it is for

---

## .sources

primary — Delaware statute:

1. [8 Del. C. §152, §153, §158, §160 — issuance, consideration, certificates, treasury stock](https://delcode.delaware.gov/title8/c001/sc05/index.html)
2. [8 Del. C. §219, §224 — stock ledger and form of records](https://delcode.delaware.gov/title8/c001/sc07/index.html)
3. [8 Del. C. §241, §242 — charter amendment before and after payment for stock](https://delcode.delaware.gov/title8/c001/sc08/index.html)
4. [8 Del. C. ch. 5 §502, §503, §504 — annual report, rates, penalties](https://delcode.delaware.gov/title8/c005/index.html)

primary — Delaware Division of Corporations:

5. [How to Calculate Franchise Taxes](https://corp.delaware.gov/frtaxcalc/)
6. [Annual Report and Tax Instructions](https://corp.delaware.gov/paytaxes/)
7. [Franchise Tax Calculator and Disclaimer](https://corp.delaware.gov/taxcalc/)
8. [Franchise Tax FAQ](https://corp.delaware.gov/taxfaq/)
9. [Annual Report and Tax Information](https://corp.delaware.gov/frtax/)

secondary:

10. [Harvard Business Services: Common Mistakes on the Delaware Annual Report](https://www.delawareinc.com/blog/common-annual-report-mistakes/)
11. [Harvard Business Services: How To Amend Your Company's Delaware Annual Report](https://www.delawareinc.com/blog/how-to-amend-annual-report/)
12. [Wolters Kluwer: Delaware Incorporation — why the number of authorized shares matters](https://www.wolterskluwer.com/en/expert-insights/delaware-incorporation-why-the-number-of-authorized-shares-matters)
13. [Clerky: How do I calculate the Delaware franchise tax?](https://help.clerky.com/article/2796-calculate-delaware-franchise-tax)
14. [EisnerAmper: How Do I Calculate the Delaware Franchise Tax?](https://www.eisneramper.com/insights/life-sciences/c-corp-delaware-franchise-0122/)

---

> ⚠️ not legal or tax advice
