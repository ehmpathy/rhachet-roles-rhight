# inventory.of=jurat.jurisdiction=usa-florida

## .what

the Florida jurat — from the statute, **and from the forms Florida's own
agencies actually print**. every quote below was pulled with bhrowser and is
reproduced verbatim.

the published forms are committed beside this brief, under
[`refs/jurisdiction=usa-florida/`](refs/jurisdiction=usa-florida/readme.md),
named by the date each took effect.

**Florida prescribes a form AND a mandatory element list.** the difference is
where documents get rejected — see § *the trap* below.

## .the statutory form

> **Fla. Stat. §117.05(13)(a)** — "For an oath or affirmation:"
>
> ```
> STATE OF FLORIDA
>
> COUNTY OF ____
>
> Sworn to (or affirmed) and subscribed before me by means of
> ☐ physical presence or ☐ online notarization, this ____ day of
> ____, ____ (year), by ____ (name of person making statement).
>
> ____ (Signature of Notary Public - State of Florida)
>
> ____ (Print, Type, or Stamp Commissioned Name of Notary Public)
>
> Personally Known ____ OR Produced Identification ____
>
> Type of Identification Produced ____
> ```

## ✅ WHAT FLORIDA ACTUALLY PRINTS — two agency publications, in evidence

a statute says what a certificate **must contain**, not whether anyone prints it
that way. both agency publications were checked first-party:

| publication | publisher | effective | prints the ☐ checkbox? |
|---|---|---|---|
| Sample Notarial Statements | FL Dept of State | as of **2020-01-01** | ✅ yes |
| Governor's Notary Reference Manual | Exec. Office of the Governor | **2019-12-17** | ✅ yes |

**both print the long form, element for element.** the statutory form is what
the state teaches and publishes, not a maximum that practice trims.

### the divergence — court form 12.901(b)(1) is stale

Supreme Court approved family law form **12.901(b)(1), rev 02/18** prints a
jurat that does **not** match:

```
Sworn to or affirmed and signed before me on __________ by _______________.

_____________________________________________
NOTARY PUBLIC or DEPUTY CLERK
```

one date blank, no checkbox, "signed" rather than "subscribed". rev 02/18
predates the 2019 RON amendment; both agency publications above post-date it
and print the checkbox. so the form is **stale**, not evidence that practice
tolerates a shorter jurat — print the long form.

later court forms cannot serve as a control: 12.902(k) and 12.902(l), both rev
**10/23**, carry **no jurat at all** — they moved to a §92.525 unsworn
declaration:

> "Under penalties of perjury, I declare that I have read this document and the
> facts stated in it are true."

12.902(l) does this despite the word "Affidavit" in its own title.

### two defects in the state's own material — do not copy them

**1. a doubled phrase, in BOTH publications, character for character:**

```
this (numeric date) this (numeric date) day of (month), (year)
```

`(numeric date)` prints twice. one publication was copied from the other and
the defect rode along. the statute has it once.

**2. the two publications disagree on the printed-name caption:**

| publication | caption |
|---|---|
| EOG Manual, and §117.05(13)(a) | `(Print, Type, or Stamp Commissioned Name of Notary Public)` |
| DOS samples page | `(Name of Notary Typed, Printed, or Stamped)` |

**follow the statute.** the manual matches §117.05(13)(a); the DOS page
paraphrases. an agency page is evidence, not authority.

### jurat variants only in the Manual

for signers who cannot sign normally. each keeps the checkbox and the ID lines:

| case | added clause |
|---|---|
| signer makes a **mark** | "…who signed with a mark in the presence of these witnesses: ____" |
| notary signs **at the signer's direction** | "…and subscribed by (name of notary) at the direction of (name of person making statement) by (written, verbal, or other means), and in the presence of these witnesses: ____" |

these matter under §117.05(14), which requires a notary to "make reasonable
accommodations to provide notarial services to persons with disabilities."

## ⭐ THE CERTIFICATE CARRIES NO TITLE

do not print the word **`Jurat`** above the certificate. two bodies of evidence:

### evidence 1 — a survey of documents in the wild

| corpus | untitled | titled |
|---|---:|---:|
| executed documents | **13** | 1 |
| …of those, on letterhead | **4 of 4** | 0 |
| official SOS blank-form families | **5 of 5** | 0 |

the one titled instance, `CALIFORNIA JURAT WITH AFFIANT STATEMENT`, is a
**commercial loose certificate** — a publisher's product label on a page with no
document. what *does* carry a title, **14 of 14**, is **the document itself**.

⚠️ this survey has no committed bytes behind it, unlike the Florida corpus below.
re-run it before a non-Florida variant leans on it.

### two claims made in support of a title, both failed

| claim | verdict |
|---|---|
| "the CA statutory form is titled JURAT" | ❌ **false.** Cal. Gov. Code §8202(d) prints the boxed disclaimer, the venue, and the sworn sentence — no title. so does the CA SOS's own `notary-jurat.pdf`. the word appears in the statute's prose, the site nav, and the **filename** — never on the form |
| "the TX SOS sample is titled JURAT" | ⚠️ **true but irrelevant.** it is a catalog label on a sheet of several sample certificates, so a reader can tell them apart. it is not part of any certificate |

both share one shape: the word was found **near** the form and mistaken for a
word **on** it.

### evidence 2 — Florida's own four sources, counted

bytes committed under `refs/`:

| source | certificate blocks | titled |
|---|---:|---:|
| ch. 2019-071 — the RON session law | 8 | **0** |
| Governor's Notary Reference Manual | 9 | **0** |
| DOS Sample Notarial Statements | 5 | **0** |
| court form 12.901(b)(1) | 1 | **0** |
| **total** | **23** | **0** |

every one opens on `STATE OF FLORIDA`. what sits above each is prose *about* the
specimen — "Pursuant to Section 117.05(13)(a), Florida Statutes, the following
notarial certificate is sufficient for an oath or affirmation:" — which
**introduces** it rather than **titles** it.

### the near-miss

the Manual carries `Notarial Certificates or Jurats` twice — in its table of
contents and as a section title. neither sits on a certificate. across all four
sources the word appears only as **(a)** statutory prose ("shall complete a jurat
or notarial certificate") and **(b)** an editorial section title. verified with
two matchers: a standalone-title-line search, and a bare-word `jurat` search.

### a caption BELOW the signature is a different kind

the distinction that resolves every apparent counter-example:

| placement | observed? | example |
|---|---|---|
| a **title above** the block | ❌ 0 of 23 FL blocks; 1 of 14 in the wild, and that one a loose-certificate SKU | the invented `Jurat` |
| a **caption below** the signature line | ✅ common | `NOTARY PUBLIC or DEPUTY CLERK` — court form 12.901(b)(1) |

Delaware's agency-supplied affidavit template labels the area `Notary Public:` —
a signature-line caption, not a block title (a different state and instrument,
so it corroborates rather than controls).

### so: print no title

| element | verdict |
|---|---|
| a `Jurat` caption above the block | ❌ **do not print it** |
| `STATE OF FLORIDA` as the first line | ✅ all 23 |

the title was never load-bearing: "Sworn to (or affirmed) and subscribed before
me" already marks the act as a jurat.

⚠️ the counts are observed; the *reason* (a title is absent from §117.05(4)'s nine
elements, so it is surplus) is inferred, and no claim here depends on it.

## ⚠️ THE TRAP — the FORM is optional, the ELEMENTS are not

§117.05(13) opens by saying the forms "are sufficient for the purposes
indicated" and closes with:

> "The specification of forms under this subsection does not preclude the use
> of other forms."

read alone, that sounds permissive. it is not, because §117.05(4) runs first
and uses mandatory language:

> "When notarizing a signature, a notary public **shall** complete a jurat or
> notarial certificate in substantially the same form as those found in
> subsection (13). The jurat or certificate of acknowledgment **shall contain
> the following elements**:"

| § | element | in a Texas-style jurat? |
|---|---------|-------------------------|
| (a) | venue "in the format, 'State of Florida, County of ____.'" | ⚠️ partly — venue yes, but as two blanks |
| (b) | type of act, "evidenced by the words 'sworn' or 'acknowledged'" | ✅ |
| (c) | **whether the signer appeared by physical presence or by audio-video** | ❌ **absent** |
| (d) | the exact date of the notarial act | ✅ |
| (e) | the name of the person whose signature is notarized | ✅ |
| (f) | **the specific type of identification relied upon** | ❌ **absent** |
| (g) | the notary's official signature | ✅ |
| (h) | **the notary's name typed, printed, or stamped below the signature** | ❌ **absent** |
| (i) | the official seal below or beside the signature | ✅ |

so a certificate may depart from the printed form, but it may not drop an
element. **three of the nine are absent from the generic out-of-state jurat**
most templates ship with.

## 🎯 the three that catch people

### (c) the ☐ physical presence / ☐ online notarization checkbox

added when Florida authorized RON in 2019. it is an **element**, not decoration
— a Florida certificate that does not say which mode was used is incomplete on
its face, and it is the single most common defect on an imported template.

### (f) the identification basis

> "(f) The specific type of identification the notary public is relying upon in
> identifying the signer, either based on personal knowledge or satisfactory
> evidence specified in subsection (5)."

this is why the printed form ends with two lines most templates omit:

```
Personally Known ____ OR Produced Identification ____
Type of Identification Produced ____
```

### ⭐ (h) "printed" means HAND-PRINTED — the element is LEGIBILITY

> "(h) The notary public's name **typed, printed, or stamped** below the
> signature."

"printed" does not mean machine-printed. the state's own manual uses the same
verb for a physical act by a human:

> "The notary public **prints** the person's first name at the beginning of the
> designated signature line and the person's last name at the end of the
> designated signature line"
> — Governor's Notary Reference Manual, mark-signer rules

that is a notary, by hand, on paper. two more supports:

1. **the printed caption is an imperative** — "**Print**, Type, or Stamp
   Commissioned Name of Notary Public". you do not instruct a human to "print"
   in the sense of *operate a printer*.
2. **surplusage** — if "printed" meant machine-printed it would substantially
   duplicate "typed", and a three-item list would do two items' work.

### so what does (h) actually guard against? CURSIVE.

element (h) exists because the notary's **signature** already sits on the line
above it. (h) is not a second signature line — it is the guarantee that the same
name appears **legibly**, so a reader (or a clerk who may reject the filing) can
tell who notarized the document without a forensic comparison.

| how the name is rendered | satisfies (h)? |
|---|---|
| rubber stamp | ✅ |
| typed / machine-printed | ✅ |
| **hand-printed block letters** | ✅ |
| **cursive** | ❌ — that is a second signature, not a printed name |

### the LAYOUT enforces (h), better than any caption

```
_______________________________________
Signature of Notary Public — State of Florida

_______________________________________
Commissioned Name of Notary Public — State of Florida
```

the **contrast is the instruction**: a second line under a signature line cannot
be another signature. a certificate that shortens the caption but keeps two
labeled lines loses little; one that keeps the full caption on a single line
loses a great deal.

### (a) the venue names the NOTARY, not the signer

> "(a) The venue stating **the location of the notary public at the time of the
> notarization** in the format, 'State of Florida, County of ____.'"

two consequences:

1. **"State of Florida" is pre-printed, not a blank.** a Florida notary can only
   produce a Florida venue.
2. under RON the venue is still Florida even when the **signer is elsewhere** —
   because it states where the notary sat. see §117.209(3) below.

## ⛔ THERE IS NO REPRESENTATIVE-CAPACITY JURAT

§117.05(13) prescribes exactly **three** certificates:

| § | act | capacity slot? |
|---|-----|----------------|
| (13)(a) | oath or affirmation — **the jurat** | ❌ "by ____ (name of person making statement)" |
| (13)(b) | acknowledgment, individual capacity | ❌ |
| (13)(c) | acknowledgment, **representative capacity** | ✅ "by ____ (name of person) **as** ____ (type of authority, . . . e.g. officer, trustee, attorney in fact) **for** ____ (name of party on behalf of whom instrument was executed)" |

so the pairing is asymmetric: Florida gives you a way to acknowledge *as an
officer*, and no way to **swear** as one.

### what follows for a corporate sworn statement

1. **the capacity goes in the DOCUMENT, never in the jurat.** state "I, [name],
   President of [entity]" in the body and in the signature caption. the
   certificate names a human who swore, full stop.
2. **bring your own certificate, complete.** a Florida notary reaching for a
   template will find (13)(a), which has no capacity slot, or (13)(c), which is
   the wrong act. neither is what a corporate affidavit needs, so do not leave
   the wording to be produced at the appointment.
3. **and they cannot fix it afterward.** §117.107(7) bars a notary from any
   change to a written instrument once it has been signed.

⚠️ do not read the absence as a prohibition on swearing in a corporate matter.
§117.05(13) closes with "The specification of forms under this subsection does
not preclude the use of other forms" — a custom certificate is expressly fine.
what it must not do is drop an element from §117.05(4).

## .the date format — match the printed form

the form is `this ____ day of ____, ____ (year)`, not a single date blank.

§117.05(4)(d) demands only "the exact date", so one blank is defensible — and the
wrong trade. a certificate that departs from the printed form invites a
discretionary clerk's second look; a single blank buys only tidier layout.
**copy the three-part construction.**

## .remote online notarization

> **§117.209(3)** — "An online notary public **physically located in this state**
> may perform an online notarization as authorized under this part, **regardless
> of whether the principal or any witnesses are physically located in this
> state** at the time of the online notarization."
>
> **§117.209(4)** — "The validity of an online notarization performed by an
> online notary public registered in this state shall be determined by
> applicable laws of this state regardless of the physical location of the
> principal or any witnesses at the time of the notarial act."

so, precisely:

| party | must be in Florida? |
|-------|--------------------|
| the **notary** | ✅ yes |
| the **signer** | ❌ no — anywhere |
| the **witnesses** | ❌ no — anywhere |

and §117.209(1) confirms an online notary "may perform any of the functions
authorized under part I" — which includes an oath, so a **jurat may be done by
RON**. the sole carve-out named is solemnizing matrimony.

## .the seal — and why it settles two other questions

> **§117.05(3)(a)** — "A notary public seal shall be affixed to all notarized
> paper documents and shall be **of the rubber stamp type** and shall include
> the words 'Notary Public-State of Florida.' The seal shall also include **the
> name of the notary public, the date of expiration of the commission of the
> notary public, and the commission number.** The rubber stamp seal must be
> affixed to the notarized paper document in **photographically reproducible
> black ink.** Every notary public shall print, type, or stamp below his or her
> signature on a paper document his or her name exactly as commissioned."

three consequences:

### 1. it closes the Delaware §4328(a)(5) seam — **for a PAPER act**

Delaware wants the **commission expiration on the certificate**
(29 Del. C. §4328(a)(5)), and Florida's certificate has no such line. Florida
satisfies it through the **seal**, which must carry the expiry by statute.

### …but §117.05(3)(a) is scoped to paper, twice

| the quote says | not |
|---|---|
| "affixed to all notarized **paper** documents" | every notarized document |
| "shall be **of the rubber stamp type**" | any seal, electronic included |

a rubber stamp cannot be affixed to a PDF. for an online act the rule arrives by
a chain rather than a quote:

> **§117.265(8)** — "The provisions of part I of this chapter apply to an online
> notarization…"

which is a sound construction — part I is where §117.05 lives — but it is a
**construction**, not a sentence that says an electronic seal must render an
expiry. and the section that does govern the electronic signature is silent as
to any expiry:

> **§117.021(2)** — an electronic signature "shall be… (a) Unique to the notary
> public; (b) Capable of independent verification; (c) Retained under the notary
> public's sole control; and (d) Attached to or logically associated with the
> electronic document in a manner that any subsequent alteration… is
> detectable…"

§117.265(7) points at a seal for an online act — but it presupposes a seal
rather than a restatement of its contents:

> **§117.265(7)** — an online notary's requirement to record the type of
> notarial act "may be satisfied by placing the term 'online notary' in or
> adjacent to the online notary public's seal."

### so the practical RON rule

> **look at the returned PDF and confirm the electronic seal renders the
> commission expiration date.**

it is one glance, and it is the only §4328(a) element a Delaware filing is
likely to be refused on. ⛔ do **not** cure it by a hand-typed "My commission
expires ___" line on the certificate — the expiry is the officer's fact to
attest, not the drafter's, and a form that invents a field Florida's statutory
jurat does not have invites its own objection.

> ⚠️ this prohibition is duplicated on purpose — edit both. it also sits in
> `../ronproviders/howto.get-a-remote-online-notarization.jurisdiction=usa-florida.md`
> § *DO NOT CURE IT BY A FIELD ON YOUR TEMPLATE*, where a reader acts on it.

### 2. it closes the commission-number question

the number is on the **seal**, not among the (a)–(i) certificate elements. so
a Florida certificate with no commission number printed on it is complete.

⚠️ this one carries the same **paper** scope as (1) above, for the same reason —
it is read off the same sentence.

### 3. no DIMENSION is prescribed

Florida caps the seal's *content* and *ink*, not its size. the "2 inches in
diameter" circular cap some states permit is not a Florida shape — a stamp that
carries a name, a state line, an expiry, and a number is a rectangle of text.
reserve generous rectangular clear space: empty space cannot be a defect, an
overlapped seal can.

## .fees — the $10 cap has TWO exceptions

> **§117.05(2)(a)** — "The fee of a notary public may not exceed **$10** for any
> one notarial act under this part, except as provided in s. 117.045 or s.
> 117.275."

| act | cap | source |
|-----|----:|--------|
| any one notarial act, **in person** (part I) | **$10** | §117.05(2)(a) |
| any one **online** notarial act (part II) | **$25** | §117.275 |
| the rites of matrimony | what a **circuit court clerk** may charge | §117.045 |
| a **RON platform's** own services | ❌ **uncapped** | §117.275 |

> **§117.275** — "An online notary public or the employer of such online notary
> public may charge a fee, **not to exceed $25**, for performing an online
> notarial act under this part. **Fees for services other than notarial acts,
> including the services of a RON service provider, are not governed by this
> section.** A RON service provider's services are also not considered closing
> services, as defined in s. 627.7711, and a fee for those services may be
> separately charged."

> **§117.045** — "A notary public is authorized to solemnize the rites of
> matrimony. For solemnizing the rites of matrimony, the fee of a notary public
> may not exceed those provided by law to the clerks of the circuit court for
> like services."

the RON exception is two rules: **$25 caps the notarial act** (per seal); the
platform fee is *expressly* outside the section and uncapped. a charge above $25
on an invoice is a platform fee, not an overcharge.

## .the RON journal — a duty that has no in-person counterpart

> **§117.245(1)** — "An online notary public **shall keep one or more secure
> electronic journals** of online notarizations performed by the online notary
> public."
>
> **§117.245(2)** — "The RON service provider shall retain an **uninterrupted
> and unedited copy of the recording of the audio-video communication** in which
> an online notarization is performed."
>
> **§117.245(4)** — "The electronic journal required under subsection (1) and
> the recordings of audio-video communications required under subsection (2)
> shall be maintained for **at least 10 years** after the date of the notarial
> act."

**a reason to PREFER RON for a document bound for a regulator.** an in-person
Florida act leaves no record beyond the certificate (no journal is required); a
remote one leaves a journal entry, an identity notation, and ten years of
unedited audio-video — proof the officer appeared and swore.

note §117.245(5): an omitted or incomplete journal entry "does not impair
the validity of the notarial act." the journal is evidence, not a condition.

## 🚩 open items

| gap | status |
|-----|--------|
| **§117.05(3)** seal **dimensions** | ✅ **absent** — the whole subsection prescribes content and ink, no size |
| whether the **DE Division of Corporations accepts an e-sealed RON pdf** | ⚠️ open — two questions, see below |
| ⛔ whether the RON's **electronic seal renders the commission expiry** | ❌ not checked — the §4328(a)(5) element, checkable on the returned PDF |
| **§117.05(5)** the satisfactory-evidence ID list | ⚠️ partly — subparagraphs (b)1.a–j were pulled and are the standard credential list; not reproduced here |
| whether a Florida **commission number** must also appear anywhere on the document body | 🚩 not among the (a)–(i) elements and not required by (3)(a) beyond the seal |

### the DE-accepts-a-RON row, split

**1. does Delaware RECOGNIZE the act?** — ✅ **largely settled by statute.**

> **29 Del. C. §4324(c)** — the signature and title of a notarial officer
> described in **(a)(1) or (a)(2)** "**conclusively establish** the authority of
> the officer to perform the notarial act."

a Florida commissioned notary is an (a)(1) officer, so the authority question is
foreclosed. and Delaware's own RON statute locates an act by where the
**officer** is — *"a notarial officer **located in this State** may use
communication technology…"* (§4320(c)) — which is the same frame that makes a
Florida RON an act performed in Florida.

⚠️ still a construction rather than a decided point; no Delaware case was found.

**2. does the CERTIFICATE carry every §4328(a) element?** — ❌ **the live risk.**

§4328(c) is a **conjunction**: sufficient only if it meets (a) **and** (b)
**and** any of (c)(1)–(4). §4328(a)(5) demands the **commission expiration
date**, and the Florida certificate form above has no such field — it lives on
the seal, and §117.05(3)(a) is drafted for **paper**.

so the question to put to the vendor is **"does the electronic seal render the
expiration date?"** — one glance at the returned PDF.

**3. and the CLERK question survives both.** a clerk may apply the Division's
apostille habit reflexively whatever §4324 says. that is a phone call, and it
remains the cheapest move — see
`../practices/define.notary-public-and-how-to-get-notarized.md`.

## .sources

pulled 2026-08-30 via bhrowser, `--mode HEADFUL`:

| § | url | chars |
|---|-----|------:|
| 117.05 | `https://www.flsenate.gov/Laws/Statutes/2024/117.05` | 20,891 |
| 117.107 | `https://www.flsenate.gov/Laws/Statutes/2024/117.107` | 7,015 |
| 117.201 | `https://www.flsenate.gov/Laws/Statutes/2024/117.201` | 6,897 |
| 117.209 | `https://www.flsenate.gov/Laws/Statutes/2024/117.209` | 4,137 |
| 117.205 | `https://www.flsenate.gov/Laws/Statutes/2024/117.205` | 5,072 |
| 117.275 | `https://www.flsenate.gov/Laws/Statutes/2024/117.275` | 3,123 |
| 117.045 | `https://www.flsenate.gov/Laws/Statutes/2024/117.045` | 2,840 |
| 117.245 | `https://www.flsenate.gov/Laws/Statutes/2024/117.245` | 8,115 |

re-run: `briefs/refs/florida-notary-law.research.play.ts` (the first five) and
`briefs/refs/florida-fees-and-journal.research.play.ts` (the last three)

flsenate.gov holds a connection open, so `waitUntil: 'networkidle'` never
resolves, and HEADLESS pulls were refused. the shape that works:

```
--mode HEADFUL  +  waitUntil: 'domcontentloaded'  +  a 1.5s settle
```

⚠️ these are the **2024** compiled statutes. Florida amends chapter 117 often —
RON itself arrived in 2019 and the mandatory checkbox with it. for a document
that matters, confirm the year before you rely on a form.

## .see also

- `compare.jurat-forms-across-jurisdictions.md` — the five-state grid
- `inventory.of=jurat.jurisdiction=usa-delaware.md` — and why Delaware accepts
  a Florida-form certificate by its own statute
- `define.notary-public-and-how-to-get-notarized.md` — jurat vs acknowledgment
