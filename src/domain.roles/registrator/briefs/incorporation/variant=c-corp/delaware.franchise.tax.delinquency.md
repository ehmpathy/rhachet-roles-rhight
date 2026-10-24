# delaware.franchise.tax.delinquency

## .what

a Delaware corporation that fails to pay franchise tax faces penalties, interest, and eventually void status. this brief covers the consequences and the recovery.

---

## .timeline of consequences

| time past due | consequence | statute |
|---------------|-------------|---------|
| day 1 after a due date | $200 penalty, and interest accrues | §502(c), §504(c) |
| each month | 1.5% interest per month | §504(c) |
| **1 year** unpaid, **or** a complete annual report not filed | charter **VOID**, powers inoperative | **§510** |
| on or before **Nov 30** each year | ⭐ the Secretary of State **must notify** you | **§510** |
| the notice's cure deadline | **March 1 of the following year** | **§510** |

⚠️ **above $5,000 there is no single "day 1".** 8 Del. C. §504(a) sets **four** due dates — 40% June 1, 20% September 1, 20% December 1 of the tax year, remainder March 1 following — and §504(c) runs interest from **each**. a large delinquency starts to accrue **nine months earlier**. see `delaware.franchise.tax.[howto].renew.md` for the installment table.

### 🚨 THE "TWO YEARS IN A ROW" RULE IS NOT THE STATUTE

the common vendor sentence:

> 🚫 "A corporation that does not file and pay its annual Franchise Tax
> report for **two years in a row** will automatically be voided by the
> state."
>
> — [Harvard Business Services](https://www.delawareinc.com/blog/my-delaware-corporation-was-voided-now-what/)

⛔ **the statute says one year, in the section's own title.**

> **§ 510. Failure to pay tax or file a complete annual report for 1 year;
> charter void; extension of time.**

across all of 8 Del. C. ch. 5:

| needle | hits in ch. 5 |
|--------|--------------:|
| `two years` | **0** |
| `2 years` | **0** |
| `consecutive` | **0** |
| `1 year` | **6** |

the two-year figure is a description of the usual calendar (see *"why everyone says two years"* below), and it errs in the costly direction: it tells a reader with **one** missed year they are safe.

⚠️ the report prong carries **no duration at all**. §510 disjoins them: *"neglects or refuses **for 1 year** to pay … **or** shall neglect or refuse to file a complete annual franchise tax report."* on the face of the text a single unfiled report is a trigger.

---

## .penalties

### immediate penalties

| penalty | amount |
|---------|--------|
| late fee | $200 (flat) |
| interest | 1.5% per month on tax + penalty |

> "The penalty for non-payment or late payment is $200.00, and interest accrues on the tax and penalty at the rate of 1.5% per month."
>
> — [Delaware Division of Corporations](https://corp.delaware.gov/paytaxes/)

### example calculation

⛔ **do not derive this by hand.** the accrual has a per-installment structure (§504(a)), a per-year penalty (§502(c)), and a per-month interest run from **each** due date (§504(c)). the calculator prints every installment with its due date and month count:

```sh
rhx franchise.tax.delaware.accrue --tax 400 --years 2023 --asof 2024-03-01
```

`--fit <total>` searches for the accrual date that reproduces a bill the State issued — the way to test an assessment and learn **which tax years** it covers.

the shape below holds only for a **small** liability, where §504(a) leaves a single March 1 date:

| item | amount |
|------|--------|
| franchise tax owed | $400 |
| late penalty | $200 |
| subtotal | $600 |
| interest (6 months at 1.5%) | $54 |
| **total owed** | **$654** |

⚠️ $400 is under the $5,000 installment threshold, so this single-date accrual is **wrong for every charter large enough for the question to matter.**

---

## .void status

### what void means

⛔ **void is NOT dissolution, and the corporation does NOT cease to exist.** to get it backwards changes the answer to every tax question that follows.

§510, **the operative sentence, whole**:

> "If any corporation, accepting the Constitution of this State and coming
> under Chapter 1 of this title, or any corporation which has heretofore
> filed or may hereafter file a certificate of incorporation under said
> chapter, **neglects or refuses for 1 year to pay** the State any franchise
> tax or taxes, which has or have been, or shall be assessed against it, or
> which it is required to pay under this chapter, **or shall neglect or
> refuse to file a complete annual franchise tax report**, the charter of
> the corporation shall be **void**, and all powers conferred by law upon
> the corporation are declared **inoperative**, **unless the Secretary of
> State, for good cause shown, shall have given further time** for payment
> of the tax or taxes or the completion of an annual franchise tax report,
> in which case a certificate thereof shall be filed in the office of the
> Secretary of State stating the reason therefor. **On or before November 30
> in each year, the Secretary of State shall notify** each corporation which
> has neglected or refused to pay the franchise tax or taxes assessed
> against it or becoming due during the year or has refused or neglected to
> file a complete annual franchise tax report, that the charter of the
> corporation shall become void unless such taxes are paid and such complete
> annual franchise tax report is filed **on or before March 1 of the
> following year**."
>
> — [8 Del. C. §510](https://delcode.delaware.gov/title8/c005/index.html)

### ⛔ the antecedent carries three facts a mid-sentence quote drops

a quote that starts at *"…the charter of the corporation shall be void"* keeps the consequence and discards every condition:

| the common gloss | §510 actually says |
|---|---|
| void after **two consecutive years** | **1 year** unpaid — **or** any unfiled complete annual report, with no duration on that prong |
| **no notice** | *"the Secretary of State **shall notify**"* — mandatory, on or before **November 30** each year |
| **no discretion** | *"unless the Secretary of State, **for good cause shown**, shall have given further time"* — an express extension power |

### 🎯 why everyone says "two years"

the vendor sentence describes the **usual timeline** that the notice mechanism produces:

```
Mar 1, year N     report + tax due, missed
Nov 30, year N    the Secretary of State must send the §510 notice
Mar 1, year N+1   the notice's cure deadline passes -> charter void
```

two March 1sts elapse — an **observation about the calendar**, not the rule. it fails wherever the calendar differs:

- the good-cause extension can move it **later**
- the unqualified report prong can, on the text, bite **sooner**
- a corporation that never receives the notice — a stale registered-agent address is the usual cause — has no operational two-year cushion at all

⛔ **plan against the March 1 in the notice**, and if no notice arrived, assume the earlier trigger.

### ⭐ the notice is a RIGHT, and its absence is a fact worth establishing

*"shall notify"* is mandatory. on a void you did not see coming, first ask **whether the November 30 notice was sent, and to what address** — the Division of Corporations holds that fact.

### ⭐ §511 — a HARSHER sanction, on the SAME trigger

> **§ 511. Repeal of charters of delinquent corporations; report to Governor
> and proclamation.**
>
> "On or before June 30 in each year, the Secretary of State shall report to
> the Governor a list of all the corporations, which **for 1 year next
> preceding such report**, have failed, neglected or refused to pay the
> franchise taxes assessed against them or due by them, **or to file a
> complete annual franchise tax report** … and the Governor shall forthwith
> issue a proclamation declaring [their charters] repealed"
>
> — [8 Del. C. §511](https://delcode.delaware.gov/title8/c005/index.html)

the §511 report runs **before** the §510 notice:

```
Mar 1, year N    the tax is due
Jun 30, year N   §511 — report to the Governor -> proclamation, charter REPEALED
Nov 30, year N   §510 — the Secretary of State SHALL notify
Mar 1, year N+1  §510 — the cure date named in that notice
```

⛔ **"I have until the March 1 in the notice" is a claim about §510 only.** §511 carries no cure window in its own text.

and a proclaimed charter converts a civil default into a **crime**:

> "**Whoever exercises or attempts to exercise any powers under the certificate
> of incorporation of any corporation which has been proclaimed by the
> Governor**, after the issuance of the proclamation, **shall be fined not more
> than $1,000 or imprisoned not more than 1 year, or both**."
>
> — [8 Del. C. §513](https://delcode.delaware.gov/title8/c005/index.html)

🚩 **whether §511 is administered in practice is NOT established here.** the statute was read; the Division's practice was not. treat it as a live exposure to ask about.

### ✅ revival reaches a §511 repeal — with exactly ONE carve-out

> "…whose certificate of incorporation has become forfeited or void **pursuant
> to this title** … may **at any time** procure an extension, restoration,
> renewal or revival … **Notwithstanding the foregoing, this section shall not
> be applicable** to a corporation whose certificate of incorporation has been
> revoked or forfeited **pursuant to § 284** of this title."
>
> — [8 Del. C. §312(b)](https://delcode.delaware.gov/title8/c001/sc12/index.html)

| question | answer |
|---|---|
| does §312 reach a §511 repeal? | ✅ **yes** — §511 is "pursuant to this title", and the one carve-out is not §511 |
| is there a deadline to revive? | ✅ **no** — *"at any time"* |
| what *does* block revival? | ⛔ **§284 only** — revocation for abuse of corporate powers, an Attorney General court proceeding, not a tax matter |

---

### what void does and does not end

void ends the **charter** and the **powers the state conferred**. it does not dissolve the corporation: Delaware dissolution takes a board resolution, a stockholder vote, and a **filed certificate of dissolution** under 8 Del. C. §275 — none of which happen by nonpayment.

> "**Since a corporation with a forfeited charter has not been dissolved,
> the corporation continues to exist for limited purposes.**"
>
> — *Gibson v. Dennis (In re Russell)*, 123 B.R. 48
> ([Bankr. W.D. Ark. 1990](https://www.courtlistener.com/opinion/1882362/gibson-v-dennis-in-re-russell/))

⚠️ Arkansas law in a bankruptcy court — **persuasive, not binding** — but it states the forfeit/dissolve distinction squarely.

| capability | status |
|------------|--------|
| **legal existence** | ✅ **continues** — the charter is void; the corporation is not dissolved |
| exercise of state-conferred corporate powers | **inoperative** (§510) |
| enter contracts | outside the charter's powers while void — ⚠️ but see §312(e) below |
| sue or be sued | impaired in the corporate name; the entity persists "for limited purposes" |
| certificate of good status | cannot obtain |
| bank accounts | may be frozen |
| foreign qualifications | may be revoked |

⚠️ federal existence is a **conduct** test (26 CFR §1.6012-2(a)(2)): a corporation goes out of existence only if it ceases business **and** dissolves **and** retains no assets. so the federal duty to file never lapses on a void, and **an unfiled loss year is a loss that was never established.** see `accountant/briefs/income-tax/define.void-charter-vs-federal-nol.md`.

> "When an entity reaches void status, the entity may not be able to obtain a Certificate of Good Status, which is often needed for loans, for business in other states, or corporate transactions."
>
> — [Advantage Delaware](https://advantage-de.com/what-happens-if-you-miss-your-franchise-tax-payment-date-in-delaware/)

### liability exposure

officers and directors may face personal liability for acts taken while the corporation was void, and contracts signed while void may be unenforceable.

### ⭐ but revival is RETROACTIVE, and that is the mitigating fact

> "...the corporation shall be revived with the same force and effect **as
> if its certificate of incorporation had not been forfeited or void**...
> Such revival shall **validate all contracts, acts, matters and things**
> made, done and performed within the scope of its certificate of
> incorporation by the corporation, its directors..., officers, agents and
> stockholders ... **during the time when its certificate of incorporation
> was forfeited or void**..., with the same force and effect and to all
> intents and purposes **as if the certificate of incorporation had at all
> times remained in full force and effect**."
>
> — [8 Del. C. §312(e)](https://delcode.delaware.gov/title8/c001/sc12/index.html)

revival **validates the acts taken during the void window**, which retires the liability above.

⚠️ **do not carry this intuition to another state.** Tex. Tax Code §171.255(d) says officer liability "**is not affected by the revival**." see `accountant/briefs/franchise-tax/state=texas/`.

### ⭐ does tax accrue while void? both — and §312(g) reconciles it

- it **accrues**: §501(a) and §502(a) impose on *"every corporation now existing or hereafter …"*, with no void carve-out
- the **revival price** is capped at the **void-date** balance by [8 Del. C. §312(g)](https://delcode.delaware.gov/title8/c001/sc12/index.html) — or, void **more than 5 years**, **3 ×** the revival year's tax
- ⚠️ the void-period liability is **dormant, not extinguished** — a §204 validation re-opens it in full — and the revival payment **does not** cover the revival year's own tax

§312(g) quoted whole, clause by clause, with the §204 and §503(e) traps: `howto.reinstate-void-delaware-corp.md` § *⭐ .what must be paid is BOUNDED — §312(g), in full* and § *§ 204 — the certificate of validation, and why it lands on STEP 4*.

---

## .how to recover (reinstatement)

### step 1: calculate total owed

- franchise tax for each delinquent year
- $200 penalty per year
- 1.5% monthly interest on all amounts

run `rhx franchise.tax.delaware.accrue`; do not sum by hand.

### step 2: file all past-due annual reports

each missed year requires a separate annual report.

### step 3: pay all amounts

Delaware will not reinstate until fully paid.

| payment method | accepted |
|----------------|----------|
| online (credit card) | yes |
| check | yes |
| wire transfer | yes (for large amounts) |

### step 4: file certificate of renewal/revival

file with the Delaware Division of Corporations:
- **$189.00** filing fee — or **$5.00** if the corporation is **exempt** ([Fee Schedule, rev. 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf))
- all past-due taxes, penalties, and interest
- ⚠️ do not confuse the $189 fee with the $200 §502(c) penalty
- `corp.delaware.gov/fee/` is a hub with no dollar figures; the schedule is the PDF above

the fee quotes, the form's `rev. 08/2023` url earned by nav, and the stale `$169.00`
revision a guessed url returns: `howto.reinstate-void-delaware-corp.md` § *.step 4: file Certificate of Revival*.

### timeline

| step | typical duration |
|------|------------------|
| payment processed | 1–3 business days |
| reinstatement approved | 1–5 business days |
| certificate issued | same day to 3 days |

expedited service is available for additional fees.

---

## .prevention

| action | frequency |
|--------|-----------|
| set calendar reminder | annual (February) — and May, if the tax is ≥ $5,000 |
| use registered agent with reminders | recommended |
| maintain current address on file | always |
| budget for franchise tax | annual |

---

## .sources

### the statute — quote these, not the summaries below

1. [8 Del. C. §502(c)](https://delcode.delaware.gov/title8/c005/index.html) — the $200 penalty
2. [8 Del. C. §504](https://delcode.delaware.gov/title8/c005/index.html) — due dates, the $5,000 installment threshold, and 1.5%/month interest from **each** due date
- ⭐ [8 Del. C. §510](https://delcode.delaware.gov/title8/c005/index.html) — the **1-year** void: the trigger, the good-cause extension, the mandatory November 30 notice, and the March 1 cure date. **quoted whole above**, and cross-checked at two publishers: **1,358 = 1,358, `agree: true`**
- ⭐ [8 Del. C. §511](https://delcode.delaware.gov/title8/c005/index.html) — charter **repeal** by gubernatorial proclamation, on the **same 1-year trigger**, reported to the Governor by **June 30**
3. [8 Del. C. §275](https://delcode.delaware.gov/title8/c001/sc10/index.html) — dissolution, and why a void is not one
4. [8 Del. C. §312(e)](https://delcode.delaware.gov/title8/c001/sc12/index.html) — revival, and its retroactive validation of acts done while void
- ⭐ [8 Del. C. §312(b)](https://delcode.delaware.gov/title8/c001/sc12/index.html) — **who may revive at all**: "pursuant to this title", "at any time", and the sole **§284** carve-out
- ⭐ [8 Del. C. §312(g)](https://delcode.delaware.gov/title8/c001/sc12/index.html) — **what revival costs**: the void-date measure, the >5-year `3 ×` alternative, the revival-year exclusion, and the §204 re-opener
- ⭐ [8 Del. C. §513](https://delcode.delaware.gov/title8/c005/index.html) — a **criminal** penalty for exercise of powers under a proclaimed charter: up to **$1,000 or 1 year**
5. [8 Del. C. §501(a)](https://delcode.delaware.gov/title8/c005/index.html) — the imposition clause, and the absence of any void carve-out in it
6. [8 Del. C. §502(a), (f)](https://delcode.delaware.gov/title8/c005/index.html) — the report duty on "every corporation", and the good-standing bar for an unfiled period

### the source bytes, committed

per `rule.require.embed-source-bytes`:

- `refs/de-title8-ch5-franchise-tax.txt` — **ch. 5 whole**, 41,545 ch. §501 → §518
- `refs/de-title8-ch1-sc12-revival.txt` — **subch. XII whole**, 21,204 ch. §311 → §314

both are regenerated byte-for-byte by `registrator/briefs/refs/delaware-void-period-accrual.play.ts`.

⚠️ the second-publisher check on the container pull failed: `law.justia.com/codes/delaware/title-8/chapter-5/` returned **3,097 chars** of chapter index, not text. the ch. 5 and subch. XII quotes are **single-publisher** (delcode.delaware.gov, the official code); only §510 is cross-published.

### the agency

7. [Delaware Division of Corporations: Tax Instructions](https://corp.delaware.gov/paytaxes/)
- ⭐ [DE Division of Corporations **Fee Schedule**, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf) — **the $189.00 fee, and the $5.00 exempt rate.** pulled 2026-08-31, 254,794 bytes
- ⭐ [Delaware Division of Corporations: Certificate of Revival form + instructions](https://corpfiles.delaware.gov/Corp_Forms/Revival%20void.pdf) — **`rev. 08/2023`**, 217,343 bytes, harvested by nav from `/corpforms/` → `/formsdoctype09/` → `/renew09/`. states **$189.00** and **"cover letter"**

### case law

8. [*Gibson v. Dennis (In re Russell)*, 123 B.R. 48 (Bankr. W.D. Ark. 1990)](https://www.courtlistener.com/opinion/1882362/gibson-v-dennis-in-re-russell/) — forfeit ≠ dissolve. persuasive, not binding

### secondary — restates the statute; cited above only where quoted

9. [Harvard Business Services: Voided Corporation](https://www.delawareinc.com/blog/my-delaware-corporation-was-voided-now-what/)
10. [Advantage Delaware: Missed Payment](https://advantage-de.com/what-happens-if-you-miss-your-franchise-tax-payment-date-in-delaware/)
11. [Delaware Tax Expert: Late Fees](https://delawaretaxexpert.com/tax/delaware-franchise-tax-late-fee/)

---

## .provenance

§510 re-pulled 2026-08-31, whole chapter, headful bhrowser:

| source | chars |
|--------|------:|
| [8 Del. C. ch. 5](https://delcode.delaware.gov/title8/c005/index.html) — the container, all of §§ 501-518 | 41,628 |
| [8 Del. C. §510](https://law.justia.com/codes/delaware/title-8/chapter-5/section-510/) — Justia, 2nd publisher | 3,959 |
| the operative sentence, sliced from both | ✅ **1,358 = 1,358, `agree: true`** |

five needles — the trigger, the report prong, the good-cause clause, the notice duty, and the March 1 cure date — were found on **both** sides. the container pull also rules out a neighbor section as the home of the "two years" figure.

⚠️ an equality test validates the **source**, not the **quote**: a truncation made after both publishers agree never enters the comparison.

the §275, §312(e), and *In re Russell* texts are shared with `accountant/briefs/income-tax/define.void-charter-vs-federal-nol.md`, which cross-checked §312(e) against a second publisher.

### 🚩 open gaps

| claim | status |
|-------|--------|
| whether **§511 is administered** — does the Governor actually proclaim? | 🚩 **open, and material to sequence.** the section is quoted from the code, but the Division's practice was not checked. if §511 runs, the June 30 report precedes the November 30 notice, so the cure date in that notice is not the first deadline. **ask on the next call** |
| whether the **November 30 notice** was actually sent, and to what address | 🚩 **open.** §510 makes it mandatory, so its absence or misdelivery is a fact worth establishing on any unexpected void. the Division of Corporations holds it |
| whether the unqualified **report prong** is enforced as written | 🚩 **open.** §510 puts no duration on an unfiled complete annual report. whether the Division voids on a single unfiled report in practice cannot be read from the text |
| "bank accounts may be frozen" · "foreign qualifications may be revoked" | ⚠️ **uncited**, and both are hedged with "may". these are third-party and other-state consequences that Delaware law does not itself impose |
| the reinstatement timeline (1–3 days, 1–5 days) | ⚠️ **uncited** operational detail |
