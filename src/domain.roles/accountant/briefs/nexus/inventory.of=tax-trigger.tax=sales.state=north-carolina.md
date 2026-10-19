# inventory.of=tax-trigger.tax=sales.state=north-carolina

## .answer

**SaaS: no** — North Carolina does not tax software as a service. remote-seller threshold: gross sales **> $100,000** from remote sales sourced to NC, in the **previous or current calendar year**; no transaction count.

## .the threshold

> "The retailer makes gross sales in excess of one hundred thousand dollars ($100,000) from remote sales sourced to this State, including sales as a marketplace seller, for the previous or the current calendar year."
>
> — Sales and Use Tax Bulletins (01/01/2026), SUTB 2-2.B.8

> "North Carolina does not impose sales or use tax on software as a service."
>
> — Sales and Use Tax Bulletins (01/01/2026), SUTB 19, part C, *Software as a Service*

## .details

| item | value |
|---|---|
| figure | > $100,000 gross sales; no transaction-count test |
| which sales count | gross sales from remote sales sourced to NC, sales as a marketplace seller included |
| period | previous or current calendar year |
| effective | per SUTB revision 01/01/2026 (start date of the rule not in the slice) |
| physical presence also triggers | yes — a retail establishment or office in NC, or solicitation by in-state representatives (SUTB 2-2.B) |
| SaaS | not taxable; prewritten software delivered electronically is taxable (SUTB 19) |

## 🚩 open

| gap | why |
|---|---|
| the date NC dropped its former 200-transaction test | not stated in the pulled slice; G.S. 105-164.8 not pulled |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.nc-sutb-2-2.remote-sales.txt` | SUTB 2-2, retailer duty, remote-sales threshold (slice) | 5,758 |
| `refs/pulledAt=2026-10-05.nc-sutb-19.saas.txt` | SUTB 19.C, SaaS (slice) | 596 |
