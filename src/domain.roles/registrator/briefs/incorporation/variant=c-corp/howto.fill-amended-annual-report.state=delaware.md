# howto.fill-amended-annual-report.state=delaware

## .what

field-by-field, what to type into Delaware's Amended Annual Franchise Tax Report
in the DCIS eCorp portal.

`define.amended-annual-report.state=delaware` says **what the instrument is** and
**why the agency must accept it**. this says **what goes in each box**, and names
the four traps that cost a filer a year.

⚠️ Delaware publishes **no instruction sheet** for this form. the define brief
establishes that the filing exists on the record only in a fee line. so the field
semantics below were read off the statute and confirmed against a live portal
session — there is no first-party page to check them against.

## .have these ready, per year

| input | source |
|---|---|
| EIN | the IRS CP575 notice |
| **issued** share count, as of that year | the stock ledger |
| **gross assets**, as of that year | Form 1120 Schedule L, total assets |
| the fiscal year end date | the 1120 |
| principal place of business | ⛔ see § 502(a)(4) below |
| the signing officer's name and title | — |
| **every** director's name and address | ⛔ as of **today**, not as of that year |

⚠️ **both** the share count and the gross assets are required. § 503(b) is
conjunctive, and its failure mode is silent — the define brief carries the quote
and the consequence.

## .the fields

| field | what to enter |
|---|---|
| Federal Employer Id | **nine digits, no dash** ⛔ |
| Total Issued Shares | the count **issued**, not authorized |
| Gross Assets | Schedule L total assets for that year |
| Asset Date | that year's fiscal year end |
| Fiscal Year End | the same date |
| Inactivity dates | leave blank unless the corporation was genuinely inactive |
| Principal Place of Business | ⛔ see below |
| Nature of Business | a required field since 2023 — pick the closest category |
| Officer | the person who signs, and their title |
| Directors | a row per director, **all of them** ⛔ |
| certification checkbox | tick it — it carries a perjury consequence ⛔ |
| date | today's date |

## ⛔ the EIN field takes DIGITS ONLY

type `NNNNNNNNN`, never `NN-NNNNNNN`.

observed in the portal: the field is nine characters wide, so a dash consumes one
and the last digit is dropped silently. it does not reject; it truncates.

the agency publishes a related caution:

> "Only use the English version of characters when entering data, otherwise it
> may cause an inaccurate record on your Annual Report."
>
> — [corp.delaware.gov/paytaxes/](https://corp.delaware.gov/paytaxes/)
> · source of record: `refs/pulledAt=2026-08-23.de-paytaxes.txt`

the portal's inputs are **literal**; it does not strip or repair punctuation.
⚠️ **count the digits on screen** — a wrong EIN routes a filing to manual review.

## ⛔ RECALCULATE before you submit — it is the only detector for a silent failure

the form reprices **in place**, before submission. use it.

```
before  Franchise Tax   <the (a)(1) Authorized Shares figure>
click   [Recalculate]
after   Franchise Tax   <the (a)(2) Assumed Par Value figure>
```

§ 503(b)'s consequence clause does not reject an incomplete statement — it
**re-prices the year under paragraph (a)(1)**, the method the amendment exists to
leave. a report with one figure absent or mis-keyed submits cleanly and achieves
no relief.

**if the tax figure does not move, the election did not take.** stop and find
which of the two § 503(b) inputs is absent. do not submit and hope.

⚠️ the interest line moves with it. interest accrues on the tax, so an election
that cuts the tax cuts the interest by the same proportion — a recalculation is
worth materially more than the tax delta alone.

## ⛔ § 502(a)(4) — the PPOB bar is on an ADDRESS, not on a company

> "(4) The location of the principal place of business of the corporation, which
> shall include the street, number, city, state or foreign country (provided
> that, unless a corporation maintains its principal place of business in this
> State and serves as its own registered agent, for purposes of this subsection,
> the principal place of business address shall not be the address of the
> registered office of the corporation in this State **and shall not be the
> address of any other registered agent**);"
>
> — [8 Del. C. § 502(a)(4)](https://delcode.delaware.gov/title8/c005/index.html)
> · source of record: `refs/de-title8-ch5-franchise-tax.txt`

two prongs, and **the second is broader than the portal warns about**. the form's
own caution names the Delaware registered office; the statute also bars the
address of *any other* registered agent, in any state.

### ⚠️ but read what it bars

it bars **an address**. it says not a word about who owns the business that
operates the address.

| the question | the answer |
|---|---|
| is my mail provider owned by a company that also sells registered-agent service? | ⛔ **not what the statute asks** |
| is this street address a registered agent's address **of record**? | ✅ that is the test |

a virtual-mailbox provider is not a registered agent, and a **PMB** assigned to
you is your address within that suite. corporate parentage does not convert one
product into the other.

⇒ **a prohibition on an address is not a prohibition on a vendor.** the broader
read would rule out most virtual-office providers, since the large ones nearly
all sell registered-agent service under some brand.

### ⚠️ the address you enter becomes PUBLIC

> "(e) The Secretary of State shall safely keep all reports returned in such
> manner as they may be open to the inspection of all persons pursuant to the
> provisions set forth in Chapter 100 of Title 29. **Any tax information provided
> pursuant to paragraph (a)(7)** of this section, contained on annual franchise
> tax reports filed after tax year 2006 **shall not be deemed public**."
>
> — 8 Del. C. § 502(e) · source of record: `refs/de-title8-ch5-franchise-tax.txt`

read the carve-out narrowly. **only (a)(7)** — the tax schedules — is shielded.
every other field on the report is open to inspection, which includes:

- **(a)(4)** the principal place of business
- **(a)(5)** every director's name and address, and the signing officer's

so the PPOB is a **published** statement of where the corporation does business.
in a state where the corporation has not registered as a foreign entity, that is
a fact a revenue agency can read. choose the address that is true, and know that
it is a disclosure.

## ⛔ § 502(a)(5) — directors and officers are governed DIFFERENTLY

the two words are used loosely in ordinary speech and precisely in the statute:

> "(5) **The names and addresses of all the directors as of the filing date of the
> report** and **the name and address of the officer who signs the report**;
> provided, that other than an initial report, **all reports shall list a director
> or directors** excepting any report filed in conjunction with a certificate of
> dissolution filed by an incorporator pursuant to §  274 of this title or a
> certificate of dissolution filed pursuant to §  275(c) of this title;"
>
> — 8 Del. C. § 502(a)(5) · source of record: `refs/de-title8-ch5-franchise-tax.txt`

| | who goes on the form | how many |
|---|---|---|
| **directors** | the board — who governs | ⛔ **all** of them |
| **officers** | the executives — who act | ⛔ only the **one who signs** |

three consequences a filer gets wrong:

1. **⛔ directors are "as of the filing date of the report" — not as of the year
   being amended.** an amended report for a closed year carries **today's**
   board, because it is filed today. do not reconstruct the historical board.

2. **at least one director is mandatory.** *"all reports shall list a director or
   directors"* — the only exceptions are two dissolution scenarios. a report with
   an empty director table is incomplete, and § 502(f) below makes an incomplete
   report as disqualifying as an unpaid balance.

3. **only one officer row.** the form asks for the signer, not the officer roster.
   a solo founder is typically the sole director **and** the signing officer, and
   appears in both places — which is correct, not a duplicate.

## ⛔ the certification is a perjury statement

> "(b) If any officer or director of a corporation required to make an annual
> franchise tax report to the Secretary of State shall knowingly make any false
> statement in the report, such officer or director shall be **guilty of
> perjury**."
>
> — 8 Del. C. § 502(b) · source of record: `refs/de-title8-ch5-franchise-tax.txt`

⚠️ the exposure is **personal** and attaches to the signer, not to the
corporation. it also reaches a **director** who makes a false statement, not only
the officer who signs.

the mental element is *"knowingly"*. a figure you derived and can show work for
is not a knowing false statement if later revised; a figure guessed to fill a
mandatory field is a different posture — so compute gross assets from Schedule
L, never estimate them.

## .the arithmetic the form shows back

| line | what drives it |
|---|---|
| Franchise Tax | the elected method — this is the line the recalculation moves |
| 1.5% Monthly Interest | accrues on the tax and the penalty |
| Penalty | **$200**, per § 502(c), for a report not filed by March 1 |
| Annual Filing Fee | **$50** non-exempt · **$25** exempt |
| Previous Credit/Balance | prior overpayments carry forward |
| **Amount Due** | can come out as a **credit** |

> "In the event of neglect, refusal or failure on the part of any corporation to
> file a complete annual franchise tax report with the Secretary of State on or
> before March 1, the corporation **shall pay the sum of $200** to be recovered by
> adding that amount to the franchise tax as herein determined and fixed, and such
> additional sum **shall become a part of the franchise tax** as so determined and
> fixed, and shall be collected in the same manner and subject to the same
> penalties."
>
> — 8 Del. C. § 502(c) · source of record: `refs/de-title8-ch5-franchise-tax.txt`

⚠️ read the second half. the $200 **becomes part of the franchise tax**, so the
1.5% monthly interest runs on it too. the penalty is not a flat $200 on an old
year.

## ⚠️ a credit balance is not a filed report

where the recalculation and a carried credit leave no balance owed, the amount
due displays as a credit. **the report still has to be submitted.** § 502(f)
treats the two conditions separately:

> "(f) The Secretary of State shall not issue certificates of good standing that
> pertain to any corporation that **has an unpaid franchise tax balance** due to
> the State **or does not have on file a completed annual franchise tax report**
> for the relevant time period."
>
> — 8 Del. C. § 502(f) · source of record: `refs/de-title8-ch5-franchise-tax.txt`

an unpaid balance and an absent report are **two independent bars**. to clear the
money and skip the submission clears one of them.

## .the order

```
per year, oldest first:
  1. fill every field
  2. RECALCULATE  <- confirm the tax figure moved
  3. verify the EIN digit count on screen
  4. submit, and pay any balance
then, once EVERY amended year is on file and settled:
  5. the certificate of revival    <- one-way door, last
```

⛔ step 5 is last, always. a revival filed against an unamended year revives the
corporation onto the assessment you meant to displace.

## .enforcement

- an EIN entered with a dash = **blocker** (it truncates silently)
- a submission without a recalculation = **blocker** (§ 503(b) fails silently;
  the recalculation is the only detector)
- directors listed as of the **amended year** instead of the filing date =
  **blocker** (§ 502(a)(5))
- an empty director table on a non-dissolution report = **blocker**
- a gross-assets figure estimated rather than read off Schedule L = **blocker**
  (§ 502(b) — and see `rule.forbid.hand-computed-figures`)
- a vendor disqualified under § 502(a)(4) on the basis of **who owns it** rather
  than **whether the address is a registered agent's address of record** =
  **nitpick** (the read is over-broad, and it rules out most virtual offices)
- a credit balance treated as a completed filing = **blocker** (§ 502(f))
- a revival certificate filed before every year is amended = **blocker**

## .provenance

every statutory quote on this page is byte-faithful against
`refs/de-title8-ch5-franchise-tax.txt`, which was pulled with **bhrowser** per
`rule.require.bhrowser-citations`.

```
rhx quote.verify \
  --from src/domain.roles/registrator/briefs/incorporation/variant=c-corp/refs \
  --in   src/domain.roles/registrator/briefs/incorporation/variant=c-corp/howto.fill-amended-annual-report.state=delaware.md
```

⚠️ **the field-level observations are NOT statutory and have no publisher
behind them.** the EIN truncation, the on-screen recalculation, and the form's
line ordering were observed in a live portal session. they are
marked as observations, dated, and may change without notice — Delaware publishes
no instruction sheet against which to re-verify them.

## .see also

- `define.amended-annual-report.state=delaware` — what the instrument is, the
  § 502(c) election that authorizes it, and the § 503(b) trap in full
- `define.authorized-vs-issued-vs-outstanding-shares` — the distinction the
  share field turns on
- `howto.reinstate-void-delaware-corp` — where these filings sit in the revival
  sequence
- `delaware.franchise.tax.[howto].renew` — the § 504(a) installment schedule, which
  applies once the estimated liability reaches $5,000
- `accountant` — `rule.forbid.hand-computed-figures` — reconcile the portal's
  arithmetic against a computed figure, never a hand one
