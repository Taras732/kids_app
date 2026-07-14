import { describe, it, expect } from 'vitest';
import {
  CLASS_LEVELS,
  CLASS_META,
  classToProfileLevel,
  classBand,
  type ClassLevel,
  type Difficulty,
} from './types';

describe('ClassLevel вісь (G1)', () => {
  it('5 рівнів у правильному порядку', () => {
    expect(CLASS_LEVELS).toEqual(['preschool', 'grade1', 'grade2', 'grade3', 'grade4']);
  });

  it('classToProfileLevel: дошкілля → L0-трек, 1–4 клас → L3-трек', () => {
    expect(classToProfileLevel('preschool')).toBe('L0');
    expect(classToProfileLevel('grade1')).toBe('L3');
    expect(classToProfileLevel('grade2')).toBe('L3');
    expect(classToProfileLevel('grade3')).toBe('L3');
    expect(classToProfileLevel('grade4')).toBe('L3');
  });

  it('CLASS_META: цикли НУШ (дошкілля=0, 1–2 кл=I, 3–4 кл=II)', () => {
    expect(CLASS_META.preschool.cycle).toBe(0);
    expect(CLASS_META.grade1.cycle).toBe(1);
    expect(CLASS_META.grade2.cycle).toBe(1);
    expect(CLASS_META.grade3.cycle).toBe(2);
    expect(CLASS_META.grade4.cycle).toBe(2);
  });

  it('CLASS_META: uiScale монотонно спадає (старшим — щільніше)', () => {
    const scales = CLASS_LEVELS.map((c) => CLASS_META[c].uiScale);
    for (let i = 1; i < scales.length; i++) {
      expect(scales[i]).toBeLessThan(scales[i - 1]);
    }
  });

  it('classBand: клас задає базовий рівень, difficulty зсуває вгору з clamp на L4', () => {
    // дошкілля: L0 → L1 → L2
    expect(classBand('preschool', 1)).toBe('L0');
    expect(classBand('preschool', 2)).toBe('L1');
    expect(classBand('preschool', 3)).toBe('L2');
    // 2 клас: L2 → L3 → L4
    expect(classBand('grade2', 1)).toBe('L2');
    expect(classBand('grade2', 3)).toBe('L4');
    // 4 клас: базовий L4, зсув clamp-иться на L4
    expect(classBand('grade4', 1)).toBe('L4');
    expect(classBand('grade4', 3)).toBe('L4');
  });

  it('classBand: кожен (клас, difficulty) дає валідний GradeBand', () => {
    for (const cl of CLASS_LEVELS as ClassLevel[]) {
      for (const d of [1, 2, 3] as Difficulty[]) {
        expect(['L0', 'L1', 'L2', 'L3', 'L4']).toContain(classBand(cl, d));
      }
    }
  });
});
