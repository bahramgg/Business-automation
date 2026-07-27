'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { verticalIds, type VerticalId } from '@/lib/demo/verticals';
import { scriptedReply, suggestionKeys } from '@/lib/demo/fallback';
import { MAX_SESSION_MESSAGES } from '@/lib/demo/prompt';
import { cn } from '@/lib/cn';

// Live assistant demo (plan §5.2). Talks to the Cloudflare Worker proxy when
// NEXT_PUBLIC_DEMO_ENDPOINT is configured; otherwise — and on ANY failure,
// timeout, or rate-limit — it silently degrades to the scripted fallback. The
// user never sees a service error; the demo always answers.
const ENDPOINT = process.env.NEXT_PUBLIC_DEMO_ENDPOINT;

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

function newSessionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `s${Date.now()}${Math.random()}`;
}

export function LiveDemo({
  initialVertical = 'clothing',
}: {
  /** Vertical to open on — a case study's artifact starts on its own sector. */
  initialVertical?: VerticalId;
} = {}) {
  const t = useTranslations('Demo');
  const locale = useLocale() as 'fa' | 'en';
  const [vertical, setVertical] = useState<VerticalId>(initialVertical);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const sessionRef = useRef(newSessionId());
  const logRef = useRef<HTMLDivElement>(null);

  const used = turns.filter((turn) => turn.role === 'user').length;
  const limitReached = used >= MAX_SESSION_MESSAGES;

  // Switching vertical starts a fresh conversation and a fresh session budget.
  function chooseVertical(next: VerticalId) {
    if (next === vertical) return;
    setVertical(next);
    setTurns([]);
    setDraft('');
    sessionRef.current = newSessionId();
  }

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, pending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending || limitReached) return;

    const next: Turn[] = [...turns, { role: 'user', content: message }];
    setTurns(next);
    setDraft('');
    setPending(true);

    let reply: string | null = null;
    if (ENDPOINT) {
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vertical,
            locale,
            sessionId: sessionRef.current,
            messages: next,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { reply?: string };
          if (typeof data.reply === 'string' && data.reply.trim()) {
            reply = data.reply.trim();
          }
        }
      } catch {
        /* network failure → fallback below, no error surfaced */
      }
    }

    // Fallback: scripted answer from the same catalog (plan §5.2).
    setTurns([
      ...next,
      { role: 'assistant', content: reply ?? scriptedReply(message, locale, vertical) },
    ]);
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Vertical chips */}
      <div>
        <p className="text-sm text-muted">{t('choosePrompt')}</p>
        <div role="group" aria-label={t('choosePrompt')} className="mt-3 flex flex-wrap gap-2">
          {verticalIds.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={id === vertical}
              onClick={() => chooseVertical(id)}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                id === vertical
                  ? 'border-border-glass bg-brand text-white'
                  : 'border-border text-muted hover:text-ink',
              )}
            >
              {t(`verticals.${id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Chat log */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="h-72 overflow-y-auto rounded-card border border-border bg-bg-950/60 p-4"
      >
        {turns.length === 0 ? (
          <p className="py-10 text-center text-sm text-dim">{t('empty')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {turns.map((turn, i) => (
              <li
                key={i}
                className={cn(
                  'max-w-[85%] rounded-card px-4 py-2.5 text-sm leading-relaxed',
                  turn.role === 'user'
                    ? 'ms-auto bg-brand text-white'
                    : 'me-auto border border-border bg-surface text-ink',
                )}
              >
                {turn.content}
              </li>
            ))}
            {pending ? (
              <li className="me-auto rounded-card border border-border bg-surface px-4 py-2.5 text-sm text-dim">
                {t('typing')}
              </li>
            ) : null}
          </ul>
        )}
      </div>

      {/* Suggested openers */}
      {turns.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestionKeys.map((key) => {
            const question = t(`suggestions.${vertical}.${key}`);
            return (
              <button
                key={key}
                type="button"
                onClick={() => send(question)}
                className="rounded-pill border border-border px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-border-glass hover:text-ink"
              >
                {question}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={limitReached}
          placeholder={limitReached ? t('limitReached') : t('placeholder')}
          aria-label={t('placeholder')}
          maxLength={500}
          className="min-w-0 flex-1 rounded-field border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-dim focus:border-border-glass disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || limitReached || !draft.trim()}
          className="shrink-0 rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-opacity disabled:opacity-40"
        >
          {t('send')}
        </button>
      </form>

      <p className="text-xs text-dim">
        {t('sessionCounter', { used, max: MAX_SESSION_MESSAGES })}
      </p>
    </div>
  );
}
