# self-review: bounded contexts

## stone reviewed

`3.2.distill.domain._` → `3.2.distill.domain._.yield.md`

---

## bounded contexts identified

### context 1: determination

**concepts**: WorkDescription, PermitDetermination, CodeCitation

**purpose**: compute whether permit is required for described work

**boundaries**:
- owns: parse work descriptions, compute determinations
- does not own: permit records, jurisdiction data, code text

**dependencies**:
- depends on: jurisdiction (to know which code applies)
- depends on: code (to read sections and exemptions)

**verdict**: clear boundary ✓

---

### context 2: code

**concepts**: CodeSection, CodeCitation

**purpose**: store and retrieve legal code text

**boundaries**:
- owns: code sections, version track, effective dates
- does not own: determinations, permits, jurisdictions

**dependencies**:
- depends on: none (leaf context)

**verdict**: clear boundary ✓

---

### context 3: jurisdiction

**concepts**: Jurisdiction

**purpose**: map postal codes to authorities and their adopted codes

**boundaries**:
- owns: jurisdiction metadata, contact info, code adoption dates
- does not own: code text, permits, determinations

**dependencies**:
- depends on: none (leaf context)

**verdict**: clear boundary ✓

---

### context 4: permit

**concepts**: Permit

**purpose**: store and retrieve permit records from portal

**boundaries**:
- owns: permit records, status, history
- does not own: determinations, code text, jurisdictions

**dependencies**:
- depends on: jurisdiction (each permit belongs to a jurisdiction)

**verdict**: clear boundary ✓

---

## relationships between contexts

```
┌─────────────┐
│ determination│
└──────┬──────┘
       │ uses
       ▼
┌──────┴──────┐     ┌───────────┐
│ jurisdiction │◄────│   permit  │
└──────┬──────┘     └───────────┘
       │ uses
       ▼
┌─────────────┐
│    code     │
└─────────────┘
```

**flow**:
1. determination context asks jurisdiction context for code version
2. determination context asks code context for relevant sections
3. determination context computes result
4. permit context stores/retrieves records (separate flow)

---

## found issue: none

the domain distill already organized concepts by subdomain:

```
permit-required/
├── determination/
├── code/
├── jurisdiction/
└── permit/
```

each subdomain maps to a bounded context. no mix detected.

---

## summary

| context | concepts | leaf? | depends on |
|---------|----------|-------|------------|
| determination | WorkDescription, PermitDetermination, CodeCitation | no | jurisdiction, code |
| code | CodeSection | yes | none |
| jurisdiction | Jurisdiction | yes | none |
| permit | Permit | no | jurisdiction |

**conclusion**: four bounded contexts are clearly identified with explicit boundaries and dependencies. no "big ball of mud" risk.
