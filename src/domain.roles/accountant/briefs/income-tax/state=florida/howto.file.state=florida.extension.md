# howto.file.state=florida.extension

## .what

extend the due date of a Florida corporate income tax return (**F-1120**) with **Form F-7004**, Florida Tentative Income/Franchise Tax Return and Application for Extension of Time to File Return.

- it extends the time to **file**, never the time to **pay**
- it must reach the Department **on or before the original due date** — a lapsed due date cannot be extended. a return past its due date follows `howto.file.state=florida.delinquent.active-loss`

## ⛔ a FEDERAL extension does NOT extend the Florida return

> "You must file Florida Form F-7004 to extend your time to file. **A copy of your federal extension alone will not extend the time** for filing your Florida return."
>
> — F-1120N R. 01/26, page 2

the reverse trap is quieter: the Florida extension is **automatic** only when a federal extension was also requested.

> "3. If an automatic extension is not permitted because a **federal extension has not been requested** or is not allowed, the application for extension of time to file a return **must contain sufficient facts to establish good cause** why the return cannot be filed on or before the original due date."
>
> — Rule 12C-1.0222(2)(a)3, F.A.C.

| you request | Florida result |
|---|---|
| F-7004 **and** a federal extension | ✅ automatic — the rule's (2)(b) path |
| F-7004 alone | ⚠️ granted only on **good cause**, stated on the F-7004 (item A, *"state the reason you need the extension"*) |
| a federal extension alone | ⛔ no Florida extension at all |

⇒ request both. the federal form is IRS Form 7004; its text is **not pulled** in this brief — confirm on irs.gov.

## .facts

| field | value | source |
|---|---|---|
| form | **F-7004**, R. 01/17 (the current edition DOR serves) | `refs/…fl-form-f7004.r0117.txt` |
| due | the **original** due date of the F-1120 — May 1 for a December 31 year end | Rule 12C-1.0222(3)(b)1 |
| earliest | *"Do not file before the end of the tax year."* | F-7004 instructions |
| extended due date | November 1 for a December 31 year end (six months) | Rule 12C-1.0222(3)(b)1 |
| how many | *"Only one extension may be granted per tax year."* | F-1120N page 2 |
| payment | 100% of the tentative tax, with the application | F-7004 line 3; Rule 12C-1.0222(2)(b)2 |
| signer | an officer or partner, an IRS enrolled agent, or an attorney or CPA qualified before the IRS | F-7004 instructions |
| weekend / holiday | due date rolls to the next business day | Rule 12C-1.0222(1)(a) |

⭐ use the Department's calendar for the exact date, not arithmetic — it applies the weekend roll for you: `refs/pulledAt=2026-10-04.fl-cit-due-dates.r0126.txt` (R. 01/26). e.g. tax year end 12/31/25 → return or extension due **05/01/26**, extended due **11/02/26** (November 1, 2026 is a Sunday).

## ⛔ the extension VOIDS itself if the tentative tax is short

> "An extension of time will be invalidated when the: a. Tentative tax due is not paid with the application for extension (Form F-7004); or, b. The tax is underpaid by **the greater of $2,000 or thirty percent (30%)** of the tax due on the return when filed."
>
> — Rule 12C-1.0222(3)(c)2

a void extension means the return was late from the original due date, with the §220.801 penalty from that date.

✅ **a loss-year corporation** owes no tentative tax: lines 1–3 of the F-7004 are $0, and the extension stands on the timely filing alone.

## .three ways to file it

| channel | how | note |
|---|---|---|
| **online** | the Department's CIT File and Pay site: `taxapps.floridarevenue.com/Corporate/Login.aspx` | ⚠️ login is a User ID + password, **or** FEIN + **Business Partner Number** — see the gap below |
| **IRS MeF** | through approved tax software, the same transmitter as the federal return | *"You can file Florida Form F-7004 electronically through the IRS MeF Program or online."* — F-1120N |
| **paper** | mail to **Florida Department of Revenue, 5050 W Tennessee St, Tallahassee FL 32399-0135** | timely if **postmarked** on or before the due date (Rule 12C-1.0222(1)(a)). send it tracked |

> "Welcome to the Florida Corporate Income Tax (CIT) internet site, where you can **file the Florida Corporate Extension of Time (F-7004)**, Florida Corporate Short Form Income Tax Return (F-1120A), or make payments…"
>
> — the CIT File and Pay login page

an electronic submission is timely only if *"initiated, and a confirmation from the Department is received, before 5:00 p.m. (Eastern Time), on or before the due date"* (Rule 12C-1.0222(1)(a)). do not start it at 4:50.

## .steps

1. after the tax year ends, and before the original due date
2. request the **federal** extension too, so the Florida extension is automatic
3. fill the F-7004: name, FEIN, address, taxable year end (MMDDYY), the type of federal return (*"All other federal returns to be filed"* for an 1120)
4. lines 1–3: tentative Florida tax, less estimated payments, balance due. a loss year: all $0
5. item A: if no federal extension was requested, **state the good cause** here
6. sign and date; name a contact person, phone, and email
7. file it by one of the three channels; pay any balance with it
8. keep the proof — the e-file confirmation number, or the postmark receipt
9. on the F-1120 later: check **Question F**, *"Attach a copy of Florida Form F-7004, if timely filed"*, and put any tentative tax paid on **Line 16(b)**

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| whether a corporation **new** to the Department holds a Business Partner Number for the online login | the login page asks for one; how a first-time filer obtains it was not pulled. paper or MeF needs none |
| whether a corporation needs any Department **registration** before it files | the Business Tax Application page lists the taxes it registers, and corporate income tax is **not** among them — so no registration appears required, but no sentence says so in terms |
| the IRS Form 7004 text | not pulled; this brief names the form and no more |

## .enforcement

- a federal extension relied on to extend a Florida return = **blocker** (F-1120N, in terms)
- an F-7004 with no federal extension and no stated good cause = **blocker** (Rule 12C-1.0222(2)(a)3)
- an F-7004 sent with less than the full tentative tax = **blocker** (the extension voids itself)
- an e-filed F-7004 with no Department confirmation on file = **nitpick**
- a due date computed by hand rather than read from the Department's calendar = **nitpick** (`rule.forbid.hand-computed-figures`)

## .provenance

every quote below was pulled with **bhrowser**, headful, from a url harvested from the Department's corporate income tax page. the bytes are committed beside this brief (`refs/`, manifest `refs/promote.jobs.json`):

| ref | what | chars |
|---|---|---:|
| `pulledAt=2026-10-04.fl-form-f7004.r0117.txt` | F-7004 R. 01/17, form + instructions | 18,297 |
| `pulledAt=2026-10-04.fl-form-f1120n.r0126.txt` | F-1120N R. 01/26 | 129,827 |
| `pulledAt=2026-10-04.fl-rule-12C-1.0222.txt` | Rule 12C-1.0222 | 6,101 |
| `pulledAt=2026-10-04.fl-cit-due-dates.r0126.txt` | the due-date calendar R. 01/26 | 3,264 |
| `pulledAt=2026-10-04.fl-cit-file-and-pay-login.txt` | the CIT File and Pay login page | 2,591 — short and complete, inspected |

⚠️ DOR serves forms from a `current/` folder that rolls each year. a re-pull that shows a new revision stamp supersedes these.

## .see also

- `howto.file.state=florida.current.active-loss` — the return this extends
- `howto.file.state=florida.delinquent.active-loss` — the path once the due date has passed
- `hazard.zero-tax-still-owes-a-return` — why a $0-tax corporation owes the return at all
