# howto.use_tool.turbotax.desktop.on_linux

## .what

how to run **TurboTax Business desktop** (Windows-only) from a **Linux** machine — primarily via a **Microsoft Windows 365 Cloud PC** reached in the browser, with a local VM as the alternative.

## .why

TurboTax Business is **Windows 11 desktop only** — no Mac, no Linux, no iPad, no browser self-prep for 1120. a Linux user needs a Windows 11 environment to run it.

## .when to use

- you run **Linux** (or iPad) and must run **TurboTax/TaxAct desktop** to prepare/e-file a corporate 1120
- you want **instant e-file acknowledgement** — which needs the desktop software, since the IRS fillable PDF is paper-only for 1120

## .when NOT to use

- you will **paper-file the IRS fillable PDF** instead — works on any OS, no Windows, free, but **no instant ack** (`howto.file-form-1120`) — ⛔ **only if you are under the 10-return threshold; see below**
- a **CPA / flat-fee service** files for you — they supply the software + EFIN

### ⛔ the first bullet is CONDITIONAL — e-file may be MANDATORY

> "A corporation required to file a corporate income tax return on Form 1120
> … **must file its corporate income tax return electronically if the
> corporation is required by the Internal Revenue Code or regulations to file
> at least 10 returns**"
>
> — [26 CFR § 301.6011-5(a)(1)](https://www.law.cornell.edu/cfr/text/26/301.6011-5)

the count **aggregates every form type** — W-2s, 1099s, income tax returns,
employment tax returns, excise tax returns — so it is reachable by a small
company with payroll. read `howto.file-form-1120`, § *"paper is NOT freely
available,"* for the full text, the applicability date, and the
undue-hardship waiver.

over the threshold, e-file is required by law, not a convenience — and so is
the Windows effort (or a CPA).

## .option A: Windows 365 Cloud PC (microsoft cloud web) — recommended

a managed Windows 11 desktop, reached from a Linux browser.

steps:
1. sign up at **windows365.microsoft.com** → **Business**, **Standard free trial** (monthly commitment, credit card, **no domain needed**)
2. provision the Cloud PC (~30 min, real Windows 11)
3. connect from Linux → browser at **windows365.microsoft.com** (the web client)
4. install **TurboTax Business** (download each year's edition)
5. prepare + e-file the returns
6. **cancel** within the trial month

facts:

| field | value |
|-------|-------|
| cost | $0 in the free-trial month; else ~$31-41/mo (Business Basic/Standard) |
| account | no domain, no Entra P1 — credit card only |
| access | Linux browser; iPad via the Windows App |
| cancel | monthly commitment → cancel anytime, no penalty (avoid the *annual* plan) |

## .option B: local Windows 11 VM (free, private)

run Windows 11 in a VM on the Linux host:
- hypervisor: **virt-manager / KVM-QEMU** (best perf) or **VirtualBox 7+** (easiest)
- enable **TPM 2.0 + Secure Boot** (Win11 requires it): swtpm + UEFI/OVMF, or VirtualBox 7+ toggle
- Win11 runs **unactivated** indefinitely (cosmetic watermark only) — fine for tax software

facts: free, **most private** (data never leaves your machine), reusable — but **Linux-host-bound** (no iPad) and ~1-2 hr one-time setup.

## .which to pick

| priority | pick |
|----------|------|
| least setup / iPad access / one-time push | **Cloud PC** (free trial) |
| zero cost / max privacy / reuse each year | **local VM** |

## .gotchas

- TurboTax 2025 requires **Windows 11** (won't install on Windows 10 or Windows Server) → **raw AWS EC2 (Windows Server) is a poor fit**; Cloud PC and local VM both give real Win11
- ⚠️ confirm the desktop product **e-files prior years** (each year inside the MeF window) vs print-only, so the Windows effort actually buys the acknowledgement

## .see also

- `howto.file-delinquent-1120-via-turbotax`
- `howto.file.federal.delinquent.active-loss` · `howto.file.federal.current.active-loss`

## .sources

- [TurboTax Desktop system requirements (Windows 11 only)](https://turbotax.intuit.com/personal-taxes/cd-download/tta-system-requirements/)
- [Windows 365 Business](https://www.microsoft.com/en-us/windows-365/business)
- [IRS: Form 1120 e-file providers](https://www.irs.gov/e-file-providers/form-1120-1120-s-1120-f-1120-h-e-file)
