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

## Roadmap

Built in phases (plan §16). **Phase 1 (this commit): foundation** — project
skeleton, design tokens, self-hosted fonts, bilingual layout, glass header +
dark footer + language switch, home hero. Next: Phase 2 (full home), 2.5
(service page template), 3 (ROI calculator), 4 (live assistant demo), …
