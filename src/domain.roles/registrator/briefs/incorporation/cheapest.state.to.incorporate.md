# cheapest.state.to.incorporate

## .what

a cost comparison of U.S. states for incorporation, with guidance on when cheap is the right choice.

⚠️ only **Delaware** (⭐) and **Wyoming** (🌲) figures are verified against the state's own schedule. every 🚩 figure is secondary — confirm it against that state's schedule before a decision.

---

## .the short answer

| goal | cheapest option |
|------|-----------------|
| absolute minimum cost (LLC) | New Mexico — $50 formation, $0/year 🚩 *unverified* |
| absolute minimum cost (corp) | Wyoming — **$100.00** formation ✅, **a $60.00 floor** per year ⚠️ *not a flat $60* |
| operate in one state only | home state — no foreign qualification |
| plan to raise VC | Delaware — cost is worth it |

---

## .cost comparison: formation fees

| state | LLC formation | corp formation |
|-------|---------------|----------------|
| New Mexico | 🚩 $50 | 🚩 $100 |
| Wyoming | **$100.00** 🌲 | **$100.00** 🌲 |
| Arizona | 🚩 $50 | 🚩 $60 |
| Missouri | 🚩 $50 | 🚩 varies |
| Montana | 🚩 $70 | 🚩 $35 |
| Colorado | 🚩 $50 | 🚩 $50 |
| Delaware | **$110.00** ⭐ | **`*$109.00`** ⭐ ⚠️ *varies with stock* |
| Nevada | ⛔ **not stated** 🎰 | ⛔ **stock-based** 🎰 |
| California | 🚩 $70 | 🚩 $100 |

⭐ = [DE Division of Corporations, Fee Schedule, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf),
pulled 2026-08-31. rows `Limited Liability Companies · Formation – domestic` and
`Corporations – Domestic · Incorporation`.

🌲 = [WY Secretary of State, Business Division Filing Fee Schedule, effective
2026-07-01](https://sos.wyo.gov/forms/business/feeschedule.pdf), pulled
2026-09-01, headful, 12,239 chars. **Articles of Organization** (LLC) and
**Articles of Incorporation** (profit corporation) are each `$100.00`. bytes
embedded at
`refs/effectiveAt=2026-07-01.wy-sos-business-fee-schedule.txt`.

🎰 = ⛔ **Nevada has no flat formation fee.** the Secretary of State publishes a
*"Corporation Formation Fee Calculator"* whose inputs are **authorized shares**
and **par value**:

> "If your stock is split into multiple class or series with the same par
> value, please enter the **total authorized stock number and the par value**
> to calculate the fees. If you have multiple class or series stock with
> different par value or have **unlimited stock**, please contact our office
> at 775-684-5708 for assistance with the fees."
>
> — [NV Secretary of State, Corporation Formation Fee
> Calculator](https://www.nvsos.gov/businesses/commercial-recordings/forms-fees/all-business-forms/filing-fee-calculator),
> pulled 2026-09-01, 931 chars

a fee that is a **function of your charter** cannot occupy a sort key; the same
holds for the Delaware corp row, hence its asterisk.

⚠️ a wrong row in a cost-ranked table reorders the answer. measured: the Delaware
row once read $90 / $89 (one guess, one fabricated quote) — ~22% off the schedule.

> "Formation fees range from $45 in states like Arkansas and Iowa to over $275 in states like Massachusetts."
>
> — [Terms.Law: 50-State Corporation Fee Comparison](https://terms.law/2025/04/23/50-state-corporation-fee-comparison-finding-the-most-cost-effective-states-for-incorporation-in-2025/)

---

## .cost comparison: annual fees

| state | LLC annual | corp annual | franchise tax |
|-------|------------|-------------|---------------|
| New Mexico | 🚩 $0 | 🚩 $0 | 🚩 unverified |
| Wyoming | **$60.00 floor** 🌲 | **$60.00 floor** 🌲 | ⚠️ **an asset-based license tax** 🌲 |
| Ohio | 🚩 $0 | 🚩 $0 | 🚩 unverified |
| Arizona | 🚩 $0 | 🚩 $45 | 🚩 unverified |
| Missouri | 🚩 $0 | 🚩 varies | 🚩 unverified |
| Delaware | $300 | ⚠️ **$85,165** at a 10,000,000-share charter | yes |
| Nevada | ⛔ not stated 🎰 | ⛔ not stated 🎰 | 🚩 unverified |
| California | 🚩 $800+ | 🚩 $800+ | 🚩 yes |

### Wyoming's `$60` is a FLOOR over a license tax

> "\*Annual Report **License tax** is $60 or two-tenths of one mill on the
> dollar ($.0002) whichever is greater based on the company's assets located
> and employed in the state of Wyoming."
>
> — [WY SoS, Business Division fee schedule](https://sos.wyo.gov/forms/business/feeschedule.pdf), effective 2026-07-01 · bytes at `refs/effectiveAt=2026-07-01.wy-sos-business-fee-schedule.txt`

a WY-chartered entity with ~$0 of WY-situs assets lands on the $60 floor — but
"no franchise tax" is not why, and an entity that moves assets into Wyoming pays
more.

### Nevada annual charges were never pulled

a State Business License, plus a Commerce Tax above a gross-revenue threshold.
the prior figures came from a vendor comparison page and are struck.

### Delaware corp annual: the default is $85,165, not $175

`$175` is the authorized-shares floor, **only at ≤5,000 authorized shares**.
Delaware bills on that method **by default**, so a 10,000,000-share startup
charter is invoiced **$85,165.00 / year**. `$400` is the **assumed par value**
minimum, which you get only if you elect it, at a low stated par. run
`rhx franchise.tax.delaware` against your own charter before you rank states.

> "Wyoming's $100 filing fee and no franchise tax make it the cheapest LLC state."
>
> — [State Business Compliance](https://www.statebusinesscompliance.com/blog/wyoming-llc-taxes-annual-fees-2026)

⚠️ half right: the `$100` fee is ✅ confirmed; *"no franchise tax"* is ⛔ false —
the schedule prints an **Annual Report License tax** with a $60 floor. a real
quote from a real page can still be wrong on the law: a fabrication check and a
**fact** check are different passes.

> "New Mexico does not impose a franchise tax, privilege tax, or annual LLC fee. New Mexico LLCs have no annual or biennial report requirement."
>
> — [Wolters Kluwer](https://www.wolterskluwer.com/en/solutions/bizfilings/state-guides/new-mexico-llc-requirements)

---

## .the cheapest states

### new mexico — $50 + $0/year

the absolute cheapest for LLCs — 🚩 unverified against New Mexico's own schedule.
the `franchise tax | none` cell is the same claim, from the same class of source,
that was false for Wyoming.

| attribute | value |
|-----------|-------|
| formation fee | 🚩 $50 |
| annual report | 🚩 none required |
| franchise tax | 🚩 none |
| total year 1 | 🚩 ~$50 |
| total year 2+ | 🚩 $0 |
| privacy | 🚩 anonymous (no member names published) |

> "New Mexico is one of only a handful of states that offers true anonymous LLC formation, and it's the cheapest anonymous state by a wide margin."
>
> — [NCH Inc](https://nchinc.com/blog/business-startup/state-filing-fees-breakdown-where-its-cheapest-to-form-an-llc/)

**best for**: solo operators, hold companies, minimal compliance burden

### wyoming — $100 + a $60 FLOOR per year

the cheapest for corporations and a strong LLC choice.

| attribute | value |
|-----------|-------|
| formation fee | **$100.00** ✅ (Articles of Incorporation; LLC Articles of Organization are also $100.00) |
| annual report | ⚠️ **a $60.00 floor** — "$60 or two-tenths of one mill on the dollar ($.0002) whichever is **greater**", on WY-situs assets |
| franchise tax | ⚠️ **the line above IS the tax.** the schedule names it a *license tax*; there is no separate franchise tax |
| total year 1 | ~$160 **at the floor** |
| total year 2+ | ~$60 **at the floor** |
| privacy | 🚩 strong (no member/officer names required) — *not checked against the schedule* |

the floor holds up to $300,000 of WY-situs assets; above that, $.0002 × assets
exceeds $60. do not compute your own figure from the rate — run a tested
calculator (`rule.forbid.hand-computed-figures`); the "whichever is **greater**"
branch is the shape hand arithmetic gets backwards.

⛔ **a quote in circulation is fabricated**: *"Wyoming imposes no franchise tax, no
gross receipts tax, and no minimum business tax"*, attributed to the WY SoS fee
schedule. the embedded schedule has **0** matches for `franchise`,
`gross receipts`, or `minimum business`, and says the reverse (a *license tax*
with a *minimum*). pull-free screen: a sentence about **tax** attributed to a
**fee schedule** is suspect on sight. the same quote was struck from
`state.comparison.delaware.wyoming.nevada.texas.florida.md`.

**best for**: privacy, low cost, no state income tax

### home state — no foreign qualification

if you operate in only one state, incorporate there.

| scenario | cost |
|----------|------|
| form in Wyoming, operate in California | WY fees + CA foreign qualification + CA franchise tax ($800+) |
| form in California, operate in California | CA fees only |

> "If you form your LLC in a state such as Wyoming or Delaware but primarily operate in another state, you need to register as a foreign LLC in the state where you do business."
>
> — [Stripe](https://stripe.com/resources/more/what-is-the-cheapest-state-to-incorporate-an-llc-in-the-us)

**best for**: single-state operations, simplicity

---

## .the hidden cost: foreign qualification

if you incorporate in one state but operate in another, you must "foreign qualify" in each state where you operate.

| cost type | range |
|-----------|-------|
| foreign qualification fee | $50–$750 per state |
| annual report (foreign) | $0–$300 per state |
| registered agent | $50–$200/year per state |

> "A typical LLC foreign qualify in one additional state can expect to pay $200 to $500 upfront and $200 to $1,000 per year in costs."
>
> — [LLC University](https://www.llcuniversity.com/foreign-llc-fees-by-state/)

### example: Wyoming LLC that operates in California

| item | cost |
|------|------|
| Wyoming formation | **$100.00** ✅ |
| Wyoming annual | ⚠️ **$60.00 floor** 🌲 — rises above ~$300K of WY-situs assets |
| California foreign qualification | 🚩 $70 |
| California annual statement | 🚩 $25 |
| California franchise tax (minimum) | 🚩 $800 |
| registered agent (WY) | ~$100 |
| registered agent (CA) | ~$100 |
| **total year 1** | ⚠️ **~$1,255 — hand-summed** |
| **total year 2+** | ⚠️ **~$1,085 — hand-summed** |

⚠️ the totals are hand-summed and the California inputs are secondary — read the
rows as a **shape**, not a quote. the lesson holds regardless: foreign
qualification adds a second agent, a second annual filing, and the full
home-state franchise tax.

vs. just incorporate in California:

| item | cost |
|------|------|
| California formation | $70 |
| California franchise tax | $800 |
| registered agent | ~$100 |
| **total year 1** | **~$970** |
| **total year 2+** | **~$900** |

**lesson**: "cheap" state + foreign qualification often costs more than home state.

---

## .the california problem

California imposes an $800 minimum franchise tax on all LLCs and corporations that do business in California — regardless of where they incorporated.

> "California's $800 minimum annual franchise tax" applies even to entities with zero revenue.
>
> — [MyLLC](https://www.myllc.com/cost-of-llc-2025.aspx)

if you operate in California, you pay the $800. no escape via Wyoming or Delaware.

---

## .when cheap is the wrong choice

### plan to raise VC → Delaware

VCs expect Delaware C-corps. the legal framework, Court of Chancery, and standard documents make due diligence faster.

| attribute | Delaware | Wyoming |
|-----------|----------|---------|
| VC acceptance | standard | questioned |
| legal precedent | 200+ years | limited |
| Court of Chancery | yes | no |
| franchise tax | ⚠️ **$85,165** by default at 10M shares; $400 if elected down | ⚠️ **a $60.00 floor** 🌲 — an asset-based license tax, not "none" |

the franchise tax cost is worth it for VC-track startups — ⚠️ **at the elected
$400, not at the default $85,165.** the election is a step you must take.

### complex cap table → Delaware

multiple stock classes, SAFEs, convertible notes, option pools — Delaware handles these with clear legal precedent.

### plan to go public → Delaware

over 65% of Fortune 500 companies are Delaware corporations.

---

## .decision tree

```
do you plan to raise VC?
├── yes → Delaware (cost is worth it)
└── no
    ├── do you operate in one state only?
    │   ├── yes → home state (no foreign qualification)
    │   └── no → continue
    └── do you want minimum cost + privacy?
        ├── LLC → New Mexico
        └── corporation → Wyoming
```

---

## .summary

| situation | recommendation | year 1 cost | year 2+ cost |
|-----------|----------------|-------------|--------------|
| VC-track startup | Delaware C-corp | ~$500 🔻 | $400–$1,000 🔻 |
| bootstrapped, one state | home state | varies | varies |
| bootstrapped, multi-state | Wyoming | **$160.00** ✅ + foreign quals | **a $60.00 floor** 🌲 + foreign quals |
| hold company / minimal ops | New Mexico LLC | $50 🚩 | $0 🚩 |
| privacy + low cost | Wyoming | **$160.00** ✅ | **a $60.00 floor** 🌲 |

- 🔻 assumes you **elected** the assumed-par-value method. at the default, a 10,000,000-share charter pays **$85,165.00/year**
- 🌲 a **floor** over an asset-based license tax; correct for an entity chartered in Wyoming and operated elsewhere
- 🚩 unverified against the state's own schedule

---

## .sources

### the one schedule pulled — 2026-09-01, bhrowser headful, bytes embedded

| state | source | chars | embedded at |
|-------|--------|------:|-------------|
| Wyoming | [WY SoS, Business Division fee schedule](https://sos.wyo.gov/forms/business/feeschedule.pdf) | 12,239 | `refs/effectiveAt=2026-07-01.wy-sos-business-fee-schedule.txt` |

plus the Delaware fee schedule (⭐, above). every other number is secondary.

⚠️ `sos.wyo.gov/business/docs/businessfees.pdf` — the url attached to the
fabricated quote — is **not** the live path; the schedule is at
`/forms/business/feeschedule.pdf`.

### secondary — read as commentary, never as authority

1. [Stripe: Cheapest State to Incorporate an LLC](https://stripe.com/resources/more/what-is-the-cheapest-state-to-incorporate-an-llc-in-the-us)
2. [NCH Inc: State Filing Fees Breakdown](https://nchinc.com/blog/business-startup/state-filing-fees-breakdown-where-its-cheapest-to-form-an-llc/)
3. [LLC University: LLC Annual Fees by State](https://www.llcuniversity.com/llc-annual-fees-by-state/)
4. [LLC University: Foreign LLC Fees by State](https://www.llcuniversity.com/foreign-llc-fees-by-state/)
5. [Terms.Law: 50-State Corporation Fee Comparison](https://terms.law/2025/04/23/50-state-corporation-fee-comparison-finding-the-most-cost-effective-states-for-incorporation-in-2025/)
6. [Wolters Kluwer: New Mexico LLC Requirements](https://www.wolterskluwer.com/en/solutions/bizfilings/state-guides/new-mexico-llc-requirements)
7. [State Business Compliance: Wyoming LLC Costs](https://www.statebusinesscompliance.com/blog/wyoming-llc-taxes-annual-fees-2026)
8. [MyLLC: Cost of an LLC in 2025](https://www.myllc.com/cost-of-llc-2025.aspx)
