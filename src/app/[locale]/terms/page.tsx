import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { FinalCta } from '@/components/sections/final-cta';
import { formatIndex } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

// Order matters — this is the sequence a client reads before a first call.
const sections = [
  'start',
  'phases',
  'revisions',
  'clientDuties',
  'ip',
  'confidentiality',
  'thirdParty',
  'support',
  'stop',
] as const;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Terms' });
  return {
    title: t('title'),
    description: t('banner'),
    alternates: localeAlternates(locale, '/terms'),
  };
}

// /terms — short, clause-by-clause, no heavy legal language (plan §8).
export default async function TermsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Terms' });
  const typedLocale = locale as Locale;

  return (
    <>
      <div className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-dim">
              {t('eyebrow')}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {t('title')}
            </h1>
          </div>

          {/* This page is a framework, not a contract — said up front. */}
          <p className="mt-8 max-w-2xl rounded-card border border-border-glass bg-surface/60 p-4 text-sm leading-relaxed text-muted">
            {t('banner')}
          </p>

          <div className="mt-10 max-w-2xl divide-y divide-border border-y border-border">
            {sections.map((section, i) => (
              <section key={section} className="py-6">
                <h2 className="flex items-baseline gap-3 text-lg font-bold text-ink">
                  <span className="tnum text-sm font-semibold text-dim">
                    {formatIndex(i + 1, typedLocale)}
                  </span>
                  {t(`sections.${section}.title`)}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t(`sections.${section}.body`)}
                </p>
              </section>
            ))}
          </div>
        </Container>
      </div>

      <FinalCta />
    </>
  );
}
