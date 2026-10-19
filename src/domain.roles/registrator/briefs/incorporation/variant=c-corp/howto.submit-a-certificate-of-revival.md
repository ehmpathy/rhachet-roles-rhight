# howto.submit-a-certificate-of-revival

## .what

how to get a **Certificate of Revival of Charter** for a voided Delaware
corporation to the Division of Corporations: the preconditions, the two
channels, the clocks, and the fees.

⚠️ **not legal advice.** every quote is pulled with bhrowser and embedded in
`refs/` beside this brief.

## ⛔ THREE PRECONDITIONS — none of them is the filing

the certificate is the **last** step. each precondition fails silently if skipped.

### 1. the back taxes and every annual report, PAID AND FILED

> "Before the Certificate can be filed, **all taxes due to the State at the time
> the corporation became void must be paid and all applicable Annual Franchise
> Tax Reports must be filed.** The Annual Franchise Tax Reports and Franchise
> Taxes must be filed and paid online at corp.delaware.gov."
>
> — `refs/effectiveAt=2023-08-01.de-revival-void-form.txt`

the statute sets the **amount**, with a proviso that changes it at five years:

> "**(g)** Any corporation that revives its certificate of incorporation under
> this chapter shall pay to this State a sum equal to all franchise taxes,
> penalties and interest thereon due at the time its certificate of
> incorporation became forfeited or void pursuant to this title; **provided,
> however**, that any corporation … **whose certificate of incorporation has
> been forfeited or void for more than 5 years** shall, **in lieu of** the
> payment of the franchise taxes and penalties otherwise required by this
> subsection, pay a sum equal to **3 times the amount of the annual franchise
> tax** that would be due and payable by such corporation for the year in which
> the revival is effected, computed at the then current rate of taxation.
> **No payment made pursuant to this subsection shall reduce the amount of
> franchise tax due under Chapter 5 of this title for the year in which the
> revival is effected.**"
>
> — 8 Del. C. § 312(g), `refs/de-title8-ch1-sc12-revival.txt`

| void for… | you owe |
|---|---|
| **≤ 5 years** | every back year's tax **+ penalties + interest** |
| **> 5 years** | **3× the CURRENT year's** annual tax, *in lieu of* the back taxes and penalties |

- ⚠️ the last sentence of (g): the current year's franchise tax is owed **on top**, on either branch. a revival budget that stops at the back years is one year short
- the > 5 years branch is a cap, not a penalty tier — it can be **cheaper**. compute it; do not assume
- ⛔ compute neither figure by hand (`rule.forbid.hand-computed-figures`). use `rhx franchise.tax.delaware.accrue`, which carries the § 504(a) installments and § 505 interest

### 2. the REGISTERED AGENT must be contacted FIRST

it lives in the Division's general filing requirements, not the revival packet:

> "**Prior to submitting a document that appoints a Registered Agent, the
> submitter must contact the Registered Agent to verify they agree to act on
> behalf of the entity.**"
>
> — `refs/pulledAt=2026-08-30.de-submitting-a-request.txt`, *Filing Requests*

a revival certificate IS such a document. § 312(d)(2) requires it to state:

> "**(2)** The address (which shall be stated in accordance with § 131(c) of
> this title) of the corporation's registered office in this State **and the
> name of its registered agent at such address**"

- the rule binds even where the agent is unchanged — the certificate names them
- the packet's Article 2 instruction agrees: *"the Delaware registered agent **you are appointing**."*
- ⇒ call the agent before the upload, and record the call. if a formation service assigned the agent, see `howto.verify-your-registered-agent.from=stripe-atlas.md`

### 3. the BOARD must authorize it

> "**(c)** The revival of the certificate of incorporation may be procured **as
> authorized by the board of directors** or members of the governing body of the
> corporation in accordance with subsection (h) of this section and by
> executing, acknowledging and filing a certificate of revival in accordance
> with § 103 of this title."

subsection (h) answers who the board is while void, and how many must act:

> "**(h)** For purposes of this section and § 502(a) of this title, the board of
> directors or governing body of the corporation **shall be comprised of the
> persons, who, but for the certificate of incorporation having become forfeited
> or void pursuant to this title, would be the duly elected or appointed
> directors**… The requirement for authorization by the board of directors under
> subsection (c) of this section **shall be satisfied if a majority of the
> directors or members of the governing body then in office, even though less
> than a quorum, or the sole director or member of the governing body then in
> office, authorizes the revival**…"

- a void charter does not dissolve the board — the directors who would have been in office still are
- a solo founder is a quorum of one — "the sole director … then in office" is named expressly
- where **no** directors are available, (h) lets the stockholders elect a full board, at a special meeting that "may be called by any officer or stockholder upon notice given in accordance with § 222."

## .the two channels — and PAYMENT picks for you

| | Document Filing and Certificate Request Service | mail / walk-in |
|---|---|---|
| pay by **credit card / ACH** | ✅ **the only way** | ⛔ refused |
| pay by **check** | ⛔ | ✅ |
| the cover **memo** | ✅ generated for you | ⚠️ you attach theirs |
| hours | published, **closed weekends** — see below | business hours |

> "**CREDIT CARD** – The Division of Corporations accepts American Express,
> Discover, MasterCard and Visa. **If you are paying with credit card, you must
> utilize the Document Filing and Certificate Request Service. We will not
> accept credit cards for mail or walk-in orders.**"
>
> "**CHECK** – Checks must be made payable to the "Delaware Secretary of State".
> The check must be drawn on an U.S. Bank in U.S. funds."

the charge does **not** land at submit time:

> "The fees required for the request **will not be charged to the credit
> card/ACH account upon submission. When the order is processed, the charges
> will be applied.** An invoice will be sent with the completed request."

⇒ a card statement with no charge is no evidence the filing was received.

### the mailing address, if you pay by check

```
Division of Corporations
John G. Townsend Building
401 Federal Street
Suite 4
Dover, DE 19901
```

> "Please be sure to include all filing fees, including expedited service fees
> (if requested). If you are unsure of the fees please call General Information
> at (302) 739-3073."

## ⛔ "cover MEMO" and "cover LETTER" ARE TWO DIFFERENT DOCUMENTS

| the noun | what it is | whose | asked for by |
|---|---|---|---|
| **"Filing Cover Memo"** | the Division's **own** routing form — submitter name and address, contact details | ⛔ **theirs** | the *Filing Requests* section |
| **"cover letter"** | a letter on **your** letterhead with your name, address, telephone/fax | ✅ **ours** | the revival packet's cover page |

on the electronic channel the memo is generated for you:

> "**If submitting the request using the Document Filing and Certificate Request
> Service, the system will create the filing cover memo using information
> entered at the time of the upload.**"

that settles the *memo* and says naught about the *letter*, which the packet asks for independently:

> "**For the convenience of processing your order in a timely manner, please
> include a cover letter with your name, address and telephone/fax number to
> enable us to contact you if necessary.** Please make sure you thoroughly
> complete all information requested on this form."

- the letter is a **request** (*"For the convenience of"*), not a statutory condition — but it is cheap, the Division's stated preference, and the one place to name a preferred contact channel. send it
- the general test: **who authored the document each noun names?** near-synonyms in a filings domain usually straddle that line and take opposite rules. see `rule.forbid.answer-by-near-synonym`

## 🚩 THE UPLOAD SERVICE HAS PUBLISHED HOURS — AND CLOSES ON WEEKENDS

> "**This service is available Monday thru Thursday from 7:45am to 11:59pm (EST)
> and on Friday from 7:45am to 10:30pm (EST). This service is not available
> during weekends, State holidays and unexpected closures of the Division of
> Corporations.**"
>
> — `refs/pulledAt=2026-08-28.de-document-upload-service.txt`

| what you see | when | what it is |
|---|---|---|
| "not available" | Sat / Sun / a State holiday | ✅ the published schedule. wait |
| "not available" | Mon–Thu, outside 7:45am–11:59pm ET | ✅ the published schedule. wait |
| "not available" | Mon–Thu, **inside** the window | 🚩 a real outage. escalate |

- measured: a Sunday "not available" was once reported as an outage while the refutation sat in `refs/`
- ⇒ before you report an outage, check the published hours and **compute** the weekday rather than recall it

## 🚨 AN EXPEDITE TIER CARRIES A TIGHTER CLOCK THAN THE PORTAL THAT ACCEPTS IT

the window says when the Division will **take** a filing. the tier says when it must arrive to **earn a turnaround**:

> "Your request will be processed within 24 hours, excluding weekends and
> holidays… Filing must be received by **7:00pm EST or EDT** for filings."
>
> — the Priority 4 helper text on the Document Filing and Certificate Request
> form, observed 2026-09-10

| clock | set by | Priority 4 example |
|---|---|---|
| the **service window** | the portal | Mon–Thu to **11:59pm** ET |
| the **receipt deadline** | the tier you bought | **7:00pm** ET |

- ⇒ a filing at 9pm on a Tuesday is **accepted, and is not 24-hour work.** no error shows, the fee is still invoiced, and the turnaround silently becomes the next business day
- read the cutoff off the **tier you selected** on the form, never off the schedule's fee row — only the form states it

## ⛔ NO TURNAROUND IS PUBLISHED FOR REGULAR WORK — A PHONE CALL IS

Priority 7 — Reg. Work is priced at `$0`, and no document attaches a duration to it:

> "Processing time for **regular (non-expedited) work varies based upon the
> volume of items received** by our office."
>
> — the FAQ, `refs/pulledAt=2026-09-25.de-faq-regular-work-turnaround.txt`

| document | names the four expedite tiers + a time for each | names regular work |
|---|---|---|
| Expedited Services | ✅ 1-hour, 2-hour, same day, next day | **0 times** |
| the fee schedule (`effectiveAt=2026-08-01`) | ✅ Priority 1, Priority 2, `Same Day`, `24-Hour` columns | **0 times** |
| the Filing Cover Memo | — | labels the tier `Priority 7 / Reg. Work`, with no time |

⇒ Priority 7 is the queue, not a service level. any interval recalled for it was invented.

### ✅ the remedy is the Division's own, and it is a call

> "Prior to submitting your Filing/Document request, you may contact our office
> to find out **what date is currently being processed for regular work** to help
> you determine if you need to request expedited service for your submission."
>
> — the FAQ, `refs/pulledAt=2026-09-25.de-faq-regular-work-turnaround.txt`

ask **"what date are you currently processing?"**, never "how long will mine take?" — the first is on a clerk's screen; the second asks for the forecast the FAQ declines to print.

### ⭐ THE EXPEDITE DECISION IS NOT LOCKED AT SUBMIT TIME

> "If you have already submitted your Filing/Document request, you may contact
> our office for assistance in **upgrading your item to expedited service**."
>
> — the FAQ, `refs/pulledAt=2026-09-25.de-faq-regular-work-turnaround.txt`

⇒ with no hard deadline: submit at Priority 7, call for the current processed date, upgrade only if it falls past the date you need.

two further delays the volume sentence does not name:

> "Processing times may vary during our busy season… Please note your
> **processing time will be delayed if your request contains errors**."
>
> — `refs/pulledAt=2026-09-25.de-expedited-services.txt`

⇒ the format criteria below are a **schedule** risk too: an error returns you to the back of an unpublished queue.

## .the fees

from the packet's cover page (`rev. 08/2023`):

| item | fee |
|---|---|
| file the Certificate of Revival | **$189.00** |
| each page beyond the first | **+$9.00** |
| certified copy | **+$50.00** |
| expedited service | ⚠️ **varies** — see below |

> "The fee to file the Certificate is **$189.00**. If the document is more than
> 1 page, please include **$9.00 for each additional page**. You will receive a
> stamped "Filed" copy of the submitted document. **A certified copy may be
> requested for an additional $50.** Expedited services are available. Please
> contact our office concerning these fees or you may consult our fee chart at
> corp.delaware.gov."

⛔ expedite is not a flat fee — it varies by tier and certificate type, and the packet points at the fee chart instead of a number. do not quote one from memory.

### the chart the packet points at

> `Revival (plus taxes to renew)   $189.00   $50.00   $200.00   $100.00`
>
> columns: `State Filing Fee | Certified Copy (each) | Same Day Fee | 24-Hour Fee`
>
> — `refs/effectiveAt=2026-08-01.de-doc-fee-schedule.txt`

| tier | fee | source |
|---|---|---|
| Priority 7 — Reg. Work | **$0** | the free default; absent from the packet |
| Priority 4 — 24-Hour | **+$100.00** | the Revival row |
| Priority 3 — Same Day | **+$200.00** | the Revival row |
| Priority 2 — Two-Hour | **+$500.00** | *"per document/request"* |
| Priority 1 — One-Hour | **+$1,000.00** | *"per document/request"* |

- the form's helper text gives a **range** — *"ranges from $50 to $100.00"* for Priority 4 — across every document type. the schedule's named Revival row wins
- > "**ALL SAME DAY AND 24 HOUR EXPEDITED FEES APPLY PER FILE NUMBER.**" — one entity, one expedite charge
- the portal does not compute the total — *"The service does not calculate fees"*. the invoice after processing is the authority
- the stamped "Filed" copy comes free; the $50 certified copy is optional, and most purposes need only the stamped copy
- at **$9.00 per additional page**, verify the rendered PDF is one page before upload

## .the document format — these are REJECTION criteria

the Division images every filing:

> "All documents must be submitted on **8.5″by 11″** paper."
> "Documents should have **margins of 1″ on the sides, 2″ at the top and 1.5″ at
> the bottom**."
> "Documents should be **typed using black ink. The execution should also be in
> black ink.** The Division of Corporations uses an electronic imaging system,
> therefore all documents must be legible."

the packet adds, on the cover page and in the execution block:

> "It is important that the execution be legible, we request that you **print or
> type the name of the person signing under the signature line**."

## ⛔ THE EXECUTION IS A HUMAN ACT, UNDER § 103

> "**Execution Block** - The document must be signed by an authorized officer of
> the corporation pursuant to **Section 103 of Title 8**. The name of the person
> must be typed or written legibly underneath the signature."

§ 103 execution carries a perjury affirmation: the officer must **read the certificate and adopt it**. a rendered signature placed onto a PDF is a production step, not that act. render it, hand it to the officer, let them read it before it goes out.

## .the order of work

```
1. compute the amount owed       -> rhx franchise.tax.delaware.accrue
2. pay the back taxes + file EVERY annual report
   ⛔ this is a PRECONDITION; the certificate cannot be filed first
3. call the registered agent, confirm they consent to act   [§ 312(d)(2)]
4. board authorization                                      [§ 312(c)+(h)]
5. fill the certificate from the packet's article instructions
6. render to PDF -> verify ONE page, black ink, the margins
7. the officer READS and signs it                           [§ 103]
8. upload Mon-Thu 7:45am-11:59pm ET, or Fri to 10:30pm ET
   + a cover letter on your letterhead
   ⛔ NOT weekends, NOT State holidays
   ⛔ if you bought an expedite tier, ITS cutoff binds first (Priority 4 = 7:00pm ET)
9. the current year's franchise tax is STILL owed           [§ 312(g)]
```

step 9 is the one that gets dropped — § 312(g)'s last sentence puts it outside the revival payment.

## .enforcement

- a revival certificate submitted before the back taxes and annual reports clear
  = **blocker** (the packet's own precondition)
- a revival certificate filed with no prior contact with the registered agent
  = **blocker** (§ 312(d)(2) makes it an appointment document)
- a revival budget that omits the **current** year's franchise tax = **blocker**
  (§ 312(g), last sentence)
- an expedite tier bought, and the submit timed against the **portal's** window
  rather than the **tier's** receipt deadline = **blocker** (the fee is charged
  and the turnaround is not earned)
- an expedite fee quoted from the form's helper range rather than the fee
  schedule's named row = **nitpick**
- a back-tax or 3×-cap figure computed by hand = **blocker**
  (`rule.forbid.hand-computed-figures`)
- a "cover memo? no" verdict used to settle the **cover letter** question
  = **blocker** (`rule.forbid.answer-by-near-synonym`)
- a weekend "not available" message reported as an outage = **blocker**
- a flat expedite fee quoted from memory = **blocker** (it varies by type)
- a card statement read as proof of receipt = **blocker** (charges apply at
  processing, not at submission)

## .sources

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`, and the bytes are embedded beside this brief
per `rule.require.embed-source-bytes`.

| what | ref | note |
|---|---|---|
| the revival packet — cover page, instructions, blank form | `refs/effectiveAt=2023-08-01.de-revival-void-form.txt` | the $189 fee, the tax precondition, the cover-letter request |
| 8 Del. C. ch. 1, subch. XII — §§ 311–314 | `refs/de-title8-ch1-sc12-revival.txt` | pulled as a **container**; (g) and (h) are the subsections a targeted pull misses |
| Submitting a Request | `refs/pulledAt=2026-08-30.de-submitting-a-request.txt` | the agent-consent rule, the format criteria, the payment channel rule |
| Document Upload Service | `refs/pulledAt=2026-08-28.de-document-upload-service.txt` | the published hours |
| eCorp Business Services | `refs/pulledAt=2026-08-30.de-ecorp-business-services.txt` | where the upload form lives |
| the Filing Cover Memo itself | `refs/pulledAt=2026-08-23.de-filing-cover-memo.pdf` + `.txt` | ⛔ **theirs**, and check-path only |
| the FAQ answer on regular work | `refs/pulledAt=2026-09-25.de-faq-regular-work-turnaround.txt` | the volume sentence, the call-the-office remedy, and the post-submit upgrade clause |
| Expedited Services | `refs/pulledAt=2026-09-25.de-expedited-services.txt` | four expedite tiers with a time for each, and **0 times** for regular work |

the turnaround playbooks are committed and re-runnable:

- `registrator/briefs/refs/delaware-turnaround.nav.play.ts` — earns both urls from
  an unfiltered link harvest of `corp.delaware.gov`. neither was guessed
- `registrator/briefs/refs/delaware-turnaround.faq.play.ts` — the pull. captures
  both text reads, reports their delta, and slices the FAQ answer in code

### the turnaround answer is INVISIBLE to a rendered-text read

the FAQ is an accordion; `innerText` honors `display: none`, `textContent` does not:

| the read | chars | carries the volume sentence |
|---|---:|---|
| `document.body.innerText` | 6,209 | ⛔ absent |
| `document.body.textContent` | 486,551 | ✅ present |

⇒ the rendered-only pull clears every guard and concludes Delaware publishes no answer — wrong in a way no guard catches.

### quote verification

every span attributed to the two `pulledAt=2026-09-25` refs, in every file that
cites them, is verified byte-for-byte by
`.agent/.notes/tool.verify-turnaround-quotes.js`. its corpus is discovered by a
grep for the attribution, and it carries two guards:

| guard | what it would catch |
|---|---|
| a one-character **mutation** of each verified span, which must then miss | a vacuous comparison |
| a **coverage** pass that reuses each verified span as a needle against every file | a live copy of the quote in a file the attribution filter skipped |

- measured: the first run missed one span of five — a retyped tail, not a bad pull
- measured: coverage caught two unattributed copies a verdict count could not see
- bound: coverage audits copies of spans verified **somewhere**; a quote no file ever attributed is outside its reach

### the container rule earned its keep twice here

- **§ 312 was pulled whole** — (g)'s five-year proviso and (h)'s sole-director clause sit where a question-shaped pull would not reach; (c) hands over the real rule by cross-reference only
- **the Submitting a Request page was read whole** — the agent-consent sentence is in *Filing Requests* and absent from *Certification and Copy Requests*

## .see also

- `howto.verify-your-registered-agent.from=stripe-atlas.md` — who your agent
  actually is, when a formation service assigned one
- `howto.reinstate-void-delaware-corp.md` — the whole arc this is one step of
- `delaware.franchise.tax.delinquency.md` — § 510, and what void actually means
- `rule.forbid.answer-by-near-synonym` — the cover memo / cover letter class
- `rule.forbid.hand-computed-figures` — why every figure above points at a skill
