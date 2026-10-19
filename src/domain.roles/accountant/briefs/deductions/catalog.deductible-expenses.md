# catalog.deductible-expenses

## .what

a practical catalog of expenses a C-corp can typically deduct, with emphasis on what a **software / SaaS startup** hits.

every item passes the ordinary-and-necessary test of [IRC §162](https://www.law.cornell.edu/uscode/text/26/162) — ⚠️ **necessary, not sufficient.** §162 admits an expense; §274 then limits or bars several items below (see `.partial / limited deductions`).

> the *why*: `define.why-expenses-are-deductible`. the *what-not*: `catalog.non-deductible-expenses`.

## .the test (apply to anything not listed)

> was this an **ordinary** (common in your field) and **necessary** (helpful, appropriate) cost of the business's income?

if yes, and it is not a capital asset or policy-barred → deductible.

---

## .software / SaaS startup categories (most relevant)

| category | examples | 1120 line |
|----------|----------|-----------|
| **advertising / promotion** | Google Ads, Meta/LinkedIn/X ads, SEO, sponsored content | line 22 (Advertising) or 26 (Other) |
| **cloud / hosting / compute** | AWS, GCP, Azure, Vercel, Cloudflare | 26 (Other deductions) |
| **SaaS / software subscriptions** | GitHub, Figma, Notion, Linear, analytics tools | 26 (Other) |
| **payment processor fees** | Stripe fees, PayPal fees | 26 (Other) |
| **communications / API** | Twilio, SendGrid, email/SMS APIs | 26 (Other) |
| **domains** | domain registration + renewal | 26 (Other) |
| **professional fees** | CPA / tax prep, legal, books help | 26 (Other) |
| **state filing / registration fees** | franchise tax, registered agent, incorporation | line 17 (Taxes and licenses) |
| **business insurance** | E&O, general liability, cyber | line 26 or its own line |
| **contractor payments** | freelance dev/design (Form 1099-NEC if ≥ $600) | 26 (Other) |

## .standard §162 categories (with their own 1120 lines)

| expense | 1120 line |
|---------|-----------|
| compensation of officers | line 12 |
| salaries and wages | line 13 |
| repairs and maintenance | line 14 |
| bad debts | line 15 |
| rents (office, equipment) | line 16 |
| taxes and licenses | line 17 |
| interest expense | line 18 |
| charitable contributions | line 19 (limited to 10% of taxable income) |
| depreciation (Form 4562) | line 20 |
| advertising | line 22 |
| pension / profit-share plans | line 23 |
| employee benefit programs | line 24 |
| **all else** | line 26 (Other deductions — itemized on a statement) |

## .partial / limited deductions (deductible but capped)

| item | rule | the limit lives in | year-scoped? |
|------|------|--------------------|--------------|
| **business meals** | **50%** deductible — ⚠️ **after** it clears §274(k), see below | **§274(n)(1)** | ✅ verified 2022-2024 — ⚠️ **but read the restaurant carve-out below** |
| **meals for DOT hours-of-service staff** | **80%**, not 50% | **§274(n)(3)** | ✅ verified 2022-2024 |
| **business gifts** | capped at **$25 per recipient per year** | **§274(b)(1)** | ✅ verified 2022-2024 |
| **charitable contributions** | up to **10%** of taxable income (C-corp) | **§170(b)(2)(A)** | ⚠️ 2023 edition only — see the gap note |
| **vehicle / mileage** | business-use portion only (standard mileage or actual) | §162 + §274(d) | n/a |
| **home office** | business-use portion only, strict rules | §280A | n/a |

### ⛔ THE 50% CAP IS THE SECOND GATE — §274(k) IS THE FIRST

§274(k) decides whether there is a deduction to take a percentage **of**, and it bars all or none:

> "**No deduction shall be allowed under this chapter for the expense of any
> food or beverages unless**— (A) such expense is **not lavish or
> extravagant** under the circumstances, and (B) the taxpayer (or an
> employee of the taxpayer) **is present at the furnishing** of such food or
> beverages."
> — [26 U.S.C. § 274(k)(1)](https://www.law.cornell.edu/uscode/text/26/274)

- fail (B) and the answer is **0%, not 50%** — a meal bought for a client the taxpayer did not attend is disallowed in full
- cite *"not lavish"* to §274(k)(1)(A), never §274(n)(1): a rule quoted from the section that caps it loses the presence condition that lives in the section that allows it

### 🚨 RESTAURANT MEALS WERE 100% DEDUCTIBLE THROUGH 2022

§274(n)(2) opens *"Paragraph (1) shall not apply to any expense if—"*, and subparagraph (D) reads:

> "(D) such expense is—
> (i) for food or beverages **provided by a restaurant**, and
> (ii) paid or incurred **before January 1, 2023**."
>
> — [26 U.S.C. §274(n)(2)(D)](https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleA-chap1-subchapB-partIX-sec274.htm)

the window opened here:

> "Pub. L. 116–260, div. EE, title II, §210(b), Dec. 27, 2020 … 'The amendments
> made by this section shall apply to amounts paid or incurred **after December
> 31, 2020**.'"

| tax year | restaurant | non-restaurant (e.g. grocery, caterer) |
|----------|-----------|----------------------------------------|
| 2021, 2022 | **100%** — §274(n)(1) does not apply | 50% |
| 2023 onward | **50%** | 50% |

⚠️ **check any already-filed year.** a 2021 or 2022 return that took 50% on restaurant meals understated the deduction — in a loss year that shrinks the **NOL carried forward** rather than costs cash.

### ⭐ THE TRAP: the statute's TEXT was identical, and the RATE still moved

- the 2022, 2023, and 2024 editions of §274 are **byte-identical — 62,286 characters each**; (D) is still printed in 2024
- ⇒ an edition diff reports *no change* — right about the text, wrong about the rate
- a date limit lives **inside** the subsection, so only a read of the container catches it (`rule.require.bhrowser-citations`: pull the **container**, not the section)

### how the byte-identity was proven REAL, not a collapsed slug

identical bodies from distinct edition urls can also mean the site collapsed the year segment. controls that must be able to fail:

| probe | chars | verdict |
|-------|------:|---------|
| §274, **2018** edition | 61,685 | ✅ differs — the year segment is honored |
| §274, **1899** (a year that does not exist) | 566 | ✅ "Page Not Found" — the control fails as it must |
| **§262**, 2022 edition | 1,457 | ✅ differs — the section segment is honored |

### ⚠️ what is still NOT verified here

| row | status |
|-----|--------|
| §274(n) 50% and its exceptions | ✅ 2022, 2023, 2024 editions, byte-identical |
| §274(b)(1) $25 gift cap | ✅ same three editions + Cornell current text |
| **§170(b)(2)(A) 10% charitable cap** | ⚠️ **2023 edition + current text only.** the 2022 and 2024 editions were not pulled, so the cap is not established for those years |
| the **§170** qualifier | the 10% applies to contributions *"other than for contributions to which **subparagraph (B) or (C)** applies"* — those subparagraphs were not read |

⛔ the charitable row is **narrower than the meal rows**; one verification does not launder the other.

---

## .startup costs (special treatment)

costs incurred **before** the business opened (market research, pre-launch ads, formation) are **startup costs**:

- deduct up to **$5,000** in year one (phased out if total startup costs > $50k)
- the rest is **amortized over 15 years**

## .the small-software-company pattern

for a small software co, the deductible expenses to look for on statements:

- ✅ ad platforms (promotion)
- ✅ payment processor fees
- ✅ API / comms vendors
- ✅ cloud compute, domains, SaaS tools
- ✅ CPA fees, state filing fees
- ⚠️ any personal charge on the same card → **exclude**

## .documentation

keep for each deduction: the **statement/receipt**, the **amount**, the **date**, and the **business purpose**. that trio defends a deduction on audit.

## .see also

- `define.why-expenses-are-deductible` (the principle)
- `catalog.non-deductible-expenses` (what to exclude)
- `howto.file.federal.delinquent.active-loss` (where they go on the return)

## .provenance

rate rows pulled with **bhrowser**, headful, per `rule.require.bhrowser-citations`, 2026-08-31. no WebFetch or WebSearch summary stands behind any percentage.

| pull | what it settled |
|------|-----------------|
| §274 + §170, per edition, two publishers | the three rate texts, verbatim |
| the collision control (2018 · 1899 · §262) | that the edition urls are real |
| §274(n), sliced from its own header to (o) | ⭐ the restaurant carve-out |

| source | chars |
|--------|------:|
| §274, govinfo 2022 / 2023 / 2024 editions | 62,286 each — byte-identical |
| §274, govinfo **2018** edition | 61,685 |
| §274, Cornell current text | 30,644 |
| §170, govinfo 2023 edition | pulled |
| §262, govinfo 2022 edition (control) | 1,457 |

⚠️ a needle search for `100 percent` found **zero hits in any §274 source** — (n)(2)(D) is drafted as an *exception* and never states a percentage. only the slice from `(n)` to `(o)`, with a refusal guard on a missed start marker, found it.

## .sources

- [26 U.S.C. § 274 — 2024 edition, govinfo](https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleA-chap1-subchapB-partIX-sec274.htm)
- [26 U.S.C. § 274 — Cornell current text](https://www.law.cornell.edu/uscode/text/26/274)
- [26 U.S.C. § 170 — Cornell current text](https://www.law.cornell.edu/uscode/text/26/170)
- [IRC § 162 — Trade or business expenses](https://www.law.cornell.edu/uscode/text/26/162)
- [Stripe: Business startup tax deductions](https://stripe.com/resources/more/business-startup-tax-deductions-101-what-every-business-needs-to-know)
- [Insureon: C Corporation Tax Deductions](https://www.insureon.com/blog/tax-deductions-for-c-corps)
- [IRS: Instructions for Form 1120](https://www.irs.gov/instructions/i1120)

> ⚠️ not tax advice. this catalog helps you *aggregate candidates*; a CPA confirms deductibility and category per item.
