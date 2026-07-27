import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { ServiceCards } from './service-cards';

// The four-domain map — the one place the whole offering is visible at once.
export function ServicesMap() {
  const t = useTranslations('Domains');

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t('subtitle')}</p>
        </div>
      </Container>
      <div className="mt-10">
        <ServiceCards />
      </div>
    </section>
  );
}
