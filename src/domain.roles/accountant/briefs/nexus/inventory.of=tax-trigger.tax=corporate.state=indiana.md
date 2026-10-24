# inventory.of=tax-trigger.tax=corporate.state=indiana

## .answer

**any** Indiana-source gross income in a tax year — no dollar floor — makes the corporation owe an **IT-20** for that year, loss or not. it is due the **15th day of the 5th month** after year end (May 15 for a calendar year).

## .apportionment

**single sales factor** (receipts only), SaaS receipts sourced **market-based** (where the benefit of the service or intangible is received).

> "Under the Adjusted Gross Income Tax Act, taxable income from a trade or business carried on within and outside Indiana is computed using a single-factor formula based on receipts."
>
> — IT-20 booklet SP 259 (R26 / 8-25), Specific Instructions for Schedule E

> "Receipts from other services and other intangibles are attributed to Indiana if the benefit of the service or intangible is received in Indiana. Please see Multistate Tax Commission regulations for further information on whether the receipts from a particular transaction are attributed to Indiana."
>
> — IT-20 booklet SP 259 (R26 / 8-25), Schedule E, Part I, Sales/Receipts

## .the trigger

> "Sec. 1. Returns with respect to taxes imposed by this act shall be made by the following: … (3) Every corporation having for the taxable year any gross income from sources within the state of Indiana."
>
> — IC 6-3-4-1

> "Subject to the limitations of P.L. 86-272, taxpayers may incur a filing obligation based on an economic presence in Indiana. The economic presence in Indiana must be more than of a de minimis nature."
>
> — Income Tax Information Bulletin #12 (October 2023)

the booklet's list of Indiana business includes *"Maintenance of an office, a warehouse, a construction site, or another place of business in Indiana"* and *"Rendering of a service to customers in Indiana"* (IT-20 booklet SP 259, section *"Doing Business in Indiana"*).

## .thresholds

| figure | what it decides | applies to | source |
|---|---|---|---|
| **any** Indiana-source gross income | the return duty | every taxable year | IC 6-3-4-1(3) |
| "more than of a de minimis nature" | economic presence, no dollar figure stated | tax years that begin on or after Jan. 1, 2019 | IB #12 |
| 4.9% rate | the tax | after June 30, 2021 | IC 6-3-2-1(c)(11) |

⚠️ no receipts bright line was found in the committed refs — "de minimis" is undefined there.

## .what does NOT trigger it

- **no** Indiana-source gross income at all → no IT-20 under IC 6-3-4-1(3)
- P.L. 86-272: solicitation of orders *"for sales of tangible personal property"*, approved and shipped from outside (15 U.S.C. §381(a)(1)) — it never shields services or software, and the booklet's own list names *"Rendering of a service to customers in Indiana"*
- §501 exempt organizations (*"unless exempt under IRC Section 501"*, IT-20 booklet)

## .when the duty attaches, and the first deadline

the first taxable year with any Indiana-source gross income is the first IT-20; check header **A**, *"Initial Return"*, and fill **D**.

> "Unless otherwise specified, state corporate tax returns are due on the 15th day of the 5th month following the close of the corporation’s taxable year. Indiana recognizes federal extensions of time to file."
>
> — IT-20 booklet SP 259 (R26 / 8-25)

- the taxable year is the federal one (IT-20 booklet, *Taxable Period*)
- a federal extension carries over, plus one month (IC 6-8.1-6-1(c)(1))

## ⚠️ a loss does not end it

> "Any corporation doing business and having gross income in Indiana must file a corporate income tax return. This must be done regardless of the presence of taxable income (unless exempt under IRC Section 501)."
>
> — IT-20 booklet SP 259

no minimum tax: a loss is $0 tax, return still owed — and the loss-year IT-20 is what supports an Indiana NOL later (Schedule IT-20NOL).

## 🚩 open

| gap | why |
|---|---|
| what "de minimis" economic presence means in dollars | IB #12 states no figure; 45 IAC 3.1 not pulled |
| Indiana-source gross income with no item from the booklet's activity list | IC 6-3-4-1(3) keys on income alone; treat the statute as the operative text |
| the statute behind the receipts rule | the cell rests on the DOR booklet; IC 6-3-2-2 itself and 45 IAC 3.1 were not pulled |
| SaaS as service or intangible | the booklet groups "other services and other intangibles" under one benefit rule, so the cell holds either way |

## .sources

| ref | chars |
|---|---:|
| `../income-tax/state=indiana/refs/pulledAt=2026-10-04.ic-6-3-4-1.txt` | 1,786 |
| `../income-tax/state=indiana/refs/pulledAt=2026-10-04.ic-6-3-2-1.txt` | 12,459 |
| `../income-tax/state=indiana/refs/pulledAt=2026-10-04.ic-6-8.1-6-1.txt` | 4,097 |
| `../income-tax/state=indiana/refs/pulledAt=2026-10-04.in-ib12.oct2023.txt` | 33,932 |
| `../income-tax/state=indiana/refs/pulledAt=2026-10-04.in-it20-booklet.sp259-r26-0825.flow.txt` | 185,449 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | 2,983 |

⇒ the file how-to: `income-tax/state=indiana/howto.file.state=indiana.current.active-loss`
