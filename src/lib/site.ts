// Canonical site origin, used by sitemap/robots/OG. Overridable per
// environment; the fallback keeps local builds deterministic.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afa.example'
).replace(/\/$/, '');
