# howto.find-form-1120

## .what

how to locate a prior-year Form 1120 — or confirm whether one was ever filed with the IRS.

> companion to `howto.file-form-1120` (use that when no return exists yet) and `define.form-1120-for-delaware-franchise-tax` (why you need it).

---

## .when you need this

- Delaware asks for a year's 1120 to substantiate gross assets (Assumed Par Value)
- you owe back franchise tax and must prove the gross assets per year
- you are unsure whether a given year was ever filed

---

## .step 1: confirm whether a return exists

three ways to check, fastest first.

### a. IRS business tax account (online, free, instant) — ⚠️ but check the gate FIRST

> "Business Tax Account is available for entities that file **Form 1120**, U.S. Corporation Income Tax Return."
>
> — [IRS: Business Tax Account](https://www.irs.gov/businesses/business-tax-account), C corporation section

log in at irs.gov → business tax account → Tax records → view transcripts per year. a year with a return transcript was filed; a blank year likely was not.

#### ⛔ you must REGISTER as a Designated Official, and the second requirement disqualifies many founders

three prongs, **all** required:

> "A Designated Official can register for full access to the C corporation's account.
>
> You must be **all of these**:
>
> - An officer (president, vice president, CEO, CFO, COO, secretary, treasurer) or managing member of the entity
> - **A current employee who received a W-2 for the most recent tax filing year**
> - Authorized to legally bind the business or entity"
>
> — same page, C corporation section

🚩 **the middle prong bites.** a solo founder of a pre-revenue or unprofitable corporation who takes **no salary** has **no W-2** — the default posture of the corporation this brief serves.

#### ✅ but the W-2 is NOT a hard wall — the registration flow has an attestation

the **published requirements** and the **actual registration flow** diverge. the flow offers an attestation in place of the W-2:

> attestations signed (under penalty of perjury):
> - authorized to legally bind the entity
> - info true/correct/complete
> - **no W-2 on file but a current employee/volunteer of the entity**

observed end to end, 2026:

| step | observed |
|---|---|
| register, request PIN | day 0 — IRS confirmation screen reached |
| PIN arrives by mail, to the **entity address on file** | day 17 (the IRS quotes 5–10 business days) |
| enter PIN | same day → **Designated Official access granted** |

⚠️ **three PIN facts decide whether this path is usable:**

- mailed to the **entity's address of record** — not to you. a stale address or an unreachable mail drop closes the path until the address is fixed
- **one-time use**
- valid **44 days** from issue

- the W-2 prong is a documentary default, not a bar; the real cost is a **round trip through the postal address on file**
- a published eligibility list is not the registration form — the attestation appears only inside the authenticated flow. where a gate looks fatal, check whether anyone has walked it
- ⚠️ **address of record unreachable, or need it sooner?** use **1b (phone)** or **1c (4506-T)** — open to any authorized officer, no employment test, no PIN
- ⚠️ **"most recent tax filing year" is not defined on the page** — whether an earlier-year or affiliate W-2 satisfies the prong was not established. moot on the attestation route

### b. IRS business line (phone)

call the IRS business line. have ready:

- EIN
- business legal name (exact)
- your authorization to act for the corp

the rep verifies identity, then confirms whether a return is on record and can mail a transcript to the address on file.

### c. Form 4506-T (mail, free)

request a transcript by mail — enter form number **1120** on line 6. ~10 business days.

---

## .step 2: interpret the result

| what you see | what it tells you | next step |
|--------------|-------------------|-----------|
| return transcript exists | the 1120 was filed | retrieve a copy (step 3) |
| no return transcript for that year | possibly never filed, possibly not yet processed | pull an **account transcript** and an **entity transcript** before you conclude — see below |
| unsure / partial | account access incomplete | call the business line to confirm |

### ⛔ there is NO "Verification of Non-Filed return" for an 1120

that instrument, its "June 15" window, and its "no availability restrictions on prior year requests" qualifier are all the **individual** regime. Form 4506-T defines it in its own header:

> "**Verification of Non-filing Letter** (provides proof that the IRS has no record of a filed **Form 1040-series tax return** for the year you request)."
>
> — [Form 4506-T](https://www.irs.gov/pub/irs-pdf/f4506t.pdf)

and the IRS list of what a **business** can get omits it — there are exactly four:

> "We offer these transcripts to businesses at no cost:
> **Tax return transcript** … **Tax account transcript** … **Record of account transcript** … **Entity transcript**"
>
> — [IRS: Get a business tax transcript](https://www.irs.gov/businesses/get-a-business-tax-transcript)

### ✅ what to use instead — and it answers the question BETTER

| pull | what it tells you |
|------|-------------------|
| **account transcript** | *"return filing date and return processed date"*, plus payments, penalties and adjustments. a year with no filing date is a year with no return |
| **entity transcript** (complete) | *"business **filing requirements**"* — what the IRS expects from this EIN at all — plus *"name control (first four letters of the business name) for electronic filing"* and the IRS establishment date |

> "**A blank field indicates no information on file.**"
>
> — IRS, on the complete business entity transcript

⭐ **the entity transcript is the better instrument**: "was an 1120 ever filed?" is downstream of "was an 1120 ever *required*?", which the filing-requirements field answers directly. it also hands you the **name control**, needed to e-file any year you then catch up.

⚠️ **an absent return transcript is not proof of non-filing:**

> "If you recently filed a return but your transcript says "No record of return filed," it may mean we haven't processed the return yet."

allow 2-3 weeks after an e-filed return, 6-8 weeks after a mailed one, before you read a blank as an answer.

---

## .step 3: retrieve the copy you need

| need | how | cost | speed |
|------|-----|------|-------|
| immediate digital copy | IRS business tax account (online) | free | instant — ⚠️ subject to the W-2 gate above |
| exact photocopy of the filed return | **Form 4506** | **$30 per return** | slowest |
| free transcript of the figures | **Form 4506-T** (line 6 = 1120) | free | ~10 business days |

> "Fee. There is a **$30 fee for each return requested**. Full payment must be included with your request or it will [be rejected]."
>
> — [Form 4506](https://www.irs.gov/pub/irs-pdf/f4506.pdf), rev. April 2025

⚠️ **per return** — a four-year catch-up is $120 before you have read a figure. refundable on a miss: *"If we cannot find the tax return, we will refund the fee."*

for Delaware's Assumed Par Value substantiation, the **transcript** (4506-T) is usually enough — it carries the Schedule L "total assets" figure. use 4506 only if Delaware demands the exact return image.

> a **transcript is not a photocopy**. transcripts show line items; Form 4506 returns the actual filed document.

### ⚠️ a transcript cannot show a figure the return never carried

a small corporation may file without Schedule L:

> "Corporations with total receipts (page 1, line 1a plus lines 4 through 10)
> and total assets at the end of the tax year **less than $250,000 are not
> required to complete Schedules L, M-1, and M-2** if the "Yes" box on Schedule
> K, question 13, is checked."
>
> — [Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf)

a transcript of such a year shows Schedule L **blank** — a faithful copy of a valid return, not a retrieval error a second request will fix.

| what you find | what it means |
|---|---|
| Schedule L populated | ✅ forward it to Delaware |
| Schedule L blank, **Q13 = Yes** | ⚠️ the return is fine; the page Delaware reads is empty |
| Schedule L blank, **Q13 = No** | 🚩 an actual defect in the filed return |

- **the fallback is page 1, Item D** — total assets, carried regardless of Schedule L. check it before you conclude the year is unusable
- if both are empty, the cure is an **amended return** (Form 1120-X) that completes Schedule L, not another transcript request
- ⚠️ **check this BEFORE you pay** — a $120 four-year 4506 order cannot surface a figure four blank Schedule Ls never carried. pull the free 4506-T first

see `define.form-1120-for-delaware-franchise-tax` for the full trap, and `howto.file-delinquent-1120-via-turbotax` for how to avoid it on years not yet filed.

---

## .what to have ready

- corporation **EIN**
- exact **corporation name** as filed
- the **tax year(s)** needed — one per franchise tax year owed

---

## .gotchas

- allow ~2–3 weeks after an e-filed return (6–8 weeks after a mailed one) before a transcript appears.
- "no record" is not the same as "lost" — nor the same as "never filed". see the processing-lag caution in step 2.

### ⛔ the year limit depends on WHICH transcript — and the one you want has none stated

| line 6 box | availability, verbatim |
|---|---|
| **6a Return Transcript** | "available for the current year and returns processed during the **prior 3 processing years**" |
| **6b Account Transcript** | "**Account transcripts are available for most returns**" — ⛔ **no year limit stated** |
| **6c Record of Account** | "Available for current year and **3 prior tax years**" |

- ⭐ **an old year is not out of reach**: beyond the 3-year window, a free **account transcript** still shows the *"return filing date and return processed date"* that settles the question — no $30 Form 4506 needed
- ⚠️ 6a counts **processing** years and 6c counts **tax** years — different windows for a late-filed return, which is the delinquency case

### ✅ the corporate return transcript has NO year floor — but three of its siblings do

| transcript | year floor |
|---|---|
| **Corporate and partnership** (1065, 1120, 1120-S, 1120-H, 1120-L) | ⭐ **none stated** |
| Employment | **2023 and after** |
| Estate and Trust | **2023 and after** |
| Exempt organization | **2023 and after** |

do not carry the "2023 and after" qualifier across from a neighbor row.

---

## .sources

- [IRS: Get a business tax transcript](https://www.irs.gov/businesses/get-a-business-tax-transcript)
- [IRS: Business Tax Account](https://www.irs.gov/businesses/business-tax-account)
- [IRS: About Form 4506-T](https://www.irs.gov/forms-pubs/about-form-4506-t)
- [IRS: Form 4506-T (PDF)](https://www.irs.gov/pub/irs-pdf/f4506t.pdf)
- [IRS: Form 4506 (PDF)](https://www.irs.gov/pub/irs-pdf/f4506.pdf)

---

## .provenance

every quote pulled with **bhrowser**, per `rule.require.bhrowser-citations`. the playbooks are `.scratch/irs-1120-retrieval.play.ts` and `.scratch/irs-1120-expand.play.ts` (the second produced the accordion expansions below) — ⚠️ **gitignored**, so absent from git and the npm package; the cure is a move to `briefs/refs/`. the character counts are the record of what was pulled.

| source | chars | note |
|---|---:|---|
| Business Tax Account | 1,431 → **13,281** | ⚠️ **accordions** — see below |
| Get a business tax transcript | 3,701 → **6,449** | ⚠️ accordions |
| Form 4506-T (pdf) | 23,724 | via request context + `pdftotext` |
| Form 4506 (pdf) | 23,258 | the $30 fee, rev. April 2025 |

⚠️ a claim about **another artifact in this repo** (a playbook count, a sibling's status) can be falsified silently by a later commit — take a live count from a `Glob`, never from a sentence.

### 🚩 traps met on this pull

the methods are in `rule.require.bhrowser-citations.traps` § *🚩 a page can pass EVERY guard and still be incomplete*. the facts:

- Business Tax Account came back at **1,431 chars, exit 200**, `C corporation` a bare title, and a needle count of **`1120: 0`**. expanded: **13,281 chars** (89% hidden), `1120` ×5, with the W-2 gate and the three-prong list inside the collapsed section
- revision 1 of the expand playbook clicked every `[aria-expanded="false"]` control; the site nav uses the same attribute, so the run ended on `/help/report-fraud` and reported `1120: 0` about the wrong page. caught by `grew: false` and a **size collision** (two urls, exactly 1,492 chars). fix: scope clicks to the main content region, re-assert the url after, and suppress the needle count when the page moved
