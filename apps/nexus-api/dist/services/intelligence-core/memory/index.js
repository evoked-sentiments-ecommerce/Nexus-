"use strict";
// ---------------------------------------------------------------------------
// Intelligence Core — Memory
// Multi-scope persistent memory: project, customer, blueprint, research,
// agent, capability, and episodic event memory.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.remember = remember;
exports.recall = recall;
exports.query = query;
exports.forget = forget;
exports.recordEvent = recordEvent;
exports.getEpisodicLog = getEpisodicLog;
const logger_1 = require("../../logger");
// ---------------------------------------------------------------------------
// Store (stub — replace with vector DB or PostgreSQL JSONB)
// ---------------------------------------------------------------------------
const store = new Map();
function key(scope, entityId) {
    return `${scope}:${entityId}`;
}
function build(scope, entityId, payload, tags = [], ttl) {
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
async function remember(scope, entityId, payload, tags = [], ttl) {
    const entry = build(scope, entityId, payload, tags, ttl);
    store.set(key(scope, entityId), entry);
    (0, logger_1.logInfo)("memory_written", { scope, entityId, version: entry.version });
    return entry;
}
// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------
async function recall(scope, entityId) {
    return store.get(key(scope, entityId)) ?? null;
}
async function query(q) {
    return Array.from(store.values()).filter((e) => {
        if (q.scope && e.scope !== q.scope)
            return false;
        if (q.entityId && e.entityId !== q.entityId)
            return false;
        if (q.tags?.length) {
            const hasAll = q.tags.every((t) => e.tags.includes(t));
            if (!hasAll)
                return false;
        }
        return true;
    });
}
// ---------------------------------------------------------------------------
// Forget
// ---------------------------------------------------------------------------
async function forget(scope, entityId) {
    store.delete(key(scope, entityId));
    (0, logger_1.logInfo)("memory_forgotten", { scope, entityId });
}
const episodicLog = [];
async function recordEvent(event) {
    const entry = { ...event, occurredAt: new Date().toISOString() };
    episodicLog.push(entry);
    (0, logger_1.logInfo)("episodic_event_recorded", {
        eventType: entry.eventType,
        actorId: entry.actorId,
        entityType: entry.entityType,
    });
    return entry;
}
async function getEpisodicLog(entityType, entityId) {
    return episodicLog.filter((e) => {
        if (entityType && e.entityType !== entityType)
            return false;
        if (entityId && e.entityId !== entityId)
            return false;
        return true;
    });
}
//# sourceMappingURL=index.js.map