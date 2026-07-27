import type { ReactNode } from 'react';

// Passthrough root layout. The real <html>/<body> is rendered per-locale in
// app/[locale]/layout.tsx; this exists so Next has a root layout for the
// global not-found without wrapping it in locale-scoped providers.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
