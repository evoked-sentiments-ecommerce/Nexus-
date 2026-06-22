"use strict";
// ---------------------------------------------------------------------------
// Memory Service — long-term intelligence memory for projects, customers,
// and hospitality blueprints.
//
// Memory records are stored as JSON blobs keyed by type + entity ID.  In
// production, back the store with a database table or a vector store for
// semantic retrieval.  The current implementation provides the typed API and
// an in-process Map as a development-time stub.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertProjectMemory = upsertProjectMemory;
exports.getProjectMemory = getProjectMemory;
exports.upsertCustomerMemory = upsertCustomerMemory;
exports.getCustomerMemory = getCustomerMemory;
exports.upsertBlueprintMemory = upsertBlueprintMemory;
exports.getBlueprintMemory = getBlueprintMemory;
exports.forgetMemory = forgetMemory;
exports.listMemory = listMemory;
exports.upsertMemoryEntry = upsertMemoryEntry;
exports.getMemoryEntries = getMemoryEntries;
exports.searchMemoryByDomain = searchMemoryByDomain;
exports.searchMemoryByAgent = searchMemoryByAgent;
const logger_1 = require("../logger");
/**
 * Persist or update long-term memory for a project.
 */
async function upsertProjectMemory(data) {
    const record = buildRecord("project", data.projectId, data);
    store.set(memoryKey("project", data.projectId), record);
    (0, logger_1.logInfo)("memory_upserted", { type: "project", entityId: data.projectId });
    return record;
}
/**
 * Retrieve long-term memory for a project, or null if none exists.
 */
async function getProjectMemory(projectId) {
    return store.get(memoryKey("project", projectId)) ?? null;
}
/**
 * Persist or update long-term memory for a customer.
 */
async function upsertCustomerMemory(data) {
    const record = buildRecord("customer", data.customerId, data);
    store.set(memoryKey("customer", data.customerId), record);
    (0, logger_1.logInfo)("memory_upserted", { type: "customer", entityId: data.customerId });
    return record;
}
/**
 * Retrieve long-term memory for a customer, or null if none exists.
 */
async function getCustomerMemory(customerId) {
    return store.get(memoryKey("customer", customerId)) ?? null;
}
/**
 * Persist or update long-term memory for a hospitality blueprint.
 */
async function upsertBlueprintMemory(data) {
    const record = buildRecord("blueprint", data.blueprintId, data);
    store.set(memoryKey("blueprint", data.blueprintId), record);
    (0, logger_1.logInfo)("memory_upserted", { type: "blueprint", entityId: data.blueprintId });
    return record;
}
/**
 * Retrieve long-term memory for a blueprint, or null if none exists.
 */
async function getBlueprintMemory(blueprintId) {
    return store.get(memoryKey("blueprint", blueprintId)) ?? null;
}
// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
/**
 * Delete a memory record by type and entity ID.
 */
async function forgetMemory(type, entityId) {
    store.delete(memoryKey(type, entityId));
    (0, logger_1.logInfo)("memory_forgotten", { type, entityId });
}
/**
 * List all memory records of a given type.
 */
async function listMemory(type) {
    const prefix = `${type}:`;
    return Array.from(store.entries())
        .filter(([k]) => k.startsWith(prefix))
        .map(([, v]) => v);
}
// ---------------------------------------------------------------------------
// Internal store (stub — replace with DB / vector store in production)
// ---------------------------------------------------------------------------
const store = new Map();
function memoryKey(type, entityId) {
    return `${type}:${entityId}`;
}
function buildRecord(type, entityId, data) {
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
/**
 * Upsert a memory entry to the DB-backed store.
 */
async function upsertMemoryEntry(entry) {
    try {
        const { query } = require("../../database/connection");
        const result = await query(`INSERT INTO memory_entries (id, session_id, source_agent, domain, content, tags, metadata, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT DO NOTHING
       RETURNING *`, [
            entry.sessionId,
            entry.sourceAgent,
            entry.domain,
            entry.content,
            JSON.stringify(entry.tags ?? []),
            JSON.stringify(entry.metadata ?? {}),
        ]);
        (0, logger_1.logInfo)("memory_entry_upserted", { sessionId: entry.sessionId, domain: entry.domain });
        return result.rows[0] ?? entry;
    }
    catch {
        (0, logger_1.logWarn)("memory_entry_db_unavailable", { sessionId: entry.sessionId });
        return entry;
    }
}
/**
 * Get memory entries by session ID.
 */
async function getMemoryEntries(filter) {
    try {
        const { query } = require("../../database/connection");
        const conditions = [];
        const params = [];
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
        const result = await query(`SELECT * FROM memory_entries ${where} ORDER BY created_at DESC`, params);
        return result.rows;
    }
    catch {
        return [];
    }
}
async function searchMemoryByDomain(domain, _limit = 10) {
    return getMemoryEntries({ domain });
}
async function searchMemoryByAgent(agentName, sessionId) {
    return getMemoryEntries({ sourceAgent: agentName, ...(sessionId ? { sessionId } : {}) });
}
//# sourceMappingURL=index.js.map