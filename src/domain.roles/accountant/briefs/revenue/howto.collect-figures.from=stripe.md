# howto: collect revenue figures from Stripe, for Form 1120

> ## citation status, per section
>
> | section | status |
> |---------|--------|
> | the category reference | ✅ **bhrowser-verified** — 539KB page, ~45 categories read end to end |
> | `advance` / `advance_funding` | ✅ **bhrowser-verified**, quoted verbatim |
> | report sections, downloads, columns, date controls | 🚩 WebFetch — re-pull required |
> | 1099-K thresholds and location | 🚩 WebSearch — re-pull required |
> | IRS gross-vs-net quotes | 🚩 WebFetch — re-pull required |
>
> the 🚩 rows are leads until re-pulled. measured: a WebFetch of the category
> reference silently dropped categories that the bhrowser read found — among
> them `topup`, which is owner money, not revenue.

## .what

exactly which Stripe report to pull so a Form 1120 can be filled — and
which Stripe number is the wrong one to use.

## .why

Stripe surfaces several plausible "revenue" numbers. Only one belongs on
line 1a. The most convenient one (payouts — what hit the bank) is wrong,
and wrong in a way that costs money twice:

1. it **understates gross receipts** (already net of refunds), and
2. it **discards the Stripe fee deduction** (already net of fees).

---

## the steps

**3 downloads per tax year**, plus a 1099-K check.

### once, before you start

1. open <https://dashboard.stripe.com/reports/balance>
2. **Time zone** control at top → set to **your Stripe account's time zone**,
   *not* UTC. the tax year is a calendar year in local time. dates are
   inclusive, "from 12:00am on the start date through 11:59pm on the end
   date" ([Stripe][s-options]).
3. if a **Currency** selector appears, the account has more than one
   settlement currency — **stop and say so**, it changes the handoff.
4. if a **Connected accounts** dropdown appears, leave it on the platform
   account only.

### then, per tax year, oldest first

5. set the date range → custom → **Jan 1** to **Dec 31** of that year
6. click **Download** (upper right of each section) three times:

   | section | download | gives |
   |---------|----------|-------|
   | Balance summary | **Summary** | Dec 31 end balance → Sch L |
   | Balance change from activity | **Summary** | the declared per-year totals → reconcile target |
   | Balance change from activity | **Itemized** | the rows to compute from |

   skip the **Payouts** section entirely.

### the 1099-K check

7. go to the **Documents** section ("Compliance and documents") and look for
   a 1099-K for each tax year.
8. **if none exists, say so — that is a valid answer**, not a gap. see the
   threshold table below.
9. if one *does* exist, also export its **transaction log** (admin access,
   tax year 2023+) — that log is the best reconcile target available.

### handoff

10. hand the files over **untouched** — the same flow as the card statements.
11. **do not open them in Excel and re-save.** Excel silently reformats dates
    and can drop a zero off the front of an id or round an amount.

---

## the report: Balance summary → "Balance change from activity"

**direct url**: <https://dashboard.stripe.com/reports/balance>

that page carries three sections ([Stripe docs][s-balance]):

| section | use it? |
|---------|---------|
| **Balance summary** | open/close balances — for Schedule L |
| **Balance change from activity** | ✅ **this one** — charges, refunds, disputes, adjustments, fees, by category |
| **Payouts** | ❌ skip — "what hit the bank", the wrong question |

> "The **Balance change from activity** section provides a more detailed
> breakdown of your transactions by reporting category and includes all
> transactions except for payouts that affect your balance, including
> charges, refunds, disputes, other adjustments, and fees."
> — [Stripe, Balance summary report][s-balance]

set the period with "the controls at the top of the screen to select a
date range" ([Stripe][s-balance]) — **Jan 1 – Dec 31**, one run per year.

### pull BOTH downloads, not one

each section's **Download** button (upper right) offers two ([Stripe][s-balance]):

| download | what it is | role here |
|----------|-----------|-----------|
| **Summary** | "data in CSV format exactly as you see it in the Dashboard" | the **reconcile target** |
| **Itemized** | "the full list of individual transactions that are summarized in the Dashboard" | the **rows to compute from** |

the itemized rows are summed by a tested skill; the summary is Stripe's
declared total, so the sum is *proven* rather than trusted (as a card
statement's `Total New Charges` proves its parse). a summary alone would have
to be hand-transcribed, which `rule.forbid.hand-transcription` blocks.

### itemized columns that matter

from the [Balance report type reference][s-cols]:

| column | what it holds |
|--------|---------------|
| `gross` | "Gross amount of the transaction. Expressed in major units" |
| `fee` | "Fees paid for this transaction" |
| `net` | "Net amount of the transaction" |
| `reporting_category` | the category tag — what makes the split computable |
| `created_utc` | transaction date (`created` in v3/v7, timezone-aware) |
| `available_on_utc` | when funds became available — **not** what we want |

report type ids, if pulled via API instead of the dashboard
([Stripe][s-cols]): `balance_change_from_activity.itemized.1`–`.7`,
`balance_change_from_activity.summary.1`–`.2`, `balance.summary.1`.
itemized runs require `interval_start` and `interval_end`.

### the category values

relevant `reporting_category` values ([Stripe][s-cats]):

| category | consolidates | → 1120 |
|----------|--------------|--------|
| `charge` | `charge` + `payment` | line 1a |
| `refund` | `refund` + `payment_refund` | line 1b |
| `partial_capture_reversal` | uncaptured auth reversals | line 1b |
| `dispute` | chargebacks (split out from `adjustment`) | line 1b |
| `fee` | `stripe_fee` + fee adjustments | line 26 |
| `advance` / `advance_funding` | Instant Payout settlement dates | **none** |

> `reporting_category` offers "a more useful grouping for most finance and
> reporting purposes" than the raw `type` field. — [Stripe][s-cats]

`advance` / `advance_funding` are **not income and not expense** — verbatim
from Stripe's reference ([bhrowser-verified][s-cats]):

> **advance** — "Incrementing funds as part of an advance operation to
> change the date that funds settle to your balance. For example, this can
> occur when you create an instant payout and the requested payout amount
> is greater than your available balance. Funds are credited to a new
> `available_on` date and debited from the original `available_on` date to
> cover the difference."

> **advance_funding** — "Decrementing funds as part of an advance
> operation…" *(identical otherwise)*

an increment paired with a decrement — the pair nets to zero. they reach no
1120 line.

### ⚠️ `topup` is owner money, NOT revenue

> **topup** — "Funds you transferred into your Stripe balance from your
> bank account." ([bhrowser-verified][s-cats])

if this ever appears in an export, it must **never** reach line 1a. it is a
capital contribution or a loan from the owner, not a sale. `stripe.tally`
maps it to `--` explicitly for that reason.

### the full category set

the reference carries **~45 categories** across five groups: payments,
balance, Issuing, Connect, and Stripe fee credits. `stripe.tally` maps
those that can be placed from the doc text and **halts on any it cannot**,
rather than guess. categories deliberately left for a human include
`platform_earning`, `contribution`, `reward`, `revenue_share`,
`other_adjustment`, `currency_conversion`, and the `climate_*` family.

### ⚠️ `activity_gross` is NOT line 1a

the Balance summary's `activity_gross` is labeled "Account activity before
fees" — **before fees, but already net of refunds and disputes**. so it
equals line **1c**, not 1a.

| summary row | what it actually is |
|-------------|---------------------|
| `activity_gross` | line **1c** (charges − returns), pre-fee |
| `activity_fee` | line **26** — and it holds BOTH fee sources below |
| `activity` | `activity_gross − activity_fee` |

line 1a is the `charge` category alone. read `activity_gross` as 1a and
gross receipts are understated by every refund and chargeback in the year.

### ⚠️ Stripe fees hide in TWO places

a `charge` row carries its per-transaction fee in the **`fee` column** (illustrative rows):

```
gross 100.00 | fee 3.20 | net  96.80    reporting_category = charge
```

but Stripe also emits **standalone `fee` rows**, where the cost sits in
**`gross` as a negative** and the `fee` column reads `0.00`:

```
gross -25.00 | fee 0.00 | net -25.00    reporting_category = fee
                                        "Identity Document Check"
```

sum only the `fee` column and every Identity / Billing / Issuing charge
vanishes from the deduction.

Stripe confirms this treatment itself: its `activity_fee` equals the `fee`
column **plus** the standalone-fee gross, and its `activity_gross` excludes
that gross. so a standalone fee row is a *fee*, not negative revenue.

### currency is already handled

the itemized export shows "all transactions in your settlement currency
(after any foreign currency conversion)" ([Stripe][s-balance-rpt]) — so
multi-currency needs no separate adjustment.

---

## why fees go on line 26, not against line 1a

Form 1099-K box 1a is gross:

> "**Gross amount** means the total dollar amount of total reportable
> payment transactions for each participating payee **without regard to
> any adjustments for credits, cash equivalents, discount amounts, fees,
> refunded amounts, shipping amounts, or any other amounts**."
> — [IRS, Instructions for Form 1099-K][irs-inst]

and on what to do about it:

> "Those items are **not income**. Taxpayers can **deduct those items from
> the gross amount** when including the income on their tax return."
> — [IRS, Form 1099-K guidance][irs-understand]

so:

```
customer paid          $100.00   -> line 1a   (gross)
stripe kept              $3.20   -> line 26   (deduction)
landed in bank          $96.80   -> line 1a if you use payouts (WRONG)
```

both routes reach the same taxable income **only if** the fee is separately
deducted. report $96.80 *and* deduct $3.20 → deducted twice. report $96.80
and omit the deduction → gross receipts understated, which breaks the
1099-K match below.

**report gross, deduct fees.**

---

## the 1099-K cross-check — but it may not exist

if Stripe issued a 1099-K for a year, **that document is the anchor** and
line 1a should tie to it.

but a 1099-K is threshold-gated, and the federal threshold **moved every
year** in this window ([Stripe][s-1099k], [Stripe][s-1099k-new]):

| tax year | threshold | both conditions? |
|----------|-----------|------------------|
| 2023 | > $20,000 gross **and** > 200 transactions | yes — both |
| 2024 | $5,000 gross (US accounts) | volume only |
| 2025 | > $20,000 gross **and** > 200 transactions | yes — both |

so **absence of a 1099-K is not evidence of low revenue** — a year can
clear $20k on few transactions and still get no form. do not treat an
absent form as a reconcile failure.

**where to find it**: the **Documents** section of the dashboard
("Compliance and documents"), available by January 31 ([Stripe][s-1099k]) —
*not* under settings.

from tax year 2023 on, admins can also export the **transaction log** behind
each form — "a transaction log lists the Stripe transactions that have
contributed to a form's total" ([Stripe][s-1099k]). that log is the ideal
reconcile target when a form exists.

---

## .note = cash basis vs accrual

on cash basis a sale counts when the charge settled. the IRS is explicit
that 1099-K amounts are dated per transaction:

> "The dollar amount of each transaction is determined on the **date of the
> transaction**." — [IRS, Instructions for Form 1099-K][irs-inst]

that is the `created_utc` column, **not** `available_on_utc`. it also
matches how the card side buckets by charge date — keep the two consistent.

if the corp elected accrual, revenue counts when earned, and a
by-charge-date figure needs adjustment for prepaid/deferred amounts. flag
that before you lean on it.

---

## .the handoff

one row per tax year:

| year | gross (`charge`) | refunds+disputes | fees | Dec 31 balance | 1099-K |
|------|-----------------:|-----------------:|-----:|---------------:|-------:|
| YYYY | | | | | |

with that plus the card-expense tally, every line of the 1120 is
determined.

---

## .sources

| ref | source |
|-----|--------|
| s-balance | [Stripe — Balance summary report](https://docs.stripe.com/reports/balance) |
| s-balance-rpt | [Stripe — Balance report](https://docs.stripe.com/connect/supported-embedded-components/balance-report) |
| s-cols | [Stripe — Balance report type](https://docs.stripe.com/reports/report-types/balance) |
| s-cats | [Stripe — Reporting categories and types](https://docs.stripe.com/reports/reporting-categories) |
| s-1099k | [Stripe — 1099-K tax forms](https://support.stripe.com/questions/1099-k-tax-forms) |
| s-1099k-new | [Stripe — What's new for the 2025 tax season](https://support.stripe.com/questions/whats-new-for-the-2025-tax-season) |
| irs-inst | [IRS — Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k) |
| irs-understand | [IRS — Understanding your Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k) |
| s-options | [Stripe — Report options](https://docs.stripe.com/reports/options) |
| s-advance | [Stripe — Instant Payouts with advance funding](https://docs.stripe.com/payouts/instant-payouts-with-advance-funding) |

[s-balance]: https://docs.stripe.com/reports/balance
[s-balance-rpt]: https://docs.stripe.com/connect/supported-embedded-components/balance-report
[s-cols]: https://docs.stripe.com/reports/report-types/balance
[s-cats]: https://docs.stripe.com/reports/reporting-categories
[s-1099k]: https://support.stripe.com/questions/1099-k-tax-forms
[s-1099k-new]: https://support.stripe.com/questions/whats-new-for-the-2025-tax-season
[irs-inst]: https://www.irs.gov/instructions/i1099k
[irs-understand]: https://www.irs.gov/businesses/understanding-your-form-1099-k
[s-options]: https://docs.stripe.com/reports/options
[s-advance]: https://docs.stripe.com/payouts/instant-payouts-with-advance-funding

> **provenance**: report names, section names, column names, category
> values, download options, and 1099-K thresholds are all quoted from the
> sources above (retrieved via bhrowser). the dashboard url is Stripe's own.
> **not verified against this account** — if the screen disagrees, the
> screen wins and this brief is stale.

## .see also

- `skills/stripe.tally` — **computes these figures from the exports above**,
  and reconciles against the summary's own declared totals. run it rather
  than read numbers off the dashboard by eye.
- `income-tax/federal/howto.file-form-1120.md` — where these land
- `deductions/catalog.deductible-expenses.md` — the expense side
- `skills/statement.tally` — the card-expense side of the same return
