import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { WorkCard } from '@/components/sections/work-card';
import { FinalCta } from '@/components/sections/final-cta';
import { getWorkCases } from '@/lib/work';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'WorkPage' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/work` },
  };
}

// /work — the case-study grid (plan §6). Only cases translated into this
// locale appear; there is no cross-language fallback.
export default async function WorkPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'WorkPage' });
  const cases = await getWorkCases(locale as Locale);

  return (
    <>
      <div className="pt-16 sm:pt-20">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
      </div>

      <Container className="mt-12">
        {cases.length === 0 ? (
          <p className="rounded-card border border-border bg-surface/40 p-8 text-center text-sm text-muted">
            {t('empty')}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <WorkCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </Container>

      <FinalCta />
    </>
  );
}
