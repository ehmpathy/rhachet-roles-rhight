# compare.reinstatement-vs-reregistration

## .what

comparison of two paths when a Delaware corporation is void: reinstate the extant entity vs dissolve and form a new one.

---

## .the two paths

| path | what happens |
|------|--------------|
| **reinstatement** | revive the void corporation; "as if it was never voided" |
| **reregistration** | dissolve the old corp, form a new one |

---

## .critical difference: EIN

**reinstatement:** keep your EIN (Employer Identification Number)

**reregistration:** **new EIN required**

> 🚨 **A FABRICATED QUOTE STOOD HERE.** it read:
>
> > *"A cancelled EIN cannot be reassigned or reused for another business."*
>
> attributed to `irs.gov/…/when-to-get-a-new-ein`.
>
> **the IRS does not say this.** a search for `cancel|reassign|reuse|another
> business` across **78,407 characters** of pulled IRS text — the EIN page
> (3,611 ch, accordion expanded) and Pub. 1635 (74,796 ch) — returns
> **zero hits**. the sentence is plausible, on-topic, and invented.
>
> ⚠️ the cited url is also wrong: the live page is `do-you-need-a-new-ein`.
> `when-to-get-a-new-ein` is its **title**, not its slug.
>
> ⭐ **a fabricated quote under a real `.gov` url is invisible to every grep.**
> it survives a proofread, a link check, a plausibility read, and a scan for
> uncited claims — it *is* cited, to the right agency, on the right topic. only
> a **PULL** catches it. see `rule.require.bhrowser-citations`, and the memory
> lesson: *a grep proves research, only a pull proves correctness.*

### what the IRS actually says

the rule is a **list**, not a principle about EIN permanence:

> "You will need a new EIN if any of the following are true: … **You receive a
> new corporate charter**"
>
> — [IRS Pub. 1635, *Understanding Your EIN*](https://www.irs.gov/pub/irs-pdf/p1635.pdf), p. 6

that is the operative line for reregistration, and it is **better** than the
fabrication: it names a concrete, checkable event rather than an assertion about
what happens to the old number.

⚠️ **do not substitute an "EINs are never reassigned" quote here either.** that
statement does appear in IRS material, but **it has not been pulled**, so it
must not be quoted. the charter line above is pulled and carries the argument.

this matters because your EIN is tied to:
- bank accounts
- tax history
- vendor relationships
- payroll systems
- contracts and agreements

---

## .full comparison

| aspect | reinstatement | reregistration |
|--------|---------------|----------------|
| **EIN** | keep — the charter is revived, never re-issued (8 Del. C. §312(e)) | new required — *"you receive a new corporate charter"* (Pub. 1635 p. 6) |
| **company name** | protected | may be taken by others |
| **corporate history** | preserved | starts fresh |
| **contracts** | continue | may need re-execution |
| **bank accounts** | keep | new accounts needed |
| **tax history** | continuous | new entity for IRS |
| **legal continuity** | "as if never voided" | separate legal person |
| **liability shield** | unbroken | gap in transition |

---

## .cost comparison

### reinstatement costs

| item | cost | source |
|------|------|--------|
| back taxes (recalculated via Assumed Par Value) | ~$400/year voided | `franchise.tax.delaware` skill |
| late penalties | $200/year | 8 Del. C. §502(c) |
| interest | 1.5%/month | 8 Del. C. §504(c) |
| Certificate of Revival | **$189.00** | ⭐ schedule, `Revival (plus taxes to renew)` |
| Certificate of Revival — **exempt** | **$5.00** | ⭐ schedule, `Revival (exempt)` |

### reregistration costs

| item | cost | source |
|------|------|--------|
| Certificate of Dissolution — §§274/275/276 | **$224.00** | ⭐ schedule |
| Certificate of Dissolution — **§391 short form** | **$50.00** | ⭐ schedule |
| new Certificate of Incorporation | **`*$109.00`** ⚠️ *varies with stock* | ⭐ schedule, `Incorporation` |
| new registered agent setup | $50-$300 | market price, not a fixed fee |
| new EIN application | $0 | IRS |
| bank account changes | varies | — |
| contract amendments | varies | — |

⭐ = [DE Division of Corporations, Fee Schedule, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf),
pulled 2026-08-31.

⚠️ `*$109.00` carries Delaware's asterisk — *varies based on stock* — so the
incorporation fee is `$109.00` **or more**, never less. there is no `$89` fee.

⭐ **the §391 short-form dissolution at `$50.00`** is a 4.5× cheaper exit than
the §§274/275/276 route.

⛔ **no totals are published.** per `rule.forbid.hand-computed-figures`: the
reinstatement side depends on years voided and on the recalculated tax (run the
`franchise.tax.delaware` skill); the reregistration side folds fixed state fees
into a market range for an agent. a single "typical" number hides exactly the
variable that decides the answer.

---

## .hidden costs of reregistration

the sticker price of reregistration looks cheaper, but hidden costs include:

| hidden cost | impact |
|-------------|--------|
| new bank accounts | time + potential wire transfer issues |
| updated contracts | legal fees, counterparty approval |
| vendor re-onboard | payment systems, credit applications |
| tax complexity | two entities in same year |
| lost corporate history | due diligence friction for investors |
| liability gap | period between dissolution and new formation |

---

## .what about S-corp or B-corp?

### S-corp (subchapter S election)

**not a different entity type** — S-corp is an IRS tax election on your extant C-corp.

| aspect | what happens |
|--------|--------------|
| Delaware entity | unchanged (still a corporation) |
| EIN | unchanged |
| process | file IRS Form 2553 |
| cost | $0 (IRS submission) |

you can elect S-corp status on a reinstated corporation. no need to reregister.

### B-corp (Benefit Corporation)

**this IS a different Delaware entity type.**

Delaware allows entity conversions that preserve legal continuity:

> "The corporation of this State shall, for all purposes of the laws of the State of Delaware, be deemed to be the same entity as the other entity that converted."
>
> — [Delaware Code § 265](https://corp.delaware.gov/conversions09/)

| aspect | conversion to B-corp |
|--------|---------------------|
| EIN | **preserved** — the IRS names this case |
| legal continuity | preserved |
| process | file Certificate of Conversion |

> "**Do not** get a new EIN if you: … **Convert at the state level and don't
> change your business structure.**"
>
> — [IRS, *When to get a new EIN* → Corporations](https://www.irs.gov/businesses/small-businesses-self-employed/do-you-need-a-new-ein)

⚠️ **the qualifier is load-bearing**: *don't change your business structure*. a
Delaware public benefit corporation (8 Del. C. §§361-368) is still a
**corporation** — the benefit purpose changes what the board must weigh, not
the federal tax classification. a conversion into an LLC taxed as a partnership
would be on the other side of the line.

**recommendation:** if you want B-corp status, reinstate first, then convert. do not dissolve and reregister.

---

## .when reregistration makes sense

reregistration may be preferable if:

| scenario | why |
|----------|-----|
| massive back tax liability | if void for 10+ years with bad calculation, reinstatement costs may exceed fresh start |
| want to abandon old liabilities | new entity has no prior debts (but creditors may still pursue you personally) |
| company name is tainted | fresh brand, fresh start |
| fundamentally different business | pivot so dramatic that continuity has no value |

**caution:** abandonment does not eliminate personal liability if you personally guaranteed debts or engaged in fraud.

---

## .when reinstatement is better

reinstatement is almost always better if:

| scenario | why |
|----------|-----|
| void for <3 years | full restoration available |
| have contracts | no need to re-execute |
| have bank accounts | no disruption |
| have tax history | continuous record |
| plan to raise capital | investors prefer clean history |
| want to keep company name | protected via reinstatement |

---

## .decision tree

```
void Delaware corporation
│
├─ void for <3 years?
│  ├─ yes → reinstate (almost always better)
│  └─ no → consider reregistration (name may be taken)
│
├─ back taxes >$10K even with recalculation?
│  ├─ yes → evaluate reregistration vs reinstatement cost
│  └─ no → reinstate
│
├─ need to preserve contracts/bank accounts/EIN?
│  ├─ yes → reinstate
│  └─ no → evaluate both options
│
└─ want S-corp or B-corp status?
   ├─ S-corp → reinstate, then file Form 2553
   └─ B-corp → reinstate, then file conversion
```

---

## .summary

| if you want... | do this |
|----------------|---------|
| keep EIN | reinstate |
| keep company name | reinstate |
| keep contracts | reinstate |
| keep bank accounts | reinstate |
| S-corp status | reinstate + Form 2553 |
| B-corp status | reinstate + conversion |
| fresh start | reregister (but understand the costs) |

**default recommendation:** reinstate unless you have a specific reason not to.

---

## .sources

1. [IRS: When to get a new EIN](https://www.irs.gov/businesses/small-businesses-self-employed/do-you-need-a-new-ein) — ⚠️ the slug is `do-you-need-a-new-ein`; "when to get a new EIN" is only the page **title**. ⚠️ the entity-type lists are behind a **collapsed accordion** — the page returns 911 chars unexpanded, 3,611 after `Expand all`
2. [IRS Pub. 1635, *Understanding Your EIN* (PDF)](https://www.irs.gov/pub/irs-pdf/p1635.pdf) — ⭐ **prefer this over the web page.** it carries the same lists plus the word *"form"*, which the web paraphrase drops. 74,796 chars via `pdftotext`
3. [IRS: About Form 2553 (S-corp Election)](https://www.irs.gov/forms-pubs/about-form-2553)
4. [Delaware Division of Corporations: Conversions](https://corp.delaware.gov/conversions09/)
5. [Delaware Code § 265: Conversion of Entities](https://law.justia.com/codes/delaware/title-8/chapter-1/subchapter-ix/section-265/)
6. [Harvard Business Services: My Delaware Corporation Was Voided](https://www.delawareinc.com/blog/my-delaware-corporation-was-voided-now-what/)
7. [Delaware Registered Agent: Revive a Void Corporation](https://www.delawareregisteredagent.com/delaware-registered-agent/how-to/revive-delaware-corporation)
8. [Northwest Registered Agent: How to Reinstate Delaware Corporation](https://www.northwestregisteredagent.com/corporation/delaware/reinstate)

### read, not cited above

read in the research and kept for the record; no sentence above relies on it.

- [Delaware Code § 311: Revocation of Voluntary Dissolution](https://law.justia.com/codes/delaware/title-8/chapter-1/subchapter-xii/section-311/)
