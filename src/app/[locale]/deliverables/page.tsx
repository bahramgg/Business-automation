import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { FinalCta } from '@/components/sections/final-cta';
import { Timeline } from '@/components/sections/timeline';

const groups = ['product', 'data', 'ownership', 'docs', 'support'] as const;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Deliverables' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/deliverables` },
  };
}

// /deliverables — the grouped checklist of what actually ships (plan §7),
// followed by the phase timeline so the "when" sits next to the "what".
export default async function DeliverablesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Deliverables' });

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group} className="h-full">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                {t(`groups.${group}.title`)}
              </h2>
              <ul className="mt-4 space-y-3">
                {(t.raw(`groups.${group}.items`) as string[]).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-success"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M5 10.5l3.5 3.5L15 6.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-dim">
          {t('note')}
        </p>
      </Container>

      <Timeline />
      <FinalCta />
    </>
  );
}
