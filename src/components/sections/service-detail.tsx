import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Link } from '@/i18n/navigation';
import { IconArrow } from '@/components/ui/icons';
import { ToolBlock, ToolComingSoon } from '@/components/tools/tool-block';
import { domainToolSlug, domainSecondaryTool, type DomainId } from '@/lib/domains';
import { formatIndex } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

const steps = ['s1', 's2', 's3'] as const;

// The one template every domain page renders through, so all four keep an
// identical rhythm: overview → how it gets automated → this domain's tool →
// what it delivers → the single next step.
//
// A domain never shows two tools at once. Where a domain has a second proof
// (sales has the live response sample), it is linked, not embedded.
export function ServiceDetail({
  slug,
  tool,
}: {
  slug: DomainId;
  tool?: ReactNode;
}) {
  const t = useTranslations(`Domain.${slug}`);
  const c = useTranslations('DomainCommon');
  const locale = useLocale() as Locale;
  const deliverables = t.raw('deliverables') as string[];
  const secondary = domainSecondaryTool[slug];

  return (
    <>
      <section id="overview" className="scroll-mt-24 pb-10 pt-16 sm:pt-20">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wider text-dim">
              {t('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              {t('oneLiner')}
            </p>
          </div>
        </Container>
      </section>

      {/* Two anchors, always the same two. */}
      <div className="sticky top-20 z-30 border-y border-border bg-bg-950/90 py-2 backdrop-blur">
        <Container>
          <nav className="flex gap-6 text-sm">
            <a href="#overview" className="text-muted transition-colors hover:text-ink">
              {c('anchorOverview')}
            </a>
            <a href="#tool" className="text-muted transition-colors hover:text-ink">
              {c('anchorTool')}
            </a>
          </nav>
        </Container>
      </div>

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {c('howTitle')}
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s}>
                <span className="tnum text-xs text-dim">
                  {formatIndex(i + 1, locale)}
                </span>
                <h3 className="mt-2 text-base font-semibold text-ink">
                  {t(`steps.${s}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`steps.${s}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* This domain's measurement tool. */}
      <section className="py-6">
        <Container>
          <ToolBlock fullHref={`/tools/${domainToolSlug[slug]}`}>
            {tool ?? <ToolComingSoon />}
          </ToolBlock>

          {secondary ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-card border border-border p-5">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {c('secondaryTitle')}
                </p>
                <p className="mt-1 text-sm text-muted">{c('secondaryBody')}</p>
              </div>
              <Link
                href={`/tools/${secondary}`}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-lilac"
              >
                {c('secondaryCta')}
                <IconArrow className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {c('deliverablesTitle')}
          </h2>
          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3 border-t border-border pt-4">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lilac" />
                <span className="text-sm text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* One next step, named. */}
      <section className="pb-24 pt-6">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-card border border-border-glass p-6 sm:p-8">
            <div className="max-w-md">
              <p className="text-base font-semibold text-ink">
                {c('nextStepTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {c('nextStepBody')}
              </p>
            </div>
            <Link
              href="/tools/scope"
              className="shrink-0 rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              {c('ctaButton')}
            </Link>
          </div>

          <div className="mt-6">
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              {c('viewAllWork')}
              <IconArrow className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
