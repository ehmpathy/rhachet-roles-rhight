# howto: get a remote online notarization — Florida

## .what

how a signer physically in Florida gets a document notarized **online**, in a
form the destination agency will accept.

## .the term: RON

a **remote online notarization** is a notarial act performed over a live
two-way audio-video link instead of physical co-presence. six parts:

| component | what happens | Florida authority |
|-----------|--------------|-------------------|
| live audio-video link | notary and signer see and hear each other in real time | §117.209 ⚠️ |
| credential analysis | the ID is photographed and machine-checked for authenticity features | 🚩 **not pulled** |
| identity proofing / KBA | knowledge-based authentication — out-of-wallet questions drawn from public and credit data | 🚩 **not pulled** |
| electronic signature | the signer applies a signature to the electronic document in-session | §117.021(2) |
| digital seal | the notary applies an electronic seal | §117.265(7) ⚠️ |
| session record | the audio-video session is recorded and retained | §117.245(2) |

⚠️ the two 🚩 rows are generic RON mechanics; the Florida subsection was never
pulled. do not cite them as Florida law.

⚠️ the two ⚠️ cites have sound facts and weak pinpoints:

- **§117.209** authorizes an online notary to act and fixes where the notary
  must sit. it is **not** the section that defines the audio-video link; the
  definition sits in §117.201, which was pulled but is not quoted in this repo.
- **§117.265(7)** says the duty to record the act type "may be satisfied by
  placing the term 'online notary' in or adjacent to the online notary public's
  seal" — so it **presupposes** a seal rather than requires one or states its
  contents. that gap is the whole subject of the §4328(a)(5) check further down.

## .why RON at all

a jurat cannot be pre-signed. the signer must swear and sign **in the officer's
presence**, which historically meant a trip. Florida's 2019 amendments
(effective 2020-01-01) let that presence be an audio-video link, so the same
act can be done from a desk in ~15 minutes.

### the link reaches ACROSS state lines — one way

> **§117.209(3)** — "An online notary public **physically located in this
> state** may perform an online notarization as authorized under this part,
> **regardless of whether the principal or any witnesses are physically located
> in this state** at the time of the online notarization."

| party | must be in Florida? |
|-------|--------------------|
| the **notary** | ✅ yes |
| the **signer** | ❌ no — anywhere |
| the **witnesses** | ❌ no — anywhere |

so the act is **performed in Florida** even when you are not — which is the
frame the whole interstate-acceptance section below turns on.

---

## ⛔ the one question that decides the matter: IS THE VENDOR REGISTERED?

a RON act is valid because the **notary** is commissioned and the **platform**
is a registered RON service provider. a slick site with a checkout page is not
evidence of either.

Florida publishes the list of registered providers itself:

> <https://online-notary.sunbiz.org/ServiceProviders>
> — Florida Department of State, Division of Corporations

**as of 2026-08-30 it holds 121 registrations across 100 distinct vendor
names.** the exact bytes are committed at
`refs/jurisdiction=usa-florida/pulledAt=2026-08-30.sunbiz.ron-service-providers.json`.

### ⚠️ the registry is a SEARCH FORM, and it will look empty

open the URL and you get a form with a `Search` / `Reset` / `View All` row and
no list. **click "View All."** the list only exists after that click.

a plain fetch returns 200 OK with **zero table rows**, so no `curl`-based check
can read it. see the refs readme.

### ⚠️ read a MISS and a MATCH differently

| the registry says | what it means |
|-------------------|---------------|
| your vendor **is** listed | ✅ state-registered. good |
| your vendor is **not** listed | ⚠️ **stop and look again by hand.** vendors register under a parent company name, a d/b/a, or a product name — and the same firm appears several times in different casings |

in the 2026-08-30 pull, one company appears under **six distinct names**:

```
Notarize, Inc.
NOTARIZE, INC.
Notarize, Inc. d/b/a Proof.com
Notarize.com
NOTARIZE.COM
Proof.com
```

`Proof` matches only two of those six. search the shortest distinctive token you
have:

```sh
rhx notary.find --state florida --vendor 'notariz'   # 8 names, 3 different firms
rhx notary.find --state florida --vendor 'proof'     # 2 names, same firm
```

the list above is the skill's output, not an eyeball
(`rule.forbid.hand-transcription`).

---

## 🎯 the shortlist

these are **registered** per the 2026-08-30 pull, and serve retail customers
(most of the 100 are title/mortgage platforms with no retail path).

| vendor | notes |
|--------|-------|
| **Proof.com** (Notarize, Inc.) | the largest; the one most agencies have seen before |
| **NotaryLive** | retail, flat-fee |
| **BlueNotary** | retail |
| **OneNotary** | retail |
| **NotaryCam, Inc.** | long-established |
| **Notarize Genie**, **Notary Central**, **ProNotary**, **USA NOTARY** | smaller |

```sh
rhx notary.find --state florida --retail    # the whole list, from the snapshot
```

that command prints 19 names; this table lists 9 vendors. one firm registers
under several names, so the roster is longer than the set of businesses you can
book with:

| the names on the roster | one vendor |
|---|---|
| `Blue Notary` · `BlueNotary` · `BLUENOTARY` | 3 → 1 |
| `Notarize, Inc.` · `NOTARIZE, INC.` · `Notarize.com` · `NOTARIZE.COM` · `Notarize, Inc. d/b/a Proof.com` · `Proof.com` | 6 → 1 |
| `One Notary` · `ONENOTARY` · `OneNotary, Inc.` · `ONENOTARY, INC.` | 4 → 1 |

the registry indexes **registrations**, not businesses; pick from the collapsed
table.

no count or price column, deliberately: both change with every pull
(`rule.forbid.hand-computed-figures`). run the skill for counts, with the
snapshot's age; check any quote against the statutory cap below.

---

## ⭐ the TIEBREAK — reviews and hours, among vendors that already passed the gate

registration is the **gate**; these figures only break ties among vendors that
cleared it.

pulled **2026-09-02**, headful, from Trustpilot's own schema.org JSON-LD.
`unanchored: []` — every page returned exactly one company aggregate.

| vendor | ★ | reviews | its own availability claim |
|---|---:|---:|---|
| **OneNotary** | **4.9** | 3,456 | *"notaries are available around the clock"* |
| **BlueNotary** | **4.9** | 2,884 | *"certified notary instantly—24/7, no waiting"* |
| NotaryCam | 4.8 | 16,746 | *"24x7"* |
| NotaryLive | 4.8 | 1,205 | *"Notarize in minutes 24/7/365"* |
| Proof | 4.6 | 3,335 | *"Notarize℠ Network available on-demand, 24/7"* |
| Notarize | 4.6 | 24,617 | ⚠️ **same firm as Proof** — see below |

⚠️ **Proof and Notarize are ONE company with TWO profiles** — the registry's
`Notarize, Inc. d/b/a Proof.com` states the tie. read them as one vendor at 4.6.

these figures rot; the *order* is more stable. re-run before you lean on one:

```sh
rhx browser.start --mode HEADFUL --session ronvendors
rhx browser.action --session ronvendors --play <ABS>/briefs/refs/florida-ron-vendors.scores.play.ts
rhx browser.stop --session ronvendors
```

### ⛔ an advertised "24/7" is a MARKETING CLAIM, never a guarantee

the last column is vendor copy, recorded verbatim — not evidence a notary is in
the queue tonight. counter-evidence from the same pull, a 1-star on **Proof's**
page:

> "This company is a total scam! They market 24/7 convenience but when we got
> online to get a notary, they only offered one in Texas."

that is worse than a wait: a Texas notary **cannot** perform a Florida online
notarization — §117.209(3) requires the notary to be physically in Florida.
**"a notary appeared" is not "a FLORIDA notary appeared."** verify on the
returned PDF (*the one thing to check* below): the state line and the
online-notarization box carry it.

### 🚩 what the review data does NOT establish

- ⛔ **not a quality measure.** a Trustpilot score is a **popularity** signal,
  self-selected and vendor-solicited. it does not speak to whether a certificate
  will satisfy the destination agency
- ⛔ **no hour was tested.** no session was booked at any time of day. the hours
  column is claims, not observation
- 🚩 **the retail list is from the 2026-08-30 snapshot.** the registry grows
  continuously; a vendor absent from the shortlist is not thereby unregistered

---

## 💵 what it may legally cost

> a Florida notary may charge **up to $25** for an online notarization —
> §117.275, Fla. Stat.
> (in-person acts are capped at **$10** — §117.05(2)(a))

⛔ **the PLATFORM fee is not capped.** a quote above $25 is not improper, but it
should break out as *notary fee + platform fee*; a vendor that cannot is worth a
second look.

---

## 📋 what to have ready before you start

1. **the document, complete and UNSIGNED**
   ⛔ do not pre-sign. a jurat certifies a signature made in the officer's
   presence; a pre-signed page invalidates the act, and a careful notary will
   refuse it.
2. **the jurat certificate, already on the page**
   Florida's form is in
   `../jurats/inventory.of=jurat.jurisdiction=usa-florida.md`. have it
   complete — a notary may have no template for a corporate sworn statement.
3. **a government photo ID** — RON adds knowledge-based authentication
   questions, drawn from public records, on top of the ID scan
4. **a device with a functional camera and microphone**, and a quiet room

---

## 🎯 THE SESSION, IN ORDER — you sign, THEN they seal

the order is the fact the certificate attests.

```
1. you UPLOAD the pdf                    ← unsigned                    🚩
2. you TAG where the signatures go                                     🚩
3. ID scan + KBA                         ← before the notary joins     🚩
4. the video session opens                                             §117.209
5. the notary administers the OATH       ← aloud; you answer           §117.05(13)(a)
6. YOU e-sign                            ← on camera, in their view    §117.05(13)(a)
7. the notary completes the certificate, e-signs, applies the seal     §117.05(4)(g)-(i)
8. you download the sealed pdf
```

⛔ **steps 5-7 cannot be reordered**, and the authority is the form's own
words. §117.05(13)(a) prints:

> "**Sworn to (or affirmed) and subscribed before me** by means of ☐ physical
> presence or ☐ online notarization, this ____ day of…"

**sworn**, then **subscribed**, then **before me** — the oath, the signature,
and the officer's presence for both. a notary cannot certify an act that has
not happened yet, so the seal is always last.

### ⚠️ the two ways people get this backwards

| the assumption | why it fails |
|---|---|
| "they notarize it, then I sign" | inverts the attestation. the certificate would assert a signature the officer never saw |
| "I'll e-sign it first to save time" | a pre-signed page invalidates the jurat. a careful notary refuses it; a sloppy one seals it and the defect can be raised later |

⛔ **do not sign before you upload** — not with DocuSign, not with a drawn
signature, not with a typed cursive name.

the confusion comes from the other act: an **acknowledgment** may be pre-signed;
a **jurat** may not, because oath and signature are both sworn to have happened
before the officer. an affidavit needs a jurat. (that contrast is definitional,
not a Florida statute — see
`../practices/define.notary-public-and-how-to-get-notarized.md`.)

### ⛔ and it cannot be repaired after step 7

> **§117.107(7)** bars a notary from any change to a written instrument once it
> has been signed.

so the certificate must be **complete and correct before the session** — the
checkbox present, the ID lines present, the printed-name line present. a defect
found at step 8 is a new session, not an edit.

steps 4-7 are statutory; steps 1-3 (🚩) are platform UX, not Florida law. a
vendor may reorder 1-3; no vendor may reorder 5-7.

---

## ⭐ the RON-specific detail people get wrong: THE CHECKBOX

Florida's statutory jurat carries a disclosure of *how* the act was performed:

```
Sworn to (or affirmed) and subscribed before me by means of
☐ physical presence or ☐ online notarization, this ___ day of ___, ___ (year),
by (name of person who makes the statement)
```

for a RON act the **online notarization** box must be the one marked. an
unmarked pair, or the wrong box marked, is a defective certificate under
§117.05(4)(c) — and it is defective in a way a clerk can see at a glance.

⚠️ the bracketed slots above are paraphrased. the **verbatim** statutory text,
including the state's own two published variants of the date phrase, is quoted
in `../jurats/inventory.of=jurat.jurisdiction=usa-florida.md`. copy the form
from there, per `rule.forbid.hand-transcription`.

⚠️ **this is not portable.** Delaware states the same fact as a *sentence*
(§4320(j)(2)); Indiana routes it through a different subsection entirely. a
Florida checkbox is not a Delaware sentence. see
`../jurats/compare.jurat-forms-across-jurisdictions.md`.

---

## ✅ the destination almost certainly accepts it

the usual worry — "will the other state take an online notarization?" — is
answered by the rule that a certificate follows the law of the state where the
**act** happened, not where the document is bound.

Delaware says so expressly, and strongly:

> **29 Del. C. §4324(c)** — "The signature and title of a notarial officer
> described in paragraph **(a)(1) or (a)(2)** of this section **conclusively
> establish** the authority of the officer to perform the notarial act."

a RON notary is squarely **(a)(1)** — "a notary public of that state." an
**(a)(3)** officer ("any other individual authorized by the law of that state")
gets only §4324(**b**)'s **prima facie** standard; the full three-officer table
is in `../jurats/inventory.of=jurat.jurisdiction=usa-delaware.md`.

so a signer in Florida, with a document bound for Delaware, wants a **Florida**
jurat, performed under Florida law, checkbox and all. to graft Delaware's short
form onto it would be worse than useless.

### ⛔ the FORM is accepted — the destination's ELEMENTS still bind

recognition is the easy question; sufficiency is a **conjunction**:

> **29 Del. C. §4328(c)** — "A certificate of a notarial act is sufficient if it
> **meets the requirements of subsections (a) and (b) of this section** and any
> of the following: … (3) Is in a form permitted by the law applicable in the
> jurisdiction in which the notarial act was performed."

so the Florida **form** is fine, and every element §4328(a) demands must still
appear on the page. one of them is the trap:

> **§4328(a)(5)** — "If the notarial officer is a notary public, indicate the
> **date of expiration**, if any, of the officer's commission."

⚠️ **Florida's statutory jurat form does not have that field.** §117.05(13)(a)
gives you venue, the presence/online checkbox, the date, the signer's name, the
notary's signature and printed name, and the ID basis — and no expiry. in
Florida the expiry lives on the **seal**:

> **Fla. Stat. §117.05(3)(a)** — "The seal shall also include the name of the
> notary public, **the date of expiration of the commission of the notary
> public**, and the commission number."

### ✅ so the one thing to check on the returned PDF

> **does the electronic seal render the commission expiration date?**

it is a single glance, and it is the only element a Delaware filing is likely to
be refused on.

🚩 the reason to check rather than assume: §117.05(3)(a) is drafted for
"**paper** documents" of the "**rubber stamp** type." it reaches an online act
through §117.265(8) ("the provisions of part I of this chapter apply to an
online notarization"), which is a sound construction and **not** a quote.
§117.021(2), which governs the electronic signature, requires uniqueness,
independent verification, sole control and tamper-evidence — and is silent as
to any expiry.

### ⛔ DO NOT CURE IT BY A FIELD ON YOUR TEMPLATE

do not print `My commission expires ________` on the certificate.

| why it backfires | |
|---|---|
| **it is not your fact** | the expiry is the officer's attestation about their own commission. a blank you printed for them to fill is a field you invented |
| **it invites the objection you are avoiding** | it hands a Delaware clerk a Florida certificate that visibly departs from Florida's printed form — a reason to look twice at a document whose only job is to invite no questions |
| **Florida already carries it** | §117.05(3)(a) puts the name, expiration date, and commission number on the **seal**, as a matter of statute rather than habit |

same failure mode as a `Jurat` title above the block: a field reasoned into
existence rather than read off a source (Florida's corpus: **23 certificate
blocks, 0 titles**).

**the cure is the glance, not a new line.** if the returned seal does not
render the expiry, that is a vendor question — ask for a re-seal or a different
notary — never a drafting question.

⚠️ and it could not be cured on the certificate anyway: §117.107(7) bars a
notary from changing an instrument after it is signed.

⚠️ destination *recognition* is rarely the problem — every state checked in our
inventory accepts out-of-state acts. an **absent element** is the problem.

---

## 🚩 what this brief does NOT establish

| gap | status |
|-----|--------|
| current prices for any vendor | ❌ **not pulled.** deliberately — see above |
| whether a given vendor's notaries are individually commissioned | ❌ not checkable from the registry; the registry lists **platforms** |
| **whether any vendor actually staffs the hour it advertises** | ❌ **no hour was tested.** the availability column is verbatim vendor marketing, never observation — see the tiebreak section |
| **whether a high-scoring vendor produces an acceptable certificate** | ❌ a Trustpilot score is a **popularity** signal; it is silent on whether the destination agency will take the result |
| the RON journal / audit-video duty | ⚠️ partially — §117.245 requires a 10-year journal **plus** the audio-video record. that is the *notary's* duty, but ask who retains it and how you obtain a copy |
| non-Florida RON registries | ❌ this brief is Florida only |

---

## .see also

- `refs/jurisdiction=usa-florida/readme.md` — the committed registry bytes, and why this source must be **driven** rather than fetched
- `../refs/florida-ron-vendors.scores.play.ts` — the score pull, and the ⛔ **adjacency trap** it exists to survive: a Trustpilot page renders *other* companies' scores in a "People also looked at" rail, and its JSON-LD carries a `ratingValue` on **every individual review**. the discriminator is that the company's aggregate is the only one that also carries `reviewCount`
- `../refs/florida-ron-vendors.hours-and-reviews.play.ts` — the availability pull, and its batch guards (byte count, soft 404, **size collision**)
- `../refs/florida-ron-vendors.score.probe.play.ts` — the probe that found a plausible, correctly-shaped, wrong `reviewCount` where the obvious failure (`score: null`) was harmless
- `../jurats/inventory.of=jurat.jurisdiction=usa-florida.md` — the certificate text, its mandatory elements, and the checkbox
- `../jurats/compare.jurat-forms-across-jurisdictions.md` — why a jurat is not portable
- `../practices/define.notary-public-and-how-to-get-notarized.md` — jurat vs acknowledgment, and why the difference decides whether you may pre-sign
- `secretary` role — produces the document you bring to the notary

## .date researched

2026-08-30

(taken from the brief's own registry count, stated "as of 2026-08-30")
