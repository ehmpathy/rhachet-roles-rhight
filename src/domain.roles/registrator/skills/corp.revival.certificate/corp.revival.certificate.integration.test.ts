import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = verifies the Delaware Certificate of Revival renderer
 *
 * .why  = the document this skill emits is a ONE-WAY DOOR filing under
 *         8 Del. C. § 312. once it lands, the § 505(b) route to contest an
 *         assessment is shut. so the two things worth clamping are:
 *
 *           1. the prose matches the Division's form of record, verbatim
 *           2. a date that cannot be true is REFUSED, never rendered
 *
 *         ⛔ [case9] is the decisive case. every other case would still
 *         pass if the fidelity guard were deleted outright — they only
 *         prove the happy path renders. [case9] mutates the committed form
 *         bytes and asserts the skill BLOCKS, which is the only case that
 *         proves the guard can fail at all.
 */
describe('corp.revival.certificate.sh', () => {
  const skillPath = path.join(__dirname, 'corp.revival.certificate.sh');

  const run = (
    args: string[],
    options: { skill?: string } = {},
  ): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [options.skill ?? skillPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = the text a clerk reads off the filed certificate, in page layout
   *
   * .why  = final mode fills and FLATTENS the Division's own AcroForm, so the
   *         artifact is a PDF. its values are only checkable as extracted text,
   *         and `-layout` keeps each value on the rule it was typed onto.
   */
  const asPdfText = (file: string): string => {
    const result = spawnSync('pdftotext', ['-layout', file, '-'], {
      encoding: 'utf-8',
    });
    if (result.error || result.status !== 0)
      throw new Error(
        `pdftotext could not read ${file} — install poppler-utils (apt install poppler-utils); cause: ${result.error?.message ?? result.stderr}`,
      );
    return result.stdout;
  };

  /**
   * .what = the page count of a pdf, off pdfinfo
   * .why  = the page count IS the fee input ("$9.00 for each additional
   *         page"), so a one-page certificate is a property worth a clamp
   */
  const asPdfPageCount = (file: string): number => {
    const result = spawnSync('pdfinfo', [file], { encoding: 'utf-8' });
    const pages = /Pages:\s+(\d+)/.exec(result.stdout ?? '')?.[1];
    if (!pages)
      throw new Error(
        `pdfinfo could not read ${file} — install poppler-utils (apt install poppler-utils); cause: ${result.error?.message ?? result.stderr}`,
      );
    return Number(pages);
  };

  /**
   * .what = what sits on the By: rule, between it and its caption
   * .why  = the conformed signature and the ink path differ ONLY here
   */
  const asByRule = (text: string): string =>
    text
      .slice(text.indexOf('By:') + 'By:'.length, text.indexOf('Authorized Officer'))
      .replace(/_/g, '')
      .trim();

  /**
   * .what = the args a second, non-demo corporation renders under
   *
   * .why  = --demo alone would let a defect hide in the demo constants.
   *         this set exercises a different month, a two-digit day, and a
   *         prior name — three branches --demo never touches.
   */
  const argsRenamed = [
    '--name',
    'SANDPINE HOLDINGS, INC.',
    '--name-original',
    'SANDPINE, INC.',
    '--office-street',
    '1209 ORANGE STREET',
    '--office-city',
    'WILMINGTON',
    '--office-county',
    'New Castle',
    '--office-zip',
    '19801',
    '--agent',
    'THE CORPORATION TRUST COMPANY',
    '--incorporated-on',
    '05/21/2020',
    '--voided-on',
    '03/02/2023',
    '--officer',
    "Eagle Of'Rhight",
    '--capacity',
    'President',
  ];

  given('[case1] the demo corporation, in plan mode', () => {
    const result = useBeforeAll(async () => run(['--demo']));

    then('it exits clean', () => {
      expect(result.exitCode).toBe(0);
    });

    then('it renders article 5 as an ordinal day', () => {
      expect(result.stdout).toContain('1st day of March A.D. 2024');
    });

    then('it renders article 3 in long form, never MM/DD', () => {
      expect(result.stdout).toContain('May 21, 2020');
      expect(result.stdout).not.toContain('05/21/2020');
    });

    then('it writes no file', () => {
      expect(result.stdout).toContain('no file written');
    });

    then('the report reads as expected', () => {
      expect(result.stdout).toMatchSnapshot();
    });
  });

  given('[case2] the demo corporation, in final mode', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-demo' });
      const into = path.join(dir, 'certificate.pdf');
      const result = run(['--demo', '--mode', 'final', '--into', into]);
      return { result, into, text: asPdfText(into) };
    });

    then('it exits clean', () => {
      expect(scene.result.exitCode).toBe(0);
    });

    then('the recital matches the Division form, verbatim', () => {
      // ⚠️ the form's own prose wraps, so compare on a whitespace-collapsed
      //    copy. COMPARE-ONLY — the assertions below read the original text.
      const collapsed = scene.text.replace(/\s+/g, ' ');
      expect(collapsed).toContain(
        'The corporation organized under the laws of the State of Delaware, ' +
          'the charter of which was voided for non-payment of taxes and/or ' +
          'for failure to file a complete annual report, now desires to ' +
          'procure a revival of its charter pursuant to Section 312 of the ' +
          'General Corporation Law of the State of Delaware, and hereby ' +
          'certifies as follows:',
      );
    });

    then('article 4 is pre-printed, verbatim', () => {
      const collapsed = scene.text.replace(/\s+/g, ' ');
      expect(collapsed).toContain(
        'The corporation desiring to be revived and so reviving its ' +
          'certificate of incorporation was organized under the laws of ' +
          'this State.',
      );
    });

    then('every article carries its supplied value', () => {
      // ⚠️ flatten can space a value across its widget, so each value is
      //    checked on a whitespace-collapsed copy of its own line
      const collapsed = scene.text.replace(/[ \t]+/g, ' ');
      expect(collapsed).toContain('SANDPINE, INC.');
      expect(collapsed).toContain('1209 ORANGE STREET');
      expect(collapsed).toContain('WILMINGTON');
      expect(collapsed).toContain('New Castle');
      expect(collapsed).toContain('19801');
      expect(collapsed).toContain('THE CORPORATION TRUST COMPANY');
      expect(collapsed).toContain('May 21, 2020');
      expect(collapsed).toMatch(/\b1st\b/);
      expect(collapsed).toMatch(/\bMarch\b/);
      expect(collapsed).toMatch(/\b2024\b/);
    });

    then('it files the certificate page alone, not the 3-page packet', () => {
      // the Division's file carries a cover letter and an instruction sheet
      // ahead of the certificate; only the page with widgets is filed
      expect(asPdfPageCount(scene.into)).toBe(1);
      expect(scene.text).not.toContain('Special Instructions');
    });

    then('it quotes the fee in the report', () => {
      expect(scene.result.stdout).toContain('$189.00');
    });

    then('the document reads as expected', () => {
      expect(scene.text).toMatchSnapshot();
    });
  });

  given('[case3] a corporation with NO prior name', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-noprior' });
      const into = path.join(dir, 'certificate.pdf');
      run(['--demo', '--mode', 'final', '--into', into]);
      return { text: asPdfText(into) };
    });

    /**
     * .why = the clause is the Division's own printed prose, so it stays —
     *        a deleted blank is a modified agency form
     *        (rule.forbid.reproduce-a-supplied-form). what must hold is that
     *        its blank stays EMPTY: no second name is invented for it.
     */
    then('the "and, if different" blank is left empty', () => {
      const lines = scene.text.split('\n');
      const at = lines.findIndex((l) => l.includes('and, if different'));
      expect(at).toBeGreaterThan(-1);
      // the rule beneath the clause carries underscores and no value
      expect(lines[at + 1]!.replace(/[_.\s]/g, '')).toBe('');
      expect(scene.text.match(/SANDPINE/g)).toHaveLength(1);
    });
  });

  given('[case4] a corporation that was RENAMED after incorporation', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-renamed' });
      const into = path.join(dir, 'certificate.pdf');
      const result = run([...argsRenamed, '--mode', 'final', '--into', into]);
      return { result, text: asPdfText(into) };
    });

    then('it exits clean', () => {
      expect(scene.result.exitCode).toBe(0);
    });

    then('the "and, if different" clause renders, with the prior name', () => {
      const collapsed = scene.text.replace(/[ \t]+/g, ' ');
      expect(collapsed).toContain('and, if different');
      expect(collapsed).toContain('SANDPINE HOLDINGS, INC.');
      expect(collapsed).toContain('SANDPINE, INC.');
    });

    then('a two-digit ordinal takes the right suffix', () => {
      expect(scene.text).toMatch(/\b2nd\b/);
      expect(scene.text).not.toContain('2th');
    });

    then('the document reads as expected', () => {
      expect(scene.text).toMatchSnapshot();
    });
  });

  given(
    '[case5] a date that matches every MM/DD/YYYY regex and is not a day',
    () => {
      const result = useBeforeAll(async () =>
        run(['--demo', '--voided-on', '02/30/2024']),
      );

      then('it is refused as a constraint', () => {
        expect(result.exitCode).toBe(2);
      });

      then('the refusal names the flag and the value', () => {
        expect(result.stderr).toContain('--voided-on');
        expect(result.stderr).toContain('02/30/2024');
      });
    },
  );

  given('[case6] a void date at or before the incorporation date', () => {
    const result = useBeforeAll(async () =>
      run(['--demo', '--voided-on', '05/01/2020']),
    );

    then('it is refused as a constraint', () => {
      expect(result.exitCode).toBe(2);
    });

    then('the refusal names both dates', () => {
      expect(result.stderr).toContain('2020-05-01');
      expect(result.stderr).toContain('2020-05-21');
    });
  });

  given('[case7] a void date in the future', () => {
    const result = useBeforeAll(async () =>
      run(['--demo', '--voided-on', '01/01/2999']),
    );

    then('it is refused as a constraint', () => {
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('in the future');
    });
  });

  given('[case8] an incomplete or malformed invocation', () => {
    when('[t0] a required arg is absent', () => {
      const result = useBeforeAll(async () =>
        run(['--name', 'SANDPINE, INC.']),
      );

      then('it is refused, and names the absent flag', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('--office-street is required');
      });
    });

    when('[t1] the zip is not a zip', () => {
      const result = useBeforeAll(async () =>
        run(['--demo', '--office-zip', '1980']),
      );

      then('it is refused', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('--office-zip');
      });
    });

    when('[t2] final mode is asked for with no --into', () => {
      const result = useBeforeAll(async () =>
        run(['--demo', '--mode', 'final']),
      );

      then('it is refused', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('--into is required');
      });
    });

    when('[t3] an unknown flag is passed', () => {
      const result = useBeforeAll(async () => run(['--demo', '--nope']));

      then('it is refused, and points at --help', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('--help');
      });
    });
  });

  /**
   * ⛔ THE DECISIVE CASE.
   *
   * every case above proves the happy path renders. NONE of them would go
   * red if `assert_verbatim` were replaced by `return 0` — so none of them
   * proves the fidelity guard exists.
   *
   * this case stands up a copy of the skill whose form bytes have been
   * mutated, and asserts the skill REFUSES rather than emits a certificate
   * whose text no longer matches the Division's form of record.
   */
  given('[case9] the committed form bytes have DRIFTED', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-drift' });
      fs.mkdirSync(path.join(dir, 'refs'), { recursive: true });

      fs.copyFileSync(skillPath, path.join(dir, 'corp.revival.certificate.sh'));
      fs.copyFileSync(
        path.join(__dirname, 'output.sh'),
        path.join(dir, 'output.sh'),
      );

      // one word of article 4, changed. a template revision is exactly this
      // shape, and it must not pass unnoticed.
      const formName = 'effectiveAt=2023-08-01.de-revival-void-form.txt';
      const bytes = fs.readFileSync(
        path.join(__dirname, 'refs', formName),
        'utf-8',
      );
      const drifted = bytes.replace(
        'was organized under the laws of this State.',
        'was incorporated under the laws of this State.',
      );
      expect(drifted).not.toEqual(bytes); // the mutation must actually land
      fs.writeFileSync(path.join(dir, 'refs', formName), drifted);

      const result = run(['--demo'], {
        skill: path.join(dir, 'corp.revival.certificate.sh'),
      });
      return { result };
    });

    then('it BLOCKS as a malfunction, and renders no certificate', () => {
      expect(scene.result.exitCode).toBe(1);
    });

    then('the refusal names the drift, and quotes the absent fragment', () => {
      expect(scene.result.stderr).toContain('form text drifted');
      expect(scene.result.stderr).toContain(
        'The corporation desiring to be revived',
      );
    });
  });

  given('[case10] the form bytes are absent entirely', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-norefs' });
      fs.copyFileSync(skillPath, path.join(dir, 'corp.revival.certificate.sh'));
      fs.copyFileSync(
        path.join(__dirname, 'output.sh'),
        path.join(dir, 'output.sh'),
      );
      return {
        result: run(['--demo'], {
          skill: path.join(dir, 'corp.revival.certificate.sh'),
        }),
      };
    });

    then('it BLOCKS rather than render an unverified certificate', () => {
      expect(scene.result.exitCode).toBe(1);
      expect(scene.result.stderr).toContain('form bytes absent');
    });
  });

  given('[case11] --help', () => {
    const result = useBeforeAll(async () => run(['--help']));

    then('it exits clean', () => {
      expect(result.exitCode).toBe(0);
    });

    then('it carries the one-way-door block', () => {
      expect(result.stdout).toContain('§ 505(b)');
    });

    then("it says --voided-on is DELAWARE'S record", () => {
      expect(result.stdout).toContain("DELAWARE'S RECORD");
    });

    then('the help reads as expected', () => {
      expect(result.stdout).toMatchSnapshot();
    });
  });

  /**
   * .what = the § 103(h) conformed-signature path
   *
   * .why  = the DEFAULT render leaves the By: rule blank, so a bug that
   *         dropped the signature value entirely would be INVISIBLE to every case
   *         above — they all assert on an unsigned document and would still
   *         pass. [t0] is the only assertion that the ink actually lands.
   *
   *         ⛔ and [case13] is its twin: the guard must REFUSE a signature
   *         that disagrees with the printed name, or the skill will happily
   *         emit a certificate that contradicts itself on its own
   *         execution block.
   */
  given('[case12] the demo corporation, SIGNED under § 103(h)', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-signed' });
      const into = path.join(dir, 'signed.pdf');
      const result = run([
        '--demo',
        '--sign-as',
        "Eagle Of'Rhight",
        '--mode',
        'final',
        '--into',
        into,
      ]);
      return { result, text: asPdfText(into) };
    });

    then('it exits clean', () => {
      expect(scene.result.exitCode).toBe(0);
    });

    then('the By: rule carries the conformed name', () => {
      // the name lands in the Division's own signature widget, so it reads
      // between their "By:" rule and its "Authorized Officer" caption
      expect(asByRule(scene.text)).toBe("Eagle Of'Rhight");
    });

    then('the name appears on both the By: and the Name: rules', () => {
      expect(scene.text.match(/Eagle Of'Rhight/g)).toHaveLength(2);
    });

    then('the report names the statute that permits it', () => {
      expect(scene.result.stdout).toContain('conformed signature');
      expect(scene.result.stdout).toContain('§ 103(h)');
    });

    then('it warns that the signature is an oath', () => {
      expect(scene.result.stdout).toContain('§ 103(b)(2)');
    });
  });

  given('[case13] a --sign-as that DISAGREES with --officer', () => {
    const result = useBeforeAll(async () =>
      run(['--demo', '--sign-as', 'Someone Else']),
    );

    then('it BLOCKS as a constraint', () => {
      expect(result.exitCode).toBe(2);
    });

    then('the refusal names both values', () => {
      expect(result.stderr).toContain('Someone Else');
      expect(result.stderr).toContain("Eagle Of'Rhight");
    });
  });

  given('[case14] the default render, UNSIGNED', () => {
    const scene = useBeforeAll(async () => {
      const dir = genTempDir({ slug: 'revival-unsigned' });
      const into = path.join(dir, 'unsigned.pdf');
      const result = run(['--demo', '--mode', 'final', '--into', into]);
      return { result, into, text: asPdfText(into) };
    });

    then('the By: rule is left blank for an ink signature', () => {
      expect(asByRule(scene.text)).toBe('');
      // the printed name still fills the Name: rule
      expect(scene.text.match(/Eagle Of'Rhight/g)).toHaveLength(1);
    });

    then('the document references no remote resource', () => {
      // a filed pdf must render the same offline as on the clerk's machine
      const bytes = fs.readFileSync(scene.into, 'latin1');
      expect(bytes).not.toMatch(/https?:\/\/fonts\./);
      expect(bytes).not.toContain('/URI');
    });

    then('the report offers the signed path', () => {
      expect(scene.result.stdout).toContain('--sign-as');
    });
  });
});
