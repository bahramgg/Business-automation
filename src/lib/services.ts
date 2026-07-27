// Service ↔ tool ownership (plan §5). One service = one tool. The tool slug is
// the /tools/[slug] route the compact tool block links to for its full version.
export const serviceSlugs = ['website', 'assistant', 'automation'] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export const serviceToolSlug: Record<ServiceSlug, string> = {
  website: 'audit',
  assistant: 'demo',
  automation: 'roi',
};

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
