# floor.howto.form-a-class-waiver-that-holds

## .what

⭐ **a `floor.howto.*` brief — the discovered floor for one layer.** it states the best minimum we
have found for that layer, with every element traced to a named authority, and it names where it
still fails. the `floor.` prefix marks the promise: **a floor, never a peak.**

this one: how to put an arbitration clause with a class waiver into a signup flow such that it
actually reaches the people a TCPA campaign will later contact — and why the signup form itself,
rather than the clause's words, is what decides it.

> **recommendation disclaimer.** this is offered to the best of our knowledge, based on the
> information found in research — it carries **no guarantee of success or outcome**, and it must be
> reviewed by a licensed professional (attorney) against your own real scenario and current law
> before any reliance. it is groundwork for that review, not a substitute for it.

> **not legal advice.** informational groundwork for counsel to validate.

> ⚠️ **this is a floor, not a peak.** it is the best minimum we have found so far, and every
> element traces to a cited authority. it is **not** a guarantee, **not** a certification, and
> **not** complete — the gaps below are named because we found them, not because they are the only
> ones that exist. it is dated, and the law it rests on moves. **treat a counter-example as the most
> valuable reply this document can receive.**

> ⚠️ **a note on gerunds.** this file trips `rule.forbid.gerunds` on terms that cannot be altered:
> verbatim statutory text (`"evidencing a transaction involving commerce"`, `"an agreement in
> writing"`, `"the making of the arbitration agreement"`, `"willful or knowing"`), verbatim case
> text (`"by clicking the button"`, `"invoking LowerMyBills' arbitration provision"`, `"when
> analyzing an arbitration agreement"`, `"purchasing a vehicle from Toyota"`), and terms of art
> (`telemarketing`, `advertising`, `veil-piercing`). to reword a quote is citation fraud.

---

## ⭐ .why — the exposure is a product, and this is the only lever on its second term

`47 U.S.C. § 227(b)(3)` sets the private remedy at *"$500 in damages for each such violation"*,
trebled at the court's discretion where the violation was willful or knowing, and it names **no cap**.

so the exposure is not a sum. it is a **product of two independent terms**:

```
exposure  =  per-message rate  ×  claimants bundled into one action
```

and each term has a different defense:

| the term | what reduces it | the layer |
|----------|-----------------|-----------|
| **per-message rate** — are you liable at all? | a consent record; a suppression program | the consent + do-not-call layers |
| ⭐ **× claimants** — may they be bundled? | **an arbitration clause with a class waiver** | this brief |

⚠️ **almost all compliance effort goes to the left column, and the left column caps out at "zero
liability if you are perfect."** perfection at volume is exactly what fails. the right column does
not demand perfection — it changes the **mechanism** that concentrates many small claims into one
large one.

`AT&T Mobility LLC v. Concepcion`, 563 U.S. 333 (2011), is what makes the second term addressable:

> "class arbitration, to the extent it is manufactured by *Discover Bank* rather than consensual, is
> inconsistent with the FAA"

⭐ **where the clause reaches a claimant, a class waiver converts a putative class action into
individual proceedings — and the per-message multiplier does not survive that conversion.**

## ⭐ .when — the cost of delay is structural, not incidental

a clause governs the messages sent **after** a person assented to it. it cannot be applied backwards
to a population that signed up before it existed.

so a delay does not postpone a fixed cost — it **permanently grows the population outside the
clause**, and no later work reaches them. of the defenses available, this is the only one whose price
is a function of the calendar.

⚠️ **this states the shape of the cost, not a place in a queue.** where this sits against your other
work is a business judgment the sources do not settle.

---

## ⭐ the mechanism — the clause borrows all its force from the contract that carries it

`9 U.S.C. § 2` makes an arbitration provision enforceable and, in the same sentence, names the ground
on which it is not:

> "A written provision in any maritime transaction or a contract evidencing a transaction involving
> commerce to settle by arbitration a controversy thereafter arising out of such contract or
> transaction … shall be valid, irrevocable, and enforceable, **save upon such grounds as exist at law
> or in equity for the revocation of any contract** or as otherwise provided in chapter 4."

⛔ **read what that implies: where there is no contract, there is no provision to enforce.** the
savings clause is never even reached. a perfectly drafted waiver inside a contract that was never
formed is worth zero.

**and the formation question is litigated in court, never sent to the arbitrator.** `9 U.S.C. § 4`:

> "**If the making of the arbitration agreement** or the failure, neglect, or refusal to perform the
> same **be in issue, the court shall proceed summarily to the trial thereof**… **If the jury find
> that no agreement in writing for arbitration was made** … **the proceeding shall be dismissed**."

⭐ **so formation is a fact question a plaintiff may put to a jury.** that is why the signup screen —
not the clause's language — is the artifact that decides this.

⚠️ **and the rule that governs formation is state law, not federal.** `Dahdah v. Rocket Mortgage,
LLC`, No. 24-1910 (6th Cir. Jan. 26, 2026), says so expressly:

> "This text instructs courts to follow the same contract-law rules when analyzing an arbitration
> agreement that they would follow when analyzing any other agreement… **So state law likewise
> governs whether the parties formed a binding contract to arbitrate.**"

---

## the axis — objective notice at the moment of the act said to be acceptance

two appellate decisions sit on opposite sides of one fact pattern — a consumer engaged with a
marketing funnel, terms somewhere in the vicinity — and they diverge on notice, judged from the
consumer's outward manifestations rather than either party's intent.

| the notice was… | the outcome |
|-----------------|-------------|
| a labeled button, with the terms disclosed **adjacent to it**, so the act is tied to the terms | ✅ assent formed (`Dahdah`) |
| a reference **set apart from the act**, in smaller type, on a separate medium, reachable only by an independent step | ⛔ assent not formed (`Soliman`) |

⭐ **the claimant's status is not the axis.** a person who was never a customer may be bound where
notice and assent were validly formed (`Dahdah`); a person who did transact may remain unbound where
notice failed (`Soliman`).

### ⭐ the five features that defeated notice in `Soliman`

`Soliman v. Subway Franchisee Advert. Fund Tr., Ltd.`, 999 F.3d 828 (2d Cir. 2021) — an SMS
enrollment via a short code on an in-store poster. the holding:

> "Subway has failed to demonstrate that such terms and conditions would be clear and conspicuous to
> a reasonable person in Soliman's position"

the five features the court enumerated, read as a **negative checklist** for a signup flow:

| # | the defect | the inverse a flow should satisfy |
|---|------------|-----------------------------------|
| 1 | no evidence of the advertisement's size or print size | the disclosure's rendered size is knowable and recorded |
| 2 | the "terms and conditions" reference set in **significantly smaller font**, surrounded by unrelated information | the reference is legible and not crowded by unrelated content |
| 3 | ⭐ **no statement that the act would constitute agreement** | the screen says, at the act, that the act **is** acceptance |
| 4 | the consumer had to **type a URL manually** to reach the terms | the terms are reachable from the act itself, in one step |
| 5 | ⭐ the destination page was headed as terms of use **for the website** — readable as unrelated to the promotion | the terms a reader reaches are plainly the terms of **this** transaction |

⚠️ **features 3 and 5 are the two most likely to sit in a flow that otherwise looks careful.** a link
labeled only "terms" satisfies neither: it does not state that the click is acceptance, and it may
land on a page a reasonable reader takes to govern some other subject.

### the mirror case, and what it proves

in `Dahdah` the consumer submitted information to an online referral service, was referred to a
lender, and sued **the lender** over the calls that followed. the lender — **not a party to the
referral service's terms** — invoked that service's arbitration provision, and won:

> "Rocket responded by invoking LowerMyBills' arbitration provision. But the district court held that
> Dahdah's 'click' did not create an enforceable agreement. **We disagree.** … LowerMyBills gave
> Dahdah sufficiently conspicuous notice that he would accept the proposed terms by clicking the
> button. So his decision to take this action qualified as a valid 'acceptance' … **We reverse.**"

⭐ **so a well-formed clause can reach further than the entity that wrote it** — and a badly-formed
one does not even reach that entity's own signups.

---

## ⛔ the population bound — a clause operates only where its terms were encountered

a clause carried in one entity's terms operates against the persons who assented to **those** terms.
persons reached by a campaign who never encountered them sit outside its operation, whatever the
clause says.

⚠️ **so for a claimant population assembled from more than one source, the formation question must be
answered per source, and the answer for one does not carry to another.**

two decisions mark the failure modes:

| decision | posture | the ground |
|----------|---------|-----------|
| `Knutson v. Sirius XM Radio Inc.`, 771 F.3d 559 (9th Cir. 2014) | a trial subscription bundled with a vehicle bought from a third party | *"A reasonable person in Knutson's position could not be expected to understand that purchasing a vehicle from Toyota would simultaneously bind him or her to any contract with Sirius XM, let alone one that contained an arbitration provision without any notice of such terms."* |
| `A.D. v. Credit One Bank, N.A.`, 885 F.3d 1054 (7th Cir. 2018) | a minor, reached on a phone associated with another person's account | *"A.D. is not bound by the terms of the cardholder agreement to arbitrate with Credit One, and she has not directly benefited from the cardholder agreement such that equitable principles convince us to apply the arbitration clause against her."* |

⭐ **`Knutson` is the purchased-list problem, stated by a court.** a number obtained from a source
other than your own contract flow is a number whose holder formed no contract with you — so the
clause does not reach them **by construction**, and this defense does not apply to that slice of a
campaign at all.

`Credit One` catalogues the theories under which a nonsignatory may be bound — incorporation by
reference, assumption, agency, veil-piercing or alter ego, and estoppel — and finds each unavailable
on its facts. it is the map of where that argument runs at all.

---

## key takeaways

| question | answer |
|----------|--------|
| ⭐ what does this defense act on? | the **claimant count**, never the per-message rate — the two terms of the product have different defenses |
| why does that matter more than it sounds? | `§ 227(b)(3)` names **no cap**, so the count is what makes the number large |
| what makes a class waiver available at all? | `Concepcion` — class arbitration *"manufactured … rather than consensual"* is inconsistent with the FAA |
| what decides whether it reaches a claimant? | ⭐ **formation**, judged on objective notice at the act said to be acceptance — never the claimant's customer status |
| who decides formation? | ⛔ **a court, and possibly a jury** — `§ 4`; it is not sent to the arbitrator |
| whose law governs formation? | ⚠️ **state** contract law, per `Dahdah` — so the answer can vary by state |
| what is the single most common defect? | ⭐ a terms link that never says **the act is acceptance** (`Soliman` factor 3) |
| may a nonsignatory enforce it? | sometimes — `Dahdah` yes, `Credit One` no; a separate question from formation, and **both** must be satisfied |
| does it reach a purchased list? | ⛔ **no** — `Knutson`; those people formed no contract with you |
| can it be applied to past signups? | **no** — it governs messages after assent, so the population outside it only grows |

## the honest gap

- ⛔ **no decision read here holds a class waiver invalid against a claimant who DID form the
  contract.** `Knutson`, `Credit One`, and `Soliman` all turn on the **absence** of an agreement. so
  this brief establishes how formation fails — it does **not** establish that a validly-formed waiver
  survives every challenge. unconscionability was not researched.
- ⬜ **state-by-state formation law is unresearched.** `Dahdah` says state law governs and applies
  California's; whether the same flow forms a contract in every state is unknown, and for a business
  that serves all fifty this is the largest open question on this layer.
- ⬜ **no draft language is given here, and none should be inferred.** the authorities settle what a
  flow must **achieve**; the words that achieve it are a matter for counsel.
- ⚠️ **`Dahdah` is recent (Jan. 2026) and is one circuit.** it is the clearest statement of the
  favorable side found, and it is not nationwide law.
- ⬜ **this defense does not reach government enforcement.** a state attorney general's action is not
  a class action, so no waiver affects it; that exposure is a separate subject.

## .publishability

☀️ **fullsun** (share) — generic public law; the Federal Arbitration Act and published arbitration
decisions, every element traced to a cited source — no client identity, no client-specific mechanic,
no design choice settled. triaged per `rule.require.publishability-triage`; authored in neutral legal
voice per `rule.require.fullsun-facts-not-tactics`.

## .see also

- `define.boundary.formation-not-customer-status-is-the-axis.[lesson].md` — ☀️ the boundary this brief acts on; read it for the full case treatment
- `ref.tcpa-exposure-tracks.[ref].md` — what the multiplier is worth, and the tracks a waiver does **not** reach
- `tactic.the-discovered-floor-against-a-tcpa-claim.[lesson].md` — ☀️ where this layer sits among the others
- `hazard.unprovable-consent-record.[hazard].md` — the other term of the product: the per-message rate
- `floor.howto.stand-up-a-dnc-suppression-program.[lesson].md` — the layer a consent record does not answer

⚠️ **this list is the published set, not a directory.** `comms/` holds further material that carries
other tags, deliberately not named here.

## .sources

1. [47 U.S.C. § 227 — `(b)(3)`'s $500-per-violation private right, uncapped (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
2. [9 U.S.C. § 2 — the FAA's savings clause; the provision is enforceable only within a contract](https://www.law.cornell.edu/uscode/text/9/2)
3. [9 U.S.C. § 4 — formation is tried by the court, and may be tried to a jury](https://www.law.cornell.edu/uscode/text/9/4)
4. [AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011) — a class waiver is enforceable](https://www.courtlistener.com/opinion/218615/att-mobility-llc-v-concepcion/)
5. [Soliman v. Subway Franchisee Advert. Fund Tr., Ltd., 999 F.3d 828 (2d Cir. 2021) — the five features that defeated notice](https://www.courtlistener.com/opinion/4895826/mahmoud-soliman-v-subway-franchisee-advertising/)
6. [Dahdah v. Rocket Mortgage, LLC, No. 24-1910 (6th Cir. Jan. 26, 2026) — a labeled button formed assent, and a nonsignatory enforced it](https://www.courtlistener.com/opinion/10777888/dahdah-v-rocket-mortgage-llc/)
7. [Knutson v. Sirius XM Radio Inc., 771 F.3d 559 (9th Cir. 2014) — no assent to a contract with the caller at all](https://www.courtlistener.com/opinion/2761969/knutson-v-sirius-xm-radio-inc/)
8. [A.D. v. Credit One Bank, N.A., 885 F.3d 1054 (7th Cir. 2018) — the nonsignatory theories, each unavailable](https://www.courtlistener.com/opinion/4218486/ad-v-credit-one-bank-na/)

⚠️ **provenance is inherited, not new.** every quotation above was captured through `bhrowser` or read
as a full document by `define.boundary.formation-not-customer-status-is-the-axis`, and is re-used here
rather than re-pulled this session.

## .date researched

2026-08-03
