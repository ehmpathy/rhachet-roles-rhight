# define.three-duties-three-tests

## .what

"do we owe that state anything?" is **three** questions, not one. each has a
different test, a different agency, and a different answer — so a business can
owe one duty and not the others, in the same state, in the same year.

| duty | triggered by | agency |
|------|--------------|--------|
| **registration** | the seller's own **presence** | Secretary of State |
| **income tax** | presence **or** economic nexus, minus a federal shield | Dept of Revenue |
| **sales tax** | economic nexus **alone**, post-*Wayfair* | Dept of Revenue |

## .why the conflation is the default error

the three use near-identical words — "transacting business," "doing business,"
"engaged in business" — across statutes that mean different things by them. so
the natural move is to answer once and apply the answer three times.

a legislature says otherwise, in terms. Florida's registration safe harbor
closes with:

> "This section does **not** apply in determining the contacts or activities
> that may subject a foreign corporation to service of process, **taxation**, or
> regulation under the law of this state other than this chapter."
>
> — [Fla. Stat. §607.1501(4)](https://www.flsenate.gov/Laws/Statutes/2024/607.1501)

that is the corporations code stating that its own list does not decide the tax
question. the two chapters are not in conversation.

## ⛔ THE FEDERAL SHIELD DOES NOT COVER SOFTWARE

**P.L. 86-272** is the 1959 federal statute that stops a state from taxing the
income of an out-of-state seller whose only in-state activity is solicitation.
it is the reason a manufacturer can have salespeople in forty states and file in
one. and it is written for a world of physical goods:

> "No State… shall have power to impose… a net income tax on the income derived
> within such State by any person from interstate commerce if the only business
> activities within such State… are either, or both, of the following:
>
> (1) the solicitation of orders by such person, or his representative, in such
> State for sales of **tangible personal property**, which orders are sent
> outside the State for approval or rejection, and, if approved, are filled by
> **shipment or delivery** from a point outside the State"
>
> — [15 U.S.C. §381(a)](https://www.law.cornell.edu/uscode/text/15/381)

"tangible personal property" appears in **every** operative clause — (a)(1),
(c), and the (d)(1) definition of independent contractor. it is not incidental
phrasing; it is the scope of the entire statute.

so:

| you sell | the shield |
|----------|-----------|
| widgets, shipped from out of state | ✅ protects you |
| **software, delivered electronically** | ⛔ **does not reach you at all** |
| services | ⛔ does not reach you at all |

a SaaS seller has **no federal floor** beneath state income-tax nexus.

two further limits:

- **§381(b)(1)** — the shield never applies to "any corporation which is
  incorporated under the laws of such State." your **charter state** is outside
  it by definition.
- **§383** — the shield covers "any tax imposed on, or measured by, net income."
  it is silent as to franchise tax, gross-receipts tax, and sales tax. a state
  that taxes gross receipts rather than net income is unaffected by it.

## .the three tests, worked

### 1. registration — follows YOUR presence

the state asks *who are you, and where do we serve you with a lawsuit?* it is a
registry function, and it keys on the entity's own footprint.

every state's corporations code carries a safe-harbor list. Florida's is
representative:

> "(2) The following activities, among others, do not constitute transacting
> business…
> (e) Selling through independent contractors.
> (f) **Soliciting or obtaining orders, whether by mail or through employees,
> agents, or otherwise, if the orders require acceptance outside this state**
> before they become contracts.
> (i) **Transacting business in interstate commerce.**
> (m) Owning, protecting, and maintaining, without more, real or personal
> property."
>
> — Fla. Stat. §607.1501(2)

⚠️ **read what these lists do NOT contain.** they cover an office kept for
securities transfer, and property owned "without more." none of them covers an
office the entity actually runs its business from. an entity that works from an
in-state address is outside the harbor on its face, and clause (i) does not
rescue it — that clause protects the *interstate character of a transaction*,
not an in-state place of business.

and the lists are floors, never ceilings:

> "(3) The list of activities in subsection (2) is **not an exhaustive list** of
> activities that do not constitute transacting business."

which cuts both ways: an activity absent from the list is not thereby included.

### 2. income tax — presence OR economic nexus, minus the shield

broader than registration, because the constitutional limits on *taxing* were
loosened while registration stayed tied to presence. so the asymmetry runs one
way, and a state will say so:

> "The threshold level of activity required for a **tax nexus is generally
> lower** than the threshold level of activity that requires registration with
> the secretary of state.
>
> Therefore, if the… Questionnaire results in a determination of '**no nexus**,'
> the entity is probably **not transacting business**… either. On the other
> hand, if… '**nexus**,' the entity **should consider registration**."
>
> — [Tex. SoS, *Foreign or Out-of-State Entities*](https://www.sos.state.tx.us/corp/foreign_outofstate.shtml)

that makes the tax answer a **one-way screen** on the registration question:

```
no tax nexus  -> probably no registration duty either   (a useful negative)
tax nexus     -> registration is an open question       (NOT an answer)
```

so ask the revenue agency's questionnaire first, not the Secretary of State: it
is the cheaper screen and can close the whole matter.

### 3. sales tax — economic nexus alone

*South Dakota v. Wayfair*, 585 U.S. 162 (2018) abolished the physical-presence
rule for sales tax. a state may now require collection on revenue or transaction
volume with no in-state footprint at all.

and the modern statutes reach digital products expressly:

> "'Engage in the business of an out-of-state vendor' means to sell or deliver
> tangible personal property or a taxable service for use in the State **or a
> digital product or digital code to a customer tax address in the State**."
>
> — [Md. Tax-Gen. §11-701(b)(1)](https://law.justia.com/codes/maryland/tax-general/title-11/subtitle-7/section-11-701/)

"tangible personal property **or** a digital product": digital goods are a
separate category because the old phrase did not cover them — the same
distinction that leaves P.L. 86-272 inapplicable to software.

## 🎯 the home state is UNCONDITIONAL

the two vectors are different, and only one depends on customers:

```
registration follows YOUR presence      -> the home state, always
tax can follow YOUR CUSTOMERS' presence -> other states, sometimes
```

so "we only have out-of-state customers" is not an argument about the home
state. a typical imposition clause:

> "A tax measured by net income is hereby imposed on every taxpayer for each
> taxable year for the privilege of **conducting business, earning or receiving
> income in this state**, or **being a resident** or citizen of this state."
>
> — [Fla. Stat. §220.11(1)](https://www.flsenate.gov/Laws/Statutes/2024/220.11)

the income is earned where the work happens. zero in-state customers leaves that
untouched.

## ⚠️ ZERO TAX DOES NOT MEAN ZERO RETURN

the trap recurs in every state examined so far:

```
revenue is under the threshold
  -> no tax is due
    -> so no form is owed                   🚫 THE ERROR IS HERE
```

two states, two different statutes, the same defeat of that inference:

> "A return… shall be made by every taxpayer for each taxable year in which such
> taxpayer either is liable for tax under this code **or is required to make a
> federal income tax return, regardless of whether such taxpayer is liable for
> tax under this code**."
>
> — Fla. Stat. §220.22(1)

> "A corporation… on which the franchise tax is imposed, **regardless of whether
> the entity is required to pay any tax**, shall file a report with the
> comptroller…"
>
> — Tex. Tax Code §171.203(a)

the exemption and the rate settle whether **tax** is due. neither touches
whether a **return** is due. two independent instances make this a pattern, not
a quirk of one legislature — assume it holds in a new state until its statute
says otherwise.

## 🚩 an agency's own guidance can be a decade stale

Florida's Department of Revenue publishes a live page for businesses with
out-of-state customers. it lists nexus as:

> "Owning property in that state. Making regular deliveries of your merchandise
> in that state. Providing repair services in that state. Sending your
> representatives to solicit orders in that state."

— every item **physical presence**. and it advises:

> "Businesses are encouraged to **voluntarily register** with their market
> states to collect sales tax from out-of-state customers."

that is pre-*Wayfair*: since 2018, collection is a **duty** where a threshold
is crossed. the page's last-revised date is unconfirmed (pulled 2026-08-31);
the statute and the case govern, never a `.gov` summary.

## .the order of work

```
1. the home state      -> unconditional. registration + return + tax
2. per other state:
   a. income tax nexus -> the revenue agency's questionnaire (cheapest screen)
   b. sales tax nexus  -> that state's post-Wayfair threshold
   c. registration     -> only if (a) or a real footprint says yes
```

⚠️ 2(a) before 2(c) for two reasons: the tax threshold is lower, so a "no nexus"
result closes both; and in at least one state the registration late-fee cap is
**conditioned** on a clean revenue-agency status, so the reverse order forfeits
it. see the Texas brief.

## .enforcement

- one nexus answer applied to all three duties = **blocker**
- a P.L. 86-272 defense asserted for software or services = **blocker**
  (§381 reaches tangible personal property only)
- a home-state duty argued away on customer location = **blocker**
- "$0 tax, so no return" = **blocker**
- a registration safe-harbor list read as settling taxation = **blocker**
  (Fla. Stat. §607.1501(4) forecloses it expressly)
- pre-*Wayfair* physical-presence framing applied to sales tax = **blocker**
- an agency guidance page relied on without a statute behind it = **nitpick**

## .provenance

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. the playbooks are committed and re-runnable:

- `briefs/refs/multistate-nexus.research.play.ts`
- `briefs/refs/multistate-nexus.round2.play.ts`
- `briefs/refs/florida-corporate-tax.research.play.ts`

| source | chars | note |
|--------|------:|------|
| 15 U.S.C. §381 | 2,983 | ⭐ "tangible personal property" in every clause |
| 15 U.S.C. §382 | 1,367 | ⚠️ **short but complete** — see below |
| 15 U.S.C. §383 | 720 | ⚠️ **short but complete** — a one-sentence definition |
| *Wayfair* | 73,268 | the full opinion |
| Fla. Stat. §607.1501 | 5,321 | the safe harbor, and (4) |
| Fla. Stat. §220.11 | 3,956 | the imposition clause |
| Fla. Stat. §220.22 | 4,238 | ⭐ the return duty |
| Md. Tax-Gen. §11-701 | 4,915 | digital products named separately |
| Md. Corps. §7-202 | 3,983 | the interstate registration provision |
| FL DOR out-of-state | 2,287 | the pre-*Wayfair* page |

short pulls, each inspected:

| pull | chars | verdict |
|------|------:|---------|
| 15 U.S.C. §382 | 1,367 | ✅ **complete** — both subsections + source credit |
| 15 U.S.C. §383 | 720 | ✅ **complete** — the section is one sentence |
| `govinfo` title-15 §381 | 1,052 | ❌ "Page Not Found" — invented slug |
| `uscode.house.gov` §381 | 128 | ❌ `docnotfound` redirect — invented slug |

## 🚩 what is NOT established here

| gap | why it is open |
|-----|----------------|
| whether a given state reaches a purely remote SaaS seller | each state's own law and administrative position; this brief maps the tests, it cannot apply them |
| the §381 second-publisher equality check | **never completed** — both alternate slugs 404'd. the quote is single-publisher (Cornell) |
| whether Md. §7-202 reaches remote sellers | needs MD case law or an SDAT position; neither pulled |
| per-state economic-nexus thresholds | vary, and are indexed or amended frequently |
| whether a given product is taxable at all | depends on characterization in each state |

## .see also

- `income-tax/state=florida/hazard.zero-tax-still-owes-a-return` — the home-state
  instance
- `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report` — the second
  instance, and the one where the sanction reaches the officer personally
- `registrator` — `foreign-registration/hazard.foreign-registration.state=florida`
- `registrator` — `foreign-registration/hazard.foreign-registration.state=texas`
