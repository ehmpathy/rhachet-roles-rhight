# hazard.unclaimed-profile-right-of-publicity

## .what

right of publicity attaches to **the profile itself**, not to what the profile says. it is triggered
by the **commercial use of a person's name** — so an unclaimed, pre-populated page about a natural
person carries this exposure **before a single badge renders**, and no amount of care about what the
badges say will reach it.

three properties make it distinctive:

1. **it precedes the content** — the name in the URL and the `<h1>` is the use.
2. ⭐ **§ 230 does not reach it** — `[observed]` § 230(e)(2) expressly preserves intellectual-property
   law, and `[inferred]` the publicity right is generally treated within that carve-out.
3. ⭐ **it does not apply to business entities at all** — the result below, now complete across all
   five states.

> **recommendation disclaimer.** the mitigations below are offered to the best of our knowledge,
> based on the information found in research — they carry **no guarantee of success or outcome**, and
> they must be reviewed by a licensed professional (attorney / CPA / licensed advisor) against your
> own real scenario and current law before any reliance. this is groundwork for that review, not a
> substitute for it.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## ⭐ .the five-state sweep — the sweep is UNANIMOUS

`rule.require.five-state-baseline`. posture: **strictest-common-denominator**.

| state | the rule | verbatim-cited authority | reaches an entity? |
|-------|----------|--------------------------|--------------------|
| **TX** | *"An **individual** has a property right in the use of the individual's name…"*; § 26.014: *"This chapter does not affect a right an **individual** may have… before the death of the individual"* — live-person claims are common law | Tex. Prop. Code §§ 26.002, 26.014 | ⛔ **no** `[observed]` |
| **IN** | *"A person may not use an aspect of a **personality's** right of publicity for a commercial purpose … without having obtained previous written consent"* — and § 32-36-1-6: *"'personality' means a **living or deceased natural person**"* | Ind. Code §§ 32-36-1-6, -1-8 | ⛔ **no** `[observed]` |
| **FL** | *"No person shall publish… for purposes of trade or for any commercial or advertising purpose the name… of **any natural person** without the express written or oral consent"* | Fla. Stat. § 540.08(1) | ⛔ **no** `[observed]` ⭐ **strictest on scope** |
| **CA** | *"Any person who knowingly uses **another's** name… without that person's prior consent, **or, in the case of a minor, the prior consent of their parent or legal guardian**"* — plus a **$750** statutory floor, disgorgement, punitives, and attorney's fees | Cal. Civ. Code § 3344(a)(1) | ⛔ **no** `[inferred]` ⭐ **strictest on remedy** |
| **NY** | *"**Any person** whose name, portrait, picture, likeness or voice is used within this state for advertising purposes or for the purposes of trade without the written consent"* | N.Y. Civ. Rights Law § 51 | ⛔ **no** `[inferred]` |

**baseline = FL on scope, CA on remedy** — two different states, on two different dimensions. a
single-state baseline would have been tidier and wrong.

### ⭐ the Indiana cell was the open one, and it closed

Indiana's statute is the broadest of the five and it gates on a *"personality"* rather than on a
*"person"* — which left open, on the face of § 32-36-1-8, whether a company could qualify.
`[observed]` **§ 32-36-1-6 settles it: *"'personality' means a living or deceased natural person…"***

so the entity-grain collapse holds in **all five states**, not four.

⚠️ **and Indiana is the cell to actually check rather than assume.** the other four say *"individual"*
or *"natural person"* in the operative section, so they settle on one read. Indiana's operative
section says *"personality"*, and the answer sits in a **separate definitions section** two provisions
away. **a sweep that reads only the operative text of each statute would score Indiana as open — or,
worse, would guess.**

⚠️ `[unverified]` — the common-law publicity and privacy torts (Restatement (Second) of Torts § 652)
have not been captured; the statutory sweep above is complete, the common-law overlay is not.

## .the exposure at person grain

| axis | what raises it |
|---|---|
| **commercial purpose** | `[inferred]` the pivot every one of the five turns on. a free page that funnels toward a paid product is the contested shape — see the teaser analysis below |
| **consent** | ⭐ an opt-in is a **complete answer** on this axis in all five — ⚠️ but by **two different routes**: an express statutory defense in four, and in TX because § 26.011's consent clause is deceased-only, so a person who is alive has no statutory right to consent away. **cited, not re-derived** — `define.boundary.diligence-answer-vs-published-claim` § *where a subject opt-in lands* owns the per-state clauses |
| **the news / public-interest carve-out** | `[observed]` IN § 32-36-1-1(c)(3) exempts use *"in connection with the broadcast or reporting of an event or a topic of **general or public interest**"*; FL § 540.08(4)(a)'s carve-out is narrower, reaching only a *"news medium … as part of any **bona fide news report**"* |
| **paid placement** | `[inferred]` if badge position or rank is ever purchased, the commercial-purpose argument sharpens materially in all five |

## ⚠️ .the teaser shape

`[unverified]` a stub page that carries a person's name, trade, and metro, with a call to action, is
the fact pattern of the people-search publicity cases. **that case law has not been captured**, and it
is flagged rather than assumed — but the levers that defuse it are cheap and worth adoption
regardless:

| lever | why it matters |
|---|---|
| `noindex` on unclaimed pages | removes the search-traffic rationale, which is the commercial-purpose hook |
| absent from browse and ranked lists | reachable only by someone who already has the name |
| no upsell on the page | "unlock the full report" is the targeted mechanic |
| content mirrors a **public registry**, verbatim and attributed | makes the page a mirror of a government record rather than a composite |
| ⛔ any "ask to enable" count kept **private** | *"3 people asked, no response"* is an adverse signal about their conduct |

⭐ **and the variant that avoids the shape entirely:** return existence as a **search result rather
than a page** — *"a licensed plumber by that name is registered in this county; they have not enabled
a profile."* same signal, and no name used to attract traffic.

### ⚠️⚠️ that variant CONFLICTS with the product, and no brief reconciles it

⛔ **this brief's cleanest mitigation is in tension with the thing being built.** a *directory* is a
browsable set of pages; *"a search result, not a page"* removes exactly the browse surface that makes
it a directory. **the strongest legal answer here is the weakest product answer, and this brief has
no standing to trade them off.**

⭐ **naming the tension is the useful act, because the trade is not total.** the axis is narrower than
it first reads:

| what is at stake | ⭐ does the search-result variant cost it? |
|---|---|
| a **claimed** pro's browsable page | ⛔ **no** — consent removes the hazard entirely; those pages stay |
| an **unclaimed** subject's page | ✅ yes — this is the whole of what it removes |
| cold-start coverage | ⚠️ partly — existence is still discoverable by name, just not browsable |
| ⛔ SEO traffic on unclaimed names | ✅ yes — **and that is the commercial-purpose hook**, so the loss is the mitigation |

> ⭐ **so the conflict is confined to unclaimed subjects.** the product does not have to choose
> between "a directory" and "a search box"; it has to choose what an **unclaimed** subject looks
> like, and every claimed subject is a full page under either answer.

⚠️ **the residual, stated plainly:** the browse surface is thin at launch under this variant, because
at launch almost every subject is unclaimed. **that is a real cold-start cost and it is a wisher
trade, not a legal one** — the levers table above is the middle path (a page that exists, is
`noindex`, is absent from browse, and carries no upsell), and it sits closer to the search-result
variant than to a full page.

⛔ **registered in `hazard._.catalogue` § *the DECLARED GAPS*** rather than decided here.

## .the mitigations, ranked

`[inferred]`:

1. ⭐ **entity grain as the subject of record** — the sweep above shows this **removes** the hazard in
   all five states. structural, not partial.
2. **opt-in for any person-grain page** — an opt-in clears the statutory layer in all five, by an
   express consent defense in four and by TX's deceased-only scope in the fifth (see § *the risk
   axes*).
3. **no page at all for a non-participant** — a search result rather than an indexed profile.
4. **registry-mirrored content only** — narrows what is used and strengthens the public-record frame.
5. ⛔ **no paid placement** — it keeps the commercial-purpose argument at its weakest here.
   ⭐ **cited, not restated: `rule.require.asymmetric-disclosure` § paid placement is canonical.**

   ⚠️ **this line previously read *"on person-grain pages"*, and that scope was WRONG.** the rule is
   **any status cell, badge, or rank position, on any page, at any grain** — because the exposure
   paid placement worsens most is the **trademark** one, which is *entity* grain. a person-grain
   qualifier read as permission exactly where the risk is largest. **this is why a paraphrase of a
   rule is a defect and a link is not: a paraphrase drifts toward whatever its own brief is about.**

⛔ **what does NOT mitigate it:** § 230 (`[observed]` § 230(e)(2) preserves IP law); a disclaimer;
or care taken over what the badges *say* — the exposure attaches to the **use of the name**.

## .the test

> **"is a natural person's name used on a page that exists to support a commercial product — and did
> they agree?"**

- the subject is an entity → the hazard does not arise
- a person, and they opted in → the statutory layer clears in all five (four by express consent
  defense, TX by its deceased-only scope)
- a person, and they did not → ⛔ the exposure is live, and no badge-level care reaches it

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this body of
> law is not tripped. the convention is declared in `hazard._.catalogue` § *the convention*; the
> original mandates live in `rule.*` files. **a `[hazard]` that enforces is checkable, not normative.**

- a pre-populated, indexed profile page that names a **natural person** who has not opted in =
  **blocker** in all five swept states
- **paid** badge placement or rank = **blocker** — ⭐ scope owned by
  `rule.require.asymmetric-disclosure` § paid placement (**any cell, any page, any grain**); *here*
  it matters because it sharpens the commercial-purpose element in all five
- reliance on **§ 230** as the answer to a publicity claim = **blocker** (§ 230(e)(2))
- a public **ask-count** or claim-solicitation signal on an unclaimed person-grain page = **blocker**
  (adverse signal + it strengthens the commercial-use characterization)

## .sources

1. [Tex. Prop. Code ch. 26](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.26.htm)
2. [Ind. Code § 32-36-1-1](https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-1/)
3. [Ind. Code § 32-36-1-6](https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-6/)
4. [Ind. Code § 32-36-1-8](https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-8/)
5. [Fla. Stat. § 540.08](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html)
6. [Cal. Civ. Code § 3344](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=3344)
7. [N.Y. Civ. Rights Law § 51](https://www.nysenate.gov/legislation/laws/CVR/51)
8. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)

⚠️ **fallback noted, per `rule.require.five-state-baseline`:** the Indiana cells are cited to the
Justia section-grain mirror. the official `iga.in.gov` portal is a javascript application that
returned navigation chrome only across four attempted URL shapes. **every other cell is captured from
an official state source via browser.**

## .publishability

☀️ **fullsun** (share) — a five-state statutory sweep, quoted verbatim from official sources and one
sanctioned mirror. no client identity, no coverage data, no applied mechanic. the value is that the
matrix is **correct and complete**.

⚠️ **held back:** which mitigations a given adopter has actually taken up, and where its current
posture is thin, is a plaintiff's roadmap → 🔒 protect. the generic ladder ships here.

## .see also

- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the axis that removes this hazard
- ⭐ `define.boundary.diligence-answer-vs-published-claim.[lesson].md` — **the owner of the five-state
  consent-defense sweep**, with the per-state verbatim clauses and the TX split
- `define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — what consent does NOT reach: FCRA,
  defamation, and the sealed-record duty
- `hazard.badge-implies-endorsement.[hazard].md` — the layer that **replaces** this one at entity grain
- `define.boundary.who-speaks-decides-the-regime.[lesson].md` — why § 230 does not reach it
