"use strict";
// ---------------------------------------------------------------------------
// Capability Registry — tracks all platform capabilities and detects gaps
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRegistry = initializeRegistry;
exports.getAll = getAll;
exports.getByName = getByName;
exports.upsert = upsert;
exports.recordUsage = recordUsage;
exports.updatePerformanceScore = updatePerformanceScore;
exports.detectGaps = detectGaps;
const logger_1 = require("../logger");
const inMemoryRegistry = new Map();
const KNOWN_CAPABILITIES = [
    { name: "market_research", domain: "research", status: "active", performanceScore: 85, coverageGaps: [] },
    { name: "competitive_analysis", domain: "research", status: "active", performanceScore: 80, coverageGaps: [] },
    { name: "financial_modeling", domain: "finance", status: "active", performanceScore: 75, coverageGaps: ["real-time data"] },
    { name: "menu_engineering", domain: "hospitality", status: "active", performanceScore: 90, coverageGaps: [] },
    { name: "brand_generation", domain: "design", status: "active", performanceScore: 78, coverageGaps: ["logo rendering"] },
    { name: "training_program_generation", domain: "training", status: "active", performanceScore: 82, coverageGaps: [] },
    { name: "strategic_planning", domain: "strategy", status: "active", performanceScore: 77, coverageGaps: ["market data integration"] },
    { name: "document_production", domain: "production", status: "active", performanceScore: 88, coverageGaps: [] },
];
async function dbQuery(text, params) {
    try {
        const { query } = require("../../database/connection");
        return await query(text, params);
    }
    catch {
        return { rows: [] };
    }
}
async function initializeRegistry() {
    (0, logger_1.logInfo)("capability_registry_initializing", { count: KNOWN_CAPABILITIES.length });
    for (const cap of KNOWN_CAPABILITIES) {
        await upsert(cap);
    }
    (0, logger_1.logInfo)("capability_registry_initialized", {});
}
async function getAll() {
    const result = await dbQuery("SELECT * FROM capability_registry ORDER BY name");
    if (result.rows.length > 0) {
        return result.rows;
    }
    return Array.from(inMemoryRegistry.values());
}
async function getByName(name) {
    const result = await dbQuery("SELECT * FROM capability_registry WHERE name = $1", [name]);
    if (result.rows.length > 0) {
        return result.rows[0];
    }
    return inMemoryRegistry.get(name) ?? null;
}
async function upsert(capability) {
    try {
        const result = await dbQuery(`INSERT INTO capability_registry (id, name, domain, status, performance_score, coverage_gaps, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET domain = $2, status = $3, performance_score = $4, coverage_gaps = $5, updated_at = NOW()
       RETURNING *`, [capability.name, capability.domain, capability.status, capability.performanceScore, JSON.stringify(capability.coverageGaps)]);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
    }
    catch {
        // fall through to in-memory store
    }
    inMemoryRegistry.set(capability.name, capability);
    return capability;
}
async function recordUsage(name) {
    try {
        await dbQuery("UPDATE capability_registry SET last_used_at = NOW() WHERE name = $1", [name]);
    }
    catch {
        const cap = inMemoryRegistry.get(name);
        if (cap) {
            cap.lastUsedAt = new Date().toISOString();
            inMemoryRegistry.set(name, cap);
        }
    }
    (0, logger_1.logInfo)("capability_usage_recorded", { name });
}
async function updatePerformanceScore(name, score) {
    try {
        await dbQuery("UPDATE capability_registry SET performance_score = $1, updated_at = NOW() WHERE name = $2", [score, name]);
    }
    catch {
        const cap = inMemoryRegistry.get(name);
        if (cap) {
            cap.performanceScore = score;
            inMemoryRegistry.set(name, cap);
        }
    }
}
function detectGaps(objectives, recentFailures) {
    const gaps = [];
    for (const failure of recentFailures) {
        gaps.push({ domain: "general", gap: `Failure in: ${failure}`, severity: "high" });
    }
    const objectiveCoverage = objectives.filter((objective) => !Array.from(inMemoryRegistry.values()).some((cap) => objective.includes(cap.name)));
    for (const objective of objectiveCoverage) {
        gaps.push({ domain: "strategy", gap: `No direct capability mapped for objective: ${objective}`, severity: "low" });
    }
    const allCaps = Array.from(inMemoryRegistry.values());
    const underperforming = allCaps.filter((c) => c.performanceScore < 70);
    for (const cap of underperforming) {
        gaps.push({ domain: cap.domain, gap: `${cap.name} underperforming (score: ${cap.performanceScore})`, severity: "medium" });
    }
    return {
        reportId: `gap-report-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        totalCapabilities: allCaps.length,
        activeCapabilities: allCaps.filter((c) => c.status === "active").length,
        gaps,
        recommendations: gaps.length > 0 ? ["Review underperforming capabilities", "Add missing domain coverage"] : ["Platform capabilities are healthy"],
    };
}
//# sourceMappingURL=registry.js.map