'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Counter } from '@/components/ui/counter';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/routing';
import {
  checkScanUrl,
  scoreAudit,
  type AuditAnswers,
  type AuditScore,
  type PageSignals,
} from '@/lib/audit/scan';

// Online-presence scan (plan §5.3). The questionnaire alone always produces a
// score; the optional site URL adds page signals via the Worker. If the Worker
// is absent or fails, we score on answers only and say so — never an error.
const ENDPOINT = process.env.NEXT_PUBLIC_SCAN_ENDPOINT;

const defaultAnswers: AuditAnswers = {
  hasOnlineCatalog: false,
  hasOnlinePayment: false,
  hasCustomerDatabase: false,
  replySpeed: 'hours',
  salesChannel: 'social',
};

const booleanQuestions = [
  'hasOnlineCatalog',
  'hasOnlinePayment',
  'hasCustomerDatabase',
] as const;

const replyOptions = ['minutes', 'hours', 'day-plus'] as const;
const channelOptions = ['website', 'social', 'phone', 'in-person'] as const;

export function AuditScan() {
  const t = useTranslations('Audit');
  const locale = useLocale() as Locale;
  const [url, setUrl] = useState('');
  const [answers, setAnswers] = useState<AuditAnswers>(defaultAnswers);
  const [result, setResult] = useState<AuditScore | null>(null);
  const [scanning, setScanning] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  async function run() {
    setScanning(true);
    setUrlError(null);

    let signals: PageSignals | null = null;

    if (url.trim()) {
      // Validate client-side too, so an obviously bad URL gets immediate,
      // specific feedback instead of a round trip.
      const check = checkScanUrl(url);
      if (!check.ok) {
        setUrlError(t(`urlErrors.${check.reason}`));
        setScanning(false);
        return;
      }
      if (ENDPOINT) {
        try {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: check.url }),
          });
          if (res.ok) {
            const data = (await res.json()) as { signals?: PageSignals };
            if (data.signals) signals = data.signals;
          }
        } catch {
          /* fall through to questionnaire-only scoring */
        }
      }
    }

    setResult(scoreAudit(answers, signals));
    setScanning(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Optional site URL */}
      <div>
        <label htmlFor="scan-url" className="text-sm text-muted">
          {t('urlLabel')}
        </label>
        <input
          id="scan-url"
          type="url"
          inputMode="url"
          dir="ltr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="mt-2 w-full rounded-field border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-dim focus:border-border-glass focus:outline-none"
        />
        {urlError ? (
          <p role="alert" className="mt-2 text-xs text-lilac">
            {urlError}
          </p>
        ) : (
          <p className="mt-2 text-xs text-dim">{t('urlHint')}</p>
        )}
      </div>

      {/* Five short questions */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm text-muted">{t('questionsLabel')}</legend>

        {booleanQuestions.map((key) => (
          <label key={key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink">{t(`questions.${key}`)}</span>
            <input
              type="checkbox"
              checked={answers[key]}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [key]: e.target.checked }))
              }
              className="h-5 w-5 shrink-0 accent-blue"
            />
          </label>
        ))}

        <div>
          <span className="text-sm text-ink">{t('questions.replySpeed')}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {replyOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={answers.replySpeed === option}
                onClick={() => setAnswers((prev) => ({ ...prev, replySpeed: option }))}
                className={cn(
                  'rounded-pill border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  answers.replySpeed === option
                    ? 'border-border-glass bg-brand text-white'
                    : 'border-border text-muted hover:text-ink',
                )}
              >
                {t(`replyOptions.${option}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm text-ink">{t('questions.salesChannel')}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {channelOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={answers.salesChannel === option}
                onClick={() => setAnswers((prev) => ({ ...prev, salesChannel: option }))}
                className={cn(
                  'rounded-pill border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  answers.salesChannel === option
                    ? 'border-border-glass bg-brand text-white'
                    : 'border-border text-muted hover:text-ink',
                )}
              >
                {t(`channelOptions.${option}`)}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      <button
        type="button"
        onClick={run}
        disabled={scanning}
        className="rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white shadow-brand transition-opacity disabled:opacity-50"
      >
        {scanning ? t('scanning') : t('submit')}
      </button>

      {/* Score card */}
      {result ? (
        <div className="rounded-card border border-border-glass bg-surface-2/50 p-6">
          <p className="text-sm text-muted">{t('scoreLabel')}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-gradient text-5xl font-extrabold tracking-tight">
              <Counter value={result.score} />
            </span>
            <span className="text-sm font-semibold text-muted">
              {t('scoreOutOf')}
            </span>
          </p>

          {result.wins.length > 0 ? (
            <>
              <p className="mt-6 text-sm font-semibold text-ink">{t('winsTitle')}</p>
              <ol className="mt-3 space-y-2">
                {result.wins.map((win, i) => (
                  <li key={win.id} className="flex items-start gap-3">
                    <span className="tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border-glass text-xs font-bold text-lilac">
                      {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(i + 1)}
                    </span>
                    <span className="text-sm text-muted">{t(`wins.${win.id}`)}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted">{t('noWins')}</p>
          )}

          {/* Honest about what the score is based on (plan §5.3). */}
          <p className="mt-6 text-xs leading-relaxed text-dim">
            {result.questionnaireOnly ? t('questionnaireOnlyNote') : t('disclaimer')}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-dim">{t('instagramNote')}</p>
        </div>
      ) : null}
    </div>
  );
}
