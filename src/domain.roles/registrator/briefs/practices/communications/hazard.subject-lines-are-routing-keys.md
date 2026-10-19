# hazard.subject-lines-are-routing-keys

## .what

when you correspond with a government agency, the **subject line is a routing key, not a summary.**

a clerk, a mail rule, or a triage queue decides where your message goes — and often whether to open it — from the subject alone. descriptive prose there can send a complete submission to the wrong queue, where it is declined by policy rather than on the merits.

measured: this cost **six weeks** on a live matter (case study below).

---

## .why this happens

agency inboxes are **triaged**, not read like personal email.

| the sender assumes | the agency actually does |
|--------------------|--------------------------|
| a human reads the whole message | a clerk sorts by subject into a queue |
| the attachment speaks for itself | the attachment is opened only after the subject routes correctly |
| more context in the subject helps | more context creates more surface to mis-match |
| the subject is a courtesy summary | the subject is the sort key |

a subject that **names an action** is sorted by that action; one that **names a document** is sorted as a document intake. agencies routinely have policies like *"we do not do X by email"* — if your subject says X, the policy fires before anyone looks at what you sent.

---

## the case study — SANDPINE, INC., 2026

a voided Delaware C-corp needed its back franchise tax recalculated. the state said by phone to email the federal Form 1120 to the franchise tax address. the subject sent:

```
SANDPINE, INC. — File #0000000 — Assumed Par Value Recalculation Request
```

twelve days later, the reply:

> "You will need to call in and speak to a specialist about **recalculations**. We do not do **recalculations** in emails please call 302 739 3073x3"

| observed | our read |
|----------|----------|
| the subject ended with the words **"Recalculation Request"** | ⚠️ **inferred**: triaged as a *request for an action*, not a *document submission* |
| the reply used the same word twice, and addressed only the channel | ⚠️ **inferred**: the 1120 attachment was likely never opened |
| the reply gave the same phone number we had called to begin with | observed — a closed loop |

on the follow-up call, the clerk dictated the subject she wanted, in her own order:

> **1120**, file number, entity name — and that it's the 1120.

```
1120 — File #0000000 — SANDPINE, INC.
```

no prose, no verb, no ask. the **artifact type leads.**

| | subject | leads with | reads as | outcome |
|---|---------|-----------|----------|---------|
| ours | `SANDPINE, INC. — File #0000000 — Assumed Par Value Recalculation Request` | the entity | a **request** | ❌ declined by channel policy |
| theirs | `1120 — File #0000000 — SANDPINE, INC.` | the artifact | a **submission** | prescribed form |

the attachment was identical; only the subject differed.

---

## .the rule

> **when a clerk prescribes a subject format, treat it as a specification — reproduce it exactly, in their order, with no additions.**

when no format is prescribed:

| do | do not |
|----|--------|
| lead with the **artifact type** (`1120`, `Affidavit`, `Annual Report`) | lead with your entity name |
| include the **file / account number** | include a description of what you want done |
| include the **entity name** | include words that name a service the agency may not offer by that channel |
| keep it to identifiers | add courtesy phrases, urgency markers, or history |

put the **ask in the body**, never the subject — the body is read by a human who has already routed you correctly.

---

## .the danger words

any noun that names an **action the agency performs** invites a channel-policy response in a subject line:

- recalculation
- reinstatement
- amendment
- appeal
- waiver
- refund
- expedite
- request (generic, but it frames all that follows as an ask)

fine **in the body**; hazardous **in the subject**.

---

## .the tell you got routed wrong

you were probably triaged, not evaluated, if the reply:

- **echoes a word from your subject** and declines on that basis
- addresses only the **channel** ("we do not do this by email / phone / mail")
- makes **no reference to your attachment** or its contents
- redirects you to a channel **you already tried** — the strongest signal: two triage rules pointed at each other

---

## .how to break the loop

| tactic | why it works |
|--------|--------------|
| lead the next contact with **your history**, dated | signals this is not a fresh intake, so the default triage path does not apply |
| **quote the prior reply verbatim**, with the sender's name | proves the referral is theirs, not your interpretation |
| ask for a **specialist** by that word, if their reply used it | escalates past the general queue |
| ask for the **prescribed subject format** outright | converts guesswork into a specification |
| get a **direct extension and a name** before you hang up | the queue is the loop; a named person is not |

---

## .see also

- `howto.reinstate-void-delaware-corp.md`
- `define.why-delaware-wants-a-zero-shares-affidavit.md`
- `delaware.franchise.tax.delinquency.md`

## .sources

- primary: a real Delaware C-corp matter, pseudonymized, dates shifted as SANDPINE, INC. — Division of Corporations correspondence, 2026-06-26 through 2026-07-10. the two subject lines and the reply are quoted unaltered; the entity name and the file number were swapped, per `rule.require.collision-checked-pseudonyms`, and the dates were shifted, per `rule.forbid.auth-escalation-disclosures`. the live log stays local-only

> ⚠️ the causal claim — that the subject line triggered the decline — is **inferred** from the word match between our subject and their reply, not confirmed by Delaware. follow the prescribed format regardless; conformance costs naught.
