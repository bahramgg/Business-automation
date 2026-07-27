import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Pill } from '@/components/ui/pill';
import { ButtonLink } from '@/components/ui/button-link';

// Home hero (plan §4). Two-line title with the brand gradient on the second
// line — the one gradient phrase per page. The live-signal pill shows a
// truthful status only; the numeric variant is wired once real data exists.
export function Hero() {
  const t = useTranslations('Home');

  return (
    <section className="relative pb-16 pt-20 sm:pt-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Pill tone="success">{t('statusActive')}</Pill>

          <h1 className="mt-6 text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
            <span className="block">{t('heroLine1')}</span>
            <span className="text-gradient block">{t('heroLine2')}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {t('subtitle')}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" className="w-full sm:w-auto">
              {t('ctaPrimary')}
            </ButtonLink>
            <ButtonLink
              href="/tools"
              variant="ghost"
              className="w-full sm:w-auto"
            >
              {t('ctaSecondary')}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
