// Repeat-customer calculator — pure logic (plan §5.5). Sibling of lib/roi.ts:
// same shape, same honesty rules, its own claim — the biggest revenue source is
// a customer who already bought.

export interface RepeatInputs {
  /** Customers who have bought at least once, to date. */
  totalCustomers: number;
  /** Average purchase amount (toman). */
  avgPurchase: number;
  /** How often a customer would naturally rebuy, in months. */
  rebuyMonths: number;
  /** Share who actually do come back today, 0–100. */
  returningPct: number;
}

export interface RepeatResult {
  /** Extra monthly revenue if reminders lift returns to the achievable rate. */
  recoverableRevenue: number;
  /** Customers who are "forgotten" right now — due to rebuy but not returning. */
  forgottenCustomers: number;
  /** Cost ratio: winning a new customer vs. bringing an old one back. */
  acquisitionMultiple: number;
}

/**
 * What share of customers a reminder system can realistically bring back, on
 * top of those already returning. Deliberately conservative — the output is
 * labeled an estimate and must not oversell (plan §5.5, §15).
 */
export const ACHIEVABLE_RETURN_UPLIFT_PCT = 15;

/**
 * Acquiring a new customer is widely held to cost several times more than
 * retaining one. We state the multiple as a rounded, clearly-labeled estimate
 * rather than citing a precise figure we can't source (plan §15: no unsourced
 * numbers).
 */
export const ACQUISITION_COST_MULTIPLE = 5;

type Bound = { min: number; max: number; step: number; default: number };

export const REPEAT_BOUNDS = {
  totalCustomers: { min: 0, max: 20_000, step: 50, default: 1_200 },
  avgPurchase: { min: 0, max: 20_000_000, step: 100_000, default: 1_500_000 },
  rebuyMonths: { min: 1, max: 24, step: 1, default: 3 },
  returningPct: { min: 0, max: 100, step: 1, default: 20 },
} satisfies Record<keyof RepeatInputs, Bound>;

function clamp(value: number, { min, max }: Bound): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampRepeatInputs(inputs: RepeatInputs): RepeatInputs {
  return {
    totalCustomers: clamp(inputs.totalCustomers, REPEAT_BOUNDS.totalCustomers),
    avgPurchase: clamp(inputs.avgPurchase, REPEAT_BOUNDS.avgPurchase),
    rebuyMonths: clamp(inputs.rebuyMonths, REPEAT_BOUNDS.rebuyMonths),
    returningPct: clamp(inputs.returningPct, REPEAT_BOUNDS.returningPct),
  };
}

export const DEFAULT_REPEAT_INPUTS: RepeatInputs = {
  totalCustomers: REPEAT_BOUNDS.totalCustomers.default,
  avgPurchase: REPEAT_BOUNDS.avgPurchase.default,
  rebuyMonths: REPEAT_BOUNDS.rebuyMonths.default,
  returningPct: REPEAT_BOUNDS.returningPct.default,
};

/**
 * dueEachMonth  = customers / rebuy interval  (how many are due to rebuy now)
 * uplift        = achievable return rate − current rate, never negative
 * recoverable   = dueEachMonth × uplift × average purchase
 */
export function computeRepeat(rawInputs: RepeatInputs): RepeatResult {
  const i = clampRepeatInputs(rawInputs);

  const dueEachMonth = i.totalCustomers / i.rebuyMonths;
  const achievablePct = Math.min(
    100,
    i.returningPct + ACHIEVABLE_RETURN_UPLIFT_PCT,
  );
  const upliftPct = Math.max(0, achievablePct - i.returningPct);

  const recoverableRevenue = dueEachMonth * (upliftPct / 100) * i.avgPurchase;
  // "Forgotten" = due to rebuy this month but not among those returning.
  const forgottenCustomers = dueEachMonth * (1 - i.returningPct / 100);

  return {
    recoverableRevenue: Math.round(recoverableRevenue),
    forgottenCustomers: Math.round(forgottenCustomers),
    acquisitionMultiple: ACQUISITION_COST_MULTIPLE,
  };
}

// --- URL state, mirroring lib/roi.ts -------------------------------------

const PARAM_KEYS = {
  totalCustomers: 'c',
  avgPurchase: 'p',
  rebuyMonths: 'n',
  returningPct: 'b',
} as const;

export function encodeRepeatParams(inputs: RepeatInputs): Record<string, string> {
  const i = clampRepeatInputs(inputs);
  return {
    [PARAM_KEYS.totalCustomers]: String(i.totalCustomers),
    [PARAM_KEYS.avgPurchase]: String(i.avgPurchase),
    [PARAM_KEYS.rebuyMonths]: String(i.rebuyMonths),
    [PARAM_KEYS.returningPct]: String(i.returningPct),
  };
}

export function decodeRepeatParams(
  params: Record<string, string | string[] | undefined>,
): RepeatInputs {
  const num = (raw: string | string[] | undefined, fallback: number): number => {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return clampRepeatInputs({
    totalCustomers: num(params[PARAM_KEYS.totalCustomers], DEFAULT_REPEAT_INPUTS.totalCustomers),
    avgPurchase: num(params[PARAM_KEYS.avgPurchase], DEFAULT_REPEAT_INPUTS.avgPurchase),
    rebuyMonths: num(params[PARAM_KEYS.rebuyMonths], DEFAULT_REPEAT_INPUTS.rebuyMonths),
    returningPct: num(params[PARAM_KEYS.returningPct], DEFAULT_REPEAT_INPUTS.returningPct),
  });
}
