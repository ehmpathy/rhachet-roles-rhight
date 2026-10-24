# delaware.franchise.tax.[howto].renew

## .what

how to pay the annual Delaware franchise tax and file the annual report.

---

## .due date

| entity type | due date |
|-------------|----------|
| corporation | March 1 |
| LLC / LP / GP | June 1 |

the annual report and franchise tax payment are submitted together.

### ⚠️ March 1 is the whole answer only BELOW $5,000

once the year's liability is estimated at **$5,000 or more**, 8 Del. C.
§504(a) puts most of the tax on **installments during the tax year
itself**:

| §504(a) | due | portion |
|---|---|---|
| (1) | **June 1 of the tax year** | 40% |
| (2) | **September 1 of the tax year** | 20% |
| (3) | **December 1 of the tax year** | 20% |
| (4) | March 1 following | the remainder |

- the worked example below bills **$85,165.00** under method A — seventeen times the threshold
- a reader who calendars March 1 for that figure has already missed **three installment dates**, the first **nine months earlier**
- ⇒ **compute the tax first**, then pick the due date the figure points at

---

## .step-by-step: online payment

### step 1: gather information

you will need:
- Delaware file number (7 digits)
- corporation name (exact match)
- total gross assets (for assumed par value method)
- total issued shares (for assumed par value method)

### step 2: access the portal

go to: [https://corp.delaware.gov/paytaxes/](https://corp.delaware.gov/paytaxes/)

### step 3: look up your entity

enter your Delaware file number or search by entity name.

### step 4: review the calculated tax

Delaware displays the tax via the Authorized Shares Method.

**important**: Delaware bills the Authorized Shares Method by default. if
your corporation has many authorized shares but few issued, the Assumed
Par Value Method is usually far lower — and the state does not volunteer
it. **8 Del. C. § 503(a) + § 503(b)** give you the election (§ 503(c) is only
the cap and floor).

§ 503(a) makes the tax *"whichever of the applicable amounts prescribed by
paragraphs (a)(1) and (a)(2) of this section is the **lesser**"*. § 503(b) is
the condition you must meet to have (a)(2) available at all:

> "**Unless** a corporation shall submit to the Secretary of State, **at the time
> of filing its annual franchise tax report**, a statement setting forth the
> number of shares of each class of stock actually issued, if any, and the amount
> of the total gross assets of the corporation, as of the nearest date on which
> the amount is obtainable … **it shall pay a franchise tax for such year computed
> in the manner prescribed by paragraph (a)(1) of this section.**"
>
> — 8 Del. C. § 503(b), https://delcode.delaware.gov/title8/c005/index.html
> · bytes at `refs/de-title8-ch5-franchise-tax.txt`

🚨 **read the failure mode, not the requirement.** § 503(b) does not *reject* an
incomplete statement. it **silently re-prices you** at the Authorized Shares
method — which is the expensive one, and the one the state bills by default.

⛔ **do not compute it by hand.** the assumed-par-value method has a
branch that is easy to take the wrong way, and a round-up that is easy to
read as a round-down. this role ships a tested calculator that prints
every statutory step:

```sh
rhx franchise.tax.delaware --authorized 10000000 --par 0.0001 \
  --issued 1000000 --assets 500000
```

it prints **both** methods, names which one governs, and states the
gross-assets range over which the answer holds — so a later revision to
the assets figure does not need a re-run to be safe.

cross-check against the official calculator:
[https://corp.delaware.gov/taxcalc/](https://corp.delaware.gov/taxcalc/)

### step 5: enter financial data (if lower method)

if you use Assumed Par Value Capital Method, enter:
- total gross assets (from Schedule L of Form 1120)
- total issued shares

### step 6: pay

| payment method | accepted |
|----------------|----------|
| credit card | yes (fee applies) |
| ACH / e-check | yes |

you will receive a confirmation number.

---

## .calculation: which method is cheaper

### authorized shares method

| shares authorized | tax |
|-------------------|-----|
| ≤5,000 | $175 |
| 5,001–10,000 | $250 |
| each additional 10,000 | +$85 |
| maximum | $200,000 |

### assumed par value capital method

⛔ **do not compute from the table below.** it is §503(a)(2) **step 2
only** — it omits the branch on **stated par**, and the omission
understates. run the calculator instead:

```sh
rhx franchise.tax.delaware --authorized 10000000 --par 0.0001 \
  --issued 1000000 --assets 500000
```

| step | formula | ⚠️ |
|------|---------|----|
| 1 | assumed par = gross assets ÷ issued shares | ✅ |
| 2 | assumed capital = assumed par × authorized shares | ⛔ **only for shares whose STATED par is BELOW the assumed par**; shares at-or-above keep their **own** stated par |
| 3 | tax = (assumed capital ÷ 1,000,000) × $400 | ⚠️ rounds **UP** — §503(a)(2) charges $400 per $1,000,000 "or fraction thereof" |
| minimum | $400 | ✅ |
| maximum | $200,000 | ✅ |

`delaware.franchise.tax.purpose.md` carries the branch table and a
measured **2× understatement** the step-2-only form produces.

### example

⚠️ without a **stated par value** the assumed-par-value method has no
determinate answer — steps 2 and 3 split the authorized shares by how their
stated par compares against the assumed par.

| data | value |
|------|-------|
| authorized shares | 10,000,000 |
| **stated par value** | **$0.0001** |
| issued shares | 1,000,000 |
| gross assets | $500,000 |

```
├─ method A · authorized shares  §503(a)(1)
│  └─ $85,165.00 / year
│
├─ method B · assumed par value  §503(a)(2)
│  ├─ 1. assumed par = $500,000.00 ÷ 1,000,000 = $0.500000
│  ├─ 2. authorized w/ par BELOW assumed  = $5,000,000.00
│  ├─ 3. authorized w/ par AT-OR-ABOVE it = $0.00
│  ├─ 4. assumed par value capital = $5,000,000.00
│  ├─ 5. $400 per $1,000,000 or fraction
│  └─ 6. $2,000.00 / year  (min $400, max $200,000)
│
├─ governs: assumed-par-value  →  $2,000.00 / year
└─ vs method A = $83,165.00 avoided
```

**use assumed par value: $2,000.00, against $85,165.00.**

⚠️ step 3 is $0.00 here only because par is low: every share at $0.0001 sits
below the $0.50 assumed par. raise stated par to **$1.00** on the same facts and
step 3 carries the whole capital — **$4,000.00**, twice this answer.

---

## .what you receive

after payment:
- confirmation email
- annual report is filed automatically
- you may request a Certificate of Good Status

---

## .reminders

| action | recommendation |
|--------|----------------|
| calendar reminder | set for February 1 — ⚠️ **and May 1, if the tax is ≥ $5,000** |
| registered agent | many send reminders |
| bookkeep software | may integrate with Delaware |

⚠️ at $5,000+ March 1 is the last of four dates; the June 1 entry matters most,
since no other party prompts it.

---

## .late payment

if you miss a due date:

| charge | amount | statute |
|--------|--------|---------|
| penalty | **$200** | [8 Del. C. §502(c)](https://delcode.delaware.gov/title8/c005/index.html) |
| interest | **1.5% per month** on tax and penalty | [8 Del. C. §504(c)](https://delcode.delaware.gov/title8/c005/index.html) |
| void charter | after **1 year** unpaid, **or** on any unfiled complete annual report | [8 Del. C. §510](https://delcode.delaware.gov/title8/c005/index.html) |
| repealed charter | the same 1-year delinquency, reported to the Governor by **June 30** | ⭐ [8 Del. C. §511](https://delcode.delaware.gov/title8/c005/index.html) |

⚠️ the void trigger is **1 year**, not "two consecutive years" — `two years` /
`consecutive` return **0** hits across ch. 5. §510 also makes the **November 30
notice mandatory** and gives the Secretary of State a good-cause extension. see
`delaware.franchise.tax.delinquency.md`.

⚠️ **"if you miss March 1" is the wrong frame above $5,000.** §504(c) runs
interest from **each** §504(a) due date, so a corporation that pays the
whole balance on March 1 of the following year has already accrued nine
months of interest on the June 1 installment. a single-date accrual
understates, and the gap widens with the assessment.

⛔ **do not derive the penalty and interest by hand** — the accrual has a
per-installment structure and a per-year penalty that compound
awkwardly. this role ships `franchise.tax.delaware.accrue`, which prints
every installment with its due date and month count, so the total can be
checked against §504 line by line.

see `delaware.franchise.tax.delinquency.md` for recovery steps.

---

## .sources

### the statute

- [8 Del. C. §502](https://delcode.delaware.gov/title8/c005/index.html) — the annual report, and the $200 penalty for late filing
- [8 Del. C. §503](https://delcode.delaware.gov/title8/c005/index.html) — the two methods, the taxpayer's election, and "gross assets" per (i)
- [8 Del. C. §504](https://delcode.delaware.gov/title8/c005/index.html) — due dates, the $5,000 installment threshold, interest
- ⭐ [8 Del. C. §510](https://delcode.delaware.gov/title8/c005/index.html) — the **1-year** void, the good-cause extension, the mandatory Nov 30 notice, the March 1 cure date
- ⭐ [8 Del. C. §511](https://delcode.delaware.gov/title8/c005/index.html) — charter **repeal** by gubernatorial proclamation, on the same 1-year trigger, reported by June 30

### the agency

- [Delaware Division of Corporations: Pay Taxes](https://corp.delaware.gov/paytaxes/)
- [Delaware Franchise Tax Calculator](https://corp.delaware.gov/taxcalc/)
- [Delaware Annual Report Instructions](https://corp.delaware.gov/frtax/)

---

## .provenance

every figure on this page is produced by `rhx franchise.tax.delaware`,
per `rule.forbid.hand-computed-figures`. the command is shown beside the
worked example.

### 🚩 open gaps

| claim | status |
|-------|--------|
| the §502 / §503 / §504 links | ⚠️ **link-level, not quote-level.** no subsection text has been pulled into this file; the tables restate the calculator's inline cites, which is a second-hand read |
| the §510 / §511 rows | ✅ **quote-level.** a whole-chapter pull; §510 cross-verified against Justia at **1,358 = 1,358, agree: true** |
| "payment processed in 1–3 business days", and the portal's hours | ⚠️ **uncited.** operational detail that moves without notice; confirm at the portal |
| the $200 penalty as a **flat, once-per-year** charge | ⚠️ stated as such across this repo, but the per-year multiplication has not been read off §502(c) directly |
