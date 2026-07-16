// Q17 — чиста логіка вводу відповіді стовпчиком.
//
// 🎯 Методика: стовпчиком рахують З ОДИНИЦЬ (справа наліво), а не «як пишемо».
// Раніше цифри дописувались у кінець рядка (prev + d), тож ПЕРША введена цифра
// ставала старшим розрядом і «з'їжджала» вліво з кожним наступним натиском —
// гра вчила неправильного алгоритму (QA Тараса: «вписується ніби по порядку,
// а має проставляти з кінця»).
//
// Тепер перша введена цифра — це ОДИНИЦІ, і вона лишається на місці; кожна
// наступна стає розрядом ліворуч. Без React/IO — юніт-тестується напряму.

/**
 * Додати цифру як наступний розряд СПРАВА НАЛІВО (одиниці → десятки → сотні).
 * Понад digitCount не приймає (більше розрядів, ніж є у відповіді, не буває).
 */
export function addDigit(entered: string, digit: string, digitCount: number): string {
  if (entered.length >= digitCount) return entered;
  return digit + entered;
}

/** Стерти ОСТАННЮ введену цифру — тобто найстарший розряд (найлівіший). */
export function removeDigit(entered: string): string {
  return entered.slice(1);
}

/**
 * Індекс клітинки (0-based зліва), куди піде НАСТУПНА цифра. Ввід іде справа
 * наліво, тож активна клітинка зсувається вліво в міру заповнення.
 * Коли всі розряди введені — null (активної клітинки нема).
 */
export function activeCellIndex(entered: string, digitCount: number): number | null {
  if (entered.length >= digitCount) return null;
  return digitCount - entered.length - 1;
}

/**
 * Клітинки рядка вводу зліва направо: '' для незаповнених розрядів, цифра для
 * заповнених. Введене вирівняне праворуч (одиниці — крайня права клітинка).
 */
export function inputCells(entered: string, digitCount: number): string[] {
  const padded = entered.padStart(digitCount, ' ');
  return padded.split('').map((ch) => (ch === ' ' ? '' : ch));
}

/** Введене як число. Порожньо → null (нема що надсилати). */
export function enteredValue(entered: string): number | null {
  return entered === '' ? null : Number(entered);
}
