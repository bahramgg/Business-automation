import Link from 'next/link';
import '@/styles/globals.css';

// Global fallback for paths the locale middleware never matched. It needs its
// own <html> because it renders outside the [locale] layout. Defaults to FA.
export default function GlobalNotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <main className="grid min-h-dvh place-items-center px-6 text-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-dim">
              404
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-ink">
              صفحه پیدا نشد
            </h1>
            <Link
              href="/fa"
              className="mt-8 inline-flex rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white shadow-brand"
            >
              بازگشت به خانه
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
