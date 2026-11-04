# hazard.zero-tax-still-owes-a-return

> ⚠️ **not legal advice**, and not tax advice. this brief helps you find what to ask; confirm it for your facts with a licensed attorney or CPA.

## .what

Florida exempts the first **$50,000** of net income from corporate income tax.
a small corporation therefore owes **$0**.

it still owes a **return** — and the trigger is not the Florida tax at all. it
is whether a **federal** return was required.

## .why the trap is shaped this way

the reasoning that produces the failure is short, fluent, and wrong:

```
income is under the exemption
  -> no Florida tax is due
    -> so no Florida return is owed         🚫 THE ERROR IS HERE
```

the last arrow does not follow, because the exemption and the return are in
different sections doing different jobs.

**the exemption** — [Fla. Stat. §220.14(1)](https://www.flsenate.gov/Laws/Statutes/2024/220.14):

> "**In computing a taxpayer's liability for tax** under this code, there shall
> be exempt from the tax **$50,000** of net income as defined in s. 220.12…"

read the opening words. it operates *in computing liability*. it says not one
word about the duty to file.

**the return** — [Fla. Stat. §220.22(1)](https://www.flsenate.gov/Laws/Statutes/2024/220.22):

> "A return with respect to the tax imposed by this code shall be made by every
> taxpayer for each taxable year in which such taxpayer either is liable for tax
> under this code **or is required to make a federal income tax return,
> regardless of whether such taxpayer is liable for tax under this code**."

two independent triggers, joined by **or**. the second one — a federal return
requirement — is enough on its own, and the closing clause forecloses the
inference outright.

so the chain that actually governs is:

```
you file a federal Form 1120
  -> a Florida return is owed
    -> the $50,000 exemption decides only whether TAX is due
```

## 🎯 and the federal duty is itself unconditional

the federal return is owed regardless of income:

> "**Unless exempt under section 501, all domestic corporations (including
> corporations in bankruptcy) must file an income tax return whether or not they
> have taxable income.**"
>
> — [Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf)

so a corporation with **no revenue at all** still owes a federal 1120, which by
§220.22(1) still owes a Florida return. there is no income level low enough to
escape the filing duty — only low enough to escape the tax.

## .the rate and the exemption

| item | figure | source |
|------|--------|--------|
| rate | **5.5%** of net income | §220.11(2)(a) |
| exemption | **$50,000** of net income | §220.14(1) |
| short year | exemption **prorated** by days ÷ 365 | §220.14(2) |
| controlled group | **one** exemption, split among FL members | §220.14(4) |
| AMT-adjacent rate | 3.3% for §220.13(2)(k) taxpayers | §220.11(3) |

⚠️ **the rate is not a constant.** §220.11(2)(b) says the rate "shall be
adjusted as provided in s. 220.1105," which is an automatic-adjustment mechanism
tied to collections. **never quote 5.5% for a past year without a check against
that year's adjusted rate** — the same failure mode as a CPI-indexed threshold.

⚠️ §220.14(2) prorates the exemption for a short year. an entity's **first** and
**final** years are short years, so the $50,000 shield is smaller in exactly the
years a founder is least likely to check.

## .the imposition clause reaches the WORK, not the customers

> "A tax measured by net income is hereby imposed on every taxpayer for each
> taxable year for the privilege of **conducting business, earning or receiving
> income in this state**, or **being a resident or citizen of this state**."
>
> — [Fla. Stat. §220.11(1)](https://www.flsenate.gov/Laws/Statutes/2024/220.11)

so "all our customers are out of state" is not an argument here. the income is
earned where the work happens. a corporation operated from Florida is inside
this clause with zero Florida customers.

## 🎯 the not-for-profit carve-out is BY RULE, and is narrow

§220.22(4) is the one place a filing duty can fall away — and it is not
self-executing:

> "**The department shall designate by rule** certain not-for-profit entities and
> others that are not required to file a return under this code, including an
> initial information return, **unless the entities have taxable income** as
> defined in s. 220.13(2). These entities shall include subchapter S
> corporations, tax-exempt entities, and others that **do not usually owe federal
> income tax**."

three limits:

1. it operates **by department rule**, not by the statute. the rule is the
   operative text, and it was not pulled here.
2. the named classes are **S corporations and tax-exempt entities** — entities
   that "do not usually owe federal income tax." a **C corporation** does owe
   federal income tax and is outside that description.
3. even a listed entity loses the carve-out if it **has taxable income**.

a C corp that files a federal 1120 does not fit the carve-out on its face.

## .the penalty

[Fla. Stat. §220.801](https://www.flsenate.gov/Laws/Statutes/2024/220.801)
carries the penalties for a return not filed and tax not paid.

⚠️ **do not compute an exposure by hand** (`rule.forbid.hand-computed-figures`).
a multi-year penalty is a per-month accrual with a cap, applied per year, where
failure-to-file and failure-to-pay interact. take the figure from the
Department or a tested calculator, and record the inputs.

## .how to check where an entity actually stands

do not reason about it:

- **the corporate income tax hub** —
  [`corporate.aspx`](https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx)
- **out-of-state / nexus questions** — the Department names an address for
  exactly this: `NICE@floridarevenue.com`
- **⭐ Voluntary Disclosure** — the Department advertises a program and points at
  it for anyone who has been "doing business in Florida for more than 30 days
  and/or owe back taxes"

## ⛔ if a year was SKIPPED, read the limitations brief FIRST

a skipped return is not a small version of a late return. it changes which
clock applies:

> "5. **At any time** after the taxpayer … **failed to file a required
> return** … **except that** … the limitation prescribed in subparagraph 1.
> applies **if the taxpayer disclosed in writing the tax liability to the
> department before the department contacts the taxpayer**"
>
> — [Fla. Stat. §95.091(3)(a)5](https://www.flsenate.gov/Laws/Statutes/2024/95.091)

so a non-filer is assessable **with no time limit** — and one move, a written
disclosure made **before** DOR makes contact, restores the 3-year limit.

the intuitive order is wrong: to file the skipped return at once can be the
more expensive move, since an online registration or a cold return may count as
**contact** and forfeit the cap.

**read `limitations/state=florida/lever.disclose-first-to-cap-the-lookback`
before a first move.** it carries the statute, the program terms, the eight
required items, and the channels.

## .enforcement

- "$0 Florida tax, so no Florida return" = **blocker**
- a Florida return skipped in a year a federal 1120 was filed = **blocker**
- a Florida duty argued away on customer location = **blocker**
  (§220.11(1) reaches the work)
- the 5.5% rate quoted for a past year with no §220.1105 check = **blocker**
- a full $50,000 exemption applied to a short year = **blocker** (§220.14(2))
- a C corp claimed under the §220.22(4) carve-out = **blocker**
- a multi-year penalty computed by hand = **blocker**

## .provenance

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. no WebFetch or WebSearch summary stands
behind any line. the playbook is committed and re-runnable:

- `briefs/refs/florida-corporate-tax.research.play.ts`

| source | chars | note |
|--------|------:|------|
| Fla. Stat. §220.03 | 28,099 | definitions |
| Fla. Stat. §220.11 | 3,956 | the imposition clause + rate |
| Fla. Stat. §220.14 | 4,003 | the $50,000 exemption |
| Fla. Stat. §220.22 | 4,238 | ⭐ the return duty |
| Fla. Stat. §220.222 | 6,932 | due dates |
| Fla. Stat. §220.801 | 4,443 | penalties |
| FL DOR out-of-state | 2,287 | nexus examples, the VD pointer |

- all eleven Florida statutes cleared the byte-count check on the first pull
- the page **"Florida Businesses with Out-of-State Customers"** was found by a walk of the Department's own link list, not a guessed slug
- two DOR pages came back short (1,606 and 453 chars, SharePoint shells) and are **not** relied on; the statutes carry every claim

## 🚩 what is NOT established here

| gap | why it is open |
|-----|----------------|
| the §220.22(4) **department rule** | ✅ **closed 2026-10-04** — it is Rule 12C-1.022, which cites 220.22(4) as its authority and excuses no C-corporation. bytes: `refs/pulledAt=2026-10-04.fl-rule-12C-1.022.txt` |
| the §220.1105 **adjusted rate** per year | the mechanism was read; the year-by-year figures were not |
| whether **estimated payments** are owed | ✅ **closed 2026-10-04** — only where the year's tax is expected to exceed $2,500 (F-1120N R. 01/26, *"Estimated Tax"*) |
| the **due date** interaction with a federal extension | ✅ **closed 2026-10-04** — a federal extension alone does not extend the Florida return; see `howto.file.state=florida.extension` |

## .see also

- `howto.file.state=florida.current.active-loss` — how to file the return this
  brief says is owed
- `howto.file.state=florida.delinquent.active-loss` — once the due date has
  passed: the $300 cap and the reasonable-cause request
- `howto.file.state=florida.extension` — F-7004, and why a federal extension
  alone does not extend it
- `nexus/define.three-duties-three-tests` — why the registration answer and the
  tax answer are different answers, and why P.L. 86-272 does not shield software
- `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report` — the **same
  trap in a second state**, where the sanction reaches the officer personally.
  two independent instances make this a pattern rather than a quirk
- `registrator` — `foreign-registration/hazard.foreign-registration.state=florida`
  — the **other** Florida duty, owed to a different agency on a different test
- `income-tax/define.delaware-1100-vs-federal-1120-vs-franchise-tax` — the same
  three-document confusion, for Delaware

## .publishability

☀️ **fullsun** (share) — generic Florida statute and department-rule analysis of the zero-tax return duty; no client identity.

## .sources

1. [Fla. Stat. §220.14 — exemption](https://www.flsenate.gov/Laws/Statutes/2024/220.14) — `refs/pulledAt=2026-10-25.flsenate-gov-laws-statutes-2024-220-14.txt`
2. [Fla. Stat. §220.22 — returns; filing requirement](https://www.flsenate.gov/Laws/Statutes/2024/220.22) — `refs/pulledAt=2026-10-25.flsenate-gov-laws-statutes-2024-220-22.txt`
3. [IRS, Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf) — `refs/pulledAt=2026-10-25.irs-gov-pub-irs-pdf-i1120-pdf.txt`
4. [Fla. Stat. §220.11 — tax imposed](https://www.flsenate.gov/Laws/Statutes/2024/220.11) — `refs/pulledAt=2026-10-25.flsenate-gov-laws-statutes-2024-220-11.txt`
5. [Fla. Stat. §220.801 — penalties; failure to timely file returns](https://www.flsenate.gov/Laws/Statutes/2024/220.801) — `refs/pulledAt=2026-10-25.flsenate-gov-laws-statutes-2024-220-801.txt`
6. [Florida Dept. of Revenue, Corporate Income Tax](https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx) — `refs/pulledAt=2026-10-25.floridarevenue-com-taxes-taxesfees-pages-corporate-aspx.txt`
7. [Fla. Stat. §95.091 — limitations on tax assessment](https://www.flsenate.gov/Laws/Statutes/2024/95.091) — `refs/pulledAt=2026-10-25.flsenate-gov-laws-statutes-2024-95-091.txt`

## .date researched

2026-10-04

(taken from the brief's own text, "✅ **closed 2026-10-04**")
