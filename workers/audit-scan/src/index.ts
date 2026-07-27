// Online-presence scan Worker (plan §5.3, §13).
//
// Fetches a visitor-supplied URL and extracts coarse signals. Everything that
// decides WHETHER a URL may be fetched lives in lib/audit/scan.ts and is
// unit-tested; this Worker only performs the guarded fetch.
//
// Rails: GET only, URL vetted against the SSRF allowlist, redirects NOT
// followed (a redirect could land on an internal host), short timeout, capped
// response read, and per-IP rate limiting in KV.

import { checkScanUrl, type PageSignals } from '../../../src/lib/audit/scan';

export interface Env {
  SCAN_RATELIMIT: KVNamespace;
  ALLOWED_ORIGINS?: string;
  SCAN_ENABLED?: string;
}

const TIMEOUT_MS = 6_000;
/** Only the first chunk is needed for these signals; caps memory and time. */
const MAX_BYTES = 512 * 1024;
const MAX_SCANS_PER_IP_PER_HOUR = 10;

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowOrigin = origin && allowed.includes(origin) ? origin : (allowed[0] ?? '');
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** Read at most maxBytes of the body, then abort. */
async function readCapped(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let text = '';
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    text += decoder.decode(value, { stream: true });
    if (total >= maxBytes) {
      await reader.cancel();
      break;
    }
  }
  return text;
}

/** Coarse, honest signals — presence checks only, never a quality judgment. */
function extractSignals(html: string, bytes: number): Omit<PageSignals, 'reachable'> {
  const lower = html.toLowerCase();
  return {
    hasCart: /add[-_ ]?to[-_ ]?cart|سبد خرید|افزودن به سبد|\/cart|woocommerce/.test(lower),
    hasPaymentHint:
      /checkout|درگاه پرداخت|پرداخت آنلاین|zarinpal|idpay|nextpay|\/pay\b/.test(lower),
    isMobileFriendly: /<meta[^>]+name=["']viewport["']/.test(lower),
    hasContactChannel:
      /(tel:|wa\.me|whatsapp|t\.me|telegram|instagram\.com|mailto:)/.test(lower),
    sizeKb: Math.round(bytes / 1024),
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request.headers.get('Origin'), env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, cors);
    }
    if (env.SCAN_ENABLED === 'off') {
      return json({ error: 'disabled' }, 503, cors);
    }

    let payload: { url?: unknown };
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'bad_request' }, 400, cors);
    }
    if (typeof payload.url !== 'string' || payload.url.length > 2048) {
      return json({ error: 'bad_request' }, 400, cors);
    }

    // SSRF gate — the single decision point for what may be fetched.
    const check = checkScanUrl(payload.url);
    if (!check.ok) {
      return json({ error: 'url_rejected', reason: check.reason }, 400, cors);
    }

    // Per-IP rate limit: scanning is an outbound fetch we pay for.
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const key = `scan:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
    const count = Number((await env.SCAN_RATELIMIT.get(key)) ?? '0') + 1;
    await env.SCAN_RATELIMIT.put(key, String(count), { expirationTtl: 3600 });
    if (count > MAX_SCANS_PER_IP_PER_HOUR) {
      return json({ error: 'rate_limited' }, 429, cors);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(check.url, {
        method: 'GET',
        // Never follow redirects: a 302 to an internal address would bypass
        // the SSRF check we just performed on the original URL.
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'AFA-site-scan/1.0 (+https://afa.example)' },
      });

      if (response.status >= 300 && response.status < 400) {
        // Treat a redirect as unreachable rather than chasing it.
        return json(
          { signals: { reachable: false, hasCart: false, hasPaymentHint: false, isMobileFriendly: false, hasContactChannel: false, sizeKb: 0 } satisfies PageSignals },
          200,
          cors,
        );
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.includes('text/html')) {
        return json(
          { signals: { reachable: false, hasCart: false, hasPaymentHint: false, isMobileFriendly: false, hasContactChannel: false, sizeKb: 0 } satisfies PageSignals },
          200,
          cors,
        );
      }

      const html = await readCapped(response, MAX_BYTES);
      const signals: PageSignals = {
        reachable: true,
        ...extractSignals(html, new TextEncoder().encode(html).byteLength),
      };
      return json({ signals }, 200, cors);
    } catch {
      // Timeout, DNS failure, refused connection — all "not reachable".
      return json(
        { signals: { reachable: false, hasCart: false, hasPaymentHint: false, isMobileFriendly: false, hasContactChannel: false, sizeKb: 0 } satisfies PageSignals },
        200,
        cors,
      );
    } finally {
      clearTimeout(timeout);
    }
  },
};
