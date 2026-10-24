# inventory.of=tax-trigger.tax=corporate.state=pennsylvania

## .answer

the **corporate net income tax** (CNIT). the DOR states that "substantial nexus" alone subjects a corporation to it; the receipts figure behind that phrase is **⚠️ unverified** — the DOR's corporation tax bulletin list did not render, so no figure is stated here.

## .apportionment

**single sales factor** (taxable years after 2012), SaaS receipts sourced **market-based** if treated as a service (where the service is delivered; else where it was ordered, then the billing address).

> "(v) For taxable years beginning after December 31, 2012, all business income shall be apportioned to this State by multiplying the income by the sales factor."
>
> — Tax Reform Code of 1971 §401(3)2.(a)(9)(A)(v) (72 P.S. §7401(3)2.(a)(9)(A)(v))

> "(C) (I) Sales from the sale of service, if the service is delivered to a location in this State. If the service is delivered both to a location in and outside this State, the sale is in this State based upon the percentage of total value of the service delivered to a location in this State."
>
> — Tax Reform Code of 1971 §401(3)2.(a)(16.1)(C) (added July 9, 2013, P.L.270, No.52)

> "(III) If the state or states of assignment under unit (I) cannot be determined for a customer, except for a customer under unit (II), a service is deemed to be delivered at the location from which the services were ordered in the customer's regular course of operations."
>
> — same, (16.1)(C)(III)

## .the threshold

> "Domestic and foreign corporations are subject to the corporate net income tax for the privilege of doing business; carrying on activities; having capital or property employed or used in Pennsylvania; or owning property in Pennsylvania; or having substantial nexus in this Commonwealth."
>
> — PA DOR, *Corporate Net Income Tax* page

## .details

| item | value |
|---|---|
| figure | ⚠️ unverified — "substantial nexus", no figure on the pulled page |
| which receipts count | ⚠️ unverified |
| period | the taxable year |
| effective | page as pulled 2026-10-05 |
| physical presence also triggers | yes — business, activities, capital, or property in PA |
| P.L. 86-272 | shields tangible-goods solicitation only; never software or services |

## 🚩 open

| gap | why |
|---|---|
| the economic-nexus receipts figure for CNIT | the DOR document search (Tax Bulletins, Corporation Tax) loads its result list client-side; two pulls and the DOR site search returned no rendered items. the corporation tax bulletin that sets the figure was not reached — next rung: ask a human for the bulletin link |

| whether PA treats SaaS receipts as a service under (16.1)(C) or as a license of intangible property under (17)(C) | the DOR corporation tax bulletins (search renders client-side) were not reached; (17)(C) sources a licensed intangible where it is used, so both rules point at the customer, but the DOR position is unquoted |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.pa-dor.corporate-net-income-tax.txt` | DOR Corporate Net Income Tax page | 4,152 |
| `refs/pulledAt=2026-10-05.pa-trc-401-3-2-a.apportionment.txt` | Tax Reform Code §401(3)2.(a)(9)–(16.1), palegis.us compiled act (slice) | 6,230 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | P.L. 86-272 | 2,983 |
