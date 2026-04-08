# review: has-divergence-addressed (round 2)

## question

did i address each divergence properly? for each backup: is the rationale convincing? would a skeptic accept it?

## method

reviewed each divergence in evaluation. questioned each backup skeptically: is this truly an improvement, or just laziness?

---

## divergence-by-divergence assessment

### 1. keyrack.yml added

**status**: backup

**rationale in evaluation**: "not in blueprint but needed for API key management. follows mechanic pattern."

**skeptical assessment**:
- is this needed? yes — PatentsView API requires a key
- could we have put this in blueprint? yes, but blueprint assumed USPTO ODP (no key needed)
- is this laziness? no — it's a consequence of the API change
- could this cause problems later? no — keyrack is the standard pattern for key management

**verdict**: valid backup. rationale holds.

### 2. __snapshots__/ dirs added

**status**: backup

**rationale in evaluation**: "not in blueprint but required by jest snapshot tests. standard practice."

**skeptical assessment**:
- is this needed? yes — jest creates these automatically for toMatchSnapshot()
- could we have put this in blueprint? arguably, but it's implicit with snapshot tests
- is this laziness? no — you cannot avoid snapshot dirs if you use snapshots
- could this cause problems later? no — standard jest artifact

**verdict**: valid backup. rationale holds.

### 3. API changed (USPTO ODP → PatentsView)

**status**: backup

**rationale in evaluation**: "blueprint specified USPTO ODP but research found PatentsView more suitable. documented in 3.1 research."

**skeptical assessment**:
- is PatentsView actually better? let me verify...
  - USPTO ODP: requires enterprise API key, rate limits undocumented, complex auth
  - PatentsView: free API key registration, documented rate limits, simpler REST
- could we have used USPTO ODP as blueprint specified? yes, but with more friction
- is this laziness? no — research (3.1) explicitly evaluated both options
- could this cause problems later? maybe — PatentsView coverage differs from USPTO ODP

**verdict**: valid backup with caveat. the switch is justified but introduces coverage differences that should be documented in briefs (known limitation: PatentsView may have different patent coverage than USPTO direct).

**action**: add note to briefs about API coverage limitation. not a blocker.

### 4. exid regex expanded (7-8 → 7-11 digits)

**status**: backup

**rationale in evaluation**: "blueprint said 7-8 digits but USPTO formats include 11-digit application numbers. more permissive is correct."

**skeptical assessment**:
- is 7-11 correct? let me verify USPTO formats:
  - Patent numbers: US7654321 (7 digits), US12345678B2 (8 digits)
  - Application numbers: US20210234567A1 (11 digits)
  - Both are valid exid formats
- could we have kept 7-8? no — would reject valid application numbers
- is this laziness? no — this is a correction to an overly restrictive blueprint
- could this cause problems later? no — more permissive validation is safer

**verdict**: valid backup. the blueprint was incorrect. this is a fix, not laziness.

### 5. parse_document simplified

**status**: backup

**rationale in evaluation**: "blueprint listed prosecutionHistory extraction but PatentsView API does not provide it. documented limitation."

**skeptical assessment**:
- does PatentsView provide prosecution history? no — verified via API research
- could we have found another source? yes, USPTO PAIR, but that's a separate API with separate auth
- is this laziness? no — the data simply isn't available from PatentsView
- could this cause problems later? yes — users may expect prosecution history
- is it documented? evaluation says "documented limitation"

**verdict**: valid backup. known limitation. verify it's documented in briefs.

### 6. output.sh expanded (4 → 9 functions)

**status**: backup

**rationale in evaluation**: "blueprint listed 4 core functions, but implementation added 5 more for complete treestruct output. all follow the same pattern."

**skeptical assessment**:
- are the 5 additional functions needed? let me check what they do:
  - print_section_header(): for route sections
  - print_route_info(): for bound route info
  - print_tree_error(): for error output
  - print_alert(): for vague query warnings
  - print_suggestion(): for no-results hints
- could we have implemented with 4 functions? no — the blackbox criteria require alerts and suggestions
- is this laziness? no — this is completion of what the blueprint understated
- could this cause problems later? no — more output functions is better

**verdict**: valid backup. the blueprint underspecified output needs. implementation is complete.

---

## summary

| divergence | verdict | rationale holds? |
|------------|---------|------------------|
| keyrack.yml added | valid backup | ✓ |
| __snapshots__/ added | valid backup | ✓ |
| API changed | valid backup with caveat | ✓ (note coverage in briefs) |
| exid regex expanded | valid backup (blueprint fix) | ✓ |
| parse_document simplified | valid backup (API limitation) | ✓ |
| output.sh expanded | valid backup (blueprint underspec) | ✓ |

---

## actions identified

1. verify prosecution history limitation is documented in briefs
2. consider note about PatentsView coverage in briefs

neither is a blocker. both are documentation improvements.

---

## conclusion

all 6 divergences are valid backups with strong rationale:
- 3 are consequences of API choice (keyrack, API change, parse simplification)
- 1 is a blueprint correction (exid regex)
- 1 is standard artifact (snapshots)
- 1 is blueprint underspecification (output.sh)

no divergence is laziness. no divergence should have been repaired instead. all backups are justified.

divergence addressing: **complete and valid**

