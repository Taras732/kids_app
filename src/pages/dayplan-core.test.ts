import { describe, it, expect } from 'vitest';
import {
  countCompleted,
  findAutoCompletableGameItemIds,
  isOfflinePlanItem,
  partitionPlanItems,
  sortPlanItems,
} from './dayplan-core';
import type { DailyPlanItem } from '@/school/types';

function item(over: Partial<DailyPlanItem> = {}): DailyPlanItem {
  return {
    id: 'i1',
    plan_id: 'p1',
    kind: 'game',
    ref_id: 'g1',
    skill_id: null,
    status: 'pending',
    result: null,
    sort: 0,
    ...over,
  };
}

describe('sortPlanItems', () => {
  it('сортує за sort, не мутуючи вхідний масив', () => {
    const input = [item({ id: 'b', sort: 2 }), item({ id: 'a', sort: 0 }), item({ id: 'c', sort: 1 })];
    const sorted = sortPlanItems(input);
    expect(sorted.map((i) => i.id)).toEqual(['a', 'c', 'b']);
    expect(input.map((i) => i.id)).toEqual(['b', 'a', 'c']); // вхід не змінено
  });

  it('порожній список → []', () => {
    expect(sortPlanItems([])).toEqual([]);
  });
});

describe('countCompleted', () => {
  it('рахує done/skipped, ігнорує pending', () => {
    const items = [item({ status: 'pending' }), item({ status: 'done' }), item({ status: 'skipped' })];
    expect(countCompleted(items)).toBe(2);
  });

  it('порожній список → 0', () => {
    expect(countCompleted([])).toBe(0);
  });
});

describe('findAutoCompletableGameItemIds', () => {
  const DATE = '2026-07-14';

  it('позначає game/review pending, якщо прогрес по грі оновлювався сьогодні', () => {
    const items = [
      item({ id: 'i1', kind: 'game', ref_id: 'gA', status: 'pending' }),
      item({ id: 'i2', kind: 'review', ref_id: 'gB', status: 'pending' }),
    ];
    const progress = {
      gA: { updated_at: '2026-07-14T10:00:00.000Z' },
      gB: { updated_at: '2026-07-13T10:00:00.000Z' }, // не сьогодні
    };
    expect(findAutoCompletableGameItemIds(items, progress, DATE)).toEqual(['i1']);
  });

  it('пропускає offline-кроки (workbook/worksheet/activity)', () => {
    const items = [item({ id: 'i1', kind: 'workbook', ref_id: 'gA', status: 'pending' })];
    const progress = { gA: { updated_at: '2026-07-14T10:00:00.000Z' } };
    expect(findAutoCompletableGameItemIds(items, progress, DATE)).toEqual([]);
  });

  it('пропускає вже done/skipped і кроки без ref_id', () => {
    const items = [
      item({ id: 'i1', kind: 'game', ref_id: 'gA', status: 'done' }),
      item({ id: 'i2', kind: 'review', ref_id: null, status: 'pending' }),
    ];
    const progress = { gA: { updated_at: '2026-07-14T10:00:00.000Z' } };
    expect(findAutoCompletableGameItemIds(items, progress, DATE)).toEqual([]);
  });

  it('немає запису прогресу для гри → не позначає', () => {
    const items = [item({ id: 'i1', kind: 'game', ref_id: 'gX', status: 'pending' })];
    expect(findAutoCompletableGameItemIds(items, {}, DATE)).toEqual([]);
  });
});

describe('partitionPlanItems (E2)', () => {
  it('isOfflinePlanItem: offline-типи → true, екранні → false', () => {
    expect(isOfflinePlanItem('workbook')).toBe(true);
    expect(isOfflinePlanItem('worksheet')).toBe(true);
    expect(isOfflinePlanItem('activity')).toBe(true);
    expect(isOfflinePlanItem('game')).toBe(false);
    expect(isOfflinePlanItem('review')).toBe(false);
  });

  it('розділяє на screen (game/review) та offline, зберігаючи порядок', () => {
    const items = [
      item({ id: 'a', kind: 'game' }),
      item({ id: 'b', kind: 'activity' }),
      item({ id: 'c', kind: 'review' }),
      item({ id: 'd', kind: 'workbook' }),
    ];
    const { screen, offline } = partitionPlanItems(items);
    expect(screen.map((i) => i.id)).toEqual(['a', 'c']);
    expect(offline.map((i) => i.id)).toEqual(['b', 'd']);
  });

  it('порожній список → дві порожні групи', () => {
    expect(partitionPlanItems([])).toEqual({ screen: [], offline: [] });
  });
});
