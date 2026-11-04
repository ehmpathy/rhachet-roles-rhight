#!/usr/bin/env node
/**
 * .what = census the memory directory for STRUCTURAL defects
 *
 * .why  = MEMORY.md is loaded into every session and TRUNCATED after a fixed
 *         line count. so an index entry past the cap is a memory that exists,
 *         is indexed, and is never read — and no check on the file or the
 *         entry alone can see it. the failure is invisible from both ends.
 *
 * ⛔ THIS FILE JUDGES NO CONTENT. it cannot tell a stale lesson from a live
 *    one, and it does not try. every verdict here is structural: a pointer
 *    that resolves or does not, an entry inside the cap or past it, a file
 *    reachable from the index or orphaned.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const AT = process.argv[2];
const CAP = Number(process.argv[3] || 200);

/**
 * .what = parse one index line into its pointer
 * .why  = the index shape is `- [title](file.md) — hook`. a line that does not
 *         match is not a defect; it is prose (a heading, a blank). only a line
 *         that LOOKS like a pointer is held to the pointer contract.
 */
const asEntry = (line, n) => {
  const m = /^\s*-\s*\[([^\]]*)\]\(([^)]+)\)/.exec(line);
  if (!m) return null;
  return { n, title: m[1], file: m[2], chars: line.length };
};

const main = () => {
  const indexAt = path.join(AT, 'MEMORY.md');
  if (!fs.existsSync(indexAt)) {
    console.error('no MEMORY.md at: ' + AT);
    process.exit(1);
  }

  const raw = fs.readFileSync(indexAt, 'utf-8');
  const lines = raw.split('\n');

  const entries = lines.map(asEntry).filter((e) => e !== null);

  // every .md in the dir except the index itself. NON-recursive on purpose:
  // an `.archive/` subdir is where pruned files GO, so to sweep it would
  // report every archived file as an orphan forever.
  const onDisk = fs
    .readdirSync(AT)
    .filter((f) => f.endsWith('.md') && f !== 'MEMORY.md')
    .sort();

  const referenced = new Set(entries.map((e) => e.file));

  // ⛔ PAST THE CAP — the headline defect. these entries are in the index and
  //    are not loaded, so they read as covered and are not.
  const truncated = entries.filter((e) => e.n >= CAP);

  // a pointer to a file that is absent. the `counselor` class of defect: a
  // routing row that sends a reader to a dead end.
  const dead = entries.filter((e) => !fs.existsSync(path.join(AT, e.file)));

  // a file no index line names. never fetched, so written for nobody.
  //
  // ⭐ SPLIT BY THE FILE'S OWN FRONTMATTER, because the two kinds of orphan
  //    need OPPOSITE cures and look identical from the index:
  //
  //      retired  — its `name:` or `description:` says superseded/retired.
  //                 a real prune candidate: the decision was already made
  //                 and the file was left on disk
  //      unlisted — a live lesson that was never indexed. the cure is to ADD
  //                 an index line, and to archive it would DESTROY a memory
  //                 whose only fault is a missed edit
  //
  //    measured: of two orphans here, one of each. a skill that lumped them
  //    would have offered to archive a live lesson.
  const orphans = onDisk.filter((f) => !referenced.has(f));
  const marked = (f) => {
    const head = fs.readFileSync(path.join(AT, f), 'utf-8').slice(0, 600);
    return /superseded|retired|deprecated|\bmoved to\b/i.test(head);
  };
  const retired = orphans.filter(marked);
  const unlisted = orphans.filter((f) => !marked(f));

  // two entries, one target. the index claims two memories and holds one.
  const seen = new Map();
  for (const e of entries) seen.set(e.file, (seen.get(e.file) || 0) + 1);
  const dupes = Array.from(seen.entries()).filter(([, c]) => c > 1);

  // the doc's own guidance is ~150 chars per entry. a longer one is content
  // that belongs in the FILE, not in the always-loaded index.
  const fat = entries.filter((e) => e.chars > 150).sort((a, b) => b.chars - a.chars);

  const sizes = onDisk
    .map((f) => ({ f, chars: fs.statSync(path.join(AT, f)).size }))
    .sort((a, b) => b.chars - a.chars);
  const total = sizes.reduce((acc, s) => acc + s.chars, 0);

  const out = [];
  const say = (s) => out.push('   ' + s);

  say('├─ at: ' + AT);
  say('├─ index: ' + lines.length + ' lines · ' + entries.length + ' entries · cap ' + CAP);
  say(
    '├─ files: ' + onDisk.length + ' on disk · ' + total + ' chars · ~' +
      Math.round(total / 4) + ' tokens',
  );
  say('│');

  // ⛔ the cap check leads, because it is the one whose failure is SILENT.
  if (truncated.length) {
    say('├─ 🚨 PAST THE ' + CAP + '-LINE CAP — indexed and NEVER LOADED (' + truncated.length + ')');
    for (const e of truncated) say('│     L' + String(e.n + 1).padStart(4) + '  ' + e.file);
  } else {
    say('├─ ✅ every index entry is inside the ' + CAP + '-line cap');
  }

  if (dead.length) {
    say('├─ 🚨 DEAD POINTER — the index names a file that is absent (' + dead.length + ')');
    for (const e of dead) say('│     L' + String(e.n + 1).padStart(4) + '  ' + e.file);
  } else {
    say('├─ ✅ every pointer resolves to a file');
  }

  if (retired.length) {
    say('├─ 🟠 ORPHAN · RETIRED — unindexed, and says so itself (' + retired.length + ')');
    say('│     these are the prune candidates. `--archive <file>` moves one aside');
    for (const f of retired) say('│     ' + f);
  }

  if (unlisted.length) {
    say('├─ ⚠️ ORPHAN · UNLISTED — a LIVE lesson the index never named (' + unlisted.length + ')');
    say('│     ⛔ do NOT archive these. the cure is an index line');
    for (const f of unlisted) say('│     ' + f);
  }

  if (!orphans.length) say('├─ ✅ every file is named by the index');

  if (dupes.length) {
    say('├─ ⚠️ DUPLICATE — two entries, one target (' + dupes.length + ')');
    for (const [f, c] of dupes) say('│     ' + c + '×  ' + f);
  } else {
    say('├─ ✅ no target is named twice');
  }

  if (fat.length) {
    say('├─ 🟡 over ~150 chars — content that belongs in the FILE (' + fat.length + ')');
    for (const e of fat.slice(0, 5)) say('│     ' + String(e.chars).padStart(5) + '  ' + e.file);
    if (fat.length > 5) say('│     … and ' + (fat.length - 5) + ' more');
  }

  say('│');
  say('├─ the 5 largest files');
  for (const s of sizes.slice(0, 5)) say('│     ' + String(s.chars).padStart(7) + '  ' + s.f);
  say('│');

  // ⛔ the verdict is ADVISORY on content and BINDING on structure.
  const hard = truncated.length + dead.length;
  say('├─ structural defects: ' + hard + '   (must be 0)');
  say(
    '├─ advisory: ' + retired.length + ' retired · ' + unlisted.length + ' unlisted · ' +
      dupes.length + ' duplicate · ' + fat.length + ' fat',
  );
  say('└─ ⛔ content staleness is NOT judged here — that is a human read');

  console.log(out.join('\n'));
  process.exit(hard > 0 ? 2 : 0);
};

main();
