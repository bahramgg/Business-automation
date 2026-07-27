// Business-automation domains — the spine of the site.
//
// AFA automates a business as a system. Sales is one domain of four, not the
// whole story, so the site is organised by domain and every piece of content
// hangs off this list. One domain = one page = one tool (the anti-confusion
// rule), in the order a business actually runs.

export const domainIds = [
  'acquisition', // being found at all
  'sales', // turning interest into a sale, and answering fast enough to keep it
  'operations', // the repetitive internal work that eats the week
  'data', // knowing what happened, and acting on it
] as const;

export type DomainId = (typeof domainIds)[number];

export function isDomainId(value: unknown): value is DomainId {
  return typeof value === 'string' && (domainIds as readonly string[]).includes(value);
}

/** The tool that proves each domain's claim, at /tools/[slug]. */
export const domainToolSlug: Record<DomainId, string> = {
  acquisition: 'audit',
  sales: 'roi',
  operations: 'workload',
  data: 'repeat',
};

/**
 * A secondary proof a domain can point at without putting a second tool on the
 * page. The assistant demo belongs to sales but the sales page already shows
 * the lost-sales calculator, so it is linked rather than embedded.
 */
export const domainSecondaryTool: Partial<Record<DomainId, string>> = {
  sales: 'demo',
};
