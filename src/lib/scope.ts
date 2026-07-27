// Package configurator (plan §5.4). The visitor picks modules and an urgency,
// and gets back a scope summary, a suggested phase split, and prerequisites.
// NO PRICES — output is scope and timing only; pricing happens in the call.

export const moduleIds = [
  'store',
  'assistant',
  'orderByMessage',
  'campaign',
  'loyalty',
  'booking',
  'woocommerce',
] as const;

export type ModuleId = (typeof moduleIds)[number];

export function isModuleId(value: unknown): value is ModuleId {
  return typeof value === 'string' && (moduleIds as readonly string[]).includes(value);
}

export const urgencies = ['relaxed', 'normal', 'urgent'] as const;
export type Urgency = (typeof urgencies)[number];

interface ModuleSpec {
  /** Rough build effort in weeks, used only to phase the work. */
  weeks: number;
  /** Modules that must ship first for this one to make sense. */
  requires: ModuleId[];
  /** Prerequisite the client must supply. */
  needsFromClient: 'catalog' | 'customerList' | 'channel' | 'none';
}

const MODULES: Record<ModuleId, ModuleSpec> = {
  store: { weeks: 4, requires: [], needsFromClient: 'catalog' },
  assistant: { weeks: 3, requires: [], needsFromClient: 'catalog' },
  orderByMessage: { weeks: 2, requires: ['assistant'], needsFromClient: 'channel' },
  campaign: { weeks: 2, requires: [], needsFromClient: 'customerList' },
  loyalty: { weeks: 3, requires: ['campaign'], needsFromClient: 'customerList' },
  booking: { weeks: 2, requires: [], needsFromClient: 'none' },
  woocommerce: { weeks: 2, requires: ['store'], needsFromClient: 'none' },
};

/** Urgency compresses or relaxes the schedule; it never changes the scope. */
const URGENCY_FACTOR: Record<Urgency, number> = {
  relaxed: 1.3,
  normal: 1,
  urgent: 0.8,
};

export interface ScopePhase {
  /** 1-based phase number. */
  phase: number;
  modules: ModuleId[];
  weeks: number;
}

export interface ScopePlan {
  modules: ModuleId[];
  phases: ScopePhase[];
  totalWeeks: number;
  /** Distinct things the client must provide before work starts. */
  prerequisites: Array<ModuleSpec['needsFromClient']>;
  /** Modules auto-added because a selected module depends on them. */
  addedDependencies: ModuleId[];
}

/**
 * Expand the selection to include dependencies. Choosing "order by message"
 * without the assistant, for example, isn't a buildable scope — so we add it
 * and say so rather than quietly producing a plan that can't work.
 */
function withDependencies(selected: ModuleId[]): {
  modules: ModuleId[];
  added: ModuleId[];
} {
  const set = new Set<ModuleId>(selected);
  const added: ModuleId[] = [];

  // Iterate to a fixed point so transitive requirements resolve too.
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...set]) {
      for (const dep of MODULES[id].requires) {
        if (!set.has(dep)) {
          set.add(dep);
          added.push(dep);
          changed = true;
        }
      }
    }
  }

  // Keep the canonical module order so output is stable and predictable.
  return {
    modules: moduleIds.filter((id) => set.has(id)),
    added: moduleIds.filter((id) => added.includes(id)),
  };
}

/**
 * Build the scope plan: modules in dependency order, split into phases that
 * each stay under a usable size, with a timeline adjusted for urgency.
 */
export function buildScopePlan(
  selected: ModuleId[],
  urgency: Urgency = 'normal',
): ScopePlan {
  const { modules, added } = withDependencies(selected.filter(isModuleId));

  if (modules.length === 0) {
    return {
      modules: [],
      phases: [],
      totalWeeks: 0,
      prerequisites: [],
      addedDependencies: [],
    };
  }

  // Order so dependencies land in an earlier or the same phase.
  const ordered = [...modules].sort(
    (a, b) => MODULES[a].requires.length - MODULES[b].requires.length,
  );

  // Pack phases up to ~6 weeks so every phase ships something usable
  // (plan §16: each phase has its own output).
  const MAX_PHASE_WEEKS = 6;
  const phases: ScopePhase[] = [];
  let current: ModuleId[] = [];
  let currentWeeks = 0;

  for (const id of ordered) {
    const weeks = MODULES[id].weeks;
    if (current.length > 0 && currentWeeks + weeks > MAX_PHASE_WEEKS) {
      phases.push({ phase: phases.length + 1, modules: current, weeks: currentWeeks });
      current = [];
      currentWeeks = 0;
    }
    current.push(id);
    currentWeeks += weeks;
  }
  if (current.length > 0) {
    phases.push({ phase: phases.length + 1, modules: current, weeks: currentWeeks });
  }

  const factor = URGENCY_FACTOR[urgency];
  const adjusted = phases.map((p) => ({
    ...p,
    weeks: Math.max(1, Math.round(p.weeks * factor)),
  }));

  const prerequisites = [
    ...new Set(
      modules
        .map((id) => MODULES[id].needsFromClient)
        .filter((need): need is Exclude<ModuleSpec['needsFromClient'], 'none'> =>
          need !== 'none',
        ),
    ),
  ];

  return {
    modules,
    phases: adjusted,
    totalWeeks: adjusted.reduce((sum, p) => sum + p.weeks, 0),
    prerequisites,
    addedDependencies: added,
  };
}
