# rule.require.deterministic-redaction

## .what

never redact a document by hand. always redact via `pdf.redact`, and leave the mark **visible** — `--style tape`, which is the default.

the twin of `rule.forbid.hand-transcription`: that rule says never re-type a document's contents; this one says never re-draw them either.

## .why a hand redaction is a defect

to cover a value by hand fails in four ways, each **silent**:

| hand method | what actually happens |
|-------------|----------------------|
| draw a box in a pdf editor | the text layer is untouched; `pdftotext` still returns the SSN |
| crop the page | the value is off-canvas but still in the file's content stream |
| screenshot the page | pixels are safe, but every other value on the page is now unverifiable |
| eyeball the coordinates | you cover the wrong box, or half a box, and never know |

`pdf.redact` avoids all four: it **locates** each target's box from `pdftotext -bbox` (never a guessed coordinate), **rasterizes** the page (which destroys the text layer), **paints** an opaque box over the located area, and **reassembles**. the value survives neither as extractable text nor as pixels.

> a redaction that might have missed is worse than none — because you will
> share the document and assume it is safe.

## .why the mark must be VISIBLE

`--style tape` draws a diagonal hazard stripe with a `redacted` label; `--style solid` draws a plain black box. **tape is the default, deliberately.** a plain black box is indistinguishable from:

- a printer artifact or a scan defect
- a form field that was simply left empty
- a redaction someone else made, for some other reason

the hazard stripe says **a human removed this value on purpose** — which, at an agency, stops a clerk who would otherwise read the gap as an *incomplete submission* and reject the file. use `--style solid` only when a visible marker would itself be a problem. that is rare.

## ⛔ FIRST: is the source DIGITALLY SIGNED? if so, this rule does not apply

`pdf.redact` rasterizes — the mechanism that makes it trustworthy is the one that **destroys the signature** on a signed document, silently, while every visual check passes. so detection runs **before** every step on this page:

```sh
# /ByteRange or /Adobe.PPKLite present -> STOP. do not redact.
```

a document signed by a notary, a counterparty, or a platform carries proof in its **bytes**, and no redaction can preserve it. see `rule.forbid.rewrite-of-signed-documents` for the detection and the three lawful alternatives.

> ⚠️ this is the one place where a faithful read of this rule produces the
> wrong act. "never hand-draw a mask, always use `pdf.redact`" is correct for
> every unsigned document and ruinous for a signed one.

## .how

```sh
# an SSN, the common case
rhx pdf.redact --what ssn \
  --from  return.pdf \
  --into  return.redacted.pdf

# extra PII by literal phrase; repeatable
rhx pdf.redact --what ssn \
  --text 'JOHN DOE' --text '123 Main St' \
  --from return.pdf --into return.redacted.pdf
```

## ⚠️ redact for the RECIPIENT, not by reflex

redact what this recipient must not have — not every value that *looks* sensitive.

| recipient | redact |
|-----------|--------|
| a public repo, an npm package, a screenshot | SSN, EIN, home address, phone, account numbers |
| **the agency the document is FOR** | the SSN, and little else |

an over-redacted submission is a rejected submission. Delaware needs the EIN, the entity address, and every figure on the return — the substance of what was sent. measured: a first pass blanked the EIN, business address, and several identifiers from a Form 1120 bound for the Delaware Division of Corporations; the fix was to redact **only** the SSN, and keep the fuller redaction for a public copy.

## .verify TWICE, always

a redaction is a security claim. each check catches what the other misses:

```sh
# 1. is the value gone from the TEXT layer?
rhx pdf.transcribe return.redacted.pdf --via textual --into /tmp/check.md
# then search /tmp/check.md for the pattern. expect: no match

# 2. is the value gone from the PIXELS, and is the tape visible?
rhx pdf.render return.redacted.pdf --page 7 --into /tmp/check.png
# then LOOK at it
```

check 1 alone passes on a file where the box was painted in the wrong place; check 2 alone passes on a file whose text layer was never destroyed.

### 🚩 check 1 is VACUOUS on a redacted PDF — and that is the norm

`pdf.redact` rasterizes the pages it touches, so the output usually has **no text layer at all** — "search the extract, find no match" succeeds trivially, even for values plainly visible in the pixels. measured: `pdf.transcribe --mode plan` on the redacted SANDPINE 1120 routed **8 of 8 pages to optical**.

| check | what it actually proves |
|-------|-------------------------|
| 1 — text layer | only that the value is not *extractable*. on a rasterized output this is nearly free and proves little |
| 2 — **the render** | that the box landed **on the value**. this is the one that carries the weight |

- `--via textual` is deliberate: it **fails loud** when a page has no text, so check 1 says "no text layer here" rather than "no match found." a silent pass and a real pass must not look alike
- measured: a redaction shipped as a plain black box because the visual check was skipped — the render existed and was never opened. **the look IS the check.**

## .enforcement

- a hand-drawn or hand-cropped redaction = **blocker**
- a redaction not verified against the extracted text = **blocker**
- a redaction not verified visually = **blocker**
- `--style solid` without a stated reason = **nitpick**
- redaction of substantive content from a document bound for the agency that
  requires it = **blocker**

## .see also

- `rule.forbid.hand-transcription` — the twin rule: never re-type a document
- `rule.forbid.rewrite-of-signed-documents` — consult first; its detection gates this rule
- `pdf.redact` — the skill
- `pdf.transcribe` — deterministic PDF → markdown, routed per page
- `pdf.render` — render a page to PNG for the visual check
