/**
 * .what = check every block quote in an artifact against the source it cites
 * .why  = the enforcement arm of rule.forbid.hand-transcription
 *
 * usage: node verify.js <sourceFile> <artifactFile> [minFragment] [needle...]
 */
const fs = require('fs');

/**
 * .what = a vulgar fraction, and the ascii a text extractor degrades it to
 * .why  = ⛔ THE SOURCE IS THE LOSSY SIDE, and that inverts the usual cure.
 *
 *         `pdftotext` and most html-to-text dumps render `1½ percent` as
 *         `11/2 percent`. so a FAITHFUL quote of the statute reads as a
 *         defect, and the instinct — "fix the artifact" — would corrupt a
 *         correct quotation to match a degraded extract.
 *
 *         the map therefore runs RICH -> LOSSY, on BOTH sides, and never the
 *         reverse: `11/2` cannot be restored to `1½` (it may be eleven
 *         halves). this is DETECT-ONLY — it exists so the comparison lands,
 *         and no edit is ever written back through it.
 */
const FRACTIONS = [
  ['\u00bd', '1/2'],
  ['\u00bc', '1/4'],
  ['\u00be', '3/4'],
  ['\u2153', '1/3'],
  ['\u2154', '2/3'],
  ['\u215b', '1/8'],
  ['\u215c', '3/8'],
  ['\u215d', '5/8'],
  ['\u215e', '7/8'],
];

/**
 * .what = collapse markdown prose to a comparable form
 * .why  = a needle and its haystack must pass through the SAME matcher,
 *         or a faithful quote reads as a defect
 *
 * ⚠️ `\n\s*>?\s*` not `\n>?\s*` — markdown permits an INDENTED block quote
 *    (one nested in a list). with the tighter form the `>` survives the
 *    collapse and every needle that spans that line reads ABSENT.
 * ⚠️ `\*+` not `\*\*` — bold, italic, and bold-italic are 2, 1, and 3 stars
 *
 * ⛔ this is NOT length-stable — the fraction map grows `½` (1 char) into
 *    `1/2` (3). so the output may be used for `includes` and for the
 *    divergence report, and MUST NOT be used to slice the raw bytes: an
 *    offset computed here does not address the original document.
 */
const flat = (x) =>
  FRACTIONS.reduce(
    (acc, [rich, lossy]) => acc.split(rich).join(lossy),
    x
      .replace(/\n\s*>?\s*/g, ' ')
      .replace(/\*+/g, '')
      .replace(/[`~]+/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\t\u0085\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );

/** a header that marks a retraction — a quote under one is a CITATION, not an instance */
const BANNER = /🚩|🛑|RETRACT|CORRECT(ED|ION)|WITHDRAWN/i;

/** an attribution line inside a quote — never present in the source */
const ATTRIB = /^\s*>\s*(—|--|–|\u2014)/;

/**
 * .what = read the SECTION and SUBSECTION chain a quote claims to come from
 *
 * .why  = ⛔ THE SPLICED CITATION. a quote's words can be faithful to the
 *         SOURCE and false about its OWN ATTRIBUTION — a § 502(d) clause under
 *         a § 502(c) citation is verbatim, present in the union, and wrong.
 *
 *         every other check in this file searches the CONTAINER, so every one
 *         of them passes on that. the only mark that can catch it is the
 *         attribution the author wrote, read as a CLAIM rather than as
 *         decoration.
 *
 * ⚠️ measured: a § 502(d) service-of-process clause wore a § 502(c) tax
 *    citation through a fully green run. the tell was free — two neighbour
 *    files in the same route cited the identical clause CORRECTLY as 502(d).
 */
const asCiteScope = (attrib) => {
  if (!attrib) return null;
  const m = /§+\s*(\d+(?:\.\d+)*)((?:\([^)\s]{1,4}\))*)/.exec(attrib);
  if (!m) return null;
  const subs = (m[2] || '').match(/\(([^)\s]{1,4})\)/g) || [];

  // ⛔ A RANGE OR AN ENUMERATION MUST NOT NARROW TO ITS FIRST MEMBER.
  //
  //    `— 8 Del. C. § 505(c)–(e)` covers three subsections, and a slice to
  //    `(c)` reports the faithful `(d)` and `(e)` fragments as out of scope.
  //    that is a false alarm on a CORRECT citation — the one failure mode that
  //    teaches a reader to scroll past a detector, which costs more than the
  //    detector ever returns.
  //
  //    measured: the first live run flagged 13, and the sharpest of them was
  //    this exact shape — a correctly cited `§ 505(c)–(e)` block whose three
  //    subsections were each labelled inline.
  //
  // ⇒ the subsection level is DROPPED and the check stays at the SECTION. that
  //   still catches the sharper defect — a quote cited to the wrong section —
  //   and declines to guess at the finer one.
  const tail = attrib.slice(m.index + m[0].length);

  // ⛔ AN ATTRIBUTION THAT NAMES TWO SECTIONS CANNOT BE NARROWED TO EITHER.
  //    `— 8 Del. C. § 502(b) + § 504(d)` is one line of provenance for two
  //    quotes, and the first-match rule silently slices BOTH to § 502(b) — so
  //    the § 504(d) quote is reported out of scope while its citation is
  //    perfectly correct. that is the range bug again, across sections rather
  //    than within one, and it is louder: a whole section of drift, not a
  //    subsection of it.
  //
  // ⇒ refuse. `null` reports UNRESOLVED, which is the true state.
  //
  // 🚩 like the `\s+` separator below, this came from a CODE READ and the
  //    census count did not move. it is correct on its own terms and it is
  //    NOT the diagnosis of the 13.
  if (/§\s*\d/.test(tail)) return null;

  const spans = /^\s*(?:[–—-]|,|;|\s+(?:and|to|through|&)\s+)\s*(?:\(|§|\d)/i.test(tail);
  return { section: m[1], subs: spans ? [] : subs.map((s) => s.slice(1, -1)) };
};

/** .what = escape a captured fragment for reuse inside a pattern */
const asLiteral = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * .what = narrow the flat source to the cited section, then to its subsection
 * .why  = so a quote is checked against WHAT IT CITES, never against every byte
 *         we happen to hold.
 *
 * ⛔ A MISSED MARKER REFUSES. to fall through to the container is the defect
 *    itself — the search would run over the whole corpus under a name that
 *    promises one subsection, and report a pass. `null` means UNRESOLVED, is
 *    reported as such, and never reads as agreement.
 *
 * ⚠️ the section HEADER is anchored on `§ N.` plus a capital, never on a bare
 *    `§ N`. statutes cross-reference each other constantly, so the FIRST
 *    occurrence of `§ 502` in a chapter is usually a pointer inside § 501.
 *
 * ⚠️ a subsection ends at the next marker OF ITS OWN CLASS — a letter closes on
 *    a letter, a digit on a digit. a close on any parenthesized token would cut
 *    `(d)` short at its own nested `(d)(1)`, and report a faithful quote as out
 *    of scope. a guard with a known false alarm is one a reader scrolls past.
 */
const sliceToCite = (src, scope) => {
  if (!scope) return null;
  const at = src.search(new RegExp('§\\s*' + asLiteral(scope.section) + '\\.\\s+[A-Z]'));
  if (at === -1) return null;
  const rest = src.slice(at);
  const upto = rest.slice(1).search(/§\s*\d+(?:\.\d+)*\.\s+[A-Z]/);
  let body = upto === -1 ? rest : rest.slice(0, upto + 1);

  // the walk is PER LEVEL, and a miss at ANY level refuses — a half-applied
  // narrowing is a scope claim the output cannot support.
  //
  // ⛔ THE START STAYS AT THE OUTERMOST MARKER, and only the END narrows.
  //
  //    a quote routinely carries its OWN label — `"(i) (1) If: a. Together
  //    with the actual delivery..."`. walk `(i)` then `(1)` and slice to each
  //    in turn, and the slice begins at `(1)`, so the quote's leading `(i) `
  //    now sits OUTSIDE the window it was cited to. the words are faithful,
  //    the citation is right, and the detector reports a splice.
  //
  //    measured: the first live run flagged `§ 103(i)(1)` for exactly this.
  //
  // ⚠️ THE SEPARATOR IS `\s+`, NEVER `\s`. a single `\s` matches ONE character,
  //    so it cannot cross the blank line a statute puts between subsections —
  //    `.\n\n(b)` is two. a subsection that opens its own paragraph, which is
  //    most of them in a delcode or `pdftotext` render, is then unreachable.
  //
  // 🚩 THIS ONE CURED NO ALARM. found by a read of this code, widened on its
  //    own merits, and the census held at 13 before and 13 after. kept because
  //    it is right, recorded because a fix that moves no number is a HYPOTHESIS
  //    and must never be written up as a diagnosis.
  //
  // ✅ the 13 WERE diagnosed, below, and by a MEASUREMENT rather than a read:
  //    the end-marker off-by-one took 11 of them and the sibling class took 2.
  //    13 → 2 → 0, with `verified` and `live` unmoved at every step. what made
  //    that possible was the `slice:` / `ends:` diagnostic in the report — two
  //    fields that show what the slicer resolved. THREE theories died by eye
  //    before it existed; the first run after it was decisive.
  let lo = null; // the outermost marker — where the slice begins
  let hi = body.length;
  let from = 0; // where the NEXT level's search starts
  for (const sub of scope.subs) {
    const at = body.slice(from, hi).search(
      new RegExp('(?:^|[.;:]\\s+|\\)\\s+)\\(' + asLiteral(sub) + '\\)\\s'),
    );
    if (at === -1) return null;
    const abs = from + at;
    if (lo === null) lo = abs;
    // ⭐ THE SIBLING OF `(d)` IS `(e)` — NOT "any short letter token".
    //
    //    a class like `[a-z]{1,2}` reads as a reasonable net for a lettered
    //    subsection, and it swallows every ROMAN NUMERAL a nested list uses:
    //    `(i)`, `(ii)`, `(iv)`, `(vi)` are all one-or-two lowercase letters.
    //    so § 228(d)(1)'s own enumeration — `delivered: (i) … ; (ii) …` —
    //    closed the (d) slice at its own second item, 124 characters into a
    //    subsection that runs for hundreds.
    //
    // ⇒ name the ONE token that can legitimately end this subsection, and
    //   search for that alone.
    //
    // ⛔ AND WHEN THE NEXT SIBLING IS ABSENT, DO NOT GUESS — leave `hi` where
    //    it is, at the end of the section. an over-wide slice can only SUPPRESS
    //    a false alarm; an over-narrow one MANUFACTURES one, against a citation
    //    that is correct. the two errors are not symmetric, so the fallback
    //    must lean wide. (a repealed or skipped letter takes this path.)
    const kind = /^\d+$/.test(sub)
      ? String(Number(sub) + 1)
      : /^[a-z]$/.test(sub)
        ? String.fromCharCode(sub.charCodeAt(0) + 1)
        : /^[A-Z]$/.test(sub)
          ? String.fromCharCode(sub.charCodeAt(0) + 1)
          : null;
    // ⛔ THE END MARKER IS `[.;]`, NEVER `[.;:]` — a COLON DOES NOT CLOSE A
    //    SUBSECTION, it OPENS a list INSIDE one.
    //
    //    `A consent permitted by this section shall be delivered: (i) to the
    //    principal place of business...` is one sentence of § 228(d)(1). read
    //    with a colon in the delimiter class it is byte-identical in shape to
    //    a subsection boundary, so the slice closed at `(i)` — 64 characters
    //    into a subsection that runs for hundreds — and the rest of the
    //    author's own correct quote fell outside its own citation.
    //
    //    the asymmetry is real and it runs one way: a statute ends a
    //    subsection with a period or a semicolon, and introduces a nested
    //    enumeration with a colon. so a colon is evidence AGAINST a boundary.
    //
    // ⭐ AND `hi` MUST INCLUDE THAT DELIMITER. the match BEGINS at the `.`
    //    that ends the previous subsection, so a naive `hi = abs + 1 + close`
    //    cuts the slice one byte short — it drops the subsection's own
    //    terminal period. every quote that runs to the END of its subsection
    //    then fails `includes()` by ONE CHARACTER, while its head, its
    //    section, and its bytes are all perfectly correct.
    //
    //    measured: that single byte produced 11 of 13 OUT-OF-SCOPE
    //    alarms on one artifact, EVERY ONE of them a correct citation. a
    //    detector this loud, wrong this quietly, is worse than absent — it
    //    teaches a reader to scroll past it.
    const closeAt = kind
      ? new RegExp('(?:^|[.;]\\s+|\\)\\s+)\\(' + asLiteral(kind) + '\\)\\s').exec(
          body.slice(abs + 1, hi),
        )
      : null;
    if (closeAt) hi = abs + 1 + closeAt.index + Math.max(0, closeAt[0].indexOf('(') - 1);
    from = abs;
  }
  return lo === null ? body : body.slice(lo, hi);
};

/** .what = split an artifact into headed blocks, so a hit can be attributed */
const blocksOf = (raw) => {
  const lines = raw.split('\n');
  const out = [];
  let head = '(preamble)';
  let headLine = 1;
  let buf = [];
  const flush = (endLine) => {
    if (buf.length) out.push({ head, headLine, text: buf.join('\n'), endLine });
    buf = [];
  };
  lines.forEach((l, i) => {
    if (/^#{1,6}\s/.test(l)) {
      flush(i);
      head = l;
      headLine = i + 1;
    } else buf.push(l);
  });
  flush(lines.length);
  return out;
};

/**
 * .what = a block quote that OPENS with a status marker is an editorial callout
 * .why  = the quotation-mark test alone is too loose. a provenance note routinely
 *         quotes a phrase inline as EVIDENCE ABOUT the artifact — it makes no
 *         claim about a source, so to check it reports the note's own prose as a
 *         fabrication.
 *
 * ⚠️ measured: 4 such notes, written in one pass to RECORD defects this very
 *    skill found, each became a fresh false alarm. a detector that alarms on its
 *    own findings is one nobody keeps.
 */
const ASIDE_OPENER =
  /^\s*>\s*(?:🚩|🛑|⛔|⚠️|✅|⬜|🚨|⭐|ⓘ|🎯|📋|🔵|🟡|🟢|🔴)/u;

/**
 * .what = drop ONE block-quote level, so a nested quote becomes a top-level one
 * .why  = an aside is skipped, but a real citation often lives INSIDE one — the
 *         `> > "..."` under a provenance note. to drop the aside whole would
 *         silently narrow the corpus, which is the failure this skill exists to
 *         catch.
 */
const dedent = (lines) => lines.map((l) => l.replace(/^(\s*)>\s?/, '$1'));

/** .what = pull each contiguous block-quote run out of a list of lines */
const quotesOf = (lines, headLine) => {
  const runs = [];
  let cur = null;
  lines.forEach((l, i) => {
    if (/^\s*>/.test(l)) {
      if (!cur) cur = { at: headLine + i, lines: [], attributed: false };
      // ⚠️ an attribution WRAPS. `> — 8 Del. C. § 103(c),` matches, and the
      //    bare url on the next line does not — so a per-line test leaks the
      //    url into the quote and every such quote reads NOT-IN-SOURCE at the
      //    very last characters. once attribution starts, the quote is over.
      // ⭐ the attribution is DROPPED from the quote and KEPT as its SCOPE.
      //    it names the section the author claims the words came from, and it
      //    is the only mark on the page that can tell a faithful quote of
      //    § 502(d) apart from the same words cited to § 502(c).
      if (ATTRIB.test(l)) {
        if (!cur.attributed) cur.attrib = l;
        cur.attributed = true;
      }
      if (!cur.attributed) cur.lines.push(l);
    } else {
      if (cur && cur.lines.length) runs.push(cur);
      cur = null;
    }
  });
  if (cur && cur.lines.length) runs.push(cur);
  return runs;
};

/**
 * .what = split a run set into the CITATIONS to check and the ASIDES to count
 * .why  = markdown's `>` carries two different jobs — a quotation OF a source,
 *         and an editorial callout. only the first makes a claim this skill can
 *         check. the discriminator is the house convention, stated rather than
 *         guessed: a citation carries quotation marks or an attribution line;
 *         an aside opens with a status marker.
 *
 * ⚠️ an aside is DESCENDED INTO, never dropped. a provenance note that quotes a
 *    source in a nested `> >` block still makes a checkable claim, and to skip
 *    it would narrow the corpus without a word of warning.
 */
const sortQuotes = (lines, headLine, out = { cite: [], asides: 0 }) => {
  for (const q of quotesOf(lines, headLine)) {
    const marked = ASIDE_OPENER.test(q.lines[0]);
    const quoted = q.attributed || q.lines.some((l) => l.includes('"'));
    if (marked || !quoted) {
      out.asides++;
      const inner = dedent(q.lines);
      if (inner.some((l) => /^\s*>/.test(l))) sortQuotes(inner, q.at, out);
      continue;
    }
    out.cite.push(q);
  }
  return out;
};

/**
 * .what = drop the block-quote marker from each line, BEFORE any join
 * .why  = a marker cannot be stripped by a newline-anchored pattern, because
 *         two common shapes are not newline-anchored:
 *
 *         1. the FIRST line of a run has no newline in front of it
 *         2. after a blank `>` line, `\s*` greedily eats the next newline —
 *            so the next line's `>` is no longer newline-anchored and
 *            survives into the collapsed text
 *
 *         either leak turns a faithful quote into a NOT-IN-SOURCE alarm.
 *         measured on one 48k-char stone: 44 false alarms, 0 real.
 *
 * ⚠️ `(?:>\s?)+` not `>\s?` — markdown nests block quotes, and one strip
 *    of a `> >` line leaves a marker behind for the same reason as above.
 */
const unquote = (lines) =>
  lines.map((l) => l.replace(/^\s*(?:>\s?)+/, '')).join('\n');

/**
 * .what = split one quote into the fragments that must each appear verbatim
 * .why  = an ellipsis is a legitimate elision, so a quote with `...` is
 *         really N sub-quotes. to test the whole string would report every
 *         elided quote as fabricated
 */
/**
 * .what = the seams a quotation may be cut at — an elision, a back-to-back
 *         join, an inline section label
 * .why  = NAMED and shared, because two readers need it and a copy would drift.
 *
 * ⚠️ it was inline in `fragmentsOf` when the lone-quote reader was written, so
 *    that reader shipped with a whole-string test — and on its first run TWO of
 *    its six misses were elided quotes that are verbatim in the source. an
 *    elision defeats a contiguity test, which is a known class, and it arrived
 *    anyway the moment the logic was duplicated rather than shared.
 *
 * ⛔ no `g` flag, deliberately. a global regex carries `lastIndex` between
 *    calls, and a shared one would then skip seams per which reader ran last.
 */
const SEAMS =
  /\s*(?:\.\.\.|…|\[\.\.\.\])\s*|"\s+"|(?<=^(?:§\s*)?[\d]+(?:\.[\d]+)*\.?(?:\([^)]+\))*[^—–]{0,60}?)\s+[—–]\s+/;

const fragmentsOf = (quote) => {
  // a PARAGRAPH BREAK is a seam too, and it must be cut BEFORE flat() runs —
  // flat collapses a bare `>` line into a space, so by then the seam is gone.
  //
  // .why = the near-universal shape is a bold SECTION LABEL on its own line,
  //        a blank `>`, then the quotation with its own `"` marks:
  //
  //          > **§ 124. Effect of lack of corporate capacity or power.**
  //          >
  //          > "No act of a corporation ..."
  //
  //        both halves are verbatim in the source. what no source ever held
  //        is the JOIN — because the artifact opens a `"` the statute has no
  //        mark for. to test across that seam reports a faithful pair as a
  //        fabrication, and it breaks at the label, which points the reader
  //        at the one part that was never in doubt.
  const paragraphs = dedent(quote.lines)
    .reduce(
      (acc, line) =>
        line.trim() === ''
          ? [...acc, []]
          : [...acc.slice(0, -1), [...acc[acc.length - 1], line]],
      [[]],
    )
    .filter((group) => group.length > 0);

  return paragraphs.flatMap((group) =>
    flat(group.join('\n'))
      .replace(/^"+/, '')
      .replace(/"+$/, '')
      // an ellipsis is an elision, and `" "` is a JOIN — one block quote often
      // carries several quotations back to back (subsection (a), then (b)).
      // to test across the seam is to test a string no source ever held.
      //
      // the third seam is an INLINE label — `§ 217(a) — "Persons ...`, or a
      // bylaw `2.11. Stockholder Action ... — Unless otherwise ...`.
      // same defect as the paragraph case above, on one line instead of two:
      // the label is verbatim, the body is verbatim, and the em-dash join is
      // the artifact's own editorial punctuation. cut at the dash so each
      // half is tested on its own, rather than break at the label and point
      // the reader at a number that was always correct.
      //
      // ⚠️ the label may be a `§` OR a bare ordinal — a bylaw, an article, a
      //    rule. a cut scoped to `§` alone reads as complete and leaves every
      //    private-instrument citation broken, which is the wider class: a
      //    statute has an embedded source, a bylaw usually does not, so its
      //    quote is the one a reader is least able to check by hand.
      .split(SEAMS)
      .map((s) => s.replace(/^["'\s]+|["'\s,;:]+$/g, '').trim())
      .filter(Boolean),
  );
};

/**
 * .what = the length of the longest PREFIX of the fragment still in the source
 * .why  = a block quote runs hundreds of chars. "this quote is not in the
 *         source" over 700 chars is a true report and an unactionable one —
 *         the reader has to re-read the whole passage to find the one word.
 *
 *         a prefix test is MONOTONE: if a prefix of length n is absent, every
 *         longer prefix is absent too. so a binary search finds the exact
 *         character where the artifact leaves the source, in log2(n) tests.
 *
 * ⚠️ the answer is the FIRST divergence, never the only one. fix it and
 *    re-run; a second may sit behind it.
 */
const divergeAt = (src, frag) => {
  let lo = 0;
  let hi = frag.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (src.includes(frag.slice(0, mid))) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

/** .what = render the divergence with enough either side to be recognizable */
const asDivergenceLines = (src, frag) => {
  const at = divergeAt(src, frag);
  const before = frag.slice(Math.max(0, at - 44), at);
  const after = frag.slice(at, at + 28);
  return [
    '   │     broke at char ' + at + ' of ' + frag.length,
    '   │       ok  : ...' + before,
    '   │       then: ' + JSON.stringify(after),
  ];
};

/**
 * .what = a heading that STATES a count, checked against the items under it
 *
 * .why  = a count claim in prose is a SECOND detector, and a far cheaper one
 *         than a source pull: `### the three actions` is machine-checkable
 *         against the `#### ` blocks three lines below, and it fires the
 *         moment a later pass appends a fourth.
 *
 *         that is the failure mode it exists for. the count is correct WHEN
 *         WRITTEN and rots when the document grows under it — so it is a false
 *         claim that ARRIVES LATER, in the one direction nobody re-opens. no
 *         source-verification pass can see it, because every citation on the
 *         page is still perfect.
 *
 *         measured on one artifact, three separate instances:
 *           "four questions"  -> a fifth was appended  (a § 513 criminal penalty)
 *           "three conditions" -> the statute names four
 *           "three actions"    -> a fourth was appended, and it was the one
 *                                 headed "closes MOST of the open gates"
 *
 * ⛔ ADVISORY. it cannot tell a count of ITEMS from a count of something else
 *    the heading happens to mention, so it is a prompt to look, never a verdict,
 *    and it does not touch the exit code. same rank as a short pull under
 *    `rule.require.bhrowser-citations`.
 *
 * 📊 ITS FIRST NUMBER, MEASURED — 2 rows on one artifact, 1 real and 1 false.
 *    a 50% alarm rate, which is why it ships off the exit code. the two:
 *
 *      ✅ real  — `### the FOUR actions` over 5 `####` blocks. the fifth was a
 *                 RIDER on the fourth, set at the actions' own level, so a
 *                 reader who scans the block counts five under a heading that
 *                 says four. the cure was the HEADING LEVEL, not the number.
 *      🚩 false — `## SEVENTH PASS — five more` over 7 `###` blocks. five are
 *                 the members; the other two are the list's own APPARATUS, a
 *                 citation ledger and a summary, which sit at the members'
 *                 level because they belong to the pass rather than to any one
 *                 member.
 *
 * ⭐ so the false-alarm class has a NAME: apparatus at member level. it is not
 *    worth a heuristic — any rule that skipped a "ledger" or a "summary" by
 *    title would be a blocklist of this house's words, and would miss the next
 *    one. a human reads the row in two seconds.
 *
 * ⭐ AND NOTE WHAT A HIT DOES NOT TELL YOU. the real row above reported
 *    *"said four · found 5"*, which reads as *"your number is wrong"* and was
 *    in fact *"your heading level is wrong."* a cardinality alarm names the
 *    PAIR that disagrees and is silent on which half to move — so it must
 *    never be auto-fixed, in either direction.
 *
 * 📊 SECOND MEASUREMENT — the whole route: 3 rows, 1 real, 2 false.
 *    pooled with the first run that is **5 rows, 2 real, 3 false — 40% true**.
 *    a rate worth a look and never worth an exit code.
 *
 *    the new real one: `## VERIFY BEFORE YOU SEND — two figures` over items
 *    numbered **1, 2, 3**. note that it is self-evident from the page — the
 *    enumeration itself contradicts the title — and still sat unread for weeks.
 *
 *    the new false ones were BOTH the apparatus class again, which is now 3 of
 *    3 false alarms and is the only false class yet seen:
 *      · a `### ⚠️ sequencing` note beside `### 1.` and `### 2.`
 *      · a citation ledger + a summary beside five statute sections
 *
 * ⛔ AND THE CURE DEPENDS ON THE ARTIFACT'S STATUS BANNER, which this check
 *    cannot see. on a live page, fix the number. on a page that carries
 *    ✅ EXECUTED, `rule.require.permanent-yields` forbids an edit-to-be-correct
 *    — the wrong number STAYS and the defect is appended beside it.
 *
 *    so a hit is never a work item on its own. it is a prompt to read the
 *    banner first, and the banner decides which of two opposite cures applies.
 */
const WORDS = {
  two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10,
};
const asCountRows = (raw, path) => {
  const lines = raw.split('\n');
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const head = /^(#{2,4})\s+(.*)$/.exec(lines[i]);
    if (!head) continue;

    // the count word must sit in THIS heading, and be a bare word — `four` in
    // `fourteen` or in a `§ 504` is not a claim about a list.
    const said = /(?:^|[^a-z0-9])(two|three|four|five|six|seven|eight|nine|ten)(?![a-z0-9])/i.exec(
      head[2].replace(/§\s*\d+/g, ''),
    );
    if (!said) continue;

    // ⇒ count the headings exactly ONE level deeper, up to the next heading at
    //   this level or shallower. a deeper level is a child of a child and is
    //   not what the claim governs.
    const deeper = '#'.repeat(head[1].length + 1) + ' ';
    let kids = 0;
    for (let j = i + 1; j < lines.length; j++) {
      const next = /^(#{1,6})\s/.exec(lines[j]);
      if (!next) continue;
      if (next[1].length <= head[1].length) break;
      if (lines[j].startsWith(deeper)) kids++;
    }
    if (kids === 0) continue; // governs no list of headings — say nothing

    const claim = WORDS[said[1].toLowerCase()];
    if (claim !== kids)
      rows.push({
        kind: 'count',
        at: i + 1,
        path,
        head: head[2].slice(0, 62),
        said: said[1].toLowerCase(),
        claim,
        found: kids,
      });
  }
  return rows;
};

/**
 * .what = a quoted run that sits OUTSIDE a block quote — a table cell, a list
 *         item, a sentence of prose
 *
 * .why  = ⛔ THE COVERAGE HOLE. `quotesOf` gates on `/^\s*>/` and no other
 *         reader in this file looks at a line that fails it. so a quotation in
 *         a table cell is not checked, is not counted as an aside, and is not
 *         reported as skipped. it is INVISIBLE — and an invisible skip is the
 *         one failure this whole skill exists to refuse.
 *
 *         ⚠️ the numbers make the case. on one route stone: **53 lines** carry
 *         a >=40-char quoted run outside a block quote, while the census prints
 *         `verified: 155` and says not one word about them. worse, the two most
 *         load-bearing sentences on that page — the clerk's own instructions,
 *         which the next filed document depends on — sit in exactly such a
 *         table.
 *
 * ⛔ ADVISORY, and it must stay advisory for a stated reason rather than out of
 *    caution. a quotation mark outside a block quote does three jobs in this
 *    house and only one of them is a source claim:
 *
 *      · a quotation OF a source          -> checkable
 *      · a SCARE quote, or a term of art  -> cites no source
 *      · a quotation of THE AUTHOR        -> no source will ever hold it
 *
 *    measured on the same page: two rows quote the author's own rhetorical
 *    questions. a binding check would call both a fabrication on day one, and a
 *    detector whose first run alarms on correct prose is one nobody keeps.
 *
 * ⚠️ IT IS PER LINE, deliberately. a quoted run that wraps across two table
 *    cells, or across a hard break, is not seen. that is a stated limit and not
 *    a silent one — the alternative is a whole-document scan whose pairs would
 *    straddle unrelated prose, which manufactures fragments no source contains.
 */
const FENCE = /^\s*(?:```|~~~)/;
const asLoneQuoteRows = (raw, src, path, min) => {
  const lines = raw.split('\n');
  const rows = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (FENCE.test(l)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (/^\s*>/.test(l)) continue; // a block quote — the established reader owns it

    // ⛔ inline code is DROPPED first. a usage example carries quotation marks
    //    around a flag value and cites no source at all, so to read it as a
    //    quotation is a guaranteed false alarm on every skill doc in the repo.
    const bare = l.replace(/`[^`]*`/g, ' ');

    // ⭐ curly folded to straight BEFORE the pair match, per the standing rule
    //    that punctuation is part of the bytes. a page that uses the typographic
    //    pair would otherwise report zero, which reads identical to a clean page.
    const norm = bare.replace(/[\u201c\u201d]/g, '"');

    const re = /"([^"]+)"/g;
    let m;
    while ((m = re.exec(norm))) {
      // ⭐ the SAME seam split the block-quote path uses, and the same floor.
      //    a lone quote elides exactly as a block quote does, so a whole-string
      //    test reports every elided inline quote as a fabrication.
      for (const piece of flat(m[1]).split(SEAMS)) {
        const frag = piece.replace(/^["'\s]+|["'\s,;:]+$/g, '').trim();
        if (frag.length < min) continue;
        rows.push({
          kind: 'lone',
          at: i + 1,
          path,
          hit: src.includes(frag),
          text: frag.slice(0, 72),
        });
      }
    }
  }
  return rows;
};

/**
 * .what = read the flags this worker is handed
 * .why  = positional argv could not carry a REPEATABLE --from, and a
 *         repeatable --from is not a convenience: one artifact routinely
 *         quotes several pulled containers (a subchapter here, a chapter
 *         there). with one source, every quote from the other containers
 *         reads NOT-IN-SOURCE — 38 false alarms on the first real run,
 *         which is a detector nobody would keep.
 */
const asArgs = (argv) => {
  const out = { from: [], ins: [], min: 40, needles: [] };
  for (let i = 0; i < argv.length; i += 2) {
    const [k, v] = [argv[i], argv[i + 1]];
    if (k === '--from') out.from.push(v);
    else if (k === '--in') out.ins.push(v);
    else if (k === '--min') out.min = Number(v);
    else if (k === '--needle') out.needles.push(v);
    else throw new Error('verify.js: unreadable flag: ' + k);
  }
  return out;
};

/**
 * .what = check ONE artifact against the union source
 * .why  = lifted out of main so a CENSUS over many artifacts reuses the exact
 *         same reader. a census that re-implemented the check would drift
 *         from the single-artifact check, and the drift would show up as a
 *         file that reads clean in the census and dirty on its own.
 */
const readOneArtifact = ({ path, src, min, needles }) => {
  const raw = fs.readFileSync(path, 'utf-8');
  const rows = [];
  let live = 0;
  let cited = 0;
  let short = 0;
  let asides = 0;
  let ok = 0;
  // the two scope tallies. `offscope` is the spliced-citation candidate;
  // `unscoped` is a slice whose markers missed, and says only that the claim
  // could not be checked — never that it failed.
  let offscope = 0;
  let unscoped = 0;

  // ---- explicit needles, when given: a TWO-SIDED read
  const art = flat(raw);
  for (const n of needles) {
    const f = flat(n);
    const inSrc = src.includes(f);
    const inArt = art.includes(f);
    let v = 'ok';
    if (!inSrc && !inArt) v = 'needle-bug';
    else if (inSrc && !inArt) v = 'absent-from-artifact';
    else if (!inSrc && inArt) v = 'NOT-IN-SOURCE';
    if (v === 'ok') ok++;
    else if (v === 'NOT-IN-SOURCE') live++;
    rows.push({ kind: 'needle', verdict: v, at: 0, head: '(needle)', text: n.slice(0, 72) });
  }

  // ---- every block quote in the artifact, when no needle was given
  if (!needles.length) {
    for (const b of blocksOf(raw)) {
      const banner = BANNER.test(b.head);
      // ⚠️ asides are COUNTED and named, never dropped silent — a detector with
      //    permanent known-false alarms is one a reader learns to scroll past,
      //    which is worse than a detector that reports less.
      const sorted = sortQuotes(b.text.split('\n'), b.headLine);
      asides += sorted.asides;
      for (const q of sorted.cite) {
        // ⭐ the SCOPE is read once per quote, off the attribution the author
        //    wrote, and is reused for every fragment the quote splits into.
        const scope = asCiteScope(q.attrib);
        const within = scope ? sliceToCite(src, scope) : null;
        for (const frag of fragmentsOf(q)) {
          if (frag.length < min) {
            short++;
            continue;
          }
          const hit = src.includes(frag);
          if (hit) ok++;
          else if (banner) cited++;
          else live++;

          // ⚠️ ADVISORY, NOT BINDING — and deliberately so.
          //
          //    the slicer has a real false-alarm surface: a statute that
          //    renumbers, a publisher that renders a header differently, a
          //    subsection whose siblings are not the class this walk expects.
          //    so a scope miss is a TRIGGER TO INSPECT, exactly as a short pull
          //    is under `rule.require.bhrowser-citations` — it never flips a
          //    verified quote into a defect, and it never masks one.
          //
          // ⛔ it is reported ONLY when the words WERE found in the union. a
          //    quote already marked NOT-IN-SOURCE has a louder defect, and a
          //    second flag on it would bury the first.
          const scoped = !hit || !scope
            ? null
            : within === null
              ? 'unresolved'
              : within.includes(frag)
                ? 'in-scope'
                : 'OUT-OF-SCOPE';
          if (scoped === 'OUT-OF-SCOPE') offscope++;
          else if (scoped === 'unresolved') unscoped++;

          rows.push({
            kind: 'quote',
            verdict: hit ? 'ok' : banner ? 'cited-in-retraction' : 'NOT-IN-SOURCE',
            at: q.at,
            head: b.head.replace(/^#+\s*/, '').slice(0, 58),
            text: frag.slice(0, 72),
            diverge: hit ? null : asDivergenceLines(src, frag),
            scoped,
            cite: scope ? '§ ' + scope.section + scope.subs.map((s) => '(' + s + ')').join('') : null,

            // ⭐ WHAT THE SLICER ACTUALLY RESOLVED — carried so the report can
            //    show it. an OUT-OF-SCOPE row without this says only "your
            //    quote is not in the section you cited", which is exactly the
            //    claim in doubt; with it, a reader sees in one glance whether
            //    the slicer landed on the right section at all.
            //
            // ⛔ this is INSTRUMENTATION, not a fix. it changes no verdict and
            //    no count. a detector that cannot show its own work forces
            //    every diagnosis into a throwaway probe, and a throwaway probe
            //    is a diagnosis nobody after you inherits.
            // ⭐ BOTH ENDS, never one. a HEAD alone answers "did the slicer
            //    find the right section" and is silent on "did it keep the
            //    whole of it" — and those are the two ways a slice goes wrong,
            //    with opposite cures. a head that reads correct while the tail
            //    stops mid-subsection is the shape a head-only diagnostic
            //    reports as healthy.
            slice:
              scoped === 'OUT-OF-SCOPE' && within
                ? {
                    len: within.length,
                    head: within.slice(0, 68),
                    tail: within.slice(-68),
                  }
                : null,
          });
        }
      }
    }
  }

  // ---- the CARDINALITY check: a heading that states a count, against the
  //      items under it. an independent detector on the same read — it needs
  //      no source at all, so it costs one pass over the lines already in hand.
  //
  // ⛔ ADVISORY. it does NOT enter `live` and does NOT touch the exit code,
  //    per the standing rule that a new detector's first number is a claim
  //    about the DETECTOR. promote it only once its false-alarm rate is
  //    measured against a corpus.
  //
  // ⛔ AND IT RIDES IN ITS OWN ARRAY, never merged into `rows`. every extant
  //    consumer of `rows` reads a `verdict` field these rows do not have —
  //    `rows.filter(x => x.verdict !== 'ok' && …)` admits an undefined verdict,
  //    so a merge would have pushed each count row into the per-file DEFECT
  //    list, flipped `anyBad`, and then crashed on `x.verdict.padEnd(22)`.
  //
  // ⇒ the general shape: a NEW detector must not change what the ESTABLISHED
  //   ones report. a separate channel makes that true by construction, where a
  //   merge makes it a thing to remember.
  const counts = asCountRows(raw, path);

  // ---- the COVERAGE check: quoted runs the block-quote reader never sees.
  //
  // ⛔ ADVISORY, its own array, for the same two reasons as `counts` — a new
  //    detector must not move an established number, and these rows carry no
  //    `verdict` field, so a merge into `rows` would crash the defect printer.
  //
  // ⚠️ AND IT IS REPORTED EVEN WHEN EVERY ROW HITS. the count of quoted runs
  //    outside a block quote is the useful figure on its own: it says how much
  //    of the page the established census never examined. a report that spoke
  //    only on a miss would leave that silence looking like coverage.
  const lone = asLoneQuoteRows(raw, src, path, min);

  return {
    path,
    rows,
    counts,
    lone,
    live,
    cited,
    short,
    asides,
    ok,
    offscope,
    unscoped,
    miscount: counts.length,
    lonesome: lone.length,
    lonemiss: lone.filter((x) => !x.hit).length,
  };
};

const main = () => {
  const args = asArgs(process.argv.slice(2));
  if (!args.from.length || !args.ins.length)
    throw new Error('usage: verify.js --from F [--from F] --in A [--in A] [--min N] [--needle T]');
  const MIN = args.min;
  const needles = args.needles;

  // the union of every source. a quote is faithful if ANY container holds it.
  //
  // ⚠️ BOTH lengths are kept, because they answer different questions and only
  //    one of them is comparable to the outside world.
  //
  //    `raw` is the file as it sits on disk. that is the figure a pull reports
  //    (`chars: 47905`), the figure `wc -m` returns, and the figure
  //    `rule.require.bhrowser-citations` wants when it calls a short pull
  //    suspect.
  //
  //    `body` is post-`flat()`, so every whitespace run has collapsed to one
  //    space. it is the string the quotes are actually searched against, and it
  //    is ALWAYS smaller — here, 47,554 against a 47,905-char file.
  //
  // ⛔ to print only `body.length` under the label `chars` was the defect: a
  //    reader who checked the manifest against the pull that produced the file
  //    saw a delta on EVERY source, and could not tell a normalization delta
  //    from a TRUNCATED container. the guard's own figure was not comparable to
  //    the figure it would be checked against.
  const sources = args.from.map((p) => {
    const raw = fs.readFileSync(p, 'utf-8');
    return { path: p, raw: raw.length, body: flat(raw) };
  });
  const src = sources.map((s) => s.body).join('\n\u0000\n');

  const reads = args.ins.map((path) => readOneArtifact({ path, src, min: MIN, needles }));
  const many = reads.length > 1;

  // ---- report: the defect detail, per artifact
  //
  // ⛔ a CENSUS must not swallow the detail. the break-position lines are the
  //    whole triage instrument — break at char 1-8 is a glued label, break at
  //    >92% is a one-word alteration, break mid-quote is a splice. a rollup
  //    that printed only counts would report WHICH file is dirty and withhold
  //    the one field that says WHY, so every hit would cost a second run.
  let anyBad = false;
  for (const r of reads) {
    const bad = r.rows.filter((x) => x.verdict !== 'ok' && x.verdict !== 'cited-in-retraction');
    if (bad.length) anyBad = true;
    if (many) {
      if (!bad.length) continue;
      console.log('   │  ── ' + r.path);
    }
    for (const x of bad) {
      const mark = x.verdict === 'NOT-IN-SOURCE' ? '🚨' : x.verdict === 'needle-bug' ? '⚠️ ' : '⛔';
      console.log('   │  ' + mark + ' ' + x.verdict.padEnd(22) + ' L' + String(x.at).padStart(5));
      console.log('   │     under: ' + x.head);
      console.log('   │     text : ' + x.text);
      if (x.diverge) for (const l of x.diverge) console.log(l);
    }
  }
  if (!anyBad) console.log('   │  every quote landed in the source');

  console.log('   │');
  // ⚠️ per source, so a container that came back EMPTY or wrong cannot hide
  //    behind the union. a 0-char source silently passes every quote to its
  //    neighbours and reads as a clean run.
  //
  // ⛔ the ON-DISK figure leads, because that is the one a reader can check
  //    against the pull, against `wc -m`, and against the ~2,000-char floor in
  //    `rule.require.bhrowser-citations`. the flattened figure follows it,
  //    labelled, so the search corpus stays visible without a second label that
  //    lies about what it counts.
  for (const s of sources)
    console.log(
      '   ├─ source: ' + s.raw + ' chars on disk · ' + s.body.length + ' flat  ' + s.path,
    );

  // ⚠️ per ARTIFACT too, for the same reason and one more: a census whose
  //    rollup is the only figure cannot tell "7 files, each clean" apart from
  //    "6 clean and 1 never read". the per-file row is what makes an artifact
  //    that reported ZERO quotes visible as a suspect rather than a pass.
  if (many) {
    for (const r of reads)
      console.log(
        '   ├─ artifact: ' +
          String(r.ok).padStart(4) + ' verified · ' +
          String(r.live).padStart(3) + ' live · ' +
          String(r.cited).padStart(3) + ' cited · ' +
          String(r.asides).padStart(3) + ' asides   ' +
          r.path,
      );
  }

  const sum = (k) => reads.reduce((a, r) => a + r[k], 0);
  const live = sum('live');
  console.log('   ├─ verified: ' + sum('ok'));
  console.log('   ├─ live defects: ' + live + '   (must be 0)');
  console.log('   ├─ cited in a retraction: ' + sum('cited') + '   (not a defect)');
  console.log('   ├─ editorial asides, not citations: ' + sum('asides') + '   (not checked)');
  console.log('   ├─ under the ' + MIN + '-char floor, not tested: ' + sum('short'));

  // ---- SCOPE. the spliced-citation surface, reported and NOT binding.
  //
  // ⛔ every count above asks "are these words in the corpus?". this one asks
  //    the different question "are they in the SECTION THIS QUOTE CITES?" — and
  //    a quote can pass the first and fail the second. that is the defect that
  //    put a § 502(d) clause under a § 502(c) citation through a green run.
  //
  // ⚠️ it does not move the exit code, deliberately. the slicer can miss on a
  //    renumbered statute or an unexpected subsection class, so a hit here is a
  //    TRIGGER TO INSPECT — the same standing a short pull has under
  //    `rule.require.bhrowser-citations`. promote it once its false-alarm rate
  //    has been measured against a real corpus, never before.
  const offscope = sum('offscope');
  const unscoped = sum('unscoped');
  if (offscope) {
    console.log('   ├─ 🚨 OUT OF SCOPE — verbatim, but not in the cited section (' + offscope + ')');
    for (const r of reads)
      for (const x of r.rows.filter((y) => y.scoped === 'OUT-OF-SCOPE')) {
        console.log('   │     L' + String(x.at).padStart(5) + '  cited ' + x.cite + '  ' + r.path);
        console.log('   │       quote: ' + x.text);

        // ⭐ THE SLICE THE DETECTOR RESOLVED, printed beside the quote it
        //    rejected. this is the whole diagnostic: if the head reads as the
        //    cited section, the citation is the suspect; if it reads as some
        //    OTHER section, the SLICER is, and no reader should touch the
        //    document. without this line the two are indistinguishable, and
        //    the safer guess — leave the citation alone — is the one nobody
        //    makes when a tool prints 🚨 at them.
        if (x.slice) {
          console.log(
            '   │       slice: ' + String(x.slice.len).padStart(6) + ' ch · ' + x.slice.head,
          );
          console.log('   │        ends: …' + x.slice.tail);
        }
      }
    console.log('   │     ⚠️ inspect each — the slicer can miss, so this is a prompt, not a verdict');
    console.log('   │     ⛔ read the SLICE first. a head that names another section is a SLICER');
    console.log('   │        defect, and the cited document is correct — do NOT edit it');
  } else {
    console.log('   ├─ ✅ every scoped quote landed inside the section it cites');
  }
  console.log('   ├─ scope unresolved, not checked: ' + unscoped);

  // ---- the CARDINALITY census. a wholly different axis from every line
  //      above: those ask whether a QUOTE matches a SOURCE, this asks whether
  //      a document agrees with ITSELF.
  //
  // ⭐ it catches the one defect class no source-verification pass can see —
  //    a claim that was TRUE WHEN WRITTEN and rotted when the document grew
  //    under it. every citation on such a page stays perfect.
  const miscount = sum('miscount');
  if (miscount) {
    console.log('   ├─ 🟡 COUNT CLAIM — a heading states N, the items under it are M (' + miscount + ')');
    for (const r of reads)
      for (const x of r.counts)
        console.log(
          '   │     L' +
            String(x.at).padStart(5) +
            '  said "' +
            x.said +
            '" · found ' +
            x.found +
            '  ' +
            x.head,
        );
    console.log('   │     ⚠️ ADVISORY — a heading may name a number for another reason.');
    console.log('   │        inspect each; this does NOT move the exit code');
  } else {
    console.log('   ├─ ✅ every count claim in a heading matches the items under it');
  }

  // ---- the COVERAGE census. what the block-quote reader never looked at.
  //
  // ⭐ it answers a question no other line here answers: not "is this quote
  //    faithful", but "how much of this page did the census decline to read".
  //    every figure above is a rate over a corpus this one measures.
  const lonesome = sum('lonesome');
  const lonemiss = sum('lonemiss');
  console.log(
    '   ├─ 🟡 quoted OUTSIDE a block quote, advisory: ' +
      lonesome +
      '   (' +
      (lonesome - lonemiss) +
      ' in source · ' +
      lonemiss +
      ' not)',
  );
  if (lonemiss) {
    for (const r of reads)
      for (const x of r.lone.filter((y) => !y.hit)) {
        console.log('   │     L' + String(x.at).padStart(5) + '  ' + r.path);
        console.log('   │       text : ' + x.text);
      }
    console.log('   │     ⚠️ ADVISORY — a quotation mark out here does THREE jobs, and only');
    console.log('   │        one is a source claim. a scare quote and a quote of the AUTHOR');
    console.log('   │        both land here correctly. read each; this does NOT move the exit');
    console.log('   │     ⛔ a row that IS a source claim belongs in a block quote with an');
    console.log('   │        attribution — move it, do not widen this detector');
  }

  // ---- CONTROLS. a detector that can only report zero cannot be told
  //      from one that found zero.
  const ctlPos = src.length > 0 && src.includes(src.slice(0, Math.min(60, src.length)));
  const ctlNeg = src.includes('zzz-this-phrase-is-absent-zzz');
  console.log('   ├─ CONTROL positive (source is readable): ' + ctlPos + '   (must be true)');
  console.log('   └─ CONTROL negative (absent phrase): ' + ctlNeg + '   (must be false)');

  if (!ctlPos || ctlNeg) process.exit(1);
  const stuck = reads.some((r) =>
    r.rows.some((x) => x.verdict === 'absent-from-artifact' || x.verdict === 'needle-bug'),
  );
  process.exit(live > 0 || stuck ? 2 : 0);
};

main();
