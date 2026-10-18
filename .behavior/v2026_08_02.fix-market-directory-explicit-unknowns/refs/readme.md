# refs — capture playbooks

## .what

the browser-capture playbooks that produced every statutory quotation in this route's briefs.
each is a reproducible record: re-run it and you get the same `.temp/capture/*.txt` the brief cites.

they are kept in full — including the attempts that **failed** — because a capture record whose
failures were deleted cannot be audited. see `rule.require.bhrowser-citations`.

## .how to run

```sh
rhx browser.start --mode HEADFUL --refresh
rhx browser.action --play $PWD/.behavior/<route>/refs/<playbook>.play.ts
```

`--mode HEADFUL` is load-bearing, not cosmetic: several official portals serve a headless-driven
navigation only an app shell.

## .the canonical set

one row per statute actually cited. **run these.**

| statute | playbook | output |
|---|---|---|
| 15 U.S.C. § 1681a (FCRA definitions) | `capture.fcra.1681a.definitions` | `fcra.1681a.txt` |
| 15 U.S.C. §§ 1681b, c, e, k | `capture.fcra.duties` | `fcra.1681{b,c,e,k}.txt` |
| 47 U.S.C. § 230 | `capture.cda.230` | `cda.230.txt` |
| 15 U.S.C. § 1125 (Lanham § 43) | `capture.lanham.1125.false-association` | `lanham.1125.txt` |
| ROP — TX, FL, CA, NY | `capture.rop.five-state` | `rop.{tx,fl,ca,ny}.txt` |
| ROP — IN §§ 32-36-1-1, -7, -8 | `capture.rop.in.retry3` | `rop.in.32-36-1-{1,7,8}.txt` |
| ROP — IN § 32-36-1-6 ("personality") | `capture.rop.in.32-36-1-6.personality` | `rop.in.32-36-1-6.txt` |
| Cal. Civ. §§ 1798.99.80/.86, N.Y. Civ. Rights § 50-g | `capture.suppression-and-sealed-records` | `ca.delete-act.*.txt`, `ny.civrights.50-g.txt` |
| Cal. Civ. § 1798.140 (CCPA definitions) | `capture.ccpa.ca.1798.140.definitions` | `ccpa.ca.1798.140.txt` |
| Cal. Civ. § 1786.18 (ICRAA) | `capture.sealed.ca.1786.18.icraa-limits` | `sealed.ca.1786.18.txt` |
| Tex. Bus. & Com. ch. 109 | `capture.sealed.tx.bc109.criminal-record-vendors` | `sealed.tx.bc109.txt` |
| Ind. Code ch. 24-4-18 (index) | `capture.sealed.in.24-4-18.criminal-history-providers` | `sealed.in.24-4-18.txt` |
| Ind. Code §§ 24-4-18-6, -7, -8 | `capture.sealed.in.24-4-18.sections-6-7-8` | `sealed.in.24-4-18-{6,7,8}.txt` |
| Fla. Stat. § 943.0585 | `capture.sealed.fl.943.0585.expunge` | `sealed.fl.943.0585.txt` |

⚠️ **the five-state ROP sweep covers only four states.** Indiana is deliberately absent from
`capture.rop.five-state` and captured by the two IN-specific playbooks instead — see the lineage
below. the sweep is still five-state; the *transport* differs for one of them.

## .the historical attempts — DO NOT cite, DO NOT re-run

kept as the audit record of what was tried. each is superseded.

| playbook | what it was | superseded by | why it failed |
|---|---|---|---|
| `capture.rop.in.retry` | IN chapter body via iga.in.gov | `retry3` + `32-36-1-6.personality` | the portal is a js app; it served navigation chrome only |
| `capture.rop.in.retry2` | a **probe** of three candidate URL shapes | same | measured which shapes route; none served a chapter body |

⭐ **`retry2` is a PROBE, not a capture, and the distinction is load-bearing.** a capture fetches one
known source and must refuse to persist a read that is not that source, so it asserts a marker and
throws. a probe fetches several *speculative* shapes to learn which routes, so it must survive a
failed candidate and carry on — it deliberately does NOT throw, and it stamps every output
`PROBE … NOT a citable capture`. do not "fix" it to match its siblings.

## .the discipline these files encode

three rules, each learned from a failure on this route:

1. ⭐ **assert a content MARKER, never a byte floor.** Ind. Code §§ 24-4-18-7 and -8 are 704 and 378
   bytes of real statute; the Indiana shell is 4,383 bytes of chrome. **the populations overlap
   completely**, so no length threshold separates them.
2. ⭐ **the marker must be BODY-SHAPED, not a bare section number.** the iga.in.gov shell contains
   the string `32-36-1` because it is the URL fragment; the Justia chapter *index* contains it
   twenty-one times and carries no statutory text. a marker the failure mode also carries is
   decoration. Indiana prints its text as `Sec. N.` — that is the marker.
3. ⭐ **a wait is never the gate.** `waitForSelector` / `waitForFunction` are best-effort and swallow
   *only* a `TimeoutError` (`allowTimeoutOnly.ts`); every other error means a broken browser and
   rethrows. the marker assertion is the gate, and it fails loud with the marker, byte count, and
   url.

## .known gap — flagged, not fixed

⚠️ a peer review (`enroll-impl-arch-defects`) correctly found that the shared unit here is not
`allowTimeoutOnly` but the whole **goto → wait → evaluate → assert-marker → write** sequence, which
repeats across all 16 files. a `captureOneSection({ url, marker, selector, output })` primitive would
collapse it and make the weak-marker defect above *structurally* impossible rather than
caught-by-review.

it is **not done**, deliberately: the refactor touches every citation-producing file, and the
reviewers that would verify it are down on a credential fault (see the route ledger, P39). a large
unverifiable refactor of the citation record is a worse trade than a documented gap. **flagged for
the end-of-road council.**
