# in.usa.state.delaware

## .what

Delaware is the dominant state of incorporation in the United States: over 65%
of Fortune 500 companies and most VC-backed startups incorporate here.

---

## .why delaware dominates

### the court of chancery

a specialized business court with no juries — only expert judges.

> "The judges are experts in corporate law, and their decisions tend to be more predictable than those in other states, partly because the court operates without juries."
>
> — [Stripe](https://stripe.com/resources/more/incorporating-in-delaware-vs-other-states-differences-and-key-considerations)

| attribute | court of chancery | standard state court |
|-----------|-------------------|---------------------|
| judges | corporate law specialists | generalists |
| juries | none | yes |
| speed | fast | slow |
| precedent | 200+ years | varies |

### extensive case law

- 200+ years of case law
- clear precedent for complex situations
- lawyers and judges share common vocabulary
- outcomes are predictable

### VC and investor expectations

> "Many investors and venture capitalists see incorporation in Delaware as a sign of a business's credibility and stability."
>
> — [LegalZoom](https://www.legalzoom.com/articles/incorporating-in-delaware-advantages-and-disadvantages)

VCs expect Delaware because:
- standard documents (NVCA templates assume Delaware)
- familiar legal framework
- reduces due diligence friction
- enables clean exits (IPO, acquisition)

### flexible corporate statute

the Delaware General Corporation Law (DGCL) is:
- regularly updated by the legislature
- favorable to directors and officers
- flexible on governance structures
- permissive on stock classes

### tax treatment for out-of-state operations

> "Corporations that conduct their operations out of state do not have to pay state corporate income tax."
>
> — [Wolters Kluwer](https://www.wolterskluwer.com/en/expert-insights/why-incorporate-in-delaware-or-nevada)

a Delaware corp that operates entirely in California:
- pays Delaware franchise tax — ⚠️ by the **default** method unless it elects; see `.costs`
- pays NO Delaware income tax — by an express statutory exemption,
  [30 Del. C. § 1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html):
  *"A corporation maintaining a statutory corporate office in the State but not
  doing business within the State"*
- pays California taxes on California operations
- benefits from Delaware courts and law

---

## .the network effect

```
more corps incorporate in Delaware
        ↓
more case law develops
        ↓
more predictable outcomes
        ↓
lawyers specialize in Delaware law
        ↓
VCs standardize on Delaware
        ↓
more corps incorporate in Delaware
```

other states cannot easily replicate 200 years of precedent.

---

## .who should incorporate in delaware

| scenario | recommendation |
|----------|----------------|
| plan to raise VC | Delaware |
| plan to go public | Delaware |
| complex cap table | Delaware |
| multiple stock classes | Delaware |
| small local business | home state |
| solo founder, no investors | home state or Wyoming |

> "Large corporations typically derive the greatest advantage from Delaware, especially those with complex structures, multiple investors, or plans for significant growth."
>
> — [Silicon Valley Bank](https://www.svb.com/startup-insights/vc-relations/why-incorporate-in-delaware/)

---

## .costs

| item | amount |
|------|--------|
| initial formation | **`*$109.00`** ⚠️ *varies with stock* + registered agent |
| franchise tax — **default** method | see below; **not $175** for a normal startup charter |
| franchise tax — statutory maximum | **$200,000**/year |
| registered agent | $50–$300/year 🚩 *unverified* |
| annual report | included with franchise tax |

- formation fee: [DE Division of Corporations, Fee Schedule, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf), row `Corporations – Domestic · Incorporation`, pulled 2026-08-31. the `*` is the schedule's own footnote — `*VARIES BASED ON STOCK` — so `$109.00` is a **floor**, never a total
- a `~$90` or `$89` formation fee has no source; see `catalog.entity-costs-delaware.md` for that phantom's origin

### ⛔ the franchise tax default is not the floor

| method | minimum | what a 10,000,000-share charter pays |
|--------|---------|--------------------------------------|
| **authorized shares** §503(a)(1) — *the default* | $175, and **only at ≤5,000 shares** | **$85,165.00** / year |
| **assumed par value** §503(a)(2) — *elected* | $400 | $400, at $0.0001 stated par |

- ⚠️ **Delaware bills on the authorized-shares method unless you elect the other.** a founder who files the standard 10,000,000-share charter and takes no further step is invoiced **$85,165**, not $175 and not $400
- a `$175–$200K` range hides this: $85,165 sits inside it. every figure is true; the default is absent
- 🚫 do not budget from any number on this page. run the calculator with your actual charter — it prints **both** methods:

```sh
rhx franchise.tax.delaware --authorized 10000000 --par 0.0001 \
  --issued 8000000 --assets 0
```

see `delaware.franchise.tax.[tips].md` for the election mechanics and
`howto.reduce-franchise-tax-for-delaware-corp-solofounder.md` for the
charter-size decision.

---

## .requirements

| requirement | detail |
|-------------|--------|
| registered agent | must have Delaware address |
| annual report | file by **March 1** · 8 Del. C. §502 |
| franchise tax | ⚠️ **March 1 only below $5,000** — see below · 8 Del. C. §504(a) |
| foreign qualification | required in states where you operate |

### ⛔ the TAX is due March 1 only for a small charter

**8 Del. C. §504(a)** puts the tax on installments once the year's **estimated**
liability reaches **$5,000**, the first on **June 1 of the tax year itself**
(the schedule: `delaware.franchise.tax.[howto].renew.md` § *⚠️ March 1 is the
whole answer only BELOW $5,000*).

- §502 puts the *annual report* on March 1 unconditionally; §504(a) does not put the *tax* there. never merge the two into one deadline
- the 10,000,000-share charter in `.costs` bills **$85,165.00** by default — seventeen times the $5,000 trigger

the election does not reliably keep you under it — the threshold is on **estimated** liability, and assumed-par-value climbs with gross assets:

```sh
rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized 10000000 --par 0.00001 --issued 8000000 --assets 9600000
#   └─ governs: assumed-par-value  →  $4,800.00 / year     annual

rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized 10000000 --par 0.00001 --issued 8000000 --assets 10000000
#   └─ governs: assumed-par-value  →  $5,200.00 / year     QUARTERLY
```

a balance sheet between those two lines — a Series A company — moves the same charter onto installments **on the elected method**.

the statutory penalty and interest: `delaware.franchise.tax.[howto].renew.md`
§ *.late payment* · the per-installment accrual:
`rhx franchise.tax.delaware.accrue`

---

## .sources

⚠️ every entry below is **secondary** — a bank, a payments company, a legal-forms
vendor, a publisher. none publishes a statutory due-date schedule; the §502 /
§504(a) cites above come from `franchise.tax.delaware.accrue.sh`, which quotes
the Code in its own header.

- [Delaware Division of Corporations](https://corp.delaware.gov/)
- [Stripe: Delaware vs Other States](https://stripe.com/resources/more/incorporating-in-delaware-vs-other-states-differences-and-key-considerations)
- [LegalZoom: Delaware Incorporation](https://www.legalzoom.com/articles/incorporating-in-delaware-advantages-and-disadvantages)
- [Silicon Valley Bank: Why Delaware](https://www.svb.com/startup-insights/vc-relations/why-incorporate-in-delaware/)
- [Wolters Kluwer: Delaware or Nevada](https://www.wolterskluwer.com/en/expert-insights/why-incorporate-in-delaware-or-nevada)
