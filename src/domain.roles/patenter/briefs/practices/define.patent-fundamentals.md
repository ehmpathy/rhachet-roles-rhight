# define.patent-fundamentals

## .what

core patent terminology and office action types.

## .why

- precise terminology prevents miscommunication
- office action types determine response strategy
- shared vocabulary enables effective collaboration

---

## terminology

### identifiers

| term | definition | example |
|------|------------|---------|
| exid | external identifier for a patent or application | US20210234567A1 |
| application number | USPTO internal identifier | 17/123,456 |
| publication number | published application identifier | US 2021/0234567 A1 |
| patent number | granted patent identifier | US 11,234,567 B2 |

### exid format decode

```
US 2021 0234567 A1
│  │    │       │
│  │    │       └─ kind code (A1=application, B1/B2=granted)
│  │    └───────── serial number
│  └────────────── year
└──────────────── country code
```

### actors

| term | role | when active |
|------|------|-------------|
| inventor | person who conceived the invention | always credited |
| applicant | entity that files the application | file through grant |
| assignee | entity that owns the patent rights | file through grant |
| patentee | entity named on granted patent | after grant |

typical flow: inventor → applicant (often employer) → assignee → patentee

### claim terms

| term | definition |
|------|------------|
| independent claim | stands alone, defines invention without reference to other claims |
| dependent claim | references and narrows another claim ("The method of claim 1, wherein...") |
| claim tree | hierarchy of independent and dependent claims |
| preamble | introduction that sets context ("A method for...") |
| body | elements that define the invention |
| means-plus-function | element expressed as a means for a specified function — ⛔ but see below: it reads broad and **operates as the narrowest construction in the statute** |

### ⛔ means-plus-function reads BROAD and operates NARROW

"defined by function, not structure" invites a drafter to reach for the form
*because* it sounds broad. the statute gives the function-language a
**construction consequence** in the same sentence:

> **35 U.S.C. §112(f)** — "An element in a claim for a combination may be
> expressed as a means or step for performing a specified function without the
> recital of structure, material, or acts in support thereof, **and such claim
> shall be construed to cover the corresponding structure, material, or acts
> described in the specification and equivalents thereof**."

read the second half against the first:

| what you wrote | what you get |
|----------------|--------------|
| a function, with **no** structure recited | ⛔ coverage of **only** the structure your **specification** happens to describe, plus equivalents |

so the breadth is an illusion: you claimed **the ways your spec disclosed**, and
the spec closed when you filed. same inversion as "consisting essentially of"
(see `howto.patent-techniques.[lesson]`): **a claim phrase that sounds broad is
where the statute hides a leash.**

### prior art terms

| term | definition |
|------|------------|
| prior art | ⛔ **not** "all public knowledge" — see below. §102(a) is a closed list, it reaches **secret** applications, §102(b) carves two exceptions out of it, and the cutoff is the **effective filing date** (§100(i)) |
| favorable art | prior art that supports novelty argument |
| adverse art | prior art that threatens claim validity |
| anticipation | prior art that discloses all claim elements |
| obviousness | combination of prior art renders claim obvious |

### ⛔ "all public knowledge before the priority date" is wrong THREE ways

**1. it is not "all" — §102(b) has TWO exception paragraphs, not one.**

> **§102(b)(1)** — "A disclosure made **1 year or less before the effective
> filing date** of a claimed invention **shall not be prior art** to the claimed
> invention under subsection (a)(1) if— (A) the disclosure was made by the
> inventor or joint inventor or by another who obtained the subject matter
> disclosed directly or indirectly from the inventor or a joint inventor; or (B)
> the subject matter disclosed had, before such disclosure, been publicly
> disclosed by the inventor or a joint inventor…"

that is the **grace period**, and it is the one a searcher must not apply to a
competitor: it excuses the **inventor's own** disclosure, not anyone's.

> **§102(b)(2)** — "**Disclosures appearing in applications and patents.**—A
> disclosure shall not be prior art to a claimed invention **under subsection
> (a)(2)** if— (A) the subject matter disclosed was obtained directly or
> indirectly from the inventor or a joint inventor; … or (C) the subject matter
> disclosed and the claimed invention, not later than the effective filing date
> of the claimed invention, **were owned by the same person** or subject to an
> obligation of assignment to the same person."

**(b)(2) is separate from the grace period** — it answers (a)(2) rather than
(a)(1), and (C) is the **common-ownership** escape that stops a company's own
earlier application from sinking its later one.

**2. the date is right in substance and wrong in NAME — and the name is what
keeps it apart from the term date.**

> **§102(a)(1)** — "the claimed invention was patented, described in a printed
> publication, or in public use, on sale, or otherwise available to the public
> **before the effective filing date of the claimed invention**"

(a)(1) is a **closed list**; "public knowledge" paraphrases its last item alone.

§100(i)(1)(B) includes the §119 and §120 benefits, so for prior-art purposes the
effective filing date **is** the priority date. the statute's term still matters
because **§154(a)(3) subtracts half of §100(i)'s list for term**:

| benefit claimed under… | counts for **prior art** (§100(i)(1)(B)) | counts for **term** (§154(a)(2)–(3)) |
|---|---|---|
| §120, 121, 365(c), 386(c) — continuations, divisionals | ✅ | ✅ |
| §119, 365(a)/(b), 386(a)/(b) — **foreign priority + provisionals** | ✅ | ⛔ **expressly excluded** |

so "priority date" is one phrase for **two different dates**. this brief says
**effective filing date** for prior art and **US filing date** for term.

**3. ⭐ prior art is NOT limited to what was public. a SECRET application counts.**

> **§102(a)(2)** — "the claimed invention was described in a patent issued under
> section 151, or in an application for patent published or deemed published
> under section 122(b), in which the patent or application, as the case may be,
> names another inventor and **was effectively filed before the effective filing
> date of the claimed invention**."

read the operative date. the reference becomes prior art as of when it was
**effectively filed** — not when it published. so an application that was
**confidential on your filing date**, and published a year later, is prior art
against you *as of its filing date*.

| you searched | what you can find | what §102(a)(2) reaches |
|--------------|-------------------|-------------------------|
| everything public on your filing date | the published art | ⛔ **plus** applications still secret that day |

so a clean prior-art search is never a guarantee: the most dangerous reference
may be **unpublished and unfindable** on the day you file, and arrive as a
§102(a)(2) rejection 18 months later.

---

## office action types

office actions are examiner communications that reject or object to claims.

### rejection types

| code | name | what it means |
|------|------|---------------|
| 101 | subject matter | abstract idea, law of nature, natural phenomenon |
| 102 | anticipation | prior art discloses all elements |
| 103 | obviousness | combination of prior art renders obvious |
| 112 | definiteness | claims unclear or specification lacks enablement |

### ⛔ the four grounds are CUMULATIVE, not a partition

one office action routinely carries several of them at once — a 103 over the
claim as a whole and a 112(b) on one term of it, in the same paper. the rule
requires exactly that:

> **37 CFR 1.104(a)(1)** — "The examination shall be **complete with respect
> both to compliance of the application … with the applicable statutes and rules
> and to the patentability of the invention as claimed**, as well as with
> respect to matters of form, unless otherwise indicated."
>
> **37 CFR 1.104(b)** — "*Completeness of examiner's action.* The examiner's
> action **will be complete as to all matters**."

so a claim may be rejected on two, three, or four grounds at once; per-ground
percentages that sum to 100% describe a partition that does not exist.

**no USPTO-published breakdown was found** (research-datasets page and Patents
Dashboard both walked). if you need a rate, cite the study — do not add a bare
number here.

### 101 rejection (subject matter)

**what**: invention is not patent-eligible subject matter

**common targets**:
- abstract ideas (mathematical formulas, mental steps)
- laws of nature
- natural phenomena

**response strategy**:
- show practical application
- tie to specific technical improvement
- add concrete structural elements

### 102 rejection (anticipation)

**what**: single prior art reference discloses every claim element

**response strategy**:
- distinguish from reference (show absent element)
- amend claims to add distinguishing element
- argue reference teaches away from invention

### 103 rejection (obviousness)

**what**: combination of prior art references renders claim obvious to person of ordinary skill

**response strategy**:
- show unexpected results
- argue no motivation to combine references
- show teaching away
- present secondary considerations (commercial success, long-felt need)

### 112 rejection (definiteness)

**what**: claims are unclear or specification lacks enablement

**subtypes**:
- 112(a) — written description / enablement
- 112(b) — definiteness (claim scope unclear)
- 112(f) — means-plus-function interpretation

**response strategy**:
- clarify claim language
- amend specification (if allowed)
- provide definitions for ambiguous terms

---

## prosecution timeline

| phase | duration | key events |
|-------|----------|------------|
| file | day 0 | application submitted |
| publication | ~18 months from the **earliest filing date for which a benefit is sought** | application published — the opt-out has a condition and a fuse, see ⛔ below |
| first office action | 12-24 months | examiner reviews, issues rejection |
| response | 3 months set, **6 months hard cap** — see ⛔ below | applicant responds to rejection |
| final office action | varies | examiner issues final rejection |
| appeal / RCE | varies | continue prosecution or appeal to PTAB |
| grant | varies | claims allowed, patent issues |

### ⛔ the 6-month response ceiling is STATUTORY — extensions cannot pass it

> **35 U.S.C. §133** — "Upon failure of the applicant to prosecute the
> application **within six months** after any action therein, of which notice
> has been given or mailed to the applicant, or **within such shorter time, not
> less than thirty days, as fixed by the Director** in such action, the
> application shall be **regarded as abandoned** by the parties thereto."

read the two periods as what they are:

| period | set by | range |
|--------|--------|-------|
| the **shortened** period printed on the action | the Director, per action | ≥ 30 days; in practice 3 months on a merits action |
| the **statutory** period | §133 | **6 months, always** |

extensions under **37 CFR 1.136(a)** buy the difference between the two, one
month at a time, for a fee. they **cannot reach past month six** — that bound is
in the statute, and past it the application is abandoned by operation of law
with no petition needed to make it so.

and the fee is not the real price: §154(b)(2)(C)(ii) charges **patent term** day
for day past the three-month mark — see the term section below.

### ⛔ the publication opt-out has a CONDITION and a 45-day fuse

**the condition.** the nonpublication request is not a preference you check. it
is a certification about where else you will ever file:

> **35 U.S.C. §122(b)(2)(B)(i)** — "If an applicant makes a request upon filing,
> **certifying that the invention disclosed in the application has not and will
> not be the subject of an application filed in another country**, or under a
> multilateral international agreement, that requires publication of
> applications 18 months after filing, the application shall not be published as
> provided in paragraph (1)."

so the opt-out is available only to a US-only filer, and it binds the future,
not just the present.

**the fuse.** change your mind and file abroad, and a 45-day clock starts —
whose breach does not merely publish the application, it **kills** it:

> **35 U.S.C. §122(b)(2)(B)(iii)** — "An applicant who has made a request under
> clause (i) but who subsequently files, in a foreign country or under a
> multilateral international agreement specified in clause (i), an application
> directed to the invention disclosed in the application filed in the Patent and
> Trademark Office, **shall notify the Director of such filing not later than 45
> days** after the date of the filing of such foreign or international
> application. **A failure of the applicant to provide such notice within the
> prescribed period shall result in the application being regarded as
> abandoned.**"

#### ⭐ the relief that used to exist was REPEALED in 2012

do not reach for the unintentional-delay escape. it was in the statute and it is
not any more:

> **2012—Subsec. (b)(2)(B)(iii).** Pub. L. 112–211 **struck out** ", unless it
> is shown to the satisfaction of the Director that the delay in submitting the
> notice was unintentional" **after "regarded as abandoned"**.
>
> — the amendment notes to §122, US Code 2023 edition

the amendment note **proves** the absence (a zero-hit search for `unintentional`
alone could be a bad needle). a pre-2012 recollection offers a petition route
that no longer exists.

#### the escape hatches that DO exist

| move | authority | the catch |
|------|-----------|-----------|
| rescind the request | (b)(2)(B)(ii) — "at any time" | the application then publishes under (b)(1) |
| file a **redacted** copy | (b)(2)(B)(v) | due within **16 months** of the earliest benefit date, and §154(d) provisional rights are lost for any claim the redacted publication does not enable |

⚠️ (B)(v) is narrower than it reads: it applies only where the foreign-filed
application is **less extensive** than the US one, and it trades away the
provisional-rights damages that publication otherwise buys you.

---

## key dates

| date | significance |
|------|--------------|
| priority date — the statute calls it the **effective filing date** (§100(i)) | earliest file date, determines the **prior art cutoff** — ⛔ **not the term** |
| publication date | application becomes public |
| issue date | patent granted, enforceable |
| expiration date | 20 years from the **US non-provisional filing date** — see ⛔ below |

### ⛔ the term does NOT run from the priority date

the effective filing date sets what counts as prior art; the term runs from the
US filing date. they coincide only when there is no earlier foreign or
provisional application. "priority date" hides the difference — see the
subtraction table in the prior-art section above.

> **35 U.S.C. §154(a)(2)** — "such grant shall be for a term beginning on the
> date on which the patent issues and **ending 20 years from the date on which
> the application for the patent was filed in the United States** or, if the
> application contains a specific reference to an earlier filed application or
> applications **under section 120, 121, 365(c), or 386(c)**, from the date on
> which the earliest such application was filed."
>
> **35 U.S.C. §154(a)(3)** — "*Priority.*—**Priority under section 119**,
> 365(a), 365(b), 386(a), or 386(b) **shall not be taken into account in
> determining the term of a patent.**"

so the clock is started by a **domestic-benefit** claim and is **not** started
by a **priority** claim:

| the earlier application is... | under | starts the 20-year clock? |
|---|---|---|
| a US non-provisional you continue from | §120 / §121 | ✅ **yes** — from the earliest such |
| a US **provisional** | §119(e) | ⛔ **no** — §119 is excluded |
| a **foreign** application | §119(a)–(d) | ⛔ **no** |
| a PCT you entered nationally from | §365(c) | ✅ yes |
| a PCT you merely claim priority to | §365(a)/(b) | ⛔ no |

⭐ the provisional row is the one that surprises people, and it is a **feature**:
a provisional buys a year of priority for prior-art purposes **without** spending
a year of term.

### ⚠️ and 20 years is a FLOOR, not the answer

§154(b) adds **patent term adjustment** day-for-day for enumerated Office delays.
two guarantees carry most of it:

> **§154(b)(1)(A)** — "*Guarantee of prompt patent and trademark office
> responses.*—**Subject to the limitations under paragraph (2)**, if the issue of
> an original patent is delayed due to the failure of the Patent and Trademark
> Office to— (i) provide at least one of the notifications under section 132 or a
> notice of allowance under section 151 **not later than 14 months** after [the
> filing or national-stage date]; (ii) respond to a reply under section 132, or
> to an appeal taken under section 134, **within 4 months**…"
>
> the clause closes: "**the term of the patent shall be extended 1 day for each
> day** after the end of the period specified in clause (i), (ii), (iii), or
> (iv), as the case may be, until the action described in such clause is taken."
>
> **§154(b)(1)(B)** — "*Guarantee of no more than 3-year application
> pendency.*—**Subject to the limitations under paragraph (2)**, if the issue of
> an original patent is delayed due to the failure of the United States Patent
> and Trademark Office to issue a patent **within 3 years** after the actual
> filing date of the application under section 111(a)…"

so a real expiration date is
`US filing date + 20 years + PTA − any terminal disclaimer`, and none of those
three terms can be read off the priority date.

### ⛔ PTA is NOT free — and §154(b)(2)(C)(ii) is what makes the 3-month response period matter

both guarantees above open "**subject to the limitations under paragraph (2)**",
and paragraph (2) contains the one that reaches back into your own conduct:

> **§154(b)(2)(C)(i)** — "The period of adjustment of the term of a patent under
> paragraph (1) **shall be reduced by a period equal to the period of time during
> which the applicant failed to engage in reasonable efforts** to conclude
> prosecution of the application."
>
> **§154(b)(2)(C)(ii)** — "With respect to adjustments to patent term made under
> the authority of paragraph (1)(B), an applicant **shall be deemed to have
> failed to engage in reasonable efforts** … for the cumulative total of any
> periods of time **in excess of 3 months** that are taken to respond to a notice
> from the Office making any rejection, objection, argument, or other request,
> **measuring such 3-month period from the date the notice was given or mailed**
> to the applicant."

**§133 lets you take six months; §154(b)(2)(C)(ii) charges term for every day
past three.** one sets abandonment, the other the cost in patent life.

two further limits a "20 years + PTA" estimate ignores:

> **§154(b)(2)(A)** — "To the extent that periods of delay attributable to
> grounds specified in paragraph (1) **overlap**, the period of any adjustment
> granted under this subsection **shall not exceed the actual number of days the
> issuance of the patent was delayed**." (no double-count)
>
> **§154(b)(2)(B)** — "*Disclaimed term.*—**No patent the term of which has been
> disclaimed** beyond a specified date **may be adjusted** under this section
> beyond the expiration date specified in the disclaimer." (a terminal disclaimer
> caps PTA outright)

---

## .sources

every quote above was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. no WebFetch or WebSearch summary stands
behind any line.

| what | url | chars |
|------|-----|------:|
| 35 U.S.C. §154 — Cornell | `https://www.law.cornell.edu/uscode/text/35/154` | 13,097 |
| 35 U.S.C. §154 — govinfo, **2023 edition** | `https://www.govinfo.gov/content/pkg/USCODE-2023-title35/html/USCODE-2023-title35-partII-chap14-sec154.htm` | 24,996 |
| 35 U.S.C. §119 — Cornell | `https://www.law.cornell.edu/uscode/text/35/119` | 7,752 |
| 35 U.S.C. §120 — Cornell | `https://www.law.cornell.edu/uscode/text/35/120` | 2,321 |
| 35 U.S.C. §133 — Cornell | `https://www.law.cornell.edu/uscode/text/35/133` | ⚠️ **1,154** |
| 35 U.S.C. §133 — govinfo, **2023 edition** | `https://www.govinfo.gov/content/pkg/USCODE-2023-title35/html/USCODE-2023-title35-partII-chap12-sec133.htm` | 2,595 |
| 35 U.S.C. §122 — Cornell | `https://www.law.cornell.edu/uscode/text/35/122` | 6,693 |
| 35 U.S.C. §122 — govinfo, **2023 edition** | `https://www.govinfo.gov/content/pkg/USCODE-2023-title35/html/USCODE-2023-title35-partII-chap11-sec122.htm` | 11,185 |
| 35 U.S.C. §102 — Cornell | `https://www.law.cornell.edu/uscode/text/35/102` | 4,648 |
| 35 U.S.C. §102 — govinfo, **2023 edition** | `https://www.govinfo.gov/content/pkg/USCODE-2023-title35/html/USCODE-2023-title35-partII-chap10-sec102.htm` | 15,549 |
| 35 U.S.C. §112 — Cornell | `https://www.law.cornell.edu/uscode/text/35/112` | 2,669 |
| 35 U.S.C. §112 — govinfo, **2023 edition** | `https://www.govinfo.gov/content/pkg/USCODE-2023-title35/html/USCODE-2023-title35-partII-chap11-sec112.htm` | 5,702 |
| 35 U.S.C. §100 (definitions) — Cornell | `https://www.law.cornell.edu/uscode/text/35/100` | 2,857 |
| 37 CFR 1.104 — Cornell | `https://www.law.cornell.edu/cfr/text/37/1.104` | 9,417 |
| 37 CFR 1.136 — Cornell | `https://www.law.cornell.edu/cfr/text/37/1.136` | 5,187 |
| MPEP 706 (the container for rejection practice) | `https://www.uspto.gov/web/offices/pac/mpep/s706.html` | 160,492 |
| USPTO research datasets | `https://www.uspto.gov/ip-policy/economic-research/research-datasets` | 3,450 |
| USPTO Patents Dashboard | `https://www.uspto.gov/dashboard/patents/` | 5,928 |

pulled 2026-09-01.

### ✅ the decisive quotes were cross-published and compared programmatically

| passage | Cornell | govinfo | verdict |
|---------|--------:|--------:|---------|
| §133, the whole operative sentence | 329 | 329 | ✅ **byte-identical** |
| §122(b)(2)(B)(iii), the **abandonment** sentence | 139 | 139 | ✅ **byte-identical** |
| §154(a)(3) | 130 | 144 | ⚠️ delta **14** — see below |
| §122(b)(2)(B)(i), the **condition** sentence | 370 | 374 | ⚠️ delta **4** — see below |
| §122(b)(2)(B)(iii), the **45-day** sentence | 430 | 431 | ⚠️ delta **1** — see below |

**every delta is layout, not text** — a run-in paragraph designator or heading that one publisher inlines:

| delta | cause |
|------:|-------|
| 14 | govinfo inlines the `(3) Priority.—` heading on the same line; Cornell separates it |
| 4 | govinfo renders `(B)(i) If`; Cornell puts `(B)` on its own line and closes the space → `(i)If` |
| 1 | govinfo renders `(iii) An applicant`; Cornell renders `(iii)An applicant` |
| 1 | §102(b)(1): `(1)Disclosures` vs `(1) Disclosures` |
| 40 | §112(f): the run-in heading `(f) Element in Claim for a Combination.—`, inlined by govinfo |

each delta was diagnosed per body: magnitude does not rank substance (a changed word moves a sentence 1–4 chars; a heading moves it 40).

### provenance notes

- **two-sided needle misses are needle errors.** paraphrased needles (`not more than six months` for §133; `has not been` / `shall be regarded` for §122) matched neither publisher; needles copied off the body returned `329 = 329` and `139 = 139, agree: true`.
- **the 2012 repeal is proven on govinfo only.** Cornell carries §122's source credit but no amendment notes, so a Cornell-only pull cannot tell a repeal from a needle artifact; the govinfo note is what proves the escape existed and was removed.
- **two short pulls are complete:** §133 — Cornell, 1,154 chars (one sentence plus source credit); §120 — Cornell, 2,321 chars.
- **five `[Omitted long matching line]` hits were read in full** (MPEP 2111.03 ×3, §154(b)(1)(B), §122(b)(2)(B)(iii)) — the 'comprising' construction rule, the term charge, and the 45-day fuse all live inside suppressed lines.

## .see also

- `howto.patent-techniques.[lesson]` — the transitional phrases, and why
  "consisting essentially of" usually buys no narrowness

