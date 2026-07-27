import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionHeading } from '@/components/ui/section-heading';
import { ServiceCards } from '@/components/sections/service-cards';
import { FinalCta } from '@/components/sections/final-cta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/services` },
  };
}

// /services — overview only: introduce the three services and route to them
// (plan §3). No tool here; the tools live on the individual service pages.
export default async function ServicesOverviewPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });

  return (
    <>
      <div className="pt-16 sm:pt-20">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
      </div>
      <div className="mt-12">
        <ServiceCards />
      </div>
      <FinalCta />
    </>
  );
}
