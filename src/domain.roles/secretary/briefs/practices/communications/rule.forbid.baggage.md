# rule.forbid.baggage

## .what

**one message, one job.**

every sentence that does not serve that job is baggage. cut it — even when
it is true, even when it is relevant, even when you would rather they knew.

## .why — baggage does not dilute the ask, it REPLACES it

a recipient with a queue does not weigh your message as a whole. they scan
for **what this is and what it needs from me**. a message with two answers
to that question cannot be dispatched in one motion — so it goes back on the
pile.

> a clerk who can act on your message in one step will.
> a clerk who must first decide *which part to act on* will defer it.

baggage also **changes the category** of the message. a document that arrives
alone is a delivery — routine, closeable, logged. the same document with a
question attached is a *request*: a different queue, a different service level,
and at some agencies a channel that refuses it outright.

## 🚩 observed — three failures in one matter, all the same shape

| # | what went out | what came back |
|---|---------------|----------------|
| 1 | a document whose **subject line** was phrased as a request for action | declined on channel policy. the reply argued with the subject and **never referenced the attachment** — almost certainly never opened |
| 2 | the requested document, bundled with **three questions and a contested form** | silence, for weeks |
| 3 | a clean re-send, with **one factual correction** of an earlier message added back in | caught in review before send — twice |

failure 3 is the instructive one: the correction was true, material, and
defended as *"a statement, not a request."* **the recipient does not classify
your sentence by your intent for it.** they classify the message by whether it
is now about one thing or two.

## .the rule

before you send, state the **single** job of the message in four words. then
delete every sentence that does not serve it.

| baggage | what it costs you |
|---------|-------------------|
| a second ask | splits the decision; the cheap path is to defer both |
| a correction of an earlier message | re-opens a thread you had closed |
| a dispute or a disagreement | converts a delivery into a negotiation |
| context the reader already holds | signals you do not know what they know |
| a defense of a point they never raised | invites the objection you feared |
| an apology for the delay | makes the delay the subject |

### ✅ GRATITUDE IS NOT BAGGAGE — say thank you

every row above names a concrete harm. **gratitude causes none of them**: it
asks for no act, re-opens no thread, invites no reply. it is not a candidate
subject, so the delete test does not reach it.

these matters run for **months**, across many rounds, with a named human who has
real latitude in how fast and how far they help. a clerk who verified your
assets, opened a channel, and told you exactly what she needs has done you a
service. a reply that does not notice spends goodwill you will need in round four.

> the rule cuts what competes with the job. warmth does not compete with the
> job. warmth is *part* of the job when the job runs across many messages.

measured: a draft of this rule once listed thanks as baggage; no harm could be
named, and the principal restored it — *"that's the human touch."*

### 🎯 the real constraint is WEIGHT and PLACEMENT, not prohibition

gratitude turns into baggage only when it becomes a **topic**:

| ✅ courtesy | 🚫 topic |
|-------------|----------|
| `Thanks for the confirmation.` | a paragraph on how helpful it was |
| one clause, no new facts | gratitude that introduces the prior work as a subject |
| leaves them no reply to write | *"…that really cleared up the confusion about the years"* — now she may respond about the years |

> **"does this thanks give them a reply to write?"**

no → keep it. yes → it became a second subject.

### 📍 placement: the SAME LINE as the ask

| slot | verdict |
|------|---------|
| the **sign-off** | 🚫 a valediction is a fixed formula — `Thank you,` / `Best regards,`. loaded with content, it reads as a sentence cut off mid-thought |
| **its own line** above the ask | 🚫 pushes the payload to line 3 of the reader's first-glance budget |
| **the same line as the ask** | ✅ costs no vertical space; the payload lands where the eye first goes |

```
Hello <name>,

Thanks for the confirmation. Before I have this notarized, is the
wording below what you need?
```

### 🎯 do not over-specify the thanks

a file note needs a date. a person does not — she knows what she did.

| 👎 | 👍 |
|----|----|
| `Thank you for the asset verification on 7/20.` | `Thanks for the confirmation.` |

the precise version reads like a record under construction; the precision
belongs in the yield. `Thanks` over `Thank you` — it is what a person says.

### the test

> **"if I delete this sentence, does the recipient still act as I need?"**

if yes, delete it. run it per sentence, not on the message as a whole — baggage
survives a whole-message read because each piece looks defensible.

## ✅ what is NOT baggage

| keep | why |
|------|-----|
| identifiers — file number, account, reference | how they find you. this IS the job |
| a **dated timeline of prior contacts** | establishes age and diligence. it asks for no second thing; it tells them which pile you belong in |
| the artifact itself, and what was changed on it | the delivery |
| a single line that states the next step **you** will take | closes the loop without an ask |

a timeline is the common false positive: it is **provenance**, not history. it
answers the triage question *"fresh intake or live matter?"*.

> 🚫 baggage — *"in my last email I said X, but actually Y."*
> ✅ provenance — *"Jun 26 emailed the form. Jul 8 reply. Jul 10 called."*

one re-opens an argument; the other locates you in a queue.

## .the channel corollary

when a recipient tells you a channel does not serve a category, believe them
and **split**:

```
the artifact  ->  the channel that accepts artifacts
the substance ->  the channel they named for substance
```

bundled, the artifact inherits the category of the ask — and is refused with it.

## ✅ every comms draft carries a PRE-SEND CHECK block

the comms rules are read at **compose** time and needed again at **send** time —
in a mail client, days later, outside every tool that could enforce them. so the
check travels **inside the artifact**. a `grain=draft` comms file carries this
block, verbatim, immediately above the paste block:

```md
## 🚦 PRE-SEND CHECK

- [ ] **no em-dashes** — `—` is the strongest machine tell. a mail client or a
      paste can insert one. scan the block. (`rule.forbid.ai-tells`)
- [ ] **one job** — the message answers one question. no correction of an
      earlier message, no second ask. (`rule.forbid.baggage`)
- [ ] **gratitude is present, and is a courtesy** — thank them for what they
      actually did, in one clause. it must leave them no reply to write.
      (`rule.forbid.baggage`)
- [ ] **the ask is a request, not a demand** — offer before you ask; `what would
      help` over `what do you need from me`. (`rule.require.friendly`)
- [ ] **the payload is sentence one** — hide the rest; can they still act?
      (`rule.require.crisp`)
```

⚠️ **copy the block; never regenerate it from the rules at send time.** a list
derived fresh each time differs each time, and the item not recalled is the one
that ships. measured: a live-generated check once omitted the thanks item.

### ⛔ the block belongs to a draft whose act has NOT yet happened

it is a **pre-send gate**; once the act has happened there is no send to gate.
the requirement is scoped by the draft's status banner
(`rule.require.permanent-yields`):

| the draft is… | the block |
|---|---|
| 📋 **PLANNED** | ✅ **required** — the send is ahead |
| ✅ **EXECUTED** · 🚫 **NOT `<verb>`** | ⛔ **must not be added** |

⚠️ **to retrofit the block onto an already-executed draft is a FALSIFICATION.**
a checked box asserts a check that was run; on a message already delivered, none
was. `rule.require.permanent-yields`: *"a corrected yield with no history of the
correction is a falsified record."*

⭐ **a gate that fires at a moment must name that moment in its own enforcement
line.** an unscoped "always" reads onto the archive, where the gate has no
purchase and the honest cure does not exist.

### 🚫 why a hook cannot do this instead

the em-dash rule is scoped to outbound correspondence; the briefs here use
em-dashes freely. a write-time blocklist cannot tell a brief from a draft, so it
would fire on nearly every file and be muted within a day. the durable form of a
human gate is a checklist where the human already looks.

## .enforcement

- a second ask in a delivery = **blocker**
- a correction of a prior message inside a fresh one = **blocker**
- a substantive argument sent on a channel the recipient reserved for
  documents = **blocker**
- gratitude expanded into a topic that invites a reply = **blocker**
- a message to a named human who did you a service, with no thanks at all = **nitpick**
- a **📋 PLANNED** `grain=draft` comms artifact with no pre-send check block = **blocker**
- a pre-send check block retrofitted onto an already-executed draft = **blocker** (a falsified record)
- a pre-send check composed fresh instead of copied = **blocker**
- context the recipient already holds = **nitpick**

## .see also

- `rule.require.friendly` — ⭐ **bring light to every party.** the gratitude
  section above is its ancestor; that rule carries the rest — the offer before
  the ask, and why a message that scores clean on every other rule can still
  read as a demand
- `rule.require.crisp` — what to do with the sentences that survive this rule
- `hazard.subject-lines-are-routing-keys` (registrator) — the subject line is
  the first place baggage lands, and the cheapest place to lose
