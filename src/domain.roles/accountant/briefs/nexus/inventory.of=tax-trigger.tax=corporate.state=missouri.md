# inventory.of=tax-trigger.tax=corporate.state=missouri

## .answer

the **corporation income tax** (RSMo §143.071; 4% from tax year 2020). **no economic-nexus bright line**: a corporation that files a federal return must file Missouri once its **gross income from Missouri sources is $100 or more** — a return floor, not a nexus safe harbor.

## .apportionment

**single receipts factor** (Method Two A, the default for any corporation outside the industry-specific methods), SaaS receipts sourced **market-based** (to the extent the ultimate beneficiary is in Missouri).

> "All taxpayers that do not qualify for a Special Method (Methods Three through Seven) must choose Method Two A - Receipts Factor Apportionment."
>
> — Missouri DOR, Form MO-1120 Instructions (tax year 2025), general instructions

> "Receipts from the sale of a service are in this state if and to the extent that the ultimate beneficiary is in Missouri."
>
> — Missouri DOR, Form MO-1120 / MO-MS Instructions (tax year 2025), Services

## .the threshold

> "Every corporation, as defined in Chapter 143, RSMo, is required to file a return of income in Missouri for each year it is required to file a federal income tax return and the corporation’s gross income from sources within Missouri is $100 or more."
>
> — 2025 Form MO-1120 instructions, return requirements box

> "For all tax years beginning on or after January 1, 2020, a tax is hereby imposed upon the Missouri taxable income of corporations in an amount equal to four percent of Missouri taxable income."
>
> — RSMo §143.071.3 (effective 28 Aug 2018)

## .details

| item | value |
|---|---|
| figure | $100 Missouri-source gross income (return floor) |
| which receipts count | gross income from sources within Missouri |
| period | the tax year |
| effective | instructions for tax year 2025; §143.071 effective 8/28/2018 |
| physical presence also triggers | yes — no physical-presence floor is stated |
| P.L. 86-272 | never reaches software/services; no Missouri carve-out for them was found |

## 🚩 open

| gap | why |
|---|---|
| a nexus standard for a remote SaaS seller | no DOR nexus rule or bright line was found in the pulled corporate pages |
| RSMo §143.455 (the receipts-factor statute the instructions cite) | not pulled; the pulled §143.451 governs only tax years that end on or before December 31, 2019 |
| whether a SaaS receipt is a service or a license of intangible property | the instructions source an intangible license where it is used in Missouri; no DOR SaaS guidance was pulled |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.mo-1120-instructions.ty2025.filing-requirements.txt` | MO-1120 instructions, return box | 933 |
| `refs/pulledAt=2026-10-05.mo-rsmo-143.071.txt` | RSMo §143.071 | 2,173 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | P.L. 86-272 | 2,983 |
| `refs/pulledAt=2026-10-05.mo-1120-instructions.ty2025.receipts-factor.txt` | MO-1120 instructions, Method Two A default | 832 |
| `refs/pulledAt=2026-10-05.mo-1120-instructions.ty2025.services-sourcing.txt` | MO-1120 / MO-MS instructions, services + intangibles | 2,576 |
