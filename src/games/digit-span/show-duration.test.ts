import { describe, it, expect } from 'vitest';
import { showDurationMs } from './index';

describe('digit-span — час показу ряду (Q22)', () => {
  it('короткий ряд отримує мінімальний час, не менше', () => {
    expect(showDurationMs(1)).toBe(1500);
    expect(showDurationMs(2)).toBe(1500);
  });

  it('довший ряд показується довше (700мс на цифру)', () => {
    expect(showDurationMs(3)).toBe(2100);
    expect(showDurationMs(7)).toBe(4900);
  });

  it('монотонно не спадає зі зростанням довжини', () => {
    for (let n = 1; n < 10; n++) {
      expect(showDurationMs(n + 1)).toBeGreaterThanOrEqual(showDurationMs(n));
    }
  });
});
