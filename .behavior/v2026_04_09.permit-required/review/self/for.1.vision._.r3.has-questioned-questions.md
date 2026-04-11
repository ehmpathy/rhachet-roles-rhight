# review: has-questioned-questions (r3)

## reviewed: 1.vision.yield.md → "open questions & assumptions"

the prior reviews (r1, r2) triaged questions with status markers. this review questions the questions themselves — are they the right questions? are they framed correctly? what do they hide?

---

## issues found

### issue 1: Q1 was framed as wisher choice, but it's answerable now

**the question**: "residential only, or commercial too?"

**what was wrong**: marked as [wisher] — implies the wisher must choose. but IRC vs IBC is determined by structure type, not user preference. a duplex is IRC regardless of what the user thinks.

**how it was fixed**:
1. reframed the question: not "which scope do you want?" but "which code applies to this structure?"
2. changed status from [wisher] to [answered]
3. updated vision: structure type determined from parcel data, not user self-report
4. added `structure_type` to proof chain output so users see which code applies and why

**lesson**: questions that seem to require human input may actually be answerable from data. always ask: "is there a source of truth that decides this?"

---

### issue 2: I wrongly questioned whether permit.search was in scope

**the question**: "pursue Accela partnership or accept scrape/manual?"

**what I initially thought was wrong**: that permit.search (usecase 2) might be feature creep because the "aha moment" is about code citations (usecase 1).

**why I was wrong**: re-reading the wish, permit.search is explicitly requested:
> "create a shell skill to search the indianpolis marion county database of permits pulled"

this is not feature creep. it's a core requirement. the wish has TWO goals, not one.

**what this taught me**:
1. always re-read the wish before you conclude a feature is out of scope
2. the wish is the source of truth for scope
3. my deeper review was not deep enough — I questioned the vision but forgot to verify against the wish

**no change needed**: Q3 stays [answered] — Indianapolis first per wish. Q4 stays [research] — need to evaluate scrape vs API vs manual.

**lesson**: before you flag a feature as "feature creep," verify it's not explicitly requested in the wish.

---

### issue 3: research items lacked risk frame

**the question**: "standard work type taxonomy — needed for natural language to code map"

**what was wrong**: marked as [research] with no sense of difficulty or stakes. this is actually an NLP problem with legal risk — if we misinterpret "panel upgrade," we give wrong legal advice.

**how it was fixed**:
1. expanded "what is awkward" section to articulate the NLP challenge
2. added `work_interpreted` to proof chain output so users can verify we understood their intent
3. added "confidence" field so users know when to double-check
4. noted "high stakes: wrong interpretation = wrong legal advice"

**lesson**: [research] items need risk assessment. some research is "nice to know" (which states have free code access). some is "must get right or we fail" (work type interpretation). distinguish them.

---

## verification: triage checklist for each question

per the guide, each question must be triaged by asking:
- can this be answered via logic now?
- can this be answered via extant docs or code now?
- should this be answered via external research later?
- does only the wisher know the answer?

### Q1: scope (residential vs commercial)

| check | result |
|-------|--------|
| answered via logic? | YES — structure type determines IRC vs IBC |
| answered via docs? | n/a (logic suffices) |
| needs research? | no |
| wisher knows? | no (parcel data knows) |

**triage**: [answered] ✓

### Q2: geography (US only vs expand later)

| check | result |
|-------|--------|
| answered via logic? | no |
| answered via docs? | YES — wish says "any postal & service in the usa" |
| needs research? | no |
| wisher knows? | answered in wish |

**triage**: [answered] ✓

### Q3: permit search (Indianapolis vs generalize)

| check | result |
|-------|--------|
| answered via logic? | no |
| answered via docs? | YES — wish says "search the indianpolis marion county database" |
| needs research? | no |
| wisher knows? | answered in wish |

**triage**: [answered] ✓

### Q4: API access (Accela partnership vs scrape)

| check | result |
|-------|--------|
| answered via logic? | no |
| answered via docs? | no |
| needs research? | YES — need to evaluate ToS, reliability, effort |
| wisher knows? | no (technical decision) |

**triage**: [research] ✓

### research: state code access

| check | result |
|-------|--------|
| answered via logic? | no |
| answered via docs? | no |
| needs research? | YES — state-by-state evaluation needed |
| wisher knows? | no |

**triage**: [research] ✓

### research: permit APIs

| check | result |
|-------|--------|
| answered via logic? | no |
| answered via docs? | no |
| needs research? | YES — jurisdiction-by-jurisdiction evaluation |
| wisher knows? | no |

**triage**: [research] ✓

### research: work type taxonomy

| check | result |
|-------|--------|
| answered via logic? | no |
| answered via docs? | no |
| needs research? | YES — NLP approach requires evaluation |
| wisher knows? | no |

**triage**: [research] ✓

---

## why the rest holds

### Q2: geography — US only

**status**: [answered] — US only per wish

**why it holds**: the wish explicitly says "any postal & service in the usa." no ambiguity. no hidden assumption. the scope is stated.

### research: state code access

**status**: [research]

**why it holds**: legitimately unknown. some states use ICC paywall, others publish freely. this affects generalization but not Indianapolis MVP. deferred to research phase is correct.

### research: permit APIs

**status**: [research]

**why it holds**: legitimately unknown. different jurisdictions have different systems. but now contingent on whether permit.search is in scope. if deferred, this research is lower priority.

---

## changes made to vision

| section | change | why |
|---------|--------|-----|
| proof chain contract | added `work_interpreted` | users verify we understood their intent |
| proof chain contract | added `structure_type` | users see which code applies |
| example output | shows work interpretation with confidence | transparency on NLP step |
| Q1 status | [wisher] → [answered] | answerable from parcel data |
| Q3 status | kept [answered] | permit.search is core per wish |
| Q4 status | kept [research] | still need to evaluate access methods |
| "what is awkward" | added structure type determination | new complexity surfaced |
| "what is awkward" | expanded work type taxonomy | NLP risk articulated |

---

## holds because

- issue 1: found real problem (Q1 wrongly triaged), fixed with vision update
- issue 2: found my own mistake (wrongly questioned permit.search scope), corrected by re-reading wish
- issue 3: found real problem (research items lacked risk frame), fixed with vision update
- all questions now use allowed statuses: [answered], [research], or [wisher]
- vision reflects deeper grasp — proof chain now shows work interpretation and structure type
