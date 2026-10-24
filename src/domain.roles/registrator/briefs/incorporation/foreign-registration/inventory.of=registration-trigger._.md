# inventory.of=registration-trigger._

## .what

**when** does a corporation chartered elsewhere (e.g. a Delaware C-corp) owe a state's Secretary of State a registration or a recurrent report? two duties, five states, one file per cell.

⚠️ this is the **registration** side only. whether the state can **tax** the corporation is a separate test, owed to a separate agency, with a lower bar — see the tax-trigger inventory below. a "no" here is not a "no" there.

## .citations

this root is a navigation/rollup artifact. it makes no independent factual claim: each grid cell and each through-line summarizes the entries it links, and each entry carries the sources for it. per `rule.require.seven-distinct-citations`, it inherits its citations from those entries.

## .the axes

| axis | positions |
|---|---|
| `duty` | `foreign-registration` — must it register before it acts in the state? · `periodic-report` — once registered, what recurs? |
| `state` | `california` · `florida` · `indiana` · `new-york` · `texas` |

2 × 5 = 10 cells. 10 occupied, 0 forbidden, 0 empty.

## .the grid

| state | duty=foreign-registration | duty=periodic-report |
|---|---|---|
| california | before it transacts **intrastate** business (repeated and successive transactions, Corp. §191); no grace; $100; court may assess $20/day — [entry](./inventory.of=registration-trigger.duty=foreign-registration.state=california.md) | Statement of Information within 90 days, then **annually** (§2117); $25; $250 FTB penalty after notice — [entry](./inventory.of=registration-trigger.duty=periodic-report.state=california.md) |
| florida | before it transacts business (§607.1501); no grace; $35 + $35 agent; back fees + court-ordered $500–$1,000/yr — [entry](./inventory.of=registration-trigger.duty=foreign-registration.state=florida.md) | annual report Jan 1–May 1, from the year after qualification (§607.1622); $150; $400 late after May 1 — [entry](./inventory.of=registration-trigger.duty=periodic-report.state=florida.md) |
| indiana | before it does business (IC 23-0.5-5-2); no grace, no late fee; $75 online; AG civil penalty ≤ $10,000 — [entry](./inventory.of=registration-trigger.duty=foreign-registration.state=indiana.md) | business entity report every two years, first due two years after registration (IC 23-0.5-2-13); $20 online — [entry](./inventory.of=registration-trigger.duty=periodic-report.state=indiana.md) |
| new-york | before it does business (BCL §1301); no grace; $225; court bar until authorized and back taxes paid — [entry](./inventory.of=registration-trigger.duty=foreign-registration.state=new-york.md) | biennial statement in the month of the application for authority (BCL §408); $9; $250 fine to cure delinquency — [entry](./inventory.of=registration-trigger.duty=periodic-report.state=new-york.md) |
| texas | before it transacts business (BOC §9.001); 90-day grace on the late fee only; $750 + $750 per year late — [entry](./inventory.of=registration-trigger.duty=foreign-registration.state=texas.md) | **none** with the SoS for a for-profit; the Comptroller's annual franchise report + PIR is the recurrent duty — [entry](./inventory.of=registration-trigger.duty=periodic-report.state=texas.md) |

## .the through-lines

- **the trigger is presence-shaped in all five.** each statute names an in-state act (transact / do business), and four of five define it only by a list of what does not count. California alone defines it affirmatively.
- **every safe-harbor list omits an office the corporation runs its business from.** each covers a securities-transfer office, and most cover property owned "without more" — see the two hazard briefs.
- **New York's list is the shortest** — four items, no isolated-transaction or interstate-commerce row.
- **grace periods are rare.** only Texas has one, and it waives the late fee, never the duty.

## .the gaps

| gap | cells |
|---|---|
| whether a **particular** activity crosses the line — every list is non-exhaustive, and no state agency will answer it | all five `foreign-registration` |
| state case law on "transact" / "do business" | all five; none pulled |
| whether CA Corp. Code §2204/§2205 reach a **foreign** corporation by their text | `periodic-report.state=california` |
| whether NY's §408(8) tax-report substitute is in force | `periodic-report.state=new-york` |

## .see also

- `../../../../accountant/briefs/nexus/inventory.of=tax-trigger._.md` — the tax side: when the same five states can tax the corporation
- [`hazard.foreign-registration.state=florida.md`](./hazard.foreign-registration.state=florida.md) — the Florida duty in depth, and the tax-side sequence constraint
- [`hazard.foreign-registration.state=texas.md`](./hazard.foreign-registration.state=texas.md) — the Texas duty in depth, the five-year cap, and §9.052
- `../../../../accountant/briefs/nexus/define.three-duties-three-tests.md` — why registration, income tax, and sales tax are three questions

## .provenance

every quote was pulled with **bhrowser**, headful, per `rule.require.bhrowser-citations`; the playbook is `.scratch/research/reg/pull.play.ts` (local). the bytes are promoted to `refs/` by `refs/promote.jobs.json` and every blockquote was checked against them by an equality test. no figure was computed by hand.
