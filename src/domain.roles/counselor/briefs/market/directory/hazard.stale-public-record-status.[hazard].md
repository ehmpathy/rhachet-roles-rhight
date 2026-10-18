# hazard.stale-public-record-status

## .what

a badge is a claim about **now**, and the record behind it is a claim about **the day it was
captured**. every published status therefore decays from true toward false on its own, with no action
by anyone.

three ways the same badge goes wrong, and they are different failures:

1. **the status changed** — a license lapsed, was suspended, or was revoked after capture.
2. **the record moved on** — a judgment was satisfied, a suit dismissed, a charge dropped; the
   captured item is now a snapshot that misleads about a closed matter.
3. **the record was never theirs** — a name-match attached someone else's record to this subject.

⭐ the third is the worst, because the other two decay toward *"a stale favorable fact is asserted"*,
while a mismatch asserts a fact about **the wrong person or company** from the first render.

> **recommendation disclaimer.** the mitigations below are offered to the best of our knowledge,
> based on the information found in research — they carry **no guarantee of success or outcome**, and
> they must be reviewed by a licensed professional (attorney / CPA / licensed advisor) against your
> own real scenario and current law before any reliance. this is groundwork for that review, not a
> substitute for it.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## .why

**the statute names the standard directly, and it is stricter than "it was checked once."**

`[observed]` **15 U.S.C. § 1681k(a)(2):** a consumer reporting agency must

> *"maintain strict procedures designed to insure that whenever public record information which is
> likely to have an adverse effect on a consumer's ability to obtain employment is reported it is
> complete and up to date. For purposes of this paragraph, items of public record relating to
> arrests, indictments, convictions, suits, tax liens, and outstanding judgments shall be considered
> up to date if **the current public record status of the item at the time of the report is
> reported**."*

⭐ **"the current public record status … at the time of the report."** the statute's own answer to
staleness is that a captured snapshot is not enough — the *present* status is what must be reported.

`[observed]` and **§ 1681e(b)** sets the general duty: a consumer reporting agency shall

> *"follow reasonable procedures to assure maximum possible accuracy of the information concerning
> the individual about whom the report relates."*

⚠️ **both are FCRA duties, so neither binds a directory that stays outside the gate.** they are
carried here for two reasons: they are the standard a court is likely to reach for when it asks what
a reasonable procedure looks like `[inferred]`, and they bind directly on any surface that crosses
into `hazard.consumer-report-gate`.

## ⭐ the accuracy layer SHARPENS at entity grain

this is the counterintuitive part, and it is why this hazard is the most important one in the
entity-grain design.

`[observed]` § 1681a(c) confines FCRA to individuals, so at entity grain the **privacy** layer falls
away. what does not fall away is **defamation and trade libel** — and for a company:

| | natural person | business entity |
|---|---|---|
| the claim | defamation | **trade libel / commercial disparagement** |
| the harm | dignitary, hard to quantify | ⭐ **economic, and provable** — lost bids, lost contracts |
| the plaintiff | an individual | a company with revenue records and an incentive to litigate |

> **a wrong adverse fact about a person is a hard damages case. the same error about a contractor is
> an invoice.**

`[inferred]` so entity grain is not a discount on this hazard. it is the one place the exposure gets
**worse**, and it lands precisely on the row the asymmetric-disclosure rule cannot protect: a
**favorable** badge that has gone false is the publisher's own assertion.

## the decay profile, per row

| row | how fast it decays | why |
|---|---|---|
| **license status** | ⚠️ fast | annual or biennial renewal; suspension and revocation are event-driven and can land any day |
| **registration / insurance / bond** | ⚠️ fast | typically annual, and it lapses silently on non-payment |
| **recent permits** | slow | a closed permit stays closed; "recent" is the part that decays |
| **civil judgment** | ⚠️ **asymmetric** | satisfaction and dismissal move the record in the subject's **favor**; a stale capture is adverse-and-wrong |
| **criminal record** | ⚠️ **asymmetric, plus expungement** | an expunged record disappears entirely; republication of a sealed item is its own hazard |

⭐ **note the asymmetry in the last two rows.** under `rule.require.asymmetric-disclosure` those
adverse items never publish — which means a stale adverse capture cannot become a **published** false
statement. it can still become a **wrong internal state**, which is a data-quality problem rather than
a legal one. **the rule that appears to be about publication also bounds the staleness exposure.**

## ⭐ the mitigations

`[inferred]`:

| mitigation | what it addresses |
|---|---|
| **an as-of date on every published badge, always** | the badge stops its claim about "now" and claims only "as of this date" — a materially narrower assertion |
| **expiry, not decay** — a badge reverts to `unknown` at a fixed age | ⭐ the strongest single control **outside** the consumer-report gate — it converts staleness from a false statement into an absent one. ⚠️ **inside the gate it is NOT sufficient** — Cal. Civ. Code § 1786.18(c) demands a **re-verify**, which an expiry does not perform. see the corrected section below |
| **re-check on the registry's own cadence** | a license that renews annually is re-checked annually at minimum |
| **event-driven re-check where the registry supports it** | suspension and revocation are not schedule-bound |
| **a unique-key match, never a name match** | the mismatch failure — see below |
| **a correction path the subject can reach** | the subject is the best detector of their own stale badge, and at entity grain they are motivated. ⭐ **cited, not restated: `rule.require.dispute-channel.[rule].md` is canonical** — and it is a TX statutory duty, not the courtesy this row once implied |
| ⭐⭐ **PRIVATE notice to the subject BEFORE a favorable badge reverts** | the only mitigation that is *proactive* rather than reactive — see below |

⭐ **the expiry control deserves emphasis.** a `verified license` that silently ages into falsity is
an assertion. the same badge that reverts to `unknown` on a fixed schedule is, at worst, a directory
that has not looked recently — which is exactly the state the asymmetric-disclosure rule already
renders safely. **decay handled by expiry converts a liability into a no-op.**

> ⚠️ **the paragraph above is scope-bound — read the section immediately below before you rely on
> it.** it holds outside the consumer-report gate and **fails inside it** — one of the two states
> supplies a *re-verify* duty that an expiry cannot satisfy.

### ⚠️⚠️ two states supply a NUMBER, and one of them defeats expiry alone

the expiry argument above is `[inferred]` and carries no interval of its own. two state statutes
supply one, and they differ **in kind**, not merely in length.

⭐ **cited, not re-derived.** the verbatim text of both clocks, their capture provenance, and the
seven-year ICRA record bars that travel with the California one live in the brief that owns them:

> **`hazard.sealed-record-republication.[hazard].md`** — §§ *⭐⭐ Indiana sets a hard number, and it
> needs no consumer report to bite* and *California: a second gate with a tighter clock*

what this brief needs from it — and why it **overturns** the claim above:

| | **IN — 60 days** | **CA — 30 days** |
|---|---|---|
| authority | Ind. Code § 24-4-18-7 | Cal. Civ. Code § 1786.18(c) |
| the shape | a **bound** on staleness | ⭐⭐ a **re-verify duty** |
| does a fixed-age expiry satisfy it? | ✅ **yes, natively** | ⛔ **NO** — it demands affirmative work |
| gated on a consumer report? | ⛔ **no** — so it can bite where FCRA does not | ✅ yes (ICRA) |
| tag | `[observed]` | `[observed]` |

⛔ **so "expiry beats re-check" is right outside the consumer-report gate — and wrong inside it.**
California does not ask how old the datum is; it asks **when you last looked**. an expiry answers the
first question and is silent on the second.

⭐ **which clock binds depends on where the design lands:**

- **outside** the gate — the whole aim of `hazard.consumer-report-gate` — ⭐ **IN's 60 days**, and
  expiry satisfies it natively
- **inside** it → ⭐ **CA's 30 days**, and expiry does **not** satisfy it

### ⭐⭐ PRIVATE notice before a revert — the mitigation the mitigations table lacked

⚠️ **expiry is a good control with a blind spot: it fires silently.** a `✅` reverts to `⬜` on its
own schedule, and the subject learns of it the way a stranger would — by a look at their own page,
if they happen to look. `[inferred]` **notice before the revert is cheap, and it is the only
mitigation in this brief that acts before the harm rather than after it.**

| | expiry alone | expiry **plus** notice |
|---|---|---|
| the badge's truth | ✅ preserved either way | ✅ preserved |
| the subject's chance to cure | ⛔ **none** — they find out after | ⭐ they can re-verify before the cell goes blank |
| who detects a mismatch | a reader, or no one | ⭐ **the subject** — the party who knows the true status |
| what it costs | — | one message |

⭐ **and it converts the mismatch control from passive to active.** the mitigations table already
names *"a correction path the subject can reach"* — but a path no one is told to walk is a path
seldom walked. **notice is what turns the correction path from a page that exists into a mechanism
that runs**, and it recruits the one party with both the true facts and a motive to supply them.

⛔⛔ **and read the collapse rule correctly here, because a careless read forbids this.**

> `rule.require.asymmetric-disclosure` forbids any signal that distinguishes the two branches of
> `⬜` **to a reader**. a private message to the **subject** about the **subject's own** record is
> not that signal — the subject already knows their own status, so no information crosses to anyone
> who did not have it.

⚠️ **the two constraints that keep it that way**, and they are not optional:

1. ⛔ **the notice goes to the subject and to no one else.** it is not an event a reader, an API
   consumer, or a public log can observe. a "recently changed" marker is the collapse leaked.
2. ⛔ **the notice must not distinguish an adverse re-check from a lapsed clock**, because the
   subject may forward it. *"your license badge will expire on <date>; re-verify to keep it"* is
   branch-blind and true in both cases. *"we found an issue with your license"* is not.

⚠️ `[unverified]` — a **statutory** pre-adverse-action notice duty is a different and stronger
obligation (FCRA § 1681m, and CA ICRA analogues) and it lives **inside** the consumer-report gate,
which this design aims to stay outside of. the notice described here is a **voluntary** control
adopted because it is cheap and it works; ⛔ **do not model it on the statutory one**, whose schedule,
content, and copy-of-report requirements are duties this design has not accepted. see
`hazard.consumer-report-gate`.

## ⚠️ the mismatch problem, and why entity grain nearly solves it

a name match is not an identity. "J. Smith Plumbing" in a docket may be a different company than
"J. Smith Plumbing LLC" on the profile, and `[inferred]` at scale some fraction of name matches will
be wrong.

⭐ **entity grain supplies what person grain cannot: a registry-assigned unique key** — a secretary-of-
state number, an EIN, a license number. matches can be keyed rather than fuzzy.

⚠️ **but the leak paths reintroduce it.** the qualifier is a natural person with no unique public key,
and a sole proprietor is a person with an entity label attached. **the mismatch problem survives
exactly where person data survives.**

## .the test

before any favorable badge renders, ask:

1. **"does this carry an as-of date, and does it expire?"** — if it can age silently, it will
2. **"was this matched on a unique key, or on a name?"** — a name match is a hypothesis
3. **"if this status changed today, how long until the publisher would know?"** — that interval is the exposure

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this body of
> law is not tripped. the convention is declared in `hazard._.catalogue` § *the convention*; the
> original mandates live in `rule.*` files. **a `[hazard]` that enforces is checkable, not normative.**

- a published badge without a visible **as-of date** = **blocker**
- a published badge with **no expiry** — one that can age indefinitely into falsity = **blocker**
- a record attached to a subject on a **name match alone**, where a unique key was available =
  **blocker**
- an adverse item retained internally past its currency, then relied on for any decision =
  **blocker** (a data-quality defect that becomes a legal one on any crossing of the gate)
- ⚠️ a `verified license` badge that survives a suspension or revocation = **blocker** — the single
  highest-cost failure in the design, because it is a **favorable** assertion, and those are the only
  assertions the asymmetric-disclosure rule leaves exposed
- ⛔ a **pre-revert notice that names the branch** — that distinguishes an adverse re-check from a
  lapsed clock = **blocker** (the subject may forward it, and then the collapse has leaked through
  the one channel that was supposed to be private)
- ⛔ a pre-revert notice **observable by anyone but the subject** — a public "recently changed"
  marker, an API event, a visible log = **blocker** (same leak, no forward required)
- ⚠️ a favorable badge that reverts with **no notice to the subject at all** = **nitpick** — the
  badge stays true, so no assertion is false; what is lost is the subject's chance to cure and the
  design's best mismatch detector

## .note on the five-state rule

`rule.require.five-state-baseline` is **not** triggered: the authorities here are federal (FCRA) plus
the common-law defamation and trade-libel frame. ⚠️ the state layer this hazard hands off to —
**sealed-record republication**, where a stale capture of an expunged item is its own wrong — is
carried by `hazard.sealed-record-republication`, where the sweep is run. **stated so a reviewer can
tell a scope boundary from an omission.**

## .sources

1. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
2. [15 U.S.C. § 1681e](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim)
3. [15 U.S.C. § 1681k](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681k&num=0&edition=prelim)
4. [Cal. Civ. Code § 1786.18](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1786.18)
5. [Ind. Code § 24-4-18-7](https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/section-24-4-18-7/)

6. license status vocabulary — `src/domain.roles/licenser/briefs/industry=.all/define.what-licenses-mean.md`
7. contractor registration bundle — `src/domain.roles/permiter/briefs/ref.electrical-license-structure.indiana.[ref].md`

captured via browser per `rule.require.bhrowser-citations`.

> ⚠️ **FCRA § 1681m is deliberately absent from this list.** it is named in the body as a contrast,
> never quoted, and it was **not captured** — so it stays `[unverified]` rather than listed.
>
> ⚠️ **and this brief sits at FIVE statutory sources, below the
> `rule.require.seven-distinct-citations` floor, deliberately.** its subject is a single distinction —
> a *decay bound* is not a *re-verify duty* — which § 1786.18 and § 24-4-18-7 carry between them.
> **extra quotes to reach seven would restate what the sealed-record and consumer-report briefs own.**

## .publishability

☀️ **fullsun** (share) — the statutory currency standard, the defamation/trade-libel distinction, and
a generic decay-and-expiry control set. no client identity, no coverage data, no applied mechanic.

⚠️ **held back:** a given adopter's **actual re-check cadences and match thresholds** — how often each
row is re-pulled, and what similarity clears a match. those are the operational core, they are what a
competitor would want, and they belong in a restricted artifact.

## .see also

- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — the status vocabulary that decays
- `rule.require.asymmetric-disclosure.[rule].md` — why only favorable badges carry this exposure
- `hazard.consumer-report-gate.[hazard].md` — where these duties become binding rather than advisory
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — why the accuracy layer sharpens
