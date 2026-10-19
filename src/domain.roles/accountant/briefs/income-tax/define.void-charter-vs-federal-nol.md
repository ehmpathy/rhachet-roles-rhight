# define.void-charter-vs-federal-nol

## .what

a Delaware **void** charter does **not** break the federal NOL chain. the loss years still count, the deductions still stand, and the carryforward survives.

federal corporate status turns on **how the entity was organized and what the business did** — not on whether a state registry lists the charter as in good standing.

**confidence: high, with one inference.** each link is a direct quote from the operative text — classification, the existence test, Delaware's void statute, Delaware's dissolution statutes, and a case that states the forfeit/dissolve distinction. the one inference — that an event *unlisted* in the existence test cannot terminate existence — is a reading of the regulation's structure, flagged where it appears.

each claim carries a **citation ledger** of 7+ independent sources, with cross-publisher equality checks where a decision rests on exact wording. see `.provenance`.

## .why it matters here

a Delaware corporation whose charter voids part-way through its life, and whose business carries on, will have loss years on both sides of the void date. the question is whether the ones inside the void window still count.

an illustrative chain — round numbers, attributed to no real entity:

| year | charter status | NOL generated (illustrative) |
|------|----------------|-----------------------------:|
| 1 | active | −$10,000 |
| 2 | void from mid-year | −$20,000 |
| 3 | void all year | −$10,000 |

most of that carryforward arises while the charter is void, so the question decides real money.

- ⚠️ any total across the void window is a **computed** figure — take it from `assemble.1120`, never add rows by eye (`rule.forbid.hand-transcription`)
- 🚩 **which years were filed is a fact to verify, never to assert.** an **IRS account transcript** states what the IRS holds, a substitute-for-return among it. pull one before any claim that a year is filed or unfiled
- ⚠️ a first return sets the method of accounts; a later change needs Form 3115. a transcript for the earliest years also tells you which return came first
- ⚠️ the absorption-order read for an earlier-year NOL rests on **§172(b)(2), which has NOT been pulled** — an inference. verified: the indefinite carryforward (§172(b)(1)(A)(ii)(II)) and the 80% cap (§172(a)(2)(B))

## .the grid

| | federal income tax (1120) | DE franchise tax | DE state income tax (1100) |
|---|---|---|---|
| still classified a corporation? | **yes** — §301.7701-2(b)(1) keys on how it was *organized* | n/a | follows federal (DE Revenue FAQ) |
| entity exists during void? | **yes** — void is not dissolution | n/a (the tax that caused the void) | follows federal |
| duty to file? | **yes** — §1.6012-2(a)(1) is unconditional | reports owed for the pre-void years | **exempt** under §1902(b)(6) if no business within DE — see below |
| expenses deductible? | **yes** — §162 turns on ordinary + necessary, not on registry status | n/a | n/a if exempt |
| NOL generated? | **yes** | n/a | 🚩 DE NOL rules not checked |
| NOL survives to a future year? | **yes** — indefinite under §172(b)(1)(A)(ii)(II), capped at 80% use | n/a | 🚩 not checked |
| capacity to litigate it in Tax Court? | 🚩 **open** — possibly impaired until revival | n/a | n/a |
| what void actually broke | no federal consequence found | the charter + state-conferred powers | — |

## .the chain, in three links

### 1. federal corporate status keys on how the entity was ORGANIZED

> "(b) *Corporations.* For federal tax purposes, the term *corporation*
> means— (1) A business entity **organized under** a Federal or State
> statute, or under a statute of a federally recognized Indian tribe, if
> the statute describes or refers to the entity as incorporated or as a
> corporation, body corporate, or body politic"
> — [26 CFR § 301.7701-2(b)(1)](https://www.ecfr.gov/current/title-26/section-301.7701-2)

"**organized under**" is a completed historical act — not "in good standing under," not "presently chartered by." a later void does not un-organize the entity.

[26 U.S.C. § 7701(a)(3)](https://www.law.cornell.edu/uscode/text/26/7701) ("The term 'corporation' includes associations, joint-stock companies, and insurance companies") points the same way but is weaker — a non-exclusive inclusion, not the operative test.

✅ **counter-theory tested and rejected:** that a void charter *reclassifies* the entity (disregarded entity, sole proprietorship) and moves the losses onto a personal return. the full text of §301.7701-2 was searched for any provision that terminates or changes classification on void, forfeiture, or loss of good standing. **there is none** — classification turns on organization and elections.

### 2. federal existence is a conduct test

> "A corporation in existence during any portion of a taxable year is
> required to make a return... **A corporation is not in existence after it
> ceases business and dissolves, retaining no assets, whether or not under
> State law it may thereafter be treated as continuing as a corporation for
> certain limited purposes** connected with winding up its affairs, such as
> for the purpose of suing and being sued."
> — [26 CFR § 1.6012-2(a)(2)](https://www.law.cornell.edu/cfr/text/26/1.6012-2)

to go out of existence federally takes **three things at once**: cease business **and** dissolve **and** retain no assets. a voided corporation that kept its business up met none of the three, so its duty to file never lapsed.

⚠️ **what the clause does and does not say.** "whether or not under State law" is directional: it stops state law from keeping a corporation alive federally *after* it ceased, dissolved, and shed its assets. it does **not** say state law cannot end federal existence. the reverse-direction conclusion rests on **structure**: the reg names one way out (cease + dissolve + no assets), and a void charter is not on the list. **this is an inference from the text, not a quotation of it** — well supported by links 1 and 3, but a synthesis. see the open-items table.

### 3. void is NOT dissolution — the distinction the federal test turns on

[8 Del. C. § 510](https://delcode.delaware.gov/title8/c005/index.html): after **1 year** unpaid, or an unfiled complete annual report, *"the charter of the corporation shall be **void**, and all powers conferred by law upon the corporation are declared **inoperative**"* — with a mandatory November 30 notice and a good-cause extension. the whole sentence, cross-checked `1,358 = 1,358`: `registrator/…/delaware.franchise.tax.delinquency.md` § *what void means*.

§510 voids the **charter** and makes powers **conferred by law** inoperative — the state-granted privileges (to sue, to transact as a corporation in DE, to obtain good-standing certificates). it does not dissolve the corporation.

**Delaware dissolution takes three affirmative acts, none of which happened:**

> "(b) At the meeting a vote shall be taken upon the proposed dissolution.
> If a majority of the outstanding stock of the corporation entitled to
> vote thereon shall vote for the proposed dissolution, a certification of
> dissolution shall be filed with the Secretary of State...
> (d) If dissolution is authorized in accordance with this section, **a
> certificate of dissolution shall be executed, acknowledged and filed**"
> — [8 Del. C. § 275](https://delcode.delaware.gov/title8/c001/sc10/index.html)

a board resolution, a stockholder vote, and a **filed certificate**. §510 void happens automatically, by operation of law, for nonpayment — a different event with different mechanics.

**a court has said so directly:**

> "**Since a corporation with a forfeited charter has not been dissolved,
> the corporation continues to exist for limited purposes.**"
> — *Gibson v. Dennis (In re Russell)*, 123 B.R. 48
> ([Bankr. W.D. Ark. 1990](https://www.courtlistener.com/opinion/1882362/gibson-v-dennis-in-re-russell/)),
> which cites *Contractors, Laborers, Teamsters & Engineers Health &
> Welfare Plan v. Hroch*, 757 F.2d 184, 190-91 (8th Cir. 1985)

quoted from the **opinion**, not a snippet. Arkansas law in a bankruptcy court — persuasive, not binding — but it states the forfeit/dissolve distinction squarely.

so a corporation that was **voided, not dissolved**, and never filed a certificate of dissolution, stays in existence. the federal out-of-existence test fails on all three prongs.

### 3b. what the federal carve-out was actually aimed at

the "certain limited purposes connected with winding up its affairs, such as for the purpose of suing and being sued" clause maps onto a Delaware statute almost word for word:

> "All corporations, whether they expire by their own limitation or are
> otherwise **dissolved**, shall nevertheless be continued, for the term of
> 3 years... bodies corporate **for the purpose of prosecuting and
> defending suits**... and of enabling them gradually to settle and close
> their business"
> — [8 Del. C. § 278](https://delcode.delaware.gov/title8/c001/sc10/index.html)

so the federal carve-out targets **post-dissolution** existence — not void charters at all, which strengthens link 2.

## .and revival erases the window anyway

Delaware revival is **fully retroactive**:

> "...the corporation shall be revived with the same force and effect as if
> its certificate of incorporation had not been forfeited or void... Such
> revival shall **validate all contracts, acts, matters and things** made,
> done and performed within the scope of its certificate of incorporation
> by the corporation, its directors..., officers, agents and stockholders
> ... during the time when its certificate of incorporation was forfeited
> or void..., with the same force and effect and to all intents and
> purposes **as if the certificate of incorporation had at all times
> remained in full force and effect**."
> — [8 Del. C. § 312(e)](https://delcode.delaware.gov/title8/c001/sc12/index.html)

once reinstatement lands, the state treats the void window as though it never happened.

⚠️ **§312 carried two versions** — "[Effective until Aug. 1, 2026]" and "[Effective Aug. 1, 2026]", both checked. ✅ both (e) paragraphs were extracted and compared programmatically: **2 found, both 1,684 chars, `identical: true`**, with the version markers captured to prove the comparison spanned both versions; an independent `diff` agrees. **the amendment does not touch retroactivity.** (a single changed word in a retroactivity clause would invert the conclusion, so an eyeball is not enough — `rule.forbid.hand-transcription`.)

## .what §172 actually gives you

**the carryforward is indefinite** for these losses:

> "(II) in the case of a net operating loss arising in a taxable year
> beginning **after December 31, 2017, to each taxable year following** the
> taxable year of the loss"
> — [26 U.S.C. § 172(b)(1)(A)(ii)(II)](https://www.law.cornell.edu/uscode/text/26/172)

no 20-year clock, so no deadline pressure from §172 itself.

**but its use is capped at 80% of income:**

> "(ii) **80 percent** of the excess (if any) of— (I) taxable income
> computed without regard to the deductions under this section and sections
> 199A and 250, over (II) the amount determined under subparagraph (A)."
> — [26 U.S.C. § 172(a)(2)(B)](https://www.law.cornell.edu/uscode/text/26/172)

a future profitable year cannot be zeroed out; plan cash for tax on the remaining 20%.

⚠️ §172(g) cross-references **§382**, which limits NOL use after a change of ownership. immaterial while ownership is unchanged, but it would silently destroy this carryforward — flag it before any raise, share issuance, or sale.

## ✅ Delaware state income tax — an express statutory exemption

> "(b) The following corporations shall be exempt from taxation under this
> chapter: ... (6) **A corporation maintaining a statutory corporate office
> in the State but not doing business within the State**"
> — [30 Del. C. § 1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html)

the classic Delaware shell posture — incorporated in DE, registered agent in DE, operations elsewhere — is exempt by statute, not by an apportionment argument. the Division of Revenue confirms the trigger and the pointer:

> "Every domestic or foreign corporation **doing business in Delaware**,
> not specifically exempt under Section 1902(b), Title 30, Delaware Code,
> is required to file a corporate income tax return... regardless of the
> amount, if any, of its gross income or its taxable income. **The taxable
> status of a corporation in Delaware follows the federal treatment of the
> corporation.**"
> — [DE Division of Revenue, Corporate Income Tax FAQ](https://revenue.delaware.gov/frequently-asked-questions/corporate-income-tax-faqs/)

DE **follows federal** on taxable status, so the federal conclusion above carries into Delaware.

⚠️ **two caveats:**

1. **"doing business within the State" is a facts test.** confirm the corporation has no DE nexus.
2. **the form name may have changed.** the DE FAQ names **"Form CIT-TAX"**; older material (including a sibling brief) says **"Form 1100"**. verify the current form before filing.

| worry | verdict |
|-------|---------|
| "do I lose the void-window deductions?" | no |
| "does the NOL chain break at the void date?" | no |
| "should I file the void-window years anyway?" | **yes — the duty never lapsed** |
| "does filing them admit something bad?" | no; the duty was never conditional |
| "must reinstatement precede the 1120s?" | no — they are independent tracks |

void status is not a reason to **skip** the federal returns. §1.6012-2(a)(1) requires a return "regardless of whether it has taxable income or regardless of the amount of its gross income." to skip one is what would put the carryforward at risk — an unfiled year is a year whose loss was never established.

the IRS instructions settle it a fortiori:

> "**Unless exempt under section 501, all domestic corporations (including
> corporations in bankruptcy) must file an income tax return whether or not
> they have taxable income.**"
> — [Instructions for Form 1120, "Who Must File"](https://www.irs.gov/pub/irs-pdf/i1120.pdf)

**bankruptcy** does not excuse the return; a void charter — a lesser disability the corporation can cure unilaterally — does not either. the only listed escape is §501 exempt status.

### ⛔ Schedule L is skippable for the IRS — and MUST NOT be skipped here

> "Corporations with total receipts (page 1, line 1a plus lines 4 through
> 10) and total assets at the end of the tax year less than $250,000 are
> not required to complete Schedules L, M-1, and M-2 **if the "Yes" box on
> Schedule K, question 13, is checked.**"
> — [Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf)

a small corporation under $250k on both tests has the (conditional) exemption available. but these returns exist to substantiate gross assets to Delaware, and Delaware names Schedule L:

> "Total Gross Assets shall be those 'total assets' reported on the U.S.
> Form 1120, **Schedule L** (Federal Return)…"
> — [Delaware Division of Corporations](https://corp.delaware.gov/frtaxcalc/)

**so: complete Schedule L**, notwithstanding the exemption. it is a permission, not a prohibition, and the per-year bank-cash figure IS needed. the full resolution — including why page 1 **Item D** carries total assets either way — is in `federal/define.form-1120-for-delaware-franchise-tax.md`.

## 🚩 an adjacent hazard: capacity to LITIGATE

a void or forfeited corporation may lack capacity to bring or maintain an action — including a **U.S. Tax Court** petition. Tax Court Rule 60 keys a corporation's capacity to the law of the state of organization, so a void DE charter could block a petition until revival.

⚠️ **NOT VERIFIED — a lead only.** it surfaced from a search index, and every attempt to pull the Tax Court rules returned site chrome (1,168 chars), not the rule.

it does **not** touch whether the NOL exists — only whether the corporation could *defend* it. that argues for revival on its own track, and against a long gap between filing the returns and reinstatement. **to close:** read Tax Court Rule 60(c) from the actual rules text.

## 🚩 what is NOT established here

| gap | status | why it is open |
|-----|--------|----------------|
| Tax Court capacity while void | ❌ **unreachable** | ustaxcourt.gov defeated headless + headful + 4 urls + a govinfo mirror. read Rule 60(c) from the printed rules |
| whether DE has its own NOL rules | 🚩 not checked | out of scope of this pass |
| the exact void date | ✅ **closed** | the Division's entity-search `Status as of:` field reads **`3/1/2024`** (pulled with the position, re-attested before the revival). ⚠️ do not re-derive it from "two years" of §510: the trigger is **1 year**, a good-cause extension moves it **later**, the unfiled-report prong can bite **sooner**, and a corporation that never received notice has no cushion at all. see `registrator/…/delaware.franchise.tax.delinquency.md` § *why everyone says "two years"* |
| the "unlisted event does not terminate existence" reading | 🚩 **inference** | a reading of the structure of §1.6012-2(a)(2), not a quote. buttressed by §278 (what the carve-out targets) and *In re Russell* (forfeit ≠ dissolve), but a synthesis |
| a case squarely on "void charter + federal NOL" | ❌ **none found** | CourtListener returns forfeited-charter cases on state-law capacity, not federal tax. the absence is itself a finding |
| DE §1902(b)(6) second publisher | ⚠️ partial | Justia mirror returned a stub; single-publisher on the statute text |
| DE form name: **Form 1100 vs CIT-TAX** | 🚩 **open** | both `income-tax/state=delaware/howto.file.state=delaware.{current,delinquent}.active-loss` carry this flag and the §1902(b)(6) exemption. no form name was changed; a swap on a second-hand report is a guess |

⭐ **a hedge does not propagate itself.** when a gap closes or a caveat lands, update every row and every sibling brief that described it — a cure that reaches the subject and not the citation leaves a stale row that costs a re-derivation.

## .provenance

every quote pulled with **bhrowser** and quoted from the rendered page, per `rule.require.bhrowser-citations`. no WebFetch or WebSearch summary relied on for any quote.

### the citation ledger, per claim

**claim 1 — void ≠ dissolution; the corporation remained in existence**

| # | source | kind | note |
|---|--------|------|------|
| 1 | [8 Del. C. § 510](https://delcode.delaware.gov/title8/c005/index.html) — void = charter void, powers inoperative | statute (official) | 41,668 ch |
| 2 | [8 Del. C. § 510](https://law.justia.com/codes/delaware/title-8/chapter-5/section-510/) — Justia mirror | statute (2nd publisher) | ✅ **byte-identical, 1,358 = 1,358** |
| 3 | [8 Del. C. § 275](https://delcode.delaware.gov/title8/c001/sc10/index.html) — dissolution needs resolution + vote + filed certificate | statute | 46,414 ch |
| 4 | 8 Del. C. § 274 — dissolution before shares issued, also by certificate | statute | same pull |
| 5 | 8 Del. C. § 276 — nonstock dissolution, also by certificate | statute | same pull |
| 6 | [8 Del. C. § 278](https://delcode.delaware.gov/title8/c001/sc10/index.html) — continuation *after dissolution* for suits | statute | same pull |
| 7 | [*In re Russell*, 123 B.R. 48](https://www.courtlistener.com/opinion/1882362/gibson-v-dennis-in-re-russell/) — "a corporation with a forfeited charter has not been dissolved" | **case law** | 11,465 ch, opinion opened |
| 8 | *Hroch*, 757 F.2d 184 (8th Cir. 1985) — cited by #7 | case law | via #7 |

**claim 2 — the duty to file is unconditional**

| # | source | kind |
|---|--------|------|
| 1 | [26 CFR § 1.6012-2(a)(1)](https://www.ecfr.gov/current/title-26/section-1.6012-2) — eCFR API, 20,161 ch | reg (official) |
| 2 | [26 CFR § 1.6012-2](https://www.law.cornell.edu/cfr/text/26/1.6012-2) — Cornell, 19,622 ch | reg (2nd publisher) |
| 3 | ✅ **cross-check:** (a)(2) eCFR 1,277 ch vs Cornell 1,307 ch — delta is exactly the 30-char heading `"(2) Existence of corporation. "`; substantive text identical | equality test |
| 4 | [26 U.S.C. § 6012](https://www.law.cornell.edu/uscode/text/26/6012) — the statute behind the reg | statute |
| 5 | [26 U.S.C. § 6012](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section6012) — uscode.house.gov, 31,792 ch | statute (2nd publisher) |
| 6 | [Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf) — "including corporations in bankruptcy" | IRS (pdftotext, 304,094 ch) |
| 7 | [IRS Pub. 542](https://www.irs.gov/pub/irs-pdf/p542.pdf), Corporations | IRS (pdftotext, 171,321 ch) |

**claim 3 — still classified a corporation**

| # | source | kind |
|---|--------|------|
| 1 | [26 CFR § 301.7701-2(b)(1)](https://www.ecfr.gov/current/title-26/section-301.7701-2) — "organized under", 41,754 ch | reg (official) |
| 2 | [26 CFR § 301.7701-3](https://www.ecfr.gov/current/title-26/section-301.7701-3) — elective classification, 34,881 ch | reg |
| 3 | ✅ **counter-theory rejected:** full text of both searched for any provision that terminates or changes classification on void / forfeiture / loss of good standing — **none found** | negative search |
| 4 | [26 U.S.C. § 7701(a)(3)](https://www.law.cornell.edu/uscode/text/26/7701) | statute |
| 5 | [26 U.S.C. § 7701](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section7701) — 150,591 ch | statute (2nd publisher) |
| 6 | [Form 1120](https://www.irs.gov/pub/irs-pdf/f1120.pdf) — entity fields carry no good-standing attestation, 46,942 ch | IRS form |
| 7 | DE Revenue: "taxable status ... follows the federal treatment" | state agency (corroborative) |

**claim 4 — revival is retroactive**

| # | source | kind |
|---|--------|------|
| 1 | [8 Del. C. § 312(e)](https://delcode.delaware.gov/title8/c001/sc12/index.html) "[Effective until Aug. 1, 2026]" | statute (official) |
| 2 | 8 Del. C. § 312(e) "[Effective Aug. 1, 2026]" — same pull | statute |
| 3 | ✅ **equality test:** 2 paragraphs found, both **1,684 ch**, `identical: true`, version markers captured | programmatic |
| 4 | ✅ independent `diff` — byte-identical | second method |
| 5 | [8 Del. C. § 312](https://law.justia.com/codes/delaware/title-8/chapter-1/subchapter-xii/section-312/) — Justia, 13,253 ch | 2nd publisher |
| 6 | ✅ **cross-check** vs official: 1,684 = 1,684, `agree: true` | equality test |
| 7 | 8 Del. C. § 313 — revival for exempt corps, "same force and effect as provided in § 312(e)" | statute |

**claim 5 — NOL is indefinite but capped at 80%**

| # | source | kind |
|---|--------|------|
| 1 | [26 U.S.C. § 172(b)(1)(A)(ii)(II)](https://www.law.cornell.edu/uscode/text/26/172) — Cornell, 16,618 ch | statute |
| 2 | [26 U.S.C. § 172](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section172) — 103,765 ch | 2nd publisher |
| 3 | ✅ **cross-check:** 161 vs 162 ch — delta is one space (`(II)in` vs `(II) in`), a renderer artifact; statutory text identical. investigated, not assumed | equality test |
| 4 | 26 U.S.C. § 172(a)(2)(B) — the 80% cap | statute |
| 5 | [26 U.S.C. § 382](https://www.law.cornell.edu/uscode/text/26/382) — ownership-change limit, 34,818 ch | statute |
| 6 | [IRS Topic 515](https://www.irs.gov/taxtopics/tc515) | IRS |
| 7 | IRS Pub. 542 — NOL section | IRS |

**claim 6 — Delaware income tax exemption**

| # | source | kind |
|---|--------|------|
| 1 | [30 Del. C. § 1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html) — statutory-office exemption, 46,963 ch | statute (official) |
| 2 | [DE Division of Revenue, Corporate Income Tax FAQ](https://revenue.delaware.gov/frequently-asked-questions/corporate-income-tax-faqs/) — points to §1902(b), 7,369 ch | state agency |
| 3 | same — "taxable status ... follows the federal treatment" | state agency |
| 4 | 30 Del. C. § 1902(b)(1)–(8) — full exemption list read, not only (6) | statute |
| ⚠️ | Justia mirror of §1902 returned a 3,112-ch **stub without the section text** — so this claim is **single-publisher** on the statute, corroborated by the agency FAQ but not independently cross-cited | ❌ gap |

### to re-verify

raw pulls are **not committed** (large, re-pullable); the verbatim quotes above ARE the citation. re-open each url from the tables above in bhrowser; for 26 CFR use the eCFR API (the human page CAPTCHAs):

```
https://www.ecfr.gov/api/versioner/v1/full/<YYYY-MM-DD>/title-26.xml?part=1&section=1.6012-2
```

### short pulls, and what each was

eight pulls came back short, and every one was junk: eCFR human page 867 (CAPTCHA) · Tax Court rules ×4 urls 1,168–1,468 · Justia ×3 headless 262 · CourtListener headless 513 · DE Revenue forms 1,217 · govinfo PDF 566. headful cleared Justia (→ 4,934 / 13,253) and CourtListener (→ 8,172); ❌ **the U.S. Tax Court site defeated every attempt**, so that claim stays open. the methods: `rule.require.bhrowser-citations.traps`.

## .see also

- `define.delaware-1100-vs-federal-1120-vs-franchise-tax.md` — the three documents that sound alike
- `federal/howto.file.federal.delinquent.active-loss.md`
- `registrator` role — `howto.reinstate-void-delaware-corp.md`
