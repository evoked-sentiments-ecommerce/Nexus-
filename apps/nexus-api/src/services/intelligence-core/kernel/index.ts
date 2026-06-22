// ---------------------------------------------------------------------------
// Intelligence Core — Kernel
// Central orchestration layer. Bootstraps all intelligence sub-systems and
// drives the Observe→Remember→Learn→Reason→Predict→Simulate→Plan→Execute→
// Evaluate→Improve→Evolve capability loop.
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CapabilityName =
  | "observe"
  | "remember"
  | "learn"
  | "reason"
  | "predict"
  | "simulate"
  | "plan"
  | "execute"
  | "evaluate"
  | "improve"
  | "evolve";

export interface IntelligenceContext {
  cycleId: string;
  userId?: string;
  projectId?: string;
  objective?: string;
  inputs: Record<string, unknown>;
  memory: Record<string, unknown>;
}

export interface CapabilityHandler {
  name: CapabilityName;
  run(ctx: IntelligenceContext): Promise<unknown>;
}

export interface CycleResult {
  cycleId: string;
  capabilitiesRun: CapabilityName[];
  outputs: Partial<Record<CapabilityName, unknown>>;
  errors: Partial<Record<CapabilityName, string>>;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<CapabilityName, CapabilityHandler>();

export function registerCapability(handler: CapabilityHandler): void {
  registry.set(handler.name, handler);
  logInfo("intelligence_kernel_capability_registered", { capability: handler.name });
}

export function getCapability(name: CapabilityName): CapabilityHandler | undefined {
  return registry.get(name);
}

export function registeredCapabilities(): CapabilityName[] {
  return Array.from(registry.keys());
}

// ---------------------------------------------------------------------------
// Intelligence cycle
// ---------------------------------------------------------------------------

const CANONICAL_CYCLE: CapabilityName[] = [
  "observe",
  "remember",
  "learn",
  "reason",
  "predict",
  "simulate",
  "plan",
  "execute",
  "evaluate",
  "improve",
  "evolve",
];

/**
 * Run a full or partial intelligence cycle.
 * Each capability receives the shared context enriched with prior outputs.
 * Failures are captured without aborting subsequent capabilities.
 */
export async function runIntelligenceCycle(
  ctx: IntelligenceContext,
  capabilities: CapabilityName[] = CANONICAL_CYCLE
): Promise<CycleResult> {
  const start = Date.now();
  const outputs: Partial<Record<CapabilityName, unknown>> = {};
  const errors: Partial<Record<CapabilityName, string>> = {};
  const capabilitiesRun: CapabilityName[] = [];

  logInfo("intelligence_cycle_started", {
    cycleId: ctx.cycleId,
    objective: ctx.objective,
    capabilities,
  });

  for (const name of capabilities) {
    const handler = registry.get(name);
    if (!handler) {
      logInfo("intelligence_cycle_capability_skipped", { cycleId: ctx.cycleId, capability: name });
      continue;
    }
    try {
      const enrichedCtx: IntelligenceContext = {
        ...ctx,
        inputs: { ...ctx.inputs, ...outputs },
      };
      outputs[name] = await handler.run(enrichedCtx);
      capabilitiesRun.push(name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors[name] = msg;
      logError("intelligence_cycle_capability_error", {
        cycleId: ctx.cycleId,
        capability: name,
        error: msg,
      });
    }
  }

  const result: CycleResult = {
    cycleId: ctx.cycleId,
    capabilitiesRun,
    outputs,
    errors,
    durationMs: Date.now() - start,
  };

  logInfo("intelligence_cycle_completed", {
    cycleId: ctx.cycleId,
    capabilitiesRun,
    errorCount: Object.keys(errors).length,
    durationMs: result.durationMs,
  });

  return result;
}
