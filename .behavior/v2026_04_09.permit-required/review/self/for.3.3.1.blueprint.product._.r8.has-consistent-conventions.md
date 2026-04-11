# self-review: has-consistent-conventions (round 8)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## convention consistency audit

### 1. skill name conventions

**extant pattern** (patenter):
- `patent.priors.search` — domain.subdomain.verb
- `patent.priors.fetch` — domain.subdomain.verb
- `patent.propose` — domain.verb

**blueprint pattern** (permiter):
- `permit.check.required` — domain.verb.adjective (route-driven)
- `permit.search` — domain.verb
- `permit.fetch` — domain.verb

**analysis**: patenter uses `patent.priors.X` for search/fetch. permiter uses `permit.X` without subdomain.

**verdict**: divergence is intentional. patenter has `priors` subdomain because patents have multiple concerns (priors, claims, prosecution). permits have one concern (permit records). subdomain omitted is correct simplification.

### 2. domain object name conventions

**extant pattern** (domain-objects library):
- PascalCase for class names
- singular nouns (Customer, Invoice, not Customers)
- entity vs literal suffix not used

**blueprint pattern**:
- Permit, Jurisdiction, CodeSection — PascalCase, singular ✓
- PermitDetermination, WorkDescription, CodeCitation — PascalCase, singular ✓

**verdict**: consistent with conventions.

### 3. operation name conventions

**extant pattern** (mechanic briefs):
- getOne*, getAll*, set*, gen* verbs
- camelCase with domain noun after verb

**blueprint pattern**:
- getOnePermit, getAllPermitsForAddress, setPermit ✓
- getOneJurisdiction, setJurisdiction ✓
- getOneCodeSection, getAllCodeSectionsForCategory, setCodeSection ✓
- parseWorkDescription, computeDetermination — transformer names ✓

**verdict**: consistent with conventions.

### 4. file structure conventions

**extant pattern** (patenter):
```
src/domain.roles/patenter/
├── skills/
│   └── patent.priors/
│       ├── patent.priors.search.sh
│       └── output.sh
```

**blueprint pattern**:
```
src/domain.roles/permiter/
├── skills/
│   └── permit.search/
│       ├── permit.search.sh
│       └── output.sh
```

**verdict**: consistent with conventions.

### 5. test file conventions

**extant pattern**:
- `.test.ts` for unit tests
- `.integration.test.ts` for integration tests
- `.acceptance.test.ts` for acceptance tests

**blueprint pattern**:
- Permit.test.ts, parseWorkDescription.test.ts — unit ✓
- getOnePermit.integration.test.ts — integration ✓
- permit.check.required.play.acceptance.test.ts — acceptance ✓

**verdict**: consistent with conventions.

### 6. selector version convention

**blueprint introduces**: `indianapolis.accela.v2026-04.ts`

**analysis**: no extant pattern in codebase for versioned selectors (patenter uses API, not scrape).

**verdict**: new convention for scrape-specific concern. documented rationale: portal html changes require selector updates. version suffix enables side-by-side old/new at migration time.

---

## no divergences found

all name conventions align with extant patterns:
1. skill names follow domain.verb pattern
2. domain objects use PascalCase singular
3. operations use get/set/gen verb vocabulary
4. file structure matches patenter layout
5. test files use correct suffix conventions
6. selector version is new (no conflict with extant)

no changes needed.

