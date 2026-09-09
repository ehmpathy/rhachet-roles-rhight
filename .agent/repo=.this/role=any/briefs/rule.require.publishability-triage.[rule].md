# rule.require.publishability-triage

# tldr

## severity: blocker

every brief checked into this repo must be assessed against the **share / scrub / prune** triage,
and must record its verdict inline in a `## .publishability` section.

this repo mixes two kinds of knowledge: **generic role-knowledge** (meant to ship as a public,
shareable role) and **client-specific engagement work** (privileged, proprietary, or both). without a
per-brief triage, secret sauce leaks into a shared role, or privileged client material gets
open-sourced. the triage forces the author to decide, before check-in, which bucket a brief lands in.

---
---
---

# deets

## .what

three verdicts, one per brief:

| verdict | what it is | what may happen to it |
|---------|-----------|-----------------------|
| **share** | generic knowledge — public law, generic analysis, third-party case studies; carries no client identity and no client-specific mechanic | publishable ~as-is |
| **scrub** | a generic pattern narrated with a client's identity, exact fund-flow, or applied design | publishable **only after** the client identity and the specific mechanic are removed |
| **prune** | the client's secret sauce — the applied mechanic, the product architecture, the strategy, or any privileged material | **never publish**; belongs in the client's own private space |

every brief records its verdict in a `## .publishability` section near the bottom: the tag plus a
one-line reason. a central triage manifest (a `handoff.publishability-triage.md` per engagement) may
roll the verdicts up, but the inline tag is the source of truth — it travels with the file.

## .the two vocabularies — one decision, two lenses

share / scrub / prune are the **verdict** (what *action* to take on a brief). they map one-to-one onto
fullsun / obscure / protect, which are the **rationale** (what *kind of value* drives that action). same
trio, two lenses on the same call — use the verdict to act, the posture to explain why.

| verdict (the action) | posture (the why) | protects value that is… | if it leaks |
|----------------------|-------------------|--------------------------|-------------|
| **share** | ☀️ **fullsun** | **right / defensible** — value *is* daylight | no loss (sunlight was the point) |
| **scrub** | 🕶️ **obscure** | **first / rare / uncopied** | competitive loss — **reversible** (out-execute) |
| **prune** | 🔒 **protect** (privilege) | **a legal shield you hold** | legal loss — **irreversible** (waiver does not return) |

the decision rule (one question per brief): **what makes this brief valuable?** — correct → share/fullsun;
scarce → scrub/obscure; a legal right → prune/protect. severity climbs share → scrub → prune: a mis-shared
fullsun brief costs no loss, a mis-shared obscure brief costs a lead you can rebuild, a mis-shared protected
brief costs a right you cannot get back.

## .the four tests — run each brief through all four

a bare "does it name the client?" check is **not enough** — it catches only the first of four leak
vectors. run every brief through all four tests, in order. any test that fires sets the posture; if
more than one fires, take the **most restrictive**.

| test | the question | catches | posture |
|------|--------------|---------|---------|
| **fingerprint** | does it name the client, its products, or narrate the applied mechanic / architecture? | client identity + applied architecture | 🔒 protect (mechanic) / 🕶️ obscure (applied narration) |
| **optionality** | does a recommendation settle a choice the law did **not** force? | strategic recommendations | 🕶️ obscure → ☀️ fullsun on trigger |
| **insight** | does the valuable **conclusion** survive de-identification of the client? | the aha-cluster | 🕶️ obscure — **split** before publish |
| **voice** | is it written in **advisory voice** — one actor always lands safe with the same mechanic, briefs stitched into one design? | the integrated design, leaked through frame | 🕶️ obscure — **rewrite to neutral** before publish |

### test 1 — fingerprint

the obvious one: a brief that names the client (`acme`), its products (`acme-pro`, `acme-rewards`),
or narrates the applied fund choreography is not generic. **caution: a high name-count is a weak
signal.** a brief may mention the client 30+ times purely as a **placeholder actor** ("the issuer owes
it") while the substance is pure public law — a name-swap clears it to fullsun. conversely a brief with
few names may narrate the applied architecture. judge the **kind** of presence, not the count:

- **placeholder-actor** — the client is a stand-in for "the issuer / the platform"; the law is generic → ☀️ fullsun after name-swap
- **instrument-narrated** — names the client's specific instruments or fund flows → 🕶️ obscure (real rewrite)
- **mechanic** — the applied choreography **is** the content → 🔒 protect (remove from the shippable tree)

### test 2 — optionality (recommendations)

a `rule.prefer.*` / `rule.require.*` is the **chosen path through the terrain** — and the path is the
strategy. but not every recommendation is strategic. the tell is **how much optionality it settles**:

- restates a **legal mandate** (the law forces it; no choice) → ☀️ fullsun (it is just the law)
- picks among **lawful options** (all paths are legal; this one chosen for a non-obvious reason) → 🕶️ obscure

> the strategic value of a recommendation ∝ the optionality it settles.

an obscured recommendation is **obscure now → fullsun later**, gated by a written **graduation trigger**
(e.g. "public launch + the design is self-evident in-product"). obscurity is a delay, not a right — the
trigger forces the eventual sunning so the fullsun upside (goodwill, thought-leadership, defensibility)
is not lost to inertia. record the trigger inline:

```md
## .publishability

🕶️ **obscure → ☀️ fullsun** — recommendation settles live optionality; hold until <trigger>.
graduation trigger: <a real, checkable event>.
```

### test 3 — insight (the aha-cluster)

the subtle one. some briefs are **clean of the client yet still leak the valuable conclusion** — their
worth is the *conclusion they teach*, not the *facts they cite*. individually each passes the
fingerprint test (a name-swap makes them look generic), but the **reasoning chain survives
de-identification**, and read together they reconstruct the design thesis. this is the **aha-cluster**.

handle by **split**: publish the bare terrain (the statutes, the boundary), but **hold the synthesis
sentence** — the "...and therefore <the non-obvious conclusion>" line. the law is fullsun; the
collapse-insight is obscure.

> aha-cluster ≠ moat. it may still be worth obscuring for hygiene (do not gift-wrap a competitor's
> homework) even where the insight is not durably defensible. tag it and split it; do not overprotect it.

### test 4 — voice (advisory vs neutral)

the deepest leak. a brief passes all three tests above — no client name, no settled recommendation, no
standalone aha — yet the **whole set** still reconstructs the strategy, because each brief is written in
**advisory voice**: one actor ("the platform") is the repeat protagonist, both sides of every legal
line are described but the **same actor always lands on the same safe side** with the **same specific
mechanic**, and the briefs **cross-reference each other into one integrated design**. no single sentence
is a tactic — but the frame, summed across the set, **is** the tactic.

a genuine generic-law brief reads so you **cannot tell which side the author is on**. an advisory brief
always points the same actor to the same safe choice. handle by **rewrite to neutral legal voice** per
`rule.require.fullsun-facts-not-tactics` → `.the voice test`: state where the **law draws the line**, not
what an **actor chose**; describe both sides symmetrically; drop the "the model we mirror" tables and the
glue cross-references that stitch the set into a design.

> the test to apply: **strip the citations from the whole set — can a reader still name the design the
> author recommends?** if yes, the voice is advisory across the set — rewrite. this is the leak a
> name-swap, a trigger, and a split all miss.

## .the two-phase workflow — declare, then red-team

the four tests above are **author intuition**. intuition leaks. the fingerprint test in particular
gives false confidence: an author scrubs the client name, sees no fingerprint, and tags the brief
fullsun — while the brief's *structure* still reconstructs the whole business. so the triage is **not
done at the tag**. it has two mandatory phases: a **pre-red-team declaration**, then a **red-team
verification**.

### phase 1 — pre-red-team declaration (before you scrub)

**before** any scrub work, and before the red-team runs, write down — per engagement — three lists:

1. **🔒 protect** — what is the client's moat, secret sauce, or privileged material? (the applied
   mechanic, the product architecture, the strategy, the privileged handoff.)
2. **🕶️ obscure** — what is a strategic choice or a leaky reasoning-chain that should stay private
   for now? (recommendations that settle real optionality; the aha-cluster; flip-maps.)
3. **☀️ fullsun** — what is genuinely generic public knowledge that carries none of the above?

this declaration is the **hypothesis**. it says, up front and on the record, what you *believe* each
class contains — so the red-team has something to falsify, and so a later reader can see what the
triage was *trying* to protect. an engagement that scrubs without first declaring its protect/obscure/
fullsun split is scrubbing blind.

### phase 2 — red-team verification (before you publish)

**before** the fullsun set ships, run a **blind red-team reconstruction test**:

- hand a fresh agent (or a person) **only the fullsun briefs** — no other file, no client name, no
  context, no access to the wider repo or the engagement route.
- ask it to **reconstruct the business**: what does this company do, what is the product, who are the
  parties, what is the industry, the jurisdiction, the reward/money-flow structure, the moat.
- **crucially, ask it to recover the business decisions, tactics, and strategy** — not just the client
  identity. per `rule.require.fullsun-facts-not-tactics`, the fullsun set must carry only the legal
  **facts** (hazards, case studies, general legal knowledge); if the red-team can name what the actor
  *chose to do* with those facts (the applied design, the money-flow play, the "cleanest case" runbook),
  a business decision leaked — even if the client name is fully scrubbed.
- ask it to rate each inference (certain / likely / guess / unknown) and to **quote the lines that
  leaked the most**.

then compare the red-team's reconstruction against phase-1's declaration:

| red-team recovered… | verdict |
|----------------------|---------|
| an item from the 🔒 protect or 🕶️ obscure list | **LEAK — blocker.** re-scrub or re-classify the briefs that leaked it, then re-run the red-team. |
| a **business decision, tactic, or strategy** (the applied design, the money-flow play, the chosen structure) — even with no client name | **LEAK — blocker.** a fact leaked its decision. redact per `howto.redact-obscure-to-legal-facts` — keep the fact, prune the decision — then re-run. |
| only **legal facts** from the ☀️ fullsun list (hazards, case studies, general legal knowledge) | the scrub held; safe to publish |
| a **structural** reconstruction a name-swap would not fix (e.g. a table that maps the exact tier architecture) | **LEAK — blocker.** the leak is the *structure*, not the name — genericize the structure or re-classify to obscure. |
| the **integrated design** — "the actor lands safe by doing X, Y, Z" — even with no client name and no single tactic-sentence | **LEAK — blocker.** the set is written in advisory voice. rewrite to neutral legal voice per `.the voice test`, then re-run. |

the red-team catches the failure the fingerprint test cannot: a brief that is **clean of the client
name yet still teaches the model — or the client's chosen play**. a name-swap defeats a `grep`; it does
not defeat an analyst. only an adversarial read proves that the set carries facts, not decisions.

> **iterate to a clean red-team.** publish only after a blind red-team, given the fullsun set alone,
> recovers **none** of the protect or obscure items. one pass is rarely enough — each leak found is a
> re-scrub and a re-run.

## .why

- this repo is intended, in part, as a **public role library**. a brief that names a client, quotes a
  privileged handoff, or narrates a client's exact fund choreography does not belong in a public role
  — but it is easy to author one unaware, because the generic law and the applied mechanic sit side
  by side.
- the **law is public; the mechanic is the moat.** anyone can cite a statute. the proprietary value
  is the client's specific applied structure. a triage keeps the citable law shareable while the
  applied structure stays private.
- privileged material (a peer's legal handoff, a strategy doc) that leaks into a public branch is not
  just a competitive loss — it can waive privilege. the cost of one missed brief is high; the cost of
  a one-line tag is trivial.

## severity: blocker

an untriaged brief is a live leak risk. the author who wrote it is the one who best knows whether it
carries a client identity or a client-specific mechanic; if they do not record the verdict, a later
reader who publishes the role cannot reconstruct it safely. the tag is one line — its absence is a
blocker.

## .where

applies to:

- every `*.md` brief under `.agent/**` and `src/domain.roles/**/briefs/**`
- any research or handoff artifact under a `.behavior/**` engagement route

it does **not** apply to code, tests, or config — only to knowledge artifacts (briefs, refs, research
docs) that could be published.

## .how

tag the brief with its **posture** — the emoji + the posture term is the canonical form; the verdict
term (share / scrub / prune) rides along as the alias. add a section near the bottom of the brief:

```md
## .publishability

☀️ **fullsun** (share) — generic public-law analysis; no client identity or client-specific mechanic.
```

or, for a client-specific artifact:

```md
## .publishability

🔒 **protect** (prune) — narrates the client's applied fund-flow; keep private, pull into the client's own repo.
```

the three canonical tags:

- ☀️ **fullsun** (share) — value *is* daylight; publish it
- 🕶️ **obscure** (scrub) — value is rarity; withhold until de-identified
- 🔒 **protect** (prune) — value is a legal right; never expose

when in doubt between two tags, pick the **more restrictive** one (protect over obscure, obscure over
fullsun) and note the doubt in the reason — a false protect costs a re-review; a false fullsun costs a leak.

## .reporting

**always report a triage in terms of the posture, with its emoji.** when a brief, a set, or a manifest
is described in any output — a summary, a table, a handoff, a chat reply — lead with the posture emoji
and term (☀️ fullsun / 🕶️ obscure / 🔒 protect), not the bare verdict word. the emoji is a fast,
scannable signal of the leak-severity; the posture names *why*. the verdict term may follow in
parentheses for the action, but the posture leads.

- 👍 `☀️ fullsun (share) — 35 briefs cleared for daylight`
- 👎 `share: 35 briefs` (no posture, no emoji — the severity signal is lost)

## .enforcement

- a brief without a `## .publishability` verdict = **blocker**
- a brief tagged ☀️ fullsun (share) that in fact carries a client identity or client-specific mechanic = **blocker**
- 🔒 protect (prune) material committed to a branch intended for public release = **blocker**
- an engagement that scrubs **without** a phase-1 protect/obscure/fullsun declaration on record = **blocker**
- a fullsun set published **without** a phase-2 blind red-team reconstruction test = **blocker**
- a red-team that recovers a 🔒 protect or 🕶️ obscure item from the fullsun set, published anyway = **blocker**
- a fullsun brief in **advisory voice** (fails test 4 — one actor always lands safe, set stitched into one design) = **blocker**
- a red-team that recovers the **integrated design** from the fullsun set, published anyway = **blocker**
- an **aggregation surface** (boot.yml / index / glossary / catalogue / manifest) that narrates the applied design instead of neutral topic law = **blocker** (see `rule.forbid.aggregation-index-build-narrative`)
- a shipped brief whose `## .publishability` section carries the **internal audit trail** (red-team findings, "re-read owed", citation-quota math, over-tag narrative, withheld-file mentions) instead of the bare stamp = **blocker** (see `rule.forbid.audit-trail-in-shipped-briefs`)
- a triage report that omits the posture emoji = **nitpick**

## .see also

- `rule.forbid.audit-trail-in-shipped-briefs.[rule].md` — the stamp ships; the audit trail this workflow produces stays in the route
- `rule.require.briefs-integrity-gate.[rule].md` — the `briefs.integrity` gate that mechanizes this triage on every build
- `rule.require.fullsun-facts-not-tactics.[rule].md` — fullsun the legal facts, never the business decisions
- `rule.forbid.aggregation-index-build-narrative.[rule].md` — indexes must name topic law, never the applied design
- `howto.redact-obscure-to-legal-facts.[lesson].md` — the step-by-step obscure→facts redaction
- `howto.test-obscurity-via-blind-convergence.[lesson].md` — the convergence probe: do blind readers converge on one design?
- `howto.redact-completed-behavior-route.[lesson].md` — how to redact a completed, prune-approved .behavior route
- `rule.require.recommendation-disclaimer.[rule].md` — the recommendation-disclaimer companion rule
- `rule.require.bhrowser-citations.[rule].md` — the citation-quality rule
- `motto.not-legal-advice.[motto].md` — the not-advice framework
