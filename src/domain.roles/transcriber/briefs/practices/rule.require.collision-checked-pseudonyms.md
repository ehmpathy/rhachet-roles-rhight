# rule.require.collision-checked-pseudonyms

## .what

before a synthetic name enters a map, a fixture, or a published example, check that it does not name a **live product, brand, or registered entity**. a pseudonym that collides with a real company is worse than no pseudonym at all.

**our default example corp is `SANDPINE, INC.`** — collision-checked 2026-08-28. use it unless a document needs a second entity; then coin and check one (see below).

## .why a collision defeats the whole point

a pseudonym has one job: **the reader must clock it as fake on sight** — that stops a synthetic charter from being cited as a record of a real corporation. a live company's name inverts that job:

| the harm | why it lands |
|----------|--------------|
| the example reads as authentic | recognition is the opposite of the signal you wanted |
| a real company appears to file a charter it never filed | our invented facts attach to their name |
| the artifact ships to npm | a collision is published, versioned, and cached |
| the fix is a re-swap, not an edit | the name is threaded through every file, filename, and derived value |

> the name that feels most "real" is the most dangerous one — that is exactly
> the property that makes it collide.

measured (2026-08-28), one check over three plausible names — **two of three collided**, which is why this is a rule rather than a habit:

| candidate | `.com` | npm | exact-name entity | verdict |
|-----------|--------|-----|-------------------|---------|
| **WARMWIND** | 🔴 **live product** — "AI employees in the cloud", a rate card on the page | — | — | ❌ rejected |
| **GULFWIND** | parked, listed at $60,000 | 0 packages | 🔴 **GULFWIND, LLC** — a live Florida registry entity, filed 2008 | ❌ rejected |
| **SANDPINE** | resolves, no live branded page | 0 packages | nearest is a **differently-named** `Sandpine …` company | ✅ adopted |

⚠️ a collision recalled from memory is a lead, never a finding — pull it and confirm before you assert it or wave it off.

## .the bar is RECOGNITION, not uniqueness

no pronounceable English name is unclaimed, and that is fine. the test:

> **would a reader of this artifact mistake the name for a real product?**

three channels decide it, in descending order of weight:

| channel | what a hit means |
|---------|------------------|
| **a live product page** at the obvious domain | ❌ **fatal.** this is the reader's most likely encounter |
| **a package registry** (npm, PyPI) | ❌ **fatal** for a name that ships in a package |
| **a registry entity with the exact name** | ⚠️ **strong reject.** unremarkable for a common word, disqualifying for a coined one |
| a differently-named company that contains the word | ✅ acceptable |
| a parked or for-sale domain | ✅ acceptable — no one is behind it |

## .how to check

```sh
rhx browser.start --mode HEADFUL --session names
rhx browser.action --session names --play <candidate-collision>.play.ts
rhx browser.stop --session names
```

check `<name>.com`, `<name>.ai`, a package registry, and a search for `"<name>" company`. ~2 minutes for a batch.

### ⚠️ isolate each navigation

a shared page lets an in-flight navigation abort the next, which surfaces as a per-target *error* that is really a harness defect. measured: a shared-page pass errored on three of four targets; one tab per target returned clean data for all. give each target its own page and close it after.

## 🏠 our defaults

| slot | name | checked |
|------|------|---------|
| **primary entity** | `SANDPINE, INC.` | 2026-08-28 |
| second entity | *unassigned* — check before you coin one | — |
| **person** | `Eagle Of'Rhight` | unmistakably invented; no check needed — see below |
| ⛔ never | `WARMWIND`, `GULFWIND` | rejected above; do not revive |

`SANDPINE` reads as a plausible corporate name with no brand behind it — rarer than it sounds.

for a **second** entity, coin one and check it. do not derive a near-variant of SANDPINE — that is how a sub-string collision gets into the map (see `rule.require.provable-pseudonymization`).

## 🎯 an ENTITY name should be plausible. a PERSON name should NOT be.

| slot | wants | why |
|------|-------|-----|
| entity | **plausible**, unclaimed | a charter that names `FAKECORP LLC` teaches less; the example's value is that it reads like a real formation packet |
| person | **transparently invented** | a plausible person name is a name some real person has |

- a person name that reads real is an implicit claim about a stranger, and leaves the synthetic read to rest entirely on the marker
- a rejected person name is **not** printed as a tombstone: tombstones are for real companies a reader must avoid (WARMWIND, GULFWIND); to print a rejected person name would ship one more real-seeming name

`Eagle Of'Rhight` cannot be mistaken for a person on file:

- a **given name that is a common noun** — `Eagle`
- an **apostrophe mid-surname**, which almost no surname carries in that shape
- a deliberate misspell of *right* that matches the repo's own name, so a reader inside this codebase knows the origin at once

⚠️ the asymmetry does not weaken the entity check — an entity name still gets the full collision pass.

### ⚠️ keep the apostrophe OUT of paths

the map carries a lowercase pair for the **filename** form: the bare given name — `<real given name> → eagle`, so the output is `atlas.cspa.eagle.transform.md`. an apostrophe in a path is a shell hazard for every downstream reader.

- **illustrate the SHAPE of a swap, never a real pair.** a map pair quoted in a published brief IS a partial map — one real→synthetic pair reverses every artifact it touched (`rule.require.provable-pseudonymization`, "the map is the RE-IDENTIFICATION KEY")
- the swap itself is apostrophe-safe in both channels: `doc.pseudonymize` hands the replacement to perl via `$ENV{FAKE}` and to the path via bash parameter expansion, so neither re-parses it. the constraint is ergonomic, not mechanical

## 🚩 a RENAME leaves orphans, and `--verify` cannot see them

when you change a synthetic value and re-run `--mode apply`, the old output files stay — the skill does not prune what it did not write on this pass.

- measured: a person-name change re-ran cleanly over 9 source files and left **11** in the target; two carried the *old* synthetic name in their path. `--verify` returned **`survivors: 0`**, correctly — it scans for *real* values, and the old pseudonym is synthetic
- ⇒ the same shape as a sub-string collision: a check that passes while the artifact is quietly wrong

after any rename:

```sh
# the counts must match, or you have orphans
rhx globsafe --pattern '<from-dir>/*'
rhx globsafe --pattern '<into-dir>/*'
```

a target count above the source count is an orphan set. remove them, then re-verify.

## .the marker still carries the weight

a checked name is the **second** line of defense. the first is the synthetic-document marker `doc.pseudonymize` writes onto line 1 of every output. a good name lowers the odds of a mistaken read; the marker settles it. never skip the marker because a name check was clean.

## .record the check

a name adopted without a recorded check is indistinguishable from a name someone liked. note the date and what was found — the table above is the format. a check has a shelf life: a parked domain today is a live product next year. re-check before a name enters a **new** published surface.

## .enforcement

- a synthetic name adopted with no collision check = **blocker**
- a name kept after a live product is found at its obvious domain = **blocker**
- a name that exactly matches a registered entity = **blocker**
- a name adopted without a dated record of the check = **nitpick**
- a second entity coined as a near-variant of the first = **nitpick** (substring collision hazard)

## .see also

- `rule.require.provable-pseudonymization` — the swap this feeds, and the
  substring-collision hazard a near-variant creates
- `rule.require.bhrowser-citations` — why the check is a pull, never a
  recollection
- `doc.pseudonymize` — the skill that applies the chosen name
