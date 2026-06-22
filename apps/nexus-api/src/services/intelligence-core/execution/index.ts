// ---------------------------------------------------------------------------
// Intelligence Core — Execution
// Execute platform workflows, trigger background jobs, trigger document and
// asset generation, and dispatch agent tasks.
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExecutionStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface ExecutionRecord {
  executionId: string;
  type: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Workflow execution
// ---------------------------------------------------------------------------

export type WorkflowName =
  | "onboarding"
  | "project_kickoff"
  | "brand_review"
  | "package_delivery"
  | "billing_renewal"
  | "chef_drew_blueprint"
  | "research_cycle"
  | "capability_expansion"
  | "evolution_cycle";

export interface WorkflowInput {
  workflow: WorkflowName;
  params: Record<string, unknown>;
  triggeredBy?: string;
  priority?: "high" | "normal" | "low";
}

export async function executeWorkflow(input: WorkflowInput): Promise<ExecutionRecord> {
  const executionId = `wf-${input.workflow}-${Date.now()}`;
  const startedAt = new Date().toISOString();

  logInfo("execution_workflow_started", {
    executionId,
    workflow: input.workflow,
    triggeredBy: input.triggeredBy,
  });

  try {
    // Stub — replace with real workflow engine (Temporal, BullMQ, etc.)
    const output = { workflow: input.workflow, params: input.params, status: "simulated" };
    const record: ExecutionRecord = {
      executionId,
      type: `workflow:${input.workflow}`,
      status: "completed",
      input: input.params,
      output,
      startedAt,
      completedAt: new Date().toISOString(),
    };
    logInfo("execution_workflow_completed", { executionId });
    return record;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError("execution_workflow_failed", { executionId, error });
    return { executionId, type: `workflow:${input.workflow}`, status: "failed", input: input.params, error, startedAt, completedAt: new Date().toISOString() };
  }
}

// ---------------------------------------------------------------------------
// Job triggering
// ---------------------------------------------------------------------------

export interface JobInput {
  jobName: string;
  payload: Record<string, unknown>;
  scheduledAt?: string;
  priority?: "high" | "normal" | "low";
}

export async function triggerJob(input: JobInput): Promise<ExecutionRecord> {
  const executionId = `job-${input.jobName}-${Date.now()}`;
  logInfo("execution_job_triggered", { executionId, jobName: input.jobName, priority: input.priority ?? "normal" });
  // Stub — replace with BullMQ/SQS publish
  return {
    executionId,
    type: `job:${input.jobName}`,
    status: "queued",
    input: input.payload,
    output: { queued: true },
    startedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Document generation
// ---------------------------------------------------------------------------

export type DocumentTemplate =
  | "project_brief"
  | "brand_guidelines"
  | "hospitality_blueprint"
  | "package_summary"
  | "research_report"
  | "financial_model"
  | "training_manual"
  | "sop_manual"
  | "pitch_deck"
  | "investor_deck";

export interface DocumentGenerationInput {
  template: DocumentTemplate;
  entityId: string;
  data: Record<string, unknown>;
  outputFormats?: Array<"pdf" | "docx" | "pptx" | "html">;
  requestedBy?: string;
}

export interface DocumentGenerationRecord extends ExecutionRecord {
  documentUrls: Partial<Record<string, string>>;
}

export async function triggerDocumentGeneration(input: DocumentGenerationInput): Promise<DocumentGenerationRecord> {
  const executionId = `doc-${input.template}-${input.entityId}-${Date.now()}`;
  const formats = input.outputFormats ?? ["pdf"];

  logInfo("execution_document_generation_triggered", {
    executionId,
    template: input.template,
    entityId: input.entityId,
    formats,
  });

  // Stub — replace with PDF generator / document assembly service call
  const documentUrls: Partial<Record<string, string>> = {};
  for (const fmt of formats) {
    documentUrls[fmt] = `/documents/${input.template}/${input.entityId}.${fmt}`;
  }

  return {
    executionId,
    type: `document:${input.template}`,
    status: "queued",
    input: input.data,
    documentUrls,
    startedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Agent task dispatch
// ---------------------------------------------------------------------------

export interface AgentTaskInput {
  agentName: string;
  taskType: string;
  payload: Record<string, unknown>;
  sessionId?: string;
}

export async function dispatchAgentTask(input: AgentTaskInput): Promise<ExecutionRecord> {
  const executionId = `agent-${input.agentName}-${Date.now()}`;
  logInfo("execution_agent_task_dispatched", {
    executionId,
    agentName: input.agentName,
    taskType: input.taskType,
  });
  // Stub — replace with agent runtime dispatch
  return {
    executionId,
    type: `agent:${input.agentName}:${input.taskType}`,
    status: "queued",
    input: input.payload,
    startedAt: new Date().toISOString(),
  };
}
