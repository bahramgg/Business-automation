import type { AbstractIntlMessages } from 'next-intl';

// Message namespaces that must reach the browser.
//
// Server components read messages during render, so their strings never need
// to ship. Only namespaces used by 'use client' components go into the client
// provider — otherwise the whole catalog is serialized into every page's HTML
// (plan §14 performance budget).
//
// test/client-messages.test.ts scans the client components and fails if this
// list misses one, so trimming stays safe as the site grows.
export const clientNamespaces = [
  'Nav', // site-header.tsx
  'LocaleSwitch', // locale-switch.tsx
  'Demo', // live-demo.tsx
  'Roi', // roi-calculator.tsx
  'Timeline', // timeline.tsx
  'Repeat', // repeat-calculator.tsx
  'Audit', // audit-scan.tsx
  'Scope', // scope-builder.tsx
  'Contact', // lead-form.tsx
  'Readiness', // readiness-check.tsx
  'Domains', // readiness-check.tsx (domain names in the result)
  'Workload', // workload-calculator.tsx
] as const;

/** Narrow a full catalog down to the namespaces the client actually needs. */
export function pickClientMessages(
  messages: AbstractIntlMessages,
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const namespace of clientNamespaces) {
    const value = messages[namespace];
    if (value !== undefined) {
      picked[namespace] = value;
    }
  }
  return picked;
}
