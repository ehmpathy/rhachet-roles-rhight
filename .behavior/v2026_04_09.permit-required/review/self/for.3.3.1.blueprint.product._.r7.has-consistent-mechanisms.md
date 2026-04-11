# self-review: has-consistent-mechanisms (round 7)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## mechanism consistency audit

### 1. search/fetch skill pattern

**extant pattern** (patenter):
```
patent.priors.search.sh  → search via API → cache → treestruct output
patent.priors.fetch.sh   → fetch by ID → cache → treestruct output
output.sh                → shared treestruct functions
```

**blueprint pattern** (permiter):
```
permit.search.sh  → scrape portal → cache → treestruct output
permit.fetch.sh   → fetch by ID → cache → treestruct output
output.sh         → shared treestruct functions
```

**verdict**: consistent. same structural pattern, different data source (API vs scrape).

### 2. output.sh format functions

**extant** (patenter/output.sh):
- print_eagle_header, print_tree_start, print_tree_branch
- print_tree_leaf, print_section_header, print_tree_error
- print_alert, print_suggestion, print_blocked, print_progress

**blueprint** (permiter/output.sh):
- same format function pattern planned

**verdict**: consistent. reuses pattern, not code (role-specific functions).

### 3. domain objects

**extant in codebase**: none for permits (new domain)

**blueprint creates**:
- Permit, Jurisdiction, CodeSection — domain-specific
- PermitDetermination, WorkDescription, CodeCitation — analysis artifacts

**verdict**: no duplication. these are new domain objects for a new domain.

### 4. get/set operation pattern

**extant** (domain-objects library + patenter):
- getOne*, getAll*, set* verbs
- integration tests per operation

**blueprint**:
- getOnePermit, getAllPermitsForAddress, setPermit
- getOneJurisdiction, setJurisdiction
- getOneCodeSection, getAllCodeSectionsForCategory, setCodeSection

**verdict**: consistent. uses established verb vocabulary.

### 5. route-driven workflow

**extant** (patent.propose):
- creates route with templates
- drives stones to completion

**blueprint** (permit.check.required):
- creates route with templates
- drives stones to completion

**verdict**: consistent. same route pattern.

---

## potential duplication check

| mechanism | extant? | duplicate? |
|-----------|---------|------------|
| scrape module | no | n/a (new) |
| selector versioned files | no (patenter uses API) | n/a (scrape-specific) |
| parseWorkDescription | no | n/a (new transformer) |
| computeDetermination | no | n/a (new transformer) |
| file-based cache | yes (patenter uses similar) | **reuse pattern** |

**cache pattern**: both patenter and permiter use file-based cache. blueprint follows the same pattern, does not create a new one.

---

## conclusion

all blueprint mechanisms are consistent with extant patterns:
1. search/fetch skill structure matches patenter
2. output.sh format function pattern matches patenter
3. domain objects are new (no duplication possible)
4. get/set verbs follow established conventions
5. route workflow matches patent.propose

no mechanism duplication found. the blueprint extends patterns rather than reinvents them.

