import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/cn';

// The site opens by saying what the service is, then offers exactly two moves:
// book a call, or scroll to the tool that shows what it's worth.
export function Hero() {
  const t = useTranslations('Hero');

  const anchor =
    'inline-flex items-center justify-center rounded-button px-5 py-3 text-sm font-semibold transition-colors';

  return (
    <section className="pb-16 pt-20 sm:pb-24 sm:pt-28">
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
            <a href="#contact" className={cn(anchor, 'bg-brand text-white')}>
              {t('ctaPrimary')}
            </a>
            <a
              href="#impact"
              className={cn(anchor, 'border border-border text-ink hover:border-border-glass')}
            >
              {t('ctaSecondary')}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
