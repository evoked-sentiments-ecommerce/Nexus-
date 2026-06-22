export type AgentName = "research_architect" | "strategy_architect" | "business_architect" | "hospitality_architect" | "financial_architect" | "hr_architect" | "marketing_architect" | "design_architect" | "technology_architect" | "training_architect" | "operations_architect" | "optimization_architect" | "evolution_architect";
export type AgentStatus = "idle" | "running" | "completed" | "failed" | "waiting";
export interface AgentCapabilities {
    name: AgentName;
    description: string;
    domains: string[];
    inputTypes: string[];
    outputTypes: string[];
    canCollaborateWith: AgentName[];
}
export interface AgentTask {
    taskId: string;
    agentName: AgentName;
    taskType: string;
    input: Record<string, unknown>;
    requiredCollaborators?: AgentName[];
    sessionId: string;
    requestedBy?: string;
}
export interface AgentResult {
    taskId: string;
    agentName: AgentName;
    status: AgentStatus;
    output?: unknown;
    collaborationOutputs?: Partial<Record<AgentName, unknown>>;
    error?: string;
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
}
export interface CollaborationSession {
    sessionId: string;
    objective: string;
    participatingAgents: AgentName[];
    sharedMemory: Record<string, unknown>;
    tasks: AgentTask[];
    results: AgentResult[];
    status: "planning" | "executing" | "completed" | "failed";
    createdAt: string;
    completedAt?: string;
}
export declare function runAgent(task: AgentTask): Promise<AgentResult>;
/**
 * Create a new collaboration session where multiple agents work together
 * toward a shared objective using shared memory.
 */
export declare function createCollaborationSession(objective: string, agents: AgentName[]): CollaborationSession;
/**
 * Execute all tasks in a collaboration session, sharing outputs via
 * session memory so later agents can build on earlier results.
 */
export declare function executeCollaborationSession(sessionId: string, tasks: AgentTask[]): Promise<CollaborationSession>;
/**
 * Get an agent's capabilities.
 */
export declare function getAgentCapabilities(name: AgentName): AgentCapabilities;
/**
 * Get all registered agent capabilities.
 */
export declare function getAllAgentCapabilities(): AgentCapabilities[];
/**
 * Recommend agents for a given objective based on domain keywords.
 */
export declare function recommendAgentsForObjective(objective: string): AgentName[];
//# sourceMappingURL=index.d.ts.map