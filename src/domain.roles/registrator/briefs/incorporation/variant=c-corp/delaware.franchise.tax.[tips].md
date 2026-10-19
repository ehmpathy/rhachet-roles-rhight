# delaware.franchise.tax.[tips]

## .what

practical tips for Delaware franchise tax, especially for startups with few assets, no issued shares, or no profit.

---

## .key insight: not a profit tax

Delaware franchise tax is **not based on income or profit**.

> "Delaware Franchise Tax is not a business tax based on profit. It is a legal maintenance fee for the privilege of having a Delaware entity."
>
> — [Kruze Consulting](https://kruzeconsulting.com/blog/what-is-delaware-franchise-tax/)

| scenario | franchise tax owed |
|----------|-------------------|
| profitable company | yes |
| unprofitable company | yes |
| company with no revenue | yes |
| company with no customers | yes |
| inactive company | yes |

if you exist in Delaware, you owe the tax.

---

## .tip: ignore the scary bill

Delaware **always** mails a bill based on the Authorized Shares Method. how
scary that bill is depends entirely on the authorized share count:

| authorized shares | the bill Delaware mails |
|------------------:|------------------------:|
| 10,000,000 — the standard startup charter | **$85,165.00** |
| 20,000,000 | **$170,165.00** |
| 23,510,000 and above | **$200,000.00** — the statutory maximum |

⚠️ state the share count beside every bill figure — "$170,000+" belongs to a
20,000,000-share charter, not the 10,000,000 most startups authorize.

**do not panic. do not pay this amount.**

> "No, You Don't Owe Delaware $200,000."
>
> — [Mintz](https://www.mintz.com/insights-center/viewpoints/2911/2026-02-13-no-you-dont-owe-delaware-200000-de-franchise-tax-101)

### what to do instead

1. go to the payment page: [corp.delaware.gov/paytaxes](https://corp.delaware.gov/paytaxes/)
2. select **Assumed Par Value Method** (not Authorized Shares)
3. enter your gross assets and issued shares
4. the page recalculates your actual tax owed
5. pay the recalculated (much lower) amount

### ⚠️ "you do not need to call Delaware" holds ONLY for a current, good-standing year

the self-service page recalculates **the year it is open for**. it is the
right and cheap path when you are current.

it is **not** the path when any of these is true:

| your situation | the page cannot do it |
|----------------|-----------------------|
| the charter is **void** | revival is a filing, not a payment |
| the year is **delinquent** | back years are settled with the Division, not the page |
| **zero** issued shares or **zero** gross assets | Delaware routes these to a specialist — see the tip below |
| you dispute an **assessment** | §505 resettlement is a request to the Secretary of State |

see `casestudy.delaware-franchise-recalculation-runaround.md` — a recalculation
the self-service page could not reach took **months of calls**.

phone: **(302) 739-3073, option 3** — the Franchise Tax group.

---

## .tip: use assumed par value method

for most startups, the Assumed Par Value Capital Method yields far lower tax.

| method | calculates based on | minimum | best for |
|--------|---------------------|---------|----------|
| authorized shares | shares authorized in charter | $175 | few authorized shares (≤5,000) |
| assumed par value | gross assets ÷ issued shares | $400 | many authorized shares, few assets |

> "In most early-stage startup cases with millions of authorized shares but very limited assets (under several million dollars), the Assumed Par Value Capital Method provides the lowest possible tax."
>
> — [Kruze Consulting](https://kruzeconsulting.com/blog/what-is-delaware-franchise-tax/)

### ⛔ do NOT compute this by hand — the role ships a calculator

```sh
rhx franchise.tax.delaware \
  --authorized 10000000 --par 0.0001 --issued 5000000 --assets 500000
```

it prints all six statutory steps with their §503 cites, so the figure can
be laid beside [corp.delaware.gov/frtaxcalc](https://corp.delaware.gov/frtaxcalc/)
line for line — which is what makes it defensible in a §505 petition
(`rule.forbid.hand-computed-figures`).

### ⛔ the common three-line formula is INCOMPLETE

```
assumed par = gross assets ÷ issued shares
assumed capital = assumed par × authorized shares      ⛔ STEP 2 ONLY
tax = (assumed capital ÷ 1,000,000) × $400
```

**§503(a)(2) step 2** applies only to shares whose **stated par is BELOW the
assumed par**. shares at or above it keep their stated par, under **step 3**:

| your stated par vs the assumed par | which value the share carries |
|------------------------------------|-------------------------------|
| stated par **below** assumed par | the **assumed** par (step 2) |
| stated par **at or above** it | its own **stated** par (step 3) |

the omitted branch understates the tax on exactly the charters that owe more
than the minimum. on the example charter below, at a **$0.50** stated par the
real tax is **$2,000** — the three-line formula returns $400, a **5×
underpayment**, on a return that is signed.

### example: typical seed-stage startup

| data | value |
|------|-------|
| authorized shares | 10,000,000 |
| issued shares | 5,000,000 |
| gross assets | $500,000 |
| **stated par value** | **$0.0001** |

⚠️ **the par value is not optional** — without it the answer cannot be
reproduced. state your charter's par, and run the calculator.

| method | tax |
|--------|-----|
| authorized shares §503(a)(1) | **$85,165.00** / year |
| assumed par value §503(a)(2) | **$400.00** / year |

use assumed par value: **$400** vs **$85,165** — a $84,765 difference per year.

⚠️ that $400 holds for **this** charter at **this** par. at a $0.50 stated
par the identical share counts and assets produce **$2,000**. run it.

---

## .tip: zero or few issued shares

if your startup has not yet issued shares (or issued very few), the standard calculator may not work.

> "If your startup has zero gross assets and/or no issued shares, you should contact Franchise Tax at (302) 739-3073, option 3 for special assistance in calculating your tax liability."
>
> — [Delaware Division of Corporations](https://corp.delaware.gov/taxfaq/)

| scenario | action |
|----------|--------|
| zero issued shares | call (302) 739-3073, option 3 |
| zero gross assets | call (302) 739-3073, option 3 |
| very few issued shares | run both methods, use lower |

in practice, most pre-seed startups with minimal assets owe the $400 minimum.

---

## .tip: know your gross assets

"gross assets" for the Assumed Par Value method = total assets from your balance sheet (Schedule L of Form 1120).

| includes | excludes |
|----------|----------|
| cash | liabilities |
| accounts receivable | equity |
| equipment | accumulated depreciation (some methods) |
| investments | — |

accurate gross assets = accurate tax calculation = no overpayment.

---

## .tip: plan authorized shares before formation

> "Authorizing excessive shares of stock can result in a higher annual franchise tax liability."
>
> — [BALL PLLC](https://ballpllc.com/understanding-delawares-franchise-tax-system-for-c-corporations-calculation-methods-compliance-and-startup-best-practices/)

before incorporation, estimate franchise tax under both methods for your planned share structure.

| authorized shares | franchise tax (authorized method) |
|-------------------|----------------------------------|
| ≤ 5,000 | $175.00 |
| 5,001 – 10,000 | $250.00 |
| **above 10,000** | **$250 + $85 per additional 10,000 shares or FRACTION thereof** |
| 100,000 | $1,015.00 |
| 10,000,000 | **$85,165.00** |
| **23,510,000 and above** | **$200,000.00 — the statutory maximum** |

- the `$85 per 10,000` increment runs unbroken to the cap, not only to 100,000
- ⚠️ **"or fraction thereof" rounds UP.** 10,001 shares costs the same as 20,000 ($335)
- the **$200,000 maximum** is first reached at 23,510,000 authorized shares
- every figure here comes from `rhx franchise.tax.delaware` (`rule.forbid.hand-computed-figures`)

startups typically authorize 10M shares for option pool flexibility — but
use assumed par value method to pay $400.

---

## .tip: file on time

the **annual report** is due **March 1**. the **tax** may not be: once the
year's **estimated** liability reaches **$5,000**, 8 Del. C. §504(a) moves it
onto four installments, the first on **June 1 of the tax year itself**. the
threshold is measured on the estimate, and Delaware bills a 10M-share charter
$85,165 by default — so this binds even a corporation that will elect assumed
par value.

- the installment table, the §502(c) / §504(c) late charges, and the reminder
  dates: `delaware.franchise.tax.[howto].renew.md` § *⚠️ March 1 is the whole
  answer only BELOW $5,000* and § *.late payment*
- the **1-year** §510 void and the §511 repeal: `delaware.franchise.tax.delinquency.md`
- accrue penalty + interest per installment with `rhx franchise.tax.delaware.accrue`;
  a single-date accrual understates, and §504(c)'s "or portion thereof" rounds **UP**

set a calendar reminder for **February 1** for the report — and, if your
estimated tax is $5,000 or more, one for **May 1** as well.

---

## .tip: if voided for tax delinquency

if your corp was voided, you'll see a scary balance (potentially $100K+). same rule applies:

1. go to payment page: [corp.delaware.gov/paytaxes](https://corp.delaware.gov/paytaxes/)
2. select **Assumed Par Value Method**
3. enter gross assets and issued shares for each delinquent year
4. page recalculates back taxes owed
5. pay recalculated amount + penalties + interest
6. file a Certificate of Revival — **$189**

### the revival fee

> "The fee to file the Certificate is **$189.00**."
> — `rev. 08/2023`, [`corpfiles.delaware.gov/Corp_Forms/Revival%20void.pdf`](https://corpfiles.delaware.gov/Corp_Forms/Revival%20void.pdf)

- confirmed against the live [fee schedule](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf) (rev. 2026-08-01): `Revival (plus taxes to renew) $189.00` · also `Revival (exempt) $5.00`
- ⛔ a constructed url (`renewalvoid16.pdf`) resolves to a stale `rev. 08/16` form that says `$169.00`. harvest the form from `/corpforms/`, never guess it — `rule.forbid.guessed-urls`

### do taxes stop when voided?

neither "suspended" nor "exposed": the tax is imposed throughout (§501(a),
§502(a) carry no void carve-out), and **8 Del. C. §312(g)** caps the
**revival price** at the balance due on the void date. the exposure is dormant,
not extinguished — a §204 validation re-opens it.

the quotes, the 5-year alternative, and the §513 criminal exposure:
`howto.reinstate-void-delaware-corp.md` § *.the good news*. the number you pay
still comes from the Secretary of State, who may resettle under §505(c).

**if the payment page does not allow recalculation for back taxes:** call
**(302) 739-3073, option 3**.

---

## .tip: use the official calculator

Delaware provides a calculator to compare both methods:

[https://corp.delaware.gov/taxcalc/](https://corp.delaware.gov/taxcalc/)

enter:
- total authorized shares
- total issued shares
- total gross assets

the calculator shows both methods. pay the lower amount.

### ⭐ and run the role's own calculator beside it

```sh
rhx franchise.tax.delaware \
  --authorized <n> --par <p> --issued <n> --assets <n> --years <n>
```

it does what the state page cannot:

| it emits | why that matters |
|----------|------------------|
| all **six §503(a)(2) steps**, cited | the figure can be laid beside the state page line for line — a bare total cannot be checked |
| the **sensitivity band** | "how far can my gross-assets figure move before the tax RISES?" — the question the clerk probes |
| a **refusal**, not a guess, on no-par stock, zero issued shares, or a multi-class charter | Delaware routes those to a specialist; a number emitted there would be confidently wrong |

`rhx franchise.tax.delaware.accrue` does the same for penalty and interest,
per installment, with its §502/§504 cites.

---

## .summary for startups

| situation | likely tax | method |
|-----------|------------|--------|
| ≤5,000 authorized shares | $175 | authorized shares |
| many authorized, few issued, few assets | $400 | assumed par value |
| many authorized, many assets | run the calculator | whichever is lower |
| **stated par at or above the assumed par** | **above $400** — step 3 fires | run the calculator |
| zero issued shares | call Delaware | special handling |
| unprofitable | same as above | profit irrelevant |

---

## .provenance

every figure on this page is produced by `rhx franchise.tax.delaware`, per
`rule.forbid.hand-computed-figures`. the deadline, penalty, and interest rows
cite **8 Del. C. §502(c), §504(a), §504(c), §510** directly.

⚠️ **what is still open** on this page:

| gap | status |
|-----|--------|
| the **$200,000 maximum** | taken from the calculator, which encodes it; the statute was not pulled for this page |
| **Large Corporate Filer** status | not addressed here at all; it raises the maximum for some filers |

---

## .sources

- [Delaware Division of Corporations: Franchise Tax FAQ](https://corp.delaware.gov/taxfaq/)
- [Delaware Division of Corporations: Tax Calculator](https://corp.delaware.gov/taxcalc/)
- [Kruze Consulting: Delaware Franchise Tax Simplified](https://kruzeconsulting.com/blog/what-is-delaware-franchise-tax/)
- [Mintz: No, You Don't Owe Delaware $200,000](https://www.mintz.com/insights-center/viewpoints/2911/2026-02-13-no-you-dont-owe-delaware-200000-de-franchise-tax-101)
- [Clerky: How to Calculate Delaware Franchise Tax](https://help.clerky.com/article/2796-calculate-delaware-franchise-tax)
- [BALL PLLC: Delaware Franchise Tax Best Practices](https://ballpllc.com/understanding-delawares-franchise-tax-system-for-c-corporations-calculation-methods-compliance-and-startup-best-practices/)
