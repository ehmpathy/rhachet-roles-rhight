# howto.file.state=california.current.active-loss

## .what

file the **current-year** California corporation franchise tax return, **Form 100**, on time, for a C corporation with a net loss — and pay the tax it still owes.

> ⭐ a loss does **not** mean $0. California charges an **$800 minimum franchise tax** on a loss year, an inactive year, and a short year alike. the return is owed, and so is the $800 — unless the year is the corporation's first.

this brief folds in the automatic extension and the FTB 3539 payment voucher (section *extension*). a return past its due date follows `howto.file.state=california.delinquent.active-loss`.

## ⛔ FIRST: does California's franchise tax reach the corporation at all?

the 2025 Form 100 instructions name three ways in:

> "Entities subject to the corporation minimum franchise tax include all corporations (e.g., LLCs electing to be taxed as corporations) that meet any of the following: Incorporated or organized in California. Qualified or registered to do business in California. Doing business in California, whether or not incorporated, organized, qualified, or registered under California law."
>
> — 2025 Instructions for Form 100, General Information A

the third way is the §23101 test. the statute keys on activity, then on bright lines:

> "(a) “Doing business” means actively engaging in any transaction for the purpose of financial or pecuniary gain or profit."
>
> — R&TC §23101(a)

> "(1) The taxpayer is organized or commercially domiciled in this state."
>
> — R&TC §23101(b)(1)

§23101(b)(2)–(4) set the sales, property, and payroll lines at $500,000 / $50,000 / $50,000, and §23101(c) has the FTB revise them each year. **read the year's figure from the FTB, never from the statute's base.** for taxable year 2025:

| factor | the corporation is in if California's share exceeds the lesser of… | source |
|---|---|---|
| sales | *"$757,070 or 25 percent of the taxpayer’s total sales"* | 2025 Form 100 instructions, A |
| real + tangible property | *"$75,707 or 25 percent of the taxpayer’s total real property and tangible personal property"* | same |
| payroll | *"$75,707 or 25 percent of the total compensation paid by the taxpayer"* | same |

the FTB's *Doing business in California* page prints the same row for 2025 and every year back to 2014 — use it for a prior year. a pass-through share counts: *"include the taxpayer’s pro rata share of amounts from partnerships and S corporations."*

⚠️ **one transaction can be enough**:

> "It is not necessary that the corporation conduct business or engages in transactions within the state on a regular basis. Even an isolated transaction during the taxable year may be enough to cause the corporation to be “doing business.”"
>
> — 2025 Form 100 instructions, A

⚠️ **P.L. 86-272 does not buy out the minimum.** a corporation shielded from the income-measured tax *"still are subject to the annual minimum franchise tax if they are doing business in, incorporated in, or qualified to transact intrastate business in, California"* (2025 Form 100 instructions, Line 18).

### the entry points, sorted

| the corporation | subject to the $800 from… | source |
|---|---|---|
| incorporated in California | its date of incorporation | §23153(a), (b)(1) |
| foreign, **qualified** with the Secretary of State | its date of qualification | §23153(b)(2); FTB Corporations page |
| foreign, **not** qualified, but past the §23101 test | the date it began business in California | §23153(b)(3) |
| foreign, not qualified, under every §23101 line, with California-source income | ⛔ no franchise tax — the **income** tax instead, with no minimum | 2025 Form 100 instructions, A and C |

> "A foreign corporation that does not qualify with the SOS, but does business in California, is subject to the franchise tax"
>
> — FTB, *Corporations* page

## ⭐ the $800 minimum — a loss does not erase it

> "The minimum franchise tax, as indicated below, must be paid whether the corporation is active, inactive, operates at a loss, or files a return for a short period of less than 12 months."
>
> — 2025 Form 100 instructions, General Information C

> "corporations subject to the minimum franchise tax shall pay annually to the state a minimum franchise tax of eight hundred dollars ($800)."
>
> — R&TC §23153(d)(1)

the form enforces it on two lines: Line 23 is *"Tax . __________% x line 22 (at least minimum franchise tax, if applicable)"* and Line 28 is *"Balance . Subtract line 27 from line 23 (at least minimum franchise tax, if applicable)"* (Form 100, 2025). credits cannot push it lower: *"corporations may not reduce the tax (line 23) below the minimum franchise tax, if applicable."*

### the first-year exemption — when it applies, and when it does not

> "(f) (1) Notwithstanding subdivision (a), every corporation that incorporates or qualifies to do business in this state on or after January 1, 2000, shall not be subject to the minimum franchise tax for its first taxable year."
>
> — R&TC §23153(f)(1)

the FTB reads "qualifies" as qualification **through the Secretary of State**, and says so in terms:

> "A corporation that incorporated or qualified through the California SOS to do business in California, is not subject to the minimum franchise tax for its first taxable year and will compute its tax liability by multiplying its state net income by the appropriate tax rate. The corporation will become subject to minimum franchise tax beginning in its second taxable year. This does not apply to corporations that are not qualified by the California SOS, or reorganize solely to avoid payment of their minimum franchise tax."
>
> — 2025 Form 100 instructions, General Information C

| the year | tax on a loss |
|---|---|
| first taxable year, incorporated in California or qualified with the SOS | measured tax on a loss — **$0** |
| first taxable year, foreign, **not** qualified, past the §23101 test | ⛔ **$800** — the exemption does not reach it |
| any later year | ⛔ **$800** |
| a taxable year of 15 days or less, with no business in California | none — *"if the corporation did no business in this state during the taxable year and the taxable year was 15 days or less"* (§23114(a)); the next year is then the first (Pub 1060) |
| a corporation that reorganized solely to dodge the minimum | ⛔ no exemption (§23153(f)(3)) |

⚠️ a foreign corporation that **did business first and qualified later** is not addressed in terms — see *what is NOT established*.

## .facts

| field | value | source |
|---|---|---|
| form | **Form 100**, TAXABLE YEAR 2025, *"For calendar year 2025 or fiscal year beginning"* | Form 100 (2025) |
| instructions | **2025 Instructions for Form 100** (the 100 Booklet) | `refs/…ca-form-100-booklet.ty2025.txt` |
| rate | 8.84% for corporations other than banks and financial corporations | 2025 Form 100 instructions, B |
| minimum | **$800**; $0 in the first taxable year for a corporation incorporated or qualified through the SOS | §23153(d)(1), (f)(1) |
| due | *"on or before the 15th day of the 4th month after the close of the taxable year"* | 2025 Form 100 instructions, E |
| exact date, calendar 2025 | *"Calendar year C corporations — File and Pay by April 15, 2026"* | FTB 3539 (2025) |
| extended due | the 15th day of the 11th month, with no form; November 16, 2026 for calendar 2025 | 2025 Form 100 instructions, F; FTB 3539 date table |
| payment | the full tax by the **original** due date — an extension is not one to pay | §18604(b) |
| weekend / holiday | *"the deadline to file and pay without penalty is extended to the next business day"* | 2025 Form 100 instructions, E |
| id on every payment | the California corporation number and *"2025 Form 100"* | 2025 Form 100 instructions, H |

## .how to file — e-file is mandatory once software prepares the return

> "California law requires business entities that file an original or amended tax return that is prepared using tax preparation software to electronically file (e-file) their tax return with the FTB."
>
> — 2025 Form 100 instructions, Important Information

| channel | how |
|---|---|
| **e-file** | through a product on the FTB's approved list — the *e-file software providers* page marks a **Business e-file** column (Drake Tax, Lacerte, ProConnect Tax Online, ProSeries, TaxAct Professional, UltraTax CS, and others). sign with **FTB 8453-C** |
| **waiver** | the FTB may waive the mandate for *"Technology constraints"*, undue financial burden, or reasonable cause; request it on the *Business entity e-file waiver request* page, once per year |
| **paper** | only where no software prepared it, or a waiver stands. no payment: **Franchise Tax Board, PO Box 942857, Sacramento CA 94257-0500**. with payment: **…94257-0501** (2025 Form 100 instructions, H) |
| **balance due on an e-filed return** | pay electronically, or mail **FTB 3586** with the check to **…94257-0531** |

⚠️ *"Do not use staples or other permanent bindings to assemble the tax return."* order: Form 100, Schedule R if any, schedules, the federal return, FTB 5806 if any (2025 Form 100 instructions).

⚠️ mandatory **EFT** is a separate rule: a corporation that paid an estimate or extension payment over $20,000, or has total tax over $80,000, must pay every later payment electronically or owe a 10% penalty (2025 Form 100 instructions, G). a corporation at the $800 minimum is far below it.

## .the loss year, line by line

| line | what to enter | source |
|---|---|---|
| 1 | *"Transfer the amount from federal Form 1120, line 28, to Form 100, Side 1, line 1; and attach a copy of the federal return and all pertinent supporting schedules"* — or carry federal page 1 onto Schedule F | 2025 Form 100 instructions, Line 1 |
| 2–16 | state additions and subtractions; a plain loss corporation often has none | Form 100 |
| 17 | net income (loss) after state adjustments | Form 100 |
| 18 | *"If all corporate income is derived from California sources, transfer the amount on line 17 directly to line 18."* otherwise Schedule R, and answer **Question N** | Line 18 |
| 19 | NOL deduction: a loss year enters **-0-** — see below | Line 19 |
| 22 | net income for tax purposes | Form 100 |
| 23 | 8.84% × line 22, **at least the $800** unless the first-year exemption applies | Line 23; General Information C |
| 28 | balance — again *"at least minimum franchise tax, if applicable"* | Form 100 |
| 32 | the estimated tax paid for the year (the $800 first installment, if paid) | Form 100 |
| Questions | answer **J**, *"First return?"*, and **H**, the date business began in California | Form 100, Side 3 |

### the NOL: computed and carried, never deducted in the loss year

> "If line 18 is a negative amount or $1,000,000 or more, corporations may not claim an NOL deduction carryover. Enter -0- on line 19. Get the 2025 form FTB 3805Q instructions to compute the NOL carryover to future years."
>
> — 2025 Form 100 instructions, Line 19

the 2024–2026 suspension bites only above $1 million of income:

> "For taxable years beginning on or after January 1, 2024, and before January 1, 2027, California has suspended the net operating loss (NOL) carryover deduction. Corporations may continue to compute and carryover an NOL during the suspension period. However, corporations with taxable income of less than $1,000,000 or with disaster loss carryovers are not affected by the NOL suspension rules."
>
> — 2025 Form 100 instructions, General Information W

⇒ in the loss year, complete **FTB 3805Q** to record the California NOL, and keep it: the carryforward is what a later profitable year deducts (Line 19 of that year). the carryover period for suspended losses is extended (General Information W).

## .estimated tax — next year's $800 is due the same day as this year's return

> "The 1st payment is due by the 15th day of the 4th month of the taxable year (this payment may not be less than the minimum franchise tax, if applicable)."
>
> — 2025 Form 100 instructions, General Information K

> "If the amount of estimated tax does not exceed the minimum franchise tax plus any QSub annual tax (if applicable), then the entire amount of the minimum tax and the QSub annual tax is due as an estimate on or before the 15th day of the 4th month of the corporation’s taxable year."
>
> — 2026 Instructions for Form 100-ES

for a calendar-year corporation that expects another loss, two payments fall on one April date: the **prior** year's balance with Form 100, and the **current** year's $800 first installment on Form 100-ES (or Web Pay). the first taxable year is the exception — Pub 1060: *"Corporations subject to the franchise tax must pay at least the minimum franchise tax by the first installment due date, unless this is the corporation’s first taxable year."*

## .extension — automatic, no form, and it does not extend the payment

> "If the corporation cannot file its California tax return by the 15th day of the 4th month after the close of the taxable year, it may file on or before the 15th day of the 11th month without filing a written request for an extension. Get FTB Notice 2019-07 for more information. There is no automatic extension period for business entities suspended on or after the original due date."
>
> — 2025 Form 100 instructions, General Information F

> "An automatic extension does not extend the time for payment of tax; the full amount of tax must be paid by the original due date of Form 100. If there is an unpaid tax liability, complete form FTB 3539, Payment for Automatic Extension for Corporations and Exempt Organizations, and send it with the payment by the original due date of the Form 100."
>
> — same

| question | answer | source |
|---|---|---|
| form to request it? | none — *"No application is required for an extension to file."* | FTB *Extension to file* page |
| how long? | to the 15th day of the 11th month; the statute caps any extension at seven months | §18604(a) |
| who loses it? | a corporation suspended or forfeited **as of the original due date** — and one that misses the extended date, whose penalty then runs from the original date | FTB 3539 instructions, Penalties and Interest |
| must the $800 be paid by the original date? | yes, for any year past the first: on the FTB 3539 worksheet, *"the tentative tax may not be less than the minimum franchise tax"* | FTB 3539 instructions, Line 1 |
| how to pay? | Web Pay, EFW through software, or credit card — then **do not** mail FTB 3539. by check: FTB 3539 to **Franchise Tax Board, PO Box 942857, Sacramento CA 94257-0531** | FTB 3539 instructions |
| no tax owed? | *"If the corporation or exempt organization does not owe tax, do not file form FTB 3539."* — e.g. the first-year loss | FTB 3539 instructions |

⚠️ if the year's $800 was already paid as the April estimate, payments cover the tentative tax and no FTB 3539 is owed (worksheet line 3, *"Excess payments"*).

## .steps

1. file the federal 1120 for the year first — Line 1 starts from it
2. confirm the corporation is inside California's franchise tax (the gate above), and whether this is its first taxable year
3. pay any tax owed by the original due date — the $800 for any year past the first — via Web Pay or FTB 3539
4. if the return will run late, no request is needed: the extension is automatic, to the 15th day of the 11th month
5. Line 1 from federal 1120 line 28; work Lines 2–18; a loss leaves Line 22 at zero
6. Line 19: -0-; complete FTB 3805Q for the carryforward
7. Line 23 and Line 28: the $800 (or $0 in the first year)
8. answer the Questions, incl. **J** on the first return; attach the federal return and schedules
9. e-file through approved software with FTB 8453-C; paper only if no software prepared it or a waiver stands
10. in the same April, pay the **next** year's $800 first installment on Form 100-ES
11. keep the Statement of Information current with the Secretary of State — a separate duty, see `.see also`

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| a foreign corporation that did business in California **before** it qualified with the SOS | §23153(a) starts the minimum at the earlier of qualification or commencement; whether its later qualification still earns the (f)(1) first-year exemption is not addressed in terms in any pulled source |
| the FTB 3539 wording on the extension's length | its general information speaks of a six-month extension, while its own date table (November 16, 2026), the 100 Booklet (15th day of the 11th month), the Corporations page (7-month), and §18604 (seven months) agree on seven. this brief follows the date table and the statute |
| the 2025 FTB 3805Q text | the Booklet names it; the NOL page linked only the 2024 edition, so neither edition is promoted here |
| apportionment of a loss under Schedule R | not walked; Line 18 needs it only if income comes from outside California |

## .enforcement

- "a loss, so no California tax" = **blocker** (§23153(d)(1); General Information C)
- the first-year exemption claimed by a foreign corporation that never qualified with the SOS = **blocker** (General Information C)
- the $800 held back until an extended return = **blocker** (§18604(b); General Information F)
- a software-prepared return mailed on paper with no waiver = **blocker** (Important Information)
- an NOL deducted on Line 19 in a loss year = **blocker** (Line 19)
- the next year's $800 first installment skipped = **blocker** (General Information K)
- a 2025 threshold applied to a different year = **nitpick** (§23101(c) indexes it; read the FTB table for that year)

## .provenance

pulled with **bhrowser**, headful, from urls harvested off ftb.ca.gov's own navigation and sitemap; statutes reached through leginfo's own Code Search form. bytes in `refs/`, manifest `refs/promote.jobs.json`:

| ref | what | chars |
|---|---|---:|
| `pulledAt=2026-10-04.ca-form-100-booklet.ty2025.txt` | 2025 Instructions for Form 100 — sliced, see manifest | 123,326 |
| `pulledAt=2026-10-04.ca-form-100.ty2025.txt` | Form 100, taxable year 2025 | 67,164 |
| `pulledAt=2026-10-04.ca-form-ftb3539.ty2025.txt` | FTB 3539, taxable year 2025 | 20,492 |
| `pulledAt=2026-10-04.ca-form-100es-instructions.ty2026.txt` | 2026 Instructions for Form 100-ES | 31,391 |
| `pulledAt=2026-10-04.ca-pub-1060.r0425.txt` | FTB Pub 1060, Revised 04-2025 | 25,670 |
| `pulledAt=2026-10-04.ca-page-corporations.txt` | FTB *Corporations* page | 5,946 |
| `pulledAt=2026-10-04.ca-page-extension-to-file.txt` | FTB *Extension to file* page | 2,045 |
| `pulledAt=2026-10-04.ca-page-c-corporations.txt` | FTB *C corporations* page | 4,299 |
| `pulledAt=2026-10-04.ca-page-doing-business.txt` | FTB *Doing business in California*, thresholds 2014–2025 | 3,520 |
| `pulledAt=2026-10-04.ca-page-due-dates-business.txt` | FTB *Due dates: businesses*, accordion included | 18,063 |
| `pulledAt=2026-10-04.ca-page-nol.txt` | FTB *Net operating loss* | 3,891 |
| `pulledAt=2026-10-04.ca-page-efile-for-business.txt` | FTB *e-file for business* | 4,252 |
| `pulledAt=2026-10-04.ca-page-efile-software-providers.txt` | FTB approved e-file software | 5,291 |
| `pulledAt=2026-10-04.ca-rtc-23101.txt` | R&TC §23101 | 3,518 |
| `pulledAt=2026-10-04.ca-rtc-23153.txt` | R&TC §23153 | 9,877 |
| `pulledAt=2026-10-04.ca-rtc-23114.txt` | R&TC §23114 | 1,540 — short and complete, inspected |
| `pulledAt=2026-10-04.ca-rtc-18604.txt` | R&TC §18604 | 1,760 — short and complete, inspected |

⚠️ FTB serves each year's forms under a year folder (`/forms/2025/`). for a later year, use the Form 100 and booklet whose header names that taxable year, and re-read the §23101 threshold row for it.

⚠️ the *Extension to file* page shows the personal tab by default; only its first line (*"No application is required for an extension to file."*) is relied on here. the business rule itself comes from the 100 Booklet and §18604.

## .see also

- `howto.file.state=california.delinquent.active-loss` — a return past its due date, suspension, revivor
- `federal/howto.file.federal.current.active-loss` — the return Line 1 starts from
- `nexus/define.three-duties-three-tests` — why the franchise-tax answer and the registration answer differ
- the **Statement of Information** with the California Secretary of State is a **different duty**: the FTB collects a $250 SOS penalty for it, and the SOS can suspend for it alone (FTB *Corporations* page) — `registrator`
