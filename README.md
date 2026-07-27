# AFA — introduction site

Bilingual (Persian/English) single-page introduction site for **AFA**, which
automates repetitive business processes. Deep-navy design language shared with
`afa-pay`.

> Original plan (largely superseded): [`docs/afa-services-site-plan-fa.md`](docs/afa-services-site-plan-fa.md)
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

Renders the page in both locales, inlines the stylesheet and the self-hosted
fonts as data URIs, and drops Next's runtime. The result opens offline in any
browser — useful for sharing the design before there's a deployment.

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

## Scope

A single introduction page per locale: what the service is, what changes,
one tool that estimates the result from the visitor's own numbers, and the
contact form. The lead-intake Worker is the only backend.
