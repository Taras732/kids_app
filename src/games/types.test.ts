import { describe, expect, it } from 'vitest';
import { GRADE_BANDS, gradeBandFor } from './types';

describe('GRADE_BANDS (D5 узгоджена шкала L0-L4)', () => {
  it('містить рівно 5 рівнів у порядку зростання складності', () => {
    expect(GRADE_BANDS).toEqual(['L0', 'L1', 'L2', 'L3', 'L4']);
  });
});

describe('gradeBandFor', () => {
  it('профіль L0 (дошкільнята): Easy/Medium/Hard → L0/L1/L2', () => {
    expect(gradeBandFor('L0', 1)).toBe('L0');
    expect(gradeBandFor('L0', 2)).toBe('L1');
    expect(gradeBandFor('L0', 3)).toBe('L2');
  });

  it('профіль L3 (школярі): Easy/Medium/Hard → L2/L3/L4', () => {
    expect(gradeBandFor('L3', 1)).toBe('L2');
    expect(gradeBandFor('L3', 2)).toBe('L3');
    expect(gradeBandFor('L3', 3)).toBe('L4');
  });

  it('стик L2: найскладніший L0-профіль і найлегший L3-профіль дають той самий band', () => {
    expect(gradeBandFor('L0', 3)).toBe(gradeBandFor('L3', 1));
  });
});
