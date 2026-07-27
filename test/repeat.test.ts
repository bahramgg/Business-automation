import { describe, expect, it } from 'vitest';
import {
  computeRepeat,
  clampRepeatInputs,
  encodeRepeatParams,
  decodeRepeatParams,
  DEFAULT_REPEAT_INPUTS,
  ACHIEVABLE_RETURN_UPLIFT_PCT,
  type RepeatInputs,
} from '@/lib/repeat';

const base: RepeatInputs = {
  totalCustomers: 1200,
  avgPurchase: 1_000_000,
  rebuyMonths: 3,
  returningPct: 20,
};

describe('computeRepeat', () => {
  it('computes recoverable revenue from the achievable uplift', () => {
    // due/month = 1200/3 = 400; uplift = 15% → 400 × 0.15 × 1,000,000 = 60,000,000
    expect(computeRepeat(base).recoverableRevenue).toBe(60_000_000);
  });

  it('counts customers due to rebuy who are not returning', () => {
    // 400 due × (1 − 0.20) = 320
    expect(computeRepeat(base).forgottenCustomers).toBe(320);
  });

  it('caps the achievable rate at 100% so uplift never goes negative', () => {
    const r = computeRepeat({ ...base, returningPct: 100 });
    expect(r.recoverableRevenue).toBe(0);
    expect(r.forgottenCustomers).toBe(0);
  });

  it('shrinks the uplift as the current return rate approaches the ceiling', () => {
    // At 95%, only 5 points of headroom remain, not the full uplift.
    const r = computeRepeat({ ...base, returningPct: 95 });
    const expected = Math.round((1200 / 3) * 0.05 * 1_000_000);
    expect(r.recoverableRevenue).toBe(expected);
  });

  it('recovers nothing without customers', () => {
    expect(computeRepeat({ ...base, totalCustomers: 0 }).recoverableRevenue).toBe(0);
  });

  it('scales inversely with the rebuy interval', () => {
    const monthly = computeRepeat({ ...base, rebuyMonths: 1 });
    const yearly = computeRepeat({ ...base, rebuyMonths: 12 });
    expect(monthly.recoverableRevenue).toBeGreaterThan(yearly.recoverableRevenue);
  });

  it('reports the acquisition-cost multiple as a labeled estimate', () => {
    expect(computeRepeat(base).acquisitionMultiple).toBeGreaterThan(1);
  });

  it('uses the documented uplift constant', () => {
    expect(ACHIEVABLE_RETURN_UPLIFT_PCT).toBeGreaterThan(0);
    expect(ACHIEVABLE_RETURN_UPLIFT_PCT).toBeLessThanOrEqual(100);
  });
});

describe('clampRepeatInputs', () => {
  it('clamps out-of-range values, never dividing by zero months', () => {
    const c = clampRepeatInputs({
      totalCustomers: -50,
      avgPurchase: 99_999_999,
      rebuyMonths: 0,
      returningPct: 500,
    });
    expect(c.totalCustomers).toBe(0);
    expect(c.avgPurchase).toBe(20_000_000);
    expect(c.rebuyMonths).toBe(1);
    expect(c.returningPct).toBe(100);
    expect(Number.isFinite(computeRepeat(c).recoverableRevenue)).toBe(true);
  });
});

describe('repeat URL state', () => {
  it('round-trips', () => {
    expect(decodeRepeatParams(encodeRepeatParams(base))).toEqual(base);
  });

  it('falls back to defaults and clamps hostile params', () => {
    expect(decodeRepeatParams({})).toEqual(DEFAULT_REPEAT_INPUTS);
    expect(decodeRepeatParams({ b: '9999' }).returningPct).toBe(100);
    expect(decodeRepeatParams({ n: '0' }).rebuyMonths).toBe(1);
  });
});
