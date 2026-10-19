# howto.file.state=new-york.current.active-loss

## .what

file the **current-year** New York State corporation franchise tax return, **Form CT-3** (Tax Law Article 9-A), on time, for a C corporation with a net loss.

> ⭐ a loss does **not** mean $0. New York taxes the **largest of three bases**, and one of them — the **fixed dollar minimum** — keys on New York receipts, never on profit. a loss year still owes it.

## ⛔ FIRST: is the corporation subject to Article 9-A this year?

> "a foreign corporation (incorporated outside New York State) that does business, employs capital, owns or leases property, maintains an office, or derives receipts from activity, in New York State; or"
>
> — Department, Article 9-A overview page

| the corporation | subject? | source |
|---|---|---|
| incorporated in New York | yes, every year until dissolved: *"is generally liable for franchise taxes for each fiscal or calendar year (or partial year) during which it is incorporated until it is formally dissolved with the Department of State."* | CT-3-I (2025) |
| incorporated elsewhere, with an office, property, employees, or business in New York | yes — any one of the listed activities | Article 9-A overview page |
| incorporated elsewhere, receipts only (economic nexus) | yes, once New York receipts reach the year's threshold | below |
| a foreign corporation never authorized by the NYS Department of State | still yes: *"A foreign corporation that is subject to tax in New York State must file and pay all state and local taxes even if it is not authorized by NYS Department of State."* | foreign corporations page |

### the economic-nexus threshold is CPI-indexed — read the year's figure

> "A corporation is considered to be deriving receipts in this state if it has receipts within New York of $1.283 million or more in a tax year."
>
> — CT-3-I (2025)

> "$1,283,000 for tax years beginning on or after January 1, 2024, and before January 1, 2027."
>
> — Department, receipts-threshold page (last reviewed October 22, 2025)

- the statute says one million dollars (Tax Law §209.1(b)); §209.1(e) has the Commissioner adjust it when CPI moves 10% or more. ⇒ quote the Department's figure for the year, never the statute's
- the same page lists **$1,000,000** for 2015–2021 and **$1,138,000** for 2022–2023
- a sales-only foreign seller of tangible goods may also sit under **P.L. 86-272** — CT-3 line C is the box to disclaim it. it does not reach software or services (`nexus/define.three-duties-three-tests`)

### ⛔ CT-4 is gone — there is no short form

| page | the CT-4 row |
|---|---|
| current general business corporation forms (last reviewed December 15, 2025) | absent |
| the 2024 forms page | *"CT-4 Discontinued General Business Corporation Franchise Tax Return Short Form. This form was discontinued"* |

⇒ every Article 9-A C corporation files **CT-3** (or **CT-3-A** if combined). the 2020–2023 pages carry the same Discontinued row; the last year CT-4 was live was not established.

## .facts

| field | value | source |
|---|---|---|
| form | **CT-3 (2025)** — *"This form must be used only for tax periods beginning on or after January 1, 2025."* | CT-3 (2025), page 1 |
| instructions | **CT-3-I (2025)** — calendar year 2025, fiscal years that begin in 2025, and short years that begin in 2025 | CT-3-I, *"When to use the 2025 tax return"* |
| the tax | the largest of business income base, capital base, and fixed dollar minimum | CT-3-I, *"Tax bases"* |
| due | 15th day of the 4th month after year end — **April 15** for a calendar year; next business day if it lands on a weekend or legal holiday | CT-3-I *"When to file"*; TSB-M-16(9)C |
| 2026 calendar | April 15, 2026 — *"New York C corporation tax return due for calendar year filers"*; October 15, 2026 with a valid extension | 2026 calendar |
| MTA surcharge | **CT-3-M**, a separate return, if the corporation is active in the MCTD | CT-3-M-I (2025) |
| NOL form | **CT-3.4**, every year | CT-3.4-I (2025) |
| extension | **CT-5**, six months, with the properly estimated tax paid — see below | CT-5-I (2025) |
| mail | NYS CORPORATION TAX, PO BOX 15181, ALBANY NY 12212-5181 | CT-3-I *"How to file"* |
| help | Corporation Tax Information Center **518-485-6027** | CT-1 (2025), *"Need help?"* |

## ⭐ the fixed dollar minimum — the tax a loss year pays

> "Corporations subject to tax under Tax Law Article 9-A generally must calculate three distinct taxes and pay the tax that results in the largest amount owed."
>
> — CT-3-I (2025), *"Tax bases"*

the three: business income (Part 3), business capital (Part 4), and *"a fixed dollar minimum tax based on New York receipts calculated in Part 6."* a loss zeroes the first, never the third.

the general table, verbatim from CT-3-I (2025), *"Tax rates schedule"* (the Department's definitions page carries the same figures):

| New York receipts | fixed dollar minimum |
|---|---:|
| Not more than $100,000 | $25 |
| More than $100,000 but not over $250,000 | $75 |
| More than $250,000 but not over $500,000 | $175 |
| More than $500,000 but not over $1,000,000 | $500 |
| More than $1,000,000 but not over $5,000,000 | $1,500 |
| More than $5,000,000 but not over $25,000,000 | $3,500 |
| More than $25,000,000 but not over $50,000,000 | $5,000 |
| More than $50,000,000 but not over $100,000,000 | $10,000 |
| More than $100,000,000 but not over $250,000,000 | $20,000 |
| More than $250,000,000 but not over $500,000,000 | $50,000 |
| More than $500,000,000 but not over $1,000,000,000 | $100,000 |
| Over $1,000,000,000 | $200,000 |

- qualified New York manufacturers and QETCs have a lower table, and non-captive REITs and RICs a short one — both on the same page
- zero New York receipts is still a row: *"If you do not have New York receipts, enter 0. To avoid an erroneous assessment or a delay in your refund, you must enter an amount on this line."* (CT-3-I, Line 1c)
- New York receipts = Part 6, line 57, column A
- a short year annualizes receipts, then cuts the minimum: **50%** for six months or less, **25%** for more than six through nine, none above nine (CT-3-I, Line 1c)

⚠️ the capital base can exceed the minimum. a loss corporation with capital in New York computes Part 4 too; the general rate is **0.001875**, and a **small business taxpayer** pays **0.00** on capital (CT-3-I, *"Tax rates schedule"*; Part 1, line 6 is the box to claim it). take whichever is larger, per Part 2, line 2.

## .how to file — software only, by mandate

> "You must electronically file if you meet all three of the following conditions:"
>
> — CT-1 (2025), the e-file mandate section

the three: prepare it yourself without a tax professional; use approved e-file software (or a computer to prepare it); have broadband. a paid preparer has a separate mandate, triggered past 10 taxpayers.

| channel | what it carries |
|---|---|
| **approved commercial software** | the CT-3, CT-3-M, CT-3.4, and the federal return attachment. the Department's list names, for tax year 2025, products such as TaxAct, Drake, ProSeries, Lacerte, ProConnect, UltraTax, CCH, and others with *"CT-3/3M"* |
| **Web File** (free, Business Online Services) | CT-5, CT-300, CT-400 only — the CT-3 is **not** on its list |
| **paper** | only if the mandate does not reach the corporation; mail to PO BOX 15181 above |

⚠️ check the year column: TurboTax Business sits on the approved list with tax years **2023–2024** and **no** main forms listed for tax year 2025.

the e-file mandate page also sets **$50** per document not e-filed and **$50** for a payment not made electronically.

## .the loss year, line by line

| where | what to enter |
|---|---|
| page 1 | tax period begin and end; EIN; New York file number; date of incorporation; for a foreign corporation, the date it began business in New York |
| line B | MCTD activity — **Yes** files CT-3-M too |
| Part 1, Section C, line 1 | mark the federal return type and attach it: *"Federal return filed – you must mark an X in one box and attach a complete copy of your federal return"* |
| Part 1, Section A, line 6 | small business taxpayer box, if eligible — the 0% capital rate |
| Part 3, line 1 | federal taxable income **before** NOL and special deductions — *"If you file federal Form 1120:"* use line 28 |
| Part 3, line 20 → Part 2, line 1a | business income base tax — $0 for a loss |
| Part 4 → Part 2, line 1b | capital base tax |
| Part 6, line 57, col. A → Part 2, line 1c | New York receipts → the fixed dollar minimum, from the table |
| Part 2, line 2 | the largest of 1a, 1b, 1c — never $0 for a corporation subject to tax |
| Part 2, lines 11–15 | any MFI, estimated payments, and the CT-5 payment already made |
| signature | an authorized officer certifies the return |

### ⚠️ file CT-3.4 every year, and decide the carryback on THIS return

> "Form CT-3.4 must be filed for every tax year, even when no NOLD is being used in the computation of the business income base."
>
> — CT-3.4-I (2025)

> "You must make the election on your original return (determined with regard to valid extensions) timely filed for the tax year in which the NOL was incurred."
>
> — CT-3.4-I (2025), *"Election to waive carryback"*

- the New York NOL is the business loss × that year's apportionment factor; it carries back **three** tax years, then forward up to **20**
- to keep the whole loss for later years, mark **line A** of CT-3.4 on the timely return. a late return loses that choice — `howto.file.state=new-york.delinquent.active-loss`
- **CT-3.3** (PNOLC) applies only to a balance carried from losses before 2015

### the MTA surcharge — a second return, on the same minimum

CT-3-M applies to a CT-3 filer that *"does business, employs capital, owns or leases property, maintains an office, or derives receipts from activity, in the Metropolitan Commuter Transportation District (MCTD)"* — New York, Bronx, Kings, Queens, Richmond, Dutchess, Nassau, Orange, Putnam, Rockland, Suffolk, and Westchester counties (CT-3-M-I (2025)).

- CT-3-M line 1a takes the CT-3 Part 2, line 2 tax — the fixed dollar minimum on a loss year
- line 4: *"MTA surcharge (multiply line 3 by 30% (0.30))"*, after the MCTD apportionment
- the receipts-only MCTD threshold is **$1.283 million**, same as the state's
- the surcharge return is due on the CT-3's date, and the same CT-5 extends both

### estimated tax and the MFI

> "For C corporations taxable under Article 9-A, the threshold is $5,000."
>
> — estimated tax page, for tax years that begin on or after January 1, 2026

the MFI (Form CT-300) keys on the tax after credits from **two years earlier**; quarterly CT-400 payments follow a reasonable expectation of the current year. a loss corporation that pays only the fixed dollar minimum owes neither unless that minimum reaches the threshold. both e-file only.

## .extension — CT-5, six months, never free

> "You must file Form CT-5 and pay the properly estimated franchise tax and metropolitan transportation business tax (MTA surcharge) on or before the original due date of the tax return for which you are requesting an extension"
>
> — CT-5-I (2025), *"Requirements for a valid New York State extension"*

the properly estimated tax must either:

- equal or exceed the tax on the **prior** year's return (if that year ran 12 months), or
- equal or exceed **90%** of the tax as finally determined for **this** year

| fact | value | source |
|---|---|---|
| form | **CT-5** — franchise tax and MTA surcharge on one form, one payment | CT-5-I (2025) |
| due | the original due date — April 15 for a calendar year | CT-5-I *"When to file"* |
| length | six months; then up to two more three-month extensions on **CT-5.1** | CT-5-I |
| channel | e-file: Web File (free) or approved software. *"Corporations must electronically file extensions even if they can't electronically file the associated tax return."* | e-file mandate page |
| paper | NYS CORPORATION TAX, PO BOX 15180, ALBANY NY 12212-5180 — a different box from the return | CT-5-I *"Where to file"* |
| interest | *"Interest applies to any tax not paid by the original due date of the return."* | CT-5-I |
| S corporations | CT-5.4, not CT-5 | CT-5-I |

⛔ **a loss year still owes a payment with the CT-5.** the tax is the fixed dollar minimum (or the capital base tax, if larger), so a $0 CT-5 fails both tests above and the extension is invalid. an invalid extension makes the return late from the original date (CT-3-I, *"If you file and pay after the due date"*).

✅ pay at least the year's fixed dollar minimum, plus the MTA surcharge on it if the corporation is active in the MCTD, read off the table — never estimated by hand.

## .steps

1. file the federal 1120 first; CT-3 line 1 starts from it
2. run the gate: subject this year? (incorporation, activities, receipts vs. the year's threshold)
3. confirm the form edition matches the tax year — CT-3 (2025) for a year that began in 2025
4. by April 15 (calendar year): if the return will run late, e-file **CT-5** with the fixed dollar minimum (and MTA surcharge) paid
5. complete CT-3: Part 3 from federal line 28; Part 4; Part 6 receipts → line 1c; line 2 = the largest
6. complete CT-3.4 — mark line A to waive the carryback, if that is the choice
7. complete CT-3-M if line B is Yes
8. attach a complete copy of the federal return
9. officer signs; e-file through approved software; pay any balance by ACH or with CT-200-V
10. calendar the next year: MFI and estimated dates from the Department's calendar, the return on April 15

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| the last tax year CT-4 was live | every prior-year page walked (2020–2024) marks it Discontinued |
| the MFI threshold for tax years that began before January 1, 2026 | the estimated tax page states only the new rule; CT-300-I was not pulled |
| whether a given product e-files a **2025** CT-3 | the list is the Department's claim; no product was tested |
| the capital base computation for a loss corporation | Part 4 depends on the balance sheet; this brief quotes the rates only |
| combined filers (CT-3-A) | not covered |
| New York City corporation tax | a separate tax and agency, not pulled |

## .enforcement

- "a loss, so no New York tax" = **blocker** (the fixed dollar minimum)
- Part 2, line 1c left blank = **blocker** (CT-3-I: *"you must enter an amount on this line"*)
- a CT-5 filed with a $0 payment for a year whose tax is the fixed dollar minimum = **blocker**
- a CT-4 prepared for any recent year = **blocker** (discontinued)
- a receipts threshold quoted from the statute rather than the Department's figure for that year = **blocker**
- a CT-3.4 skipped in a loss year = **blocker** (CT-3.4-I: every year)
- CT-3-M omitted by a corporation active in the MCTD = **blocker**
- a paper CT-3 from a corporation the mandate reaches = **nitpick** ($50 per document, per the mandate page)

## .provenance

pulled with **bhrowser**, headful, from urls harvested off `tax.ny.gov` (start: the home page → Corporation tax) and `nysenate.gov` (linked from the Department's forms pages). the bytes sit in `refs/`, manifest `refs/promote.jobs.json`:

| ref | what | chars |
|---|---|---:|
| `pulledAt=2026-10-04.ny-form-ct3i.2025.txt` | CT-3-I (2025), HTML edition | 147,623 |
| `pulledAt=2026-10-04.ny-form-ct3.2025.txt` | CT-3 (2025) | 40,047 |
| `pulledAt=2026-10-04.ny-form-ct3m.2025.txt` | CT-3-M (2025) | 20,462 |
| `pulledAt=2026-10-04.ny-form-ct3mi.2025.txt` | CT-3-M-I (2025) | 24,633 |
| `pulledAt=2026-10-04.ny-form-ct3-4i.2025.txt` | CT-3.4-I (2025), flow-order extract | 13,101 |
| `pulledAt=2026-10-04.ny-form-ct5i.2025.txt` | CT-5-I (2025), HTML edition | 14,226 |
| `pulledAt=2026-10-04.ny-form-ct1.2025.txt` | CT-1 (2025) | 18,574 |
| `pulledAt=2026-10-04.ny-article9a-overview.txt` | Article 9-A page, rev. December 5, 2025 | 7,305 |
| `pulledAt=2026-10-04.ny-article9a-definitions.txt` | Article 9-A definitions, rev. October 21, 2025 | 5,649 |
| `pulledAt=2026-10-04.ny-deriving-receipts.txt` | receipts threshold, rev. October 22, 2025 | 2,592 |
| `pulledAt=2026-10-04.ny-tax-law-209.txt` | Tax Law §209 | 15,448 |
| `pulledAt=2026-10-04.ny-corp-forms-current.txt` | current form list, rev. December 15, 2025 | 4,604 |
| `pulledAt=2026-10-04.ny-corp-forms-2024.txt` | 2024 form list — CT-4 Discontinued | 18,619 |
| `pulledAt=2026-10-04.ny-efile-mandate.txt` | e-file mandate, rev. March 23, 2025 | 8,320 |
| `pulledAt=2026-10-04.ny-efile-preparer-mandate.txt` | preparer mandate, rev. December 23, 2025 | 4,129 |
| `pulledAt=2026-10-04.ny-efile-software.ty2025.txt` | approved software, tax year 2025 | 7,807 |
| `pulledAt=2026-10-04.ny-efile-forms-supported.txt` | e-file-supported forms, 2023–2025 | 9,829 |
| `pulledAt=2026-10-04.ny-ct-web-file.txt` | Corporation Tax Web File, rev. January 6, 2026 | 3,473 |
| `pulledAt=2026-10-04.ny-estimated-tax.txt` | estimated tax, rev. December 16, 2025 | 2,801 |
| `pulledAt=2026-10-04.ny-calendar-2026.txt` | 2026 due-date calendar | 9,327 |
| `pulledAt=2026-10-04.ny-memo-tsb-m-16-9c-7i.txt` | TSB-M-16(9)C, (7)I, December 9, 2016 | 24,351 |
| `pulledAt=2026-10-04.ny-foreign-corps.txt` | foreign corporations, rev. March 5, 2024 | 3,624 |

- the Article 9-A page hides its due date and extension text in collapsed accordions; its ref is a textContent capture, since innerText omitted them
- CT-3-I is the Department's HTML edition; the PDF (`ct3i_2025.pdf`, stamp *CT-3-I (2025)*) was pulled to scratch to confirm the stamp
- the Department's forms roll each year. for a later year, use the CT-3 and CT-3-I whose caution line names that year

## .see also

- `howto.file.state=new-york.delinquent.active-loss` — a return past its due date
- `nexus/define.three-duties-three-tests` — why P.L. 86-272 does not reach software or services
- `federal/howto.file.federal.current.active-loss` — the return CT-3 line 1 starts from
- `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report` — the same "loss is not zero" trap, in a second state
