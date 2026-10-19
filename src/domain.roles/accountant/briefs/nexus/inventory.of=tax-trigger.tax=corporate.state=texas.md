# inventory.of=tax-trigger.tax=corporate.state=texas

## .answer

Texas nexus in a federal tax period — **any** §3.586(d) physical activity, **or** Texas-sourced gross receipts of **$500,000 or more** — makes the corporation subject to the franchise tax from the day it began business in Texas (or its Texas SOS registration date). its first annual report (at minimum the PIR, Form 05-102) is due **May 15 of the next year**.

## .apportionment

no corporate income tax; the franchise tax on margin is apportioned by a **single gross-receipts factor** (Texas gross receipts over gross receipts everywhere), and SaaS receipts that are internet hosting (access to software on the seller's servers) are sourced **market-based, to the customer's location** — though other services source where performed, and electronically delivered software to the payor's legal domicile.

> "(c) Apportionment formula. Except as provided in paragraphs (1) and (2) of this subsection, a taxable entity's margin is apportioned to Texas to determine the amount of franchise tax due by multiplying the taxable entity's margin by a fraction, the numerator of which is the taxable entity's Texas gross receipts and the denominator of which is the taxable entity's gross receipts from its entire business."
>
> — 34 TAC §3.591(c) (STAR 202303004R)

> "(13) Internet hosting service. For reports originally due on or after January 1, 2014, receipts from internet hosting are Texas gross receipts if the customer is located in Texas."
>
> — 34 TAC §3.591(e)(13)

> "(A) Internet hosting service means providing to an unrelated user access over the internet to computer services using property that is owned or leased and managed by the provider and on which the user may store or process the user's own data or use software that is owned, licensed, or leased by the user or provider."
>
> — 34 TAC §3.591(e)(13)(A)

> "(26) Services. Except as otherwise provided in this section, gross receipts from a service are sourced to the location where the service is performed."
>
> — 34 TAC §3.591(e)(26)

> "(E) Gross receipts from the sale or lease of digital property that is transferred by means other than by fixed physical media are sourced as the sale of intangible property under paragraph (21)(B) of this subsection."
>
> — 34 TAC §3.591(e)(3)(E); (21)(B) sources an intangible to the location of payor, which §3.591(b)(8) defines as the payor's legal domicile

## .the trigger

> "(1) For each federal income tax accounting period ending in 2019 or later, a foreign taxable entity has nexus in Texas and is subject to Texas franchise tax, even if it has no physical presence in Texas, if during that federal income tax accounting period, it had gross receipts from business done in Texas of $500,000 or more"
>
> — 34 TAC §3.586(f)(1)

> "(d) Physical presence. Some specific activities that subject a taxable entity to Texas franchise tax include, but are not limited to, the following:"
>
> — 34 TAC §3.586(d) — 21 activities, condensed in `state=texas/shield.no-duty-below-the-bright-line`

> "For an out-of-state-formed entity, this may be the entity’s Texas SOS registration date or the day it began doing business in Texas."
>
> — Comptroller, franchise tax FAQ, *Accounting Year Begin Date*

## .thresholds

| figure | what it decides | applies to | source |
|---|---|---|---|
| **$500,000** Texas gross receipts | economic nexus — the duty itself | federal tax periods that end 2019 or later | §3.586(f)(1) |
| $2,650,000 annualized total revenue | no tax due — the PIR alone is filed | report years 2026 and 2027 | Comptroller hub |
| $2,470,000 | same | report years 2024 and 2025 | hub |
| $1,230,000 | same | report years 2022 and 2023 | hub |
| $1,000 tax | below it, no tax paid — a full report still filed if above the threshold | every report year | Reports and Payments FAQ |

⚠️ the no-tax-due threshold decides **which form and whether tax**, never **whether a report**. receipts are sourced under §3.591, not counted where billed.

## .what does NOT trigger it

- an out-of-state corporation with **none** of the 21 activities **and** under $500,000 Texas receipts: no report owed — *"Entities that are not organized in Texas and/or do not have nexus in Texas."* (PIR/OIR page, *Entities Not Required to File*)
- a Texas address used only for mail is absent from the 21 — but the list is *"not limited to"*, so absence is no safe harbor
- P.L. 86-272 reaches *"a net income tax"* only (15 U.S.C. §381); whether the Texas margin tax is one — see 🚩
- ⛔ a PIR filed "to be safe" by a no-nexus entity is itself evidence of nexus for that year (STAR 202302010H)

## .when the duty attaches, and the first deadline

> "A taxable entity first subject to franchise tax on or after Oct. 4, 2009, will file a first annual report, instead of an initial report, on May 15 of the year following the year the entity became subject to the tax."
>
> — Comptroller, Reports and Payments FAQ

- nexus is decided **per federal tax period**; a year under the line and a year over it are different answers
- the first report's period begins the day the entity became subject; a federal year end before that date yields a zero report — the PIR is still owed (05-915, 2026)

## ⚠️ a loss does not end it

the test is total revenue, never net income, and the report duty runs *"regardless of whether the entity is required to pay any tax"* (Tex. Tax Code §171.203(a)). below the threshold: the PIR alone, every May 15. see `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report`.

## 🚩 open

| gap | why |
|---|---|
| P.L. 86-272 vs the margin tax | no committed ref states the Comptroller's position |
| an address of record with no activity | no determination on that fact pattern (shield brief) |
| which §3.591 bucket a given SaaS contract falls in | internet host (customer location), digital property (payor domicile), or service (where performed) turns on the nine (13)(D) factors — a fact test per contract |
| whether STAR 202303004R is the latest §3.591 text | it was the only §3.591 rule row in the STAR results for the query `Rule 3.591 apportionment`; a later amendment was not searched for |
| Tex. Tax Code §171.103 and §171.106 | the statutes behind §3.591; not pulled — the Comptroller rule is the cited source |

## .sources

| ref | chars |
|---|---:|
| `refs/effectiveAt=2026-01-01.tx-rule-3.586-nexus.txt` | 8,415 |
| `refs/pulledAt=2026-10-04.tx-rule-3.591.star-202303004R.formula.txt` | 4,162 |
| `refs/pulledAt=2026-10-04.tx-rule-3.591.star-202303004R.internet-hosting.txt` | 3,560 |
| `refs/pulledAt=2026-10-04.tx-rule-3.591.star-202303004R.services.txt` | 150 |
| `refs/pulledAt=2026-10-04.tx-rule-3.591.star-202303004R.digital-property.txt` | 216 |
| `refs/pulledAt=2026-10-04.tx-rule-3.591.star-202303004R.intangible-sale.txt` | 188 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | 2,983 |
| `../franchise-tax/state=texas/refs/pulledAt=2026-10-04.tx-franchise-faq.txt` | 14,610 |
| `../franchise-tax/state=texas/refs/pulledAt=2026-10-04.tx-faq-reports-payments.txt` | 12,192 |
| `../franchise-tax/state=texas/refs/pulledAt=2026-10-04.tx-franchise-hub.txt` | 6,501 |
| `../franchise-tax/state=texas/refs/pulledAt=2026-10-04.tx-pir-oir-requirements.txt` | 4,692 |
| `../franchise-tax/state=texas/refs/effectiveAt=2024-01-01.tx-tax-171-reports.txt` | 12,013 |
| `../franchise-tax/state=texas/refs/pulledAt=2026-10-04.tx-form-05-915-instructions-2026.r0426.txt` | 73,317 |
| `../franchise-tax/state=texas/refs/pulledAt=2026-10-04.tx-star-202302010H-filed-pir-is-nexus-evidence.txt` | 935 |

⇒ the file how-to: `franchise-tax/state=texas/howto.file.state=texas.current.active-loss`
