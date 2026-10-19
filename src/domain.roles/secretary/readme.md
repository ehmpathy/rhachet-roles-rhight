## 🗂️ secretary

- **scale**: entity-level, the corporate record
- **focus**: the minute book, the deadline calendar, document production, certified copies
- **maximizes**: filings that go out **on time**, and records that prove what happened

used to produce the documents an entity signs, keep the record of what it did,
and — most of all — **never miss a statutory deadline again**.

### 🎯 the duty that justifies this role

> "**Ensuring that statutory forms are completed and filed on time** in the
> Companies Registration Office"
>
> — [Wikipedia, *Company secretary*](https://en.wikipedia.org/wiki/Company_secretary)

that duty is the whole role, and its absence is expensive:

- in Delaware, a franchise tax unpaid — or a complete annual report not filed — **for 1 year** voids the charter by operation of 8 Del. C. §510
  - the section's own title: *"Failure to pay tax or file a complete annual report **for 1 year**"*
  - §510 makes a **November 30 notice mandatory** (*"the Secretary of State **shall notify**"*) and grants that office an express **good-cause extension**
  - trigger, notice, and extension, quoted whole: `registrator/…/delaware.franchise.tax.delinquency.md`
- every downstream cost (the assessment, the reinstatement fee, the back returns, the lost good-standing certificate) descends from one missed calendar entry
- ⚠️ the franchise tax is not a single Mar 1 date. **8 Del. C. §504(a)** moves it to **40% Jun 1 · 20% Sep 1 · 20% Dec 1 · 20% Mar 1 after** once the year's estimated liability reaches **$5,000** — a corporation that calendars March 1 alone has missed **three** due dates and accrued §504(c) interest on each. a 10M-share charter can be billed **$85,165**, seventeen times the trigger
  - the schedule: `registrator/…/delaware.franchise.tax.[howto].renew.md` § *⚠️ March 1 is the whole answer only BELOW $5,000* · the per-installment accrual: `rhx franchise.tax.delaware.accrue`

a role that held only the calendar would pay for itself.

### 📋 what it holds

| duty | what it looks like here |
|------|-------------------------|
| **the calendar** | annual report **Mar 1** (§502) · franchise tax ⚠️ **Mar 1 only below $5,000** (§504(a)) · 1120 due dates · registered-agent renewal |
| **document production** | letterhead, rendered signatures, a signature placed onto a PDF |
| **the record** | minutes, resolutions, certified copies |

the **stock ledger is not held here** — it lives at `registrator/briefs/incorporation/variant=c-corp/define.stock-ledger.md`. vanish test: a nonprofit has a secretary and has no stock ledger, so the artifact belongs to the role that owns the entity type (`rule.require.bounded-roles`).

### 🚫 the boundary with `notary`

document **production** lives here. **witnessing** lives with `notary`. the split is load-bearing:

> a typed-name-in-cursive signature is valid for ordinary e-signature under
> ESIGN/UETA, and is **forbidden** on a document that needs a jurat. an affidavit
> must be signed in wet ink, in the notary's presence, *after* the oath.

to file the signature generator under `notary` would shelve the one instrument you must never use for notarization inside the role named for notarization.

| you want to... | role |
|----------------|------|
| render a signature, brand a document, track a deadline | `secretary` |
| know if this needs a jurat, and who can administer it | `notary` |
| file the form the deadline points at | `registrator` |
| know whether a sworn statement is the right instrument at all | ⛔ **no role** — see below |

⛔ **"is a sworn statement the right instrument here?" is a legal question, and no role in this repo answers it.** the notary cannot either, by law:

> "a notary may not give legal advice or draft legal papers"
> — [NYC DCA, *Notario Publico*](https://www.nyc.gov/assets/dca/downloads/pdf/consumers/Consumers-Notario-Publico.pdf)

take it to a licensed attorney. every brief in this repo carries *"⚠️ not legal advice"* for the same reason.

### ⚠️ the name collides — write the government office in full

bare "the Secretary" already means two different offices inside quoted primary law in this repo (Delaware Secretary of State; Secretary of the Treasury). the convention that resolves it: `briefs/practices/rule.require.disambiguate-secretary.md`.

### .see also

- `define.why-secretary.[philosophy]` — why this name, and not `scrivener`
- `notary` — the external, public counterpart
- `registrator` — the filings whose deadlines this role tracks
