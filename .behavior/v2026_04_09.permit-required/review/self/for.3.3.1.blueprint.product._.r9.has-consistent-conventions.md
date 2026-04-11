# self-review: has-consistent-conventions (round 9)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: subtle name choices

### 1. permit type values

**blueprint declares**:
```
type: 'electrical' | 'plumb' | 'mechanical' | 'build'
```

**observation**: `plumb` and `build` are truncated forms. IRC code sections use full trade names.

**analysis**:
- IRC R103.6 refers to "plumb trades" in some contexts
- but permit categories are typically the full trade noun
- `plumb` as adjective ("plumb line") differs from the trade category

**verdict**: the blueprint uses short forms (`plumb`, `build`) which diverge from standard permit nomenclature. however, this is a domain vocabulary choice, not a code convention issue.

**recommendation**: defer to domain research. check how Indianapolis portal labels permit types. use their exact terms.

### 2. address vs postal in skill args

**blueprint declares**:
```
permit.search.sh --address, --postal, --since?, --until?, --limit?
getAllPermitsForAddress({ address, postal?, ... })
```

**observation**: both `address` and `postal` used. are these distinct?

**analysis**:
- address = street address (e.g., "123 Main St")
- postal = postal code (e.g., "46201")
- together they locate permits

**verdict**: consistent. address + postal are complementary, not synonyms.

### 3. findsert vs gen verb

**extant convention**: `gen*` for find-or-create operations

**blueprint uses**: `setPermit({ findsert: ... })` — findsert as input shape

**analysis**: `setPermit` with findsert input is consistent with declastruct pattern (see `rule.prefer.declastruct.[demo].md`). `gen*` is for orchestration, not set operations.

**verdict**: consistent with declastruct pattern.

### 4. transformer name prefix

**extant convention**: `compute*` for deterministic transformers

**blueprint uses**:
- `parseWorkDescription` — parse prefix
- `computeDetermination` — compute prefix

**analysis**: `parse*` is appropriate for string → structured data. `compute*` is appropriate for structured data → result.

**verdict**: consistent with transformer name conventions.

---

## issue summary

| item | status | action |
|------|--------|--------|
| permit type values | **open question** | defer to portal terminology |
| address vs postal | holds | distinct and complementary |
| findsert pattern | holds | declastruct convention |
| transformer prefixes | holds | parse vs compute appropriate |

---

## open question documented

the permit type enum values (`plumb`, `build`) may need update based on Indianapolis portal terminology. this is a domain vocabulary question, not a code convention issue. defer to research phase for exact terms.

