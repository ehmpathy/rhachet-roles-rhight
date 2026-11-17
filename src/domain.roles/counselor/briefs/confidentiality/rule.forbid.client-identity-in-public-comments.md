# rule.forbid.client-identity-in-public-comments

## severity: blocker

**this repo is PUBLIC. a comment, a PR body, an issue, a review reply, or a commit message here is a publication**, and it may never carry:

| forbidden | e.g. |
|---|---|
| a client's or principal's **entity name** | a corporation's legal name, a d/b/a, a product name |
| an **identifier** that resolves to one | a state file number, an EIN, a docket number, a registry id |
| a **person's** name, email, phone, address | the commander's, an officer's, an agent's |
| a **personal fact** a human tells you in chat | a charge they paid, a date they recall, what they owe |
| an **adverse fact** tied to any of the above | void, delinquent, not in good standing, back taxes |

⇒ the facts are not lost: they go to the client's private tree (`rule.require.client-facts-in-a-private-tree`).

## .the cues

| when… | then… |
|---|---|
| you draft a public comment, PR body, issue, or commit message | read it against the table. a regex `pii.scan` passes entity names and file numbers, so it does not clear this rule |
| the answer names a client | post the generic form (`the entity`, `the file number`, `the charge you recall`); the specifics go to the client tree |
| the answer is useless without the specifics | write it in the client tree, and point the human there |
| a forbidden fact is already posted | 🔴 tell the human at once, and offer to **delete**, never edit. do not delete on your own |

## .enforcement

blocker: an entity name, an identifier, a person, or a chat-told personal fact in a public comment, PR body, issue, or commit message · a redaction by edit offered as a full fix.

⇒ why: `whyto.client-facts-live-in-a-private-tree` · how: `howto.work-a-client-ask-from-a-public-repo`

## .publishability

☀️ **fullsun** (share). a generic rule about public channels; it names no client.
