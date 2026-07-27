// Repetitive-workload calculator — the operations domain's tool.
//
// Proves the operations claim: the week is consumed by work a system can do.
// Same shape as the other calculators (sliders → animated result → honesty
// line) so the tool family stays consistent.

export interface WorkloadInputs {
  /** People who spend part of their day on repetitive admin. */
  staffCount: number;
  /** Hours per person per day spent on it. */
  hoursPerDay: number;
  /** Working days per month. */
  daysPerMonth: number;
  /** Share of that work a system can take over, 0–100. */
  automatablePct: number;
}

export interface WorkloadResult {
  /** Total repetitive hours across the team each month. */
  monthlyHours: number;
  /** Hours a system can take over each month. */
  reclaimedHours: number;
  /** Those hours expressed as full working days returned to the team. */
  reclaimedWorkdays: number;
}

/** A working day, used only to reframe hours as something tangible. */
export const HOURS_PER_WORKDAY = 8;

type Bound = { min: number; max: number; step: number; default: number };

export const WORKLOAD_BOUNDS = {
  staffCount: { min: 1, max: 50, step: 1, default: 3 },
  hoursPerDay: { min: 0, max: 8, step: 1, default: 3 },
  daysPerMonth: { min: 1, max: 31, step: 1, default: 26 },
  automatablePct: { min: 0, max: 100, step: 5, default: 60 },
} satisfies Record<keyof WorkloadInputs, Bound>;

function clamp(value: number, { min, max }: Bound): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampWorkloadInputs(inputs: WorkloadInputs): WorkloadInputs {
  return {
    staffCount: clamp(inputs.staffCount, WORKLOAD_BOUNDS.staffCount),
    hoursPerDay: clamp(inputs.hoursPerDay, WORKLOAD_BOUNDS.hoursPerDay),
    daysPerMonth: clamp(inputs.daysPerMonth, WORKLOAD_BOUNDS.daysPerMonth),
    automatablePct: clamp(inputs.automatablePct, WORKLOAD_BOUNDS.automatablePct),
  };
}

export const DEFAULT_WORKLOAD_INPUTS: WorkloadInputs = {
  staffCount: WORKLOAD_BOUNDS.staffCount.default,
  hoursPerDay: WORKLOAD_BOUNDS.hoursPerDay.default,
  daysPerMonth: WORKLOAD_BOUNDS.daysPerMonth.default,
  automatablePct: WORKLOAD_BOUNDS.automatablePct.default,
};

/** monthlyHours = staff × hours/day × days; reclaimed = that × automatable%. */
export function computeWorkload(rawInputs: WorkloadInputs): WorkloadResult {
  const i = clampWorkloadInputs(rawInputs);
  const monthlyHours = i.staffCount * i.hoursPerDay * i.daysPerMonth;
  const reclaimedHours = monthlyHours * (i.automatablePct / 100);

  return {
    monthlyHours: Math.round(monthlyHours),
    reclaimedHours: Math.round(reclaimedHours),
    reclaimedWorkdays: Math.round(reclaimedHours / HOURS_PER_WORKDAY),
  };
}

const PARAM_KEYS = {
  staffCount: 's',
  hoursPerDay: 'h',
  daysPerMonth: 'd',
  automatablePct: 'k',
} as const;

export function encodeWorkloadParams(inputs: WorkloadInputs): Record<string, string> {
  const i = clampWorkloadInputs(inputs);
  return {
    [PARAM_KEYS.staffCount]: String(i.staffCount),
    [PARAM_KEYS.hoursPerDay]: String(i.hoursPerDay),
    [PARAM_KEYS.daysPerMonth]: String(i.daysPerMonth),
    [PARAM_KEYS.automatablePct]: String(i.automatablePct),
  };
}

export function decodeWorkloadParams(
  params: Record<string, string | string[] | undefined>,
): WorkloadInputs {
  const num = (raw: string | string[] | undefined, fallback: number): number => {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return clampWorkloadInputs({
    staffCount: num(params[PARAM_KEYS.staffCount], DEFAULT_WORKLOAD_INPUTS.staffCount),
    hoursPerDay: num(params[PARAM_KEYS.hoursPerDay], DEFAULT_WORKLOAD_INPUTS.hoursPerDay),
    daysPerMonth: num(params[PARAM_KEYS.daysPerMonth], DEFAULT_WORKLOAD_INPUTS.daysPerMonth),
    automatablePct: num(params[PARAM_KEYS.automatablePct], DEFAULT_WORKLOAD_INPUTS.automatablePct),
  });
}
