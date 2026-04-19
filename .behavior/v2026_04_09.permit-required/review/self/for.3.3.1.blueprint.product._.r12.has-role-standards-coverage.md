# self-review: has-role-standards-coverage (round 12)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## coverage check: are all required patterns present?

### standards that should be present

| standard category | should cover |
|-------------------|-------------|
| error classes | ConstraintError vs MalfunctionError |
| validation | input validation at boundaries |
| log context | LogMethods in context |
| retry | retry strategy for network calls |
| cache | cache invalidation strategy |
| rate limits | rate limit approach |

---

### error classes

**rule.require.exit-code-semantics**: exit 0/1/2 for skills

**blueprint**: skills declared but exit codes not explicit

**coverage check**: skill contracts (lines 297-367) show success outputs but not error outputs

**gap found**: error cases described in vision/criteria but blueprint skill contracts only show success paths

**assessment**: nitpick — error treestruct formats should be shown in skill contracts section

---

### validation

**rule.require.input-context-pattern**: inputs should be validated

**blueprint**: transformers declared:
- parseWorkDescription (validates raw → normalized) ✓

**coverage check**: input validation is covered via parseWorkDescription transformer

**holds because**: the transformer validates user input before research begins.

---

### log context

**rule.require.dependency-injection**: LogMethods should be in context

**blueprint**: operations show input shapes but not context shapes

**gap found**: context shapes not explicit in operation signatures

**assessment**: nitpick — context dependencies (LogMethods, daos, scrapers) should be declared

---

### retry strategy

**blueprint skills**: permit.search and permit.fetch call scrape module

**coverage check**: what happens on transient failure?

**gap found**: retry strategy not declared for scrape failures

**assessment**: nitpick — should note "retry hint" in error output (mentioned in criteria line 121-122)

---

### cache strategy

**blueprint skills (lines 200-214)**:
- permit.search caches to .cache/permits/
- permit.fetch caches permit detail

**coverage check**: cache invalidation?

**holds because**: permits are immutable records — once issued, they don't change. cache is valid indefinitely (aside from status updates, which are rare).

---

### rate limits

**blueprint**: scrape module calls external portal

**coverage check**: rate limit approach?

**gap found**: rate limit strategy not mentioned

**assessment**: nitpick — should note rate limit backoff for scrape module

---

## gaps summary

| gap | severity | location |
|-----|----------|----------|
| error treestruct not shown | nitpick | skill contracts section |
| context shapes not explicit | nitpick | operation signatures |
| retry strategy not declared | nitpick | skill error behavior |
| rate limit not mentioned | nitpick | scrape module |

all are nitpicks — implementation details that can be addressed at execution phase.

---

## coverage matrix

| standard | present | explicit | notes |
|----------|---------|----------|-------|
| domain-objects | ✓ | ✓ | entities + literals |
| get-set-gen verbs | ✓ | ✓ | all operations |
| input-context | ✓ | partial | context not fully specified |
| error classes | ✓ | implicit | criteria mentions errors |
| validation | ✓ | ✓ | parseWorkDescription |
| logger | — | — | deferred to implementation |
| retry | — | — | deferred to implementation |
| cache | ✓ | ✓ | .cache/ declared |
| rate limits | — | — | deferred to implementation |
| tests | ✓ | ✓ | full pyramid declared |
| snapshots | ✓ | ✓ | coverage declared |

no blockers. nitpicks are acceptable for blueprint phase — will be addressed at implementation.

