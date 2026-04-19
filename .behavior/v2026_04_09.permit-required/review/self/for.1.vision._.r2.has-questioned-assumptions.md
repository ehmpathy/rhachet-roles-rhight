# review: has-questioned-assumptions (r2)

## reviewed: 1.vision.yield.md vs 0.wish.md

read both documents line by line. compared what wisher SAID vs what vision ASSUMED.

---

## ISSUE FOUND: scope assumed "residential only"

**vision line 196**: "scope: residential only, or commercial too? — start residential (IRC)"

**wisher said (line 8)**: "residential or commercial service"

**analysis**:
- wisher explicitly said BOTH residential AND commercial
- vision assumed starting with residential only without wisher validation
- commercial uses IBC (different code structure), but wisher requested both

**what if opposite**: if we only build residential, we fail half the wish requirement.

**verdict**: ISSUE. the vision narrows scope without explicit wisher approval.

**fix needed**: clarify with wisher — is residential-first acceptable, or must v1 cover both?

---

## ISSUE FOUND: output assumed simple boolean

**vision line 42**: `required: boolean`

**wisher said**: "generate answers and revalidate answers"

**analysis**:
- permit requirements can be nuanced: required, not required, conditional, unclear
- boolean forces binary answer when reality has edge cases
- "conditional" (e.g., "required if > 200A") is not captured by boolean

**what if opposite**: what if permit is "required with exemption if..."?

**verdict**: ISSUE. boolean is oversimplification.

**fix needed**: change output to enum: `required | not_required | conditional | unclear`

---

## ISSUE FOUND: usecase 3 (permit.propose) not requested

**vision lines 111-119**: adds third skill `permit.propose`

**wisher said (line 6)**: "create a thought route"

**analysis**:
- wisher mentioned "thought route" — this IS permit.required, not a separate skill
- permit.propose conflates "thought route" with "route with stones"
- adds complexity not in the wish

**what if opposite**: what if wisher just wants permit.required to run the thought route internally?

**verdict**: ISSUE. permit.propose is scope creep.

**fix needed**: remove usecase 3 or clarify it's future scope, not v1.

---

## ISSUE FOUND: timeline estimates have no evidence

**vision lines 122-128**: "< 5 seconds", "30-60 seconds", etc.

**wisher said**: no performance requirements stated

**analysis**:
- these are pure guesses
- presented as facts in the vision
- no benchmarks or evidence cited

**verdict**: ISSUE. unsupported claims.

**fix needed**: mark as "targets (tbd)" not guarantees, or remove.

---

## ISSUE FOUND: "shore up briefs" not addressed

**wisher said (line 10)**: "we'll want to shore up those briefs"

**vision says**: no section on brief improvements

**analysis**:
- wisher explicitly requested brief improvements
- vision omits what briefs need shoring up
- this is a TODO that was ignored

**verdict**: ISSUE. wisher request not addressed.

**fix needed**: add section "brief improvements needed" or note as research item.

---

## assumption that HOLDS: IRC as base code

**vision line 189**: "IRC is the base code for most US jurisdictions"

**evidence**: ICC confirms 49 states + DC adopt IRC/IBC. howto.prove-permit-required brief confirms indiana uses IRC 2018 via Indiana Residential Code 2020.

**wisher said**: "based on legal code" + "related to the briefs already collected"

**what if opposite**: if IRC were not the base code, we'd need a different code hierarchy model. but ICC data confirms IRC/IBC dominance. the opposite is factually false.

**why this holds**: the brief `howto.prove-permit-required.[lesson].md` already establishes R105.1 and R105.2 as the baseline reference. this isn't an assumption — it's domain knowledge we gathered before the vision was written. the vision merely repeats what the research found.

**verdict**: HOLDS. this is domain knowledge from extant briefs.

---

## assumption that HOLDS: verbatim code citations

**vision line 25**: "the value clicks when users see verbatim code text"

**evidence**: howto.prove-permit-required brief says "proof requires verbatim code text, not summaries"

**wisher said**: "based on legal code"

**what if opposite**: if summaries were acceptable, we'd just be another AI that says "you probably need a permit". the differentiator IS the verbatim code. the opposite would erase our value proposition.

**why this holds**: the wisher specifically said "based on legal code" — not "based on advice" or "based on best practices". legal code means the actual text. the brief already established this principle. this is not an assumption but the core value proposition.

**verdict**: HOLDS. established in permiter briefs.

---

## assumption that HOLDS: proof chain structure

**vision lines 43-48**: proof_chain with baseline, exemptions, jurisdiction

**evidence**: howto.prove-permit-required establishes R105.1 (baseline) + R105.2 (exemptions) pattern

**wisher said**: "related to the briefs already collected by the permitter"

**what if opposite**: if we didn't need both baseline AND exemptions, we could just check if work appears in R105.1. but R105.2 exemptions change the answer — some work that triggers R105.1 is explicitly exempted. missing exemptions = wrong answers.

**why this holds**: the worked example in `ref.permit-required.electrical-panel-upgrade.indianapolis-in.md` demonstrates this exact pattern: R105.1 says permit required, R105.2 confirms no exemption, therefore permit required. the proof chain structure mirrors how a human paralegal would research the answer. this is established methodology, not assumption.

**verdict**: HOLDS. this is the methodology from extant research.

---

## assumption that HOLDS: permit.search is Indianapolis-only for v1

**vision lines 92-109**: shows Indianapolis example

**wisher said (line 16)**: "search the indianpolis marion county database"

**evidence**: wisher specifically named Indianapolis, not generalized

**what if opposite**: if we tried to generalize permit.search to all jurisdictions, we'd face API fragmentation (Accela, proprietary systems, no API at all). starting with one jurisdiction lets us prove the pattern before scaling. the wisher explicitly named Indianapolis — they're not asking for nationwide permit search.

**why this holds**: the wish is explicit: "search the indianapolis marion county database". not "search any permit database". starting narrow is correct because the wisher requested it. the vision correctly reflects the wish.

**verdict**: HOLDS. the vision correctly scopes permit.search to Indianapolis.

---

## assumption QUESTIONABLE: postal code as primary input

**vision line 38**: `postal: string (e.g., "46220")`

**wisher said**: "any postal & service in the usa"

**analysis**:
- "for any postal" could mean "any location" not "postal is the input"
- postal codes can span jurisdictions (awkward section acknowledges this)
- address + postal is more precise

**verdict**: QUESTIONABLE. not wrong, but address should be offered as alternative.

---

## summary

| assumption | verdict | action |
|------------|---------|--------|
| residential only scope | ISSUE | clarify with wisher |
| boolean output | ISSUE | change to enum |
| usecase 3 permit.propose | ISSUE | remove or mark future |
| timeline estimates | ISSUE | mark as targets |
| brief improvements | ISSUE | add todo or section |
| IRC as base code | HOLDS | domain knowledge |
| verbatim citations | HOLDS | per briefs |
| proof chain structure | HOLDS | per briefs |
| Indianapolis permit.search | HOLDS | per wish |
| postal as input | QUESTIONABLE | offer address alternative |

---

## reflection

the previous review was surface-level. this deeper review found 5 issues where the vision assumed things the wisher did not say, or narrowed scope without validation.

key insight: the wisher said "residential or commercial" — we cannot assume residential-only is acceptable without asking.

the vision's core design (proof chain, citations, two skills) aligns with the wish and briefs. but implementation details (boolean output, timelines, usecase 3) were invented without evidence.

---

## fixes applied

### ISSUE: boolean output → FIXED

**change**: output type changed from `required: boolean` to `determination: 'required' | 'not_required' | 'conditional' | 'unclear'` with `condition: string | null` field.

**location**: 1.vision.yield.md lines 42-43, and experience output at line 62

### ISSUE: usecase 3 permit.propose → FIXED

**change**: removed usecase 3 entirely. permit.required runs the thought route internally; no separate permit.propose skill.

**location**: 1.vision.yield.md — usecase 3 section deleted

### ISSUE: timeline estimates → FIXED

**change**: header changed from "### timeline" to "### timeline (targets, not guarantees)". specific times replaced with "tbd" where unsupported.

**location**: 1.vision.yield.md line 119, table entries

### ISSUE: briefs not addressed → FIXED

**change**: added "## briefs to shore up" section that lists extant briefs, briefs needed, and research briefs needed.

**location**: 1.vision.yield.md — new section after "research needed"

### ISSUE: residential only scope → PENDING WISHER INPUT

**change**: the vision now derives structure type from parcel data (line 193), which determines IRC vs IBC. this covers both residential and commercial without user self-report. however, wisher should confirm this approach satisfies "residential or commercial service" requirement.

**location**: 1.vision.yield.md line 193 — marked as [resolved] with approach documented

### QUESTIONABLE: postal as input → NOTED

**status**: kept as is. the "what is awkward?" section already acknowledges postal-to-jurisdiction complexity. address is used in permit.search. for permit.required, postal is reasonable as primary input with address as enhancement.

---

## updated summary

| issue | status | resolution |
|-------|--------|------------|
| boolean output | FIXED | enum with condition field |
| usecase 3 permit.propose | FIXED | removed |
| timeline estimates | FIXED | marked as targets |
| briefs not addressed | FIXED | new section added |
| residential only scope | PENDING | needs wisher confirmation |
| postal as input | NOTED | acknowledged in awkward section |
| permit.search deferral | FIXED | wisher clarified: permit.search is core requirement, not deferrable |

---

## what I learned

### lesson 1: read the wish literally

the wisher said "residential or commercial service" — not "start with residential". the vision narrowed scope without asking. this pattern — narrowing scope to simplify implementation — is tempting but dangerous. if scope narrows, ask first.

### lesson 2: boolean is rarely enough

permit requirements are not binary. "required if over 200 amps" is neither true nor false — it's conditional. the enum `required | not_required | conditional | unclear` captures reality better than boolean.

### lesson 3: invented timelines erode trust

"< 5 seconds" sounds professional but is pure fiction without benchmarks. better to say "tbd" than to guess. users who trust false estimates get burned; users who see honest "tbd" know what they're getting.

### lesson 4: the wish mentions it, the vision must address it

wisher said "shore up those briefs" — vision ignored it. every explicit request in the wish must appear in the vision. if the vision doesn't address it, the vision is incomplete.

### lesson 5: features creep in as usecases

permit.propose snuck in as "usecase 3" without wisher request. adding features is easy; removing them later is hard. if the wisher didn't ask for it, question whether it belongs.

### lesson 6: "defer to v2" is often avoidance

the vision suggested deferring permit.search to v2. wisher immediately clarified: it's a core requirement. deferral suggestions should be flagged for wisher review, not assumed.
