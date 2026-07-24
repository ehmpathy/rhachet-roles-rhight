# rule.require.fullsun-facts-not-tactics

# tldr

## severity: blocker

fullsun-publish **only** the fundamental legal facts — hazards, case studies, boundaries, and general
legal knowledge — the **inputs** an actor uses to compile a business decision. **never** fullsun the
business decisions, tactics, or strategies themselves — those are the **outputs**, and they are the
client's own domain.

facts are shareable; the decisions built from them are the moat. a brief that teaches "here is the law"
is fullsun. a brief that teaches "here is what we chose to do about the law" belongs to the client —
obscure or protect.

---
---
---

# deets

## .what

two classes of knowledge, one line between them:

| class | what it is | examples | disposition |
|-------|-----------|----------|-------------|
| **legal facts** (inputs) | the raw law and its application to a fact pattern | a hazard, a case study, a statutory boundary, general legal knowledge | ☀️ fullsun |
| **business decisions** (outputs) | what an actor chose to do with those facts | a tactic, a strategy, an applied design, an operational runbook, a recommendation that settles live optionality | 🔒 protect / 🕶️ obscure — the client's domain |

the test, per brief: **is this a fact used to compile a decision, or is it the decision itself?**

- a fact answers "what does the law say / where is the line / what breaks it?" → fullsun
- a decision answers "so what will we do / how will we structure it / why this way?" → the client's

## .why

- the fundamental legal facts are public knowledge — statutes, rulings, case studies. anyone can cite
  them; no value is lost when they are shared, and value accrues (goodwill, thought-leadership) when
  they are. this is the fullsun set.
- the decisions and strategies built from those facts are the client's competitive work-product. a
  competitor who reads the facts still has to do the hard part — decide what to build. a competitor who
  reads the decisions gets the answer for free.
- a brief that mixes the two gives the competitor the answer while it adds no fact the law did not
  already state. split it: publish the fact, keep the decision.

## .the sharp cases

| looks like a fact, but is a decision | the fact under it to keep |
|--------------------------------------|----------------------------|
| "self-fund the reward when a partner declines — here is why that strengthens the position" | *a reward paid from the payer's own revenue on the buyer's own purchase is a rebate, not money transmission* |
| "structure the credit as two doors so pros earn growth-fuel here and cash there" | *a spend-only closed-loop credit is excluded from stored value and money transmission* |
| "tune the tier rates this way to land the tax result we want" | *tax character follows the redemption path, not the rate* |

the left column is the client's chosen play — its value is the choice. the right column is the public
law that any actor could look up. publish the right column only.

## .the voice test — neutral legal voice, never advisory voice

the sharp cases above leak a decision in **one sentence**. the subtler leak carries **no** explicit
sentence at all — it hides in the **voice** of the whole set. a brief can be scrubbed of the client
name, scrubbed of every explicit tactic, and each sentence can be a true statement of law — yet the set
still reconstructs the strategy, because it is written in **advisory voice**.

the two voices state the same law but frame it oppositely:

| | **neutral legal voice** (fullsun) | **advisory voice** (leaks the decision) |
|---|-----------------------------------|-----------------------------------------|
| subject | a generic or conditional subject ("a discount-only point", "a marketplace operator, if merchant-of-record") | a single protagonist that is always the same actor ("the platform", "the issuer") |
| both sides of the line | described **symmetrically** — neither side is "ours" | described, but the **same actor always lands on the same safe side** with the **same specific mechanic** |
| the conclusion | states **where the law draws the line** | states **what the actor chose** so as to sit on the safe side |
| cross-references | each brief stands alone as a statement of law | briefs stitch to each other into **one integrated design** |
| the tell | you **cannot name** which side the author is on | every brief points the **same actor** to the **same safe choice** |

> a genuine generic-law brief describes both sides of a line neutrally. an advisory brief describes both
> sides but then **always lands the same actor on the same side with the same specific mechanic** — and
> cross-references the others into one integrated design. **that integrated design is the tactic**, even
> when no single sentence states it.

### the transform — advisory → neutral

state the **law's line**, not an **actor's choice**:

| advisory (leaks) | neutral (fullsun) |
|------------------|-------------------|
| "the platform keeps its point discount-only, so it stays outside stored value" | "a discount-only closed-loop point is excluded from stored value; a cashable one is not" |
| "the platform funds the reward from its own revenue, so it avoids money transmission" | "a reward paid from the payer's own revenue is a rebate; a conduit that forwards a third party's funds is money transmission" |
| "the platform books the credit as deferred revenue so it may invest the float" | "prepaid-service credit is the issuer's deferred revenue and its own capital; custodied customer funds are restricted" |
| "the platform mirrors the Amazon Associates model" (a "the model we follow" table) | "the Amazon Associates program pays affiliates a commission from the platform's own revenue" (a case study, both-sides-neutral) |

### the author mandate

**author every fullsun brief in neutral legal voice.** concretely:

- **do not** carry one protagonist that always lands safe. name a generic or conditional subject.
- **do** describe both sides of every line symmetrically — the safe side and the unsafe side get equal,
  actor-neutral treatment. a reader must not be able to tell which side is "the client's".
- **do not** state the actor's chosen mechanic as the conclusion. state **where the line is**.
- **do not** cross-reference the other briefs into an integrated design. each brief stands alone as law.
- **do not** include "the model the actor mirrors" / "our analogue" tables, guardrails framed as product
  constraints, or monetization conclusions ("so the actor keeps the breakage / invests the float").

the test to apply to your own draft: **strip the citations — can a reader still tell which design the
author recommends?** if yes, the voice is advisory; rewrite to neutral. if no — the brief teaches
only the terrain — the voice is neutral.

## .the redaction duty (for every obscure brief)

a brief tagged 🕶️ obscure is a signal that a fact and a decision are tangled together. do not publish it
as-is, and do not settle for a client name-swap. **redact it into pure legal facts** — see
`howto.redact-obscure-to-legal-facts.[lesson].md` for the step-by-step. in short:

1. **extract the fact** — the hazard, case study, or boundary — into a proper fact-brief
   (`hazard.*` / `ref.casestudy.*` / `define.boundary.*`), grounded in verbatim authority.
2. **delete the business tactic** — the reassurance ("this is the cleanest case"), the applied
   choreography, the operational runbook, the "how to structure it to win." that content is the
   client's decision, not a fact.
3. **prune the decision residue** to the client's private repo (the client owns its strategy).
4. **re-tag** the fact-brief ☀️ fullsun once only facts remain.
5. **red-team** the result (per `rule.require.publishability-triage`): a blind analyst, given only the
   fullsun set, must recover **no** business decision, tactic, or strategy.

## .examples

### positive — a fact (fullsun)

> a reward for a non-purchase action (a mere sign-up) is a taxable prize, not a rebate; add an element
> of chance and it is a regulated game-promotion. — grounded in 26 U.S.C. § 61, Fla. Stat. § 849.094.

it states the law. any actor who builds a reward program needs it. publish it.

### negative — a decision (the client's)

> when no partnered pro exists in the area, or a pro declines, self-fund the reward from your own
> revenue — the decline actually strengthens your money-transmitter position.

it states a chosen play. its value is the choice, not the law under it. prune to the client's repo;
publish only the fact under it (a self-paid rebate on the buyer's own purchase is not money
transmission), if that fact is not already covered elsewhere.

## severity: blocker

a fullsun brief that carries a business decision, tactic, or strategy is a **blocker**. a competitor
reconstructs the client's playbook from the shared set — an irreversible competitive loss, for zero
public-knowledge gain (the law under it was already citable). the fix is cheap (split the fact from the
decision); the leak is not.

## .enforcement

- a fullsun brief that teaches a business decision, tactic, or strategy = **blocker**
- an obscure brief published without the redaction duty run on it = **blocker**
- a fact-brief that still narrates the client's applied choreography = **blocker** (re-classify to protect)
- a fullsun brief written in **advisory voice** — one protagonist that always lands safe, both sides
  described but the same actor always on the safe side, briefs stitched into one design = **blocker**
  (rewrite to neutral legal voice per `.the voice test`)

## .see also

- `rule.require.publishability-triage.[rule].md` — the share/scrub/prune triage + the two-phase red-team
- `howto.redact-obscure-to-legal-facts.[lesson].md` — the step-by-step redaction procedure
- `howto.test-obscurity-via-blind-convergence.[lesson].md` — the convergence probe: do blind readers converge on one design?
- `rule.require.recommendation-disclaimer.[rule].md` — the recommendation-disclaimer companion
