# rule.forbid.hand-transcription

## .what

never transcribe a document by hand (i.e., read it and re-type its contents). always transcribe via a deterministic skill.

## .why

hand transcription routes source data through a fallible re-type step and risks **corruption**:

- transposed digits ($1,250 → $1,205, an illustrative pair)
- mislabeled fields (a value placed on the wrong line)
- silent "cleanup" of values
- hallucinated but plausible-looking figures

for a transcriber, **fidelity is the whole job**. a hand transcription *looks* authoritative (clean tables) yet carries no guarantee it matches the source. that is the worst failure mode: confident and wrong.

> we must always be right. never risk. a document transcription that might be wrong is worse than none.

## .the rule

| source | how to transcribe |
|--------|-------------------|
| **any PDF** | **`pdf.transcribe`** — checks every page and routes each one |
| a PDF you want to guarantee was never OCR'd | `pdf.transcribe --via textual` (fails loud on an image page rather than emit a blank) |
| a PDF you want fully OCR'd regardless | `pdf.transcribe --via optical` |
| any document | a deterministic skill — **never** by hand |

### ⚠️ ask the question PER PAGE, not per file

a whole-file check — *"does this PDF have a text layer?"* — is the trap. real documents are mixed:

- a DE-certified certificate of incorporation is a **text cover sheet** in front of **scanned** body pages
- a brief is digital with a scanned exhibit
- a return is digital until someone faxes an attachment into it

on such a file the whole-file check answers **yes**, every page gets text extraction, and the scanned pages come back **empty at exit 0** — which reads as *"blank"* rather than *"never examined."* measured: SANDPINE's certificate of incorporation returned Delaware's certification on page 1 and empty pages 2-4 — the operative body looked blank.

`pdf.transcribe` asks per page, so an empty page is either genuinely blank or OCR'd, never unexamined. run `--mode plan` first to see the routing and the OCR page count before anything is spent.

## .what counts as forbidden

- a re-type of a PDF's values into a markdown table
- a "summary" of a document's figures from memory or from a glance
- any transcription artifact produced by an LLM re-type rather than a tool extract

## .the artifact of record

the **deterministic extract is the artifact of record**. a human-readable summary is only a *derived convenience* — it must:

1. be generated from (or verified against) the deterministic extract, and
2. never be treated as the source of truth.

if a cleaner summary is wanted, derive it from the deterministic output — do not re-type from the original.

## .enforcement

- a hand-typed transcription of a document = **blocker**
- a summary presented as authoritative without a deterministic extract behind it = **blocker**

## .see also

- `pdf.transcribe` — the dispatcher; routes each page to the method it needs
- `pdf.transcribe.via.textual` — deterministic, offline, pdftotext
- `pdf.transcribe.via.optical` — OCR via Google Cloud Vision
- `pdf.render` — render a page to PNG so a human can LOOK at it (never to read values off)
- `pdf.redact` — mask PII, deterministically
- `rule.require.deterministic-redaction` — the redaction twin of this rule
