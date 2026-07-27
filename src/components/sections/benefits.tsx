import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';

const items = [
  'time',
  'speed',
  'consistency',
  'visibility',
  'scale',
  'ownership',
] as const;

// The benefits, stated as changes to how the business runs rather than as
// product features.
export function Benefits() {
  const t = useTranslations('Benefits');

  return (
    <section className="border-t border-border py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
        </div>

        <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((id) => (
            <div key={id}>
              <dt className="text-base font-semibold text-ink">
                {t(`items.${id}.title`)}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {t(`items.${id}.body`)}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
