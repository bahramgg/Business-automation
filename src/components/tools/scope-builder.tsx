'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import {
  buildScopePlan,
  moduleIds,
  urgencies,
  type ModuleId,
  type Urgency,
} from '@/lib/scope';
import { cn } from '@/lib/cn';

// Package configurator (plan §5.4). Output is scope + phasing + prerequisites.
// No prices, ever — pricing happens in the call. Export is print-to-PDF using
// the site's own tokens, so no PDF library ships to the browser.
export function ScopeBuilder() {
  const t = useTranslations('Scope');
  const locale = useLocale() as Locale;
  const [selected, setSelected] = useState<ModuleId[]>(['store', 'assistant']);
  const [urgency, setUrgency] = useState<Urgency>('normal');

  const plan = buildScopePlan(selected, urgency);

  function toggle(id: ModuleId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Module picker */}
      <div className="print:hidden">
        <p className="text-sm text-muted">{t('modulesLabel')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {moduleIds.map((id) => {
            const isSelected = selected.includes(id);
            const isAuto = !isSelected && plan.addedDependencies.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(id)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-field border px-4 py-3 text-start text-sm transition-colors',
                  isSelected
                    ? 'border-border-glass bg-surface text-ink'
                    : 'border-border text-muted hover:text-ink',
                )}
              >
                <span>{t(`modules.${id}`)}</span>
                {isSelected ? (
                  <svg className="h-4 w-4 shrink-0 text-success" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M5 10.5l3.5 3.5L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isAuto ? (
                  <span className="shrink-0 text-xs text-lilac">{t('autoAdded')}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency */}
      <div className="print:hidden">
        <p className="text-sm text-muted">{t('urgencyLabel')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {urgencies.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={urgency === option}
              onClick={() => setUrgency(option)}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                urgency === option
                  ? 'border-border-glass bg-brand text-white'
                  : 'border-border text-muted hover:text-ink',
              )}
            >
              {t(`urgencies.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Plan summary */}
      <div className="rounded-card border border-border-glass bg-surface-2/50 p-6">
        {plan.modules.length === 0 ? (
          <p className="py-6 text-center text-sm text-dim">{t('emptyState')}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-ink">{t('summaryTitle')}</h3>
              <span className="text-sm text-muted">
                {t('totalWeeks', { weeks: plan.totalWeeks })}
              </span>
            </div>

            {plan.addedDependencies.length > 0 ? (
              <p className="mt-3 rounded-field border border-border-glass p-3 text-xs leading-relaxed text-muted">
                {t('dependencyNote', {
                  modules: plan.addedDependencies
                    .map((id) => t(`modules.${id}`))
                    .join(locale === 'fa' ? '، ' : ', '),
                })}
              </p>
            ) : null}

            <ol className="mt-5 space-y-4">
              {plan.phases.map((phase) => (
                <li key={phase.phase} className="rounded-field border border-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                      {t('phaseLabel', { n: formatNumber(phase.phase, locale) })}
                    </span>
                    <span className="text-xs text-muted">
                      {t('phaseWeeks', { weeks: phase.weeks })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink">
                    {phase.modules.map((id) => t(`modules.${id}`)).join(locale === 'fa' ? '، ' : ', ')}
                  </p>
                </li>
              ))}
            </ol>

            {plan.prerequisites.length > 0 ? (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-dim">
                  {t('prerequisitesTitle')}
                </p>
                <ul className="mt-3 space-y-2">
                  {plan.prerequisites.map((need) => (
                    <li key={need} className="flex items-start gap-2.5 text-sm text-muted">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lilac" />
                      {t(`prerequisites.${need}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* No prices anywhere — stated plainly (plan §5.4). */}
            <p className="mt-6 text-xs leading-relaxed text-dim">{t('noPriceNote')}</p>

            <div className="mt-5 flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-button border border-border px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-border-glass"
              >
                {t('downloadPdf')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
