# ref.mini-tcpa-five-state

## .what

the state layer that every federal-only brief in this folder disclaims. five states — **TX · IN · FL
· CA · NY** — each with its own telephone-solicitation statute, read from the statutory text and
quoted verbatim, on **two** dimensions at once:

1. **what does the state require before you may contact someone?** — the consent standard
2. **what does the state do to you if you were wrong?** — the penalty, and *who* may enforce it

> **not legal advice.** informational groundwork for counsel to validate.

> **no recommendation disclaimer attaches to this brief**, and that is deliberate. per
> `rule.require.recommendation-disclaimer`, the disclaimer is owed by a brief that **steers a course
> of action**. this one states what five statutes say and does not tell a reader what to do about it.
> the moment a reader asks *"so what should our program look like?"*, they have left this brief, and
> what answers that question is a business decision rather than a statement of law.

> **a note on gerunds.** this file trips `rule.forbid.gerunds` on terms that cannot be altered:
> verbatim statutory text (*"making or allowing"*, *"electronic messaging text"*, *"unrecorded"*) and
> the federal terms of art `telemarketing` and `willful or knowing`. to reword a quote is citation
> fraud; to rename a term of art breaks the search path to the statute.

---

## .why

`rule.require.five-state-baseline` demands a verbatim cite per cell **or** an explicit "none found",
because state consumer law varies and a sender's real standard is the **strictest that applies in a
served state**, not the federal floor.

⭐ **and the sweep's result is not "federal, times five."** the five states do not merely add
penalties on top of a shared federal standard — **two of them require a different kind of consent
altogether**, one obtainable only mid-call. a program built to the federal written-consent standard
and shipped nationally is compliant in some of these states and non-compliant in others **on the
consent step itself**, before any penalty question is reached.

---

## ⭐ result 1 — there are three consent architectures here, not one

| state | what the state requires | shape |
|-------|------------------------|-------|
| **FL** | a **written agreement** that bears the called party's signature, names the number, and carries a clear and conspicuous disclosure — which expressly covers *"telephone call, text message, or voicemail transmission"* | **written record** |
| **IN** | consent *"knowingly or voluntarily requested"* — **or** a message *"immediately preceded by a live operator who obtains the subscriber's consent"* | ⭐ **live, per-call** |
| **CA** | an *"unrecorded, natural voice announcement"* that must *"[i]nquire as to whether the person called consents"* before the recorded message plays | ⭐ **live, per-call** |
| **NY** | no consent definition in the section swept; the duty is framed as a **registry + established-business-relationship** exception, which covers *"any telemarketing sales call or electronic messaging text"* | **suppression list** |
| **TX** | 🔶 the consent-pattern sweep of ch. 305 returned **zero hits** — see the honest gap | **(federal, by reference — inferred)** |

⭐⭐ **the sharp edge is the middle two rows.** a written consent record — the artifact the whole
federal apparatus is built to produce — **does not satisfy Indiana's or California's alternative
route**, because that route is not a record at all. it is a **live human voice, on the call itself,
that asks and waits.** no archive substitutes for it.

⚠️ **read the direction of that carefully.** Indiana states its live-operator route as an
*alternative* — `(2)` in a disjunction whose `(1)` is ordinary consent — so a valid prior consent
record does reach Indiana. **California's § 2874 is the one with no written off-ramp in the section
swept**: the announcement requirement is stated as a condition on the call, not as one of two ways to
qualify.

### the verbatim text

**Florida** — `Fla. Stat. § 501.059(1)(g)`, the state's own definition:

> "'Prior express written consent' means a written agreement that: 1. Bears the signature of the
> called party; 2. Clearly authorizes the person making or allowing the placement of a telephonic
> sales call by telephone call, text message, or voicemail transmission … 3. Includes the telephone
> number to which the called party authorizes a telephonic sales call to be delivered; and 4.
> Includes a clear and conspicuous disclosure…"

**Indiana** — `Ind. Code § 24-5-14-5`:

> "knowingly or voluntarily requested, consented to, permitted, or authorized receipt of the message;
> or (2) the message is immediately preceded by a live operator who obtains the subscriber's consent"

**California** — `Cal. Pub. Util. Code § 2874(a)`, the announcement that must precede the recorded
message:

> "(2) Inquire as to whether the person called consents to hear the prerecorded message"

— and that announcement must itself be an *"unrecorded, natural voice announcement."*

**New York** — `N.Y. Gen. Bus. Law § 399-z`, the definition that pulls text into the registry regime:

> "'Unsolicited telemarketing sales call' means any telemarketing sales call or electronic messaging
> text"

⭐ **note what New York's phrase does.** the federal position that a text is a "call" rests on the
**FCC's** construction of a statute that says "call" — an interpretive layer. New York wrote
*"electronic messaging text"* into the definition itself, so the point does not depend on an agency
construction in that state.

---

## ⭐ result 2 — the teeth and the claimant run in **opposite** directions

| state | per-violation figure | who may enforce | private right? |
|-------|---------------------|-----------------|----------------|
| **IN** | **$10,000** first violation · **$25,000** each after | ⭐ the **attorney general** | ⬜ **none located** in the chapters swept |
| **TX** (ch. 302) | *"not more than $5,000 for each violation"* | civil penalty | — |
| **TX** (ch. 305) | **$500**, or **$1,500** where knowing or intentional | **the plaintiff** | ☀️ **yes** |
| **FL** | **$500** or actual damages, whichever is greater; trebled on willful or knowing | **the called party** | ☀️ **yes** |
| **CA** | *"not more than five hundred dollars"* per violation | ⭐ **the commission** | ⬜ **none located** in the article swept |
| **NY** | ⭐ **$50** or actual damages, whichever is greater; treble capped at **$1,000** | **the called party** — *and* a separate AG penalty track | ☀️ **yes** |

⭐⭐ **the states with the biggest numbers have no private right, and the state with a private right
has the smallest number.** Indiana's $25,000 and California's disconnection remedy are **enforcement**
figures — a regulator's or an attorney general's to seek. New York's private figure is **$50**, one
tenth of the federal $500, and its treble cap is $1,000 regardless of call count.

**a sender who reasoned "five states means five more $500-per-message class actions" would be wrong
in both directions at once** — too pessimistic on the private multiplier in NY, and blind to the
agency exposure in IN and CA that no class action would ever surface.

### the verbatim text

**Indiana** — `Ind. Code § 24-4.7-5-2`, the attorney general's remedy:

> "(A) Ten thousand dollars ($10,000) for the first violation … (B) Twenty-five thousand ($25,000)
> dollars for each violation after the first"

**New York** — `N.Y. Gen. Bus. Law § 399-p`, both tracks in one section. the agency penalty:

> "civil penalty of not more than two thousand dollars per call, up to a total of not more than
> twenty thousand dollars … within a continuous seventy-two hour period"

and the private one:

> "actual damages or fifty dollars, whichever is greater"

trebled *"up to one thousand dollars."*

**Texas** — `Tex. Bus. & Com. Code ch. 305`, the private action:

> "$500 for each violation; or (2) the plaintiff's actual damages"

and, where the violation was knowing or intentional:

> "$1,500 for each violation; or (2) three times the plaintiff's actual damages"

**Texas** — `ch. 302`, a separate registration regime with its own teeth: a **$10,000** security
requirement, and a

> "civil penalty of not more than $5,000 for each violation"

**California** — `Cal. Pub. Util. Code § 2876`:

> "guilty of a civil offense"

punishable by a fine of not more than five hundred dollars per violation, **levied by the
commission**, alongside a disconnection remedy.

**Florida** — `Fla. Stat. § 501.059(10)(a)`:

> "actual damages or $500, whichever is greater"

trebled at the court's discretion where the violation was willful or knowing.

---

## ⭐ two results that close gaps opened by earlier briefs

### 1. Indiana **does** have a statutory due-care safe harbor

`ref.tcpa-exposure-tracks` records a null: a CourtListener sweep located **no decision** that
construes a state-law safe harbor in TX, CA, NY, or IN. that brief was careful to say the null was
about *case law*, and that "the statutory *text* of each state's mini-TCPA was not read for a due-care
provision."

**it has now been read, and Indiana carries one.** `Ind. Code § 24-4.7-5-2` conditions the penalty on
a defendant who cannot show it

> "did not know; and (2) in the exercise of reasonable care could not have known"

⭐ **so the earlier null was accurate and incomplete in the way it said it was.** the provision
exists; **no court has been located that says what it buys.** an unlitigated defense is still a
defense, and this is the concrete example of the distinction that brief drew in the abstract.

### 2. Florida's penalty class — **both** earlier reads were right

an earlier note in this research recorded Florida's civil penalty as **Class III**; a later pass
read **Class IV**. the re-pull settles it: **the statute carries both, on two different tracks.**

| track | class | route |
|-------|-------|-------|
| **judicial** civil penalty | **Class IV** | court action |
| **administrative** fine | **Class III** | chapter 120 proceedings, offered *"as an alternative to the civil penalties provided in paragraph (a)"* |

⚠️ **the earlier note was not wrong — it named one of two tracks and read as though it named the
only one.** that failure mode is worth its own record: a cell that captures a true fact can still
mislead when the cell was never sized to hold two.

---

## ⚠️ Florida's cure window and the federal deadline are different clocks

`Fla. Stat. § 501.059(10)(c)` makes a `STOP` reply a **condition precedent** to a damages action over
texts, and gives the sender **15 days** to cure. `47 C.F.R. § 64.1200(a)(10)` gives **ten business
days** to honor a revocation.

these are **not the same deadline in different units.** the federal one is a compliance duty measured
in business days; the Florida one is a procedural gate measured in calendar days. **a program built to
either clock alone can miss the other**, and ten business days can exceed fifteen calendar days
whenever a holiday falls in the window.

---

## ⚠️ California moved on 2025-01-01 and the change is about synthetic voice

`Cal. Pub. Util. Code § 2874(c)` was added by **AB 2905**, effective **January 1, 2025**, and defines
*"artificial intelligence"* and *"artificial voice"* for this article. this is the newest text in the
sweep, and it is the one most likely to move again.

`§ 2872(c)` also sets California's call window at **9 p.m. to 9 a.m.** — ⭐ **stricter at the early
end than the federal 8 a.m. boundary.** the two windows are not the same window, and the federal one
is the more permissive of the two on that end.

---

## the honest gap

- ⚠️ **Indiana's quotes are mirror-sourced, and this is a stated limitation rather than a silent
  substitution.** the official host `iga.in.gov` returns *"IGA | Not Found"* at 425 bytes for the URL
  shapes tried — a plain 404, **not** a credential or bot wall. Justia's mirror was reachable
  throughout. **every Indiana quote above is from that mirror**, and confirmation against the
  official publisher is owed before any of it is relied upon.
- ⛔ **a wrong diagnosis of a failure costs as much as a wrong fact.** the 404 above was recorded as
  "blocked" on an earlier attempt, and every later attempt was aimed at the wrong fix — variants of a
  URL shape that no longer exists. **the state was reachable the whole time.** the correction is on
  the record here rather than quietly applied, because a reader who is told a source is unreachable
  will not try it again.
- 🔶 **Texas's consent standard is an inference, not a capture.** what was observed is that a
  consent-pattern sweep of ch. 305 returned **zero hits**. that ch. 305 therefore adopts the federal
  standard by reference is the natural read of a chapter whose remedies attach to violations of the
  federal act — **but the provision that so refers was not quoted**, so it is marked as inference and
  the pull is owed.
- ⬜ **no case law was read for any of the five states.** this is a **statutory-text** sweep. what a
  court has done with any of these provisions — how "live operator" is applied, whether NY's $50 is
  ever aggregated, what Indiana's due-care clause requires — is entirely unresearched.
- ⬜ **"none located" is not "does not exist."** the CA and IN private-right cells record that no
  private right was found **in the article or chapters swept**. a private right may sit in a general
  consumer-protection statute those sweeps never touched — California's unfair-competition law is the
  obvious candidate and was not searched.
- ⬜ **whether these five are the right five for this subject is still open.** the baseline is a
  general-purpose one, chosen for population and legal divergence rather than for this subject. a
  commonly-repeated claim holds that mini-TCPA litigation concentrates in **FL, OK, WA, MD** — three
  of which sit outside the baseline. ⚠️ **that claim is unverified here and is recorded as a
  hypothesis, not a result.** if it holds, a five-state sweep on this baseline is complete against
  the rule and incomplete against the subject, and **OK / WA / MD are the states to add.**
- ⬜ **no state's safe-harbor or exemption machinery was swept exhaustively.** Indiana's due-care
  clause was found; whether TX, FL, CA, or NY carry analogues was **not** established, and the absence
  of a quote here is an absence of search, not a result.
- 🔶 **the two dimensions are carried in one file rather than two, deliberately.** consent and
  penalty could each have had its own reference. they are together because **they interlock** —
  California's live-consent rule is enforced by a commission fine and not by a private suit, so a
  split would put the duty in one file and its only enforcer in another, and a reader of either half
  would draw the wrong conclusion about the other.

## key takeaways

| question | answer |
|----------|--------|
| is the state layer just federal plus penalties? | ⭐ **no** — two of five require a *different kind* of consent |
| which states cannot be satisfied by a written record alone? | **CA** (announcement required), and **IN** on its alternative route |
| which state's consent definition names text and voicemail? | **FL** — expressly, in the statute |
| which state writes "text" into the definition rather than reads it in? | **NY** — *"electronic messaging text"* |
| which state has the largest per-violation figure? | **IN** — $25,000 after the first |
| can a private plaintiff collect that? | ⭐ **no** — it is the attorney general's; **no private right was located** in Indiana |
| which state has the smallest private figure? | **NY** — **$50**, treble capped at $1,000 |
| who enforces in California? | ⭐ the **commission** — no private right was located in the article |
| does any state carry a due-care safe harbor? | **Indiana does**, in statute — but ⬜ **no court has been located that construes it** |
| is Florida's penalty Class III or Class IV? | ⭐ **both** — IV judicial, III administrative, on separate tracks |
| does California's call window match the federal one? | **no** — 9 a.m., not 8 a.m., so a federal-window dialer is non-compliant for an hour daily |
| are Indiana's quotes from the official publisher? | ⚠️ **no** — mirror-sourced; the official URL shape 404s |
| was any case law read? | **no** — statutory text only |

## .publishability

☀️ **fullsun** (share) — a statutory-reference matrix over five public state codes. no client
identity, no client-specific mechanic, no design choice settled, **neutral both-sides voice**. every
cell is either a quote from a public statute or an explicit named null.

authored per `rule.require.fullsun-facts-not-tactics`: the brief states **what five states require and
what they impose**, and does **not** state what a sender should build. ⭐ the two structural results —
that consent architectures differ, and that teeth and claimant run inversely — are **descriptions of
the statutes as a set**, not recommendations; a reader who wants to know what to *do* about them is
routed to a brief tagged differently. triaged per `rule.require.publishability-triage`.

## .see also

- `ref.tcpa-consent-elements.[ref].md` — the **federal** consent elements this layer stacks on top of
- `ref.tcpa-exposure-tracks.[ref].md` — the three **federal** exposure tracks; this brief supplies the
  fourth layer that brief names and disclaims
- `ref.dnc-suppression-program.[ref].md` — the federal suppression duties NY's registry regime parallels
- `define.boundary.when-consent-is-required-at-all.[lesson].md` — the prior question, federal-only
- `_taxonomy/_.glossary.[summary].md` — the read order this brief joins

## .sources

provenance: every source below is a **`bhrowser` capture off the real DOM**. no WebSearch snippet and
no WebFetch paraphrase is quoted anywhere in this brief.

1. [Fla. Stat. § 501.059 — the (1)(g) state consent definition, the (10)(a)–(b) private right and treble, the (10)(c) pre-suit `STOP` + 15-day cure, and both penalty classes (FL Senate, **official**, 2025 compilation)](https://www.flsenate.gov/Laws/Statutes/2025/501.059)
2. [Tex. Bus. & Com. Code ch. 305 — the private action, $500 / $1,500 figures (Texas Legislature, **official**)](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.305.htm)
3. [Tex. Bus. & Com. Code ch. 302 — the separate registration regime, $10,000 security and $5,000 civil penalty (Texas Legislature, **official**)](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.302.htm)
4. [Cal. Pub. Util. Code § 2872 — the 9 p.m.–9 a.m. call window (California Legislative Information, **official**)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2872)
5. [Cal. Pub. Util. Code § 2874 — the unrecorded natural-voice announcement, the consent inquiry, and the AB 2905 artificial-voice definitions effective 2025-01-01 (California Legislative Information, **official**)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2874)
6. [Cal. Pub. Util. Code § 2876 — *"guilty of a civil offense"*, the $500 commission-levied fine, and the disconnection remedy (California Legislative Information, **official**)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2876)
7. [N.Y. Gen. Bus. Law § 399-p — the $2,000-per-call agency penalty with its $20,000 / 72-hour cap, and the $50 private right with its $1,000 treble cap (NY Senate, **official**)](https://www.nysenate.gov/legislation/laws/GBS/399-P)
8. [N.Y. Gen. Bus. Law § 399-z — *"any telemarketing sales call or electronic messaging text"*, the established-business-relationship exception, and the 31-day registry lookback (NY Senate, **official**)](https://www.nysenate.gov/legislation/laws/GBS/399-Z)
9. ⚠️ [Ind. Code § 24-5-14 — the consent standard and the live-operator alternative (**Justia mirror** — the official `iga.in.gov` URL shape returns a 404; see the honest gap)](https://law.justia.com/codes/indiana/title-24/article-5/chapter-14/)
10. ⚠️ [Ind. Code § 24-4.7-5 — the attorney general's $10,000 / $25,000 remedy, the reasonable-care safe harbor, control-person liability, and state-contractor debarment (**Justia mirror** — same limitation)](https://law.justia.com/codes/indiana/title-24/article-4-7/chapter-5/)
11. [47 C.F.R. § 64.1200(a)(10) — the federal ten-business-day revocation deadline that Florida's 15-day cure window is contrasted against (eCFR, **official**)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200)

⚠️ **an honest note on the count.** eleven urls, but **not eleven independent documents**: sources 4–6
are three pages of one California article, and 2–3 are two chapters of one Texas code. the
**distinct-statute** count is **7** (FL · TX-305 · TX-302 · CA-PUC-art. · NY-399-p · NY-399-z ·
IN ×2 chapters), plus the federal CFR section used for one contrast. the bar is met without pad, but
a reader should know which urls are siblings.

**reproducible pulls** — the three passes behind this brief, retained in full:

- `refs/read.five-state-mini-tcpa.sweep.play.ts`
- `refs/read.five-state-mini-tcpa.sections.play.ts`
- `refs/read.indiana-mini-tcpa.penalties.play.ts`

## .date researched

2026-08-01
