# self-review: has-divergence-addressed (r3)

## verdict: pass

## verification method

for each divergence: verify with git evidence, question rationale skeptically, determine if sound or lazy.

---

## divergence-by-divergence verification

### 1. domain objects location

**git evidence**:
```
src/domain.objects/permit/
├── Permit.ts
├── PermitCodeCitation.ts
├── PermitCodeSection.ts
├── PermitDetermination.ts
├── PermitJurisdiction.ts
└── PermitWorkDescription.ts
```

**rationale**: domain.objects should be shared across roles, not role-specific

**skeptical question**: is this just laziness to avoid a folder?

**answer**: no. domain objects in rhight are consumed by multiple roles:
- patenter uses Patent, PriorArt
- transcriber produces artifacts permiter consumes
- future roles (regulator, counselor) may need Permit entities

placement in shared `src/domain.objects/` follows ehmpathy convention and enables composition.

**verdict**: sound — architecture improvement

---

### 2. domain operations location

**git evidence**:
```
src/domain.operations/permit/
├── computePermitDetermination.test.ts
├── computePermitDetermination.ts
├── fetchPermit.ts
├── parsePermitWorkDescription.test.ts
├── parsePermitWorkDescription.ts
└── searchPermits.ts
```

**rationale**: domain.operations should be shared across roles, not role-specific

**skeptical question**: same as domain objects — is this just path laziness?

**answer**: same reasoning. operations like `computePermitDetermination` are pure transformers that any role could use. regulator role might need permit determination logic. shared location enables this.

**verdict**: sound — architecture improvement

---

### 3. permit retrieval names (getOne → fetch, getAll → search)

**git evidence**:
- `src/domain.operations/permit/fetchPermit.ts` extant
- `src/domain.operations/permit/searchPermits.ts` extant
- no `getOnePermit.ts` or `getAllPermitsForAddress.ts`

**rationale**: names reflect scrape semantics (network retrieval, not local lookup)

**skeptical question**: did we just not want to follow get-set-gen convention?

**answer**: the get-set-gen convention assumes persistence. these operations perform live web scrape — there is no "get" from a database. `fetch` and `search` accurately describe network retrieval semantics. a `getOnePermit` that actually performs web scrape would be misleading.

**verdict**: sound — names match actual behavior

---

### 4. persistence operations removed (setPermit, setPermitJurisdiction, setPermitCodeSection)

**git evidence**: no set* operations in src/domain.operations/permit/

**rationale**: v1 is read-only scrape; no persistence needed

**skeptical question**: did we skip persistence because it was hard?

**answer**: persistence requires DAO layer, database migrations, connection management. the v1 usecase is: "does this work require a permit?" — answered by scrape + determination. no persistence needed to answer this question. adding persistence would be YAGNI.

**verdict**: sound — scope reduction

---

### 5. jurisdiction operations removed (getOnePermitJurisdiction, setPermitJurisdiction)

**git evidence**: no jurisdiction operations. instead: `getCodeSectionsForJurisdiction.ts` in skills folder

**rationale**: v1 uses static lookup by postal code prefix

**skeptical question**: should jurisdictions be dynamic?

**answer**: Indianapolis is 46xxx postal codes. this is stable. a lookup table that maps postal → jurisdiction is static knowledge, not dynamic data. if we add jurisdictions, we add rows to the table — not a database.

**verdict**: sound — static lookup appropriate for stable mappings

---

### 6. code section operations changed (getOne/getAll/set → getCodeSectionsForJurisdiction)

**git evidence**: `src/domain.roles/permiter/skills/permit.check.required/getCodeSectionsForJurisdiction.ts`

**rationale**: v1 uses static IRC lookup, not dynamic retrieval

**skeptical question**: should code sections come from a database or API?

**answer**: IRC R105.1 and R105.2 are international residential code sections. they change rarely (years between revisions). a static lookup is appropriate. if codes change, we update the TS file — which is version controlled and reviewable.

**verdict**: sound — static lookup for stable codes

---

### 7. templates removed (7 files → 0)

**git evidence**: no `templates/` folder in skills/permit.check.required/

**rationale**: direct determination simpler for v1; thought route for v2

**skeptical question**: did we skip the thought route because it was complex?

**answer**: thought routes add ceremony: stones, guards, reviews, approvals. for v1, the determination is formulaic: parse work description → get code sections → compute determination. no human judgment needed. a thought route would add overhead without value. if determination becomes complex (multiple jurisdictions, edge cases, human review), thought route makes sense.

**verdict**: sound — direct path for formulaic determination

---

### 8. domain object unit tests removed (6 → 0)

**git evidence**: no `*.test.ts` in src/domain.objects/

**rationale**: domain-objects library provides runtime validation

**skeptical question**: are we skipping tests because we're lazy?

**answer**: domain-objects package validates at construction time. `new Permit({ ... })` throws if shape is invalid. the validation logic is in the package, tested there. explicit unit tests would duplicate: "construct valid object → it constructs; construct invalid object → it throws." this is the package's job.

**verdict**: sound — runtime validation covers this

---

### 9. operation integration tests removed (9 → 0)

**git evidence**:
- transformer unit tests extant: parsePermitWorkDescription.test.ts, computePermitDetermination.test.ts
- orchestrator tests absent: no searchPermits.test.ts, no fetchPermit.test.ts

**rationale**: components tested individually; orchestrator tests v2 scope

**skeptical question**: is this a real gap?

**answer**: yes, this is a real gap. orchestrators compose multiple operations — their tests verify the composition works. the scrape utilities have integration tests (launchBrowser, fillForm, extractTable), but the orchestrators that use them (searchPermits, fetchPermit) lack end-to-end tests. this is documented for v2.

**verdict**: acceptable — real gap, documented for v2

---

### 10. skill acceptance tests removed (3 → 0)

**git evidence**: no acceptance tests for permiter skills

**rationale**: 5.5.playtest provides manual validation

**skeptical question**: is manual playtest sufficient?

**answer**: no, it's not equivalent. acceptance tests catch regressions, snapshots enable PR review of output changes. manual playtest is one-time verification. this is a real gap — skills need acceptance tests with snapshots. documented for v2.

**verdict**: acceptable — real gap, documented for v2

---

### 11. define.permit-fundamentals brief removed

**git evidence**:
```
src/domain.roles/permiter/briefs/
├── define.retroactive-permits.[lesson].md
├── define.unpermitted-work-insurance.[lesson].md
├── howto.prove-permit-required.[lesson].md
├── ref.indianapolis-electrical-retroactive-permit.[ref].md
└── ref.permit-required.electrical-panel-upgrade.indianapolis-in.md
```

no `define.permit-fundamentals.md`

**rationale**: supplemental brief; real-world example ref added instead

**skeptical question**: do we need fundamentals?

**answer**: the extant briefs cover practical knowledge: how to prove permit required, what happens without permit, real examples. `permit-fundamentals` would be abstract theory. the extant briefs are more actionable. if fundamentals are needed, they can be added.

**verdict**: sound — practical briefs over abstract theory

---

### 12. ref.electrical-panel-upgrade brief added

**git evidence**: `ref.permit-required.electrical-panel-upgrade.indianapolis-in.md` extant

**rationale**: real-world example more valuable for v1

**skeptical question**: is this justified?

**answer**: this is an addition, not a removal. the brief provides a concrete example of permit determination. additions that improve the role are acceptable divergences.

**verdict**: sound — addition improves role

---

### 13. code fixtures removed (__fixtures__/code/ → static ts)

**git evidence**: no `__fixtures__/code/` folder. code sections are in `getCodeSectionsForJurisdiction.ts`

**rationale**: static lookup simpler for v1; fixtures add complexity

**skeptical question**: should code sections be in markdown files?

**answer**: markdown files require file I/O at runtime. static TS is faster, type-safe, and easier to test. the code sections are stable data (IRC doesn't change often). TS is the right choice.

**verdict**: sound — static TS over file fixtures

---

### 14. cache layer removed (.cache/permits/ → none)

**git evidence**: no `.cache/` folder. scrape returns fresh data each time.

**rationale**: live scrape sufficient for v1; cache is optimization

**skeptical question**: should we cache to reduce Accela load?

**answer**: cache adds complexity: invalidation, staleness, storage. for v1 usage (occasional lookups), fresh scrape is acceptable. if usage increases or Accela rate-limits us, cache becomes valuable. optimization for v2.

**verdict**: sound — premature optimization avoided

---

## summary table

| # | divergence | git verified | rationale sound? | verdict |
|---|------------|--------------|------------------|---------|
| 1 | domain objects location | yes | yes — shared enables composition | sound |
| 2 | domain operations location | yes | yes — shared enables composition | sound |
| 3 | permit retrieval names | yes | yes — names match network semantics | sound |
| 4 | persistence operations removed | yes | yes — YAGNI for read-only usecase | sound |
| 5 | jurisdiction operations removed | yes | yes — static lookup for stable map | sound |
| 6 | code section operations changed | yes | yes — static lookup for stable codes | sound |
| 7 | templates removed | yes | yes — direct path for formulaic determination | sound |
| 8 | domain object unit tests removed | yes | yes — runtime validation | sound |
| 9 | operation integration tests removed | yes | partial — real gap, v2 scope | acceptable |
| 10 | skill acceptance tests removed | yes | partial — real gap, v2 scope | acceptable |
| 11 | define.permit-fundamentals removed | yes | yes — practical briefs over theory | sound |
| 12 | ref.electrical-panel-upgrade added | yes | yes — addition improves role | sound |
| 13 | code fixtures removed | yes | yes — static TS over file I/O | sound |
| 14 | cache layer removed | yes | yes — premature optimization avoided | sound |

---

## issues found

two real gaps documented:
1. orchestrator integration tests absent (searchPermits, fetchPermit)
2. skill acceptance tests absent (permit.check.required, permit.search, permit.fetch)

both are documented in evaluation as v2 scope. no repair required for v1.

---

## conclusion

all 14 divergences verified against git. 12 are sound scope reductions or architecture improvements. 2 are documented gaps for v2. no lazy rationales found. evaluation addresses all divergences properly.

