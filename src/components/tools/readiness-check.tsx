'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Counter } from '@/components/ui/counter';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import { domainToolSlug, type DomainId } from '@/lib/domains';
import {
  scoreReadiness,
  questionIds,
  answerLevels,
  DEFAULT_READINESS_ANSWERS,
  type ReadinessAnswers,
  type ReadinessResult,
} from '@/lib/readiness';
import { cn } from '@/lib/cn';

// Automation-readiness assessment — the site's entry point.
//
// Its job is routing, not scoring: a first visitor answers eight statements and
// leaves with one named domain to start from, and a link straight to it. That
// single recommendation is what keeps the path from branching into guesswork.
export function ReadinessCheck() {
  const t = useTranslations('Readiness');
  const dt = useTranslations('Domains');
  const locale = useLocale() as Locale;
  const [answers, setAnswers] = useState<ReadinessAnswers>(DEFAULT_READINESS_ANSWERS);
  const [result, setResult] = useState<ReadinessResult | null>(null);

  if (result) {
    const startDomain = result.startWith;
    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm text-muted">{t('scoreLabel')}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              <Counter value={result.score} />
            </span>
            <span className="text-sm text-muted">{t('scoreOutOf')}</span>
          </p>
        </div>

        {/* Per-domain bars, weakest first — the ranking is the point. */}
        <div>
          <p className="text-xs uppercase tracking-wider text-dim">
            {t('byDomainTitle')}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {result.byDomain.map((entry) => (
              <li key={entry.domain} className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-sm text-muted sm:w-40">
                  {dt(`cards.${entry.domain}.title`)}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface">
                  <span
                    className={cn(
                      'block h-full rounded-pill',
                      entry.domain === startDomain ? 'bg-lilac' : 'bg-border-glass',
                    )}
                    style={{ width: `${Math.max(entry.score, 2)}%` }}
                  />
                </span>
                <span className="tnum w-10 shrink-0 text-end text-sm text-muted">
                  {formatNumber(entry.score, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* The single next step. */}
        <div className="rounded-card border border-border-glass p-5">
          <p className="text-xs uppercase tracking-wider text-dim">
            {t('startWithTitle')}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            {dt(`cards.${startDomain}.title`)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t('startWithBody')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/services/${startDomain}`}
              className="rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t('goToDomain', { domain: dt(`cards.${startDomain}.title`) })}
            </Link>
            <Link
              href={`/tools/${domainToolSlug[startDomain as DomainId]}`}
              className="rounded-button border border-border px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-border-glass"
            >
              {dt(`cards.${startDomain}.tool`)}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-xs leading-relaxed text-dim">
            {t('disclaimer')}
          </p>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {t('retake')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-5">
        {questionIds.map((id) => (
          <li key={id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm leading-relaxed text-ink sm:max-w-md">
              {t(`questions.${id}`)}
            </span>
            <div
              role="group"
              aria-label={t(`questions.${id}`)}
              className="flex shrink-0 gap-1.5"
            >
              {answerLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={answers[id] === level}
                  onClick={() => setAnswers((prev) => ({ ...prev, [id]: level }))}
                  className={cn(
                    'rounded-field border px-3 py-1.5 text-xs transition-colors',
                    answers[id] === level
                      ? 'border-lilac text-ink'
                      : 'border-border text-dim hover:text-muted',
                  )}
                >
                  {t(`levels.${level}`)}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setResult(scoreReadiness(answers))}
        className="self-start rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white"
      >
        {t('submit')}
      </button>
    </div>
  );
}
