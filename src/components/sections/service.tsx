import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';

const items = ['reply', 'order', 'followup', 'report'] as const;

// What the service actually is, in the four things it does. No sales framing —
// a visitor should be able to recognise their own week in this list.
export function Service() {
  const t = useTranslations('Service');

  return (
    <section id="service" className="scroll-mt-24 border-t border-border py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t('body')}</p>
        </div>

        <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {items.map((id) => (
            <div key={id} className="border-t border-border pt-5">
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
