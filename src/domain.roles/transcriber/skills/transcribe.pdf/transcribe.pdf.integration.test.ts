import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { given, then, when } from 'test-fns';

describe('transcribe.pdf', () => {
  const scriptPath = path.join(__dirname, 'transcribe.pdf.sh');

  const runSkill = (
    args: string[],
  ): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000, // 2 min timeout for OCR
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

  given('[case5] valid scanned PDF (LIVE API)', () => {
    // use a real prosecution document from the patent cache
    const cacheDir = path.join(process.cwd(), '.cache/patents');

    when('[t0] OCR is performed on a real document', () => {
      then('text is extracted and cached', () => {
        // find a prosecution PDF in the cache
        if (!fs.existsSync(cacheDir)) {
          throw new Error(
            'no patent cache found: run patent.priors.fetch first to populate cache',
          );
        }

        // look for exid directories with PDFs (e.g., .cache/patents/19399196/*.pdf)
        const exidDirs = fs.readdirSync(cacheDir).filter((f) => {
          const exidPath = path.join(cacheDir, f);
          if (!fs.statSync(exidPath).isDirectory()) return false;
          const pdfs = fs
            .readdirSync(exidPath)
            .filter((p) => p.endsWith('.pdf'));
          return pdfs.length > 0;
        });

        if (exidDirs.length === 0) {
          throw new Error(
            'no prosecution documents found: run patent.priors.fetch first',
          );
        }

        // find first PDF in first exid directory
        const exidPath = path.join(cacheDir, exidDirs[0]!);
        const pdfs = fs.readdirSync(exidPath).filter((f) => f.endsWith('.pdf'));

        if (pdfs.length === 0) {
          throw new Error(`no PDFs found in ${exidPath}`);
        }

        const testPdf = path.join(exidPath, pdfs[0]!);
        const expectedCache = testPdf.replace('.pdf', '.md');

        // remove cached result if extant (to force fresh OCR)
        if (fs.existsSync(expectedCache)) {
          fs.unlinkSync(expectedCache);
        }

        const result = runSkill([testPdf, '--into', 'markdown']);

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

    when('[t1] cached result extant', () => {
      then('cache is used instead of OCR', () => {
        // find same PDF as above
        if (!fs.existsSync(cacheDir)) {
          throw new Error('no patent cache found');
        }

        const exidDirs = fs.readdirSync(cacheDir).filter((f) => {
          const exidPath = path.join(cacheDir, f);
          if (!fs.statSync(exidPath).isDirectory()) return false;
          const pdfs = fs
            .readdirSync(exidPath)
            .filter((p) => p.endsWith('.pdf'));
          return pdfs.length > 0;
        });

        if (exidDirs.length === 0) {
          throw new Error('no prosecution documents found');
        }

        const exidPath = path.join(cacheDir, exidDirs[0]!);
        const pdfs = fs.readdirSync(exidPath).filter((f) => f.endsWith('.pdf'));

        if (pdfs.length === 0) {
          throw new Error(`no PDFs found in ${exidPath}`);
        }

        const testPdf = path.join(exidPath, pdfs[0]!);
        const expectedCache = testPdf.replace('.pdf', '.md');

        // ensure cache extant from previous test
        if (!fs.existsSync(expectedCache)) {
          throw new Error('cache should exist from previous test');
        }

        const result = runSkill([testPdf, '--into', 'markdown']);

        // should succeed and indicate cache hit
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('found in cache');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });
});
