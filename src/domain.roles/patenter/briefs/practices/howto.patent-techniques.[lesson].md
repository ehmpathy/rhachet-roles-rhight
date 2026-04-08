# howto.patent-techniques

## .what

techniques for patent claim drafts and prior art search.

## .why

- claim structure determines scope of protection
- search strategy determines completeness of prior art landscape
- both skills are learnable with the right patterns

---

## claim draft patterns

### claim anatomy

every claim has three parts:

| part | purpose | example |
|------|---------|---------|
| preamble | introduces the invention | "A method for model compression..." |
| transition | links preamble to body | "comprising:" or "consisting of:" |
| body | lists the elements | "a. a neural network; b. a pruning module..." |

### transition word strength

| transition | scope | use when |
|------------|-------|----------|
| "comprising" | open (allows additions) | default choice, broadest protection |
| "consisting of" | closed (exact elements only) | narrow scope needed |
| "consisting essentially of" | hybrid | functional additions ok, non-functional blocked |

### independent vs dependent claims

```
claim 1 (independent):
  "A method for compressing neural networks, comprising:
   a pruning step that removes weights below threshold..."

claim 2 (dependent):
  "The method of claim 1, wherein the threshold
   is determined via magnitude analysis..."
```

**independent**: stands alone, broadest scope
**dependent**: narrows parent claim, fallback if parent invalid

### claim draft checklist

- [ ] preamble identifies invention category (method, system, apparatus)
- [ ] transition word matches desired scope
- [ ] body lists elements in logical order
- [ ] each element is necessary for the invention
- [ ] dependent claims add meaningful narrowness
- [ ] at least one independent claim per category

---

## prior art search strategies

### three-layer search

| layer | method | finds |
|-------|--------|-------|
| keyword | text search on title, abstract, claims | obvious matches |
| classification | CPC/IPC code search | related inventions in same field |
| citation | forward/backward citation analysis | patents the examiner will find |

### keyword search tips

1. **start broad**: use core technical terms
2. **add synonyms**: "compress" + "prune" + "reduce" + "simplify"
3. **combine with AND/OR**: "(neural network OR deep learning) AND compression"
4. **filter by date**: recent patents show current state of art

### classification search

CPC codes group patents by technology:

```
G06N = neural networks
G06F = data process
H04L = data transmission
```

find relevant codes:
1. search for a known relevant patent
2. note its CPC codes
3. search those codes for related patents

### citation analysis

**backward**: what does target patent cite?
**forward**: what cites the target patent?

both directions reveal the technical neighborhood.

### search completeness test

your search is complete when:
- new queries return patents you've already seen
- examiner-cited patents appear in your results
- major players in the field are represented

---

## categorize prior art

### favorable vs adverse

| category | definition | use in application |
|----------|------------|-------------------|
| favorable | supports novelty argument | cite to show state of art, distinguish from |
| adverse | threatens claim validity | address proactively, design around |

### adverse art response tactics

| threat level | tactic |
|--------------|--------|
| directly anticipates claim | narrow claim scope |
| renders obvious in combination | add distinguishing elements |
| similar but distinguishable | emphasize differences in specification |

---

## common mistakes

| mistake | consequence | fix |
|---------|-------------|-----|
| claims too broad | easy to invalidate | add specific elements |
| claims too narrow | easy to design around | broaden preamble |
| miss relevant prior art | rejection surprise | use three-layer search |
| ignore dependent claims | no fallback positions | add claim tree |

