import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';

const ids = ['prices', 'time', 'ownership', 'iran', 'assistant'] as const;

// Short FAQ (plan §4.8) built on native <details> — accessible and needs no
// client JS. Emits FAQPage JSON-LD for search engines (plan §14).
export function Faq() {
  const t = useTranslations('Faq');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ids.map((id) => ({
      '@type': 'Question',
      name: t(`items.${id}.q`),
      acceptedAnswer: { '@type': 'Answer', text: t(`items.${id}.a`) },
    })),
  };

  return (
    <section className="py-16 sm:py-20">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
      <Container className="mt-10">
        <div className="mx-auto max-w-2xl divide-y divide-border overflow-hidden rounded-card border border-border bg-surface/40">
          {ids.map((id) => (
            <details key={id} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-start text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {t(`items.${id}.q`)}
                <svg
                  className="h-4 w-4 shrink-0 text-dim transition-transform duration-200 group-open:rotate-45"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                {t(`items.${id}.a`)}
              </p>
            </details>
          ))}
        </div>
      </Container>
      <script
        type="application/ld+json"
        // JSON-LD is static, derived from message strings only.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
