# inventory.of=tax-trigger.tax=sales.state=hawaii

## .answer

**no state sales tax.** Hawaii's analog is the **general excise tax (GET)**, levied on the seller, not collected from the buyer — and it reaches **services**, so SaaS receipts from Hawaii customers are in its base. a remote seller owes GET once Hawaii gross income reaches **$100,000** or **200 transactions** in the current or prior calendar year.

## .the threshold

> "A sales tax is a tax on the customer, which businesses must collect. GET is a tax on the business itself."
>
> — Department of Taxation, General Excise Tax page

> "Out-of-state or remote businesses that engage with Hawaii customers are subject to the economic nexus threshold. If the business has gross income or receipts of $100,000 or more, or has 200 or more transactions in the current or preceding calendar year, economic nexus is established."
>
> — Department of Taxation, General Excise Tax page, *Economic Nexus Threshold*

> "GET applies to the gross income or gross receipts from all business activities conducted in Hawaii. This includes (but is not limited to): Sales of goods and services"
>
> — Department of Taxation, General Excise Tax page

## .details

| item | value |
|---|---|
| figure | $100,000 gross income or 200 transactions |
| which receipts count | goods delivered, services used or consumed, intangibles used in Hawaii (Announcement 2018-10) |
| period | current or prior calendar year |
| effective | July 1, 2018 (Act 41 SLH 2018) |
| physical presence also triggers | yes — office, employees, inventory, in-state services |
| rate | 4.5% retail (incl. 0.5% county surcharge), per the GET page |

⇒ the same GET is the business-level tax in `inventory.of=tax-trigger.tax=corporate.state=hawaii`.

## 🚩 open

| gap | why |
|---|---|
| a Department release that names SaaS by term | GET reaches *"Sales of goods and services"*; no SaaS-specific release pulled |

## .sources

| ref | what | chars |
|---|---|---:|
| `refs/pulledAt=2026-10-05.hawaii-get-page.txt` | GET page | 9,317 |
| `refs/pulledAt=2026-10-05.hawaii-announcement-2018-10.txt` | Announcement 2018-10, Act 41 | 16,446 |
