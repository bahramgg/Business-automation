import { describe, expect, it } from 'vitest';
import {
  computeRoi,
  clampInputs,
  decodeRoiParams,
  encodeRoiParams,
  DEFAULT_ROI_INPUTS,
  MINUTES_PER_MESSAGE,
  type RoiInputs,
} from '@/lib/roi';

const base: RoiInputs = {
  messagesPerMonth: 1000,
  answeredPct: 40,
  avgOrderValue: 500_000,
  conversionPct: 20,
};

describe('computeRoi', () => {
  it('computes lost sales from unanswered × conversion × value', () => {
    // unanswered = 1000 × 0.6 = 600; ordersLost = 600 × 0.2 = 120
    // lostSales = 120 × 500_000 = 60_000_000
    const r = computeRoi(base);
    expect(r.ordersLost).toBe(120);
    expect(r.lostSales).toBe(60_000_000);
  });

  it('derives freed hours from minutes-per-message', () => {
    const r = computeRoi(base);
    expect(r.hoursFreed).toBe(Math.round((1000 * MINUTES_PER_MESSAGE) / 60));
  });

  it('loses nothing when every message is answered', () => {
    const r = computeRoi({ ...base, answeredPct: 100 });
    expect(r.lostSales).toBe(0);
    expect(r.ordersLost).toBe(0);
  });

  it('loses nothing when conversion is zero', () => {
    expect(computeRoi({ ...base, conversionPct: 0 }).lostSales).toBe(0);
  });
});

describe('clampInputs', () => {
  it('clamps out-of-range values to bounds', () => {
    const c = clampInputs({
      messagesPerMonth: 999999,
      answeredPct: 250,
      avgOrderValue: -5,
      conversionPct: -10,
    });
    expect(c.messagesPerMonth).toBe(5000);
    expect(c.answeredPct).toBe(100);
    expect(c.avgOrderValue).toBe(0);
    expect(c.conversionPct).toBe(0);
  });

  it('replaces non-finite values with the lower bound', () => {
    const c = clampInputs({
      messagesPerMonth: Number.NaN,
      answeredPct: Infinity,
      avgOrderValue: 500_000,
      conversionPct: 20,
    });
    expect(c.messagesPerMonth).toBe(0);
    expect(c.answeredPct).toBe(100);
  });
});

describe('URL state', () => {
  it('round-trips through encode/decode', () => {
    const encoded = encodeRoiParams(base);
    expect(decodeRoiParams(encoded)).toEqual(base);
  });

  it('falls back to defaults for missing or garbage params', () => {
    expect(decodeRoiParams({})).toEqual(DEFAULT_ROI_INPUTS);
    expect(decodeRoiParams({ m: 'abc', a: '' }).messagesPerMonth).toBe(
      DEFAULT_ROI_INPUTS.messagesPerMonth,
    );
  });

  it('clamps hostile params on decode', () => {
    expect(decodeRoiParams({ a: '9999' }).answeredPct).toBe(100);
  });
});
