# hazard.expiration-does-not-defeat-escheat-on-monetizable-balance

## .what

one common assumption is that an "expires if unused within N years" term makes the expired balance
revert to the issuer, so no unclaimed-property (escheat) duty attaches. for a **monetizable**
balance — one redeemable for money — that assumption is **wrong twice over**:

1. **anti-limitation** — unclaimed-property law expressly says a contract, statute, or court-order
   time bar on the owner's right to recover **does not** stop the property from being presumed
   abandoned. the expiration clause does not defeat the state's claim.
2. **private-escheat void** — a clause that reverts abandoned value **to the issuer** is a "private
   escheat," which ~30 states declare **void and unenforceable** as against public policy.

expiration only works where the balance is **genuinely non-monetizable to begin with** — a pure
loyalty discount that was never money — in which case there was no escheatable property to defeat.
so expiration is not a tool that **cures** a cashable balance; it only confirms the character of a
balance that was already exempt.

## .why

- unclaimed-property law is a **public** law; a private agreement can not contract around it. a
  time-bar the issuer writes into its own terms is exactly the kind of private cutoff the
  anti-limitation and anti-private-escheat provisions target.
- the state's escheat claim is **derivative** — it steps into the owner's shoes. that cuts **both**
  ways: a **genuinely extinguished** obligation (one that never existed or lawfully ended for a
  reason independent of abandonment) defeats escheat, but a **sham forfeiture** dressed as an
  expiration does not extinguish anything — the owner still had a monetizable claim, so the state
  takes it.
- gift-card / consumer law separately restricts short expirations on money-bearing instruments, so
  even setting escheat aside, "expires in 1 year" can be independently unlawful on a cashable
  balance.

> **not legal advice.** informational groundwork for counsel to validate.

---

## trap 1 — the anti-limitation provision

the uniform act's anti-limitation clause states the rule directly:

> "the expiration of a period of limitation on the owner's right to receive or recover property,
> whether specified by contract, statute, or court order, does not preclude the property from being
> presumed abandoned."

**source**: [Revised Uniform Unclaimed Property Act — ABA Business Law Today](https://www.americanbar.org/groups/business_law/resources/business-law-today/2018-february/the-revised-uniform-unclaimed-property-act/)

so a "use it or lose it in N years" clause does not, by its own force, stop the balance from
escheating. the time bar the issuer relies on is the very thing the provision neutralizes.

---

## trap 2 — a revert-to-issuer clause is a void "private escheat"

a clause that sweeps the lapsed balance **back to the issuer** is a private escheat, and courts and
statutes void it. the California Court of Appeals stated the principle:

> "the [Unclaimed Property Law], as a law established for a public reason, cannot be contravened by a
> private agreement"

and Delaware codifies the void-clause rule verbatim:

> "Any provision in a certificate of incorporation, by law, trust agreement, contract or any other
> writing ... which provides that upon the owner's failure to act or make a claim regarding property
> in possession of the holder, that such property reverts to or becomes the property of the holder,
> in contravention of this chapter, shall be void and unenforceable."

**source**: [private-escheat prohibition (Mondaq)](https://www.mondaq.com/unitedstates/corporate-and-company-law/29897/unclaimed-property-law-compliance-a-company-cannot-avoid-unclaimed-property-law-by-creating-a-private-escheat)

approximately 30 states have enacted similar anti-private-escheat provisions. the issuer can not
write itself the abandoned money.

---

## where expiration DOES hold — a genuinely non-monetizable balance

the derivative-rights doctrine cuts both ways. a balance that is **genuinely** extinguished — never
money in the first place — presents **no** property for the state to take, because the owner had
none:

- a pure **loyalty discount** that only ever reduced a price (never cash, never monetizable) is
  outside the escheatable universe entirely — the loyalty-card exclusion applies. see
  `hazard.cash-redeemed-reward-breaks-loyalty-escheat`.
- its expiration is lawful **because** the record was already non-property, not because the
  expiration clause did any escheat-defeating work.

the gift-certificate carve-outs confirm the split: promotional/loyalty value with no separate charge
paid may expire, while purchased money-bearing value may not.

> "provided in conjunction with a loyalty or promotional program when the recipient does not pay a
> separate identifiable charge for the certificate"

**source**: [Fla. Stat. § 501.95](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.95.html)

so the lever is the **character of the balance**, not the expiration clause. non-monetizable →
expiration is fine (no property to escheat). monetizable → expiration is void as a private cutoff.

---

## the redline

| safe side | the line | unsafe side |
|-----------|----------|-------------|
| a **genuinely non-monetizable** balance (pure loyalty discount) — expiration is lawful because there was no property | "does the owner still hold a claim to money?" | a **monetizable** balance with a short expiration meant to revert value to the issuer — a void private escheat |
| an obligation extinguished for a reason **independent** of abandonment (a real, valid term) | | a forfeiture dressed as expiration on a cashable balance — the state takes it via anti-limitation |

**the separator:** did the owner ever hold a **claim to money**? if yes, an expiration clause can not
strip it — the anti-limitation and anti-private-escheat rules void the cutoff. if no, there was never
escheatable property to defeat.

---

## the honest gap

- **the derivative-rights line is fact-sensitive.** a term that genuinely and lawfully ends an
  obligation (independent of abandonment) can extinguish it, but drawing that line for a modern
  reward balance is counsel-confirmable — the anti-limitation provision reads broadly and makes no
  distinction between legitimate business terms and circumvention.
- **per-state divergence** — the anti-limitation and anti-private-escheat provisions, and the
  gift-card expiration restrictions, differ by state (~30 states have the private-escheat void).
  confirm each state of operation.

## key takeaways

| question | answer |
|----------|--------|
| does "expires in N years" stop a cashable balance from escheating? | no — anti-limitation says a time bar does not preclude abandonment |
| does a revert-to-issuer clause work? | no — it is a "private escheat," void in ~30 states |
| when does expiration hold? | only for a **genuinely non-monetizable** balance — which had no escheatable property anyway |
| what actually decides it? | the **character** of the balance (monetizable vs not), not the expiration clause |
| is a short expiration otherwise safe? | no — gift-card law separately restricts short expirations on money-bearing value |

## .see also

- `hazard.cash-redeemed-reward-breaks-loyalty-escheat.[hazard].md` — the monetizable-record possibility test
- `ref.casestudy.manufacturer-rebate-escheat.[ref].md` — an extinguished obligation and escheat
- `define.boundary.rebate-inside-vs-outside-the-reward-instrument.[lesson].md` — inside vs outside the instrument
- `define.points-are-a-debt-not-stored-value.[lesson].md` — the debt characterization the exclusion rests on

## .sources

1. [Revised Uniform Unclaimed Property Act — ABA Business Law Today](https://www.americanbar.org/groups/business_law/resources/business-law-today/2018-february/the-revised-uniform-unclaimed-property-act/) — anti-limitation provision verbatim
2. [private-escheat prohibition (Mondaq)](https://www.mondaq.com/unitedstates/corporate-and-company-law/29897/unclaimed-property-law-compliance-a-company-cannot-avoid-unclaimed-property-law-by-creating-a-private-escheat) — CA court + Delaware void-clause verbatim
3. [D.C. Code § 41-151.02](https://code.dccouncil.gov/us/dc/council/code/sections/41-151.02) — loyalty-record exclusion + monetizable carve-back
4. [Ind. Code § 32-34-1.5-3](https://codes.findlaw.com/in/title-32-property/in-code-sect-32-34-1-5-3/) — same monetizable carve-back
5. [Fla. Stat. § 501.95](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.95.html) — promotional/loyalty may expire; purchased value may not
6. [NAUPA credit-memos dormancy by state — unclaimed.org](https://unclaimed.org/property-type-credit-memos/) — dormancy periods on uncashed credit instruments
7. [escheat — Cornell LII (Wex)](https://www.law.cornell.edu/wex/escheat) — escheat as a derivative, custodial claim

## .publishability

☀️ **fullsun** (share) — generic public-law hazard; no client identity, no client-specific mechanic,
neutral both-sides voice. the anti-limitation and private-escheat rules are stated as the law's line,
the where-it-holds and where-it-breaks cases described symmetrically, grounded in verbatim authority.

## .date researched

2026-07-15
