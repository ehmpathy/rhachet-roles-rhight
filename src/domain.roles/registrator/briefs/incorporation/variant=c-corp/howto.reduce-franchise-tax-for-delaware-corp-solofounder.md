# howto.reduce-franchise-tax-for-delaware-corp-solofounder

## .what

step-by-step guide to reduce Delaware franchise tax from $400/year to $175/year for solo founders.

---

## .the problem

most startups incorporate with 10 million authorized shares "because that's what YC says." this triggers:

| method | authorized shares | annual tax | statute |
|--------|-------------------|------------|---------|
| Authorized Shares | 10,000,000 | **$85,165.00** | 8 Del. C. §503(a)(1) |
| Assumed Par Value | 10,000,000 | **$400.00** (the minimum) | §503(a)(2) — the method · **§503(c)** — the $400 floor |

⚠️ §503(a)(2) computes; **§503(c)** floors the result at $400 — *"in no case shall the tax … computed by paragraph (a)(2) … be more than $200,000 nor less than $400."* §503(a)'s own final sentence **prorates** below $1,000,000 of assumed par value capital, so the floor is not found inside the computation. see `templates/1.calculate.owed.stone`.

```sh
rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized 10000000 --par 0.00001 --issued 1000000 --assets 0
```

solo founders use Assumed Par Value to pay $400 instead of $85K — but **$400 is still too much** if you don't need millions of shares.

### ⚠️ $85,165 is also seventeen times the §504(a) QUARTERLY trigger

**8 Del. C. §504(a)** moves the tax off a single March 1 date once the year's **estimated** liability reaches **$5,000**, and the first installment falls on **June 1 of the tax year itself** (the schedule: `delaware.franchise.tax.[howto].renew.md` § *⚠️ March 1 is the whole answer only BELOW $5,000*).

- the March 1 dates later in this guide hold only because the amendment put you under the threshold
- at $85,165, an accrual computed off March 1 understates the interest
- ⚠️ the election is not a reliable escape either — assumed-par-value climbs with gross assets, so the same charter crosses $5,000 on the *elected* method at a Series A balance sheet:

```sh
rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized 10000000 --par 0.00001 --issued 8000000 --assets 9600000
#   └─ governs: assumed-par-value  →  $4,800.00 / year     annual

rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized 10000000 --par 0.00001 --issued 8000000 --assets 10000000
#   └─ governs: assumed-par-value  →  $5,200.00 / year     QUARTERLY
```

the per-installment accrual: `rhx franchise.tax.delaware.accrue` · the penalty and interest from the statute: `delaware.franchise.tax.[howto].renew.md` § *.late payment*

every figure here carries the command that produced it (`rule.forbid.hand-computed-figures`); the calculator is symlinked into this role at `registrator/skills/franchise.tax.delaware`.

---

## .the solution

reduce authorized shares to ≤5,000 → pay **$175/year** instead of $400.

| authorized shares | method that governs | annual tax |
|-------------------|--------------------|------------|
| 10,000,000 | Assumed Par Value | $400.00 |
| 5,000 | Authorized Shares | **$175.00** |

```sh
rhx franchise.tax.delaware --repo rhight --role accountant \
  --authorized 5000 --par 0.00001 --issued 1000 --assets 0
#   ├─ method A · authorized shares  §503(a)(1)  →  $175.00
#   ├─ method B · assumed par value  §503(a)(2)  →  $400.00  (min)
#   └─ governs: authorized-shares  →  $175.00 / year
```

**savings: $225/year** — ⚠️ a **delta**, not a bill. see the collision note below

### 🚨 `$225/year` denotes a DIFFERENT quantity in the neighbor brief

| the file | what `$225` is | the arithmetic |
|---|---|---|
| **this one** | the annual **reduction** from the amendment | $400 **−** $175 |
| `define.authorized-vs-issued-vs-outstanding-shares.md` | the annual **cost** floor | $175 tax **+** $50 report fee |

both are correct; the $50 report fee is owed before and after, so it cancels out of the delta. carried across files, a cost reads as a reduction.

⚠️ **`$175/year` is the TAX, not the bill.** a non-exempt domestic corporation also owes the **$50** annual report fee. budget **$225**, not $175.

⭐ the share count does not select the method — **the taxpayer elects the lesser of the two**, and at 5,000 shares the Authorized Shares figure falls below the $400 floor under the other method. run both; take the smaller.

---

## .who qualifies

this works if you:

- are a solo founder (no co-founders)
- have no investors
- have no option pool needed
- have issued fewer shares than your target authorized count

if you plan to raise VC soon, keep your 10M shares — investors expect it.

---

## .step 1: check current state

**find your authorized shares:**
- look at your Certificate of Incorporation
- or check Delaware's records at [icis.corp.delaware.gov](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx)

**find your issued shares:**
- check your stock ledger / cap table
- typically: founder issued themselves some shares at incorporation

**the constraint:** you cannot authorize fewer shares than you've issued.

| issued | minimum authorized |
|--------|-------------------|
| 100 | 100 |
| 1,000 | 1,000 |
| 1,000,000 | 1,000,000 |

---

## .step 2: decide target authorized shares

| scenario | recommendation |
|----------|----------------|
| issued 100 shares | authorize 1,000 (room to grow) |
| issued 1,000 shares | authorize 5,000 (max for $175 tier) |
| issued 10,000 shares | cannot reach $175 tier without reverse split |

**the sweet spot:** authorize exactly 5,000 shares (maximum for $175/year tier).

---

## .step 3: draft board resolution

as sole director, you approve the amendment:

```
UNANIMOUS WRITTEN CONSENT OF THE BOARD OF DIRECTORS
OF [YOUR COMPANY NAME]

The undersigned, the sole director of [Company Name],
a Delaware corporation, hereby consents to:

RESOLVED, that the Corporation's Certificate of Incorporation
be amended to reduce the total number of authorized shares of
Common Stock from [CURRENT NUMBER] to [NEW NUMBER].

RESOLVED, that the officers of the Corporation are authorized
to file a Certificate of Amendment with the Delaware Secretary
of State to effect this change.

Date: _______________

_______________________
[Your Name], Sole Director
```

---

## .step 4: file Certificate of Amendment

**form:** Certificate of Amendment of Certificate of Incorporation

**where to file:**
- online: [Delaware Division of Corporations](https://corp.delaware.gov/)
- mail: 401 Federal Street – Suite 4, Dover, DE 19901

**required information:**

| field | what to enter |
|-------|---------------|
| corporation name | exact name as registered |
| file number | your 7-digit Delaware file number |
| amendment text | "Article [X] is amended to read: The total number of shares of stock which the Corporation shall have authority to issue is [NEW NUMBER] shares of Common Stock." |

**fees:**

| item | cost |
|------|------|
| Certificate of Amendment | **$214.00** base — ⚠️ *varies with stock* |
| additional pages | $9 per page |
| expedited (same day) | +$200 |
| expedited (24 hours) | +$100 |

> ```
> Certificate Type            State Filing Fee   Certified Copy   Same Day   24-Hour
> Amendment                        *$214.00           $50.00       $200.00   $100.00
> ...
> *VARIES BASED ON STOCK
> ```
> — [Delaware Division of Corporations, Fee Schedule, revised August 1, 2026](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf)

the schedule's own note explains what the $214 covers, and where the $9 comes from:

> "Amount in column one equals filing fee, receiving and indexing fee, data
> entry fee, municipality fee and county recording fee for a 1 page document,
> **however, may vary if stock changes**. Please add $9 for each additional page
> for county recording fees."

⚠️ 8 Del. C. §391 sets these fees by statute, and `*VARIES BASED ON STOCK` means a share-count amendment can land **above** $214.00. **§391 has not been pulled** — treat $214.00 as the published floor for a 1-page document.

### ⛔ "$50" is not the amendment fee

a widely repeated "$50.00 minimum fee for an amendment" is not on `corp.delaware.gov/howtoform/` (7,410 chars; "amendment" and "minimum fee" each appear **zero** times). two real $50 figures sit nearby:

> "For an Annual Report or Amended Annual Report for **non-exempt domestic
> corporations the filing fee is $50**."

and the schedule's `Change of Agent Only Amendment  $50.00`. neither is this amendment.

⚠️ `corp.delaware.gov/fee/` is a hub (1,150 chars, **zero dollar figures**); the schedule is the PDF above, reached by an unfiltered harvest of that hub's links.

---

## .step 5: update your records

after Delaware processes the amendment:

1. **update stock ledger** — note the new authorized share count
2. **update cap table** — if you use software like Carta, Pulley, etc.
3. **file updated records** — keep copy of filed amendment with corporate records
4. **set calendar reminder** — the **annual report** is due March 1 every year (§502). the **tax** is due March 1 too **only because the amendment put you under the $5,000 threshold** (§504(a))

---

## .step 6: file next year's franchise tax

when you file your annual report:

1. go to [corp.delaware.gov/paytaxes](https://corp.delaware.gov/paytaxes/)
2. with ≤5,000 authorized shares, the system calculates **$175**
3. pay by March 1 — correct here because **$175 is under the §504(a) $5,000 threshold**. a year still at 10M shares is a different question

---

## .timeline and costs

| step | time | cost |
|------|------|------|
| draft resolution | 10 minutes | $0 |
| file amendment | same day (expedited), or ⛔ **no published time** at Priority 7 — see below | **$214.00** base, + expedite if used |
| **annual savings**, if you elect assumed-par-value every year | | **$225.00/year** ($400.00 − $175.00, both from the calculator) |
| **annual savings**, if you pay what Delaware invoices | | **$84,990.00/year** ($85,165.00 − $175.00) — ⚠️ hand-subtracted from two computed figures |

### ⛔ Delaware publishes no standard turnaround

the expedited times are published; regular work is not timed:

> "Processing time for **regular (non-expedited) work varies based upon the
> volume of items received** by our office."
>
> — the FAQ, `refs/pulledAt=2026-09-25.de-faq-regular-work-turnaround.txt`

- **Expedited Services** names four tiers with a time each, and none for regular work
- the **fee schedule** carries `Priority 1`, `Priority 2`, `Same Day`, `24-Hour` columns and no regular-work time
- the **Filing Cover Memo** names the tier `Priority 7 / Reg. Work`, with no duration. **Priority 7 is the queue, not a service level**
- ⛔ a "2-3 weeks" figure for regular work is unsourced; do not repeat it
- ✅ ask a clerk **"what date are you currently at?"** — a fact on screen, not a forecast. an item in the regular queue can be **upgraded** by a later call

the full walk, the embedded bytes, and the verifier: `howto.submit-a-certificate-of-revival.md`.

### no payback total is published

a multi-year fee-plus-tax projection has no skill behind it, so no total is shown (`rule.forbid.hand-computed-figures`). the three sourced inputs:

| input | value | from |
|---|---|---|
| annual tax at 10,000,000 shares | $400.00 | `franchise.tax.delaware` §503(a)(2) |
| annual tax at 5,000 shares | $175.00 | `franchise.tax.delaware` §503(a)(1) |
| one-time amendment fee | **$214.00** base, varies with stock | DE fee schedule, rev. 2026-08-01 |

the recommendation holds — $175.00/yr beats $400.00/yr, and the fee is one-time — but the payback is roughly a year, not a few months.

---

## .example: 10M → 5,000 shares

**before:**
- 10,000,000 authorized shares
- 1,000 issued to founder
- $400/year (Assumed Par Value Method)

**after:**
- 5,000 authorized shares
- 1,000 issued to founder (unchanged)
- **$175/year** (Authorized Shares Method)

---

## .when NOT to do this

keep your 10M authorized shares if:

| situation | why |
|-----------|-----|
| plan to raise VC soon | investors expect large authorized pool |
| plan to hire with equity | need shares for option pool |
| have co-founders | may need shares for future grants |
| issued >5,000 shares | cannot reduce below issued |

you can always amend UP later (**$214.00 again**, and a share-count increase is exactly what `*VARIES BASED ON STOCK` covers — budget above that floor), but it's simpler to wait if you know you'll need more shares soon.

---

## .comparison: amend now vs later

| scenario | year 1 | year 2 | year 3 | year 4 | year 5 |
|----------|--------|--------|--------|--------|--------|
| keep 10M shares | $400.00 | $400.00 | $400.00 | $400.00 | $400.00 |
| amend to 5K now | $175.00 **+ $214.00 fee** | $175.00 | $175.00 | $175.00 | $175.00 |

every per-year cell is sourced; no rollup is published, per `rule.forbid.hand-computed-figures`.

---

## .sources

### primary — pulled 2026-08-31, headful, per `rule.require.bhrowser-citations`

- ⭐ [DE Division of Corporations **Fee Schedule**, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf) — 254,794 bytes, 34,625 chars, via the request context + `pdftotext`. **the amendment fee, and the `*VARIES BASED ON STOCK` marker**
- [DE Division of Corporations: How to Form](https://corp.delaware.gov/howtoform/) — 7,410 chars. ⚠️ cited here **only** for the annual-report fee it actually carries; it says not one word about amendments
- 8 Del. C. §391 — the fee statute. 🚩 **not pulled**

### agency, secondary

- [Delaware Division of Corporations: Franchise Tax FAQ](https://corp.delaware.gov/taxfaq/)
- [Clerky: How to Calculate Delaware Franchise Tax](https://help.clerky.com/article/2796-calculate-delaware-franchise-tax)
- [BALL PLLC: Delaware Franchise Tax Best Practices](https://ballpllc.com/understanding-delawares-franchise-tax-system-for-c-corporations-calculation-methods-compliance-and-key-considerations/)
- [Stripe: Delaware vs Other States](https://stripe.com/resources/more/delaware-vs-other-states-differences-and-key-considerations)
