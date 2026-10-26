# rule.require.browser-readable-artifact-paths

## .what

when you build an HTML (or PDF, or image) artifact for a **human to open in a
browser**, do not hand them the in-repo path. **copy it to `~/Downloads` first**
and hand them that `file://` url.

## .why

the browser on this machine is **sandboxed** (flatpak Firefox) and cannot read
most of the filesystem. a repo path produces:

> Firefox can't find the file at ~/git/.../art/signature.html

which reads as a *broken artifact* and is a *permissions* result. Firefox says
"can't find the file," not "not permitted," so the natural next move is to hunt
for a file that was never absent.

## .the rule

| you built | hand the human |
|-----------|----------------|
| `src/**/art/thing.html` | `file://$HOME/Downloads/thing.html` |
| an artifact with **relative** asset refs (`<img src="logo.png">`) | copy **every** referenced asset into the **same** directory |

`~/Downloads` works because flatpak grants `xdg-download` by default. assume no
other path is readable.

## ⚠️ two traps

1. **relative asset refs break on copy.** the SANDPINE letterhead references
   `sandpine.brandmark.logo.png` relatively; copy the html alone and the logo
   box renders empty — which looks like a *design* defect. copy the whole set,
   flat, into one directory.
2. **dot-directories** (e.g. `.demo/`) are an extra hazard for sandboxed file
   access. `~/Downloads` sidesteps both.

## .observed vs inferred

| claim | status |
|-------|--------|
| Firefox could not open the repo path; copy to `~/Downloads` fixed it | ✅ **observed** |
| Firefox here is a flatpak | ✅ **stated by the user** |
| flatpak grants `xdg-download` by default | 🚩 **inferred** from flatpak's documented defaults — not verified on this machine, but the copy did work |
| the dot-dir contributed to the failure | 🚩 **inferred** — the path was also outside any grant, which alone explains it |

## .if the human wants the repo path to work

flatpak permissions can be widened per-app — the **documented** mechanism, **not**
run or verified here:

```sh
flatpak override --user --filesystem=$HOME/git org.mozilla.firefox
```

prefer the copy: no permission change, no restart, no trust that the grant
survives an update.

## .enforcement

- hand a human an in-repo `file://` path for a browser artifact = **nitpick**
- copy an html artifact without its relatively-referenced assets = **blocker**
  (produces a silently wrong render)

## .see also

- `rule.forbid.hand-transcription.[rule].md` — the sibling "the artifact must
  actually be what it claims" rule
