# define.why-secretary

## .what

the origin of the word **secretary**, the office it names, and why this role
carries that name rather than `scrivener`, `signer`, `certifier`, or `guarantor`.

## .the etymology

> **secretary (n.)**
>
> "late 14c., *secretarie*, 'person entrusted with secrets or private and
> confidential matters' (a sense now obsolete), from Medieval Latin
> *secretarius* '**clerk, notary, scribe; confidential officer, confidant**,' a
> title applied to various confidential officers, noun use of an adjective
> meaning 'private, secret, pertaining to private or secret matters' … from
> Latin *secretum* 'a secret, a hidden thing'"
>
> — [Etymonline, *secretary*](https://www.etymonline.com/word/secretary)

one layer down:

> "*secretus* 'set apart, withdrawn; hidden, concealed, private.' This is a
> past-participle adjective from **secernere** 'to set apart, part, divide;
> exclude,' from *se-* 'without, apart' … + *cernere* 'to separate' (from PIE
> root **\*krei-** 'to sieve,' thus '**discriminate, distinguish**')."
>
> — [Etymonline, *secret*](https://www.etymonline.com/word/secretary)

the word bottoms out at ***to sieve* — to separate, to distinguish**. a
secretary *sets things apart*: the material from the immaterial, the filed from
the unfiled, the due from the not-yet-due — a better description of the work
than "assistant".

## 📅 the record-keeper sense is the ORIGINAL one

| year | sense |
|------|-------|
| late 14c. | one entrusted with confidential matters |
| **c. 1400** | "**person who keeps records or minutes, conducts correspondence**, etc., one whose office is to write for another," originally for a king |
| 1570s | a type of handwriting used on old legal documents |
| **1590s** | "title of ministers presiding over **executive departments of state**" |
| 1811 | *secretariat*, "office or official position of a secretary" |

— all dates from [Etymonline](https://www.etymonline.com/word/secretary)

the record-keeper sense (c. 1400) predates the Secretary-of-State sense (1590s)
by roughly 190 years. the office of state borrowed the word; this role holds the
older one.

## 🚫 the name collision, and the rule that resolves it

in this repo, bare "the Secretary" already means **two different offices**,
inside quoted primary law that cannot be reworded:

| where | bare "the Secretary" means | source |
|-------|---------------------------|--------|
| `registrator` briefs | Delaware **Secretary of State** | 8 Del. C. §505(c) — *"fixed by the Secretary … the Secretary shall resettle"* |
| `accountant` briefs | **Secretary of the Treasury** | IRC §6001 — *"as the Secretary may from time to time prescribe"* |

a role named `secretary` makes a third. the ambiguity is confined to prose — no
one types `rhx secretary.deadline.list` and thinks *Delaware Secretary of
State* — so a convention suffices:

> ✅ **always write the government office in full**: "Secretary of State",
> "Secretary of the Treasury".
> ✅ bare **`secretary`** refers to this role.

see `rule.require.disambiguate-secretary`.

## 🖋️ secretary vs notary — the roots split cleanly

| role | from | literally | authority rests on |
|------|------|-----------|--------------------|
| **notary** | Latin *notarius* ← *notare* "to note" ← *nota* "shorthand character" | one who **marks** | **the record** — a mark made by a commissioned officer |
| **secretary** | Latin *secretarius* ← *secretum* ← *secernere* "to set apart" | one who is **trusted apart** | **the trust** — an officer inside the entity |

> **notary (n.)** — "c. 1300, *notarie*, 'a clerk, a personal secretary; person
> whose vocation was making notes or memoranda of the acts of others…who wished
> to preserve them, and writing up deeds and contracts,' from Old French
> *notarie* 'scribe, clerk, secretary' and directly from Latin *notarius*
> 'shorthand writer, clerk, secretary'"
>
> — [Etymonline, *notary*](https://www.etymonline.com/word/secretary)

Medieval Latin *secretarius* was itself glossed "clerk, **notary**, scribe." the
offices split as the notary became a **public** officer (commissioned, impartial,
external) and the secretary stayed a **private** one (appointed by the entity,
partial to it, internal). this repo draws the same boundary:

- the **notary** witnesses from outside → jurat, acknowledgment, seal, journal
- the **secretary** attests from inside → minute book, resolutions, certified
  copies, the corporate seal, the calendar

⚠️ the stock ledger is **not** on that list. it is `registrator`'s — see
`registrator/briefs/incorporation/variant=c-corp/define.stock-ledger.md` and the
worked example in `rule.require.bounded-roles`.

## .the modern office is not clerical

> "A company secretary occupies a senior position in the corporate governance
> of an organization … The company secretary serves as a guardian of
> compliance, a facilitator of communication between the board of directors and
> other stakeholders, and a **custodian of corporate records**."
>
> "**Despite the name, the role is not clerical or secretarial.**"
>
> — [Wikipedia, *Company secretary*](https://en.wikipedia.org/wiki/Company_secretary)

in the US it is the **Corporate Secretary**, scoped by state corporation law:

> "The role of the corporate secretary is governed by state corporation law in
> the United States and is commonly, but not exclusively, responsible for the
> following: Board and Committee Meetings · Minutes of Meetings · Annual Meeting
> of Shareholders including the Proxy Statement · **Corporate Records** ·
> Subsidiary Management · **Stock Transfers and Dividends** · Securities Market
> Listings … · **Compliance with Federal and State Governance Laws**"
>
> — [Wikipedia, *Company secretary*](https://en.wikipedia.org/wiki/Company_secretary)

"Stock Transfers and Dividends" describes **the real-world office**. which role
owns the **brief** is a separate question, settled by the presupposition chain:

```
a stock ledger      presupposes  stock
stock               presupposes  a stock corporation
a stock corporation presupposes  an entity-type choice at registration
                                 └─ registrator
```

so the office touches transfers, and the definitional artifact — what a ledger
is, the §219(c) fields, the §224 forms — lives with `registrator`; this role gets
a pointer (`rule.require.bounded-roles`). a job description cannot settle a
domain boundary.

## 🎯 the duty that justifies this role

> "**Ensuring that statutory forms are completed and filed on time** in the
> Companies Registration Office"
>
> — [Wikipedia, *Company secretary*](https://en.wikipedia.org/wiki/Company_secretary)

in Delaware, a franchise tax unpaid — or a complete annual report not filed —
**for 1 year** voids the charter by operation of 8 Del. C. §510. every
downstream cost (the assessment, the reinstatement fee, the back returns, the
lost certificate of good standing) descends from one missed calendar entry.

| a common gloss says | §510 says |
|---|---|
| two consecutive years | **1 year** — and the report prong carries **no duration at all** |
| no notice | *"On or before November 30 in each year, the Secretary of State **shall notify**"* — mandatory, with a **March 1** cure date |
| no discretion | *"**unless the Secretary of State, for good cause shown, shall have given further time**"* |

- `two years` / `2 years` / `consecutive` return **0** hits across ch. 5; the phrase comes from a registered agent's page, not the statute
- a quote that begins at *"the charter … shall be void"* drops the antecedent — who, on what trigger, after how long. see `registrator/…/delaware.franchise.tax.delinquency.md`, which quotes the operative sentence whole

no other role holds that date. `registrator` knows *how* to file; this role
knows *when* the clock runs out.

## .why not the alternatives

| candidate | why not |
|-----------|---------|
| **scrivener** | precise (Latin *scriba*, one who drafts and engrosses) and collision-free — but it covers **drafting only**. it cannot hold a deadline calendar or a minute book. optimizes naming purity at the cost of the useful scope |
| **signer** | in a notarization, "the signer" is the **principal** whose identity is verified. collides head-on with the `notary` role |
| **certifier** | certification is a **sub-function**, and it is the notary's core act. blurs the boundary the two roles exist to draw |
| **guarantor** | a hard legal term for one who promises to answer for another's debt. actively wrong in a repo that reasons about corporate liability |
| **recognizer** | *recognizance* is a bond to appear in court; and the word reads as pattern-match |

## .sources

pulled with bhrowser on **2026-08-07**, per `rule.require.bhrowser-citations`.

| source | url | chars |
|--------|-----|------:|
| Etymonline — *secretary* (carries the *secret*, *secretaire*, *secretariat*, and *notary* entries inline under "Entries linking to secretary") | https://www.etymonline.com/word/secretary | 6,339 |
| Etymonline — *secrete* | https://www.etymonline.com/word/secrete | 4,748 |
| Wikipedia — *Secretary* | https://en.wikipedia.org/wiki/Secretary | 25,791 |
| Wikipedia — *Company secretary* | https://en.wikipedia.org/wiki/Company_secretary | 17,663 |

### two sources did NOT come through

| source | outcome |
|--------|---------|
| Etymonline — *secret* (standalone page) | ❌ `page.goto` timeout at 45s. the entry text is quoted from the *secretary* page, which renders it inline under "Entries linking to secretary" |
| Merriam-Webster — *secretary* | ❌ `page.goto` timeout at 45s. **not cited anywhere in this brief** |

### ⚠️ the playbook is not yet re-runnable by others

the pull ran from `.play/secretary-etymology/pull.sources.play.ts`, which
`.gitignore` excludes — so it is absent from git and the npm package. the quotes
stand (per-source character counts above); only the re-run is unavailable.

the cure is a move, to match the tracked `*.play.ts` siblings under each role's
`briefs/refs/`:

```
.play/secretary-etymology/pull.sources.play.ts
  -> src/domain.roles/secretary/briefs/refs/secretary-etymology.pull.play.ts
```

## .see also

- `rule.require.disambiguate-secretary` — the naming convention this brief argues for
- `notary` role — the external, public counterpart
- `registrator` — the filings whose deadlines this role tracks
