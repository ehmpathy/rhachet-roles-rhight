# shield.no-duty-below-the-bright-line

## .what

Texas franchise-tax nexus turns on **two independent tests**, and an entity
escapes only if it falls outside **both**:

| test | source | escapes when |
|------|--------|--------------|
| **economic** | 34 TAC §3.586(f)(1) | Texas gross receipts **under $500,000** |
| **physical** | 34 TAC §3.586(d) | none of 21 listed activities occurred |

⛔ these are **alternatives, not a sequence**. under the threshold with a Texas
office is still nexus. no office with $600,000 of Texas receipts is still nexus.

## .why it comes first — it is upstream of every expensive question

- a franchise-tax liability for a non-filer is assessable **"at any time"** — Tex. Tax Code §111.205(a)(2), no fraud or intent required
- Texas has **no statutory way back**: ch. 111 searched for `voluntary disclos` and `before the comptroller contacts` — **both null**
- it has an *administrative* one: the MTC's permanent National Nexus Program publishes a Texas look-back of **4 complete prior tax years** on income/franchise tax — a program term, forfeited by a single prior contact (`limitations/state=texas/lever.mtc-disclosure-caps-an-uncapped-window`)

all of this is **conditional on a duty at all**. an unlimited window on a
liability that never attached is an unlimited window on zero — so settle nexus
before you size an exposure.

## ⭐ the economic test — the bright line, and its date

> "(1) For each federal income tax accounting period **ending in 2019 or
> later**, a foreign taxable entity has nexus in Texas and is subject to Texas
> franchise tax, **even if it has no physical presence in Texas**, if during
> that federal income tax accounting period, it had **gross receipts from
> business done in Texas of $500,000 or more**, as sourced under §3.591(e) and
> (f) of this title (relating to Margin: Apportionment)."
>
> — 34 TAC §3.586(f)(1)

three things to hold onto:

1. **"even if it has no physical presence"** — this test *adds* a way to have
   nexus. it does not replace, and cannot displace, subsection (d)
2. **"2019 or later"** — the economic test was added effective **2019-12-29**,
   in response to *South Dakota v. Wayfair*. an analysis of a 2020+ period that
   reasons from pre-*Wayfair* physical-presence doctrine uses a superseded frame
3. **receipts are sourced under §3.591**, not counted where billed. for a
   service, that is where the service is performed — see the source trap below

## ⭐ the physical test — 21 activities, and what is NOT among them

> "(d) **Physical presence.** Some specific activities that subject a taxable
> entity to Texas franchise tax **include, but are not limited to**, the
> following:"
>
> — 34 TAC §3.586(d)

the twenty-one, condensed: advertising · consignments · contracting ·
delivering · **employees or representatives** · federal enclaves · franchisors ·
holding companies · inventory · leasing · loan production · partners ·
**place of business** · processing · real estate · **services performed in
Texas** · shipment · shows · solicitation · **telephone answered in Texas** ·
transportation.

### 🎯 the list is FUNCTIONAL, not formal — and (20) proves it

> "(20) telephone listing: having a telephone number that is **answered** in
> Texas"

a Texas *number* is not enough. it must be **answered** there. the rule reaches
the activity, never the artifact.

the same sense runs through the list — (5) wants representatives "**doing the
business** of the taxable entity"; (16)(A) wants a service "**provided in**
Texas"; (13) wants a **place of business**, not an address of record.

> 🚩 **a Texas address used only for mail appears nowhere in the twenty-one.**

⚠️ but the list is expressly **"not limited to"**, so absence from it is a
strong indication and never a safe harbor. an address paired with any real
activity — a person who worked there, a call answered there, a service
delivered from there — lands on (13), (5), (16), or (20) regardless.

### ⛔ so the question is never "was there an address"

it is:

```
did anyone ACT in Texas?
  ├─ work performed there            -> (5), (16)  nexus
  ├─ a place of business kept there  -> (13)       nexus
  ├─ a phone answered there          -> (20)       nexus
  └─ an address on a form, and none of the above
                                      -> not on the list; see the caveat
```

## ⚠️ the source trap — where receipts count is NOT where you are

the $500,000 is measured on receipts "sourced under §3.591(e) and (f)", and for
a service that is **where the service is performed** — which the Comptroller
reads as the end product the customer pays for, not the support work behind it:

> "the focus is on the **specific, end-product act for which the customer
> contracts and pays to receive**, not on non-receipt producing, albeit
> essential, support activities."
>
> — Comptroller's Decision No. 104,224 (2013), quoted in STAR 201808030L

worked, in the Comptroller's own example: an online reservation service was
sourced **to the location of the reserved parking spaces**, and expressly *not*
to the location of its web servers.

> 🎯 **the consequence cuts both ways for a software business.** servers in
> Texas do not create Texas receipts. but customers whose end-product act
> occurs in Texas may create them from anywhere.

⚠️ that particular apportionment holding was **partially superseded on
2023-04-28** by *Sirius XM Radio, Inc. v. Hegar* (2022), STAR 202203013C. the
end-product-act test survives; its application to a given fact pattern may not.
**do not carry the reservation example into a return without a check against
*Sirius XM*.**

## ⛔ what does NOT rescue you

### the MTC initiative does not reach franchise tax

the Multistate Tax Commission ran a limited-time voluntary-disclosure
initiative. asked directly whether it covered a taxpayer with no tangible sales
or services, the Comptroller answered:

> "MTC's limited-time voluntary disclosure initiative applied to the collection
> of **sales and use tax** by out-of-state online marketplace sellers, whose
> only nexus in the state was use of a marketplace provider/facilitator (i.e.,
> Amazon fulfillment program) to facilitate retail sales into the state. **The
> voluntary disclosure does not apply to the Texas franchise tax.**"
>
> — STAR 201808030L (Private Letter Ruling No. 20171115102316)

🚩 **scope this correctly.** the answer is about **one limited-time initiative**
(the 2017 marketplace-seller amnesty). the MTC's *standing* National Nexus
Program is a different instrument.

### ✅ the standing program DOES reach franchise tax

> "A state's sales/use tax and **income/franchise tax** (including the Hawaii
> GET and Washington B&O tax) are the tax types generally subject to a
> voluntary disclosure agreement (VDA)."
>
> — MTC, Multistate Voluntary Disclosure Program

Texas is a member (`Texas … Yes` on the NNP member table), and the program
publishes a Texas look-back of **4 complete prior tax years** on
income/franchise tax.

the two answers do not conflict: the STAR letter is about the 2017 amnesty; the
sentence above is about the permanent program.

⛔ but this is **not** the Florida lever in a Texas costume. it is a program
term rather than a statutory right, it is forfeited by a single prior contact
(and mere **registration** counts), and Texas excludes applicants it is already
investigating **without telling them**. read
`limitations/state=texas/lever.mtc-disclosure-caps-an-uncapped-window` before
you rely on it — in particular the part about how the questionnaire in step 3
below may spend it.

### there is no Texas statutory disclosure lever

Tax Code ch. 111 subchapter C is the whole of the Comptroller's settlement
power, and it is three narrow sections:

| § | power | reaches a non-filer's look-back? |
|---|-------|----------------------------------|
| 111.101 | settle when **collection costs exceed the amount due** | ⛔ no — a de-minimis provision |
| 111.102 | settle **on redetermination**, for insolvency or a ceased business with no seizable property | ⛔ no — post-assessment, and needs insolvency |
| 111.103 | settle **penalty and interest only**, on "reasonable diligence" | ⛔ no — leaves the tax whole |

⭐ **contrast Florida**, which writes the relief into its limitations statute as
a mandatory bar — *"the limitation prescribed in subparagraph 1. **applies** if
the taxpayer disclosed in writing … before the department contacts the
taxpayer"* (Fla. Stat. §95.091(3)(a)5). Texas has no counterpart.

so the nexus question weighs more in Texas: Florida caps a bad answer by a
**statutory** disclosure asserted as of right; Texas offers only a **program
term** it may decline, and withholds from applicants under investigation
without notice.

## 🧭 the order of work

```
0. was there PHYSICAL presence?  (§3.586(d), the 21 activities)
     any yes -> nexus. the threshold is irrelevant. go to exposure.

1. were Texas-sourced receipts >= $500,000 in any period ending 2019+?
     yes -> nexus, even with no presence at all.

2. both no -> no franchise-tax duty for that period, so §111.205's
     unlimited window has no liability to run on.

3. either way, the cheapest confirmation is the Comptroller's own
   Franchise Tax Accountability Questionnaire — it is the agency
   answering the question, in writing, for free.

   ⚠️ but see the order hazard below before you send it.
```

### 🚩 step 3 is cheap only when step 2 came back clean

a **nexus questionnaire** is a named example of a "state contact" under MVDP
Procedures §12.1, and a prior contact makes a taxpayer **ineligible** for the
program that supplies Texas's only look-back cap. so the free confirmation is
free only if there was no duty to cap:

| step 2 said | send the questionnaire? |
|---|---|
| no duty attached | ✅ yes — it is the cheapest proof, and there is no cap to spend |
| a duty may have attached | ⛔ **stop.** read the MVDP lever brief first; the order matters |

⚠️ nexus is decided **per accounting period**, not once for the entity. a year
under the line and a year over it are different answers.

⚠️ every figure that feeds step 1 must come from a tested calculator —
`rule.forbid.hand-computed-figures`.

## .enforcement

- a Texas franchise-tax exposure sized before the nexus question is settled =
  **blocker** (an unlimited window on a duty that never attached)
- the $500,000 threshold cited as a defense against **physical** presence =
  **blocker** (it is expressly an alternative basis, "even if it has no
  physical presence")
- absence from the §3.586(d) list treated as a safe harbor = **blocker**
  (the list is "not limited to")
- Texas receipts counted where billed rather than sourced under §3.591 =
  **blocker**
- the reservation-service apportionment example applied without a check against
  *Sirius XM Radio v. Hegar* = **blocker**
- the MTC answer read to reach the standing National Nexus Program =
  **blocker** (it addresses one limited-time initiative — and the standing
  program reaches franchise tax, so the letter gets the answer backwards)
- a Texas nexus questionnaire sent where a franchise-tax duty may have
  attached, without a read of the MVDP lever brief = **blocker** (§12.1 names
  it as a state contact, and a contact forfeits the only Texas look-back cap)
- a nexus conclusion drawn once for the entity rather than per period =
  **nitpick**

## .provenance

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. `comptroller.texas.gov` links neither a
disclosure program nor the nexus rule from its home, taxes, franchise, or audit
pages; the documents were found by an in-browser search of **STAR**, the
Comptroller's own index, and each was then **opened** (a result row is a
snippet, never quoted).

| source | chars | note |
|--------|------:|------|
| Tex. Tax Code ch. 111 (whole) | 143,365 | ⭐ the container; re-read, not re-fetched |
| STAR `202601004R` — 34 TAC §3.586 | 8,415 | the operative nexus rule |
| STAR `201808030L` — private letter ruling | 8,493 | the MTC answer + the *Wayfair* alert |
| `star.comptroller.texas.gov` search | 3,036 | the index that earned both urls |

playbooks, committed and re-runnable:

- `briefs/refs/texas-settlement-and-disclosure.play.ts` — the settlement
  subchapter, and the two negative probes
- `briefs/refs/texas-vda-hunt.play.ts` — the full link-table harvest
- `briefs/refs/texas-star-search.play.ts` — the STAR search
- `briefs/refs/texas-vda-documents.play.ts` — the three documents, opened
- `briefs/refs/texas-franchise-nexus-rule.play.ts` — §3.586

embedded bytes: `refs/effectiveAt=2026-01-01.tx-rule-3.586-nexus.txt` (8,415).

### pull notes

- §3.586 surfaced from an **ALERT banner** on an unrelated private letter ruling: "ALERT: Effective 12/29/2019, Rule 3.586 (relating to nexus for franchise tax purposes) was amended to include an **economic presence test**…"
- a link filter on `disclos` returned only false positives; the real nav entries read `Audit`, `Penalty Waivers`, `Practitioners' Corner`
- `comptroller.texas.gov/taxes/audits/` is a soft 404 (974 chars, exit 200, "are you looking for one of these topics"); the live url is `/taxes/audit/`

## 🚩 what is NOT established here

| gap | why it is open |
|-----|----------------|
| whether an **address of record with no activity** is a §3.586(d) "place of business" | the list is "not limited to"; no determination on this fact pattern was found |
| what *Sirius XM Radio v. Hegar* (2022) changed | it partially superseded the end-product-act application on 2023-04-28. STAR 202203013C was **not** opened |
| §3.591's full rules on how a service is sourced | quoted only as cross-referenced; the rule itself was not pulled |
| whether §3.586 was cross-checked against a **second publisher** | still **single-publisher: STAR only**. the old TAC host `texreg.sos.state.tx.us` now returns a 171-char "This Site Has Moved" stub; the live host is a JS portal (`https://texas-sos.appianportalsgov.com/rules-and-meetings?interface=VIEW_TAC`) whose title links are `#` anchors, so no constructible url reaches §3.586 |
| what the Texas Comptroller's **own** VDA terms say | MVDP Procedures §3.1.5 says the Comptroller "prepares its own voluntary disclosure agreements"; the forms were not obtained |
| whether a **taxpayer-initiated** questionnaire triggers §12.1 | §12.1 defines a state contact as a communication **from** state personnel; whether a reply to an inquiry the taxpayer opened counts was not determined. ⚠️ this is the hinge of the order hazard above |

## .see also

- `nexus/define.three-duties-three-tests` — registration vs income tax vs sales
  tax, and why the conflation is the default error. **this brief is the Texas
  instance of that framework's second test**
- `franchise-tax/state=texas/hazard.zero-tax-still-owes-a-report` — what is owed
  **once** nexus is established, and the §111.205 unlimited window
- `limitations/state=texas/lever.mtc-disclosure-caps-an-uncapped-window` — ⭐
  **downstream of this brief.** the MTC program that caps Texas at 4 years, the
  contacts that spend it, and why the questionnaire in step 3 has an order
  hazard
- `limitations/state=florida/lever.disclose-first-to-cap-the-lookback` — the
  contrast: a state that *does* write a way back into its limitations statute
- `practices/rule.forbid.hand-computed-figures` — the $500,000 test is an
  arithmetic question and must be answered by a tested calculator
