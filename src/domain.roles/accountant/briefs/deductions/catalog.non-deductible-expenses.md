# catalog.non-deductible-expenses

## .what

a practical catalog of what a C-corp **cannot** deduct — even when the money was really spent. each falls into one of three buckets: **personal**, **capital**, or **policy-barred**.

> the *why* behind these: `define.why-expenses-are-deductible`.
> the *what-qualifies*: `catalog.deductible-expenses`.

## .the three reasons a cost is non-deductible

| bucket | why | example |
|--------|-----|---------|
| **personal** | not a business cost at all | your groceries, commute |
| **capital** | multi-year asset — deferred, not expensed | land, a building |
| **policy-barred** | law refuses to subsidize it | fines, bribes, political spend |

---

## .personal (never a business deduction)

| item | note |
|------|------|
| personal expenses | groceries, personal clothes, personal travel |
| **commute costs** | home ↔ office, incl. parking — treated as personal |
| personal use of a business card | must be split out and excluded |

## .policy-barred (business, but denied by statute)

| item | statute | rule |
|------|---------|------|
| **fines & penalties to a government** | [§162(f)](https://www.law.cornell.edu/uscode/text/26/162) | parking tickets, tax penalties, code violations — never |
| **political contributions** | §162(e) | campaigns, candidates, parties — never |
| **lobbying** | §162(e) | influence on legislation/officials (small in-house de minimis aside) |
| **illegal payments** | §162(c) | bribes, kickbacks — never |
| **entertainment** | §274 | client sports events, golf, theater — **0%** since TCJA 2017 |
| **exec comp over $1M** | §162(m) | public companies only |

## .capital (deferred, not expensed this year)

| item | treatment |
|------|-----------|
| **land** | never deducted or depreciated (does not wear out) |
| **buildings, equipment** | capitalized → depreciated over useful life (Form 4562) |
| **major improvements** | capitalized, not expensed |

> capital costs are not "lost" — they are recovered over time via depreciation/amortization, matched to the years they help earn income.

## .partial traps (deductible only in part — easy to over-claim)

| item | non-deductible portion | the limit lives in | year-scoped? |
|------|-----------------------|--------------------|--------------|
| **meals — 2023 onward** | **50%** | §274(n)(1) | ✅ verified 2022-2024 |
| **meals — restaurant, 2021 & 2022** | **none. 100% deductible** | §274(n)(2)(D) | ✅ the date is IN the statute |
| **meals — DOT hours-of-service staff** | **20%** (80% is allowed) | §274(n)(3) | ✅ verified 2022-2024 |
| **gifts** | the excess over **$25 per recipient/year** | §274(b)(1) | ✅ verified 2022-2024 |
| **entertainment portion of a meal** | **100%** — the entertainment part is 0% deductible | §274(a) | ✅ "since TCJA 2017", above |
| **charitable contributions** | the excess over 10% of taxable income (C-corp) | §170(b)(2)(A) | ⚠️ 2023 edition only |

### 🚨 THE MEAL ROW IS THREE ROWS, AND THE YEAR PICKS ONE

a bare "meals are 50%" is wrong for a 2021 or 2022 restaurant charge.
§274(n)(2) opens *"Paragraph (1) shall not apply to any expense if—"*, and:

> "(D) such expense is—
> (i) for food or beverages **provided by a restaurant**, and
> (ii) paid or incurred **before January 1, 2023**."
>
> — [26 U.S.C. §274(n)(2)(D)](https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleA-chap1-subchapB-partIX-sec274.htm)

so for **2021 and 2022 restaurant** charges there is **no non-deductible half
at all** — to exclude one throws away a deduction the statute allows.

the text never changed: the 2022–2024 editions of §274 are byte-identical, (D)
and its date limit included, so an edition diff reports *no change*. the full
derivation, the controls, and the open §170 gap are in `catalog.deductible-expenses`.

## .federal income tax itself

the corporation's **federal income tax** is **not** a deductible expense on its own 1120. (state income/franchise taxes generally *are* deductible under "Taxes and licenses.")

## .the statement-scan watch-list

exclude these if they appear on the card:

- ❌ any clearly personal charge (personal meals, personal subscriptions)
- ❌ commute / parking
- ❌ fines / penalties / late fees to a government
- ❌ political donations
- ⚠️ meals → **check the year first.** a restaurant charge in 2021 or 2022 is
  fully deductible (§274(n)(2)(D)); from 2023 only half counts
- ⚠️ a laptop / equipment purchase → capital (depreciate), not a full expense

## .see also

- `define.why-expenses-are-deductible` (the principle)
- `catalog.deductible-expenses` (what qualifies)

## .sources

- [26 U.S.C. § 274 — 2024 edition, govinfo](https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleA-chap1-subchapB-partIX-sec274.htm)
- [26 U.S.C. § 274 — Cornell current text](https://www.law.cornell.edu/uscode/text/26/274)
- [IRC § 162 — Trade or business expenses](https://www.law.cornell.edu/uscode/text/26/162)
- [IRS: Nondeductible lobbying and political expenditures](https://www.irs.gov/charities-non-profits/other-non-profits/nondeductible-lobbying-and-political-expenditures)
- [Nolo: Business Expenses That Are Never Deductible](https://www.nolo.com/legal-encyclopedia/business-expenses-that-are-never-deductible.html)
- [QuickBooks: Non-Deductible Business Expenses](https://quickbooks.intuit.com/r/taxes/tax-pros-warn-small-business-owners-not-to-try-to-deduct-these-9-expenses/)

> ⚠️ not tax advice. a CPA confirms treatment per item.
