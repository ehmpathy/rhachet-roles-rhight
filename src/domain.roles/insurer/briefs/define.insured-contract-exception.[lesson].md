# define.insured-contract-exception

## .what

the "insured contract" exception can restore GL coverage even when an action over exclusion exists — IF your construction contract includes an indemnification clause AND the insurer hasn't removed the exception.

## .why

- action over exclusion blocks coverage for sub employee injuries
- BUT standard ISO CGL includes exception for "insured contracts"
- indemnification clause in your contract qualifies as "insured contract"
- exception adds back the coverage the exclusion removed
- proven in court: case law supports this mechanism

---

## tl;dr

| step | what happens |
|------|--------------|
| 1 | sub employee injured, sues you |
| 2 | you tender to GC's GL (additional insured) |
| 3 | GL checks: action over exclusion? → YES |
| 4 | GL checks: insured contract exception? → YES |
| 5 | GL checks: indemnification clause in contract? → YES |
| 6 | exception applies → **COVERAGE RESTORED** |

**the indemnification clause triggers the exception that defeats the exclusion.**

---

## how it works

### the exclusion (removes coverage)

action over exclusion says:

> "This insurance does not apply to bodily injury to any employee of the insured, any contractor, or any employee of any contractor..."

**effect**: sub employee injury claim → DENIED.

### the exception (adds coverage back)

standard ISO CGL includes:

> "This exclusion does not apply to liability assumed by the insured under an 'insured contract.'"

**effect**: if liability was assumed in an insured contract → exception applies → coverage restored.

### what qualifies as "insured contract"

ISO CGL defines "insured contract" to include:

> "That part of any other contract or agreement pertaining to your business under which you assume the tort liability of another party to pay for 'bodily injury' or 'property damage' to a third person or organization."

**source**: [IRMI - Contractual Liability and the CGL Policy](https://www.irmi.com/articles/expert-commentary/contractual-liability-and-the-cgl-policy)

### the indemnification clause (triggers the exception)

your contract with GC says:

> "Contractor agrees to indemnify, defend, and hold harmless Owner from and against any and all claims, suits, damages, losses, and expenses related to bodily injury to any person, including but not limited to employees of Contractor or any subcontractor."

**this qualifies because**:
- pertains to GC's business (construction)
- GC assumes tort liability (to defend you)
- covers bodily injury to third persons (sub employees)

---

## case law: where it WORKED (coverage restored)

### Borsheim Builders Supply v. Manger Insurance (N.D. 2018)

**facts**:
- Borsheim (subcontractor) had CGL policy with contractual liability exclusion
- master service contract required Borsheim to indemnify general contractor
- sub employee injured, sued GC
- insurer denied coverage under contractual liability exclusion

**court held**:
- master service contract qualified as "insured contract"
- contract pertained to Borsheim's business
- Borsheim assumed tort liability of GC
- **insured contract exception applied → coverage restored**

> "The master service contract fell within the CGL policy's definition of an 'insured contract' because it pertained to the insured's business, the insured assumed tort liability, and the insured contract exception to the contractual liability exclusion applied."

**source**: [Justia - Borsheim Builders Supply v. Manger Insurance (2018)](https://law.justia.com/cases/north-dakota/supreme-court/2018/20180082.html)

### US Liability Insurance v. Benchmark Construction (1st Cir. 2015)

**facts**:
- Benchmark (GC) hired to renovate home
- architect hired decorator, decorator's employee injured
- insurer denied coverage under employer's liability exclusion
- exclusion language was ambiguous

**court held**:
- First Circuit (with former Justice Souter) reversed summary judgment
- found exclusion language ambiguous
- "contractor" in exclusion meant only those hired directly by policyholder
- coverage should apply to claims by employees of parties not hired directly

> "The court rejected the insurer's interpretation, finding the term 'contractor' ambiguous since it was undefined in the policy and subject to more than one reasonable interpretation."

**source**: [FindLaw - US Liability v. Benchmark Construction (2015)](https://caselaw.findlaw.com/court/us-1st-circuit/1710415.html)

### Florida Fourth District (indemnity + partial causation)

**court held**:
- indemnity agreement qualifies as "insured contract" when indemnitee's negligence caused injury
- **so long as named insured caused "some part" of injuries or is vicariously liable**

> "An indemnity agreement can be an 'insured contract' under the policy where the injury is caused by the indemnitee's negligence, so long as the named insured caused some part of the injuries or damages or is otherwise vicariously liable."

**source**: [Florida Construction Legal Updates - Contractual Liability Exclusion](https://www.floridaconstructionlegalupdates.com/contractual-liability-exclusion-in-cgl-policies-and-insured-contract-exception/)

---

## case law: where it FAILED (coverage denied)

### Pioneer Central School District v. Preferred Mutual (N.Y.)

**facts**:
- school district sought coverage under cleaning company's CGL
- cleaning company had indemnification agreement with school
- person slipped on ice, sued school
- school tendered to cleaning company's GL

**court held**:
- cleaning company did NOT cause the injury (ice on ground)
- policy required claim "caused, in whole or in part" by named insured
- merely "furnishing the occasion" for injury ≠ proximate cause
- **insured contract exception did NOT apply → coverage denied**

> "Coverage for 'insured contracts' only extended to claims 'caused, in whole or in part' by the named insured. The named insured did not proximately cause the injury."

**source**: [HNRK - No Additional Insured or Insured Contract Coverage](https://www.hnrklaw.com/HNRK-Coverage-Corner-Blog/no-additional-insured-or-insured-contract-coverage-under-cgl-policy-where-injuries-not-proximately-caused-by-the-named-insured)

### Mt. Hawley Insurance v. Huser Construction (TX Federal)

**facts**:
- insurer added "breach of contract exclusion" endorsement to CGL
- GC sought coverage for claim
- insurer denied based on endorsement

**court held**:
- endorsement explicitly removed insured contract coverage
- **endorsement overrode standard exception → coverage denied**

**source**: [MDJW Law - Federal Court Applies Breach of Contract Exclusion](https://www.mdjwlaw.com/newsroom/news/TIN-20190326-item1)

### Admiral Insurance v. Tocci (MA 2022)

**facts**:
- faulty workmanship claim
- contractor sought CGL coverage
- indemnification clause existed

**court held**:
- faulty workmanship = not an "occurrence" (not accidental)
- no coverage trigger regardless of indemnification
- **no occurrence = no coverage → denied**

**source**: [Insurance Business - Admiral v. Tocci](https://www.insurancebusinessmag.com/us/news/claims/court-rules-admiral-insurance-may-be-liable-for-faulty-construction-damages-under-cgl-policy-533189.aspx)

---

## summary: approved vs denied

| case | state | outcome | why |
|------|-------|---------|-----|
| Borsheim v. Manger | N.D. | **APPROVED** | contract qualified, exception intact |
| US Liability v. Benchmark | 1st Cir. | **APPROVED** | exclusion ambiguous, coverage applied |
| Florida 4th District | FL | **APPROVED** | named insured caused "some part" |
| Pioneer v. Preferred | N.Y. | **DENIED** | named insured didn't cause injury |
| Mt. Hawley v. Huser | TX | **DENIED** | endorsement removed exception |
| Admiral v. Tocci | MA | **DENIED** | no "occurrence" — workmanship not accidental |

---

## the causation requirement: secret subs

### the problem

some policies require the named insured to have "caused, in whole or in part" the injury. if GC brought a secret sub, did GC "cause" the injury?

### the argument FOR causation (coverage should apply)

| GC's action | causation argument |
|-------------|-------------------|
| brought uninsured sub onto site | created the risk |
| failed to verify sub's comp/GL | negligent hire — knew or should have known |
| didn't supervise who was on site | retained control, failed to exercise it |

**negligent hire = "caused some part"**:

> "A general contractor may be liable for hiring a subcontractor that they knew, or should have known, had a poor safety history or was otherwise unfit for the job."

**source**: [Maggiano Law - GC Liability for Subcontractor Negligence](https://www.maggianolaw.com/blog/when-general-contractors-are-liable-for-subcontractor-negligence/)

### the argument AGAINST causation (Pioneer approach)

| factor | court logic |
|--------|-------------|
| GC didn't cause the physical injury | sub's act caused it |
| GC merely "furnished the occasion" | not proximate cause |
| policy requires direct causation | use of sub ≠ cause of injury |

### untested question

**no court has directly ruled**: does use of a secret uninsured sub = "caused, in whole or in part" for insured contract exception purposes?

the strongest argument: **negligent hire IS the negligent act** — GC's decision to use uninsured sub without verification is the proximate cause, not merely "furnishing the occasion."

---

## key principle from case law

> "In certain cases, courts have interpreted a CGL policy's employers liability exclusion in a way that would defeat coverage for a general contractor and other upstream parties sued by a downstream subcontractor's employees, which contradicts the parties' fundamental expectations and frustrates the intended risk transfer."

**source**: [IRMI - Misapplication of Employers Liability Exclusion](https://www.irmi.com/articles/expert-commentary/misapplication-of-the-employers-liability-exclusion-in-cgl-policies-precluding-coverage-for-non-employer-insureds)

---

## the mechanism step by step

```
STEP 1: SUB EMPLOYEE INJURED
              │
              ▼
STEP 2: EMPLOYEE SUES YOU + GC
              │
              ▼
STEP 3: YOU TENDER TO GC's GL (as additional insured)
              │
              ▼
STEP 4: INSURER CHECKS — action over exclusion?
              │
              ▼
             YES
              │
              ▼
STEP 5: INSURER CHECKS — insured contract exception?
              │
     ┌────────┴────────┐
     ▼                 ▼
    YES               NO
     │            (removed by
     │            endorsement)
     ▼                 │
STEP 6: INSURER        │
CHECKS — does your     │
contract have          │
indemnification?       │
     │                 │
     ▼                 │
    YES                │
     │                 │
     ▼                 ▼
EXCEPTION          DENIED
APPLIES            (no coverage)
     │
     ▼
COVERAGE
RESTORED
     │
     ▼
GC's GL DEFENDS YOU
```

---

## what makes this work

### three requirements

| requirement | what to verify |
|-------------|----------------|
| 1. insured contract exception exists | not removed by endorsement |
| 2. indemnification clause in contract | GC assumes your tort liability |
| 3. clause covers sub employee injuries | language is broad enough |

### sample indemnification clause

> "Contractor agrees to defend, indemnify, and hold harmless Owner from and against any and all claims, demands, suits, judgments, losses, damages, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:
>
> (a) any bodily injury or death of any person, including but not limited to employees of Contractor, employees of any subcontractor, or any other person;
>
> (b) any property damage;
>
> arising out of or in connection with the performance of the Work, whether caused by Contractor, any subcontractor, or any person directly or indirectly employed by them."

---

## risks that defeat this mechanism

### endorsements that remove the exception

| endorsement | effect |
|-------------|--------|
| removes "insured contract" definition | no contracts qualify |
| amends exception language | narrows what triggers it |
| adds "anti-indemnity" language | exception doesn't apply |

**source**: [Construction Executive - Contractual Liability Exclusion](https://constructionexec.com/article/contractual-liability-exclusion-and-the-insured-contract-exception/)

### state anti-indemnity statutes (varies by state)

most states have anti-indemnity statutes that limit or void indemnification clauses in construction. **this directly affects whether insured contract exception works.**

**source**: [Saxe Doernberger - Construction Anti-Indemnity Statutes](https://www.sdvlaw.com/surveys/construction-anti-indemnity-statutes/)

### three categories of states

| category | what it means | states |
|----------|---------------|--------|
| **no statute** | indemnity clauses fully enforceable | minority of states |
| **sole negligence void** | can't indemnify for indemnitee's SOLE fault | AZ, CO, CT, FL, GA, ID, IL, IN, KS, MD, MI, MN, MO, NC, NE, NJ, NV, OH, OR, PA, SC, SD, TN, UT, VA, WA, WI |
| **any negligence void** | can't indemnify for indemnitee's ANY fault | AK, CA, DE, HI, LA, MS, MT, NM, NY, OK, TX, WV |

**source**: [MWL Law - Anti-Indemnity Statutes in All 50 States (PDF)](https://www.mwl-law.com/wp-content/uploads/2013/03/Anti-Indemnity-Statutes-In-All-50-States-00131938.pdf)

### states that also restrict additional insured

10 states extend anti-indemnity to contractual requirements for additional insured coverage:

| state | restriction |
|-------|------------|
| New Mexico | explicit statutory restriction |
| Oklahoma | explicit statutory restriction |
| Texas | explicit statutory restriction |
| + 7 others | by court interpretation |

**source**: [Smith Currie - State Limitations on Indemnity](https://www.smithcurrie.com/publications/common-sense-contract-law/different-states-impose-different-limitations-on-indemnity-and-additional-insured-provisions/)

### key state details

| state | rule | impact on insured contract exception |
|-------|------|-------------------------------------|
| **California** | void if indemnity covers indemnitee's active negligence | clause may be partially void → exception may not fully apply |
| **New York** | Labor Law makes owner/GC liable regardless of fault | indemnity limited; exception less useful |
| **Texas** | Anti-Indemnity Act voids broad indemnity in construction | clause may be void → exception fails |
| **Florida** | sole negligence indemnity void | partial indemnity OK → exception may work |
| **Illinois** | sole negligence indemnity void | partial indemnity OK → exception may work |

### insurance contract carve-out

some states carve out insurance from anti-indemnity:

> "The Act does not apply to construction bonds or insurance contracts or agreements."

**meaning**: even if indemnity clause is void, requirement to procure insurance (additional insured) may still be enforceable.

**source**: [IRMI - Contractual Insurance Requirements and Anti-Indemnity Statutes](https://www.irmi.com/articles/expert-commentary/contractual-insurance-requirements-and-anti-indemnity-statutes)

### bottom line by state type

| state type | insured contract exception likely to work? |
|------------|-------------------------------------------|
| no anti-indemnity statute | **YES** — full indemnity enforceable |
| sole negligence void only | **MAYBE** — depends on who was negligent |
| any negligence void | **UNLIKELY** — most clauses void |
| insurance carve-out exists | **YES** — for additional insured, not indemnity |

**if clause is void under state law**: it doesn't qualify as "insured contract."

### clause too narrow

| clause says | result |
|-------------|--------|
| "indemnify for Contractor's negligence" | may not cover sub's negligence |
| "indemnify for employees of Contractor" | may not cover sub employees |
| "indemnify for claims by third parties" | sub employees = third parties? ambiguous |

**recommendation**: use broad language that explicitly includes "employees of any subcontractor."

---

## verification checklist

### before work starts

| item | verified? |
|------|-----------|
| GC's GL policy has insured contract exception | ☐ |
| exception has NOT been removed by endorsement | ☐ |
| your contract includes indemnification clause | ☐ |
| clause explicitly covers sub employee injuries | ☐ |
| clause is enforceable under state law | ☐ |
| broker confirmed in text | ☐ |

### questions for GC's broker

> "Please confirm:
> 1. The CGL policy contains the standard insured contract exception to the employers liability exclusion.
> 2. This exception has not been modified or removed by endorsement.
> 3. An indemnification clause in our construction contract would qualify as an 'insured contract' under the policy definition.
> 4. If such indemnification clause exists, the employers liability exclusion would not apply to claims by employees of subcontractors."

---

## key takeaways

| question | answer |
|----------|--------|
| does this mechanism have legal precedent? | **YES** — approved in Borsheim (N.D.), Benchmark (1st Cir.), FL 4th Dist. |
| has it also been denied? | **YES** — denied in Pioneer (N.Y.), Mt. Hawley (TX), Admiral (MA) |
| what triggers the exception? | indemnification clause + exception intact + causation satisfied |
| what defeats it? | exception removed, clause void under state law, no causation, no occurrence |
| does it vary by state? | **YES** — anti-indemnity statutes in most states limit or void clauses |
| secret sub = causation? | **UNTESTED** — strong argument that negligent hire = "caused some part" |
| how to verify? | broker confirmation in text + contract review + state law check |
| is this reliable? | **DEPENDS** — works in some states/cases, fails in others |

---

## sources

### case law — coverage approved
1. [Justia - Borsheim Builders Supply v. Manger Insurance (N.D. 2018)](https://law.justia.com/cases/north-dakota/supreme-court/2018/20180082.html)
2. [FindLaw - US Liability v. Benchmark Construction (1st Cir. 2015)](https://caselaw.findlaw.com/court/us-1st-circuit/1710415.html)
3. [Florida Construction Legal Updates - Contractual Liability Exclusion](https://www.floridaconstructionlegalupdates.com/contractual-liability-exclusion-in-cgl-policies-and-insured-contract-exception/)
4. [Hunton - North Dakota Supreme Court Clarifies Contractual Liability](https://www.hunton.com/hunton-insurance-recovery-blog/north-dakota-supreme-court-clarifies-breadth-of-contractual-liability-coverage)
5. [Hunton - First Circuit Limits Employer Liability Exclusion](https://www.hunton.com/hunton-insurance-recovery-blog/first-circuit-limits-scope-of-cgl-policys-employer-liability-exclusionary-endorsement)

### case law — coverage denied
6. [HNRK - Pioneer Central School District (No Coverage Without Causation)](https://www.hnrklaw.com/HNRK-Coverage-Corner-Blog/no-additional-insured-or-insured-contract-coverage-under-cgl-policy-where-injuries-not-proximately-caused-by-the-named-insured)
7. [MDJW Law - Mt. Hawley v. Huser (Breach of Contract Exclusion)](https://www.mdjwlaw.com/newsroom/news/TIN-20190326-item1)
8. [Insurance Business - Admiral v. Tocci (No Occurrence)](https://www.insurancebusinessmag.com/us/news/claims/court-rules-admiral-insurance-may-be-liable-for-faulty-construction-damages-under-cgl-policy-533189.aspx)

### insured contract analysis
9. [IRMI - Contractual Liability and the CGL Policy](https://www.irmi.com/articles/expert-commentary/contractual-liability-and-the-cgl-policy)
10. [IRMI - In Defense of Insured Contracts](https://www.irmi.com/articles/expert-commentary/in-defense-of-insured-contracts)
11. [Construction Executive - Contractual Liability Exclusion](https://constructionexec.com/article/contractual-liability-exclusion-and-the-insured-contract-exception/)
12. [Construction Risk - Insured Contract Exception](https://www.constructionrisk.com/2019/02/insured-contract-exception-to-contractual-liability-exclusion/)

### employers liability exclusion
13. [IRMI - Employers Liability Exclusion in CGL](https://www.irmi.com/articles/expert-commentary/employers-liability-exclusion-in-the-cgl-policy)
14. [IRMI - Misapplication of Employers Liability Exclusion](https://www.irmi.com/articles/expert-commentary/misapplication-of-the-employers-liability-exclusion-in-cgl-policies-precluding-coverage-for-non-employer-insureds)

### state anti-indemnity statutes
15. [Saxe Doernberger - Construction Anti-Indemnity Statutes](https://www.sdvlaw.com/surveys/construction-anti-indemnity-statutes/)
16. [MWL Law - Anti-Indemnity Statutes in All 50 States (PDF)](https://www.mwl-law.com/wp-content/uploads/2013/03/Anti-Indemnity-Statutes-In-All-50-States-00131938.pdf)
17. [Smith Currie - State Limitations on Indemnity](https://www.smithcurrie.com/publications/common-sense-contract-law/different-states-impose-different-limitations-on-indemnity-and-additional-insured-provisions/)
18. [IRMI - Contractual Insurance Requirements and Anti-Indemnity Statutes](https://www.irmi.com/articles/expert-commentary/contractual-insurance-requirements-and-anti-indemnity-statutes)

### negligent hire / causation
19. [Maggiano Law - GC Liability for Subcontractor Negligence](https://www.maggianolaw.com/blog/when-general-contractors-are-liable-for-subcontractor-negligence/)

## .date researched

2026-04-19
