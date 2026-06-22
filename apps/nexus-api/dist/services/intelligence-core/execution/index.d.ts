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
export type WorkflowName = "onboarding" | "project_kickoff" | "brand_review" | "package_delivery" | "billing_renewal" | "chef_drew_blueprint" | "research_cycle" | "capability_expansion" | "evolution_cycle";
export interface WorkflowInput {
    workflow: WorkflowName;
    params: Record<string, unknown>;
    triggeredBy?: string;
    priority?: "high" | "normal" | "low";
}
export declare function executeWorkflow(input: WorkflowInput): Promise<ExecutionRecord>;
export interface JobInput {
    jobName: string;
    payload: Record<string, unknown>;
    scheduledAt?: string;
    priority?: "high" | "normal" | "low";
}
export declare function triggerJob(input: JobInput): Promise<ExecutionRecord>;
export type DocumentTemplate = "project_brief" | "brand_guidelines" | "hospitality_blueprint" | "package_summary" | "research_report" | "financial_model" | "training_manual" | "sop_manual" | "pitch_deck" | "investor_deck";
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
export declare function triggerDocumentGeneration(input: DocumentGenerationInput): Promise<DocumentGenerationRecord>;
export interface AgentTaskInput {
    agentName: string;
    taskType: string;
    payload: Record<string, unknown>;
    sessionId?: string;
}
export declare function dispatchAgentTask(input: AgentTaskInput): Promise<ExecutionRecord>;
//# sourceMappingURL=index.d.ts.map