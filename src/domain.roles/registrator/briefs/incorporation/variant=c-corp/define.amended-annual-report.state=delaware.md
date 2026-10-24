# define.amended-annual-report.state=delaware

## .what

Delaware has **two** filings whose names both contain "amend", and they do
different jobs at different agencies' counters:

| the filing | amends | fee | where |
|---|---|---|---|
| **Amended Annual Report** | a **prior year's annual report** — its share counts, its gross assets, its officer/director list | **$25** exempt · **$50** non-exempt | the franchise-tax portal |
| **Certificate of Amendment** | the **certificate of incorporation** — the charter itself | per the corporate fee schedule | the document-filing counter |

⛔ **a clerk who says "file the amended reports" on a franchise-tax call means
the first one.** the second changes the company's authorized shares going
forward; it cannot restate a year already reported.

## .why the confusion is the default

Delaware's own site pushes you toward the wrong one.

- the **FAQ** carries exactly one entry whose text contains `amend`, and it
  points at `corp.delaware.gov/amend09/` — the **Certificate of Amendment**.
- **no page on the site explains the Amended Annual Report.** there is no
  `/amendedreport/`, no FAQ entry, no instruction sheet.

the only first-party evidence that the filing exists at all is a **fee line**:

> "Annual Report Filing Fees:
>
> Effective September 1, 2019, the fees for filing an Annual Report or an
> **Amended Annual Report** are below:
>
> Exempt Domestic Corporations – $25.00.
> Non-Exempt Domestic Corporations – $50.00."
>
> — [corp.delaware.gov/paytaxes/](https://corp.delaware.gov/paytaxes/)

⭐ **a fee schedule enumerates what the agency will accept money for** — a
filing in the fee table and nowhere else is still a real filing.

## ⛔ the statutory authority — § 502(c), and it is an ELECTION

why the agency must accept a restated year is one sentence of statute:

> "(c) If the annual franchise tax report and the franchise tax due are not
> filed or paid by the corporation as required by this chapter, the Secretary of
> State shall ascertain and fix the amount of the franchise tax as determined in
> the manner prescribed by § 503(a) of this title and the amount so fixed by the
> Secretary of State **shall stand as the basis of taxation** under the
> provisions of this chapter **unless the corporation shall thereafter elect** to
> compute the franchise tax in the manner prescribed by § 503(a)(2) of this
> title **by filing the annual franchise tax report and complying with the
> provisions of § 503(b)** of this title."
>
> — [8 Del. C. §502(c)](https://delcode.delaware.gov/title8/c005/index.html)
> · source of record: `refs/de-title8-ch5-franchise-tax.txt`

three phrases carry the weight, and each answers a question a filer actually
has:

| the words | what they settle |
|---|---|
| *"shall stand … **unless**"* | the assessment on file is a **default**, never a determination. it is what applies while no report was filed — the agency did not decide against you |
| *"shall **thereafter** elect"* | the election is expressly available **after** the Secretary fixed the amount. the sentence attaches **no deadline** to it |
| *"**and** complying with … § 503(b)"* | the report alone is not the election. § 503(b) is a second condition |

⭐ **so the amended report is not a request for relief. it is the exercise of a
statutory election**, and the agency's role is to receive it. that reframes
every call: you do not ask whether they will recalculate; you state which method
you elect.

### ⛔ § 503(b) demands shares AND assets — and its failure mode is silent

> "(b) Unless a corporation shall submit to the Secretary of State, at the time
> of filing its annual franchise tax report, a statement setting forth **the
> number of shares of each class of stock actually issued**, if any, **and the
> amount of the total gross assets** of the corporation, as of the nearest date
> on which the amount is obtainable, including in the statement its goodwill
> valued at the same amount at which it is valued in the books of account of the
> corporation, **it shall pay a franchise tax for such year computed in the
> manner prescribed by paragraph (a)(1)** of this section."
>
> — [8 Del. C. §503(b)](https://delcode.delaware.gov/title8/c005/index.html)
> · source of record: `refs/de-title8-ch5-franchise-tax.txt`

read the consequence clause. a report that carries **one** of the two figures
does not fail, and does not bounce back. it is **re-priced under paragraph
(a)(1)** — the Authorized Shares Method, which is the very figure you filed to
escape.

⚠️ **so a clerk's shorthand is not a waiver.** where an agency asks only for the
issued share count, that is the field absent from their side; it does not narrow
§ 503(b), and a report submitted with shares alone lands back on the method you
meant to leave.

## .when you need one

the Amended Annual Report is the instrument that carries a **recalculated
franchise tax** for a closed year. the sequence:

```
1. the year's original annual report reported some share count
2. that count produced a tax under the Authorized Shares Method
3. you substantiate a lower figure — issued shares, gross assets
4. the AMENDED ANNUAL REPORT restates the year
5. the recalculated tax follows from the restated year
```

step 4 is the step people skip, because they expect the recalculation to be an
adjustment the agency makes internally. it is not — **it is a filing you make,
per year, with its own fee.**

⚠️ so a multi-year recalculation is **N filings and N fees**, not one. budget
`$50 × years` for a non-exempt domestic corporation.

## ⚠️ the annual report has a NEW required field

> "**Important Notice: Nature of Business is now required on all Domestic
> Annual Reports.** The nature of a business indicates what a company does to
> generate revenue."
>
> — [corp.delaware.gov/paytaxes/](https://corp.delaware.gov/paytaxes/)

this appears only as an alert banner above the body of the instructions page —
easy to scroll past, and a report submitted without it will not go through.
read the banner, not only the body.

## .the operative facts around it

| fact | value | source |
|---|---|---|
| due | **March 1**, for the prior year | paytaxes |
| filing method | **online only** for domestic corporations | paytaxes |
| portal hours | **8:00am – 11:45pm ET**, daily | paytaxes |
| penalty | **$200** plus **1.5% per month** on tax and penalty | paytaxes |
| minimum tax — Authorized Shares | **$175** | paytaxes |
| minimum tax — Assumed Par Value Capital | **$400** | paytaxes |
| maximum tax | **$200,000** (or $250,000 for a Large Corporate Filer) | paytaxes |
| ACH required | for any transaction **over $5,000** | paytaxes |
| foreign corporations | annual report due **June 30**, **$250** fee, **$250** penalty | paytaxes |

⚠️ note the last row is a **different regime**: a foreign corporation's report
is a flat fee with no franchise tax, on a different date. do not carry a
domestic figure into a foreign question.

## ⛔ the character set is load-bearing

> "Only use the English version of characters when entering data, otherwise it
> may cause an inaccurate record on your Annual Report."
>
> — [corp.delaware.gov/paytaxes/](https://corp.delaware.gov/paytaxes/)

a non-ASCII character pasted from a word processor — a curly apostrophe, an
en-dash in an address — can corrupt the record. paste into a plain-text editor
first.

## ⚠️ do NOT double-submit a card payment

> "If payment is by credit card click submit only once, clicking multiple times
> may result in duplication of charges to your credit card."

the portal does not deduplicate. a slow response is not a failed one.

## ⛔ automated tools are PROHIBITED on the entity search

the entity search page carries its own prohibition, and the sanction lands on
the operator rather than on the tool:

> "The intent of this tool is to provide general entity details. The Division of
> Corporations strictly prohibits mining data. Excessive and repeated searches
> that may have a negative impact on our systems and customer experience are
> also prohibited. **Use of automated tools in any form may result in the
> suspension of your access to utilize this service.**"
>
> — [icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx](https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx)

⭐ **so an entity lookup is a human task, always.** it trades a ten-second manual
search for a risk to the very account that must make the filing. an agent may
pull the agency's published content pages freely; it must not drive the search
form.

## ⛔ the FREE search cannot tell you an entity's status

this is the trap on the other side. the free search returns real data and
disclaims the one thing you want from it:

> "The search results will return both active and inactive entities from our
> database. **This is not an indication of the current status of an entity.**"
>
> "The entity information provided on this website, free of charge, consists of
> the entity name, file number, incorporation/formation date, registered agent
> name, address, phone number and residency. **However, additional information
> can be obtained for a fee.**"

the authoritative answer is a **paid** status product:

| product | price | returns |
|---|---:|---|
| status | **$10** | the current status, and the "Status as of" date — which is *the date the entity went into the current status* |
| status with tax & history | **$20** | status, **the last 5 filings**, **franchise tax assessment**, **total authorized shares**, and **tax due** |
| certificate of good standing | separate | ⛔ **neither online option produces one** |

> "Please note: requesting an online status will NOT generate an official
> certificate of good standing."
>
> — [corp.delaware.gov/onlinestatus/](https://corp.delaware.gov/onlinestatus/)

⚠️ and the $20 option returns a **page**, not images:

> "If you are requesting the $20 status option, it will NOT return actual images
> of the documents on record… **Officer and Director names and addresses are
> maintained on the images of the annual reports and are not available through
> this application.**"

so to read what a prior annual report actually *said* — the share count you are
about to amend — you need the **Document Filing and Certificate Request
Service**, not the status product.

## 🎯 the $20 status is the right instrument for a reinstatement

for a corporation mid-revival, the $20 product answers four questions in one
pull that would otherwise take four calls:

- is the charter still void?
- what does Delaware believe the authorized share count is?
- what is the franchise tax assessment, per their arithmetic?
- what is due right now?

that last figure is the one to reconcile against your own computation before
any payment. ⚠️ and compute yours with a skill, never by hand — see
`rule.forbid.hand-computed-figures`.

## .enforcement

- a "Certificate of Amendment" filed where an **Amended Annual Report** was
  asked for = **blocker** (wrong instrument, wrong counter, and it does not
  restate the year)
- one amended report filed for a multi-year recalculation = **blocker**
  (the filing is per year, with a per-year fee)
- an annual report prepared without **Nature of Business** = **blocker**
- an entity search driven by an automated tool = **blocker**
  (the prohibition is express, and the sanction is the operator's access)
- an entity's status asserted from the **free** search = **blocker**
  (the page disclaims it in terms)
- a card payment resubmitted after a slow response = **blocker**
- non-ASCII characters pasted into the portal = **nitpick**

## .provenance

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. no WebFetch or WebSearch summary stands
behind any line. the playbooks deliberately target **published content pages
only** and refuse to drive the search form, for the reason quoted above.

| source | url | chars | bytes on disk |
|---|---|---:|---|
| annual report & tax instructions | `corp.delaware.gov/paytaxes/` | 4,431 | `refs/pulledAt=2026-08-23.de-paytaxes.txt` |
| online status | `corp.delaware.gov/onlinestatus/` | 3,880 | `refs/pulledAt=2026-08-23.de-onlinestatus.txt` |
| corporate fee schedule | `corp.delaware.gov/fee/` | ⚠️ **1,942** | ⬜ not embedded — no quote rests on it |
| entity search | `icis.corp.delaware.gov/…/NameSearch.aspx` | ⚠️ **1,941** | `refs/pulledAt=2026-08-23.de-entity-search.txt` |
| the two statutes | `delcode.delaware.gov/title8/c005/` | — | `refs/de-title8-ch5-franchise-tax.txt` |

every quote on this page is machine-verified byte-faithful against those files:

```
rhx quote.verify \
  --from src/domain.roles/registrator/briefs/incorporation/variant=c-corp/refs \
  --in   src/domain.roles/registrator/briefs/incorporation/variant=c-corp/define.amended-annual-report.state=delaware.md

→ 13 verified · 0 live
```

⚠️ a `NOT-IN-SOURCE` verdict has two causes that look identical: invented text,
or a census never handed the source. defects that **cluster by subject** point
at an absent file. the cure is to embed the bytes in the published tier
(`rule.require.embed-source-bytes`), never to declare a gap.

⚠️ both short pulls (1,942 and 1,941 chars) were inspected and are complete —
the fee page is a hub that answers no question; the entity search carries the
automation prohibition. the byte count is a trigger to inspect, never a verdict.
every url was harvested from the site's own navigation, never constructed.

## .see also

- `howto.fill-amended-annual-report.state=delaware` — ⭐ the field-by-field
  companion: what to type in each box, and the four traps. in particular, the
  portal's **recalculation** is the only detector for the § 503(b) silent failure
  described above
- `delaware.franchise.tax.[howto].renew` — the ordinary annual cycle this amends
- `delaware.franchise.tax.delinquency` — §510, the void trigger, and the notice
- `howto.reinstate-void-delaware-corp` — where the amended reports sit in the
  revival sequence
- `howto.reduce-franchise-tax-for-delaware-corp-solofounder` — why a
  recalculation is worth the per-year fee
- `accountant` — `rule.forbid.hand-computed-figures` — reconcile Delaware's
  assessment against a computed figure, never a hand one
