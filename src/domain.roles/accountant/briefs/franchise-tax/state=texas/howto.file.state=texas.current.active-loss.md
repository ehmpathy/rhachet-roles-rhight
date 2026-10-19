# howto.file.state=texas.current.active-loss

## .what

file the **current** Texas franchise tax report(s), on time, for a corporation with a net loss or little revenue — and extend them if May 15 will be missed.

for most such corporations that means **one form**: the **Public Information Report, Form 05-102** (PIR). no tax, no payment, no federal return attached.

> ⚠️ a loss is not the test. Texas measures **annualized total revenue**, not net income. a corporation with large revenue and a net loss can sit above the threshold and owe a full report.

## ⛔ FIRST: does Texas reach this corporation at all?

the PIR duty runs only to an entity organized in Texas **or with nexus in Texas**:

> "Entities that are not organized in Texas and/or do not have nexus in Texas."
>
> — Comptroller, PIR/OIR page, under "Entities Not Required to File a PIR or an OIR"

so the order is fixed:

```
1. nexus?            -> nexus/state=texas/shield.no-duty-below-the-bright-line
2. if yes: threshold -> the report year's table below
3. either way:       -> the PIR (or OIR) is owed, May 15
```

### ⛔ do NOT file a PIR "to be safe"

a filed report is itself evidence of nexus for that year:

> "In Comptroller Decision No. 114,533 (2021), the taxpayer filed a Texas Franchise Tax Public Information Report and franchise tax return for report year 2010. The Comptroller found that fact alone was sufficient to satisfy Staff’s prima facie burden to show the taxpayer had nexus with regard to that franchise tax report year."
>
> — STAR 202302010H, Comptroller contested-case decision

| the corporation | the move |
|---|---|
| organized in Texas, or registered with the Texas Secretary of State | the duty is plain — file |
| out-of-state, with physical presence or ≥ $500,000 Texas receipts | nexus — file |
| out-of-state, neither | ⛔ no Texas form is owed. a PIR filed anyway concedes the year |

⚠️ an account can exist without the entity's act: *"The Comptroller sets up a franchise tax account for your business based on information provided from the Texas Secretary of State and other sources."* (questionnaire page). an account is not nexus; it is an expectation of reports.

## .the no tax due threshold — by report year, from the Comptroller's table

| report year | no tax due threshold | source |
|---|---:|---|
| 2026 and 2027 | $2,650,000 | hub table; 05-915 R. 4-26 |
| 2024 and 2025 | $2,470,000 | hub table |
| 2022 and 2023 | $1,230,000 | hub table; 05-911 R. 10-22 |
| 2020 and 2021 | $1,180,000 | hub table |
| 2018 and 2019 | $1,130,000 | hub table |

> "The no tax due threshold has been adjusted, as required by Tax Code Section 171.006(b) and is now $2,650,000 for reports originally due on or after Jan. 1, 2026, and before Jan. 1, 2028."
>
> — Form 05-915 (Rev. 4-26/2), 2026 report instructions

⚠️ the Reports and Payments FAQ still runs a 2026 example against *"the $2,470,000 no tax due threshold"*. the hub, the 2026 forms page, and the 2026 instructions all say $2,650,000 — the FAQ example is stale.

a period longer or shorter than 12 months is annualized first; take the figure from the Comptroller's own method or its online calculator, never by hand (`rule.forbid.hand-computed-figures`).

## .which report — by report year

| report year | annualized total revenue | file |
|---|---|---|
| **2024 and later** | at or below the threshold | **PIR (05-102)** only — corporations, LLCs, LPs, PAs, financial institutions. all others: OIR (05-167) |
| 2024 and later | above the threshold, tax under $1,000 | EZ (05-169) or Long Form (05-158), **plus** the PIR — no tax paid |
| 2024 and later | above the threshold | EZ or Long Form, the PIR, and the tax |
| **2023 and earlier** | at or below the threshold | No Tax Due Report (05-163) **plus** the PIR |

> "For the 2024 report year and later, a taxable entity whose annualized total revenue is less than or equal to the No Tax Due Threshold is not required to file a No Tax Due Report. However, the entity is required to file Form 05-102, Public Information Report (PDF) or Form 05-167, Ownership Information Report (PDF)."
>
> — Comptroller, the 2024-and-later no tax due page

> "If the tax due is less than $1,000, but annualized total revenue is greater than the no tax due threshold, a franchise tax report supporting that no tax is due (Form 05-158, Texas Franchise Tax Report, or Form 05-169, Texas Franchise Tax EZ Computation Report) must be filed."
>
> — Comptroller, Reports and Payments FAQ

the statute behind the PIR, untouched by the 2024 carve-out:

> "A corporation, limited liability company, limited partnership, or professional association on which the franchise tax is imposed, regardless of whether the entity is required to pay any tax, shall file a report with the comptroller"
>
> — Tex. Tax Code §171.203(a)

⚠️ **zero Texas gross receipts** changes the form only above the threshold. the 2026 forms page lists, among those who must file the EZ or Long Form, *"Entities above the no tax due threshold with zero Texas gross receipts – such entities must file a PIR or OIR."* below the threshold, the PIR alone stands.

## .facts

| field | value | source |
|---|---|---|
| form | **05-102**, Rev.2-24/35, report year 2026, due 5/15/2026 | `refs/…tx-form-05-102-pir-2026.r0224.txt` |
| due | May 15; a weekend or holiday rolls to the next business day | franchise hub |
| PIR due date | *"The PIR is due on the annual franchise tax report due date."* | PIR/OIR page |
| first report | May 15 of the year after the year the entity became subject to the tax | Reports and Payments FAQ |
| the period | the federal tax year that ended in the calendar year before the report year | 05-915, the year-end date rule |
| signer | *"The report must be completed and signed by an officer, director or other authorized person."* | PIR/OIR page |
| federal return attached | no — the FAQ answers *"Do I need to send a copy of my federal return?"* with "No." | Reports and Payments FAQ |
| estimated payments | none — *"Texas law does not require the filing of estimated tax reports or payments."* | 05-915 |
| mail to | Texas Comptroller of Public Accounts, P.O. Box 149348, Austin, TX 78714-9348 | PIR/OIR page; 2026 forms page |

## .how to file — Webfile, software, or paper

> "online electronically through Webfile; by mailing Franchise Tax Forms; in person at a local Comptroller Field Office; or using tax preparation software."
>
> — Comptroller, the account-current page (2024 report year and later)

| channel | how |
|---|---|
| **Webfile** | needs the 11-digit Texas taxpayer number and the XT Webfile number, printed on the Comptroller's notices. lost it: the 2026 instructions say *"Call 800-442-3453 and enter the entity’s taxpayer number when prompted."* |
| **software** | the Comptroller's approved list for 2026 covers *"electronic submissions for franchise tax report years 2011 through 2026"*; it names Drake Tax, Intuit (Lacerte, ProConnect, ProSeries Business, TurboTax), TaxAct, TaxSlayer, and others |
| **paper** | the 05-102 for the report year, signed, to P.O. Box 149348 |

> "Entities that need only file a Public Information Report or Ownership Information Report can easily file the report electronically through Webfile."
>
> — Form 05-915, 2026 instructions

⚠️ the Webfile number is printed as *"eight-digit Webfile number (begins with XT)"* on the account-current page and as a *"6-digit XT Webfile number"* in the 2026 instructions — the XT prefix plus six digits. the same fact, two counts.

## .the loss year, field by field (PIR, Form 05-102)

| field | what to enter |
|---|---|
| taxpayer number, report year, due date | preprinted on a Comptroller copy; else from the account |
| principal place of business, mail address | current. blacken the circle if the mail address changed |
| Section A | each officer, director, member, general partner and manager, as of the date filed. a non-Texas entity lists those its home state's law requires (05-915) |
| Sections B and C | the ownership sections. the 05-915 says only *"Complete both sections as applicable for the entity for which this report is filed."* — the form's own labels are clipped in the text extract; read them off the pdf |
| registered agent | changes go to the Secretary of State, never on the PIR |
| signature | an officer, director or other authorized person |

there is no revenue line on the PIR. the threshold call is made **before** the form, and kept on file: total revenue, the period, and the annualized figure from the Comptroller's method.

## .extension — when May 15 will be missed

Texas does not honor a federal extension:

> "Yes. Unless you are filing your business’s franchise tax report and paying any franchise tax due by the reporting due date, you need to file a franchise tax extension request with the Comptroller’s office."
>
> — franchise tax FAQ, on whether a federal extension suffices

### a below-threshold entity extends with a zero-money request

> "A taxable entity that is at or below the no tax due threshold and cannot file its Public Information Report or Ownership Information Report by the original due date, may request an extension to file its report by filing a zero money extension request."
>
> — Form 05-915, 2026 instructions

> "If a taxable entity is under the no tax due threshold and cannot file their PIR/OIR by the May 15 due date, can the entity file a no payment extension request to extend the due date of the PIR/OIR to Nov. 15?"
>
> — Extensions FAQ; its answer: "Yes."

| field | value | source |
|---|---|---|
| form | **05-164**, Texas Franchise Tax Extension Request, Rev.5-22/10 — or Webfile | extensions page; `refs/…05-164…r0522.txt` |
| deadline | *"Timely means the request is received or postmarked on or before the due date of the original report."* | extensions page |
| payment to be valid | 90% of this year's tax, or 100% of the tax on the prior report | extensions page |
| below-threshold | a zero-money request; the prior-year 100% option is $0 | 05-915; Extensions FAQ |
| first annual report | ⛔ *"A taxable entity that became subject to the franchise tax during 2025 may not use the 100% extension option."* — so its extension needs 90% of this year's tax (which is $0 below the threshold) | 05-915 |
| extended date (non-EFT) | *"If granted, the extension for a non-EFT payor is through Nov. 16, 2026."* — the page states the rule as *"Nov. 15 is the extended due date."*; Nov. 15, 2026 is a Sunday | 05-915; extensions page |
| EFT payers | first extension to Aug. 15 (Aug. 17, 2026), second to Nov. 15 — not the case for a loss corporation that paid no tax | extensions page; 05-915 |
| do not double up | *"If an online extension payment is made, the taxable entity should NOT submit a paper Extension Request (Form 05-164)."* | extensions page |

⚠️ use the Comptroller's printed date for the year; never derive a weekend roll by hand.

## .steps

1. settle nexus for the report year (`nexus/state=texas/shield.no-duty-below-the-bright-line`). none → stop; file no Texas form
2. find the period: the federal tax year that ended in the calendar year before the report year
3. take total revenue for that period; annualize by the Comptroller's method if not 12 months
4. compare against **that report year's** threshold, from the table above
5. at or below → the PIR (05-102) alone. above → EZ or Long Form, plus the PIR
6. complete Section A as of the date filed; check the registered agent with the Secretary of State
7. an officer signs
8. file by Webfile, approved software, or mail to P.O. Box 149348 — by May 15
9. if May 15 will be missed: a zero-money extension (Webfile or 05-164) **before** May 15, then file by the extended date
10. keep the threshold work and the Webfile confirmation; next year's 100% extension option rests on this year's report

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| whether a PIR-only filer **must** register with the Comptroller first | the questionnaire page makes it mandatory for Secretary of State registrants and letter recipients; an unregistered out-of-state filer's first step was not pulled |
| the zero-Texas-gross-receipts rule below the threshold | the 2024-and-later page reads "must" file EZ or Long Form with no threshold qualifier; the 2026 forms page and the FAQ ("may confirm") narrow it. the 2026 forms page is the most recent read |
| the exact annualization of a short first year | the method is stated (05-915, *Annualized Total Revenue*); this brief computes no figure |
| total revenue for a corporation, line by line | defined in Tax Code §171.1011, not pulled here; the FAQ *Total Revenue* page covers it |

## .enforcement

- "a loss, so no Texas report" = **blocker** (the test is total revenue, and the PIR is owed below the threshold)
- a PIR filed by an out-of-state entity with no nexus, "to be safe" = **blocker** (STAR 202302010H)
- a No Tax Due Report filed for report year 2024 or later = **blocker** (05-163 is discontinued)
- a threshold quoted without its report year = **blocker**
- a federal extension relied on to extend a Texas report = **blocker** (franchise tax FAQ)
- an extension request sent after May 15 = **blocker** (not timely; the report is late)
- the threshold or a weekend roll computed by hand = **nitpick** (`rule.forbid.hand-computed-figures`)

## .provenance

pulled with **bhrowser**, headful, from urls harvested off the Comptroller's franchise tax hub and its FAQ; the bytes sit in `refs/` beside this brief (manifest `refs/promote.jobs.json`):

| ref | what | chars |
|---|---|---:|
| `pulledAt=2026-10-04.tx-franchise-hub.txt` | hub: due date, threshold table, penalties | 6,503 |
| `pulledAt=2026-10-04.tx-form-05-915-instructions-2026.r0426.txt` | 05-915 Rev. 4-26/2, general sections, flow order | 73,663 |
| `pulledAt=2026-10-04.tx-form-05-102-pir-2026.r0224.txt` | 05-102 Rev.2-24/35 | 7,608 |
| `pulledAt=2026-10-04.tx-form-05-164-extension-2026.r0522.txt` | 05-164 Rev.5-22/10 | 3,399 |
| `pulledAt=2026-10-04.tx-forms-2026-index.txt` | 2026 report forms page | 1,985 — short and complete, inspected |
| `pulledAt=2026-10-04.tx-ntd-reports-2024.txt` | no tax due page, 2024 and later | 3,838 |
| `pulledAt=2026-10-04.tx-faq-reports-payments.txt` | Reports and Payments FAQ | 12,196 |
| `pulledAt=2026-10-04.tx-franchise-faq.txt` | franchise tax FAQ | 14,674 |
| `pulledAt=2026-10-04.tx-pir-oir-requirements.txt` | PIR/OIR requirements | 4,716 |
| `pulledAt=2026-10-04.tx-account-current-2024.txt` | four ways to file; the XT number | 4,151 |
| `pulledAt=2026-10-04.tx-extensions-of-time.txt` | extensions of time | 4,831 |
| `pulledAt=2026-10-04.tx-faq-extensions.txt` | Extensions FAQ | 2,213 |
| `pulledAt=2026-10-04.tx-approved-software-2026.txt` | approved software, 2026 | 3,838 |
| `pulledAt=2026-10-04.tx-accountability-questionnaire.txt` | how an account is set up | 1,155 — short and complete, inspected |
| `pulledAt=2026-10-04.tx-star-202302010H-filed-pir-is-nexus-evidence.txt` | the prima facie nexus paragraph | 941 — one paragraph, sliced on purpose |
| `effectiveAt=2024-01-01.tx-tax-171-reports.txt` | §171.201–.204 | 12,013 |

⚠️ the Comptroller publishes a new forms page and instructions booklet each report year. for a later year, use the 05-102 and the booklet whose header names that report year.

## .see also

- `howto.file.state=texas.delinquent.active-loss` — a report past May 15
- `hazard.zero-tax-still-owes-a-report` — why the PIR is owed at $0
- `nexus/state=texas/shield.no-duty-below-the-bright-line` — the gate above
- `limitations/state=texas/lever.mtc-disclosure-caps-an-uncapped-window` — for a year never filed
