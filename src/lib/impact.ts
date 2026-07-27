// The site's single tool: what automating this business actually gives back.
//
// One calculator, four inputs, three outputs. Its whole job is to answer the
// question a visitor arrives with — "what would this do for me?" — in their own
// numbers, so nothing else on the page has to argue the point.

export interface ImpactInputs {
  /** People spending part of their day on repetitive admin. */
  staffCount: number;
  /** Hours per person per day spent on it. */
  hoursPerDay: number;
  /** Requests, orders, or messages received per month. */
  requestsPerMonth: number;
  /** Share of those that go unanswered or unfollowed, 0–100. */
  missedPct: number;
}

export interface ImpactResult {
  /** Repetitive hours a system takes over each month. */
  hoursSaved: number;
  /** Those hours as whole working days returned to the team. */
  workdaysSaved: number;
  /** Requests currently slipping through that automated follow-up catches. */
  requestsRecovered: number;
}

/** A working day, used only to reframe hours as something tangible. */
export const HOURS_PER_WORKDAY = 8;
/** Working days in a month — a fixed, stated assumption, not a hidden one. */
export const WORKDAYS_PER_MONTH = 26;

/**
 * Share of repetitive work a system realistically takes over. Deliberately
 * conservative and stated on the page: the output is labelled an estimate and
 * must not oversell.
 */
export const AUTOMATABLE_SHARE = 0.6;

/**
 * Share of currently-missed requests that automated response and follow-up
 * recover. Also conservative — it never claims to recover all of them.
 */
export const RECOVERABLE_SHARE = 0.7;

type Bound = { min: number; max: number; step: number; default: number };

export const IMPACT_BOUNDS = {
  staffCount: { min: 1, max: 30, step: 1, default: 3 },
  hoursPerDay: { min: 0, max: 8, step: 1, default: 3 },
  requestsPerMonth: { min: 0, max: 3000, step: 50, default: 400 },
  missedPct: { min: 0, max: 100, step: 5, default: 30 },
} satisfies Record<keyof ImpactInputs, Bound>;

function clamp(value: number, { min, max }: Bound): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampImpactInputs(inputs: ImpactInputs): ImpactInputs {
  return {
    staffCount: clamp(inputs.staffCount, IMPACT_BOUNDS.staffCount),
    hoursPerDay: clamp(inputs.hoursPerDay, IMPACT_BOUNDS.hoursPerDay),
    requestsPerMonth: clamp(inputs.requestsPerMonth, IMPACT_BOUNDS.requestsPerMonth),
    missedPct: clamp(inputs.missedPct, IMPACT_BOUNDS.missedPct),
  };
}

export const DEFAULT_IMPACT_INPUTS: ImpactInputs = {
  staffCount: IMPACT_BOUNDS.staffCount.default,
  hoursPerDay: IMPACT_BOUNDS.hoursPerDay.default,
  requestsPerMonth: IMPACT_BOUNDS.requestsPerMonth.default,
  missedPct: IMPACT_BOUNDS.missedPct.default,
};

/**
 * hoursSaved       = people × hours/day × working days × automatable share
 * requestsRecovered = requests × missed share × recoverable share
 */
export function computeImpact(rawInputs: ImpactInputs): ImpactResult {
  const i = clampImpactInputs(rawInputs);

  const hoursSaved =
    i.staffCount * i.hoursPerDay * WORKDAYS_PER_MONTH * AUTOMATABLE_SHARE;
  const requestsRecovered =
    i.requestsPerMonth * (i.missedPct / 100) * RECOVERABLE_SHARE;

  return {
    hoursSaved: Math.round(hoursSaved),
    workdaysSaved: Math.round(hoursSaved / HOURS_PER_WORKDAY),
    requestsRecovered: Math.round(requestsRecovered),
  };
}
