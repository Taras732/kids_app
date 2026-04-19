import type { GameDefinition } from './types';
import tapTheDot from './tap-the-dot';
import countObjects from './count-objects';
import mathExpressions from './math-expressions';
import mathCompare from './math-compare';
import shapes from './shapes';
import lettersFind from './letters-find';

const registry = new Map<string, GameDefinition<any, any>>();

export function registerGame(def: GameDefinition<any, any>) {
  if (registry.has(def.id)) {
    if (__DEV__) console.warn(`[gameRegistry] duplicate id: ${def.id}`);
  }
  registry.set(def.id, def);
}

export function getGame(id: string): GameDefinition<any, any> | undefined {
  return registry.get(id);
}

export function listGames(): GameDefinition<any, any>[] {
  return Array.from(registry.values());
}

export function listGamesByIsland(islandId: string): GameDefinition<any, any>[] {
  return listGames().filter((g) => g.islandId === islandId);
}

registerGame(tapTheDot);
registerGame(countObjects);
registerGame(mathExpressions);
registerGame(mathCompare);
registerGame(shapes);
registerGame(lettersFind);
