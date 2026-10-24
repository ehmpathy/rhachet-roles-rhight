# howto.file-delinquent-1120-via-turbotax

## .what

how to file delinquent prior-year **Form 1120** returns with **TurboTax Business** when you don't run Windows — via a cloud Windows desktop or a local Windows VM.

> companion to `howto.file-form-1120` (the return itself) and `define.form-1120-for-delaware-franchise-tax` (why you need it for reinstatement).

---

## .the core problem

- **TurboTax Business is Windows-only desktop** — no Mac, no Linux, no iPad, no browser self-prep for 1120.
- it also now **requires Windows 11** (won't install on Windows 10).
- so a Linux/iPad/Mac user needs a **Windows 11 environment** to run it.

two ways to get one: a **cloud Windows desktop** or a **local Windows VM**.

---

## .prerequisites (both options)

| item | detail |
|------|--------|
| which years | each delinquent year = its own return + its own TurboTax year edition |
| e-file window | IRS MeF accepts **current year + 2 prior** (e.g., in 2026: 2023, 2024, 2025). older = paper only |
| template | use the most recent filed return as the template; roll Schedule L + NOL forward, in order |
| EFIN | **not needed** — consumer software transmits under the vendor's EFIN |
| PTIN | **not needed** to file your own corp's return |

⚠️ **confirm before you invest setup time:** TurboTax desktop sometimes makes **prior years print-only** even inside the MeF window. verify it will **e-file** each in-window prior year (vs print + mail) so the Windows effort actually buys the instant acknowledgement. if print-only, the IRS fillable PDF is a simpler paper route (`howto.file-form-1120`).

### ⛔ THE FRAMING ABOVE IS INVERTED IF YOU CROSS THE 10-RETURN THRESHOLD

over the threshold below, e-file is not an upgrade — it is the **required** route, and the paper fallback is not freely available.

> "A corporation required to file a corporate income tax return on Form 1120
> … **must file its corporate income tax return electronically if the
> corporation is required by the Internal Revenue Code or regulations to file
> at least 10 returns** (as defined in paragraph (d)(5) of this section)
> during the calendar year ending with or within the taxable year of the
> corporation."
>
> — [26 CFR § 301.6011-5(a)(1)](https://www.law.cornell.edu/cfr/text/26/301.6011-5)

- the count **aggregates every form type** — W-2s, 1099s, income tax, employment tax, excise tax returns — not ten income tax returns
- § 301.6011-5(f) applies the rule to returns "required to be filed during calendar years beginning after December 31, 2023," so a **delinquent TY2023 return is inside it**: it was required to be filed in 2024, and lateness does not move it out
- ⭐ an old year can be **outside the IRS MeF window** (e-file impossible) while the mandate still applies. the answer is a § 301.6011-5(b)(1) **undue-hardship waiver**, which must be *requested*; paper does not grant one by default
- a dormant corporation with no payroll and no information returns is plainly under 10 — for that reader this brief stands as written

full quotes, the aggregation rule, and the waiver text: `howto.file-form-1120`, § *"paper is NOT freely available."* read it before you choose the route.

---

## .turbotax cost

| item | cost |
|------|------|
| TurboTax Business (federal, per year edition) | ~$190 |
| state return | $55-59 each |
| prior-year editions (2022, 2023, 2024) | sold on turbotax.intuit.com, full price |
| 1120 support | **desktop only** (no TurboTax Online for C-corp) |

budget **one purchase per delinquent year**. example: three back years, federal-only ≈ **~$570**.
*(TaxAct Business runs ~$130/year if cost matters more than the TurboTax interface.)*

---

## .option A: Windows 365 Cloud PC (easiest)

a managed cloud Windows 11 desktop, reachable from Linux (browser) or iPad (Windows App).

### steps

1. sign up at **windows365.microsoft.com** → **Business**, **Standard free trial** (monthly commitment, credit card, **no domain needed**)
2. provision the Cloud PC (~30 min, real Windows 11)
3. connect:
   - Linux → browser at windows365.microsoft.com
   - iPad → the **Windows App**
4. install **TurboTax Business** (download each needed year's edition)
5. prepare the returns (see common steps below)
6. **cancel** within the trial month

### facts

| field | value |
|-------|-------|
| cost | $0 in free-trial month; else ~$31-41/mo (Business Basic/Standard) |
| no domain / no Entra P1 | correct — Business tier, credit card only |
| device access | Linux browser + iPad app |
| cancel | monthly commitment = cancel anytime, no penalty (avoid the *annual* plan) |

### pros / cons

- 👍 lowest setup, fastest start, works from iPad too, $0 if done in trial month
- 👎 monthly cost continues if kept; tax data transits a cloud desktop; needs steady internet

---

## .option B: local Windows 11 VM (free, private)

run Windows 11 in a virtual machine on a Linux host.

### steps

1. install a hypervisor: **virt-manager / KVM-QEMU** (best perf) or **VirtualBox 7+** (easiest)
2. download the **Windows 11 ISO** (free from Microsoft)
3. enable **TPM 2.0 + Secure Boot** emulation (Win11 requires it):
   - virt-manager/QEMU → add **swtpm** + UEFI/OVMF firmware
   - VirtualBox 7+ → built-in TPM toggle
4. install Windows 11 (runs **unactivated** indefinitely — only a cosmetic watermark; fine for tax software)
5. install **TurboTax Business** (each year's edition)
6. prepare the returns (see common steps below)
7. keep the VM image for future years, or delete it

### facts

| field | value |
|-------|-------|
| cost | **$0** (free hypervisor; Win11 unactivated) |
| host needs | ~4-8GB free RAM, ~40-60GB disk |
| device access | **the Linux host only** — not iPad (no x86 Windows VM on iPad) |
| reuse | keep the image, reboot next year |

### pros / cons

- 👍 free, **most private** (data never leaves your machine), reusable, no monthly cost
- 👎 ~1-2 hr one-time setup (ISO + TPM), Linux-host-bound (no iPad)

---

## .quick compare

| dimension | ☁️ Cloud PC | 💻 local VM |
|-----------|------------|-------------|
| cost | $0 trial, else ~$31-41/mo | $0 |
| setup | ~30 min, managed | ~1-2 hr |
| iPad access | ✅ | ❌ |
| privacy | cloud + internet | local only ✅ |
| reuse | re-subscribe | keep image ✅ |
| best for | least hassle / iPad | zero cost / privacy |

(TurboTax license cost is the same either way — the difference is just the Windows host.)

---

## .common steps to file (both options)

once Windows 11 + TurboTax Business is up:

1. install the **correct year edition** of TurboTax Business per year (2023 edition for TY2023, etc.)
2. start with the **oldest delinquent year**; use the prior filed return as the template
3. complete the return — for a dormant year most lines are $0; the parts that matter:
   - **Schedule L** (balance sheet) — its "total assets" is what Delaware needs
   - **M-1 / M-2** reconciliation
   - **NOL carryforward** (line 29a) — accumulates each year
4. **roll forward in order**: each year's final Schedule L balances become the next year's start balances; carry the NOL forward
5. **e-file** each year (if supported) → instant "Accepted" acknowledgement; else print + mail
6. save each return PDF — the **Schedule L** copy is what you forward to Delaware for franchise reinstatement

### ⛔ TurboTax will OFFER to skip Schedule L. do not take it.

the software will offer to skip it, legitimately under federal law:

> "Corporations with total receipts (page 1, line 1a plus lines 4 through 10)
> and total assets at the end of the tax year **less than $250,000 are not
> required to complete Schedules L, M-1, and M-2** if the "Yes" box on Schedule
> K, question 13, is checked."
>
> — [Instructions for Form 1120](https://www.irs.gov/pub/irs-pdf/i1120.pdf)

⚠️ a dormant back-year qualifies, so the Q13 interview presents the skip as the easier answer — right for the IRS, wrong for the reason this return exists.

| your return is bound for... | the Q13 skip |
|---|---|
| the IRS only | ✅ take it |
| **Delaware franchise reinstatement** | ⛔ **decline it — complete Schedule L** |

**the exemption is a permission, not a prohibition.** a return that answers Q13
"Yes" honestly and still carries a complete Schedule L is a valid return; the
box reports a fact about your size, not an election to leave the page blank.

see `define.form-1120-for-delaware-franchise-tax` for **Item D**, the page-1
total-assets field that carries the figure even when Schedule L is skipped.

---

## .cost summary

| path | likely cost |
|------|-------------|
| Cloud PC in free trial month | **$0** Windows + TurboTax editions per year |
| Cloud PC paid month | ~$31-41 Windows + TurboTax editions |
| local VM | **$0** Windows + TurboTax editions per year |

TurboTax editions: ~$190 federal each year. so the Windows host is the small/avoidable cost; the tax software is the real spend.

---

## .see also

- `howto.file-form-1120` — the return itself + the paper fallback
- `howto.find-form-1120` — confirm which years are already filed
- `define.form-1120-for-delaware-franchise-tax` — why Delaware needs the Schedule L
- `howto.reinstate-void-delaware-corp` — the franchise reinstatement path

---

## .sources

- [TurboTax Desktop system requirements (Windows 11 only)](https://turbotax.intuit.com/personal-taxes/cd-download/tta-system-requirements/)
- [TurboTax Business Desktop (price + prior years)](https://turbotax.intuit.com/small-business-taxes/cd-download/)
- [Windows 365 Business plans and cost](https://www.microsoft.com/en-us/windows-365/business/all-pricing)
- [IRS: MeF 2026 business returns (current + 2 prior years)](https://content.govdelivery.com/accounts/USIRS/bulletins/402a608)
- [IRS: Form 1120 e-file providers](https://www.irs.gov/e-file-providers/form-1120-1120-s-1120-f-1120-h-e-file)
