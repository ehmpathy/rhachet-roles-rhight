# compare: §179 vs §168(k) bonus vs plain MACRS

## .what

three ways to deduct a capital asset. they differ in **when** the deduction lands, never in how much — each eventually deducts the full cost.

| | §179 | §168(k) "bonus" | MACRS (do neither) |
|---|---|---|---|
| how you get it | **elect IN** | **automatic — elect OUT** | the default residue |
| rate — **2023** | 100% of cost, **under the caps** ⬇️ | **80%** of basis | ~20% yr 1 (5-yr, half-year) |
| rate — **2024** | 100% of cost, **under the caps** ⬇️ | **60%** of basis | same |
| rate — **2025** | 100% of cost, **under the caps** ⬇️ | **100%**, electable down to 40% | same |
| **how many caps?** | ⚠️ **five** — §179(b)(1)–(5) | **none** | none |
| — dollar cap | **yes** — §179(b)(1), **indexed annually** | no | no |
| — phase-out on total spend | **yes** — §179(b)(2), **indexed annually** | no | no |
| — capped by income | **yes** — §179(b)(3), applied **last** | **no** | no |
| unused amount | carries over (§179(b)(3)(B)) — but see (B)(ii) | n/a | n/a |
| can it create/deepen a loss? | **no** | **yes** | yes |
| where reported | Form 4562 Part I | Form 4562 Part II | Form 4562 Part III |

**the headline most write-ups bury:** bonus applies by force of statute; the affirmative act is to opt **out**. §179 is the opposite. for bonus the question is "should we *decline*?"

## .the verified core

### bonus is mandatory unless refused

> "In the case of any qualified property— (A) the depreciation deduction
> provided by section 167(a) for the taxable year in which such property is
> placed in service **shall include** an allowance equal to the applicable
> percentage of the adjusted basis of the qualified property"
> — [26 U.S.C. § 168(k)(1)(A)](https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleA-chap1-subchapB-partVI-sec168.htm) (2023 edition)

"shall include," not "may elect." the only election named turns it off:

> "**(7) Election out** — If a taxpayer makes an election under this
> paragraph with respect to any class of property for any taxable year,
> paragraphs (1) and (2)(F) **shall not apply** to any qualified property
> in such class placed in service during such taxable year."
> — 26 U.S.C. § 168(k)(7)

✅ cross-checked: 326 chars in both the govinfo 2023 edition and Cornell's current text, `agree: true`.

§179, by contrast, is opt-in:

> "A taxpayer **may elect** to treat the cost of any section 179 property as
> an expense which is not chargeable to capital account."
> — [26 U.S.C. § 179(a)](https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleA-chap1-subchapB-partVI-sec179.htm)

✅ cross-checked: 253 = 253, `agree: true`.

### 🛑 THE RATE IS DIFFERENT EVERY YEAR — and current law tells you 100% for all of them

§168(k)(6)(A) is a **phase-down table**, quoted in full from the govinfo **2024 edition** (identical in 2023):

> "**(6) Applicable percentage** … (A) In general — Except as otherwise
> provided in this paragraph, the term 'applicable percentage' means—
> (i) … after September 27, 2017, and before January 1, 2023, **100 percent**,
> (ii) … after December 31, 2022, and before January 1, 2024, **80 percent**,
> (iii) … after December 31, 2023, and before January 1, 2025, **60 percent**,
> (iv) … after December 31, 2024, and before January 1, 2026, **40 percent**, and
> (v) … after December 31, 2025, and before January 1, 2027, **20 percent**."
> — [26 U.S.C. § 168(k)(6)(A)](https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleA-chap1-subchapB-partVI-sec168.htm), 2024 edition

| asset placed in service | applicable percentage |
|---|---|
| 2023 | **80%** — (A)(ii) |
| 2024 | **60%** — (A)(iii) |
| 2025 | ⚠️ **(A)(iv) says 40% — but see the 2025 section below.** the answer is 100% |

⛔ quote the whole table, never one clause: a single "2023 rate" carried to a 2024 return overstates the deduction by 20 points of basis.

### ⚠️ §168(k)(6) HAS THREE TABLES, and a grep returns the wrong one

(A) is the general rule. **(B)** covers *"property with longer production periods"* and **(C)** *"plants bearing fruits and nuts"* — and (B) runs a full year **behind** (A):

| asset placed in service | (A) general | (B) long production period |
|---|---|---|
| 2024 | **60%** | **80%** |
| 2025 | 40% (see below) | **60%** |

a search for `December 31, 2023` inside §168 returns two clauses with different percentages. the qualifier that picks the table is the subparagraph header, which a line-scoped grep never sees — pull the container.

### the 2023/2024 clauses no longer exist

Cornell's current text of §168 shows:

> "[(6) **Repealed.** Pub. L. 119–21, title VII, § 70301(b)(1)(B), **July 4,
> 2025**, 139 Stat. 189]"
> — [26 U.S.C. § 168, current](https://www.law.cornell.edu/uscode/text/26/168)

with §168(k)(1)(A) rewritten to a flat **"100 percent"** and the applicable-percentage concept deleted. **so the current statute gives the wrong number for a 2023 asset** — caught by an equality test whose `foundInB: false` was the finding.

| pull | §168(k)(1)(A) says | 2023 | 2024 | 2025 |
|------|--------------------|:----:|:----:|:----:|
| Cornell, current text | flat 100% | ❌ | ❌ | ✅ |
| govinfo, **2023 edition** | applicable percentage → 80% | ✅ | ❌ | ❌ |
| govinfo, **2024 edition** | applicable percentage → 60% | ❌ | ✅ | ❌ |

no single pull is right for more than one year, and the current text is right only for the year a back-year filer is least likely to work on.

> **for a back-year return, pull the edition of the code for that year**, not the current text.

### ✅ THE 2025 RATE IS 100%, NOT 40% — the phase-down never reaches 2025

(A)(iv) says 40%; that clause was repealed and (1)(A) rewritten to a flat 100%. the transition election settles which governs:

> "**(10) Special rule for property placed in service during certain periods**
> **(A) In general** — In the case of qualified property placed in service by
> the taxpayer during **the first taxable year ending after January 19, 2025**,
> if the taxpayer **elects** to have this paragraph apply for such taxable
> year, paragraph (1)(A) shall be applied—
> (i) in the case of property which is not described in clause (ii), by
> substituting **'40 percent' for '100 percent'**, or
> (ii) … by substituting **'60 percent' for '100 percent'**."
> — [26 U.S.C. § 168(k)(10)](https://www.law.cornell.edu/uscode/text/26/168), current text

- an election that swaps 40% *in place of* 100% is unintelligible unless **100% is the default** for that year
- for a calendar-year corporation, *"the first taxable year ending after January 19, 2025"* is **tax year 2025**

| a 2025 asset | rate |
|---|---|
| default (no election) | **100%** |
| §168(k)(10) election, ordinary property | 40% |
| §168(k)(10) election, long production period | 60% |

⚠️ the election is form-prescribed: §168(k)(10)(C) — *"Any election under this paragraph shall be made at such time and in such form and manner as the Secretary may prescribe."* on a **delinquent** return the elective 40% is likely unavailable (same reason as the de minimis safe harbor, below). that cuts one way only: it leaves the **higher** default.

🚩 **the last open link:** the effective-date provision of Pub. L. 119-21 § 70301 itself was not quoted. Cornell carries the repeal citations for §168(k)(6) and (k)(8) — *"Pub. L. 119–21, title VII, § 70301(b)(1)(B), July 4, 2025, 139 Stat. 189"* — but no "Effective Date of 2025 Amendment" note. the conclusion rests on §168(k)(10)'s own words — a textual argument, not a quote of the date.

### 🚨 §179(b) IS TITLED "LIMITATIONS" AND HAS FIVE

| ¶ | title | the cap |
|---|---|---|
| **(b)(1)** | **Dollar limitation** | *"The aggregate cost which may be taken into account under subsection (a) for any taxable year shall not exceed **$1,000,000**."* |
| **(b)(2)** | **Reduction in limitation** | *"The limitation under paragraph (1)… shall be reduced (but not below zero) by the amount by which the cost of section 179 property placed in service during such taxable year exceeds **$2,500,000**."* |
| **(b)(3)** | Limitation based on income | quoted whole below |
| **(b)(4)** | Married individuals filing separately | the two are treated as 1 taxpayer for (1) and (2) |
| **(b)(5)** | Passenger vehicles | an SUV is capped at **$25,000** |

### ⛔ never elide the cross-reference in (b)(3)(A)

> "The amount allowed as a deduction under subsection (a) for any taxable year
> **(determined after the application of paragraphs (1) and (2))** shall not
> exceed the aggregate amount of taxable income of the taxpayer for such taxable
> year which is derived from the active conduct by the taxpayer of any trade or
> business during such taxable year."
> — 26 U.S.C. § 179(b)(3)(A), govinfo 2023 edition

- the parenthetical is the phrase that names the other two limitations; a `…` over it reads as an income-only cap
- measured: a quote with that `…` passed the cross-publisher test at 338 = 338, `agree: true`

> ⛔ **a cross-publisher equality test validates the SOURCE, not the QUOTE you wrote from it.** a truncation at transcription never reaches the comparison. read your rendered quote back against the pull, ellipsis by ellipsis.

### ⚠️ THE §179 CAPS MOVE EVERY YEAR TOO

> "**(6) Inflation adjustment** — (A) In general. In the case of any taxable
> year beginning after 2018, the dollar amounts in paragraphs **(1), (2), and
> (5)(A)** shall each be increased by an amount equal to— (i) such dollar
> amount, multiplied by (ii) the cost-of-living adjustment determined under
> section 1(f)(3) for the calendar year in which the taxable year begins…"
> — 26 U.S.C. § 179(b)(6)

⚠️ **$1,000,000 and $2,500,000 are the STATUTORY BASE amounts, not the operative figures for any recent year.** the operative amount is base + the §1(f)(3) adjustment, rounded per (b)(6)(B) to the nearest $10,000. **take a return year's figure from the IRS, and record the year** — the same per-year discipline as the §168(k) rate.

### §179 is capped at income — but the excess is NOT lost

the carryover, quoted whole:

> "**(B) Carryover of disallowed deduction** — The amount allowable as a
> deduction under subsection (a) for any taxable year shall be increased by
> the lesser of— (i) **the aggregate amount disallowed under subparagraph
> (A) for all prior taxable years** (to the extent not previously allowed as
> a deduction by reason of this subparagraph), or **(ii) the excess (if any)
> of— (I) the limitation of paragraphs (1) and (2)** (or if lesser, the
> aggregate amount of taxable income referred to in subparagraph (A)), **over
> (II) the amount allowable as a deduction under subsection (a) for such
> taxable year without regard to this subparagraph.**"
> — 26 U.S.C. § 179(b)(3)(B)

- "§179 is useless in a loss year" is an overstatement: the allowed deduction is **$0** that year, but the disallowed amount **carries over indefinitely** — deferred, not forfeited
- the carryover is the **lesser** of the disallowed amount and the year's remaining (1)/(2) headroom — bounded by the **dollar** cap too, not by income alone

| bucket | how much of a future year's income can it absorb |
|--------|--------------------------------------------------|
| §179 carryover | up to **100%** of active-business taxable income — ⚠️ **and no more than the (b)(1)/(b)(2) dollar limitation for the year it lands in**, per (b)(3)(B)(ii)(I) |
| NOL carryforward (from bonus/MACRS) | **80%** cap, per §172(a)(2)(B) |

so in a pure loss chain §179 arguably lands in the *better* bucket — ⚠️ only while the dollar cap is slack. near the §179(b)(1) limit, the §179 bucket acquires a ceiling the NOL bucket lacks.

## .the asset-class test, link by link

"does a computer qualify for bonus?" resolves through three cross-references, all read:

| step | provision | text |
|------|-----------|------|
| 1 | §168(k)(2)(A)(i)(I) | qualified property = property "which has a **recovery period of 20 years or less**" |
| 2 | §168(e)(3)(B)(iv) | "**5-year property** includes... any qualified technological equipment" |
| 3 | §168(i)(2)(A)(i) | "qualified technological equipment means— (i) **any computer or peripheral equipment**" |

5 ≤ 20, so a computer is **qualified property**. two further conditions are **facts about the purchase**:

- §168(k)(2)(A)(ii) — "the **original use** of which begins with the taxpayer," or a used-property acquisition that meets §168(k)(2)(E)(ii). a new retail machine satisfies it; a used one needs the acquisition test
- §168(k)(2)(A)(iii) — placed in service before 2027. ✅

### ✅ computers are NOT listed property

listed property drags in §274(d)-style substantiation and a business-use test:

> "Listed property is any of the following. • Passenger automobiles (as
> defined later). • Business aircraft (discussed later). • Other property
> used for transportation..."
> — [IRS Pub. 946](https://www.irs.gov/pub/irs-pdf/p946.pdf), "What Is Listed Property?"

no computers on the list (TCJA removed them, for tax years after 2017).

⚠️ edition caveat: the pull is Pub. 946 **(2025)**. the TCJA change predates 2023 so it holds, but a back-year claim deserves the back-year publication.

## .the decision, for a loss corporation

**when every year is a loss and the NOL carries forward indefinitely, the timing question is worth almost zero.**

| path | 2023 | 2024 | 2025 | rest |
|------|-----:|-----:|-----:|------|
| bonus (default) | **80%** now | **60%** now | **100%** now | remainder over the MACRS life |
| elect out → MACRS | ~20% now | ~20% now | ~20% now | remainder over 5 years |
| §179 | $0 now (income cap) | $0 now | $0 now | carries over — bounded by income **and** by (b)(1)/(b)(2) |

all three deduct the **entire** cost; none reduces tax today in a loss year. they differ only in **which year's loss** the deduction deepens — nearly a wash under an indefinite carryforward.

> **take the default.** bonus applies automatically at the year's applicable percentage, the remaining basis depreciates normally, and no election is required.

- the default is the highest number in all three years; every alternative (elect out, §179, the §168(k)(10) election, de minimis) moves the deduction *later*
- the path that needs no election matters most on a delinquent return, where elective paths are at risk
- the capital-asset choice is **not** a filing blocker: the one-shot trap is §179 (26 CFR §1.179-5(a): the election must be made on the **first** return for that year), and §179 is the option you would decline here anyway

🚩 **an unexplored fourth path:** the **de minimis safe harbor** under Reg. §1.263(a)-1(f) lets a taxpayer expense items under a per-item threshold ($2,500 without an applicable financial statement) rather than capitalize. a sub-$2,500 machine is under it — **but the election is made on a *timely filed* return (incl. extensions)**, so it is likely unavailable on a back-year return. this reg was **not pulled**; it is a lead, not authority.

## .what this means on Form 4562

| you want | part | note |
|----------|-----:|------|
| §179 | I | requires the election; capped at business income |
| bonus (special depreciation allowance) | II | the default path |
| ordinary MACRS | III | carries the post-bonus basis |

Form 4562 is required for any year with depreciation on property placed in service that year, whichever path is taken.

## .provenance

pulled with **bhrowser**, per `rule.require.bhrowser-citations`. no WebFetch or WebSearch summary is behind any quote.

| # | source | chars | note |
|---|--------|------:|------|
| 1 | [26 U.S.C. §168, Cornell (current)](https://www.law.cornell.edu/uscode/text/26/168) | 95,476 | shows the repeal + flat 100% |
| 2 | [26 U.S.C. §168, govinfo **2023 edition**](https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleA-chap1-subchapB-partVI-sec168.htm) | 371,584 | the operative text for a 2023 asset |
| 2b | [26 U.S.C. §168, govinfo **2024 edition**](https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleA-chap1-subchapB-partVI-sec168.htm) | 371,120 | the operative text for a 2024 asset |
| 3 | [26 U.S.C. §179, Cornell (current)](https://www.law.cornell.edu/uscode/text/26/179) | 12,605 | |
| 4 | [26 U.S.C. §179, govinfo **2023 edition**](https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleA-chap1-subchapB-partVI-sec179.htm) | 39,218 | |
| 5 | [IRS Pub. 946](https://www.irs.gov/pub/irs-pdf/p946.pdf) | 722,055 | via `pdftotext -layout` |
| 6 | [Instructions for Form 4562](https://www.irs.gov/pub/irs-pdf/i4562.pdf) | 170,115 | via `pdftotext -layout` |
| 7 | [Form 4562](https://www.irs.gov/pub/irs-pdf/f4562.pdf) | 14,790 | via `pdftotext -layout` |

❌ **uscode.house.gov failed** for both sections — `granuleid:USC-prelim-title26-section168` redirected to `docnotfound.xhtml` at **128 chars**. govinfo replaced it, and publishes by **edition year**.

### the equality-test results, and every delta explained

9 comparisons across two publishers; a delta is a question, not a verdict:

| claim | lenA | lenB | agree | cause |
|-------|-----:|-----:|:-----:|-------|
| K1 — 2023 = 80 percent | 111 | **0** | ❌ | **real divergence** — repealed by Pub. L. 119-21 |
| K2 — "shall include applicable percentage" | 237 | **0** | ❌ | **real divergence** — same repeal; current text says flat 100% |
| K3 — election out | 326 | 326 | ✅ | — |
| K4 — 20 years or less | 85 | 81 | ❌ | govinfo prefixes `(i)(I) `; Cornell splits `(i)` to its own line |
| K5 — qualified technological equipment | 43 | 42 | ❌ | `(iv) any` vs `(iv)any` — one space, renderer artifact |
| K6 — any computer or peripheral equipment | 41 | 40 | ❌ | `(i) any` vs `(i)any` — same artifact |
| K7 — §179 income cap | 338 | 338 | ✅ | — (⚠️ blind to a `…` in the quote as written; see above) |
| K8 — §179 carryover | 175 | 174 | ❌ | `(i) the` vs `(i)the` — same artifact |
| K9 — "may elect to treat" | 253 | 253 | ✅ | — |

four of six mismatches are one Cornell renderer artifact (subparagraph marker inlined without a trailing space). **two were substantive** — the repeal this brief turns on.

### the §179 edition collision, resolved by control

both §179 editions (2023, 2024) returned **39,218** chars — a collapsed year segment or a statute that did not move. probes that **must fail**:

| probe | result | verdict |
|---|---|---|
| §179, **1899** edition | exit **200**, **44,164 chars**, body says "not found" | ✅ soft-404 — the year segment is read |
| §179, **2016** edition | `says $500,000: true` · `says $1,000,000: false` · `says $2,000,000: true` | ✅ **pre-TCJA figures** — the year segment is honored |
| §168, 2024 edition | 482,140 chars vs §179's 39,218 | ✅ the section segment is honored independently |

- §179 genuinely did not change 2023→2024; the last change to (b)(1)/(b)(2) was **Pub. L. 115-97 §13101(a)**, in 2017
- the 1899 probe is a **soft 404 at exit 200, 44,164 chars** — the byte-count heuristic passes it; only the body's copy catches it
- ⚠️ the control compared raw HTML while the main pull compared `innerText`; only the control's internal comparisons carry the verdict

### the §168 per-edition pulls

| pull | what it settled |
|------|-----------------|
| §168 per edition, 2023 · 2024 · current | the **whole** (6) table, all three subparagraphs |
| a public-law anchor probe over current §168 | located §168(k)(10) |
| §168(k)(10) sliced (10) → (11) | the **"40 percent" for "100 percent"** substitution, verbatim |

- a 640-char window around the anchor truncated (10) at *"(i) in the case of property which is not"*; only the whole-(10) slice returned `"40 percent"` verbatim. a structural guess was not written in its place
- no collision: 2023 = 371,584 chars vs 2024 = 371,120, though §168(k)(6) itself is word-for-word identical across the two
- the refusal guard fired on Cornell, which renders `[(6)Repealed…` with no space after the marker — it emitted `⛔ START MARKER MISSED` rather than 95,540 chars under a name that promised one subsection

## .see also

- `records/howto.substantiate-expenses.md` — the §274(d) / §6001 record rules
- `income-tax/define.void-charter-vs-federal-nol.md` — the §172 carryforward
- `skills/assemble.1120` — holds line-20 capital out of line 27 by design
