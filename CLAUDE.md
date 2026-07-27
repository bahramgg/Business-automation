# CLAUDE.md — AFA site

Bilingual (fa/en) site for **AFA**, which automates a business as a system.
The product plan lives in `docs/afa-services-site-plan-fa.md`; where this file
and the plan disagree, this file wins — the positioning was revised after the
plan was written.

## Positioning (revised)

AFA sells **business-system automation across four domains**, not a sales
assistant. Sales is one domain of four. Never write copy that reduces the offer
to answering messages.

| # | Domain | Route | Its tool |
|---|---|---|---|
| 01 | جذب / Acquisition | `/services/acquisition` | online-presence scan |
| 02 | فروش و پاسخ‌گویی / Sales & response | `/services/sales` | lost-sales calculator (live demo linked, not embedded) |
| 03 | عملیات / Operations | `/services/operations` | repetitive-work calculator |
| 04 | داده و گزارش / Data & reporting | `/services/data` | repeat-customer calculator |

Entry tool: **automation-readiness assessment** (`/tools/readiness`, and on the
home page). Its output is a routing decision — one named domain to start from.
Closing tool: **scope configurator** (`/tools/scope`).

The visitor's path is stated once, up front: **assess → measure that domain →
scope**. One domain = one page = one tool; a page never shows two tools.

## Tone

Formal Persian, second-person plural («شما», «کنید»). No colloquialism, no
«تو». English is a rewrite: shorter, technical, no Persian courtesies.

## Design

Minimal and quiet. The brand gradient is reserved for the primary action —
no gradient headlines. Prefer type hierarchy, generous spacing, and hairline
borders over cards-with-glow. No scroll-reveal animation: it left below-fold
sections invisible in print and full-page captures.

## Non-negotiable rules

- **TypeScript strict. No `any`.** (enforced by ESLint)
- **All color/spacing come from `src/styles/tokens.css`.** No hardcoded hex in
  components — use the mapped Tailwind utilities (`bg-bg-950`, `text-ink`,
  `shadow-brand`, `rounded-card`, …) or the `--*` variables.
- **Logical CSS only.** Use `ms-/me-/ps-/pe-/start-/end-`; `ml-/mr-/pl-/pr-/
  left-/right-` are banned by ESLint so the site mirrors cleanly in RTL.
- **No literal strings in JSX.** Every user-facing string comes from
  `messages/{locale}.json`. Keep `fa.json` and `en.json` key sets identical
  (a test enforces this).
- **Each tool = one standalone component** with typed props + a unit test for
  its calculation logic (plan §5).
- **Secrets only in Workers** (`wrangler secret`); never in the client bundle.
  If a model key is ever visible client-side, the build must fail.
- **No Google Fonts, no external CDN.** Fonts are self-hosted in
  `public/fonts` (synced by `scripts/sync-fonts.mjs`).
- **No unsourced numbers.** Estimates are labeled "تخمینی/estimated". The live
  signal bar is removed when there's no real data — never fabricate a metric.
- **EN is a rewrite, not a translation.** Shorter, technical, no Persian
  courtesies (plan §15).

## Stack

- Next.js 15 (App Router) + TypeScript, Tailwind v4 (CSS tokens), next-intl
  (`[locale]`, fa=RTL default, en=LTR), MDX content, Cloudflare
  Workers/Pages/KV/D1 for the dynamic bits. Vercel is intentionally avoided
  (access from Iran). See plan §10.

## Layout

- `src/app/[locale]/` — routes. The `[locale]/layout.tsx` renders `<html>`.
- `src/components/{ui,layout,sections,tools}/` — see plan §11.
- `src/i18n/` — routing, navigation, request config.
- `src/styles/` — `tokens.css` (source of truth), `fonts.css`, `globals.css`.
- `messages/{fa,en}.json` — all UI strings.
- `content/{fa,en}/work/*.mdx` — case studies.
- `workers/` — Cloudflare Workers (demo proxy, audit scan, lead intake).

## Commands

- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` · `npm run typecheck` · `npm test`
- `npm run fonts:sync` — refresh self-hosted fonts from @fontsource.

## Tools ↔ ownership (plan §5 — the anti-confusion spine)

| Tool | Home | Route | Service |
|---|---|---|---|
| Lost-sales calculator | ✅ (start) | `/tools/roi` | — |
| Online-presence scan | | `/tools/audit` | website |
| Live assistant demo | | `/tools/demo` | assistant |
| Repeat-customer calculator | | `/tools/roi` (sibling) | automation |
| Package configurator | | `/tools/scope` | (closer) |

One service = one tool. Never render two tools at once on a page.
