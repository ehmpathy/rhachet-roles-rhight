import { spawnSync } from 'child_process';
import * as path from 'path';
import { given, then, when } from 'test-fns';

/**
 * unit tests for status-to-emoji conversion
 *
 * emoji semantics:
 *   🌱 = new/docketed (early stage)
 *   ⏳ = in process (dispatched, preexam, non-final action)
 *   🚫 = final rejection
 *   ✨ = notice of allowance
 *   🏆 = patented
 *   💀 = abandoned
 *   📋 = other/unknown
 */
describe('asStatusEmoji.sh', () => {
  const scriptPath = path.join(__dirname, 'asStatusEmoji.sh');

  const getEmoji = (status: string): string => {
    const result = spawnSync('bash', [scriptPath, status], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.stdout.trim();
  };

  given('[case1] new case statuses', () => {
    when('[t0] status contains "New Case"', () => {
      then('returns 🌱 sprout', () => {
        expect(getEmoji('Docketed New Case - Ready for Examination')).toBe(
          '🌱',
        );
        expect(getEmoji('New Case - Application Dispatched')).toBe('🌱');
      });
    });

    when('[t1] status contains "Ready for Examination"', () => {
      then('returns 🌱 sprout', () => {
        expect(getEmoji('Ready for Examination')).toBe('🌱');
      });
    });
  });

  given('[case2] in-progress statuses', () => {
    when('[t0] status contains "Dispatched"', () => {
      then('returns ⏳ hourglass', () => {
        expect(
          getEmoji('Application Dispatched from Preexam, Not Yet Docketed'),
        ).toBe('⏳');
      });
    });

    when('[t1] status contains "Not Yet Docketed"', () => {
      then('returns ⏳ hourglass', () => {
        expect(getEmoji('Not Yet Docketed')).toBe('⏳');
      });
    });

    when('[t2] status contains "Preexam"', () => {
      then('returns ⏳ hourglass', () => {
        expect(getEmoji('Application Undergoing Preexam Processing')).toBe(
          '⏳',
        );
      });
    });

    when('[t3] status contains "Non Final Action"', () => {
      then('returns ⏳ hourglass', () => {
        expect(getEmoji('Non Final Action Mailed')).toBe('⏳');
      });
    });

    when('[t4] status contains "Non-Final Action" (hyphenated)', () => {
      then('returns ⏳ hourglass', () => {
        expect(getEmoji('Non-Final Action Mailed')).toBe('⏳');
      });
    });
  });

  given('[case3] final rejection statuses', () => {
    when('[t0] status contains "Final Rejection"', () => {
      then('returns 🚫 no-entry', () => {
        expect(getEmoji('Final Rejection Mailed')).toBe('🚫');
      });
    });

    when('[t1] status contains "Final Action"', () => {
      then('returns 🚫 no-entry', () => {
        expect(getEmoji('Final Action Mailed')).toBe('🚫');
      });
    });
  });

  given('[case4] notice of allowance', () => {
    when('[t0] status contains "Notice of Allowance"', () => {
      then('returns ✨ sparkles', () => {
        expect(getEmoji('Notice of Allowance Mailed')).toBe('✨');
      });
    });
  });

  given('[case5] granted patent', () => {
    when('[t0] status contains "Patented"', () => {
      then('returns 🏆 trophy', () => {
        expect(getEmoji('Patented')).toBe('🏆');
        expect(getEmoji('Patented Case')).toBe('🏆');
      });
    });

    when('[t1] status contains "Patent Issued"', () => {
      then('returns 🏆 trophy', () => {
        expect(getEmoji('Patent Issued')).toBe('🏆');
      });
    });
  });

  given('[case6] abandoned', () => {
    when('[t0] status contains "Abandoned"', () => {
      then('returns 💀 skull', () => {
        expect(getEmoji('Abandoned')).toBe('💀');
        expect(getEmoji('Abandoned - Failure to Respond')).toBe('💀');
      });
    });
  });

  given('[case7] unknown statuses', () => {
    when('[t0] status is empty', () => {
      then('returns 📋 clipboard', () => {
        expect(getEmoji('')).toBe('📋');
      });
    });

    when('[t1] status is unrecognized', () => {
      then('returns 📋 clipboard', () => {
        expect(getEmoji('Some Unknown Status')).toBe('📋');
        expect(getEmoji('Application Filed')).toBe('📋');
      });
    });
  });

  given('[case8] snapshot coverage', () => {
    when('[t0] all known statuses are mapped', () => {
      then('mapping table matches snapshot', () => {
        const statuses = [
          // new case
          'Docketed New Case - Ready for Examination',
          'Ready for Examination',
          // in progress
          'Application Dispatched from Preexam, Not Yet Docketed',
          'Application Undergoing Preexam Processing',
          'Non Final Action Mailed',
          'Non-Final Action Mailed',
          // final rejection
          'Final Rejection Mailed',
          'Final Action Mailed',
          // allowance
          'Notice of Allowance Mailed',
          // granted
          'Patented',
          'Patent Issued',
          // abandoned
          'Abandoned',
          'Abandoned - Failure to Respond',
          // unknown
          '',
          'Some Unknown Status',
        ];

        const mapping = statuses.map((status) => ({
          status: status || '(empty)',
          emoji: getEmoji(status),
        }));

        expect(mapping).toMatchSnapshot();
      });
    });
  });
});
