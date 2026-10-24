# inventory.of=tax-trigger.tax=corporate.state=maryland

## .answer

the **corporation income tax**. Maryland taxes to the full constitutional limit and states **no dollar bright line**; a corporation that does business in Maryland, or is registered there, files regardless of net income.

## .apportionment

**single sales factor** (tax years after Dec. 31, 2021), SaaS receipts sourced **market-based** (service receipts count where the customer is domiciled — for a business, the office that provides the principal impetus for the sale).

> "For tax years beginning after December 31, 2021, corporations carrying on a business within and outside Maryland determine income derived from Maryland using a single sales factor apportionment formula, by multiplying its Maryland modified income by 100% of the sales factor."
>
> — Comptroller of Maryland, Administrative Release No. 43, Corporate Apportionment of Income (updated Oct. 27, 2022), I

> "For tax years beginning after December 31, 2021, multi-state businesses using the apportionment method of allocation generally are required to use a single receipts factor."
>
> — Comptroller of Maryland, 2025 Maryland Corporation Income Tax booklet, Single Sales Factor Apportionment

> "Gross receipts from service-related activities are included in the numerator if the receipts are derived from customers within this State. There are specific rules to determine “Customers Within this State.” To review these rules, see Maryland Regulation 03.04.03.08D."
>
> — same, Receipts Factor

> "Property and payroll factors must be developed if the taxpayer has income from the sale of intangibles or is subject to a special apportionment formula or alternative apportionment formula."
>
> — same, Single Sales Factor Apportionment

> "(c) Gross receipts from contracting or service-related activities shall be included in the numerator if the receipts are derived from customers within this State as determined in §D of this regulation. (d) Gross income from intangible items such as dividends, interest, royalties, and capital gains from the sale of intangible property shall be included in the numerator based upon the average of the property and payroll factors."
>
> — COMAR 03.04.03.08C(5)(c)–(d)

> "(ii) A business enterprise shall be considered a customer within this State if the business enterprise is domiciled in this State. (iii) If the customer is a business enterprise, then the domicile is the state in which is located the office or place of business that provides the principal impetus for the sale."
>
> — COMAR 03.04.03.08D(2)(b)

## .the threshold

> "Maryland imposes its corporate income tax to the full extent permitted by law. The U.S. Constitution has been generally construed to preclude the imposition of income tax on a corporation unless it has sufficient nexus with the taxing state."
>
> — Comptroller of Maryland, Income Tax Administrative Release No. 2, I. General

> "A. Every corporation that is organized under the laws of Maryland, registered or qualified to do business within this State, or doing business within this State, regardless of net income, shall file a true and accurate return of its income or loss for the taxable period."
>
> — same, III.A

## .details

| item | value |
|---|---|
| figure | none — constitutional nexus |
| which receipts count | Maryland-apportioned income |
| period | taxable period |
| effective | current release; no indexed figure |
| physical presence also triggers | yes — AR IT-2 lists in-state activities that create nexus |
| P.L. 86-272 | AR IT-2 II: protects only solicitation of orders *"of tangible personal property"* — never software or services |

## 🚩 open

| gap | why |
|---|---|
| the release's revision date | not captured in the pdf text read |
| a customer with offices in several states | COMAR 03.04.03.08D(2)(b) picks one domicile — the office that provides the principal impetus for the sale — so a SaaS contract is not prorated by seat; how the Comptroller applies "principal impetus" to SaaS was not found |
| SaaS as service or as intangible | if the Comptroller treats SaaS fees as royalties for intangible property, COMAR 03.04.03.08C(5)(d) puts them in the numerator by the average of the property and payroll factors — a cost-side measure; no Comptroller guidance on SaaS was pulled |
| TG §10-402 itself | the cell rests on AR IT-43 and the 2025 booklet; the statute text was not pulled |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.maryland-administrative-release-it-2.txt` | Income Tax Administrative Release No. 2 | 8,896 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | P.L. 86-272 | 2,983 |
| `refs/pulledAt=2026-10-05.maryland-administrative-release-it-43.txt` | Administrative Release No. 43, corporate apportionment | 13,196 |
| `refs/pulledAt=2026-10-05.maryland-corporate-booklet.2025.txt` | 2025 corporation income tax booklet (Form 500) | 98,460 |
| `refs/pulledAt=2026-10-05.maryland-comar-03.04.03.08.txt` | COMAR 03.04.03.08, apportionment of income | 25,064 |
