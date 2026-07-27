'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { sectors, validateLead, type LeadFieldError } from '@/lib/lead';
import { cn } from '@/lib/cn';

// Lead form (plan §12). Four fields, nothing more — every extra field costs
// completion. Anti-bot is a honeypot plus a fill-time check, no CAPTCHA
// (plan §13). Validation runs here for instant feedback and again in the
// Worker, which is the boundary that actually enforces it.
const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

export function LeadForm() {
  const t = useTranslations('Contact');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState('');
  const [link, setLink] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<LeadFieldError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const mountedAt = useRef(Date.now());

  const fieldError = (field: LeadFieldError) => errors.includes(field);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    const elapsedMs = Date.now() - mountedAt.current;
    const check = validateLead({ name, phone, sector, link, company, elapsedMs });

    if (!check.ok) {
      // Silent rejections (bot signals) look like success to the sender.
      if (check.rejection) {
        setSent(true);
        return;
      }
      setErrors(check.fieldErrors);
      setFormError(null);
      return;
    }

    setErrors([]);
    setFormError(null);

    // Without a configured endpoint there is nowhere to deliver the lead —
    // say so plainly rather than pretending it was sent.
    if (!ENDPOINT) {
      setFormError(t('noEndpointNote'));
      return;
    }

    setSending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...check.lead, company, elapsedMs }),
      });
      if (res.ok) {
        setSent(true);
      } else if (res.status === 429) {
        setFormError(t('errors.rateLimited'));
      } else {
        const data = (await res.json().catch(() => ({}))) as { fields?: LeadFieldError[] };
        if (data.fields?.length) setErrors(data.fields);
        else setFormError(t('errors.general'));
      }
    } catch {
      setFormError(t('errors.general'));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border border-border-glass bg-surface-2/50 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-success/40 text-success mx-auto">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-4 text-lg font-bold text-ink">{t('successTitle')}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {t('successBody')}
        </p>
      </div>
    );
  }

  const inputClass = (invalid: boolean) =>
    cn(
      'mt-2 w-full rounded-field border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-dim',
      invalid ? 'border-lilac' : 'border-border focus:border-border-glass',
    );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="lead-name" className="text-sm text-muted">
          {t('fields.name.label')}
        </label>
        <input
          id="lead-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('fields.name.placeholder')}
          aria-invalid={fieldError('name')}
          aria-describedby={fieldError('name') ? 'lead-name-error' : undefined}
          className={inputClass(fieldError('name'))}
        />
        {fieldError('name') ? (
          <p id="lead-name-error" role="alert" className="mt-1.5 text-xs text-lilac">
            {t('errors.name')}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="lead-phone" className="text-sm text-muted">
          {t('fields.phone.label')}
        </label>
        <input
          id="lead-phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('fields.phone.placeholder')}
          aria-invalid={fieldError('phone')}
          aria-describedby={fieldError('phone') ? 'lead-phone-error' : undefined}
          className={inputClass(fieldError('phone'))}
        />
        {fieldError('phone') ? (
          <p id="lead-phone-error" role="alert" className="mt-1.5 text-xs text-lilac">
            {t('errors.phone')}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="lead-sector" className="text-sm text-muted">
          {t('fields.sector.label')}
        </label>
        <select
          id="lead-sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          aria-invalid={fieldError('sector')}
          className={inputClass(fieldError('sector'))}
        >
          <option value="">{t('sectorPlaceholder')}</option>
          {sectors.map((id) => (
            <option key={id} value={id}>
              {t(`sectors.${id}`)}
            </option>
          ))}
        </select>
        {fieldError('sector') ? (
          <p role="alert" className="mt-1.5 text-xs text-lilac">
            {t('errors.sector')}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="lead-link" className="text-sm text-muted">
          {t('fields.link.label')}
        </label>
        <input
          id="lead-link"
          dir="ltr"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={t('fields.link.placeholder')}
          aria-invalid={fieldError('link')}
          className={inputClass(fieldError('link'))}
        />
        {fieldError('link') ? (
          <p role="alert" className="mt-1.5 text-xs text-lilac">
            {t('errors.link')}
          </p>
        ) : null}
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. Not display:none,
       * which some bots skip; off-screen and removed from the a11y tree. */}
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="lead-company">Company</label>
        <input
          id="lead-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {formError ? (
        <p role="alert" className="rounded-field border border-border-glass p-3 text-xs leading-relaxed text-muted">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white shadow-brand transition-opacity disabled:opacity-50"
      >
        {sending ? t('sending') : t('submit')}
      </button>

      <p className="text-xs leading-relaxed text-dim">{t('privacyNote')}</p>
    </form>
  );
}
