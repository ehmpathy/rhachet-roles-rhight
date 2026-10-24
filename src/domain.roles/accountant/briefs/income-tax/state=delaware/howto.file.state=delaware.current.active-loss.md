# howto.file.state=delaware.current.active-loss

## .what

file the **current-year** Delaware **Form 1100** (corporate income tax) for an active-loss corp, on time.

> ⚠️ Form 1100 = DE **income** tax (Division of Revenue), not franchise tax. see `define.delaware-1100-vs-federal-1120-vs-franchise-tax`.

## ⛔ FIRST: most Delaware corporations are EXEMPT by statute — check before you file

> "(b) The following corporations shall be exempt from taxation under this
> chapter: … (6) **A corporation maintaining a statutory corporate office in the
> State but not doing business within the State**"
>
> — [30 Del. C. §1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html)

- incorporated in DE, registered agent in DE, every operation elsewhere → **no return is owed under this chapter**, and this brief does not apply
- "doing business within the State" is a facts test, not a formality
- quoted in full, with the Division of Revenue's pointer to §1902(b), in `income-tax/define.void-charter-vs-federal-nol`

## ⚠️ THE FORM NAME MAY BE STALE — this brief says 1100; the agency says CIT-TAX

- the DE FAQ names **Form CIT-TAX**; this brief says **1100** (see `define.void-charter-vs-federal-nol`)
- the name is unchanged here because no pull was made. verify on the Division of Revenue's forms page before you download a form or quote its number
- the extension form below is sourced to a commercial e-file vendor (`expressextension.com`). re-source it from the agency before you rely on it — see the vendor caution in `registrator/briefs/incorporation/catalog.entity-costs-delaware`

---

## .when to use

- the corp had DE-connected activity this year but a net loss, and you file the annual 1100 on schedule — ⛔ **after** the §1902(b)(6) check above
- keeps the corp current with DE income tax (separate from franchise)

## .key: starts from the federal 1120 (file federal first)

- attach the full federal return; Line 1 = Federal Taxable Income → do `howto.file.federal.current.active-loss` first

## .facts

| field | value |
|-------|-------|
| rate | 8.7% (= $0 on a loss) |
| due | April 15 (calendar) / 15th of 4th month after fiscal year-end |
| extension | **Form 1100-T-EXT** (covers the return, not payment — $0 due on a loss) |
| attach | full federal return + schedules |
| e-file | via approved MeF vendors; or mail to DE Division of Revenue, P.O. Box 2044, Wilmington, DE 19899-2044 |

## .DE NOL nuance

DE does not mirror the federal NOL (carryback over $30k/yr not deductible; carryforward rules differ) — confirm DE treatment.

## .steps

1. complete the current federal 1120 first
2. open the current-year DE 1100
3. transfer Federal Taxable Income to Line 1
4. complete apportionment (mostly 0 for single-state / no split)
5. compute DE taxable income; tax @ 8.7% (= $0)
6. attach the federal return; e-file or mail

## .see also

- `howto.file.state=delaware.delinquent.active-loss`
- `howto.file.federal.current.active-loss`

## .sources

- [DE Division of Revenue: Corporate Income Tax FAQs](https://revenue.delaware.gov/frequently-asked-questions/corporate-income-tax-faqs/)
- [DE: Form 1100-T-EXT business extension](https://www.expressextension.com/statetaxextension/delaware/business-tax-extension/)
