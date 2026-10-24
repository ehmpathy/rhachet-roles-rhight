## 🖋️ notary

- **scale**: document-level, the act of execution
- **focus**: notarial acts, identity verification, oaths, RON, interstate acceptance
- **maximizes**: documents the receiving agency will actually accept

used to know what a notarization proves, which notarial act a document needs, how
to obtain one (in person or remotely), and how to become a notary.

### ⚠️ deliberately briefs-heavy, skills-light

a notarization is a human act, performed by a commissioned officer, in the
presence of the signer. the value is in knowledge of:

- which act the document needs — **jurat** vs **acknowledgment**. they are not
  interchangeable, and the wrong one gets the filing rejected
- what the notary does **not** certify. they do not vouch for the truth of the
  content, nor for its legality
- whether a remotely-notarized document will be honored by the receiving state

### 💪 skills

#### `notary.find`

check a Remote Online Notarization vendor against the **state's own registry**
of registered RON service providers, or list the registered vendors.

```sh
rhx notary.find --state florida                    # the whole list
rhx notary.find --state florida --retail           # retail-facing only
rhx notary.find --state florida --vendor 'Proof'   # check one vendor
```

⚠️ **the answer is asymmetric, and the skill says so.** a MATCH means the vendor
was state-registered on the snapshot date — strong, but re-verify. a MISS carries
**almost no signal**: the registry grows continuously and vendors register under
a parent name, a d/b/a, or a product name, so a miss is a prompt to look by hand
and is never evidence a vendor is unregistered. it exits `0` either way.

#### those same aliases INFLATE the list — count vendors, not names

one vendor registers under several names, so the printed list is longer than the
set of businesses you can book with: on the 2026-08-30 Florida snapshot,
`--retail` prints **19 names**, roughly **9 vendors**. the alias table:
`briefs/ronproviders/howto.get-a-remote-online-notarization.jurisdiction=usa-florida.md`
§ *🎯 the shortlist*.

⚠️ the output labels the section `vendors` and the figure `distinct names`; read
every count on that screen as a count of **names**.

⛔ **the registry cannot be fetched — it must be driven.** Florida's page is a
search form whose list appears only after a "View All" click; a raw GET returns
`200 OK` with zero table rows. so this skill answers from a **committed,
completeness-asserted snapshot** and prints how stale it is. see
`briefs/ronproviders/refs/jurisdiction=usa-florida/readme.md`.

### 🚫 the boundary with `secretary`

document **production** — letterhead, a rendered cursive signature, placing a
signature onto a PDF — belongs to `secretary`, not here.

the split matters:

> a typed-name-in-cursive signature is valid for ordinary e-signature under
> ESIGN/UETA, and is **forbidden** on a document that needs a jurat. an affidavit
> must be signed in wet ink, in the notary's presence, *after* the oath.

so the signature generator lives with `secretary`, never inside the role named
for notarization, and each role points at the other.

| you want to... | role |
|----------------|------|
| render a signature, brand a document, track a deadline | `secretary` |
| know if this needs a jurat, and who can administer it | `notary` |
| find a RON vendor the state actually registered | `notary` |
| know whether a sworn statement is the right instrument at all | ⛔ **no role** — see below |

that last question is legal advice, which no role here gives — and a notary by
law cannot:

> "a notary may not give legal advice or draft legal papers"
> — [NYC DCA, *Notario Publico*](https://www.nyc.gov/assets/dca/downloads/pdf/consumers/Consumers-Notario-Publico.pdf)

take it to a licensed attorney.

### .see also

- `briefs/jurats/` — the certificate text per jurisdiction; why a jurat is not
  portable across state lines, and the rule that resolves it: **match the form
  to where the signer and notary are, then check the destination's mandatory
  ELEMENTS are all present** — the destination accepts the foreign *form*, and
  that is not a pass on its elements
- `briefs/ronproviders/` — how to get a remote online notarization, and the
  committed state registry behind `notary.find`
- `secretary` — produces the document you bring to the notary
- `registrator` — the agencies that demand notarized filings
