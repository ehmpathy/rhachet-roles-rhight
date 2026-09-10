# rule.require.bhrowser-citations

# tldr

## severity: blocker

**every citation must be captured through `bhrowser`.** WebSearch and WebFetch are **insufficient** —
neither one puts the source's actual, complete text in front of you.

- **WebSearch** returns snippets. a snippet cannot tell you whether its lines are the author's
  conclusion, a position they rejected, or a point they expressly declined to reach.
- **WebFetch** returns a *summarizer model's paraphrase* of a page — which silently truncates, drops
  context, and is defeated outright by blocks, redirects, and javascript apps.

the browser is the backbone. **literally always.** it is the default path, not an escalation ladder.
the moment text will be quoted, you are already in the browser.

---
---
---

# deets

## .what

a citation is a promise that the source says what you claim it says. that promise can only be kept if
you have read the **actual page**, complete and unsummarized.

`bhrowser` (`repo=bhrowser/role=playwright`) drives a real browser and returns the real DOM. that is
the only mechanism in this repo that satisfies the promise for a web source.

## .why

### WebSearch returns snippets, and a snippet has no rank

a search result strips a sentence from its argumentative position. you cannot see, from a snippet,
whether the sentence is:

- the court's holding, or the argument of the party who **lost**, quoted so it can be rejected
- current text, or a superseded version the page quotes for contrast
- a point the source **expressly declined to decide**

the citation can be real, the quote verbatim, and the conclusion **still false**.

### WebFetch returns a paraphrase, not the page

WebFetch pipes page content through a small model with your prompt. what returns is that model's
paraphrase. three failure modes, all silent:

1. **truncation** — the model returns a fragment that reads like a quote
2. **paraphrase drift** — near-verbatim text that is not verbatim
3. **hard defeat** — `403` / `402` / `429`, redirect interstitials, javascript-only apps, and
   analytics-only bodies all return "content" that contains no source text at all

### the evidence — all observed in this repo

| case | what happened | what the browser would have given |
|------|---------------|-----------------------------------|
| **eCFR** (`47 C.F.R. § 64.1200`) | WebFetch got a `302` to an unblock interstitial. the official text was unreachable; a mirror was substituted | the official regulation text |
| **`47 U.S.C. § 227(c)(5)`** ⚠️ | the summarizer returned `"up to $500 in damages for each such violation, whichever is greater"` — which **does not parse standalone**, the classic truncation tell. a later pull off the official House OLRC text proved the quote **faithful**: the incoherent phrase is Congress's own words. **the tell fired on a true quote** — and only the source could settle which it was. that same pull surfaced a statutory affirmative defense in the paragraph that the fetch pass never recorded | the same words, plus the safe-harbor sentence that follows |
| **Oklahoma statute** | `404`. no recovery path, so a load-bearing claim stayed unverified and had to be demoted to "recall" | the statute, via search + navigation |
| **Texas statutes portal** | a javascript app that returns no statutory text to an automated fetch; a prior brief fell back to public-law mirrors | the rendered page |
| **`IMC v. FCC` (11th Cir. 2025)** | WebSearch returned **seven** law-firm alerts, all "the FCC's one-to-one consent rule was vacated". **not one** carried footnote 1 — *"The 2012 Order is not at issue in this case."* — which **inverts** the naive read, since the 2012 Order is what requires written consent | the full opinion |
| **`Guzorek`** (prior session) | an api snippet supported "the claim arguably survives". the full opinion said **"we do not decide"** on that exact question, and a companion case had gone the other way. **the cite was real, the quote verbatim, and the conclusion false** | the full opinion |

the last two are the point of this rule. a summary is not a lossy copy of the truth — it is
**reliably lossy in the direction that removes the caveat**, because caveats are what summarizers cut
first. and the caveat is usually the whole result.

⚠️ **the `§ 227(c)(5)` row is kept deliberately, because it cuts the other way.** the summarizer's
quote looked truncated and was not — the statute itself reads that way. an honest evidence table
must hold the case where the suspicion was wrong, or it teaches paranoia instead of method. **the
rule is not "assume the fetch lied." the rule is "you cannot know without the source."** and note
what the re-pull still bought: an affirmative defense in that same paragraph that no one had seen.

## severity: blocker

a wrong citation is worse than an absent one: it carries borrowed authority. a reader — or counsel —
who relies on a paraphrase that dropped a "we do not decide" acts on a claim the source never made.
that is the exact failure the whole research discipline exists to prevent, and it has already
happened twice in this repo. the cost of the browser is a few seconds; the cost of the paraphrase is
a false conclusion with a real citation attached to it.

## .the rule

| source type | acceptable for a citation? |
|-------------|---------------------------|
| WebSearch snippet | ❌ **NO** — may discover candidate urls, and that is its whole job |
| WebFetch output | ❌ **NO** — a summarizer's paraphrase, not the page |
| api response snippet | ❌ **NO** — may hand you a url or an id; never a quote |
| **`bhrowser` capture** | ✅ **YES** — quote verbatim |
| **full document read** (a PDF read end-to-end as a document) | ✅ **YES** — quote verbatim; see `.the narrow document exception` |

## .how

```sh
# 1. start the browser (headful is expected, not exceptional)
rhx browser.start --mode HEADFUL

# 2. navigate + interact via a playbook
rhx browser.action --play <playbook.play.ts>

# 3. capture the real DOM
rhx browser.snapshot.html --focused
#    or: --tab N --url '<pattern>' to assert you captured the tab you meant

# 4. quote verbatim from the capture, then
rhx browser.stop
```

- **default to headful.** some hosts refuse headless on every path. do not narrate an escalation
  ladder — just open it.
- **check the byte count** on any capture. under ~2,000 bytes means you captured block pages, not
  content.
- **assert the url** with `--url 'pattern'` so you cannot quote from the wrong tab.

### before you quote a judicial opinion

grep the captured text, in this order, before you take the passage you came for:

1. `we do not decide` / `we need not reach` — the reservation that voids the claim
2. `which applies` — the choice-of-law or standard-selection the snippet omitted
3. `we affirm|reverse|remand` — the disposition, which is not always what the logic implies

## .one failure is the whole budget

an http shortcut is permitted **only** when it plainly works on the first try and the text will not
be quoted. the moment it resists — `403`, `402`, `429`, a redirect notice, an analytics-only body, an
incoherent fragment — **that path is over.** do not retry it, do not vary the query, do not wait out
a rate limit. open the browser.

## .the narrow document exception

a **complete document read** satisfies this rule where the browser is not required to obtain it:
a PDF fetched and read **end-to-end as a document** (not summarized) is the source itself, page
numbers and all. this is how the `IMC v. FCC` opinion and the ISO `CG 00 01 04 13` form were quoted
reliably in this repo.

the exception is narrow and has three conditions:

1. the **whole document** is read, not a summarizer's answer about it
2. the quote is traceable to a **specific page** you actually viewed
3. the document is the **authoritative artifact** (an official pdf), not a rehost of unknown fidelity

an api that returns document *text* in full also qualifies. an api that returns *snippets* does not.

## .exceptions

- **well-known, non-controversial facts** (e.g. "AM Best rates financial strength")
- **internal repo references** — cite the file path and line
- **url discovery** — WebSearch and apis remain the right tools to *find* what to open

## .enforcement

- a quote sourced from a WebSearch snippet = **blocker**
- a quote sourced from a WebFetch output = **blocker**
- a claim about a court's holding made without the opinion text = **blocker**
- an http path retried after its first refusal, instead of a move to the browser = **blocker**
- a capture under ~2,000 bytes treated as content = **blocker**
- a quote that does not parse standalone (the truncation tell) shipped without a re-pull = **blocker**
  — the duty is the **re-pull**, not a verdict of guilt. the source may vindicate the quote, as
  `§ 227(c)(5)` did. you cannot know which without it, and that is the whole point

## .see also

- `rule.require.seven-distinct-citations.[rule].md` — the count bar (≥ 7 distinct sources per doc)
- `rule.require.webfetch-citations.[rule].md` — **superseded by this rule.** its
  WebSearch-is-insufficient half still holds; its "WebFetch is acceptable" half does not
- `rule.require.externalized-knowledge.md` (mechanic) — research first, always cite
- `motto.not-legal-advice.[motto].md` — the not-advice frame these citations ride under

## .the mantra

> the browser is the backbone. literally always.
>
> a snippet cannot tell you what a source **declined** to say.
> a summary cuts the caveat first — and the caveat is the result.
