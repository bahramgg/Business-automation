import { defineRouting } from 'next-intl/routing';

// fa is the default (RTL); en is the second locale (LTR). Slugs stay English
// in both locales — only content is translated (plan §3, §9).
export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  // Always prefix so /fa and /en are both explicit; / redirects to /fa.
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

// Text direction per locale — drives <html dir> and logical CSS.
export const direction: Record<Locale, 'rtl' | 'ltr'> = {
  fa: 'rtl',
  en: 'ltr',
};

// Narrowing guard for an unknown route segment.
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    (routing.locales as readonly string[]).includes(value)
  );
}
