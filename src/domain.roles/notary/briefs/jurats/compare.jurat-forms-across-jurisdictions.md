# compare.jurat-forms-across-jurisdictions

## .what

the five per-state inventories, laid side by side. this file holds **only the
deltas** — each cell traces to a quote in its own `inventory.of=jurat.*` file,
and no statute is quoted twice.

## ⛔ THE ONE FINDING THAT MATTERS MOST

**a jurat is not portable.** "State of ___, County of ___ / Sworn to and
subscribed before me on ___, by ___" looks universal and is not. it lacks
mandatory elements in two of these five states, and it means a different thing
in a third.

if you pre-print a jurat on a document, you have picked a jurisdiction whether
you meant to or not.

### ✅ and the rule that resolves it, in the same breath

"not portable" is a caution, not a dead end. the resolving rule:

> **match the form to the state where the SIGNER and the NOTARY will be —
> never to the state the document is bound for.**

a certificate follows the law of the state where the **act** happens
(29 Del. C. §4328(c)(3), and its counterparts). so a Florida signer sending a
document to Delaware wants a **Florida** jurat.

⚠️ **with one check.** the destination's *mandatory elements* still bind, even
when its *form* rules do not. Delaware requires the commission expiry on the
certificate; the Florida form omits it and the Florida **seal** carries it. see
[the ELEMENTS section](#-but-the-form-is-accepted-not-a-pass-on-the-elements).

## .the grid

| | 🌴 Florida | 🏛️ Delaware | 🤠 Texas | 🌉 California | 🌽 Indiana |
|---|---|---|---|---|---|
| **statutory jurat FORM?** | ✅ §117.05(13)(a) | ✅ §4329(3) | ❌ **none** | ✅ §8202(d) | ❌ **none** |
| **mandatory ELEMENT list?** | ✅ §117.05(4)(a)–(i) | ✅ §4328(a) | ❌ | ✅ §8202(b),(d) | ✅ §33-42-9-12(a) |
| **what it's called** | jurat | verification on oath or affirmation | jurat (SOS sample) | jurat | (unnamed) |
| **venue names…** | the **notary** | the notary¹ | the notary | the notary | the **SIGNER** ⚠️ |
| **state pre-printed?** | ✅ "State of Florida" | ❌ blank | ✅ "State of Texas" | ✅ "State of California" | ❌ blank |
| **remote-mode disclosure** | ☐ checkbox, §117.05(4)(c) | a **sentence**, §4320(i)–(j) | ⚠️ **acknowledgment only** — CPRC §121.005(d) demands "a space … to indicate by which method"; Texas has **no statutory jurat form** to carry one | ⛔ **n/a — RON not yet operative**, §8231(b) | separate subsection, (a)(3)(B) |
| **ID basis on certificate** | ✅ required, (4)(f) | ❌ | ⚠️ required, but short form **exempt** §121.005(b) | ✅ in the form text | ❌ |
| **notary name printed below sig** | ✅ (4)(h) | ❌ | ❌ | ❌ | ✅ (b)(2), seal may excuse |
| **commission expiry on cert** | ❌ (on the seal) | ✅ §4328(a)(5) | ✅ in short form | ❌ | ✅ (a)(5)(A) |
| **commission COUNTY on cert** | ❌ | ❌ | ❌ | ❌ | ✅ (a)(5)(B) ⚠️ |
| **boxed disclaimer** | ❌ | ❌ | ❌ | ✅ **mandatory** §8202(b) | ❌ |
| **date format** | `___ day of ___, ___ (year)` | `____Date` | `(date)` | `___ day of ___, 20__` | not prescribed |
| **rep-capacity JURAT?** | ❌ **none** — (13)(c) is an *acknowledgment* | ❌ none — §4329(3) has no slot | ❌ no form at all | ❌ none — §8202(d) has no slot | ❌ no form at all |
| **seal size capped?** | ❌ **no cap**, rubber stamp only §117.05(3)(a) | 🚩 not pulled | ✅ 2in circle / 1in × 2.5in §406.013(b) | 🚩 not pulled | 🚩 not pulled |
| **fee cap, in person** | $10 §117.05(2)(a) | 🚩 not pulled | $10 §406.024(6) | 🚩 not pulled | 🚩 not pulled |
| **fee cap, ONLINE** | **$25** §117.275; platform fee uncapped | 🚩 not pulled | **$25** §406.111, on top of §406.024 | ⛔ **n/a — RON not yet operative** | 🚩 not pulled |
| **journal required** | ⚠️ **RON only** — 10 yrs + AV §117.245 | 🚩 not pulled | ✅ 10 yrs §406.014(g) | 🚩 not pulled | 🚩 not pulled |
| **accepts out-of-state act** | 🚩 not pulled | ✅ **"conclusively establish"** §4324(c) — ⚠️ **(a)(1)/(a)(2) only**; an (a)(3) officer gets **prima facie** §4324(b) | 🚩 not pulled | ✅ **"conclusively establish"** §8232.1(b)(2) — ⚠️ **(a)(1)/(a)(2) only**; an (a)(3) officer gets **prima facie** §8232.1(b)(1) | ⚠️ "presumed valid" / prima facie §33-42-9-8 |
| **RON available?** | ✅ operative — §117.275 fee, §117.245 journal | 🚩 not pulled | ✅ operative — subch. C, **eff. 2018-07-01**; §406.110(a) reaches a principal **outside** the state | ⛔ **enacted, NOT operative** — art. 2 §§8231–8231.20 (SB 696); §8231(b) bars it until SoS certification or **2030-01-01** | 🚩 not pulled |

¹ Delaware's §4329 form leaves the state blank rather than pre-printed, but
§4328(a)(3) requires the certificate to "identify the jurisdiction **in which
the notarial act is performed**" — which is the officer's location.

## 🎯 delta 1 — two ways to draft a certificate law

| style | states | what it means for you |
|-------|--------|----------------------|
| **prescribe a form** | FL, DE, CA | copy the form. the elements come with it |
| **prescribe elements only** | IN | build a certificate that carries every element |
| **prescribe neither** | TX | the notary supplies the words from SOS materials |

Florida and California do **both** — a form *and* a mandatory element list. that
is the strictest combination, and it is why Florida is the easiest state in
which to hand over a defective certificate: the form looks optional (§117.05(13)
says other forms are fine) while the elements are not (§117.05(4) says "shall
contain").

## 🎯 delta 2 — THE VENUE MEANS DIFFERENT THINGS

the single most dangerous cell in the grid.

> **Florida** — "the location of **the notary public** at the time of the
> notarization"
>
> **Indiana** — "the county and state in which **the principal or witness
> appears** before the notarial officer"

for an in-person act these coincide and the difference is invisible. for a
**remote** act they are different places, and a venue line copied from one
state's template onto another state's document is then affirmatively wrong.

## 🎯 delta 3 — the remote-mode disclosure, three ways

every RULONA-era state requires the certificate to say whether the act was
remote. they do it differently, and the mechanisms are **not interchangeable**:

| state | mechanism |
|-------|-----------|
| Florida | a **checkbox** in the form — `☐ physical presence or ☐ online notarization` |
| Delaware | a **sentence** — "This notarial act involved the use of communication technology." §4320(j)(2) |
| Indiana | a **different subsection** governs the remote venue entirely, (a)(3)(B) → IC 33-42-17-7 |

a Florida checkbox on a Delaware certificate is not the Delaware sentence, and
vice versa.

## 🎯 delta 4 — recognition is not equally strong

both RULONA states accept a foreign notarial act, but they weight it
differently:

| state | standard |
|-------|----------|
| Delaware | signature and title **"conclusively establish"** the authority — §4324(c) ⚠️ **(a)(1)/(a)(2) only** |
| Indiana | act is **"presumed valid"**; signature and title are **"prima facie evidence"** — §33-42-9-8 |

"conclusively" forecloses rebuttal. "prima facie" invites it. same practical
outcome in the ordinary case, different ground in a contested one.

### ⛔ but the delta is narrower than the table shows — DELAWARE HAS A (b) TOO

Delaware's (b) says **"prima facie"** in nearly Indiana's words, so the states
are **identical** for one of the three officer types §4324(a) lists.

> **§4324(b)** — "The signature and title of an individual performing a notarial
> act in another state are prima facie evidence that the signature is genuine
> and that the individual holds the designated title."
>
> **§4324(c)** — "The signature and title of a notarial officer **described in
> paragraph (a)(1) or (a)(2)** of this section conclusively establish the
> authority of the officer to perform the notarial act."

| the foreign officer is… | Delaware | Indiana |
|---|---|---|
| (a)(1) a notary public of that state | ⭐ **conclusive** (c) | prima facie |
| (a)(2) a judge, clerk, or deputy clerk | ⭐ **conclusive** (c) | prima facie |
| (a)(3) any other individual authorized by law | ⛔ **prima facie** (b) | prima facie |

the delta is real for a commissioned **notary public** — which is the ordinary
case — and vanishes for an (a)(3) officer.

this delta is about **recognition of the act**, not whether the **certificate**
carries the §4328(a) elements — the axis a submission is actually refused on
(see the elements section below).

## 🎯 delta 5 — NO STATE HERE HAS A REPRESENTATIVE-CAPACITY JURAT

five for five. and it is not an oversight — it is the jurat/acknowledgment split
as it appears in the forms.

| state | rep-capacity ACKNOWLEDGMENT | rep-capacity JURAT |
|-------|------------------------------|--------------------|
| 🌴 Florida | ✅ §117.05(13)(c) | ❌ |
| 🏛️ Delaware | ✅ §4329(2) | ❌ |
| 🌉 California | 🚩 not pulled | ❌ §8202(d) has no slot |
| 🤠 Texas | ✅ CPRC ch. 121 short forms | ❌ no jurat form at all |
| 🌽 Indiana | n/a — element list only | n/a — element list only |

where a state prescribes both forms, the acknowledgment carries a capacity slot
and the jurat does not. Delaware puts the two side by side in one section, which
makes the design intent unmistakable:

> **§4329(2)**, acknowledgment — "...by ____ **as (type of authority, such as
> officer or trustee) of (name of party on behalf of whom record was
> executed)**"
>
> **§4329(3)**, jurat — "...by ____ **Name(s) of individual(s) making
> statement**"

### why the asymmetry is correct, not an omission

an **acknowledgment** certifies that a signature was made *in a stated
capacity* — that is what it is for, and a corporation can only ever act through
one. a **jurat** certifies that a named human took an oath and signed in front
of the officer. an oath is a personal act; a corporation cannot swear.

### ⚠️ what this means for a corporate sworn statement

put the capacity in the **document** — the lead sentence and the signature
caption — and keep it out of the certificate. and expect that the notary will
have **no template** for what you need, in any of these five states. bring the
certificate text with you, complete.

> 🚩 this also means a notary who *adds* "as President of X" to a jurat has
> produced a certificate no statute prescribes. some states train them to refuse
> exactly that.

## ✅ the practical consequence — match the FORM to where the act happens

**a certificate follows the law of the state where the ACT happens, not the law
of wherever the document is bound.** Delaware says so expressly — with a
condition:

> **29 Del. C. §4328(c)** — "A certificate of a notarial act is sufficient if it
> **meets the requirements of subsections (a) and (b) of this section** and any
> of the following: … (3) Is in a form permitted by the law applicable in
> **the jurisdiction in which the notarial act was performed**."

⚠️ the `…` above elides **(c)(1)**, **(c)(2)** and **(c)(4)**, which are
alternatives to (c)(3), not conditions on it. all four are quoted in full in
`inventory.of=jurat.jurisdiction=usa-delaware.md` — **(c)(4)** in particular is a
substance-over-form escape worth knowing.

so a signer in Florida, with a document bound for Delaware, wants a **Florida**
jurat. to graft Delaware's short form onto it would be worse than useless — a
Florida notary would have to correct it, and Delaware accepts the Florida
**form**.

## ⛔ but the FORM is accepted, not a pass on the ELEMENTS

§4328(c) is a **conjunction**: `(a) and (b)` **and** any of `(c)(1)–(4)`. the
four paragraphs are alternatives to **each other**, never to (a) and (b). the
grid row **commission expiry on cert** is where this bites:

| | 🌴 Florida | 🏛️ Delaware |
|---|---|---|
| commission expiry on the certificate | ❌ — it lives on the **seal** | ✅ **required**, §4328(a)(5) |

so the Florida jurat **form** carries no expiry, and Delaware **requires** one.

**✅ it still resolves in Florida's favour** — Fla. Stat. §117.05(3)(a) makes the
expiry mandatory *on the seal*, so a properly sealed Florida jurat satisfies
§4328(a)(5). but it resolves **through the seal**, not through the form, and
that distinction is the operational check:

> ⚠️ **for a Florida RON**, confirm the vendor's electronic seal actually renders
> the commission expiration date. §117.05(3)(a) is drafted for "paper documents"
> of the "rubber stamp type" and reaches an online act only via §117.265(8).
> the cite and the argument are in `inventory.of=jurat.jurisdiction=usa-delaware.md`.

> 🎯 **the rule of thumb:** match the form to **where the signer and notary
> are** — then check that the destination's mandatory **elements** are all
> present, whether the form supplies them or the seal does. destination
> *recognition* is rarely the problem; an absent element is.

## ⚠️ what this file does NOT tell you

every `🚩` cell is unpulled, not "no" — a gap in the research, never a find of
absence. grep for `🚩` for the live count; do not trust a figure in prose.

- **Indiana is the thin column** — fees, journals, seal size, and RON are unpulled; Delaware is thin on the same four. pull before you act on either
- before you carry a `🚩` forward, check whether a **chapter container** pull (not a single-section url) would answer it, or already has

### 🎯 and only ONE column is backed by published forms

the Florida column is now checked against **two post-amendment agency
publications** — the DOS "Sample Notarial Statements" and the Governor's Notary
Reference Manual — whose exact bytes are committed under
`refs/jurisdiction=usa-florida/`; that pass found two defects in the state's own
material.

**the other four columns rest on statute alone.** a statute states what a
certificate must contain; a published form states what the state actually
prints, and the two can diverge (see the stale-form section in the Florida
inventory). treat DE / TX / CA / IN as un-corroborated until the same pass is
run for each.

## .see also

- `inventory.of=jurat.jurisdiction=usa-florida.md`
- `inventory.of=jurat.jurisdiction=usa-delaware.md`
- `inventory.of=jurat.jurisdiction=usa-texas.md`
- `inventory.of=jurat.jurisdiction=usa-california.md`
- `inventory.of=jurat.jurisdiction=usa-indiana.md`
- `../practices/define.notary-public-and-how-to-get-notarized.md` — jurat vs acknowledgment,
  and why the difference decides whether you may pre-sign
