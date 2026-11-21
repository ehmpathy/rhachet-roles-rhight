#!/usr/bin/env node

/**
 * .what = check every path a role's `Role.build({...})` declares against disk
 *
 * .why  = a `uri: ${__dirname}/x` is a POINTER, and Role.build does not
 *         refuse when its target is absent. so a role whose readme, boot,
 *         keyrack, briefs dir, skills dir, or inits dir was never created
 *         — or was renamed by an edit that never opened the declaration —
 *         loads CLEANLY and silently carries less than it says it does.
 *
 *         this is the same silent-absence class the boot.yml sweep covers,
 *         in a DIFFERENT file. audit.boot.manifests reads boot.yml and
 *         cannot see a declaration; this reads the declaration and cannot
 *         see a boot.yml entry. both are needed.
 *
 * usage: node sweep.js <root>
 * emits: a treestruct body on stdout; exit 0 always (the caller grades)
 */

const fs = require('fs');
const path = require('path');

const root = process.argv[2];
if (!root) {
  process.stderr.write('sweep.js needs a root directory\n');
  process.exit(1);
}

/**
 * .what = collect every `${__dirname}/<path>` a declaration file names
 *
 * .why  = the declaration nests some pointers one level down (`briefs > dirs
 *         > uri`) and holds others flat (`readme > uri`), and a future
 *         version may add a key we did not predict. rather than model that
 *         hierarchy — which would SILENTLY skip an unforeseen key — this
 *         takes EVERY `${__dirname}/...` template literal, whatever key it
 *         sits under. a wider net yields a false GAP (loud) rather than a
 *         false COVERED (silent).
 *
 * ⚠️ the section label is tracked only for the REPORT. it never decides
 *    whether a pointer is checked, so an unforeseen key cannot mute a row.
 */
const asDeclaredPaths = (input) => {
  const out = [];
  let block = '?';
  for (const [index, raw] of input.body.split('\n').entries()) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    // a key that opens a nested block, e.g. `briefs: {`
    const opener = /^\s*([A-Za-z_][A-Za-z0-9_]*):\s*\{\s*$/.exec(line);
    if (opener) {
      block = opener[1];
      continue;
    }

    // every dirname pointer on this line, however many
    const hits = line.match(/\$\{__dirname\}\/[^`'"]+/g);
    if (!hits) continue;

    // a key that holds the uri inline, e.g. `readme: { uri: ...`
    //
    // ⚠️ `uri` and `dirs` are PASS-THROUGH: they carry the pointer but do
    //    not name it, so the outer block key is the useful label
    //    (`briefs`, not `dirs`). an unforeseen container key would label
    //    itself instead — cosmetic drift only, since the label never
    //    decides whether a pointer is checked.
    const passthrough = ['uri', 'dirs'];
    const inline = /^\s*([A-Za-z_][A-Za-z0-9_]*):\s*\{/.exec(line);
    const section =
      inline && !passthrough.includes(inline[1]) ? inline[1] : block;

    for (const hit of hits)
      out.push({
        value: hit.replace('${__dirname}/', ''),
        section,
        line: index + 1,
      });
  }
  return out;
};

/**
 * .what = grade one pointer: `null` when it will be found, else the reason
 *
 * ⛔ `fs.existsSync` ALONE IS NOT THE TEST, and the difference is silent.
 *    git cannot track an empty directory, so a declared dir that exists
 *    here and holds no entry WILL NOT EXIST after a clone — and existsSync
 *    reports it covered. that is a false COVERED, the direction that costs
 *    a defect.
 *
 *    measured 2026-09-08: of 3 declared `inits` dirs, 2 were absent and 1
 *    was an EMPTY directory. the first sweep passed the third.
 *
 * ⚠️ known limit: a directory whose every entry is gitignored is also
 *    absent after a clone, and reads as covered here. that case needs a
 *    git query, which this sweep deliberately does not make — it stays
 *    hermetic so its own fixtures can be temp dirs.
 */
const asVerdict = (input) => {
  if (!fs.existsSync(input.target)) return 'absent';
  if (!fs.statSync(input.target).isDirectory()) return null;
  if (fs.readdirSync(input.target).length === 0) return 'empty';
  return null;
};

const roles = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const rows = [];
let declared = 0;
let files = 0;
const without = [];

for (const role of roles) {
  const named = fs
    .readdirSync(path.join(root, role), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^get.*Role\.ts$/.test(name))
    .sort();

  if (named.length === 0) {
    without.push(role);
    continue;
  }

  for (const name of named) {
    files += 1;
    const items = asDeclaredPaths({
      body: fs.readFileSync(path.join(root, role, name), 'utf-8'),
    });
    for (const item of items) {
      declared += 1;
      const target = path.join(root, role, item.value);
      const verdict = asVerdict({ target });
      if (verdict === null) continue;
      rows.push({ role, name, verdict, ...item });
    }
  }
}

const emit = (line) => process.stdout.write(`${line}\n`);

emit(`   ├─ root: ${root}`);
emit(`   ├─ roles: ${roles.length}`);
emit(`   ├─ declarations: ${files}`);
emit(`   ├─ declared: ${declared}`);
// ⚠️ the two verdicts are reported SEPARATELY on purpose. an `absent`
//    pointer is absent everywhere; an `empty` one is present here and
//    absent after a clone, which is a different defect with a different
//    cure. one merged count would hide that split.
const absent = rows.filter((row) => row.verdict === 'absent').length;
const empty = rows.filter((row) => row.verdict === 'empty').length;
emit(`   ├─ dead: ${rows.length} (absent ${absent} · empty ${empty})`);

if (without.length > 0) {
  emit('   ├─ no declaration');
  for (const [index, role] of without.entries()) {
    const glyph = index === without.length - 1 ? '└─' : '├─';
    emit(`   │  ${glyph} ${role}`);
  }
}

if (rows.length === 0) {
  emit('   └─ every declared path is on disk');
  process.exit(0);
}

emit('   └─ dead pointers');
for (const [index, row] of rows.entries()) {
  const glyph = index === rows.length - 1 ? '└─' : '├─';
  emit(
    `      ${glyph} ${row.verdict} · ${row.role}/${row.name} [${row.section}] ${row.value}`,
  );
}
