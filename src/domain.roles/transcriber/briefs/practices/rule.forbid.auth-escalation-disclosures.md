# rule.forbid.auth-escalation-disclosures

## .what

never publish a fact that lets a stranger pass an identity or ownership check as the originator, or pick up a prior support contact as them.

a pseudonym swap removes the **name**. it leaves the **answers** — and a support channel asks for answers, not names.

> **the doxx-to-reset chain:** repo → fingerprint the entity → confirm it on a public register → recite the private facts a support agent checks → reset the account, redirect the mail, or file on the entity's behalf.

## .why

- **a support agent verifies with knowledge, not documents.** banks, registered agents, state agencies, the IRS, carriers, registrars, and payment platforms all ask some mix of: formation date, file or account number, last-4s, the amount of the last bill or payment, the date of the last contact. each one published is a question answered in advance
- **a fact harmless alone is a key in combination.** state + formation service + formation week + share counts + void date + exact bill narrows a registry of millions to one row. the pseudonym survives; the entity does not
- **a call recap is a pretext.** *"I called on the 12th, spoke to the specialist, she asked for a signed return"* is what an impersonator says to continue that call. an agent who hears the history back trusts the caller who holds it
- **authorship is public.** a repo's commits, license, and issues name people; assume any entity fingerprint can be joined to them

## .the test

> **could a stranger who holds only this repo pass a support agent's verification for the originator — or continue a prior call as them?**

yes, for any channel → the fact goes. unsure → shift it or cut it.

## .the forbidden classes

| class | 👎 as published | 👍 the fix |
|---|---|---|
| exact bill or balance | `the bill: $NNN,NNN.NN` · `$N,NNN.NN CR` | perturbed by an unpublished amount, or `~$1XXK` |
| prior-return line items | per-year NOL to the cent | ⛔ cut, never perturbed — `rule.forbid.financial-position-disclosures` |
| formation / issuance / filing dates | the day the charter was filed, to the minute | shifted; the fact of the shift stated, its size never |
| the transform itself | *"dates shifted −N days"* · *"perturbed by $X"* · a real date beside its shifted twin | *"dates shifted, figures perturbed"* — no magnitude, no structure |
| agency contact dates and times | `SENT <date> <h:mm> PM → <agency inbox>` | shifted; the time rounded or dropped |
| call recaps with a named staffer | `spoke to <name> at ext. NNNN` | the habit (*"get a name and extension"*), never the name |
| identifiers | file no., EIN fragment, envelope id, card last-N, confirmation no. | synthetic, collision-checked |
| a claim that the data is real | *"every date and figure below is real and unaltered"* | *"dates shifted, figures perturbed"* |
| ops handles | real cloud project id, service-account name, bucket, profile | `<your-project>` placeholders |
| defaults and fixtures | a skill's `--demo` default that is the real formation date | a shifted date, same shape |

## .the remediation

1. **shift every date of the matter by ONE offset**, so intervals still hold. keep statutory anchors — March 1 is March 1 in every year
2. **perturb money**, and keep the lesson: a residual over the tolerance stays over it; a credit that cascades still cascades
   - ⛔ **never publish the size or the shape of either transform.** a published offset is a published inverse: add it back and every date is real again. the same holds for a hint that narrows it ("weekday kept" says a multiple of 7)
   - ⛔ **one real value beside its shifted twin solves the offset.** a research log that dates the same event unshifted — "pulled `<real date>`" in a brief, "pulled `<shifted date>`" in the demo — publishes the key as surely as a stated −N
3. **apply it everywhere at once.** grep every citation — briefs, stones, tests, fixtures, snapshots, skill defaults, directory names. a date shifted in the brief and live in a snapshot is a date published
4. **re-run the calculator** behind any derived figure, and paste its output. never re-derive by hand (`rule.forbid.hand-computed-figures`)
5. **state that the shift happened**, in the file. a reader who assumes real data will cite it as real
6. **keep the key local.** the offset and the real values stay out of the repo, beside the pseudonym map

## .the boundary — what is fine

- an agency's **published** contacts: the queue number, the public inbox, the filing address
- statute text, fee schedules, and forms — verbatim, as embedded source bytes
- public-standard computations: $85,165 for a 10M-share charter, the $400 floor, a §504(c) accrual over stated inputs
- collision-checked pseudonyms (`rule.require.collision-checked-pseudonyms`)
- the **habit** a contact taught, stated without the contact
- a population-sized fact on its own (a formation service used by tens of thousands) — until it joins a combination that narrows to one

## .enforcement

- an exact bill, balance, or credit of the originator's account = **blocker**
- a prior-return line item to the cent = **blocker**
- a real formation, filing, or contact date in any shipped file, test, snapshot, or default = **blocker**
- a staffer's name or direct extension = **blocker**
- a claim that shipped data is real and unaltered = **blocker**
- a shift applied in one file and not in another that cites the same fact = **blocker**
- the size or structure of a date shift or money perturbation, in any shipped file = **blocker**
- a real cloud project id or service-account name = **nitpick**
- a population-sized fact beside a narrower one, with no reason recorded = **nitpick**

## .see also

- `rule.require.provable-pseudonymization` — swaps the names; this rule catches what the swap leaves
- `rule.require.pii-scan-before-commit` — the gate; a clean scan is not a clean fingerprint
- `rule.require.collision-checked-pseudonyms` — how the synthetic names are chosen
- `rule.forbid.hand-computed-figures` — why a perturbed figure is re-run, never re-typed
- `rule.forbid.financial-position-disclosures` — the twin: profit, loss, spend, and what was or was not filed go entirely, never perturbed
- `howto.redteam-before-publish` + `rhx publish.redteam` — how to hunt these before release: a stated transform, a real date beside its twin, a hash oracle, a blind stranger's dossier
