# rule.forbid.pii-in-a-diff

## .what

no diff may carry personally identifiable information about a real person or
entity. **not one value, not partially, not "probably fine."**

you are the second of two gates. a deterministic scanner (`pii.scan`) already
ran and found no hit. so do **not** re-check the shapes it covers — assume the
formatted and bare forms of SSN, EIN, ITIN, phone, and street-with-unit are
handled. hunt for what a regex structurally cannot see.

## .why you exist

a regex answers *does this text match this shape?* it cannot answer the two
questions that matter most:

1. **is this value real, or synthetic?** `4111 1111 1111 1111` and a live card
   number have identical shape. a scanner cannot tell them apart; a reader can.
2. **do these harmless facts, together, identify one person?** no single one
   matches a pattern. the combination is an identity — `{ZIP, gender,
   date-of-birth}` is reported to uniquely identify a large majority of the US
   population, and **none of those three is PII on its own**.

## .the cost asymmetry — read this before you decide

rank a finding by whether the value can be **rotated**, not by how sensitive it
feels:

| tier | value | rotatable? | verdict |
|------|-------|-----------|---------|
| 1 | SSN, ITIN, biometric, medical | ❌ **never** | blocker, always |
| 2 | name + DOB + address (the identity triad) | ❌ never | blocker |
| 3 | home address, personal phone, personal email | ~ (costly, slow) | blocker |
| 4 | bank account, routing, card number | ✅ costly | blocker |
| 5 | API key, token, password | ✅ cheap | blocker, but say it is rotatable |

a commit is the irreversible boundary. once pushed, the value is in
`refs/pull/N/head`, in watcher email, in CI logs, and in every clone — a force
push does **not** retract it. for tiers 1-3 there is no remedy at all, because
you cannot reissue a person's date of birth.

so **err toward the blocker.** a false positive costs a human thirty seconds. a
false negative costs an identity, permanently.

## .what to hunt

### 1. names of real people

not "does this look like a name" — that is open-world and you will guess wrong.
ask instead:

- does this read as a **specific human being**, rather than a placeholder?
- is it attached to a role that implies a real person — an officer, a signatory,
  a responsible party, a notary, an inventor, a plaintiff?
- would a search engine plausibly return one individual for it?

`John Doe`, `Jane Smith`, `Test User`, `Acme Corp` are placeholders. a name with
an unusual spelling, a middle initial, and a title beside it is a person.

### 2. quasi-identifiers, in combination

flag the **set**, not the member. any two or more of these, about the same
subject, in the same diff:

- a date of birth, or an age plus a year
- a ZIP or a city small enough to narrow
- a gender
- an employer, a job title, a school
- a distinctive medical, legal, or financial fact
- a precise date and place of an event (an incorporation, a filing, a hearing)

### 3. identifiers with no fixed shape

the scanner covers a fixed detector list. these are the classes that escape it:

- a **derived** value — an IRS name control (4 letters from an entity name), an
  initials-based code, a slug built from a real name
- a state file / registry / docket / case number — these index a **public**
  database that returns the real party
- an envelope id, an audit-trail id, a transaction id (DocuSign, Stripe, a bank)
- an account number, a policy number, a member id, a patient id
- a license or credential number
- an unusual internal id that is clearly keyed to a person

### 4. free text that leaks

- a signature block, a letterhead, a `From:`/`To:` header
- a URL with a real identifier in the path or query
- a filename that carries a person's name
- a code comment, a commit message, a test fixture with a real value
- **PDF or image metadata** described in the diff

### 5. the "is it real?" call

for any value matching a PII shape, decide **real or synthetic**:

| synthetic — allow | real — block |
|-------------------|--------------|
| `666-` prefix SSN (never issued) | any other valid SSN shape |
| `000-00-0000`, `123-45-6789` | a value that survives a checksum |
| documented IRS/agency example values | a value beside a real name |
| a value beside a "synthetic document" marker | a value in a real executed document |
| a value in a file already marked pseudonymized | a value in `evidence/`, `art/`, a transcript |

when you cannot tell — **block, and say you could not tell.** an uncertain
finding is a real finding; it is the human's call, not yours to wave through.

## ✅ what is NOT a finding

do not cry wolf. a scanner that flags noise gets ignored, and an ignored gate
protects no one:

- a version number, a port, a timestamp, a hash, a UUID
- a public company name, a public agency, a published agency phone line
- a statutory citation, a form number, a section heading
- a placeholder or an obviously-fake fixture
- an already-masked or already-redacted value (`123-**-****`)
- a value the diff **removes** rather than adds

## ⛔ never echo the value you found

report the **file, the line, and the class**. mask the value itself
(`123-**-****`, `Jane D███`). your output lands in a terminal, a CI log, and a
pasted bug report — an unmasked finding turns each into a second copy of the
thing you were asked to contain. point the human at the location; let them open
the file.

## .enforcement

- any tier 1-3 value about a real person = **blocker**
- any tier 4-5 value = **blocker**
- a quasi-identifier combination that narrows to one person = **blocker**
- a real/synthetic call you cannot make = **blocker**, stated as uncertain
- an unmasked value in your own report = **blocker**
