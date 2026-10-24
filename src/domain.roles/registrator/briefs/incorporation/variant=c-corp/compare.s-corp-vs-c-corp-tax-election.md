# compare.s-corp-vs-c-corp-tax-election

## .what

S-corp is not a different entity type — it's an **IRS tax election** on your extant Delaware corporation. this brief explains what that election means and how it affects your taxes.

---

## .the core difference

| aspect | C-corp (default) | S-corp (election) |
|--------|------------------|-------------------|
| **corporate tax** | 21% federal | $0 |
| **how profits taxed** | at corp level, then again on dividends | pass-through to your personal return |
| **second layer of tax** | ⚠️ **only on what is distributed** | no |
| **self-employment tax** | no (you're an employee) | on salary only, not distributions |

⚠️ "double taxation" is conditional: a C-corp that retains earnings pays only the
21% corporate tax. the condition is the whole of the C-corp's case.

---

## .how C-corp taxation works (double taxation)

profit is taxed **once at the corporation** and **again at the shareholder** when
it is distributed as a dividend. that second layer is the whole meaning of
"double taxation".

⛔ **no worked effective rate is published here.** the dividend rate (0–23.8%)
turns on the shareholder's own bracket and on whether the 3.8% NIIT applies;
a static example cannot fix either (`rule.forbid.hand-computed-figures`).

note: if you retain earnings in the corp (don't distribute), you only pay the 21% corporate tax. double taxation only applies to distributed profits.

---

## .how S-corp taxation works (pass-through)

the corporation pays **no entity-level tax**. profit passes through to your
personal return and is taxed there once.

⛔ **no worked effective rate is published here.** a real S-corp burden turns on
five inputs: the salary split, the filing status, the state, that year's FICA
wage base, and whether the business clears §199A(d)(2)(A). ⚠️ any example that
taxes the whole profit "once, at your marginal rate" omits **FICA at 15.3% on the
reasonable salary** — the catch below.

---

## .the reasonable salary trap

S-corp has a catch: if you work in the business, you **must pay yourself a reasonable salary** before you can take distributions.

| type | taxed how | FICA (15.3%)? |
|------|-----------|---------------|
| salary | ordinary income | **yes** |
| distribution | ordinary income | **no** |

the IRS watches for owners who pay themselves $20K salary and take $200K in distributions. if audited, they'll reclassify distributions as salary + penalties + interest.

### what is "reasonable"?

> "Reasonable pay is the amount that similar enterprises would pay for the same, or similar, services."
>
> — [IRS](https://www.irs.gov/businesses/small-businesses-self-employed/s-corporation-employees-shareholders-and-corporate-officers)

| your role | reasonable salary range |
|-----------|------------------------|
| software engineer (solo founder) | $80K-$150K |
| marketer / consultant | $60K-$120K |
| general manager | $70K-$130K |

rule of thumb: 40-60% of net profit as salary, remainder as distribution. 🚩 the
ranges and the rule of thumb are practitioner convention, not IRS figures.

---

## .s-corp requirements

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

| requirement | the statute |
|-------------|-------------|
| shareholders | ≤100 **units** — a family counts as **one**, §1361(c)(1): "there shall be treated as one shareholder … a husband and wife (and their estates), and all members of a family (and their estates)" — a **common ancestor** and every lineal descendant, capped at **6 generations** |
| shareholder types | individuals, **plus** estates, **(c)(2)** trusts, and **(c)(6)** organizations — §1361(b)(1)(B). not "US citizens or residents only" |
| stock classes | one class — but **(c)(4)** a corporation "shall not be treated as having more than 1 class of stock solely because there are differences in voting rights among the shares of common stock", and **(c)(5)** "straight debt shall not be treated as a second class of stock" |
| entity types as shareholders | ⛔ no corporation, no partnership, no nonresident alien |
| the corporation itself | must be **domestic**; **(b)(2)** excludes exactly three kinds: a §585-reserve-method financial institution, an insurance company under subchapter L, and "**a DISC or former DISC**" |

⭐ **(c)(4) changes a founder's plan.** voting and non-voting **common** stock is a
single class, so a founder may keep control without loss of the election.

⚠️ vendor summaries (e.g. "S-corps are limited to a maximum of 100 shareholders
and may only issue one class of stock" — [Wolters Kluwer](https://www.wolterskluwer.com/en/expert-insights/s-corp-vs-c-corp-differences-benefits))
drop every carve-out above. read the statute.

### 🚩 family aggregation dates from 2004

§1361(c)(1) was amended generally by Pub. L. 108–357 §231(a), applicable to
taxable years that start after **December 31, 2004**. the **prior** text read
only *"a husband and wife (and their estates) shall be treated as 1
shareholder"*. a pre-2004 source describes the narrower rule. ⚠️ this amendment
note appears on govinfo and not on Cornell.

---

## .when S-corp makes sense

S-corp is typically better if you:

| scenario | why S-corp wins |
|----------|-----------------|
| solo founder, profitable | avoid double taxation |
| bootstrapped, no VC plans | don't need QSBS |
| want to minimize total tax | pass-through + QBI deduction |
| plan to distribute most profits | no second layer of tax |
| simple ownership (just you) | meet the requirements easily |

an S-corp avoids the second layer of tax on distributed profit and shelters the
distribution portion from FICA. ⛔ no dollar saving is published: a saving is a
**difference of two totals** and inherits both totals' errors, and any
comparison must include FICA on the salary, not only on distributions.

---

## .when C-corp makes sense

C-corp is typically better if you:

| scenario | why C-corp wins |
|----------|-----------------|
| plan to raise VC | investors require it |
| want QSBS tax exclusion | only C-corps qualify — ⚠️ **and only if the business clears §1202(e)(3)**, see below |
| plan to retain earnings | 21% < your marginal rate |
| multiple stock classes needed | S-corp only allows one (voting differences aside) |
| foreign investors | S-corp prohibits them |

### the QSBS advantage

**QSBS (Qualified Small Business Stock)** excludes gain on the sale of stock in
a **C corporation** — §1202(c)(1), *"any stock in a C corporation."*

> "Only a C corporation can issue QSBS. If you form as an LLC taxed as a partnership, an S-corp, or a partnership, you cannot issue QSBS."
>
> — [The Startup Law Blog](https://www.thestartuplawblog.com/only-c-corps-can-issue-qsbs-1202-tax-break/)

**critical:** if you start as S-corp, your founder shares **never qualify** for QSBS, even if you later revoke the election.

## ⛔ BUT QSBS TURNS ON WHAT THE BUSINESS DOES — §1202(e)(3)

> "the term 'qualified trade or business' means any trade or business **other
> than**— (A) any trade or business involving the performance of services in the
> fields of health, law, engineering, architecture, accounting, actuarial
> science, performing arts, **consulting**, athletics, financial services,
> brokerage services, **or any trade or business where the principal asset of
> such trade or business is the reputation or skill of 1 or more of its
> employees**…"
>
> — [26 U.S.C. §1202(e)(3)](https://www.law.cornell.edu/uscode/text/26/1202)

🚨 **for a solo founder in a service field, that last clause is the whole
question.** §1202(e)(1)(A) requires **80% of assets by value** to be used in a
*qualified* trade or business, so a failure here disqualifies the stock outright.

⛔ whether a given business clears (e)(3) is a fact question for a CPA or tax
counsel. **do not pick an entity on the strength of QSBS before that answer
exists.**

### ⚠️ "$10M, >5 years, $0 tax" is no longer the whole rule

| what is usually said | what §1202 now provides |
|---|---|
| cap **$10M** | **(b)(4)(A)** $10,000,000 for stock acquired **on or before** the applicable date · **(b)(4)(B)** **$15,000,000** after it · **(b)(5)** indexed after 2026 |
| held **>5 years** | **(b)(2)** eligible gain = held **at least 3 years** — *"more than 5 years in the case of stock acquired on or before the applicable date"* |
| **100%** exclusion | **(a)(5)** a table: **3 years → 50%**, **4 years → 75%**, **5 years or more → 100%** |
| (unstated) | the gross-assets test is **$75,000,000**, also indexed after 2026 |

no exit-value table is published (`rule.forbid.hand-computed-figures`).

### 🚩 the S-corp column is not a safe harbor

§199A(d)(2)(A) defines a "specified service trade or business" **by direct
cross-reference to §1202(e)(3)(A)** — with `employees or owners` substituted for
`employees`, which makes it *broader*. so a solo service business loses the QBI
deduction above the §199A threshold **and** fails QSBS.

⛔ **neither election escapes it.** the disqualification tracks the work, not the
structure. see `../compare.entity-tax-implications.md` for the side-by-side.

---

## .decision framework

```
do you plan to raise VC?
├─ yes → stay C-corp (QSBS + investor requirements)
└─ no
   │
   ├─ profitable and want to distribute?
   │  ├─ yes → S-corp (avoid double taxation)
   │  └─ no → either works
   │
   └─ plan to retain earnings for growth?
      ├─ yes → C-corp (21% < personal rate)
      └─ no → S-corp
```

---

## .how to elect S-corp status

1. **file IRS Form 2553** — with the consent of **all persons who are
   shareholders on the day the election is made**, §1362(a)(2)
2. **deadline:** §1362(b)(1) gives **two** windows — see below
3. **cost:** $0 (IRS submission)
4. **state:** Delaware doesn't care — it's a federal tax election

> "Form 2553 is used by a corporation to make an election under section 1362(a) to be an S corporation."
>
> — [IRS: About Form 2553](https://www.irs.gov/forms-pubs/about-form-2553)

### the two windows, from the statute

> "(A) at any time **during the preceding taxable year**, or
> (B) at any time during the taxable year and on or before the **15th day of the
> 3d month** of the taxable year."
>
> — [26 U.S.C. §1362(b)(1)](https://www.law.cornell.edu/uscode/text/26/1362)

| a common summary | what §1362 provides |
|---|---|
| "within **75 days**" | the **15th day of the 3d month of the taxable year** — a date, not a duration. on or about March 15 **only for a calendar-year taxpayer** |
| miss it and it is void | **(b)(3)** — a late election "shall be treated as made for the **following** taxable year" |
| (unstated) | **(b)(5)** — where "the Secretary determines that there was **reasonable cause** for the failure to timely make such election", "the Secretary **may treat such an election as timely made** for such taxable year" |

⚠️ **(b)(1)(A) is the window most often missed** — a corporation formed in year 1
can elect for year 2 at any point in year 1.

🚩 the statute writes **"3d month"**. §1362 uses `3d` three times and `3rd` once —
in **§1362(b)(3)(B)**, a different paragraph about a **late** election. a search
for the modern spelling lands on the wrong subsection.

---

## .can you switch back?

| direction | allowed? | constraints |
|-----------|----------|-------------|
| C-corp → S-corp | yes | file Form 2553 |
| S-corp → C-corp | yes | revoke election |
| S-corp → C-corp → S-corp | yes | §1362(g) bars it until the 5th taxable year after the termination year — ⭐ **unless the Secretary consents** |

> "…such corporation (and any successor corporation) shall not be eligible to
> make an election under subsection (a) for any taxable year of such corporation
> before its **5th taxable year which begins after the 1st taxable year for
> which such termination is effective**, **unless the Secretary consents to such
> election**."
>
> — [26 U.S.C. §1362(g)](https://www.law.cornell.edu/uscode/text/26/1362)

⚠️ the bar counts **taxable years from a named anchor**, not five years from the
revocation date — they differ for a mid-year revocation. and it is **waivable**:
"must wait 5 years" forecloses a request the statute invites.

---

## .for solo founders: the math

if you're a solo founder with no VC plans and ~$100K-$200K annual profit:

| metric | C-corp | S-corp |
|--------|--------|--------|
| corporate tax | 21% | 0% |
| second layer of tax | ⚠️ **only on what is distributed** | no |
| QSBS eligible | ⚠️ only if it clears **§1202(e)(3)** | no |
| QBI deduction | no | ⚠️ only if it clears **§199A(d)(2)(A)** — the same list |
| reasonable salary required | no | yes |
| **typical total tax rate** | ⛔ not published — see above | ⛔ not published — see above |

⚠️ for a solo founder **in a service field**, the C-corp's QSBS and the S-corp's
QBI are gated by the **same statutory list** — they fail together, not offset.

**recommendation for VC-track founders:** stay C-corp for investor
compatibility — ⚠️ **and confirm §1202(e)(3) separately** before you count
QSBS. investor compatibility holds regardless; QSBS does not.

---

## .sources

### the statutes — pulled 2026-08-31, bhrowser headful

1. [26 U.S.C. §1202](https://www.law.cornell.edu/uscode/text/26/1202) — QSBS.
  **(a)(5)** the percentage table · **(b)(2)** the holding period · **(b)(4)**
  the cap, and its two tiers · **(b)(5)** indexation after 2026 · **(c)(1)**
  *"any stock in a C corporation"* · **(d)** the gross-assets test ·
  ⭐ **(e)(3)** the qualified-trade-or-business exclusions · **(e)(1)(A)** the
  80%-of-assets-by-value requirement that makes (e)(3) all-or-none
2. [26 U.S.C. §199A](https://www.law.cornell.edu/uscode/text/26/199A) — QBI.
  ⭐ **(d)(2)(A)** defines a specified service trade or business **by direct
  cross-reference to §1202(e)(3)(A)**, with `employees or owners` substituted ·
  **(d)(3)** the phase-in band above the threshold

⭐ the §1202 figures were dated by an **edition diff** against the govinfo 2023
edition: `$15,000,000` appears twice now and **zero** times in 2023;
`75,000,000` three times versus **zero**; `50,000,000` **zero** versus twice. any
source that still says *"$10M, 5 years, 100%, $50M gross assets"* predates it.

### the statutes — pulled 2026-09-01, bhrowser headful, two publishers

3. [26 U.S.C. §1361](https://www.law.cornell.edu/uscode/text/26/1361) — who may
  elect. **(b)(1)(A)–(D)** the four tests · ⭐ **(b)(1)(B)** the three-exception
  parenthesis · **(b)(2)** the closed list of ineligible corporations ·
  ⭐ **(c)(1)** family aggregation, 6 generations, applicable **October 22,
  2004** · **(c)(2)(A)** the six permitted trusts · **(c)(2)(B)(v)** the ESBT
  alienage carve-out · **(c)(3)** a bankruptcy estate · ⭐ **(c)(4)** the
  vote-difference carve-out · **(c)(5)** straight debt · **(c)(6)** §401(a) and
  §501(c)(3) organizations
4. [26 U.S.C. §1362](https://www.law.cornell.edu/uscode/text/26/1362) — the
  election. **(a)(2)** shareholder consent · ⭐ **(b)(1)(A)** the prior-year
  window · **(b)(1)(B)** the 15th day of the **3d** month · **(b)(3)** a late
  election is made for the following year · ⭐ **(b)(5)** reasonable-cause
  relief · ⭐ **(g)** the re-election bar **and its consent escape**

⭐ each decisive quote was compared by an equality test: §1362(g)'s
bar-and-escape sentence is byte-identical across Cornell and the govinfo 2023
edition at **426 chars**. the govinfo edition also carries the amendment notes
Cornell lacks — the `3d`/`3rd` outlier (Pub. L. 98–369 §721(l)(2), 1984) and the
2004 family-aggregation amendment (Pub. L. 108–357 §231(a)).

### secondary — read as commentary, never as authority

5. [IRS: S Corporation Employees, Shareholders and Corporate Officers](https://www.irs.gov/businesses/small-businesses-self-employed/s-corporation-employees-shareholders-and-corporate-officers)
6. [IRS: About Form 2553](https://www.irs.gov/forms-pubs/about-form-2553)
7. [Wolters Kluwer: S Corp vs C Corp Differences](https://www.wolterskluwer.com/en/expert-insights/s-corp-vs-c-corp-differences-benefits)
8. [SDO CPA: S-Corp vs C-Corp Tax Comparison 2026](https://www.sdocpa.com/c-corp-vs-s-corp-tax-comparison/)
9. [SDO CPA: C-Corporation Tax Guide](https://www.sdocpa.com/c-corporation-tax-guide/)
10. [Carta: QSBS Explained](https://carta.com/learn/startups/tax-planning/qsbs/)
11. [The Startup Law Blog: Only C-Corps Can Issue QSBS](https://www.thestartuplawblog.com/only-c-corps-can-issue-qsbs-1202-tax-break/)
12. [WCG CPAs: S Corp Reasonable Salary](https://wcginc.com/business-services/s-corp-salary/)

### read, not cited above

read in the research and kept for the record; no sentence above relies on it.

- [26 U.S.C. §1402](https://www.law.cornell.edu/uscode/text/26/1402) —
  self-employment income. **(b)(1)** the contribution-and-benefit-base cap on
  the §1401(a) portion · **(a)(12)** the deduction that yields the ~92.35% base
