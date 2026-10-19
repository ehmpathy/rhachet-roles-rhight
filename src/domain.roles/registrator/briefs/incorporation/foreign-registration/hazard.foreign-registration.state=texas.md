# hazard.foreign-registration.state=texas

## .what

a corporation chartered in one state that **transacts business** in Texas must
register with the Texas Secretary of State. the late fee is
**$750 × every calendar year unregistered**, a partial year counted as a full
one — so the cost grows silently, on a clock nobody sends you a bill for.

this duty is **entirely separate** from Texas franchise tax. different agency,
different test, different penalties. to satisfy one is no evidence of the other.

## ⚠️ two Texas duties, and they are constantly conflated

| | franchise tax | foreign registration |
|---|---|---|
| agency | **Comptroller** of Public Accounts | **Secretary of State** |
| the test | "doing business in this state" (§171.001) | "transacting business in this state" (BOC §9.001) |
| threshold | **lower** | **higher** |
| what you file | PIR / OIR, annually | one application for registration |
| the sanction | forfeiture + **officer personal liability** | late fees, court bar, injunction, civil penalty |

the thresholds differ, and the Secretary of State says which way:

> "The threshold level of activity required for a **tax nexus is generally
> lower** than the threshold level of activity that requires registration with
> the secretary of state.
>
> Therefore, if the Texas Nexus Questionnaire results in a determination of
> '**no nexus**,' the entity is probably **not transacting business** in Texas
> either.
>
> On the other hand, if the Texas Nexus Questionnaire results in a determination
> of '**nexus**,' the entity **should consider registration**."
>
> — [Tex. SoS, *Foreign or Out-of-State Entities*](https://www.sos.state.tx.us/corp/foreign_outofstate.shtml)

so the tax answer is a **one-way screen** on the registration question:

```
no tax nexus  -> probably no registration duty either   (a useful negative)
tax nexus     -> registration is an open question       (NOT an answer)
```

⚠️ the instinct runs backwards: the Secretary of State is the more visible
agency, but the Comptroller's questionnaire is the cheaper screen and can close
the whole matter.

## 🎯 "transacting business" is UNDEFINED — work the safe harbor

there is no affirmative definition to apply. the Secretary of State says so
about its own statute:

> "**Texas statutes do not define 'transacting business.'** Helpful resources to
> determine whether an entity's activities in Texas require registration
> include: BOC § 9.251, which lists activities that are **not** considered
> transacting business; Case law…; Texas Attorney General Opinions; and Private
> attorneys familiar with corporate law."

and it will not answer for you:

> "**No member of the secretary of state staff can determine whether an entity
> is transacting business in Texas** or needs to file an application for
> registration."

so the analysis runs **negatively**, through the [§9.251](https://statutes.capitol.texas.gov/Docs/BO/htm/BO.9.htm)
list of activities that do **not** constitute the transaction of business:

| § | the activity |
|---|---|
| (1) | maintaining or defending a suit, or settling a claim |
| (2) | holding a meeting of managerial officials or owners; internal affairs |
| (3) | **maintaining a bank account** |
| (4) | an office or agency **only for** securities transfer, or a trustee/depositary |
| (5) | voting an interest the entity acquired |
| (6) | effecting a sale through an **independent contractor** |
| (7) | creating or acquiring indebtedness, a mortgage, or a security interest |
| (8) | securing or collecting a debt owed to the entity |
| (9) | **transacting business in interstate commerce** |
| (10) | an **isolated transaction** completed within 30 days, not one of a repeated series |
| (11) | certain executor/trustee powers for a nonresident estate |
| (12) | acts regarding a debt secured by Texas property |
| (13)–(14) | nonoperating mineral interests |
| (15) | **owning, without more, real or personal property in this state** |
| (16) | acting as a governing person of an entity that IS registered here |

### ⛔ read what the list does NOT contain

the safe harbor covers an office kept **for securities transfer** (item 4) and
property owned **"without more"** (item 15). it does **not** cover an office the
entity actually runs its business from.

so an entity that works out of a Texas address is outside the harbor on its
face — and item (9), "transacting business in interstate commerce," does not
rescue it, because that clause protects the *interstate* character of a
transaction, not an in-state place of business.

and the list is a floor, never a ceiling:

> "The list provided by Section 9.251 is **not exclusive** of activities that do
> not constitute transacting business in this state."
>
> — BOC §9.252

which cuts both ways: an activity absent from the list is not thereby
*included*. §9.252 is why the analysis ends with counsel rather than with a
checklist.

## 💰 the cost, and how it compounds

> "Late filing fees are determined by multiplying the number of **whole or
> partial calendar years** that have passed since the date the entity initially
> transacted business in Texas times the registration fee."
>
> "For nonprofit corporations and cooperative associations, the registration fee
> is **$25**. For all other entities, the registration fee is **$750**."
>
> "Example: A for-profit corporation that has been transacting business in Texas
> since June 1, 2007 would owe **$3,000** in late filing fees if registering on
> December 1, 2010. The total fees due with the application for registration
> would therefore be **$3,750**."

the agency's own worked example is the point to notice: **June 2007 → Dec 2010
is 3½ years and costs 4 years**, because 2007 and 2010 are each counted whole.

the statute confirms the arithmetic:

> "The amount of the late filing fee is an amount equal to the product of the
> amount of the registration fee for the foreign filing entity multiplied by the
> number of calendar years that the entity transacted business in this state
> without being registered. **For purposes of computing the fee, a partial
> calendar year is counted as a full calendar year.**"
>
> — [BOC §9.054(b)](https://statutes.capitol.texas.gov/Docs/BO/htm/BO.9.htm)

⚠️ **do not compute this by hand** — per `rule.forbid.hand-computed-figures`,
the partial-year round-up is exactly the kind of step a hand estimate gets wrong
by a whole year. the Secretary of State publishes a late-fee calculator on the
page above; use it, and record which start date you fed it.

⚠️ the 90-day grace is on the **fee**, not the duty. §9.054(a) lets the Secretary
collect a late fee once the entity "has transacted business in this state for
more than 90 days without registering" — the obligation itself attached at day
one.

## 🎯 THE FIVE-YEAR CAP — and why the Comptroller comes first

for an entity that has been unregistered a long time, this is the lever, and it
imposes a strict order of operations:

> "If your entity will be assessed more than five years of late penalties, and
> you meet certain criteria, you may request that the secretary of state limit
> the fees you owe. The secretary of state will **cap the late fees at five
> years** for an entity that (1) submits **evidence of an active right to
> transact business with the comptroller's office**; and (2) certifies to the
> truth of the following statements:
>
> - The entity has satisfied all of its franchise, sales, and other tax
>   obligations with the Texas Comptroller of Public Accounts. **Attach a screen
>   print from the comptroller's office showing the entity has a status of
>   'active right to transact business'**.
> - The entity does not owe any other taxes, fees, or assessments that are
>   administered by any other Texas state agency.
> - The entity has not received a letter from the Office of the Secretary of
>   State regarding the need to submit an application for registration, or if it
>   has received such a letter, it has responded to the secretary of state
>   within 45 days."

so the sequence is fixed, and the wrong order costs money:

```
1. clear the COMPTROLLER  -> file the back PIRs, reach "active right
                             to transact business"
2. screen-print it
3. THEN apply to the SECRETARY OF STATE, with the cap request attached
```

register first and you pay the uncapped fee, because at that moment you cannot
produce the status the cap requires. every year beyond the fifth is $750 that
the correct order would have saved.

⚠️ and the third certification is a **45-day clock on a letter that may already
have arrived**. an unanswered Secretary of State inquiry left in an old mailbox
can disqualify the cap on its own.

> "The general policy of the secretary of state is that we **do not waive late
> fees** for foreign entities, aside from the five year fee cap, if applicable."

so the cap is the only relief on offer. an appeal exists, by letter, for
"unique circumstances" — but it is the exception to a stated policy, not a path.

### ⛔ the cap bounds ONE penalty. it reaches NONE of the others.

| | the five-year cap |
|---|---|
| what it bounds | the **§9.054 late filing fee** — and only that |
| who grants it | the **Secretary of State**, as a stated policy |
| what it reaches | no penalty the Secretary does not herself collect |

⛔ **§9.052 is a different penalty, owed to a different claimant, with no time
limit of its own.** it is not the Secretary's to cap:

> "(b) The **attorney general** may bring suit to recover amounts due to this
> state under this section."
>
> — BOC §9.052(b)

so an entity that secures the cap has bounded its exposure at 5 × $750 **on one
line item**, and has bounded no other. see below for what §9.052 actually
measures.

## .the other penalties

> "Failure to register can result in penalties, including:
> - **Inability to maintain an action, suit, or proceeding in a Texas court**
>   until registration;
> - **Injunction** from transacting business in Texas;
> - **Civil penalty** equal to all fees and taxes that would have been imposed
>   if the entity had registered when first required; and
> - **Late filing fees**…"

### ⚠️ the agency's own paraphrase DROPS the clause that sets the measure

read the civil-penalty line above beside the statute. the Secretary's summary
ends at "when first required." the statute does not:

> "Sec. 9.052. CIVIL PENALTY. (a) A foreign filing entity that transacts
> business in this state and is not registered under this chapter is liable to
> this state for a civil penalty in an amount equal to all:
>
> (1) fees and taxes that would have been imposed by law on the entity had the
> entity registered when first required **and filed all reports required by
> law**; and
>
> (2) **penalties and interest** imposed by law for failure to pay those fees
> and taxes."
>
> — BOC §9.052(a), `refs/effectiveAt=2007-09-01.tx-boc-9.txt:363-367`

two additions, and each one enlarges the number:

| the clause the paraphrase drops | what it adds |
|---|---|
| "**and filed all reports required by law**" | ties the measure to the **report** duty, not merely the registration duty |
| "(2) **penalties and interest**" | the arithmetic is not a fee schedule; it accrues |

⛔ **and the report duty is the one with no clock.** Tex. Tax Code §111.205(a)(2)
lifts the four-year assessment limit outright where "**no report for the tax has
been filed**" — so for a non-filer, the §9.052 measure has no time floor either.

> verified verbatim against
> `accountant/briefs/franchise-tax/state=texas/refs/effectiveAt=1993-09-01.tx-tax-111-limitations.txt:61-65`
> — the bytes live under `accountant` because the statute does
> (`rule.require.bounded-roles`); this brief holds the pointer, not a copy.

```
no report filed  ->  §111.205(a)(2): assessable AT ANY TIME
                 ->  §9.052(a)(1) measured over that same open window
                 ->  §9.052(a)(2) accrues penalties + interest on top
```

⚠️ **so do not read §9.052 as a rounding error beside the late fee.** the late
fee is $750 × years, capped at five. §9.052 is the whole unpaid tax history plus
its penalties and interest, over a window the Tax Code declines to close.

📄 the tax side of this, and the one administrative cap that does bound it:
`accountant/briefs/limitations/state=texas/lever.mtc-disclosure-caps-an-uncapped-window.md`

the court bar is the one that bites most **often**, and the statute is precise
about its shape:

> "A foreign filing entity or the entity's legal representative **may not
> maintain an action, suit, or proceeding in a court of this state**… on a cause
> of action that arises out of the transaction of business in this state unless
> the foreign filing entity is registered in accordance with this chapter."
>
> — BOC §9.051(b)

### ✅ what an absent registration does NOT do

> "The failure of a foreign filing entity to register does not:
> (1) **affect the validity of any contract or act** of the foreign filing
> entity;
> (2) **prevent the entity from defending** an action, suit, or proceeding in a
> court in this state; or
> (3) …cause any owner, member, or managerial official of the foreign filing
> entity to **become liable** for the debts, obligations, or liabilities of the
> foreign filing entity."

so contracts stay good, the entity can still defend itself, and the **liability
shield holds**.

> 🚩 **contrast this with the franchise tax.** an unregistered entity keeps its
> shield under §9.051(c)(3). an entity that skipped a **Comptroller** report
> can lose it under Tax Code §171.255(a) — officers liable "as if… a partner and
> the corporation were a partnership."
>
> the tax duty is the more dangerous of the two, and it is the quieter one,
> because it can be owed at **$0 tax**. see the accountant brief below.

the cure is also complete on the registration side: the bar lifts on
registration ("**until registration**"), and §9.051(b) blocks only claims that
arise out of Texas business.

## 🎯 an entity that STOPPED — the duty is coextensive with the business

for an entity that transacted briefly and **ceased**, the answer is in the
subsection easy to read past:

> "(a) **To transact business in this state**, a foreign entity must register
> under this chapter if the entity: …
>
> (b) A foreign entity described by Subsection (a) **must maintain the entity's
> registration while transacting business in this state**."
>
> — [BOC §9.001](https://statutes.capitol.texas.gov/Docs/BO/htm/BO.9.htm)

both halves are bounded by the business. (a) is purposive — *in order to*
transact, register. (b) fixes the duration — maintain it **while** the entity
transacts. neither reaches an entity that no longer does.

### the consequence: no application, so no late fee

§9.054 is the fee, and it attaches to a **registration**, not to the past:

> "The secretary may condition the effectiveness of **a registration** after the
> 90-day period on the payment of the late filing fee."
>
> — BOC §9.054(a)

so the chain runs:

```
ceased to transact  ->  no present §9.001 duty
                    ->  no application to file
                    ->  no registration whose effectiveness can be conditioned
                    ->  §9.054(b) never computes
```

⚠️ **this makes the year-count question moot rather than answers it.** the SoS
gloss ("years that have **passed since**") and §9.054(b) ("years **that the
entity transacted business**") still diverge, and on a stopped entity they
diverge widely. but the divergence only decides a number that is owed **when
you register**. an entity that never registers never reaches it.

### ⛔ three things that survive cessation anyway

do not read the above as "ceased, therefore clear." three exposures do not
depend on a present duty to register:

| survives | why |
|---|---|
| **§9.051(b) — the court bar** | it turns on whether the entity **is registered** when it wants to sue, not on when the business happened. a claim that arises out of past Texas business stays unenforceable in Texas courts until the entity registers — and to register then triggers the §9.054 fee after all |
| **§9.052 — the civil penalty** | measured by "all fees and taxes that would have been imposed… **had the entity registered when first required** and filed all reports required by law," plus penalties and interest. it is an attorney-general suit, and it needs no application from the entity to exist |
| **§9.055 — other law** | "This chapter does not excuse a foreign entity from complying with duties imposed under **other law**." the franchise tax is other law. it is untouched by every line above |

§9.052 is the one to notice, because its measure is **not** the $750 late fee —
it is the back fees *and taxes* the entity would have paid. that ties the
registration question back to the tax question rather than apart from it.

> 🚩 **the court bar is a latent cost, not one that accrues.** it sits at zero
> until the entity needs a Texas forum. the moment it does, the price is
> registration plus whatever §9.054 then computes — which is why the year-count
> divergence keeps its place on file even when it is presently moot.

## .the practical order of work

```
0. CEASED?    if the entity no longer transacts, §9.001(b) ends the
              registration duty. §9.052 and the court bar do NOT end.
              the franchise tax is a separate question -> step 1 regardless.

1. NEXUS      Franchise Tax Accountability Questionnaire (Comptroller)
              no nexus -> probably no registration duty. record it and stop.

2. TAX        back PIR / OIR for every open year -> "active right to
              transact business"                    (accountant brief)

3. SCREEN     print the status from the account-status lookup

4. REGISTER   application for registration + the five-year cap request,
              with the screen print attached        (this brief)
```

⚠️ steps 2 and 4 are in that order for a reason. see the cap conditions above.

## .enforcement

- a registration question answered without the §9.251 list = **blocker**
- a Comptroller "no nexus" result read as a registration answer rather than a
  screen = **nitpick** (the SoS calls it "probably," not a determination)
- a Comptroller "nexus" result read as settling registration = **blocker**
  (the thresholds differ; it only opens the question)
- a late fee computed by hand rather than by the SoS calculator = **blocker**
  (`rule.forbid.hand-computed-figures` — the partial-year round-up)
- registration filed before the Comptroller status is clear, where more than
  five years are exposed = **blocker** (forfeits the cap)
- the five-year cap reported as bounding **total** exposure = **blocker**
  (it bounds §9.054 alone; §9.052 is the attorney general's and is uncapped)
- §9.052 quoted from the Secretary's paraphrase rather than the statute =
  **blocker** (the paraphrase drops "and filed all reports required by law",
  which is the clause that sets the measure)
- a §9.052 exposure bounded by the four-year assessment limit, for a year in
  which no report was filed = **blocker** (§111.205(a)(2) lifts it)
- an in-state office in active use treated as within the §9.251 harbor = **blocker**
- a ceased entity told it owes a §9.054 late fee, with no registration filed or
  planned = **blocker** (§9.001(b) bounds the duty; the fee attaches to a
  registration)
- "ceased, therefore clear" — cessation read as closing §9.052, the court bar,
  or the franchise tax = **blocker**

## .provenance

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. both playbooks are committed and re-runnable:

- `briefs/refs/texas-foreign-registration.research.play.ts` — the first pass
- `briefs/refs/texas-cessation-and-limitations.play.ts` — §9.001(b), §9.052,
  and the Tax Code limitations subchapter. **it also emits the committed source
  bytes below**, so a re-run regenerates them rather than a human re-types them
  (`rule.forbid.hand-transcription`)

| source | chars | note |
|---|---:|---|
| [BOC ch. 9](https://statutes.capitol.texas.gov/Docs/BO/htm/BO.9.htm) | 44,632 | §9.001, .002, .051, .052, .054, .055, .251, .252 |
| [SoS, foreign entities](https://www.sos.state.tx.us/corp/foreign_outofstate.shtml) | 13,391 | the fee arithmetic, the five-year cap |
| [SoS, foreign FAQ](https://www.sos.state.tx.us/corp/foreignfaqs.shtml) | 27,610 | consequences of an absent registration |

all cleared the byte-count check on the first pull, across both passes.

### the embedded bytes

per `rule.require.embed-source-bytes` — a `.gov` url rots and the claim
outlives its evidence:

- `refs/effectiveAt=2007-09-01.tx-boc-9.txt` — the whole chapter, 44,036 chars

⚠️ the `effectiveAt=` date is the **latest amendment to the sections this brief
quotes** (§9.054, amended by Acts 2007, 80th Leg., ch. 688). other sections in
the chapter carry earlier dates. it is not a snapshot date — the pull happened
2026-08-31.

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| whether any **particular** activity crosses the line | §9.251 is a safe harbor and §9.252 makes it non-exclusive. the SoS declines to answer and names private counsel. this brief maps the test; it cannot apply it |
| the current registration **form number and fee** | the $750 figure is quoted from the SoS page as pulled. confirm against the fee schedule before a filing |
| Texas **case law** on foreign qualification | the SoS names it as a resource; it was not pulled |
| whether an entity already **holds** a registration | ⚠️ **open — and a clean Comptroller result does NOT close it.** the one documented probe (`accountant/briefs/registration/howto.check-a-registration-before-you-disclose`) queries the **Comptroller** for a franchise tax account: a different agency, a different test. no **Secretary of State** lookup is documented. check before you presume an absence |
| 🚩 whether **§9.052 reaches a ceased entity** | its trigger is present-tense — "a foreign filing entity **that transacts** business… and is not registered." whether liability that attached during the active period survives cessation is a question the text does not answer, and no case was pulled on it. the brief treats it as **surviving**, which is the conservative read |
| 🚩 the **cessation reading itself** | §9.001(a) "to transact" + (b) "while transacting" is quoted verbatim, but the conclusion drawn from the pair is a **synthesis**, not a quotation. no SoS statement or case was found that says in terms "a ceased entity need not register" |
| how the SoS treats a **voluntary late registration** by a ceased entity | if such an entity registers anyway (to lift the court bar), which year-count the SoS applies is exactly the unresolved divergence — and it becomes live at that moment |

## .see also

- `accountant` — `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report`
  — the other Texas duty. it is the **more dangerous** one (officer personal
  liability at $0 tax) and it is step 2 of the order above
- `variant=c-corp/howto.reinstate-void-delaware-corp` — the Delaware analogue.
  note the sharp divergence: Delaware revival under §312(e) validates the whole
  lapse window; Texas revival leaves officer liability intact under Tax Code
  §171.255(d)
- `practices/define.why-corporations-are-state-creatures` — why an entity that
  is perfectly alive in its charter state can still be a stranger in another
