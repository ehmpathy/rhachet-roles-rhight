# inventory.of=tax-trigger.tax=sales.state=illinois

## .answer

**no, SaaS is not taxable at the state level** — software only accessed remotely is outside the retailers' occupation tax (canned software transferred to the customer is taxable). a remote retailer owes ROT once its Illinois sales of tangible personal property reach **$100,000** over the prior 12 months, tested quarterly; the **200-transaction test ended December 31, 2025**.

## .the threshold

> "(b-1) Beginning on January 1, 2026, a remote retailer is engaged in the occupation of selling at retail in Illinois for purposes of this Act if the remote retailer's cumulative gross receipts from sales of tangible personal property to purchasers in Illinois are $100,000 or more."
>
> — 35 ILCS 120/2(b-1)

> "(b) Beginning on January 1, 2021 and through December 31, 2025, a remote retailer is engaged in the occupation of selling at retail in Illinois for purposes of this Act, if:"
>
> — 35 ILCS 120/2(b) — the old rule, which also counted 200 or more separate transactions

> "Computer software provided through a cloud-based delivery system is not subject to tax. A cloud-based delivery system is one in which computer software is never downloaded onto a client's computer and only accessed remotely."
>
> — 86 Ill. Adm. Code 130.1935(a)(3)

## .details

| item | value |
|---|---|
| figure | $100,000 cumulative gross receipts (from Jan 1, 2026); before: $100,000 or 200 transactions |
| which sales count | sales of tangible personal property to Illinois purchasers |
| period | prior 12 months, tested at each quarter end (Mar, Jun, Sep, Dec) |
| effective | January 1, 2026 (subsection (b-1)) |
| physical presence also triggers | yes — office, warehouse, agent (35 ILCS 105/2) |
| SaaS | not taxable if *"only accessed remotely"*; an API, applet, or agent the customer receives is software (130.1935(a)(4)) |

## 🚩 open

| gap | why |
|---|---|
| IDOR's ROT web page still shows the 200-transaction test | the page was not updated; the statute governs |
| a separate $100,000 serviceperson (SOT) threshold | named in PIO-125; not pulled into refs |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.illinois-35-ilcs-120-2.txt` | 35 ILCS 120/2, sliced through (b-1) | 5,817 |
| `refs/pulledAt=2026-10-05.illinois-86-iac-130-1935.txt` | 86 Ill. Adm. Code 130.1935 | 7,145 |
