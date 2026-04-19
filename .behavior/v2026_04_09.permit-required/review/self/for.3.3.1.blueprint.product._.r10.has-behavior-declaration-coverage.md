# self-review: has-behavior-declaration-coverage (round 10)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: line-by-line verification

### gap found: 'conditional' determination outcome

**criteria line 34**:
```
then(determination is one of: required | not_required | conditional | unclear)
```

**criteria lines 53-56**:
```
given(work matches an exemption with conditions)
  when(condition cannot be verified from input)
    then(determination = conditional)
    then(condition field explains what determines applicability)
```

**blueprint line 113**:
```
determination: 'required' | 'not-required' | 'unclear'
```

**issue**: blueprint is absent `conditional` as a determination outcome. criteria explicitly requires it for exemptions with conditions (e.g., "exempt if less than 200 sq ft").

**fix required**: add `conditional` to PermitDetermination.determination enum:
```
determination: 'required' | 'not-required' | 'conditional' | 'unclear'
```

### edge cases coverage check

**vision lines 419-425 edgecases**:

| edgecase | required behavior | blueprint coverage |
|----------|-------------------|-------------------|
| postal spans multiple jurisdictions | warn user, list all | Jurisdiction lookup returns multiple | ✓ implied |
| code not found online | cite as "not publicly available" | CodeSection.verbatim can be null + source | ✓ implied |
| work description ambiguous | ask for clarification | parseWorkDescription → category=unknown | ✓ covered |
| exemption is conditional | include full conditional text | **needs conditional determination** | ⚠️ gap |

### stone workflow coverage

**vision lines 159-171 stone workflow**:

| stone | purpose | blueprint coverage |
|-------|---------|-------------------|
| 0.query | capture postal + work | templates/0.query.md | ✓ |
| 1.vision | define what to prove | templates/1.vision.stone | ✓ |
| 3.1.research.work-interpretation | map to code terms | not in template list | ⚠️ gap |
| 3.1.research.code.baseline | R105.1 | templates/3.1.research.code.baseline.stone | ✓ |
| 3.1.research.code.exemptions | R105.2 | templates/3.1.research.code.exemptions.stone | ✓ |
| 3.1.research.jurisdiction.state | state adoption | not explicitly separated | ⚠️ possible gap |
| 3.1.research.jurisdiction.local | local amendments | not explicitly separated | ⚠️ possible gap |
| 3.2.distill.proof-chain | assemble proof | templates/3.2.distill.determination.stone | ✓ |
| 5.1.deliver.diagnosis | full analysis | templates/5.1.deliver.diagnosis.stone | ✓ |
| 5.3.deliver.coverpage | summary | templates/5.3.deliver.coverpage.stone | ✓ |

**observation**: vision shows more detailed stone breakdown than blueprint templates. blueprint may need:
- 3.1.research.work-interpretation.stone
- separate jurisdiction.state and jurisdiction.local stones

---

## issues summary

| issue | severity | action |
|-------|----------|--------|
| `conditional` absent from determination enum | **blocker** | add to PermitDetermination |
| work-interpretation stone not listed | nitpick | may be implicit in determination.stone |
| jurisdiction stones not separated | nitpick | may be acceptable simplification |

---

## fix applied ✓

**blueprint PermitDetermination updated**:
```
├── [+] PermitDetermination (literal)
│   ├─ determination: 'required' | 'not-required' | 'conditional' | 'unclear'
│   └─ baseline, exemptionsChecked, jurisdictionUsed, condition
```

- added `conditional` to determination enum (criteria line 34)
- added `condition` field to store conditional text (criteria line 56)

---

## conclusion

found and fixed one blocker:
- `conditional` determination outcome was absent from blueprint
- now matches criteria line 34 exactly

blueprint updated. review complete.

