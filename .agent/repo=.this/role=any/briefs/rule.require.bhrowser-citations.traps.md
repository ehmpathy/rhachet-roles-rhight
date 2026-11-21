# rule.require.bhrowser-citations.traps

## .what

the pull traps met while citations were earned with bhrowser — each a way a pull
can pass a naive check and still be wrong. a zoom-in of
`rule.require.bhrowser-citations.[rule].md`, which carries the rule itself
(bhrowser always; WebFetch and WebSearch never). reach for this file when a pull
looks short, empty, identical to another, or too clean.

## the byte-count check is not optional

| pull | chars | what came back |
|------|------:|----------------|
| `ecfr.gov/current/title-26/...` | 867 | CAPTCHA at `unblock.federalregister.gov` |
| `ustaxcourt.gov/resources/rules/Rules.pdf` | 1,168 | site chrome; the PDF body never rendered |

both would have produced a confident citation to a page never read. **a `.pdf`
url does not guarantee PDF text** — the "full PDF read" exception applies only
when the body actually came through, and the byte count is how you know.

## ⚠️ the byte count is a TRIGGER TO INSPECT, not a verdict

`26 U.S.C. § 6001` came back at **1,688 chars** — under the threshold — and was
complete: a genuinely short statute. so the heuristic has a false-positive rate
above zero:

| pull is short and... | conclusion |
|----------------------|------------|
| body is CAPTCHA / nav chrome / a 404 | ❌ blocked — re-pull or escalate |
| body is the operative text, start to finish | ✅ fine — short source, cite it |

a suspicious *shape* obligates a re-read, never a verdict — in either direction.
*"a perfect record"* and *"truncated"* are both verdicts from a proxy signal.

## sites that block automation: find the API, do not give up

eCFR and FederalRegister return an interstitial to browsers that bars automated
collection and directs callers to their APIs. the API returns the government's
own XML — source text, not a summary — so it **satisfies this rule**:

```
https://www.ecfr.gov/api/versioner/v1/full/<YYYY-MM-DD>/title-26.xml?part=1&section=1.6012-2
```

when a publisher blocks the rendered page, an official API or bulk-data endpoint
is still a first-party source. a summary is never the fallback.

### 🚩 the eCFR API needs a date it has an ISSUE for — and TODAY may not be one

measured: `.../full/2026-09-01/title-26.xml` returned a **160-char** payload —
no 4xx, no error, a well-formed empty answer. `2026-08-01` returned **7,172
chars** for the same section.

- the byte count flags it but cannot name the **date** as the cause
- ⭐ **the tell was the SIZE COLLISION**: two *different* sections both came back
  at **exactly 160**. distinct queries with byte-identical answers were
  defaulted, not answered
- ask for a date the publisher has an issue for — the start of a recent month —
  and capture a short pull's **body**, not only its length:

```ts
head: comparable.slice(0, 400),   // so a short pull's body is on the record
```

## cross-cite the decisive quote — and compare by EQUALITY TEST

for a quote a decision rests on, pull it from **two independent publishers** and
compare programmatically — an eyeball across two files is a hand-comparison, and
one altered word in a statute changes the law:

```ts
const take = (file, needle) =>
  fs.readFileSync(file, 'utf-8').split('\n')
    .map((l) => l.trim()).find((l) => l.includes(needle)) ?? null;
return { agree: take(a, needle) === take(b, needle) };
```

**a length mismatch is a question, not a verdict.** investigate every delta,
report the cause:

| passage | delta | cause |
|---------|------:|-------|
| 26 CFR §1.6012-2(a)(2) | 30 ch | Cornell inlines the section title `"(2) Existence of corporation. "`; eCFR separates it |
| 26 U.S.C. §172(b)(1)(A)(ii)(II) | 1 ch | `(II)in` vs `(II) in` — a renderer artifact |

### ⛔⛔ SLICE THE SECTION BEFORE YOU SEARCH IT — the container makes a needle AMBIGUOUS

this rule mandates two things that **interact badly**, silently:

1. **pull the CONTAINER, not the section** (below — an exception lives in an
   adjacent section)
2. **cross-cite by equality test**, with a needle

a statute's neighbours are drafted in **parallel**, so an unscoped `.find()` over
the container returns a **verbatim, correct quote of the wrong section**.

> measured: Delaware's RULONA runs §4323 "in this State" / §4324 "in another
> state" / §4325 tribe / §4326 federal, each with parallel (a)/(b)/(c) clauses:
>
> ```
> §4323(c) … paragraph (a)(1), (a)(2), or (a)(3) … conclusively establish
> §4324(c) … paragraph (a)(1) or (a)(2)          … conclusively establish
> ```
>
> the needle `conclusively establish the authority of the officer` matched
> **§4323** in a 44,658-char subchapter pull — read at face value, ⛔ **the exact
> inverse of §4324**. `agree: false` on the equality test is what caught it.

**the move:** slice the section out **before** any search, with a named end
marker, and **refuse on a missed start marker**:

```ts
const sliceSection = (lines: string[], from: string, until: string) => {
  const at = lines.findIndex((l) => l.startsWith(from));
  if (at === -1) return { lines: [], ok: false };   // ⚠️ REFUSE, never fall through
  const rest = lines.slice(at);
  const end = rest.findIndex((l, i) => i > 0 && l.startsWith(until));
  return { lines: end === -1 ? rest : rest.slice(0, end), ok: true };
};
```

- **report the slice verdict** in the run's output — a `sliced: false` makes
  every quoted line below it untrustworthy, and the run otherwise looks clean
- this does **not** relax the container rule: pull the container, keep it, read
  around the section — slice **only for the needle search**

### ⛔ compare in ONE RUN — two of your OWN runs corroborate your NOTES

measured: a clause of 26 CFR § 301.6011-5(a)(1) pulled from Cornell in one round
and the eCFR API in a later one was about to be recorded as cross-published —
**no comparison had ever run.**

| what you have | what it proves |
|---|---|
| the quote in round 2's output, and again in round 3's | you read it twice |
| `agree: true` from a run that fetched both | the publishers agree |

the first row **looks stronger** and is unverified. a decisive quote earns **its
own round**: fetch both, extract, assert equality, report the delta.

### ⚠️ compare the SENTENCE, not the LINE

publishers wrap at different points, so a line-equality test reports a false
disagreement from layout. compare the sentence that holds the needle:

```ts
line:
  b.lines
    .find((l) => l.includes(needle))
    ?.split(/(?<=\.)\s+(?=[A-Z(])/)
    .find((s) => s.includes(needle))
    ?.trim() ?? null,
```

even that can differ benignly (measured: a Cornell capture was a **superset by
31 chars** because it kept the form's name on the same line). diagnose it — never
report it as a divergence.

### 🚩 `agree: false` is MOST OFTEN A DEAD URL, not a divergence

| second publisher | chars | what came back |
|------------------|------:|----------------|
| `govinfo.gov/…USCODE-2023-title15…sec381.htm` | 1,052 | "Page Not Found" |
| `uscode.house.gov/…granuleid:USC-prelim-title15-section381` | **128** | `docnotfound` redirect |

both url patterns were **transplanted from a title-26 pull where they worked** —
slugs are not uniform across titles. a **128-char** pull is a redirect stub, and
should stop the analysis before it flows into an `agree: false` that reads like
a result.

the diagnostic order:

```
agree: false
  1. is each pull a real document?           <- byte count + open the body
  2. did the needle match the RIGHT SECTION? <- the container hazard
  3. only then, is there a delta?            <- and diagnose its cause
```

### 🚩 to compare two EDITIONS of a PDF, never diff the extracted lines

`pdftotext` wraps each PDF to *its own* layout, so a line diff of two editions
reports the whole document as changed. measured: MTC MVDP Procedures,
2022-11-16 vs 2025-07-21 — `diff -U0` returned **45.7 KB of change** over
near-identical substance.

| do | instead of |
|----|------------|
| grep the old edition for each provision the brief quotes | diff the extracted lines |
| collapse whitespace into an `asComparable` copy first, if a whole-document answer is truly needed | trust a raw `diff` over `pdftotext` output |
| record which needles were checked | report "diffed" and imply completeness |

the probe settles **the provisions you named**, never the full delta.

## 🛑 for a back-year question, pull the EDITION for that year

a statute moves, and the current page renders cleanly with no tell.
`26 U.S.C. § 168(k)`, pulled for a **2023** asset:

| pull | §168(k)(1)(A) reads | correct for 2023? |
|------|---------------------|-------------------|
| Cornell, current | a flat **"100 percent"** | ❌ no |
| govinfo, **2023 edition** | "the applicable percentage" → (k)(6)(A)(ii) → **80 percent** | ✅ yes |

§168(k)(6) — the entire phase-down table — was **repealed 2025-07-04** by
Pub. L. 119-21. a current-text citation would have put 100% on a return entitled
to 80%. **govinfo publishes the US Code by edition year**:

```
https://www.govinfo.gov/content/pkg/USCODE-<YYYY>-title26/html/USCODE-<YYYY>-title26-<subtitle>-<chap>-<subchap>-<part>-sec<N>.htm
```

the same caution applies to agency publications and form instructions — a
Pub. 946 (2025) claim about a 2023 year is a lead, not authority.

## the ABSENCE of a match is itself a result

a one-sided miss (`foundInB: false`) invites a looser needle. **do the opposite:
read the other document.** two of nine comparisons missed in one pass, and both
were real repeals.

## ⭐ pull the CONTAINER, not the section — the exception lives elsewhere

a targeted pull returns a section that reads like a complete answer; the
provision that reverses it sits a few sections away. every guard passes.

Tex. Tax Code §111.201 says no tax "may be assessed after **four years**." four
sections later:

> §111.205(a) — "The limitation provided by Section 111.201 **does not apply**
> and the comptroller may assess a tax imposed by this title **at any time**
> if… (2) **no report for the tax has been filed**."

the mirror case: §171.201 and §171.202 were amended in 2024 to open "Except as
provided by Section 171.2022," and **§171.203 was not** — legible only when all
four sit in one document.

| do | instead of |
|----|------------|
| pull the whole chapter, then slice the subchapter | pull the one section |
| keep the rule and its exceptions in ONE artifact | separate files per section |
| slice **in code**, re-runnably | copy the range by hand |

- slice with a **named end marker**, and refuse when the start marker misses —
  else the whole document lands under a filename that promises a slice
- **read the tail, not only the head**: an end marker at §111.301 dragged in ~50
  unrelated sections; moved to §111.251, the slice fell to 9,539 chars, ending
  at the `SUBCHAPTER E` header

> **when a rule has enumerated exceptions, the exceptions are part of the
> rule.** the unit of retrieval is the container, never the section.

## ⭐ when a directory's INDEX is a stub, harvest a PEER page's nav

| hub | chars | disclosure links |
|-----|------:|------------------|
| DOR home | 3,490 | 0 |
| DOR taxes & fees | 1,410 (a **real** page) | 4, all under `/compliance/` |
| `/taxes/compliance/Pages/default.aspx` | **16** — a dead stub | 0 |

the Florida DOR voluntary-disclosure page was invisible to all three hub walks,
and the chrome carried no search box.

> **the move:** open a **known-good page inside that directory** and harvest
> **its** navigation. a deep page usually knows its own peers.

⚠️ do not trust an agency's **printed** url over the one you walked — the
program's brochure printed a url form that differs from the live path.

## 🚩 a page can pass EVERY guard and still be incomplete

an agency program page pulled at **2,093 chars** — real text, correct url — had
its two most useful sections (*"What taxes are eligible?"*, *"How do I apply?"*)
as **collapsed accordions**; only their titles came through.

| what you see | what it means |
|--------------|---------------|
| a title with no text under it | ⚠️ an unexpanded control, not an empty section |
| a healthy byte count | says none of whether the body rendered |

the tell is **structural**: a title followed at once by another title. a needle
search just reports `null`, the same as a genuine absence.

### ⭐ the CHEAPER fix — `textContent`, not a click

most accordions are in the DOM, merely unrendered:

| read | honors `display: none`? | returns |
|------|---|---|
| `document.body.innerText` | ✅ yes — it is a **rendered-text** read | only what painted |
| `document.body.textContent` | ⛔ no | **every node's text** |

**measured, on `corp.delaware.gov/agents/`:**

```
innerText   3,593 chars      <- what the first pull recorded
textContent 500,652 chars    <- the same page, same load, same session
hidden      497,059 chars    <- 99.3% of the document
```

- **the delta IS the proof** — report both numbers from any page with a
  disclosure widget
- that first pull passed **every** guard on this page and was wrong by two orders
  of magnitude
- reach for `textContent` before a click: **a click is an ACT and a read is not**
  (`rule.forbid.guessed-urls` — an interaction is a request on the principal's
  account); failing that, the agency's own **PDF** of the content
- 🟡 `textContent` includes `<script>`/`<style>` bodies — an upper bound on
  prose. never cross-compare an `innerText` figure against a `textContent` one

### ⛔ A LINK HARVEST CANNOT ATTRIBUTE A ROW

hrefs arrive in **DOM order with no name attached**, so assigning one to a row
means counting positions between named neighbors — an inference dressed as a
reading:

```
…legalcorpsolutions.com   <- a row you CAN name
"Dismiss"                 <- a row with no link. WHOSE?
…maplesfs.com             <- a row you CAN name
```

a row that publishes no channel contributes no link, so it is invisible — and the
reader concludes "between these neighbors" when the truth may be "absent from
the list." measured: the agent sought was **not on the directory**. a harvest
answers *what channels exist*; only a **whole-text read** answers *whose they
are*.

## 🚩 a slice marker can miss on an INVISIBLE character

flsenate's `innerText` separates a section **number** from its **title** with a
whitespace char that is **not** U+0020. a marker typed with a plain space missed:

- both render identically, on screen and in grep output
- a needle that stops before the separator (`'95.091'`) matched, so the title
  looked present
- `rg '95\.091 Limitation'` → **no matches**, while `rg '95\.091\sLimitation'`
  → **2**

⚠️ **when a string you can SEE in one tool cannot be matched by another, suspect
the whitespace.** do not guess which char (U+00A0 was wrong) — map the whole
**length-stable** class:

```ts
// every char below maps ONE-TO-ONE onto a space, so indices stay valid —
// search the comparable copy, slice the ORIGINAL, keep the bytes faithful
const asComparable = body.replace(
  /[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ');
```

- the refusal guard made this recoverable: it returned `ok: false` three times
  rather than emit a 61,923-char chapter under a filename that promised a
  4,402-char section
- on a page with a table of contents, the TOC entry and the section body are
  **byte-identical up to the em-dash** — the start marker must include it

## 🚩 a SOFT 404 — exit 200, real chrome, and the wrong page entirely

`comptroller.texas.gov/taxes/audits/` returned **974 chars, exit 200**: *"Welcome
to Comptroller.Texas.Gov / Are you looking for one of these topics?"*. the live
url is `/taxes/audit/`. the same day, a real page came back at **1,410** and a
dead stub at **16** — all "short"; only the body separates them. detect it by the
site's **own copy**:

```ts
const SOFT404 = 'are you looking for one of these topics';
const soft404 = text.toLowerCase().includes(SOFT404);
```

## 🚩 a site can COLLAPSE every unknown slug to its home page

three guessed `mtc.gov/nexus-program/…` urls all came back at **4,796 chars, 301
links, `soft404: false`**:

| guard | verdict on the collapsed page |
|-------|-------------------------------|
| byte count | ✅ healthy — well over the threshold |
| content-type / magic bytes | ✅ correct, real html |
| soft-404 string | ✅ absent — the site never says "not found" |
| a needle probe | ⚠️ answers about the **home page**, silently |

⭐ **the tell is the COLLISION** — distinct urls with byte-identical bodies:

```ts
const bySize = new Map<number, string[]>();
for (const p of pulled)
  bySize.set(p.chars, [...(bySize.get(p.chars) ?? []), p.slug]);
const collided = Array.from(bySize.entries())
  .filter(([, slugs]) => slugs.length > 1)
  .map(([chars, slugs]) => ({ chars, slugs }));
```

a multi-url pull must compare its pulls against each other; a single-url pull
cannot detect this. recover by reading the **unfiltered nav** of the page served
— here, the real path was `/nexus/`.

## ⭐ the INVERSE — a TRUE collision, and the trap it hides

```
274.gov.2022  62,286 chars  ┐
274.gov.2023  62,286 chars  ├─ byte-identical
274.gov.2024  62,286 chars  ┘
```

a size check cannot tell a collapsed year segment from an unchanged statute. use
a control **you must be able to fail**:

| probe | chars | what it proved |
|-------|------:|----------------|
| § 274, **2018** edition | 61,685 | the year segment is honored |
| § 274, **1899** — a year with no edition | 566 · "Page Not Found" | ✅ the control fails as it must |
| **§ 262**, 2022 edition | 1,457 | the section segment is honored |

the identity is real — **and the RATE moved anyway.** § 274(n)(2)(D) allows a
full deduction for restaurant meals *"paid or incurred **before January 1,
2023**"* — a date limit inside the subsection, printed verbatim in the 2024
edition. a needle search for `100 percent` got **zero hits**: (D) is drafted as
an exception and never states a percentage. **the provision that suspends a rate
need not mention the rate.**

| the check | what it can see |
|-----------|-----------------|
| byte count | whether a page loaded |
| size-collision across pulls | whether the site collapsed your slugs |
| an edition **diff** | whether the TEXT moved |
| ⭐ **a read of the container** | whether the **RATE** moved |

slice the container (the `(n)` header to the `(o)` header) and read every clause.

## 🚩 a SEARCH BOX can DROP your query and return the whole corpus

flrules.org's search box, filled with the chapter prefix `12-13`, returned:

> "**Total number found: 1212**" · 30 pages · chapters `59C`, `65C`, `6A`,
> `11B`, `62` …

the site's **entire rule list** — healthy, genuine, and irrelevant. no guard here
catches it. the tell is the **harvest**: the row filter came back empty against
a page that plainly had rows.

| do | instead of |
|----|------------|
| harvest rows, then **assert the harvest is non-empty** | trust that the page rendered |
| on an empty harvest, **read the captured body** | conclude "no results exist" |
| record the query **format** that worked | assume any query format works |

an empty harvest has three causes that look identical: a wrong selector, a
genuine absence, or **a query the site discarded**. the site wanted a full
section number (`12-13.007`); a broader query can return a **less** relevant
corpus rather than a superset.

## 🚩 a "NOT PULLED" note is a claim with a TIMESTAMP — the url can rot first

a gap note that names a remedy url decays with the url. measured:
`texreg.sos.state.tx.us`, recorded as the second publisher that would close a
gap, later returned **171 characters**:

> "This Site Has Moved. You will be redirected shortly to the new site."

— a host migration and a JS portal with no constructible urls. only the byte
count gave it away. **when you cite a route as the remedy for a gap, walk it.**

## 🚩 a REGISTRY can render ZERO rows because it matched TOO MANY

the Texas Comptroller's franchise tax account-status search, queried for `DELL`:

```
rows harvested: 0
prose above the form: "Search will return 644 entries.
                      Please refine search by Entity Name."
```

a table-only read concludes *"Dell has no Texas franchise tax account."* **the
verdict is in the PROSE**:

```ts
const refine = /Search will return ([\d,]+) entries/.exec(text);
// refine !== null  ->  AMBIGUOUS, not absent. narrow the needle and re-run.
```

## 🚩 an "empty" table may be a PLACEHOLDER ROW

```
["Name", "Taxpayer Number", "Zip"]      <- header
["No data available in table"]          <- placeholder
```

`rows.length === 2` for a miss **and** for a single hit — the inverse of the
trap above, live on the **same page**. count **data** rows: drop the header, drop
the placeholder, then decide.

## 🚩 a POSITIONAL WINDOW returns healthy rows about OTHER records

Florida's Sunbiz FEI search returns a window that **starts at your term and
continues numerically**:

```
needle XXXXX0001
  ->  XXXXX0002   <an unrelated LLC>
      XXXXX0009   <an unrelated LLC>
      XXXXX0010   <an unrelated LLC>
      ... 18 more, none of them yours
```

**21 rows, exit 200, healthy byte count, real agency data, zero relevance.**
(the digits and names are placeholders — another company's tax id does not
belong in a public repo even when a registry lists it;
`rule.require.deterministic-redaction`.)

⭐ **filter to rows whose key EQUALS the needle.** the window is itself a
stronger proof of absence than an empty result:

```ts
const exact = rows.filter((r) => r[0] === needle);
// exact.length === 0  AND  rows.length > 0  ->  positively absent
```

## ⭐ a MATCH may be PREFIX rather than substring — test which

`DELL TECHNOLOGIES` matched; `ECHNOLOGIES INC` matched none. so a name negative
proves only *"no record's name BEGINS with my needle"*, which a leading article,
a word order, or a d/b/a defeats. **probe an identifier instead** — an EIN, a
file number — and test the match semantics with a mid-string needle first.

## 🎯 the family rule: run a POSITIVE CONTROL through the same code path

the dropped query, the too-many render, the placeholder row, the positional
window, and the prefix match each produce a result **indistinguishable from a
genuine absence**. a negative is worthless alone:

| control | proves |
|---------|--------|
| a needle you **know** is present | the selector, the fill, the submit, the harvest |
| a needle you **know** is absent | what a real miss looks like on THIS site |
| a **mid-string** needle | whether the match is prefix or substring |
| a deliberately **broad** needle | whether the site refuses to render at scale |

⚠️ the negative control is the one usually skipped — without it you cannot tell an
empty table from a broken selector.

## ⭐ a KEYWORD FILTER answers only about its keyword

do not filter a discovery harvest on the word you expect. measured: a filter on
`disclos` across four hubs returned two false positives (`Vulnerability
Disclosure`, `Opioid Settlement`); the entries that mattered read `Audit`,
`Penalty Waivers`, `Practitioners' Corner`, `State Tax Automated Research (STAR)
System`.

> a filter answers *"is my keyword here"*. it never answers *"what is here"*.

## ⭐ read the ADMINISTRATIVE FURNITURE, not only the operative text

the highest-value find of one pass was an ALERT banner atop an unrelated letter
ruling:

> "ALERT: Effective 12/29/2019, Rule 3.586 (relating to nexus for franchise
> tax purposes) was amended to include an **economic presence test**…"

| furniture | what it tells you |
|-----------|-------------------|
| an alert / amendment banner | a rule moved under you, and when |
| a "superseded on `<date>`" note | the holding you are about to cite is dead |
| an endnote on citation form | which code "Rule" and "Section" refer to |
| a history / source-credit line | whether your edition is the one you meant |

the same letter carried *"Document superseded on: 04/28/2023 … overturned by
Sirius XM Radio, Inc v. Hegar (2022)"* — which retired a holding that would
otherwise have been quoted as live.

## escalate to headful before you call a source unreachable

| source | headless | headful |
|--------|---------:|--------:|
| Justia (Cloudflare) | 262 ch | **4,934 / 13,253 ch** |
| CourtListener | 513 ch | **8,172 ch** |

headful with a `networkidle` wait plus a few seconds clears most shells. a source
is not unreachable until **headful has also failed** (the U.S. Tax Court site
failed both, across four urls and a govinfo mirror — and the claim stayed open).

## a `.pdf` url does not give you pdf text

a browser tab hands back a **viewer shell**. fetch the bytes through the request
context, then extract with `pdftotext` — deterministic, per
`rule.forbid.hand-transcription`:

```ts
const res = await page.request.get(url);
fs.writeFileSync(out, await res.body());   // then: pdftotext -layout
```

measured: three IRS pdfs → 304k / 171k / 47k chars, where a tab-load yielded
1,168 chars of chrome.

⚠️ where the server sends an attachment, the url fails as a **crash**, not a bad
pull — it reads as a broken playbook:

```
page.goto: Download is starting
```

measured: a batch of five aborted on the fourth, and three good pulls were lost
with the run. branch on the extension:

```ts
if (url.endsWith('.pdf')) {
  const res = await page.request.get(url);
  fs.writeFileSync(pdfAt, await res.body());
  execFileSync('pdftotext', ['-layout', pdfAt, txtAt]);
  continue;
}
await page.goto(url, { waitUntil: 'networkidle' });
```

### ⚠️ the EXTENSION branch above is not enough — the SERVER decides

the same download error fired on an **`.asp`** url whose bytes were a legacy
`.doc` (`application/msword`):

```
https://www.flrules.org/gateway/notice_Files.asp?ID=25834027
```

the extension describes the handler, not the payload. **branch on the RESPONSE**
— fetch through the request context (which never raises on an attachment) and
sniff the **magic bytes**:

```ts
const res  = await page.request.get(url);
const body = await res.body();
const head = body.subarray(0, 8);

const isPdf = head.subarray(0, 4).toString('latin1') === '%PDF';
const isDoc = head.toString('hex') === 'd0cf11e0a1b11ae1';  // OLE compound doc

if (isPdf) {
  fs.writeFileSync(pdfAt, body);
  execFileSync('pdftotext', ['-layout', pdfAt, txtAt]);
} else if (isDoc) {
  fs.writeFileSync(docAt, body);
  execFileSync('soffice', ['--headless','--convert-to','txt:Text','--outdir',OUT,docAt]);
} else {
  fs.writeFileSync(rawAt, body);   // report the content-type; do NOT guess
}
```

- record `res.headers()['content-type']` either way — on the `else` branch it is
  the only record of what came back
- `soffice` is a **deterministic extract** too, never a re-type by eye
- `soffice` is permission-blocked from the Bash tool — run it inside the
  playbook (see `howto.run-an-unregistered-skill`)

### 🚩 administrative rules are VERSIONED, like statutes

one pull surfaced **three effective editions** of one rule — `2022-05-23`,
`2013-10-29`, `2001-10-02` — with no hint which a bare link lands on. harvest the
rows **with their dates**, open an edition deliberately, and put the date in the
committed filename (`effectiveAt=2022-05-23.…`).

## batch the pulls

read a `<slug> <url>` list from a file and loop inside one playbook. emit a
**per-source byte count and an `ok` flag** so a shell cannot slip through
unnoticed.

## case law: open the opinion, never quote the snippet

a search index (CourtListener, Google Scholar) is a **discovery tool**; its
result rows are snippets. find the case, then **open the opinion** and quote its
text. (*In re Russell* was found by snippet and quoted only from the opinion.)
