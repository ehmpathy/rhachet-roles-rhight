# define.conftier

> ⚠️ **not legal advice.** this is a method brief: it makes no independent factual claim. the facts behind it are cited in `howto.vault-client-records-by-conftier` and `whyto.client-facts-live-in-a-private-tree`.

## .what

a **conftier** (confidentiality tier) says who may read a client record, and so where it may live. the lower the number, the tighter the lock.

| conftier | name | holds | lives in | who reads |
|---|---|---|---|---|
| `conftier.0` | **sensitive** | aught with an ssn or itin, unredacted tax returns, id scans, full bank or card account numbers | the client's records vault, prefix `conftier.0/` | named admins, with mfa, on a key of its own |
| `conftier.1` | **confidential** | redacted returns, statements, filings, agency correspondence, founder and equity documents, signed originals | the client's records vault, prefix `conftier.1/` | named admins, with mfa |
| `conftier.2` | *(reserved)* | — | — | — |
| `conftier.3` | **strategic** | strategy, stones, yields, summaries, and the vault manifest | the client's private repo, where the crews work | every reader of that repo, robots included |

`conftier.2` is empty on purpose. a later tier, such as records a named outside party may read, slots in with no renumber.

## .the three rules of the tiers

1. **a file takes its highest tier.** a file that mixes tiers is the lower number, until a redaction removes the higher-tier content. a transcription that holds an ssn is `conftier.0`; the same transcription with the ssn masked is `conftier.1`
2. **an unread file is `conftier.0`.** a scan, a screenshot, or an image-only pdf that no one has viewed may hold aught, so it waits at the tightest tier until a human views it
3. **a repo holds `conftier.3` only.** a repo copies to every clone, keeps every commit, and is read by every crew and every ci run. `conftier.0` and `conftier.1` reach a repo only as a manifest row: path, sha256, size, date, tier. never the bytes

## .why tiers and not repos

the line that matters is not product vs sensitive. it is **who and what reads it**. a client's private repo is read by its people, its crews, its ci, and every machine that clones it. a record that only two people should read cannot live there, however private the repo, because the repo cannot narrow its readers per file and cannot forget a commit.

the vault can: each prefix has its own readers, its own key, and its own audit trail, and a writer can add a record without the ability to read one back.

## .etymology

**conf** (confidentiality) **+ tier**. chosen over:

- `lock.tier`, which reads as a lock on the record rather than a class of it
- `restricted / confidential / internal`, the common corporate names, which collide with each firm's own data-classification policy. a client that already has a policy maps its names onto conftiers; a numbered name does not pretend to be theirs

## .date researched

2026-11-20

## .publishability

☀️ **fullsun** (share). a generic classification; it names no client.

## .see also

- `howto.vault-client-records-by-conftier` — the vault that holds `conftier.0` and `conftier.1`
- `rule.require.client-facts-in-a-private-tree` — where `conftier.3` client facts live
