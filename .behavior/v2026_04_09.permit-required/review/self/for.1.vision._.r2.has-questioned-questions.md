# review: has-questioned-questions (r2)

## reviewed: 1.vision.yield.md → "open questions & assumptions"

triaged each open question per the guide.

---

## questions to validate

### Q1: scope — residential only, or commercial too?

**triage**: [answered]

**original concern**: the wish says "residential or commercial service" — but IRC applies to residential. commercial uses IBC. this changes the code sections to cite.

**resolution**: derive structure type from parcel data. user provides address; we look up structure type (single-family → IRC, commercial → IBC). covers both residential and commercial without user self-report.

**why this works**: we don't ask users "is this residential or commercial?" — they may not know the legal classification. instead, we determine it from parcel data, then apply the correct code (IRC or IBC).

---

### Q2: geography — US only, or expand later?

**triage**: [answered]

**answer**: US only for now. the wish says "any postal & service in the usa" — explicitly US scoped.

---

### Q3: permit search — prioritize Indianapolis or generalize first?

**triage**: [answered]

**answer**: Indianapolis first. the wish explicitly requests Indianapolis permit database search.

**wisher clarification**: when I suggested deferral of permit.search, wisher immediately responded: "no deferment of permit.search allowed... its a core requirement." permit.search is NOT deferrable — it's part of v1 scope alongside permit.required.

---

### Q4: API access — pursue Accela partnership or accept scrape/manual?

**triage**: [research]

**rationale**: need to evaluate: (1) effort to apply for Accela partnership, (2) ToS implications of scrape, (3) reliability of manual fallback.

**recommendation**: accept scrape for v1, document fragility, consider partnership for v2 if usage warrants.

---

## research needed (from vision)

### R1: which states have freely accessible code text

**triage**: [research]

**rationale**: needed to understand feasibility of generalization. some states use ICC paywall, others publish freely.

---

### R2: which jurisdictions expose permit APIs

**triage**: [research]

**rationale**: needed for permit.search generalization. Indianapolis uses Accela. others may differ.

---

### R3: standard work type taxonomy

**triage**: [research]

**rationale**: users say "panel upgrade" but codes say "replace... electrical... system." need a map from natural language to code terms.

---

## summary

| question | status | notes |
|----------|--------|-------|
| residential vs commercial | [answered] | derive from parcel data |
| US only | [answered] | yes, per wish |
| Indianapolis first | [answered] | yes, core requirement |
| API vs scrape | [research] | accept scrape v1 |
| state code access | [research] | for generalization |
| permit APIs | [research] | for generalization |
| work type taxonomy | [research] | for natural language → code map |

---

## action: update vision

added status markers to the "open questions & assumptions" section in the vision.

---

## what I learned

### lesson 1: [wisher] → [answered] when wisher clarifies

when wisher provides clarification in conversation, update the status from [wisher] to [answered]. the [wisher] tag means "we haven't asked yet" — not "wisher has authority."

### lesson 2: deferral suggestions need wisher approval

I suggested deferral of permit.search. wisher immediately clarified it's core. deferral is a scope change — scope changes need wisher buy-in.

### lesson 3: derive > ask

for scope question (residential vs commercial), the answer was "derive from parcel data" not "ask user." this is a pit-of-success pattern: users don't need to know legal classifications. we figure it out.
