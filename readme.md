# 🦅 rhachet-roles-rhight

legal rights roles and skills, via [rhachet](https://github.com/ehmpathy/rhachet)

## purpose

rhight = rights + right

this repo provides roles for legal research, analysis, and preparation:
- legal rights — what you're entitled to
- what's right — the correct interpretation (legally, intentionally, morally)
- who's right — dispute resolution

law is code. rules that govern behavior, enforced by systems. these roles help navigate that code.

## install

```sh
npm install rhachet-roles-rhight
```

## roles

### 🏔️ patenter

- **scale**: invention-level, intellectual property
- **focus**: prior art research, claim structure, prosecution strategy
- **maximizes**: defensible patent positions with clear novelty

used to research prior art, distill patent proposals, and prepare materials for patent applications.

### 🪶 copyrighter

- **scale**: creative work-level, intellectual property
- **focus**: originality analysis, fair use, license terms
- **maximizes**: protection of creative expression

used to analyze copyright protection, fair use boundaries, and license terms.

### 🪖 trademarker

- **scale**: brand-level, intellectual property
- **focus**: distinctiveness, likelihood of confusion, registration
- **maximizes**: brand identity protection

used to research trademark conflicts, assess distinctiveness, and prepare registration materials.

### 🔗 regulator

- **scale**: jurisdiction-level, compliance
- **focus**: local, state, federal, global regulations
- **maximizes**: compliance with bounded social contracts

used to evaluate regulatory requirements and ensure compliance across jurisdictions.

### 🔒 obligator

- **scale**: contract-level, terms
- **focus**: duties, deliverables, performance terms
- **maximizes**: clear and enforceable obligations

used to review and draft contract terms that secure duties and commitments.

### 🦺 indemnifier

- **scale**: contract-level, risk
- **focus**: liability, indemnification, hold-harmless
- **maximizes**: protection against claims

used to review and draft protective clauses that shield against liability.

### ⚖️ counselor

- **scale**: exposure-level, coordination
- **focus**: holistic contract review, risk assessment
- **maximizes**: balanced legal protection

used to coordinate obligator and indemnifier for comprehensive exposure review.

## skills

### `patent.priors.search`

search for relevant patents by keyword query.

```sh
rhx patent.priors.search --query "neural network model compression"
rhx patent.priors.search --query "ML model optimization" --since 2020-01-01 --limit 5
```

### `patent.priors.fetch`

fetch full patent contents by external identifier.

```sh
rhx patent.priors.fetch --exid US20210234567A1
```

### `patent.propose`

instantiate a patent proposal route with structured stones.

```sh
rhx patent.propose
rhx patent.propose --open nvim
rhx patent.propose --open code
```

creates a route with:
- `0.idea.md` — invention description template
- `1.vision.stone` — patent goals
- `3.1.research.prior-art.favorable.stone` — favorable prior art
- `3.1.research.prior-art.adverse.stone` — adverse prior art
- `3.2.distill.claims.prior-art.stone` — prior art analysis
- `3.2.distill.claims.patentable.stone` — novel claim identification
- `3.2.distill.strategy.officeactions.stone` — prosecution preparation
- `3.3.blueprint.patent.stone` — application structure
- `5.1.deliver.patent.latex.stone` — formal output

## mascot

this repo houses the eagle 🦅 — who soars above the landscape to survey the terrain and spot what matters from above.

why eagles? because they embody the principles of good legal work:

1. 🦅 soar high — see the full landscape
2. 👁️ sharp vision — spot the details that matter
3. 🪶 precise — strike with accuracy
4. 🏔️ claim peaks — identify what's defensible

the eagle wields:
- 🏔️ mountain — for patenter — to claim the peaks of novelty
- 🪶 feather — for copyrighter — to protect the written word
- 🪖 helm — for trademarker — to guard the brand in battle
- 🔗 chainlink — for regulator — to compose the bounds of social contracts
- 🔒 lock — for obligator — to secure the duties and terms
- 🦺 vest — for indemnifier — to protect against claims and liability
- ⚖️ scales — for counselor — to weigh exposure and guide review

## note

this package is private. used internally via local link.

one day, we hope to opensource these roles to help others navigate legal systems more effectively. for now, this repo remains private to avoid exposure while we refine the approach.
