// Online-presence scan (plan §5.3). Two halves live here:
//   - URL safety: what the Worker is allowed to fetch (anti-SSRF, plan §13)
//   - scoring: turning page signals + questionnaire answers into a 0–100 card
// Both are pure and unit-tested; the Worker only does the fetching.

// ---------------------------------------------------------------- URL safety

/** Hosts that must never be fetched — loopback, link-local, and internal TLDs. */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
]);

const BLOCKED_TLDS = ['.local', '.internal', '.localhost', '.home.arpa'];

function isPrivateIPv4(host: string): boolean {
  const parts = host.split('.');
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums as [number, number, number, number];
  return (
    a === 0 || // "this" network
    a === 10 || // private
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local (incl. cloud metadata 169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    a >= 224 // multicast / reserved
  );
}

function isPrivateIPv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase();
  return (
    h === '::' ||
    h === '::1' || // loopback
    h.startsWith('fc') || // unique local
    h.startsWith('fd') || // unique local
    h.startsWith('fe80') || // link-local
    h.startsWith('::ffff:') // IPv4-mapped — would smuggle a private v4
  );
}

export type UrlRejection =
  | 'invalid'
  | 'scheme'
  | 'private-host'
  | 'has-credentials'
  | 'non-standard-port';

export type UrlCheck =
  | { ok: true; url: string; hostname: string }
  | { ok: false; reason: UrlRejection };

/**
 * Decide whether a user-supplied site URL may be fetched (plan §13: GET only,
 * short timeout, internal/local hosts blocked). Rejects anything that could be
 * used to reach infrastructure the visitor shouldn't be able to probe.
 */
export function checkScanUrl(input: string): UrlCheck {
  const trimmed = input.trim();
  // Only assume https when the input carries no scheme at all. Prepending it
  // blindly would turn "file:///etc/passwd" into a URL we'd judge on the wrong
  // grounds instead of rejecting the scheme outright.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);

  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, reason: 'scheme' };
  }
  // Credentials in the URL are a redirect/confusion vector; never follow them.
  if (url.username || url.password) {
    return { ok: false, reason: 'has-credentials' };
  }
  // Only the standard web ports — no probing of internal services on odd ports.
  if (url.port !== '' && url.port !== '80' && url.port !== '443') {
    return { ok: false, reason: 'non-standard-port' };
  }

  const host = url.hostname.toLowerCase();
  if (
    BLOCKED_HOSTNAMES.has(host) ||
    BLOCKED_TLDS.some((tld) => host.endsWith(tld)) ||
    !host.includes('.') || // bare hostnames resolve on internal networks
    isPrivateIPv4(host) ||
    isPrivateIPv6(host)
  ) {
    return { ok: false, reason: 'private-host' };
  }

  return { ok: true, url: url.toString(), hostname: host };
}

// ------------------------------------------------------------------ scoring

/** Answers to the five short questions (plan §5.3). */
export interface AuditAnswers {
  hasOnlineCatalog: boolean;
  hasOnlinePayment: boolean;
  hasCustomerDatabase: boolean;
  /** Typical first-reply time. */
  replySpeed: 'minutes' | 'hours' | 'day-plus';
  /** Where sales actually come from today. */
  salesChannel: 'website' | 'social' | 'phone' | 'in-person';
}

/** Signals extracted from the page, when a URL was given and fetched. */
export interface PageSignals {
  reachable: boolean;
  hasCart: boolean;
  hasPaymentHint: boolean;
  isMobileFriendly: boolean;
  hasContactChannel: boolean;
  /** Transferred bytes — a rough weight/speed proxy. */
  sizeKb: number;
}

export interface AuditWin {
  id: string;
  /** Points recovered by fixing this — used to rank the quickest wins. */
  points: number;
}

export interface AuditScore {
  score: number;
  wins: AuditWin[];
  /** True when scoring used questionnaire answers only (no site given). */
  questionnaireOnly: boolean;
}

// Weights sum to 100 so the score is directly a percentage.
const WEIGHTS = {
  site: 20,
  catalog: 18,
  payment: 18,
  reply: 16,
  database: 14,
  mobile: 8,
  contact: 6,
} as const;

/**
 * Score the business's online presence out of 100 and rank the three quickest
 * wins. Every point is earned by something observable — an answer or a page
 * signal — so the number is explainable, not invented (plan §15).
 */
export function scoreAudit(
  answers: AuditAnswers,
  signals: PageSignals | null,
): AuditScore {
  const gaps: AuditWin[] = [];
  let score = 0;

  // A reachable site is the foundation; without one, those points are the
  // single biggest win available.
  if (signals?.reachable) {
    score += WEIGHTS.site;
  } else {
    gaps.push({ id: 'site', points: WEIGHTS.site });
  }

  const catalogOk = answers.hasOnlineCatalog || signals?.hasCart === true;
  if (catalogOk) score += WEIGHTS.catalog;
  else gaps.push({ id: 'catalog', points: WEIGHTS.catalog });

  const paymentOk = answers.hasOnlinePayment || signals?.hasPaymentHint === true;
  if (paymentOk) score += WEIGHTS.payment;
  else gaps.push({ id: 'payment', points: WEIGHTS.payment });

  // Reply speed is scored on a curve — slow replies are the leak the whole
  // site is about.
  if (answers.replySpeed === 'minutes') score += WEIGHTS.reply;
  else if (answers.replySpeed === 'hours') {
    score += Math.round(WEIGHTS.reply / 2);
    gaps.push({ id: 'reply', points: Math.round(WEIGHTS.reply / 2) });
  } else gaps.push({ id: 'reply', points: WEIGHTS.reply });

  if (answers.hasCustomerDatabase) score += WEIGHTS.database;
  else gaps.push({ id: 'database', points: WEIGHTS.database });

  // Page-only signals: award them when there's no site to measure, so a
  // business without a website isn't double-penalized for the same gap.
  if (signals) {
    if (signals.isMobileFriendly) score += WEIGHTS.mobile;
    else gaps.push({ id: 'mobile', points: WEIGHTS.mobile });

    if (signals.hasContactChannel) score += WEIGHTS.contact;
    else gaps.push({ id: 'contact', points: WEIGHTS.contact });
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    // Quickest wins = biggest point recovery first.
    wins: gaps.sort((a, b) => b.points - a.points).slice(0, 3),
    questionnaireOnly: signals === null,
  };
}
