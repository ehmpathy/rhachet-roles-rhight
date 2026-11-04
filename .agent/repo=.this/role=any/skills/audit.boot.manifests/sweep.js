#!/usr/bin/env node

/**
 * .what = check every path listed in every role's boot.yml against disk
 *
 * .why  = a boot.yml entry is a POINTER. the file it names may be renamed,
 *         moved, or deleted by an edit that never opens the manifest — and
 *         the boot itself does not refuse, so the brief is no longer loaded.
 *         that is a SILENT loss of context, which is the direction that
 *         costs a defect.
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
 * .what = collect every list item in a boot.yml that names a relative path
 *
 * .why  = the manifest nests `always > briefs > say|ref`, and other roles
 *         may add a `skills` block with the same two keys. rather than model
 *         that key hierarchy — which would silently skip a key we did not
 *         predict — this takes EVERY `- value` item and keeps the ones that
 *         look like a path. a wider net here yields a false GAP (loud)
 *         rather than a false COVERED (silent).
 *
 * ⚠️ the section label is tracked only for the REPORT. it never decides
 *    whether an item is checked, so an unforeseen key cannot mute a row.
 */
const asListedPaths = (input) => {
  const out = [];
  let section = '?';
  for (const [index, raw] of input.body.split('\n').entries()) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim().startsWith('#')) continue;
    if (line.trim() === '') continue;

    const key = /^\s*([A-Za-z_][A-Za-z0-9_.-]*):\s*$/.exec(line);
    if (key) {
      section = key[1];
      continue;
    }

    const item = /^\s*-\s+(.+)$/.exec(line);
    if (!item) continue;

    const value = item[1].trim().replace(/^['"]|['"]$/g, '');
    const looksLikeAPath = value.includes('/') || /\.(md|sh|ya?ml|ts|json)$/.test(value);
    if (!looksLikeAPath) continue;
    if (value.startsWith('/')) continue;

    out.push({ value, section, line: index + 1 });
  }
  return out;
};

const roles = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const rows = [];
let listed = 0;
let manifests = 0;
const without = [];

for (const role of roles) {
  const manifest = path.join(root, role, 'boot.yml');
  if (!fs.existsSync(manifest)) {
    without.push(role);
    continue;
  }
  manifests += 1;

  const items = asListedPaths({ body: fs.readFileSync(manifest, 'utf-8') });
  for (const item of items) {
    listed += 1;
    const target = path.join(root, role, item.value);
    if (fs.existsSync(target)) continue;
    rows.push({ role, ...item });
  }
}

const emit = (line) => process.stdout.write(`${line}\n`);

emit(`   ├─ root: ${root}`);
emit(`   ├─ roles: ${roles.length}`);
emit(`   ├─ manifests: ${manifests}`);
emit(`   ├─ listed: ${listed}`);
emit(`   ├─ dead: ${rows.length}`);

if (without.length > 0) {
  emit('   ├─ no boot.yml');
  for (const [index, role] of without.entries()) {
    const glyph = index === without.length - 1 ? '└─' : '├─';
    emit(`   │  ${glyph} ${role}`);
  }
}

if (rows.length === 0) {
  emit('   └─ every listed path is on disk');
  process.exit(0);
}

emit('   └─ dead entries');
for (const [index, row] of rows.entries()) {
  const glyph = index === rows.length - 1 ? '└─' : '├─';
  emit(`      ${glyph} ${row.role}/boot.yml [${row.section}] ${row.value}`);
}
