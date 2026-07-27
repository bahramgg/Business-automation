import { describe, expect, it } from 'vitest';
import {
  computeWorkload,
  clampWorkloadInputs,
  encodeWorkloadParams,
  decodeWorkloadParams,
  DEFAULT_WORKLOAD_INPUTS,
  HOURS_PER_WORKDAY,
  type WorkloadInputs,
} from '@/lib/workload';

const base: WorkloadInputs = {
  staffCount: 3,
  hoursPerDay: 2,
  daysPerMonth: 25,
  automatablePct: 60,
};

describe('computeWorkload', () => {
  it('totals the team\'s repetitive hours', () => {
    // 3 × 2 × 25 = 150
    expect(computeWorkload(base).monthlyHours).toBe(150);
  });

  it('reclaims the automatable share', () => {
    // 150 × 0.60 = 90
    expect(computeWorkload(base).reclaimedHours).toBe(90);
  });

  it('reframes reclaimed hours as whole workdays', () => {
    // Whole days, so the figure reads as something a manager can act on.
    expect(computeWorkload(base).reclaimedWorkdays).toBe(Math.round(90 / HOURS_PER_WORKDAY));
  });

  it('reclaims nothing when nothing is automatable', () => {
    expect(computeWorkload({ ...base, automatablePct: 0 }).reclaimedHours).toBe(0);
  });

  it('never reclaims more than the total', () => {
    const r = computeWorkload({ ...base, automatablePct: 100 });
    expect(r.reclaimedHours).toBe(r.monthlyHours);
  });

  it('scales with team size', () => {
    const small = computeWorkload({ ...base, staffCount: 1 }).reclaimedHours;
    const large = computeWorkload({ ...base, staffCount: 10 }).reclaimedHours;
    expect(large).toBeGreaterThan(small);
  });
});

describe('clampWorkloadInputs', () => {
  it('clamps out-of-range values', () => {
    const c = clampWorkloadInputs({
      staffCount: 9999,
      hoursPerDay: -4,
      daysPerMonth: 99,
      automatablePct: 250,
    });
    expect(c.staffCount).toBe(50);
    expect(c.hoursPerDay).toBe(0);
    expect(c.daysPerMonth).toBe(31);
    expect(c.automatablePct).toBe(100);
  });

  it('keeps at least one person and one day', () => {
    const c = clampWorkloadInputs({ ...base, staffCount: 0, daysPerMonth: 0 });
    expect(c.staffCount).toBe(1);
    expect(c.daysPerMonth).toBe(1);
  });
});

describe('workload URL state', () => {
  it('round-trips', () => {
    expect(decodeWorkloadParams(encodeWorkloadParams(base))).toEqual(base);
  });

  it('falls back to defaults and clamps hostile params', () => {
    expect(decodeWorkloadParams({})).toEqual(DEFAULT_WORKLOAD_INPUTS);
    expect(decodeWorkloadParams({ k: '9999' }).automatablePct).toBe(100);
  });
});
