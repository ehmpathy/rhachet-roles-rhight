# self-review: has-role-standards-adherance (round 11)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## briefs directories to check

enumerated from mechanic boot:

| directory | relevance |
|-----------|-----------|
| practices/code.prod/evolvable.architecture/ | bounded contexts, directional deps |
| practices/code.prod/evolvable.domain.objects/ | domain-objects pattern |
| practices/code.prod/evolvable.domain.operations/ | get/set/gen verbs |
| practices/code.prod/evolvable.procedures/ | input-context, arrow-only |
| practices/code.prod/pitofsuccess.errors/ | failfast, exit codes |
| practices/code.test/ | test coverage requirements |
| practices/lang.terms/ | ubiqlang, treestruct |
| practices/lang.tones/ | lowercase, no shouts |

---

## standards verification

### evolvable.domain.objects

**rule.require.domain-driven-design**: use domain-objects for model

**blueprint**: declares entities (Permit, Jurisdiction, CodeSection) and literals (PermitDetermination, WorkDescription, CodeCitation)

**holds because**: clear separation between entities (with unique keys) and literals (immutable value objects). Permit has `unique: ['permitNumber', 'jurisdiction']`, Jurisdiction has `unique: ['slug']`.

---

### evolvable.domain.operations

**rule.require.get-set-gen-verbs**: operations use get, set, or gen

**blueprint operations**:
- getOnePermit ✓
- getAllPermitsForAddress ✓
- setPermit ✓
- getOneJurisdiction ✓
- setJurisdiction ✓
- getOneCodeSection ✓
- getAllCodeSectionsForCategory ✓
- setCodeSection ✓
- parseWorkDescription (transformer, exempt) ✓
- computeDetermination (transformer, exempt) ✓

**holds because**: all data operations follow get/set pattern. transformers (parse*, compute*) are exempt per define.domain-operation-core-variants.

---

### evolvable.procedures

**rule.require.input-context-pattern**: procedures accept (input, context?)

**blueprint operations**: all show `input: { ... }` shape

**holds because**: blueprint declares inputs as objects, not positional args.

---

### evolvable.architecture

**rule.require.bounded-contexts**: domain owns logic, models, procedures

**blueprint structure**:
```
src/domain.roles/permiter/
├── domain.objects/
├── domain.operations/
└── skills/
```

**holds because**: permiter owns its domain layer; no cross-domain imports declared.

---

**rule.require.directional-deps**: top-down dependency flow

**blueprint**:
- skills/ depends on domain.operations/
- domain.operations/ depends on domain.objects/
- domain.objects/ is self-contained

**holds because**: dependency direction flows downward.

---

### pitofsuccess.errors

**rule.require.exit-code-semantics**: exit 0=success, 1=malfunction, 2=constraint

**blueprint skill contracts**: no explicit exit codes shown

**potential gap**: skill contracts do not explicitly mention exit code semantics

**assessment**: nitpick — exit codes are implementation detail, will be addressed at execution phase when skills are written

---

### code.test

**rule.require.test-coverage-by-grain**: tests match operation grain

**blueprint test tree (lines 234-272)**:
- domain.objects/ → unit tests ✓
- transformers → unit tests ✓
- operations → integration tests ✓
- skills → integration tests ✓
- contracts → acceptance tests + snapshots ✓

**holds because**: test pyramid shape follows grain requirements.

---

### lang.terms

**rule.require.treestruct**: [verb][...noun] for mechanisms

**blueprint operations**: getOnePermit, setJurisdiction, parseWorkDescription

**holds because**: verb leads, noun follows.

---

**rule.require.ubiqlang**: consistent domain vocabulary

**blueprint terms**:
- Permit (not "license")
- Jurisdiction (not "locality")
- CodeSection (not "statute")
- determination (not "verdict")

**holds because**: terms are consistent throughout.

---

### lang.tones

**rule.prefer.lowercase**: lowercase in comments

**blueprint**: uses lowercase throughout

**holds because**: no capitalized generic nouns.

---

## summary

| standard | status |
|----------|--------|
| domain-objects pattern | ✓ holds |
| get-set-gen verbs | ✓ holds |
| input-context pattern | ✓ holds |
| bounded contexts | ✓ holds |
| directional deps | ✓ holds |
| exit code semantics | nitpick (deferred to implementation) |
| test coverage by grain | ✓ holds |
| treestruct name convention | ✓ holds |
| ubiqlang | ✓ holds |
| lowercase tone | ✓ holds |

no blockers found. one nitpick deferred to execution phase.

