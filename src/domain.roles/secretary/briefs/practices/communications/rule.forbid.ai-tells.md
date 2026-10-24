# rule.forbid.ai-tells

## .what

correspondence must read as though a person wrote it. strip the marks that
signal machine authorship.

## .why

a message that reads as machine-written invites a different question than the
one you asked: *"did a human actually check this?"* — and at an agency, that
doubt attaches to the **facts** in the message, not just its style.

the cost peaks where the stakes do: a sworn statement, a submission, a demand
for relief. those documents rest on the reader's belief that a human reviewed
and stands behind every word.

> the tell is not that the writer is a machine. it is that **nobody read it
> back**.

## .the marks

### 1. the em-dash

`—` is the single strongest signal. people type commas, colons, parentheses,
and periods; they almost never type an em-dash in correspondence.

| 👎 | 👍 |
|----|----|
| "Before I have this notarized — is the text below what you need?" | "Before I have this notarized, is the text below what you need?" |
| "The officer signature and date are on page 1 — every other figure is unchanged." | "The officer signature and date are on page 1. Every other figure is unchanged." |

an em-dash almost always resolves to a **comma** (a pause), a **period** (two
sentences), or a **colon** (a list follows).

measured: a principal hand-converted every em-dash in a drafted subject line to
a hyphen before send — the rule, enforced at the keyboard.

### 2. the ADD-THEN-DEFEND pattern

**the deepest one, and not about style.** a sentence is added to the
deliverable, then a paragraph is written to justify why it belongs. **the
justification is the tell** — a sentence that earns its place needs no defense.

measured: four instances in one short email.

| what was added | how it was defended | verdict |
|----------------|---------------------|---------|
| "I am the sole officer, sole director, and sole stockholder … personal knowledge of the facts" | a section titled *"basis of knowledge — why the sole-officer line leads"* | **cut.** the letterhead and the officer signature already carry the authority |
| "issued **and outstanding**" | a treasury-shares clause bolted on to close the ambiguity the phrase created | **cut.** she asked for "total issued shares." use her word |
| the treasury clause itself | none — it existed only to patch the previous addition | **cut.** it patched a self-inflicted problem |
| an em-dash | none. it just appeared | **cut** |

each addition was individually defensible, so **a whole-message read finds no
fault**. the rule catches the *act*: if I wrote a paragraph to explain why a
sentence is fine, the sentence is not fine.

### 3. `X, not Y`

the negative-contrast construction. one is rhetoric; three in a message is a
signature.

| 👎 | 👍 |
|----|----|
| "This is a delivery, not a request." | "This is the form you asked for." |
| "We need the count, not the par value." | "We need the count." |

**say the positive thing.** the contrast is usually the writer's private
rationale leaked into the reader's copy.

### 4. the negation held to the end

put `not` on the verb, up front.

| 👎 | 👍 |
|----|----|
| "has repurchased, retired or cancelled **no shares**" | "has **not** repurchased, retired or cancelled any shares" |
| "the Corporation held **no** treasury shares" | (cut it, or) "the Corporation has **no** treasury shares" |

the 👎 form holds three verbs in suspense before the negation lands, and reads
as imitation legalese.

### 5. the tricolon

three parallel items, evenly weighted, in one breath. real writers produce two,
or four, or three of uneven length.

| 👎 | 👍 |
|----|----|
| "It is signed, notarized, and complete." | "It is signed and notarized." |
| "clear, concise, and complete" | "short and complete" |

fine **once**, when the three items are genuinely three. a tell when every list
in the message is exactly three long.

### 6. bolded lead-ins on every bullet

```
- **Signature:** on page 1
- **Redaction:** SSN only
- **Attachment:** the signed PDF
```

that is documentation style; correspondence is prose. write sentences, or use a
real table.

⚠️ **outbound correspondence only**. internal briefs and route files may use
whatever structure is clearest.

### 7. the vocabulary

| 👎 | 👍 |
|----|----|
| simply, seamlessly, robust, leverage, utilize, comprehensive | (delete, or use the plain verb) |
| "I wanted to reach out" | (delete; open with the payload) |
| "I hope this finds you well" | (delete) |
| "Please don't hesitate to reach out" | "Let me know" |
| "delve into", "a tapestry of", "it's not just X, it's Y" | (delete) |

most are also throat-clears under `rule.require.crisp`; they are listed here
because they read as *machine*, not merely *verbose*.

## .the test

> **read it out loud.** every place your voice would not go, a reader's eye
> will not go either.

an em-dash has no sound. a tricolon sounds like a speech. `X, not Y` sounds
like an argument with someone who is not in the room.

for the deep one:

> **did I write a paragraph to explain why a sentence belongs?**
> then cut the sentence, not the paragraph.

## .what this rule does NOT say

- it does not say be informal — an agency letter should be plain and formal
- it does not ban structure in briefs, routes, or internal records
- it does not ban the em-dash in prose for readers who know how it got there;
  this repo's briefs use them freely. **the rule is scoped to what a recipient
  reads**

## .enforcement

- an em-dash in outbound correspondence = **blocker**
- a sentence in the deliverable defended by a paragraph in the deliverable = **blocker**
- a negation stranded after a list = **nitpick**
- `X, not Y` more than once in a message = **nitpick**
- every list in a message exactly three long = **nitpick**
- bolded lead-ins on every bullet in correspondence = **nitpick**
- "simply / seamlessly / robust / leverage / delve" = **nitpick**

## .see also

- `rule.require.crisp` — cuts what is long. this rule cuts what is *artificial*
- `rule.forbid.baggage` — cuts what is a second subject. add-then-defend is how
  baggage gets rationalized back in
- `rule.require.friendly` — warmth is a **specific act acknowledged**, never a
  formula recited. a recited formula (*"I hope this finds you well"*) is an
  ai-tell and does not satisfy that rule either
- `rule.require.permanent-yields` — the yield records the **as-sent** text, so a
  hand-fixed em-dash shows in the delta table and the tell becomes visible
