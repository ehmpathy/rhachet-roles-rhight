# compare.entity-tax-implications

> ⚠️ **not legal advice**, and not tax advice. this brief helps you find what to ask; confirm it for your facts with a licensed attorney or CPA.

## .what

comparison of tax implications across LLC, S-corp, and C-corp structures for solo founders.

---

## .quick comparison

| aspect | LLC (default) | S-corp | C-corp |
|--------|---------------|--------|--------|
| **corporate tax** | 0% | 0% | 21% |
| **pass-through** | yes | yes | no |
| **self-employment tax** | 15.3% on all profit ⚠️ *SS portion capped* | 15.3% on salary only | none |
| **double taxation** | no | no | yes (on dividends) |
| **QBI deduction** | yes | yes | no |
| **QSBS eligible** | no | no | ⚠️ only if it clears **§1202(e)(3)** |

⚠️ **the first column heads an ENTITY; the second heads an ELECTION.** an S-corp is
a tax election on **Form 2553**, and an **LLC can make it**. the entity decision
(LLC or corporation, which state) and the tax-election decision (default, S, or C)
are **separate and separately reversible**.

---

## ⛔ no worked totals are published

per-structure totals and breakeven tables are not hand-computed here
(`rule.forbid.hand-computed-figures`). a generic table must assume away exactly
the inputs that decide the answer, and three bases are easy to get wrong:

| base | the naive assumption | what the law provides |
|---|---|---|
| the SS cap | 12.4% on all profit | **§1402(b)(1)** — capped at the contribution and benefit base |
| the SE base | 15.3% × gross profit | **§1402(a)(12)** — a deduction of net earnings × half the §1401 rates, so the base is ~**92.35%** of net earnings |
| the QBI deduction | omitted | **§199A** — up to 20%; LLC and S-corp qualify |

> "except that such term shall not include— (1) in the case of the tax imposed
> by section 1401(a), that part of the net earnings from self-employment which
> is in excess of (i) an amount equal to the **contribution and benefit base**…
> minus (ii) the amount of the wages paid to such individual"
>
> — [26 U.S.C. §1402(b)(1)](https://www.law.cornell.edu/uscode/text/26/1402)

the **12.4% Social Security portion stops at the base**; only the 2.9% Medicare
portion runs on every dollar. a flat 15.3% overstates SE tax above the base, and
the error grows with income. progressivity and the standard deduction also
matter.

to get a number, put your own figures (filing status, state, salary split, QBI
phaseout, the year's SS base) through tax software or a CPA.

---

## .the three tax layers

### layer 1: corporate tax

| structure | rate | notes |
|-----------|------|-------|
| LLC | 0% | pass-through entity |
| S-corp | 0% | pass-through election |
| C-corp | 21% | flat federal rate |

### layer 2: self-employment tax (15.3%)

| structure | applies to | notes |
|-----------|------------|-------|
| LLC | **all profit** | 12.4% Social Security + 2.9% Medicare |
| S-corp | **salary only** | distributions exempt |
| C-corp | none | owners are W-2 employees |

> "The self-employment tax rate is 15.3% (12.4% Social Security + 2.9% Medicare). The Social Security cap for 2026 is $184,500."
>
> — [SDO CPA](https://www.sdocpa.com/self-employment-tax-guide/)

### layer 3: dividend / distribution tax

| structure | rate | notes |
|-----------|------|-------|
| LLC | 0% | already taxed as income |
| S-corp | 0% | already taxed as income |
| C-corp | 0-23.8% | qualified dividends taxed at capital gains rates |

---

## .qualitative breakdown by structure

⚠️ **C-corp retain vs distribute is not like-for-like.** retained earnings stay
**inside the company** — the founder has received none of it and still owes tax
on anything later taken out. compare a pass-through against the **distribute**
case when the founder needs the cash; the retain case is deferral, not savings.

### LLC (default / disregarded entity)

**pros:**
- simple (no payroll, no corporate returns)
- low compliance cost (~$500/year)
- flexible profit allocation

**cons:**
- highest tax burden for profitable businesses
- SE tax on entire profit (SS portion capped at the base)
- no QSBS eligibility

### S-corp (pass-through with salary split)

**pros:**
- SE tax only on salary (🚩 "saves $6K+ vs LLC" — unsourced, depends on the salary split)
- pass-through (no corporate tax)
- QBI deduction eligible

**cons:**
- must pay "reasonable salary" (IRS enforced)
- payroll compliance (~$1,500-$3,000/year)
- no QSBS eligibility
- must satisfy **§1361(b)** — ⚠️ **not** "≤100 shareholders, US only", which errs in both directions:

| the shorthand | §1361 |
|---|---|
| "≤100 shareholders" | a **family** counts as **one** shareholder — a common ancestor and every lineal descendant, capped at 6 generations, §1361(c)(1) |
| "US only" | (b)(1)(B)'s own parenthesis admits an **estate**, a **(c)(2) trust**, and a **(c)(6) organization**. what (b)(1)(C) bars is a **nonresident alien** — a residency test, not a citizenship one |
| (unstated) | the corporation itself must be **domestic**, and must not be one of the three kinds (b)(2) excludes |

the "one class of stock" limit often decides the answer for a founder, with its
own carve-out: voting and nonvoting **common** stock is a single class,
§1361(c)(4). full treatment in `variant=c-corp/compare.s-corp-vs-c-corp-tax-election.md`.

### C-corp (retained earnings)

**pros:**
- lowest rate **if you retain earnings** — but see the like-for-like caution above
- QSBS eligible ⚠️ **subject to §1202(e)(3)** — see the QSBS section below
- unlimited shareholders, any nationality
- preferred by VCs

**cons:**
- double taxation if you distribute
- no QBI deduction
- more compliance

### C-corp (distributed as dividends)

corporate tax first, then a qualified-dividend rate on what reaches the
shareholder. this is the row to compare against a pass-through when the founder
needs the cash.

---

## .breakeven analysis

⛔ **no breakeven table is published.** a breakeven is a *difference* of two
totals, so it carries both totals' errors and a reader acts on it directly.

the published rule of thumb:

> "The breakeven point for S-Corp election is typically $40,000-$50,000 in annual net business income."
>
> — [SDO CPA](https://www.sdocpa.com/llc-vs-s-corp-complete-comparison/)

treat it as a prompt to run your own numbers; the crossover moves with salary
split, state, filing status, and the QBI phaseout.

### when C-corp wins

C-corp wins when you:
- retain earnings (🚩 "21% vs 33%+" — unsourced; see the like-for-like caution)
- plan to sell for $10M+ ⚠️ **and the business clears §1202(e)(3)** (QSBS)
- raise VC (required structure)

---

## .special tax benefits

### QBI deduction (S-corp and LLC only)

the Qualified Business Income deduction lets you deduct up to **20% of qualified business income** before your personal tax rate applies.

| structure | QBI eligible | effect |
|-----------|--------------|--------|
| LLC | yes | 24% rate → ~19% effective |
| S-corp | yes | 24% rate → ~19% effective |
| C-corp | no | n/a |

**phaseout:** §199A(b)(3) and (e)(2) set a threshold amount that is **indexed
annually**, published by the IRS in an annual revenue procedure — not in the
statute. take the current year's threshold from the IRS and record its year
(`$191,950` single / `$383,900` married are the **2024** amounts).

## 🚨 §199A and §1202 EXCLUDE THE SAME BUSINESSES — by explicit cross-reference

for a solo service business the two "special tax benefits" fail **together**.

§199A(d)(1) denies the deduction to a *specified service trade or business*, and
(d)(2) defines that term by pointing directly at the QSBS list:

> "The term 'specified service trade or business' means any trade or business—
> (A) which is **described in section 1202(e)(3)(A)** (applied without regard to
> the words 'engineering, architecture,') or which would be so described if the
> term **'employees or owners'** were substituted for 'employees' therein…"
>
> — [26 U.S.C. §199A(d)(2)(A)](https://www.law.cornell.edu/uscode/text/26/199A)

one list, used twice, with two named differences:

| | §1202 (QSBS) | §199A (QBI) |
|---|---|---|
| engineering, architecture | ⛔ excluded | ✅ **carved back in** |
| the reputation-or-skill clause | "of 1 or more of its **employees**" | **"employees or owners"** — broader |

⛔ **for a solo founder in a service field:** the QBI deduction phases out above
the threshold, **and** the C-corp QSBS exclusion is unavailable. the
disqualification tracks *the work*, not the structure. under §199A the
reputation-or-skill clause reaches a business whose principal asset is the skill
of its **owners** — a description of a solo founder.

### but §199A is a phase-in, not a cliff

§199A(d)(3)(A) preserves the deduction below the threshold plus **$75,000**
($150,000 joint), and (d)(3)(B) scales it down proportionally across that band.
a service business under the threshold keeps the full deduction.

⚠️ §1202 has **no such grace band** — a business that fails (e)(3) fails outright.

### QSBS exclusion (C-corp only)

§1202 excludes gain on the sale of stock in a **C corporation** — §1202(c)(1),
*"any stock in a C corporation."*

## ⛔ BUT QSBS DOES NOT REACH MANY SOLO-FOUNDER BUSINESSES — §1202(e)(3)

> "For purposes of this subsection, the term **'qualified trade or business'
> means any trade or business other than**—
>
> (A) any trade or business involving the performance of services in the fields
> of health, law, engineering, architecture, accounting, actuarial science,
> performing arts, **consulting**, athletics, financial services, brokerage
> services, **or any trade or business where the principal asset of such trade
> or business is the reputation or skill of 1 or more of its employees**,
>
> (B) any banking, insurance, financing, leasing, investing, or similar
> business, (C) any farming business…, (D) any business involving the
> production or extraction of products…, and (E) any business of operating a
> hotel, motel, restaurant, or similar business."
>
> — [26 U.S.C. §1202(e)(3)](https://www.law.cornell.edu/uscode/text/26/1202)

a business whose principal asset is the skill of one person is the paradigm
case. a solo consultant, designer, lawyer, accountant, or financial adviser who
incorporates as a C-corp **for QSBS** may get no exclusion at all.

§1202(e)(1)(A) requires that **80% of the corporation's assets by value** be used
in a *qualified* trade or business — a failure of (e)(3) disqualifies the stock.

⛔ **whether a given business clears (e)(3) is a fact question a CPA or tax
counsel must answer.** do not choose an entity on the strength of QSBS before
that answer exists.

### ⚠️ the commonly-quoted "$10M, 5 years, 100%" is no longer the whole rule

| what is usually said | what §1202 now provides |
|---|---|
| per-issuer cap **$10M** | **(b)(4)(A)** $10,000,000 for stock acquired **on or before** the applicable date · **(b)(4)(B)** **$15,000,000** after it · **(b)(5)** indexed for years after 2026 |
| held **>5 years** | **(b)(2)** eligible gain = stock held **at least 3 years** — *"more than 5 years in the case of stock acquired on or before the applicable date"* |
| **100%** exclusion | **(a)(5)** a table: **3 years → 50%**, **4 years → 75%**, **5 years or more → 100%** |
| (unstated) | the corporation's gross assets test is **$75,000,000**, also indexed after 2026 |

**the cap and the holding period both turn on an acquisition date**, so two
founders in the same company can face different rules. §1202(b)(1)(B) also
preserves the alternative — **10 times the aggregate adjusted bases** — the
larger figure for a founder whose basis is not near zero. the "$10M / >5 years /
100%-or-none" summary is correct only for stock acquired **on or before** the
applicable date.

no exit-value table is published: every cell would depend on a single cap and
percentage, and §1202 supplies neither (`rule.forbid.hand-computed-figures`).

---

## .compliance costs

| structure | annual cost | includes |
|-----------|-------------|----------|
| LLC | ~$500 | state fee, simple return |
| S-corp | ~$2,000-$4,000 | payroll, 1120-S, K-1s |
| C-corp | ~$2,000-$5,000 | 1120, state returns, minutes |

factor compliance costs into your breakeven analysis.

---

## .decision matrix

| if you... | best structure |
|-----------|----------------|
| profit <$50K/year | LLC (compliance cost > tax savings) |
| profit $50K-$200K, bootstrapped | S-corp (SE tax savings) |
| profit >$200K, retain earnings | C-corp (21% < 33% 🚩 — deferral, see caution above) |
| plan to raise VC | C-corp (required) |
| plan to sell for $10M+, **and clear §1202(e)(3)** | C-corp (QSBS) |
| plan to sell for $10M+, **service business** | ⚠️ QSBS may not apply — ask a CPA first |
| want simplicity above all | LLC |
| have **nonresident-alien** co-founders | C-corp (§1361(b)(1)(C) bars them from an S-corp) |

---

## .state tax considerations

this brief covers federal taxes only. state taxes vary:

| state | notes |
|-------|-------|
| Delaware | no state tax on out-of-state income |
| California | $800 minimum franchise tax (all entities) |
| Texas | no state income tax, but franchise tax on revenue |
| WY | no state income tax |
| New York | high state taxes on all structures |

consult a CPA for state-specific guidance.

---

## .summary for solo founders

| scenario | recommendation | why |
|----------|----------------|-----|
| just started, <$50K profit | LLC | simplicity > tax savings |
| profitable, bootstrapped | S-corp | 🚩 "6-10% lower effective rate" — unsourced; run your own numbers |
| plan to raise VC | C-corp | investors require it |
| plan big exit ($10M+) | C-corp | QSBS — ⚠️ **only if §1202(e)(3) is cleared**; the saved amount depends on the acquisition date, so it is not stated here |
| retain most earnings | C-corp | 21% corporate rate |

---

## .publishability

☀️ **fullsun** (share) — public tax law across entity types; no client identity or client-specific mechanic.

## .sources

### the statutes — pulled 2026-08-31, bhrowser headful

1. [26 U.S.C. §1202](https://www.law.cornell.edu/uscode/text/26/1202) — QSBS: (a)(5) the percentage table, (b)(2) the holding period, (b)(4) the $10M/$15M split, (c)(1) "C corporation", (e)(1) the 80% asset test, **(e)(3) the excluded trades**
2. [26 U.S.C. §199A](https://www.law.cornell.edu/uscode/text/26/199A) — QBI: (d)(1) the denial, **(d)(2)(A) the cross-reference to §1202(e)(3)(A)**, (d)(3) the phase-in
3. [26 U.S.C. §1402](https://www.law.cornell.edu/uscode/text/26/1402) — SE tax: (a)(12) the ~92.35% base, **(b)(1) the contribution-and-benefit-base cap**

**edition check:** the current Cornell text and the govinfo **2023 edition** of
§1202 were diffed: `$15,000,000` → 2 hits current / **0** in 2023; `75,000,000` →
3 / **0**; `50,000,000` → **0** / 2. that is how the current cap and gross-assets
test were established.

### secondary — read as commentary, never as authority

4. [IRS: S Corporation Employees, Shareholders and Corporate Officers](https://www.irs.gov/businesses/small-businesses-self-employed/s-corporation-employees-shareholders-and-corporate-officers)
5. [IRS: About Form 2553](https://www.irs.gov/forms-pubs/about-form-2553)
6. [SDO CPA: LLC vs S-Corp Complete Comparison](https://www.sdocpa.com/llc-vs-s-corp-complete-comparison/)
7. [SDO CPA: Self-Employment Tax Guide 2026](https://www.sdocpa.com/self-employment-tax-guide/)
8. [SDO CPA: C-Corporation Tax Guide](https://www.sdocpa.com/c-corporation-tax-guide/)
9. [Carta: QSBS Explained](https://carta.com/learn/startups/tax-planning/qsbs/)
10. [Wolters Kluwer: S Corp vs C Corp Differences](https://www.wolterskluwer.com/en/expert-insights/s-corp-vs-c-corp-differences-benefits)
11. [Otterz: LLC vs S-Corp vs C-Corp 2026 Tax Comparison](https://otterz.co/how-the-new-2025-tax-rules-impact-llcs-s-corps-and-c-corps-entity-comparison-guide/)

## .date researched

2026-08-31

(taken from the brief's own sources, "the statutes — pulled 2026-08-31, bhrowser headful")
