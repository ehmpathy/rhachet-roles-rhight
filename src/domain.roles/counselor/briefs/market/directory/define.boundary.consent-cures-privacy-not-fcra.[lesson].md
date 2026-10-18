# define.boundary — consent cures privacy, not FCRA

## .what

the subject's **opt-in** is a powerful answer to most of the exposures a directory faces about a
natural person. it is **not** an answer to FCRA.

the distinction is structural rather than a matter of degree:

- the **privacy** regimes ask *"did they agree?"* — consent is the express defense.
- **FCRA** asks *"what is this report used for?"* — and consent is a **duty the regime imposes**,
  not an exit from it.

> **you do not consent your way out of being a consumer reporting agency. consent is one of the
> obligations a consumer reporting agency must discharge.**

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## ⭐ .why — the statute's own structure settles it

`[observed]` **15 U.S.C. § 1681b(b)(1):**

> *"A consumer reporting agency may furnish a consumer report for employment purposes **only if** —
> (A) the person who obtains such report from the agency certifies to the agency that … (ii) **the
> consumer has authorized in writing** … the procurement of the report by that person."*

look at the shape of that sentence. the consumer's written authorization appears as a **condition the
agency must satisfy in order to furnish lawfully.** it is an element of compliance *inside* the
regime.

⭐ **so authorization presupposes that FCRA already applies.** if consent removed a report from
FCRA's scope, § 1681b(b) would be incoherent — it would require, as a condition of lawful furnishing,
the very thing that would have made the furnishing unregulated.

and `[observed]` **§ 1681a(d)(1)** confirms it from the other direction: the definition turns on
information *"**used or expected to be used** … for the purpose of serving as a factor in
establishing the consumer's eligibility"* — the **use**, never the subject's agreement.

## .the boundary

| exposure | does the subject's opt-in answer it? | why |
|---|---|---|
| **right of publicity** | ✅ **yes** — but by **two different routes**, not one | ⭐ **cited, not re-derived** — the per-state verbatim consent clauses have one owner, and it is not this file: `define.boundary.diligence-answer-vs-published-claim` § *where a subject opt-in lands*. the one-line result: consent is an **express statutory defense in four of five**, and in **TX** there is no statutory right a person who is alive could consent away at all. **same practical clearance, different reason** — a brief that writes *"consent defeats ROP in all five"* is right by accident |
| **privacy torts** | ✅ yes `[unverified]` | consent negates the intrusion |
| **CA data-broker duties** | ✅ yes | `[observed]` § 1798.99.80(c) reaches a business with which the consumer *"does not have a **direct relationship**"* — an opt-in **is** a direct relationship |
| ⚠️ **CCPA "sale"** | ⚠️ **yes, but only a QUALIFIED opt-in** | `[observed]` § 1798.140(ad)(2)(A) exits the sale definition when the consumer *"uses or directs"* disclosure — ⛔ but § 1798.125(b)(3) stacks a second, stricter gate on top. **see § the CCPA "sell" exit below** |
| **aggregation harm** | ✅ largely | the assembly happens **at the subject's request** |
| ⛔ **FCRA** | ⛔ **NO** | `[observed]` § 1681b(b)(1) makes authorization a duty *within* the regime; § 1681a(d)(1) keys on use |
| ⛔ **defamation / trade libel** | ⛔ **no** | consent to *publication* is not consent to a *false* statement. accuracy survives consent entirely |
| ⛔ **sealed-record republication** | ⛔ **no** `[inferred]` | the duty runs to the **court's order**, not to the subject's wishes; a subject cannot consent away an order to seal |

⭐ **the three "no" rows are the ones to internalize.** they are exactly the exposures that survive
into the person track after an opt-in flow is built — and it is easy to assume a consent flow closed
them.

## ⭐ what consent DOES unlock — the absence-fact

this is the strongest practical consequence, and it inverts a constraint.

`define.boundary.presence-fact-vs-absence-fact` holds that an absence-fact — *"no judgments", "clean
record"* — is never assertable, because absence cannot be proven and because a `⬜` that meant
*adverse* must stay indistinguishable from a `⬜` that meant *unchecked*.

`[inferred]` **an opt-in changes who owns the inference.** with consent, the absence of a
background badge means *"this person did not opt in"* — **the subject's act**, not a withheld result.
the inference no longer runs from the publisher's silence to a fact about the subject.

| | without opt-in | with opt-in |
|---|---|---|
| what `⬜` implies | the publisher's silence — could be adverse | **the subject's choice** not to participate |
| may a clean result publish? | ⛔ no | ⚠️ **yes, subject to accuracy** |
| what remains exposed | privacy **and** accuracy | ⭐ **accuracy alone** |

⚠️ **but the exposure that remains is the harder one.** "clear" is only as strong as the search behind
it: the currency standard of § 1681k(a)(2) and the mixed-file problem of § 1681e(b) both bite, and a
person has no registry-assigned unique key. this is the same trade consent makes everywhere — **the
privacy layer drops away and the accuracy layer sharpens.**

## ⚠️ .consent has to stay real

`[inferred]` a consent that is practically compulsory is weak evidence of agreement, and it is the
persistent critique of notice-and-choice regimes. three properties keep it real:

1. **cheap to refuse** — no rank penalty, no ghost page, no "unverified — click to claim" shell
2. **cheap to reverse** — withdrawal suppresses, and the suppression outlives re-ingestion (a
   tombstone, not a row delete — see `hazard.go-private-request.[hazard].md`)
3. **specific** — consent to a **license check** is not consent to a **criminal background check**;
   the scope of each check is named at the point of the ask

⛔ **and a ghost page defeats all three.** an unclaimed profile rendered as a shell *is* a
non-consensual profile with extra steps, and it rebuilds every exposure the opt-in was meant to
remove.

## ⭐⭐ .the CCPA "sell" exit — and the second gate that stacks on it

> ⚠️ **relocated here from `hazard.sealed-record-republication` on this pass.** it was recorded where
> it was *discovered* — beside the fee-model analysis that shares one prong with it — rather than
> where it belongs. it is a **consent-boundary** conclusion: it says what an opt-in buys under CCPA
> and what shape of opt-in is needed. **a conclusion recorded beside its discovery site is legible to
> that brief's reader and invisible to everyone else** — the same defect the catalogue's gap tracker
> exists to correct.

a directory that publishes about people commonly rests on a plain-language premise: *"we never sell
personal information."* under CCPA's own definition that premise **does not hold on its own.**

`[observed]` **Cal. Civ. Code § 1798.140(ad)(1)**: *"'Sell,' 'selling,' 'sale,' or 'sold,' means
selling, **renting, releasing, disclosing, disseminating, making available, transferring, or otherwise
communicating** orally, in writing, or by electronic or other means, a consumer's personal information
by the business to a third party **for monetary or other valuable consideration.**"*

⛔ ***"making available"*** **and** ***"disclosing"*** **are inside the statutory definition of
"sell".** so a *"we never sell personal info"* position is easy against the plain sense of the word
and **hard** against this one: a public profile page **makes available** a natural person's personal
information, and *"other valuable consideration"* is broad enough to reach traffic that funnels toward
a paid product. **no ad-tech pixel is required for the definition to bite.**

⭐ **two exits sit in the same statute, and each is a design choice made elsewhere:**

| exit | the text | the design choice it corresponds to |
|---|---|---|
| **entity grain** | `[observed]` § 1798.140(i): *"'Consumer' means a **natural person** who is a California resident"* | the subject of record is a business |
| **opt-in** | `[observed]` § 1798.140(ad)(2)(A): a business does not sell when *"A consumer **uses or directs the business** to intentionally: (i) Disclose personal information"* | person-grain facts enter only by the subject's opt-in |

⭐⭐ **this is the fourth regime whose exit is the same "natural person" hinge** — FCRA (`[observed]`
§ 1681a(c): *"The term 'consumer' means an individual"*), right of publicity in all five states, the
CA DELETE Act's data-broker definition, and now CCPA. **entity grain is not one mitigation among
several; it is the single structural move that exits four separate regimes for the same reason.**
`define.boundary.entity-grain-vs-person-grain` § *the boundary* carries the full regime union.

⚠️ **and this reframes a commitment that reads as independent.** *"we do not sell personal
information"* looks like a standalone policy choice. it is not: the promise is true only *because* the
subject is an entity, or *because* the person opted in. **it rests on those two choices rather than
beside them, and a design change to either one silently revokes it.**

### ⛔⛔ the opt-in exit is NOT free — a second CCPA section gates it

⚠️ **do not read § 1798.140(ad)(2)(A) as "get any opt-in and you are done."** this tree already holds
the analysis of the section that stacks on top of it:

> **`../rewards/define.boundary.ccpa-financial-incentive-opt-in.[lesson].md`** — `[observed]`
> **Cal. Civ. Code § 1798.125(b)(3)**: *"A business may enter a consumer into a financial incentive
> program **only if** the consumer gives the business **prior opt-in consent** … that clearly
> describes the **material terms** … and which may be **revoked** by the consumer at any time. If a
> consumer refuses to provide opt-in consent, then the business shall **wait for at least 12 months**
> before next requesting…"*

⭐ **the interlock, and it is easy to miss because the two live in different sections:**

| | § 1798.140(ad)(2)(A) | § 1798.125(b)(3) |
|---|---|---|
| what it does | exits the **sale** definition | gates a **financial incentive** program |
| what it asks for | the consumer *"uses or directs"* disclosure | ⭐ **prior** opt-in, **material terms** stated, **revocable**, ⛔ **12-month cooldown on refusal** |
| is a bare "enable my profile" click enough? | ✅ plausibly | ⛔ **no** |

⛔ **so any participation model built on a bare "enable my profile" prompt has a gap.** where a
profile buys the subject value of its own — visibility, badges, lead flow — then `[inferred]` the
exchange looks like **consideration for data**, and § 1798.125(b) attaches. **the opt-in that the
sale analysis relies on is then the wrong shape of opt-in.**

⭐ note this converges with § *consent has to stay real* above from the other direction: **revocable**
and **material terms stated** are the statute's version of *cheap to reverse* and *specific*. the
statutory gate and the good-faith properties ask for nearly the same properties.

⭐ **the extant rewards brief already establishes the five-state posture on this** (CA is the
strictest-common-denominator; the other four treat a bona fide program as a safe harbor). **it is
cited rather than re-derived** — the analysis belongs there.

⚠️ `[unverified]` — whether a *profile* opt-in is a *"financial incentive"* within § 1798.125(b) is a
fact-and-value question the rewards brief already flags for counsel. **open, and now open in two
places that point at each other rather than one that did not know about the other.**

## .the test

> **"if this person had never agreed, would this exposure exist?"**

- yes, and their agreement removes it → **consent answers it** (ROP, privacy, broker relationship)
- yes, and their agreement does **not** remove it → **consent is irrelevant** (FCRA, accuracy,
  sealed records)

⚠️ the second list is the one that survives into production. build for it.

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this boundary
> is not crossed. the convention is declared in `hazard._.catalogue` § *the convention*; the original
> mandates live in `rule.*` files. **a `[lesson]` that enforces is checkable, not normative.**

- reliance on the subject's consent as the answer to a **consumer-report** exposure = **blocker**
  (§ 1681b(b)(1) makes authorization a duty inside the regime, not an exit from it)
- a **clean-background** assertion published on consent **without** currency and unique-key match
  controls = **blocker** (consent unlocked the statement; it did not make it true)
- republication of a **sealed or expunged** record on the strength of the subject's consent =
  **blocker** (the duty runs to the court's order)
- a consent flow with a **ghost page**, a rank penalty for refusal, or blanket rather than
  per-check scope = **blocker** (the consent is not real, so it defends little)
- ⛔ a *"we do not sell personal information"* claim stated as a **standalone** commitment, without
  the entity-grain or opt-in premise it rests on = **blocker** (`[observed]` § 1798.140(ad)(1) puts
  *"making available"* inside the definition, so the claim is false on the plain text without one of
  the two exits)
- ⛔ a **bare** "enable my profile" opt-in relied on as the § 1798.140(ad)(2)(A) exit, where the
  profile confers visibility, badges, or lead flow = **blocker** (§ 1798.125(b)(3) demands prior
  consent, material terms, revocability, and a 12-month cooldown on refusal)

## .note on the five-state rule

the ROP row above **is** a state-law redline, and the five-state sweep for it is run in full — with
the verbatim consent clause per state — in `define.boundary.diligence-answer-vs-published-claim`
§ *where a subject opt-in lands*. it is referenced rather than duplicated here.

> ⚠️ **the ROP brief is NOT that owner.** `hazard.unclaimed-profile-right-of-publicity` owns the ROP
> **right** — scope, remedy, carve-outs — and carries no consent sweep. the two split by grain: what
> the right *is*, versus what **consent does to it**. **stated so a reviewer can tell a
> cross-reference from an omission, and so neither pointer lands on a file with no answer.**

## .sources

1. 15 U.S.C. § 1681a — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim
2. 15 U.S.C. § 1681b — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim
3. 15 U.S.C. § 1681e — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim
4. 15 U.S.C. § 1681k — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681k&num=0&edition=prelim
5. Cal. Civ. Code § 1798.99.80 — https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80
6. Cal. Civ. Code § 1798.140 — https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140

captured via browser per `rule.require.bhrowser-citations`.

> ⚠️ **six distinct sources, below the `rule.require.seven-distinct-citations` floor, deliberately.**
> the five ROP statutes are quoted by their owner brief and merely **cited** here, per the
> canonical-owner convention. ⛔ **to re-quote them in order to reach seven would duplicate exactly
> what that convention exists to prevent.**

⚠️ **§ 1798.125(b)(3) is quoted at second hand and is NOT in the list above.** its text reaches this
brief through the in-repo `../rewards/define.boundary.ccpa-financial-incentive-opt-in.[lesson].md`,
which captured it on its own route. it is a **reliable secondary source and not our capture**, so it
does not count toward the citation floor here and it is marked rather than laundered. ⛔ **capture it
directly before any advice leans on the 12-month cooldown**, which is the clause with the sharpest
operational consequence and the one most likely to have moved.

## .publishability

☀️ **fullsun** (share) — a structural reading of § 1681b(b)(1) against the consent defenses in five
state statutes, all quoted verbatim. no client identity, no coverage data, no applied mechanic.

⚠️ **held back:** the **consent-flow design itself** — what each check asks for, how scope is
presented, the withdrawal mechanics — is applied product architecture and belongs in the restricted
artifact. the *principle* that consent must be cheap to refuse, cheap to reverse, and per-check
scoped ships here; the screens do not.

## .see also

- `hazard.consumer-report-gate.[hazard].md` — the regime consent does not answer
- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — the constraint consent lifts
- ⭐ `define.boundary.diligence-answer-vs-published-claim.[lesson].md` — **the owner of the five-state
  ROP consent-defense sweep**, with the per-state verbatim clauses and the TX split
- `hazard.unclaimed-profile-right-of-publicity.[hazard].md` — the ROP **right** itself: scope, remedy,
  carve-outs. ⚠️ it does **not** hold the consent sweep
- `hazard.stale-public-record-status.[hazard].md` — the accuracy duty that survives consent
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — when the person track applies at all,
  and the full union of regimes the *natural person* hinge exits
- `hazard.sealed-record-republication.[hazard].md` — where the CCPA "sell" analysis used to live, and
  the one fee-model thread that stayed there
- ⭐ `../rewards/define.boundary.ccpa-financial-incentive-opt-in.[lesson].md` — **the owner of
  Cal. Civ. Code § 1798.125(b)**, which gates the opt-in the sale exit relies on
