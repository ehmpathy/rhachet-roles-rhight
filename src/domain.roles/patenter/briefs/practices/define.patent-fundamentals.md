# define.patent-fundamentals

## .what

core patent terminology and office action types.

## .why

- precise terminology prevents miscommunication
- office action types determine response strategy
- shared vocabulary enables effective collaboration

---

## terminology

### identifiers

| term | definition | example |
|------|------------|---------|
| exid | external identifier for a patent or application | US20210234567A1 |
| application number | USPTO internal identifier | 17/123,456 |
| publication number | published application identifier | US 2021/0234567 A1 |
| patent number | granted patent identifier | US 11,234,567 B2 |

### exid format decode

```
US 2021 0234567 A1
│  │    │       │
│  │    │       └─ kind code (A1=application, B1/B2=granted)
│  │    └───────── serial number
│  └────────────── year
└──────────────── country code
```

### actors

| term | role | when active |
|------|------|-------------|
| inventor | person who conceived the invention | always credited |
| applicant | entity that files the application | file through grant |
| assignee | entity that owns the patent rights | file through grant |
| patentee | entity named on granted patent | after grant |

typical flow: inventor → applicant (often employer) → assignee → patentee

### claim terms

| term | definition |
|------|------------|
| independent claim | stands alone, defines invention without reference to other claims |
| dependent claim | references and narrows another claim ("The method of claim 1, wherein...") |
| claim tree | hierarchy of independent and dependent claims |
| preamble | introduction that sets context ("A method for...") |
| body | elements that define the invention |
| means-plus-function | element defined by function, not structure |

### prior art terms

| term | definition |
|------|------------|
| prior art | all public knowledge before the priority date |
| favorable art | prior art that supports novelty argument |
| adverse art | prior art that threatens claim validity |
| anticipation | prior art that discloses all claim elements |
| obviousness | combination of prior art renders claim obvious |

---

## office action types

office actions are examiner communications that reject or object to claims.

### rejection types

| code | name | what it means | frequency |
|------|------|---------------|-----------|
| 101 | subject matter | abstract idea, law of nature, natural phenomenon | ~15% |
| 102 | anticipation | prior art discloses all elements | ~25% |
| 103 | obviousness | combination of prior art renders obvious | ~47% |
| 112 | definiteness | claims unclear or specification lacks enablement | ~13% |

### 101 rejection (subject matter)

**what**: invention is not patent-eligible subject matter

**common targets**:
- abstract ideas (mathematical formulas, mental steps)
- laws of nature
- natural phenomena

**response strategy**:
- show practical application
- tie to specific technical improvement
- add concrete structural elements

### 102 rejection (anticipation)

**what**: single prior art reference discloses every claim element

**response strategy**:
- distinguish from reference (show absent element)
- amend claims to add distinguishing element
- argue reference teaches away from invention

### 103 rejection (obviousness)

**what**: combination of prior art references renders claim obvious to person of ordinary skill

**most common rejection type** — 47% of all USPTO rejections

**response strategy**:
- show unexpected results
- argue no motivation to combine references
- show teaching away
- present secondary considerations (commercial success, long-felt need)

### 112 rejection (definiteness)

**what**: claims are unclear or specification lacks enablement

**subtypes**:
- 112(a) — written description / enablement
- 112(b) — definiteness (claim scope unclear)
- 112(f) — means-plus-function interpretation

**response strategy**:
- clarify claim language
- amend specification (if allowed)
- provide definitions for ambiguous terms

---

## prosecution timeline

| phase | duration | key events |
|-------|----------|------------|
| file | day 0 | application submitted |
| publication | ~18 months | application published (unless opt-out) |
| first office action | 12-24 months | examiner reviews, issues rejection |
| response | 3 months (+extensions) | applicant responds to rejection |
| final office action | varies | examiner issues final rejection |
| appeal / RCE | varies | continue prosecution or appeal to PTAB |
| grant | varies | claims allowed, patent issues |

---

## key dates

| date | significance |
|------|--------------|
| priority date | earliest file date, determines prior art cutoff |
| publication date | application becomes public |
| issue date | patent granted, enforceable |
| expiration date | 20 years from priority (utility patents) |

