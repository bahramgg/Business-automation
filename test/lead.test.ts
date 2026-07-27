import { describe, expect, it } from 'vitest';
import {
  validateLead,
  normalizePhone,
  escapeTelegramMarkdown,
  MIN_FILL_MS,
  type LeadInput,
} from '@/lib/lead';

const valid: LeadInput = {
  name: 'مریم رضایی',
  phone: '09121234567',
  sector: 'retail',
  elapsedMs: 10_000,
};

describe('normalizePhone', () => {
  it.each([
    ['plain national', '09121234567'],
    ['spaces', '0912 123 4567'],
    ['dashes', '0912-123-4567'],
    ['+98', '+989121234567'],
    ['0098', '00989121234567'],
    ['98 prefix', '989121234567'],
    ['bare 9…', '9121234567'],
    ['persian digits', '۰۹۱۲۱۲۳۴۵۶۷'],
    ['arabic-indic digits', '٠٩١٢١٢٣٤٥٦٧'],
  ])('normalizes %s to 09xxxxxxxxx', (_label, input) => {
    expect(normalizePhone(input)).toBe('09121234567');
  });

  it.each([
    ['too short', '0912123'],
    ['too long', '091212345678'],
    ['landline', '02188776655'],
    ['letters', 'not a phone'],
    ['empty', ''],
  ])('rejects %s', (_label, input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe('validateLead', () => {
  it('accepts a minimal valid lead', () => {
    const result = validateLead(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lead.phone).toBe('09121234567');
      expect(result.lead.link).toBeUndefined();
    }
  });

  it('normalizes the phone on the way through', () => {
    const result = validateLead({ ...valid, phone: '+98 912 123 4567' });
    expect(result.ok && result.lead.phone).toBe('09121234567');
  });

  it('flags each bad field', () => {
    const result = validateLead({
      ...valid,
      name: 'x',
      phone: 'nope',
      sector: 'not-a-sector',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors).toEqual(
        expect.arrayContaining(['name', 'phone', 'sector']),
      );
    }
  });

  it('accepts an optional bare-domain link and normalizes it', () => {
    const result = validateLead({ ...valid, link: 'instagram.com/shop' });
    expect(result.ok && result.lead.link?.startsWith('https://')).toBe(true);
  });

  it('rejects a javascript: link rather than passing it to an admin', () => {
    // eslint-disable-next-line no-script-url
    const result = validateLead({ ...valid, link: 'javascript:alert(1)' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors).toContain('link');
  });

  it('silently rejects a filled honeypot', () => {
    const result = validateLead({ ...valid, company: 'bot inc' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection).toBe('honeypot');
      // No field errors — a bot learns nothing about why it failed.
      expect(result.fieldErrors).toEqual([]);
    }
  });

  it('rejects a submission faster than a human could type', () => {
    const result = validateLead({ ...valid, elapsedMs: MIN_FILL_MS - 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rejection).toBe('too-fast');
  });

  // Regression: bot checks used to run before field validation, so a person who
  // clicked Send on an empty form got a fake success screen and lost their lead.
  it('shows field errors, not a silent success, when a fast submit is empty', () => {
    const result = validateLead({
      name: '',
      phone: '',
      sector: '',
      elapsedMs: 10,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection).toBeUndefined();
      expect(result.fieldErrors).toEqual(
        expect.arrayContaining(['name', 'phone', 'sector']),
      );
    }
  });

  it('still flags bad fields even when the honeypot is filled', () => {
    const result = validateLead({ ...valid, name: '', company: 'bot inc' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors).toContain('name');
  });

  it('accepts a submission without timing information', () => {
    const { elapsedMs: _omitted, ...withoutTiming } = valid;
    expect(validateLead(withoutTiming).ok).toBe(true);
  });

  it('rejects an over-long name', () => {
    const result = validateLead({ ...valid, name: 'a'.repeat(200) });
    expect(result.ok).toBe(false);
  });
});

describe('escapeTelegramMarkdown', () => {
  it('escapes characters that would break out of a message', () => {
    expect(escapeTelegramMarkdown('a_b*c[d](e)')).toBe('a\\_b\\*c\\[d\\]\\(e\\)');
  });

  it('neutralizes a name crafted to inject a fake link', () => {
    const escaped = escapeTelegramMarkdown('[click me](https://evil.example)');
    // No bracket or paren survives unescaped, so Telegram renders it as text.
    expect(escaped).not.toMatch(/(?<!\\)[[\]()]/);
    expect(escaped).toContain('\\[');
  });

  it('leaves ordinary Persian text readable', () => {
    expect(escapeTelegramMarkdown('مریم رضایی')).toBe('مریم رضایی');
  });
});
