// Scripted fallback for the assistant demo (plan §5.2): if the Worker is
// unavailable, the demo silently degrades to pre-written answers instead of
// showing an error. Intent is matched with simple keyword rules — no model,
// no network. Answers are drawn from the same catalog the real prompt uses, so
// the fallback never states a number the catalog doesn't have.

import type { FactKind, VerticalCatalog, VerticalId } from './verticals';
import { getCatalog } from './verticals';

type Intent = 'price' | 'delivery' | 'hours' | 'booking' | 'catalog' | 'other';

const keywords: Record<'fa' | 'en', Record<Exclude<Intent, 'other'>, string[]>> = {
  fa: {
    price: ['قیمت', 'چند', 'هزینه', 'تومان', 'نرخ'],
    delivery: ['ارسال', 'پست', 'شهرستان', 'تحویل', 'پیک'],
    hours: ['ساعت', 'باز هستید', 'بازید', 'تعطیل'],
    booking: ['نوبت', 'رزرو', 'وقت', 'میز'],
    catalog: ['چی دارید', 'محصول', 'منو', 'لیست', 'خدمات'],
  },
  en: {
    price: ['price', 'cost', 'how much', 'toman'],
    delivery: ['deliver', 'ship', 'post', 'courier'],
    hours: ['hour', 'open', 'closed', 'when'],
    booking: ['book', 'appointment', 'reserve', 'table'],
    catalog: ['what do you', 'products', 'menu', 'list', 'services'],
  },
};

/**
 * Pick the fact that actually answers the question. Looking facts up by kind
 * (not by array position) is what keeps e.g. a delivery question from being
 * answered with opening hours.
 */
function factOfKind(catalog: VerticalCatalog, kind: FactKind): string {
  const match = catalog.facts.find((f) => f.kind === kind);
  return (match ?? catalog.facts[0])?.text ?? '';
}

// Tie-break order, most specific first. `price` is last because its triggers
// ("چند" / "how much") also appear in questions that are really about hours or
// booking — e.g. "تا ساعت چند باز هستید؟".
const intentPriority: Array<Exclude<Intent, 'other'>> = [
  'booking',
  'hours',
  'delivery',
  'catalog',
  'price',
];

/**
 * Score every intent by how many of its keywords appear, and take the highest.
 * Scoring beats first-match: a question can contain a weak generic token and a
 * strong specific one, and the specific one should win.
 */
function detectIntent(message: string, locale: 'fa' | 'en'): Intent {
  const text = message.toLowerCase();
  let best: Intent = 'other';
  let bestScore = 0;

  for (const intent of intentPriority) {
    const score = keywords[locale][intent].filter((w) => text.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

/**
 * Produce a scripted reply for a user message. Pure and synchronous so it can
 * be unit-tested and used the moment the network path fails.
 */
export function scriptedReply(
  message: string,
  locale: 'fa' | 'en',
  vertical: VerticalId,
): string {
  const catalog = getCatalog(locale, vertical);
  const intent = detectIntent(message, locale);
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);

  // Price: try to name the specific item the customer mentioned.
  if (intent === 'price') {
    const match = catalog.items.find((item) =>
      message.toLowerCase().includes(item.name.toLowerCase().split(' ')[0] ?? ''),
    );
    const item = match ?? catalog.items[0];
    if (!item) return catalog.facts[0]?.text ?? '';
    return locale === 'fa'
      ? `${item.name} ${fmt(item.price)} ${catalog.currency} است${item.note ? ` (${item.note})` : ''}. چیز دیگری هم می‌خواهید بپرسید؟`
      : `${item.name} is ${fmt(item.price)} ${catalog.currency}${item.note ? ` (${item.note})` : ''}. Anything else you'd like to know?`;
  }

  if (intent === 'delivery' || intent === 'hours' || intent === 'booking') {
    return factOfKind(catalog, intent);
  }

  if (intent === 'catalog') {
    const list = catalog.items
      .slice(0, 3)
      .map((i) => `${i.name} (${fmt(i.price)} ${catalog.currency})`)
      .join(locale === 'fa' ? '، ' : ', ');
    return locale === 'fa'
      ? `از پرفروش‌ترین‌ها: ${list}. دوست دارید درباره‌ی کدام بیشتر بدانید؟`
      : `Popular picks: ${list}. Which one would you like to hear more about?`;
  }

  return locale === 'fa'
    ? `ممنون از پیام‌تان. می‌توانم درباره‌ی قیمت‌ها، ارسال و نوبت‌دهی ${catalog.business} راهنمایی‌تان کنم — کدام را می‌خواهید؟`
    : `Thanks for your message. I can help with prices, delivery, and booking at ${catalog.business} — which would you like?`;
}

// Three suggested openers per vertical (plan §5.2), keyed to message strings.
export const suggestionKeys = ['q1', 'q2', 'q3'] as const;
