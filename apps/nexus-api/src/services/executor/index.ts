// ---------------------------------------------------------------------------
// Executor Service — execute platform workflows, trigger background jobs,
// and trigger document generation within the Nexus Intelligence Core.
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExecutionStatus = "queued" | "running" | "completed" | "failed";

export interface ExecutionResult {
  executionId: string;
  type: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
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
  | "chef_drew_blueprint";

export interface WorkflowInput {
  workflow: WorkflowName;
  params: Record<string, unknown>;
  triggeredBy?: string;
}

/**
 * Execute a named platform workflow.
 *
 * Workflows orchestrate multi-step sequences (e.g. create project → notify
 * team → generate initial brief).  Replace stub bodies with real workflow
 * engine calls (e.g. Temporal, Bull, or direct service calls).
 */
export async function executeWorkflow(input: WorkflowInput): Promise<ExecutionResult> {
  const executionId = `wf-${input.workflow}-${Date.now()}`;
  const startedAt = new Date().toISOString();

  logInfo("executor_workflow_started", {
    executionId,
    workflow: input.workflow,
    triggeredBy: input.triggeredBy,
  });

  try {
    // Stub — replace with real workflow engine dispatch.
    const output = await runWorkflowStub(input);

    const result: ExecutionResult = {
      executionId,
      type: `workflow:${input.workflow}`,
      status: "completed",
      startedAt,
      completedAt: new Date().toISOString(),
      output,
    };

    logInfo("executor_workflow_completed", { executionId, workflow: input.workflow });
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError("executor_workflow_failed", { executionId, workflow: input.workflow, error });
    return {
      executionId,
      type: `workflow:${input.workflow}`,
      status: "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      error,
    };
  }
}

// ---------------------------------------------------------------------------
// Job triggering
// ---------------------------------------------------------------------------

export interface JobTriggerInput {
  jobName: string;
  payload: Record<string, unknown>;
  scheduledAt?: string;
  priority?: "high" | "normal" | "low";
}

/**
 * Enqueue a background job.
 *
 * Replace the stub body with a real queue integration (e.g. BullMQ, SQS).
 */
export async function triggerJob(input: JobTriggerInput): Promise<ExecutionResult> {
  const executionId = `job-${input.jobName}-${Date.now()}`;
  const startedAt = new Date().toISOString();

  logInfo("executor_job_triggered", {
    executionId,
    jobName: input.jobName,
    priority: input.priority ?? "normal",
    scheduledAt: input.scheduledAt,
  });

  // Stub — replace with real queue publish call.
  return {
    executionId,
    type: `job:${input.jobName}`,
    status: "queued",
    startedAt,
    output: { queued: true, payload: input.payload },
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
  | "billing_invoice";

export interface DocumentGenerationInput {
  template: DocumentTemplate;
  entityId: string;
  data: Record<string, unknown>;
  requestedBy?: string;
}

export interface DocumentGenerationResult extends ExecutionResult {
  documentUrl?: string;
}

/**
 * Trigger document generation for a given template and entity.
 *
 * Internally enqueues a PDF generation job and returns the execution result.
 * Replace stub body with a real call to the PDF generator service or job queue.
 */
export async function triggerDocumentGeneration(
  input: DocumentGenerationInput
): Promise<DocumentGenerationResult> {
  const executionId = `doc-${input.template}-${input.entityId}-${Date.now()}`;
  const startedAt = new Date().toISOString();

  logInfo("executor_document_generation_triggered", {
    executionId,
    template: input.template,
    entityId: input.entityId,
    requestedBy: input.requestedBy,
  });

  // Stub — replace with real call to pdfGenerator or job queue.
  const documentUrl = `/documents/${input.template}/${input.entityId}.pdf`;

  return {
    executionId,
    type: `document:${input.template}`,
    status: "queued",
    startedAt,
    output: { entityId: input.entityId, template: input.template },
    documentUrl,
  };
}

// ---------------------------------------------------------------------------
// Internal stubs
// ---------------------------------------------------------------------------

async function runWorkflowStub(input: WorkflowInput): Promise<unknown> {
  // Stub — each case should dispatch to the appropriate service sequence.
  switch (input.workflow) {
    case "onboarding":
      return { step: "welcome_email_sent", params: input.params };
    case "project_kickoff":
      return { step: "brief_generated", params: input.params };
    case "brand_review":
      return { step: "review_queued", params: input.params };
    case "package_delivery":
      return { step: "package_dispatched", params: input.params };
    case "billing_renewal":
      return { step: "invoice_created", params: input.params };
    case "chef_drew_blueprint":
      return { step: "blueprint_draft_created", params: input.params };
    default:
      return { step: "noop", params: input.params };
  }
}
