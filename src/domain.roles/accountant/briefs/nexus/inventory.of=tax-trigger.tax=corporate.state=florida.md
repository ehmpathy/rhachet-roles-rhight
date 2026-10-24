# inventory.of=tax-trigger.tax=corporate.state=florida

## .answer

any tax year in which the corporation conducts business, earns income, or "exists" in Florida — an office, property, employees, a service performed there, or a sole or key officer who manages from Florida — owes an **F-1120** for that year, loss or not. it is due the **1st day of the 5th month** after year end (May 1 for a calendar year), or 15 days after the federal due date if later.

## .apportionment

**three-factor formula, sales double-weighted** (sales 50%, property 25%, payroll 25%), SaaS receipts sourced by **where the services are performed** (a cost-of-performance style rule, per the F-1120N instructions).

> "(1) Except as provided in ss. 220.151, 220.152, and 220.153, adjusted federal income as defined in s. 220.13 shall be apportioned to this state by taxpayers doing business within and without this state by multiplying it by an apportionment fraction composed of a sales factor representing 50 percent of the fraction, a property factor representing 25 percent of the fraction, and a payroll factor representing 25 percent of the fraction."
>
> — Fla. Stat. §220.15(1) (2024)

> "(d) Sales of service organizations are within Florida if the services are performed in Florida."
>
> — Florida DOR, F-1120N instructions (R. 01/26), § Schedule III

## .the trigger

> "(1) A tax measured by net income is hereby imposed on every taxpayer for each taxable year for the privilege of conducting business, earning or receiving income in this state, or being a resident or citizen of this state."
>
> — Fla. Stat. §220.11(1)

> "(a) A corporate income tax return is required by every foreign (out-of-state) corporation that is conducting business, earning income, or existing within Florida."
>
> — Rule 12C-1.022(2)(a), F.A.C.

the activities that count are listed in Rule 12C-1.011(1), among them:

| item | text |
|---|---|
| (b) | *"Maintaining an office or other place of business in Florida."* |
| (c)1. | *"Owning or leasing real or tangible personal property in this state."* |
| (l) | *"Having employees that are present in Florida and that perform functions other than the solicitation of sales within Florida."* |
| (m) | *"Performing any service within Florida."* |
| (n) | *"If the only officer of the corporation or a key officer of the corporation is residing within Florida, management of the corporation is presumed to be occurring within Florida."* |

## .thresholds

| figure | what it decides | applies to | source |
|---|---|---|---|
| none | no receipts bright line for the return duty was found in statute or rule | — | §220.11, §220.22, Rule 12C-1.011 |
| $50,000 exemption | whether **tax** is due, never whether a return | taxable years under the current §220.14 | §220.14(1) |
| 5.5% rate | the tax on Florida net income | adjusted per §220.1105 — read the year's rate | §220.11(2) |

## .what does NOT trigger it

> "(2) The following activities will not, in themselves, subject a foreign (non-Florida) corporation to the income/franchise tax."
>
> — Rule 12C-1.011(2)

- (a) a Florida bank account · (b) stock in a Florida corporation · (c) an independent Florida accountant, attorney, or bookkeeper · (d) salesmen who solicit **tangible** goods, if no (1) activity occurs
- P.L. 86-272 protects solicitation of orders *"for sales of tangible personal property"* (15 U.S.C. §381(a)(1)) — never services or software; Rule 12C-1.011(1)(k) reaches activity that *"exceed those protected by P.L. 86-272"*
- customers outside Florida do not help: §220.11(1) reaches income earned where the work happens

## .when the duty attaches, and the first deadline

> "(d) The determination whether a foreign (out-of-state) corporation is required to file a Florida corporate income/franchise tax return is dependent only on the activities of the corporation during that tax year."
>
> — Rule 12C-1.022(2)(d)

- the first year with any (1) activity is the first F-1120; check **Question D**, *"Initial return"*
- due date, per F-1120 R. 01/26: *"If 6/30 year end, return is due 1st day of the 4th month after the close of the taxable year, otherwise return is due 1st day of the 5th month after the close of the taxable year."* — F-1120N adds the later-of rule (15th day after the federal due date)
- ⚠️ a later year is not presumed clear: *"there is a continuing expectation that a foreign corporation that was required to file in a previous year has a filing requirement in subsequent years."* (Rule 12C-1.022(2)(d))

## ⚠️ a loss does not end it

> "A return with respect to the tax imposed by this code shall be made by every taxpayer for each taxable year in which such taxpayer either is liable for tax under this code or is required to make a federal income tax return, regardless of whether such taxpayer is liable for tax under this code."
>
> — Fla. Stat. §220.22(1)

$0 tax, return still owed. see `income-tax/state=florida/hazard.zero-tax-still-owes-a-return`.

## 🚩 open

| gap | why |
|---|---|
| an economic (receipts-only) nexus standard | none found in the committed statute or rules; whether DOR asserts one was not pulled |
| a Florida mail address with no (1) activity | not addressed in terms by Rule 12C-1.011 |
| the statute or rule behind the F-1120N services line | §220.15(5) names no rule for services; the DOR rule that does was not pulled |
| whether SaaS is a sale of a "service organization" | the F-1120N line does not say how software access is classed |

## .sources

| ref | chars |
|---|---:|
| `../income-tax/state=florida/refs/effectiveAt=2024-01-01.fl-stat-220.11.txt` | 3,956 |
| `../income-tax/state=florida/refs/effectiveAt=2024-01-01.fl-stat-220.14.txt` | 4,003 |
| `../income-tax/state=florida/refs/effectiveAt=2024-01-01.fl-stat-220.22.txt` | 4,238 |
| `../income-tax/state=florida/refs/pulledAt=2026-10-04.fl-rule-12C-1.011.txt` | 12,343 |
| `../income-tax/state=florida/refs/pulledAt=2026-10-04.fl-rule-12C-1.022.txt` | 18,468 |
| `../income-tax/state=florida/refs/pulledAt=2026-10-04.fl-form-f1120.r0126.txt` | 48,658 |
| `../income-tax/state=florida/refs/pulledAt=2026-10-04.fl-form-f1120n.r0126.txt` | 129,827 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | 2,983 |
| `refs/pulledAt=2026-10-05.florida-stat-220.15-1.txt` | 1,280 |
| `refs/pulledAt=2026-10-05.florida-f-1120n-r0126.schedule-iii.txt` | 8,001 |

⇒ the file how-to: `income-tax/state=florida/howto.file.state=florida.current.active-loss`
