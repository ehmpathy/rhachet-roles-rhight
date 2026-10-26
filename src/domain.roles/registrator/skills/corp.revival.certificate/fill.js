#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * .what = fill the Delaware Division of Corporations' OWN Certificate of
 *         Revival AcroForm, in their own PDF, and write the result.
 *
 * .why  = the Division ships this form FILLABLE — 26 named text widgets. a
 *         rebuild of the page in HTML produces a document that resembles the
 *         official one and is not it: our typography, our margins, a revision
 *         stamp we typed rather than one baked into their page, and flat text
 *         where a clerk's software expects widgets.
 *
 *         ⇒ rule.forbid.reproduce-a-supplied-form. the agency's file is the
 *           artifact; we supply values, never a page.
 *
 * ⛔ THE SHA256 IS PINNED. a form revision moves every field name at once, and
 *    it moves them SILENTLY — a renamed widget would leave its value unset and
 *    the output would look complete with an empty article. so the bytes are
 *    asserted before a single field is touched.
 *
 * ⛔ EVERY FIELD NAME IS READ OFF THEIR FILE, never invented. an absent name is
 *    a refusal, not a skip: a skip emits a certificate with a blank article,
 *    which is precisely the failure the pin exists to prevent.
 *
 * ⛔ NO CONTENT IS ADDED. no footer, no caption suffix, no provenance stamp.
 *    the blanks the Division left blank stay blank — including article 1's
 *    "and, if different" line, which an earlier HTML rebuild DELETED because a
 *    blank looked untidy. a deleted blank is a modified agency form.
 *
 * usage (the skill calls this; a human calls the skill):
 *   node fill.js <payload.json>
 *
 * the payload names values, never field names. the map from value to widget
 * lives here, beside the pin, so the two move together.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { PDFDocument } = require('pdf-lib');

/**
 * the bytes of record. re-derive with:
 *   registrator/briefs/refs/delaware-revival-form.reverify.play.ts
 * which re-pulls live and compares by this same digest.
 */
const FORM_SHA256 =
  '63e4b44d8ebaf6bfb4878b514353fbff01c45f9386ed8721c2acd9c865079e2b';
const FORM_PATH = path.join(
  __dirname,
  'refs',
  'effectiveAt=2023-08-01.de-revival-void-form.pdf',
);

/**
 * value -> widget. the RIGHT column is read off the Division's file; not one
 * entry is guessed.
 *
 * ⛔ A `(2)` SUFFIX IS THE SECOND *RULE* OF ONE BLANK, NOT A SECOND COPY OF
 *    THE FORM. two of the Division's blanks wrap onto a continuation line,
 *    and they gave both widgets one name, with a `(2)` on the lower. the
 *    census proves it — every one of the 15 widgets sits on page index 2, and
 *    each `(2)` pair sits 14pt apart in y on that one page:
 *
 *      The name of the corporation is        x=277 y=588 w=240   <- rule 1
 *      The name of the corporation is (2)    x= 90 y=574 w=426   <- rule 2
 *
 *    rule 1 is the SHORT tail that opens right after their printed prose
 *    "The name of the corporation is"; rule 2 is the full-width line beneath
 *    it. a human fills rule 1 and spills onto rule 2 only when the name runs
 *    long — so a value that starts on rule 2 reads as a name whose first line
 *    was left blank.
 *
 * 🚩 this comment previously claimed the `(2)` widgets were "the certificate's
 *    own" because "the packet carries the instruction sheet and the
 *    certificate in one file". that was FALSE, and it was a justification
 *    authored to defend a choice already made — pages 1 and 2 carry ZERO
 *    widgets. the census is what refuted it; the render alone could not,
 *    because a name on rule 2 looks deliberate.
 *
 * ⇒ so a wrapped blank takes a RULES ARRAY, top line first, and the fill
 *   places on the first rule. overflow onto rule 2 is a deliberate, named
 *   payload slot — never an inference.
 */
const FIELDS = {
  name: ['The name of the corporation is', 'The name of the corporation is (2)'],
  nameOriginal:
    'and if different the name under which the corporation was originally incorporated',
  officeStreet: 'street name of registered agent office',
  officeCity: 'in the City of',
  officeCounty: 'County of',
  officeZip: 'Zip Code',
  agent: [
    'whom process against this Corporation may be served is',
    'whom process against this Corporation may be served is (2)',
  ],
  incorporatedOn: 'Incorporation date',
  voidDay: 'day entity went void',
  voidMonth: 'month entity went void',
  voidYear: 'year entity went void',
  signature: 'signature of authorized officer',
  printedName: 'printed name of authorized officer',
};

/** every widget name the map reaches, flattened — for the staleness check */
const widgetsOf = (entry) => (Array.isArray(entry) ? entry : [entry]);

const die = (message, context) => {
  console.error(JSON.stringify({ ok: false, message, context }, null, 2));
  process.exit(1);
};

/**
 * ⭐ THE INSET. the Division's widget rectangles begin flush against the left
 *    end of their printed rule, and several rules begin mid-sentence — article
 *    1's first rule opens right after "The name of the corporation is". a value
 *    set flush-left there butts against their prose with no gap, which reads as
 *    a typographic defect on a document a clerk must find legible (their own
 *    instruction sheet asks that "the execution be legible").
 *
 * ⛔ this pads the VALUE. it does not move their widget, resize their box, or
 *    touch their page. the form is unmodified; only what we type into it is
 *    indented.
 */
const INSET = '   ';

/**
 * .what = print every widget the Division's file carries, with the page it
 *         sits on and its rectangle, in the page's own coordinate space.
 *
 * .why  = "why did my value land on that line?" is a question about THEIR
 *         layout, and it must be answered with their numbers rather than with
 *         a look at a render and a guess. pdf origin is BOTTOM-left, so a
 *         LARGER y is HIGHER on the page.
 */
const census = (pdf) => {
  const pages = pdf.getPages();
  const at = new Map(pages.map((p, i) => [p.ref.tag, i]));
  return pdf
    .getForm()
    .getFields()
    .flatMap((field) =>
      field.acroField.getWidgets().map((widget) => {
        const rect = widget.getRectangle();
        const page = widget.P();
        return {
          name: field.getName(),
          page: page ? (at.get(page.tag) ?? null) : null,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
    )
    .sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
};

const main = () => {
  const payloadPath = process.argv[2];
  if (!payloadPath) die('no payload path given');

  // ⛔ the pin, before aught else — the census reads their bytes too, so it
  //    is gated by the same digest as the fill.
  if (!fs.existsSync(FORM_PATH)) die('agency form absent', { at: FORM_PATH });
  const formBytes = fs.readFileSync(FORM_PATH);
  const digest = crypto.createHash('sha256').update(formBytes).digest('hex');
  if (digest !== FORM_SHA256)
    die(
      'the agency form changed — every field name may have moved. re-run delaware-revival-form.reverify.play.ts, then re-derive the field map',
      { expected: FORM_SHA256, found: digest },
    );

  // ⭐ the census is a READ of their form. it writes naught and takes no
  //    payload, so it can answer a layout question without a fill.
  if (payloadPath === '--census')
    return PDFDocument.load(formBytes).then((pdf) => {
      console.log(
        JSON.stringify(
          {
            ok: true,
            form: { path: FORM_PATH, sha256: digest, pinned: true },
            pages: pdf.getPageCount(),
            widgets: census(pdf),
          },
          null,
          2,
        ),
      );
    });

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

  return PDFDocument.load(formBytes).then((pdf) => {
    const form = pdf.getForm();

    // ⛔ the CENSUS, not a recall. a refusal needs the real name set to quote.
    const present = new Set(form.getFields().map((f) => f.getName()));

    // ⛔ EVERY rule of a wrapped blank is checked, not just the first — an
    //    absent continuation is the same stale-map signal as an absent blank.
    const absent = Object.entries(FIELDS)
      .flatMap(([slot, entry]) =>
        widgetsOf(entry).map((widget, rule) => ({ slot, widget, rule: rule + 1 })),
      )
      .filter(({ widget }) => !present.has(widget));
    if (absent.length)
      die('field names absent from the agency form — the map is stale', {
        absent,
        // ⭐ the real names go on the record, so the repair needs no second run
        present: Array.from(present),
      });

    /**
     * @param slot  the value's name
     * @param value what to type
     * @param rule  1-based; which line of a wrapped blank. defaults to the
     *              TOP line, because that is where a human starts. a caller
     *              passes 2 only to spill a long value deliberately.
     */
    const set = (slot, value, rule = 1) => {
      // an empty value leaves the Division's blank BLANK. it is never deleted.
      if (value === null || value === undefined || value === '') return null;
      const rules = widgetsOf(FIELDS[slot]);
      const widget = rules[rule - 1];
      if (!widget)
        die('no such rule on this blank', { slot, rule, rules: rules.length });
      const inset = INSET + String(value);
      form.getTextField(widget).setText(inset);
      return { widget, slot, rule, of: rules.length, value: inset };
    };

    const wrote = [
      set('name', payload.name),
      // ⚠️ the spill lines. a long name or agent runs past its first rule, and
      //    the Division gave it a second. splitting the value across the two
      //    is the HUMAN's call — the payload names each half, so a reader of
      //    the payload can see the break rather than infer it from a render.
      set('name', payload.nameLine2, 2),
      set('nameOriginal', payload.nameOriginal),
      set('officeStreet', payload.officeStreet),
      set('officeCity', payload.officeCity),
      set('officeCounty', payload.officeCounty),
      set('officeZip', payload.officeZip),
      set('agent', payload.agent),
      set('agent', payload.agentLine2, 2),
      set('incorporatedOn', payload.incorporatedOn),
      set('voidDay', payload.voidDay),
      set('voidMonth', payload.voidMonth),
      set('voidYear', payload.voidYear),
      set('signature', payload.signature),
      set('printedName', payload.printedName),
    ].filter(Boolean);

    /**
     * ⛔ THE PACKET IS NOT THE DOCUMENT. the Division's file is 3 pages and
     *    only the last is the certificate:
     *
     *      page 1  their cover letter, addressed to the filer
     *      page 2  "Special Instructions" — which says, in its own words,
     *              "This form is to be used as a Template only."
     *      page 3  the certificate. EVERY one of the 15 widgets is here.
     *
     *    to upload all three files their instruction sheet into the corporate
     *    record, and prices the filing by their own page rule: "$189.00. If
     *    the document is more than 1 page, please include $9.00 for each
     *    additional page."
     *
     * ⇒ so the certificate pages are derived from where the WIDGETS are —
     *   never from a hardcoded index, which a revision would silently move.
     *   a page with no widget is not part of what gets filed.
     */
    const keep = new Set(census(pdf).map((w) => w.page));
    if (!keep.size) die('no widget sits on any page — cannot tell the document from the packet');
    const pagesInPacket = pdf.getPageCount();

    // flatten bakes the values into the page, so a clerk receives a document
    // rather than an editable form. an unflattened copy stays available for a
    // human who means to print and sign in ink over the rule.
    // ⚠️ AFTER the page derivation — flatten removes the widgets it reads.
    if (payload.flatten !== false) form.flatten();

    // ⚠️ drop from the BACK, or every removal shifts the indices beneath it.
    const dropped = [];
    if (payload.pages !== 'packet')
      for (let i = pdf.getPageCount() - 1; i >= 0; i -= 1)
        if (!keep.has(i)) {
          pdf.removePage(i);
          dropped.push(i + 1);
        }

    return pdf.save().then((out) => {
      fs.writeFileSync(payload.into, out);
      console.log(
        JSON.stringify(
          {
            ok: true,
            form: { path: FORM_PATH, sha256: digest, pinned: true },
            fieldsInForm: present.size,
            fieldsSet: wrote.length,
            // ⭐ which RULE each value landed on. this is the record that would
            //    have caught the rule-2 defect without a render — a value on
            //    rule 2 of 2 is a spill, and a spill with no rule-1 sibling is
            //    a name whose first line was left blank.
            placed: wrote.map((w) => ({
              slot: w.slot,
              rule: `${w.rule} of ${w.of}`,
              widget: w.widget,
            })),
            // ⚠️ the blanks we deliberately left alone, named, so a reader can
            //    tell "left blank on purpose" from "the map missed it"
            leftBlank: Object.keys(FIELDS).filter(
              (slot) => !wrote.some((w) => w.slot === slot),
            ),
            flattened: payload.flatten !== false,
            // ⭐ the page count IS the fee input — "$189.00 … $9.00 for each
            //    additional page" — so it goes on the record beside the
            //    instruction pages that were dropped out of the filing.
            pages: {
              inPacket: pagesInPacket,
              filed: pdf.getPageCount(),
              droppedAsInstructions: dropped.sort((a, b) => a - b),
            },
            into: payload.into,
            bytes: out.length,
          },
          null,
          2,
        ),
      );
    });
  });
};

Promise.resolve()
  .then(main)
  .catch((error) => die(error.message, { stack: error.stack }));
