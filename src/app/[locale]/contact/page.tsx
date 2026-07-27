import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { LeadForm } from '@/components/tools/lead-form';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: localeAlternates(locale, '/contact'),
  };
}

// /contact — the minimal lead form (plan §12).
export default async function ContactPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-dim">
              {t('eyebrow')}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {t('subtitle')}
            </p>
          </div>

          <div className="mt-10 rounded-card border border-border bg-surface/40 p-6">
            <h2 className="sr-only">{t('formTitle')}</h2>
            <LeadForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
