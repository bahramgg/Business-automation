# CLAUDE.md — AFA site

Bilingual (fa/en) **single-page introduction site** for AFA, which automates
repetitive business processes. `docs/afa-services-site-plan-fa.md` is the
original plan and is now largely superseded — where it and this file disagree,
this file wins.

## What the site is

An introduction, nothing more. One page, six sections, in this order:

1. **Hero** — what the service is, and two actions: book a call, or see the tool.
2. **Service** — what we actually do, in four concrete things.
3. **Benefits** — what changes for the business.
4. **Work** — three short before/after examples. No metrics we cannot source.
5. **Impact tool** — the site's *only* tool. Four sliders from the visitor's own
   business → hours freed, working days returned, requests recovered. This is
   how a visitor understands what the service does for them.
6. **Contact form** — at the end. Nothing earlier asks for details.

There are no other routes: no services pages, no tools index, no case-study pages,
no terms/FAQ/deliverables pages. Don't add them back without being asked.

## Tone

Formal Persian, second-person plural («شما», «کنید»). No colloquialism, no
«تو». English is a rewrite: shorter, technical, no Persian courtesies.

## Design

Minimal and quiet. The brand gradient is reserved for the primary action —
no gradient headlines, no icon cards, no glow. Type hierarchy, generous
spacing, and hairline borders carry the page. No scroll-reveal animation: it
left below-fold sections invisible in print and full-page captures.

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
