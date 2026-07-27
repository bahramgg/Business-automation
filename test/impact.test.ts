import { describe, expect, it } from 'vitest';
import {
  computeImpact,
  clampImpactInputs,
  DEFAULT_IMPACT_INPUTS,
  AUTOMATABLE_SHARE,
  RECOVERABLE_SHARE,
  WORKDAYS_PER_MONTH,
  HOURS_PER_WORKDAY,
  type ImpactInputs,
} from '@/lib/impact';

const base: ImpactInputs = {
  staffCount: 3,
  hoursPerDay: 2,
  requestsPerMonth: 400,
  missedPct: 25,
};

describe('computeImpact', () => {
  it('derives saved hours from the team, the day, and the automatable share', () => {
    // 3 × 2 × 26 × 0.6 = 93.6 → 94
    const expected = Math.round(3 * 2 * WORKDAYS_PER_MONTH * AUTOMATABLE_SHARE);
    expect(computeImpact(base).hoursSaved).toBe(expected);
  });

  it('reframes saved hours as whole working days', () => {
    const r = computeImpact(base);
    expect(r.workdaysSaved).toBe(Math.round(r.hoursSaved / HOURS_PER_WORKDAY));
  });

  it('recovers only a share of the missed requests, never all', () => {
    // 400 × 0.25 × 0.7 = 70
    expect(computeImpact(base).requestsRecovered).toBe(
      Math.round(400 * 0.25 * RECOVERABLE_SHARE),
    );
    const missedAll = computeImpact({ ...base, missedPct: 100 });
    expect(missedAll.requestsRecovered).toBeLessThan(base.requestsPerMonth);
  });

  it('saves nothing when no time goes to repetitive work', () => {
    expect(computeImpact({ ...base, hoursPerDay: 0 }).hoursSaved).toBe(0);
  });

  it('recovers nothing when nothing is missed', () => {
    expect(computeImpact({ ...base, missedPct: 0 }).requestsRecovered).toBe(0);
  });

  it('scales with the team', () => {
    const one = computeImpact({ ...base, staffCount: 1 }).hoursSaved;
    const ten = computeImpact({ ...base, staffCount: 10 }).hoursSaved;
    expect(ten).toBeGreaterThan(one);
  });

  it('keeps both conservative shares below 100%', () => {
    expect(AUTOMATABLE_SHARE).toBeLessThan(1);
    expect(RECOVERABLE_SHARE).toBeLessThan(1);
  });
});

describe('clampImpactInputs', () => {
  it('clamps out-of-range values and keeps at least one person', () => {
    const c = clampImpactInputs({
      staffCount: 0,
      hoursPerDay: -3,
      requestsPerMonth: 99999,
      missedPct: 250,
    });
    expect(c.staffCount).toBe(1);
    expect(c.hoursPerDay).toBe(0);
    expect(c.requestsPerMonth).toBe(3000);
    expect(c.missedPct).toBe(100);
  });

  it('replaces NaN with the lower bound', () => {
    expect(clampImpactInputs({ ...base, staffCount: Number.NaN }).staffCount).toBe(1);
  });

  it('produces finite output for the defaults', () => {
    const r = computeImpact(DEFAULT_IMPACT_INPUTS);
    expect(Number.isFinite(r.hoursSaved)).toBe(true);
    expect(Number.isFinite(r.requestsRecovered)).toBe(true);
  });
});
