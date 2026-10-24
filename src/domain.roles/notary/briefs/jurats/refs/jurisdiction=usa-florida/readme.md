# refs — jurisdiction=usa-florida

## .what

the **exact bytes** of every first-party source the Florida jurat inventory
cites, committed beside the brief that cites them.

each artifact is named by the date it **took effect**, not the date it was
pulled:

```
effectiveAt=<ISO>.<publisher>.<slug>.pdf
effectiveAt=<ISO>.<publisher>.<slug>.txt
```

## .why the bytes are here at all

a `.gov` url rots. every citation in a jurat brief points at a host that can
move a path, retire a page, or put a captcha in front of it — and when that
happens the brief keeps its claim and loses its evidence.

⚠️ **this departs from the repo default.** `rule.require.bhrowser-citations`
says raw pulls stay uncommitted: large, re-pullable, and the npm package should
stay lean. that default is overridden here on three grounds:

1. these are **small** government forms, not a corpus (~2 MB total)
2. they are **public record** — no PII, safe for a published role
3. the whole value of a jurat brief is that it prints the **correct
   certificate**. a claim about a form, with a dead link where the form should
   be, is the exact failure this role exists to prevent

## 🎯 why `effectiveAt=` and not the pull date

a notarial form is correct only for a **window of time**, and this whole
directory exists because of one question that came down to which side of
**2020-01-01** a document sat on:

> Supreme Court form 12.901(b)(1), rev **02/18**, prints a jurat with ONE date
> blank and NO ☐ physical-presence / ☐ online-notarization checkbox. is that
> form **stale**, or does Florida practice **tolerate** the departure?

opposite consequences. a pull date cannot answer it; an effective date can. so
the date is in the filename, visible from an `ls`, and a future reader cannot
cite a superseded form by accident.

## .the set

| artifact | publisher | what it settles |
|---|---|---|
| `effectiveAt=2020-01-01.dos.sample-notarial-statements` | FL Dept of State | ⭐ **decisive.** the state's own printed certificates, captioned "as of January 1, 2020". prints the jurat **with** the checkbox and the three-part date |
| `effectiveAt=2019-12-17.eog.governors-notary-reference-manual` | Executive Office of the Governor | the manual from the office that **commissions** Florida notaries — what a notary was **taught**. dated two weeks before the amendment took effect, so it is a valid control |
| `effectiveAt=2020-01-01.law.ch-2019-071` | Laws of Florida | the RON session law that added §117.05(4)(c) and the checkbox. its effective date is the hinge |
| `effectiveAt=2018-02-01.flcourts.form-12.901b1` | FL Supreme Court | 🚩 **the counter-example, kept on purpose.** the 02/18 form whose jurat diverges. retained so a reader can see the divergence rather than take the brief's word |

## ✅ the answer

**the 02/18 court form is STALE.** two independent post-amendment agency
publications both print the long form with the checkbox. no tolerance doctrine
is in play; the court form simply was never revised.

## 🚩 two defects found IN the state's own material

these are recorded because a reader who copies a state page verbatim would
inherit them.

**1. a doubled phrase, in BOTH publications, identically:**

```
this (numeric date) this (numeric date) day of (month), (year)
```

the phrase `(numeric date)` prints twice. it appears in the Governor's Manual
at the oath-or-affirmation certificate and on the DOS samples page, character
for character — which means one was copied from the other, and the defect rode
along. **do not replicate it.** the statute has it once.

**2. the two publications disagree on the printed-name caption:**

| publication | caption |
|---|---|
| EOG Manual, and §117.05(13)(a) | `(Print, Type, or Stamp Commissioned Name of Notary Public)` |
| DOS samples page | `(Name of Notary Typed, Printed, or Stamped)` |

⭐ **follow the statute.** §117.05(13)(a) is the operative text; the manual
matches it; the DOS page paraphrases. a paraphrase on an agency page does not
amend a statute.

> ⚠️ **the general lesson.** an agency page is first-party, which makes it
> **evidence**, not **authority**. where a page and the statute diverge, the
> statute governs — and where two pages from the same state diverge, at least
> one of them is wrong. one agency page is a data point; two that agree is a
> result; two that disagree is a question.

## 🚩 what the court forms could NOT settle, and why

the first pass tried to answer stale-vs-tolerated with a post-2019 court form,
on the reasonable theory that a form revised after the amendment would show
whether the checkbox was adopted.

**there is no such form.** every Florida court form we pulled that was revised
after 2019 — 12.902(k) and 12.902(l), both rev **10/23** — carries **no jurat
at all**. they moved to a §92.525 unsworn declaration:

```
Under penalties of perjury, I declare that I have read this document
and the facts stated in it are true.
```

12.902(l) does this **despite the word "Affidavit" in its own title**.

so the control document does not exist in that corpus, and no further court
form will produce one. that is a dead end walked to its end, not a search
abandoned — and it is why the agency publications were needed.

## .how to re-pull

the playbooks that produced this directory live beside the briefs and are the
reproducer:

| playbook | hop |
|---|---|
| `../../refs/florida-notary-manual.research.play.ts` | walk the agencies' own navigation |
| `../../refs/florida-notary-manual.fetch.play.ts` | read the pages the walk named |
| `../../refs/florida-notary-manual.pdf.play.ts` | fetch these bytes into this directory |
| `../../refs/florida-jurat-examples.*.play.ts` | the court-form corpus, incl. the dead end |

```sh
rhx browser.start --mode HEADFUL --session notary
rhx browser.action --session notary --play '<ABSOLUTE path to a playbook>'
rhx browser.stop --session notary

for f in *.pdf; do pdftotext -layout "$f" "${f%.pdf}.txt"; done
```

⚠️ **`--play` needs an ABSOLUTE path.** a repo-relative one is read as a module
specifier and fails with `Cannot find package 'src'`, which reads like a broken
dependency rather than a bad path.

## .the `.txt` files are the artifact of record

quotes come from the `pdftotext -layout` extract, never from a re-type off a
render — per `rule.forbid.hand-transcription`. the `.pdf` is what a human
opens; the `.txt` is what a citation is drawn from.

## .see also

- `../../inventory.of=jurat.jurisdiction=usa-florida.md` — the brief these back
- `../../compare.jurat-forms-across-jurisdictions.md` — the cross-state grid
- `rule.require.bhrowser-citations` — the default this directory overrides,
  and the reasons the override is narrow
