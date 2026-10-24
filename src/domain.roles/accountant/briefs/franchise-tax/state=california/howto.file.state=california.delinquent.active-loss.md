# howto.file.state=california.delinquent.active-loss

## .what

file a California corporation franchise tax return (**Form 100**) after its due date has passed, for a C corporation with a net loss; pay the $800 minimum and what accrued on it; and, if the FTB has already suspended or forfeited the corporation, revive it.

the return itself is the same as an on-time one — see `howto.file.state=california.current.active-loss` for the lines and the first-year exemption. this brief covers what changes once the date is gone.

> ⚠️ a loss year past its first is **not** a $0 year in California. the $800 minimum was due by the original date, so a late loss return is a late **payment** too, and the penalties and interest run on that $800.

## ⛔ the automatic extension is gone once the extended date passes

> "Any corporation that fails to file Form 100 on or before the extended due date is assessed a delinquent filing penalty. The delinquent filing penalty is computed at 5 percent of the tax due, after allowing for timely payments, for every month that the return is late, up to a maximum of 25 percent. If a corporation does not file its return by the extended due date, the automatic extension will not apply and the late filing penalty will be assessed from the original due date of the return."
>
> — 2025 Instructions for Form 100, General Information M

| the return lands… | the late-file penalty counts from |
|---|---|
| after the original date, by the 15th day of the 11th month | none — the automatic extension covered it (the payment still had to be on time) |
| after the extended date | ⛔ the **original** due date |
| from a corporation suspended or forfeited as of the original date | ⛔ the original due date — a suspended corporation gets no automatic extension (FTB 3539 instructions, Penalties and Interest) |

## .what a late loss year costs

### the late-file penalty — a percentage of the TAX

> "5 percent of the tax shall be added to the tax for each month or fraction thereof elapsing between the due date of the return (determined without regard to any extension of time for filing) and the date on which filed, but the total penalty may not exceed 25 percent of the tax."
>
> — R&TC §19131(a)

> "the amount of tax required to be shown on the return shall be reduced by the amount of any part of the tax which is paid on or before the date prescribed for payment of the tax"
>
> — R&TC §19131(c)

### the late-payment penalty

> "The penalty is 5 percent of the unpaid tax, plus 0.5 percent for each month, or part of the month (not to exceed 40 months), the tax remains unpaid. This penalty may not exceed 25 percent of the unpaid tax."
>
> — 2025 Form 100 instructions, General Information M

> "If a corporation is subject to both the penalty for failure to file a timely return and the penalty for failure to pay the total tax by the due date, a combination of the two penalties may be assessed, but the total penalty may not exceed 25 percent of the unpaid tax."
>
> — same

### interest — no cap, and no waiver for reasonable cause

> "Interest is due and payable on any tax due if not paid by the original due date of Form 100. Interest is also due on some penalties. The automatic extension of time to file Form 100 does not stop interest from accruing."
>
> — 2025 Form 100 instructions, General Information N

the rate resets each half-year; the FTB's *Interest and estimate penalty rates* page lists the corporation underpayment rate for each period back to 1976 (7% for 07/01/2026 – 12/31/2026 at the pull).

### how the three land on a loss year

| the late year | tax on the return | late-file + late-pay | interest |
|---|---|---|---|
| first taxable year, incorporated or qualified through the SOS | $0 — measured tax on a loss | ⚠️ both are a percentage of tax; with $0 tax, the statutes leave no base — an **inference** from §19131(a) and §19132, not an FTB sentence | none on $0 |
| a later year, $800 paid by the original date | $800, all timely | the timely $800 comes off the base (§19131(c)) | none |
| a later year, $800 unpaid | $800 | combined, capped at **25% of the unpaid tax** | on the $800, from the original due date, at each period's rate |

⇒ **take every figure from the FTB's notice or a tested calculator, never from arithmetic here** (`rule.forbid.hand-computed-figures`). the statutes above fix the shape; the dollar amount turns on the dates and the period rates.

⚠️ separate amounts that are **not** percentages of the tax, so a $0 or $800 base does not bound them:

- **the demand penalty**: *"Your business may be subject to a $2,000 penalty per tax year for failure to file missing tax returns within 60 days after receiving a written demand to do so."* (FTB, *My business is suspended*)
- **business while suspended**: *"Corporations that operate while suspended or forfeited may be subject to a $2,000 penalty per taxable year, which is in addition to any tax, penalties, and interest already accrued."* (2025 Form 100 instructions, Q)
- **the estimated tax penalty**, on a first installment (the $800) paid late — figured on FTB 5806 (2025 Form 100 instructions, M)

## ⛔ unpaid tax leads to suspension, and a suspended corporation loses its rights

> "Except for the purposes of filing an application for exempt status or amending the articles of incorporation or organization as necessary either to perfect that application or to set forth a new name, the powers, rights, and privileges of a domestic taxpayer may be suspended, and the exercise of the powers, rights, and privileges of a foreign taxpayer in this state may be forfeited, if any of the following conditions occur:"
>
> — R&TC §23301

| §23301 | the trigger |
|---|---|
| (a) | tax, penalty, or interest due with the return not paid *"on or before 6 p.m. on the last day of the 12th month after the close of the taxable year"* |
| (b) | an amount due on notice and demand not paid by the last day of the 11th month after its due date |
| (c) | a §19131-series penalty not paid by the last day of the 11th month after it is due |

domestic corporations are **suspended**; foreign corporations are **forfeited** — the same loss of rights (2025 Form 100 instructions, Q). per the FTB, a suspended business cannot:

> "Legally do business Sell, transfer, or exchange real property File with an automatic extension Be issued a refund Start or continue a protest Legally close or dissolve your business Bring an action or defend your business in court File or maintain an appeal before the Office of Tax Appeals Maintain the right to use your business name"
>
> — FTB, *My business is suspended*

> "If you enter into any contracts while you are not in good standing, the other party can void the contract."
>
> — same

the clock to suspension does not wait on business activity:

> "Business entities registered with Secretary of State (SOS) must file and pay at least $800 franchise or annual tax from their registration date to current, regardless of business activity."
>
> — same

⚠️ the Secretary of State suspends on its own, for a skipped Statement of Information — a different duty; a corporation can be suspended by both at once (same page). see `.see also`.

## .revivor — every return, every dollar, then FTB 3557 BC

> "Any taxpayer which has suffered the suspension or forfeiture provided for in Section 23301 or 23301.5 may be relieved therefrom upon making application therefor in writing to the Franchise Tax Board and upon the filing of all tax returns required under this part, and the payment of the tax, additions to tax, penalties, interest, and any other amounts for nonpayment of which the suspension or forfeiture occurred, together with all other taxes, additions to tax, penalties, interest, and any other amounts due under this part, and upon the issuance by the Franchise Tax Board of a certificate of revivor."
>
> — R&TC §23305

| step | what | source |
|---|---|---|
| 1 | **file all past due returns** — every year from incorporation or qualification to now | FTB, *My business is suspended* |
| 2 | **pay all past due balances** | same |
| 3 | **FTB 3557 BC**, Application for Certificate of Revivor – Corporation (REV 03-2015): *"I request relief from suspension or forfeiture for this entity. I previously submitted or I am enclosing all required payments, returns, or documents."* | FTB 3557 BC |
| 4 | mail to **Business Entity Correspondence, Franchise Tax Board, PO Box 942857, Sacramento CA 94257-4040**, or file online | FTB, *My business is suspended* |
| ⚠️ | *"Your business must be in good standing with the Secretary of State (SOS) to revive your business entity."* — clear any SOS suspension too | same |
| ⚠️ | the name: if another entity took it, the SOS will make the corporation pick a new one | same |

who may sign FTB 3557 BC: *"Any stockholder, creditor, member, general partner, or officer."* or *"Any person having an interest in relief from suspension or forfeiture."* the FTB revivor line: **888-635-0494**, weekdays 8 AM to 5 PM.

**relief from contract voidability** is separate and optional: FTB 2518BC, $100 per day of the relief period, capped at the tax for that period (FTB, *My business is suspended*).

## ⛔ an unfiled year has no limitation clock

> "every notice of a proposed deficiency assessment shall be mailed to the taxpayer within four years after the return was filed."
>
> — R&TC §19057(a)

the four years run from the **return**. with no return there is no start:

> "If any taxpayer fails to file a return, or files a false or fraudulent return with intent to evade the tax, for any taxable year, the Franchise Tax Board, at any time, may require a return or an amended return under penalties of perjury or may make an estimate of the net income, from any available information, and may propose to assess the amount of tax, interest, and penalties due."
>
> — R&TC §19087(a)

⇒ a skipped year from a decade ago is as open as last year's. the only move that starts the four-year clock is to file the return.

## .the Voluntary Disclosure Program — narrow, and only before contact

> "The Voluntary Disclosure Program gives out-of-state businesses who owe back taxes and haven't filed related returns the chance to come forward, file, and avoid penalties."
>
> — FTB, *Voluntary compliance programs*

| program | who | look-back | form |
|---|---|---|---|
| **Voluntary Disclosure** | out-of-state businesses only; **not** if it *"registered with the Secretary of State"*, *"ever filed a return in California"*, or *"received a notice to file a return in California"* | *"You only need to file as far back as six years."* | FTB 4925 |
| **Filing Compliance Agreement** | eligible out-of-state businesses that can show reasonable cause; *"If you get a notice or bill from us telling you to file, you cannot apply for an FCA."* | *"The Filing Compliance Agreement is not limited to a specific look-back period."* | FTB 5841 |

⇒ a corporation incorporated in California, or one that **qualified** with the SOS, is outside the Voluntary Disclosure Program by its own terms. both programs may be applied for anonymously. ⚠️ **ask before the first return goes in** — a return filed cold disqualifies the Voluntary Disclosure path (*"ever filed a return in California"*).

## .which edition, and which channel

| question | answer | source |
|---|---|---|
| which form? | the **Form 100 and instructions whose header names that taxable year** — FTB files each year's set under its own year folder (`/forms/2025/` for 2025) | Form 100 (2025) header |
| e-file a late year? | *"Corporations, nonprofit (tax-exempt) organizations, partnerships, and limited liability companies can use Business e-file to file original and amended tax returns for this year and the prior two tax years."* | FTB, *e-file for business* |
| older than that? | paper, to **Franchise Tax Board, PO Box 942857, Sacramento CA 94257-0500** (no payment) or **…94257-0501** (with payment) | 2025 Form 100 instructions, H |
| the e-file mandate for a software-prepared late return | the FTB may waive it for technology constraints, undue financial burden, or reasonable cause; the waiver page takes requests for the current tax year plus two prior | FTB, *e-file for business*; waiver request page |

## .ask for penalty relief — reasonable cause, by claim for refund

California does not abate on a clean history:

> "California does not conform to federal relief from penalties based upon good filing history or First-Time Abatement. However, we may abate a penalty if you can provide IRS documentation, which clearly states that the IRS abated the same penalty for “reasonable cause.”"
>
> — FTB 2924 (REV 03-2018), instructions

and the FTB's own one-time abatement does not reach a corporation: it is *"Available only to individuals subject to Personal Income Tax Law"* (FTB, *One-Time Penalty Abatement*).

the path left is **reasonable cause**, and it runs as a **refund claim** after payment:

> "Reasonable cause may be established if a taxpayer can show that failure to comply with the law occurred despite the exercise of ordinary business care and prudence."
>
> — FTB 2924 instructions

| rule | text | source |
|---|---|---|
| the form | **FTB 2924**, Reasonable Cause – Business Entity Claim for Refund — ⛔ **not FTB 2917**, which is *"Reasonable Cause – Individual and Fiduciary Claim for Refund"* | FTB 2924 instructions |
| pay first | *"We cannot act on your claim for refund until your balance due for that taxable year or income period is paid in full."* | same |
| not while suspended | *"A claim for refund cannot be filed by a corporation or limited liability company that is suspended or forfeited."* — revive first | same |
| one per year | *"You must prepare a separate FTB 2924 for each taxable year or income period."* | same |
| deadline | the latest of four years after the original due date, four years after a timely return, or one year from the overpayment | same |
| mail | General Abatement Requests, **Franchise Tax Board, PO Box 942857, Sacramento CA 94257-4040** | same |
| late payment, presumed | *"Reasonable cause is presumed when 90 percent of the tax shown on the return, but not less than minimum franchise tax if applicable, is paid by the original due date of the return."* | 2025 Form 100 instructions, M |

the statement on FTB 2924, Part 3 — short and factual, one line per slot:

| slot | what goes there |
|---|---|
| `<the duty>` | which return was late or which payment, and for which taxable year |
| `<the facts>` | the specific facts that made it late — the test is *"ordinary business care and prudence"*, never a bare claim |
| `<the evidence>` | the documents behind it; an IRS reasonable-cause abatement letter for the same penalty, if one exists |
| `<the cure>` | when the return was filed and the balance paid, and what now keeps the next one on time |

⚠️ interest is not a penalty and is not abated for reasonable cause — FTB 3539: *"However, the imposition of interest is mandatory."* (interest abatement is a separate form, FTB 3701, not pulled).

## .steps

1. file the federal 1120 for each late year first (`federal/howto.file.federal.delinquent.active-loss`)
2. list every taxable year from incorporation or qualification to now; mark each filed or not
3. if the corporation is foreign, never registered, never filed, and has no FTB notice: weigh the Voluntary Disclosure Program **before** any return goes in
4. check the corporation's status in MyFTB or with the FTB: suspended or forfeited?
5. get the Form 100 and instructions for **each** year's own edition; complete each as `howto.file.state=california.current.active-loss` describes — $800 on Line 23 for every year past the first
6. e-file the current year and the two prior; paper for older years
7. pay every balance — tax, penalties, interest — or the corporation stays suspended and FTB 2924 cannot be heard
8. if suspended: FTB 3557 BC once every return and payment is in; clear any SOS suspension too
9. once paid and revived, file FTB 2924 per year for any penalty with a reasonable-cause ground
10. calendar the next year: return by the 15th day of the 4th month, and the $800 first installment the same day

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| the penalty on a late **first-year** return that shows $0 tax | both §19131 and §19132 are percentages of tax, so the base is $0 — an inference from the statutes; no FTB sentence on this case was pulled |
| prior-year Form 100 editions | only the 2025 set was pulled; prior years sit in their own FTB year folders, not walked |
| the online revivor path | the suspended page names an online option, but its link text was empty in the pull |
| interest abatement (FTB 3701) and the demand penalty statute | named by FTB pages; neither the form nor the statute was pulled |
| how the FTB applies a payment across tax, penalty, and interest on a multi-year balance | not pulled |

## .enforcement

- a late loss year treated as $0 owed when it is past the first year = **blocker** (§23153(d)(1))
- a late return filed with no payment of the $800 and accrued amounts = **blocker** (§23305: revivor needs every amount paid)
- FTB 2917 used for a corporation = **blocker** (FTB 2924 instructions: 2917 is for individuals and fiduciaries)
- FTB 2924 filed while suspended, or before the balance is paid = **blocker** (FTB 2924 instructions)
- a first-time-abatement request for a corporation = **blocker** (FTB 2924 instructions; One-Time Penalty Abatement page)
- a skipped year left unfiled on the theory it aged out = **blocker** (§19087(a): *"at any time"*)
- a foreign corporation's first return filed before the Voluntary Disclosure question was asked = **nitpick** (it forfeits the program)
- a penalty or interest figure computed by hand = **nitpick** (`rule.forbid.hand-computed-figures`)

## .provenance

pulled with **bhrowser**, headful, from urls harvested off ftb.ca.gov's own navigation and sitemap; statutes reached through leginfo's own Code Search form. bytes in `refs/`, manifest `refs/promote.jobs.json`:

| ref | what | chars |
|---|---|---:|
| `pulledAt=2026-10-04.ca-form-100-booklet.ty2025.txt` | 2025 Instructions for Form 100 — M penalties, N interest, Q suspension | 123,326 |
| `pulledAt=2026-10-04.ca-form-ftb3539.ty2025.txt` | FTB 3539, taxable year 2025 — the extension lost to suspension | 20,492 |
| `pulledAt=2026-10-04.ca-form-ftb3557bc.r0315.txt` | FTB 3557 BC, REV 03-2015 | 1,317 — short and complete, inspected |
| `pulledAt=2026-10-04.ca-form-ftb2924.r0318.txt` | FTB 2924, REV 03-2018 | 9,284 |
| `pulledAt=2026-10-04.ca-page-my-business-is-suspended.txt` | FTB *My business is suspended* | 6,831 |
| `pulledAt=2026-10-04.ca-page-voluntary-compliance.txt` | FTB *Voluntary compliance programs* | 4,851 |
| `pulledAt=2026-10-04.ca-page-efile-for-business.txt` | FTB *e-file for business* — the two-prior-years window | 4,252 |
| `pulledAt=2026-10-04.ca-page-help-with-penalties.txt` | FTB *Help with penalties and fees* | 3,364 |
| `pulledAt=2026-10-04.ca-page-one-time-penalty-abatement.txt` | FTB *One-Time Penalty Abatement* | 4,584 |
| `pulledAt=2026-10-04.ca-page-interest-rates.txt` | FTB *Interest and estimate penalty rates* | 3,336 |
| `pulledAt=2026-10-04.ca-rtc-19131.txt` | R&TC §19131 | 4,212 |
| `pulledAt=2026-10-04.ca-rtc-19132.txt` | R&TC §19132 | 4,214 |
| `pulledAt=2026-10-04.ca-rtc-19057.txt` | R&TC §19057 | 3,229 |
| `pulledAt=2026-10-04.ca-rtc-19087.txt` | R&TC §19087 | 2,023 |
| `pulledAt=2026-10-04.ca-rtc-23301.txt` | R&TC §23301 | 2,529 |
| `pulledAt=2026-10-04.ca-rtc-23305.txt` | R&TC §23305 | 2,066 |

## .see also

- `howto.file.state=california.current.active-loss` — the lines, the first-year exemption, the extension
- `federal/howto.file.federal.delinquent.active-loss` — the federal return each California year starts from
- `income-tax/state=florida/howto.file.state=florida.delinquent.active-loss` — the same shape in a state with no minimum tax
- the **Statement of Information** with the California Secretary of State is a **different duty**, with its own $250 penalty and its own suspension — `registrator`
