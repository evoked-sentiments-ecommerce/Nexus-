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
export type WorkflowName = "onboarding" | "project_kickoff" | "brand_review" | "package_delivery" | "billing_renewal" | "chef_drew_blueprint";
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
export declare function executeWorkflow(input: WorkflowInput): Promise<ExecutionResult>;
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
export declare function triggerJob(input: JobTriggerInput): Promise<ExecutionResult>;
export type DocumentTemplate = "project_brief" | "brand_guidelines" | "hospitality_blueprint" | "package_summary" | "research_report" | "billing_invoice";
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
export declare function triggerDocumentGeneration(input: DocumentGenerationInput): Promise<DocumentGenerationResult>;
//# sourceMappingURL=index.d.ts.map