import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Handles locale detection and the / → /fa redirect (plan §3).
export default createMiddleware(routing);

export const config = {
  // Match all paths except Next internals, API routes, and static assets.
  matcher: ['/((?!api|_next|_vercel|fonts|.*\\..*).*)'],
};
