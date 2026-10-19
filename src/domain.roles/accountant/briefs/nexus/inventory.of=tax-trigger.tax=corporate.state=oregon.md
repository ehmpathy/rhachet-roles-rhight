# inventory.of=tax-trigger.tax=corporate.state=oregon

## .answer

two business-level taxes. **corporation excise tax** (if "doing business" in Oregon, with a minimum tax from $150) or **income tax** (Oregon-source income only) — **no dollar bright line** on the DOR page. **Corporate Activity Tax** (CAT, a gross-receipts tax): register at **$750,000** of Oregon commercial activity; file and pay above **$1 million**; nexus has **no bright line**.

## .apportionment

**single sales factor** for the excise / income tax, SaaS receipts sourced **market-based** (a digital good or software license is assigned as a service delivered to the customer). the Corporate Activity Tax needs no formula: it sources each receipt the same way, a service where it is delivered and an intangible where it is used.

> "All apportionable income shall be apportioned to this state by multiplying the income by the sales factor."
>
> — ORS 314.650, *Apportionment of income*

> "Starting with the 2018 tax year, taxpayers must use market-based sourcing principles for certain receipts, excluding those from the sale of tangible personal property."
>
> — Oregon DOR, corporation excise and income tax page, *Market-based sourcing*

> "(c) In the case of the sale of a service, if and to the extent the service is delivered to a location in this state."
>
> — ORS 314.666(1), *Market for sales in this state*

> "In the case of a sale or license of digital goods or services, including, among other things, the sale of various video, audio, and software products, or similar transactions, the receipts from the sale or license are assigned by applying the same rules as are set forth in sections (4)(c)(B)(ii) or (iii) of this rule, as if the transaction were a service delivered to an individual or business customer or delivered through or on behalf of an individual or business customer."
>
> — OAR 150-314-0435(7)(b), *Sales or Licenses of Digital Goods or Services*

> "(d) In the case of the sale of a service, if and to the extent the service is delivered to a location in this state. (e) In the case of the sale, rental, lease or license of intangible property, if and to the extent the property is used in this state."
>
> — ORS 317A.128(1), *Sourcing of commercial activity* (CAT)

## .the threshold

> "Corporations that are doing business in Oregon, or with income from an Oregon source, must file an Oregon corporation tax return."
>
> — Oregon DOR, *Corporation Excise and Income Tax*

> "Business or unitary group with Oregon commercial activity of $750,000 must register for the CAT."
>
> — Oregon DOR, *Corporate Activity Tax* FAQ, *Who is subject to the CAT?*

> "Business or unitary group with taxable Oregon commercial activity of more than $1 million must file a return and pay tax."
>
> — same FAQ

> "The department will not apply a bright line nexus test for the CAT."
>
> — same page, *What nexus standard is used for CAT?*

## .details

| item | value |
|---|---|
| figure | excise / income tax: none stated; CAT: $750,000 to register, > $1 million to file and pay |
| which receipts count | CAT: Oregon commercial activity (a 35% subtraction for certain expenses applies to the tax base) |
| period | the tax year (CAT: the calendar year) |
| effective | pages as pulled 2026-10-05 |
| physical presence also triggers | yes — "doing business" in Oregon |
| P.L. 86-272 | the DOR page notes return exceptions under it for the excise/income tax; it shields tangible goods only, never software or services, and never the CAT (not a net-income tax) |

## 🚩 open

| gap | why |
|---|---|
| a receipts bright line for the excise / income tax | OAR 150-317-0020 not pulled; the OARD is a login-gated search |
| the CAT nexus rule text | OAR 150-317-1010 cited by the FAQ, not pulled |
| the customer hierarchy of OAR 150-314-0435(4)(c)(B)(ii)–(iii) | pulled with the rule page, not quoted; it decides which customer location wins when a SaaS user base spans states |
| any CAT rule that treats SaaS apart from ORS 317A.128(1)(d)–(e) | the CAT source rules in OAR chapter 150, division 317 (rules 1300 through 1330, linked from the CAT FAQ) not pulled |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.or-dor.corporation-excise-income-tax.txt` | DOR corporation excise and income tax page | 14,973 |
| `refs/pulledAt=2026-10-05.or-dor.cat-faq.txt` | DOR CAT FAQ, thresholds + nexus (slice) | 3,086 |
| `refs/pulledAt=2026-10-05.or-ors-314.650.single-sales-factor.txt` | ORS 314.650 (slice) | 285 |
| `refs/pulledAt=2026-10-05.or-ors-314.666.market.txt` | ORS 314.666, market for sales (slice) | 1,845 |
| `refs/pulledAt=2026-10-05.or-oar-150-314-0435.digital-goods.txt` | OAR 150-314-0435(7)(b), digital goods and software (slice) | 871 |
| `refs/pulledAt=2026-10-05.or-ors-317A.128.cat-sourcing.txt` | ORS 317A.128(1), CAT source rules (slice) | 1,156 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | P.L. 86-272 | 2,983 |
