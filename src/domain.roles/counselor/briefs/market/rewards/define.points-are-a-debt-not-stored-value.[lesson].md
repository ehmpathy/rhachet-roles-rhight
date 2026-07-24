# define.points-are-a-debt-not-stored-value

## .what

the anchor concept for reward-point law: a reward point can be characterized either as **a debt the
issuer owes** a person for a contribution — a booked **liability** (accounts-payable-like) — or as
**stored value / a deposit** the issuer holds. the two characterizations are **not** a currency vs
non-currency question; they turn on whose money the balance is.

which characterization applies decides whether **three regimes** attach:

- **money-transmitter law** (federal registration + state licensure)
- **stored-value / prepaid-access law** (FinCEN + Reg E consumer-protection duties)
- **unclaimed-property / escheat** (state custody of abandoned balances)

## .why

- each of the three regimes turns on the same fork: is the balance **money a holder deposited** (their
  funds, held by the issuer) or **a liability the issuer incurred** (its own money, offset by a payable
  it owes for a contribution)?
- a point **owed for a contribution** is the second kind — an ordinary payable, the same species as an
  accrued affiliate commission
- the two characterizations move together: on the debt side all three regimes release; on the deposit
  side all three attach

> **not legal advice.** informational groundwork for counsel to validate.

---

## the fork that sorts points across three regimes

```
                          did a person DEPOSIT funds with the issuer?
                                          │
                 ┌────────────────────────┴────────────────────────┐
                 │ NO                                               │ YES
                 ▼                                                  ▼
      the issuer INCURRED A LIABILITY                          the issuer HOLDS A DEPOSIT
      for a contribution                                  of someone else's funds
      (its own money; owes an offset)                     (their money; the issuer custodies it)
                 │                                                  │
                 ▼                                                  ▼
         a DEBT / PAYABLE                                  STORED VALUE / PREPAID
         (accounts-payable-like)                           (a money-transmission asset)
                 │                                                  │
     ┌───────────┼───────────┐                          ┌──────────┼──────────┐
     ▼           ▼           ▼                          ▼          ▼          ▼
  money-      stored-     escheat                     money-     stored-    escheat
  transmit    value       (mostly                     transmit   value      (attaches to
   → OUTSIDE  → OUTSIDE    exempt)                      → REGULATED  → REGULATED  balances)
```

the debt branch sits outside on **all three** columns; the deposit branch sits inside on all three.
the debt-vs-deposit characterization is the single fact that sorts a point across every regime.

---

## the three-regime table — each turns on debt-vs-deposit

| regime | the test it applies | debt (earned, owed) → | deposit (loaded, held) → |
|--------|---------------------|------------------------|---------------------------|
| **money transmission** | did the issuer accept "funds… that substitutes for currency" from one person to transmit to another? | no funds accepted; the issuer owes its own liability → **outside** | funds accepted/held for transfer → **money transmitter** |
| **stored value / prepaid access** | is there "value of funds that have been paid in advance"? | no sum was paid in advance; the point was earned → **outside** | value paid in advance, retrievable later → **prepaid access** |
| **unclaimed property / escheat** | is the balance a "stored-value card" (consideration paid) or a "loyalty card" (no consideration)? | no consideration paid → **loyalty card → excluded** | consideration paid, monetizable → **escheatable** |

### column 1 — money transmission

federal law defines the regulated business around **acceptance and transmission of value that
substitutes for currency**:

> "any business other than the United States Postal Service which—(A) provides check cashing,
> currency exchange, or money transmitting or remittance services, or issues or redeems money
> orders, travelers' checks, and other similar instruments or any other person who engages as a
> business in the transmission of currency, funds, or value that substitutes for currency"

**source**: [31 U.S.C. § 5330(d)(1)](https://www.law.cornell.edu/uscode/text/31/5330)

the FinCEN rule defines the service the same way — it needs an **acceptance** step:

> "acceptance of currency, funds, or other value that substitutes for currency from one person and
> the transmission of currency, funds, or other value that substitutes for currency to another
> location or person by any means"

**source**: [31 CFR § 1010.100(ff)(5)(i)(A)](https://www.law.cornell.edu/cfr/text/31/1010.100)

an earned point has **no acceptance step** — no one handed the issuer funds to move. the FinCEN rule even
carves out value moved as a mere incident of a person's own sale of goods or services:

> "Accepts and transmits funds only integral to the sale of goods or the provision of services, other
> than money transmission services, by the person who is accepting and transmitting the funds."

**source**: [31 CFR § 1010.100(ff)(5)(ii)(F)](https://www.law.cornell.edu/cfr/text/31/1010.100#ff_5)

the state analogue reads the same way — florida's money-transmitter definition needs an intermediary
who **receives** value to move it:

> "a corporation, limited liability company, limited liability partnership, or foreign entity
> qualified to do business in this state which receives currency, monetary value, a payment
> instrument, or virtual currency for the purpose of acting as an intermediary to transmit currency,
> monetary value, a payment instrument, or virtual currency from one person to another location or
> person by any means"

**source**: [Fla. Stat. § 560.103(24)](https://www.flsenate.gov/Laws/Statutes/2025/560.103)

### column 2 — stored value / prepaid access

prepaid access is defined around **funds paid in advance**:

> "Access to funds or the value of funds that have been paid in advance and can be retrieved or
> transferred at some point in the future through an electronic device or vehicle, such as a card,
> code, electronic serial number, mobile identification number, or personal identification number"

**source**: [31 CFR § 1010.100(ww)](https://www.law.cornell.edu/cfr/text/31/1010.100)

the consumer-side analogue (Reg E "prepaid account") is likewise built for value **loaded** and
usable across unaffiliated merchants:

> "issued on a prepaid basis in a specified amount or not issued on a prepaid basis but capable of
> being loaded with funds thereafter"

and the primary function must be to

> "conduct transactions with multiple, unaffiliated merchants for goods or services, or at automated
> teller machines"

**source**: [12 CFR § 1005.2(b)(3)](https://www.law.cornell.edu/cfr/text/12/1005.2)

an earned point is neither "paid in advance" nor "loaded with funds" — no sum was paid or loaded.
the point exists because the issuer **owes** it, not because someone funded it.

### column 3 — unclaimed property / escheat

kentucky's enacted revised uniform unclaimed property act (KRS 393A.010, a verbatim RUUPA adoption)
splits the world by **consideration**. a stored-value card is a paid-for promise:

> "'Stored-value card': (a) Means a record evidencing a promise made for consideration by the seller
> or issuer of the record that goods, services, or money will be provided to the owner of the record
> to the value or amount shown in the record"

**source**: [Ky. Rev. Stat. § 393A.010(30)](https://codes.findlaw.com/ky/title-xxxiv-descent-wills-and-administration-of-decedents-estates/ky-rev-st-sect-393a-010/)

a loyalty card is the opposite — **no** direct monetary consideration:

> "'Loyalty card': (a) Means a record given without direct monetary consideration under an award,
> reward, benefit, loyalty, incentive, rebate, or promotional program, which may be used or redeemed
> only to obtain goods or services or a discount on goods or services; and (b) Does not include a
> record that may be redeemed for money or otherwise monetized by the issuer"

and the statute expressly **excludes** a loyalty card from the definition of covered "property":

> "'Property':… (d) Does not include:… 3. A loyalty card"

**source**: [Ky. Rev. Stat. § 393A.010(14), (24)](https://codes.findlaw.com/ky/title-xxxiv-descent-wills-and-administration-of-decedents-estates/ky-rev-st-sect-393a-010/)

a reputable survey confirms this is the settled shape nationwide, not a one-state quirk:

> "Every state that has revised or updated its escheat standards since 2016 has included an express
> exemption for loyalty cards in its statute or rules."

**source**: [unclaimed property — gift, payroll, loyalty and stored-value cards — Eversheds Sutherland](https://www.jdsupra.com/legalnews/unclaimed-property-what-s-new-for-gift-66136/)

so an earned, no-consideration, goods-or-discount-only point maps onto the **loyalty card** — the
one thing the statute removes from escheat.

---

## why "debt" (not "deposit") is the decisive word

escheat itself is a **custody** doctrine — the state takes possession of an owner's property when the
owner cannot be found, not a debtor's own money:

> "Escheat is the passing of an interest in land to the state when a decedent has no will, no heirs,
> or devisees."

**source**: [escheat — Cornell LII (Wex)](https://www.law.cornell.edu/wex/escheat)

the statutory line tracks that same custody idea by **consideration**: a covered stored-value card is
one that was **prefunded** by a buyer, so the unused value the state claims is a customer's own money:

> "'Stored-value card':… (b) Includes a: 1. Record that contains or consists of a microprocessor
> chip, magnetic strip, or other means for the storage of information, which is prefunded and whose
> value or amount is decreased on each use and increased by payment of additional consideration"

**source**: [Ky. Rev. Stat. § 393A.010(30)](https://codes.findlaw.com/ky/title-xxxiv-descent-wills-and-administration-of-decedents-estates/ky-rev-st-sect-393a-010/)

the survey draws the operative test the same way — the loyalty carve-out holds only where the holder
**paid no money** for the balance:

> "Most of the new state laws also include…exemptions for loyalty cards, provided the cardholder did
> not pay money for the card."

**source**: [unclaimed property — gift, payroll, loyalty and stored-value cards — Eversheds Sutherland](https://www.jdsupra.com/legalnews/unclaimed-property-what-s-new-for-gift-66136/)

a point that is **never bought, never loaded, never prefunded** never becomes the
consideration-backed card the statute reaches. it is a book-liability, not a funded asset.

### the books mirror this: a debt, recognized as a liability

the accountancy treatment already books reward points as a liability, not as custodied cash. under
ASC 606:

> "With the introduction of Accounting Standards Codification ASC 606, the liability incurred by
> rewards program is becoming an increasingly important topic."

> "Rewards program liability is also equal to the deferred revenue."

> "The revenue gets recognized when points are redeemed."

**source**: [financial accounting for liability from rewards programs — TrueLoyal](https://www.trueloyal.com/blog/financial-accounting-for-liability-from-rewards-programs)

a payable that is recognized on redemption is a **debt**, not a pot of someone else's money.

### the closest lawful analogue: an accrued affiliate commission

the amazon associates program treats an unpaid earned commission as an ordinary **payment
obligation** that survives even termination — the textbook accounts-payable shape:

> "the rights and obligations of the parties under Sections 3, 4, 5, 6, 7, 8, 10, and 11 of this
> Agreement and as specified in the Program Policies, together with any payable but unpaid payment
> obligations under this Agreement, will survive the termination of this Agreement."

**source**: [Amazon Associates Program Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement)

an earned referral point is the same species: an amount the issuer **owes** for a contribution, carried
as a payable until settled.

---

## the three traits that separate a debt from a deposit

each regime's trigger turns on a specific trait of the balance. on each, the debt side lacks the trait
and the deposit side has it:

| # | trait | debt side (outside) | deposit side (inside) | regime it turns on |
|---|-------|---------------------|-----------------------|--------------------|
| 1 | **earned vs funded** | earned; never loaded, bought, or deposited — no "funds paid in advance", no consideration paid | loaded, bought, or deposited — funds paid in advance, consideration paid | prepaid access + escheat |
| 2 | **transferable vs not** | non-transferable — no "acceptance… to transmit… to another person" | transferable person-to-person — value moves to another person | money transmission |
| 3 | **cashable vs discount-only** | redeemed "only to obtain goods or services or a discount" | "redeemed for money or otherwise monetized" | escheat (RUUPA loyalty-card carve-out) |

trait 3 tracks the RUUPA loyalty-card text: the carve-out holds only for a record "used or redeemed
only to obtain goods or services or a discount" and it "does not include a record that may be redeemed
for money or otherwise monetized by the issuer." a discount-only redemption path stays inside the
carve-out. a separate cash payout earned **for services rendered** is a different instrument — an
ordinary business payable — not a consumer deposit; it is analyzed on its own footing (see the boundary
brief).

florida's gift-certificate statute draws the same line — a reward given with **no separate charge** is
treated as a loyalty/promotional item, not a purchased certificate:

> "if it is provided to the recipient, or to a purchaser for transfer to the recipient, as part of a
> loyalty or promotional program when the recipient does not pay a separate identifiable charge for
> the certificate"

**source**: [Fla. Stat. § 501.95(2)(a)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.95.html)

---

## severity

| if the characterization slips to "deposit"… | consequence |
|----------------------------------------------|-------------|
| money-transmitter | federal FinCEN registration under 31 U.S.C. § 5330 + state money-services licensure (e.g. FL ch. 560), bonding, exams |
| prepaid access | FinCEN prepaid-access + Reg E consumer duties (disclosures, error settlement, liability limits) |
| escheat | unused balances become abandoned property remittable to the state after a dormancy period |

all three attach from the **same** shift — a point that becomes loaded, transferable, or cash-out
value. the three traits above are what the shift crosses.

---

## the honest gap

no court has ruled on whether an earned-debt point escapes all three regimes; the analysis is a
**text-level** read of each regime's trigger, strong but counsel-confirmable. two soft edges to watch:

- a **cash-out** redemption is a real redemption-for-money. it falls on the debt side only where the
  amount is earned **for services rendered** (an ordinary trade payable), not where a consumer redeems a
  promotional balance — the boundary between the two is where the escheat carve-out is won or lost (see
  the boundary brief).
- state statutes vary; not every state has adopted RUUPA's loyalty-card carve-out verbatim, and a
  minority still reach some rewards balances. per-state confirmation is required.

## key takeaways

| question | answer |
|----------|--------|
| what is a reward point, legally? | either a debt owed for a contribution (a booked liability) or stored value held |
| why does "debt vs deposit" matter so much? | it is the same fork all three regimes apply |
| the three regimes it decides? | money transmission, stored value / prepaid access, escheat |
| the decisive fork? | did a person deposit funds (deposit) or did the issuer incur a liability (debt)? |
| what marks it a debt? | ASC 606 books it as a liability; it mirrors an accrued affiliate commission |
| the three traits that separate the sides? | earned vs funded; non-transferable vs transferable; discount-only vs cashable |
| is it settled? | text is strong; per-regime and per-state confirmation still needed |

## .see also

- `define.boundary.earned-debt-vs-deposited-value.[lesson].md`
- `../referrals/define.referral-reward-vs-referral-selling.[lesson].md`
- `../referrals/define.boundary.marketing-bonus-vs-purchase-inducement.[lesson].md`
- `../referrals/define.boundary.link-vs-names-of-prospects.[lesson].md`

## .sources

1. [31 U.S.C. § 5330 — money transmitting business registration](https://www.law.cornell.edu/uscode/text/31/5330)
2. [31 CFR § 1010.100 — FinCEN definitions (money transmission, prepaid access)](https://www.law.cornell.edu/cfr/text/31/1010.100)
3. [31 CFR § 1010.100(ff)(5)(ii)(F) — integral-to-sale exemption](https://www.law.cornell.edu/cfr/text/31/1010.100#ff_5)
4. [12 CFR § 1005.2 — Reg E prepaid account definition](https://www.law.cornell.edu/cfr/text/12/1005.2)
5. [Fla. Stat. § 560.103 — money services business definitions](https://www.flsenate.gov/Laws/Statutes/2025/560.103)
6. [Fla. Stat. § 501.95 — gift certificate / loyalty carve-out](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.95.html)
7. [Ky. Rev. Stat. § 393A.010 — enacted RUUPA definitions (loyalty card / stored-value card / property exclusion)](https://codes.findlaw.com/ky/title-xxxiv-descent-wills-and-administration-of-decedents-estates/ky-rev-st-sect-393a-010/)
8. [unclaimed property — gift, payroll, loyalty and stored-value cards — Eversheds Sutherland](https://www.jdsupra.com/legalnews/unclaimed-property-what-s-new-for-gift-66136/)
9. [escheat — Cornell LII (Wex)](https://www.law.cornell.edu/wex/escheat)
10. [financial accounting for liability from rewards programs (ASC 606) — TrueLoyal](https://www.trueloyal.com/blog/financial-accounting-for-liability-from-rewards-programs)
11. [Amazon Associates Program Operating Agreement — accrued commission as a payment obligation](https://affiliate-program.amazon.com/help/operating/agreement)

## .publishability

☀️ **fullsun** (share) — generic public-law boundary; no client identity, no client-specific mechanic,
neutral both-sides voice. the debt-vs-deposit characterization is stated as the law's line — both
sides described symmetrically, no recurring actor landing on a chosen side — grounded in verbatim
authority.

## .date researched

2026-07-12
