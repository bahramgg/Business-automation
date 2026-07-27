import { describe, expect, it } from 'vitest';
import {
  checkScanUrl,
  scoreAudit,
  type AuditAnswers,
  type PageSignals,
} from '@/lib/audit/scan';

// Anti-SSRF tests (plan §13). The scan fetches a user-supplied URL, so this is
// the boundary that keeps a visitor from probing internal infrastructure.
describe('checkScanUrl — SSRF defense', () => {
  const mustReject = [
    ['loopback name', 'http://localhost/'],
    ['loopback v4', 'http://127.0.0.1/'],
    ['loopback v4 alt', 'https://127.1.2.3/'],
    ['loopback v6', 'http://[::1]/'],
    ['unspecified v6', 'http://[::]/'],
    ['private 10/8', 'http://10.0.0.5/'],
    ['private 192.168', 'https://192.168.1.1/'],
    ['private 172.16', 'http://172.16.0.1/'],
    ['private 172.31', 'http://172.31.255.255/'],
    ['cloud metadata', 'http://169.254.169.254/latest/meta-data/'],
    ['gcp metadata', 'http://metadata.google.internal/'],
    ['CGNAT', 'http://100.64.0.1/'],
    ['this-network', 'http://0.0.0.0/'],
    ['multicast', 'http://224.0.0.1/'],
    ['unique local v6', 'http://[fd00::1]/'],
    ['link-local v6', 'http://[fe80::1]/'],
    ['v4-mapped v6', 'http://[::ffff:127.0.0.1]/'],
    ['.local TLD', 'http://printer.local/'],
    ['.internal TLD', 'https://api.internal/'],
    ['bare hostname', 'http://intranet/'],
    ['file scheme', 'file:///etc/passwd'],
    ['gopher scheme', 'gopher://evil/'],
    ['credentials', 'https://user:pass@example.com/'],
    ['non-standard port', 'http://example.com:8080/'],
    ['ssh port', 'http://example.com:22/'],
  ] as const;

  it.each(mustReject)('rejects %s', (_label, url) => {
    expect(checkScanUrl(url).ok).toBe(false);
  });

  it.each([
    ['https site', 'https://example.com/'],
    ['http site', 'http://example.com/'],
    ['bare domain', 'example.com'],
    ['subdomain + path', 'https://shop.example.com/products?a=1'],
    ['explicit 443', 'https://example.com:443/'],
  ])('allows %s', (_label, url) => {
    expect(checkScanUrl(url).ok).toBe(true);
  });

  it('assumes https for a bare domain', () => {
    const result = checkScanUrl('example.com');
    expect(result.ok && result.url.startsWith('https://')).toBe(true);
  });

  it('reports why a URL was rejected', () => {
    expect(checkScanUrl('http://10.0.0.1/')).toMatchObject({ reason: 'private-host' });
    expect(checkScanUrl('file:///etc/passwd')).toMatchObject({ reason: 'scheme' });
    expect(checkScanUrl('not a url at all')).toMatchObject({ reason: 'invalid' });
    expect(checkScanUrl('https://a:b@example.com/')).toMatchObject({
      reason: 'has-credentials',
    });
    expect(checkScanUrl('https://example.com:9999/')).toMatchObject({
      reason: 'non-standard-port',
    });
  });
});

describe('scoreAudit', () => {
  const weak: AuditAnswers = {
    hasOnlineCatalog: false,
    hasOnlinePayment: false,
    hasCustomerDatabase: false,
    replySpeed: 'day-plus',
    salesChannel: 'social',
  };
  const strong: AuditAnswers = {
    hasOnlineCatalog: true,
    hasOnlinePayment: true,
    hasCustomerDatabase: true,
    replySpeed: 'minutes',
    salesChannel: 'website',
  };
  const goodSignals: PageSignals = {
    reachable: true,
    hasCart: true,
    hasPaymentHint: true,
    isMobileFriendly: true,
    hasContactChannel: true,
    sizeKb: 400,
  };

  it('scores a fully-equipped business at 100', () => {
    expect(scoreAudit(strong, goodSignals).score).toBe(100);
  });

  it('scores a business with nothing at 0', () => {
    const noSignals: PageSignals = {
      reachable: false,
      hasCart: false,
      hasPaymentHint: false,
      isMobileFriendly: false,
      hasContactChannel: false,
      sizeKb: 0,
    };
    expect(scoreAudit(weak, noSignals).score).toBe(0);
  });

  it('always stays within 0–100', () => {
    for (const answers of [weak, strong]) {
      for (const signals of [null, goodSignals]) {
        const { score } = scoreAudit(answers, signals);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('returns at most three wins, biggest first', () => {
    const { wins } = scoreAudit(weak, null);
    expect(wins.length).toBeLessThanOrEqual(3);
    const points = wins.map((w) => w.points);
    expect([...points].sort((a, b) => b - a)).toEqual(points);
  });

  it('names no wins when nothing is missing', () => {
    expect(scoreAudit(strong, goodSignals).wins).toEqual([]);
  });

  it('flags questionnaire-only scoring when no site was scanned', () => {
    expect(scoreAudit(strong, null).questionnaireOnly).toBe(true);
    expect(scoreAudit(strong, goodSignals).questionnaireOnly).toBe(false);
  });

  it('does not penalize page-only signals when there is no site to measure', () => {
    // Without a site, mobile/contact aren't gaps the business can be blamed for
    // twice — they simply aren't scored.
    const { wins } = scoreAudit(strong, null);
    expect(wins.map((w) => w.id)).not.toContain('mobile');
  });

  it('credits a cart on the page even when the answer said no catalog', () => {
    const withCart = scoreAudit({ ...weak, hasOnlineCatalog: false }, goodSignals);
    const withoutCart = scoreAudit(
      { ...weak, hasOnlineCatalog: false },
      { ...goodSignals, hasCart: false },
    );
    expect(withCart.score).toBeGreaterThan(withoutCart.score);
  });

  it('rewards faster replies monotonically', () => {
    const slow = scoreAudit({ ...weak, replySpeed: 'day-plus' }, null).score;
    const mid = scoreAudit({ ...weak, replySpeed: 'hours' }, null).score;
    const fast = scoreAudit({ ...weak, replySpeed: 'minutes' }, null).score;
    expect(slow).toBeLessThan(mid);
    expect(mid).toBeLessThan(fast);
  });
});
