'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';
import { Counter } from '@/components/ui/counter';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import {
  computeRepeat,
  encodeRepeatParams,
  REPEAT_BOUNDS,
  DEFAULT_REPEAT_INPUTS,
  type RepeatInputs,
} from '@/lib/repeat';
import { cn } from '@/lib/cn';

// Repeat-customer calculator (plan §5.5). Deliberately the same shape as the
// ROI calculator — shared Slider/Counter primitives, same two roles, same
// honesty line — so the two feel like one family.
export function RepeatCalculator({
  variant = 'compact',
  initial = DEFAULT_REPEAT_INPUTS,
}: {
  variant?: 'compact' | 'full';
  initial?: RepeatInputs;
}) {
  const t = useTranslations('Repeat');
  const locale = useLocale() as Locale;
  const [inputs, setInputs] = useState<RepeatInputs>(initial);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = computeRepeat(inputs);
  const set = (key: keyof RepeatInputs) => (value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const pct = locale === 'fa' ? '٪' : '%';
  const money = (n: number) => `${formatNumber(n, locale)} ${t('inputs.purchase.unit')}`;

  useEffect(() => {
    if (variant !== 'full' || typeof window === 'undefined') return;
    const params = new URLSearchParams(encodeRepeatParams(inputs));
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
          label={t('inputs.customers.label')}
          value={inputs.totalCustomers}
          {...REPEAT_BOUNDS.totalCustomers}
          displayValue={formatNumber(inputs.totalCustomers, locale)}
          onChange={set('totalCustomers')}
        />
        <Slider
          label={t('inputs.purchase.label')}
          value={inputs.avgPurchase}
          {...REPEAT_BOUNDS.avgPurchase}
          displayValue={money(inputs.avgPurchase)}
          onChange={set('avgPurchase')}
        />
        <Slider
          label={t('inputs.interval.label')}
          value={inputs.rebuyMonths}
          {...REPEAT_BOUNDS.rebuyMonths}
          displayValue={t('inputs.interval.value', { months: inputs.rebuyMonths })}
          onChange={set('rebuyMonths')}
        />
        <Slider
          label={t('inputs.returning.label')}
          value={inputs.returningPct}
          {...REPEAT_BOUNDS.returningPct}
          displayValue={`${formatNumber(inputs.returningPct, locale)}${pct}`}
          onChange={set('returningPct')}
        />
      </div>

      <div className="flex flex-col rounded-card border border-border-glass bg-surface-2/50 p-6">
        <p className="text-sm text-muted">{t('results.recoverable.label')}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-gradient text-4xl font-extrabold tracking-tight sm:text-5xl">
            <Counter value={result.recoverableRevenue} />
          </span>
          <span className="text-sm font-semibold text-muted">
            {t('results.recoverable.unit')}
          </span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-field border border-border p-4">
            <p className="text-2xl font-bold text-ink">
              <Counter value={result.forgottenCustomers} />
            </p>
            <p className="mt-1 text-xs text-muted">{t('results.forgotten.label')}</p>
          </div>
          <div className="rounded-field border border-border p-4">
            <p className="tnum text-2xl font-bold text-ink">
              {t('results.multiple.value', { times: result.acquisitionMultiple })}
            </p>
            <p className="mt-1 text-xs text-muted">{t('results.multiple.label')}</p>
          </div>
        </div>

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
