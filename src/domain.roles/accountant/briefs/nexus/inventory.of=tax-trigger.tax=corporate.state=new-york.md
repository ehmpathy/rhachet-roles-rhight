# inventory.of=tax-trigger.tax=corporate.state=new-york

## .answer

a foreign corporation owes Article 9-A (**CT-3**) for any tax year in which it does business, employs capital, owns or leases property, or keeps an office in New York — **or** has New York receipts at or above the year's threshold (**$1,283,000** for tax years that begin 2024–2026). the return is due the **15th day of the 4th month** after year end (April 15 for a calendar year), and a loss still owes the fixed dollar minimum.

## .apportionment

**single receipts factor** (a fraction of receipts, net income, and net gains; no property or payroll factor), SaaS receipts sourced **market-based**: remote access to software is a digital product, sourced first to the customer's primary use location.

> "Business income and capital shall be apportioned to the state by the apportionment factor determined pursuant to this section. The apportionment factor is a fraction, determined by including only those receipts, net income, net gains, and other items described in this section"
>
> — N.Y. Tax Law §210-A.1 (revision of 2019-07-05)

> "Digital product includes, but is not limited to, an audio work, audiovisual work, visual work, book or literary work, graphic work, game, information or entertainment service, storage of digital products and computer software by whatever means delivered. The term "delivered to" includes furnished or provided to or accessed by."
>
> — N.Y. Tax Law §210-A.4(a)

> "(c) Hierarchy of sourcing methods. (1) The customer's primary use location of the digital product; (2) The location where the digital product is received by the customer, or is received by a person designated for receipt by the customer;"
>
> — N.Y. Tax Law §210-A.4(c)

- CT-3-I, Part 6, line 7 carries these receipts: *"Receipts from sale of, rental of, license to use, or granting of remote access to digital products and digital services"*, sourced under 20 NYCRR 4-3
- the "receipts-only" read is an inference from §210-A.1, which lists no property or payroll item; no single sentence in it names the formula

## .the trigger

> "1. (a) For the privilege of exercising its corporate franchise, or of doing business, or of employing capital, or of owning or leasing property in this state in a corporate or organized capacity, or of maintaining an office in this state, or of deriving receipts from activity in this state, for all or any part of each of its fiscal or calendar years, every domestic or foreign corporation"
>
> — Tax Law §209.1(a)

> "(b) A corporation is deriving receipts from activity in this state if it has receipts within this state of one million dollars or more in the taxable year."
>
> — Tax Law §209.1(b) — base figure, CPI-indexed; read the Department's figure below

> "A foreign corporation (incorporated outside of New York State) is liable for franchise taxes under Article 9-A during the period in which it is doing business, employing capital, owning or leasing property, maintaining an office, or deriving receipts from activity in New York State."
>
> — CT-3-I (2025)

## .thresholds

| New York receipts threshold | tax years | source |
|---|---|---|
| $1,000,000 | that begin 2015 through 2021 | Department, receipts-threshold page |
| $1,138,000 | that begin 2022 and 2023 | same |
| **$1,283,000** | that begin 2024 through 2026 | same |

- §209.1(c)–(d) add a credit-card test and a unitary-group aggregation for members with at least $10,000 of New York receipts — read the statute where either applies
- the fixed dollar minimum table (by New York receipts, $25 to $200,000) lives in `franchise-tax/state=new-york/howto.file.state=new-york.current.active-loss`

## .what does NOT trigger it

> "Line C: Pursuant to Public Law 86-272, a foreign corporation is not subject to the tax imposed by Article 9-A if its activities are limited to those described in that law."
>
> — CT-3-I (2025)

- that law reaches only solicitation of orders *"for sales of tangible personal property"* (15 U.S.C. §381(a)(1)) — never services or software
- receipts only, under the year's threshold, and none of the other §209.1(a) activities → no Article 9-A duty
- other exceptions: §209.2 and 20 NYCRR 1-2.9 (not pulled)

## .when the duty attaches, and the first deadline

> "A corporation is deemed to be deriving receipts from the date in the taxable year of its first receipt from activity in New York State or the MCTD."
>
> — Department, receipts-threshold page

- the duty runs *"for all or any part of"* a year (§209.1(a)); the first such year is the first CT-3, a short year included
- due: *"on or before the fifteenth day of the fourth month after the close of such fiscal year, for taxable years beginning on or after January first, two thousand sixteen"* (§209.1(a)); a weekend or holiday rolls forward (CT-3-I, *When to file*)
- activity in the MCTD adds **CT-3-M**, same due date

## ⚠️ a loss does not end it

New York taxes the largest of three bases, and the **fixed dollar minimum** keys on New York receipts, not profit — a loss year owes at least the minimum. zero New York receipts is still a row ($25) for a corporation subject to tax. a foreign corporation never authorized by the Department of State still files (foreign corporations page).

## 🚩 open

| gap | why |
|---|---|
| the threshold for tax years that begin 2027 or later | the Department's page stops at 2026 |
| 20 NYCRR 1-2.2 and 1-2.9, the activity rules | cited by CT-3-I; not pulled |
| New York City corporation tax | a separate tax and agency; not pulled |
| 20 NYCRR 4-3, the digital-product sourcing rules | cited by CT-3-I line 7; not pulled, so the special rules and the business-address presumption are unquoted |

## .sources

| ref | chars |
|---|---:|
| `../franchise-tax/state=new-york/refs/pulledAt=2026-10-04.ny-tax-law-209.txt` | 15,448 |
| `../franchise-tax/state=new-york/refs/pulledAt=2026-10-04.ny-deriving-receipts.txt` | 2,592 |
| `../franchise-tax/state=new-york/refs/pulledAt=2026-10-04.ny-form-ct3i.2025.txt` | 147,623 |
| `../franchise-tax/state=new-york/refs/pulledAt=2026-10-04.ny-article9a-overview.txt` | 7,305 |
| `../franchise-tax/state=new-york/refs/pulledAt=2026-10-04.ny-foreign-corps.txt` | 3,624 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | 2,983 |
| `refs/pulledAt=2026-10-05.ny-tax-law-210-A.apportionment.txt` | 6,498 |

⇒ the file how-to: `franchise-tax/state=new-york/howto.file.state=new-york.current.active-loss`
