#!/usr/bin/env node
/**
 * .what = the engine behind `source.promote`. reads a job set, slices each
 *         source, and reports a per-job verdict. the shell wrapper owns arg
 *         parse, the mascot header, and the exit code.
 *
 * .why  = kept out of the .sh because a slice needs index arithmetic over
 *         raw bytes, and a bash implementation of it would reach for
 *         sed/awk — which rewrite whitespace, and therefore alter the very
 *         bytes the promotion exists to preserve.
 */
const fs = require('fs');
const path = require('path');

/**
 * ⭐ a LENGTH-STABLE whitespace map, for MARKER SEARCH ONLY.
 *
 * every char below maps ONE-TO-ONE onto a space, so an index into the
 * comparable copy is a valid index into the ORIGINAL. that is what lets a
 * marker typed with a plain space match a document that separates its words
 * with U+00A0, a tab, or an en-space — a defect that hides three ways over,
 * because both forms render identically and grep them differently.
 *
 * ⛔ this is deliberately NOT a `\s+ -> ' '` collapse. a collapse is not
 *    length-stable, so its indices cannot slice the original, and a marker
 *    composed from collapsed output is a marker composed from a DIFFERENT
 *    DOCUMENT. the cure for that is to read the marker off the raw bytes.
 */
const asComparable = (body) =>
  body.replace(/[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ');

/**
 * .what = the longest prefix of `needle` that IS present in `hay`
 * .why  = a bare "marker missed" tells you naught about WHY. the prefix
 *         names the exact character at which your marker and the document
 *         part ways, and the tail shows what the document says instead.
 *         that converts a guess into a read.
 */
const getOneLongestPrefixFound = (input) => {
  const { hay, needle } = input;
  let lo = 0;
  let hi = needle.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (hay.indexOf(needle.slice(0, mid)) !== -1) lo = mid;
    else hi = mid - 1;
  }
  if (lo === 0) return null;
  const prefix = needle.slice(0, lo);
  const at = hay.indexOf(prefix);
  return { prefix, at, saw: hay.slice(at, at + lo + 60) };
};

/**
 * .what = find a marker, or explain the miss
 * .why  = a silent miss is the defect this whole skill guards against
 */
const findMarker = (input) => {
  const { comparable, marker, since } = input;
  const at = comparable.indexOf(marker, since ?? 0);
  if (at !== -1) return { at };
  const diag = getOneLongestPrefixFound({
    hay: comparable.slice(since ?? 0),
    needle: marker,
  });
  return { at: -1, diag };
};

/**
 * .what = a promoted file's name is a CLAIM about the bytes inside it
 * .why  = `effectiveAt=` asserts the artifact took effect on that date. one
 *         was stamped `effectiveAt=2025-01-01` off habit alone — a date
 *         NOWHERE on the artifact. so when the name makes that claim, the
 *         artifact must at least mention the year.
 *
 * ⚠️ the YEAR, not the full date. real documents render their dates a dozen
 *    ways (`08/01/2023`, `Rev. 8/23`, `85 Del. Laws, c. 48`), so a strict
 *    match would refuse correct stamps constantly. the year is the widest
 *    check that still catches a stamp read off something else entirely.
 *
 * `pulledAt=` gets NO such check — a pull date is a fact about the ACT of
 * retrieval, and no line inside the document can corroborate it.
 */
const checkStamp = (input) => {
  const { dst, bytes } = input;
  const base = path.basename(dst);
  const eff = /effectiveAt=(\d{4})-\d{2}-\d{2}/.exec(base);
  if (eff) {
    if (!bytes.includes(eff[1]))
      return {
        ok: false,
        why: `named ${eff[0]} and the year ${eff[1]} appears nowhere in the promoted bytes — read the stamp OFF the artifact`,
      };
    return { ok: true, note: null };
  }
  if (/pulledAt=\d{4}-\d{2}-\d{2}/.test(base)) return { ok: true, note: null };
  return {
    ok: true,
    note: 'no pulledAt= or effectiveAt= stamp in the filename — a ref with no vintage cannot be aged',
  };
};

const runOneJob = (input) => {
  const { job, root, mode } = input;
  const at = path.resolve(root, job.src);
  const dst = path.resolve(root, job.dst);
  const label = path.basename(job.dst);

  if (!fs.existsSync(at))
    return { label, ok: false, why: `source absent: ${job.src}` };

  const body = fs.readFileSync(at, 'utf-8');

  let bytes = body;
  let how = `whole · ${body.length.toLocaleString()} chars`;

  if (job.slice) {
    if (!job.why)
      return {
        label,
        ok: false,
        why: 'a sliced job needs a `why` — a slice is a judgment about what the reader may omit, and an unstated judgment cannot be audited',
      };

    const comparable = asComparable(body);
    const from = findMarker({ comparable, marker: job.slice.from });
    if (from.at === -1)
      return {
        label,
        ok: false,
        why: `start marker missed: ${job.slice.from}`,
        diag: from.diag,
      };

    const to = findMarker({
      comparable,
      marker: job.slice.to,
      since: from.at + job.slice.from.length,
    });
    if (to.at === -1)
      return {
        label,
        ok: false,
        why: `end marker missed: ${job.slice.to}`,
        diag: to.diag,
      };

    // ⛔ slice the ORIGINAL, never the comparable copy. the comparable copy
    //    is a search index; to write it out would ship a document whose
    //    whitespace we silently rewrote, which is the hand-transcription
    //    defect wearing a tool's clothes.
    bytes = body.slice(from.at, to.at + job.slice.to.length);
    how = `sliced · ${bytes.length.toLocaleString()} of ${body.length.toLocaleString()} chars`;
  }

  const stamp = checkStamp({ dst, bytes });
  if (!stamp.ok) return { label, ok: false, why: stamp.why };

  const before = fs.existsSync(dst) ? fs.readFileSync(dst, 'utf-8') : null;
  const change = before === null ? 'new' : before === bytes ? 'same' : 'differs';

  if (mode === 'apply' && change !== 'same') {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, bytes);
  }

  return {
    label,
    ok: true,
    how,
    change,
    note: stamp.note,
    why: job.why ?? null,
  };
};

const asJobsFromArgs = (input) => {
  const { args } = input;
  if (args.manifest) {
    const parsed = JSON.parse(fs.readFileSync(args.manifest, 'utf-8'));
    if (!Array.isArray(parsed.jobs))
      throw new Error('manifest needs a top-level `jobs` array');
    return parsed.jobs;
  }
  const slice =
    args.sliceFrom || args.sliceTo
      ? { from: args.sliceFrom, to: args.sliceTo }
      : null;
  return [{ src: args.from, dst: args.into, slice, why: args.why ?? null }];
};

const main = () => {
  const argv = process.argv.slice(2);
  const args = { mode: 'plan' };
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--manifest') args.manifest = v;
    else if (k === '--from') args.from = v;
    else if (k === '--into') args.into = v;
    else if (k === '--slice-from') args.sliceFrom = v;
    else if (k === '--slice-to') args.sliceTo = v;
    else if (k === '--why') args.why = v;
    else if (k === '--mode') args.mode = v;
    else if (k === '--root') args.root = v;
  }

  const root = args.root ?? process.cwd();
  const jobs = asJobsFromArgs({ args });
  const results = jobs.map((job) => runOneJob({ job, root, mode: args.mode }));

  const lines = [];
  for (const r of results) {
    lines.push(`   ├─ ${r.ok ? '✅' : '⛔'} ${r.label}`);
    if (r.ok) {
      lines.push(`   │     ${r.how} · ${r.change}`);
      if (r.why) lines.push(`   │     why: ${r.why}`);
      if (r.note) lines.push(`   │     🟡 ${r.note}`);
    } else {
      lines.push(`   │     ${r.why}`);
      if (r.diag) {
        lines.push(`   │     matched up to: ${JSON.stringify(r.diag.prefix)}`);
        lines.push(`   │     source reads:  ${JSON.stringify(r.diag.saw)}`);
      }
    }
  }

  const refused = results.filter((r) => !r.ok).length;
  const promoted = results.length - refused;
  lines.push('   │');
  lines.push(`   ├─ promoted: ${promoted}`);
  lines.push(`   └─ refused:  ${refused}`);

  process.stdout.write(lines.join('\n') + '\n');

  // ⛔ a PARTIAL promotion must not read as a success. one refused job means
  //    a published brief is short one piece of its own evidence, and a green
  //    exit is how that goes unnoticed until a reader checks the citation.
  process.exit(refused > 0 ? 2 : 0);
};

main();
