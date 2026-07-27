import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button-link';

// Closing CTA (plan §4.9). Sits on a glass panel with the faint brand halo.
export function FinalCta() {
  const t = useTranslations('Cta');

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="glass relative overflow-hidden rounded-card px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden
            className="brand-halo pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
          />
          <h2 className="relative text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t('title')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            {t('subtitle')}
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" className="w-full sm:w-auto">
              {t('primary')}
            </ButtonLink>
            <ButtonLink
              href="/services"
              variant="ghost"
              className="w-full sm:w-auto"
            >
              {t('secondary')}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
