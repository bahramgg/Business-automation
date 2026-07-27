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

## Roadmap

Built in phases (plan §16). **Phase 1 (this commit): foundation** — project
skeleton, design tokens, self-hosted fonts, bilingual layout, glass header +
dark footer + language switch, home hero. Next: Phase 2 (full home), 2.5
(service page template), 3 (ROI calculator), 4 (live assistant demo), …
