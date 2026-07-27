import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ServiceSlug } from './services';

// Per-service metadata (plan §9, §14: metadata per-route per-locale).
export async function serviceMetadata(
  slug: ServiceSlug,
  locale: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `Service.${slug}` });
  return {
    title: t('title'),
    description: t('oneLiner'),
    alternates: { canonical: `/${locale}/services/${slug}` },
  };
}
