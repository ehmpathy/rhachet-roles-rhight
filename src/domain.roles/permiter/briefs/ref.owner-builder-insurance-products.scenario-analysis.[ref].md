# ref.owner-builder-insurance-products.scenario-analysis

## .what

six concrete scenarios that illustrate builder's risk coverage outcomes based on who does the work, damage type, and loss severity.

## .why

- abstract coverage rules become clear through examples
- fire vs water claims have different risk profiles
- owner vs hired builder matters less than expected
- severity (partial vs total) affects limits, not coverage

---

## the scenarios

| # | who | damage type | severity | outcome |
|---|-----|-------------|----------|---------|
| 1 | owner-builder | electrical fire | $50k partial | COVERED |
| 2 | owner-builder | electrical fire | total loss | COVERED |
| 3 | owner-builder | bathtub flood | $50k partial | LIKELY COVERED |
| 4 | hired builder | electrical fire | $50k partial | COVERED |
| 5 | hired builder | electrical fire | total loss | COVERED |
| 6 | hired builder | bathtub flood | $50k partial | LIKELY COVERED |

---

## scenario 1: owner-builder electrical fire ($50k partial)

### facts

- homeowner does own electrical panel upgrade under owner-builder permit
- faulty wire connection causes electrical fire
- $50k damage to structure
- $3k of damage is to the electrical work itself

### coverage analysis

| element | covered? | reason |
|---------|----------|--------|
| $47k fire damage | YES | fire is covered peril |
| $3k electrical repair | NO | faulty workmanship exclusion |
| **net payout** | ~$47k | ensuing loss exception applies |

### why covered

> "If there's faulty electrical equipment at a construction site that causes a fire—this would exclude the cost of replace and install that faulty component, but the rest of the loss is covered."
> — [MEREDA](https://mereda.org/2021/09/14/the-faulty-workmanship-exclusion-in-builders-risk-insurance-measure-thrice-cut-once/)

the faulty workmanship exclusion bars payment for the defective work itself. but the ensuing loss exception covers damage from covered perils (fire) even when caused by excluded events (faulty work).

### key factors

| factor | impact |
|--------|--------|
| owner did work | irrelevant — policy covers property |
| work was defective | excludes repair cost only |
| fire resulted | covered peril activates |
| permit was pulled | avoids policy rescission risk |

---

## scenario 2: owner-builder electrical fire (total loss)

### facts

- same as scenario 1
- fire spreads and destroys entire structure
- $400k replacement cost
- policy limit: $400k

### coverage analysis

| element | covered? | reason |
|---------|----------|--------|
| $400k structure | YES | up to policy limits |
| $3k electrical work | NO | faulty workmanship |
| soft costs (re-permits, delays) | MAYBE | depends on policy |
| **net payout** | ~$397k | full limits minus defect |

### why covered

total loss from fire is the clearest case for builder's risk. fire is explicitly named as a covered peril in virtually all policies.

> "Almost all builders risk policies contain exclusions for faulty design, materials and workmanship. However, most also include an ensuing loss exception, which basically says if the loss is caused by an otherwise insured peril, the result loss will be covered."
> — [IA Magazine](https://www.iamagazine.com/markets/builders-risk-5-common-coverage-exclusions-and-clauses)

### key factors

| factor | impact |
|--------|--------|
| total vs partial | affects amount, not coverage |
| policy limits | caps payout at declared value |
| soft costs rider | may add 10-20% for delays |
| debris removal | often separate sublimit |

### risk: underinsurance

| declared value | actual value | consequence |
|----------------|--------------|-------------|
| $400k | $400k | full payout |
| $300k | $400k | coinsurance penalty |
| $200k | $400k | severe penalty |

> "Underinsure a project could lead to a coinsurance penalty, and claims may be denied with damages capped at policy limits."
> — [US Assure](https://usassure.com/resources/articles/7-tips-to-avoid-common-residential-builders-risk-claim-problems)

---

## scenario 3: owner-builder bathtub flood ($50k partial)

### facts

- homeowner installs bathtub under owner-builder permit
- improper drain connection causes water leak
- $50k water damage to structure over several weeks
- $2k of damage is to the plumb work itself

### coverage analysis

| element | covered? | reason |
|---------|----------|--------|
| $48k water damage | LIKELY | depends on policy language |
| $2k plumb repair | NO | faulty workmanship |
| **net payout** | $0-48k | outcome varies |

### why riskier than fire

water claims face more scrutiny than fire:

| factor | fire | water |
|--------|------|-------|
| cause clarity | obvious | may be disputed |
| gradual vs sudden | sudden | often gradual |
| discovery timing | immediate | may be delayed |
| policy language | broad | often restricted |

> "Builder's risk policies often exclude losses from water intrusion... the insurer may deny the claim if the water damage is due to improper plumb installation."
> — [Hartford](https://www.thehartford.com/insights/construction/builders-risk-insurance-coverages-exclusions)

### coverage depends on

> "Standard homeowners policies cover 'a sudden and accidental discharge, eruption, overflow or release of water' but exclude 'a constant or repeating, gradual, or slow release of water, or the infiltration or presence of water over a period of time.'"
> — [United Policyholders](https://uphelp.org/claim-guidance-publications/temporal-requirements-for-water-damage-exclusions-in-homeowner-policies/)

> "Water damage that occurs gradually over time, such as slow leaks that go unnoticed or unaddressed, may not be covered."
> — [Connected Sensors](https://connectedsensors.com/blog/how-does-builders-risk-insurance-navigate-the-nuances-of-water-damage/)

| question | if YES | if NO |
|----------|--------|-------|
| sudden event (burst)? | favors coverage | disfavors |
| discovered promptly? | favors coverage | disfavors |
| reported immediately? | favors coverage | disfavors |
| policy includes water? | covered | denied |

### the "ensuing loss" argument

same logic as fire:
- faulty plumb = excluded
- water damage from burst = covered peril
- therefore: damage should be covered

but insurers contest water claims more often. expect:
- adjuster inspection
- cause-and-origin report
- possible denial with appeal opportunity

---

## scenario 4: hired builder electrical fire ($50k partial)

### facts

- homeowner hires licensed electrician for panel upgrade
- electrician's faulty work causes fire
- $50k damage to structure
- $3k to the electrical work itself

### coverage analysis

| element | covered? | reason |
|---------|----------|--------|
| $47k fire damage | YES | fire is covered peril |
| $3k electrical repair | NO | faulty workmanship |
| **net payout** | ~$47k | same as owner-builder |

### why outcome matches scenario 1

builder's risk covers the **property**, not the **actor**. the policy doesn't care who did the work:

> "As a type of commercial property insurance, builder's risk insurance covers the first-party property involved in a construction project: materials, fixtures, equipment, and the structure itself."
> — [The Hartford](https://www.thehartford.com/general-liability-insurance/builders-risk-vs-general-liability)

| factor | owner-builder | hired builder |
|--------|---------------|---------------|
| policy covers | property | property |
| faulty work excluded | yes | yes |
| fire covered | yes | yes |
| net outcome | ~$47k | ~$47k |

### additional recourse with hired builder

| recovery avenue | applies to |
|-----------------|------------|
| builder's risk claim | your property damage |
| contractor's GL claim | their liability |
| subrogation | insurer recovers from contractor |

> "If certain defective work (excluded) caused a collapse or a fire (covered event), then coverage would be afforded."
> — [Smith Currie](https://www.smithcurrie.com/publications/common-sense-contract-law/the-interplay-of-builders-risk-and-commercial-general-liability-coverage/)

---

## scenario 5: hired builder electrical fire (total loss)

### facts

- same as scenario 4
- fire destroys entire structure
- $400k replacement cost
- builder's risk limit: $400k
- contractor has $1M GL policy

### coverage analysis

| element | covered? | source |
|---------|----------|--------|
| $400k structure | YES | your builder's risk |
| soft costs | MAYBE | builder's risk rider |
| contractor negligence | YES | contractor's GL |
| **net position** | made whole | multiple sources |

### layered recovery

> "Subrogation is a particularly important issue in Builders Risk insurance because the parties to a construction contract clearly intend for the Builders Risk insurance to be their sole remedy for covered losses."
> — [IRMI](https://www.irmi.com/articles/expert-commentary/builders-risk-naming-of-insureds-reloaded)

| step | action | amount |
|------|--------|--------|
| 1 | claim on builder's risk | ~$397k |
| 2 | builder's risk subrogates | recovers from contractor |
| 3 | gap claim on contractor GL | any difference |

### why you're better off with builder's risk

> "First-party claims generally offer a quicker resolution process, given the direct relationship between the claimant and their insurer."
> — [Insurance Claims Authority](https://insuranceclaimsauthority.com/first-party-vs-third-party-claims.html)

> "Third party claims often involve more negotiation and pushback, and if liability is unclear, the insurer may delay or reject the claim altogether."
> — [Callender Bowlin](https://www.cbtrial.com/first-party-vs-third-party-insurance-claims/)

| if you HAVE builder's risk | if you DON'T |
|----------------------------|--------------|
| claim on your policy | claim on contractor's GL |
| paid in weeks | paid in months |
| your insurer fights subrogation | you fight contractor |
| you're made whole fast | you wait for liability resolution |

---

## scenario 6: hired builder bathtub flood ($50k partial)

### facts

- homeowner hires licensed plumber for bathtub install
- plumber's faulty work causes water leak
- $50k water damage discovered after 3 weeks
- $2k to the plumb work itself

### coverage analysis

| element | covered? | reason |
|---------|----------|--------|
| $48k water damage | LIKELY | depends on policy, timing |
| $2k plumb repair | NO | faulty workmanship |
| **net payout** | $0-48k | same risk as scenario 3 |

### same water risks apply

| risk factor | scenario 3 | scenario 6 |
|-------------|------------|------------|
| gradual damage | yes | yes |
| discovery delay | yes | yes |
| policy exclusions | applies | applies |
| adjuster scrutiny | high | high |

### hired builder doesn't change water risk

the additional recourse (contractor's GL) helps, but:

| if contractor's GL covers | if it doesn't |
|---------------------------|---------------|
| water damage claim viable | same as owner-builder |
| subrogation possible | you absorb loss |
| may take months | immediate financial hit |

---

## summary: what matters, what doesn't

### doesn't matter

| factor | why irrelevant |
|--------|----------------|
| owner vs hired | policy covers property |
| skill level | faulty work excluded regardless |
| license status | policy covers property interest |

### matters a lot

| factor | why critical |
|--------|--------------|
| fire vs water | fire cleaner, water contested |
| sudden vs gradual | sudden favors coverage |
| prompt report | late notice = denial risk |
| policy limits | caps total recovery |
| permit status | avoids rescission risk |

> "An insured's one-year delay in report property damage was unreasonable as a matter of law."
> — [Cozen O'Connor](https://www.propertyinsurancelawobserver.com/2026/03/23/court-finds-late-notice-an-absolute-bar-to-coverage-in-property-claim/)

---

## practical takeaways

### for owner-builders

| action | why |
|--------|-----|
| buy builder's risk | 1-5% of project protects property |
| pull permits | avoids policy rescission |
| document work | supports claims |
| report damage fast | avoids late-notice denial |

### for hired work

| action | why |
|--------|-----|
| still buy builder's risk | faster payment, you control claim |
| verify contractor insurance | backup recovery avenue |
| get named as additional insured | direct claim rights |
| document everything | supports any claim |

### for water work specifically

| action | why |
|--------|-----|
| test before close-up | catch leaks early |
| photograph test results | prove no pre-closure damage |
| inspect regularly | catch gradual damage fast |
| report immediately | avoid "delayed discovery" defense |

---

## sources

### faulty workmanship and ensuing loss
- [MEREDA: Faulty Workmanship Exclusion](https://mereda.org/2021/09/14/the-faulty-workmanship-exclusion-in-builders-risk-insurance-measure-thrice-cut-once/)
- [IA Magazine: 5 Common Coverage Exclusions](https://www.iamagazine.com/markets/builders-risk-5-common-coverage-exclusions-and-clauses)
- [Smith Currie: Interplay of Builders Risk and CGL](https://www.smithcurrie.com/publications/common-sense-contract-law/the-interplay-of-builders-risk-and-commercial-general-liability-coverage/)

### water damage exclusions
- [Hartford: Builder's Risk Coverages and Exclusions](https://www.thehartford.com/insights/construction/builders-risk-insurance-coverages-exclusions)
- [Citizens General: 7 Things Not Covered](https://citizensgeneral.com/7-things-not-covered-by-your-builders-risk-insurance/)
- [United Policyholders: Temporal Requirements for Water Damage Exclusions](https://uphelp.org/claim-guidance-publications/temporal-requirements-for-water-damage-exclusions-in-homeowner-policies/)
- [Connected Sensors: Builder's Risk and Water Damage](https://connectedsensors.com/blog/how-does-builders-risk-insurance-navigate-the-nuances-of-water-damage/)

### underinsurance and policy limits
- [US Assure: 7 Tips to Avoid Claim Problems](https://usassure.com/resources/articles/7-tips-to-avoid-common-residential-builders-risk-claim-problems)
- [US Assure: Lessons Learned from Claim Setbacks](https://usassure.com/resources/articles/builders-risk-insurance-lessons-learned-from-claim-setbacks)

### contractor liability interplay
- [Distinguished: Contractor and Property Owner Named Insureds](https://distinguished.com/blog/contractor-and-property-owner-named-insureds-on-builders-risk-policy/)
- [Amwins: Contractor's GL Limitation Endorsements](https://www.amwins.com/resources-insights/article/contractor-s-general-liability-11-common-coverage-limitation-endorsements)

### first-party vs third-party claims
- [Insurance Claims Authority: First-Party vs Third-Party Claims](https://insuranceclaimsauthority.com/first-party-vs-third-party-claims.html)
- [Callender Bowlin: First-Party vs Third-Party Claims](https://www.cbtrial.com/first-party-vs-third-party-insurance-claims/)
- [The Hartford: Builders Risk vs General Liability](https://www.thehartford.com/general-liability-insurance/builders-risk-vs-general-liability)

### subrogation
- [IRMI: Builders Risk - Naming of Insureds](https://www.irmi.com/articles/expert-commentary/builders-risk-naming-of-insureds-reloaded)

### late notice and claim denial
- [Cozen O'Connor: Late Notice as Bar to Coverage](https://www.propertyinsurancelawobserver.com/2026/03/23/court-finds-late-notice-an-absolute-bar-to-coverage-in-property-claim/)

## .date researched

2026-04-19
