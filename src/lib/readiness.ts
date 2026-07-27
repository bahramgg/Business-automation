// Automation-readiness assessment (the site's entry tool).
//
// Eight statements, two per domain, each answered on a three-point scale. The
// output is a score per domain plus the one domain to start with — so a first
// visitor stops guessing which service they need and gets pointed at a single
// next step. This is what makes the path to a conversation legible.

import { domainIds, type DomainId } from './domains';

/** How a business currently handles a given piece of work. */
export const answerLevels = ['manual', 'partial', 'automated'] as const;
export type AnswerLevel = (typeof answerLevels)[number];

const LEVEL_SCORE: Record<AnswerLevel, number> = {
  manual: 0,
  partial: 1,
  automated: 2,
};

/** Two statements per domain, keyed for the message catalog. */
export const questionIds = [
  'acq1',
  'acq2',
  'sal1',
  'sal2',
  'ops1',
  'ops2',
  'dat1',
  'dat2',
] as const;
export type QuestionId = (typeof questionIds)[number];

export const questionDomain: Record<QuestionId, DomainId> = {
  acq1: 'acquisition',
  acq2: 'acquisition',
  sal1: 'sales',
  sal2: 'sales',
  ops1: 'operations',
  ops2: 'operations',
  dat1: 'data',
  dat2: 'data',
};

export type ReadinessAnswers = Record<QuestionId, AnswerLevel>;

export const DEFAULT_READINESS_ANSWERS: ReadinessAnswers = Object.fromEntries(
  questionIds.map((id) => [id, 'partial']),
) as ReadinessAnswers;

export interface DomainScore {
  domain: DomainId;
  /** 0–100 for this domain alone. */
  score: number;
}

export interface ReadinessResult {
  /** Overall readiness, 0–100. */
  score: number;
  /** Every domain, weakest first — the weakest is where to start. */
  byDomain: DomainScore[];
  /** The domain to begin with: the weakest, ties broken by business order. */
  startWith: DomainId;
}

const MAX_PER_QUESTION = LEVEL_SCORE.automated;

/**
 * Score each domain independently, then rank. Ties break toward the earlier
 * domain in `domainIds` — the order a business actually runs — so a tied result
 * still recommends fixing the upstream problem first.
 */
export function scoreReadiness(answers: ReadinessAnswers): ReadinessResult {
  const totals = new Map<DomainId, { got: number; max: number }>();
  for (const domain of domainIds) totals.set(domain, { got: 0, max: 0 });

  for (const id of questionIds) {
    const level = answers[id] ?? 'partial';
    const bucket = totals.get(questionDomain[id])!;
    bucket.got += LEVEL_SCORE[level] ?? 0;
    bucket.max += MAX_PER_QUESTION;
  }

  const byDomain: DomainScore[] = domainIds.map((domain) => {
    const { got, max } = totals.get(domain)!;
    return { domain, score: max === 0 ? 0 : Math.round((got / max) * 100) };
  });

  const overallGot = [...totals.values()].reduce((sum, b) => sum + b.got, 0);
  const overallMax = [...totals.values()].reduce((sum, b) => sum + b.max, 0);

  // Sort a copy; `byDomain` keeps business order for display, ranked separately.
  const ranked = [...byDomain].sort(
    (a, b) =>
      a.score - b.score ||
      domainIds.indexOf(a.domain) - domainIds.indexOf(b.domain),
  );

  return {
    score: overallMax === 0 ? 0 : Math.round((overallGot / overallMax) * 100),
    byDomain: ranked,
    startWith: ranked[0]!.domain,
  };
}
