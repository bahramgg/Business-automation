import { describe, expect, it } from 'vitest';
import {
  scoreReadiness,
  questionIds,
  questionDomain,
  answerLevels,
  DEFAULT_READINESS_ANSWERS,
  type ReadinessAnswers,
} from '@/lib/readiness';
import { domainIds } from '@/lib/domains';

const all = (level: 'manual' | 'partial' | 'automated'): ReadinessAnswers =>
  Object.fromEntries(questionIds.map((id) => [id, level])) as ReadinessAnswers;

describe('scoreReadiness', () => {
  it('scores an all-manual business at 0 and an all-automated one at 100', () => {
    expect(scoreReadiness(all('manual')).score).toBe(0);
    expect(scoreReadiness(all('automated')).score).toBe(100);
  });

  it('covers every domain, exactly once', () => {
    const result = scoreReadiness(DEFAULT_READINESS_ANSWERS);
    expect(result.byDomain).toHaveLength(domainIds.length);
    expect([...new Set(result.byDomain.map((d) => d.domain))]).toHaveLength(
      domainIds.length,
    );
  });

  it('asks about every domain', () => {
    const covered = new Set(questionIds.map((id) => questionDomain[id]));
    expect([...covered].sort()).toEqual([...domainIds].sort());
  });

  it('ranks domains weakest first', () => {
    const scores = scoreReadiness(DEFAULT_READINESS_ANSWERS).byDomain.map(
      (d) => d.score,
    );
    expect([...scores].sort((a, b) => a - b)).toEqual(scores);
  });

  it('recommends starting with the weakest domain', () => {
    // Everything automated except operations.
    const answers = { ...all('automated'), ops1: 'manual', ops2: 'manual' } as ReadinessAnswers;
    const result = scoreReadiness(answers);
    expect(result.startWith).toBe('operations');
    expect(result.byDomain[0]!.domain).toBe('operations');
  });

  it('breaks a tie toward the earlier domain in business order', () => {
    // Acquisition and data are equally weak; acquisition runs first.
    const answers = {
      ...all('automated'),
      acq1: 'manual', acq2: 'manual',
      dat1: 'manual', dat2: 'manual',
    } as ReadinessAnswers;
    expect(scoreReadiness(answers).startWith).toBe('acquisition');
  });

  it('always returns scores within 0–100', () => {
    for (const level of answerLevels) {
      const result = scoreReadiness(all(level));
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      for (const d of result.byDomain) {
        expect(d.score).toBeGreaterThanOrEqual(0);
        expect(d.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('treats a missing answer as partial rather than crashing', () => {
    const partial = { ...DEFAULT_READINESS_ANSWERS };
    delete (partial as Record<string, unknown>).ops1;
    expect(() => scoreReadiness(partial)).not.toThrow();
    expect(scoreReadiness(partial).score).toBeGreaterThan(0);
  });
});
