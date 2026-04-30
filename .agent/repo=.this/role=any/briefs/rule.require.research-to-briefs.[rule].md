# rule.require.research-to-briefs

## .what

research must be externalized to briefs immediately. document first, explain after.

## .why

- research is expensive (tokens, time, human attention)
- ephemeral research = wasted research
- citations decay (URLs change, pages disappear)
- context windows compress (knowledge lost)
- future sessions start from zero without briefs

**the cost:**
- re-research = 2x tokens
- lost citations = unverifiable claims
- ephemeral answers = no institutional memory

## .the rule

| phase | action |
|-------|--------|
| **as you research** | write briefs as you go |
| **after research** | verify briefs exist before response |
| **response** | reference briefs, don't repeat content |

### document first, explain after

```
WRONG: research → explain to human → (maybe) write brief later
RIGHT: research → write brief → reference brief in response
```

### no ephemeral research

| ephemeral (forbidden) | durable (required) |
|-----------------------|-------------------|
| answer with citations inline | brief with citations, reference in answer |
| explain results verbally | brief with results, summarize in answer |
| promise to "create brief later" | create brief NOW |

## .brief granularity

### maximally granular per concept

| granularity | example |
|-------------|---------|
| **too broad** | `ref.builders-insurance.[ref].md` (all in one file) |
| **correct** | `ref.builders-insurance.providers.steadily.[ref].md` (one provider) |
| **correct** | `ref.builders-insurance.claim-denial-gotchas.[ref].md` (one topic) |
| **correct** | `ref.builders-insurance.premium.owner-builder.[ref].md` (one aspect) |

### why granular?

- findable: grep finds specific concepts
- composable: boot.yml can include/exclude per topic
- maintainable: update one concept without modify others
- cross-referenceable: link between related briefs

### cross-reference pattern

```markdown
## .see also

- [ref.builders-insurance.providers.indianapolis-in](./ref.builders-insurance.providers.indianapolis-in.[ref].md)
- [ref.builders-insurance.claim-denial-gotchas](./ref.builders-insurance.claim-denial-gotchas.[ref].md)
```

## .citation preservation

### every factual claim needs

| element | required |
|---------|----------|
| source URL | YES |
| verbatim quote | YES (for key claims) |
| fetch date | YES |
| verification method | YES (WebFetch, not WebSearch) |

### citation format

```markdown
From [Source Name](https://url.com/page):
> "verbatim quote from source"

— WebFetch verified 2026-04-29
```

## .workflow

### when research starts

1. identify concepts that will need briefs
2. create brief files immediately (even if empty)
3. populate as you research
4. add to boot.yml when complete

### when research completes

1. verify all results are in briefs
2. verify all citations are preserved
3. verify cross-references exist
4. THEN respond to human

### response pattern

```markdown
Created `ref.topic-name.[ref].md` with:
- result 1
- result 2
- [n] citations preserved

See brief for details.
```

NOT:

```markdown
Here's what I found:
[500 lines of research that will be lost on context compression]
```

## .enforcement

| violation | severity |
|-----------|----------|
| research without brief | **BLOCKER** |
| brief promised but not created | **BLOCKER** |
| citations in response but not in brief | **BLOCKER** |
| monolithic brief (multiple concepts) | nitpick |
| brief without cross-references | nitpick |

## .exceptions

| exception | when allowed |
|-----------|--------------|
| trivial lookup | single fact, no citations needed |
| clarification | human asks "what did you mean" |
| error correction | correct prior mistake |

## .mantra

> tokens spent on ephemeral research are tokens wasted.
> document first, explain after.
> briefs are institutional memory.
