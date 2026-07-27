import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button-link';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import {
  IconStore,
  IconBot,
  IconAutomation,
  IconArrow,
} from '@/components/ui/icons';
import { ToolBlock, ToolComingSoon } from '@/components/tools/tool-block';
import { serviceToolSlug, type ServiceSlug } from '@/lib/services';

const icons = {
  website: IconStore,
  assistant: IconBot,
  automation: IconAutomation,
} as const;

const steps = ['s1', 's2', 's3'] as const;

// The fixed service-page template (plan §4). All three service pages render
// through this component, so their rhythm is identical by construction:
// overview → how it works → tool block → deliverables → related work + CTA.
export function ServiceDetail({ slug }: { slug: ServiceSlug }) {
  const t = useTranslations(`Service.${slug}`);
  const c = useTranslations('ServiceCommon');
  const Icon = icons[slug];
  const deliverables = t.raw('deliverables') as string[];

  return (
    <>
      {/* 1 — Overview: title + one-liner */}
      <section id="overview" className="scroll-mt-28 pb-8 pt-16 sm:pt-20">
        <Container>
          <div className="max-w-2xl">
            <span className="text-lilac inline-flex h-11 w-11 items-center justify-center rounded-field border border-border">
              <Icon />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-dim">
              {t('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              {t('oneLiner')}
            </p>
          </div>
        </Container>
      </section>

      {/* Sticky two-anchor subnav — always exactly these two (plan §4). */}
      <div className="sticky top-20 z-30 py-2">
        <Container>
          <div className="glass inline-flex items-center gap-1 rounded-pill p-1 text-sm">
            <a
              href="#overview"
              className="rounded-pill px-4 py-1.5 font-semibold text-muted transition-colors hover:text-ink"
            >
              {c('anchorOverview')}
            </a>
            <a
              href="#tool"
              className="rounded-pill px-4 py-1.5 font-semibold text-muted transition-colors hover:text-ink"
            >
              {c('anchorTool')}
            </a>
          </div>
        </Container>
      </div>

      {/* 2 — How it works: three steps */}
      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            {c('howTitle')}
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s}>
                <Card className="h-full">
                  <span className="text-lilac tnum text-sm font-bold">
                    {c('stepLabel')} {i + 1}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-ink">
                    {t(`steps.${s}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(`steps.${s}.body`)}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 3 — This service's tool (compact) — placeholder until Phase 3+ */}
      <section className="py-12">
        <Container>
          <ToolBlock fullHref={`/tools/${serviceToolSlug[slug]}`}>
            <ToolComingSoon />
          </ToolBlock>
        </Container>
      </section>

      {/* 4 — What you get: this service's checklist */}
      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            {c('deliverablesTitle')}
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {deliverables.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-field border border-border bg-surface/40 p-4"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-success"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 10.5l3.5 3.5L15 6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5 — Related work + CTA */}
      <section className="py-12 pb-24">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            {c('relatedTitle')}
          </h2>
          <Card className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">{c('relatedComing')}</p>
            <Link
              href="/work"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-lilac"
            >
              {c('viewAllWork')}
              <IconArrow className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </Card>

          <div className="mt-10">
            <ButtonLink href="/contact">{c('ctaButton')}</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
