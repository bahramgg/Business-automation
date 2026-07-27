import { useLocale, useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { formatIndex } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

const steps = ['s1', 's2', 's3'] as const;

// The path, stated once and early: assess → measure that domain → scope.
// A first visitor should never have to work out which service they need, so the
// site names the sequence before it names anything it sells.
export function Path() {
  const t = useTranslations('Home');
  const locale = useLocale() as Locale;

  return (
    <section className="border-y border-border py-14 sm:py-16">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {t('pathTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t('pathSubtitle')}
          </p>
        </div>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {steps.map((id, index) => (
            <li key={id}>
              <span className="tnum text-xs text-dim">
                {formatIndex(index + 1, locale)}
              </span>
              <h3 className="mt-2 text-base font-semibold text-ink">
                {t(`path.${id}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(`path.${id}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
