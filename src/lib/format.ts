import type { Locale } from '@/i18n/routing';

// Locale-aware number formatting (plan §9: Persian digits in fa, Latin in en).
const intlLocale: Record<Locale, string> = { fa: 'fa-IR', en: 'en-US' };

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    maximumFractionDigits: 0,
  }).format(value);
}
