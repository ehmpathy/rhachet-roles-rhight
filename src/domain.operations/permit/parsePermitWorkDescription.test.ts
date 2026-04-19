import { given, then, when } from 'test-fns';

import { parsePermitWorkDescription } from './parsePermitWorkDescription';

describe('parsePermitWorkDescription', () => {
  given('[case1] electrical work description', () => {
    when('[t0] description contains "panel upgrade"', () => {
      then('work type is electrical', () => {
        const result = parsePermitWorkDescription({
          description: 'Panel upgrade from 100A to 200A',
          postalCode: '46220',
        });
        expect(result.workType).toBe('electrical');
        expect(result.scope).toBe('Panel upgrade from 100A to 200A');
        expect(result.postalCode).toBe('46220');
        expect(result.propertyType).toBe('residential');
      });
    });

    when('[t1] description contains "outlet"', () => {
      then('work type is electrical', () => {
        const result = parsePermitWorkDescription({
          description: 'Install new outlet in garage',
          postalCode: '46220',
        });
        expect(result.workType).toBe('electrical');
      });
    });
  });

  given('[case2] hvac work description', () => {
    when('[t0] description contains "furnace"', () => {
      then('work type is hvac', () => {
        const result = parsePermitWorkDescription({
          description: 'Replace furnace',
          postalCode: '46220',
        });
        expect(result.workType).toBe('hvac');
      });
    });
  });

  given('[case3] generic work description', () => {
    when('[t0] description has no known keywords', () => {
      then('work type is general', () => {
        const result = parsePermitWorkDescription({
          description: 'Paint the walls',
          postalCode: '46220',
        });
        expect(result.workType).toBe('general');
      });
    });
  });

  given('[case4] commercial property', () => {
    when('[t0] property type is specified', () => {
      then('property type is preserved', () => {
        const result = parsePermitWorkDescription({
          description: 'Install new circuits',
          postalCode: '46220',
          propertyType: 'commercial',
        });
        expect(result.propertyType).toBe('commercial');
      });
    });
  });
});
