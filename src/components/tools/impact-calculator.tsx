'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';
import { Counter } from '@/components/ui/counter';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import {
  computeImpact,
  IMPACT_BOUNDS,
  DEFAULT_IMPACT_INPUTS,
  type ImpactInputs,
} from '@/lib/impact';

// The site's only tool. A visitor sets four numbers from their own business and
// sees what the service gives back — that answer is the argument, so no other
// section has to make it.
export function ImpactCalculator() {
  const t = useTranslations('Impact');
  const locale = useLocale() as Locale;
  const [inputs, setInputs] = useState<ImpactInputs>(DEFAULT_IMPACT_INPUTS);

  const result = computeImpact(inputs);
  const set = (key: keyof ImpactInputs) => (value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const pct = locale === 'fa' ? '٪' : '%';
  const withUnit = (n: number, unit: string) => `${formatNumber(n, locale)} ${unit}`;

  const outputs = [
    { key: 'hours', value: result.hoursSaved, lead: true },
    { key: 'workdays', value: result.workdaysSaved, lead: false },
    { key: 'requests', value: result.requestsRecovered, lead: false },
  ] as const;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Slider
          label={t('inputs.staff.label')}
          value={inputs.staffCount}
          {...IMPACT_BOUNDS.staffCount}
          displayValue={withUnit(inputs.staffCount, t('inputs.staff.unit'))}
          onChange={set('staffCount')}
        />
        <Slider
          label={t('inputs.hours.label')}
          value={inputs.hoursPerDay}
          {...IMPACT_BOUNDS.hoursPerDay}
          displayValue={withUnit(inputs.hoursPerDay, t('inputs.hours.unit'))}
          onChange={set('hoursPerDay')}
        />
        <Slider
          label={t('inputs.requests.label')}
          value={inputs.requestsPerMonth}
          {...IMPACT_BOUNDS.requestsPerMonth}
          displayValue={withUnit(inputs.requestsPerMonth, t('inputs.requests.unit'))}
          onChange={set('requestsPerMonth')}
        />
        <Slider
          label={t('inputs.missed.label')}
          value={inputs.missedPct}
          {...IMPACT_BOUNDS.missedPct}
          displayValue={`${formatNumber(inputs.missedPct, locale)}${pct}`}
          onChange={set('missedPct')}
        />
      </div>

      <div className="flex flex-col rounded-card border border-border-glass p-6 sm:p-8">
        <p className="text-sm text-muted">{t('results.hours.label')}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            <Counter value={outputs[0].value} />
          </span>
          <span className="text-sm text-muted">{t('results.hours.unit')}</span>
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
          {outputs.slice(1).map((out) => (
            <div key={out.key}>
              <dd className="text-2xl font-semibold text-ink">
                <Counter value={out.value} />
              </dd>
              <dt className="mt-1 text-xs leading-relaxed text-muted">
                {t(`results.${out.key}.label`)}
              </dt>
            </div>
          ))}
        </dl>

        {/* The assumptions are stated, not buried — the number is an estimate. */}
        <p className="mt-8 text-xs leading-relaxed text-dim">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
