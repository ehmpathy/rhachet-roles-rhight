# rule.require.crisp

## .what

**assume the first sentence is the only sentence they read.**

write so that it is enough. everything after it is optional detail for the
minority who need it — never a place where required information hides.

## .why

a recipient with a queue reads to answer one question: *what is this and
what does it need from me?* they read until they can answer it, then stop.
if sentence one answers it, they act. if it does not, they skim, and a skim
finds the wrong thing or finds no thing.

so length is not neutral. **it is a tax you charge the reader**, and they
pay it by skip:

| message | what gets read |
|---------|----------------|
| 1 sentence | all of it |
| 1 short paragraph | the first sentence, then a scan for numbers and bold |
| 4 paragraphs | the first line, and whatever the eye catches |
| 4 paragraphs with an ask in ¶3 | the ask never lands |

> length does not make a message thorough. it makes it optional.

⚠️ the reader is not lazy. they are a clerk with a stack, and the scan is a
correct strategy for the volume they face. write for that reader as they
actually are, not as you wish they were.

## .the rule

### 1. lead with the payload

| 👎 buries it | 👍 leads with it |
|--------------|------------------|
| "I hope this finds you well. Following up on our call last month regarding the matter we discussed, I wanted to reach out because…" | "Attached is the signed form you asked for on July 10." |
| "After reviewing my records and consulting the relevant statutes, I have concluded that…" | "The years owed are 2022 and 2023, not 2024–2026." |

the first sentence names **the artifact or the answer**. context, if any,
comes after — never before.

### 2. inverted pyramid

```
sentence 1      the payload         — everyone reads this
next 2-3 lines  the identifiers     — how they find your file
after that      the detail          — for the one reader who needs it
```

each layer must be **droppable**. if a reader stops at any line, what they
have so far should still be correct and actionable.

### 3. cut by half, twice

first draft says it. second draft says it in half the words. third draft is
what you send. the cuts are almost always the same targets:

| cut | example |
|-----|---------|
| the throat-clear | "I hope this finds you well" · "I wanted to reach out" |
| the pre-apology | "sorry to bother you" · "I know you're busy" |
| the narration | "as I mentioned" · "as you may recall" |
| the hedge stack | "I think it may possibly be the case that" |
| the wind-up | "in order to" → "to" · "at this point in time" → "now" |
| the restatement | any sentence that repeats the one before it in new words |

### 4. one idea per sentence, one job per paragraph

if a sentence needs a semicolon to hold two ideas, it is two sentences.

### 5. make it skimmable, because it WILL be skimmed

- **bold** the two or three tokens that must survive a scan — the file
  number, the date, the amount
- put dates and figures on their own lines
- a five-row table beats the paragraph that would have described it

design for the skim rather than resent it.

## .the test

> **cover everything but the first sentence. can they still act correctly?**

if not, the payload is in the wrong place. move it up.

second test, for length:

> **could a clerk act on this without a second read?**

## .examples

### 👎 before

> Hello, I hope this message finds you well. I'm writing to follow up on
> some correspondence we've had over the past couple of months regarding
> my corporation's franchise tax situation. As you may recall, we spoke
> on the phone at the end of July, and during that conversation it was
> mentioned that in order to move forward with the recalculation process,
> you would need a copy of our federal tax return signed by an officer of
> the company. I've now had a chance to take care of that, and I've
> attached the document to this message for your review.

95 words. the payload — *the signed form is attached* — is in sentence four.

### 👍 after

> Attached is the signed federal Form 1120 you asked for on our July 10
> call.
>
> **File #12345678** · EIN **00-0000000**
>
> The officer signature and date are on page 1. I redacted only the Social
> Security number; every other figure is unchanged.

38 words. the payload is sentence one, the identifiers are scannable, the
detail is droppable.

## .enforcement

- required information below the first paragraph = **blocker**
- an ask that appears for the first time after ¶2 = **blocker**
- a throat-clear opener before the payload = **nitpick**
- a message that could be half as long = **nitpick**

## .see also

- `rule.forbid.baggage` — this rule makes what remains crisp; that one
  decides what remains at all. run baggage first, then crisp
- `rule.require.friendly` — ⚠️ **the counterweight.** this rule models the
  reader as a queue and taxes every word. that one adds back the clause that
  treats them as a person. they are compatible at the scale each operates:
  crisp cuts **paragraphs**, friendly adds **a clause**
- `hazard.subject-lines-are-routing-keys` (registrator) — the subject line
  is the first sentence before the first sentence, and the one most often
  wasted
