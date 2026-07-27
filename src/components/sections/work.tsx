import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';

const items = ['restaurant', 'retail', 'services'] as const;

// Proof, kept deliberately short: each entry is one process, stated as what it
// was and what it became. Before/after is the structure because that is the
// only claim being made — no metrics we can't source.
export function Work() {
  const t = useTranslations('Work');

  return (
    <section id="work" className="scroll-mt-24 border-t border-border py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t('subtitle')}</p>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-3">
          {items.map((id) => (
            <li key={id} className="flex flex-col gap-5 bg-bg-950 p-6 sm:p-8">
              <div>
                <p className="text-xs text-dim">{t(`items.${id}.sector`)}</p>
                <h3 className="mt-2 text-base font-semibold leading-snug text-ink">
                  {t(`items.${id}.title`)}
                </h3>
              </div>

              <dl className="flex flex-1 flex-col gap-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-dim">
                    {t('labels.before')}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                    {t(`items.${id}.before`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-lilac">
                    {t('labels.after')}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                    {t(`items.${id}.after`)}
                  </dd>
                </div>
              </dl>

              <p className="border-t border-border pt-4 text-xs text-dim">
                {t(`items.${id}.scope`)}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-dim">{t('note')}</p>
      </Container>
    </section>
  );
}
