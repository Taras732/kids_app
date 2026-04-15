import type { Locale } from '../i18n';

export function getDeviceLocale(): Locale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    return tag.toLowerCase().startsWith('uk') ? 'uk' : 'en';
  } catch {
    return 'uk';
  }
}
