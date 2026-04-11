import { PermitCodeSection } from '../../../../domain.objects/permit/PermitCodeSection';

/**
 * .what = get code sections for a jurisdiction and work type
 * .why = provides the applicable code sections for permit determination
 *
 * .note = this is a static lookup for now; will be expanded to dynamic lookup
 */
export const getCodeSectionsForJurisdiction = (input: {
  jurisdictionSlug: 'indianapolis-marion-in';
  workType: string | null;
}): PermitCodeSection[] => {
  // for indianapolis-marion-in, return the applicable code sections
  if (input.jurisdictionSlug === 'indianapolis-marion-in') {
    return getIndianapolisCodeSections({ workType: input.workType });
  }

  return [];
};

/**
 * .what = get indianapolis-specific code sections
 * .why = provides IRC/Indiana Residential Code sections for Indianapolis
 */
const getIndianapolisCodeSections = (input: {
  workType: string | null;
}): PermitCodeSection[] => {
  const sections: PermitCodeSection[] = [];

  // baseline requirement (IRC R105.1)
  sections.push(
    new PermitCodeSection({
      codeRef: 'IRC R105.1',
      jurisdictionSlug: 'indianapolis-marion-in',
      title: 'Required',
      text: 'Any owner or authorized agent who intends to construct, enlarge, alter, repair, move, demolish, or change the occupancy of a building or structure, or to erect, install, enlarge, alter, repair, remove, convert or replace any electrical, gas, mechanical or plumbing system, or to cause any such work to be done, shall first make application to the building official and obtain the required permit.',
      codeVersion: 'Indiana Residential Code 2020 (based on IRC 2018)',
      sourceUrl: 'https://up.codes/s/work-exempt-from-permit',
    }),
  );

  // electrical exemptions (IRC R105.2 item 10)
  if (input.workType === 'electrical' || input.workType === null) {
    sections.push(
      new PermitCodeSection({
        codeRef: 'IRC R105.2 Item 10',
        jurisdictionSlug: 'indianapolis-marion-in',
        title: 'Work exempt from permit - Electrical',
        text: `Electrical:
1. Listed cord-and-plug connected temporary decorative lighting.
2. Reinstallation of attachment plug receptacles but not the outlets therefor.
3. Replacement of branch circuit overcurrent devices of the required capacity in the same location.
4. Electrical wiring, devices, appliances, apparatus or equipment operating at less than 25 volts and not capable of supplying more than 50 watts of energy.
5. Minor repair work, including the replacement of lamps or the connection of approved portable electrical equipment to approved permanently installed receptacles.`,
        codeVersion: 'Indiana Residential Code 2020 (based on IRC 2018)',
        sourceUrl: 'https://up.codes/s/work-exempt-from-permit',
      }),
    );
  }

  // plumbing exemptions (IRC R105.2 item 11)
  if (input.workType === 'plumbing' || input.workType === null) {
    sections.push(
      new PermitCodeSection({
        codeRef: 'IRC R105.2 Item 11',
        jurisdictionSlug: 'indianapolis-marion-in',
        title: 'Work exempt from permit - Plumbing',
        text: `Plumbing:
1. The stopping of leaks in drains, water, soil, waste or vent pipe, provided, however, that if any concealed trap, drain pipe, water, soil, waste or vent pipe becomes defective and it becomes necessary to remove and replace the same with new material, such work shall be considered as new work and a permit shall be obtained and inspection made as provided in this code.
2. The clearing of stoppages or the repairing of leaks in pipes, valves or fixtures and the removal and reinstallation of water closets, provided such repairs do not involve or require the replacement or rearrangement of valves, pipes or fixtures.`,
        codeVersion: 'Indiana Residential Code 2020 (based on IRC 2018)',
        sourceUrl: 'https://up.codes/s/work-exempt-from-permit',
      }),
    );
  }

  // mechanical/hvac exemptions (IRC R105.2 item 12)
  if (
    input.workType === 'hvac' ||
    input.workType === 'mechanical' ||
    input.workType === null
  ) {
    sections.push(
      new PermitCodeSection({
        codeRef: 'IRC R105.2 Item 12',
        jurisdictionSlug: 'indianapolis-marion-in',
        title: 'Work exempt from permit - Mechanical',
        text: `Mechanical:
1. Portable heating appliances.
2. Portable ventilation appliances.
3. Portable cooling units.
4. Steam, hot or chilled water piping within any heating or cooling equipment regulated by this code.
5. Replacement of any component part or assembly of an appliance that does not alter its approval or make it unsafe.
6. Portable fuel cell appliances that are not connected to a fixed piping system and are not interconnected to a power grid.`,
        codeVersion: 'Indiana Residential Code 2020 (based on IRC 2018)',
        sourceUrl: 'https://up.codes/s/work-exempt-from-permit',
      }),
    );
  }

  // local enforcement (Marion County Code Chapter 536)
  sections.push(
    new PermitCodeSection({
      codeRef: 'Marion County Code 536-201',
      jurisdictionSlug: 'indianapolis-marion-in',
      title: 'Permit required',
      text: 'No person shall commence or proceed with the construction, alteration, repair, removal, demolition, equipment, use and occupancy, or change of occupancy of any building or structure, or install, alter or repair electrical, mechanical or plumbing systems without first obtaining from the Department of Business and Neighborhood Services the required building, electrical, mechanical, and plumbing permits.',
      codeVersion: 'Revised Code of the Consolidated City and County',
      sourceUrl: 'https://library.municode.com/in/indianapolis_-_marion_county',
    }),
  );

  return sections;
};
