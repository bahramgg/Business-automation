// Lost-sales calculator — pure logic (plan §5.1). No React, no I/O, so the math
// is unit-tested in isolation (CLAUDE.md: every tool ships a calc test).

export interface RoiInputs {
  /** Messages / DMs received per month. */
  messagesPerMonth: number;
  /** Share of messages actually answered, 0–100. */
  answeredPct: number;
  /** Average order value, in the local currency (toman). */
  avgOrderValue: number;
  /** Share of conversations that turn into a sale, 0–100. */
  conversionPct: number;
}

export interface RoiResult {
  /** Estimated revenue lost each month to unanswered messages. */
  lostSales: number;
  /** Orders-per-month equivalent of that lost revenue (tangible frame). */
  ordersLost: number;
  /** Human hours/month freed if replies were automated. */
  hoursFreed: number;
}

// Assumption, surfaced to the user on the full tool page (plan §5.1 honesty).
export const MINUTES_PER_MESSAGE = 3;

type Bound = { min: number; max: number; step: number; default: number };

export const ROI_BOUNDS = {
  messagesPerMonth: { min: 0, max: 5000, step: 50, default: 800 },
  answeredPct: { min: 0, max: 100, step: 1, default: 45 },
  avgOrderValue: { min: 0, max: 20_000_000, step: 100_000, default: 2_000_000 },
  conversionPct: { min: 0, max: 100, step: 1, default: 25 },
} satisfies Record<keyof RoiInputs, Bound>;

function clamp(value: number, { min, max }: Bound): number {
  if (Number.isNaN(value)) return min;
  // ±Infinity flows through Math.min/max naturally (→ max / → min).
  return Math.min(max, Math.max(min, value));
}

/** Clamp every input to its slider bounds (defends against crafted URLs). */
export function clampInputs(inputs: RoiInputs): RoiInputs {
  return {
    messagesPerMonth: clamp(inputs.messagesPerMonth, ROI_BOUNDS.messagesPerMonth),
    answeredPct: clamp(inputs.answeredPct, ROI_BOUNDS.answeredPct),
    avgOrderValue: clamp(inputs.avgOrderValue, ROI_BOUNDS.avgOrderValue),
    conversionPct: clamp(inputs.conversionPct, ROI_BOUNDS.conversionPct),
  };
}

export const DEFAULT_ROI_INPUTS: RoiInputs = {
  messagesPerMonth: ROI_BOUNDS.messagesPerMonth.default,
  answeredPct: ROI_BOUNDS.answeredPct.default,
  avgOrderValue: ROI_BOUNDS.avgOrderValue.default,
  conversionPct: ROI_BOUNDS.conversionPct.default,
};

/**
 * lostSales = unanswered × conversion × avgOrderValue
 * where unanswered = messages × (1 − answered%).
 * Not answering is money — that's the whole claim (plan §5.1).
 */
export function computeRoi(rawInputs: RoiInputs): RoiResult {
  const i = clampInputs(rawInputs);
  const unanswered = i.messagesPerMonth * (1 - i.answeredPct / 100);
  const ordersLost = unanswered * (i.conversionPct / 100);
  const lostSales = ordersLost * i.avgOrderValue;
  const hoursFreed = (i.messagesPerMonth * MINUTES_PER_MESSAGE) / 60;

  return {
    lostSales: Math.round(lostSales),
    ordersLost: Math.round(ordersLost),
    hoursFreed: Math.round(hoursFreed),
  };
}

// --- URL state (plan §5.1: state in URL so results are shareable) ----------

const PARAM_KEYS = { messagesPerMonth: 'm', answeredPct: 'a', avgOrderValue: 'v', conversionPct: 'r' } as const;

/** Serialize inputs to short query params: ?m=800&a=45&v=2000000&r=25 */
export function encodeRoiParams(inputs: RoiInputs): Record<string, string> {
  const i = clampInputs(inputs);
  return {
    [PARAM_KEYS.messagesPerMonth]: String(i.messagesPerMonth),
    [PARAM_KEYS.answeredPct]: String(i.answeredPct),
    [PARAM_KEYS.avgOrderValue]: String(i.avgOrderValue),
    [PARAM_KEYS.conversionPct]: String(i.conversionPct),
  };
}

/** Parse inputs from query params, clamped, falling back to defaults. */
export function decodeRoiParams(
  params: Record<string, string | string[] | undefined>,
): RoiInputs {
  const num = (raw: string | string[] | undefined, fallback: number): number => {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return clampInputs({
    messagesPerMonth: num(params[PARAM_KEYS.messagesPerMonth], DEFAULT_ROI_INPUTS.messagesPerMonth),
    answeredPct: num(params[PARAM_KEYS.answeredPct], DEFAULT_ROI_INPUTS.answeredPct),
    avgOrderValue: num(params[PARAM_KEYS.avgOrderValue], DEFAULT_ROI_INPUTS.avgOrderValue),
    conversionPct: num(params[PARAM_KEYS.conversionPct], DEFAULT_ROI_INPUTS.conversionPct),
  });
}
