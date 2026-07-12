export type MeasureCategory = 'length' | 'mass' | 'volume' | 'temp';

export interface UnitInfo {
  key: string;
  label: string;
  category: MeasureCategory;
  /** множник до базової одиниці категорії (length=мм, mass=г, volume=мл) */
  inBase: number;
}

export const UNITS: UnitInfo[] = [
  { key: 'mm', label: 'мм', category: 'length', inBase: 1 },
  { key: 'cm', label: 'см', category: 'length', inBase: 10 },
  { key: 'dm', label: 'дм', category: 'length', inBase: 100 },
  { key: 'm', label: 'м', category: 'length', inBase: 1000 },
  { key: 'km', label: 'км', category: 'length', inBase: 1_000_000 },

  { key: 'g', label: 'г', category: 'mass', inBase: 1 },
  { key: 'kg', label: 'кг', category: 'mass', inBase: 1000 },
  { key: 't', label: 'т', category: 'mass', inBase: 1_000_000 },

  { key: 'ml', label: 'мл', category: 'volume', inBase: 1 },
  { key: 'l', label: 'л', category: 'volume', inBase: 1000 },

  { key: 'c', label: '°C', category: 'temp', inBase: 1 },
];

export function unitByKey(key: string): UnitInfo {
  const u = UNITS.find((x) => x.key === key);
  if (!u) throw new Error(`Unknown unit: ${key}`);
  return u;
}

export interface ObjectFact {
  emoji: string;
  name: string;
  category: MeasureCategory;
  value: number;
  unitKey: string;
}

/** Значення обʼєкта в базових одиницях категорії (для порівняння). */
export function baseValue(o: ObjectFact): number {
  return o.value * unitByKey(o.unitKey).inBase;
}

export const OBJECTS: ObjectFact[] = [
  // довжина
  { emoji: '🐜', name: 'Мурашка', category: 'length', value: 5, unitKey: 'mm' },
  { emoji: '✏️', name: 'Олівець', category: 'length', value: 15, unitKey: 'cm' },
  { emoji: '📏', name: 'Лінійка', category: 'length', value: 30, unitKey: 'cm' },
  { emoji: '📖', name: 'Книга', category: 'length', value: 25, unitKey: 'cm' },
  { emoji: '👟', name: 'Кросівка', category: 'length', value: 25, unitKey: 'cm' },
  { emoji: '🪑', name: 'Стілець', category: 'length', value: 1, unitKey: 'm' },
  { emoji: '🚪', name: 'Двері', category: 'length', value: 2, unitKey: 'm' },
  { emoji: '🧍', name: 'Людина', category: 'length', value: 170, unitKey: 'cm' },
  { emoji: '🚗', name: 'Машина', category: 'length', value: 4, unitKey: 'm' },
  { emoji: '🏠', name: 'Будинок', category: 'length', value: 10, unitKey: 'm' },
  { emoji: '🛣️', name: 'Дорога додому', category: 'length', value: 5, unitKey: 'km' },
  { emoji: '✈️', name: 'Політ літака', category: 'length', value: 1000, unitKey: 'km' },

  // маса
  { emoji: '🍇', name: 'Виноградина', category: 'mass', value: 5, unitKey: 'g' },
  { emoji: '🍎', name: 'Яблуко', category: 'mass', value: 150, unitKey: 'g' },
  { emoji: '🍞', name: 'Буханка хліба', category: 'mass', value: 500, unitKey: 'g' },
  { emoji: '🐱', name: 'Кіт', category: 'mass', value: 4, unitKey: 'kg' },
  { emoji: '🐕', name: 'Собака', category: 'mass', value: 15, unitKey: 'kg' },
  { emoji: '🥔', name: 'Мішок картоплі', category: 'mass', value: 3, unitKey: 'kg' },
  { emoji: '🧍', name: 'Дитина', category: 'mass', value: 30, unitKey: 'kg' },
  { emoji: '🐘', name: 'Слон', category: 'mass', value: 5, unitKey: 't' },
  { emoji: '🚚', name: 'Вантажівка', category: 'mass', value: 10, unitKey: 't' },

  // об'єм
  { emoji: '💧', name: 'Крапля', category: 'volume', value: 1, unitKey: 'ml' },
  { emoji: '🥄', name: 'Чайна ложка', category: 'volume', value: 5, unitKey: 'ml' },
  { emoji: '🥤', name: 'Склянка соку', category: 'volume', value: 250, unitKey: 'ml' },
  { emoji: '🥛', name: 'Пачка молока', category: 'volume', value: 1, unitKey: 'l' },
  { emoji: '🫖', name: 'Чайник', category: 'volume', value: 2, unitKey: 'l' },
  { emoji: '🪣', name: 'Відро', category: 'volume', value: 10, unitKey: 'l' },
  { emoji: '🛁', name: 'Ванна', category: 'volume', value: 100, unitKey: 'l' },

  // температура (без від'ємних значень — HardOnly)
  { emoji: '🧊', name: 'Лід', category: 'temp', value: 0, unitKey: 'c' },
  { emoji: '🌤️', name: 'Весняний день', category: 'temp', value: 15, unitKey: 'c' },
  { emoji: '🏠', name: 'Кімната', category: 'temp', value: 21, unitKey: 'c' },
  { emoji: '🧍', name: 'Тіло людини', category: 'temp', value: 37, unitKey: 'c' },
  { emoji: '☀️', name: 'Літній день', category: 'temp', value: 28, unitKey: 'c' },
  { emoji: '🍵', name: 'Гарячий чай', category: 'temp', value: 70, unitKey: 'c' },
  { emoji: '💨', name: 'Кипіток', category: 'temp', value: 100, unitKey: 'c' },
];
