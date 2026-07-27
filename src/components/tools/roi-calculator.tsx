'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';
import { Counter } from '@/components/ui/counter';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import {
  computeRoi,
  encodeRoiParams,
  ROI_BOUNDS,
  DEFAULT_ROI_INPUTS,
  type RoiInputs,
} from '@/lib/roi';
import { cn } from '@/lib/cn';

// The lost-sales calculator (plan §5.1). One component, two roles (plan §3):
// `compact` on the home / service pages, `full` on /tools/roi where the result
// syncs to the URL for sharing. Calculation lives in lib/roi.ts (tested).
export function RoiCalculator({
  variant = 'compact',
  initial = DEFAULT_ROI_INPUTS,
}: {
  variant?: 'compact' | 'full';
  initial?: RoiInputs;
}) {
  const t = useTranslations('Roi');
  const locale = useLocale() as Locale;
  const [inputs, setInputs] = useState<RoiInputs>(initial);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = computeRoi(inputs);
  const set = (key: keyof RoiInputs) => (value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const pct = locale === 'fa' ? '٪' : '%';
  const money = (n: number) => `${formatNumber(n, locale)} ${t('inputs.orderValue.unit')}`;

  // Full mode: keep the URL in sync so the result is shareable (plan §5.1).
  useEffect(() => {
    if (variant !== 'full' || typeof window === 'undefined') return;
    const params = new URLSearchParams(encodeRoiParams(inputs));
    window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
  }, [inputs, variant]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  async function copyLink() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs — four sliders, no typing */}
      <div className="flex flex-col gap-6">
        <Slider
          label={t('inputs.messages.label')}
          value={inputs.messagesPerMonth}
          {...ROI_BOUNDS.messagesPerMonth}
          displayValue={formatNumber(inputs.messagesPerMonth, locale)}
          onChange={set('messagesPerMonth')}
        />
        <Slider
          label={t('inputs.answered.label')}
          value={inputs.answeredPct}
          {...ROI_BOUNDS.answeredPct}
          displayValue={`${formatNumber(inputs.answeredPct, locale)}${pct}`}
          onChange={set('answeredPct')}
        />
        <Slider
          label={t('inputs.orderValue.label')}
          value={inputs.avgOrderValue}
          {...ROI_BOUNDS.avgOrderValue}
          displayValue={money(inputs.avgOrderValue)}
          onChange={set('avgOrderValue')}
        />
        <Slider
          label={t('inputs.conversion.label')}
          value={inputs.conversionPct}
          {...ROI_BOUNDS.conversionPct}
          displayValue={`${formatNumber(inputs.conversionPct, locale)}${pct}`}
          onChange={set('conversionPct')}
        />
      </div>

      {/* Output — animated result card */}
      <div className="flex flex-col rounded-card border border-border-glass bg-surface-2/50 p-6">
        <p className="text-sm text-muted">{t('results.lostSales.label')}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-gradient text-4xl font-extrabold tracking-tight sm:text-5xl">
            <Counter value={result.lostSales} />
          </span>
          <span className="text-sm font-semibold text-muted">
            {t('results.lostSales.unit')}
          </span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-field border border-border p-4">
            <p className="text-2xl font-bold text-ink">
              <Counter value={result.ordersLost} />
            </p>
            <p className="mt-1 text-xs text-muted">
              {t('results.ordersLost.label')}
            </p>
          </div>
          <div className="rounded-field border border-border p-4">
            <p className="text-2xl font-bold text-ink">
              <Counter value={result.hoursFreed} />
            </p>
            <p className="mt-1 text-xs text-muted">
              {t('results.hoursFreed.label')}
            </p>
          </div>
        </div>

        {/* Honesty line — always present (plan §5.1). */}
        <p className="mt-6 text-xs leading-relaxed text-dim">{t('disclaimer')}</p>

        {variant === 'full' ? (
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              'mt-5 inline-flex items-center justify-center gap-2 rounded-button border px-4 py-2.5 text-sm font-semibold transition-colors',
              copied
                ? 'border-success text-success'
                : 'border-border text-ink hover:border-border-glass',
            )}
          >
            {copied ? t('copied') : t('copyLink')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
