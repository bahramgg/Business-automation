// Lead capture (plan §12). Minimal form — name, phone/WhatsApp, sector, and an
// optional link. Every extra field lowers completion, so there are no others.
// Validation is pure and shared by the client (instant feedback) and the Worker
// (the boundary that actually matters).

export const sectors = [
  'retail',
  'restaurant',
  'salon',
  'services',
  'other',
] as const;
export type Sector = (typeof sectors)[number];

export function isSector(value: unknown): value is Sector {
  return typeof value === 'string' && (sectors as readonly string[]).includes(value);
}

export interface LeadInput {
  name: string;
  /** Iranian mobile or WhatsApp number. */
  phone: string;
  sector: string;
  /** Optional site or social link. */
  link?: string;
  /** Honeypot — must stay empty; bots fill it (plan §13). */
  company?: string;
  /** Milliseconds between form render and submit (anti-bot timing check). */
  elapsedMs?: number;
}

export type LeadFieldError = 'name' | 'phone' | 'sector' | 'link';
export type LeadRejection = 'honeypot' | 'too-fast';

export type LeadValidation =
  | { ok: true; lead: { name: string; phone: string; sector: Sector; link?: string } }
  | { ok: false; fieldErrors: LeadFieldError[]; rejection?: LeadRejection };

/** A human needs at least this long to fill four fields (plan §13, no CAPTCHA). */
export const MIN_FILL_MS = 2_000;

const MAX_NAME = 80;
const MAX_LINK = 300;

/**
 * Normalize an Iranian mobile number to 09xxxxxxxxx.
 * Accepts +98/0098/98 prefixes, Persian and Arabic-Indic digits, and any mix of
 * spaces or dashes — people paste numbers in every possible shape.
 */
export function normalizePhone(raw: string): string | null {
  // Map Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII.
  const ascii = raw.replace(/[۰-۹٠-٩]/g, (d) => {
    const code = d.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });

  const digitsOnly = ascii.replace(/[^\d+]/g, '');
  let national = digitsOnly
    .replace(/^\+98/, '0')
    .replace(/^0098/, '0')
    .replace(/^98(?=9)/, '0');

  // A bare 9xxxxxxxxx is a very common paste; treat it as national.
  if (/^9\d{9}$/.test(national)) national = `0${national}`;

  return /^09\d{9}$/.test(national) ? national : null;
}

/** Validate a submission. Returns the cleaned lead, or the fields to flag. */
export function validateLead(input: LeadInput): LeadValidation {
  const fieldErrors: LeadFieldError[] = [];

  const name = input.name.trim();
  if (name.length < 2 || name.length > MAX_NAME) fieldErrors.push('name');

  const phone = normalizePhone(input.phone ?? '');
  if (!phone) fieldErrors.push('phone');

  if (!isSector(input.sector)) fieldErrors.push('sector');

  let link: string | undefined;
  const rawLink = input.link?.trim();
  if (rawLink) {
    if (rawLink.length > MAX_LINK) {
      fieldErrors.push('link');
    } else {
      try {
        const url = new URL(/^https?:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`);
        // The link is only ever displayed to an admin, never fetched — but it
        // still must not carry a javascript:/data: payload into a message.
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          fieldErrors.push('link');
        } else {
          link = url.toString();
        }
      } catch {
        fieldErrors.push('link');
      }
    }
  }

  // Field errors come first. The bot checks below answer with a silent success,
  // so running them earlier would show a human who clicked Send on an empty
  // form a fake "sent" screen and quietly lose their lead.
  if (fieldErrors.length > 0) return { ok: false, fieldErrors };

  // Bot signals — silent rejections, so a bot never learns why it failed.
  // The honeypot is invisible to people; only a script fills it.
  if (input.company && input.company.trim() !== '') {
    return { ok: false, fieldErrors: [], rejection: 'honeypot' };
  }
  // A complete, valid submission faster than a person can type four fields.
  if (input.elapsedMs !== undefined && input.elapsedMs < MIN_FILL_MS) {
    return { ok: false, fieldErrors: [], rejection: 'too-fast' };
  }

  return {
    ok: true,
    lead: {
      name,
      phone: phone!,
      sector: input.sector as Sector,
      ...(link ? { link } : {}),
    },
  };
}

/**
 * Escape text for Telegram's MarkdownV2 so a lead's own name or link can't
 * break out of the message and inject formatting or a fake link.
 */
export function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (ch) => `\\${ch}`);
}
