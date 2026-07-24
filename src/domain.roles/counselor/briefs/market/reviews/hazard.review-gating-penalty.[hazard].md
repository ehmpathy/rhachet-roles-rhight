# hazard.review-gating-penalty

## .what

when a program pays a reward for a review, two distinct redlines attach: (1) the **federal** rule
against *review-gating* — a benefit conditioned on the review being positive, or a penalty on a
consumer for a negative one — and (2) a **state** overlay that, in one of the five baseline states
(California), carries a **fixed per-violation civil penalty** for a non-disparagement clause or a
penalty imposed for a review. this brief runs the five-state sweep (TX, IN, FL, CA, NY) required by
`rule.require.five-state-baseline` and names the strictest.

the punchline: a **sentiment-blind** reward — paid for a *verified, disclosed* review regardless of
its score — is outside both redlines. a reward **gated on a positive score**, or a contract that
**gags** the customer from a review, is inside them. the federal floor (FTC review rule + the
Consumer Review Fairness Act) binds nationwide; California then stacks a $2,500 / $5,000 / $10,000
penalty on top.

## .why

- review-gating is a **structural** defect, not a disclosure gap: a reward only for 5-star reviews (or
  a clawback for a 1-star one) distorts the review corpus and is what the rules forbid.
- the federal review rule and the CRFA apply in every served state; the CA penalty applies to any
  consumer served in California — so the CA bar is the strictest-common-denominator floor.
- this brief is the **penalty overlay** to the sentiment-blind boundary — see
  `define.boundary.sentiment-blind-vs-sentiment-gated`.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance.

---

## the federal floor — FTC 16 CFR 465 + the Consumer Review Fairness Act

two federal instruments bind nationwide, under all five states:

- **FTC 16 CFR part 465** (the review rule, in force 2024) prohibits, among other practices, purchase
  of positive reviews and a misrepresentation that reviews are independent. see
  `ref.ftc-part-465-review-rule.[ref].md` for the verbatim text.
- **the Consumer Review Fairness Act, 15 U.S.C. § 45b**, voids a contract clause that bars or
  penalizes a consumer's honest review. verbatim on the core void rule:

> "a provision of a form contract is void from the inception of such contract if such provision …
> prohibits or restricts the ability of an individual who is a party to the form contract to engage in
> a covered communication"

and on the ban against penalties:

> "imposes a penalty or fee against an individual who is a party to the form contract for engaging in
> a covered communication"

**source**: [15 U.S.C. § 45b — Consumer Review Fairness Act (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/45b)

---

## the five-state matrix

| state | dedicated review-gate / non-disparagement statute? | verbatim-cited authority | teeth | strict? |
|-------|------------------------------------------------------|--------------------------|-------|---------|
| TX | **no** state analogue — general DTPA + federal CRFA only | Tex. Bus. & Com. Code § 17.46 (DTPA) | DTPA damages | |
| IN | **no** state analogue — general DCSA + federal CRFA only | Ind. Code § 24-5-0.5-3 | DCSA damages | |
| FL | **no** state analogue — general FDUTPA + federal CRFA only | Fla. Stat. § 501.204 | actual damages | |
| CA | **yes** — the "Yelp bill" bars a review-waiver clause and a penalty for a review | Cal. Civ. Code § 1670.8 | **$2,500 / $5,000 / $10,000** civil penalty | ⭐ |
| NY | **no** enacted analogue (a bill was proposed, never passed) — general GBL §§ 349/350 + CRFA | N.Y. Gen. Bus. Law § 349 | treble to $1,000 | |

**baseline = California** — it is the only one of the five with a **dedicated** anti-review-gate
statute that carries a **fixed per-violation civil penalty**. TX, IN, FL, and NY reach the same
conduct only through general UDAP plus the federal CRFA, which void the clause but do not add CA's
tiered penalty. a program built to clear CA § 1670.8 clears the nationwide floor for the review-gate.

---

## the statute verbatim — Cal. Civ. Code § 1670.8 (the "Yelp bill")

the ban on a review-waiver clause, § 1670.8(a)(1):

> "A contract or proposed contract for the sale or lease of consumer goods or services may not include
> a provision waiving the consumer's right to make any statement regarding the seller or lessor or its
> employees or agents, or concerning the goods or services."

the ban on a penalty for a review, § 1670.8(a)(2):

> "It shall be unlawful to threaten or to seek to enforce a provision made unlawful under this section,
> or to otherwise penalize a consumer for making any statement protected under this section."

the tiered civil penalty, § 1670.8(c)–(d):

> penalties "not to exceed two thousand five hundred dollars ($2,500) for the first violation, and five
> thousand dollars ($5,000) for the second and for each subsequent violation."

> "For a willful, intentional, or reckless violation of this section, a consumer or public prosecutor
> may recover a civil penalty not to exceed ten thousand dollars ($10,000)."

**source**: [Cal. Civ. Code § 1670.8 (CA Legislative Info, official)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1670.8.&lawCode=CIV)

---

## the two sides of the line

| dimension | inside the redline | outside the redline |
|-----------|--------------------|---------------------|
| reward trigger | paid only for a **positive** review; clawed back for a negative one | paid for a **verified** review regardless of score |
| contract clause | a **non-disparagement** / review-waiver clause | no clause that restricts honest reviews |
| disclosure | the incentive is hidden | the incentive is **clearly and conspicuously disclosed** |
| what a regulator sees | a sentiment-skewed corpus | a sentiment-blind, disclosed corpus |

the review-gate hazard is removed by the **same three levers** the disclosed-review rule already
names: (1) pay **sentiment-blind**, (2) **disclose** the incentive, (3) require the review be **from a
verified purchaser** — none of which conditions the reward on a positive score or gags a negative one.

---

## severity

**blocker** (if a reward is gated on positive sentiment, or a contract gags reviews, in any served
state). the federal CRFA voids the clause everywhere; California adds a per-violation penalty that a
**public prosecutor or the consumer** may pursue, up to $10,000 for willful conduct. this is
structural — disclosure alone does not cure a sentiment-gated reward.

---

## the honest gap

- no state's **case law** that applies § 1670.8 to a modern points-for-reviews program was found; the
  read that a sentiment-blind, disclosed, verified-purchaser reward sits outside § 1670.8 and the CRFA
  is a **counsel-confirmable** position.
- **NY and other states** have floated review-protection bills; the five-state sweep reflects the
  **enacted** landscape as quoted — counsel should re-check for newly enacted analogues.
- the FTC part 465 rule is recent (2024); its application to incentivized reviews is unsettled —
  track enforcement.

## key takeaways

| question | answer |
|----------|--------|
| strictest of the five? | **CA** — § 1670.8, $2,500 / $5,000 / $10,000 |
| federal floor everywhere? | yes — FTC 16 CFR 465 + CRFA (15 U.S.C. § 45b) |
| which states have a dedicated statute? | only CA among the five |
| what removes the hazard? | sentiment-blind + disclosed + verified-purchaser |
| disclosure-curable? | no — a sentiment-gated reward is structural |

## .publishability

☀️ **fullsun** (share) — generic public-law hazard; federal floor + five-state matrix of primary law,
neutral both-sides voice, no client identity or client-specific mechanic.

## .see also

- `define.boundary.sentiment-blind-vs-sentiment-gated.[lesson].md` — the boundary this penalizes
- `define.boundary.disclosed-vs-undisclosed-incentive.[lesson].md`
- `define.boundary.verified-vs-fake-review.[lesson].md`
- `ref.ftc-part-465-review-rule.[ref].md` — the federal review rule
- `rule.prefer.verified-disclosed-sentiment-blind-reviews.[rule].md`
- `ref.udap-remedy-teeth.five-state.[ref].md` — the general UDAP fallback teeth
- `rule.require.five-state-baseline.[rule].md` (repo-wide)

## .sources

1. [Cal. Civ. Code § 1670.8 — the "Yelp bill": review-waiver ban + $2,500/$5,000/$10,000 penalty (CA Legislative Info, official)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1670.8.&lawCode=CIV)
2. [15 U.S.C. § 45b — Consumer Review Fairness Act, voids review-gag clauses (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/45b)
3. [16 CFR part 465 — FTC rule on consumer reviews and testimonials (see collocated ref brief)](https://www.law.cornell.edu/cfr/text/16/part-465)
4. [Tex. Bus. & Com. Code § 17.46 — DTPA general deceptive-acts route (no dedicated review statute)](https://texas.public.law/statutes/tex._bus._&_com._code_section_17.46)
5. [Ind. Code § 24-5-0.5-3 — Deceptive Consumer Sales Act general route](https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-5-0-5-3/)
6. [Fla. Stat. § 501.204 — FDUTPA general route (no dedicated review statute)](https://www.flsenate.gov/Laws/Statutes/2025/501.204)
7. [N.Y. Gen. Bus. Law § 349 — deceptive-acts general route (no enacted review-gating statute)](https://www.nysenate.gov/legislation/laws/GBS/349)

## .date researched

2026-07-22
