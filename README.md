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

## Roadmap

Built in phases (plan §16). **Phases 1–7 are done**: foundation, home, the
service-page template and tool block, all five interactive tools (lost-sales
and repeat-customer calculators, live assistant demo, online-presence scan,
package configurator), case studies, deliverables and terms. Remaining: phase 8
(lead forms + D1 + Telegram + SEO/sitemap) and phase 9 (final polish).
