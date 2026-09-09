# rule.require.five-state-baseline

# tldr

## severity: blocker

every brief that draws a **state-law** redline must compare and contrast **five states — Texas,
Indiana, Florida, California, and New York** — and identify the **strictest** as the baseline.

these five are chosen because they combine **high population** (the largest addressable markets) with
**legal divergence** (they land on genuinely different rules). a design that clears the strictest of the
five clears a defensible nationwide floor; a brief that reasons from only one or two states understates
the redline.

state consumer law generally applies by **where the consumer is served**, not where the company is
incorporated — so the five-state sweep is a *served-market* duty, not a home-state one (see
`.the nexus note`).

---
---
---

# deets

## .what

when a brief analyzes a rule that varies **by state** — referral-selling, lottery/game-promotion, UDAP,
gift-card/loyalty expiration, escheat/unclaimed-property, money transmission, consumer-review protection,
privacy/data-incentive, and the like — it must:

1. **cover all five** — Texas (TX), Indiana (IN), Florida (FL), California (CA), New York (NY) — with a
   verbatim-cited rule for each state that has one (and an explicit "no statute found" where one does not).
2. **compare and contrast** — a small matrix or divergence table that shows where the five agree and
   where they split.
3. **name the strictest** — state, on the record, which of the five sets the **governing baseline** for
   that redline, and why.

federal law (e.g. FTC 16 CFR 255/465, FinCEN 31 CFR 1010.100, IRC) is the floor **under** all five —
cite it too, but it does not discharge the five-state duty for the **state** overlay.

## .why

### population — these five are the market

the five are among the most populous states; together they are a large share of the U.S. consumer
market. a program that cannot lawfully operate in them cannot scale. their rules are not edge cases —
they are the mainline.

### divergence — they actually split

the five were picked because they **disagree**, so the matrix is informative rather than repetitive:

- **CA** is typically the **most consumer-protective** — strict gift-card law, aggressive UDAP with a
  private right of action + class actions, a privacy/data-incentive regime (CCPA/CPRA) the others lack.
- **NY** is aggressive on **consumer protection and enforcement** (a powerful AG, GBL §§ 349/350), and
  often diverges from CA on the specifics.
- **FL** carries **criminal** exposure where others are civil (e.g. referral-selling as a lottery).
- **IN** is often the **lighter-touch** civil-UDAP baseline.
- **TX** is frequently **business-friendlier** but has its own sharp edges (DTPA with treble damages).

the strictest state differs **by topic** — CA on gift-cards and privacy, FL on referral-selling
criminality, NY or TX on a given UDAP remedy. that is exactly why all five must run: the baseline is
per-redline, not global.

### the baseline discipline

> abide by the **most extreme** of the five as the baseline.

a design tuned to only the lenient states is a design that breaks on launch into the strict ones. the
five-state sweep surfaces the governing constraint up front, so the design is built to the real floor.

## .the nexus note — served-market, not home-state

a recurring question: *if a company is incorporated in Delaware, does it only abide by Delaware law?*
**no.** the state of incorporation governs **internal corporate affairs** (fiduciary duties, share
mechanics, governance) — that is the "internal affairs doctrine." it does **not** govern the
**consumer-facing** regulation this rule is about.

consumer-protection, referral, gift-card, unclaimed-property, money-transmission, and privacy statutes
generally apply based on **where the consumer / transaction is** — i.e. **every state the company
serves**. serve a customer in California and California's rules attach, regardless of a Delaware charter.

so the compliance posture is one of two, and a brief should say which it assumes:

- **strictest-common-denominator** — build **one** nationwide design to the strictest of the served
  states (simplest; leaves value on the table in lenient states).
- **per-state** — **vary** the design by served state (geofence / conditional terms), each state to its
  own rule (more complex; captures more value, more surface to maintain).

either way, the duty is **per served state**, and the five-state sweep is the tool to find the strictest
among the highest-value served markets. this is a `[counsel-confirmable]` framing, not a legal opinion.

## .the matrix shape

every state-law brief carries a divergence table of this shape (fill per topic; cite each cell):

| state | the rule | verbatim-cited authority | strict? |
|-------|----------|--------------------------|---------|
| TX | … | Tex. … Code § … | |
| IN | … | Ind. Code § … | |
| FL | … | Fla. Stat. § … | |
| CA | … | Cal. … Code § … | ⭐ (if strictest) |
| NY | … | N.Y. … Law § … | |

below it, one line: **baseline = <state> — <why it is strictest for this redline>.**

## .where

applies to every brief under `**/briefs/**` whose subject is a legal rule that varies by state —
especially the `counselor/` market briefs and any `hazard.* / define.boundary.* / ref.* / rule.*` that
states a jurisdiction-specific redline.

it does **not** apply to briefs on purely **federal** law (FTC, FinCEN, IRC, Reg E) — those have no
state matrix. but a brief that mixes federal + state must run the five-state sweep on the state layer.

## .how

- for each of the five, capture the official statute through `bhrowser` (per
  `rule.require.bhrowser-citations`) and quote it verbatim; where a state has no such statute, say so
  explicitly ("no TX analogue found") rather than omit the state.
- prefer official state sources (the legislature's own site); fall back to reliable mirrors (Cornell LII,
  Justia, FindLaw) and note the fallback.
- satisfy `rule.require.seven-distinct-citations` across the whole brief — the five-state sweep usually
  supplies more than seven distinct sources on its own.
- mark the strictest cell (⭐) and state the baseline conclusion in one line.

## .enforcement

- a state-law brief that covers fewer than all five (TX, IN, FL, CA, NY) = **blocker**
- a state-law brief that omits the "baseline = strictest state" conclusion = **blocker**
- a state cell without a verbatim-cited authority (or an explicit "none found") = **blocker**
- a brief that treats a lenient state's rule as the baseline when a stricter one of the five exists = **blocker**
- a brief that assumes home-state (e.g. Delaware) law discharges the served-state duty = **blocker**

## .see also

- `rule.require.bhrowser-citations.[rule].md` — every state cell must be captured off the real page,
  not from a search snippet or a WebFetch paraphrase
- `rule.require.seven-distinct-citations.[rule].md` — the ≥ 7 distinct-source bar
- `motto.not-legal-advice.[motto].md` — the not-advice frame the matrix rides under
