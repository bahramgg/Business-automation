# AFA — services site

Bilingual (Persian/English) marketing + interactive-tools site for **AFA**, a
sales-system builder. Deep-navy design language shared with `afa-pay`.

> Full product plan: [`docs/afa-services-site-plan-fa.md`](docs/afa-services-site-plan-fa.md)
> Agent working rules: [`CLAUDE.md`](CLAUDE.md)

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind v4 (CSS tokens) ·
next-intl (`[locale]`, `fa` RTL default / `en` LTR) · self-hosted fonts ·
Cloudflare Workers/Pages for the dynamic bits. No Vercel, no Google Fonts, no
external CDN (access + speed from Iran).

## Getting started

```bash
npm install
npm run fonts:sync   # copy self-hosted woff2 into public/fonts
npm run dev          # http://localhost:3000 → redirects to /fa
```

`/` → `/fa` (Persian, RTL). `/en` is the English (LTR) rewrite. The language
switch keeps you on the same page.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint (bans physical CSS `ml-/mr-/…`, `any`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (routing, message-key parity, utils) |
| `npm run fonts:sync` | Refresh self-hosted fonts from @fontsource |
| `npm run preview:html` | Bundle the running site into one self-contained HTML file |

## Single-file preview

```bash
npm run build && npm run start          # in one shell
npm run preview:html http://localhost:3000 preview.html
```

Renders eight real pages, inlines the stylesheet and the self-hosted fonts as
data URIs, and drops Next's runtime for a small shim that keeps the page
switcher, timeline tabs, and ROI sliders live. The result opens offline in any
browser — useful for sharing the design before there's a deployment.

## Assistant demo (Cloudflare Worker)

The live demo on `/services/assistant` and `/tools/demo` works **with no
backend**: without a configured endpoint it answers from the scripted fallback
in `src/lib/demo/fallback.ts`, so the page is never broken and never shows a
service error.

To connect the real model, deploy the proxy in `workers/demo-proxy`:

```bash
cd workers/demo-proxy
npx wrangler kv namespace create DEMO_RATELIMIT   # paste the id into wrangler.toml
npx wrangler secret put OPENROUTER_API_KEY        # secret — never committed
npx wrangler deploy
```

Then point the site at it (the URL is public; the key is not):

```bash
# .env.local
NEXT_PUBLIC_DEMO_ENDPOINT=https://afa-demo-proxy.<subdomain>.workers.dev
```

Safety rails, all enforced Worker-side: model key only in the Worker, per
session (10) and per IP/hour (30) rate limits in KV, a response-token ceiling,
untrusted user text fenced and never followed as instructions, and a global
kill-switch (`DEMO_ENABLED=off`) that pushes every client back to the scripted
fallback. `npm test` runs the injection suite; `npm run build` fails if any
secret-shaped string reaches the client bundle.

## Online-presence scan (Cloudflare Worker)

The scan on `/services/website` and `/tools/audit` scores the questionnaire with
no backend; adding a site URL enriches it with page signals via a second Worker.

```bash
cd workers/audit-scan
npx wrangler kv namespace create SCAN_RATELIMIT   # paste the id into wrangler.toml
npx wrangler deploy
# then: NEXT_PUBLIC_SCAN_ENDPOINT=https://afa-audit-scan.<subdomain>.workers.dev
```

Anti-SSRF is enforced in `src/lib/audit/scan.ts` and covered by 25 rejection
tests: loopback, private and link-local ranges (including cloud metadata),
IPv4-mapped IPv6, internal TLDs, bare hostnames, non-http schemes, embedded
credentials, and non-standard ports. The Worker fetches GET-only, does not
follow redirects, times out fast, and caps how much it reads.

## Lead intake (Cloudflare Worker + D1 + Telegram)

The contact form validates locally and posts to a Worker that stores the lead in
D1 and pings the admin on Telegram.

```bash
cd workers/lead-intake
npx wrangler d1 create afa-leads                              # id → wrangler.toml
npx wrangler d1 execute afa-leads --file=./schema.sql --remote
npx wrangler kv namespace create LEAD_RATELIMIT               # id → wrangler.toml
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler deploy
# then: NEXT_PUBLIC_LEAD_ENDPOINT=https://afa-lead-intake.<subdomain>.workers.dev
```

Without the endpoint the form validates and then says plainly that it isn't
connected — it never fakes a successful send. Anti-abuse is a honeypot, a
fill-time check, and a per-IP daily cap; no CAPTCHA. Lead text is escaped before
it reaches Telegram so a crafted name can't inject formatting or a fake link.

Set `NEXT_PUBLIC_SITE_URL` for correct canonical, hreflang, OG, and sitemap URLs.

## Roadmap

All nine phases from plan §16 are built: foundation, home, the service-page
template and tool block, all five interactive tools, case studies, deliverables
and terms, lead capture with D1 + Telegram, SEO, and final polish.

What still needs a real deployment to verify: the Cloudflare Workers (assistant
demo, site scan, lead intake) have never run against live infrastructure from
here — the site works without them by design, but the model, D1, and Telegram
paths are unexercised. Lighthouse has not been run.
