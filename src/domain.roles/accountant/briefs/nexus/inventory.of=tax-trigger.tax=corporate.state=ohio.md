# inventory.of=tax-trigger.tax=corporate.state=ohio

## .answer

the **Commercial Activity Tax** (CAT, a gross-receipts tax) is the business-level tax a corporation owes. an out-of-state seller has bright-line presence at **≥ $500,000** of Ohio taxable gross receipts in a calendar year, but owes CAT only above the annual exclusion: **$6 million** for tax years **2025 and after** ($3 million in 2024; $150,000 before 2024).

## .apportionment

**no income formula** — the CAT taxes gross receipts sitused to Ohio one receipt at a time, so there is no factor to weight; SaaS receipts sitused **market-based** (where the purchaser receives the benefit, or, for a software license, where the licensee has the right to use it). ⚠️ that Ohio levies no corporate income tax at all is unverified here (see 🚩 open).

> "Commercial Activity Tax (CAT) is an annual tax imposed on the privilege of doing business in Ohio. It is based on the total sales and services a taxpayer does in Ohio."
>
> — Ohio Department of Taxation, *Commercial Activity Tax (CAT)* page

> "(I) Gross receipts from the sale of all other services, and all other gross receipts not otherwise sitused under this section, shall be sitused to this state in the proportion that the purchaser's benefit in this state with respect to what was purchased bears to the purchaser's benefit everywhere with respect to what was purchased. The physical location where the purchaser ultimately uses or receives the benefit of what was purchased shall be paramount in determining the proportion of the benefit in this state to the benefit everywhere."
>
> — Ohio Rev. Code 5751.033(I) (effective April 3, 2025)

> "If the receipts are not based on the amount of use of the property, but rather on the right to use the property, and the payor has the right to use the property in this state, then the receipts from the sale, exchange, disposition, or other grant of the right to use such property shall be sitused to this state to the extent the receipts are based on the right to use the property in this state."
>
> — Ohio Rev. Code 5751.033(F), copyrights and similar intellectual property

- (F) reaches a license of copyrighted software; (I) reaches a sale of services. both point at the customer, so the SaaS answer holds under either characterization

## .the threshold

> "(3) Has during the calendar year taxable gross receipts of at least five hundred thousand dollars;"
>
> — Ohio Rev. Code 5751.01(I)(3), *bright-line presence* (effective October 3, 2023)

> "Before tax year 2024: Businesses that made more than $150,000 a year in Ohio Taxable Gross Receipts (TGR) had to pay the Commercial Activity Tax (CAT). For tax year 2024: Businesses with more than $3 million a year in Ohio TGR need to pay the CAT. For tax years 2025 and forward: Businesses with more than $6 million a year in Ohio TGR need to pay the CAT."
>
> — Ohio Department of Taxation, *Commercial Activity Tax (CAT)* page

> "A business must meet both the bright line presence test and the sales threshold to owe CAT"
>
> — same page, *Out of State Persons/Businesses*

## .details

| item | value |
|---|---|
| figure | presence: ≥ $500,000 Ohio taxable gross receipts; liability: > $6 million (2025+) |
| which receipts count | taxable gross receipts sitused to Ohio (ORC 5751.033); a combined or consolidated group uses the group total |
| period | the calendar year |
| effective | exclusion $6 million for tax years 2025 forward; 5751.01 text effective October 3, 2023 |
| physical presence also triggers | yes — $50,000 property or payroll, 25% of any factor, or Ohio domicile (5751.01(I)) |
| P.L. 86-272 | irrelevant: the CAT is not a net-income tax, and the shield never covers software or services |

## 🚩 open

| gap | why |
|---|---|
| a source that states Ohio levies no corporate income tax | not pulled; the CAT page and Chapter 5733 (franchise tax) were not read for that statement |
| the statutory text of the $6 million exclusion | taken from the ODT page; the exclusion clause of 5751.01 was not quoted |
| whether ODT situses SaaS under 5751.033(F) or (I) | no ODT rule or information release on SaaS situs was pulled; both divisions are customer-based, so only the reason differs |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.oh-orc-5751.01.txt` | ORC 5751.01, substantial nexus + bright-line presence | 29,854 |
| `refs/pulledAt=2026-10-05.oh-odt.commercial-activity-tax.txt` | ODT CAT page, exclusion by year | 14,548 |
| `refs/pulledAt=2026-10-05.oh-orc-5751.033.situs.txt` | ORC 5751.033(A)–(I), situs of gross receipts | 4,991 |
