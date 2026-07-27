import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';
import { ReadinessCheck } from '@/components/tools/readiness-check';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Readiness' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: localeAlternates(locale, '/tools/readiness'),
  };
}

// The entry assessment on its own route, for anyone arriving at the tools
// index rather than the home page.
export default async function ReadinessToolPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Readiness' });

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{t('subtitle')}</p>
        </div>
      </Container>
      <Container className="mt-10">
        <ToolBlock>
          <ReadinessCheck />
        </ToolBlock>
      </Container>
    </div>
  );
}
