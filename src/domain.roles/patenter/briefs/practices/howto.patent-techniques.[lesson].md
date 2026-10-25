# howto.patent-techniques

> ⚠️ **not legal advice.** this brief helps you find what to ask; confirm it for your facts with a licensed attorney.

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
| "comprising" | open — does not exclude unrecited elements or steps | default choice, broadest protection |
| "consisting of" | closed — excludes any element not specified | narrow scope needed |
| "consisting essentially of" | middle ground — see the ⛔ below before you reach for it | ⚠️ **almost never, unless the spec does the work** |

> **MPEP 2111.03 I** — "The transitional term 'comprising', which is synonymous
> with 'including,' 'containing,' or 'characterized by,' is **inclusive or
> open-ended and does not exclude additional, unrecited elements or method
> steps**."
>
> **MPEP 2111.03 II** — "The transitional phrase 'consisting of' **excludes any
> element, step, or ingredient not specified in the claim**."

### ⛔ "consisting essentially of" — which way it cuts, and why it usually buys no narrowness

> **MPEP 2111.03 III** — "The transitional phrase 'consisting essentially of'
> limits the scope of a claim to the specified materials or steps **'and those
> that do not materially affect the basic and novel characteristic(s)'** of the
> claimed invention."

the direction is the reverse of the intuitive one:

| an unrecited addition that... | is |
|---|---|
| does **not** materially affect the basic and novel characteristics | ✅ **let in** — the claim still reads on it |
| **does** materially affect them | ⛔ excluded |

#### the part that decides whether the phrase operates at all

> **MPEP 2111.03 III** — "For the purposes of searching for and applying prior
> art under 35 U.S.C. 102 and 103, **absent a clear indication in the
> specification or claims of what the basic and novel characteristics actually
> are, 'consisting essentially of' will be construed as equivalent to
> 'comprising.'**"

**if the specification never says what the basic and novel characteristics are,
the examiner reads the claim as fully open.**

and the burden runs against you:

> **MPEP 2111.03 III**, citing *In re De Lajarte*, 337 F.2d 870 (CCPA 1964) —
> "If an applicant contends that additional steps or materials in the prior art
> are excluded by the recitation of 'consisting essentially of,' **applicant has
> the burden of showing that the introduction of additional steps or components
> would materially change the characteristics** of the claimed invention."

**the practical rule:** reach for "consisting essentially of" only when the
specification already states, in terms, what the basic and novel characteristics
are. otherwise use "comprising" and get the same construction with fewer words
to defend.

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
| **"consisting essentially of" with no basic-and-novel statement in the spec** | **the phrase is read as "comprising" — the narrowness you paid for does not exist** | state the characteristics in the spec, or use "comprising" |

---

## .publishability

☀️ **fullsun** (share) — generic claim-draft and prior-art-search technique over public patent law; no client identity or client-specific mechanic.

## .sources

the transitional-phrase section was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. no WebFetch or WebSearch summary stands
behind any quote.

| what | url | chars |
|------|-----|------:|
| MPEP 2111 (the **container** — holds 2111 through 2111.05) | `https://www.uspto.gov/web/offices/pac/mpep/s2111.html` | 87,537 |

pulled 2026-09-01, as the whole container: the three transitional phrases are
defined by contrast with each other.

⚠️ the decisive paragraph is ~7,000 chars, so `rg` prints `[Omitted long matching
line]`; the "construed as equivalent to 'comprising'" rule was found by a read of
the body, never by the grep.

## .see also

- `define.patent-fundamentals` — the term, the response period, and the
  rejection grounds, each with its statute

## .date researched

2026-09-01

(taken from the brief's own .sources, "pulled 2026-09-01, as the whole container")

