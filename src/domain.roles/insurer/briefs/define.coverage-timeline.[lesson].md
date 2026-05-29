# define.coverage-timeline

## .what

which insurance policy covers cascade damage at each phase of construction and ownership. the policy changes, but the coverage logic stays the same.

## .why

- clarifies when builder's risk vs homeowners applies
- explains handoff between policies at permit close
- shows that ensuing loss logic is consistent across policies
- identifies gaps in coverage at transition points

---

## tl;dr

```
PRE-CONSTRUCTION          CONSTRUCTION              POST-CONSTRUCTION
      │                        │                           │
      │    permit opens ──────►│◄────── permit closes      │
      │                        │                           │
┌─────┴─────┐            ┌─────┴─────┐              ┌──────┴──────┐
│homeowners │            │ builder's │              │ homeowners  │
│  (maybe)  │            │   risk    │              │   (active)  │
└───────────┘            └───────────┘              └─────────────┘
      │                        │                           │
      ▼                        ▼                           ▼
cascade: covered         cascade: covered          cascade: covered
 defect: NOT              defect: NOT               defect: NOT
```

| phase | permit status | cascade policy | defect repair |
|-------|---------------|----------------|---------------|
| pre-construction | none | homeowners (if renovate) | NOT covered |
| construction | open | builder's risk | NOT covered |
| post-construction | closed | homeowners | NOT covered |

**the constant**: defect repair is NEVER covered. cascade damage is ALWAYS covered (if policy active).

---

## phase 1: pre-construction

### coverage status

| policy | status | covers cascade? |
|--------|--------|-----------------|
| homeowners | active (if you own home) | YES |
| builder's risk | not yet purchased | NO |

### when this matters

| scenario | outcome |
|----------|---------|
| current home, plan to renovate | homeowners covers current structure |
| vacant lot, plan to build | no coverage until builder's risk purchased |
| demolition phase | check policy — some exclude active construction |

---

## phase 2: construction (open permit)

### coverage status

| policy | status | covers cascade? |
|--------|--------|-----------------|
| homeowners | may be suspended or limited | CHECK POLICY |
| builder's risk | active | YES |

### why builder's risk is needed

many homeowners policies exclude or limit coverage when:
- major construction is underway
- structure is "under renovation"
- occupancy changes (vacant while construction)

**source**: [The Hartford - Builder's Risk](https://www.thehartford.com/insights/construction/builders-risk-insurance)

### builder's risk coverage

| peril | covered? |
|-------|----------|
| fire | YES |
| wind/hail | YES |
| theft of materials | YES |
| vandalism | YES |
| collapse | YES |
| faulty workmanship (defect itself) | NO |
| faulty workmanship → fire | YES (ensuing loss) |

### cascade scenario: open permit

**defect → fire occurs while permit is open**

| step | owner-builder | hired-builder |
|------|---------------|---------------|
| 1 | defect causes fire | defect causes fire |
| 2 | builder's risk pays structure damage | builder's risk pays structure damage |
| 3 | builder's risk pays materials loss | builder's risk pays materials loss |
| 4 | YOU repair defect (out of pocket) | contractor repairs defect (warranty/GL) |
| 5 | no subrogation target | builder's risk subrogates against contractor |

**source**: [MEREDA - Faulty Workmanship Exclusion](https://mereda.org/2021/09/14/the-faulty-workmanship-exclusion-in-builders-risk-insurance-measure-thrice-cut-once/)

---

## phase 3: permit closes (transition)

### the handoff

| event | policy change |
|-------|---------------|
| final inspection passes | permit closes |
| certificate of occupancy issued | structure is "complete" |
| builder's risk expires | coverage ends (typically 30-90 days after) |
| homeowners activates | must be in place before builder's risk ends |

### the gap risk

| scenario | risk |
|----------|------|
| builder's risk expires before homeowners starts | NO COVERAGE |
| homeowners excludes "construction defects" discovered after | CHECK POLICY |
| defect discovered at final inspection | still open permit, builder's risk covers cascade |

### best practice

| action | timing |
|--------|--------|
| purchase homeowners | before builder's risk expires |
| confirm no exclusions | for recent construction |
| document final inspection | proof permit closed cleanly |

---

## phase 4: post-construction (closed permit)

### coverage status

| policy | status | covers cascade? |
|--------|--------|-----------------|
| homeowners | active | YES |
| builder's risk | expired | NO |

### homeowners coverage

| peril | covered? |
|-------|----------|
| fire | YES |
| water (burst pipe, leak) | YES |
| collapse | YES |
| wind/hail | YES |
| faulty workmanship (defect itself) | NO |
| faulty workmanship → fire | YES (ensuing loss) |

### cascade scenario: closed permit

**defect → fire occurs after permit closes**

| step | owner-builder | hired-builder |
|------|---------------|---------------|
| 1 | defect causes fire | defect causes fire |
| 2 | homeowners pays fire damage | homeowners pays fire damage |
| 3 | homeowners pays contents loss | homeowners pays contents loss |
| 4 | homeowners pays loss of use | homeowners pays loss of use |
| 5 | YOU repair defect (out of pocket) | contractor repairs defect (warranty/GL) |
| 6 | no subrogation target | homeowners subrogates against contractor |
| 7 | premiums increase 10-40% | premiums unaffected (recovery) |

---

## the consistent logic across phases

### what's always covered (cascade)

| phase | policy | fire | water | collapse |
|-------|--------|------|-------|----------|
| construction | builder's risk | YES | YES | YES |
| post-construction | homeowners | YES | YES | YES |

### what's never covered (defect itself)

| phase | policy | defect repair |
|-------|--------|---------------|
| construction | builder's risk | NO |
| post-construction | homeowners | NO |
| any phase | any policy | NO |

### who pays for defect repair

| phase | owner-builder | hired-builder |
|-------|---------------|---------------|
| construction | YOU | contractor (warranty/GL) |
| post-construction (within warranty) | YOU | contractor (warranty) |
| post-construction (warranty expired) | YOU | YOU |

---

## timeline visualization

```
PRE-CONSTRUCTION          CONSTRUCTION              POST-CONSTRUCTION
      │                        │                           │
      │    permit opens ──────►│◄────── permit closes      │
      │                        │                           │
┌─────┴─────┐            ┌─────┴─────┐              ┌──────┴──────┐
│homeowners │            │ builder's │              │ homeowners  │
│  (maybe)  │            │   risk    │              │   (active)  │
└───────────┘            └───────────┘              └─────────────┘
      │                        │                           │
      ▼                        ▼                           ▼
cascade: covered         cascade: covered          cascade: covered
 defect: NOT              defect: NOT               defect: NOT
```

---

## special scenarios

### renovation of occupied home

| situation | active policies |
|-----------|-----------------|
| minor renovation (no permit) | homeowners only |
| major renovation (permit required) | homeowners + builder's risk recommended |
| homeowners excludes active construction | builder's risk required |

### new construction (vacant lot)

| situation | active policies |
|-----------|-----------------|
| before construction starts | none (no structure) |
| construction phase | builder's risk only |
| after certificate of occupancy | homeowners only |

### condo/townhouse construction

| situation | note |
|-----------|------|
| developer builds | developer's builder's risk |
| owner does interior work | may need owner's builder's risk |
| HOA master policy | check what's covered |

---

## key takeaways

| question | answer |
|----------|--------|
| which policy covers cascade at open permit? | builder's risk |
| which policy covers cascade at closed permit? | homeowners |
| is defect repair ever covered? | NO — at any phase |
| what's consistent across phases? | cascade covered, defect not |
| owner-builder difference? | no subrogation target at any phase |

---

## sources

### builder's risk
1. [The Hartford - Builder's Risk](https://www.thehartford.com/insights/construction/builders-risk-insurance)
2. [MEREDA - Faulty Workmanship Exclusion](https://mereda.org/2021/09/14/the-faulty-workmanship-exclusion-in-builders-risk-insurance-measure-thrice-cut-once/)
3. [Cavignac - Construction Defects](https://cavignac.com/blog/damage-to-property-under-construction-caused-by-construction-defects/)

### policy transitions
4. [US Assure - Builder's Risk for Homeowners](https://usassure.com/resources/articles/builders-risk-insurance-for-homeowners-when-is-it-needed)
5. [Distinguished - Builder's Risk for Homeowners](https://distinguished.com/blog/builders-risk-insurance-for-homeowners/)

### ensuing loss
6. [IRMI - Ensuing Loss Exception](https://www.irmi.com/articles/expert-commentary/ensuing-loss-getting-around-a-property-policys-defective-construction-exclusion)
7. [Smith Currie - Builder's Risk and CGL Interplay](https://www.smithcurrie.com/publications/common-sense-contract-law/the-interplay-of-builders-risk-and-commercial-general-liability-coverage/)

## .date researched

2026-04-19
