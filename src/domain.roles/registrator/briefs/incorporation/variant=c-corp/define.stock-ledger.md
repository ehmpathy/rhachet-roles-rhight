# define.stock-ledger

## .what

the **stock ledger** is the corporation's official record of who owns its stock.
in Delaware it is not a bookkeeping convenience — it is a statutorily defined
record with a statutorily defined effect.

Delaware defines it in the corporation statute itself:

> "(c) For purposes of this chapter, **"stock ledger" means 1 or more records
> administered by or on behalf of the corporation in which the names of all of
> the corporation's stockholders of record, the address and number of shares
> registered in the name of each such stockholder, and all issuances and
> transfers of stock of the corporation are recorded** in accordance with § 224
> of this title. **The stock ledger shall be the only evidence as to who are the
> stockholders** entitled by this section to examine the list required by this
> section or to vote in person or by proxy at any meeting of stockholders."
>
> — [8 Del. C. § 219(c)](https://delcode.delaware.gov/title8/c001/sc07/index.html)

## .why it is the operative document

three consequences follow from that definition.

### 1. it is the ONLY evidence of who may VOTE and who may INSPECT

`§ 219(c)` says the ledger **"shall be the only evidence"** of who may vote and
who may inspect. a cap table, a spreadsheet, a stock purchase agreement, a board
resolution — none of them establishes **those two rights** in Delaware.

⛔ the exclusivity runs only to stockholders *"entitled by this section to examine
the list required by this section or to vote in person or by proxy at any meeting
of stockholders."* it is a rule about **two enumerated rights**, not a general
evidentiary bar.

| the question | § 219(c) exclusive? |
|---|---|
| who may vote | ✅ yes |
| who may examine the § 219(a) list | ✅ yes |
| ⭐ **were shares issued, and how many** | ⛔ **no** — a CSPA, a board consent, or an Exhibit A is competent evidence |
| who holds title to a share, in a dispute | ⛔ not decided by this section |

- ⚠️ the broad misread costs real filings: a founder who must attest issued shares
  for an 8 Del. C. § 502(a) report, and holds a consent and a CSPA but no ledger,
  concludes his evidence is worthless — and either guesses (§ 502(b) perjury) or
  stalls. the text requires neither.
- the narrow read does not weaken the case for a ledger: it still controls vote
  and inspection conflicts, is the first artifact § 220(b)(1) names, and is on
  the § 116(b) carve-out list.

| | stock ledger | cap table |
|---|---|---|
| status | the **statutory** record | a management model |
| authority | 8 Del. C. §§ 219(c), 224 | none |
| contents | holder of record, address, share count, all issuances and transfers | often options, SAFEs, projections, scenarios |
| on conflict | **controls** | loses |

### 2. it is the first thing a stockholder can demand

the inspection right names it first, ahead of the rest:

> "any stockholder … shall, upon written demand under oath, have the right during
> the usual hours for business to inspect for any proper purpose, and to make
> copies and extracts from: a. **The corporation's stock ledger**, a list of its
> stockholders, and its other books and records"
>
> — [8 Del. C. § 220(b)(1)](https://delcode.delaware.gov/title8/c001/sc07/index.html)

### 3. the DGCL treats it as a document of record, not a memo

Delaware's electronic-signature safe harbor in § 116(a) has a short carve-out
list, and the ledger is on it — beside court filings and stock certificates:

> "(b) Subsection (a) of this section shall not apply to: (1) A document filed
> with or submitted to the Secretary of State, the Register in Chancery, or a
> court or other judicial or governmental body of this State; **(2) A document
> comprising part of the stock ledger**; (3) A certificate representing a
> security"
>
> — [8 Del. C. § 116(b)(2)](https://delcode.delaware.gov/title8/c001/sc01/index.html)

## .what must be in it

`§ 219(c)` fixes the fields. there are exactly four:

| field | statutory words |
|-------|-----------------|
| **holder of record** | "the names of all of the corporation's stockholders of record" |
| **address** | "the address … of each such stockholder" |
| **share count** | "the number of shares registered in the name of each such stockholder" |
| **every issuance and transfer** | "all issuances and transfers of stock of the corporation are recorded" |

⚠️ the fourth is the one most often skipped. the ledger is not a snapshot of
current ownership — it is a **complete history of movement**. an entry for every
issuance and every transfer, not merely a current balance.

## .the form is free — the content is not

`§ 219(c)` incorporates `§ 224`, which is deliberately permissive about medium:

> "**Any records** administered by or on behalf of the corporation in the regular
> course of its business, **including its stock ledger**, books of account, and
> minute books, **may be kept on, or by means of, or be in the form of, any
> information storage device, method, or 1 or more electronic networks or
> databases** … provided that the records so kept can be **converted into clearly
> legible paper form within a reasonable time**, and, with respect to the stock
> ledger, that the records so kept (i) can be used to prepare the list of
> stockholders specified in §§ 219 and 220 of this title, (ii) record the
> information specified in §§ 156, 159, 217(a) and 218 of this title, and (iii)
> record transfers of stock as governed by Article 8 of subtitle I of Title 6."
>
> — [8 Del. C. § 224](https://delcode.delaware.gov/title8/c001/sc07/index.html)

so a spreadsheet qualifies. so does a database, and so does a distributed ledger —
`§ 224` was amended in 2017 to permit exactly that. **there is no prescribed
form.** what matters is that the four fields are present, the history is complete,
and it can be printed on demand.

> the practical consequence: *"we do not have a stock ledger"* is almost never a
> question of software. it is a question of whether anyone ever wrote the four
> fields down.

## 🚩 the common startup gap

a founder who incorporated through an automated formation service typically has:

| document | provides |
|----------|----------|
| certificate of incorporation | **authorized** shares, par value, classes |
| board consent + its exhibit | the initial issuance — holder, count, price, consideration |
| stock purchase agreement | the terms of that issuance |
| **stock ledger** | ❌ usually absent |
| stock certificates | ❌ often absent by design — see below |

the formation package documents the **transaction** and skips the **register**.
that is a real §219(c) gap, and it is nearly universal among solo-founder
Delaware corporations.

it compounds when the board elects **uncertificated** shares, which most modern
packages do. with no certificates, the ledger is the *only* record of ownership
that exists — precisely the case in which its absence hurts most.

⚠️ **the initial-issuance exhibit is not a ledger, even when it holds every
field.** it is a record of one authorized act at one moment. a ledger is a
standing register that every later issuance and transfer is entered into. the
exhibit is excellent **evidence for** the first ledger entry; it is not the
ledger.

### the fix is small

the four fields, on one page, with an entry per issuance. it makes the §219(c)
duty current, and it does so with no filing, no fee, and no state involvement —
the ledger is an internal record.

> ✅ **do it before you need it.** a ledger drafted in calm is a record. a ledger
> drafted the week an agency asks for it invites the question of when it was
> actually created.

## .why the registrator cares

registration creates the **capacity** to issue stock. the ledger is where the
exercise of that capacity is recorded. the two are the same subject seen at two
moments, so the ledger sits with the charter, not with general corporate
housekeeping.

concretely, it is the document that answers the one question the public record
cannot:

| number | public? | where it lives |
|--------|---------|----------------|
| **authorized** shares | ✅ yes — in the charter, on file with the state | certificate of incorporation |
| **issued** shares | ❌ no | **the stock ledger** |

that asymmetry is why an agency that needs an issued-share count has to ask the
corporation for it. see
`define.authorized-vs-issued-vs-outstanding-shares`.

## .see also

- `define.authorized-vs-issued-vs-outstanding-shares` — the three counts, and
  which one the ledger holds
- `delaware.franchise.tax.[howto].renew` — the franchise tax consequence: issued
  shares are an input to the Assumed Par Value method, and the ledger is the
  evidence behind them
- `howto.reinstate-void-delaware-corp` — where a share count gets contested

## .sources

every quote above was pulled with bhrowser and quoted from the rendered page,
per `rule.require.bhrowser-citations`. no summary tool was relied on.

| provision | publishers pulled | verification |
|-----------|-------------------|--------------|
| § 219(c) | delcode.delaware.gov (86,764 ch) · law.justia.com (21,276 ch) | ✅ equality test, 592 = 592, identical |
| § 220(b)(1) | delcode.delaware.gov · law.justia.com (29,065 ch) | both pulled |
| § 224 | delcode.delaware.gov · law.justia.com (19,812 ch) | both pulled |
| § 116(b)(2) | delcode.delaware.gov · law.justia.com (21,779 ch) | both pulled |

⚠️ an unsliced § 219(c) comparison reports 611 vs 2,943 chars: Justia renders the
section on one line from (a) onward. carve (c) from each and both are 592 chars,
byte-equal.
