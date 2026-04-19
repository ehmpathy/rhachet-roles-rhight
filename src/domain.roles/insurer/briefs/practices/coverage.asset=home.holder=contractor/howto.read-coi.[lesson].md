# howto.read-coi

## .what

how to read a Certificate of Liability Insurance (COI) and verify you're actually protected, not just named on a piece of paper.

## .why

- certificate holder ≠ additional insured
- one gives you a document, the other gives you rights
- most homeowners don't know the difference
- contractors often provide COIs that look complete but lack key protections

---

## certificate holder vs additional insured

| status | what it means | can you file a claim? |
|--------|---------------|----------------------|
| **certificate holder** | you receive a copy of the certificate | **NO** — you have no rights under the policy |
| **additional insured** | you have coverage under the policy | **YES** — you can claim directly against the policy |

**certificate holder** = "here's proof I have insurance"

**additional insured** = "my insurance covers you too"

---

## the ACORD 25 form

most COIs use the ACORD 25 format. here's what to examine:

```
┌─────────────────────────────────────────────────────────────┐
│  ACORD 25 - CERTIFICATE OF LIABILITY INSURANCE             │
├─────────────────────────────────────────────────────────────┤
│  PRODUCER: [insurance agent info]                          │
│  INSURED: [contractor's business name]                     │
│  INSURER: [insurance company name + NAIC#]                 │
├─────────────────────────────────────────────────────────────┤
│  COVERAGES                           ADDL  SUBR            │
│  TYPE OF INSURANCE                   INSD  WVD   POLICY #  │
│  ─────────────────────────────────────────────────────────  │
│  COMMERCIAL GENERAL LIABILITY        [ ]   [ ]   XXXXXX    │
│                                       ^^^                   │
│                          THIS BOX MUST BE CHECKED           │
├─────────────────────────────────────────────────────────────┤
│  DESCRIPTION OF OPERATIONS / LOCATIONS / VEHICLES          │
│  ─────────────────────────────────────────────────────────  │
│  [MUST state your address + "additional insured"]          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  CERTIFICATE HOLDER:                                        │
│  [your name and address]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## what to check on every COI

### 1. ADDL INSD column

look for the column labeled "ADDL INSD" (additional insured) next to Commercial General Liability.

| box status | means |
|------------|-------|
| checked (X) | you may be additional insured — verify in description |
| blank | you are NOT additional insured |

### 2. description of operations section

this section MUST contain language like:

> "Certificate holder is named as additional insured for [work type] at [your address]"

**if this section is blank:** you are NOT additional insured, regardless of what the contractor says.

### 3. certificate holder section

your name and address should appear here. but remember: this only means you receive the certificate — it does NOT mean you're covered.

### 4. policy dates

| field | what to verify |
|-------|----------------|
| policy eff | must be BEFORE today |
| policy exp | must be AFTER work completes |

### 5. coverage limits

| coverage type | minimum recommended |
|---------------|---------------------|
| each occurrence | $1,000,000 |
| general aggregate | $2,000,000 |
| damage to rented premises | $50,000+ |

### 6. insurer info

| field | what to verify |
|-------|----------------|
| insurer name | real company (searchable) |
| NAIC# | 5-digit code, verifiable at naic.org |

---

## red flags

| red flag | risk |
|----------|------|
| ADDL INSD not checked | you cannot file a claim |
| description of operations blank | additional insured not endorsed |
| your address not in description | coverage may not apply to your job |
| policy dates don't cover job period | no coverage if damage occurs outside dates |
| no NAIC# | may be fake insurer |
| phone number on COI differs from insurer's real number | possible fake document |
| not ACORD 25 format | nonstandard, harder to verify |

---

## example: good vs bad COI

### ❌ bad COI (what you often receive)

```
ADDL INSD: [ ] (not checked)

DESCRIPTION OF OPERATIONS:
(blank)

CERTIFICATE HOLDER:
John Smith
123 Main St
Anytown, USA
```

**problem:** you're certificate holder only — no claim rights.

### ✅ good COI (what you need)

```
ADDL INSD: [X] (checked)

DESCRIPTION OF OPERATIONS:
Certificate holder is named as additional insured for
electrical work at 123 Main St, Anytown, USA per
CG 20 10 endorsement.

CERTIFICATE HOLDER:
John Smith
123 Main St
Anytown, USA
```

**protection:** you can file a claim directly against the policy.

---

## the endorsement that matters: CG 20 10

when you're added as additional insured, the insurer attaches endorsement **CG 20 10** (or similar) to the policy.

the description section should reference this endorsement.

| endorsement | what it does |
|-------------|--------------|
| CG 20 10 | adds you as additional insured for active operations |
| CG 20 37 | adds you as additional insured for completed operations |
| CG 22 94 | **removes** subcontractor coverage (bad for you) |

---

## verification steps

after you receive a COI:

1. **check ADDL INSD box** — is it marked?
2. **read description section** — does it name your address + "additional insured"?
3. **verify policy dates** — do they cover your job?
4. **look up insurer phone number** — call them directly (not the number on the COI)
5. **confirm with insurer:**
   - "is policy BOP1004005 active?"
   - "am I listed as additional insured for work at [your address]?"
   - "does this policy contain endorsement CG 22 94?"

---

## if you're NOT additional insured

ask the contractor:

> "the COI shows me as certificate holder, but I need to be listed as additional insured for work at my address. can you have your insurer add me and send an updated certificate?"

this is a standard request. legitimate contractors do it routinely.

**if they refuse or can't:** reconsider whether to proceed.

---

## verification checklist

- [ ] ADDL INSD column is checked for CGL coverage
- [ ] description section names my address + "additional insured"
- [ ] policy effective date is before today
- [ ] policy expiration date is after job completion
- [ ] insurer name and NAIC# are verifiable
- [ ] called insurer directly to confirm additional insured status
- [ ] asked about CG 22 94 endorsement

---

## see also

- `define.certificate-holder-vs-additional-insured.[lesson].md` — the critical distinction
- `howto.verify-coi-is-valid.[lesson].md` — full verification process
- `howto.check-cg-22-94.[lesson].md` — subcontractor coverage endorsement
- `define.three-layer-defense.[lesson].md` — insurance verification as layer 1
