import { PermitWorkDescription } from '../../domain.objects/permit/PermitWorkDescription';

/**
 * .what = known work types that map to permit categories
 */
const WORK_TYPE_KEYWORDS: Record<string, string> = {
  electrical: 'electrical',
  electric: 'electrical',
  panel: 'electrical',
  outlet: 'electrical',
  wiring: 'electrical',
  circuit: 'electrical',
  breaker: 'electrical',
  plumbing: 'plumbing',
  pipe: 'plumbing',
  drain: 'plumbing',
  water: 'plumbing',
  sewer: 'plumbing',
  hvac: 'hvac',
  furnace: 'hvac',
  ac: 'hvac',
  ductwork: 'hvac',
  roof: 'roofing',
  roofing: 'roofing',
  shingle: 'roofing',
};

/**
 * .what = parse a work description into structured permit work description
 * .why = extracts work type and scope from natural language
 */
export const parsePermitWorkDescription = (input: {
  description: string;
  postalCode: string;
  address?: string;
  propertyType?: 'residential' | 'commercial';
}): PermitWorkDescription => {
  const descriptionLower = input.description.toLowerCase();

  // detect work type
  let workType = 'general';
  for (const [keyword, type] of Object.entries(WORK_TYPE_KEYWORDS)) {
    if (descriptionLower.includes(keyword)) {
      workType = type;
      break;
    }
  }

  return new PermitWorkDescription({
    workType,
    scope: input.description,
    propertyType: input.propertyType ?? 'residential',
    address: input.address ?? null,
    postalCode: input.postalCode,
  });
};
