# howto.work-a-client-ask-from-a-public-repo

> ⚠️ **not legal advice.** this is a method brief: it makes no independent factual claim. the facts behind it are cited in `whyto.client-facts-live-in-a-private-tree`.

> the how behind `rule.forbid.client-identity-in-public-comments` and `rule.require.client-facts-in-a-private-tree`. the why is `whyto.client-facts-live-in-a-private-tree`.

## .when

an ask names a client, a person, or their entity, and you work it from this public repo. e.g. *"is the client's corporation in good standing?"*

## .the flow

### 1. find the private repo

```sh
ls -d ~/git/$org/rhachet-briefs-$org
gh repo view $org/rhachet-briefs-$org --json visibility -q .visibility   # must print PRIVATE
```

none found → ask the human where it lives. never fall back to this repo.

### 2. ask the director for a tree: an extant one first

```sh
git -C ~/git/$org/rhachet-briefs-$org worktree list      # a tree already scoped to this work?
git -C ~/git/$org/rhachet-briefs-$org for-each-ref --format='%(refname:short) %(committerdate:short)' refs/heads
```

- a live tree scoped to the work → ask the director to confirm it is yours to continue
- none → ask the director to create one, scoped to the subject (e.g. corp: taxes and registration). `client.tree.link` with no `--tree` prints the ask, with the command
- never create the tree yourself

### 3. link it from the route dir

```sh
rhx client.tree.link --org $org --tree $tree --route $route                # plan
rhx client.tree.link --org $org --tree $tree --route $route --mode apply   # link
```

it refuses a public repo, a non-tree, and a link path this repo does not gitignore. a rerun is a no-op.

### 4. persist through the link, freely

every capture, receipt, status read, draft, and answer goes under `$route/.client/$org/`, in full. that includes a playbook's output dir: point it there, not at `.play/`.

client facts found elsewhere in this repo (a `.demo/`, `.play/`, `.scratch/`, a trash cache) move into the tree, then leave this repo.

### 5. answer in public only in the generic form

the public thread gets `the entity`, `the file number`, `the charge you recall`, or a pointer to the client tree. read every draft against the forbid table before you post: a regex `pii.scan` passes entity names and file numbers.

### 6. scrub after the fact anyway

before this repo ships a diff, run the publishability triage over it as if steps 1–5 never happened. the sort cut the odds; the scrub catches the residue.

## .the slip, and its repair

a forbidden fact posted → tell the human at once → offer to **delete**, never edit (an edit keeps the original in the history) → delete only on their word → confirm a `404` on read-back → sweep the rest of the thread for the same fact.

## .date researched

2026-11-17

## .publishability

☀️ **fullsun** (share). a generic flow; it names no client.
