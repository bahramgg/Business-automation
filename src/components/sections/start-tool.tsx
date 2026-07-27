import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';

// Split out of the initial bundle — the tool sits below the fold (plan §14).
const ReadinessCheck = dynamic(() =>
  import('@/components/tools/readiness-check').then((m) => m.ReadinessCheck),
);

// Step one of the path: the readiness assessment. It is the site's entry tool
// because its output is a routing decision — which domain to start from —
// rather than a number the visitor then has to interpret alone.
export function StartTool() {
  const t = useTranslations('Readiness');

  return (
    <section id="assessment" className="scroll-mt-24 py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t('subtitle')}</p>
        </div>
        <div className="mt-10">
          <ToolBlock>
            <ReadinessCheck />
          </ToolBlock>
        </div>
      </Container>
    </section>
  );
}
