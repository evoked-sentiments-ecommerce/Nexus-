// ---------------------------------------------------------------------------
// Intelligence Core — Memory
// Multi-scope persistent memory: project, customer, blueprint, research,
// agent, capability, and episodic event memory.
// ---------------------------------------------------------------------------

import { logInfo } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryScope =
  | "project"
  | "customer"
  | "blueprint"
  | "research"
  | "agent"
  | "capability"
  | "episodic";

export interface MemoryEntry<T = unknown> {
  id: string;
  scope: MemoryScope;
  entityId: string;
  payload: T;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  ttl?: number; // seconds; undefined = permanent
}

export interface MemoryQuery {
  scope?: MemoryScope;
  entityId?: string;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Store (stub — replace with vector DB or PostgreSQL JSONB)
// ---------------------------------------------------------------------------

const store = new Map<string, MemoryEntry>();

function key(scope: MemoryScope, entityId: string): string {
  return `${scope}:${entityId}`;
}

function build<T>(scope: MemoryScope, entityId: string, payload: T, tags: string[] = [], ttl?: number): MemoryEntry<T> {
  const now = new Date().toISOString();
  const existing = store.get(key(scope, entityId));
  return {
    id: existing?.id ?? `mem-${scope}-${entityId}-${Date.now()}`,
    scope,
    entityId,
    payload,
    tags,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
    ttl,
  };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function remember<T>(
  scope: MemoryScope,
  entityId: string,
  payload: T,
  tags: string[] = [],
  ttl?: number
): Promise<MemoryEntry<T>> {
  const entry = build(scope, entityId, payload, tags, ttl);
  store.set(key(scope, entityId), entry as MemoryEntry);
  logInfo("memory_written", { scope, entityId, version: entry.version });
  return entry;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function recall<T = unknown>(
  scope: MemoryScope,
  entityId: string
): Promise<MemoryEntry<T> | null> {
  return (store.get(key(scope, entityId)) as MemoryEntry<T>) ?? null;
}

export async function query<T = unknown>(q: MemoryQuery): Promise<MemoryEntry<T>[]> {
  return Array.from(store.values()).filter((e) => {
    if (q.scope && e.scope !== q.scope) return false;
    if (q.entityId && e.entityId !== q.entityId) return false;
    if (q.tags?.length) {
      const hasAll = q.tags.every((t) => e.tags.includes(t));
      if (!hasAll) return false;
    }
    return true;
  }) as MemoryEntry<T>[];
}

// ---------------------------------------------------------------------------
// Forget
// ---------------------------------------------------------------------------

export async function forget(scope: MemoryScope, entityId: string): Promise<void> {
  store.delete(key(scope, entityId));
  logInfo("memory_forgotten", { scope, entityId });
}

// ---------------------------------------------------------------------------
// Episodic event log
// ---------------------------------------------------------------------------

export interface EpisodicEvent {
  eventType: string;
  actorId: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  occurredAt: string;
}

const episodicLog: EpisodicEvent[] = [];

export async function recordEvent(event: Omit<EpisodicEvent, "occurredAt">): Promise<EpisodicEvent> {
  const entry: EpisodicEvent = { ...event, occurredAt: new Date().toISOString() };
  episodicLog.push(entry);
  logInfo("episodic_event_recorded", {
    eventType: entry.eventType,
    actorId: entry.actorId,
    entityType: entry.entityType,
  });
  return entry;
}

export async function getEpisodicLog(entityType?: string, entityId?: string): Promise<EpisodicEvent[]> {
  return episodicLog.filter((e) => {
    if (entityType && e.entityType !== entityType) return false;
    if (entityId && e.entityId !== entityId) return false;
    return true;
  });
}
