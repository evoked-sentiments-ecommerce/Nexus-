export type MemoryScope = "project" | "customer" | "blueprint" | "research" | "agent" | "capability" | "episodic";
export interface MemoryEntry<T = unknown> {
    id: string;
    scope: MemoryScope;
    entityId: string;
    payload: T;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    version: number;
    ttl?: number;
}
export interface MemoryQuery {
    scope?: MemoryScope;
    entityId?: string;
    tags?: string[];
}
export declare function remember<T>(scope: MemoryScope, entityId: string, payload: T, tags?: string[], ttl?: number): Promise<MemoryEntry<T>>;
export declare function recall<T = unknown>(scope: MemoryScope, entityId: string): Promise<MemoryEntry<T> | null>;
export declare function query<T = unknown>(q: MemoryQuery): Promise<MemoryEntry<T>[]>;
export declare function forget(scope: MemoryScope, entityId: string): Promise<void>;
export interface EpisodicEvent {
    eventType: string;
    actorId: string;
    entityType: string;
    entityId: string;
    details: Record<string, unknown>;
    occurredAt: string;
}
export declare function recordEvent(event: Omit<EpisodicEvent, "occurredAt">): Promise<EpisodicEvent>;
export declare function getEpisodicLog(entityType?: string, entityId?: string): Promise<EpisodicEvent[]>;
//# sourceMappingURL=index.d.ts.map