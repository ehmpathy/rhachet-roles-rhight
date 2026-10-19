# refs — Florida RON service provider registry

## .what

the exact bytes of Florida's **official** registry of Remote Online
Notarization (RON) service providers, harvested 2026-08-30, plus the
provenance needed to re-pull it.

| file | what it is |
|------|-----------|
| `pulledAt=2026-08-30.sunbiz.ron-service-providers.json` | all **121** registrations · **100** distinct vendor names · the walk record and the completeness assertion |
| `pulledAt=2026-08-30.sunbiz.ron-service-providers.page1.txt` | page 1 as rendered, for a human to eyeball the shape |

source: <https://online-notary.sunbiz.org/ServiceProviders>
publisher: Florida Department of State, Division of Corporations

## ⭐ `pulledAt=`, NOT `effectiveAt=` — and the difference is not cosmetic

the sibling convention at `briefs/jurats/refs/` stamps files `effectiveAt=`,
because a **published form** has an effective window: a jurat printed under the
2019 amendments is correct for acts on or after 2020-01-01 and stale before it.
that date answers "is this the right form for my act?"

a **registry** has no such window. it is a live view of mutable state, and the
only honest thing a filename can say about it is *when someone looked*.

| artifact | stamp | the question the stamp answers |
|----------|-------|-------------------------------|
| a published form, a statute, an agency manual | `effectiveAt=` | is this version the one that governs my act? |
| **a registry, a roster, a rate table, a fee schedule** | **`pulledAt=`** | how stale is this, and must I re-check? |

⛔ **to stamp a registry `effectiveAt=` would assert a guarantee it cannot
make** — that the list is correct as of that date and stays correct until
superseded. a registry is superseded continuously, by every new registrant, and
no notice is published when it happens.

## ⚠️ how to read this snapshot — it is ASYMMETRIC

| the snapshot says | what you may conclude |
|-------------------|----------------------|
| vendor **IS** listed | it was state-registered on 2026-08-30. strong, but re-verify: a registration lapses |
| vendor is **NOT** listed | **very little.** the list grew between the pull and your read. this is NOT evidence the vendor is unregistered |

so a match is a useful signal and a miss is a prompt to go look. any tool built
on this file must report the two outcomes differently, and must never render a
miss as a verdict.

## 🚩 the registry cannot be FETCHED — it must be DRIVEN

this is the finding that shapes everything downstream, and it was verified
rather than assumed:

| attempt | result |
|---------|--------|
| `goto https://online-notary.sunbiz.org/ServiceProviders` | **301 chars**, zero data rows — the page is a SEARCH FORM |
| `goto .../ServiceProviders?handler=viewall` | **301 chars**, zero rows, no pager. the empty form again |
| `goto .../ServiceProviders?pageNumber=1&handler=viewall` | **301 chars**, zero rows |
| `goto .../ServiceProviders?handler=viewall&pageNumber=1` | **301 chars**, zero rows |
| raw request context (what a `curl` would see) | **200 OK, 6,882 bytes, ZERO `<tr>` tags** |

the list exists only after a **click** on the "View All" button. so:

⛔ **`curlViable: false`.** no shell command, `curl`, or HTTP library can read
this registry. a browser must drive it.

### ⚠️ the address bar LIES about this

after the pager walk the URL reads
`?pageNumber=3&handler=viewall` — which looks bookmarkable and reproducible. it
is not; the table above proves a cold GET on that exact URL returns the empty
form.

**a query string that appears after an interaction is not evidence the URL is
fetchable.** test it cold, in a fresh navigation, before any tool is built on
the assumption.

## 🚩 three ways this pull failed before it succeeded

kept on purpose, because each one **exited 0** and looked like a result.

### 1. the byte-count heuristic has a THIRD false-positive class

`rule.require.bhrowser-citations` says a pull under ~2,000 chars is a trigger to
inspect. two false-positive classes were already known — a genuinely short
document, and a page dense in *navigation* (innerText counts almost no links).

this page is a third: **content behind an action**. 301 chars, and the URL was
perfectly correct.

⭐ it is the most dangerous of the three, because the other two at least tell you
to look elsewhere. this one tells you to leave a page you had already reached —
so the natural next move (retreat to a search engine) abandons the
authoritative source at the exact moment of arrival.

### 2. a truncated harvest reported success

the first walk returned `pagesSeen: [{page: 1, rows: 51}]` — no error, no
warning, a plausible number. the page footer read **"Page 1 of 3 · 1 - 50 of
121"**. it had 41% of the list.

⛔ **so the harvest now reads the source's OWN total and asserts
`complete: harvested === statedTotal`.** a row count with no denominator cannot
tell a complete pull from a silent truncation. the committed snapshot carries
`"complete": true`.

### 3. no text selector could ever have matched the pager

two attempts failed on `next` / `»` / a page number. the pager is a bootstrap
`ul.pagination` whose every `button.page-link` is **icon-only** — empty
innerText across the board. the only text in the whole control is the
*disabled* `Page 1 of 3` label.

the fix is positional: the buttons sit in a fixed order
`[first, prev, NEXT, last]`, so next is `button.page-link` index **2**.

⚠️ and a click on a **disabled** control still resolves successfully. the walk
therefore re-reads the page number and stops if it did not move — otherwise the
loop harvests page 1 thirty times and reports 1,500 rows.

## .how to re-pull

```sh
rhx browser.start --mode HEADFUL --session notaryfind
rhx browser.action --session notaryfind \
  --play <ABS>/src/domain.roles/notary/briefs/refs/florida-ron-providers.harvest.play.ts
rhx browser.stop --session notaryfind
```

⚠️ `--play` needs an **absolute** path; a repo-relative one is read as a module
specifier and throws `Cannot find package 'src'`.

confirm `complete: true` in the result before you trust the output.

the probe playbooks beside it are kept deliberately, per
`rule.require.bhrowser-citations` — they record the dead ends walked to their
end, so the next reader does not repeat them:

| playbook | what it establishes |
|----------|--------------------|
| `florida-ron-providers.research.play.ts` | the entry pull, and that `notaries.dos.fl.gov/ron.html` is a **404** — a URL guessed from the domain's shape |
| `florida-ron-providers.pager.probe.play.ts` | the pager markup; and that it can only be probed AFTER the click |
| `florida-ron-providers.getable.probe.play.ts` | the GET-ability test above — the one that settles `curlViable: false` |
| `florida-ron-providers.harvest.play.ts` | the working harvest, with the completeness assertion |

## ⚠️ why these bytes are committed at all

`rule.require.bhrowser-citations` says raw pulls stay uncommitted — large,
re-pullable, and npm leanness matters. the same three grounds that carried the
override for the jurat forms carry it here:

- **small** — one JSON file, well under a megabyte
- **public record** — a state registry of businesses; no PII
- **the brief's value IS the list** — a howto that tells you to "check the
  registry" and then cannot show you the registry has kept its claim and lost
  its evidence

## .see also

- `../../howto.get-a-remote-online-notarization.jurisdiction=usa-florida.md` — what to do with this list
- `../../../jurats/inventory.of=jurat.jurisdiction=usa-florida.md` — the certificate the RON notary must produce, including the ☐ online-notarization box
- `../../../jurats/refs/jurisdiction=usa-florida/readme.md` — the sibling refs set, and the `effectiveAt=` convention this one deliberately departs from

⚠️ the **Main Contact** column is withheld as `[withheld]` in every committed copy — third-party personal names that no skill reads. vendor names, filing dates, and the 121-row count are intact, so the completeness assertion still holds.
