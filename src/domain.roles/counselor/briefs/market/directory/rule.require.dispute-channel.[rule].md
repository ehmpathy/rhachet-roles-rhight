# rule.require.dispute-channel

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> reliance. every claim is tagged `[observed]` (quoted from a captured source), `[inferred]`
> (reasoning over those sources), or `[unverified]` (not yet sourced).

## .what

**a directory that publishes any record about a third party must offer that subject a conspicuous
channel to dispute and correct it.** the channel is a **statutory duty with per-day damages**, not a
courtesy, and its absence is actionable on its own.

> ⭐⭐ **THIS IS THE CANONICAL STATEMENT. cite it; do not restate it.** four briefs in this cluster
> lean on *"a correction path the subject can reach"*, and a restatement drifts toward whatever the
> local brief happens to be about — which is how this duty read as a courtesy in each of them.

## .why it lives in its own file

it is cited as canonical by **four peer briefs** across three different bodies of law, so
`rule.prefer.most-common-denominator` places it at their common ancestor rather than inside any one
of them:

| brief | how it relies on the channel |
|---|---|
| `hazard.sealed-record-republication` | ⭐ where the statutory duty is **sourced** — TX §§ 109.003–109.004 |
| `hazard.stale-public-record-status` | the subject is the design's best detector of their own stale badge |
| `rule.require.asymmetric-disclosure` | the one case that legitimately needs internal state routes here |
| `hazard.consumer-report-gate` | dispute duties are part of the machinery that gates imports |

⛔ **and the placement matters for a second reason: the duty is broader than its source.** it was
sourced from a criminal-history statute, but its own scope reaches **any record a directory publishes
about a subject** — a lapsed licence, a stale permit, a mis-matched identity. **a duty filed inside a
brief titled for sealed criminal records reads as bounded to them, and it is not.**

## .the duty

`[observed]` **Tex. Bus. & Com. Code §§ 109.003–109.004** impose it on a *"business entity that …
publishes criminal record information"*, and § 109.005 prices its breach at up to **$500 per
violation** and **$500 per day** of continuing violation.

four elements, each of which is the law rather than a design preference:

1. ⭐ **conspicuous** — *"conspicuous"* is a **statutory adjective about findability**. a channel
   reachable only by someone who already knows it exists **does not satisfy the duty** — it fails
   outright rather than in part
2. **prompt removal** on a valid dispute — the TX chapter pairs the channel with the act. a channel
   that accepts a dispute and does not act on it is not the duty
3. ⛔ **no fee to correct** — `[observed]` **TX § 109.002(a)(1)(B)**: a fee to remove or correct is
   one of the conditions that pulls a business **into** the chapter. it also feeds CCPA's *"other
   valuable consideration"* prong under `[observed]` **Cal. Civ. Code § 1798.140(ad)(1)**, so one fee
   trips two statutes for two unrelated reasons. ⚠️ and a third where the subject is a natural person:
   `[observed]` **§ 1798.125(a)(1)(B)** bars a business from *"Charging different prices or rates for
   goods or services"* because a consumer *"exercised any of the consumer's rights under this title"*,
   and correction is one of those rights (§ 1798.106)
4. ⚠️ **it must not become a leak** — the channel is where the publication collapse's one legitimate
   exception lives, so it is **subject-authenticated and logged**, and it is **not** the everyday
   support console (`rule.require.asymmetric-disclosure` § *the projection is the boundary*)

## .what this rule does NOT own, deliberately

the screens, the SLA number, the auth method, the log schema. per `hazard._.catalogue` § *what is NOT
a gap*: **a mechanism is stated where the rule is FALSE without it, and declined where the rule is
merely unimplemented without it.**

⚠️ **the SLA is the closest call.** *"prompt"* is statutory and a number would be a build choice, so
**the number stays open and the duty does not.** tracked as `G-dispute-sla`.

## .the test

> **"can a subject who has never been told this channel exists find it, use it without a fee, and
> get the record acted on?"**

- yes on all three → the duty is met
- a channel that exists but is not findable → ⛔ fails *"conspicuous"* outright
- a channel that charges → ⛔ pulls the business into TX ch. 109 **and** feeds the CCPA sale prong
- a channel served from the everyday console → ⛔ a leak of the internal branch

## .enforcement

- ⭐⭐ **absence of a conspicuous dispute / correction channel on any published-record surface = blocker**
  (TX §§ 109.003–109.004)
- ⛔ a channel reachable **only by someone who already knows it exists** = **blocker** —
  *"conspicuous"* is a statutory adjective about findability
- ⛔ **any fee to remove or correct** = **blocker** (TX § 109.002(a)(1)(B); CCPA § 1798.140(ad)(1))
- ⛔ a channel served from the **everyday support console** rather than a subject-authenticated,
  logged path = **blocker** — it is the collapse's one legitimate exception, so it must be the
  narrowest one
- ⛔ a dispute accepted with no removal act = **blocker** — the chapter pairs the channel with the act
- ⚠️ a **paraphrase** of this rule in a peer brief instead of a citation = **blocker**; a paraphrase
  drifts toward the local brief's own subject, which is how a statutory duty came to read as a
  courtesy in four files

## severity

**require → blocker.** the peer `market/` rules are mostly `prefer → nitpick`; this one diverges
because its breach is **priced by statute at a per-day rate**, and because the absence of the channel
is itself the violation — there is no partial-credit state.

## .note on the five-state rule

⭐ **the sweep is now partial rather than absent: three of five states read, two still open.** each
analogue below binds **its own** regulated party, and none is a general directory duty. the TX chapter
stays the only one that reaches a business for publishing criminal record information as such.

| where | authority | who it binds | the duty, `[observed]` |
|---|---|---|---|
| TX | Tex. Bus. & Com. Code §§ 109.003–109.004 | a business that publishes criminal record information | the channel above |
| CA | Cal. Civ. Code § 1798.106(a) | a CCPA business, for a natural person's data | *"the right to request a business that maintains inaccurate personal information about the consumer to correct that inaccurate personal information"* |
| CA | Cal. Civ. Code § 1786.24(a) | an investigative consumer reporting agency | *"shall, without charge, reinvestigate and record the current status of the disputed information or delete the item from the file … before the end of the 30-day period"* |
| NY | N.Y. Gen. Bus. Law § 380-f(a) | a consumer reporting agency | *"shall promptly re-investigate and record the current status of such information, unless it has reasonable grounds to believe that the dispute by the consumer is frivolous"* |
| federal | 15 U.S.C. § 1681i(a)(1)(A) | a consumer reporting agency | *"shall, free of charge, conduct a reasonable reinvestigation"*, inside the consumer-report gate (`hazard.consumer-report-gate`) |
| IN | — | — | ⚠️ `[unverified]` un-swept: no dispute section was read in ch. 24-4-18 |
| FL | — | — | ⚠️ `[unverified]` un-swept |

`[inferred]` **the convergence is on two elements, and both are already in the TX duty:** no charge
(*"free of charge"*, *"without charge"*), and a re-check whose outcome is current status or deletion.
the TX duty therefore stays the adopted floor, on the **strictest-common-denominator** posture
(`rule.require.five-state-baseline` § *the nexus note*), now checked against three states rather than
one. tracked as `G-dispute-sla` until IN and FL are read.

## .sources

1. [Tex. Bus. & Com. Code ch. 109](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.109.htm)
2. [Cal. Civ. Code § 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140)
3. [Cal. Civ. Code § 1798.106](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.106)
4. [Cal. Civ. Code § 1798.125](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.125)
5. [Cal. Civ. Code § 1786.24](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1786.24)
6. [N.Y. Gen. Bus. Law § 380-f (NYS Senate, official)](https://www.nysenate.gov/legislation/laws/GBS/380-F)
7. [15 U.S.C. § 1681i (govinfo, GPO official; 2023 edition)](https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap41-subchapIII-sec1681i.htm)

captured via browser per `rule.require.bhrowser-citations`.

> ⭐ **seven distinct sources.** the duty still rests on **one** chapter (TX ch. 109); the CCPA sections
> carry the fee prong, and the dispute statutes are the partial five-state sweep in § *.note on the
> five-state rule*, each scoped to its own regulated party. ⚠️ § 1681i cites govinfo: the OLRC viewer's
> section urls returned *"Page Not Found"* at capture.

## .date researched

2026-08-03 to 2026-10-19: the capture dates of the sources listed in `.sources`, each read via browser.

## .publishability

☀️ **fullsun** (share) — a statutory duty quoted from an official state source, plus the structural
observation that its scope is broader than the chapter that supplies it. no client identity, no
coverage data, no applied mechanic — the screens, SLA, and auth method are expressly **not** here.

## .see also

- `hazard.sealed-record-republication.[hazard].md` — the criminal-history layer this duty was sourced
  from, and the fee-model interlock
- `hazard.stale-public-record-status.[hazard].md` — why the subject is the best detector of their own
  stale badge
- `rule.require.asymmetric-disclosure.[rule].md` — § *the projection is the boundary*, which bounds
  what the channel may expose
- `hazard.consumer-report-gate.[hazard].md` — FCRA's own dispute machinery, and why it is a separate
  duty rather than this one
- `hazard._.catalogue.[summary].md` — the cluster index and the open-question tracker
