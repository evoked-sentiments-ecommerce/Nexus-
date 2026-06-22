"use strict";
// ---------------------------------------------------------------------------
// Intelligence Core — Execution
// Execute platform workflows, trigger background jobs, trigger document and
// asset generation, and dispatch agent tasks.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWorkflow = executeWorkflow;
exports.triggerJob = triggerJob;
exports.triggerDocumentGeneration = triggerDocumentGeneration;
exports.dispatchAgentTask = dispatchAgentTask;
const logger_1 = require("../../logger");
async function executeWorkflow(input) {
    const executionId = `wf-${input.workflow}-${Date.now()}`;
    const startedAt = new Date().toISOString();
    (0, logger_1.logInfo)("execution_workflow_started", {
        executionId,
        workflow: input.workflow,
        triggeredBy: input.triggeredBy,
    });
    try {
        // Stub — replace with real workflow engine (Temporal, BullMQ, etc.)
        const output = { workflow: input.workflow, params: input.params, status: "simulated" };
        const record = {
            executionId,
            type: `workflow:${input.workflow}`,
            status: "completed",
            input: input.params,
            output,
            startedAt,
            completedAt: new Date().toISOString(),
        };
        (0, logger_1.logInfo)("execution_workflow_completed", { executionId });
        return record;
    }
    catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        (0, logger_1.logError)("execution_workflow_failed", { executionId, error });
        return { executionId, type: `workflow:${input.workflow}`, status: "failed", input: input.params, error, startedAt, completedAt: new Date().toISOString() };
    }
}
async function triggerJob(input) {
    const executionId = `job-${input.jobName}-${Date.now()}`;
    (0, logger_1.logInfo)("execution_job_triggered", { executionId, jobName: input.jobName, priority: input.priority ?? "normal" });
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
async function triggerDocumentGeneration(input) {
    const executionId = `doc-${input.template}-${input.entityId}-${Date.now()}`;
    const formats = input.outputFormats ?? ["pdf"];
    (0, logger_1.logInfo)("execution_document_generation_triggered", {
        executionId,
        template: input.template,
        entityId: input.entityId,
        formats,
    });
    // Stub — replace with PDF generator / document assembly service call
    const documentUrls = {};
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
async function dispatchAgentTask(input) {
    const executionId = `agent-${input.agentName}-${Date.now()}`;
    (0, logger_1.logInfo)("execution_agent_task_dispatched", {
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
//# sourceMappingURL=index.js.map