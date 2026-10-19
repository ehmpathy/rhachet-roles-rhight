# howto.file.state=florida.current.active-loss

## .what

file the **current-year** Florida corporate income tax return, **Form F-1120**, on time, for a corporation with a net loss.

> ⚠️ a loss means **$0 tax**, never **no return**. Florida keys the return to the federal one: see `hazard.zero-tax-still-owes-a-return` before you decide this brief does not apply.

## ⛔ FIRST: is the corporation a Florida taxpayer this year?

the test is the year's own activities, and a corporation run from Florida passes it even with zero Florida customers:

> "(n) Having corporate officers who have permanent or extended temporary residency (3 months in the aggregate of a 12 month period) within Florida who make management decisions while residing in Florida. **If the only officer of the corporation or a key officer of the corporation is residing within Florida, management of the corporation is presumed to be occurring within Florida.**"
>
> — Rule 12C-1.011(1)(n), F.A.C.

> "The determination … is dependent **only on the activities of the corporation during that tax year**."
>
> — Rule 12C-1.022(2)(d), F.A.C.

so each year stands alone: a year whose activities meet the rule owes the return, and a year whose activities do not owes Florida none of this. both rules sit whole in `refs/`.

## .key: the F-1120 starts from the federal 1120 — file federal first

> "Generally, corporations should enter the amount shown on **Line 30 of federal Form 1120** … Attach to Florida Form F-1120 …"
>
> — F-1120N R. 01/26, Line 1

> "Attach a copy of the actual federal income tax return filed with the IRS. You must also attach copies of federal Forms 4562, 851 (or Florida Form F-851), 1122, 1125-A, Schedule D, Schedule M-3, and any supporting details for Schedules M-1 and M-2."
>
> — F-1120N, Required Attachments

⇒ do `federal/howto.file.federal.current.active-loss` first. Florida takes the same taxable year and method of accounts as the federal return (F-1120N, *"Taxable Year and Accounting Methods"*).

## .facts

| field | value | source |
|---|---|---|
| form | **F-1120**, R. 01/26, for *"taxable years beginning on or after January 1, 2025"* | F-1120N header |
| short form F-1120A | only if *"It conducts 100 percent of its business in Florida (does not apportion income)"*, Florida net income ≤ $45,000, and four more tests | CIT File and Pay page |
| rate | 5.5% — a loss is **$0** | §220.1105(5) |
| exemption | the lesser of $50,000 or the Florida income; prorated for a year **shorter than 12 months** | F-1120N Line 9 |
| due | May 1 for a December 31 year end, or the 15th day after the federal due date, whichever is later | F-1120N, *"When is Florida Form F-1120 Due?"* |
| exact date | read it from the Department's calendar — it applies the weekend roll | `refs/pulledAt=2026-10-04.fl-cit-due-dates.r0126.txt` |
| extension | **F-7004**, by the original due date — a federal extension alone does not extend it | `howto.file.state=florida.extension` |
| registration | none found for corporate income tax — the Business Tax Application registers sales tax, reemployment tax, and others; corporate income tax is absent from its list | eServices registration page |

## .how to file — e-file through software, or paper

| channel | how |
|---|---|
| **e-file** | only through the IRS MeF program: *"To e-file the Florida Corporate Long Form Income Tax Return (F-1120), the return must be filed through the Internal Revenue Service's Modernized e-File (MeF) Program using approved software."* — CIT File and Pay page |
| **paper** | mail with any payment to **Florida Department of Revenue, 5050 W Tennessee St, Tallahassee FL 32399-0135**; a refund return goes to **PO Box 6440, Tallahassee FL 32314-6440** (F-1120N) |

the Department's approved MeF software list (R. 05/26) names, for Corporate Income Tax: Drake, Intuit (Lacerte, ProConnect, ProSeries Business, **TurboTax**), **TaxAct**, Taxware, and others — `refs/pulledAt=2026-10-04.fl-efile-vendors.r0526.txt`. ⇒ the same product that e-files the federal 1120 can usually transmit the F-1120 (see `tools/howto.use_tool.turbotax.desktop.on_linux`).

e-file is **mandatory** only for some:

> "You must file and pay electronically if you paid $5,000 or more in corporate income tax during the State of Florida's prior fiscal year (July 1 – June 30). You must also file and pay electronically if you were required to file your federal income tax return electronically."
>
> — F-1120N page 1

⚠️ paper from commercial software must come from DOR-approved software, for the right year: *"You cannot use 2024 software to produce 2025 tax forms."* (F-1120N page 2)

timely means: an e-filed return initiated **and confirmed** before 5:00 p.m. Eastern on the due date; a paper return **postmarked** by the due date (Rule 12C-1.0222(1)(a)).

## .the loss year, line by line

| line | what to enter |
|---|---|
| 1 | federal taxable income — federal 1120 Line 30. a loss: mark the line's *"if negative"* box, and attach the federal return (the form: *"Attach pages 1–6 of federal return"*) |
| 2–6 | additions and subtractions; for a plain loss corporation, usually none |
| 7 | Florida portion — **Line 6 as-is** if the business is entirely in Florida; else Schedules III + IV |
| 8 | nonbusiness income allocated to Florida — 0 if entirely in Florida |
| 9 | exemption: *"If the sum of Line 7 plus Line 8 is zero or less, enter zero (0)."* |
| 10 | Florida net income: *"If the result is a loss, enter zero (0)."* |
| 11–17 | tax and balance due: $0 |
| Questions A–L | *"All taxpayers must answer questions A through L."* — incl. **D** *"Initial return"* for the first Florida return, and **B** the Sunbiz document number if registered |

### ⚠️ the Line 7 choice sets the size of the Florida loss you carry forward

> "**Florida does not allow a taxpayer to apportion income if it is not doing business outside the state.** Making only sales in another state without property or payroll in that state does not automatically indicate a taxpayer is "doing business" in a state other than Florida."
>
> — F-1120N, Schedule III

> "The Florida carryover to future tax years is limited to the amount of the federal net operating loss multiplied by the Florida apportionment fraction."
>
> — F-1120N, Florida NOLD

| the corporation | Line 7 | the Florida carryforward |
|---|---|---|
| business entirely in Florida | Line 6, whole | the whole loss (F-1120N's *"For 100% Florida Taxpayers"* example) |
| business also done outside Florida | Schedule III fraction | the loss × that year's fraction (F-1120N's apportion example) |

⇒ to support a later Florida NOL deduction, F-1120N asks for a schedule of tax year, adjusted federal loss, apportionment fraction, Florida apportioned loss, and NOLCO applied. **keep that schedule from the first loss year.**

## .steps

1. file the federal 1120 for the year first
2. confirm the corporation was a Florida taxpayer this year (the gate above)
3. pick the form: F-1120, unless every F-1120A test holds
4. Line 1 from federal Line 30; work Lines 2–10; a loss lands at $0 on Line 10
5. answer Questions A–L; check **D** on the first Florida return
6. attach the federal return and its listed schedules
7. officer signs (F-1120N, *"Signature and Verification"*)
8. e-file through MeF software, or mail by the due date
9. keep the Florida NOL schedule for next year

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| the commercial-domicile test for nonbusiness income | Florida law states no definition; only matters where Line 8 is nonzero |
| a year with **no** sales, payroll, or property everywhere | every factor denominator is zero; neither statute nor rule says what then |
| how a first-time filer gets a Business Partner Number for the online site | the online site serves F-7004, F-1120A, and payments; the F-1120 itself goes by MeF or paper, so it needs none |

## .enforcement

- "a loss, so no Florida return" = **blocker** (`hazard.zero-tax-still-owes-a-return`)
- an F-1120 filed without the federal return attached = **blocker** (F-1120N, Required Attachments)
- F-1120A used by a corporation that apportions = **blocker**
- a federal extension relied on to extend the F-1120 = **blocker** (`howto.file.state=florida.extension`)
- Line 7 apportioned by a corporation that does business only in Florida = **blocker** (F-1120N, Schedule III)
- a first loss year filed with no NOL schedule kept = **nitpick**

## .provenance

pulled with **bhrowser**, headful, from urls harvested off the Department's corporate income tax page; the bytes sit in `refs/` beside this brief (manifest `refs/promote.jobs.json`):

| ref | what | chars |
|---|---|---:|
| `pulledAt=2026-10-04.fl-form-f1120n.r0126.txt` | F-1120N R. 01/26 | 129,827 |
| `pulledAt=2026-10-04.fl-form-f1120.r0126.txt` | F-1120 R. 01/26 | 48,658 |
| `pulledAt=2026-10-04.fl-cit-due-dates.r0126.txt` | due-date calendar R. 01/26 | 3,264 |
| `pulledAt=2026-10-04.fl-efile-vendors.r0526.txt` | approved e-file software R. 05/26 | 9,909 |
| `pulledAt=2026-10-04.fl-cit-file-and-pay-login.txt` | CIT File and Pay page | 2,591 — short and complete, inspected |
| `pulledAt=2026-10-04.fl-rule-12C-1.0222.txt` | Rule 12C-1.0222 | 6,101 |
| `pulledAt=2026-10-04.fl-rule-12C-1.011.txt` | Rule 12C-1.011, Tax Imposed | 12,343 |
| `pulledAt=2026-10-04.fl-rule-12C-1.022.txt` | Rule 12C-1.022, the return duty | 18,468 |

⚠️ DOR's `current/` forms roll each January. for a later year, use the F-1120 and F-1120N whose header names that taxable year.

## .see also

- `howto.file.state=florida.extension` — F-7004
- `howto.file.state=florida.delinquent.active-loss` — a return past its due date
- `hazard.zero-tax-still-owes-a-return` — why the return is owed at $0
- `federal/howto.file.federal.current.active-loss` — the return this one starts from
- `limitations/state=florida/lever.disclose-first-to-cap-the-lookback` — for a year that was skipped
