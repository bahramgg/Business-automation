'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

const phases = ['p1', 'p2', 'p3'] as const;
type PhaseId = (typeof phases)[number];

// Interactive three-phase timeline (plan §4.7). Selecting a phase reveals its
// steps and its output. Implemented as a tablist so it's fully keyboard- and
// screen-reader-navigable.
export function Timeline() {
  const t = useTranslations('Timeline');
  const locale = useLocale() as Locale;
  const [active, setActive] = useState<PhaseId>('p1');

  return (
    <section className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <Container className="mt-10">
        {/* Phase selector */}
        <div role="tablist" aria-label={t('title')} className="grid gap-3 sm:grid-cols-3">
          {phases.map((id, index) => {
            const selected = id === active;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                id={`phase-tab-${id}`}
                aria-selected={selected}
                aria-controls={`phase-panel-${id}`}
                onClick={() => setActive(id)}
                className={cn(
                  'relative overflow-hidden rounded-card border p-5 text-start transition-colors',
                  selected
                    ? 'border-border-glass bg-surface'
                    : 'border-border bg-surface/40 hover:border-border-glass',
                )}
              >
                {selected ? (
                  <span aria-hidden className="bg-brand absolute inset-x-0 top-0 block h-0.5" />
                ) : null}
                <span className="text-xs font-semibold uppercase tracking-widest text-dim">
                  {t('phaseLabel')} {formatNumber(index + 1, locale)}
                </span>
                <span className="mt-2 block text-base font-bold text-ink">
                  {t(`phases.${id}.name`)}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {t(`phases.${id}.duration`)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active phase detail */}
        {phases.map((id) => (
          <div
            key={id}
            role="tabpanel"
            id={`phase-panel-${id}`}
            aria-labelledby={`phase-tab-${id}`}
            hidden={id !== active}
            className="mt-5 rounded-card border border-border bg-surface/40 p-6"
          >
            <p className="text-base leading-relaxed text-muted">
              {t(`phases.${id}.summary`)}
            </p>

            <ol className="mt-6 space-y-3">
              {(t.raw(`phases.${id}.steps`) as string[]).map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border-glass text-xs font-bold text-lilac">
                    {formatNumber(i + 1, locale)}
                  </span>
                  <span className="text-sm text-muted">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap items-baseline gap-2 border-t border-border pt-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                {t('deliverableLabel')}:
              </span>
              <span className="text-sm font-semibold text-ink">
                {t(`phases.${id}.deliverable`)}
              </span>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
