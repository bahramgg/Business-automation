import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Container } from '@/components/ui/container';

// Split out of the initial bundle — the tool sits below the fold.
const ImpactCalculator = dynamic(() =>
  import('@/components/tools/impact-calculator').then((m) => m.ImpactCalculator),
);

// The site's one tool, with the single next step attached directly to its
// result — the moment a visitor sees the number is the moment to offer the call.
export function Impact() {
  const t = useTranslations('Impact');

  return (
    <section id="impact" className="scroll-mt-24 border-t border-border py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t('subtitle')}</p>
        </div>

        <div className="mt-12">
          <ImpactCalculator />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-8">
          <div className="max-w-md">
            <p className="text-base font-semibold text-ink">{t('ctaTitle')}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t('ctaBody')}</p>
          </div>
          <a
            href="#contact"
            className="shrink-0 rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            {t('cta')}
          </a>
        </div>
      </Container>
    </section>
  );
}
