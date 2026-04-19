# flowchart.sub-employee-injury-coverage

## .what

complete decision tree for coverage when GC brings a sub onto your project and that sub's employee is injured.

## .why

- most common construction injury scenario
- coverage depends on multiple factors
- no single brief covers the full flow
- this consolidates the decision points

---

## tl;dr

| protection | reliability | why |
|------------|-------------|-----|
| sub has workers' comp | **BEST** | exclusive remedy blocks lawsuit entirely |
| GC's GL has no action over | **HIGH** | GC brought sub = "arose from operations" |
| action over + insured contract exception | **VARIES** | depends on state law + causation argument |
| your homeowners / umbrella | **LAST RESORT** | you pay to defend |

---

## the complete flow

```
GC BRINGS SUB ONTO YOUR PROJECT
              │
              ▼
     SUB'S EMPLOYEE INJURED
              │
              ▼
══════════════════════════════════════════════
CHECKPOINT 1: DOES SUB HAVE WORKERS' COMP?
══════════════════════════════════════════════
              │
     ┌────────┴────────┐
     ▼                 ▼
    YES                NO
     │                 │
     ▼                 ▼
sub's comp pays    no guaranteed benefits
     │                 │
     ▼                 ▼
EXCLUSIVE REMEDY   employee CAN sue
blocks all suits       │
     │                 ▼
     ▼            sues YOU + GC
                       │
  ┌────────────────────┘
  │
  ▼
═══════════════════════════════════════════════════
CHECKPOINT 2: ARE YOU ADDITIONAL INSURED ON GC's GL?
═══════════════════════════════════════════════════
  │
  ├── NO → your homeowners defends (EXPOSED)
  │
  ▼
 YES — you tender claim to GC's GL
  │
  ▼
═══════════════════════════════════════════════════
CHECKPOINT 3: DOES GC's GL HAVE ACTION OVER EXCLUSION?
═══════════════════════════════════════════════════
  │
  ├── NO → GC's GL COVERS
  │         │
  │         ▼
  │    GC brought sub = "arose from operations"
  │         │
  │         ▼
  │      YOU: PROTECTED
  │
  ▼
 YES — action over exclusion exists
  │
  ▼
═══════════════════════════════════════════════════
CHECKPOINT 4: IS INSURED CONTRACT EXCEPTION INTACT?
═══════════════════════════════════════════════════
  │
  ├── NO (removed by endorsement) → DENIED
  │                                     │
  │                                     ▼
  │                              your homeowners
  │                              defends (EXPOSED)
  │
  ▼
 YES — exception exists
  │
  ▼
═══════════════════════════════════════════════════
CHECKPOINT 5: DO YOU HAVE INDEMNIFICATION CLAUSE?
═══════════════════════════════════════════════════
  │
  ├── NO → exception doesn't trigger → DENIED
  │
  ▼
 YES — contract has indemnification clause
  │
  ▼
═══════════════════════════════════════════════════
CHECKPOINT 6: IS CLAUSE VALID UNDER STATE LAW?
═══════════════════════════════════════════════════
  │
  ├── NO (anti-indemnity statute voids it) → DENIED
  │
  ▼
 YES — clause enforceable
  │
  ▼
═══════════════════════════════════════════════════
CHECKPOINT 7: DID GC "CAUSE" THE INJURY?
═══════════════════════════════════════════════════
  │
  │  policy requires claim "caused, in whole
  │  or in part" by named insured (GC)
  │
  ▼
 GC BROUGHT THE SUB — causation argument:
  │
  ├── GC selected this sub (GC's decision)
  ├── GC failed to verify sub's comp (negligent hire)
  ├── GC controlled who was on site (retained control)
  └── injury arose from GC's project (operations)
  │
  ▼
 ARGUMENT: negligent hire = "caused some part"
  │
  │  ⚠️  UNTESTED — no court has directly ruled
  │      on this specific scenario
  │
  │  BUT: stronger than Pioneer (where named
  │  insured was unconnected to hazard)
  │  because GC ACTIVELY SELECTED the sub
  │
  ▼
═══════════════════════════════════════════════════
OUTCOME
═══════════════════════════════════════════════════
  │
  ├── if causation accepted → COVERAGE RESTORED
  │         │
  │         ▼
  │    GC's GL defends you
  │         │
  │         ▼
  │      YOU: PROTECTED
  │
  └── if causation rejected → DENIED
            │
            ▼
       your homeowners defends
            │
            ▼
         YOU: EXPOSED
```

---

## summary table

| checkpoint | question | if YES | if NO |
|------------|----------|--------|-------|
| 1 | sub has comp? | **PROTECTED** (exclusive remedy) | continue |
| 2 | you're additional insured? | continue | **EXPOSED** |
| 3 | action over exclusion? | continue | **PROTECTED** |
| 4 | insured contract exception intact? | continue | **EXPOSED** |
| 5 | indemnification clause exists? | continue | **EXPOSED** |
| 6 | clause valid under state law? | continue | **EXPOSED** |
| 7 | GC "caused" injury? | **PROTECTED** | **EXPOSED** |

---

## what you control

| checkpoint | can you verify/control it? |
|------------|---------------------------|
| 1 — sub has comp | YES — require certificate from each sub |
| 2 — additional insured | YES — require before work starts |
| 3 — action over exclusion | YES — review GC's policy, get broker confirmation |
| 4 — exception intact | YES — verify not removed by endorsement |
| 5 — indemnification clause | YES — include in your contract |
| 6 — valid under state law | PARTIAL — consult attorney, draft carefully |
| 7 — causation argument | NO — court decides |

---

## protection strategies by reliability

### tier 1: blocks lawsuit entirely

| strategy | how |
|----------|-----|
| require sub to have comp | exclusive remedy blocks all suits |
| OCIP / wrap-up | your policy covers all workers on site |

### tier 2: GC's policy defends you

| strategy | how |
|----------|-----|
| verify no action over exclusion | GC's GL covers "operations" |
| verify insured contract exception + indemnification | restores coverage if exclusion exists |

### tier 3: you defend yourself

| strategy | how |
|----------|-----|
| umbrella policy | higher limits above homeowners |
| homeowners liability | last resort — you pay defense |

---

## the causation argument for GC-selected subs

### why GC "caused" the injury

| fact | causation argument |
|------|-------------------|
| GC chose this specific sub | GC's affirmative decision |
| GC didn't verify sub's comp | negligent hire |
| GC controlled site access | could have prevented |
| injury on GC's project | arose from GC's operations |

### case law support

**Florida 4th District:**
> "An indemnity agreement can be an 'insured contract' so long as the named insured caused **some part** of the injuries or is otherwise vicariously liable."

**Maggiano Law (negligent hire):**
> "A general contractor may be liable for hiring a subcontractor that they knew, or should have known, was unfit for the job."

### distinguished from Pioneer (where causation failed)

| Pioneer case | GC-selected sub |
|--------------|-----------------|
| named insured was unconnected to ice hazard | GC actively selected this sub |
| merely "furnished the occasion" | GC's decision = proximate cause |
| no negligent act by named insured | negligent hire IS the negligent act |

### status

**UNTESTED** — no court has directly ruled: does GC selecting an uninsured sub = "caused, in whole or in part"?

**strong argument**: negligent hire is a recognized tort; GC's decision to use uninsured sub is the but-for cause of your exposure.

---

## quick reference: what to verify before work starts

| item | how to verify |
|------|---------------|
| sub has comp | certificate from each sub |
| you're additional insured on GC's GL | certificate names you |
| GC's GL has no action over | broker confirmation letter |
| OR insured contract exception intact | broker confirmation letter |
| indemnification clause in contract | attorney review |
| clause valid in your state | attorney confirms |

---

## key takeaways

| question | answer |
|----------|--------|
| best protection? | sub has comp — blocks lawsuit entirely |
| if sub lacks comp? | depends on GC's GL policy language |
| does GC selecting sub = causation? | **strong argument yes** — but untested |
| what can you control? | checkpoints 1-5; checkpoint 7 is up to courts |
| worst case? | action over + no exception + your homeowners defends |

---

## related briefs

| brief | covers |
|-------|--------|
| `hazard.subcontractor-injury-gl-gap.[hazard].md` | action over exclusion detail |
| `define.insured-contract-exception.[lesson].md` | exception mechanism, case law, state variation |
| `howto.verify-gl-action-over-exclusion.[lesson].md` | verification process |
| `rule.require-additional-insured.[rule].md` | when to require comp vs GL |
| `define.wrap-up-ocip-policy.[lesson].md` | OCIP as alternative |

## .date researched

2026-04-19
