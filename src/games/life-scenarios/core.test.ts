import { describe, it, expect } from 'vitest';
import { SCENARIOS, scenariosFor, pickScenarios, bestAction, createRng } from './core';
import type { ProfileLevel } from '../types';

const LEVELS: ProfileLevel[] = ['L0', 'L3'];

describe('сценарії — структура', () => {
  it('у кожного рівно одна найкраща дія', () => {
    for (const s of SCENARIOS) {
      const best = s.actions.filter((a) => a.isBest);
      expect(best.length, `${s.id}: найкращих дій ${best.length}`).toBe(1);
    }
  });

  it('КОЖНА дія має наслідок — інакше лишився б фідбек «правильно/ні» (d≈0.05)', () => {
    for (const s of SCENARIOS) {
      for (const a of s.actions) {
        expect(a.consequence.trim(), `${s.id}/«${a.label}»: нема наслідку`).not.toBe('');
        expect(a.mood.trim(), `${s.id}/«${a.label}»: нема настрою`).not.toBe('');
      }
    }
  });

  it('наслідок не дублює текст дії (це подія, а не переказ вибору)', () => {
    for (const s of SCENARIOS) {
      for (const a of s.actions) {
        expect(a.consequence).not.toBe(a.label);
        expect(a.consequence.length, `${s.id}: наслідок закороткий`).toBeGreaterThan(15);
      }
    }
  });

  it('id унікальні; ≥2 дії на сценарій', () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SCENARIOS) {
      expect(s.actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('обидва рівні мають сценарії', () => {
    for (const level of LEVELS) {
      expect(scenariosFor(level).length, `${level}: порожньо`).toBeGreaterThan(0);
    }
  });
});

describe('добір сценаріїв', () => {
  it('НЕ дублює сценарії, навіть коли просять більше, ніж є (регрес: раніше дублював завжди)', () => {
    for (const level of LEVELS) {
      for (let seed = 1; seed <= 50; seed++) {
        // просимо 5 при банку 4 — раніше один сценарій повторювався
        const picked = pickScenarios(level, 5, createRng(seed));
        const ids = picked.map((s) => s.id);
        expect(new Set(ids).size, `повтори: ${ids}`).toBe(ids.length);
        expect(picked.length).toBeLessThanOrEqual(scenariosFor(level).length);
      }
    }
  });

  it('усі дібрані сценарії — свого рівня', () => {
    for (const level of LEVELS) {
      for (const s of pickScenarios(level, 5, createRng(3))) {
        expect(s.level).toBe(level);
      }
    }
  });

  it('детерміновано за seed (не стрибає між ре-рендерами — баг Q2)', () => {
    expect(pickScenarios('L3', 4, createRng(9)).map((s) => s.id)).toEqual(
      pickScenarios('L3', 4, createRng(9)).map((s) => s.id),
    );
  });

  it('bestAction повертає саме найкращу', () => {
    for (const s of SCENARIOS) {
      expect(bestAction(s).isBest).toBe(true);
    }
  });
});
