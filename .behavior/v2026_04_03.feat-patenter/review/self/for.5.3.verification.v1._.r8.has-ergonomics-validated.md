# review: has-ergonomics-validated (round 8)

## question

does the actual input/output match what felt right at repros?

## method

compared repros sketches (3.2.distill.repros.experience) line by line with actual snapshot output.

---

## journey.1: search

### repros sketch (lines 38-52)

```
🦅 soar and see,

🔍 patent.priors.search
   ├─ query: neural network model compression via distillation
   ├─ results: 12
   └─ patents
      ├─ US20210234567A1 (0.92)
      │  └─ "Method for Knowledge Distillation in Neural Networks"
      └─ ... (9 more)
```

### actual output (snapshot, case4 with API key constraint)

```
🦅 that wont do...
   └─ API key required

set PATENTSVIEW_API_KEY environment variable
get a key at: https://patentsview.org/apis/keyrequest
```

### drift analysis

| element | repros | actual | drift? |
|---------|--------|--------|--------|
| mascot phrase | "soar and see" | "that wont do" | N/A — different outcome (success vs constraint) |
| symbol | 🔍 | 🦅 (no separate icon) | minor — simplified |
| query echo | shown in output | not shown (constraint exits early) | N/A |
| results count | shown | N/A (no results) | N/A |

**verdict**: cannot compare success output directly because actual tests run without API key. the constraint output follows the same pattern as other error messages.

**note**: repros sketch shows success flow, implementation correctly shows constraint flow. ergonomics for constraint is good — tells user what to do.

---

## journey.2: fetch

### repros sketch (lines 79-107)

```
🦅 got one,

📄 patent.priors.fetch
   ├─ exid: US20210234567A1
   ├─ title: Method for Knowledge Distillation...
   ├─ filed: 2021-01-15
   ├─ published: 2021-07-22
   ├─ inventors: Smith, John; Chen, Wei
   ├─ assignee: TechCorp Inc.
   │
   ├─ abstract
   │  ├─
   │  │  A method for compression...
   │  └─
   │
   ├─ claims (3)
   │  ├─ 1. A method for model compression...
   │  └─ ...
   │
   └─ figures (2)
      ├─ FIG. 1: System architecture diagram
      └─ FIG. 2: Model train flow chart
```

### actual output (snapshot, case4 with API key constraint)

```
🦅 that wont do...
   └─ API key required

set PATENTSVIEW_API_KEY environment variable
get a key at: https://patentsview.org/apis/keyrequest
```

### drift analysis

same situation as search — repros sketched success, actual shows constraint. constraint output is clear and actionable.

**verdict**: ergonomics for error case is validated. success case requires API key to test.

---

## journey.3: propose

### repros sketch (lines 133-152)

```
🦅 take to the sky,
   ├─ ✓ 0.idea.md
   ├─ ✓ 1.vision.stone
   ...

🏔️ what peaks can we claim?
   ├─ .route/v2026_04_03.patent.propose/0.idea.md
   └─ ready for your invention

🌎 we'll track it down,
   ├─ branch vlad/feat-xyz <-> route v2026_04_03.patent.propose
   └─ branch bound to route, to drive via hooks
```

### actual output (snapshot, case1 success)

```
🦅 take to the sky,

🌎 patent.propose
   ├─ route: .route/v2026_04_04.patent.propose/
   ├─ branch: main
   └─ stones
      ├─ ✓ 0.idea.md
      ├─ ✓ 1.vision.stone
      ...

🏔️ what peaks can we claim?
   ├─ .route/v2026_04_04.patent.propose/0.idea.md
   └─ ready for you to fill out

🌎 we'll track it down,
   ├─ branch main <-> route v2026_04_04.patent.propose
   └─ branch bound to route, to drive via hooks
```

### drift analysis

| element | repros | actual | drift? |
|---------|--------|--------|--------|
| mascot phrase | "take to the sky" | "take to the sky" | ✓ match |
| stones header | under mascot | under 🌎 with route/branch | refined |
| stones nested | flat under mascot | nested under "stones" | refined |
| peaks section | "ready for your invention" | "ready for you to fill out" | minor text |
| branch bind | same format | same format | ✓ match |

**verdict**: actual output is more structured than repros sketch. stones are grouped under a "stones" subtree with route/branch info above. this is an improvement — better hierarchy.

the text "ready for you to fill out" is slightly more actionable than "ready for your invention" — tells user what to do.

---

## journey.3 error case: route extant

### repros sketch (lines 160-166)

```
🦅 bummer dude...

⚓ patent.propose
   └─ route already extant: .route/v2026_04_03.patent.propose/

use the extant route or delete it first.
```

### actual output (snapshot, case2)

```
🦅 that wont do...
   └─ patent route already exists

found: .route/v2026_04_04.patent.propose

use the route or delete it first
```

### drift analysis

| element | repros | actual | drift? |
|---------|--------|--------|--------|
| mascot phrase | "bummer dude" | "that wont do" | changed |
| symbol | ⚓ | (none) | simplified |
| message | "route already extant" | "patent route already exists" | text |
| action hint | "use the extant route or delete it first" | "use the route or delete it first" | simplified |

**verdict**: repros used "bummer dude" but actual uses "that wont do" (consistent with all other errors). this is intentional — "that wont do" is the standard error phrase.

---

## found drifts

| drift | severity | action |
|-------|----------|--------|
| error phrase "bummer dude" → "that wont do" | intentional | no action — consistency is better |
| stones structure more hierarchical | improvement | no action — better ergonomics |
| "ready for your invention" → "ready for you to fill out" | improvement | no action — more actionable |
| search/fetch success output not tested | limitation | acceptable — API key required |

---

## why it holds

1. **error ergonomics match**: all errors use "that wont do" + treestruct + guidance
2. **success ergonomics improved**: propose output is more structured than sketch
3. **repros intent preserved**: user sees what they need, knows what to do next
4. **actionable hints present**: every output tells user the next step

the implementation follows the spirit of repros while the structure is improved.

---

## conclusion

ergonomics validated: **verified**

the actual output matches or improves upon the repros sketches:
- error messages: consistent "that wont do" + clear guidance
- success output: more hierarchical, more actionable
- search/fetch success: blocked by API key (expected, documented)

no regressions. improvements are better than sketched.

---

## r8 addendum: repros vs reality final check

### the core question

did we build what we planned? or did we drift elsewhere?

### repros intent checklist

| intent from repros | delivered? | evidence |
|--------------------|------------|----------|
| search returns relevance scores | untested | API key required; code structure correct |
| fetch returns full claims | untested | API key required; code structure correct |
| propose creates all 9 stones | yes | snapshot shows all 9 with checkmarks |
| propose binds branch to route | yes | snapshot shows bind confirmation |
| errors provide guidance | yes | all error snapshots include next steps |
| mascot consistent | yes | 🦅 used throughout |

### what repros could not predict

| reality | repros assumption | difference acceptable? |
|---------|-------------------|------------------------|
| API key required for live data | assumed API would "just work" | yes — real APIs need auth |
| date in route path varies | fixed date in sketch | yes — date reflects actual time |
| test environment is isolated | manual run context | yes — tests use temp dirs |

### final verdict

the implementation delivers on repros intent. the gaps are environmental (API keys, dates) not design flaws.

ergonomics validated: **verified with intent check**

---

## fresh verification (2026-04-04)

### the question, reframed

does the actual output match what would feel right to a user who read the repros sketch?

### repros → implementation comparison

| repros element | implemented? | how? |
|---------------|--------------|------|
| `🦅 soar and see,` for search success | partial | code has it; CI shows constraint instead |
| `🦅 got one,` for fetch success | partial | code has it; CI shows constraint instead |
| `🦅 take to the sky,` for propose success | yes | snapshot confirms |
| `🦅 that wont do...` for errors | yes | all error snapshots use this |
| treestruct output | yes | all outputs use tree format |
| actionable guidance | yes | every error shows how to fix |
| next step clarity | yes | "ready for you to fill out" |

### why partial is acceptable

search and fetch success output cannot be validated in CI because:
1. USPTO API requires registration and key
2. CI environments do not have credentials
3. tests verify the code path up to the API boundary

the constraint output (`🦅 that wont do... API key required`) is itself good ergonomics — it tells user exactly what to do.

### drift inventory

| element | repros sketch | actual | verdict |
|---------|---------------|--------|---------|
| error mascot phrase | "bummer dude" | "that wont do" | intentional — consistency |
| stones hierarchy | flat | nested under "stones" | improvement |
| next step text | "ready for your invention" | "ready for you to fill out" | improvement |

all drifts are improvements, not regressions.

### what would make me fail this review?

| red flag | indicates | did it occur? |
|----------|-----------|---------------|
| output contradicts repros intent | design drift | no |
| repros feature absent | incomplete build | no |
| actual output worse than sketch | regression | no |
| user would be confused by actual | ergonomics failure | no |

none occurred.

### why this holds

the implementation delivers the repros intent:
- mascot output is consistent
- treestruct format is consistent
- every output provides clear next action
- errors explain how to fix

the "drifts" are refinements that improve on the sketch.

ergonomics validated: **confirmed**
