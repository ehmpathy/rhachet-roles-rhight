# rule.forbid.guessed-urls

## .what

**every url you open must have been harvested from a page you already opened.**

- never construct one from a plausible slug
- never transplant a url pattern that worked on one section to another
- never try three variants to see which lands

if you cannot point at the link you took it from, you hold a hypothesis, not a
url. go find the link.

## ⛔ .why — THE ACCESS HAZARD COMES FIRST

a guessed url that misses is **the signature of a crawler**, and it is recorded
as such.

a human session produces approximately **zero** 404s — every path it requests
is one the site just handed it. a **burst** of dead requests is the cleanest
automation tell a server has.

```
a human session:    click -> click -> click        0 dead requests
a guess session:    /revival/  404
                    /reinstate/ 404
                    /renewal/  404                 3 dead requests, 30 seconds
```

that second trace is indistinguishable from path enumeration. the site knows
your trace, not your intent — and the penalty lands on the **operator**:

> "The Division of Corporations strictly prohibits mining data. Excessive and
> repeated searches that may have a negative impact on our systems and customer
> experience are also prohibited. **Use of automated tools in any form may
> result in the suspension of your access to utilize this service.**"
>
> — [Delaware DCIS eCorp portal](https://icis.corp.delaware.gov/ecorp/logintax.aspx),
>   pulled via bhrowser

⇒ a guessed slug on a filing portal trades a ten-second nav walk for a risk to
**the account that has to make the filing**, taken on the principal's behalf
without their knowledge. to the server, you are them.

### .the second why — it is RUDE

each guess is a request the server answers, logs, and serves for naught. a nav
walk costs 1–2 real page loads and yields a **correct** url; a guess costs N
requests and yields a *probably* wrong one.

### .the third why — a MISS can read as an ANSWER

the correctness hazard, documented at length in `rule.require.bhrowser-citations`.
a guessed url fails in **five** shapes, four of which pass every guard:

| shape | what you get | caught by |
|---|---|---|
| hard 404 | a real error page | ✅ the byte count, usually |
| **soft 404** | exit 200, full site chrome, "are you lookin' for one of these topics" | ⚠️ only a read of the body |
| **collapsed slug** | a real, healthy, correctly-typed page — **the home page** | ⚠️ only a size-collision check across pulls |
| **adjacent page** | a genuine document that answers a **different** question | ⛔ none. it passes everything |
| ⛔ **STALE REVISION** | **the right document, at an obsolete version** | ⛔ none — **and it answers your exact question, wrongly** |

⭐ **the stale revision is the worst**: right form, right agency, right host,
right topic — and figures years out of date. it can **retract a correct fact**
and publish the retraction under a real quote and a real `.gov` url, so a
reader who verifies is punished harder than one who does not.

## 🚩 .the measured record — n=7, and every one was preventable

| the guess | what came back |
|---|---|
| `corp.delaware.gov/revival/` | **404**, 1,625 ch. the revival form is reached from `/corpforms/` → **DOCUMENT TYPE** |
| `comptroller.texas.gov/taxes/audits/` | **soft 404**, exit 200, 974 ch. the live path is `/taxes/audit/` — singular |
| `comptroller.texas.gov/taxes/no-tax-due.php` | **974 ch** — the homepage, by redirect |
| `comptroller.texas.gov/taxes/nexus.php` | **974 ch** — the homepage, by redirect |
| `mtc.gov/nexus-program/…` ×3 | **4,796 ch each, byte-identical.** every guard passed; the site collapses unknown slugs to its home page. the real path was `/nexus/` |
| `govinfo` + `uscode.house.gov` title-15 §381 | **1,052 ch** "Page Not Found" and **128 ch** `docnotfound`. the slugs were **transplanted** from a title-26 pull where they worked |
| ⛔ `corpfiles.delaware.gov/renewalvoid16.pdf` | ⭐ **SUCCESS — at a `rev. 08/16` revision.** 6,134 ch of genuine Delaware form text, stating a **stale `$169.00`**. the current form is `Corp_Forms/Revival%20void.pdf`, **`rev. 08/2023`**, `$189.00` — reachable only by four harvested hops |

- the stale pull "corrected" a right `$189` to `$169` across three briefs, and
  survived a figure sweep because each occurrence sat inside a correction
- **read the slug**: the `16` in `renewalvoid16.pdf` is the `rev. 08/16` stamp.
  every re-check asked *does the source carry it?* and none asked *is this the
  right document?*
- a pattern proven in one title of a publisher is still a **guess** in another;
  the dead transplant then read as `agree: false` — *the publishers disagree* —
  when the truth was *one url was dead*

## ⛔ .a correction is a claim — audit its SOURCE first

a correction arrives with borrowed authority: it already survived one round, so
the next reader treats it as settled.

| when you write or read a correction, ask | because |
|---|---|
| **was the url that drove it harvested?** | the question the stale-revision case skipped |
| does the source carry a **revision stamp**, and does the slug encode one? | `renewalvoid16` → `rev. 08/16` |
| does it **retract** a figure, or add one? | a retraction can un-fix a correct fact |
| did the sweep cover the **source**, or only the **figure**? | a struck number with a live link to its source re-grows |

## ✅ .how to earn a url instead

| you need | do this |
|---|---|
| a document an agency publishes | open the agency's own site, walk its nav, click through |
| a form by category | most agencies index forms by **entity type** and **document type** — both are links |
| a statute by section | construct **only** from a url pattern you verified on that same publisher, in that same title. a pattern from another title is a guess |
| "what exists on this topic" | run the search **inside the browser**, then open a result |
| a page whose directory index is a dead stub | open a **known-good page in that directory** and harvest **its** nav — a deep page usually knows its own peers |

### ⛔ harvest UNFILTERED

**do not filter a discovery harvest on the word you expect.** a filter answers
*"is my keyword here?"*, never *"what is here?"*.

- measured: a filter on `disclos` across four hubs returned two false
  positives; the entries that mattered read `Audit`, `Penalty Waivers`,
  `Practitioners' Corner`
- measured: `reviv|renew|restor` over `/corpforms/` returned **zero**; the
  unfiltered dump held `ENTITY TYPE` and `DOCUMENT TYPE`

**dump every link. read the list.** an empty filtered harvest is
indistinguishable from a page with no links.

### 🚩 when a nav walk genuinely dead-ends

the escalation order — **none of the rungs is a guess**:

1. open a **peer page** inside that directory, harvest its nav
2. look for the agency's own **search box**, and use it
3. check for a **printable / PDF** version of the same content
4. ⛔ **ask the human.** a url they can find in ten seconds is not worth a
   probe that costs them their access

## .the one narrow exception

a url pattern is permissible **only** when all three hold:

- the publisher **documents** it as an API or a url scheme, or you verified it
  on that exact publisher **and** that exact collection
- it is parameterized over a value you hold (a section number, a date), not
  over a guessed *name*
- a miss is **loud** — it returns an error, not a page

`ecfr.gov/api/versioner/v1/full/<date>/title-26.xml?section=...` qualifies — a
documented API over parameters you hold. `corp.delaware.gov/<topic>/` does
**not** — the topic is a guessed name and the miss is quiet.

## 🚨 .A QUERY IS A URL — the rule extends to what you type into a SEARCH BOX

**a search box is a url with a form in front of it.** a query that matches no
record is a dead request logged against the operator exactly like a 404.

```
a human session:   type the name they want -> read the result        1 query
a probe session:   type the name they want                           1 query
                   type a fragment to see how the matcher behaves    1 dead query
```

measured: a probe that harvested every url correctly then submitted a name
**fragment** to a state registry to test whether its matcher anchors at the
start of a field — under the same prohibition quoted above, captured in the
probe's own output. a rule scoped to one input channel reads as complete while
the sibling channel stays open.

### ⛔ the question that was never asked: IS IT ALREADY ON DISK?

that live query was unnecessary too: a prior pull on disk already carried the
answer, closeable by a read of a local file at zero requests.

> **a request budget spends the OPERATOR's access, so the first move is always
> a read of what you already hold.** grep the probe output, the yields, and the
> committed source bytes before any live request.

### ⚠️ a row count needs a positive control

the same probe reported `rowsData: 9` against **one** real result row — the
other eight were page chrome (an FAQ paragraph, a `Required Field` label, the
prohibition notice) from a `table tr` harvest on a **layout** table. reported as
"9 entities match", that is a fabrication from a faithful pull.

⇒ pair every count with **a positive control you can name** — e.g. the
operator's own record must appear — and check the count against it.

## .enforcement

- a url opened that was not harvested from a page already opened = **blocker**
- ⛔ **a query submitted that is not a real value you hold** — a fragment, a
  variant, a probe string — = **blocker** (this is enumeration with a form in
  front of it)
- ⛔ **a live request made for a fact already present in a prior pull on disk**
  = **blocker**
- a row/result count reported without a control that proves the harvest = **blocker**
- a url pattern transplanted across publishers, titles, or collections = **blocker**
- two or more variants of one url tried to see which lands = **blocker**
  (this is enumeration, and it is what the prohibitions above name)
- a filtered link harvest used for **discovery** = **blocker**
  (an empty result is unfalsifiable)
- a claim built on a pull whose url was never traced to a link = **blocker**
- a dead-end reported without the four escalation rungs walked = **nitpick**

## .see also

- `rule.require.bhrowser-citations` — the correctness half: what a pull must be
  before it can be cited, and every guard a guessed url defeats
- `hazard.subject-lines-are-routing-keys` (registrator) — the same lesson in a
  different channel: a machine-shaped artifact gets machine-shaped treatment
