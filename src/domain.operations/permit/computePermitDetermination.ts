import type { PermitCodeCitation } from '../../domain.objects/permit/PermitCodeCitation';
import { PermitDetermination } from '../../domain.objects/permit/PermitDetermination';
import type { PermitWorkDescription } from '../../domain.objects/permit/PermitWorkDescription';

/**
 * .what = standard disclaimer for all permit determinations
 */
const STANDARD_DISCLAIMER =
  'This is not legal advice. Consult a licensed attorney or your local ' +
  'permit office for guidance specific to your situation. This research ' +
  'helps identify questions to ask — it does not replace professional counsel.';

/**
 * .what = work types that typically require permits per IRC/IBC
 */
const PERMIT_REQUIRED_WORK_TYPES = new Set([
  'electrical',
  'plumbing',
  'hvac',
  'structural',
]);

/**
 * .what = compute a permit determination from work description and citations
 * .why = core logic for permit requirement analysis
 */
export const computePermitDetermination = (input: {
  work: PermitWorkDescription;
  jurisdictionSlug: string;
  citations: PermitCodeCitation[];
}): PermitDetermination => {
  // check if any citation explicitly requires or exempts
  const requiresCitation = input.citations.find(
    (c) => c.relevance === 'requires-permit',
  );
  const exemptCitation = input.citations.find((c) => c.relevance === 'exempt');
  const conditionalCitation = input.citations.find(
    (c) => c.relevance === 'conditional',
  );

  // determine result based on citations
  let result: PermitDetermination['result'];
  let confidence: PermitDetermination['confidence'];
  let summary: string;
  let conditions: string[] | null = null;

  if (requiresCitation && !exemptCitation) {
    result = 'required';
    confidence = 'high';
    summary = `A permit is required for ${input.work.workType} work: "${input.work.scope}"`;
  } else if (exemptCitation && !requiresCitation) {
    result = 'not-required';
    confidence = 'high';
    summary = `No permit required for ${input.work.workType} work: "${input.work.scope}"`;
  } else if (conditionalCitation) {
    result = 'conditional';
    confidence = 'medium';
    summary = `Permit may be required for ${input.work.workType} work depending on conditions`;
    conditions = [conditionalCitation.explanation];
  } else if (PERMIT_REQUIRED_WORK_TYPES.has(input.work.workType)) {
    // fallback: assume permit required for known trade work
    result = 'required';
    confidence = 'low';
    summary = `${input.work.workType} work typically requires a permit. Verify with local permit office.`;
  } else {
    result = 'unclear';
    confidence = 'low';
    summary = `Unable to determine permit requirements for: "${input.work.scope}"`;
  }

  // generate recommendations
  const recommendations: string[] = [];
  if (result === 'required' || result === 'conditional') {
    recommendations.push('Contact local permit office to confirm requirements');
    recommendations.push('Obtain permit before work begins');
  } else if (result === 'unclear') {
    recommendations.push('Contact local permit office for clarification');
    recommendations.push('Review local code amendments');
  }
  recommendations.push('Verify with licensed contractor if applicable');

  return new PermitDetermination({
    work: input.work,
    jurisdictionSlug: input.jurisdictionSlug,
    result,
    confidence,
    summary,
    citations: input.citations,
    conditions,
    recommendations,
    disclaimer: STANDARD_DISCLAIMER,
  });
};
