# self-review: has-consistent-conventions (r4)

## verdict: pass

## the question

> do we diverge from extant names and patterns?

## my reflection

i paused. i slowed down. i re-read the guide.

the guide asks me to examine actual code and compare against extant conventions.

## deeper analysis (updated 2026-04-11)

read actual operation files. examined internal patterns.

**key context**: goal 1 is DONE. goal 2 is BLOCKED with stubs.

### parsePermitWorkDescription.ts — internal patterns

```typescript
const WORK_TYPE_KEYWORDS: Record<PermitWorkType, string[]> = {
  electrical: ['electrical', 'wire', 'outlet', 'panel', 'circuit', ...],
  plumb: ['plumb', 'pipe', 'drain', 'water heater', ...],
  hvac: ['hvac', 'furnace', 'ac', ...],
  ...
};
```

observations:
- constant name: `WORK_TYPE_KEYWORDS` — SCREAMING_SNAKE for module-level constant
- type annotation: `Record<PermitWorkType, string[]>` — explicit type declaration
- key names: lowercase work types that match enum values
- array values: lowercase keywords for case-insensitive match

this follows ehmpathy conventions:
- SCREAMING_SNAKE for constants (per rule.prefer.lowercase exceptions)
- explicit types over inference for public contracts

### getCodeSectionsForJurisdiction.ts — return shape

```typescript
export const getCodeSectionsForJurisdiction = (input: {
  jurisdictionSlug: string;
}): PermitCodeSection[] => {
  if (input.jurisdictionSlug === 'indianapolis-in') {
    return [
      new PermitCodeSection({ codeRef: 'IRC R105.1', ... }),
      new PermitCodeSection({ codeRef: 'IRC R105.2', ... }),
      new PermitCodeSection({ codeRef: 'Marion County Code 536-201', ... }),
    ];
  }
  return [];
};
```

observations:
- function name: `getCodeSectionsForJurisdiction` — get prefix, plural return
- input pattern: `(input: { jurisdictionSlug: string })` — named input object
- return type: `PermitCodeSection[]` — domain object array
- slug format: `indianapolis-in` — kebab-case for slugs

matches established patterns:
- get* for retrieval (per rule.require.get-set-gen-verbs)
- input-context pattern (per rule.require.input-context-pattern)
- kebab-case slugs (per ubiqlang conventions)

### comparison with patenter operations

| aspect | patenter | permiter |
|--------|----------|----------|
| get operations | `getPatentByExid` | `getCodeSectionsForJurisdiction` |
| parse operations | `parsePatentClaims` | `parsePermitWorkDescription` |
| compute operations | `computePriorArtRelevance` | `computePermitDetermination` |
| constants | `CLAIM_TYPE_PATTERNS` | `WORK_TYPE_KEYWORDS` |

parallel structure confirms consistency.

### domain object field names

examined Permit.ts fields:
- `permitNumber` — camelCase, domain term
- `jurisdictionSlug` — camelCase, slug suffix indicates format
- `type`, `status`, `date` — simple domain terms

examined PermitCodeSection.ts fields:
- `codeRef` — camelCase, Ref suffix for reference
- `title`, `text` — simple terms

all follow camelCase convention for properties.

### shell flag conventions revisited

from permit.search.sh (verified via prior read):
- `--work` — describes work
- `--postal` — postal code
- `--address` — address
- `--format` — output format

all kebab-case, consistent with shell conventions.

## why each convention holds

### 1. operation names (get/set/gen/compute/parse)

| operation | convention | why it holds |
|-----------|------------|--------------|
| `parsePermitWorkDescription` | parse* | transforms string → domain object |
| `computePermitDetermination` | compute* | derives result from inputs, pure |
| `getCodeSectionsForJurisdiction` | get* | retrieves data, no side effects |
| `searchPermits` (stub) | search* | parallel to patenter search* |
| `fetchPermit` (stub) | fetch* | parallel to patenter fetch* |

**why it holds**: verbs match semantics. parse transforms, compute derives, get retrieves.

### 2. constant names (SCREAMING_SNAKE)

```typescript
WORK_TYPE_KEYWORDS  // module-level constant
```

**why it holds**: SCREAMING_SNAKE distinguishes constants from variables. this is the ehmpathy exception to rule.prefer.lowercase.

### 3. property names (camelCase)

```typescript
permitNumber, jurisdictionSlug, codeRef
```

**why it holds**: camelCase is the typescript convention for properties. domain-objects library uses camelCase throughout.

### 4. slug values (kebab-case)

```typescript
'indianapolis-in'
```

**why it holds**: kebab-case slugs are URL-safe and readable. this matches the ubiqlang convention for slugs across ehmpathy repos.

### 5. shell flags (kebab-case)

```bash
--work, --postal, --address, --format
```

**why it holds**: kebab-case is the POSIX convention for long flags. all ehmpathy shell skills use this convention.

### 6. input-context pattern

```typescript
(input: { jurisdictionSlug: string }): PermitCodeSection[]
```

**why it holds**: named input object enables clear contracts, easy refactors, and matches rule.require.input-context-pattern.

## conclusion

no deviations found. each convention has a clear rationale grounded in ehmpathy practices and domain-objects library patterns.
