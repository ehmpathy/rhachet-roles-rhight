# rule.forbid.financial-position-disclosures

## .what

never publish the originator's **financial position** or **tax-compliance status**.

- position = profit or loss, net operating losses, taxable income, revenue, receipts, spend, card charges, vendor totals, cash or bank balances, carryforward amounts
- status = which returns were filed, unfiled, late, or delinquent · e-file acceptance dates · transcripts pulled · agency notices, penalties, or letters about a liability

a pseudonym hides **who**. it does not hide **how the books look** — and once the entity is linkable, every line about the pseudonym is a line about the person.

## .why

- **reputational.** "lost money three years straight" or "never filed" is a permanent public fact about a real founder, readable by an investor, a lender, or a counterparty
- **it reads as an admission.** a published "the year-N return was never filed" is a statement against interest, in the author's own repo, under git's author line
- **it is the strongest pretext for a tax-agency scam.** an impersonator who can say *"we show your last two returns as unfiled, and a balance due"* is believed. a published status list writes that pitch in advance
- **perturbation does not fix it.** a figure nudged a few percent still says loss-or-profit, and still says the order of magnitude. the sign and the size are the disclosure

## .the test

> **does this line tell a reader whether the originator made or lost money, how much, or what they have or have not filed?**

yes → the line goes. unsure → it goes.

## .the forbidden classes

| class | 👎 as published | 👍 the fix |
|---|---|---|
| per-year result | `year N: loss of $XX,XXX` | an unattributed example: *"suppose a corporation lost $10,000 in year 1 (illustrative)"* |
| filing status | `year N ✅ e-filed, accepted <date> · year N+1 ⬜ delinquent` | drop the column. *"confirm filing status via an IRS account transcript"* |
| spend or receipts | `$X,XXX to the cloud host, $X,XXX in ads` | synthetic vendors and round figures in a fixture, never the real books |
| balance | `had revenue and a bank balance of $X` | cut. if the lesson needs an input, state the band it falls in |
| agency notices | *"the IRS sent a CPxxx in <month>"* | cut. describe the notice class generically, from the agency's own page |
| operations as evidence | *"it kept up revenue and paid its vendors"* | *"a corporation that kept operations up"* — the legal fact, no ledger |

## .the remediation

1. **drop status tables and columns** outright. a row cannot be half-redacted
2. **move numbers into an unattributed example**, labeled illustrative, with magnitudes picked independently — never a nudge of a real figure
3. **replace fixtures derived from the real books** with synthetic data — round figures, generic vendors (`ACME HOSTING`) — and regenerate the snapshots
4. **point to the source of truth** for status: an IRS account transcript, pulled by the reader for their own entity
5. **sweep every citation at once** — briefs, stones, tests, fixtures, snapshots, help text, demo transcriptions. a loss cut from the brief and live in a snapshot is a loss published

## .the boundary — what is fine

- statute, regulation, and agency text, verbatim
- public statutory computations over stated inputs: $85,165 for a 10M-share charter, the $400 floor, a fee schedule
- the share structure, and gross assets as a **concept** or a band (*"below the $800,000 band"*)
- generic how-tos for a **class** of filers — a delinquent-return guide stays; the originator's place in that class does not
- one clearly labeled synthetic worked example, not tied to the originator's years or status

## .enforcement

- a profit, loss, NOL, income, revenue, or spend figure attributed to the originator = **blocker**
- a filed / unfiled / delinquent / accepted status for any of the originator's returns = **blocker**
- an agency notice, penalty, or balance tied to the originator = **blocker**
- a perturbed real figure kept in place of a synthetic one = **blocker**
- a fixture, snapshot, or help text whose figures derive from the real books = **blocker**
- a synthetic example with no illustrative label = **nitpick**

## .see also

- `rule.forbid.auth-escalation-disclosures` — the facts that pass a verification check; this rule covers the facts that embarrass or arm a pretext
- `rule.require.provable-pseudonymization` — swaps the names; neither rule is satisfied by a swap alone
- `rule.require.pii-scan-before-commit` — the gate; a clean scan says naught about a disclosed loss
