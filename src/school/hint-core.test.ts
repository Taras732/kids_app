import { describe, expect, it } from 'vitest';
import { buildPrereqHintMessage, findUncoveredPrerequisite, isWeakResult } from './hint-core';
import type { MasteryStatus, Skill, SkillPrerequisite } from './types';

// ---------- Хелпери фікстур (мінімальні поля, які потребує ядро) ----------

function skill(id: string, sort: number, title = id): Pick<Skill, 'id' | 'title' | 'sort'> {
  return { id, title, sort };
}

function edge(skillId: string, prereqId: string): SkillPrerequisite {
  return { skill_id: skillId, prerequisite_id: prereqId };
}

function statuses(entries: Array<[string, MasteryStatus]>): Map<string, MasteryStatus> {
  return new Map(entries);
}

describe('findUncoveredPrerequisite', () => {
  it('гра без skillIds → null', () => {
    const skills = [skill('a', 10)];
    const prereqs = [edge('a', 'b')];
    expect(findUncoveredPrerequisite([], skills, prereqs, statuses([]))).toBeNull();
  });

  it('одна пряма передумова, непокрита → повертає її', () => {
    const skills = [skill('addition', 20), skill('counting', 10, 'Лічба')];
    const prereqs = [edge('addition', 'counting')];
    const result = findUncoveredPrerequisite(['addition'], skills, prereqs, statuses([['counting', 'frontier']]));
    expect(result).toEqual({ skillId: 'counting', title: 'Лічба' });
  });

  it('передумова вже опанована (mastered) → null', () => {
    const skills = [skill('addition', 20), skill('counting', 10)];
    const prereqs = [edge('addition', 'counting')];
    const result = findUncoveredPrerequisite(['addition'], skills, prereqs, statuses([['counting', 'mastered']]));
    expect(result).toBeNull();
  });

  it('немає рядка mastery для передумови → трактується як непокрита (locked за замовчуванням)', () => {
    const skills = [skill('addition', 20), skill('counting', 10, 'Лічба')];
    const prereqs = [edge('addition', 'counting')];
    const result = findUncoveredPrerequisite(['addition'], skills, prereqs, statuses([]));
    expect(result).toEqual({ skillId: 'counting', title: 'Лічба' });
  });

  it('коренева навичка без prerequisites → null (дитина просто помилилась)', () => {
    const skills = [skill('addition', 20)];
    const result = findUncoveredPrerequisite(['addition'], skills, [], statuses([]));
    expect(result).toBeNull();
  });

  it('кілька непокритих кандидатів → обирає найменший sort (найфундаментальніша)', () => {
    const skills = [
      skill('addition', 30),
      skill('counting', 10, 'Лічба'),
      skill('digits', 20, 'Цифри'),
    ];
    const prereqs = [edge('addition', 'digits'), edge('addition', 'counting')];
    const result = findUncoveredPrerequisite(
      ['addition'],
      skills,
      prereqs,
      statuses([
        ['digits', 'frontier'],
        ['counting', 'locked'],
      ]),
    );
    expect(result).toEqual({ skillId: 'counting', title: 'Лічба' });
  });

  it('однаковий sort → тай-брейк за id (детермінізм)', () => {
    const skills = [skill('addition', 30), skill('z-skill', 10), skill('a-skill', 10)];
    const prereqs = [edge('addition', 'z-skill'), edge('addition', 'a-skill')];
    const result = findUncoveredPrerequisite(
      ['addition'],
      skills,
      prereqs,
      statuses([
        ['z-skill', 'locked'],
        ['a-skill', 'locked'],
      ]),
    );
    expect(result?.skillId).toBe('a-skill');
  });

  it('дедублікує спільну передумову кількох зіграних навичок', () => {
    const skills = [
      skill('addition', 30),
      skill('subtraction', 31),
      skill('counting', 10, 'Лічба'),
    ];
    const prereqs = [edge('addition', 'counting'), edge('subtraction', 'counting')];
    const result = findUncoveredPrerequisite(
      ['addition', 'subtraction'],
      skills,
      prereqs,
      statuses([['counting', 'frontier']]),
    );
    expect(result).toEqual({ skillId: 'counting', title: 'Лічба' });
  });

  it('усі прямі передумови опановані → null, навіть якщо є глибші (транзитивні) прогалини', () => {
    // addition ← counting ← one-to-one; counting mastered, one-to-one — ні.
    // findUncoveredPrerequisite не йде транзитивно, тож не має "бачити" one-to-one.
    const skills = [skill('addition', 30), skill('counting', 20), skill('one-to-one', 10)];
    const prereqs = [edge('addition', 'counting'), edge('counting', 'one-to-one')];
    const result = findUncoveredPrerequisite(
      ['addition'],
      skills,
      prereqs,
      statuses([
        ['counting', 'mastered'],
        ['one-to-one', 'locked'],
      ]),
    );
    expect(result).toBeNull();
  });

  it('edge без відповідного запису в skills (неузгоджені дані) → пропускає, не падає', () => {
    const skills = [skill('addition', 30)]; // 'counting' відсутній у skills
    const prereqs = [edge('addition', 'counting')];
    expect(() => findUncoveredPrerequisite(['addition'], skills, prereqs, statuses([]))).not.toThrow();
    expect(findUncoveredPrerequisite(['addition'], skills, prereqs, statuses([]))).toBeNull();
  });
});

describe('isWeakResult', () => {
  it('1⭐ (найгірший можливий результат) → true', () => {
    expect(isWeakResult(1)).toBe(true);
  });

  it('0⭐ → true (захисно, хоч computeStars так не повертає)', () => {
    expect(isWeakResult(0)).toBe(true);
  });

  it('2⭐ і 3⭐ → false', () => {
    expect(isWeakResult(2)).toBe(false);
    expect(isWeakResult(3)).toBe(false);
  });
});

describe('buildPrereqHintMessage', () => {
  it('формує дружнє формулювання з назвою навички в лапках', () => {
    expect(buildPrereqHintMessage('Додавання до 10')).toBe(
      'Щоб це давалось легше, спершу потренуй: «Додавання до 10»',
    );
  });
});
