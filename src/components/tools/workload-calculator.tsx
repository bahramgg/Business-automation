'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';
import { Counter } from '@/components/ui/counter';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import {
  computeWorkload,
  encodeWorkloadParams,
  WORKLOAD_BOUNDS,
  DEFAULT_WORKLOAD_INPUTS,
  type WorkloadInputs,
} from '@/lib/workload';
import { cn } from '@/lib/cn';

// Repetitive-workload calculator — the operations domain's tool. Same family as
// the other calculators: sliders in, animated result out, honesty line always.
export function WorkloadCalculator({
  variant = 'compact',
  initial = DEFAULT_WORKLOAD_INPUTS,
}: {
  variant?: 'compact' | 'full';
  initial?: WorkloadInputs;
}) {
  const t = useTranslations('Workload');
  const locale = useLocale() as Locale;
  const [inputs, setInputs] = useState<WorkloadInputs>(initial);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = computeWorkload(inputs);
  const set = (key: keyof WorkloadInputs) => (value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const pct = locale === 'fa' ? '٪' : '%';
  const withUnit = (n: number, unit: string) => `${formatNumber(n, locale)} ${unit}`;

  useEffect(() => {
    if (variant !== 'full' || typeof window === 'undefined') return;
    const params = new URLSearchParams(encodeWorkloadParams(inputs));
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
      /* clipboard unavailable */
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Slider
          label={t('inputs.staff.label')}
          value={inputs.staffCount}
          {...WORKLOAD_BOUNDS.staffCount}
          displayValue={withUnit(inputs.staffCount, t('inputs.staff.unit'))}
          onChange={set('staffCount')}
        />
        <Slider
          label={t('inputs.hours.label')}
          value={inputs.hoursPerDay}
          {...WORKLOAD_BOUNDS.hoursPerDay}
          displayValue={withUnit(inputs.hoursPerDay, t('inputs.hours.unit'))}
          onChange={set('hoursPerDay')}
        />
        <Slider
          label={t('inputs.days.label')}
          value={inputs.daysPerMonth}
          {...WORKLOAD_BOUNDS.daysPerMonth}
          displayValue={withUnit(inputs.daysPerMonth, t('inputs.days.unit'))}
          onChange={set('daysPerMonth')}
        />
        <Slider
          label={t('inputs.automatable.label')}
          value={inputs.automatablePct}
          {...WORKLOAD_BOUNDS.automatablePct}
          displayValue={`${formatNumber(inputs.automatablePct, locale)}${pct}`}
          onChange={set('automatablePct')}
        />
      </div>

      <div className="flex flex-col rounded-card border border-border-glass p-6">
        <p className="text-sm text-muted">{t('results.reclaimed.label')}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            <Counter value={result.reclaimedHours} />
          </span>
          <span className="text-sm text-muted">{t('results.monthly.unit')}</span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-field border border-border p-4">
            <p className="text-2xl font-semibold text-ink">
              <Counter value={result.reclaimedWorkdays} />
            </p>
            <p className="mt-1 text-xs text-muted">{t('results.workdays.label')}</p>
          </div>
          <div className="rounded-field border border-border p-4">
            <p className="text-2xl font-semibold text-ink">
              <Counter value={result.monthlyHours} />
            </p>
            <p className="mt-1 text-xs text-muted">{t('results.monthly.label')}</p>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-dim">{t('disclaimer')}</p>

        {variant === 'full' ? (
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              'mt-5 inline-flex items-center justify-center rounded-button border px-4 py-2.5 text-sm font-semibold transition-colors',
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
