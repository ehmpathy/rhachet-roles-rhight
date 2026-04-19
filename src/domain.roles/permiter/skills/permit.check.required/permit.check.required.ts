import { parseArgs } from 'util';

import { PermitCodeCitation } from '../../../../domain.objects/permit/PermitCodeCitation';
import type { PermitCodeSection } from '../../../../domain.objects/permit/PermitCodeSection';
import { computePermitDetermination } from '../../../../domain.operations/permit/computePermitDetermination';
import { parsePermitWorkDescription } from '../../../../domain.operations/permit/parsePermitWorkDescription';
import { getCodeSectionsForJurisdiction } from './getCodeSectionsForJurisdiction';

/**
 * .what = convert code sections to citations based on work description
 * .why = analyze code sections to determine relevance to work
 */
const asCodeCitations = (input: {
  codeSections: PermitCodeSection[];
  workType: string | null;
  scope: string;
}): PermitCodeCitation[] => {
  const citations: PermitCodeCitation[] = [];

  for (const section of input.codeSections) {
    // baseline requirement sections
    if (
      section.codeRef.includes('R105.1') ||
      section.title === 'Permit required'
    ) {
      citations.push(
        new PermitCodeCitation({
          codeRef: section.codeRef,
          quote: section.text,
          relevance: 'requires-permit',
          explanation: `Baseline permit requirement for ${input.workType || 'general'} work`,
        }),
      );
      continue;
    }

    // exemption sections - check if work appears to be exempt
    if (section.codeRef.includes('R105.2')) {
      // check if scope matches any exemption keywords
      const scopeLower = input.scope.toLowerCase();
      const textLower = section.text.toLowerCase();

      // common exemption indicators
      const exemptIndicators = [
        'cord-and-plug',
        'temporary decorative',
        'minor repair',
        'replacement of lamps',
        'portable',
        'less than 25 volts',
      ];

      const isExempt = exemptIndicators.some((indicator) => {
        const firstWord = indicator.split(' ')[0] ?? indicator;
        return (
          scopeLower.includes(indicator) ||
          (textLower.includes(indicator) && scopeLower.includes(firstWord))
        );
      });

      if (isExempt) {
        citations.push(
          new PermitCodeCitation({
            codeRef: section.codeRef,
            quote: section.text,
            relevance: 'exempt',
            explanation: `Work appears to match exemption criteria`,
          }),
        );
      } else {
        // add as informational - work not exempt
        citations.push(
          new PermitCodeCitation({
            codeRef: section.codeRef,
            quote: section.text,
            relevance: 'requires-permit',
            explanation: `Work does not appear on exemption list`,
          }),
        );
      }
    }
  }

  return citations;
};

/**
 * .what = CLI entry point for permit requirement check
 * .why = enables skill to invoke typescript determination logic
 */
const main = async (): Promise<void> => {
  const { values } = parseArgs({
    options: {
      work: { type: 'string' },
      postal: { type: 'string' },
      jurisdiction: { type: 'string' },
    },
    strict: true,
  });

  const work = values.work;
  const postal = values.postal;
  const jurisdiction = values.jurisdiction as 'indianapolis-marion-in';

  if (!work || !postal || !jurisdiction) {
    console.error('error: required args absent');
    process.exit(2);
  }

  // parse work description
  const workDescription = parsePermitWorkDescription({
    description: work,
    postalCode: postal,
  });

  // get code sections for jurisdiction
  const codeSections = getCodeSectionsForJurisdiction({
    jurisdictionSlug: jurisdiction,
    workType: workDescription.workType,
  });

  // convert code sections to citations
  const citations = asCodeCitations({
    codeSections,
    workType: workDescription.workType,
    scope: workDescription.scope,
  });

  // compute determination
  const determination = computePermitDetermination({
    work: workDescription,
    jurisdictionSlug: jurisdiction,
    citations,
  });

  // output as JSON
  console.log(
    JSON.stringify({
      workType: workDescription.workType,
      jurisdiction,
      result: determination.result,
      confidence: determination.confidence,
      summary: determination.summary,
      citations: determination.citations.map((c) => ({
        codeRef: c.codeRef,
        relevance: c.relevance,
        quote: c.quote,
      })),
    }),
  );
};

main().catch((error) => {
  console.error('error:', error.message);
  process.exit(1);
});
