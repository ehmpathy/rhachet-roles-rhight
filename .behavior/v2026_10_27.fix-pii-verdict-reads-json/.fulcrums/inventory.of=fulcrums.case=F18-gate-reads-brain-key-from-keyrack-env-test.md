# F18: the gate reads its brain key from keyrack env test

## .the fork

`rhx review` asks keyrack env prep for its brain key, and no org holds a prep anthropic key. the gate could (a) wait on a human to fill prep, (b) take a key from an env set by hand, or (c) read the key itself through `rhx keyrack get` and hand it to its review children.

## .taken, why

(c), per the director's decision: a key keyrack holds, read through keyrack's own get, never a hand-set env. in `pii.scan.via.brain.sh`, `set_brain_keys_from_keyrack` reads each brain's key (`asBrainKeyName`) from `--owner ehmpath --env test` and exports it for the review children; their prep lookup falls through to it (keyrack reads os.envvar as a passthrough).

three sub-calls inside it:
- env test, named once (`ENV_OF_BRAIN_KEY`), because the repo manifest declares the key there
- owner ehmpath, matched to every hint the gate already prints
- a key the caller's env already holds wins, and keyrack is not asked

a failed read never blocks and never skips the review: the brain still sees every staged file and fails there as a key malfunction, with a hint that now names env test.

## .rework

clean. one function, one call site, one constant. a funded prep key later means a change of `ENV_OF_BRAIN_KEY`, or removal of the read.

## .confidence: 85%, why not higher

the review is billed to the test account, not prep. the director chose that path; a human who commits under another keyrack owner still needs an env-held key or an ehmpath unlock.

## .where

`pii.scan.via.brain.sh` (`set_brain_keys_from_keyrack`, the key hints) · `[case39]` in its integration test · `.husky/check.pii.sh` unlock hint · `.agent/keyrack.yml` comments.

## .verdict

decided by the director (2026-11-12): option 2, the gate reads a key keyrack holds.
