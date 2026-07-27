// Lead intake Worker (plan §12, §13).
//
// Path: form → Worker → validate + honeypot + rate-limit → D1 → instant
// Telegram message to the admin. The bot token and chat id are Worker secrets
// and never reach the browser.
//
// Deploy:
//   cd workers/lead-intake
//   npx wrangler d1 create afa-leads          # paste id into wrangler.toml
//   npx wrangler d1 execute afa-leads --file=./schema.sql --remote
//   npx wrangler secret put TELEGRAM_BOT_TOKEN
//   npx wrangler secret put TELEGRAM_CHAT_ID
//   npx wrangler deploy

import { validateLead, escapeTelegramMarkdown } from '../../../src/lib/lead';

export interface Env {
  LEADS: D1Database;
  LEAD_RATELIMIT: KVNamespace;
  /** Secrets — set with `wrangler secret put`. */
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ALLOWED_ORIGINS?: string;
}

const MAX_LEADS_PER_IP_PER_DAY = 5;

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

/** Fire the admin notification. Never let its failure lose a stored lead. */
async function notifyTelegram(
  env: Env,
  lead: { name: string; phone: string; sector: string; link?: string },
): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  // Every interpolated value is lead-controlled, so all of it is escaped.
  const e = escapeTelegramMarkdown;
  const lines = [
    '*سرنخ جدید*',
    `نام: ${e(lead.name)}`,
    `تماس: ${e(lead.phone)}`,
    `صنف: ${e(lead.sector)}`,
    ...(lead.link ? [`لینک: ${e(lead.link)}`] : []),
  ];

  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: lines.join('\n'),
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cors = corsHeaders(request.headers.get('Origin'), env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, cors);
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'bad_request' }, 400, cors);
    }

    const result = validateLead({
      name: String(payload.name ?? ''),
      phone: String(payload.phone ?? ''),
      sector: String(payload.sector ?? ''),
      link: payload.link ? String(payload.link) : undefined,
      company: payload.company ? String(payload.company) : undefined,
      elapsedMs: typeof payload.elapsedMs === 'number' ? payload.elapsedMs : undefined,
    });

    if (!result.ok) {
      // Bots get the same 200 a human gets — no signal about why they failed.
      if (result.rejection) return json({ ok: true }, 200, cors);
      return json({ error: 'invalid', fields: result.fieldErrors }, 400, cors);
    }

    // Per-IP daily cap so one source can't flood the admin's Telegram.
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const key = `lead:${ip}:${new Date().toISOString().slice(0, 10)}`;
    const count = Number((await env.LEAD_RATELIMIT.get(key)) ?? '0') + 1;
    await env.LEAD_RATELIMIT.put(key, String(count), { expirationTtl: 86_400 });
    if (count > MAX_LEADS_PER_IP_PER_DAY) {
      return json({ error: 'rate_limited' }, 429, cors);
    }

    const { lead } = result;

    // Store first: a lost Telegram message is recoverable, a lost lead is not.
    try {
      await env.LEADS.prepare(
        `INSERT INTO leads (name, phone, sector, link, created_at, source_ip)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
        .bind(lead.name, lead.phone, lead.sector, lead.link ?? null, new Date().toISOString(), ip)
        .run();
    } catch {
      return json({ error: 'storage' }, 500, cors);
    }

    // Notify without blocking the response — the visitor shouldn't wait on
    // Telegram, and a Telegram outage must not fail a stored lead.
    ctx.waitUntil(notifyTelegram(env, lead).catch(() => undefined));

    return json({ ok: true }, 200, cors);
  },
};
