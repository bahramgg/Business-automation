import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware wrappers around Next navigation APIs. The language switch uses
// these so it keeps the user on the same page (plan §9).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
