# rule.require.comms-filename-facets

## .what

every communication record is named with **faceted key=value segments**:

```
$n.comms.on=$date.mech=$mech.subj=$slug.grain=$grain.md
```

| facet | values | example |
|-------|--------|---------|
| `$n` | the route step it belongs to | `3` |
| `comms` | the literal artifact kind | `comms` |
| `on=` | the date of the act, **ISO** | `on=2026-07-20` |
| `mech=` | the mechanism | `mech=email` · `mech=phone` · `mech=mail` · `mech=portal` · `mech=inperson` |
| `subj=` | a short kebab slug for the topic | `subj=1120-signed` |
| `grain=` | `draft` or `final` | `grain=final` |

worked:

```
3.comms.on=2026-07-20.mech=email.subj=1120-signed.grain=draft.md
3.comms.on=2026-07-20.mech=email.subj=1120-signed.grain=final.md
3.comms.on=2026-08-04.mech=phone.subj=apv-recalc-round3.grain=draft.md
```

## .why the facets, rather than prose names

| prose | faceted |
|-------|---------|
| `3.email.clerk.yield.md` | `3.comms.on=2026-07-16.mech=email.subj=1120-signed.grain=final.md` |

the prose name loses **the date** — the fact every follow-up clock depends on — and a recipient's name is unstable (people leave) and a dox hazard in a published repo.

the faceted name gains four properties:

1. **the date is in the name.** an `ls` is a chronology; an 18-day gap shows with no file open.
2. **the facets are grep-able.** `mech=phone` finds every call; `grain=draft` finds every plan that may never have run; `on=2026-08` scopes a month.
3. **draft and final sort adjacent — when they share an `on=` date.** `draft` < `final`, but `grain=` is the **last** segment, so it breaks a tie only after `on=`, `mech=`, and `subj=` all match — see below.
4. **it is machine-parseable.** a `k=v` segment list splits into a record with no regex per name shape.

### ⚠️ a draft SENT LATER does not sort beside its final

`on=` sorts first, so a draft composed one day and sent another lands wherever its own date puts it:

```
3.comms.on=2026-07-20.…subj=1120-signed.grain=draft.md         ┐ same on=
3.comms.on=2026-07-20.…subj=1120-signed.grain=final.md         ┘ adjacent ✅
3.comms.on=2026-08-04.…subj=shares-attestation.grain=draft.md  ┐ 3 days apart,
   … other files sort between them …                           │ other files
3.comms.on=2026-08-07.…subj=shares-attestation.grain=final.md  ┘ between   ⛔
```

- ⛔ do not re-date the draft to the send date. its date records when it was composed, and the gap is itself a record of how long it sat
- a `subj=` slug **stable across the thread** re-unites the pair: `rg 'subj=shares-attestation'` returns both, in date order
- ⇒ the retrieval unit for a thread is the `subj=` grep; the sort is a chronology

## 🎯 `comms` covers EVERY mechanism, not just email

a matter is one conversation across whatever channels the other side accepts. name phone records `3.call.*` and email `3.email.*` and a lexical sort splits it into two interleaved piles; put all under `comms` with `mech=` and the sort is **chronological**.

> measured: an agency refused email for substance and phone for document delivery, so the record alternates phone, email, phone, email. under `comms.on=` that alternation is legible at a glance.

## .the slug

`subj=` is a short kebab slug for **the topic**, not a copy of the subject line.

| rule | why |
|------|-----|
| kebab-case, 2–4 words | it is a filename segment, not a sentence |
| stable across a thread | the 7/16 and 8/3 sends share `subj=1120-signed` because they are the same delivery; `on=` distinguishes them |
| no file numbers, account numbers, or personal names | a filename is the least-redactable part of a repo |
| name the artifact or the ask | `1120-signed`, `apv-recalc`, `revival-cert` |

for a phone call the slug names the **purpose**, not the callee: `apv-recalc-specialist`, not the specialist's first name.

## .the pattern generalizes

```
$n.$kind.on=$date.[facets].grain=draft|final.md
```

| kind | extra facets | example |
|------|--------------|---------|
| `comms` | `mech=`, `subj=` | `3.comms.on=2026-07-20.mech=email.subj=1120-signed.grain=final.md` |
| `submit` | `to=`, `form=` | `4.submit.on=2026-08-12.to=de-doc.form=revival.grain=final.md` |
| `calc` | `of=` | `1.calc.on=2026-03-23.of=franchise-tax.grain=final.md` |

do not invent a new grammar per kind. add a facet.

## ⚠️ the `grain` facet is what makes the rule bite

`grain=draft` and `grain=final` are **two files, always**, per `rule.require.permanent-yields`. an absent `grain=final` shows up in an `ls`; an absent yield inside a prose-named file does not.

- the tell: a `grain=draft` file with live results filled into it — a draft that carries a final's payload
- measured: a call plan named `*.round2.compose.md` carried its own outcome grid for three weeks unnoticed; renamed to `grain=draft`, the defect is legible from `ls`

## .enforcement

- a comms record named without the facet pattern = **blocker**
- a `mech=`-less comms record = **blocker**
- a relative or absent `on=` date = **blocker**
- a personal name, file number, or account number in `subj=` = **blocker**
- a `grain=draft` file that carries outcomes = **blocker**
- a per-kind grammar invented instead of a new facet = **nitpick**

## .see also

- `rule.require.permanent-yields` — *what* must be recorded, and the status banner inside each file
- `rule.forbid.baggage` — what belongs in the message itself
- `rule.require.crisp` — how the message is written
