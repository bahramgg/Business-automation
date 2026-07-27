// Builds a single self-contained HTML preview of the real site.
//
// It renders the actual pages, then inlines the real stylesheet and the
// self-hosted fonts as data URIs so the file works with no network at all
// (the Artifact CSP blocks every external host). Next's own scripts are
// stripped — they can't run standalone — and replaced with a small vanilla
// shim that keeps the page switcher, timeline tabs, and ROI sliders live.
//
// Usage: node scripts/build-preview.mjs <origin> <out.html>

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.argv[2] ?? 'http://localhost:3271';
const outPath = process.argv[3] ?? resolve(root, 'preview.html');

const PAGES = [
  { id: 'home', label: 'خانه', path: '/fa' },
  { id: 'services', label: 'خدمات', path: '/fa/services' },
  { id: 'assistant', label: 'دستیار', path: '/fa/services/assistant' },
  { id: 'roi', label: 'ابزار ROI', path: '/fa/tools/roi' },
  { id: 'scope', label: 'پیکربند', path: '/fa/tools/scope' },
  { id: 'work', label: 'نمونه‌کار', path: '/fa/work' },
  { id: 'terms', label: 'شرایط', path: '/fa/terms' },
  { id: 'en', label: 'EN', path: '/en' },
];

const FONTS = [
  'vazirmatn-400.woff2',
  'vazirmatn-600.woff2',
  'vazirmatn-800.woff2',
  'vazirmatn-latin-400.woff2',
  'vazirmatn-latin-600.woff2',
  'manrope-400.woff2',
  'manrope-600.woff2',
  'manrope-800.woff2',
  'inter-400.woff2',
  'inter-600.woff2',
];

async function get(path) {
  const res = await fetch(origin + path);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.text();
}

// --- stylesheet, with font URLs swapped for data URIs -----------------------
const homeHtml = await get(PAGES[0].path);
const cssHref = homeHtml.match(/\/_next\/static\/css\/[^"]+\.css/)?.[0];
if (!cssHref) throw new Error('stylesheet not found in rendered HTML');
let css = await get(cssHref);

for (const file of FONTS) {
  const buf = await readFile(resolve(root, 'public/fonts', file));
  const dataUri = `data:font/woff2;base64,${buf.toString('base64')}`;
  css = css.replaceAll(`/fonts/${file}`, dataUri);
}

// --- page bodies -----------------------------------------------------------
const sections = [];
for (const page of PAGES) {
  const html = await get(page.path);
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
  const cleaned = body
    // Next's runtime can't work standalone; drop every script it injected.
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<template[\s\S]*?<\/template>/g, '')
    .replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, '');
  const dir = page.path.startsWith('/en') ? 'ltr' : 'rtl';
  const lang = page.path.startsWith('/en') ? 'en' : 'fa';
  sections.push(
    `<section class="pv-page" data-page="${page.id}" lang="${lang}" dir="${dir}" hidden>${cleaned}</section>`,
  );
}

const switcher = PAGES.map(
  (p, i) =>
    `<button type="button" class="pv-tab${i === 0 ? ' is-active' : ''}" data-target="${p.id}">${p.label}</button>`,
).join('');

const out = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AFA — پیش‌نمایش سایت</title>
<style>
${css}

/* ---- preview chrome (not part of the site) ---- */
.pv-bar{position:fixed;inset-block-start:0;inset-inline:0;z-index:100;display:flex;gap:.4rem;
  align-items:center;flex-wrap:wrap;padding:.5rem .75rem;background:#05061a;
  border-block-end:1px solid #2b3058;font-family:'Vazirmatn',system-ui,sans-serif}
.pv-bar .pv-label{margin-inline-end:.5rem;font-size:11px;letter-spacing:.08em;
  text-transform:uppercase;color:#7c88be}
.pv-tab{padding:.3rem .7rem;border-radius:999px;border:1px solid #1e2652;background:transparent;
  color:#aeb8e6;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.pv-tab:hover{color:#eef1ff}
.pv-tab.is-active{background:linear-gradient(100deg,#4d69ff,#916dff);color:#fff;border-color:#2b3058}
.pv-tab:focus-visible{outline:2px solid #a78bfa;outline-offset:2px}
.pv-shell{padding-block-start:2.9rem}
.pv-page[hidden]{display:none}
/* The real header is sticky; keep it below the preview bar. */
.pv-shell header.sticky{top:3.3rem}
@media (max-width:640px){.pv-shell header.sticky{top:4.6rem}.pv-shell{padding-block-start:4.2rem}}
</style>
</head>
<body>
<nav class="pv-bar" aria-label="صفحه‌های پیش‌نمایش">
  <span class="pv-label">AFA preview</span>
  ${switcher}
</nav>
<div class="pv-shell">
${sections.join('\n')}
</div>
<script>
(function () {
  // --- page switcher -------------------------------------------------------
  var pages = document.querySelectorAll('.pv-page');
  var tabs = document.querySelectorAll('.pv-tab');
  function show(id) {
    pages.forEach(function (p) { p.hidden = p.dataset.page !== id; });
    tabs.forEach(function (t) { t.classList.toggle('is-active', t.dataset.target === id); });
    document.documentElement.dir = document.querySelector('.pv-page:not([hidden])').dir;
    document.documentElement.lang = document.querySelector('.pv-page:not([hidden])').lang;
    window.scrollTo(0, 0);
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.target); }); });
  show('home');

  // --- timeline tabs (the real component's markup, re-driven) --------------
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabEls = list.querySelectorAll('[role="tab"]');
    tabEls.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var root = list.closest('section') || document;
        tabEls.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
        root.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
          panel.hidden = panel.id !== tab.getAttribute('aria-controls');
        });
      });
    });
  });

  // --- ROI sliders ---------------------------------------------------------
  // Mirrors src/lib/roi.ts so the preview computes the same numbers.
  var fa = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
  document.querySelectorAll('.pv-page').forEach(function (page) {
    var ranges = page.querySelectorAll('input[type="range"]');
    if (ranges.length !== 4) return;
    // Scope the outputs to the calculator's own grid. Querying the whole page
    // would also match the hero headline, which uses the same gradient class.
    var calc = ranges[0].closest('.grid') || page;
    var outs = calc.querySelectorAll('.text-gradient, .text-2xl');
    function render() {
      var v = Array.prototype.map.call(ranges, function (r) { return Number(r.value); });
      // Each slider shows its own value next to its label.
      ranges.forEach(function (r) {
        var badge = r.previousElementSibling && r.previousElementSibling.lastElementChild;
        if (!badge) return;
        var n = Number(r.value);
        var max = Number(r.max);
        badge.textContent = max === 100 ? fa.format(n) + '٪'
          : max > 100000 ? fa.format(n) + ' تومان'
          : fa.format(n);
      });
      var messages = v[0], answered = v[1], value = v[2], conv = v[3];
      var unanswered = messages * (1 - answered / 100);
      var orders = Math.round(unanswered * (conv / 100));
      var lost = Math.round(orders * value);
      var hours = Math.round((messages * 3) / 60);
      if (outs[0]) outs[0].textContent = fa.format(lost);
      if (outs[1]) outs[1].textContent = fa.format(orders);
      if (outs[2]) outs[2].textContent = fa.format(hours);
    }
    ranges.forEach(function (r) { r.addEventListener('input', render); });
    render();
  });
})();
</script>
</body>
</html>`;

await writeFile(outPath, out);
const kb = (out.length / 1024).toFixed(0);
console.log(`✓ ${outPath} — ${kb}KB, ${PAGES.length} pages inlined`);
