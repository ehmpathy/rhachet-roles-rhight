# rule.require.skill-placement-by-portability

## .what

before you write a skill, decide where it lives. portability picks the home, never convenience:

| home | for skills that are... | published? |
|------|------------------------|-----------|
| `src/domain.roles/<role>/skills/` | **portable** — useful to anyone who enrolls that role | ✅ yes, via npm |
| `.agent/repo=.this/role=any/skills/` | **local** — only meaningful inside this repo or on this machine | ❌ no, repo-only |

## .why

- `src/domain.roles/` is a **published surface** — every skill there ships to every consumer
  - a hardcoded home directory, package manager, or repo layout is a defect once it leaves this laptop, and you will not be the one who finds out
- `.agent/repo=.this/` is free to write and change — the correct default when unsure

## .the test

> **"would a stranger who enrolled this role get value from this, on their own machine, with their own data?"**

- **yes** → `src/domain.roles/<role>/skills/`
- **no**, or **not sure** → `.agent/repo=.this/role=any/skills/`

promotion later is cheap. a bad publish is not.

## .the signals

### 👉 belongs to a ROLE (publish it)

- it encodes **domain knowledge** the role exists to carry (how a franchise tax is computed, where a form's signature line sits)
- its inputs are **arguments**, not assumptions — `--name`, `--pdf`, `--into`
- it would still make sense if the repo were deleted tomorrow
- someone outside this org would recognise the problem it solves

### 👉 belongs to THIS REPO (keep it local)

- it references **paths inside this repo** or this machine's home directory
- it wraps a **local environment quirk** — a sandboxed browser, a private toolchain, one person's shell wrapper
- it exists to make **agents** work here, not to do the role's actual job
- it would confuse a stranger more than it helps them

## .examples, from real calls

| skill | home | why |
|-------|------|-----|
| `doc.sign` — put a signature at an exact pdf coordinate | `secretary/skills/` | pure arguments; any person with any form needs this |
| `doc.signature` — render a name across cursive faces | `secretary/skills/` | works for any name, on any machine |
| `show.in.browser` — open a file the sandboxed browser can reach | `.agent/repo=.this/` | encodes **this machine's** flatpak quirk and one human's `browser` wrapper |
| `show.claude.debug` — tail this session's hook logs | `.agent/repo=.this/` | serves the agent, not the domain |

`show.in.browser` is useful, but it exists only because one browser on one machine is sandboxed. publish it and you ship a workaround for a problem the reader does not have.

## ⚠️ the middle case

"it's role-specific **and** it only works here" is **not** a reason to publish. portability is the gate, not topical fit.

- put it in `.agent/repo=.this/` with a note on which role it would belong to
- the fix is usually small: promote the hardcoded part to a flag with a sane default. once `--into` exists, `show.in.browser` could ship

## .how to promote later

1. replace every local assumption with a flag + default
2. move the directory into `src/domain.roles/<role>/skills/`
3. add the `.integration.test.ts` (published skills earn a higher bar)
4. drop the old location

## .enforcement

- a published skill with a hardcoded absolute path = **blocker**
- a published skill that only functions on one machine = **blocker**
- a local skill that a stranger would clearly want = **nitpick**, promote it

## .see also

- `rule.prefer.internal-briefs-location.[rule].md` — the same split, for briefs
- `howto.run-an-unregistered-skill.[lesson].md` — how to run a role skill from a branch whose registry lacks that role
- `rule.require.jest-tests-for-skills.[rule].md` — the test bar
