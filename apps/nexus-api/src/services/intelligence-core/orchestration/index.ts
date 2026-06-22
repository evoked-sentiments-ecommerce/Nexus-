// ---------------------------------------------------------------------------
// Intelligence Core — Orchestration
// Coordinates the full intelligence pipeline across all sub-systems,
// manages agent collaboration, and drives autonomous objective achievement.
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../../logger";
import { runIntelligenceCycle, IntelligenceContext, CycleResult } from "../kernel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrchestrationRequest {
  requestId: string;
  objective: string;
  userId?: string;
  projectId?: string;
  context?: Record<string, unknown>;
  autonomyLevel: "supervised" | "semi_autonomous" | "autonomous";
}

export interface OrchestrationPlan {
  planId: string;
  requestId: string;
  phases: OrchestrationPhase[];
  estimatedCycles: number;
  createdAt: string;
}

export interface OrchestrationPhase {
  phaseId: string;
  name: string;
  description: string;
  capabilities: string[];
  order: number;
  dependsOn: string[];
}

export interface OrchestrationResult {
  requestId: string;
  planId: string;
  cyclesExecuted: number;
  outputs: unknown[];
  finalState: Record<string, unknown>;
  completedAt: string;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Orchestration planning (stub — replace with LLM-driven decomposition)
// ---------------------------------------------------------------------------

export async function planOrchestration(request: OrchestrationRequest): Promise<OrchestrationPlan> {
  logInfo("orchestration_plan_created", {
    requestId: request.requestId,
    objective: request.objective.slice(0, 80),
    autonomyLevel: request.autonomyLevel,
  });

  const phases: OrchestrationPhase[] = [
    {
      phaseId: `${request.requestId}-ph-1`,
      name: "Discovery",
      description: "Observe context, recall relevant memory, gather knowledge.",
      capabilities: ["observe", "remember"],
      order: 1,
      dependsOn: [],
    },
    {
      phaseId: `${request.requestId}-ph-2`,
      name: "Intelligence",
      description: "Learn from context, reason about options, predict outcomes, simulate scenarios.",
      capabilities: ["learn", "reason", "predict", "simulate"],
      order: 2,
      dependsOn: [`${request.requestId}-ph-1`],
    },
    {
      phaseId: `${request.requestId}-ph-3`,
      name: "Planning",
      description: "Decompose objective into a concrete execution plan.",
      capabilities: ["plan"],
      order: 3,
      dependsOn: [`${request.requestId}-ph-2`],
    },
    {
      phaseId: `${request.requestId}-ph-4`,
      name: "Execution",
      description: "Execute the plan, generate assets, trigger workflows.",
      capabilities: ["execute"],
      order: 4,
      dependsOn: [`${request.requestId}-ph-3`],
    },
    {
      phaseId: `${request.requestId}-ph-5`,
      name: "Evaluation & Evolution",
      description: "Evaluate outcomes, capture learnings, propose improvements.",
      capabilities: ["evaluate", "improve", "evolve"],
      order: 5,
      dependsOn: [`${request.requestId}-ph-4`],
    },
  ];

  return {
    planId: `orch-plan-${request.requestId}`,
    requestId: request.requestId,
    phases,
    estimatedCycles: phases.length,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Orchestration execution
// ---------------------------------------------------------------------------

/**
 * Execute a full orchestration plan, running each phase as an intelligence
 * cycle and collecting outputs across all phases.
 */
export async function executeOrchestration(
  request: OrchestrationRequest,
  plan: OrchestrationPlan
): Promise<OrchestrationResult> {
  const start = Date.now();
  const allOutputs: unknown[] = [];
  let cyclesExecuted = 0;

  logInfo("orchestration_started", {
    requestId: request.requestId,
    planId: plan.planId,
    phaseCount: plan.phases.length,
  });

  for (const phase of plan.phases.sort((a, b) => a.order - b.order)) {
    const ctx: IntelligenceContext = {
      cycleId: `${request.requestId}-${phase.phaseId}`,
      userId: request.userId,
      projectId: request.projectId,
      objective: request.objective,
      inputs: { phase: phase.name, ...(request.context ?? {}) },
      memory: {},
    };

    try {
      const result: CycleResult = await runIntelligenceCycle(ctx, phase.capabilities as never);
      allOutputs.push({ phase: phase.name, result });
      cyclesExecuted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("orchestration_phase_error", { requestId: request.requestId, phase: phase.name, error: msg });
    }
  }

  const result: OrchestrationResult = {
    requestId: request.requestId,
    planId: plan.planId,
    cyclesExecuted,
    outputs: allOutputs,
    finalState: { objective: request.objective, autonomyLevel: request.autonomyLevel },
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
  };

  logInfo("orchestration_completed", {
    requestId: request.requestId,
    cyclesExecuted,
    durationMs: result.durationMs,
  });

  return result;
}

// ---------------------------------------------------------------------------
// High-level convenience: plan + execute in one call
// ---------------------------------------------------------------------------

export async function orchestrate(request: OrchestrationRequest): Promise<OrchestrationResult> {
  const plan = await planOrchestration(request);
  return executeOrchestration(request, plan);
}
