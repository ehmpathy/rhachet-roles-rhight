# howto.file.federal.current.active-loss

## .what

file the **current-year** federal Form 1120 for an active-loss corp, on time.

## .when to use

- the corp had activity but a net loss this year, and you file the annual return on schedule
- you want to apply the prior-year NOL and keep the corp current

## .due dates

- **April 15** (calendar year); 15th of the 4th month after a fiscal year-end
- extension: **Form 7004** → +6 months (to Oct 15). the extension covers the **return**, not payment — but a loss year owes $0, so no payment concern

## .active-loss mechanics (same core as delinquent)

- real income + deductions, Schedule L, M-1, M-2
- **apply the NOL carryforward** from prior years on line 29a

## 🚨 the carryforward does NOT "offset any income" — it is capped at 80%

> "(ii) **80 percent** of the excess (if any) of— (I) taxable income computed
> without regard to the deductions under this section and sections 199A and 250,
> over (II) the amount determined under subparagraph (A)."
>
> — [26 U.S.C. §172(a)(2)(B)](https://www.law.cornell.edu/uscode/text/26/172)

⛔ a profitable year **cannot** be zeroed out by the carryforward: at most 80% of it is absorbed, and **cash is owed on the remaining 20%.** the first profitable year is exactly when the cap bites and an unbudgeted tax bill hurts most.

| ✅ true | ⛔ the misread |
|---|---|
| the NOL is **indefinite** — §172(b)(1)(A)(ii)(II), no expiry clock | — |
| use is **capped at 80%** of income — §172(a)(2)(B) | "it wipes out the year" |
| 🚨 **§382** limits use after an ownership change | "it is safe across a raise" |

⚠️ **the 80% cap is scoped to post-2017 losses.** a pre-2018 NOL is not subject
to it. check which years a carryforward came from before you apply either rule.

🧮 a worked loss year onto the 1120, then the cap in the next profitable year, with synthetic figures: `howto.file.federal.delinquent.active-loss` § *worked example*.

📄 all three provisions are quoted verbatim, with cross-publisher checks, in
`../define.void-charter-vs-federal-nol`.

## .current specifics

- e-file normally (current year) → instant ack
- file on time to preserve this year's NOL and avoid delinquency notices
- $0 tax on a loss → **$0 failure-to-file penalty under §6651**, because both the
  5%-per-month charge and the minimum floor are measured on the tax. ⛔ **this is
  the C-corp rule and does NOT generalize** — an S corp (§6699) and a partnership
  (§6698) are penalized **per owner, per month, regardless of tax**. see
  `howto.file-form-1120.md` for the quoted statute and the entity table
- an on-time file still matters on its own: it keeps the chain clean and starts
  the assessment clock

## .steps

1. close the year's books (P&L + balance sheet)
2. open last year's return as template
3. enter income + deductions
4. Schedule L (start = last year's final), M-1, M-2
5. apply the prior NOL carryforward (line 29a)
6. e-file → ack
7. save the return

## .platform

Windows-only desktop → `howto.use_tool.turbotax.desktop.on_linux`

## .see also

- `howto.file.federal.delinquent.active-loss`
- `howto.file.state=delaware.current.active-loss`
- `howto.file-form-1120`

## .sources

- [IRS: About Form 1120](https://www.irs.gov/forms-pubs/about-form-1120)
- [IRS: Instructions for Form 1120 (2025)](https://www.irs.gov/instructions/i1120)
