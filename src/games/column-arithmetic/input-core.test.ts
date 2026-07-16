import { describe, it, expect } from 'vitest';
import { addDigit, removeDigit, activeCellIndex, inputCells, enteredValue } from './input-core';

describe('Q17 — ввід стовпчиком іде З ОДИНИЦЬ (справа наліво)', () => {
  it('перша введена цифра — одиниці й лишається на місці', () => {
    // набираємо 142: спершу одиниці 2, потім десятки 4, потім сотні 1
    let e = '';
    e = addDigit(e, '2', 3);
    expect(e).toBe('2');
    expect(inputCells(e, 3)).toEqual(['', '', '2']); // 2 стоїть в одиницях

    e = addDigit(e, '4', 3);
    expect(e).toBe('42');
    expect(inputCells(e, 3)).toEqual(['', '4', '2']); // 2 НЕ з'їхала вліво

    e = addDigit(e, '1', 3);
    expect(e).toBe('142');
    expect(inputCells(e, 3)).toEqual(['1', '4', '2']);
    expect(enteredValue(e)).toBe(142);
  });

  it('регрес-гвардія: старий (хибний) порядок дав би 241 замість 142', () => {
    // якби цифри дописувались у кінець (prev + d), вийшло б '241'
    let e = '';
    for (const d of ['2', '4', '1']) e = addDigit(e, d, 3);
    expect(e).not.toBe('241');
    expect(e).toBe('142');
  });

  it('не приймає більше цифр, ніж розрядів у відповіді', () => {
    let e = '';
    for (const d of ['1', '2', '3']) e = addDigit(e, d, 2);
    expect(e).toBe('21'); // третю проігноровано
    expect(e.length).toBe(2);
  });

  it('backspace стирає ОСТАННЮ введену — найстарший розряд', () => {
    // ввели 2 (одиниці), 4 (десятки) → '42'; backspace має прибрати 4, лишити 2
    let e = addDigit(addDigit('', '2', 3), '4', 3);
    expect(e).toBe('42');
    e = removeDigit(e);
    expect(e).toBe('2');
    expect(inputCells(e, 3)).toEqual(['', '', '2']);
  });

  it('backspace на порожньому — без падіння', () => {
    expect(removeDigit('')).toBe('');
  });
});

describe('активна клітинка вводу (Q16 — видно, куди вписувати)', () => {
  it('стартує на одиницях і зсувається вліво', () => {
    expect(activeCellIndex('', 3)).toBe(2); // одиниці
    expect(activeCellIndex('2', 3)).toBe(1); // десятки
    expect(activeCellIndex('42', 3)).toBe(0); // сотні
  });

  it('усі розряди заповнені → активної клітинки нема', () => {
    expect(activeCellIndex('142', 3)).toBeNull();
  });
});

describe('enteredValue', () => {
  it('порожньо → null (нема що надсилати)', () => {
    expect(enteredValue('')).toBeNull();
  });

  it('рядок → число', () => {
    expect(enteredValue('507')).toBe(507);
  });
});
