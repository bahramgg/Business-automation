import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button-link';

// Home hero. Deliberately restrained: left-aligned, one weight of type, and no
// gradient headline — the accent is spent on the single primary action instead,
// so the eye lands on the one thing a first visitor should do.
export function Hero() {
  const t = useTranslations('Home');

  return (
    <section className="pb-14 pt-20 sm:pb-20 sm:pt-28">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-ink">
            <span className="block">{t('heroLine1')}</span>
            <span className="block text-muted">{t('heroLine2')}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {t('subtitle')}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/tools/readiness" className="w-full sm:w-auto">
              {t('ctaPrimary')}
            </ButtonLink>
            <ButtonLink href="/services" variant="ghost" className="w-full sm:w-auto">
              {t('ctaSecondary')}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
