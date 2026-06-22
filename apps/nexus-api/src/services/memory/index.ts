// ---------------------------------------------------------------------------
// Memory Service — long-term intelligence memory for projects, customers,
// and hospitality blueprints.
//
// Memory records are stored as JSON blobs keyed by type + entity ID.  In
// production, back the store with a database table or a vector store for
// semantic retrieval.  The current implementation provides the typed API and
// an in-process Map as a development-time stub.
// ---------------------------------------------------------------------------

import { logInfo, logWarn } from "../logger";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type MemoryType = "project" | "customer" | "blueprint";

export interface MemoryRecord<T = unknown> {
  type: MemoryType;
  entityId: string;
  data: T;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ---------------------------------------------------------------------------
// Project Memory
// ---------------------------------------------------------------------------

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
export async function upsertProjectMemory(data: ProjectMemory): Promise<MemoryRecord<ProjectMemory>> {
  const record = buildRecord("project", data.projectId, data);
  store.set(memoryKey("project", data.projectId), record);
  logInfo("memory_upserted", { type: "project", entityId: data.projectId });
  return record as MemoryRecord<ProjectMemory>;
}

/**
 * Retrieve long-term memory for a project, or null if none exists.
 */
export async function getProjectMemory(projectId: string): Promise<MemoryRecord<ProjectMemory> | null> {
  return (store.get(memoryKey("project", projectId)) as MemoryRecord<ProjectMemory>) ?? null;
}

// ---------------------------------------------------------------------------
// Customer Memory
// ---------------------------------------------------------------------------

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
export async function upsertCustomerMemory(data: CustomerMemory): Promise<MemoryRecord<CustomerMemory>> {
  const record = buildRecord("customer", data.customerId, data);
  store.set(memoryKey("customer", data.customerId), record);
  logInfo("memory_upserted", { type: "customer", entityId: data.customerId });
  return record as MemoryRecord<CustomerMemory>;
}

/**
 * Retrieve long-term memory for a customer, or null if none exists.
 */
export async function getCustomerMemory(customerId: string): Promise<MemoryRecord<CustomerMemory> | null> {
  return (store.get(memoryKey("customer", customerId)) as MemoryRecord<CustomerMemory>) ?? null;
}

// ---------------------------------------------------------------------------
// Blueprint Memory
// ---------------------------------------------------------------------------

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
export async function upsertBlueprintMemory(data: BlueprintMemory): Promise<MemoryRecord<BlueprintMemory>> {
  const record = buildRecord("blueprint", data.blueprintId, data);
  store.set(memoryKey("blueprint", data.blueprintId), record);
  logInfo("memory_upserted", { type: "blueprint", entityId: data.blueprintId });
  return record as MemoryRecord<BlueprintMemory>;
}

/**
 * Retrieve long-term memory for a blueprint, or null if none exists.
 */
export async function getBlueprintMemory(blueprintId: string): Promise<MemoryRecord<BlueprintMemory> | null> {
  return (store.get(memoryKey("blueprint", blueprintId)) as MemoryRecord<BlueprintMemory>) ?? null;
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/**
 * Delete a memory record by type and entity ID.
 */
export async function forgetMemory(type: MemoryType, entityId: string): Promise<void> {
  store.delete(memoryKey(type, entityId));
  logInfo("memory_forgotten", { type, entityId });
}

/**
 * List all memory records of a given type.
 */
export async function listMemory<T = unknown>(type: MemoryType): Promise<MemoryRecord<T>[]> {
  const prefix = `${type}:`;
  return Array.from(store.entries())
    .filter(([k]) => k.startsWith(prefix))
    .map(([, v]) => v as MemoryRecord<T>);
}

// ---------------------------------------------------------------------------
// Internal store (stub — replace with DB / vector store in production)
// ---------------------------------------------------------------------------

const store = new Map<string, MemoryRecord>();

function memoryKey(type: MemoryType, entityId: string): string {
  return `${type}:${entityId}`;
}

function buildRecord<T>(type: MemoryType, entityId: string, data: T): MemoryRecord<T> {
  const now = new Date().toISOString();
  const existing = store.get(memoryKey(type, entityId));
  return {
    type,
    entityId,
    data,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
  };
}


// ---------------------------------------------------------------------------
// DB-backed memory entries (agent/session memory)
// ---------------------------------------------------------------------------

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
export async function upsertMemoryEntry(entry: MemoryEntry): Promise<MemoryEntry> {
  try {
    const { query }: {
      query: <T = unknown>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>;
    } = require("../../database/connection");
    const result = await query<MemoryEntry>(
      `INSERT INTO memory_entries (id, session_id, source_agent, domain, content, tags, metadata, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        entry.sessionId,
        entry.sourceAgent,
        entry.domain,
        entry.content,
        JSON.stringify(entry.tags ?? []),
        JSON.stringify(entry.metadata ?? {}),
      ]
    );
    logInfo("memory_entry_upserted", { sessionId: entry.sessionId, domain: entry.domain });
    return result.rows[0] ?? entry;
  } catch {
    logWarn("memory_entry_db_unavailable", { sessionId: entry.sessionId });
    return entry;
  }
}

/**
 * Get memory entries by session ID.
 */
export async function getMemoryEntries(filter: { sessionId?: string; domain?: string; sourceAgent?: string }): Promise<MemoryEntry[]> {
  try {
    const { query }: {
      query: <T = unknown>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>;
    } = require("../../database/connection");
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (filter.sessionId) {
      conditions.push(`session_id = $${idx++}`);
      params.push(filter.sessionId);
    }
    if (filter.domain) {
      conditions.push(`domain = $${idx++}`);
      params.push(filter.domain);
    }
    if (filter.sourceAgent) {
      conditions.push(`source_agent = $${idx++}`);
      params.push(filter.sourceAgent);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await query<MemoryEntry>(`SELECT * FROM memory_entries ${where} ORDER BY created_at DESC`, params);
    return result.rows;
  } catch {
    return [];
  }
}

export async function searchMemoryByDomain(domain: string, _limit = 10): Promise<MemoryEntry[]> {
  return getMemoryEntries({ domain });
}

export async function searchMemoryByAgent(agentName: string, sessionId?: string): Promise<MemoryEntry[]> {
  return getMemoryEntries({ sourceAgent: agentName, ...(sessionId ? { sessionId } : {}) });
}
