export type MemoryType = "project" | "customer" | "blueprint";
export interface MemoryRecord<T = unknown> {
    type: MemoryType;
    entityId: string;
    data: T;
    createdAt: string;
    updatedAt: string;
    version: number;
}
export interface ProjectMemory {
    projectId: string;
    name: string;
    goals: string[];
    completedObjectives: string[];
    activeObjectives: string[];
    keyDecisions: string[];
    tags: string[];
    notes?: string;
}
/**
 * Persist or update long-term memory for a project.
 */
export declare function upsertProjectMemory(data: ProjectMemory): Promise<MemoryRecord<ProjectMemory>>;
/**
 * Retrieve long-term memory for a project, or null if none exists.
 */
export declare function getProjectMemory(projectId: string): Promise<MemoryRecord<ProjectMemory> | null>;
export interface CustomerMemory {
    customerId: string;
    name: string;
    preferences: Record<string, unknown>;
    interactionSummary: string[];
    segmentTags: string[];
    lastSeenAt?: string;
}
/**
 * Persist or update long-term memory for a customer.
 */
export declare function upsertCustomerMemory(data: CustomerMemory): Promise<MemoryRecord<CustomerMemory>>;
/**
 * Retrieve long-term memory for a customer, or null if none exists.
 */
export declare function getCustomerMemory(customerId: string): Promise<MemoryRecord<CustomerMemory> | null>;
export interface BlueprintMemory {
    blueprintId: string;
    title: string;
    concept: string;
    keyElements: string[];
    iterationNotes: string[];
    status: "draft" | "active" | "archived";
}
/**
 * Persist or update long-term memory for a hospitality blueprint.
 */
export declare function upsertBlueprintMemory(data: BlueprintMemory): Promise<MemoryRecord<BlueprintMemory>>;
/**
 * Retrieve long-term memory for a blueprint, or null if none exists.
 */
export declare function getBlueprintMemory(blueprintId: string): Promise<MemoryRecord<BlueprintMemory> | null>;
/**
 * Delete a memory record by type and entity ID.
 */
export declare function forgetMemory(type: MemoryType, entityId: string): Promise<void>;
/**
 * List all memory records of a given type.
 */
export declare function listMemory<T = unknown>(type: MemoryType): Promise<MemoryRecord<T>[]>;
export interface MemoryEntry {
    id?: string;
    sessionId: string;
    sourceAgent: string;
    domain: string;
    content: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    createdAt?: string;
}
/**
 * Upsert a memory entry to the DB-backed store.
 */
export declare function upsertMemoryEntry(entry: MemoryEntry): Promise<MemoryEntry>;
/**
 * Get memory entries by session ID.
 */
export declare function getMemoryEntries(filter: {
    sessionId?: string;
    domain?: string;
    sourceAgent?: string;
}): Promise<MemoryEntry[]>;
export declare function searchMemoryByDomain(domain: string, _limit?: number): Promise<MemoryEntry[]>;
export declare function searchMemoryByAgent(agentName: string, sessionId?: string): Promise<MemoryEntry[]>;
//# sourceMappingURL=index.d.ts.map