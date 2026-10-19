# rule.require.permanent-yields

## .what

**every proposal, every draft, every communication, every decision gets a permanent yield. no artifact is ever lost.**

this is **the core duty of the role**, not a documentation practice. a secretary who files on time but keeps no record has done half the job — and the skipped half is the half that survives.

## .why

a corporation is a paper construct. its acts exist only insofar as they were recorded; an unrecorded act is, for an audit, a petition, a dispute, or a sale, an act that did not occur. **the record is the work.**

## .the rule

| artifact | gets a yield? |
|----------|---------------|
| a message sent | ✅ always |
| a message drafted and **not** sent | ✅ always |
| a call placed | ✅ always |
| a call planned and skipped | ✅ always |
| a document filed | ✅ always |
| a document prepared and withdrawn | ✅ always |
| a figure computed | ✅ always |
| a decision made, even a small one | ✅ always |

there is no threshold. the artifacts that feel too small to record are the ones nobody remembers to reconstruct.

## 🎯 the DRAFT and the FINAL are two records, kept separately

a draft is **a different fact about a different moment**, not a rough version of the final.

| file | records | permanent |
|------|---------|-----------|
| `…grain=draft.md` | what we **intended** to send, and the grounds | ✅ |
| `…grain=final.md` | what was **actually** sent, verbatim, and what came back | ✅ |

the filename carries the distinction — see `rule.require.comms-filename-facets`.

- **never overwrite the draft with the final.** they always diverge — a line cut at the keyboard, a recipient added, whitespace reflowed. the delta records the sender's last-moment edit, often the most considered one
- the yield quotes the **as-sent** text, pasted from the sent folder — not the draft. where they differ, the yield names the difference

```
3.comms.on=2026-07-20.mech=email.subj=1120-signed.grain=draft.md    ← the plan, and why each line is there
3.comms.on=2026-07-20.mech=email.subj=1120-signed.grain=final.md    ← what went out, verbatim
```

## 🎯 the UNSENT draft is often the more valuable record

a sent message proves what you said. an unsent draft plus its refusal proves **what you declined to say, and why**.

> **worked example.** an agency supplies a template affidavit that swears to a fact the company's own records contradict. the correct act is to refuse to execute it — and a refusal leaves no trace by default.
>
> the artifact of record is **the draft, plus the refusal, plus the documents that grounded it, plus the date**: a party that read the template, checked its books, found a conflict, and declined to swear falsely. discard the draft and that becomes an unexplained gap.

**a decision not to act is an act.** record it the same way.

## .the status banner — every yield says whether it went out

a yield opens with its **status**, so no reader infers from prose whether it reached the recipient.

```md
# 3.comms.on=2026-07-20.mech=email.subj=1120-signed.grain=final

⏳ **SENT** 2026-07-20 → dosdoc_ftax@delaware.gov · **no reply as of 2026-07-20**
```

| banner | means |
|--------|-------|
| ✅ **SENT** `<date>` → `<recipient>` · **answered** `<date>` | closed loop |
| ⏳ **SENT** `<date>` → `<recipient>` · **no reply as of** `<date>` | open, clock runs |
| 🚫 **NOT SENT** — superseded by `<file>` | drafted, replaced |
| 🚫 **NOT SENT** — withdrawn, `<reason>` | drafted, declined on purpose |
| 🗑️ **SCRAPPED** — moved to `.archive/` `<date>` | abandoned, kept anyway |
| 📋 **PLANNED** — not yet executed | a compose that has not run |

### ⚠️ the verb tracks the MECHANISM — and only these four verbs exist

| `mech=` | done | not done |
|---------|------|----------|
| `email` · `mail` | ✅ / ⏳ **SENT** | 🚫 **NOT SENT** |
| `phone` | ✅ / ⏳ **PLACED** | 🚫 **NOT PLACED** |
| `portal` | ✅ / ⏳ **FILED** | 🚫 **NOT FILED** |
| `inperson` | ✅ / ⏳ **HELD** | 🚫 **NOT HELD** |

- ⛔ that is the whole list. do not coin a fifth; the negative is always `NOT <verb>`
- measured: with only `SENT` on offer, one archive coined `NEVER PLACED` and `NOT SPOKEN` for one state — synonym drift (`rule.require.ubiqlang`) from a gap in this table
- ⇒ when a worked example invents a term, the vocabulary was short a row. read the coinage as a defect in the table

### 🎯 a DRAFT's banner answers a different question than a FINAL's

a `grain=final` *is* the message, so "was it sent?" is the whole question. a `grain=draft` is **the plan**: its text is not what went out, and the send may have happened on a different date under a different filename. its reader needs *was this plan carried out* and *where did the outcome land*.

| `grain=draft` banner | means |
|---|---|
| 📋 **PLANNED** — not yet executed | the act has not happened. **the pre-send check is live** |
| ✅ **EXECUTED** — `<verb>` `<date>` · outcome in `<final file>` | this plan went out. the clock lives in the final, not here |
| 🚫 **NOT `<verb>`** — superseded by `<file>` | replaced before the act |
| 🚫 **NOT `<verb>`** — withdrawn, `<reason>` | declined on purpose |

- `EXECUTED` is the one row not mechanism-shaped: it reports the intent was carried out and hands over the pointer; the mechanism verb appears inside it
- measured: a draft composed 8/4 and sent 8/7 (outcome under an 8/7 filename) had no act-verb that could say so — the row this table now holds
- ⛔ a draft never inherits the final's banner

⚠️ **"no reply as of `<date>`" is the required form.** an absolute date lets a reader weeks later compute the silence; "no reply yet" rots the moment it is written.

## .where scrapped artifacts go

a scrapped artifact is **not deleted**. it moves.

| directory | for | permanence |
|-----------|-----|-----------|
| `$route/` | the live sequence | permanent |
| `$route/.archive/` | superseded and withdrawn artifacts | **permanent** |
| `$route/.scratch/` | scraps, fragments, experiments | permanent, unindexed |

- **`.archive/`** — a real candidate, replaced or refused. carries a status banner and a one-line reason at the top
- **`.scratch/`** — never a candidate. no banner. kept because the cost to keep is zero and the cost to lose is unbounded

> 🚫 **`rm` is forbidden on a route artifact.** move it.

## .what a yield must carry

1. **the status banner** — first line after the title, per above
2. **what** — the artifact itself, verbatim as sent, or an exact pointer
3. **when** — an **absolute date**, never "yesterday" or "last week"
4. **who** — sender, recipient, and the individual if one was named
5. **why** — the grounds. what made this the right act at that moment
6. **the outcome** — and *"no reply as of `<date>`"* is an outcome, not a gap
7. **the delta** — how the as-sent text differs from the compose, if it does
8. **the defects** — what was wrong with it, found later. see below

## .append-only

a yield is **never edited to be correct**. it is appended to.

```md
## ⚠️ defect found 2026-07-16

this message states the years owed as 2024–2026. that is wrong; the
correct years are 2022 and 2023. derivation: `1.calculate.owed.yield.md`,
§ *which years are owed*.

the error was already in the recipient's hands when it was found.
```

- cite a section name, never a line offset (`rule.forbid.line-offset-cross-references`) — a template propagates whatever form it teaches
- **a corrected yield with no history of the correction is a falsified record.** the archive's value is what was believed at each moment

## .same day

a yield is written the **same day** as the act. an unyielded act has no follow-up clock: no "sent 7/16, no reply" means no trigger fires, and the silence extends until someone happens to remember.

measured, one unyielded send:

| what a yield would have caught | what happened without one |
|--------------------------------|---------------------------|
| "sent 7/16 · no reply" → a 7-day follow-up trigger | the trigger never fired; 18 days elapsed |
| a factual error in the body, found the same day | the error stayed live and uncorrected |
| the bundled-ask defect, visible on a re-read | the same defect was nearly repeated in the next draft |

## .compose vs yield

| suffix | when written | what it says |
|--------|--------------|--------------|
| `*.compose.md` / `.txt` | **before** the act | what we intend to do, and why each line is there |
| `*.yield.md` | **after** the act | what actually went out, and what it cost |

both are permanent and answer different questions. **a compose is never enough on its own**: every executed compose produces a yield; every unexecuted compose produces a yield that says so.

## 🎯 a FACT may be added late. an ACT may not be claimed late.

| the retrofit | verdict |
|---|---|
| add a **status banner** to an old yield that lacks one | ✅ **do it** |
| add a **pre-send check block** to an old draft that lacks one | ⛔ **never** (`rule.forbid.baggage`) |

- a banner records a **fact** — *the message went out 7/16 to this recipient* — true then and now. to write it late completes the record
- a checkbox asserts an **act** — that you performed a check. on a message already delivered, no check was performed; to tick it fabricates an event

> **does the addition state what WAS TRUE, or claim what WAS DONE?**

state the true fact, always, and date the addition. claim the performed act, never. an incomplete record can be finished; a falsified one cannot be un-falsified.

## .enforcement

- an act with no yield = **blocker**
- `rm` on a route artifact = **blocker**
- a compose overwritten by its final text = **blocker**
- a yield with no status banner = **blocker**
- a yield edited to correct a defect, with no record of the correction = **blocker**
- a yield with a relative date ("last week") = **blocker**
- a yield that quotes the draft instead of the as-sent text = **blocker**
- a yield written more than one day after the act = **nitpick**
- "no reply yet" instead of "no reply as of `<date>`" = **nitpick**

## .see also

- `rule.forbid.baggage` — governs what goes **into** a communication
- `rule.require.crisp` — governs how it is written
- this rule governs what survives **after** it is sent
