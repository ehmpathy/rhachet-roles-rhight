# define.entity-types-catalog

## .what

a catalog of common U.S. business entity forms: C-corp, S-corp, B-corp, and LLC —
each with distinct tax treatment, liability protection, compliance burden, and
fundraise fit. ⚠️ they are not four of the same thing; see
*these four are NOT four of the same thing*, below.

---

## C-corporation

the default corporate form. a separate legal entity taxed at the corporate level.

### characteristics

| attribute | C-corp |
|-----------|--------|
| tax treatment | corporate tax on profit, then a **second** tax on dividends **when distributed** |
| liability | limited — shareholders protected |
| owners | unlimited shareholders, no restrictions |
| stock classes | multiple classes allowed |
| fundraise | preferred by VCs — can issue preferred stock |

### when to choose

- plan to raise venture capital
- want multiple stock classes (common, preferred)
- have international or corporate shareholders
- plan to go public eventually

### source

> "Unlike sole proprietors, partnerships, and LLCs, corporations pay income tax on their profits. **In some cases**, corporate profits are taxed twice — first, when the company makes a profit, and again when dividends are paid to shareholders on their personal tax returns."
>
> — [Wolters Kluwer](https://www.wolterskluwer.com/en/expert-insights/s-corp-vs-c-corp-differences-benefits)

⚠️ "in some cases" is the qualifier a flat "double tax" drops. the second layer lands on a **distribution**; a corporation that retains earnings pays the corporate tax and no more. so the C-corp suits a company that reinvests, and not one that pays its owner out.

---

## S-corporation

a tax election (not a separate entity type) that allows pass-through tax treatment for corporations.

### characteristics

| attribute | S-corp |
|-----------|--------|
| tax treatment | pass-through — no corporate tax, profits/losses flow to shareholders |
| liability | limited — shareholders protected |
| owners | **≤100 shareholder units**, and a family counts as **one** — §1361(c)(1) |
| owner types | individuals, **plus estates, certain trusts, and certain exempt organizations** — §1361(b)(1)(B). ⛔ no nonresident alien, no corporation, no partnership |
| stock classes | one class — but **vote differences are disregarded** (§1361(c)(4)) and **straight debt is not a second class** (§1361(c)(5)) |
| fundraise | limited — cannot have corporate or foreign shareholders |

### requirements — the statute, not a paraphrase

§1361(b)(1) defines a "small business corporation" as a **domestic** corporation
which is **not an ineligible corporation** and which does **not**—

> "(A) have more than 100 shareholders,
> (B) have as a shareholder a person (**other than an estate, a trust described
> in subsection (c)(2), or an organization described in subsection (c)(6)**) who
> is not an individual,
> (C) have a nonresident alien as a shareholder, and
> (D) have more than 1 class of stock."
>
> — [26 U.S.C. §1361(b)(1)](https://www.law.cornell.edu/uscode/text/26/1361)

### ⛔ the four tests each carry a carve-out the vendor summaries drop

| the summary says | the statute says |
|---|---|
| "U.S. **individuals only**" | **(b)(1)(B) names three exceptions in its own parenthesis** — an estate, a **(c)(2)** trust, a **(c)(6)** organization |
| "max **100** shareholders" | **(c)(1)** — "there shall be treated as one shareholder … a husband and wife (and their estates), and all members of a family (and their estates)". a family spans a **common ancestor** and every lineal descendant, capped at **6 generations** |
| "**one class** only" | **(c)(4)** — a corporation "shall not be treated as having more than 1 class of stock solely because there are differences in voting rights among the shares of common stock". **(c)(5)** — "straight debt shall not be treated as a second class of stock" |
| (unstated) | **(b)(1)** also requires a **domestic** corporation, and **(b)(2)** excludes exactly three kinds: a §585-reserve-method financial institution, an insurance company under subchapter L, and "**a DISC or former DISC**" |

⭐ **(c)(4) changes a founder's plan:** voting and non-voting **common** stock is a single class, so a founder may keep control without loss of the election.

### the trusts and organizations that MAY hold

- **(c)(2)(A)** — six kinds of trust: a grantor trust owned by a U.S. citizen or resident; that same trust for **2 years** after the owner's death; a testamentary trust for **2 years** after transfer; a voting trust; an **electing small business trust (ESBT)**; a bank IRA
- **(c)(3)** — "estate" includes the estate of an individual **in bankruptcy**
- **(c)(6)** — an organization "described in section 401(a) or 501(c)(3)" and exempt under §501(a): a **qualified retirement plan trust** or a **charity**
- ⚠️ **(c)(2)(B)(v)** — each potential current beneficiary of an ESBT is treated as a shareholder, then: "**This clause shall not apply for purposes of subsection (b)(1)(C)**." so a nonresident-alien ESBT beneficiary does not itself break (b)(1)(C)

### election process

file **IRS Form 2553**, with the consent of **all persons who are shareholders
on the day the election is made** (§1362(a)(2)). §1362(b)(1) gives **two**
windows:

> "(A) at any time **during the preceding taxable year**, or
> (B) at any time during the taxable year and on or before the **15th day of the
> 3d month** of the taxable year."
>
> — [26 U.S.C. §1362(b)(1)](https://www.law.cornell.edu/uscode/text/26/1362)

### ⛔ "75 days, or March 15" is wrong three ways

| the usual wording | what §1362 provides |
|---|---|
| "within **75 days**" | the measure is the **15th day of the 3d month of the taxable year** — a date, not a duration. it is on or about March 15 **only for a calendar-year taxpayer**; a fiscal-year corporation gets a different date entirely |
| "or you wait a year" | **(b)(3)** — an election made after the deadline "shall be treated as made for the **following** taxable year". it is not void |
| (unstated) | **(b)(5)** — where "the Secretary determines that there was **reasonable cause** for the failure to timely make such election", "the Secretary **may treat such an election as timely made** for such taxable year" |

⚠️ **(b)(1)(A) is the window most often missed** — a corporation formed in year 1 can elect for year 2 at any point in year 1.

### when to choose

- want pass-through tax treatment
- satisfy §1361(b) — ⚠️ **not** "fewer than 100 U.S. shareholders", which
  understates the cap (a family is one unit) and overstates the restriction
  (estates, certain trusts, and certain exempt organizations may hold)
- do not need multiple stock classes — but voting and non-voting **common**
  stock is one class, §1361(c)(4)
- do not plan to raise VC (VCs are often funds, not individuals)

### source

> "An S corporation is a special type of corporation that's designed to avoid the double taxation drawback of regular C corps. S corps allow profits, and some losses, to be passed through directly to owners' personal income without ever be subject to corporate tax rates."
>
> — [ZenBusiness](https://www.zenbusiness.com/llc-vs-s-corp/)

---

## B-corporation (benefit corporation)

a corporate form that requires consideration of stakeholders beyond shareholders.

### two concepts

| term | what it means |
|------|---------------|
| benefit corporation | a legal entity type recognized by most U.S. states |
| certified B corp | a private certification from B Lab (the nonprofit) |

> "Benefit corporations and B Corps are often used interchangeably but are not synonymous. Benefit corporations are a legal entity type, while 'B Corp' refers to a company that has received B Corp certification from the nonprofit B Lab."
>
> — [Yale CBEY](https://cbey.yale.edu/sites/default/files/2019-10/CBEY_BCORP_Online.pdf)

### characteristics

| attribute | B-corp |
|-----------|--------|
| tax treatment | same as C-corp (no special tax benefit) |
| liability | limited — shareholders protected |
| purpose | must balance profit with social/environmental benefit |
| accountability | must report on stakeholder impact |
| certification | B Lab certification requires 80+ score on assessment |

### requirements

> "Certified B Corporations are legally required to consider the impact of their decisions on all stakeholders — a model known as stakeholder governance — that ensures B Corps remain legally accountable to all stakeholders, not just shareholders."
>
> — [B Lab](https://www.bcorporation.net/en-us/about-b-corps/legal-requirements/)

### when to choose

- mission-driven company with social or environmental goals
- want legal protection to pursue non-profit goals
- value the B Corp certification for market differentiation
- accept the same tax treatment as C-corp

### source

> "A B corporation is taxed as a business which isn't necessarily beneficial. These corporations have no tax benefits over traditional businesses."
>
> — [UpCounsel](https://www.upcounsel.com/c-corporation-vs-b-corporation)

---

## LLC (limited liability company)

a hybrid entity that combines corporate liability protection with partnership tax flexibility.

### characteristics

| attribute | LLC |
|-----------|-----|
| tax treatment | flexible — default pass-through, can elect C-corp or S-corp treatment |
| liability | limited — members protected |
| owners | unlimited members, no citizenship restrictions |
| formalities | minimal — no board required, no annual assemblies required |
| fundraise | harder — VCs prefer C-corps for stock structure |

### governance

> "LLCs are not restricted by the same formalities as corporations. They do not require a board of directors, shareholders, or annual assemblies. Instead, LLCs are owned by one or more individuals or entities, known as members."
>
> — [Cooley GO](https://www.cooleygo.com/compare-business-entities-chart/)

### when to choose

- want liability protection with minimal formality
- prefer pass-through tax treatment
- do not plan to raise traditional VC
- want flexibility in profit distribution (not tied to ownership %)
- have international or corporate members

### source

> "An LLC lets you take advantage of the benefits of both the corporation and partnership business structures. LLCs protect you from personal liability in most instances."
>
> — [U.S. Small Business Administration](https://www.sba.gov/business-guide/launch-your-business/choose-business-structure)

---

## ⛔ these four are NOT four of the same thing

two of the four are not entity types at all:

| the column | what it actually is | where this file says so |
|---|---|---|
| **C-corp** | a state-law entity type | "the default corporate form" |
| **LLC** | a state-law entity type | "a hybrid entity" |
| **S-corp** | ⛔ a **federal tax election**, made *by* a corporation or an LLC | "a tax election (**not a separate entity type**)" |
| **B-corp** | ⛔ **two** things — a state-law variant, and a **private certification** | the "two concepts" table |

the real shape is **two axes, not one**:

```
pick an ENTITY TYPE          then, separately, pick a TAX TREATMENT
  ├─ corporation                ├─ C-corp taxation (the default)
  │   └─ optionally a           └─ S-corp election, if §1361(b) is satisfied
  │      benefit corporation
  └─ LLC                      and, separately again:
                                └─ B Lab certification, which is neither
```

- a corporation may be taxed as a C-corp or elect S-corp treatment; **an LLC may also elect either**
- a benefit corporation is taxed as whichever it elects
- ⚠️ a matrix over a mixed axis passes a fact-check row by row and still poses a choice no founder faces

## comparison matrix — read as a mixed axis, per above

| attribute | C-corp | S-corp *(an election)* | B-corp *(a variant + a cert)* | LLC |
|-----------|--------|--------|--------|-----|
| **tax** | corporate + shareholder, when distributed | pass-through | follows its election | flexible |
| **liability** | limited | limited | limited | limited |
| **max owners** | unlimited | 100 **units** — a family counts as one, §1361(c)(1) | unlimited | unlimited |
| **owner types** | any | individuals, **plus** estates, certain trusts, certain exempt orgs — §1361(b)(1)(B). ⛔ no nonresident alien | any | any |
| **stock classes** | multiple | one — but **vote differences are disregarded**, §1361(c)(4) | multiple | N/A (membership units) |
| **formalities** | high | high | high | low |
| **VC-friendly** | yes | no | yes | no |
| **mission-driven** | no | n/a — an election says none of this | required | optional |

---

## decision tree

```
do you plan to raise VC?
├── yes → C-corp (or B-corp if mission-driven)
└── no
    ├── do you want minimal formality?
    │   ├── yes → LLC
    │   └── no → continue
    └── do you want pass-through tax?
        ├── yes
        │   ├── satisfies §1361(b)? → S-corp election
        │   └── otherwise → LLC
        └── no → C-corp
```

- test eligibility against §1361(b), never "≤100 U.S. shareholders" — a family counts as one unit, and an estate, a (c)(2) trust, and a (c)(6) organization may hold
- ⚠️ the S-corp leaf is not a sibling of the LLC leaf: an LLC may make the same election. the tree decides a tax treatment in the shape of an entity-type decision

---

## sources

### the statutes — pulled 2026-09-01, bhrowser headful, two publishers

the law governs S-corp eligibility; every entry under *secondary* is commentary.

- [26 U.S.C. §1361](https://www.law.cornell.edu/uscode/text/26/1361) — who may
  elect. **(b)(1)(A)–(D)** the four tests · ⭐ **(b)(1)(B)** the three-exception
  parenthesis · **(b)(2)** the closed list of ineligible corporations ·
  ⭐ **(c)(1)** family aggregation, 6 generations, applicable **October 22,
  2004** · **(c)(2)(A)** the six permitted trusts · **(c)(2)(B)(v)** the ESBT
  alienage carve-out · **(c)(3)** a bankruptcy estate · ⭐ **(c)(4)** the
  vote-difference carve-out · **(c)(5)** straight debt · **(c)(6)** §401(a) and
  §501(c)(3) organizations
- [26 U.S.C. §1362](https://www.law.cornell.edu/uscode/text/26/1362) — the
  election. **(a)(2)** shareholder consent · ⭐ **(b)(1)(A)** the prior-year
  window · **(b)(1)(B)** the 15th day of the **3d** month · **(b)(3)** a late
  election is made for the following year · ⭐ **(b)(5)** reasonable-cause
  relief · ⭐ **(g)** the re-election bar and its consent escape

each decisive quote was cross-published and compared by an equality test against
the govinfo 2023 edition of the same section.

🚩 **the ordinal is a needle hazard.** §1362 writes **"3d month"** in three
places and "3rd month" in exactly one — §1362(b)(3)(B), a *different* paragraph
about a **late** election. a search for the modern spelling returns a verbatim,
correct quote of the wrong subsection.

### secondary — read as commentary, never as authority

- [U.S. Small Business Administration: Choose a Business Structure](https://www.sba.gov/business-guide/launch-your-business/choose-business-structure)
- [IRS: S Corporations](https://www.irs.gov/businesses/small-businesses-self-employed/s-corporations)
- [Wolters Kluwer: S Corp vs C Corp](https://www.wolterskluwer.com/en/expert-insights/s-corp-vs-c-corp-differences-benefits)
- [Cooley GO: Compare Business Entities](https://www.cooleygo.com/compare-business-entities-chart/)
- [B Lab: Legal Requirements](https://www.bcorporation.net/en-us/about-b-corps/legal-requirements/)
- [Yale CBEY: B Corp Guide](https://cbey.yale.edu/sites/default/files/2019-10/CBEY_BCORP_Online.pdf)
- [ZenBusiness: LLC vs S-Corp](https://www.zenbusiness.com/llc-vs-s-corp/)
- [UpCounsel: C Corporation vs B Corporation](https://www.upcounsel.com/c-corporation-vs-b-corporation)
