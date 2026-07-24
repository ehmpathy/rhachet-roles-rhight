# hazard.contingent-reward-referral-selling.five-state

## .what

a contingent referral reward — "give us your friends, earn a benefit when they buy" — is regulated
in every state, but the **label** and the **teeth** diverge sharply. this brief runs the five-state
baseline sweep (TX, IN, FL, CA, NY) required by `rule.require.five-state-baseline`, quotes each
state's text verbatim, and names the strictest as the nationwide floor.

the punchline: the **same element set** — (1) the reward induces the *referrer's own* purchase,
(2) it is paid to *name / introduce* other people, (3) it is *contingent* on those people later
buying/joining, and (4) a *chance* element is present — determines which side of each state's ban a
program lands on. remove those elements (a link-share, a guaranteed promo bonus for a real arm's-
length sale, no chance) and the bans fall away in all five. keep them and the label ranges from a
civil deceptive act (IN) to a **felony** (TX pyramid) or a **criminal endless chain + private
rescission** (CA).

## .why

- a design tuned to the most lenient state breaks on launch into the strict ones. the five-state
  sweep surfaces the strictest constraint up front.
- referral law is **structural**, not disclosure-curable: the classification turns on the elements,
  so the fix is the design, not the fine print.
- state consumer/criminal law attaches by **where the consumer is served**, not where the company is
  incorporated (see `rule.require.five-state-baseline` → `.the nexus note`) — so all five served
  markets carry their own duty.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance.

---

## the five-state matrix

| state | the rule | verbatim-cited authority | character | strict? |
|-------|----------|--------------------------|-----------|---------|
| TX | chain-referral sale = DTPA deceptive act (civil); a *pyramid* scheme = state-jail felony (criminal) | Tex. Bus. & Com. Code § 17.46(b)(19); § 17.461 | civil **and** criminal (two tracks) | |
| IN | contingent referral reward = enumerated deceptive act | Ind. Code § 24-5-0.5-3(b)(9) | civil deceptive act | |
| FL | contingent referral selling = **declared a lottery**; conduct of one = 1st-deg misdemeanor | Fla. Stat. § 849.0915 | criminal (misdemeanor) | |
| CA | to contrive/operate an **endless chain** = public offense + participant may **rescind** and recover all consideration | Cal. Penal Code § 327; Cal. Civ. Code § 1689.2 | criminal **and** private civil rescission | ⭐ |
| NY | a **chain distributor scheme** is illegal and **deemed a security** (Martin Act enforcement) | N.Y. Gen. Bus. Law § 359-fff | civil + criminal via Art. 23-A | |

**baseline = California** — it is the only one of the five that stacks a criminal prohibition
(Penal § 327, a wobbler punishable by up to three years) **with a private consumer rescission-plus-
fees remedy** (Civ § 1689.2). a design that clears CA's endless-chain line clears a defensible
nationwide floor for the introduce-more-people structure.

---

## the statutes verbatim

### TX — Tex. Bus. & Com. Code § 17.46(b)(19) (civil, DTPA laundry-list) + § 17.461 (criminal, pyramid)

Texas splits the redline across two provisions. the DTPA laundry list makes a chain-referral sales
plan a deceptive act:

> "using or employing a chain referral sales plan in connection with the sale or offer to sell of
> goods, merchandise, or anything of value, which uses the sales technique, plan, arrangement, or
> agreement in which the buyer or prospective buyer is offered the opportunity to purchase
> merchandise or goods and in connection with the purchase receives the seller's promise or
> representation that the buyer shall have the right to receive compensation or consideration in any
> form for furnishing to the seller the names of other prospective buyers if receipt of the
> compensation or consideration is contingent upon the occurrence of an event subsequent to the time
> the buyer purchases the merchandise or goods"

a § 17.46(b) violation is actionable by a consumer under § 17.50, which on a "knowingly" verdict lets
"the trier of fact … award not more than three times the amount of economic damages" plus mandatory
attorney's fees. separately, the **pyramid** statute is criminal:

> "A person commits an offense if the person contrives, prepares, establishes, operates, advertises,
> sells, or promotes a pyramid promotional scheme. An offense under this subsection is a state jail
> felony."

where a "'Pyramid promotional scheme' means a plan or operation by which a person gives consideration
for the opportunity to receive compensation that is derived primarily from a person's introduction of
other persons to participate in the plan or operation rather than from the sale of a product."

**source**: [Tex. Bus. & Com. Code § 17.46](https://texas.public.law/statutes/tex._bus._&_com._code_section_17.46)
· [Tex. Bus. & Com. Code § 17.461](https://codes.findlaw.com/tx/business-and-commerce-code/bus-com-sect-17-461/)
(fallback mirrors — the official statutes.capitol.texas.gov is a javascript app that returns no
statutory text to an automated fetch; counsel should confirm against the official pdf.)

### IN — Ind. Code § 24-5-0.5-3(b)(9) (civil deceptive act)

> "That the consumer will receive a rebate, discount, or other benefit as an inducement for entering
> into a sale or lease in return for giving the supplier the names of prospective consumers or
> otherwise helping the supplier to enter into other consumer transactions, if earning the benefit,
> rebate, or discount is contingent upon the occurrence of an event subsequent to the time the
> consumer agrees to the purchase or lease."

**source**: [Ind. Code § 24-5-0.5-3](https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-5-0-5-3/)
(full deep-dive: `hazard.contingent-reward-referral-selling.in.[hazard].md`)

### FL — Fla. Stat. § 849.0915 (criminal lottery)

> "Referral selling, whereby the seller gives or offers a rebate or discount to the buyer as an
> inducement for a sale in consideration of the buyer's providing the seller with the names of
> prospective purchasers, is declared to be a lottery if earning the rebate or discount is contingent
> upon the occurrence of an event subsequent to the time the buyer agrees to buy."

> "Any person conducting a lottery by referral selling is guilty of a misdemeanor of the first
> degree, punishable as provided in s. 775.082 or s. 775.083."

**source**: [Fla. Stat. § 849.0915](https://www.flsenate.gov/Laws/Statutes/2025/849.0915)
(full deep-dive: `hazard.contingent-reward-referral-selling.fl.[hazard].md`)

### CA — Cal. Penal Code § 327 (criminal endless chain) + Cal. Civ. Code § 1689.2 (private rescission)

the criminal prohibition and its definition:

> "Every person who contrives, prepares, sets up, proposes, or operates any endless chain is guilty
> of a public offense, and is punishable by imprisonment in the county jail not exceeding one year or
> in state prison for 16 months, two, or three years."

> "As used in this section, an 'endless chain' means any scheme for the disposal or distribution of
> property whereby a participant pays a valuable consideration for the chance to receive compensation
> for introducing one or more additional persons into participation in the scheme or for the chance
> to receive compensation when a person introduced by the participant introduces a new participant."

and — the edge CA adds that no other state pairs with the crime — a **private rescission** remedy:

> "A participant in an endless chain scheme, as defined in Section 327 of the Penal Code, may rescind
> the contract upon which the scheme is based, and may recover all consideration paid pursuant to the
> scheme, less any amounts paid or consideration provided to the participant pursuant to the scheme."

with a fee-shift: "the court may, upon motion, award reasonable attorney's fees to a prevailing
plaintiff."

**source**: [Cal. Penal Code § 327](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=327.)
· [Cal. Civ. Code § 1689.2](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1689.2.)

note the CA definition's own escape hatch: "Compensation, as used in this section, does not mean or
include payment based upon sales made to persons who are not participants in the scheme and who are
not purchasing in order to participate in the scheme." a reward paid for a **real arm's-length sale**
to an end consumer — not to recruit the next recruiter — is outside the endless-chain definition by
its own terms.

### NY — N.Y. Gen. Bus. Law § 359-fff (chain distributor scheme deemed a security)

> "It shall be illegal and prohibited for any person, partnership, corporation, trust or association,
> or any agent or employee thereof, to promote, offer or grant participation in a chain distributor
> scheme."

NY then routes enforcement through its securities law: a chain distributor scheme "shall constitute a
security within the meaning of this article and shall be subject to all of the provisions of this
article" — which pulls in the Martin Act's attorney-general civil and criminal machinery.

**source**: [N.Y. Gen. Bus. Law § 359-fff](https://www.nysenate.gov/legislation/laws/GBS/359-FFF)

---

## the common element set — the two sides of each element

| # | element | inside a ban | outside every ban |
|---|---------|--------------|-------------------|
| 1 | benefit induces the **referrer's own** purchase | referrer must buy; benefit is the carrot | referrer earns via referral, need not buy |
| 2 | paid to **name / introduce** other people | referrer submits names or recruits participants | referrer shares a **link/code** to a real sale |
| 3 | **contingent** on a later event | reward only if the prospect later buys/joins | present on both sides — not decisive alone |
| 4 | a **chance** element (→ lottery/security flavor) | random draw / recruit-the-recruiter payout | reward **guaranteed** for a real end-consumer sale |

the CA "endless chain" and NY "chain distributor" tests sharpen element 2: they bite hardest when the
compensation flows from an **introduction of the next participant** rather than from a genuine sale to
an end consumer. FL and IN bite hardest on element 1 (the referrer's own-purchase inducement) plus
element 3.

---

## severity

**blocker** (if a design carries the full element stack in any served state). the exposure ranges from
a civil deceptive-act suit (IN), to a first-degree misdemeanor (FL), to a state-jail felony (TX
pyramid), to a criminal endless chain **plus** a private consumer rescission (CA), to a securities
violation (NY). none of these is disclosure-curable — the classification turns on the structure.

---

## the honest gap

- no state's modern **case law** that applies these statutes to a link-based digital referral program
  was found; the element-analysis read (a link-share + guaranteed reward + real end-consumer sale
  sits outside all five) is a **counsel-confirmable** position, not settled precedent.
- the **Texas** quotes rest on public-law mirrors because the official portal is not machine-readable;
  confirm against the official pdf.
- a parallel **civil UDAP** track (FL FDUTPA, TX DTPA, NY GBL §§ 349/350, IN DCSA) can still reach
  deceptive *market copy* for a structurally-clean program — see `ref.udap-remedy-teeth.five-state.[ref].md`.

## key takeaways

| question | answer |
|----------|--------|
| strictest of the five? | **CA** — criminal endless chain (§ 327) + private rescission (§ 1689.2) |
| which states are criminal? | FL (misdemeanor), TX (pyramid felony), CA (wobbler), NY (via Martin Act) |
| which is "lightest"? | IN — civil deceptive act only (still AG + private suit) |
| what removes every ban? | link-not-names + guaranteed + real end-consumer sale + no chance |
| disclosure-curable? | no — structural classification |

## .publishability

☀️ **fullsun** (share) — generic public-law hazard; five-state matrix of primary statutes, neutral
both-sides voice, no client identity or client-specific mechanic.

## .see also

- `hazard.contingent-reward-referral-selling.in.[hazard].md` — the IN deep-dive
- `hazard.contingent-reward-referral-selling.fl.[hazard].md` — the FL deep-dive
- `hazard.sweepstakes-registration-and-bond.[hazard].md` — the chance-element / registration overlay
- `define.referral-reward-vs-referral-selling.[lesson].md`
- `define.boundary.link-vs-names-of-prospects.[lesson].md`
- `ref.udap-remedy-teeth.five-state.[ref].md` — the civil-remedy multiplier map
- `rule.require.five-state-baseline.[rule].md` (repo-wide) — why the sweep is mandatory

## .sources

1. [Tex. Bus. & Com. Code § 17.46 — DTPA laundry list incl. (b)(19) chain-referral (public.law mirror)](https://texas.public.law/statutes/tex._bus._&_com._code_section_17.46)
2. [Tex. Bus. & Com. Code § 17.461 — pyramid promotional scheme, state-jail felony (FindLaw)](https://codes.findlaw.com/tx/business-and-commerce-code/bus-com-sect-17-461/)
3. [Ind. Code § 24-5-0.5-3 — deceptive acts, subsection (b)(9)](https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-5-0-5-3/)
4. [Fla. Stat. § 849.0915 — referral selling declared a lottery (FL Senate, official)](https://www.flsenate.gov/Laws/Statutes/2025/849.0915)
5. [Cal. Penal Code § 327 — endless chain schemes (CA Legislative Info, official)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=327.)
6. [Cal. Civ. Code § 1689.2 — private rescission for endless-chain participants (CA Legislative Info, official)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1689.2.)
7. [N.Y. Gen. Bus. Law § 359-fff — chain distributor scheme deemed a security (NYS Senate, official)](https://www.nysenate.gov/legislation/laws/GBS/359-FFF)

## .date researched

2026-07-22
