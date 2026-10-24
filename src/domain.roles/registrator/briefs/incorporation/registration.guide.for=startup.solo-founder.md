# registration.guide.for=startup.solo-founder

## .what

guidance for solo founders who want minimal cost and complexity for their Delaware C-corp registration.

---

## .the situation

you're a solo founder. no co-founders, no investors, no employees yet. you incorporated in Delaware because "that's what startups do" — and you carry 10 million authorized shares you don't need.

> ⚠️ **Delaware invoices $85,165.00 on a 10,000,000-share charter by default.**
> the $400 figure applies only if you elect assumed-par-value **every year** —
> the election is a thing you must do, not a rate you are on.
>
> ```sh
> rhx franchise.tax.delaware --repo rhight --role accountant \
>   --authorized 10000000 --par 0.00001 --issued 8000000 --assets 0
> #   ├─ method A · authorized shares  §503(a)(1)  →  $85,165.00   ⬅️ invoiced
> #   └─ method B · assumed par value  §503(a)(2)  →  $400.00      ⬅️ elected
> ```

---

## .the insight

**you don't need millions of shares.**

most startups authorize 10M shares for:
- option pools (employee equity)
- multiple funding rounds
- complex cap tables

if it's just you, none of that applies yet.

---

## .the recommendation

### authorize ≤5,000 shares → pay $175/year

| authorized shares | franchise tax | ✅ computed |
|-------------------|---------------|---|
| ≤5,000 | **$175.00** | `--authorized 5000 --par 0.00001 --issued 5000 --assets 0` |
| 5,001–10,000 | **$250.00** | `--authorized 10000 --par 0.00001 --issued 5000 --assets 0` |
| 10,000,000 | **$400.00** via assumed par value — ⚠️ **only if you elect it**; Delaware invoices **$85,165.00** by default | `--authorized 10000000 --par 0.00001 --issued 8000000 --assets 0` |

every figure from `rhx franchise.tax.delaware --repo rhight --role accountant`.

for a solo founder with no investors:
- authorize 1,000 shares
- issue all 1,000 to yourself
- pay **$175.00**/year in tax

| your posture at 10M shares | the tax |
|---|---:|
| you elect assumed-par-value **every year** | **$400.00** |
| you pay what Delaware **invoices** | **$85,165.00** |
| after the amendment to 5,000 shares | **$175.00** |

⭐ **the durable benefit is not a subtraction.** at 5,000 shares the
authorized-shares method is *already* the lesser, so **$175.00 is what Delaware
invoices by default** — the amendment retires the yearly election, not merely
the difference.

⚠️ **`$175.00` is the TAX, not the bill.** a non-exempt domestic corporation
also owes the **$50** annual report fee, so the annual cost floor is **$225** —
a *cost* that collides numerically with the $400→$175 *delta*. see
`variant=c-corp/define.authorized-vs-issued-vs-outstanding-shares.md`.

---

## .already filed with millions of shares?

you can amend down.

### how to reduce authorized shares

1. **board resolution** — document the decision to reduce authorized shares
2. **file Certificate of Amendment** — submit to Delaware Division of Corporations
3. **pay filing fee** — **$214.00** base, ⚠️ *varies with stock*

> ```
> Amendment      *$214.00     $50.00     $200.00     $100.00
> ...
> *VARIES BASED ON STOCK
> ```
> — [DE Division of Corporations, Fee Schedule, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf)

⚠️ **authority: 8 Del. C. §242** governs amendment of the certificate of
incorporation; the fee schedule's `Amendment` row corroborates the filing
exists. 🚩 §242 has not been pulled — check it rather than rely on a quote.
`corp.delaware.gov/howtoform/` does **not** cover amendments (pulled 2026-08-31:
"amendment" appears zero times), so do not cite it for this.

### constraints

- cannot reduce below issued shares
- if you issued 100 shares to yourself, you can authorize as few as 100
- typical: reduce from 10M to 5,000 authorized

### example

| before | after |
|--------|-------|
| 10,000,000 authorized | 5,000 authorized |
| 100 issued to founder | 100 issued to founder |
| $400/year franchise tax — ⚠️ **only if you elect assumed-par-value each year**; Delaware invoices **$85,165.00** on this charter by default | **$175.00/year franchise tax**, which is what Delaware invoices by default at 5,000 shares |
| — | ⚠️ the **$50** annual report fee is owed on **both** sides, so it cancels here and does **not** cancel from your bill |
| — | **$214.00** amendment fee (one-time), ⚠️ *varies with stock* |

### the payback

| input | figure | source |
|-------|--------|--------|
| amount saved per year, **if you elect assumed-par-value every year** | **$225.00/yr** — $400 → $175 | see the tax table above |
| amount saved per year, **if you pay what Delaware invoices** | **$84,990.00/yr** — $85,165 → $175 | ⚠️ hand-subtracted from two computed figures; run the calculator for your own charter |
| one-time amendment fee | **$214.00** | DE fee schedule, `Amendment` row |

⚠️ even in the smaller case, **the one-time fee is recovered inside year one** —
slightly less than one year of savings. worth the spend; not urgent to the week.

---

## .do you even need a C-corp?

for a solo bootstrapped business, consider whether a C-corp is the right structure.

| structure | annual cost | taxation | compliance |
|-----------|-------------|----------|------------|
| Delaware corporation | ⚠️ **$85,165** by default at a 10M-share charter; **$400** if you elect assumed-par; **$175** at ≤5,000 authorized | corporate tax, plus a second layer **only on what is distributed** | formal (meetings, minutes, resolutions) |
| Wyoming LLC | ⚠️ **a $60.00 floor** 🌲, not a flat charge | pass-through | minimal |
| New Mexico LLC | 🚩 $0 | pass-through | minimal |

> 🌲 **the Wyoming `$60` is a FLOOR over an asset-based license tax**, not a
> flat report fee. the state's own schedule: *"Annual Report **License tax** is
> $60 or two-tenths of one mill on the dollar ($.0002) whichever is **greater**
> based on the company's assets located and employed in the state of
> Wyoming."* — [WY SoS fee schedule](https://sos.wyo.gov/forms/business/feeschedule.pdf),
> effective 2026-07-01. it holds at $60 for an entity operated outside Wyoming,
> and rises above ~$300K of WY-situs assets.
>
> 🚩 the New Mexico cell is carried from secondary sources and has not been
> checked against that state's own schedule.

⚠️ the second tax layer lands on a **distribution**. a solo founder who
reinvests pays the corporate tax and no more — the *"tax planning reasons
(retained earnings)"* line below.

⚠️ the table omits a third option: an **S-corp election** under §1362, which
makes a Delaware corporation pass-through without a change of entity. see
`variant=c-corp/compare.s-corp-vs-c-corp-tax-election.md`.

### when C-corp makes sense

- plan to raise VC (investors expect it)
- plan to issue stock options
- plan to go public
- tax planning reasons (retained earnings)

### when LLC makes sense

- bootstrapped, no outside investment planned
- want simplicity
- want pass-through taxation
- solo or small partnership

> "If you're a solo founder with no immediate plans to raise venture capital, an LLC may be simpler and more cost-effective."
>
> — [Stripe: Incorporating in Delaware vs Other States](https://stripe.com/resources/more/incorporating-in-delaware-vs-other-states-differences-and-key-considerations)

---

## .conversion path

you can start as an LLC and convert to a C-corp later when you raise.

| stage | structure |
|-------|-----------|
| bootstrapped, solo | Wyoming or New Mexico LLC |
| seed round | convert to Delaware C-corp |
| series A+ | Delaware C-corp (already there) |

conversion costs money and paperwork, but defers the C-corp overhead until you actually need it.

---

## .summary for solo founders

| situation | recommendation |
|-----------|----------------|
| not yet incorporated, no VC plans | Wyoming LLC (**a $60.00 floor** 🌲/year) or New Mexico LLC (🚩 $0/year) |
| not yet incorporated, maybe VC later | Delaware C-corp with ≤5,000 shares (**$175.00**/year ✅ computed) |
| already Delaware C-corp with 10M shares | amend down to 5,000 shares (**$214.00** fee) — saves $225/yr if you always elect assumed-par, $84,990/yr if you pay the invoice, and retires the election |
| already Delaware C-corp, raise soon | keep 10M shares (you'll need them) |

⚠️ do not subtract these by hand for your own charter. run the calculator
against your real share count and par (`rule.forbid.hand-computed-figures`).

---

## .action checklist

for solo founders with an extant Delaware C-corp:

- [ ] check current authorized shares (Certificate of Incorporation)
- [ ] check issued shares (stock ledger)
- [ ] if authorized >> issued and no raise planned, file Certificate of Amendment
- [ ] reduce to ≤5,000 authorized shares
- [ ] next franchise tax bill: $175 by default, instead of $400 elected or $85,165 invoiced

---

## .sources

- [Delaware Division of Corporations: How to Form](https://corp.delaware.gov/howtoform/)
- [Delaware Division of Corporations: Franchise Tax FAQ](https://corp.delaware.gov/taxfaq/)
- [Stripe: Incorporating in Delaware vs Other States](https://stripe.com/resources/more/incorporating-in-delaware-vs-other-states-differences-and-key-considerations)
- [Wyoming Secretary of State: Business Fees](https://sos.wyo.gov/business/docs/businessfees.pdf)
- [Wolters Kluwer: New Mexico LLC Requirements](https://www.wolterskluwer.com/en/solutions/bizfilings/state-guides/new-mexico-llc-requirements)
