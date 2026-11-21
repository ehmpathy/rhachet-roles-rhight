# whyto.client-facts-live-in-a-private-tree

> ⚠️ **not legal advice.** this brief explains a practice for client confidentiality; for a duty you owe a client, ask a licensed attorney.

> the case behind `rule.forbid.client-identity-in-public-comments` and `rule.require.client-facts-in-a-private-tree`. the rules say what; this says why.

## .public is hard to take back

this repo is public. a comment edit does not erase what came before: *"Anyone with read access to a repository can view a comment's edit history"* [1]. on a public repo, that is everyone.

a revision can be cleaned, by its author or *"anyone with write access"*, yet the cleanup is partial: *"the person who made the edit and when they made the edit is still visible in the comment history"* [1]. and committed content outlives its source repo in forks: *"Public repository forks are public"*, and *"If you delete a fork, code contributions from that fork can remain accessible to the repository network"* [2]. a later switch to private does not reach them: *"Public forks are not made private"* [3].

⇒ the safe redaction is the one that happens **before** the post. that is why the forbid fires on the draft. after a slip, a delete beats an edit, since an edit keeps the old text one click away [1].

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
- **a dedicated tree** keeps the work on its own branch, reviewable and committable on its own. git calls it a *"linked worktree"*, and when the work is done, *"remove it with git worktree remove"* [4]
- **the director makes it** because a tree is a branch, a checkout, and a lifetime. which trees exist, and where, is the director's call. a clone that opens its own trees opens them where nobody looks

## .our trees stay disposable

this repo's worktrees are consular: opened for a round of work, then removed [4]. a client fact accrued or generated inside one (a capture, a receipt, a status read, an answer) would die with it, or worse, pin the tree alive because nobody dares to remove it.

with the facts in the client's tree, our tree holds only a link. so:

- a removal of our tree removes the link, **never the target**. *"The rm utility shall not traverse directories by following symbolic links into other parts of the hierarchy, but shall remove the links themselves"* [5]. the skill's own test removes a route dir with `rm -rf` and reads the client record intact afterward
- 🔴 **a symlink, never a bind mount.** the guarantee is for links only. a recursive remove does cross a mount: *"when you use rm -rf to remove your normally throw-away chroot, that command will remove everything under /home, too"* [6]
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
- the link is gitignored at any depth. a `.gitignore` pattern with no slash at its start or middle *"may also match at any level below the .gitignore level"* [7], so `.client` covers every route dir. the skill confirms it per link with `git check-ignore`, whose exit `0` means *"One or more of the provided paths is ignored"* [8]
- the link is relative, *"relative to the link location"* [9], so it survives a move of the dirs above both trees
- a link, not a copy: one record, in one place, in the repo that owns it

## .the occurrence that earned these rules

an answer about a client's state standing went to a public PR as two comments. no SSN, no email, no address: the regex scan was clean. each comment still named the entity and its state file number beside a standing question, and one held a personal charge the human had mentioned in chat. both comments were deleted, and these rules were written.

## .date researched

2026-11-17

## .publishability

☀️ **fullsun** (share). the argument is generic; the occurrence names no client.

## .sources

1. [GitHub Docs — Tracking changes in a comment](https://docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment) — pulled 2026-11-17 via bhrowser, 2,419 chars
2. [GitHub Docs — Forks (reference)](https://docs.github.com/en/pull-requests/reference/forks) — pulled 2026-11-17 via bhrowser, 7,865 chars (the "what happens to forks" url redirects here)
3. [GitHub Docs — Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) — pulled 2026-11-17 via bhrowser, 6,290 chars
4. [git-scm — git-worktree](https://git-scm.com/docs/git-worktree) — pulled 2026-11-17 via bhrowser, 22,271 chars
5. [POSIX.1-2024 — rm](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/rm.html) — pulled 2026-11-17 via bhrowser, 13,526 chars
6. [GNU coreutils — rm invocation](https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html) — pulled 2026-11-17 via bhrowser, 4,322 chars
7. [git-scm — gitignore](https://git-scm.com/docs/gitignore) — pulled 2026-11-17 via bhrowser, 8,918 chars
8. [git-scm — git-check-ignore](https://git-scm.com/docs/git-check-ignore) — pulled 2026-11-17 via bhrowser, 4,267 chars
9. [GNU coreutils — ln invocation](https://www.gnu.org/software/coreutils/manual/html_node/ln-invocation.html) — pulled 2026-11-17 via bhrowser, 8,360 chars
