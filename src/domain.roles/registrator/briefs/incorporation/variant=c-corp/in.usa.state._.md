# in.usa.state._

## .what

a U.S. corporation can incorporate in any state, regardless of where it operates.
this brief explains why states compete for incorporations, and how to choose.

---

## .why states compete

### the franchise tax revenue model

states earn revenue from corporations through:
- initial formation fees
- annual franchise taxes
- registered agent requirements

> "Delaware charges LLCs a flat annual franchise tax of $300, regardless of revenue, even if the business is inactive."
>
> — [Wolters Kluwer](https://www.wolterskluwer.com/en/expert-insights/why-incorporate-in-delaware-or-nevada)

more incorporations, more revenue — hence competition.

### the legal framework product

states differentiate through:
- corporate law statutes
- court systems
- privacy protections
- tax treatment

the "product" is the legal environment; corporations shop for the best fit.

---

## .why incorporate out-of-state

### separate legal domicile from operations

| concept | definition |
|---------|------------|
| state of incorporation | where the corp legally exists |
| state of operation | where the corp does business |
| foreign qualification | permission to operate in another state |

a Delaware corp that operates in California must:
1. incorporate in Delaware (domicile)
2. foreign-qualify in California (operations)
3. comply with both states' requirements

### reasons to separate

| reason | explanation |
|--------|-------------|
| legal framework | access to better corporate law |
| court system | specialized judges, predictable outcomes |
| privacy | some states do not publish officer names |
| tax structure | avoid state income tax on out-of-state operations |
| investor expectations | VCs expect Delaware |

---

## .the big three: delaware, nevada, wyoming

### delaware

the dominant choice. over 65% of Fortune 500 companies incorporate here.

| attribute | delaware |
|-----------|----------|
| court system | Court of Chancery — specialized corporate judges, no juries |
| legal precedent | 200+ years of corporate case law |
| franchise tax | ⚠️ **$85,165/year** at a 10,000,000-share charter, unless elected down — see the matrix caution below |
| state income tax | 8.7% on Delaware-sourced income — but see [30 Del. C. § 1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html): a corp with a DE statutory office and **no** DE business is **exempt** |
| privacy | officers/directors not disclosed in formation docs |

> "The judges are experts in corporate law, and their decisions tend to be more predictable than those in other states, partly because the court operates without juries."
>
> — [Stripe](https://stripe.com/resources/more/incorporating-in-delaware-vs-other-states-differences-and-key-considerations)

> "Many investors and venture capitalists see incorporation in Delaware as a sign of a business's credibility and stability."
>
> — [LegalZoom](https://www.legalzoom.com/articles/incorporating-in-delaware-advantages-and-disadvantages)

### nevada

positions itself as a tax-free alternative with strong privacy.

| attribute | nevada |
|-----------|--------|
| court system | standard state courts |
| legal precedent | less developed than Delaware |
| franchise tax | 🚩 **unverified** — NV levies a State Business License and a Commerce Tax |
| state income tax | none |
| privacy | 🚩 strong — no public disclosure of shareholders *(not checked)* |

> "Nevada has positioned itself as a business-friendly alternative with tax advantages and more sophisticated legal frameworks than Wyoming, with no state corporate income tax and no taxes on corporate shares."
>
> — [NCH Inc](https://nchinc.com/compare-your-state/wyoming/vs-delaware)

- ⚠️ that cite is an incorporation-service **vendor** — a party with a commercial interest in the answer, the weakest provenance for a state's tax posture
- ⛔ it says *"no state corporate **income** tax"* and *"no taxes on corporate **shares**"* — narrower than *"no franchise tax"*. Nevada's annual charges run through a **State Business License** and a **Commerce Tax** on gross revenue above a threshold, which the quote does not address
- 🚩 no Nevada figure here has a state source. formation fees are computed from authorized stock (the Secretary of State ships a calculator), so the cost comparison below is unresolved

### wyoming

the low-cost, minimal-regulation option.

| attribute | wyoming |
|-----------|---------|
| court system | standard state courts |
| legal precedent | limited |
| franchise tax | ⚠️ **an Annual Report License tax — a $60.00 FLOOR** on WY-situs assets |
| state income tax | none |
| privacy | 🚩 strong — no public disclosure requirements *(not checked)* |

> "\*Annual Report **License tax** is $60 or two-tenths of one mill on the dollar
> ($.0002) whichever is **greater** based on the company's assets located and
> employed in the state of Wyoming."
>
> — [WY SoS fee schedule](https://sos.wyo.gov/forms/business/feeschedule.pdf), effective 2026-07-01 · bytes at `../refs/effectiveAt=2026-07-01.wy-sos-business-fee-schedule.txt`

- the schedule prints one number, $60, and it is a floor, not a range. a `~$50–60` range has no source
- a "license tax" is still an annual entity tax — never summarize it as "no franchise tax"

> "Wyoming is widely regarded as the most business-friendly state due to its low costs, minimal regulations, and strong privacy protections."
>
> — [Nomad Capitalist](https://nomadcapitalist.com/finance/new-mexico-vs-wyoming-llc-comparison/)

---

## .comparison matrix

| attribute | delaware | nevada | wyoming | home state |
|-----------|----------|--------|---------|------------|
| **franchise tax** | ⚠️ **$85,165** at a normal startup charter — see below | 🚩 unverified (Business License + Commerce Tax) | $60 floor, asset-based | varies |
| **state income tax** | 8.7% (in-state) | none | none | varies |
| **court system** | specialized | standard | standard | standard |
| **legal precedent** | extensive | moderate | limited | varies |
| **VC preference** | strong | weak | weak | weak |
| **privacy** | good | strong | strong | varies |
| **total cost (small corp)** | 🚩 ~$500/year — **only if you elect** | ~$200/year 🚩 | ~$100/year 🚩 | varies |

### ⚠️ the Delaware franchise tax default

`$175` is the floor of the **authorized shares** method and applies **only at
≤5,000 authorized shares**. Delaware bills on that method **by default**.

| method | minimum | 10,000,000-share charter |
|--------|---------|--------------------------|
| authorized shares §503(a)(1) — **the default** | $175 (≤5,000 shares only) | **$85,165.00** |
| assumed par value §503(a)(2) — **elected** | $400 | $400, at $0.0001 par |

- ⛔ the `~$500/year` total-cost cell is the **elected** outcome. compared off this row, Delaware's best case meets the others' ordinary case
- a `$175–$200K` range hides this: $85,165 sits inside it, every figure true, the default absent
- run `rhx franchise.tax.delaware` against your real charter before you budget from any cell

### 🚩 the non-Delaware cost cells are unverified

`~$200/year` and `~$100/year` come from secondary research — the same class that produced a fabricated `$89` Delaware formation fee elsewhere in this role. treat the matrix as a shortlist, and confirm each figure against that state's own fee schedule before a decision.

---

## .pros and cons

### incorporate in delaware

**pros:**
- predictable corporate law
- expert judges in Court of Chancery
- VCs expect and prefer it
- extensive case law reduces legal uncertainty
- no state tax on out-of-state operations

**cons:**
- franchise tax — ⚠️ **$85,165/year** at a 10,000,000-share charter unless you
  elect the assumed-par-value method; `$175` is a floor that needs ≤5,000
  authorized shares
- must hire Delaware registered agent
- must foreign-qualify in operational states (duplicate compliance)
- legal disputes require Delaware counsel

> "If the corporation must still comply with that state's applicable requirements for foreign entities, this can result in duplicate obligations and costs."
>
> — [LegalZoom](https://www.legalzoom.com/articles/incorporating-in-delaware-advantages-and-disadvantages)

### incorporate in nevada or wyoming

⛔ the two states do not share an answer on the tax line:

| claim | Wyoming | Nevada |
|---|---|---|
| no franchise tax | ⛔ **false** — an asset-based **license tax**, $60 floor | 🚩 unverified — NV has a State Business License and a Commerce Tax |
| no state income tax | ✅ | ✅ |
| lower total cost | ✅ **$100.00** formation, cited | ⛔ formation is **stock-based** — the state ships a calculator |

**pros (Wyoming — checked against the state's own fee schedule):**
- ⚠️ **an asset-based license tax with a $60.00 floor**, *not* "no franchise tax"
- no state income tax
- 🚩 strong privacy protections — *not checked*
- ✅ **$100.00** formation, cited

**pros (Nevada — 🚩 NOT checked against any state source):**
- 🚩 franchise-tax posture unverified
- no state income tax
- 🚩 strong privacy protections — *not checked*
- ⛔ **formation is a function of authorized stock**, so "lower total cost" cannot be claimed without your charter

for an entity operated elsewhere, with ~$0 of WY-situs assets, the Wyoming tax lands on the $60 floor. a reader who moves assets into Wyoming on the strength of *"no franchise tax"* is unprotected.

**cons (both):**
- less developed case law
- no specialized corporate court
- VCs may question the choice
- still must foreign-qualify in operational states

### incorporate in home state

**pros:**
- no foreign qualification needed
- simpler compliance (one state)
- lower total cost for small operations
- local counsel available

**cons:**
- may lack corporate law sophistication
- less predictable court outcomes
- higher state taxes in some states
- may deter sophisticated investors

---

## .decision framework

```
do you plan to raise VC?
├── yes → Delaware (VCs expect it)
└── no
    ├── do you operate in one state only?
    │   ├── yes → home state (simpler)
    │   └── no → continue
    └── do you want to minimize cost?
        ├── yes → Wyoming
        └── no
            ├── want privacy + low tax? → Nevada (🚩 verify its taxes first)
            └── want legal certainty? → Delaware
```

---

## .the fundamental tradeoff

| factor | delaware | low-cost states | home state |
|--------|----------|-----------------|------------|
| legal certainty | high | low | varies |
| cost | high | low | varies |
| VC compatibility | high | low | low |
| compliance burden | high (dual) | high (dual) | low (single) |

> "Large corporations typically derive the greatest advantage from Delaware, especially those with complex structures, multiple investors, or plans for significant growth. For small businesses that are not planning to attract venture capital or go public, the simplicity and cost-effectiveness of incorporating in their home state might outweigh the benefits."
>
> — [Silicon Valley Bank](https://www.svb.com/startup-insights/vc-relations/why-incorporate-in-delaware/)

---

## .sources

1. [LegalZoom: Incorporating in Delaware](https://www.legalzoom.com/articles/incorporating-in-delaware-advantages-and-disadvantages)
2. [Stripe: Incorporating in Delaware vs Other States](https://stripe.com/resources/more/incorporating-in-delaware-vs-other-states-differences-and-key-considerations)
3. [Silicon Valley Bank: Why Incorporate in Delaware](https://www.svb.com/startup-insights/vc-relations/why-incorporate-in-delaware/)
4. [Wolters Kluwer: Why Incorporate in Delaware or Nevada](https://www.wolterskluwer.com/en/expert-insights/why-incorporate-in-delaware-or-nevada)
5. [NCH Inc: Wyoming vs Delaware](https://nchinc.com/compare-your-state/wyoming/vs-delaware)
6. [Nomad Capitalist: State Comparison](https://nomadcapitalist.com/finance/new-mexico-vs-wyoming-llc-comparison/)
7. [WY SoS fee schedule](https://sos.wyo.gov/forms/business/feeschedule.pdf) — effective 2026-07-01
