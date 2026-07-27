// Service ↔ tool ownership (plan §5). One service = one tool. The tool slug is
// the /tools/[slug] route the compact tool block links to for its full version.
export const serviceSlugs = ['website', 'assistant', 'automation'] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export const serviceToolSlug: Record<ServiceSlug, string> = {
  website: 'audit',
  assistant: 'demo',
  // The repeat-customer calculator is the ROI calculator's sibling (plan §5.5),
  // on its own route so no page renders two tools at once.
  automation: 'repeat',
};

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
