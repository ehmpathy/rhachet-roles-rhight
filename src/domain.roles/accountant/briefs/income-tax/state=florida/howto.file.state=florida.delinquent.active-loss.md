# howto.file.state=florida.delinquent.active-loss

## .what

file a Florida corporate income tax return (**F-1120**) after its due date has passed, for a corporation with a net loss, and ask the Department to waive the late penalty.

the return itself is the same as an on-time one — see `howto.file.state=florida.current.active-loss` for the lines. this brief covers what changes once the date is gone.

## ⛔ a lapsed due date cannot be extended

> "File this application **on or before the original due date** of the taxpayer's corporate income tax or partnership return."
>
> — F-7004 instructions

so there is no extension to file now. file the return.

## .the penalty on a loss year is small and capped

> "Late-Filed Return – The penalty for a return filed late is 10% per month, or fraction thereof, not to exceed 50% of the tax due with the return. **If no tax is due and you file late, the penalty is $50 per month or fraction thereof, not to exceed $300.**"
>
> — F-1120N R. 01/26, Penalties

> "Note: A late-filed return will subject a corporation to penalty, **whether or not tax is due**."
>
> — F-1120N, When to File and Pay

| the late return | penalty | interest |
|---|---|---|
| no tax due (a loss) | $50 per month or fraction, **capped at $300** | none — there is no tax |
| tax due | 10% per month or fraction, capped at 50% of the tax | a variable rate, reset each January 1 and July 1 under §220.807 |

⇒ for a loss year the cap is the whole exposure, and six months-or-fractions of delay reach it. a longer delay costs no more — and no less. file it.

## ⛔ if the year was SKIPPED rather than late, read the limitations lever first

a non-filer's year is assessable with no time limit until a return lands, and a **written disclosure before the Department makes contact** restores the 3-year limit: `limitations/state=florida/lever.disclose-first-to-cap-the-lookback`.

| the year | the move |
|---|---|
| a loss year, $0 tax | the disclosure protects a $0 balance; its real value is at most the $300 penalty. a late return plus a reasonable-cause request is the lighter path |
| a year with tax due | the disclosure program compromises penalties on payment of tax and interest — read the lever brief before any first move |

## .which edition of the form

use the **F-1120 and F-1120N whose header names that taxable year**, not whatever DOR serves today:

> "Make sure that the software is for the correct year. **You cannot use 2024 software to produce 2025 tax forms.**"
>
> — F-1120N R. 01/26, page 2

| taxable year | edition | where |
|---|---|---|
| starts on or after January 1, 2025 | **R. 01/26** — the F-1120N header: *"for taxable years beginning on or after January 1, 2025"* | `refs/pulledAt=2026-10-04.fl-form-f1120*.r0126.txt` |
| earlier years | the edition for that year | ⚠️ not pulled. DOR's `current/` folder holds only the latest; prior editions were not located |

## .ask for the penalty waiver — reasonable cause

the Department compromises a penalty on **reasonable cause**:

> "The standard used in this determination is whether the taxpayer exercised ordinary care and prudence and was nevertheless unable to comply."
>
> — Rule 12-13.007(1), F.A.C.

the ground most often available to a corporation new to Florida's rules:

> "(3) **Ignorance of the law or an erroneous belief as to the need to comply** with a revenue law constitutes reasonable cause when there are facts and circumstances which indicate ordinary care and prudence was exercised by the taxpayer. (a) For example, ignorance of the law or an erroneous belief held by the taxpayer is a basis for reasonable cause when the taxpayer has a limited knowledge of business, a limited education, **limited experience in Florida tax matters**…"
>
> — Rule 12-13.007(3), F.A.C.

the statement, kept short and factual — a template, one line per slot:

| slot | what goes there |
|---|---|
| `<the duty>` | which return was late, and for which taxable year |
| `<the facts>` | the specific facts that made it late — the rule weighs facts, never a bare claim |
| `<the tax>` | the tax shown due on the return, if any |
| `<the cure>` | when the return was filed, and what now keeps the next one on time |

⇒ match the facts to one of the rule's grounds — subsection (3) ignorance of the law, (4) reliance on an advisor, (6) reliance on another person, (7) illness, (8) circumstances beyond control. the rule's own test is *"ordinary care and prudence"*; state the facts that show it.

⚠️ **how to submit the request is not pulled.** no form or channel for a corporate income tax penalty compromise was located. the common practice — a signed statement attached to the late return, or a letter in reply to the Department's penalty notice — is **inference**, not a Department instruction. confirm with the Department at **850-488-6800** (F-1120N, Contact Us).

## .steps

1. file the federal 1120 for the year first (`federal/howto.file.federal.delinquent.active-loss`)
2. get the F-1120 and F-1120N edition for that taxable year
3. complete it as `howto.file.state=florida.current.active-loss` describes; a loss lands at $0 on Line 10
4. check **D**, *"Initial return"*, if it is the first Florida return
5. attach the federal return and its listed schedules, and the reasonable-cause statement
6. officer signs
7. e-file through MeF software, or mail to **Florida Department of Revenue, 5050 W Tennessee St, Tallahassee FL 32399-0135**, tracked
8. if a penalty notice arrives, reply by letter with the same reasonable-cause facts
9. file the next year on time — the calendar in `refs/pulledAt=2026-10-04.fl-cit-due-dates.r0126.txt`, and `howto.file.state=florida.extension` if it will run late

## 🚩 what is NOT established here

| gap | why it is open |
|---|---|
| the submission channel for a penalty compromise request | no form or instruction located; the advice above is inference |
| prior-year F-1120 editions | DOR's `current/` path serves only the latest; no archive was walked |
| whether software will e-file a prior-year Florida return | depends on the product and the MeF window; not tested |

## .enforcement

- an F-7004 filed after the original due date, treated as an extension = **blocker**
- a late loss-year return held back to "wait out" the penalty = **nitpick** (the cap is reached; delay buys only risk)
- a prior year filed on the current edition = **blocker** (F-1120N: *"You cannot use 2024 software to produce 2025 tax forms."*)
- a skipped year with tax due, filed cold before the limitations lever was read = **blocker** (`lever.disclose-first-to-cap-the-lookback`)
- a penalty waiver claimed with no stated facts = **nitpick**

## .provenance

pulled with **bhrowser**, headful; bytes committed beside this brief and the lever brief:

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-04.fl-form-f1120n.r0126.txt` | F-1120N R. 01/26 — penalties, attachments, due dates | 129,827 |
| `refs/pulledAt=2026-10-04.fl-form-f7004.r0117.txt` | F-7004 R. 01/17 — the *"on or before the original due date"* sentence | 18,297 |
| `refs/pulledAt=2026-10-04.fl-cit-due-dates.r0126.txt` | due-date calendar R. 01/26 | 3,264 |
| `../../limitations/state=florida/refs/effectiveAt=2022-05-23.fl-rule-12-13.007.txt` | Rule 12-13.007, reasonable cause | (on disk) |

## .see also

- `howto.file.state=florida.current.active-loss` — the lines of the return
- `howto.file.state=florida.extension` — for next year, before the date passes
- `hazard.zero-tax-still-owes-a-return` — why a $0-tax year owes the return
- `limitations/state=florida/lever.disclose-first-to-cap-the-lookback` — a skipped year with tax due
