# define.boundary.ccpa-financial-incentive-opt-in

## .what

a rewards or loyalty program that ties a **price, rate, or service level** to a consumer's
**data** — collection, sale/share, or retention of personal information — is a **"financial
incentive"** under California privacy law, and California is the **only** one of the five baseline
states that gates such a program behind **prior opt-in consent**. the other four take the **opposite**
posture: a bona fide loyalty program is an express **safe harbor** that needs no opt-in.

this brief marks that boundary — the line between a **data-neutral** rewards program (points earned
for a purchase or referral, no data-value exchange) and a **data-priced** one (a better price *because*
the consumer shares data) — and runs the five-state sweep (TX, IN, FL, CA, NY) required by
`rule.require.five-state-baseline`.

the headline: **the posture inverts across the five.** where TX, IN, and FL *permit* loyalty-data
programs by default (safe harbor), CA *prohibits* enrolling a consumer absent affirmative, revocable
opt-in consent. NY has no financial-incentive rule at all. so the strictest-common-denominator design
must satisfy **CA's opt-in**, even though four of five states never require it.

## .why

- this is a **wholly new redline** the referral/gift-card/UDAP briefs do not touch — it is a *data*
  rule, not a *money* or *lottery* rule, and it bites only when the reward is tied to **data value**.
- the boundary is precise and design-controllable: a program that rewards a **purchase or referral**
  (not a data-sharing choice) is **data-neutral** and outside the financial-incentive rule entirely;
  a program that offers a better deal **in exchange for data** is a financial incentive and triggers
  CA's opt-in.
- the posture inversion is a trap: a design lawful-by-default in TX/IN/FL can be **unlawful in CA**
  without the opt-in — the served-market duty (see `rule.require.five-state-baseline` → `.the nexus
  note`) means the CA consumer's rule attaches regardless of where the company sits.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance.

---

## the boundary

```
DATA-NEUTRAL rewards (outside the financial-incentive rule)
  reward earned for a PURCHASE or a REFERRAL
  price/service does NOT vary by a data-sharing choice
  → no CA opt-in trigger; safe-harbor in TX/IN/FL; irrelevant in NY
        │
        ▼   add a data-value exchange
        │
DATA-PRICED rewards ("financial incentive")
  a better price / rate / service level BECAUSE the consumer
  shares, sells, or lets the business retain personal information
  → CA § 1798.125(b) OPT-IN required (revocable, 12-mo cooldown)
  → still safe-harbor in TX/IN/FL if "bona fide"; no rule in NY
```

the lever is **what the reward is priced on**. a point for a dollar spent or a friend referred is not
a data price. a discount that exists *because* the consumer opted into data-sharing **is**.

---

## the five-state matrix

| state | posture on a loyalty / financial-incentive **data** program | verbatim-cited authority | opt-in required? | strict? |
|-------|-------------------------------------------------------------|--------------------------|------------------|---------|
| TX | **safe harbor** — bona fide loyalty/rewards program expressly permitted | Tex. Bus. & Com. Code § 541.101(c) | no | |
| IN | **safe harbor** — voluntary bona fide loyalty/rewards program permitted | Ind. Code § 24-15-4-1 | no | |
| FL | **safe harbor** — bona fide loyalty program permitted (FDBR) | Fla. Stat. § 501.71 et seq. | no | |
| CA | **opt-in gate** — a financial-incentive data program needs prior opt-in consent, revocable | Cal. Civ. Code § 1798.125(b) | **yes** | ⭐ |
| NY | **no rule** — no comprehensive privacy law; SHIELD is breach-security only | N.Y. Gen. Bus. Law § 899-bb | n/a | |

**baseline = California** — § 1798.125(b) sets an affirmative **prior opt-in** gate for any
financial-incentive data program, revocable at any time, with a 12-month cooldown before re-asking a
consumer who declined. this **inverts** the TX/IN/FL safe-harbor default. a program built to CA's
opt-in clears all five.

---

## the statutes verbatim

### CA — Cal. Civ. Code § 1798.125 (CCPA/CPRA) — the opt-in gate

california first permits loyalty programs in the abstract, § 1798.125(a)(3):

> "This subdivision does not prohibit a business from offering loyalty, rewards, premium features,
> discounts, or club card programs consistent with this title."

but any program that is a **financial incentive** tied to data value is governed by subdivision (b),
which imposes the opt-in — § 1798.125(b)(3):

> "A business may enter a consumer into a financial incentive program only if the consumer gives the
> business prior opt-in consent pursuant to Section 1798.130 that clearly describes the material terms
> of the financial incentive program, and which may be revoked by the consumer at any time. If a
> consumer refuses to provide opt-in consent, then the business shall wait for at least 12 months
> before next requesting that the consumer provide opt-in consent, or as prescribed by regulations
> adopted pursuant to Section 1798.185."

and a backstop against abusive pricing, § 1798.125(b)(4):

> "A business shall not use financial incentive practices that are unjust, unreasonable, coercive, or
> usurious in nature."

**source**: [Cal. Civ. Code § 1798.125 (california.public.law)](https://california.public.law/codes/civil_code_section_1798.125)

### TX — Tex. Bus. & Com. Code § 541.101(c) (TDPSA safe harbor)

texas takes the opposite posture — a bona fide loyalty program is expressly **not** prohibited
discrimination, with no opt-in gate:

> a controller may "offer a different price, rate, level, quality, or selection of goods or services to
> a consumer, including offering goods or services for no fee, if the consumer has exercised the
> consumer's right to opt out … or the offer is related to a consumer's voluntary participation in a
> bona fide loyalty, rewards, premium features, discounts, or club card program."

**source**: [Tex. Bus. & Com. Code § 541.101 (public.law mirror)](https://texas.public.law/statutes/tex._bus._and_com._code_section_541.101)

### IN — Ind. Code § 24-15-4-1 (ICDPA safe harbor)

indiana matches texas — voluntary bona fide loyalty programs are permitted, no opt-in gate:

> the nondiscrimination rule does not prohibit "a controller from offering a different price, rate,
> level, quality, or selection of goods or services to a consumer, including offering goods or services
> for no fee, if … the offer is related to a consumer's voluntary participation in a bona fide loyalty,
> rewards, premium features, discount, or club card program."

**source**: [Ind. Code § 24-15-4-1 (FindLaw)](https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-15-4-1/)

### NY — no comprehensive privacy law (SHIELD is security-only)

new york has **no** comprehensive consumer-privacy statute with a financial-incentive rule. its SHIELD
Act (Gen. Bus. Law § 899-bb) is a data-security / breach-notification law only — it requires a business
to "develop, implement and maintain reasonable safeguards to protect the security, confidentiality and
integrity of the private information," and is silent on loyalty pricing or data-incentives.

**source**: [N.Y. Gen. Bus. Law § 899-bb (NYS Senate, official)](https://www.nysenate.gov/legislation/laws/GBS/899-BB)

---

## the two sides of the boundary

| dimension | data-neutral (no financial-incentive rule) | data-priced (CA opt-in triggers) |
|-----------|--------------------------------------------|----------------------------------|
| what the reward is priced on | a **purchase** or a **referral** | a **data-sharing** choice |
| price/service variation | same for all; reward is a bonus | a better deal **because** of data |
| CA § 1798.125(b) | not triggered | **opt-in required**, revocable |
| TX / IN / FL | safe harbor either way (if bona fide) | safe harbor (if bona fide, voluntary) |
| NY | no rule | no rule |

the cleanest design keeps the reward **priced on the purchase/referral, not on the data** — that
keeps it data-neutral and out of the financial-incentive regime in every state, CA included. once the
better price is *consideration for data*, CA's opt-in attaches.

---

## severity

**nitpick → blocker** depending on structure. a **data-neutral** program (reward for purchase/referral)
raises no financial-incentive issue anywhere — nitpick-level disclosure hygiene only. a **data-priced**
program served to a California consumer **without** § 1798.125(b) opt-in is a **blocker** — the
posture inverts from the TX/IN/FL default, so a design lawful elsewhere fails in CA.

---

## the honest gap

- whether a specific loyalty mechanic is a "financial incentive" under CA law is a **fact-and-value**
  determination (is the price difference "reasonably related to the value … of the consumer's data"?);
  counsel must apply it to the exact mechanic.
- the **CA, TX, IN** citations rest on public-law mirrors / official portals as noted; the CA leginfo
  and TX capitol portals are javascript apps that return no text to an automated fetch — confirm
  against the official text.
- state privacy law is **fast-moving** — several states enacted comprehensive laws recently; the
  five-state sweep is the high-population baseline, and counsel should check for newly effective laws
  in other served states.

## key takeaways

| question | answer |
|----------|--------|
| strictest of the five? | **CA** — § 1798.125(b) prior opt-in, revocable, 12-mo cooldown |
| the posture inversion? | TX/IN/FL = **safe harbor**; CA = **opt-in gate**; NY = **no rule** |
| when does CA's rule trigger? | only when the reward is a **data price**, not a purchase/referral reward |
| the clean lever? | price the reward on the **purchase/referral**, not on **data** |
| new redline vs the other briefs? | yes — a *data* rule, absent from the referral / gift-card / UDAP set |

## .publishability

☀️ **fullsun** (share) — generic public-law boundary; five-state matrix of primary privacy law,
neutral both-sides voice, no client identity or client-specific mechanic. the data-neutral vs
data-priced sides are described symmetrically.

## .see also

- `define.boundary.redemption-path-not-rate-is-the-lever.[lesson].md` — a sibling "what is the lever" boundary
- `rule.prefer.clear-conspicuous-disclosures.[rule].md`
- `ref.udap-remedy-teeth.five-state.[ref].md`
- `rule.require.five-state-baseline.[rule].md` (repo-wide) — the served-market nexus that makes CA's rule attach

## .sources

1. [Cal. Civ. Code § 1798.125 — CCPA/CPRA non-discrimination + financial-incentive opt-in (california.public.law)](https://california.public.law/codes/civil_code_section_1798.125)
2. [Cal. Civ. Code § 1798.125 — subdivision structure cross-check (FindLaw)](https://codes.findlaw.com/ca/civil-code/civ-sect-1798-125/)
3. [Tex. Bus. & Com. Code § 541.101 — TDPSA loyalty safe harbor (public.law mirror)](https://texas.public.law/statutes/tex._bus._and_com._code_section_541.101)
4. [Ind. Code § 24-15-4-1 — ICDPA loyalty safe harbor (FindLaw)](https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-15-4-1/)
5. [Fla. Stat. § 501.71 et seq. — Florida Digital Bill of Rights, loyalty treatment (FL Senate)](https://www.flsenate.gov/Laws/Statutes/2024/501.71)
6. [N.Y. Gen. Bus. Law § 899-bb — SHIELD Act, data-security only (NYS Senate, official)](https://www.nysenate.gov/legislation/laws/GBS/899-BB)
7. [Cal. Civ. Code § 1798.130 — notice/consent mechanics cross-referenced by § 1798.125(b) (california.public.law)](https://california.public.law/codes/civil_code_section_1798.130)

## .date researched

2026-07-22
