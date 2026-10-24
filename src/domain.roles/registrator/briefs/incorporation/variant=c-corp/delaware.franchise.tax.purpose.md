# delaware.franchise.tax.purpose

## .what

the Delaware franchise tax is an annual fee corporations pay for the privilege of legal existence in Delaware.

it is **not** a tax on income or profits — it is a fee for the right to be a Delaware corporation.

---

## .why it exists

### the privilege of incorporation

Delaware grants corporations:
- legal personhood
- limited liability
- access to the Court of Chancery
- a predictable legal framework

the franchise tax is the price for these privileges.

> "All corporations incorporated in the State of Delaware are required to file an Annual Report and to pay a franchise tax."
>
> — [Delaware Division of Corporations](https://corp.delaware.gov/frtax/)

### state revenue

Delaware earns ~$1.5 billion/year from franchise taxes — about 25% of state revenue.

this funds:
- the Court of Chancery
- the Division of Corporations
- the legislative updates to the DGCL

the revenue model incentivizes Delaware to maintain a corporate-friendly environment.

---

## .how it differs from income tax

| tax type | basis | who pays |
|----------|-------|----------|
| franchise tax | existence (shares or capital) | all Delaware corps |
| income tax | profits | corps with Delaware-sourced income |

a Delaware corp with no Delaware operations:
- pays franchise tax (for the privilege)
- is **exempt** from Delaware corporate income tax — by statute, not by
  an absence of in-state income

the exemption is express. 30 Del. C. §1902(b) exempts:

> "(6) A corporation maintaining a statutory corporate office in the State
> but **not doing business within the State**"

that is the classic Delaware-shell posture — incorporated in DE, agent in
DE, operations elsewhere — and it turns on **where the work happens**, not
on where revenue is sourced.

source bytes: `refs/de-title30-ch19-income-tax.txt` (**46,963 chars**, via
`briefs/refs/delaware-income-tax-chapter.pull.play.ts`), byte-identical to the
accountant role's independent pull of the same chapter.

⚠️ **but the exemption is not automatic, and a return may still be owed.**
"doing business within the State" is a facts test, and Delaware's own
Division of Revenue says a corporation doing business in DE must file
"regardless of the amount, if any, of its gross income or its taxable
income." so a **zero-income** DE-operating corporation still files — the
same zero-tax-still-owes-a-return trap the accountant role documents for
Texas and Florida.

see `accountant/briefs/income-tax/define.void-charter-vs-federal-nol.md`
for the statute and the agency quote.

---

## .calculation methods

Delaware offers two methods. the corporation may use whichever yields the lower tax.

### method 1: authorized shares

based solely on shares authorized in the certificate of incorporation.

| shares authorized | tax |
|-------------------|-----|
| ≤5,000 | $175 |
| 5,001–10,000 | $250 |
| each additional 10,000 | +$85 |
| maximum | $200,000 |

> "The default method for calculating Delaware franchise tax is the Authorized Shares Method, which bases liability solely on the number of authorized shares."
>
> — [DLA Piper](https://www.dlapiper.com/en/insights/publications/accelerate/formation/delaware-franchise-tax)

### method 2: assumed par value capital

based on total gross assets, issued shares, **and the stated par value**.

⛔ **the three-step form below is INCOMPLETE — do not compute from it.**
it is §503(a)(2) **step 2 only**, and it omits the branch that decides
the answer. use the calculator:

```sh
rhx franchise.tax.delaware --authorized 10000000 --par 0.0001 \
  --issued 1000000 --assets 500000
```

| step | calculation | ⚠️ |
|------|-------------|----|
| 1 | total gross assets ÷ total issued shares = assumed par value | ✅ |
| 2 | assumed par value × authorized shares = assumed par value capital | ⛔ **only for shares whose STATED par is BELOW the assumed par** |
| 3 | assumed par value capital ÷ 1,000,000 × $400 = tax | ⚠️ rounds **UP** — "or fraction thereof" |
| minimum | $400 | ✅ |
| maximum | $200,000 | ✅ |

#### the branch step 2 hides

§503(a)(2) splits the authorized shares in two, by their **stated** par:

| shares whose stated par is… | contribute |
|---|---|
| **below** the assumed par | assumed par × those shares |
| **at or above** the assumed par | **their own stated par** × those shares |

the capital is the **sum of both**. the table above computes only the first
row, so it is right only when *every* share sits below the assumed par —
and it does not warn when they do not.

measured via the calculator: authorized 10,000,000 @ **$1.00** stated par,
issued 1,000,000, gross assets $500,000:

| method | capital | tax |
|--------|--------:|----:|
| the table above (step 2 only) | $5,000,000 | **$2,000.00** |
| §503(a)(2), both branches | $10,000,000 | **$4,000.00** |

a **2× understatement**. always state the par value beside the answer.

> "A corporation has a choice as to which method to use. Delaware provides a calculation using the Authorized Shares Method, but it is up to each taxpayer to also calculate using the Assumed Par Value Method."
>
> — [Clerky](https://help.clerky.com/article/2796-calculate-delaware-franchise-tax)

the election is statutory — **8 Del. C. § 503(a) + § 503(b)** carry it; a
vendor's help page only restates it. the mechanism is two subsections, not one:

| subsection | what it does |
|---|---|
| **§ 503(a)** | the tax is *"whichever … is the **lesser**"* of (a)(1) Authorized Shares and (a)(2) Assumed Par Value |
| **§ 503(b)** | you get (a)(2) **only if** you submit issued shares **and** gross assets *"at the time of filing"* — otherwise *"it shall pay … in the manner prescribed by paragraph (a)(1)"* |
| § 503(c) | the cap ($200,000) and the floor ($175 / **$400**) — ⛔ **not** the election |

🚨 so the "choice" is a **default with an opt-out**, not a menu. stay silent and
you are billed the expensive method; the statement is what buys the cheaper one.

### which method to use

| scenario | likely cheaper method |
|----------|-----------------------|
| few authorized shares | authorized shares |
| many authorized, few issued | assumed par value |
| high gross assets | authorized shares |
| low gross assets, many authorized | assumed par value |

startups with 10 million authorized shares but few issued often pay $400
(assumed par value) instead of **$85,165.00** (authorized shares):

```sh
rhx franchise.tax.delaware --authorized 10000000 --par 0.0001 \
  --issued 8000000 --assets 0
#   ├─ method A · authorized shares  §503(a)(1)
#   │  └─ $85,165.00 / year
```

⚠️ the oft-quoted "$170,000+" is the bill at **20,000,000** authorized
shares ($170,165), not 10,000,000.

---

## .due date

corporations **March 1**; LLC / LP / GP **June 1**. ⚠️ at an estimated **$5,000
or more**, 8 Del. C. §504(a) moves the tax onto four installments, the first
on **June 1 of the tax year** — and the $85,165.00 method-A figure above is
**17× that threshold**. the schedule: `delaware.franchise.tax.[howto].renew.md`
§ *⚠️ March 1 is the whole answer only BELOW $5,000*.

---

## .sources

### the statute

1. [8 Del. C. §503](https://delcode.delaware.gov/title8/c005/index.html) — the two methods: (a)(1) authorized shares, (a)(2) assumed par value, (b) the taxpayer's election, (c) cap and floor
2. [8 Del. C. §504](https://delcode.delaware.gov/title8/c005/index.html) — due dates, the $5,000 installment threshold, interest
3. [30 Del. C. §1902(b)(6)](https://delcode.delaware.gov/title30/c019/index.html) — the corporate income tax exemption quoted above

### the agency

4. [Delaware Division of Corporations: Franchise Tax](https://corp.delaware.gov/frtax/)
5. [Delaware Division of Corporations: Tax Instructions](https://corp.delaware.gov/paytaxes/)
6. [Delaware Franchise Tax Calculator](https://corp.delaware.gov/taxcalc/)

### secondary — restates the statute, and is cited above only where quoted

7. [DLA Piper: Delaware Franchise Tax](https://www.dlapiper.com/en/insights/publications/accelerate/formation/delaware-franchise-tax)
8. [Clerky: Calculate Delaware Franchise Tax](https://help.clerky.com/article/2796-calculate-delaware-franchise-tax)

---

## .provenance

figures on this page are produced by `rhx franchise.tax.delaware`, the
role's own tested calculator, per `rule.forbid.hand-computed-figures`.
the command is shown beside each.

### 🚩 open gaps

| claim | status |
|-------|--------|
| "~$1.5 billion/year … about 25% of state revenue" | ⚠️ **uncited.** two asserted statistics with no source. confirm against Delaware's own annual financial report before you repeat them |
| the §503 / §504 links above | ⚠️ **link-level, not quote-level.** the subsection text has not been pulled into this file. the branch table and the installment table are stated from the calculator's inline cites, which is a second-hand read of the statute |
| "legal existence" as the thing the tax buys | ⚠️ conventional framing, and in tension with this repo's own void analysis — a **void** corporation loses its charter and its state-conferred powers, but **continues to exist**. see `delaware.franchise.tax.delinquency.md` |
