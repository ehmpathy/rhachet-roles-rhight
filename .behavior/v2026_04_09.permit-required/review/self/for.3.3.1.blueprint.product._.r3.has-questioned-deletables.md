# self-review: has-questioned-deletables (round 3)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: the delete test

### the question

"if we deleted this and had to add it back, would we?"

### domain objects: apply delete test

**Permit** — if deleted:
- permit.search has no return type
- permit.fetch has no return type
- **would add back**: yes, core to both skills

**Jurisdiction** — if deleted:
- proof chain loses jurisdiction adoption
- can't show which local code applies
- **would add back**: yes, vision requires jurisdiction citation

**CodeSection** — if deleted:
- can't store verbatim code text
- proof chain loses exact language
- **would add back**: yes, vision requires exact citations

**PermitDetermination** — if deleted:
- permit.check.required has no structured output
- criteria requires determination outcomes
- **would add back**: yes, criteria defines this

**WorkDescription** — if deleted:
- lose work interpretation audit trail
- can't show how "panel upgrade" → "replace electrical service"
- **would add back**: yes, criteria requires work mapped to code terms

**CodeCitation** — if deleted:
- proof chain loses per-section verbatim + applies + reason
- could inline into PermitDetermination
- **would add back**: questionable — could simplify

### one candidate for deletion

**CodeCitation as separate literal** — currently:

```
CodeCitation = {
  codeRef: Ref<CodeSection>,
  verbatim: string,
  applies: boolean,
  reason: string
}
```

**alternative**: inline into PermitDetermination:

```
PermitDetermination = {
  determination: 'required' | 'not-required' | 'unclear',
  baselineCitations: { section: Ref<CodeSection>, verbatim: string, applies: boolean, reason: string }[],
  exemptionCitations: { section: Ref<CodeSection>, verbatim: string, applies: boolean, reason: string }[],
  jurisdictionUsed: Ref<Jurisdiction>
}
```

**decision**: keep CodeCitation separate.

**why**:
1. citations are reused — same CodeSection may appear in multiple determinations
2. citations have their own lifecycle — can be validated independently
3. separation enables composition — proof chain is a collection of citations
4. domain-objects pattern prefers explicit literals over inline shapes

the separate literal adds clarity, not complexity.

### operations: apply delete test

**set* operations** — if deleted:
- scrape module has nowhere to write
- every request hits portal
- no auditability of what data was used
- **would add back**: yes, cache is essential

**parseWorkDescription** — if deleted:
- work interpretation happens inline somewhere
- no audit trail of how we understood user input
- **would add back**: yes, high-stakes interpretation deserves its own operation

**computeDetermination** — if deleted:
- determination logic scattered
- harder to test independently
- **would add back**: yes, core business logic

### files: apply delete test

**output.sh** — if deleted:
- treestruct format inline in each skill
- duplication of output code
- **would add back**: yes, DRY for output format

**__fixtures__/permits/** — if deleted:
- tests require live portal
- tests become flaky
- **would add back**: yes, deterministic tests need fixtures

---

## conclusion

all components pass the delete test. the one marginal candidate (CodeCitation as separate literal) holds on deeper analysis — it enables composition and independent validation. the blueprint is minimal for what the vision requires.

