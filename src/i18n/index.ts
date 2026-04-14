import uk from './uk.json';
import en from './en.json';

export type Locale = 'uk' | 'en';

const dictionaries: Record<Locale, Record<string, unknown>> = { uk, en };

let currentLocale: Locale = 'uk';

export const setLocale = (locale: Locale): void => {
  currentLocale = locale;
};

export const getLocale = (): Locale => currentLocale;

const getByPath = (obj: Record<string, unknown>, path: string): string | undefined => {
  const parts = path.split('.');
  let node: unknown = obj;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
};

export const t = (key: string, vars?: Record<string, string | number>): string => {
  const dict = dictionaries[currentLocale];
  const template = getByPath(dict, key) ?? key;
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`,
  );
};
