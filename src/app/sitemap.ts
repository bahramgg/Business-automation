import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getWorkCases } from '@/lib/work';
import { siteUrl } from '@/lib/site';

// Bilingual sitemap with reciprocal hreflang (plan §9, §14). Every static route
// is emitted for both locales; case studies only for the locales they exist in,
// matching the "no untranslated case" rule.
const staticPaths = [
  '',
  '/services',
  '/services/website',
  '/services/assistant',
  '/services/automation',
  '/tools',
  '/tools/roi',
  '/tools/demo',
  '/tools/audit',
  '/tools/repeat',
  '/tools/scope',
  '/work',
  '/deliverables',
  '/terms',
  '/faq',
  '/contact',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
          ),
        },
      });
    }
  }

  // Case studies: only where a translation exists.
  const casesByLocale = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      slugs: (await getWorkCases(locale)).map((c) => c.slug),
    })),
  );

  for (const { locale, slugs } of casesByLocale) {
    for (const slug of slugs) {
      const languages = Object.fromEntries(
        casesByLocale
          .filter((entry) => entry.slugs.includes(slug))
          .map((entry) => [entry.locale, `${siteUrl}/${entry.locale}/work/${slug}`]),
      );
      entries.push({
        url: `${siteUrl}/${locale}/work/${slug}`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  return entries;
}
