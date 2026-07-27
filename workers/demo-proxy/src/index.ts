// Assistant-demo proxy (plan §5.2, §13).
//
// The model API key lives ONLY here, as a Worker secret — it is never shipped
// to the browser. The client posts a vertical + message list; this Worker
// builds the system prompt, fences the untrusted text, enforces rate limits in
// KV, and calls OpenRouter with a cheap model and a hard token ceiling.
//
// Deploy:
//   cd workers/demo-proxy
//   npx wrangler secret put OPENROUTER_API_KEY
//   npx wrangler deploy

import {
  buildSystemPrompt,
  sanitizeUserMessage,
  wrapUserMessage,
  MAX_SESSION_MESSAGES,
  MAX_IP_MESSAGES_PER_HOUR,
  MAX_RESPONSE_TOKENS,
} from '../../../src/lib/demo/prompt';
import { isVerticalId } from '../../../src/lib/demo/verticals';

export interface Env {
  /** Secret — set with `wrangler secret put OPENROUTER_API_KEY`. */
  OPENROUTER_API_KEY: string;
  /** KV namespace used for per-session and per-IP counters. */
  DEMO_RATELIMIT: KVNamespace;
  /** Comma-separated origins allowed to call this Worker. */
  ALLOWED_ORIGINS?: string;
  /** Cheap model id; overridable without a code change. */
  MODEL?: string;
  /** Global kill-switch: set to "off" to force every client into fallback. */
  DEMO_ENABLED?: string;
}

const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const SESSION_TTL_SECONDS = 60 * 60 * 6;
const IP_WINDOW_SECONDS = 60 * 60;
/** Upstream timeout — the client falls back to scripted mode past this. */
const UPSTREAM_TIMEOUT_MS = 12_000;

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowOrigin =
    origin && allowed.includes(origin) ? origin : (allowed[0] ?? '');
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

/** Increment a KV counter within a fixed window; returns the new count. */
async function bump(
  kv: KVNamespace,
  key: string,
  ttlSeconds: number,
): Promise<number> {
  const current = Number((await kv.get(key)) ?? '0');
  const next = current + 1;
  await kv.put(key, String(next), { expirationTtl: ttlSeconds });
  return next;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, cors);
    }

    // Kill-switch — clients treat a 503 as "use the scripted fallback".
    if (env.DEMO_ENABLED === 'off') {
      return json({ error: 'disabled' }, 503, cors);
    }

    let payload: {
      vertical?: unknown;
      locale?: unknown;
      sessionId?: unknown;
      messages?: unknown;
    };
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'bad_request' }, 400, cors);
    }

    const { vertical, locale, sessionId, messages } = payload;
    if (
      !isVerticalId(vertical) ||
      (locale !== 'fa' && locale !== 'en') ||
      typeof sessionId !== 'string' ||
      sessionId.length < 8 ||
      sessionId.length > 64 ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return json({ error: 'bad_request' }, 400, cors);
    }

    // --- Rate limits (plan §5.2): per session and per IP ------------------
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const sessionKey = `s:${sessionId}`;
    const ipKey = `i:${ip}:${Math.floor(Date.now() / (IP_WINDOW_SECONDS * 1000))}`;

    const [sessionCount, ipCount] = await Promise.all([
      bump(env.DEMO_RATELIMIT, sessionKey, SESSION_TTL_SECONDS),
      bump(env.DEMO_RATELIMIT, ipKey, IP_WINDOW_SECONDS),
    ]);

    if (sessionCount > MAX_SESSION_MESSAGES) {
      return json({ error: 'session_limit' }, 429, cors);
    }
    if (ipCount > MAX_IP_MESSAGES_PER_HOUR) {
      return json({ error: 'ip_limit' }, 429, cors);
    }

    // --- Build the request: system prompt + fenced untrusted turns --------
    const history: ChatTurn[] = (messages as ChatTurn[])
      .slice(-8)
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string',
      )
      .map((m) =>
        m.role === 'user'
          ? { role: 'user' as const, content: wrapUserMessage(sanitizeUserMessage(m.content)) }
          : { role: 'assistant' as const, content: m.content.slice(0, 1000) },
      );

    if (history.length === 0) {
      return json({ error: 'bad_request' }, 400, cors);
    }

    const body = {
      model: env.MODEL ?? DEFAULT_MODEL,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.4,
      messages: [
        { role: 'system', content: buildSystemPrompt(locale, vertical) },
        ...history,
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!upstream.ok) {
        // Never leak upstream detail; the client silently falls back.
        return json({ error: 'upstream' }, 502, cors);
      }

      const data = (await upstream.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        return json({ error: 'upstream' }, 502, cors);
      }

      return json({ reply, remaining: MAX_SESSION_MESSAGES - sessionCount }, 200, cors);
    } catch {
      return json({ error: 'upstream' }, 502, cors);
    } finally {
      clearTimeout(timeout);
    }
  },
};
