# howto.check-a-registration-before-you-disclose

## .what

before any voluntary-disclosure move — an MTC application, a state VDA, a
written non-filer letter — **check whether a registration or tax account
already exists**. it is a free, anonymous, public-registry read, and it decides
whether the relief you are about to seek is still available at all.

## .why it comes FIRST

both of the major look-back caps are forfeited by a prior touch, so the answer
changes the whole plan rather than merely informing it:

| regime | what forfeits the cap |
|--------|----------------------|
| **MTC National Nexus Program** | MVDP §4.2: "at any time in the past **registering**, filing a tax return or making a tax payment with respect to that tax type and state" |
| **Florida** §95.091(3)(a)5 | the cap runs to whoever moves first — an online registration or a cold return spends it |

so "am I already registered?" is the **gate**, answerable in two minutes from a
public database.

## ✅ a public-registry READ is not a "state contact"

> MVDP §12.1 — "**'State contact' means any communication with respect to a tax
> type from state personnel to a person.**"

a search page returns a database row: not a communication **from state
personnel**, no file opened, no one told who you are. the check costs no lever.

⛔ what *would* spend a lever, and is a different act entirely: a nexus
questionnaire (§12.1 names it explicitly), a phone call to a revenue agent, an
online registration, or a filed return.

## .the two registries

### Texas — franchise tax account status

```
https://comptroller.texas.gov/taxes/franchise/account-status/search
```

three fields: `taxpayerId` (11-digit TX number **or 9-digit federal EIN**),
`name`, `fileNumber`. **search by EIN**, per the trap below.

playbook: `refs/tx-franchise-account.probe.play.ts`

⚠️ **this is the COMPTROLLER, and it answers the tax question only** — the right
registry for MVDP §4.2's first prong (*"registering … with respect to that tax
type and state"*). ⛔ a clean result carries **no signal** about a Secretary of
State registration, a separate duty that was **not probed** here.

| the Texas question | agency | probed here? |
|---|---|---|
| is there a **franchise tax** account? | **Comptroller** | ✅ yes, by EIN |
| is the entity **registered to transact business**? | **Secretary of State** | ⛔ **no** |

this mirrors Florida, where sunbiz answers the Secretary-of-State question and
Revenue publishes no lookup — **the two states are probed on opposite sides**.

📄 the Secretary of State duty, and why it is not the tax duty:
`registrator/briefs/incorporation/foreign-registration/hazard.foreign-registration.state=texas`

### Florida — Sunbiz corporate registry

```
https://search.sunbiz.org/Inquiry/CorporationSearch/ByFeiNumber
```

search by **FEI/EIN**. this answers both the registration question and the
`Fla. Stat. §607.1501` certificate-of-authority question at once.

playbook: `refs/fl-sunbiz-registration.probe.play.ts`

both playbooks read the needle from a **gitignored** `.scratch/*-needle.txt`,
so no entity identifier lands in a tracked file, and the command line stays
constant across queries.

---

## ⚠️ FOUR ways these registries report a false absence

each **looks** like "not registered" and is not. all four were measured on
these two sites. run the controls.

### 1. too many matches renders ZERO rows

a Texas name search for `DELL` returned an **empty table**, with prose above
the form:

> "**Search will return 644 entries. Please refine search by Entity Name.**"

⭐ **the fix:** capture the site's own prose verdict, not only its table.

### 2. an empty result is a PLACEHOLDER ROW, not an empty table

a genuine Texas miss renders a DataTables placeholder:

```
["Name", "Taxpayer Number", "Zip"]
["No data available in table"]
```

so `rowCount` is **2** for a miss and **2** for a single hit. a naive
`rows.length > 0` test calls every miss a match.

⭐ **the fix:** count **data** rows — drop the header, drop the placeholder.

### 3. the name search is PREFIX, not substring

`DELL TECHNOLOGIES` matches. `ECHNOLOGIES INC` matches none, though the
entity plainly contains that string.

so a name-based negative only proves *no registered name begins with your
needle*. it is worthless if the legal name carries a leading article, a
different word order, or a d/b/a.

⭐ **the fix:** search by **EIN / FEI**, which is name-independent. treat a
name negative as a hint and an identifier negative as a result.

### 4. Sunbiz returns a POSITIONAL WINDOW, not a match set

a Sunbiz FEI search starts at your term and continues **numerically**, so a
search for an unregistered FEI returns ~20 healthy rows about **other
companies** (illustrative):

```
needle NN-NNN0100
  ->  NN-NNN0101   AN UNRELATED LLC
      NN-NNN0108   ANOTHER UNRELATED LLC
      ... 18 more, none of them yours
```

- "I got 21 rows" is not "I got a match"
- the window is *also* the proof of absence: it steps past your number to the **next** one
- ⛔ never publish a real window: neighbor names plus their FEIs let a reader recover your own FEI (`rule.require.deterministic-redaction` — redact for the **recipient**)

⭐ **the fix:** filter to rows whose identifier **equals** the needle exactly,
and report the window separately as evidence.

---

## 🎯 always run a POSITIVE control first

an empty harvest has more causes than a genuine absence, and three of the four
above are indistinguishable from one. so never accept a negative until a needle
you **know** is present has come back positive through the same code path.

the controls used here, and what each proved:

| needle | proved |
|--------|--------|
| `DELL` (TX name) | the too-many-matches prose path |
| `DELL TECHNOLOGIES` (TX name) | the harvest renders real rows |
| `ECHNOLOGIES INC` (TX name) | the match is prefix, not substring |
| `ZZQXVWPLK NONESUCH HOLDINGS` (TX name) | what a genuine miss looks like |
| Dell's 11-digit TX number | the identifier path works |
| a known FL FEI (Office Depot) | Sunbiz exact-match filter works |

without the negative control you cannot tell an empty table from a broken
selector; without the positive, a broken selector from a real absence.

---

## ⛔ Florida DOR publishes NO public registration lookup — checked

sunbiz answers the **Department of State** question. the **Department of
Revenue** question — "is there a tax account?" — has no public equivalent.

DOR's e-services hub lists "Retrieve Certificate or Account Number" and
"Florida Business Tax Application", both at
`taxapps.floridarevenue.com/taxregistration` — a **login wall** (checked
2026-08-31):

```
controls: UserName (text) · Password (password) · btnLogin · btnRegister
copy:     "For returning users, enter your user profile credentials…"
```

it is the **application portal**, not a registry: no anonymous search, and the
retrieval path presupposes you already hold the account. a genuine dead end —
the DOR question goes to the human.

⚠️ **do not "just try" the retrieval flow.** online registration forfeits the
Florida lever, and this portal's primary button is `btnRegister`.

### 🚩 the two agencies are not the same

| question | agency | public registry? |
|---|---|---|
| is the corporation registered to do business? | Dept of **State** (sunbiz) | ✅ yes, by FEI |
| is there a **tax** account? | Dept of **Revenue** | ⛔ **no** — login only |
| has DOR **contacted** the taxpayer? | Dept of Revenue | ⛔ no, and never will be |

a clean sunbiz result answers the first row only, and says none of the second
or third.

## .what a clean negative DOES and does NOT establish

| ✅ it establishes | ⛔ it does not |
|---|---|
| no account/registration exists under that identifier | that no **contact** was received — a letter or questionnaire is invisible here |
| the §4.2 *registration* prong is satisfied | that you are not under a nexus **investigation** (MVDP fn. 2 says an applicant "will ordinarily not know of their ineligibility before they apply") |
| a look-back cap is still on the table | that a **different** EIN was never used |

so a clean read removes one disqualifier out of several. ask the human about
correspondence received before you treat the lever as available.

## ⛔ and a HIT is the MORE expensive error — it is checked nowhere above

the traps above all grade a **negative**. walk both branches:

| the registry says | you conclude | you do | if the read is wrong |
|---|---|---|---|
| **absent** | not registered | **disclose** | the lever was already spent. ⚠️ covered — the four traps above |
| **present** | already registered | **stand down** | ⛔ **you never disclose, and the window stays open forever** |

a false absence costs you a lever you had already lost. a false presence costs
you a lever you **still held** — and the window it would have capped is the
uncapped one: Tex. Tax Code §111.205(a)(2) and Fla. Stat. §95.091(3)(a)5 both
read *"at any time"* against a non-filer.

### the mechanism is the SAME prefix fact, run forward

§3's prefix match, run forward:

> ⛔ **a prefix hit is not proof you found YOUR entity.** a common name stem
> matches every registrant that shares it. `DELL` prefix-matches
> `DELL TECHNOLOGIES`, `DELL FINANCIAL`, `DELL MARKETING` — distinct
> registrants, one needle.

a name hit on a shared stem can belong to a stranger, and invites *"we are
already registered, stand down."* the same cure applies: probe by **EIN /
FEI**.

### what a HIT does and does not establish

| ✅ it establishes | ⛔ it does not |
|---|---|
| **a** registration exists under that identifier | that it is **yours** — confirm the EIN/FEI, not the name |
| if matched on **EIN/FEI**, the §4.2 registration prong is forfeited | that every state is spent — the prong is per state **and per tax type** |
| the cap is off the table **for that state and tax type** | that a disclosure is pointless elsewhere; re-run the check per jurisdiction |

⛔ **the per-tax-type narrowness holds for a REGISTRATION and not for a
CONTACT.** §4.2 lists three prongs; only the first two are inherently
type-scoped. the third carries a default that runs the other way:

> "If a state contact does not specify a specific tax type, it is construed to
> be with respect to **all tax types**."
> — MVDP Procedures §4.2, `refs/effectiveAt=2025-07-21.…:82-83`

so a registry hit is narrow, and an unspecific **letter** is broad. do not
carry the narrow read across to the correspondence question — and note that a
registry read cannot see correspondence at all (see the negative table above).

neither direction of a name search is a result; only an identifier search is.

## .enforcement

- a voluntary-disclosure move made without a prior registry check = **blocker**
- a registry negative reported from a **name** search alone = **blocker**
  (prefix semantics; use the identifier)
- a registry negative reported without a positive control through the same
  code path = **blocker**
- a row count reported as a match count on a positional-window registry =
  **blocker**
- a registry **hit** reported from a **name** search alone = **blocker**
  (prefix semantics cut both ways; confirm the EIN/FEI)
- a disclosure **stood down** on a hit whose identifier was never confirmed =
  **blocker** (the costlier error — it leaves an uncapped window open)
- a **registration** hit on one state or tax type read as spent in another =
  **blocker** (§4.2's first two prongs are per state **and** per tax type)
- an unspecific **state contact** read as narrow to one tax type = **blocker**
  (§4.2 construes it to reach **all** tax types)

## .see also

- `../limitations/state=texas/lever.mtc-disclosure-caps-an-uncapped-window.md`
  — the 4-year MTC cap this check protects, and §4.2's forfeiture terms
- `../nexus/state=texas/shield.no-duty-below-the-bright-line.md` — the order
  hazard: a nexus questionnaire is itself a §12.1 contact
- `rule.require.bhrowser-citations` — the general form of these traps, and why
  a healthy byte count settles none of them
