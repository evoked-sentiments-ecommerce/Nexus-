// ---------------------------------------------------------------------------
// Kernel — Central orchestration layer for the Nexus Intelligence Core.
//
// The Kernel wires together all intelligence subsystems (memory, planner,
// reasoning, executor, learning, evolution) and exposes a single entry point
// for running an intelligence cycle against a given context.
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntelligenceModule =
  | "memory"
  | "planner"
  | "reasoning"
  | "executor"
  | "learning"
  | "evolution";

export interface KernelContext {
  /** Unique identifier for the session / request driving this cycle. */
  sessionId: string;
  /** Authenticated user ID, if available. */
  userId?: string;
  /** Project scope, if the cycle is scoped to a single project. */
  projectId?: string;
  /** Arbitrary key-value bag of extra context. */
  meta?: Record<string, unknown>;
}

export interface KernelResult {
  sessionId: string;
  modulesRun: IntelligenceModule[];
  durationMs: number;
  outputs: Partial<Record<IntelligenceModule, unknown>>;
  errors: Partial<Record<IntelligenceModule, string>>;
}

export interface ModuleHandler<TInput = KernelContext, TOutput = unknown> {
  name: IntelligenceModule;
  run(input: TInput): Promise<TOutput>;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<IntelligenceModule, ModuleHandler>();

/**
 * Register an intelligence module with the kernel.
 * Later registrations overwrite earlier ones for the same module name.
 */
export function registerModule(handler: ModuleHandler): void {
  registry.set(handler.name, handler);
  logInfo("kernel_module_registered", { module: handler.name });
}

/**
 * Return the handler registered for a given module, or undefined.
 */
export function getModule(name: IntelligenceModule): ModuleHandler | undefined {
  return registry.get(name);
}

// ---------------------------------------------------------------------------
// Cycle execution
// ---------------------------------------------------------------------------

/**
 * Run an ordered intelligence cycle.
 *
 * Modules execute sequentially in the order supplied (defaults to the
 * canonical pipeline order).  Each module receives the shared KernelContext;
 * its output is stored in the result bag and can be accessed by subsequent
 * modules via the context meta field if wired accordingly.
 *
 * Failures in one module are captured and logged without aborting the rest of
 * the pipeline.
 */
export async function runCycle(
  ctx: KernelContext,
  modules: IntelligenceModule[] = [
    "memory",
    "planner",
    "reasoning",
    "executor",
    "learning",
    "evolution",
  ]
): Promise<KernelResult> {
  const start = Date.now();
  const outputs: Partial<Record<IntelligenceModule, unknown>> = {};
  const errors: Partial<Record<IntelligenceModule, string>> = {};
  const modulesRun: IntelligenceModule[] = [];

  logInfo("kernel_cycle_started", { sessionId: ctx.sessionId, modules });

  for (const name of modules) {
    const handler = registry.get(name);
    if (!handler) {
      logInfo("kernel_module_skipped", { sessionId: ctx.sessionId, module: name, reason: "not_registered" });
      continue;
    }

    try {
      outputs[name] = await handler.run(ctx);
      modulesRun.push(name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors[name] = message;
      logError("kernel_module_error", { sessionId: ctx.sessionId, module: name, error: message });
    }
  }

  const result: KernelResult = {
    sessionId: ctx.sessionId,
    modulesRun,
    durationMs: Date.now() - start,
    outputs,
    errors,
  };

  logInfo("kernel_cycle_completed", {
    sessionId: ctx.sessionId,
    modulesRun,
    durationMs: result.durationMs,
    errorCount: Object.keys(errors).length,
  });

  return result;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/**
 * Return the names of all currently registered modules.
 */
export function registeredModules(): IntelligenceModule[] {
  return Array.from(registry.keys());
}
