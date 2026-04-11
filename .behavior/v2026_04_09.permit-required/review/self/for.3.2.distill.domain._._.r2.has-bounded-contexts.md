# self-review round 2: bounded contexts

## stone reviewed

`3.2.distill.domain._` → `3.2.distill.domain._.yield.md`

---

## deeper reflection: why these boundaries?

### why is determination separate from code?

the determination context computes answers. the code context stores text.

if we merged them, the determination logic would need to know:
- how to fetch code sections from storage
- how to handle cache misses
- how to deal with version conflicts

by the split, determination just asks "give me section R105.1 from IRC 2020" and code handles the retrieval complexity.

**test**: can i change how code sections are stored without edit to determination logic?

**answer**: yes — determination only uses `getOneCodeSection` and `getAllCodeSectionsForCategory`. the storage mechanism is hidden.

**verdict**: boundary holds ✓

---

### why is jurisdiction separate from code?

a jurisdiction adopts a specific version of a code. the relationship is:
- jurisdiction → which code version
- code → what the sections say

if we merged them, we'd have:
- "Indianapolis says IRC 2020 R105.1 says..."
- tight couple between jurisdiction metadata and code text

with the split:
- jurisdiction says "i use IRC 2020"
- code says "IRC 2020 R105.1 says..."
- determination combines them

**test**: can a code section be reused across jurisdictions?

**answer**: yes — if both Indianapolis and Chicago adopt IRC 2020, they share the same CodeSection records. only their Jurisdiction records differ.

**verdict**: boundary holds ✓

---

### why is permit separate from determination?

permit records come from portal scrape. determinations come from code analysis.

different data sources:
- permits: scraped from Accela portal (external system)
- determinations: computed from code + work description (internal computation)

different lifecycles:
- permits: immutable once issued (historical records)
- determinations: recomputed when code changes or work description changes

**test**: can i search permits without compute a determination?

**answer**: yes — `permit.search` and `permit.fetch` work independently. homeowner can look up permit history without ask "do i need one?"

**verdict**: boundary holds ✓

---

## found issue: CodeCitation appears in two contexts

in the yield file, CodeCitation is listed under both:
- determination (as part of PermitDetermination)
- code (as part of the code subdomain)

**analysis**: CodeCitation references CodeSection (from code context) but is created by determination context. where does it belong?

**resolution**: CodeCitation is a literal that lives in determination context. it holds a reference to CodeSection but is owned by determination. this is correct — the citation is created when we compute, not when we store code.

updated grasp:
- code context: CodeSection only
- determination context: WorkDescription, PermitDetermination, CodeCitation

**fix applied**: updated yield file treestruct — moved CodeCitation from code/ to determination/ subdomain.

```diff
 ├── determination/
 │   ├── WorkDescription
 │   ├── PermitDetermination
+│   ├── CodeCitation
 │   └── getOnePermitDetermination
 ├── code/
 │   ├── CodeSection
-│   ├── CodeCitation
 │   └── getOneCodeSection, getAllCodeSectionsForCategory
```

---

## found issue: Permit depends on Jurisdiction but relationship is implicit

the yield shows Permit has `jurisdiction: Ref<Jurisdiction>` but the permit context "depends on jurisdiction" relationship is not clear in the treestruct.

**analysis**: should we show this as a direct dependency or is it enough that Permit has a foreign key?

**resolution**: the foreign key is sufficient. Permit doesn't need to load Jurisdiction to function — it just holds a reference. this is correct DDD: references, not eager load.

**verdict**: no fix needed ✓

---

## summary after deeper review

| boundary | why it holds | verified by |
|----------|--------------|-------------|
| determination vs code | determination computes, code stores | can change storage without edit computation |
| jurisdiction vs code | jurisdiction adopts, code contains | code reused across jurisdictions |
| permit vs determination | different sources, lifecycles | can search without compute |

**one issue found and fixed**: CodeCitation ownership was ambiguous. moved it from code/ to determination/ subdomain in yield file.

**conclusion**: boundaries are sound. fix applied to yield file.

---

## reflection: what this review taught me

### about the domain

the permit domain has a natural four-way split that emerged from the different data sources and lifecycles:

1. **code** — comes from legal documents, versioned, rarely changes
2. **jurisdiction** — comes from government records, maps postal to authority
3. **permit** — comes from portal scrape, historical records
4. **determination** — computed internally, ephemeral

each context has a different "source of truth" which makes the boundaries feel natural.

### about CodeCitation

the confusion about CodeCitation ownership revealed a subtle pattern:

- CodeSection is **stored** in code context
- CodeCitation is **produced** in determination context
- CodeCitation **references** CodeSection

the rule: "ownership follows production, not reference"

a citation is not a piece of code — it is evidence used in a determination. the fact that it quotes code doesn't make it part of the code context.

### about future review

when i see an object that references across context boundaries, i should ask:
- who produces this object?
- who consumes this object?
- is the reference a "belongs to" or a "cites"?

"belongs to" suggests shared ownership. "cites" suggests the object lives where it's produced.
