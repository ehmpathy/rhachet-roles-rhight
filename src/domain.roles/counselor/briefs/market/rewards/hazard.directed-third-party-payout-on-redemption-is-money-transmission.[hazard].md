# hazard.directed-third-party-payout-on-redemption-is-money-transmission

## .what

one common question: if a reward redeems as a **cash payout directed to a third party** (e.g. a payout
to the holder's counterparty on the holder's instruction) rather than to the holder, does the fact
that the holder never touches cash mean no cash-out occurred?

it does not — and a directed payout is caught on two regimes at once, where a payout to the holder is
caught on only one:

1. **money-transmission** — accept value from one person (the holder redeems) and transmit money to
   another person (the third party) is the two-element definition of money transmission. "only to
   another person" is the **trigger**, not the escape.
2. **escheat** — the escheat possibility test asks whether the **record becomes money**, not who
   pockets it. a directed cash payout monetizes the record, so the loyalty-escheat exclusion still
   breaks.

## .why

- the escheat carve-back reaches any record "redeemed for money or otherwise monetized by the
  issuer." a directed disbursement on the strength of the record is monetization, regardless of the
  payee.
- the money-transmission test turns on **movement between persons**. a redemption paid to the
  holder's own price (a discount on the holder's own purchase) moves value to no one — it is a
  self-funded price adjustment. a redemption paid **to a third party** moves value from A to B —
  the exact conduit shape the definition names.
- so a redirect of the payee does not remove the cash-out; it adds a second regime on top of it.

> **not legal advice.** informational groundwork for counsel to validate.

---

## trap 1 — the two-element money-transmission test is met

the federal definition names both elements:

> "the acceptance of currency, funds, or other value that substitutes for currency from one person
> and the transmission of currency, funds, or other value that substitutes for currency to another
> location or person by any means"

**source**: [31 CFR § 1010.100](https://www.law.cornell.edu/cfr/text/31/1010.100)

a directed payout is: **accept** value from the holder (element one), **transmit** money to the
third party (element two). the phrase "to another location or person" is the definition's own
conduit language — so a redemption that pays someone other than the holder places the issuer
squarely in that conduit posture.

by contrast, a redemption that lands as a **discount on the holder's own purchase** accepts and
transmits no third party's money — it is a self-funded price adjustment, outside the two-element
test.

---

## trap 2 — a directed payout still monetizes the record

the escheat loyalty-exclusion carve-back is a possibility test on the **record**, not the payee:

> "The term does not include a record that may be redeemed for money or otherwise monetized by the
> issuer."

**source**: [D.C. Code § 41-151.02](https://code.dccouncil.gov/us/dc/council/code/sections/41-151.02) · [Ind. Code § 32-34-1.5-3](https://codes.findlaw.com/in/title-32-property/in-code-sect-32-34-1-5-3/)

"otherwise monetized by the issuer" reaches a directed cash disbursement — the holder does not need
to receive the cash for the record to be turned into money. so a directed payout breaks the
exclusion the same way a direct cash-out would.

---

## why a discount-form redemption sits outside both

the contrast case is a redemption that lands as a **discount on the holder's own purchase**:

- **tax** — a purchase-tied price reduction is an adjustment, not income (Rev. Rul. 2008-26).
- **money-transmission** — no value moves between persons; the payer discharges its own promotional
  debt.
- **escheat** — the holder receives goods/services (a discount), not money — the record is not
  monetized.

a purchase-tied rebate a merchant honors and the promisor later reimburses is the manufacturer-coupon
shape: the promisor reimburses a merchant for a discount it promised the shopper — it discharges its
**own** debt, not a third party's funds. this differs from a directed payout, where value moves from
one person to another.

---

## the redline

| safe side | the line | unsafe side |
|-----------|----------|-------------|
| redemption lands as a **discount on the holder's own purchase** — value moves to no one | "does the redemption move money **between persons**?" | redemption pays **cash to a third party** on the holder's instruction — value moves A → B |
| issuer discharges its **own** promo debt from its own revenue | | issuer **accepts from A and transmits to B** — a conduit |
| record yields goods/services, not money | "does the **record become money**?" | record yields a directed cash payout — monetized |

**the separator:** does the redemption **move money between persons**? if the reward lands as a
discount on the holder's own purchase (value to no one), it is outside money-transmission and does
not monetize the record. if it pays cash to anyone — holder or a third party — it is a cash-out,
and a payout to a third party adds the transmission element on top.

---

## the honest gap

- **state money-transmitter regimes vary.** the federal two-element definition is the clearest
  articulation, but state license thresholds, agent-of-the-payee exemptions, and closed-loop
  carve-outs differ by state; confirm each state of operation.
- **the agent-of-payee question is fact-sensitive.** some directed-payment structures claim an
  agent-of-the-payee exemption; whether it applies to a reward redemption is counsel-confirmable and
  should not be assumed.

## key takeaways

| question | answer |
|----------|--------|
| does a payout to a third party (not the holder) avoid a cash-out? | no — the record is still monetized, so escheat still breaks |
| does a redirect of the payee help at all? | no — it **adds** money-transmission (accept-from-A, transmit-to-B) |
| what is the "to another person" phrase? | the money-transmission trigger, not an escape |
| what form avoids both regimes? | a discount on the holder's **own** purchase — value moves to no one |
| the separator? | does the redemption move money **between persons**? |

## .see also

- `hazard.cash-redeemed-reward-breaks-loyalty-escheat.[hazard].md` — the possibility test on the record
- `define.boundary.rebate-inside-vs-outside-the-reward-instrument.[lesson].md` — inside vs outside the instrument
- `hazard.cashout-money-transmitter-license.CONDITIONAL.[hazard].md` — when an MT license attaches
- `hazard.stored-value-if-deposits-or-transfer.[hazard].md` — the other flip-triggers
- `ref.casestudy.manufacturer-rebate-escheat.[ref].md` — the manufacturer-coupon fact pattern

## .sources

1. [31 CFR § 1010.100](https://www.law.cornell.edu/cfr/text/31/1010.100) — money-transmission two-element test
2. [D.C. Code § 41-151.02](https://code.dccouncil.gov/us/dc/council/code/sections/41-151.02) — loyalty-record exclusion + "otherwise monetized" carve-back
3. [Ind. Code § 32-34-1.5-3](https://codes.findlaw.com/in/title-32-property/in-code-sect-32-34-1-5-3/) — same monetizable carve-back
4. [IRS Rev. Rul. 2008-26](https://www.irs.gov/pub/irs-drop/rr-08-26.pdf) — a purchase-tied discount is a price adjustment, not income
5. [Bank Secrecy Act — Prepaid Access Final Rule (Federal Register)](https://www.federalregister.gov/documents/2011/07/29/2011-19116/bank-secrecy-act-regulations-definitions-and-other-regulations-relating-to-prepaid-access) — value that moves between persons
6. [Fla. Stat. § 501.95](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.95.html) — loyalty/promotional discount carve-out
7. [escheat — Cornell LII (Wex)](https://www.law.cornell.edu/wex/escheat) — escheat as a custodial claim on abandoned property

## .publishability

☀️ **fullsun** (share) — generic public-law hazard; no client identity, no client-specific mechanic,
neutral both-sides voice. the two traps and the safe discount form are stated as the law's lines,
described symmetrically, grounded in verbatim authority.

## .date researched

2026-07-15
