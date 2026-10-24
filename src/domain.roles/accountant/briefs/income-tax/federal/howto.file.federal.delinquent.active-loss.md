# howto.file.federal.delinquent.active-loss

## .what

file delinquent **prior-year** federal Form 1120 for a corp that had **activity but net losses** (not dormant).

> active-loss ≠ dormant: real numbers, a real balance sheet, an NOL to carry. for the all-zeros dormant case use the simpler path in `howto.file-form-1120`.

## .when to use

- you skipped one or more prior federal years that had real expenses (and/or revenue) but a net loss
- you need each year on file to preserve the NOL and to substantiate gross assets for DE franchise reinstatement

## .prereqs

- **books per year** — income statement + balance sheet for each back-year (the real work; the form is data entry once you have them)
- the most recent filed return as a template (start balances, accumulated deficit, NOL)
- each year's correct **form edition**

## .active-loss specifics

| part | what to do |
|------|-----------|
| income / deductions | report real receipts + the expenses that drove the loss |
| Schedule L | real balance sheet; must tie out; final balances roll to next year's start |
| Schedule M-1 | reconcile book loss to tax loss |
| Schedule M-2 | track the accumulated deficit year over year |
| NOL | each year's loss accumulates (line 29a); only a **filed** year establishes its loss |
| Form 4562 | attach if depreciable assets were bought |

## .delinquent specifics

- **file oldest year first** — Schedule L + NOL roll forward in order
- **e-file window**: IRS MeF accepts current + 2 prior years; older → **paper**
  — ⛔ **"older → paper" is a statement about what MeF ACCEPTS, not a
  permission.** e-file is *mandatory* over a 10-return threshold, and the
  mandate does not lapse because the window closed. see below
- **penalty**: under **§6651** — the C-corp rule — both are a % of unpaid tax,
  and the minimum floor is the *lesser* of an indexed dollar amount and 100% of
  the tax → **$0 on a zero-tax loss year**. ⛔ **this does NOT generalize** — an
  S corp (§6699) and a partnership (§6698) are penalized **per owner, per month,
  regardless of tax**. see `howto.file-form-1120.md` for the quoted statute and
  the entity table
- **statute**: the IRS assessment clock starts only when a year is filed — file to close the open window
- **NOL** survives only if each loss year is filed

## ⛔ WHAT THE NOL IS WORTH — three statutes

three provisions decide what the preserved NOL is actually worth. all three are quoted verbatim, with cross-publisher checks, in `../define.void-charter-vs-federal-nol`.

| provision | what it does | why it belongs on this page |
|---|---|---|
| **§172(b)(1)(A)(ii)(II)** | post-2017 losses carry forward **indefinitely** | there is **no expiry clock** — so no deadline pressure from §172 itself, which changes how you sequence the work |
| **§172(a)(2)(B)** | use is capped at **80%** of income | a future profitable year **cannot** be zeroed out. plan cash for tax on the remaining 20% |
| 🚨 **§382** | limits NOL use after a **change of corporate ownership** | **this is the one that silently destroys the carryforward.** immaterial while ownership is unchanged — and it fires on a raise, a share issuance, or a sale |

⚠️ §382 fires silently, on exactly the events a founder is most likely to pursue. **flag it before any raise, share issuance, or sale.**

## ⚠️ the duty is UNCONDITIONAL — say so, so a delinquent year is not "optional"

> "**Unless exempt under section 501, all domestic corporations (including
> corporations in bankruptcy) must file an income tax return whether or not
> they have taxable income.**"
>
> — [Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf),
>   and [26 CFR §1.6012-2(a)(1)](https://www.law.cornell.edu/cfr/text/26/1.6012-2)

⭐ **bankruptcy does not excuse the return** — so no lesser disability does, a void charter included. to skip a loss year is what puts the carryforward at risk: an unfiled year is a year whose loss was never established.

## ⛔ AND SO IS THE **METHOD** — the paper fallback above is conditional

the **method** has its own mandate:

> "A corporation required to file a corporate income tax return on Form 1120
> … **must file its corporate income tax return electronically if the
> corporation is required by the Internal Revenue Code or regulations to file
> at least 10 returns** (as defined in paragraph (d)(5) of this section)"
>
> — [26 CFR § 301.6011-5(a)(1)](https://www.law.cornell.edu/cfr/text/26/301.6011-5)

⚠️ **the count is across EVERY form type** — W-2s, 1099s, income tax returns,
employment tax returns, excise tax returns — not ten income tax returns.

⭐ *"in window"* is about what MeF **accepts**; the mandate is about what the corporation **owes**. they come apart here:

| | in the MeF window | outside it |
|---|---|---|
| under 10 returns | e-file or paper, your choice | paper, fine |
| **10 or more** | **must e-file** | ⛔ **must e-file, and cannot** |

the bottom-right cell is where a delinquent filer over the threshold actually
lands, and the answer is not "mail it quietly." it is a
§ 301.6011-5(b)(1) **undue-hardship waiver**, which must be *requested*.

the full text — the mandate, the aggregation rule, the applicability date
(returns "required to be filed during calendar years beginning after December
31, 2023," which reaches a delinquent TY2023 return), and the waiver — is in
`howto.file-form-1120`, § *"paper is NOT freely available."*

## 🧮 worked example — one loss year onto the 1120, then the carryforward

⚠️ **every figure below is synthetic** — pseudonymized values picked for this example, derived from no real books and attributed to no real entity. this is the one worked loss-year example in the repo; other briefs point here.

**year 1 — a loss year:**

| Form 1120 line | entry |
|---|---:|
| 1a / 1c — gross receipts | $18,463.52 |
| 11 — total income | $18,463.52 |
| 17 — taxes and licenses | $412.00 |
| 22 — advertisement | $11,927.38 |
| 26 — other deductions (attach statement: software, hosts, fees) | $21,306.91 |
| 27 — total deductions | $33,646.29 |
| 28 — taxable income before NOL + special deductions | −$15,182.77 |
| 29a — NOL deduction | $0 — an NOL cannot offset a negative line 28 |
| 30 — taxable income | −$15,182.77 → the year's NOL is **$15,182.77** |

**year 2 — the first profitable year:**

| step | value |
|---|---:|
| line 28, before the NOL | $6,751.44 |
| 80% cap — §172(a)(2)(B) | $5,401.15 |
| 29a — NOL used (the lesser of the cap and the NOL on hand) | $5,401.15 |
| 30 — taxable income | $1,350.29 — tax is owed on this |
| NOL carried to year 3 | $9,781.62 |

⭐ the lesson is in year 2: a $15k carryforward against a $6.7k year still leaves tax owed, because the cap bites before the NOL runs out.

⚠️ figures computed by a tool, never by hand (`rule.forbid.hand-computed-figures`); a real return takes them from `assemble.1120`.

---

## .steps

1. assemble books (P&L + balance sheet) per back-year
2. start with the oldest delinquent year; open the prior return as template
3. enter income + deductions (the loss)
4. complete Schedule L (tie out), M-1, M-2; carry the NOL
5. roll final balances into the next year; repeat in order
6. e-file if in window → instant ack; else print + mail — ⚠️ only if under the 10-return threshold, or with a waiver (see above)
7. save each return PDF — the Schedule L copy feeds DE franchise reinstatement

## .platform

TurboTax/TaxAct desktop is Windows-only → see `howto.use_tool.turbotax.desktop.on_linux` to run it from Linux.

## .when to call a CPA

- messy books, depreciation/assets/loans, or doubt on M-1/M-2 → a CPA batch removes the continuity risk
- clean, simple books → DIY is very doable

## .see also

- `howto.file.federal.current.active-loss`
- `howto.file.state=delaware.delinquent.active-loss`
- `howto.file-form-1120` · `define.form-1120-for-delaware-franchise-tax`

## .sources

- [IRS: MeF 2026 business returns](https://content.govdelivery.com/accounts/USIRS/bulletins/402a608)
- [IRS IRM 4.11.11 (NOL)](https://www.irs.gov/irm/part4/irm_04-011-011)
- [IRS: Time IRS can assess tax](https://www.irs.gov/filing/time-irs-can-assess-tax)
