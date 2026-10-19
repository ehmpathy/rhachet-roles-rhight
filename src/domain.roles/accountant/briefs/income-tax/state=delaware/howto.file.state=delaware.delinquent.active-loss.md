# howto.file.state=delaware.delinquent.active-loss

## .what

file delinquent **prior-year** Delaware **Form 1100** (corporate **income** tax) for an active-loss corp.

> ⚠️ Form 1100 = DE **income** tax (Division of **Revenue**) — **not** franchise tax, **not** the federal 1120. see `define.delaware-1100-vs-federal-1120-vs-franchise-tax`.

## ⛔ FIRST: most Delaware corporations are EXEMPT by statute — check before you file

> "(b) The following corporations shall be exempt from taxation under this
> chapter: … (6) **A corporation maintaining a statutory corporate office in the
> State but not doing business within the State**"
>
> — [30 Del. C. §1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html)

- the classic Delaware posture — incorporated in DE, registered agent in DE, every operation elsewhere — owes **no return under this chapter**: not a $0 return, none
- "doing business within the State" is a facts test; the DE incorporation neither satisfies nor defeats it. establish where the work happens first
- the cost of a skipped gate: an unnecessary return, an unnecessary disclosure, and a relationship with an agency that had no claim
- quoted in full, with the Division of Revenue's pointer to §1902(b), in `income-tax/define.void-charter-vs-federal-nol`

## ⚠️ THE FORM NAME MAY BE STALE — this brief says 1100; the agency says CIT-TAX

`define.void-charter-vs-federal-nol` names this file as the stale side:

> "the DE FAQ now names **Form CIT-TAX**, while older material (including a
> sibling brief in this role) says **Form 1100**. that is a live discrepancy —
> verify the current form before filing anything."

the name is unchanged here because no pull was made. confirm on the Division of Revenue's current forms page before you download a form or quote its number.

---

## .when to use

- the corp had DE-connected activity in a prior year but a net loss, and the 1100 was never filed — ⛔ **after** the §1902(b)(6) check above
- you want the corp current with DE **income** tax (separate from the franchise reinstatement)

## .key: the 1100 starts from the federal 1120

- DE requires you to **attach the full federal return**; Line 1 = **Federal Taxable Income**
- so **prepare/file the federal 1120 first** (`howto.file.federal.delinquent.active-loss`)

## .facts

| field | value |
|-------|-------|
| rate | **8.7%** (= $0 on a loss) |
| due | April 15 (calendar) / 15th of 4th month after fiscal year-end |
| attach | full federal return + all schedules |
| mail | DE Division of Revenue, P.O. Box 2044, Wilmington, DE 19899-2044 (confirm the correct return address in that year's instructions) |
| e-file | DE accepts MeF via approved vendors — the same software that e-files the 1120 can often e-file the 1100 |

## .DE NOL nuance

DE does **not** mirror the federal NOL — carrybacks over $30,000/year are not deductible (since 1990), and DE carryforward rules differ. confirm DE treatment per year; do not assume the federal NOL flows straight through.

## .delinquent specifics

- prior-year 1100 editions from the DE Division of Revenue prior-year forms
- late penalty: **5%/month** + interest **0.5%/month** from the original due date, plus failure-to-pay **1%/month** (max 25%) — all on **tax due**, so **~$0 on a loss year** (30 Del. C. §1912)
- file oldest first, to match the federal order

## .steps

1. complete the federal 1120 for that year first
2. open the same-year DE 1100 edition
3. transfer Federal Taxable Income to Line 1
4. complete apportionment schedules (single-state / no DE-vs-non-DE split → mostly 0)
5. compute DE taxable income; tax @ 8.7% (= $0 on a loss)
6. attach the federal return; e-file or mail

## .see also

- `howto.file.state=delaware.current.active-loss`
- `howto.file.federal.delinquent.active-loss`
- `define.delaware-1100-vs-federal-1120-vs-franchise-tax`

## .sources

- [DE Division of Revenue: Corporate Income Tax FAQs](https://revenue.delaware.gov/frequently-asked-questions/corporate-income-tax-faqs/)
- [DE Division of Revenue: Prior Year Business Tax Forms](https://revenue.delaware.gov/business-tax-forms/prior-year-business-tax-forms/)
- [30 Del. C. §1912 (penalties)](https://law.justia.com/codes/delaware/title-30/chapter-19/section-1912/)
