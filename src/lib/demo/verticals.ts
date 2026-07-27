// Demo verticals + their sample catalogs (plan §5.2). Shared by the Worker
// (to build the system prompt) and the client (to render chips, suggested
// questions, and the scripted fallback), so both always agree on the data.

export const verticalIds = [
  'clothing',
  'restaurant',
  'salon',
  'electronics',
  'services',
] as const;

export type VerticalId = (typeof verticalIds)[number];

export function isVerticalId(value: unknown): value is VerticalId {
  return (
    typeof value === 'string' &&
    (verticalIds as readonly string[]).includes(value)
  );
}

export interface CatalogItem {
  name: string;
  price: number;
  note?: string;
}

/** Kind of policy a fact states, so the fallback can pick the right one. */
export type FactKind = 'delivery' | 'hours' | 'booking' | 'policy';

export interface CatalogFact {
  kind: FactKind;
  text: string;
}

export interface VerticalCatalog {
  /** Sample business name used in the system prompt. */
  business: string;
  currency: string;
  items: CatalogItem[];
  /** Facts the assistant may state, labeled so lookups don't rely on order. */
  facts: CatalogFact[];
}

// Fixed sample catalogs, one per vertical, per locale. Deliberately small and
// concrete so the demo answers feel real without any live data.
type CatalogsByLocale = Record<'fa' | 'en', Record<VerticalId, VerticalCatalog>>;

export const catalogs: CatalogsByLocale = {
  fa: {
    clothing: {
      business: 'پوشاک آوا',
      currency: 'تومان',
      items: [
        { name: 'مانتو کتان', price: 1_450_000, note: 'سایز ۳۶ تا ۴۶' },
        { name: 'شومیز ابریشمی', price: 890_000, note: 'چهار رنگ' },
        { name: 'شلوار جین', price: 1_200_000 },
        { name: 'کت تک', price: 2_300_000, note: 'موجودی محدود' },
      ],
      facts: [
        { kind: 'delivery', text: 'ارسال به تهران ۱ تا ۲ روز کاری، شهرستان ۳ تا ۵ روز کاری.' },
        { kind: 'delivery', text: 'ارسال بالای ۳ میلیون تومان رایگان است.' },
        { kind: 'policy', text: 'تعویض سایز تا ۷ روز بعد از خرید ممکن است.' },
      ],
    },
    restaurant: {
      business: 'رستوران نارنج',
      currency: 'تومان',
      items: [
        { name: 'چلوکباب کوبیده', price: 320_000 },
        { name: 'جوجه‌کباب زعفرانی', price: 380_000 },
        { name: 'خورش قورمه‌سبزی', price: 290_000 },
        { name: 'سالاد فصل', price: 120_000 },
      ],
      facts: [
        { kind: 'hours', text: 'ساعت کار: ۱۲ تا ۲۳، همه‌ی روزهای هفته.' },
        { kind: 'delivery', text: 'ارسال فقط در محدوده‌ی شهر، هزینه‌ی پیک ۶۰ هزار تومان.' },
        { kind: 'booking', text: 'رزرو میز برای بیش از ۶ نفر با تماس تلفنی.' },
      ],
    },
    salon: {
      business: 'سالن زیبایی رها',
      currency: 'تومان',
      items: [
        { name: 'کوتاهی مو', price: 450_000 },
        { name: 'رنگ و مش', price: 1_800_000, note: 'بسته به بلندی مو' },
        { name: 'کراتینه', price: 2_500_000 },
        { name: 'خدمات ناخن', price: 700_000 },
      ],
      facts: [
        { kind: 'booking', text: 'نوبت‌دهی فقط با هماهنگی قبلی، ساعت ۱۰ تا ۲۰.' },
        { kind: 'hours', text: 'روزهای جمعه تعطیل است.' },
        { kind: 'policy', text: 'لغو نوبت تا ۲۴ ساعت قبل بدون هزینه است.' },
      ],
    },
    electronics: {
      business: 'لوازم خانگی مهر',
      currency: 'تومان',
      items: [
        { name: 'جاروبرقی ۲۰۰۰ وات', price: 4_200_000, note: 'گارانتی ۱۸ ماه' },
        { name: 'مایکروویو ۲۵ لیتری', price: 6_800_000 },
        { name: 'پلوپز دیجیتال', price: 3_100_000 },
        { name: 'اتو بخار', price: 1_900_000 },
      ],
      facts: [
        { kind: 'policy', text: 'همه‌ی کالاها گارانتی شرکتی دارند.' },
        { kind: 'delivery', text: 'ارسال به سراسر کشور، هزینه بر عهده‌ی خریدار.' },
        { kind: 'policy', text: 'امکان پرداخت در محل فقط در تهران.' },
      ],
    },
    services: {
      business: 'خدمات فنی پارس',
      currency: 'تومان',
      items: [
        { name: 'بازدید و تشخیص', price: 300_000, note: 'در صورت انجام کار رایگان' },
        { name: 'سرویس پکیج', price: 950_000 },
        { name: 'نصب کولر گازی', price: 1_600_000 },
        { name: 'لوله‌کشی (هر نقطه)', price: 800_000 },
      ],
      facts: [
        { kind: 'booking', text: 'اعزام کارشناس در تهران، همان روز یا روز بعد.' },
        { kind: 'hours', text: 'ساعت کار: ۸ تا ۲۰، پنجشنبه تا ۱۴.' },
        { kind: 'policy', text: 'کارها ۳ ماه گارانتی دارند.' },
      ],
    },
  },
  en: {
    clothing: {
      business: 'Ava Apparel',
      currency: 'toman',
      items: [
        { name: 'Cotton coat', price: 1_450_000, note: 'sizes 36–46' },
        { name: 'Silk blouse', price: 890_000, note: 'four colors' },
        { name: 'Jeans', price: 1_200_000 },
        { name: 'Blazer', price: 2_300_000, note: 'limited stock' },
      ],
      facts: [
        { kind: 'delivery', text: 'Tehran delivery 1–2 business days; other cities 3–5.' },
        { kind: 'delivery', text: 'Free shipping over 3,000,000 toman.' },
        { kind: 'policy', text: 'Size exchange available within 7 days of purchase.' },
      ],
    },
    restaurant: {
      business: 'Naranj Restaurant',
      currency: 'toman',
      items: [
        { name: 'Koobideh kebab plate', price: 320_000 },
        { name: 'Saffron chicken kebab', price: 380_000 },
        { name: 'Ghormeh sabzi stew', price: 290_000 },
        { name: 'Seasonal salad', price: 120_000 },
      ],
      facts: [
        { kind: 'hours', text: 'Open 12:00–23:00, every day.' },
        { kind: 'delivery', text: 'Delivery within the city only; courier fee 60,000 toman.' },
        { kind: 'booking', text: 'Table reservations for parties over 6 by phone.' },
      ],
    },
    salon: {
      business: 'Raha Beauty Salon',
      currency: 'toman',
      items: [
        { name: 'Haircut', price: 450_000 },
        { name: 'Color & highlights', price: 1_800_000, note: 'varies with length' },
        { name: 'Keratin treatment', price: 2_500_000 },
        { name: 'Nail services', price: 700_000 },
      ],
      facts: [
        { kind: 'booking', text: 'By appointment only, 10:00–20:00.' },
        { kind: 'hours', text: 'Closed on Fridays.' },
        { kind: 'policy', text: 'Free cancellation up to 24 hours ahead.' },
      ],
    },
    electronics: {
      business: 'Mehr Home Appliances',
      currency: 'toman',
      items: [
        { name: '2000W vacuum cleaner', price: 4_200_000, note: '18-month warranty' },
        { name: '25L microwave', price: 6_800_000 },
        { name: 'Digital rice cooker', price: 3_100_000 },
        { name: 'Steam iron', price: 1_900_000 },
      ],
      facts: [
        { kind: 'policy', text: 'All items carry an official warranty.' },
        { kind: 'delivery', text: 'Nationwide shipping, paid by the buyer.' },
        { kind: 'policy', text: 'Cash on delivery available in Tehran only.' },
      ],
    },
    services: {
      business: 'Pars Technical Services',
      currency: 'toman',
      items: [
        { name: 'Inspection & diagnosis', price: 300_000, note: 'free if you book the job' },
        { name: 'Boiler service', price: 950_000 },
        { name: 'AC installation', price: 1_600_000 },
        { name: 'Plumbing (per point)', price: 800_000 },
      ],
      facts: [
        { kind: 'booking', text: 'Technician dispatch in Tehran, same or next day.' },
        { kind: 'hours', text: 'Hours 8:00–20:00; Thursdays until 14:00.' },
        { kind: 'policy', text: 'All work carries a 3-month guarantee.' },
      ],
    },
  },
};

export function getCatalog(
  locale: 'fa' | 'en',
  vertical: VerticalId,
): VerticalCatalog {
  return catalogs[locale][vertical];
}
