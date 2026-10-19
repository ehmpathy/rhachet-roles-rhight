# inventory.of=tax-trigger.tax=corporate.state=california

## .answer

a foreign corporation owes the franchise tax (**Form 100**) from the earlier of the day it **qualifies** with the California SOS or the day it **does business** in California — any transaction for gain there, or California sales / property / payroll over the year's §23101 line (2025: **$757,070 / $75,707 / $75,707**, or 25%). the return is due the **15th day of the 4th month** after year end, and the **$800 minimum** applies to every year but a qualified corporation's first.

## .apportionment

**single sales factor**, SaaS receipts sourced **market-based** (market assignment, R&TC §25136).

> "R&TC Section 25128.7 requires all business income of an apportioning trade or business, other than an apportioning trade or business under R&TC Section 25128(b), to apportion its business income to California using the single-sales factor formula."
>
> — FTB, 2025 Form 100 booklet

> "R&TC Section 25136 requires all taxpayers to assign sales, other than sales of tangible personal property, using market assignment."
>
> — FTB, 2025 Form 100 booklet

## .the trigger

> "(a) “Doing business” means actively engaging in any transaction for the purpose of financial or pecuniary gain or profit."
>
> — R&TC §23101(a)

> "(a) Every corporation described in subdivision (b) shall be subject to the minimum franchise tax specified in subdivision (d) from the earlier of the date of incorporation, qualification, or commencing to do business within this state"
>
> — R&TC §23153(a)

> "Entities subject to the corporation minimum franchise tax include all corporations (e.g., LLCs electing to be taxed as corporations) that meet any of the following: Incorporated or organized in California. Qualified or registered to do business in California. Doing business in California, whether or not incorporated, organized, qualified, or registered under California law."
>
> — 2025 Instructions for Form 100, General Information A

## .thresholds

§23101(b) sets the bright lines; §23101(c) indexes them. take the FTB's row for the year:

| taxable year | CA sales exceed | CA property exceeds | CA payroll exceeds | source |
|---|---:|---:|---:|---|
| 2025 | $757,070 | $75,707 | $75,707 | FTB page, "Doing business in California" |
| 2024 | $735,019 | $73,502 | $73,502 | same |
| 2023 | $711,538 | $71,154 | $71,154 | same |
| 2022 | $690,144 | $69,015 | $69,015 | same |

each line is *"either the threshold amount or 25%"* of the total; the page carries rows back to 2014. organized or commercially domiciled in California is a fourth way in (§23101(b)(1)).

## .what does NOT trigger it

- foreign, not qualified, under every §23101 line, no transaction for gain in California, but California-source income → the corporation **income** tax instead: *"The corporation income tax is imposed on all corporations that derive income from sources within California but are not doing business in California."* (2025 Form 100 instructions, A)
- P.L. 86-272 exempts the income-measured tax for solicitation of tangible-goods orders, yet such corporations *"still are subject to the annual minimum franchise tax if they are doing business in, incorporated in, or qualified to transact intrastate business in, California."* (2025 Form 100 instructions, Line 18) — and never reaches services or software
- ⚠️ one transaction can suffice: *"Even an isolated transaction during the taxable year may be enough to cause the corporation to be “doing business.”"* (2025 Form 100 instructions, A)

## .when the duty attaches, and the first deadline

- the first taxable year is the one that holds the earlier of qualification or the start of business in California (§23153(a))
- due: *"on or before the 15th day of the 4th month after the close of the taxable year"* (2025 Form 100 instructions, E) — April 15 for a calendar year
- the $800 is owed by the **original** due date even with the automatic extension (§18604(b))
- the first installment of each later year's estimate (at least the $800) falls the same April

## ⚠️ a loss does not end it

> "The minimum franchise tax, as indicated below, must be paid whether the corporation is active, inactive, operates at a loss, or files a return for a short period of less than 12 months."
>
> — 2025 Instructions for Form 100, General Information C

**$800** a year (§23153(d)(1)). first-year exemption: only a corporation that incorporated or qualified **through the SOS** (§23153(f)(1); General Information C) — a foreign corporation that does business unqualified pays $800 from its first year.

## 🚩 open

| gap | why |
|---|---|
| business first, SOS qualification later — does the first-year exemption still apply? | not addressed in terms in any pulled source |
| the §23101 row for taxable year 2026 | the FTB page stops at 2025 |
| §25120 sales sources for a services seller | cited by the booklet; not pulled |
| how §25136 and Reg. 25136-2 assign a SaaS receipt | the booklet names market assignment; the cascade for services and intangibles was not pulled |

## .sources

| ref | chars |
|---|---:|
| `../franchise-tax/state=california/refs/pulledAt=2026-10-04.ca-rtc-23101.txt` | 3,518 |
| `../franchise-tax/state=california/refs/pulledAt=2026-10-04.ca-rtc-23153.txt` | 9,877 |
| `../franchise-tax/state=california/refs/pulledAt=2026-10-04.ca-rtc-18604.txt` | 1,760 |
| `../franchise-tax/state=california/refs/pulledAt=2026-10-04.ca-page-doing-business.txt` | 3,520 |
| `../franchise-tax/state=california/refs/pulledAt=2026-10-04.ca-form-100-booklet.ty2025.txt` | 123,326 |
| `refs/effectiveAt=1959-09-14.usc-15-381.pl-86-272.txt` | 2,983 |

⇒ the file how-to: `franchise-tax/state=california/howto.file.state=california.current.active-loss`
