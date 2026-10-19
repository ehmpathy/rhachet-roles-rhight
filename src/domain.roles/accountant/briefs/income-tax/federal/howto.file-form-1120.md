# howto.file-form-1120

## .what

how to file a Form 1120 — especially a **prior-year** return that was never filed (e.g., a loss year you skipped).

> companion to `howto.find-form-1120` (confirm it doesn't already exist first) and `define.form-1120-for-delaware-franchise-tax` (why you need it).

---

## .the misconception to kill first

> "the corporation made no profit, only losses, so no return is owed."

this is wrong. a C-corp must file **every year it exists**, profit or not. a loss year is not an exemption — only IRC §501 tax-exempt status removes the requirement.

> "Unless exempt under section 501, all domestic corporations ... must file an income tax return whether or not they have taxable income."
>
> — [IRS: Instructions for Form 1120](https://www.irs.gov/instructions/i1120)

a corp with zero revenue and a pure loss still owes the IRS a return.

---

## .why file a return you skipped

| reason | benefit |
|--------|---------|
| Delaware substantiation | the Schedule L "total assets" figure unlocks the Assumed Par Value method ($400 vs ~$85k/yr) |
| loss carryforward (NOL) | a filed return formally establishes the loss so it can offset future income |
| reinstatement | a complete federal record supports state revival of a void corp |
| audit safety | an unfiled year stays open indefinitely; a filed return starts the clock |

a loss only counts if you file the return that claims it.

---

## .the penalty reality (good news for loss years)

for a **C corporation**, the failure-to-file penalty is measured on the tax:

> "…there shall be added to the amount required to be shown as tax on such
> return **5 percent of the amount of such tax** if the failure is for not more
> than 1 month, with an additional 5 percent for each additional month… not
> exceeding 25 percent in the aggregate"
>
> — [26 U.S.C. § 6651(a)(1)](https://www.law.cornell.edu/uscode/text/26/6651)

and the **minimum-penalty floor is itself tax-proportional** — the clause a
naive read of "there is a minimum penalty" gets backwards:

> "In the case of a failure to file a return of tax imposed by chapter 1 within
> **60 days** of the date prescribed for filing of such return… the addition to
> tax under paragraph (1) **shall not be less than the lesser of $435 or 100
> percent of the amount required to be shown as tax on such return.**"
>
> — 26 U.S.C. § 6651(a), flush text

⭐ **the floor is the _lesser_ of the two**, so on $0 tax it is $0 no matter what
the indexed dollar figure is. the arithmetic never reaches the dollar amount.

⚠️ **do not quote the `$435` for a given year** — §6651(j) is titled *Adjustment
for inflation* and indexes it. it renders cleanly, reads as authority, and is
wrong by however many years of CPI have run.

### ⛔ this is C-CORP-SPECIFIC and does NOT generalize

| entity | late-file penalty on a **zero-tax** return |
|--------|-------------------------------------------|
| **C corporation** (§6651) — *this form* | **$0** — proportional to tax |
| S corporation (§6699) | **per shareholder, per month, regardless of tax** |
| partnership (§6698) | **per partner, per month, regardless of tax** |

the rule above is a fact about **§6651**, not a fact about late returns. carry
it to an 1120-S or a 1065 and a per-owner monthly penalty accrues that no amount
of $0 tax reduces.

so a late **Form 1120** for a loss year with no tax due carries no
failure-to-file penalty. you still must file to claim the loss and substantiate
gross assets.

> caveat: if any tax *was* owed that year, penalties + interest accrue from the original due date. confirm with a CPA before you assume $0.

⭐ **practical read:** there is no financial clock on a zero-tax 1120. that is a
reason not to rush a bad election — it is *not* a reason to defer indefinitely,
since an unfiled year is a year whose loss was never established.

📄 the full derivation, its bhrowser provenance, and the §6651(j) indexation
quote live in `records/howto.substantiate-expenses.md` (§6651 pulled
2026-08-31, 9,352 chars).

---

## .step 1: gather the year's source records

reconstruct that tax year's books:

- income statement (revenue, expenses) — even if revenue was $0
- **balance sheet** — needed for **Schedule L** "total assets" (the Delaware figure)
- EIN, exact corp name, incorporation date, fiscal year
- prior partial records, bank statements, accountant exports

---

## .step 2: use the correct year's form

each tax year has its own Form 1120 + instructions. you must use the **2022 form for tax year 2022**, not the current form.

- pull prior-year forms from the IRS prior-year forms archive
- the form number is the same (1120); only the year edition differs

---

## .step 3: complete the return

- report income/loss (a loss year shows the loss) — a worked loss year, line by line, with synthetic figures: `howto.file.federal.delinquent.active-loss` § *worked example*
- complete **Schedule L** (balance sheet) — this is the part Delaware relies on
- compute tax (often $0 for a loss year; an NOL may zero it out)
- sign as an authorized officer

---

## .step 4: file it

- prior-year and late returns often **cannot be e-filed** — mail a paper return to the IRS address for 1120 in the form's instructions
- keep proof of mail (certified mail / return receipt)
- retain a full copy — you will email it to Delaware (dosdoc_ftax@delaware.gov) for the franchise tax recalc

### ⛔ paper is NOT freely available. check the 10-return threshold first.

every paper route in this role (here, and the *"simpler paper route"* in its siblings) is conditional on this: electronic filing is **mandatory** over a threshold far lower than most people expect:

> "(a) *Corporate income tax returns required electronically.*
> (1) A corporation required to file a corporate income tax return on Form
> 1120, U.S. Corporation Income Tax Return, under § 1.6012-2 of this chapter
> **must file its corporate income tax return electronically if the
> corporation is required by the Internal Revenue Code or regulations to file
> at least 10 returns** (as defined in paragraph (d)(5) of this section)
> during the calendar year ending with or within the taxable year of the
> corporation."
>
> — [26 CFR § 301.6011-5(a)(1)](https://www.law.cornell.edu/cfr/text/26/301.6011-5)

### ⚠️ "10 returns" AGGREGATES ACROSS EVERY FORM TYPE

the count is **not** ten income tax returns:

> "(5) *Calculating the number of returns.* For purposes of this section, a
> corporation … is required to file at least 10 returns if, during the
> calendar year ending with or within the taxable year of the corporation …,
> the corporation … is required to file **at least 10 returns of any type,
> including information returns (for example, Forms W-2 and Forms 1099),
> income tax returns, employment tax returns, and excise tax returns**."
>
> — 26 CFR § 301.6011-5(d)(5)

| counts toward the 10 (summed for the calendar year) |
|---|
| information returns — W-2, 1099 |
| income tax returns |
| employment tax returns — the quarterly and annual payroll forms |
| excise tax returns |

⛔ **count your own.** payroll alone — quarterly and annual employment tax returns plus a W-2 per employee — moves a small company toward the line before the 1120 is counted. count the forms you actually file (`rule.forbid.hand-computed-figures`).

⚠️ **a controlled group counts as one pile.** § 301.6011-5(a)(2) requires
every member to e-file if the **aggregate** across the group is at least 10.

### 📅 it reaches BACK-YEAR returns

the applicability clause is keyed to when the return **is required to be
filed**, not to the tax year:

> "(f) *Applicability date.* The rules of this section apply to corporate
> income tax returns **required to be filed during calendar years beginning
> after December 31, 2023**."
>
> — 26 CFR § 301.6011-5(f)

a TY2023 return was required to be filed in 2024, so a delinquent 2023 return is inside the rule; lateness does not move it out.

### ✅ the escape is a WAIVER, and it must be requested

⚠️ for a year outside the IRS MeF window, e-file is **impossible** and the mandate still applies. the remedy is not to quietly mail it:

> "(b) *Exclusions from electronic-filing requirements* — (1) *Waivers.* The
> Commissioner may grant waivers of the requirements of this section in cases
> of **undue hardship**. One principal factor in determining hardship will be
> the amount, if any, by which the cost of filing the return electronically
> in accordance with this section exceeds the cost of filing the return on
> paper. A request for a waiver must be made in accordance with applicable
> IRS revenue procedures, publications, forms, instructions, or other
> guidance, including postings to the IRS.gov website."
>
> — 26 CFR § 301.6011-5(b)(1)

§ 301.6011-5(a)(3) also lets the Commissioner "exempt certain returns from the
electronic requirements of this section through revenue procedures,
publications, forms, instructions, or other guidance."

🚩 **what is NOT established here:** the current revenue procedure that governs
a waiver request, and whether an out-of-MeF-window year is administratively
treated as exempt without one. both are IRS guidance rather than statute, and
neither was pulled. if you are over the threshold and outside the window,
that is the question to take to a practitioner.

### 🎯 under the threshold, paper is genuinely fine

the mandate is a threshold, not a ban on paper. a dormant single-officer corporation with no payroll and no information returns is plainly under 10 — for that reader the paper route stands.

---

## .step 5: confirm it landed

- ~6–8 weeks after a mailed return, verify via the IRS business tax account or a transcript request (see `howto.find-form-1120`)
- only after the IRS processes it will a transcript exist to back the Delaware submission

---

## .what you need (checklist)

- [ ] EIN + exact corporation name
- [ ] correct **year edition** of Form 1120
- [ ] balance sheet for **Schedule L** (total assets)
- [ ] income/expense records for the year
- [ ] officer signature
- [ ] mail proof + retained copy

---

## .when to call a CPA

- you are unsure whether tax was owed (penalty risk)
- multiple unfiled years stack up
- NOL carryforward math affects later years
- the corp had real activity (not a clean $0 year)

a CPA-prepared prior-year 1120 typically runs a few hundred dollars and removes audit risk on the reconstructed figures.

---

## .sources

- [IRS: About Form 1120](https://www.irs.gov/forms-pubs/about-form-1120)
- [IRS: Instructions for Form 1120 (2025)](https://www.irs.gov/instructions/i1120)
- [IRS: Form 1120 (PDF)](https://www.irs.gov/pub/irs-pdf/f1120.pdf)
- [Delaware Division of Corporations: How to Calculate Franchise Taxes](https://corp.delaware.gov/frtaxcalc/)
- [26 CFR § 301.6011-5](https://www.law.cornell.edu/cfr/text/26/301.6011-5) — the corporate e-file mandate
- [26 CFR § 301.6011-2](https://www.law.cornell.edu/cfr/text/26/301.6011-2) — the information-return threshold § 301.6011-5 keys on
- [26 U.S.C. § 6011(e)(5)](https://www.law.cornell.edu/uscode/text/26/6011) — "in the case of calendar years after 2021, **10**"

### 🔬 provenance of the e-file-mandate section

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. no WebFetch or WebSearch summary stands
behind any line.

| passage | publishers | equality test |
|---|---|---|
| § 301.6011-5(f) applicability date | eCFR API (official XML) · Cornell | ✅ **`agree: true`**, byte-identical |
| § 301.6011-5(d)(5) "10 returns of any type" | eCFR API · Cornell | ✅ **`agree: true`**, byte-identical |
| § 301.6011-5(a)(1) the mandate | eCFR API · Cornell | ⚠️ `agree: false` — **diagnosed, benign**: the two render the form's name on different lines, so a sentence splitter cut at different points. the operative clause, from *"under § 1.6012-2 of this chapter must file…"* onward, is byte-identical; Cornell's capture is a superset by the 31-char lead *"Corporation Income Tax Return, "* |

⭐ **the old `$10 million` + `250 returns` thresholds are gone.** the pre-2024 rule reached only corporations with $10M+ assets **and** 250 returns; `$10 million`, `10 million`, and `250 returns` all miss on the current text, and § 301.6011-5(f)'s source credit names the amendment: `[T.D. 9363, 72 FR 63811, Nov. 13, 2007, as amended by T.D. 9972, 88 FR 11769, Feb. 23, 2023]`.

pull traps met (all in the citation rule):

1. the **eCFR versioner API needs a date it has an ISSUE for** — *today* returned a **160-char** payload with no error, caught because both sections collided at 160. `2026-08-01` returns 7,172 chars
2. **govinfo is not the second publisher here** — three CFR volume guesses all returned **566 chars — "Page Not Found"**
3. the first IRS url was a **soft 404** (every language link pointed at `/404`); the live path, walked from the agency's directory, is under `/businesses/corporations/`, not `/e-file-providers/`

⚠️ the playbooks, `.scratch/irc-6011-efile-mandate{,.round2,.round3,.round4}.play.ts`, are **gitignored** — a package reader cannot re-run them. the move to `briefs/refs/` is pending.
