import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, when } from 'test-fns';

/**
 * BLOCKER: credentials required for live API tests
 *
 * GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS: for OCR transcription
 *
 * locally: rhx keyrack unlock --owner ehmpath --env test
 * in CI: secrets injected via GitHub secrets (keyrack forwards env vars)
 */
describe('transcribe.pdf', () => {
  const scriptPath = path.join(__dirname, 'transcribe.pdf.sh');

  // fail fast if credentials not set
  beforeAll(() => {
    if (!process.env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS) {
      throw new Error(
        'GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS required for OCR. run: rhx keyrack unlock --owner ehmpath --env test',
      );
    }
  });

  const runSkill = (
    args: string[],
  ): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000, // 2 min timeout for OCR
      env: process.env, // explicitly pass env for API credentials
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  given('[case1] --help flag', () => {
    when('[t0] help is requested', () => {
      then('usage info is displayed', () => {
        const result = runSkill(['--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('transcribe.pdf.sh');
        expect(result.stdout).toContain('--into');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] no PDF path provided', () => {
    when('[t0] skill is called without arguments', () => {
      then('error is returned', () => {
        const result = runSkill([]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('blocked');
        expect(result.stdout).toContain('no PDF path');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] PDF file does not exist', () => {
    when('[t0] nonexistent file is specified', () => {
      then('error is returned', () => {
        const result = runSkill([
          '/nonexistent/file.pdf',
          '--into',
          'markdown',
        ]);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('blocked');
        expect(result.stdout).toContain('file not found');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] unsupported output format', () => {
    when('[t0] invalid format is specified', () => {
      then('error is returned', () => {
        // create a temp PDF for this test
        const tempDir = fs.mkdtempSync('/tmp/transcribe-test-');
        const tempPdf = path.join(tempDir, 'test.pdf');
        fs.writeFileSync(tempPdf, '%PDF-1.4\n'); // minimal PDF header

        const result = runSkill([tempPdf, '--into', 'docx']);
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('blocked');
        expect(result.stdout).toContain('unsupported format');
        expect(result.stdout).toMatchSnapshot();

        // cleanup
        fs.rmSync(tempDir, { recursive: true });
      });
    });
  });

  given('[case5] deterministic cached flow (uses fixture)', () => {
    // this test uses a pre-populated fixture to prove the cached flow works
    // without any API calls - deterministic and fast
    const fixturePath = path.join(__dirname, '__fixtures__', 'cached-patent');

    // genTempDir clones the fixture into an isolated temp directory with git init
    const tempDir = genTempDir({
      slug: 'transcribe-cached',
      clone: fixturePath,
      git: true,
    });

    when('[t0] cached result extant', () => {
      then('cache is used instead of OCR (no API calls)', () => {
        // fixture has both PDF and .md file pre-populated
        const testPdf = path.join(
          tempDir,
          '.cache/patents/19399196/1.event.2025-11-24.office-action.pdf',
        );
        const expectedCache = testPdf.replace('.pdf', '.md');

        // failfast: verify fixture PDF is valid (not a JSON error)
        const pdfHeader = fs.readFileSync(testPdf, 'utf-8').slice(0, 10);
        if (!pdfHeader.startsWith('%PDF')) {
          throw new Error(
            `fixture PDF is invalid (not a PDF file). header: ${pdfHeader}. path: ${testPdf}`,
          );
        }

        // failfast: verify fixture has cache file
        if (!fs.existsSync(expectedCache)) {
          throw new Error(
            `fixture .md cache file not found at: ${expectedCache}`,
          );
        }

        const result = runSkill([testPdf, '--into', 'markdown']);

        // should succeed and indicate cache hit
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('found in cache');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case6] valid scanned PDF (LIVE API)', () => {
    // CRITICAL: this test MUST hit the live Google Cloud Vision API
    // if this test passes without credentials, the test suite is broken
    const fixturePath = path.join(__dirname, '__fixtures__', 'cached-patent');

    // genTempDir clones the fixture into an isolated temp directory
    const tempDir = genTempDir({
      slug: 'transcribe-live',
      clone: fixturePath,
      git: true,
    });

    when('[t0] OCR is performed on a real document', () => {
      then('text is extracted and cached', () => {
        const testPdf = path.join(
          tempDir,
          '.cache/patents/19399196/1.event.2025-11-24.office-action.pdf',
        );
        const expectedCache = testPdf.replace('.pdf', '.md');

        // failfast: verify fixture PDF is valid (not a JSON error)
        const pdfHeader = fs.readFileSync(testPdf, 'utf-8').slice(0, 10);
        if (!pdfHeader.startsWith('%PDF')) {
          throw new Error(
            `fixture PDF is invalid (not a PDF file). header: ${pdfHeader}. path: ${testPdf}`,
          );
        }

        // remove cached result to force fresh OCR
        if (fs.existsSync(expectedCache)) {
          fs.unlinkSync(expectedCache);
        }

        const result = runSkill([testPdf, '--into', 'markdown']);

        // failfast: log proof of failure
        if (result.exitCode !== 0) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }

        // should succeed
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('transcribe.pdf');

        // should have extracted text
        expect(result.stdout).toContain('## Page');

        // should have cached result
        expect(fs.existsSync(expectedCache)).toBe(true);

        // snapshot the output structure (not full text, too variable)
        expect(
          result.stdout.split('\n').slice(0, 10).join('\n'),
        ).toMatchSnapshot();
      });
    });
  });
});
