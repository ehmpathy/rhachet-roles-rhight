# howto.redact-obscure-to-legal-facts

## .what

the step-by-step to redact a brief tagged 🕶️ obscure into pure legal facts — so the fullsun set carries
only hazards, case studies, and general legal knowledge, never the client's business decisions.

companion to `rule.require.fullsun-facts-not-tactics.[rule].md` (the why) and
`rule.require.publishability-triage.[rule].md` (the triage + red-team).

## .why

an obscure brief tangles a public legal fact with a private business decision. a client name-swap hides
the name but leaves the decision in plain sight — a competitor still reads the play. the redaction pulls
the fact out clean and leaves the decision behind, in the client's repo.

## .the procedure

### 1. sort each sentence into fact or decision

read the brief line by line. for each claim, ask the test from the rule: **a fact used to compile a
decision, or the decision itself?**

- **fact** — "the law says X"; "the line is here"; "this breaks it"; a statute, a court decision, a case study.
- **decision** — "so we will do X"; "structure it this way"; "this is the cleanest / strongest case";
  an applied choreography; an operational runbook; a recommendation that settles a live choice.

mark each. the marks are the redaction map.

### 2. extract the facts into a proper fact-brief

collect the fact sentences into a brief of the right kind:

| fact kind | brief form |
|-----------|-----------|
| a risk the law imposes | `hazard.*` |
| a real program's public design | `ref.casestudy.*` |
| a line between two legal characters | `define.boundary.*` |
| a plain statement of doctrine | `define.*` / `ref.*` |

ground every claim in verbatim authority (per `rule.require.webfetch-citations`). the fact-brief must
stand on its own — no client, no applied design, just the law and a neutral fact pattern.

### 3. delete the business tactic

cut each line marked "decision":

- reassurance — "this is the safest possible shape", "the decline strengthens the thesis"
- applied choreography — the exact fund flow, the two-door design, the tier map
- operational runbook — "when a partner declines, do X"
- a recommendation that settles a choice the law did not force (see the optionality test)

if a sentence is half fact, half decision, keep the fact clause and cut the decision clause.

### 4. prune the decision residue to the client's repo

the deleted decision content is not worthless — it is the client's work-product. move it to the
client's private repo (the pull-inventory handoff), where it lives with the rest of the strategy.

### 5. re-tag the fact-brief fullsun

once only facts remain, tag the fact-brief ☀️ fullsun with a one-line reason: generic public law, no
client identity, no client-specific mechanic.

### 6. red-team

run the phase-2 blind red-team from `rule.require.publishability-triage`: hand a fresh analyst **only**
the fullsun set and ask it to recover the business — the model, the decisions, the tactics. if it
recovers any **decision, tactic, or strategy** (not just a client name), a decision leaked back in.
re-redact and re-run until the red-team recovers only facts.

## .worked example

a howto titled "platform-funded fallback rebate" mixed:

- **facts**: a self-paid rebate on the buyer's own purchase is not money transmission; a reward for a
  non-purchase sign-up is a taxable prize and, with chance, a game-promotion.
- **decisions**: "self-fund when a partner declines — it strengthens your position"; the pro-credit
  co-fund flow; "the cleanest case."

redaction: the game-promotion fact was **new** (covered nowhere else), so it was lifted into
`hazard.reward-without-purchase-is-a-prize.[hazard].md` (fullsun). the money-transmission fact was
**already** in `define.boundary.platform-funded-vs-conduit-held-funds`. the decisions were **pruned** to
the client's repo. the original howto was removed from the public tree.

## key takeaways

| step | action |
|------|--------|
| 1 | sort each sentence: fact or decision |
| 2 | extract facts into a `hazard.*` / `ref.casestudy.*` / `define.boundary.*` brief |
| 3 | delete the business tactics / decisions / strategies |
| 4 | prune the decision residue to the client's private repo |
| 5 | re-tag the fact-brief fullsun |
| 6 | red-team — recover facts only, never a decision |

## .see also

- `rule.require.fullsun-facts-not-tactics.[rule].md` — the rule this howto executes
- `rule.require.publishability-triage.[rule].md` — the triage + the blind red-team
- `rule.require.webfetch-citations.[rule].md` — the verbatim-citation bar for the fact-brief
