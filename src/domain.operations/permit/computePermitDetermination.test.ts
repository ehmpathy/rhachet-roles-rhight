import { given, then, when } from 'test-fns';

import { PermitCodeCitation } from '../../domain.objects/permit/PermitCodeCitation';
import { PermitWorkDescription } from '../../domain.objects/permit/PermitWorkDescription';
import { computePermitDetermination } from './computePermitDetermination';

describe('computePermitDetermination', () => {
  const makeWork = (
    overrides?: Partial<PermitWorkDescription>,
  ): PermitWorkDescription =>
    new PermitWorkDescription({
      workType: 'electrical',
      scope: 'Panel upgrade 100A to 200A',
      propertyType: 'residential',
      address: '123 Main St',
      postalCode: '46220',
      ...overrides,
    });

  given('[case1] citation requires permit', () => {
    when('[t0] single requires-permit citation', () => {
      then('result is required with high confidence', () => {
        const citations = [
          new PermitCodeCitation({
            codeRef: 'IRC R105.1',
            quote: 'Permits shall be required for electrical work.',
            relevance: 'requires-permit',
            explanation: 'Electrical panel work requires permit per code.',
          }),
        ];

        const result = computePermitDetermination({
          work: makeWork(),
          jurisdictionSlug: 'indianapolis-marion-in',
          citations,
        });

        expect(result.result).toBe('required');
        expect(result.confidence).toBe('high');
        expect(result.citations).toHaveLength(1);
        expect(result.disclaimer).toContain('not legal advice');
      });
    });
  });

  given('[case2] citation exempts work', () => {
    when('[t0] single exempt citation', () => {
      then('result is not-required with high confidence', () => {
        const citations = [
          new PermitCodeCitation({
            codeRef: 'IRC R105.2',
            quote: 'Minor repairs exempt from permit.',
            relevance: 'exempt',
            explanation: 'Work qualifies as minor repair.',
          }),
        ];

        const result = computePermitDetermination({
          work: makeWork({ workType: 'general', scope: 'Replace doorknob' }),
          jurisdictionSlug: 'indianapolis-marion-in',
          citations,
        });

        expect(result.result).toBe('not-required');
        expect(result.confidence).toBe('high');
      });
    });
  });

  given('[case3] conditional citation', () => {
    when('[t0] work has conditional permit requirement', () => {
      then('result is conditional with conditions listed', () => {
        const citations = [
          new PermitCodeCitation({
            codeRef: 'IRC R105.2(3)',
            quote: 'Permit required if exceeds 30 amps.',
            relevance: 'conditional',
            explanation: 'Permit required if circuit exceeds 30 amps.',
          }),
        ];

        const result = computePermitDetermination({
          work: makeWork(),
          jurisdictionSlug: 'indianapolis-marion-in',
          citations,
        });

        expect(result.result).toBe('conditional');
        expect(result.confidence).toBe('medium');
        expect(result.conditions).toContain(
          'Permit required if circuit exceeds 30 amps.',
        );
      });
    });
  });

  given('[case4] no citations but known trade work', () => {
    when('[t0] electrical work with no citations', () => {
      then('result is required with low confidence', () => {
        const result = computePermitDetermination({
          work: makeWork(),
          jurisdictionSlug: 'indianapolis-marion-in',
          citations: [],
        });

        expect(result.result).toBe('required');
        expect(result.confidence).toBe('low');
        expect(result.summary).toContain('typically requires');
      });
    });
  });

  given('[case5] unknown work type with no citations', () => {
    when('[t0] generic work with no citations', () => {
      then('result is unclear', () => {
        const result = computePermitDetermination({
          work: makeWork({ workType: 'landscaping', scope: 'Plant trees' }),
          jurisdictionSlug: 'indianapolis-marion-in',
          citations: [],
        });

        expect(result.result).toBe('unclear');
        expect(result.confidence).toBe('low');
      });
    });
  });
});
