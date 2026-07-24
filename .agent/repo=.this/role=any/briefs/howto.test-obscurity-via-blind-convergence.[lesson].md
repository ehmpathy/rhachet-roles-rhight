# howto.test-obscurity-via-blind-convergence

## .what

a procedure to test whether a published set of briefs still leaks the **secret sauce** — the client's
chosen design — even after the client identity is scrubbed. it complements the reconstruction red-team
in `rule.require.publishability-triage`, but measures a **different** signal: not "can a reader recover
the client?" but "do independent readers **converge** on one design?"

the core move: hand fresh, blind agents **only** the fullsun set and ask an **open-ended** question —
*what kind of program could this support?* — not the leading *reconstruct the client's program*. then
measure how hard their answers converge.

## .why

the reconstruction red-team (`rule.require.publishability-triage`, phase 2) asks a reader to recover a
**known** target. that is a strong test, but it has a blind spot: a reader told "reconstruct the
client" will **strain** to name one answer, and may **over-read** — inferring a motive from the mere
presence of a topic, or hallucinating a file. its confidence number blends real leaks with strain.

the convergence probe removes the strain. it never mentions a client. it asks an unprimed reader to
**enumerate** the programs the set could support and rate the fit. then the leak is measured by a
cleaner statistic:

> **if independent, unprimed readers converge on the same one design at high fit, the set leaks that
> design — no matter how well the identity is scrubbed.**

a genuinely generic legal library supports **many** programs about equally; a de-identified blueprint
supports **one** and the readers all find it. convergence is the leak; divergence is the safety.

it also catches the leak the identity-scrub cannot: a set can score **UNKNOWN** on company, brand,
rate, and vertical — a clean identity scrub — while independent readers still converge ~85–90% on the
exact design shape. identity-clean is not design-clean; only convergence measures the second.

## .the procedure

### step 1 — freeze the fullsun set

collect exactly the briefs proposed for publish — the `☀️ fullsun` set, and no other file. no client
file, no route, no wider repo. this is the only input the probe readers get.

### step 2 — dispatch ≥ 2 blind readers, with DIFFERENT lenses

run at least two fresh agents (or people) in parallel, each blind to all context. vary the lens so a
single framing bias does not dominate:

- **neutral-reader lens** — "you found this folder. what is it about? what kind of program *might* have
  prompted this specific set? list **every** distinct program it could support, and rate each fit."
- **build-the-program lens** — "if you built a program guided **only** by these briefs, what would you
  build — and for each design choice, did the **briefs** decide it, or did **you**? give a percentage:
  what fraction of the design can you read off the set vs must decide yourself?"

optional third lenses: a **competitor lens** (what is the moat / monetization motive?), or a
**taxonomy lens** (which named program-type in the glossary does the set describe?).

### step 3 — ask for the convergence signal, not just a guess

each reader must return:

1. the **list** of programs the set could support, each with a fit rating (strong / moderate / weak).
2. the **one** design the set most points to, **or** an honest "it fits many equally."
3. a **read-off percentage**: what fraction of the load-bearing design choices are decided **by the
   briefs** vs left **open** to the reader.
4. the **lines that drove** each inference (quoted), and what they genuinely **cannot** tell.

### step 4 — score the convergence

| signal across the readers | reading |
|---------------------------|---------|
| readers list **many** programs, none dominant; low read-off % | ✅ the set is a generic map — the design stays the reader's to choose |
| readers **converge** on one design; high read-off % (> ~50%) | ⛔ the set leaks the design — obscure or decompose before publish |
| readers name a **monetization motive** or **applied mechanic** off the set | ⛔ a decision leaked — redact per `howto.redact-obscure-to-legal-facts` |
| readers agree identity is **UNKNOWN** but design is **converged** | ⛔ identity-clean, design-leaked — the scrub is only half done |

the pass bar: **divergence**. readers should list several plausible programs and be **unable** to say
which the author picked. if they name one at high read-off %, the secret sauce is still on the page.

## .the four tells convergence exposes

when readers converge, ask them **what** made them converge. it is almost always one of four — each maps
to a fix:

| tell | what it is | fix |
|------|-----------|-----|
| **recommendation files** | a `rule.prefer.*` / `rule.require.*` names a preferred side outright | reclassify to 🕶️ obscure (publishability test 2) — hold the recommendation, keep the fact under it |
| **recurring protagonist / exemplar** | the same actor (or the same case-study set) always sits on the safe side | rewrite to neutral voice (fullsun-facts-not-tactics `.the voice test`) |
| **motive briefs** | a brief establishes *who keeps the yield / the breakage* — a fact a treatise has no reason to prove | prune or deep-genericize the motive; a legal map does not need a profit rationale |
| **corpus composition** | the **selection** of topics maps one program, even when each brief is neutral | decompose — do not ship the clusters as one adjacent bundle; interleave with generic law |

the last is the hardest: no per-brief rewrite fixes it, because the leak is the **curation**, not any
sentence. only a split or a dilution of the set defeats it.

## .worked example

a rewards + referrals + reviews + accounting set was scrubbed of all client identity across four passes.
a reconstruction red-team reported ~80% — but blended real leaks with strain and hallucinated two files.
two convergence probes (neutral + build lenses), given the same set, independently reported:

- identity: company, brand, rate, dollar figures, exact vertical — all **UNKNOWN** (scrub held).
- design: both converged on **one** design shape; the build-lens read **~85–90%** of design choices off
  the set; both named the same monetization motive (reserve float + breakage) and the same applied
  mechanic (merchant-of-record coupon-reimbursement).

verdict: identity-clean, design-leaked. the residual was **composition** — the four clusters, published
as one adjacent bundle, mapped one program. the fix was not more scrubbing (which had plateaued) but
reclassification of the `rule.prefer.*` files and decomposition of the bundle.

## .when to run it

- after the phase-2 reconstruction red-team plateaus — when more scrubbing stops moving the number,
  convergence tells you whether the residual is a real leak or red-team strain.
- before publishing any **curated set** of briefs that share a subject (the composition leak only shows
  up at set scale, never per brief).
- whenever a set scores clean on identity but you suspect the design still reads through.

## .enforcement

- a fullsun set published where ≥ 2 blind readers **converge** on one design at high read-off % = **blocker**
- a fullsun set where a blind reader names a **monetization motive** or **applied mechanic** = **blocker**
  (redact per `howto.redact-obscure-to-legal-facts`)

## .see also

- `rule.require.publishability-triage.[rule].md` — the share/scrub/prune triage + the phase-2 reconstruction red-team
- `rule.require.fullsun-facts-not-tactics.[rule].md` — fullsun the facts, never the decisions; the voice test
- `howto.redact-obscure-to-legal-facts.[lesson].md` — the step-by-step obscure→facts redaction
