import { describe, expect, it } from 'vitest';
import {
  describeOfflineTask,
  offlineTasksToPlanItems,
  offlineTaskToPlanItem,
  pickOfflineTasks,
  readActivityPayload,
  readWorkbookPayload,
  readWorksheetPayload,
  selectOfflineTasksForBand,
} from './offline-core';
import type { OfflineTask } from './types';

function makeTask(overrides: Partial<OfflineTask>): OfflineTask {
  return {
    id: 'task-1',
    type: 'activity',
    title: 'Тестове завдання',
    payload: {},
    grade_band: 'L1',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('selectOfflineTasksForBand', () => {
  const tasks: OfflineTask[] = [
    makeTask({ id: 'l1-b', type: 'activity', title: 'Б завдання', grade_band: 'L1' }),
    makeTask({ id: 'l1-a', type: 'workbook', title: 'А завдання', grade_band: 'L1' }),
    makeTask({ id: 'l2-only', type: 'activity', title: 'Інший рівень', grade_band: 'L2' }),
    makeTask({ id: 'universal', type: 'worksheet', title: 'Універсальне', grade_band: null }),
  ];

  it('фільтрує точний збіг рівня + універсальні (grade_band=null), відкидає інші рівні', () => {
    const result = selectOfflineTasksForBand(tasks, 'L1');
    const ids = result.map((t) => t.id).sort();
    expect(ids).toEqual(['l1-a', 'l1-b', 'universal'].sort());
    expect(ids).not.toContain('l2-only');
  });

  it('сортує детерміновано: тип (workbook→worksheet→activity), потім назва', () => {
    const result = selectOfflineTasksForBand(tasks, 'L1');
    expect(result.map((t) => t.id)).toEqual(['l1-a', 'universal', 'l1-b']);
  });

  it('порожній вхід → порожній вихід', () => {
    expect(selectOfflineTasksForBand([], 'L1')).toEqual([]);
  });

  it('немає завдань під рівень → порожній вихід', () => {
    const onlyL3 = [makeTask({ id: 'x', grade_band: 'L3' })];
    expect(selectOfflineTasksForBand(onlyL3, 'L1')).toEqual([]);
  });
});

describe('pickOfflineTasks', () => {
  it('обрізає до count після фільтра/сорту', () => {
    const tasks = [
      makeTask({ id: 'a', title: 'A', grade_band: 'L1' }),
      makeTask({ id: 'b', title: 'B', grade_band: 'L1' }),
      makeTask({ id: 'c', title: 'C', grade_band: 'L1' }),
    ];
    expect(pickOfflineTasks(tasks, 'L1', 2).map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('count=0 або порожній масив → []', () => {
    const tasks = [makeTask({ id: 'a' })];
    expect(pickOfflineTasks(tasks, 'L1', 0)).toEqual([]);
    expect(pickOfflineTasks([], 'L1', 5)).toEqual([]);
  });
});

describe('readActivityPayload', () => {
  it('читає повністю заповнений payload (форма activities.ts)', () => {
    const view = readActivityPayload({
      category: 'origami',
      icon: '✈️',
      summary: 'Найпростіший літачок',
      estimatedMinutes: 5,
      adultHelp: 'none',
      materials: ['Аркуш паперу А4'],
      steps: ['Крок 1', 'Крок 2'],
      tip: 'Порада',
      safetyNote: 'Обережно',
    });
    expect(view).toEqual({
      icon: '✈️',
      summary: 'Найпростіший літачок',
      instruction: null,
      materials: ['Аркуш паперу А4'],
      steps: ['Крок 1', 'Крок 2'],
      estimatedMinutes: 5,
      adultHelp: 'none',
      tip: 'Порада',
      safetyNote: 'Обережно',
      printUrl: null,
    });
  });

  it('порожній/зіпсований payload → безпечні дефолти, іконка-фолбек', () => {
    const view = readActivityPayload({});
    expect(view.icon).toBe('🧩');
    expect(view.summary).toBe('');
    expect(view.materials).toEqual([]);
    expect(view.steps).toEqual([]);
    expect(view.estimatedMinutes).toBeNull();
    expect(view.adultHelp).toBeNull();
  });

  it('ігнорує поля з неправильним типом замість падіння', () => {
    const view = readActivityPayload({
      icon: 42,
      materials: 'не масив',
      steps: [1, 2, 'валідний крок'],
      estimatedMinutes: 'п’ять',
      adultHelp: 'колись-не-валідне-значення',
    } as unknown as Record<string, unknown>);
    expect(view.icon).toBe('🧩');
    expect(view.materials).toEqual([]);
    expect(view.steps).toEqual(['валідний крок']);
    expect(view.estimatedMinutes).toBeNull();
    expect(view.adultHelp).toBeNull();
  });
});

describe('readWorkbookPayload', () => {
  it('явна instruction має пріоритет над підказкою по сторінках', () => {
    const view = readWorkbookPayload({ instruction: 'Зроби вправи 1-3', pageFrom: 10, pageTo: 12 });
    expect(view.instruction).toBe('Зроби вправи 1-3');
  });

  it('без instruction — генерує підказку з pageFrom/pageTo', () => {
    expect(readWorkbookPayload({ pageFrom: 5, pageTo: 7 }).instruction).toBe('Сторінки 5–7');
    expect(readWorkbookPayload({ pageFrom: 5 }).instruction).toBe('Сторінка 5');
    expect(readWorkbookPayload({}).instruction).toBeNull();
  });

  it('дефолтна іконка workbook', () => {
    expect(readWorkbookPayload({}).icon).toBe('📘');
  });
});

describe('readWorksheetPayload', () => {
  it('читає instruction і printUrl', () => {
    const view = readWorksheetPayload({ instruction: 'Обведи літери', printUrl: 'https://example.com/a.pdf' });
    expect(view.instruction).toBe('Обведи літери');
    expect(view.printUrl).toBe('https://example.com/a.pdf');
  });

  it('без printUrl → null, дефолтна іконка worksheet', () => {
    const view = readWorksheetPayload({});
    expect(view.printUrl).toBeNull();
    expect(view.icon).toBe('📄');
  });
});

describe('describeOfflineTask', () => {
  it('диспетчеризує читач за task.type', () => {
    expect(describeOfflineTask(makeTask({ type: 'activity', payload: { icon: '🎨' } })).icon).toBe('🎨');
    expect(describeOfflineTask(makeTask({ type: 'workbook', payload: {} })).icon).toBe('📘');
    expect(describeOfflineTask(makeTask({ type: 'worksheet', payload: {} })).icon).toBe('📄');
  });
});

describe('offlineTaskToPlanItem / offlineTasksToPlanItems', () => {
  it('мапить OfflineTask → DailyPlanItemInsert (kind=type, ref_id=id, pending)', () => {
    const item = offlineTaskToPlanItem(makeTask({ id: 'origami-plane', type: 'activity' }), 3);
    expect(item).toEqual({
      kind: 'activity',
      ref_id: 'origami-plane',
      skill_id: null,
      status: 'pending',
      result: null,
      sort: 3,
    });
  });

  it('пакетний мапінг зі зростаючим sort від startSort', () => {
    const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' }), makeTask({ id: 'c' })];
    const items = offlineTasksToPlanItems(tasks, 10);
    expect(items.map((i) => i.sort)).toEqual([10, 11, 12]);
    expect(items.map((i) => i.ref_id)).toEqual(['a', 'b', 'c']);
  });

  it('порожній масив → порожній вихід', () => {
    expect(offlineTasksToPlanItems([])).toEqual([]);
  });
});
