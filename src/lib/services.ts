// Route-level view of the domain model (src/lib/domains.ts).
//
// The URL segment stays /services/<domain> so the site's public paths don't
// churn, but the vocabulary everywhere else is "domain": the site sells
// business-system automation, of which sales is one domain.
export {
  domainIds as serviceSlugs,
  domainToolSlug as serviceToolSlug,
  domainSecondaryTool,
  isDomainId as isServiceSlug,
  type DomainId as ServiceSlug,
} from './domains';
