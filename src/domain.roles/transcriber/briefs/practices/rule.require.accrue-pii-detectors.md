# rule.require.accrue-pii-detectors

## .what

when you meet a class of identifier the gate cannot see, **the gate grows before the work moves on.** a new class found is a roster entry, and — where it has a stable shape — a new detector plus a clamp.

the other PII rules say what the gate must do; this says how the gate learns.

## .why

- a fixed detector list decays. the next corpus brings shapes nobody anticipated — a state file number, an envelope id, a name control derived from an entity name — each invisible to every regex already written
- these classes surface mid-task, when their discovery feels like a detour. so the default is that a human notices, works around it, and the gate never learns — and the class escapes again next time
- measured: `rule.require.provable-pseudonymization` named three classes from a real corpus — the IRS-derived **name control**, **DocuSign envelope ids**, **state file / registry numbers** — and none became a detector or roster entry. the brief learned; the gate did not

> a class found and not accrued is a class that will be found again — and
> eventually one of those times, the gate is the only thing that was looking.

## .the trigger

accrue when you meet a value **in real data** that the gate does not catch.

⚠️ do not accrue speculatively. a detector for a shape nobody has produced is a false-positive source with no offsetting catch — and a report that cries wolf trains its readers to skip it.

## .the ladder — reach for the LOWEST rung that works

| rung | when | cost |
|------|------|------|
| 1. **roster entry** | the value is specific to this corpus — a name, an address, one registry number | one line, zero false positives, permanent |
| 2. **detector with a checksum** | the class is general AND self-verifying (Luhn, mod-97, a weighted digit) | near-zero false positives |
| 3. **detector on shape alone** | the class is general and has a distinctive fixed shape | needs a negative case, see below |
| 4. **rubric line** | the class has no shape at all — a quasi-identifier, a judgment call | steers the brains, catches none deterministically |

**rung 1 handles most cases.** a regex answers an open-world question ("is there a name here?") and can only guess; the roster answers the closed-world one ("is THIS name here?") exactly, offline, for every future commit. reach past it only when the class is genuinely general.

## .the bar for a new detector

a detector earns its place with all four:

1. **the formatted AND the bare form.** SS-4 field 7b stores an SSN with no dashes, so a dashed-only pattern reports a clean scan on a live SSN.
2. **a negative case that proves it does not fire on the near miss.** `[0-9]{3}-?[0-9]{2}-?[0-9]{4}` matches the ZIP+4 `19899-2044` perfectly — found only because a case was written for the shape that *should* pass.
3. **a checksum where one exists.** an ABA routing number, a Luhn'd card, an IBAN: verify rather than guess. this also disambiguates a class that collides with one already covered.
4. **a dogfooded clamp.** remove the detector, watch the test go red, restore it. a clamp never seen to fail is a guess.

## .the discovery loop

the brain layer is the **discovery** mechanism, deliberately not the enforcement one:

```
pii.review          a brain names a class no regex saw
      │
      ▼
.pii-map            the pair goes in the map
      │
      ▼
pii.scan --roster   caught deterministically, offline, forever after
```

a brain's finding is **a roster entry and a detector request** — never a standing verdict. a class that stays only in the brain's head is re-discovered at brain prices, non-deterministically, on every future commit.

## ⚠️ the allowlist is not an accrual

when a scan fires on a genuinely safe value, `.pii-allow` is correct and this rule does not apply. check the direction first:

- *"the scanner is too noisy here"* → a detector defect papered over one line at a time. fix the detector
- *"this specific value is synthetic"* → the allowlist doing its job
- the tell: a second, third, and fourth line of the same shape means you are muting a detector, not allowing a value

## .enforcement

- a new identifier class met in real data and not accrued = **blocker**
- a class named in a brief but absent from the roster or the detectors = **blocker**
- a new detector with no negative case for the near-miss shape = **blocker**
- a new detector that matches only the formatted form = **blocker**
- a detector added for a shape not observed in real data = **nitpick**
- an allowlist entry that mutes a detector defect = **nitpick**, fix the detector

## .see also

- `rule.require.pii-scan-before-commit` — the gate this grows
- `rule.require.provable-pseudonymization` — where the map lives, and the three
  classes that went unaccrued
- `rule.require.clamp-edge-cases` (mechanic) — the dogfood bar a new clamp meets
- `pii.scan --roster` — rung 1
- `pii.review` — the discovery layer that feeds the map
