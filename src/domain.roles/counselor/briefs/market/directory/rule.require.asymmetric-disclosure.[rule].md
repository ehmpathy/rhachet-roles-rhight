# rule.require.asymmetric-disclosure

## .what

a directory publishes **only the states it is safe to assert**, and renders every other state as one
indistinguishable `unknown`. adverse results are held internally and are **never** surfaced, never
labelled, and never distinguishable from an unchecked cell.

three parts, and all three are required — the third is the one that is usually dropped:

- **(1) the ASYMMETRY** — favorable results publish (`verified license`); adverse results and true
  unknowns both render `unknown`.
- **(2) the COLLAPSE** — the two branches of `unknown` are indistinguishable *by construction*, not
  by omission. no sort order, no visual treatment, no ask-count, no field leaks which branch a given
  cell came from.
- **(3) the ANNOUNCEMENT** — the rule is **published in advance**, applies to every profile always,
  and states plainly that the reasons are not distinguished. an undisclosed asymmetry has no
  defensive effect at all.

> **recommendation disclaimer.** this recommendation is offered to the best of our knowledge, based
> on the information found in research — it carries **no guarantee of success or outcome**, and it must
> be reviewed by a licensed professional (attorney / CPA / licensed advisor) against your own real
> scenario and current law before any reliance. it is groundwork for that review, not a substitute
> for it.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## .why

a directory that reports adverse facts about the people it lists is making factual assertions about
identifiable subjects, at scale, from records it did not create and cannot fully verify. every such
assertion is a defamation or trade-libel claim if it is wrong, and `[inferred]` at scale *some* of
them will be wrong — the identity-match problem alone guarantees it (see
`hazard.stale-public-record-status`).

the asymmetry removes the entire class. **an adverse fact that is never asserted cannot be asserted
wrongly.**

what remains is the favorable direction, where the incentives run the right way: the subject wants
the badge, will correct it if it is wrong, and the underlying record is one a registry publishes and
the subject is legally required to hold.

> **publish where being wrong is cheap and self-correcting. stay silent where being wrong is
> expensive and one-sided.**

⭐ **and it is the strictest-common-denominator posture by construction.** publish-only-favorable is
lawful in every jurisdiction simultaneously, which is what makes it viable at national scope where a
per-state design that surfaces adverse facts where permitted would not be.

## ⭐⭐ .this rule sits ABOVE the legal floor — it is not the floor

⚠️ **the most common misread of this rule is that the law compels it. it does not.** stated plainly,
because a rule that hides its own optionality will be mistaken for a constraint and then quietly
"discovered" to be looser than it claims:

> **outside FCRA, publication of a true, current, correctly-matched adverse public record is
> LAWFUL. this rule declines that permission.**

the analysis, which is public law and therefore ships:

⚠️ **which side you are on is set by the READER's expected use, not by the fact's sensitivity** —
`[observed]` § 1681a(d)(1) triggers on a communication *"used or expected to be used"* for an
eligibility purpose. the same five rows, two readers, two regimes.

| | may an adverse public record be published? |
|---|---|
| **outside FCRA** — a consumer picks a contractor; no eligibility purpose | ✅ **yes.** truth is a complete defense to defamation, and `[observed]` § 1681c's clocks are duties of a **consumer reporting agency** — they do not bind a non-CRA |
| **inside FCRA** — the reader vets an employee, a borrower, an insured | ⛔ **no** — and the time bar is the *second* problem. `[observed]` § 1681b(a) permits furnishment only for the enumerated purposes *"**and no other**"*, which an open page cannot establish; and `[observed]` § 1681c(a)(2) then bars the item once it *"antedate[s] the report by more than seven years **or until the governing statute of limitations has expired, whichever is the longer period**"* |

⚠️ **and the four conditions the lawful path would carry, kept on the record because they bound what
any future scope change may reach:**

1. **identity certainty first** — `[observed]` § 1681e(b)'s *"reasonable procedures to assure maximum
   possible accuracy"* is the mixed-file standard; a name match is not an identity
2. **current status, not a stale capture** — `[observed]` § 1681k(a)(2): up to date only if *"the
   current public record status of the item at the time of the report is reported"*
3. **no conclusion-word** — show the record, never label it; *"hazard"*, *"risk"*, *"red flag"* are the
   publisher's characterizations of the subject (see `define.boundary.who-speaks-decides-the-regime`)
4. **as a record, not a badge verdict** — the badge vocabulary describes how well the publisher knows;
   a court record is a different kind of object

⭐⭐ **why this matters to the rule rather than merely beside it — three reasons, and each one fails if
the permission is left unstated:**

- **the restraint only reads as a commitment if it was optional.** a promise to withhold what was
  never publishable is not a promise. **the announcement in part 3 is worth what it is worth
  precisely because the lawful alternative exists**
- **it bounds a future scope change honestly.** someone will eventually ask *"can judgments be
  surfaced?"* the answer is *"lawfully yes, outside the gate, under four conditions — and this rule
  declines."* that is a decision to revisit with open eyes, not a legal wall to be surprised by
- ⛔ **a reviewer who later finds the permission will conclude the brief missed it.** a brief that
  presents the legal ceiling as the design misreads its own constraint, and every other claim in the
  cluster inherits that doubt

⚠️ **note the asymmetry in the reader's intuition, because it is backwards:** `[observed]`
§ 1681c(a)(5) bars adverse items *"**other than records of convictions of crimes**"* — so inside
FCRA a **criminal conviction** carries no federal time bar while the **civil suit** does. the class
most readers assume is the more restricted one is the less restricted one.

---

## the three parts

### part 1 — the ASYMMETRY

two state sets. the public set is a **lossy projection** of the internal one.

| what the check found | internal state | public render |
|---|---|---|
| checked; favorable | `verified-positive` | ✅ `verified $noun` |
| the subject asserted it; unchecked | `self-attested` | `claimed` |
| checked; **adverse** | `verified-negative` | ⬜ `unknown` |
| did not check, or could not | `unknown` | ⬜ `unknown` |

**the union rule:** public `unknown` = internal `verified-negative` ∪ internal `unknown`.

⚠️ **adverse is not the same as absent.** a presence-fact returns a *status*, and an adverse status —
suspended, revoked, expired — is a **found record** that still renders `⬜`. see
`define.boundary.presence-fact-vs-absence-fact`.

### part 2 — the COLLAPSE

the two branches must be indistinguishable in the rendered artifact, not merely unlabelled. the
leaks that defeat it, `[inferred]`:

| leak | why it defeats the collapse | found in |
|---|---|---|
| an ask-count — *"3 people asked, no response"* | ⛔ a genuine adverse signal about the subject's conduct | this rule |
| a "last checked" date present on some `⬜` and absent on others | reveals which branch was checked | this rule |
| rank or sort order that correlates with internal state | the order asserts what the cell does not | this rule |
| a distinct icon, tone, or tooltip for the two branches | the collapse exists only in the copy | this rule |
| an API or export that carries the internal state | the collapse must hold at **every** surface | this rule |
| ⭐ **a TOMBSTONE that is legible** — a removed profile that renders as removed, or a "private" flag that retains the row | a suppression that announces itself is an adverse signal about a subject who *asked to be left alone*; and a row delete that a re-crawl resurrects undoes the removal silently. the tombstone must be **invisible and durable** — both, or it is a leak | `hazard.go-private-request` |
| ⭐ **a BADGE or SEAL rendered beside the cell** | a mark implies an affiliation the `⬜` refuses to assert, so the badge re-asserts what the cell withheld — and it does so in the surface a reader trusts most | `hazard.badge-implies-endorsement` |
| ⭐ **an ABSENT as-of date on a favorable badge** | a `✅` with no date claims *now*; the moment the record behind it changes, a true statement decays into a false one with no act by anyone. an as-of date is what keeps a presence-fact from an implied re-verification | `hazard.stale-public-record-status` |
| ⛔⛔ **a HUMAN who answers *"why is my badge blank?"*** | support, sales, and dispute-response are surfaces the collapse must hold at, and **the only ones with no code path to test.** an agent who says *"we found something"* — or merely *"I can't discuss that one"* where they would otherwise say *"we haven't checked yet"* — has distinguished the branches out loud. the differential answer leaks as surely as the direct one | this rule |

> the collapse is a property of the **output**, and it must be tested at every surface — page, API,
> export, sitemap, search result, **and every human who answers a question about a cell.**

### ⛔⛔ the human surface fails differently, and it is the one this rule was blind to

⚠️ **the eight rows above are all machine surfaces. a machine surface leaks by a field that exists;
a human surface leaks by an answer that differs.** that difference matters three ways:

| | machine surface | human surface |
|---|---|---|
| how it leaks | a field, icon, order, or date is present | the **answer varies** with the internal branch |
| how it is caught | a test, a schema diff, a snapshot | ⛔ **no code path exists to test** |
| how it is fixed | remove the field | ⭐ a **prescribed, branch-blind answer** the agent cannot improvise around |

⭐ **so the human surface needs a control the machine surfaces do not: one answer, published, that is
true in both branches.** the same shape as the announcement itself —

> *"we publish what we confirm. a blank cell means we have no published result for it, and we do not
> distinguish the reasons — for anyone, ever. that is our policy and it is stated in our terms."*

⛔ **and the agent must not have the internal state available to them at all.** a policy that asks a
human to know an adverse result and decline to mention it is a policy that fails on the first
sympathetic caller, the first angry one, and the first one who asks twice. **withhold the branch from
the console, and the leak has no source rather than a discipline.**

#### ⭐ the structural form of that control — the projection is the boundary

⚠️ *"withhold the branch"* is an outcome, and an outcome asserted with no mechanism is a policy that
merely looks like one. the mechanism is already in the design's own vocabulary:

| layer | states | who may read it |
|---|---|---|
| **internal (B)** | `verified-positive` · `self-attested` · `verified-negative` · `unknown` | the check pipeline, and **only** it |
| ⭐ **published (B′)** | ✅ `verified` · `claimed` · ⬜ `unknown` | ⭐ **everyone else — every internal console too** |

> ⛔ **the support, sales, and dispute consoles read the SAME published projection a reader does.**
> not a filtered view of the internal store, not a permission on a column — the published projection,
> which is the only representation in which the two branches have already been collapsed.

⭐ **this is why the collapse must be a real projection rather than a render-time choice.** if `⬜` is
computed in the template, every consumer upstream of the template still holds the branch, and the
control degrades to a permission that someone will eventually widen for a good reason. **if the
collapse happens once, at the store boundary, there is no branch downstream to leak.**

⚠️ `[inferred]` **the one case that genuinely needs the internal state — a dispute where the subject
asks us to correct a record we hold — must be a separate, logged, subject-authenticated path, not a
column on the everyday console.**

⛔⛔ **and do NOT read that as settled.** `define.boundary.diligence-answer-vs-published-claim`
answers only the **conceptual** half — *is a disclosure to the subject a publication?* (no). it says
naught about the **operational** half: the required copy, the authentication bar, the response
window, or the log.

> ⭐⭐ **a citation to a brief that answers the adjacent question manufactures an illusion of
> closure.** cited bare, that boundary reads as though it disposed of the dispute path — and it is
> exactly the kind of pointer a reader stops at rather than follows.
> **when you cite a neighbour, say which half it answers.**

⭐ **the dispute channel's canonical owner is `rule.require.dispute-channel.[rule].md`** — it lives in
its own file because four peer briefs cite it, and because it carries a **statutory** floor
(Tex. Bus. & Com. Code ch. 109, §§ 109.003–109.004) rather than a preference. **cite it; do not restate it.** what this rule owns
is only the constraint the collapse imposes on it: **subject-authenticated, logged, and not the
everyday console.**

⚠️ `[inferred]` **a subpoena or a legal hold is a different question and is NOT this leak.** compelled
disclosure to a court is not publication to a reader, and the collapse is a publication rule. that
distinction belongs in the agent's guidance too, so nobody treats a lawful demand as a policy breach —
or treats the policy as a reason to resist one.

⚠️ **this enumeration is a floor, not a census.** four rows were found by *later* briefs in this
cluster — three by peer briefs, and the human-surface row by a review pass that noticed every listed
surface was a machine — all after this rule was first written. **that is the tell that the list is
discovered by use rather than derived up front. a builder who checks only this table under-covers.**
the durable test is the one-line question in `.the test`, applied to every surface, not a match
against these nine rows.

⭐ **and the human-surface row is the sharpest evidence for that warning**, because it was not a
missed *item* — it was a missed **category**. eight rows of careful enumeration all sat inside one
unstated assumption: that a surface is something code renders. **an enumeration is blind in the
dimension its author did not know they had chosen.**

### part 3 — the ANNOUNCEMENT

`[inferred]` **this is the part that does the legal work, and it only works in advance.**

the concern with a collapse is that a reader decodes it — sees `⬜` and concludes *adverse*. the
answer is not a large enough hiding class (which decays as coverage grows). the answer is a
**published rule**: a reader who takes `⬜` as adverse is drawing an inference **against a disclosed
policy**, and the policy states plainly that the branches are not distinguished.

the four properties the announcement must have:

1. **blanket** — every profile, always; never a per-profile decision
2. **announced** — in the terms *and* beside the badge, before any reader draws an inference
3. **reason-blind** — the policy states that the branches are not distinguished
4. **stable** — it does not vary with coverage, market, or subject

⚠️ **a policy first surfaced in a deposition reads as post-hoc rationalization. the same policy
published in advance is evidence of a consistent practice.** this is why the rule ships ☀️ fullsun —
publication is not a cost here, it is the mechanism.

### ⭐⭐ the REQUIRED copy — the positive string, not only the forbidden ones

⛔ **every other part of this cluster names what a cell may NOT say.** that is half a specification: a
builder who deletes *"no records found"* and *"clean"* still has an empty cell and no sanctioned
words to put in it, and will invent some. **the invented string is where the collapse breaks**, because
an author with no mandated phrase writes the one that fits the branch in front of them.

so the copy is **specified, not merely constrained**:

| the cell | the required copy | why this string |
|---|---|---|
| `⬜ unknown` on a row we **sometimes** check | ⭐ **"we have not checked this"** | speaks only about **our reach**, never about the subject. it is true of the verified-negative branch and the un-checked branch alike — which is exactly what makes the union sayable in one sentence |
| `⬜ unknown` on a row we **never** check | ⭐ **"we do not check this"** | a policy statement, not a per-profile fact. it cannot decode to anything about this subject, because it is identical on every profile in the directory |
| `🟡 claimed` | **"self-attested · not independently checked"** | names the source and the absence of verification in one line, so a reader cannot read a claim as a check |
| `✅ verified` | the fact, its **source**, and its **as-of date** | a favorable cell is the only one that asserts, so it is the only one that must carry its provenance |

⚠️⚠️ **the two `⬜` strings are NOT interchangeable, and the distinction is load-bearing.** *"we have
not checked this"* on a row we never check would be a lie by implication — it suggests we might have.
*"we do not check this"* on a row we sometimes check would leak the branch, because it would appear
only where the check was skipped. **each string is true exactly where it is mandated, and misleading
everywhere else.**

⭐ **and note what NO string may do: report a result.** the forbidden set — *"no records found"*,
*"clean"*, *"none"*, *"nothing on file"* — all share one property: they describe **the record**
rather than **our reach**. `rule.require.asymmetric-disclosure` is that distinction, made into copy.

---

## ⭐ one mechanism, three defenses

the announcement is load-bearing in three separate places. `[inferred]`:

| pressure | how the announced asymmetry answers it |
|---|---|
| **defamation by implication** — `⬜` beside a competitor's `✅` | the inference runs against a disclosed blanket rule that says `⬜` carries no adverse meaning |
| **§ 5 / UDAP omission** — "the page implies diligence it did not perform" | the promise is *"only confirmed results are published, and what cannot be confirmed is not"*; `⬜` is consistent with the stated terms |
| **aggregation harm** — assembly of scattered records is itself a harm | the profile is an assembly, but it **asserts no adverse fact**; it is structurally incapable of being a dossier |

⚠️ **and this is a single point of failure worth naming.** all three lean on the same premise — that
advance disclosure cures the inference. `[unverified]` no § 5 authority has been captured on whether
a disclosed asymmetric-publication policy cures an omission claim. **if disclosure does not cure, all
three weaken together.**

## ⚠️ what this rule costs

stated plainly, because a rule that hides its cost invites someone to quietly break it:

1. **the adopter forfeits the ability to say "clean."** a spotless twenty-year record is
   indistinguishable from an unpaid judgment. the good operator differentiates on **presence-facts**
   — never on an empty record.
2. **the directory cannot warn.** a consumer up against a revoked license sees the same `⬜` as one
   up against a contractor the directory has not reached. that is the highest-cost cell in the
   design. ⛔ **read this beside *this rule sits above the legal floor*: outside FCRA a warning is
   lawful, and this rule declines it.** the alternative is available and is given up on purpose.
3. `[inferred]` **the framing must carry the accuracy rationale, not a dignity one.** at entity grain
   there is no privacy interest to appeal to — *"adverse facts about businesses are withheld"* reads
   to a consumer advocate as protection of contractors at consumers' expense. the defensible public
   framing is **no claim is published that the publisher cannot stand behind**, which is a
   consumer-side promise.

## ⭐⭐ what this rule does NOT govern

⚠️ **an adverse-fact rule reads, at first glance, as a bar on adverse-fact research generally** — on
the diligence services that exist precisely to surface a defect in a property, a permit, or a record.
**it is not**, and the distinction is a boundary between two legal objects rather than a caveat on
this rule.

⭐ **cited, not re-derived** — the boundary has its own brief, because it is about a **different pair
of objects** than this rule governs:

> **`define.boundary.diligence-answer-vs-published-claim.[lesson].md`**

the one line this rule needs:

> ⭐ **diligence answers a question about YOU; a directory publishes a claim about SOMEONE ELSE.** an
> adverse fact told to its own subject triggers no publicity right, no consumer-report duty, and no
> sale — because the subject and the audience are the same person.

⛔ **and the point where it is crossed, which is what this rule guards:** the boundary breaks the
moment a diligence-grade adverse result is **rendered on a public profile**. the analysis that was
safe as an answer becomes a publication, and every regime this rule exists to avoid attaches at once.
**the same fact, the same accuracy, a completely different legal object.**

### ⭐⭐ .and it does NOT govern third-party speech we HOST

> ⛔ **this rule reaches OUR assertions. it does not reach a statement whose author is someone else.**

**the question that forces the boundary, and it has no comfortable answer without it:** a two-star
review is an adverse fact. does the collapse swallow it?

- **if yes** → reviews are unshippable, and so is any hosted forum, Q&A, or complaint thread
- **if no** → the rule appears opportunistic: *we suppress a court judgment and publish "this guy is
  terrible"*

⭐ **the line that resolves it is about the SPEAKER, not the severity:**

| the statement | whose is it | does this rule reach it |
|---|---|---|
| a badge, a status, a score we compute | ⛔ **ours** | ✅ **yes** — the collapse applies |
| a summary we write **of** third-party content | ⛔ **ours** | ✅ **yes** — `[observed]` § 230(f)(3) reaches one *"responsible, **in whole or in part**, for the creation or development"* |
| a review the customer wrote, hosted verbatim | ✅ **theirs** | ⛔ **no** — the collapse does not apply |

`[observed]` **§ 230(c)(1)** is at its strongest exactly here: a provider is not *"treated as the
publisher or speaker of any information provided by **another** information content provider."*

⭐⭐ **and the boundary is principled rather than convenient, which is what makes it statable in
public.** the two halves rest on the same commitment:

> **we decline to assert what we have not verified — and we decline to censor a speaker who owns
> their own statement.**

⭐ **this is also the answer to the consumer-advocacy critique already on file.** *"you withhold
adverse facts about businesses"* reads as protection of contractors — until the hosted-speech half is
visible. with it, the design is not *"we hide the bad"*; it is **"we only claim what we can stand
behind, and we do not silence anyone else."**

#### ⛔ three sublayers this boundary does NOT settle

it answers *whose speech*. it does **not** answer:

1. ⛔ **may we reproduce it at all** — a review is authored expression under `[observed]` § 102(a),
   and a platform's terms may forbid the access method regardless. **owned by
   `rule.prefer.metadata-over-republication`.** § 230 is a shield against liability *for* content,
   never a licence *to* content
2. ⛔ **our summary is ours** — the § 230(f)(3) row above. *"several customers describe delays"*
   reports their statements; *"unreliable"* is our assertion and the collapse reaches it
3. ⚠️ `[unverified]` **16 C.F.R. Part 465** — the FTC rule on fake and AI-generated reviews reaches
   **platforms**, not only sellers. hosted speech is not unregulated speech. tracked as
   `G-ftc-reviews-rule`

> ⚠️ **so "it is their speech" answers the collapse question and opens three others.** a design that
> reads this section as clearance to republish reviews has taken the § 230 answer for an IP answer.

## .the test

before any cell is rendered, ask:

> **"if this result is what the subject would least want published — does it render identically to an
> unchecked cell?"**

- yes → the collapse holds
- no → the asymmetry has leaked, and the announcement no longer covers it

## .enforcement

- an adverse result rendered as anything other than the same `unknown` as an unchecked cell =
  **blocker** (the asymmetry is broken)
- any signal that distinguishes the two branches of `unknown` — ask-count, check-date, ordering,
  styling, API field, export column = **blocker** (the collapse is broken)
- the policy applied but **not published in advance** = **blocker** (the announcement is the defense;
  without it the collapse is an omission, not a rule)
- a per-profile or per-market exception to the rule = **blocker** (it is not blanket, so it is not
  announced-and-stable)
- a favorable badge rendered without its status verified current = **blocker** (see
  `hazard.stale-public-record-status`)
- ⭐ **PAID PLACEMENT of any status cell, badge, or rank position = blocker.** money that moves a
  cell converts the whole surface from a report into an advertisement — which re-opens the false-
  association exposure the badge rule closes, and hands a right-of-publicity plaintiff the
  *"commercial purpose"* element every one of the five state statutes requires. see
  `hazard.badge-implies-endorsement` and `hazard.unclaimed-profile-right-of-publicity`
- ⭐ a required copy string replaced with an author's own phrasing = **blocker** (see *the REQUIRED
  copy*) — an invented string is where the collapse breaks
- ⭐ *"we do not check this"* on a row we sometimes check, or *"we have not checked this"* on a row we
  never check = **blocker** — the two strings are not interchangeable
- ⛔⛔ **a support, sales, or dispute-response console that EXPOSES the internal branch to the agent =
  blocker.** the collapse cannot rest on a human's discretion; withhold the branch and the leak has
  no source (see *the human surface fails differently*)
- ⛔ the collapse computed **at render time** rather than as a **store-boundary projection** =
  **blocker** — every consumer upstream of the template still holds the branch, so the control is a
  permission rather than a structure, and permissions widen (see *the projection is the boundary*)
- ⛔ a **differential** answer to *"why is my cell blank?"* — any answer that varies with the internal
  branch, including a refusal to answer for one branch only = **blocker** (the variance is the leak,
  whether or not the adverse result is named)
- ⛔⛔ **this rule invoked to suppress, rank down, or filter a third-party statement whose author is
  someone else = blocker.** the rule reaches OUR assertions. a hosted review is the customer's
  statement, and `[observed]` § 230(c)(1) treats it as *"information provided by another information
  content provider"* — to collapse it is to assert an editorial judgment we do not hold, and it
  converts a restraint into a shield for the subject (see *it does NOT govern third-party speech we
  HOST*)
- ⛔ a **summary, score, or count we compute** over third-party content treated as third-party speech
  = **blocker** — `[observed]` § 230(f)(3) reaches whoever is *"responsible, in whole or in part, for
  the creation or development"*, so the summary is **ours** and this rule reaches it in full

### ⭐⭐ paid placement — THIS IS THE CANONICAL STATEMENT. cite it; do not restate it.

**the scope is: any status cell, badge, or rank position, on any page, at any grain.** every other
brief in this cluster links here.

| brief | its role |
|---|---|
| **this rule, above** | ⭐ **canonical** — the scope and the blocker severity |
| `hazard.badge-implies-endorsement` | *why* it matters on the trademark layer — paid placement makes the implied affiliation **true**, so the confusion defense evaporates |
| `hazard.unclaimed-profile-right-of-publicity` | *why* it matters on the publicity layer — it supplies the *"commercial purpose"* element all five state statutes require |

⛔⛔ **do NOT restate the scope in a narrower form — and specifically, do NOT bound it to person
grain.** the case the publicity brief cannot see is the **trademark** layer, which is an *entity*-grain
exposure, and paid placement is precisely what makes an implied affiliation **true** there. a
person-grain restatement therefore reads as permission on an entity page, which is **exactly where
the risk is largest.**

⭐ **that is why this line has one owner.** a link cannot drift; a paraphrase can, and it drifts toward
whatever the local brief happens to be about — so a restatement narrows toward the local grain and
silently permits the case it never considered.

**an obligation stated in four places is one that will eventually say four things.**

---

## severity

**require → blocker**, and the peer rules in `market/` are all `prefer → nitpick`. the divergence is
deliberate and worth the sentence:

`rule.prefer.clear-conspicuous-disclosures` and `rule.prefer.link-guaranteed-not-own-purchase-trigger`
each describe **terrain** — a strong route among several lawful ones, where a differently-shaped
program can be lawful by another path. this rule is not terrain. it is a **single structural
commitment that the whole cluster's posture rests on**, and it fails as a unit:

- part 3 (the ANNOUNCEMENT) is what defeats the adverse inference. published late, it is worthless
- part 2 (the COLLAPSE) is what makes part 1 true in the rendered artifact. leaked at one surface, it
  is broken at all of them
- and the same announcement carries **three** separate defenses at once (see *one mechanism, three
  defenses*) — so a partial adoption does not buy a partial benefit, it buys none

the **benefit of compliance**: the entire class of *wrong adverse assertions about a subject*
disappears, because none is asserted. that is the largest single risk reduction in the cluster, and
it is why `⬜ unknown` is the one badge state with no row in `hazard._.catalogue`.

the **cost** is stated plainly in *what this rule costs* — the ability to say "clean" is forfeit, and
the directory cannot warn. blocker severity is what keeps that cost from be quietly traded away by
someone who sees only the local product win.

---

## the honest gap

> ⭐ **the cluster's canonical open-question tracker is `hazard._.catalogue` § *.the DECLARED GAPS*.**
> this section states the residuals **of this rule** and their local consequence; the tracker holds
> the cluster-wide list and the research scope. **a new gap goes to the tracker first.**
>
> ⚠️ the § 5 premise below and the false-light residual are both carried there — they threaten more
> than this rule, and a gap recorded only beside what it threatens is invisible to a reader who wants
> the open-question list.

- ⛔ **the single point of failure is `[unverified]`.** all three defenses lean on one premise — that
  **advance disclosure cures the inference**. no FTC § 5 authority has been captured on whether a
  disclosed asymmetric-publication policy cures an omission claim. if disclosure does not cure, all
  three weaken together. this is named in *one mechanism, three defenses* and it is the row counsel
  should test first.
- ⚠️ **the collapse answers the LEGAL inference, not the STATISTICAL one.** at very high coverage a
  sophisticated reader may infer from *"almost every peer in this trade and metro carries a verified
  license badge, and this one does not"*. the blanket policy answers whether that inference is
  **actionable**; it does not make the inference **unavailable**. `[inferred]` — and it is a real
  residual, not a solved problem.
- ⚠️ **"blanket" is a claim about practice, not only about policy.** the rule is blanket by design,
  but coverage is not uniform — license registries are per-metro and per-trade. a policy that is
  blanket in text and patchy in fact is weaker than either. the discipline is that the *rule* never
  varies even where the *data* does.
- ⚠️ **false light is un-swept.** truth answers defamation, but some states reach true-but-misleading
  juxtaposition. `⬜` beside a peer's `✅` is exactly that shape. `[unverified]` — no five-state sweep
  run on false light.
- ⚠️ **this rule governs publication, not collection.** it bounds what is surfaced. it is silent on
  what may lawfully be held, and the state duties on a held record are their own layer — see
  `hazard.sealed-record-republication`.

---

## key takeaways

| question | answer | anchor |
|----------|--------|--------|
| what does this rule require? | publish only favorable results; render adverse and unchecked as one indistinguishable `unknown`; **announce the policy in advance** | § .what |
| why is it safe to withhold? | an adverse fact that is never asserted cannot be asserted wrongly | § .why |
| which part is usually dropped? | part 3, the ANNOUNCEMENT — and it is the part that does the legal work | § part 3 |
| what defeats the collapse? | any signal that distinguishes the two branches — ask-count, check-date, ordering, styling, an API field | § part 2 |
| does `⬜` mean "not checked"? | no — it is a **union** of *checked-and-adverse* and *not-checked*, by construction | § part 1 |
| does the law compel this rule? | ⛔ **no** — outside FCRA a true, current, correctly-matched adverse record may lawfully be published. **this rule declines** | § this rule sits ABOVE the legal floor |
| which class has the LONGER federal leash inside FCRA? | ⚠️ **criminal convictions** — § 1681c(a)(5) carves them out of the 7-year bar; civil suits do not escape it | § above the legal floor |
| does this bar adverse-fact diligence generally? | no — diligence answers a question about **you**; a directory publishes a claim about **someone else** | § what this rule does NOT govern |
| what does it cost? | "clean" becomes unsayable; the directory cannot warn; the framing must carry accuracy, not dignity | § what this rule costs |
| severity? | **require → blocker** — a structural commitment that fails as a unit, unlike the `prefer` peers | § severity |
| the weakest point? | `[unverified]` whether advance disclosure cures a § 5 omission claim — all three defenses rest on it | § the honest gap |

## .note on the five-state rule

`rule.require.five-state-baseline` is **not** triggered: this rule draws no state-law redline — it
adopts the **strictest-common-denominator** posture the nexus note describes, which is lawful in
every state at once precisely because it asserts no adverse fact anywhere. the state-law layers it
avoids are swept in the hazard briefs. **stated so a reviewer can tell a scope boundary from an
omission.**

## .sources

1. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
2. [15 U.S.C. § 1681b](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim)
3. [15 U.S.C. § 1681c](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681c&num=0&edition=prelim)
4. [15 U.S.C. § 1681e](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim)
5. [15 U.S.C. § 1681k](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681k&num=0&edition=prelim)
6. [Tex. Bus. & Com. Code ch. 109](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.109.htm)
7. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
8. [17 U.S.C. § 102](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section102&num=0&edition=prelim)
9. license status vocabulary — `src/domain.roles/licenser/briefs/industry=.all/define.what-licenses-mean.md`

captured via browser per `rule.require.bhrowser-citations`.

⭐ **sources 7 and 8 were added by the hosted-speech boundary, and each supports a different half of
it.** § 230(c)(1) and (f)(3) draw the line by **author** — a hosted review is theirs, a summary we
compute over it is ours. § 102(a) is listed because the boundary would otherwise be misread as
permission: § 230 answers *may we be sued for it*, never *may we copy it*, and the second question is
owned by `rule.prefer.metadata-over-republication`. **a source that prevents a misread earns its
line as surely as one that proves a claim.**

⚠️ **§§ 1798.99.80 and 1798.99.86 are deliberately NOT listed here** — they support no claim in this
file, and they carry load in `define.boundary.entity-grain-vs-person-grain` and
`hazard.go-private-request` respectively. **a source list is a verification aid, not a count to
reach.**

## .date researched

2026-08-02 to 2026-08-04: the capture dates of the sources listed in `.sources`, each read via browser.

## .publishability

☀️ **fullsun** (share) — and **more strongly than most briefs here.** part 3 requires the policy to
be published in advance; a rule of this kind that is kept internal does not work. the reasoning is
public law plus a disclosed commitment, with no client identity, no coverage data, and no applied
mechanic.

⚠️ **what is held back.** the *coverage figures* — which trades and metros, what share of cells carry
`⬜` — are operational data and belong in a restricted artifact.

⚠️ **and one line is drawn deliberately, because it is easy to draw in the wrong place.** cost #3
names a **generic** framing hazard: publish-only-favorable reads to a consumer advocate as protection
of the listed businesses. that is a fact about how the posture is received by any adopter, so it
ships. what does **not** ship is any **applied** version of it — a named party's assessment of how
exposed it is, or which critic it expects. per `rule.require.publishability-triage`'s clean line,
*"we assess our position as Y and our weak spot is Z"* → 🔒 protect. **the hazard is public; a
particular adopter's standing against it is not.**

## .see also

- `_taxonomy/_.glossary.[summary].md` — the term index
- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — which results are favorable at all
- `define.boundary.who-speaks-decides-the-regime.[lesson].md` — why a badge is the publisher's speech
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the axis above both
- `hazard.stale-public-record-status.[hazard].md` — why a favorable badge decays into a false one
- `hazard._.catalogue.[summary].md` — the hazards this rule does **not** reach, and why `⬜` has no row
- `../../../../../../.agent/repo=.this/role=any/briefs/rule.require.recommendation-disclaimer.[rule].md` — the repo-wide rule requiring the disclaimer above
