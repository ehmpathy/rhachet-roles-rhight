# whyto.client-facts-live-in-a-private-tree

> the case behind `rule.forbid.client-identity-in-public-comments` and `rule.require.client-facts-in-a-private-tree`. the rules say what; this says why.

## .public is permanent

this repo is public. GitHub keeps every comment's edit history, and forks, mirrors, and notification emails keep the rest. a later redaction leaves the original readable.

⇒ the only safe redaction is the one that happens **before** the post. that is why the forbid fires on the draft, and why a fix after the fact is a delete, never an edit.

## .a public record still leaks when you pair it

a state file number sits in a public database. a standing status is one fee away for anyone. so "it is all public anyway" feels true.

it is not. what the comment adds is the **pair**: this repo's owner, tied to that entity, tied to its standing problem. no database holds that pair until the comment writes it.

## .a regex cannot see it

`pii.scan` is built for SSNs, emails, cards, phones. an entity name is prose and a file number is seven digits. both pass it clean.

⇒ a clean scan is evidence of no SSN, not evidence of no client. the read against the forbid table is a human-shaped check, and it is owed on every public draft.

## .a chat is not a publication grant, and not a record

a human who tells you a charge, a date, or a status in this window has told **you**. that is no license to post it.

the same fact, kept only in chat, is lost at the next compaction. so the answer to "do not publish it" is never "do not write it down". it is "write it down in the right place".

## .why a private tree, and why the director makes it

- **a private repo** is the one place a client fact can be written in full. that is why the rule says persist freely there: thin records are a cost with no safety gain
- **a dedicated tree** keeps the work on its own branch, reviewable and committable on its own, without the risk of a client fact on a shared branch
- **the director makes it** because a tree is a branch, a checkout, and a lifetime. which trees exist, and where, is the director's call. a clone that opens its own trees opens them where nobody looks

## .our trees stay disposable

this repo's worktrees are consular: opened for a round of work, then removed. a client fact accrued or generated inside one (a capture, a receipt, a status read, an answer) would die with it, or worse, pin the tree alive because nobody dares to remove it.

with the facts in the client's tree, our tree holds only a link. so:

- `git worktree remove`, or `rm -rf` on our tree, deletes the link and **never the target**. `rm -rf` does not follow a symlink into the dir it points at
- the client record survives every cleanup on our side, in the repo that owns it
- ⇒ a director can prune our trees on sight, with zero risk to the client data under them

## .the split IS the publishability partition

every round of client work yields two kinds of output, and the two trees sort them by where they land:

| output | lands in | becomes |
|---|---|---|
| the generic lesson: a rule, a statute read, a skill, a howto | this repo | ☀️ fullsun, shipped to every clone |
| the client's record: names, numbers, receipts, status, the roadmap | the client tree | the client's **pull**, theirs to review, merge, and keep safe |

⇒ a fact is sorted at the moment it is written, by the path it is written to. what the client receives is a pull of their own record; what the public receives was never meant to hold it.

🔴 **the sort is the first layer, never the only one. the scrub still runs after the fact.** a write path can be wrong: a capture saved under `.play/`, a client name pasted into a "generic" lesson, a quote that carries a person. so before anything ships, the publishability triage (`rule.require.publishability-triage`) and the pre-publish scrub run over this repo's diff as if the sort had never happened. two layers, because either one alone fails silently.

| layer | what it does to the risk |
|---|---|
| **the sort**, at write time | cuts the **probability** sharply. most client facts never touch this repo at all, so the scrub has little to find |
| **the scrub**, before ship | catches the **residue**: the few facts that took a wrong path despite the sort |

⇒ a scrub alone faces every client fact a round produced, and one miss ships. a sort alone has no net under a wrong path. together, the scrub reads a diff that is already near-clean, which is the case where a reader catches the one stray fact rather than skims past it.

## .why the link sits in the route dir

- the route drives the work. the client tree sits beside the stones that act on it, so a reader of the route finds the record without a search
- the link is gitignored at any depth (`.client` in `.gitignore`), so the route's tracked artifacts stay generic, and the link itself never ships
- a link, not a copy: one record, in one place, in the repo that owns it

## .the occurrence that earned these rules

an answer about a client's state standing went to a public PR as two comments. no SSN, no email, no address: the regex scan was clean. each comment still named the entity and its state file number beside a standing question, and one held a personal charge the human had mentioned in chat. both comments were deleted, and these rules were written.

## .publishability

☀️ **fullsun** (share). the argument is generic; the occurrence names no client.
