import { routing } from '@/i18n/routing';

/**
 * Canonical + reciprocal hreflang for one route (plan §9, §14).
 *
 * A page's `alternates` replaces the layout's rather than merging with it, so
 * every page must build its own — otherwise it silently ships without hreflang.
 *
 * @param path route below the locale, e.g. "/services/website" ("" for home)
 */
export function localeAlternates(locale: string, path = '') {
  return {
    canonical: `/${locale}${path}`,
    languages: Object.fromEntries(
      routing.locales.map((l) => [l, `/${l}${path}`]),
    ),
  };
}
