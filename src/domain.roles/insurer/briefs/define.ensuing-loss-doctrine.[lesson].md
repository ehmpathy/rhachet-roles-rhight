# define.ensuing-loss-doctrine

## .what

the ensuing loss doctrine determines when damage from an excluded cause (like workmanship defect) is still covered — because a **second, covered peril** intervened.

## .why

- explains why electrical defect → fire → damage is COVERED
- clarifies the "two causes" requirement
- distinguishes covered scenarios from denied scenarios
- central to understanding post-permit insurance exposure

---

## tl;dr

| sequence | covered? | why |
|----------|----------|-----|
| defect → fire → damage | YES | fire is separate covered peril |
| defect → water intrusion → damage | YES | water is separate covered peril |
| defect → collapse → damage | YES | collapse is separate covered peril |
| defect → defect worsens | NO | no intervening covered peril |
| defect = damage (same moment) | NO | one event, not two |

**the test**: did a covered peril (fire, water, collapse) intervene between the excluded cause (defect) and the damage?

---

## the doctrine explained

### standard policy structure

homeowners policies:
1. **cover** named perils: fire, water, wind, theft, etc.
2. **exclude** faulty workmanship, defects, maintenance failures

the ensuing loss clause bridges these:

> "We do not insure for loss caused by... faulty workmanship... **But if loss by a Covered Peril ensues, we will pay for that ensuing loss.**"

### the two-cause test

for ensuing loss to apply, you need **two causes in sequence**:

| step | cause type | example |
|------|------------|---------|
| 1 | excluded cause | loose wire connection (defect) |
| 2 | covered peril | fire (intervening peril) |
| 3 | damage | house burns down |

**key insight**: the fire is NOT the defect. the fire is a separate event that the defect caused. the damage is from the fire, not from the defect directly.

### why this matters for electrical work

| scenario | cause chain | outcome |
|----------|-------------|---------|
| loose lug → arc → fire | defect → fire (covered) → damage | COVERED |
| undersized wire → overheat → fire | defect → fire (covered) → damage | COVERED |
| improper splice → arc flash → fire | defect → fire (covered) → damage | COVERED |
| defective outlet → shock injury | defect → injury | NOT COVERED (no ensuing peril) |

---

## case law establishing the doctrine

### Fruchthandler v. Tri-State Consumer Insurance Co. (NY 2019)

**citation**: 2019 NY Slip Op 02502 (App. Div. 2d Dept. 2019)

**facts**: fire in two-family home. insurer denied based on faulty workmanship exclusion — "improper conditions" in junction box caused fire.

**ruling**: coverage GRANTED. ensuing loss exception applied.

**reasoning**: 
- fire occurred TWO YEARS after faulty work
- fire caused damage "wholly separate from the defective property itself"
- the defect (junction box) ≠ the damage (entire house)

**key quote**: "the exception to the faulty workmanship exclusion preserves coverage when fire constitutes ensuing loss separate from defective property."

**source**: [NY Appellate Digest](https://www.newyorkappellatedigest.com/2019/04/03/the-exception-to-the-faulty-workmanship-exclusion-in-the-fire-insurance-policy-applied-to-preserve-coverage-for-ensuing-loss-second-dept/)

### Gardens Condominium v. Farmers Insurance (WA 2024)

**citation**: 2024 WL (Wash. 2024)

**facts**: faulty roof construction caused inadequate ventilation → condensation → water damage.

**ruling**: coverage GRANTED. ensuing loss exception applies.

**reasoning**: 
- faulty workmanship (excluded) caused condensation
- condensation is water damage (covered peril)
- ensuing loss preserved coverage

**source**: [Justia](https://law.justia.com/cases/washington/supreme-court/2024/101-892-4.html)

---

## when ensuing loss does NOT apply

### Bob Robison v. RLI Insurance (8th Cir. 2025)

**citation**: 2025 WL (8th Cir. 2025)

**facts**: contractor's faulty excavation caused property damage. insured claimed ensuing loss exception.

**ruling**: coverage DENIED.

**reasoning**: 
- no separate covered peril identified
- faulty workmanship was "sole and exclusive cause"
- damage occurred from the defect itself, not an intervening peril
- ensuing loss requires: defect → SEPARATE covered peril → damage

**the key distinction**: there was no fire, no water, no collapse. the defect directly caused the damage.

**source**: [Missouri Lawyers Media](https://molawyersmedia.com/2025/03/27/insurance-law-builders-risk-policy-coverage-exclusion-ensuing-loss-exception/)

### the pattern for denial

| scenario | why denied |
|----------|------------|
| faulty paint → floor replacement needed | paint IS the damage (no intervening peril) |
| defective foundation → cracks | cracks ARE the defect manifesting (no intervening peril) |
| improper plumbing → leak | leak is defect, not separate peril |

**but if**: improper plumbing → leak → water damages OTHER property → COVERED (water is ensuing peril)

---

## the time gap question

### does time matter?

| case | time gap | outcome |
|------|----------|---------|
| Fruchthandler | 2 years | COVERED |
| Fireman's Fund v. Triton | 3 years | COVERED |
| Restaurant panel fire | 8 weeks | COVERED |

**no**: time between defect and fire does NOT eliminate ensuing loss protection. the doctrine asks "what caused the damage?" not "when was the defect created?"

### why time helps coverage

longer gaps actually strengthen the ensuing loss argument:
- defect existed at point A
- fire occurred at point B
- clearly two separate events
- fire is the proximate cause of damage

---

## application to permitted work

### permit status is irrelevant to ensuing loss

| scenario | ensuing loss applies? |
|----------|----------------------|
| permitted work → defect → fire | YES |
| unpermitted work → defect → fire | YES |
| contractor work → defect → fire | YES |
| owner-builder work → defect → fire | YES |

the doctrine asks: **what caused the damage?**

not: was the work permitted? who did the work?

### permit's actual value

| factor | what permit provides |
|--------|---------------------|
| evidence | work was inspected |
| burden shift | insurer must prove defect |
| defense | "I followed code" argument |

permit does NOT override the exclusion if defect exists. but fire from defect triggers ensuing loss regardless.

---

## summary: the mental model

```
COVERED:
  defect ──→ [covered peril] ──→ damage
              (fire/water/collapse)
              
NOT COVERED:
  defect ══════════════════════→ damage
              (no intervening peril)
```

**the question is always**: did something COVERED happen between the defect and the damage?

- if YES → ensuing loss → COVERED
- if NO → exclusion applies → DENIED

---

## sources

### case law
1. [Fruchthandler v. Tri-State (NY 2019)](https://www.newyorkappellatedigest.com/2019/04/03/the-exception-to-the-faulty-workmanship-exclusion-in-the-fire-insurance-policy-applied-to-preserve-coverage-for-ensuing-loss-second-dept/)
2. [Gardens Condominium v. Farmers (WA 2024)](https://law.justia.com/cases/washington/supreme-court/2024/101-892-4.html)
3. [Bob Robison v. RLI (8th Cir. 2025)](https://molawyersmedia.com/2025/03/27/insurance-law-builders-risk-policy-coverage-exclusion-ensuing-loss-exception/)

### doctrine analysis
4. [IRMI - Ensuing Loss Exception](https://www.irmi.com/articles/expert-commentary/ensuing-loss-getting-around-a-property-policys-defective-construction-exclusion)
5. [Insurance Law Hawaii - Ensuing Loss](https://www.insurancelawhawaii.com/insurance_law_hawaii/ensuing-loss/)
6. [Levy Law - Ensuing Loss Clause](http://levy-law.com/understanding-the-ensuing-loss-clause-in-your-all-risk-insurance-policy/)
7. [Property Insurance Coverage Law - Ensuing Loss](https://www.propertyinsurancecoveragelaw.com/blog/ensuing-loss-clause/)

## .date researched

2026-04-19
