# rule.require.one-card-per-tally

## .what

a statement tally is scoped to **one account**, by default. every parser must
emit the account the statement belongs to, and every tally must refuse a
folder that holds more than one — unless a human deliberately says the mix is
intended.

## .why — reconciliation CANNOT catch the wrong card

a tally already checks itself against the issuer's printed total, which catches
a dropped row, a mis-parsed amount, a header read as a transaction. it catches
**none** of this:

> a **personal** card, from the **same issuer**, in the **same layout**,
> parses perfectly, reconciles to the penny, and adds its entire balance to
> the business deduction.

every guard passes, and the return is wrong by the whole amount of somebody's
groceries.

| the check asks | it catches |
|----------------|-----------|
| reconciliation | "was this statement read **correctly**?" |
| the vendor map | "do we know **what** this charge was for?" |
| the account guard | "**whose card** is this?" |

the first two are questions about the statement. only the third is a question
about the **taxpayer**, and it is the only one whose answer changes who owes
what.

## ⛔ the error is not a small slip — it is a disallowed deduction

> "Except as otherwise expressly provided in this chapter, **no deduction
> shall be allowed for personal, living, or family expenses**."
>
> — [26 U.S.C. § 262(a)](https://www.law.cornell.edu/uscode/text/26/262)

- no materiality threshold, no de-minimis: a personal charge is a deduction that was never available
- an examiner finds it **easily** — the card number is on every page of the statement produced under `howto.substantiate-expenses`

## .the rule

| layer | must |
|-------|------|
| the **format declaration** | name the line that carries the account (`FMT_ACCOUNT`) |
| the **parser** | refuse a format that declares no account line |
| the **parser** | refuse a statement whose account line is absent |
| the **parser** | emit the account as a row, so downstream can read it |
| the **tally** | refuse a folder that holds >1 account, and name each one |
| the **tally** | print the card on the report, and in the summary |

a tally that cannot name its card must **block**, never fall through to a
figure.

## 🎯 the safe path is the BARE invocation

the pit of success here is that a single-card folder needs no flag at all:

```sh
# one card in the folder — just works
rhx statement.tally --from ./statements

# two cards — blocked, with both named and both exits offered
rhx statement.tally --from ./statements
#   └─ blocked: 2 different cards here — a tally is one card by default
#      1-00007
#        · 2023-06-corp.md
#      6-44000
#        · 2023-06-personal.md
#
#      pick one:
#        --account ID       tally only that card, refuse the rest
#        --accounts mixed   affirm every card here is a CORPORATE card

# pin one card; every other statement is refused by name
rhx statement.tally --from ./statements --account 1-00007

# affirm the mix — use ONLY when the second card is genuinely corporate
rhx statement.tally --from ./statements --accounts mixed
```

the mixed path costs a deliberate flag. that asymmetry is the design: the
common case is free and safe, and the dangerous case requires a human to say
so out loud.

## ⚠️ the traps found while this was built

### 1. ignore the separators, or the guard fails on a typo

a statement prints `1-00007`; a human recalls `100007`. strip whitespace and
dashes on **both** sides, with one shared transform so the parser and the tally
cannot drift apart.

### 2. do NOT push the account filter down into the parser

a tally that shells out to a parser treats a non-zero exit as "skip this file."
push `--account` down and a stranger's card is **silently skipped** — a clean
success over a folder quietly narrowed. parse them all; refuse at the tally, by
name.

### 3. a metadata row defeats an emptiness guard

measured: the `account` row made `rows` non-empty for a statement with **zero
transactions**, so the "no rows found → block" failfast went silent and a less
specific guard caught the case — the test passed against the wrong message.

count the rows you actually mean: an emptiness guard must exclude metadata rows.

### 4. anchor on the ACCOUNT line, not the CARD line

an issuer may print both an account identifier in the page header and a
per-cardholder identifier above each charge block. on a multi-cardholder
account those differ. a regex that matched either would report whichever
appeared first — a coin flip on the one field this whole guard depends on.

## 🎯 name the card ON the report, not only in the flag

the card is the one fact a reader cannot recover from the totals. printed, it
checks against the corporate card in ten seconds; absent, it cannot be checked
at all. so it belongs on the face of the artifact:

```md
source: `./statements`
card: `1-00007`
```

and when `--accounts mixed` was used, it stays **plural** on purpose, so a
mixed report announces the mix rather than hides it.

## .enforcement

- a statement format with no account-line declaration = **blocker**
- a parser that emits a tally-ready row set without the account = **blocker**
- a tally that sums across >1 account with no explicit affirmation = **blocker**
- an account filter pushed down into a per-file parser, where a refusal
  becomes a skip = **blocker**
- a report that prints figures but never names the card = **blocker**
- a byte-exact account comparison that a dash defeats = **nitpick**

## .provenance

§ 262(a) was pulled with **bhrowser**, headful, from two independent
publishers, and the operative sentence was compared by an **equality test**
rather than by eye:

| source | chars | result |
|--------|------:|--------|
| [Cornell LII](https://www.law.cornell.edu/uscode/text/26/262) | 1,179 | needle found |
| [govinfo, 2023 edition](https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleA-chap1-subchapB-partIX-sec262.htm) | 1,457 | needle found |
| programmatic comparison | — | **`agree: true`** |

- the Cornell pull (1,179 chars) is under the ~2,000 threshold; inspected, it is the complete section — (a), (b), and the source credit
- `uscode.house.gov`'s `granuleid:USC-prelim-title26-section262` url redirects to `/docnotfound.xhtml` (128 chars): a dead url, not a divergent text
- `law.cornell.edu` never settles under `networkidle` (an ad socket stays warm); use `domcontentloaded` plus an explicit settle

the playbooks are committed and re-runnable:

- `briefs/refs/irc-262-personal-expenses.pull.play.ts` — the equality test
- `briefs/refs/irc-262-personal-expenses.inspect.play.ts` — the full-body read
  that cleared the short-pull flag

## .see also

- `define.why-expenses-are-deductible.[philosophy]` — § 162's
  "ordinary and necessary" test for a cost of the business's income, the
  positive standard whose boundary this rule guards
- `catalog.non-deductible-expenses` — the practical what-does-not list
- `howto.substantiate-expenses` — why the card number is printed on every page
  of the record an examiner will ask for
- `rule.forbid.hand-computed-figures` — the twin: this rule protects the
  *scope* of a figure, that one protects its *arithmetic*
- `skills/statement.parse` — emits the account row, refuses a format without one
- `skills/statement.tally` — the cross-statement guard, and the two exits
