import { describe, expect, it } from 'vitest';
import { buildScopePlan, moduleIds, urgencies, type ModuleId } from '@/lib/scope';

describe('buildScopePlan', () => {
  it('returns an empty plan for no selection', () => {
    const plan = buildScopePlan([]);
    expect(plan.modules).toEqual([]);
    expect(plan.phases).toEqual([]);
    expect(plan.totalWeeks).toBe(0);
  });

  it('pulls in dependencies and reports which were added', () => {
    // "order by message" needs the assistant to exist.
    const plan = buildScopePlan(['orderByMessage']);
    expect(plan.modules).toContain('assistant');
    expect(plan.addedDependencies).toContain('assistant');
  });

  it('resolves transitive dependencies', () => {
    // loyalty → campaign; woocommerce → store
    const plan = buildScopePlan(['loyalty', 'woocommerce']);
    expect(plan.modules).toEqual(
      expect.arrayContaining(['loyalty', 'campaign', 'woocommerce', 'store']),
    );
  });

  it('does not report an explicitly chosen module as auto-added', () => {
    const plan = buildScopePlan(['assistant', 'orderByMessage']);
    expect(plan.addedDependencies).not.toContain('assistant');
  });

  it('places every dependency no later than the module that needs it', () => {
    const plan = buildScopePlan(['loyalty', 'orderByMessage', 'woocommerce']);
    const phaseOf = new Map<ModuleId, number>();
    for (const p of plan.phases) {
      for (const m of p.modules) phaseOf.set(m, p.phase);
    }
    const deps: Array<[ModuleId, ModuleId]> = [
      ['orderByMessage', 'assistant'],
      ['loyalty', 'campaign'],
      ['woocommerce', 'store'],
    ];
    for (const [module, dep] of deps) {
      expect(phaseOf.get(dep)!).toBeLessThanOrEqual(phaseOf.get(module)!);
    }
  });

  it('puts every selected module in exactly one phase', () => {
    const plan = buildScopePlan([...moduleIds]);
    const placed = plan.phases.flatMap((p) => p.modules);
    expect([...placed].sort()).toEqual([...plan.modules].sort());
    expect(new Set(placed).size).toBe(placed.length);
  });

  it('numbers phases consecutively from 1', () => {
    const plan = buildScopePlan([...moduleIds]);
    expect(plan.phases.map((p) => p.phase)).toEqual(
      plan.phases.map((_, i) => i + 1),
    );
  });

  it('splits a large selection into multiple phases', () => {
    expect(buildScopePlan([...moduleIds]).phases.length).toBeGreaterThan(1);
  });

  it('adjusts the timeline by urgency without changing scope', () => {
    const selection: ModuleId[] = ['store', 'assistant'];
    const plans = urgencies.map((u) => buildScopePlan(selection, u));
    const [relaxed, normal, urgent] = plans;
    // Same modules regardless of urgency.
    for (const plan of plans) {
      expect(plan.modules).toEqual(normal!.modules);
    }
    expect(relaxed!.totalWeeks).toBeGreaterThanOrEqual(normal!.totalWeeks);
    expect(urgent!.totalWeeks).toBeLessThanOrEqual(normal!.totalWeeks);
  });

  it('keeps every phase at least one week', () => {
    for (const u of urgencies) {
      for (const p of buildScopePlan([...moduleIds], u).phases) {
        expect(p.weeks).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('lists each prerequisite once and never "none"', () => {
    const plan = buildScopePlan([...moduleIds]);
    expect(new Set(plan.prerequisites).size).toBe(plan.prerequisites.length);
    expect(plan.prerequisites).not.toContain('none');
  });

  it('ignores unknown module ids', () => {
    const plan = buildScopePlan(['store', 'not-a-module' as ModuleId]);
    expect(plan.modules).toEqual(['store']);
  });

  it('produces no pricing information anywhere in the plan', () => {
    // The plan promises scope and timing only (plan §5.4).
    const serialized = JSON.stringify(buildScopePlan([...moduleIds]));
    expect(serialized).not.toMatch(/price|cost|toman|تومان|ریال/i);
  });
});
