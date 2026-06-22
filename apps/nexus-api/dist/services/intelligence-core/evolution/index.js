"use strict";
// ---------------------------------------------------------------------------
// Intelligence Core — Evolution
// Continuous platform evolution: analyse performance, generate improvement
// proposals, expansion plans, and new capability recommendations.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureSnapshot = captureSnapshot;
exports.generateProposals = generateProposals;
exports.buildEvolutionReport = buildEvolutionReport;
const logger_1 = require("../../logger");
// ---------------------------------------------------------------------------
// Snapshot capture (stub — pull from analytics/DB in production)
// ---------------------------------------------------------------------------
async function captureSnapshot(period = "last_30_days") {
    (0, logger_1.logInfo)("evolution_snapshot_captured", { period });
    return {
        snapshotId: `snap-${Date.now()}`,
        period,
        capabilityUsage: {
            projects: 840,
            documents: 620,
            "chef-drew": 480,
            research: 80,
            pdf: 55,
            packages: 320,
            billing: 210,
        },
        userOutcomes: { success: 142, partial: 38, failure: 12 },
        topObjectives: ["Launch new product line", "Reduce operational costs", "Expand market presence"],
        unmetNeeds: ["Automated reporting", "Multi-language support", "Advanced analytics dashboard"],
        capturedAt: new Date().toISOString(),
    };
}
// ---------------------------------------------------------------------------
// Proposal generation (stub — replace with LLM)
// ---------------------------------------------------------------------------
async function generateProposals(snapshot) {
    (0, logger_1.logInfo)("evolution_proposals_generated", { snapshotId: snapshot.snapshotId });
    const proposals = [];
    for (const need of snapshot.unmetNeeds) {
        proposals.push({
            proposalId: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: "new_capability",
            title: `Implement: ${need}`,
            description: `Users have expressed need for "${need}". This capability is currently absent from the platform.`,
            rationale: `Identified as unmet need in ${snapshot.period}. Delivering this would directly address user gaps.`,
            impactScore: 75,
            priorityScore: 70,
            effort: "medium",
            generatedAt: new Date().toISOString(),
        });
    }
    const lowUsageCaps = Object.entries(snapshot.capabilityUsage)
        .filter(([, count]) => count < 100)
        .map(([cap]) => cap);
    for (const cap of lowUsageCaps) {
        proposals.push({
            proposalId: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: "improvement",
            title: `Improve discoverability of "${cap}"`,
            description: `"${cap}" has low adoption (${snapshot.capabilityUsage[cap]} events in ${snapshot.period}).`,
            rationale: "Surfacing this capability more prominently could increase adoption by 25-40%.",
            impactScore: 55,
            priorityScore: 50,
            effort: "small",
            generatedAt: new Date().toISOString(),
        });
    }
    return proposals;
}
// ---------------------------------------------------------------------------
// Full evolution report
// ---------------------------------------------------------------------------
async function buildEvolutionReport(period = "last_30_days") {
    const snapshot = await captureSnapshot(period);
    const proposals = await generateProposals(snapshot);
    const topPriorities = proposals
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 3)
        .map((p) => p.title);
    const report = {
        reportId: `evo-${Date.now()}`,
        period,
        snapshot,
        proposals,
        topPriorities,
        generatedAt: new Date().toISOString(),
    };
    (0, logger_1.logInfo)("evolution_report_built", {
        reportId: report.reportId,
        proposalCount: proposals.length,
        topPriorities,
    });
    return report;
}
//# sourceMappingURL=index.js.map