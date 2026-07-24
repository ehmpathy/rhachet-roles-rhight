# hazard.indirection-does-not-launder-monetizability

## .what

one common question: if a "non-cashable" loyalty instrument converts into a **second** instrument, and
that second instrument (or a third downstream) reaches cash, does the first instrument stay a loyalty
record because *it* never becomes money directly?

it does not. the escheat loyalty-exclusion carve-back is a **possibility test on the record** — it
asks whether the record "may be redeemed for money **or otherwise monetized** by the issuer." a chain
that reaches cash **anywhere downstream** makes the first record monetizable **by** the issuer.
indirection through an intermediate instrument does not launder the monetizability; one bridge to cash
taints the whole chain.

the converse is also true: a conversion of one **strictly non-cashable** instrument into **another**
strictly non-cashable instrument is not monetization — it is still "redeemed only for goods, services,
or a discount." the chain is only as monetizable as its most-cashable link.

## .why

- "or otherwise monetized by the issuer" is deliberately broad — it reaches monetization by **any**
  path the issuer controls, not only a direct cash redemption of the record itself.
- an intermediate instrument the issuer also controls is part of the issuer's own machinery, so a
  cash exit reachable through it is a cash exit the issuer offers on the first record.
- the possibility test is about **capability**, not the usual path: if a route to cash **exists**,
  the record "may be" monetized, even if most holders never take that route.

> **not legal advice.** informational groundwork for counsel to validate.

---

## the possibility test reaches monetization "by the issuer" through any path

the carve-back language is broad on purpose:

> "The term does not include a record that may be redeemed for money or otherwise monetized by the
> issuer."

**source**: [D.C. Code § 41-151.02](https://code.dccouncil.gov/us/dc/council/code/sections/41-151.02) · [Ind. Code § 32-34-1.5-3](https://codes.findlaw.com/in/title-32-property/in-code-sect-32-34-1-5-3/)

two clauses do the work:

- **"may be redeemed for money"** — a capability test; a route that **exists** is enough.
- **"or otherwise monetized by the issuer"** — a catch-all that reaches monetization by paths other
  than a direct cash redemption, so long as the **issuer** offers the path.

a conversion into a second issuer-controlled instrument that reaches cash is monetization "by the
issuer" through an indirect path — inside the catch-all.

---

## the anti-limitation parallel — form does not defeat substance

the same "substance over form" principle runs through unclaimed-property law generally. a private
contractual cutoff cannot defeat the state's claim:

> "the expiration of a period of limitation on the owner's right to receive or recover property,
> whether specified by contract, statute, or court order, does not preclude the property from being
> presumed abandoned."

**source**: [Revised Uniform Unclaimed Property Act — ABA Business Law Today](https://www.americanbar.org/groups/business_law/resources/business-law-today/2018-february/the-revised-uniform-unclaimed-property-act/)

just as a time-bar dressed as a contract term does not defeat escheat, a cash exit dressed as a
two-step conversion does not defeat the monetizable-record test. the law looks at what the issuer's
machinery **can** do, not at the number of hops.

---

## where a multi-instrument chain stays non-monetizable

a multi-instrument chain stays outside the monetizable-record test **only where every link is
non-cashable**, and falls inside it **where any link reaches cash**:

- **non-monetizable chain** — instrument A (loyalty record) → converts to → instrument B (also
  strictly spend-only / non-cashable / non-transferable) → redeems to a **discount / goods /
  services**. no link, at any hop, reaches cash, a cashable instrument, or a transferable bearer unit.
  A is still "redeemed only for goods, services, or a discount," and both A and B stay excluded
  loyalty records.
- **monetizable chain** — any link, at any hop, reaches cash, a cashable instrument, or a transferable
  bearer unit. that cash exit is monetization "by the issuer" of A, and A loses the exclusion.

the chain is characterized by its **most-cashable link**: if none touches money, the records stay
excluded; if one does, the first record is monetizable.

---

## the redline

| non-monetizable chain (records stay exempt) | the line | monetizable chain (exemption lost) |
|-----------------------------------|----------|--------------------------------|
| every instrument in the chain is **strictly non-cashable** | "does **any** downstream path reach money?" | a downstream instrument reaches **cash** (or a cashable/transferable unit) |
| A → B → discount / goods / services | | A → B → cash (indirection through B) |
| monetization is impossible at **every** hop | "is the record monetizable **by the issuer** on any path?" | monetizable via a route the issuer controls, however indirect |

**the separator:** is there **any** route — direct or through an intermediate issuer-controlled
instrument — by which the first record can reach money? where every hop is non-cashable, the chain
stays outside the monetizable-record test. one cash exit anywhere makes the first record monetizable
and collapses its exclusion.

---

## the honest gap

- **"controlled by the issuer" is fact-sensitive at the edges.** a conversion into a genuinely
  independent third-party instrument the issuer does not control may present a different question
  than an issuer-run intermediate; to draw that line is counsel-confirmable.
- **per-state divergence** — the monetizable-record line and its breadth differ by state; confirm
  each state of operation.

## key takeaways

| question | answer |
|----------|--------|
| does a non-cashable record stay exempt if it converts into a cashable one? | no — a downstream cash exit monetizes it "by the issuer" |
| does an intermediate instrument launder the monetizability? | no — the catch-all reaches any issuer-controlled path |
| is a multi-instrument chain ever non-monetizable? | yes — where **every** link is strictly non-cashable |
| what decides it? | whether **any** downstream path reaches money |
| the separator? | the **most-cashable link** — one cash exit anywhere taints the chain |

## .see also

- `hazard.cash-redeemed-reward-breaks-loyalty-escheat.[hazard].md` — the possibility test on the record
- `define.boundary.rebate-inside-vs-outside-the-reward-instrument.[lesson].md` — inside vs outside the instrument
- `define.boundary.transferable-loyalty-point-flips-toward-stored-value.[lesson].md` — a transferable link is also monetizable
- `hazard.expiration-does-not-defeat-escheat-on-monetizable-balance.[hazard].md` — form does not defeat substance
- `hazard.directed-third-party-payout-on-redemption-is-money-transmission.[hazard].md` — the payee-redirect question
- `define.boundary.redeem-and-grant-vs-convert-the-reward-record.[lesson].md` — grant-vs-convert as distinct legal characters

## .sources

1. [D.C. Code § 41-151.02](https://code.dccouncil.gov/us/dc/council/code/sections/41-151.02) — loyalty-record exclusion + "or otherwise monetized" catch-all
2. [Ind. Code § 32-34-1.5-3](https://codes.findlaw.com/in/title-32-property/in-code-sect-32-34-1-5-3/) — same monetizable carve-back
3. [Revised Uniform Unclaimed Property Act — ABA Business Law Today](https://www.americanbar.org/groups/business_law/resources/business-law-today/2018-february/the-revised-uniform-unclaimed-property-act/) — anti-limitation: form does not defeat the state's claim
4. [private-escheat prohibition (Mondaq)](https://www.mondaq.com/unitedstates/corporate-and-company-law/29897/unclaimed-property-law-compliance-a-company-cannot-avoid-unclaimed-property-law-by-creating-a-private-escheat) — a private structure cannot contract around unclaimed-property law
5. [31 CFR § 1010.100](https://www.law.cornell.edu/cfr/text/31/1010.100) — prepaid-access / money-transmission definitions a downstream cash exit re-opens
6. [Fla. Stat. § 501.95](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.95.html) — loyalty/promotional carve-out (spend-only value)
7. [escheat — Cornell LII (Wex)](https://www.law.cornell.edu/wex/escheat) — escheat as a custodial claim on abandoned property

## .publishability

☀️ **fullsun** (share) — generic public-law hazard; no client identity, no client-specific mechanic,
neutral both-sides voice. the possibility-test breadth and the clean-chain condition are stated as
the law's line, both sides described symmetrically, grounded in verbatim authority.

## .date researched

2026-07-15
