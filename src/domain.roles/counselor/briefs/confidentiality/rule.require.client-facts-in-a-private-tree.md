# rule.require.client-facts-in-a-private-tree

## severity: blocker

**every client fact lives in the client's PRIVATE repo, in a tree the director made, linked into this repo from the route dir, gitignored.** never in this repo, and never only in chat.

```
$route/.client/$org  →  the client's worktree (private repo, own branch)
```

🟡 **inside that tree, persist freely.** names, file numbers, charges, standing, dates, all in full. the tree is what makes the record safe; do not thin it out of caution.

## .the cues

| when… | then… |
|---|---|
| an ask names a client, a person, or their entity | 🔴 before any write: find the private repo, ask the director for a tree, link it |
| you are about to save a capture, a receipt, or a status read | through `$route/.client/$org`, never under `.play/`, `.scratch/`, or `src/` |
| no private repo is found | ask the human. do not create one, do not use this repo |
| no tree exists for the work | ask the director. never create it yourself |
| `client.tree.link` refuses: the repo is public | stop. that repo is no home for client facts |
| the human tells you a client fact in chat | write it to the tree. a fact kept only in chat is a fact lost |

## .enforcement

blocker: client work begun with no private repo found or asked for · a client tree created without the director · a client fact written anywhere in this repo but under the gitignored `$route/.client/` link · a client fact the human gave, left only in chat.

⇒ why: `whyto.client-facts-live-in-a-private-tree` · how: `howto.work-a-client-ask-from-a-public-repo`

## .publishability

☀️ **fullsun** (share). a generic rule about where client facts live; it names no client.
