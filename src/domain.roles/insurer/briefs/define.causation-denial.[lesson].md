# define.causation-denial

## .what

insurance can deny claims for permitted work when a defect in the work **caused** the damage. permit status alone does not determine coverage — causation does.

## .why

- permit is evidence of code compliance, not coverage guarantee
- insurers deny based on "what caused the damage," not "was it permitted"
- understanding causation doctrines protects against surprise denials
- knowing when denial is legally valid vs contestable informs response

---

## tl;dr

| question | answer |
|----------|--------|
| can permitted work claims be denied? | YES — if defect caused damage |
| what triggers denial? | causation, not permit status |
| what doctrines apply? | efficient proximate cause, concurrent cause, ensuing loss |
| can you contest a denial? | YES — depends on state law and policy language |

---

## the causation principle

**core rule**: insurance covers damage from covered perils (fire, water, wind). it does not cover damage from excluded perils (faulty workmanship, defects, negligence).

**the question is always**: what caused the damage?

| scenario | cause analysis | outcome |
|----------|----------------|---------|
| lightning strikes permitted panel → fire | lightning (covered) | COVERED |
| defective wire in permitted panel → fire | defect (excluded) | DENIED |
| permitted panel + storm surge → fire | multiple causes | DEPENDS on doctrine |

permit status affects **evidence**, not **causation**. a permit proves the work was inspected — it does not prove the work was defect-free.

---

## the faulty workmanship exclusion

standard homeowners policies exclude damage caused by faulty workmanship:

> "We do not insure for loss caused directly or indirectly by... faulty, inadequate or defective... workmanship, repair, construction, renovation..."
> — ISO HO-3 policy form

this exclusion applies regardless of:
- whether work was permitted
- whether it passed inspection
- who performed the work (contractor or homeowner)
- how long ago the work was done

**key insight**: permit and inspection do not override the exclusion. they provide evidence that the work was done properly — but if a defect exists and causes damage, the exclusion applies.

---

## three causation doctrines

when damage involves both covered and excluded causes, courts apply one of three doctrines:

### 1. efficient proximate cause

**rule**: coverage depends on which cause was the "dominant" or "efficient" cause that set the loss in motion.

| if dominant cause is... | outcome |
|-------------------------|---------|
| covered peril (storm, fire, water) | COVERED |
| excluded peril (defect, workmanship) | DENIED |

**example**: defective flashing causes water to enter → water damages interior. efficient cause = defective flashing (excluded) → DENIED.

**states applying**: California, Washington, West Virginia, North Dakota

**source**: [Levy von Beck - Efficient Proximate Cause](https://levy-law.com/why-does-the-efficient-proximate-cause-matter-to-your-insurance-claim/)

### 2. concurrent causation

**rule**: if covered and excluded perils act together and neither can be isolated as the sole cause, coverage applies.

| scenario | outcome |
|----------|---------|
| storm + defect jointly cause damage | COVERED |
| cannot separate storm damage from defect damage | COVERED |

**example**: defective roof + hurricane winds → water damage. neither alone caused it. concurrent cause → COVERED.

**states applying**: Florida (when no ACC clause), New Jersey

**source**: [Sebo v. American Home Assurance (FL 2016)](https://law.justia.com/cases/florida/supreme-court/2016/sc14-897.html)

### 3. ensuing loss exception

**rule**: even if the initial cause is excluded, damage from a **subsequent** covered peril is covered.

| sequence | outcome |
|----------|---------|
| defect (excluded) → fire (covered) → damage | fire damage COVERED |
| defect (excluded) → water (covered) → damage | water damage COVERED |
| defect (excluded) → more defect damage | DENIED |

**example**: faulty HVAC installation → condensation → water damage. condensation is a covered peril. water damage → COVERED.

**key case**: Gardens Condominium v. Farmers Insurance (WA 2024) — court ruled faulty workmanship caused condensation, but condensation damage was covered under ensuing loss clause.

**source**: [Gardens v. Farmers (WA 2024)](https://law.justia.com/cases/washington/supreme-court/2024/101-892-4.html)

---

## anti-concurrent cause (ACC) clauses

insurers counter the concurrent causation doctrine with ACC clauses:

> "We do not insure for loss... regardless of any other cause or event contributing concurrently or in any sequence to the loss."

**effect**: if ANY excluded peril contributed to the damage, coverage is denied — even if a covered peril also contributed.

### ACC enforceability by state

| status | states |
|--------|--------|
| **enforced** | Alabama, Alaska, Arizona, Colorado, DC, Iowa, Massachusetts, Minnesota, Nevada, New Hampshire, South Carolina, Rhode Island |
| **not enforced** | California (conflicts with efficient proximate cause) |
| **unclear** | 30+ states including Florida, Indiana, Texas, New York, Georgia |

**source**: [SSRN: Anti-Concurrent Causation Clauses (2017)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3123507)

### practical effect

| policy has ACC? | concurrent causes | outcome |
|-----------------|-------------------|---------|
| NO | defect + storm | likely COVERED (concurrent cause) |
| YES | defect + storm | DENIED (ACC triggers) |

**check your policy**: look for "regardless of any other cause" language in exclusions.

---

## case law: coverage granted

### Sebo v. American Home Assurance (FL 2016)

**facts**: construction defects in luxury home caused water intrusion. hurricane also caused damage. insurer denied entire claim.

**holding**: Florida Supreme Court ruled concurrent causation applies. when covered and excluded perils combine and no single cause dominates, coverage exists.

**citation**: 208 So. 3d 694 (Fla. 2016)

**relevance**: establishes that defect + covered peril = coverage in Florida (absent ACC clause).

**source**: [Justia](https://law.justia.com/cases/florida/supreme-court/2016/sc14-897.html)

### Gardens Condominium v. Farmers Insurance (WA 2024)

**facts**: faulty roof construction caused inadequate ventilation → condensation → water damage to roof sheathing.

**holding**: Washington Supreme Court ruled ensuing loss exception applies. faulty workmanship caused condensation, but condensation (covered peril) caused the damage.

**citation**: 2024 WL (Wash. 2024)

**relevance**: establishes broad ensuing loss protection — excluded cause can trigger covered cause.

**source**: [Justia](https://law.justia.com/cases/washington/supreme-court/2024/101-892-4.html)

### Travelers v. Poretta (FL 2008)

**facts**: permitted construction, subsequent water damage from defect.

**holding**: court required coverage for water damage as ensuing loss despite construction defect origin.

**citation**: 996 So. 2d 938 (Fla. Dist. Ct. App. 2008)

**relevance**: reinforces ensuing loss doctrine in Florida.

---

## case law: coverage denied

### Bob Robison v. RLI Insurance (8th Cir. 2025)

**facts**: permitted excavation work caused property damage. insured claimed ensuing loss exception.

**holding**: Eighth Circuit denied coverage. insured failed to identify a **separate** covered peril — the damage was caused by the defect itself, not an ensuing covered peril.

**relevance**: ensuing loss requires a **chain**: excluded cause → covered cause → damage. excluded cause → damage directly = no coverage.

**source**: [Missouri Lawyers Media](https://molawyersmedia.com/2025/03/27/insurance-law-builders-risk-policy-coverage-exclusion-ensuing-loss-exception/)

### McCorquodale v. State Farm (CA 2018)

**facts**: unpermitted electrical work caused fire. insurer denied claim.

**holding**: denial upheld. defective (and unpermitted) work directly caused fire.

**citation**: 2018 Cal. App. Unpub. LEXIS 4521

**relevance**: contrast case — shows denial when defect (not ensuing peril) causes damage.

---

## when permitted work claims are denied

| scenario | causation | outcome |
|----------|-----------|---------|
| defective wire → fire | defect caused fire | DENIED |
| defective pipe → leak | defect caused leak | DENIED |
| defective foundation → collapse | defect caused collapse | DENIED |
| defective HVAC → CO poisoning | defect caused poisoning | DENIED |
| defective work + storm → damage | depends on doctrine | DEPENDS |

### the key question

> "Did the defect cause the damage, or did a covered peril cause the damage?"

if the defect **directly** caused the damage → denial is legally valid.

if the defect **caused a covered peril** which then caused damage → ensuing loss may apply.

---

## permit's role in causation disputes

| permit status | what it proves | what it does NOT prove |
|---------------|----------------|----------------------|
| permitted + passed | work was inspected, met code at time | work is defect-free forever |
| permitted + failed | work had deficiencies | (no protection) |
| unpermitted | (no protection) | creates inference of non-compliance |

**permit as evidence**:
- strengthens argument that work was proper
- shifts burden to insurer to prove defect
- does NOT override exclusion if defect exists

**practical value**: permit makes it harder for insurer to prove defect. but if defect is proven, permit does not save the claim.

---

## how to contest a causation denial

### step 1: identify the doctrine

| your state follows... | your argument |
|-----------------------|---------------|
| concurrent causation | covered peril contributed, so coverage applies |
| efficient proximate cause | covered peril was the dominant cause |
| ensuing loss (policy has clause) | defect caused covered peril, which caused damage |

### step 2: check for ACC clause

if policy has ACC language → denial is stronger. you must argue:
- ACC clause is unenforceable (California)
- ACC clause conflicts with state law
- excluded peril did not actually contribute

### step 3: gather evidence

| evidence type | supports |
|---------------|----------|
| permit and inspection records | work met code |
| contractor testimony | work was proper |
| independent engineer report | covered peril caused damage |
| weather records | storm contributed |

### step 4: appeal or litigate

- **internal appeal**: request reconsideration with new evidence
- **department of insurance complaint**: regulatory pressure
- **litigation**: if denial was improper under state law

---

## summary: when causation denial is valid vs contestable

| scenario | denial valid? | contestable? |
|----------|---------------|--------------|
| defect directly caused damage | YES | difficult |
| defect + storm jointly caused damage | DEPENDS | YES (concurrent cause) |
| defect → covered peril → damage | DEPENDS | YES (ensuing loss) |
| ACC clause in policy | YES (most states) | YES (CA, some states) |
| insurer cannot prove defect | NO | YES (burden of proof) |

---

## sources

### case law
- [Sebo v. American Home Assurance (FL 2016)](https://law.justia.com/cases/florida/supreme-court/2016/sc14-897.html)
- [Gardens Condominium v. Farmers Insurance (WA 2024)](https://law.justia.com/cases/washington/supreme-court/2024/101-892-4.html)
- [Bob Robison v. RLI Insurance (8th Cir. 2025)](https://molawyersmedia.com/2025/03/27/insurance-law-builders-risk-policy-coverage-exclusion-ensuing-loss-exception/)
- [Travelers v. Poretta (FL 2008)](https://casetext.com/)

### doctrines
- [Efficient Proximate Cause - Levy von Beck](https://levy-law.com/why-does-the-efficient-proximate-cause-matter-to-your-insurance-claim/)
- [Anti-Concurrent Causation Clauses - SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3123507)
- [Ensuing Loss - IRMI](https://www.irmi.com/articles/expert-commentary/ensuing-loss-getting-around-a-property-policys-defective-construction-exclusion)
- [Concurrent Causation - Fleeson Law](https://fleeson.com/concurrent-causation-doctrine-what-does-it-mean-for-your-insurance-coverage/)

### analysis
- [Florida Supreme Court Clarifies Causation - Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-us/knowledge/publications/9a6c6dbb/florida-supreme-court-clarifies-causation-analysis-for-first-party-claims)
- [Washington Supreme Court Ensuing Loss - Property Insurance Coverage Law Blog](https://www.propertyinsurancecoveragelaw.com/blog/washington-supreme-court-reaffirms-the-broad-nature-of-ensuing-loss-exceptions-to-exclusions/)
- [Faulty Workmanship Coverage Update - Mondaq](https://www.mondaq.com/unitedstates/insurance-laws-and-products/1451828/faulty-workmanship-coverage-update)
- [ACC Clauses in NC - Howard Stallings](https://www.howardstallings.com/deciphering-coverage-the-role-of-concurrent-causation-and-anti-concurrent-causation-clauses-in-north-carolina-property-insurance-claims/)

## .date researched

2026-04-19
