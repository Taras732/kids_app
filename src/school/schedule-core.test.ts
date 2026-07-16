import { describe, it, expect } from 'vitest';
import { scheduleForDay, subjectsPerDay, isSchoolDay, weekdayName } from './schedule-core';
import { CLASS_LEVELS, type ClassLevel } from '@/games/types';

describe('SD2 — розклад по днях', () => {
  it('вихідні (Нд/Сб) — порожній розклад', () => {
    for (const cl of CLASS_LEVELS) {
      expect(scheduleForDay(cl, 0)).toEqual([]); // неділя
      expect(scheduleForDay(cl, 6)).toEqual([]); // субота
    }
  });

  it('навчальні дні Пн–Пт мають предмети', () => {
    for (let d = 1; d <= 5; d++) {
      expect(isSchoolDay(d)).toBe(true);
      expect(scheduleForDay('grade3', d).length).toBeGreaterThan(0);
    }
    expect(isSchoolDay(0)).toBe(false);
    expect(isSchoolDay(6)).toBe(false);
  });

  it('кількість предметів = за класом; ядро (math+language) завжди присутнє', () => {
    const expected: Record<ClassLevel, number> = {
      preschool: 2, grade1: 3, grade2: 3, grade3: 4, grade4: 4,
    };
    for (const cl of CLASS_LEVELS) {
      for (let d = 1; d <= 5; d++) {
        const subs = scheduleForDay(cl, d);
        expect(subs.length, `${cl}/день${d}`).toBe(expected[cl]);
        expect(subs).toContain('math');
        expect(subs).toContain('language');
        expect(new Set(subs).size, `${cl}/день${d}: дублі`).toBe(subs.length);
      }
    }
  });

  it('subjectsPerDay за класом', () => {
    expect(subjectsPerDay('preschool')).toBe(2);
    expect(subjectsPerDay('grade1')).toBe(3);
    expect(subjectsPerDay('grade2')).toBe(3);
    expect(subjectsPerDay('grade3')).toBe(4);
    expect(subjectsPerDay('grade4')).toBe(4);
  });

  it('дні відрізняються вторинними предметами (не однакові щодня)', () => {
    const mon = scheduleForDay('grade4', 1);
    const wed = scheduleForDay('grade4', 3);
    // ядро те саме, але набір загалом різний
    expect(JSON.stringify(mon)).not.toBe(JSON.stringify(wed));
  });

  it('детермінованість: той самий (клас, день) → той самий набір', () => {
    expect(scheduleForDay('grade2', 2)).toEqual(scheduleForDay('grade2', 2));
  });

  it('weekdayName', () => {
    expect(weekdayName(1)).toBe('понеділок');
    expect(weekdayName(0)).toBe('неділя');
    expect(weekdayName(6)).toBe('субота');
  });
});
