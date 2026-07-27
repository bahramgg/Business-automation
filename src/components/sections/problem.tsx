import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';

const cards = ['scattered', 'manual', 'blind'] as const;

// Why automate at all — stated at the level of the business system, not one
// department. Deliberately plain: no icons, no cards, just the argument.
export function Problem() {
  const t = useTranslations('Problem');

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t('body')}</p>
        </div>

        <dl className="mt-12 grid gap-10 sm:grid-cols-3">
          {cards.map((id) => (
            <div key={id}>
              <dt className="text-base font-semibold text-ink">
                {t(`cards.${id}.title`)}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {t(`cards.${id}.body`)}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
