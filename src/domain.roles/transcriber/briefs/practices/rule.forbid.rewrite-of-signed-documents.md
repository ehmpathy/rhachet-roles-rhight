# rule.forbid.rewrite-of-signed-documents

## .what

never rewrite the bytes of a cryptographically signed document. **detect the signature before any transform**, and when one is present, refuse.

a signed PDF's bytes **are** the evidence. change one and the evidence is gone — while the document still looks perfect.

## .why — this rule exists because our OWN tools are the hazard

the sibling rules each forbid a hand operation. this one forbids a **deterministic** operation, which makes it the easy one to miss:

| the operation | what goes wrong | the rule |
|---------------|-----------------|----------|
| read a document by eye | the values corrupt | `rule.forbid.hand-transcription` |
| mask a value by hand | the mask lands wrong | `rule.require.deterministic-redaction` |
| **transform a SIGNED document with the correct tool** | **the proof is destroyed** | **this rule** |

⛔ **the two rules collide head-on.** `rule.require.deterministic-redaction` mandates `pdf.redact`, which works by **rasterization** — it destroys the text layer on purpose, the only way to guarantee the value is unextractable. on a signed document the same rasterization destroys the signature.

⇒ an operator who follows every rule in this role and reaches for `pdf.redact` on a signed original has done everything right and ruined the artifact. so detection comes **first**, before the redaction rule is consulted.

## ⚠️ the failure is SILENT in the worst direction

no crash, no corrupt file, no error.

| what a reader sees | what is true |
|---|---|
| the page renders perfectly | ✅ |
| the seal image is there | ✅ |
| the notary's signature is there | ✅ |
| the commission number and expiration are legible | ✅ |
| **the cryptographic signature validates** | ⛔ **no** |

the defect is visible **only** in a viewer's signature panel or the PDF's internal structure. a rewritten document gets sent, looks accepted, and is challenged later — when the proof it should carry is absent.

⛔ **it is not recoverable.** the signature belonged to a commissioned officer at a moment in time. the only cure is to **redo the act** — a second appointment, a second fee, and a second date on a document that may need the first one.

## .detect BEFORE you transform

three markers, any one sufficient:

| marker | means |
|--------|-------|
| `/ByteRange` | a byte span was hashed and signed — the load-bearing one |
| `/Adobe.PPKLite` | the standard signature handler |
| `/SubFilter` | names the signature format (e.g. `adbe.pkcs7.detached`) |

```js
const s = fs.readFileSync(pdfAt).toString('latin1');
const signed = /\/ByteRange/.test(s) || /\/Adobe\.PPKLite/.test(s);
if (signed) throw new Error('signed document — refuse to transform');
```

two further markers say **how much** is protected; neither changes the answer:

- `/DocMDP` + `/Perms` — a **certification** signature, which declares permitted modifications. its absence does **not** mean edits are safe: it means an **approval** signature, and any byte change still voids it
- `/AcroForm` — form fields. a signed form may allow field fill without a break, **but only through a signature-aware writer.** a rasterize is not that

⚠️ **the file's metadata cannot tell you.** a signed PDF from a notarization platform often carries **no** `/Producer` and **no** `/Creator`, so a metadata sniff reports empty. read for `/ByteRange`.

## 🚩 `file` will NOT warn you, and may under-report the page count

```
signed.pdf:    PDF document, version 1.7 (zip deflate encoded)
unsigned.pdf:  PDF document, version 1.4, 1 page(s)
```

the signed one reports **no page count** — its object streams are compressed. that absence is not a defect in the file, but it means **a page-count check cannot come from `file` alone** on exactly the documents where it matters most. use `pdf.render`, which reports `page: N of M` from a real parse.

## .what destroys a signature

| operation | verdict |
|-----------|---------|
| `pdf.redact` — rasterizes | ⛔ **destroys** |
| print-to-PDF, "Save As" from a viewer | ⛔ destroys |
| any compressor, optimizer, or "flatten" | ⛔ destroys |
| a merge, split, or page extraction | ⛔ destroys |
| an email client that re-encodes attachments | ⛔ destroys |
| `cp` — a byte copy | ✅ safe |
| `pdf.render` — reads, writes a **separate** PNG | ✅ safe |
| `pdf.transcribe` — reads, writes a **separate** file | ✅ safe |

the test: the safe ones **never write back to the source.**

## .verify every copy, with a byte comparison

a copy is safe by construction, but a copy can still fail (a full disk, a truncated transfer, a sync client that "optimized" it). confirm it:

```sh
diff original.pdf copy.pdf && echo "byte-identical"
```

⚠️ a checksum or a `diff` is the check. **a re-render is not** — two visually identical pages say naught about the bytes, and the rendered page is exactly what survives the damage.

## 🎯 when a signed document MUST be redacted

it cannot be. pick one of these instead, in order of preference:

1. **request a re-issue** with the redaction already applied, then signed — the only path to one document both redacted and valid
2. **send the signed original unmodified**, if the recipient is entitled to the content. an agency that requires the document usually is — see `rule.require.deterministic-redaction`'s "redact for the RECIPIENT"
3. **send two files**: the signed original, and a separately-redacted **unsigned** copy, each labeled for what it is. never let the redacted copy be mistaken for the executed one

⛔ **never** produce a redacted file that still *looks* executed — it asserts a notarial act it cannot support, worse than either honest artifact alone.

## .transmit and store the original bytes

- **store** the original beside any derived copy, named so its status is legible without a parse (`…NOTARIZED (digitally signed, do not modify)`)
- **transmit** as a file attachment, never pasted, never re-exported
- **never** route it through a tool in the destroy column "just to check something" — read it with `pdf.render` instead

## .enforcement

- a transform applied to a signed document = **blocker**
- a transform applied with no prior signature detection = **blocker**
- a redacted file that still presents as executed = **blocker**
- a copy of a signed document accepted without a byte comparison = **blocker**
- a signature "verified" by a visual render rather than a byte check = **blocker**
- a page count asserted from `file` on a signed PDF = **nitpick** (it reports none)

## .see also

- `rule.require.deterministic-redaction` — the rule this one must be consulted
  **before**, because its mandated tool is the hazard
- `rule.forbid.hand-transcription` — the first of the family: never re-type
- `rule.require.provable-pseudonymization` — the third: never hand-swap
- `pdf.render` — safe; reads, writes elsewhere
- `pdf.redact` — ⛔ destroys a signature; rasterization is its mechanism
- the `notary` role — where documents that carry these signatures come from
