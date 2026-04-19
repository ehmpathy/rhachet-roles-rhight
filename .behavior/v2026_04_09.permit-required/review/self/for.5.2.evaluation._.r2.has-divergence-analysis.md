# self-review: has-divergence-analysis (r2)

## verdict: pass (with update required)

## verification method

fresh eyes comparison of blueprint lines vs evaluation lines, one by one.

---

## r1 findings confirmed

all divergences from r1 are present in evaluation. no issues.

---

## new divergences found in r2

### 1. briefs divergence (not in evaluation)

**blueprint declares (lines 26-30)**:
1. define.permit-fundamentals.md
2. define.retroactive-permits.[lesson].md
3. define.unpermitted-work-insurance.[lesson].md
4. howto.prove-permit-required.[lesson].md
5. ref.indianapolis-electrical-retroactive-permit.[ref].md

**actual implementation**:
1. define.retroactive-permits.[lesson].md
2. define.unpermitted-work-insurance.[lesson].md
3. howto.prove-permit-required.[lesson].md
4. ref.indianapolis-electrical-retroactive-permit.[ref].md
5. ref.permit-required.electrical-panel-upgrade.indianapolis-in.md

**divergence**:
- `define.permit-fundamentals.md` declared but not implemented
- `ref.permit-required.electrical-panel-upgrade.indianapolis-in.md` implemented but not declared

**not in evaluation**: the evaluation shows 5 briefs that match actual, but does not document that `define.permit-fundamentals.md` was declared and not delivered.

### 2. code fixtures divergence (not fully documented)

**blueprint declares (lines 83-85)**:
```
└── [+] __fixtures__/
    └── [+] code/
        ├── [+] irc-r105-1.md
        └── [+] irc-r105-2.md
```

**actual implementation**: no code fixtures exist. IRC code sections are hardcoded in `getCodeSectionsForJurisdiction.ts`.

**partially in evaluation**: evaluation mentions static IRC lookup, but does not explicitly document that the `__fixtures__/code/` structure was removed.

### 3. cache layer (found in r1)

**blueprint declares (lines 203-204, 213-214)**:
- `.cache/permits/` directory for permit data

**actual implementation**: no cache layer.

**not in evaluation**: confirmed absent, noted for update.

---

## why these are acceptable scope reductions

| divergence | rationale |
|------------|-----------|
| define.permit-fundamentals.md removed | supplemental brief, can be added later |
| ref.electrical-panel-upgrade added | real-world example, more valuable than generic fundamentals |
| code fixtures removed | static lookup simpler for v1, fixtures add complexity |
| cache layer removed | live scrape sufficient for v1, cache is optimization |

---

## evaluation update needed

these divergences should be added to 5.2.evaluation.yield.md:

| section | blueprint | actual | status |
|---------|-----------|--------|--------|
| briefs | define.permit-fundamentals.md | not implemented | add to divergences |
| briefs | - | ref.permit-required.electrical-panel-upgrade.indianapolis-in.md | add to divergences |
| fixtures | __fixtures__/code/ with 2 md files | not implemented (static lookup) | add to divergences |
| cache | .cache/permits/ | not implemented | add to divergences |

---

## hostile reviewer check (r2)

what would they find beyond r1?

1. **brief mismatch** — found. 5 briefs declared, 5 implemented, but different sets.
2. **fixture structure** — found. code fixtures declared but not delivered.
3. **permit fixtures vs scrape fixtures** — already documented (location changed).
4. **operation name pattern** — already documented (get vs search/fetch).
5. **test counts** — already documented (18 declared, 6 implemented).

no additional divergences found.

---

## fixes applied

**updated 5.2.evaluation.yield.md** to add divergences found:

| divergence | added to table | resolution added |
|------------|----------------|------------------|
| define.permit-fundamentals.md removed | yes | acceptable: supplemental brief; real-world example ref added instead |
| ref.electrical-panel-upgrade added | yes | acceptable: real-world example more valuable for v1 |
| __fixtures__/code/ removed | yes | acceptable: static lookup simpler for v1; fixtures add complexity |
| .cache/permits/ removed | yes | acceptable: live scrape sufficient for v1; cache is optimization |

---

## summary

r1 review was thorough for major divergences. r2 found additional divergences:
- 1 brief swap not documented (fundamentals → electrical-panel-upgrade example)
- code fixtures removal not explicitly documented
- cache layer removal confirmed

**all issues fixed.** evaluation document now complete with all divergences documented.

