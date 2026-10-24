# inventory.of=tax-trigger.tax=corporate.state=new-hampshire

## .answer

two business taxes: the **Business Profits Tax** (BPT, on income) and the **Business Enterprise Tax** (BET, on receipts/enterprise value). nexus is "business activity" — a **substantial economic presence**, no dollar bright line; a return is owed above the CPI-indexed thresholds: **BPT gross business income > $103,000** (periods from 1/1/2023) and **BET gross receipts > $298,000** (periods from 1/1/2025).

## .apportionment

**single sales factor** (Business Profits Tax, periods that end on or after December 31, 2022), SaaS receipts sourced **market-based** (where the customer receives the service).

> "(b) For taxable periods ending on or after December 31, 2022, the business organization's gross business profits shall be apportioned by multiplying the total gross business profits (less foreign dividends) of the business organization by the sales factor in subparagraph I(a)(1)(C)."
>
> — RSA 77-A:3, I(b)

> "(d) In the case of the delivery of a service to a customer by electronic transmission, the service shall be considered delivered in New Hampshire if and to the extent that the taxpayer’s customer receives the service in New Hampshire;"
>
> — N.H. Admin. Rules Rev 304.05(d), Sales Factor (periods that end on or after December 31, 2021)

## .the threshold

> "XII. "Business activity" means a substantial economic presence evidenced by a purposeful direction of business toward the state examined in light of the frequency, quantity, and systematic nature of a business organization's economic contacts with the state."
>
> — RSA 77-A:1, XII

> "if the gross business income is greater than $50,000 for taxable periods ending before December 31, 2022, $92,000 for taxable periods beginning on or after December 31, 2022, and $103,000 for taxable periods beginning on or after January 1, 2023, in the year of the sale"
>
> — DRA, *Business Profits Tax FAQs*

> "Taxable Periods Beginning on or after 1/1/2025 Gross receipts in excess of $298,000 or Enterprise value tax base greater than $298,000"
>
> — DRA, *Business Enterprise Tax FAQs*

## .details

| item | value |
|---|---|
| figure | BPT > $103,000 gross business income (2023 row); BET > $298,000 gross receipts or enterprise value tax base (2025 row) |
| which receipts count | BPT: gross business income from all activities; BET: gross receipts |
| period | the taxable period |
| effective | both thresholds adjusted biennially by CPI (RSA 77-A:6, I; RSA 77-E:5, I) |
| physical presence also triggers | yes — nexus is a contacts test, not presence-only |
| P.L. 86-272 | never reaches software/services; the BET is not a net income tax, so P.L. 86-272 does not reach it at all |

## 🚩 open

| gap | why |
|---|---|
| the BPT threshold for periods from 1/1/2025 | the FAQ stops at the 2023 row ($103,000); a 2025 adjustment is not stated |
| Rev 304.01 nexus examples | pulled (rev300) but list tangible-goods sellers |
| how the BET (enterprise value tax) is apportioned | out of scope here; RSA 77-E apportionment not read |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.nh-rsa-77-A.1.txt` | RSA 77-A:1 | 22,869 |
| `refs/pulledAt=2026-10-05.nh-rsa-77-A.6.txt` | RSA 77-A:6 | 3,493 |
| `refs/pulledAt=2026-10-05.nh-dra.bpt-faqs.txt` | DRA BPT FAQs | 8,791 |
| `refs/pulledAt=2026-10-05.nh-dra.bet-faqs.txt` | DRA BET FAQs | 6,716 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | P.L. 86-272 | 2,983 |
| `refs/pulledAt=2026-10-05.nh-rsa-77-A.3.txt` | RSA 77-A:3, Apportionment | 7,754 |
| `refs/pulledAt=2026-10-05.nh-rev-304.05.txt` | Rev 304.05, Sales Factor | 4,921 |
