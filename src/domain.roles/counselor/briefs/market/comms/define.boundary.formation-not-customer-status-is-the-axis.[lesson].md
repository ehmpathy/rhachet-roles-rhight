# define.boundary.formation-not-customer-status-is-the-axis

## .what

the line between a phone-contact claimant whom an arbitration clause reaches and one whom it does
not — and, separately, the line between a party who may **invoke** such a clause and one who may not.

both lines are drawn by **contract formation law**, not by the Telephone Consumer Protection Act. a
clause that is perfectly drafted, conspicuously posted, and enforceable on its face still does zero
work against a person who never formed the contract that carries it.

## .why

statutory damages under the TCPA run **per message** and are **uncapped** — `47 U.S.C. § 227(b)(3)`
sets `$500` for each violation, trebled at the court's discretion for a willful or knowing violation.
an exposure figure for a phone campaign is therefore not the value of one call; it is that figure
multiplied across recipients and messages, and the multiplier only operates if the claims can be
**aggregated**.

an arbitration clause with a class waiver is the standard mechanism that prevents aggregation. so
whether such a clause reaches a given claimant is often the **largest single variable** in an exposure
estimate — larger than any question about consent. and it is decided on grounds that have nothing to
do with telephone law.

> **not legal advice.** this brief states where courts have drawn a line. it does not tell any party
> that its own clause will or will not be enforced, and it is no substitute for review of a specific
> agreement and fact pattern by a licensed attorney.

## the redline

```
                a TCPA claim is filed
                          |
                          v
        +-----------------------------------+
        |  did THIS claimant form a         |
        |  contract carrying the clause?    |
        +-----------------------------------+
                 |                    |
                no                   yes
                 |                    |
                 v                    v
   the clause does no work    +----------------------------+
   -- the claim proceeds      | may the party who invokes  |
   in court, aggregable       | it enforce that contract?  |
                              +----------------------------+
     Knutson (9th Cir.)          |                    |
     Credit One (7th Cir.)      no                   yes
     Soliman (2d Cir.)           |                    |
                                 v                    v
                     Credit One (7th Cir.)   arbitration compelled;
                     -- nonsignatory theories  class treatment
                        unavailable            unavailable

                                              Dahdah (6th Cir. 2026)
                                              -- a nonsignatory DID
                                                 enforce another
                                                 entity's clause
```

## the engine — the FAA's savings clause

`9 U.S.C. § 2` makes an arbitration provision enforceable, and in the same sentence states the ground
on which it is not:

> "A written provision in any maritime transaction or a contract evidencing a transaction involving
> commerce to settle by arbitration a controversy thereafter arising out of such contract or
> transaction, or the refusal to perform the whole or any part thereof, or an agreement in writing to
> submit to arbitration an existing controversy arising out of such a contract, transaction, or
> refusal, shall be valid, irrevocable, and enforceable, **save upon such grounds as exist at law or
> in equity for the revocation of any contract** or as otherwise provided in chapter 4."

the clause's force is borrowed from the contract that carries it. where there is no contract, there is
no provision to enforce — the savings clause is not even reached.

`9 U.S.C. § 4` carries the procedural consequence: formation is decided by a **court**, and it may be
tried to a **jury**:

> "The court shall hear the parties, and upon being satisfied that the making of the agreement for
> arbitration or the failure to comply therewith is not in issue, the court shall make an order
> directing the parties to proceed to arbitration… **If the making of the arbitration agreement** or
> the failure, neglect, or refusal to perform the same **be in issue, the court shall proceed
> summarily to the trial thereof**… **If the jury find that no agreement in writing for arbitration
> was made** or that there is no default in proceeding thereunder, **the proceeding shall be
> dismissed**."

so a formation dispute is not sent to the arbitrator. it stays in court, and it is litigated.

## the rule — a class waiver is enforceable

`AT&T Mobility LLC v. Concepcion`, 563 U.S. 333 (2011), holds that the FAA preempts a state rule that
conditions an arbitration agreement's enforceability on the availability of classwide procedures:

> "class arbitration, to the extent it is manufactured by *Discover Bank* rather than consensual, is
> inconsistent with the FAA"

where the clause reaches the claimant, a class waiver in it can convert a putative class action into
individual proceedings — and the per-message multiplier does not survive that conversion.

## side A — the clause does not reach the claimant

three courts of appeals declined to bind a TCPA plaintiff, each on a distinct formation ground.

| decision | posture | the ground | verbatim |
|----------|---------|-----------|----------|
| `Knutson v. Sirius XM Radio Inc.`, 771 F.3d 559 (9th Cir. 2014) | trial subscription bundled with a vehicle bought from a third party | no mutual assent to a contract with the caller at all | *"A reasonable person in Knutson's position could not be expected to understand that purchasing a vehicle from Toyota would simultaneously bind him or her to any contract with Sirius XM, let alone one that contained an arbitration provision without any notice of such terms."* |
| `A.D. v. Credit One Bank, N.A.`, 885 F.3d 1054 (7th Cir. 2018) | a minor, reached on a phone associated with another person's account | nonsignatory theories unavailable; direct-benefits estoppel rejected | *"A.D. is not bound by the terms of the cardholder agreement to arbitrate with Credit One, and she has not directly benefited from the cardholder agreement such that equitable principles convince us to apply the arbitration clause against her."* |
| `Soliman v. Subway Franchisee Advert. Fund Tr., Ltd.`, 999 F.3d 828 (2d Cir. 2021) | consumer enrolled in an SMS program via a short code from an in-store poster | terms not reasonably conspicuous, so no inquiry notice | *"Subway has failed to demonstrate that such terms and conditions would be clear and conspicuous to a reasonable person in Soliman's position"* |

`Credit One` catalogues the theories under which a nonsignatory may be bound — incorporation by
reference, assumption, agency, veil-piercing or alter ego, and estoppel — and finds each unavailable
on its facts. it is the useful map of where the argument runs at all.

`Soliman` enumerates five specific features that together defeated notice: no evidence of the
advertisement's size or print size; a "terms and conditions" reference set in significantly smaller
font and surrounded by unrelated information; no statement that a text to the short code would
constitute agreement; a requirement that the consumer type a URL manually; and a destination page
headed as terms of use **for the website**, which a reasonable person who sought the promotion's
conditions could read as unrelated to the promotion.

## side B — the clause does reach, and a nonsignatory may invoke it

`Dahdah v. Rocket Mortgage, LLC`, No. 24-1910 (6th Cir. Jan. 26, 2026), reverses a denial and orders
arbitration on the mirror-image facts. the consumer submitted his information to an online referral
service, was referred to a lender, and sued the **lender** over the calls that followed. the lender,
which was not a party to the referral service's terms, invoked the referral service's arbitration
provision:

> "Rocket responded by invoking LowerMyBills' arbitration provision. But the district court held that
> Dahdah's 'click' did not create an enforceable agreement. **We disagree.** Under the significant
> body of circuit precedent interpreting California law, LowerMyBills gave Dahdah sufficiently
> conspicuous notice that he would accept the proposed terms by clicking the button. So his decision
> to take this action qualified as a valid 'acceptance' of LowerMyBills' 'offer' to contract. The
> district court thus should have granted Rocket's motion to compel arbitration. **We reverse.**"

the court states the source of the formation rule expressly, and it is not federal:

> "This text instructs courts to follow the same contract-law rules when analyzing an arbitration
> agreement that they would follow when analyzing any other agreement… **So state law likewise governs
> whether the parties formed a binding contract to arbitrate.**"

## the axis that divides the two sides

`Soliman` and `Dahdah` sit on opposite sides of the same question — a consumer engaged with a
marketing funnel, with terms somewhere in the vicinity — and the outcomes diverge on **objective
notice at the moment of the act said to be acceptance**, judged from the consumer's outward
manifestations rather than either party's intent.

| the notice was… | the outcome |
|-----------------|-------------|
| a labeled button, with the terms disclosed adjacent to it, such that the act of the click is tied to the terms | assent formed (`Dahdah`) |
| a reference set apart from the act, in smaller type, on a separate medium, and reachable only by an independent step | assent not formed (`Soliman`) |

the claimant's status is **not** the axis. a person who was never a customer may still be bound where
notice and assent were validly formed in some other transaction (`Dahdah`), and a person who did
transact may remain unbound where notice failed (`Soliman`). symmetrically, a party who never signed
may enforce a clause (`Dahdah`) or may fail to (`Credit One`) — the theory of enforcement is a separate
question from the fact of formation, and both must be satisfied.

## the population question

the two questions above — did **this** claimant form the contract, and may **this** party enforce it —
determine which slice of a putative class an arbitration clause removes. a clause carried in one
entity's terms operates against the persons who assented to **those** terms. persons reached by a
campaign who never encountered those terms are outside its operation, whatever the clause says.

for a claimant population assembled from sources other than the caller's own contracting flow, the
formation question therefore has to be answered **per source**, and the answer for one source does not
carry to another.

## the honest gap

- ⛔ **no decision read here holds a class waiver invalid against a claimant who did form the
  contract.** `Knutson`, `Credit One`, and `Soliman` all turn on the absence of an agreement, not on
  the waiver's content. **unconscionability, and challenges directed at a waiver's terms rather than
  at formation, were not researched** and are not addressed by anything above.
- ⛔ **the state-formation layer is not swept.** `Dahdah` states plainly that state law governs
  formation. the decisions cited applied California law (`Dahdah`, `Soliman`) and Nevada law
  (`Credit One`). **no claim is made here about the formation law of any particular state**, and a
  five-state sweep of formation and nonsignatory-enforcement doctrine is owed before any
  state-specific statement is made.
- ⛔ **no post-`Concepcion` survey was run.** `Concepcion` is cited for the proposition it states.
  developments after 2011 that bear on class waivers were not surveyed.
- 🔶 **`Breda v. Cellco Partnership`, 934 F.3d 1 (1st Cir. 2019)** is cited below because it is
  adjacent and easy to miscite. it **affirmed** a denial of arbitration, but its substance is on a
  different axis entirely — whether a number on a hybrid wifi-and-cellular service is *"assigned to a
  … cellular telephone service"* under `§ 227(b)(1)(A)(iii)`. it is a **number-type** decision, not an
  arbitration decision, and it is listed to prevent that confusion rather than to support any
  proposition above.
- 🔶 the six decisions here come from five circuits. **no circuit split analysis was performed**, and
  the outcomes are not presented as a uniform national rule.

## key takeaways

1. an arbitration clause draws its force from the contract that carries it — `9 U.S.C. § 2` makes the
   provision enforceable "save upon such grounds as exist at law or in equity for the revocation of
   any contract", and a contract never formed has no provision to save.
2. formation is decided by a court, not an arbitrator, and may be tried to a jury (`9 U.S.C. § 4`).
3. a class waiver is enforceable where the clause reaches the claimant (`Concepcion`).
4. three courts of appeals declined to bind TCPA plaintiffs — on absence of assent (`Knutson`),
   unavailability of nonsignatory theories (`Credit One`), and failure of conspicuous notice
   (`Soliman`).
5. a nonsignatory **can** enforce another entity's clause where formation was valid (`Dahdah`,
   6th Cir. 2026) — so the two questions, *formation* and *who may enforce*, are genuinely distinct
   and each can decide the case.
6. the dividing axis in the marketing-funnel cases is **objective notice at the moment of the act said
   to be acceptance**, not the claimant's status as a customer.

## .publishability

☀️ **fullsun** (share) — generic public law. six published appellate decisions and two sections of the
Federal Arbitration Act, all quoted from official or public sources. no client identity, no
client-specific mechanic, no campaign, no applied design, **neutral both-sides voice**.

triaged per `rule.require.publishability-triage`; authored in neutral legal voice per
`rule.require.fullsun-facts-not-tactics`.

## .see also

- `define.what-the-2025-vacatur-did-and-did-not-do.[lesson].md` — the consent-side companion
- `../../../../insurer/briefs/hazard.either-question-can-defeat-gl-coverage-of-a-tcpa-claim.[hazard].md` — the coverage question, which is likewise two questions rather than one

## .sources

1. [9 U.S.C. § 2 — validity, irrevocability, and enforcement of agreements to arbitrate (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title9-section2&num=0&edition=prelim)
2. [9 U.S.C. § 4 — petition for an order to compel; hearing and determination (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title9-section4&num=0&edition=prelim)
3. [47 U.S.C. § 227 — TCPA, incl. § 227(b)(3) statutory damages (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
4. [AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011)](https://www.courtlistener.com/opinion/2959735/att-mobility-llc-v-concepcion/)
5. [Knutson v. Sirius XM Radio Inc., 771 F.3d 559 (9th Cir. 2014)](https://www.courtlistener.com/opinion/2750191/erik-knutson-v-sirius-xm-radio-inc/)
6. [A.D. v. Credit One Bank, N.A., 885 F.3d 1054 (7th Cir. 2018)](https://www.courtlistener.com/opinion/4479918/ad-v-credit-one-bank-na/)
7. [Soliman v. Subway Franchisee Advert. Fund Tr., Ltd., 999 F.3d 828 (2d Cir. 2021)](https://www.courtlistener.com/opinion/4889886/soliman-v-subway-franchisee-advert-fund-tr-ltd/)
8. [Dahdah v. Rocket Mortgage, LLC, No. 24-1910 (6th Cir. Jan. 26, 2026)](https://www.courtlistener.com/opinion/10779557/michael-dahdah-v-rocket-mortgage-llc/)
9. [Breda v. Cellco Partnership, 934 F.3d 1 (1st Cir. 2019)](https://www.courtlistener.com/opinion/4648199/breda-v-cellco-partnership/) — cited only to mark it as a number-type decision, not an arbitration decision

every source above was captured through `bhrowser` off the live page, per
`rule.require.bhrowser-citations`. the playbooks are retained at
`refs/`:
`find.tcpa-arbitration.play.ts`, `read.arbitration-opinions.play.ts`,
`find.tcpa-arbitration-compelled.play.ts`, `read.arbitration-opinions-2.play.ts`,
`read.faa-section-2.play.ts`.

## .date researched

2026-07-30
