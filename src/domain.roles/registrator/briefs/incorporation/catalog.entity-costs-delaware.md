# catalog.entity-costs-delaware

## .what

cited catalog of Delaware entity formation and annual costs for LLC vs Corporation (C-corp and S-corp).

---

## ⚠️ READ THE SOURCE COLUMN — two kinds of number live in these tables

| kind | example | is there an authority to be wrong against? | the right source |
|------|---------|---|---|
| **statutory / agency-set** | the $110 certificate fee, the $300 franchise tax, the June 1 date | ✅ **yes** — the state fixes it | the **agency**, always |
| **market price** | registered agent $50-$150, tax prep $500-$1,500 | ⛔ **no** — no one fixes it | a **vendor** or a survey. correct as-is |

a formation-services vendor (`delawareinc.com`, `doola.com`) is a fine source for
a market price and the wrong source of record for a number the state publishes.

### rows whose QUOTE BLOCK cites a vendor for an AGENCY-SET figure

both rows live under `## .annual costs (Delaware state fees)`:

| the number | the table's source | the quote block's source |
|---|---|---|
| annual report fee, $50 | ✅ Division of Corporations, `corp.delaware.gov/frtax/` | ⛔ Doola (now replaced by the agency quote) |
| LLC franchise tax, $300, due June 1 | ✅ Division of Corporations, `corp.delaware.gov/paytaxes/` | ⛔ delawareinc.com |

the agency source agrees in both rows; the flag says *re-source*, never *the
figure is wrong*.

⛔ **the $300 / June 1 pair is set by Delaware's LLC Act, and that statute is
cited nowhere in this repo.** before either number is relied on for a
submission, pull the section itself (`rule.require.bhrowser-citations`).

---

## .formation costs (one-time)

| item | LLC | Corporation | source |
|------|-----|-------------|--------|
| Certificate of Formation / Incorporation | $110.00 | **`*$109.00`** ⚠️ *varies with stock* | ⭐ [DE Fee Schedule, rev. 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf) |
| registered agent (first year) | $50-$150 | $50-$150 | [Harvard Business Services](https://www.delawareinc.com/compare-registered-agent-fees/) |
| **total formation** | — | — | ⛔ see below |

> ```
> Corporations – Domestic
> Incorporation (including Public Benefit Corporations)   *$109.00   $50.00   $100.00   $50.00
> ...
> Limited Liability Companies
> Formation – domestic                                     $110.00   $50.00   $100.00   $50.00
> ```
> — [DE Division of Corporations, Fee Schedule, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf)

⛔ **`corp.delaware.gov/fee/` states no dollar amount.** it is a hub (1,150 chars,
zero dollar figures) whose whole content is a link to the PDF above. never cite
it for a fee — a quote of "$89" attributed to it was fabricated.

### ⛔ no formation total is published

the state fee is fixed and cited; the agent fee is a market price. per
`rule.forbid.hand-computed-figures`, combine them with your own tools and your
actual agent quote.

---

## .annual costs (Delaware state fees)

| item | LLC | Corporation | source |
|------|-----|-------------|--------|
| franchise tax | $300 | ⚠️ **charter-dependent — see below** | [Delaware Division of Corporations](https://corp.delaware.gov/paytaxes/) |
| annual report fee | $0 | $50 | [Delaware Division of Corporations](https://corp.delaware.gov/frtax/) |
| registered agent | $50-$150 | $50-$150 | [Stripe](https://stripe.com/resources/more/what-is-a-registered-agent-in-delaware-what-they-do-how-much-they-cost-and-when-to-get-one) |
| **total annual (state)** | **$350-$450** | ⛔ **not stated — see below** | |

### ⛔ the corporation franchise tax has two floors, not a range

`$175` and `$400` are the floors of **two different methods**; neither is a cap.

| method | floor | cap | 10,000,000-share charter |
|--------|-------|-----|--------------------------|
| **authorized shares** §503(a)(1) — *the default* | **$175**, at ≤5,000 shares | $200,000 | **$85,165.00** |
| **assumed par value** §503(a)(2) — *elected* | **$400** | $200,000 | $400, at $0.0001 par |

> "The minimum tax is $175.00, using the Authorized Shares Method" … "the
> Minimum Tax using the Assumed Par Value Capital Method is $400.00 with a
> **maximum tax of $200,000.00**"
>
> — [Delaware Division of Corporations](https://corp.delaware.gov/paytaxes/)

⚠️ **Delaware bills on the authorized-shares method unless you elect the other
one**, so a standard 10,000,000-share startup charter is invoiced **$85,165.00 /
year**. compute your own input:

```sh
rhx franchise.tax.delaware --authorized <yours> --par <yours> \
  --issued <yours> --assets <yours>
```

the LLC column is a flat $300 with no method election, so it alone can carry a
total.

> "The annual Franchise Tax cost is $300 per year, due on June 1. This annual $300 Delaware LLC fee is standard protocol for every LLC, regardless of its age, gross sales, activity or periods of inactivity."
>
> — [Harvard Business Services](https://www.delawareinc.com/llc/delaware-llc-annual-fee/)

> "The minimum tax is $175.00 for corporations that use the Authorized Shares method and a minimum tax of $400.00 for corporations that use the Assumed Par Value Capital Method."
>
> — [Delaware Division of Corporations](https://corp.delaware.gov/paytaxes/)

> "Exempt Domestic Corporations – $25.00" / "Non-Exempt Domestic Corporations – $50.00"
>
> — [Delaware Division of Corporations, Annual Report and Tax Instructions](https://corp.delaware.gov/paytaxes/)

note the **exempt** rate of `$25.00` — a distinction vendor paraphrases drop.

---

## .compliance costs (federal / operational)

### LLC (taxed as disregarded entity or partnership)

| item | cost | source |
|------|------|--------|
| tax prep (Schedule C or 1065) | $0-$300 | self-file or simple CPA |
| **total LLC compliance** | **$0-$300** | |

> "LLCs taxed as disregarded entities offer advantages like no payroll to run, no quarterly deposits, and lower accountant costs."
>
> — [SDO CPA](https://www.sdocpa.com/llc-vs-s-corp-complete-comparison/)

### C-corp

| item | cost | source |
|------|------|--------|
| tax prep (Form 1120) | $500-$1,500 | [S Corporations Explained](http://scorporationsexplained.com/scorpexplained-costs.htm) |
| **total C-corp compliance** | **$500-$1,500** | |

### S-corp

| item | cost | source |
|------|------|--------|
| payroll service | $500-$1,800/year | [WCG CPAs](https://wcginc.com/kb/costs-of-operating-an-s-corp/) |
| tax prep (Form 1120-S + K-1) | $800-$1,200 | [WCG CPAs](https://wcginc.com/kb/costs-of-operating-an-s-corp/) |
| **total S-corp compliance** | **$1,300-$3,000** | |

> "S-Corp compliance costs typically run $3,500-5,000/year for payroll, tax prep, and state fees."
>
> — [SDO CPA](https://www.sdocpa.com/s-corporation-tax-guide/)

> "Payroll service costs range from $500-1,800/year."
>
> — [WCG CPAs](https://wcginc.com/kb/costs-of-operating-an-s-corp/)

---

## .total annual cost summary

### the components, each cited — no corporation totals are published

corporation totals are not hand-summed (`rule.forbid.hand-computed-figures`): a
sum of the two floors understates a 10M-share charter by ~140×.

| structure | DE state fees | compliance |
|-----------|---------------|------------|
| LLC | **$350-$450** ✅ (flat $300 tax + $0 report + agent) | $0-$300 |
| C-corp (≤5K shares) | ⚠️ **$175.00** tax + **$50** report + agent | $500-$1,500 |
| C-corp (10M shares) | ⚠️ **$85,165.00** tax by default, **$400** if elected + **$50** report + agent | $500-$1,500 |
| S-corp (≤5K shares) | ⚠️ same state fees as the C-corp row above — the election is federal | $1,300-$3,000 |

```sh
# for a corporation, the tax input to your own total:
rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized <yours> --par <yours> --issued <yours> --assets <yours>
```

the S-corp row shares the C-corp's state fees on purpose: an S election is made
with the IRS under §1362 and does not change what Delaware charges.

---

## .breakeven: when S-corp saves money

S-corp SE tax savings must exceed the extra compliance cost (~$1,000-$2,700 more than LLC).

| annual profit | SE tax savings | extra compliance | net savings |
|---------------|----------------|------------------|-------------|
| $50,000 | 🚩 ~$2,500 | ~$1,500 | 🚩 **+$1,000** |
| $75,000 | 🚩 ~$4,600 | ~$1,500 | 🚩 **+$3,100** |
| $100,000 | 🚩 ~$6,100 | ~$1,500 | 🚩 **+$4,600** |
| $150,000 | 🚩 ~$9,200 | ~$1,500 | 🚩 **+$7,700** |

> 🚩 **the marked columns have no computation behind them** — directional shape,
> not figures to act on.
>
> - the SE-tax column depends on an unstated **reasonable-salary split**: the
>   saving is 15.3% (then 2.9% above the wage base) of *the distribution portion
>   only*. change the salary and every cell moves
> - the SE-tax base, wage base, and additional-Medicare threshold are indexed
>   annually; a table with no year cannot be right for more than one
> - `~$1,500` is a hand-derived midpoint of two ranges, weaker than either
> - only the qualitative claim — a breakeven in the $40K-$50K band — is sourced
>
> per `rule.forbid.hand-computed-figures`, do not compute your own from these rows.

> "The breakeven point for S-Corp election is typically $40,000-$50,000 in annual net business income. Below that threshold, the self-employment tax savings are too small to justify the $1,500-$3,000 in annual compliance costs."
>
> — [SDO CPA](https://www.sdocpa.com/llc-vs-s-corp-complete-comparison/)

---

## .registered agent cost detail

| provider | annual cost | source |
|----------|-------------|--------|
| Harvard Business Services | $50 | [Harvard Business Services](https://www.delawareinc.com/compare-registered-agent-fees/) |
| Delaware Registered Agent | $50 | [Delaware Registered Agent](https://www.delawareregisteredagent.com/) |
| Northwest | $125 | [Venture Smarter](https://venturesmarter.com/best-registered-agent-services/delaware/) |
| LegalZoom | $249 | [Venture Smarter](https://venturesmarter.com/best-registered-agent-services/delaware/) |

> "An experienced registered agent in Delaware can cost between $50 and $299 annually."
>
> — [Stripe](https://stripe.com/resources/more/what-is-a-registered-agent-in-delaware-what-they-do-how-much-they-cost-and-when-to-get-one)

---

## .sources

### Delaware Division of Corporations (official)
- ⭐ [**Fee Schedule**, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf) — **the actual schedule.** every state filing fee on this page. pulled 2026-08-31 as bytes through the browser request context, extracted with `pdftotext`: 254,794 bytes → 34,625 chars, 208 lines that carry a dollar figure
- ⛔ [Fee Schedule *hub*](https://corp.delaware.gov/fee/) — **not a fee source.** it carries **zero** dollar figures; its whole content is a link to the PDF above — see `.formation costs` above
1. [Annual Report and Tax Instructions](https://corp.delaware.gov/paytaxes/)
2. [Franchise Tax Information](https://corp.delaware.gov/frtax/)
3. [LLC/LP/GP Tax Instructions](https://corp.delaware.gov/alt-entitytaxinstructions/)

### compliance cost sources
4. [WCG CPAs: S Corp Costs](https://wcginc.com/kb/costs-of-operating-an-s-corp/)
5. [SDO CPA: LLC vs S-Corp Comparison](https://www.sdocpa.com/llc-vs-s-corp-complete-comparison/)
6. [SDO CPA: S-Corporation Tax Guide](https://www.sdocpa.com/s-corporation-tax-guide/)
7. [S Corporations Explained: Common Costs](http://scorporationsexplained.com/scorpexplained-costs.htm)

### formation and agent sources
8. [LLC University: Delaware LLC Costs](https://www.llcuniversity.com/delaware-llc/costs/)
9. [Harvard Business Services: Delaware LLC Annual Fee](https://www.delawareinc.com/llc/delaware-llc-annual-fee/)
10. [Harvard Business Services: Registered Agent Fees](https://www.delawareinc.com/compare-registered-agent-fees/)
11. [Stripe: Delaware Incorporation Costs](https://stripe.com/resources/more/delaware-incorporation-costs-and-fees-what-corporations-and-llcs-need-to-know)
12. [Stripe: What is a Registered Agent](https://stripe.com/resources/more/what-is-a-registered-agent-in-delaware-what-they-do-how-much-they-cost-and-when-to-get-one)
13. [Doola: Delaware C-Corp and LLC Fees](https://www.doola.com/blog/delaware-llc-fees/)
