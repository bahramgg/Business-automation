import type { Locale } from '@/i18n/routing';

// Locale-aware number formatting (plan §9: Persian digits in fa, Latin in en).
const intlLocale: Record<Locale, string> = { fa: 'fa-IR', en: 'en-US' };

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * A zero-padded index in the locale's digits (01, 02 … / ۰۱، ۰۲ …), for
 * numbered lists that should not fall back to Latin digits under fa.
 */
export function formatIndex(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

/**
 * A year in the locale's digits — no thousands separator, so 1404 renders as
 * ۱۴۰۴ rather than ۱٬۴۰۴.
 */
export function formatYear(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    useGrouping: false,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Join a list with the separator the locale actually uses (Persian uses «،»,
 * English uses a comma), instead of hardcoding one punctuation mark.
 */
export function formatList(items: string[], locale: Locale): string {
  return new Intl.ListFormat(intlLocale[locale], {
    style: 'narrow',
    type: 'unit',
  }).format(items);
}
