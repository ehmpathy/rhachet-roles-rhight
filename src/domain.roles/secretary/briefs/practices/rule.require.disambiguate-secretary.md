# rule.require.disambiguate-secretary

## .what

always write a **government** secretary's office in full — "Secretary of State", "Secretary of the Treasury". bare **`secretary`** refers to this role.

## .why — the collision is real

bare "the Secretary" already names **two different offices** in this repo, inside quoted primary law that cannot be reworded:

| where | bare "the Secretary" means | source |
|-------|---------------------------|--------|
| `registrator` briefs | Delaware **Secretary of State** | 8 Del. C. §505(c) — *"fixed by the Secretary … the Secretary shall resettle"* |
| `accountant` briefs | **Secretary of the Treasury** | IRC §6001 — *"as the Secretary may from time to time prescribe"* |

a role named `secretary` makes a third — and the overload already spans two agencies whose deadlines this role tracks. an unqualified "the Secretary" in a deadline note is genuinely ambiguous.

## .how to measure it — and what a count cannot tell you

a count is evidence only with the command that produced it; corpus scope moves the answer (two scopings of this repo on one day returned 108 and 72).

```sh
# total, across BRIEFS only (excludes .demo/ transcripts and refs/*.txt bytes)
rg -c 'the Secretary' src/domain.roles --glob '**/briefs/**/*.md'

# qualified — subtract this from the total; see the lookahead warning below
rg -c 'the Secretary of State|the Secretary of the Treasury' \
   src/domain.roles --glob '**/briefs/**/*.md'
```

the count measures a **form**; the rule governs a **sense**. bare occurrences fall into three populations the raw number cannot separate:

| bare occurrence, by sense | verdict |
|---|---:|
| in this brief or `define.why-secretary` — files whose *subject is the word* | ✅ by design |
| inside a **verbatim statute quote** — e.g. `howto.substantiate-expenses` (IRC §6001, §280F), `define.why-delaware-wants-a-zero-shares-affidavit` (§505(c), §503(i)) | ✅ the exception stated below |
| the brief's own prose in a **single-jurisdiction** file, after a qualified antecedent | 🟡 nitpick, context resolves it |

⇒ the useful search is a bare "the Secretary" in prose, in a file that spans **both** offices — a DE-franchise brief that also cites the IRC, or vice versa. no count of the bare form surfaces it; read those files.

## ⚠️ the check that does NOT work

```sh
# 🚫 SILENTLY returns 0 matches — ripgrep's Rust regex has NO lookahead
rg 'the Secretary(?! of State)'
```

ripgrep does not error on an unsupported lookahead; it matches none of the lines. a "0 bare occurrences" result is a **false negative**, not a clean bill of health — measured: a first pass at this rule reported zero this way. count all occurrences and subtract the qualified ones.

## .the rule

| you mean | write |
|----------|-------|
| the Delaware official who holds the corporate registry | **Secretary of State** |
| the federal official the IRC delegates to | **Secretary of the Treasury** |
| this role | `secretary` (lowercase, code-styled) |

### the one exception: quoted statute

a quotation from primary law is **verbatim** — §505(c) says "the Secretary" and it stays that way. per `rule.forbid.hand-transcription`, a reworded quote is a corrupted quote. disambiguate **outside** the quote:

> ✅ 8 Del. C. §505(c) — *"the Secretary shall resettle"* (the Delaware
> **Secretary of State**)
>
> 🚫 8 Del. C. §505(c) — *"the Secretary of State shall resettle"*

## .why a convention is enough here

the ambiguity is confined to **prose**. at the command line the namespace is unambiguous (`rhx secretary.deadline.list`), and the lowercase role slug differs from the proper-noun offices. the cost is a reader's pause in a brief, not a misroute — a convention problem, not a rename problem.

## .enforcement

- a bare "the Secretary" in new prose, outside a quotation = **nitpick**
- a bare "the Secretary" in a **deadline** or **filing instruction** = **blocker**
  (this is where a misread costs a filing)
- an edited quotation of primary law = **blocker**

## .see also

- `define.why-secretary.[philosophy]` — the etymology, and why the record-keeper
  sense (c. 1400) predates the Secretary-of-State sense (1590s)
- `rule.forbid.hand-transcription` — why the quote stays verbatim
