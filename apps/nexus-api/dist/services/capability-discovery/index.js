"use strict";
// ---------------------------------------------------------------------------
// Capability Discovery Engine — identifies missing capabilities, workflow
// gaps, production gaps, and business opportunities; outputs structured
// proposals with impact, priority scores, and implementation plans.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessPlatform = assessPlatform;
exports.identifyGaps = identifyGaps;
exports.generateProposals = generateProposals;
exports.runCapabilityDiscovery = runCapabilityDiscovery;
const logger_1 = require("../logger");
// ---------------------------------------------------------------------------
// Assessment (stub — replace with analytics data pull + LLM analysis)
// ---------------------------------------------------------------------------
async function assessPlatform(period = "last_30_days") {
    (0, logger_1.logInfo)("capability_discovery_assessment", { period });
    return {
        assessmentId: `assess-${Date.now()}`,
        currentCapabilities: [
            "project_management", "document_generation", "brand_management",
            "research", "pdf_generation", "package_delivery", "billing",
            "chef_drew_blueprints", "storage", "email",
        ],
        currentWorkflows: [
            "onboarding", "project_kickoff", "package_delivery", "billing_renewal",
        ],
        currentProductionOutputs: ["pdf", "docx", "package_zip"],
        observedUserNeeds: [
            "Automated financial modelling",
            "Real-time competitive intelligence",
            "AI-assisted menu engineering",
            "Multi-format presentation generation",
            "Automated SOP creation",
            "Integrated training platform",
        ],
        observedFailurePoints: [
            "Manual data entry for financial models",
            "No real-time market data",
            "Limited design asset generation",
        ],
        period,
        generatedAt: new Date().toISOString(),
    };
}
// ---------------------------------------------------------------------------
// Gap identification (stub — replace with LLM analysis)
// ---------------------------------------------------------------------------
async function identifyGaps(assessment) {
    (0, logger_1.logInfo)("capability_discovery_gaps_identified", { assessmentId: assessment.assessmentId });
    const gaps = [];
    for (const need of assessment.observedUserNeeds) {
        const isMet = assessment.currentCapabilities.some((c) => need.toLowerCase().includes(c.replace(/_/g, " ")));
        if (!isMet) {
            gaps.push({
                gapId: `gap-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                category: inferCategory(need),
                title: need,
                description: `Users require "${need}" but no current capability addresses this need.`,
                userImpact: "Users must use external tools, creating workflow fragmentation.",
                frequency: "frequent",
                discoveredAt: new Date().toISOString(),
            });
        }
    }
    for (const failure of assessment.observedFailurePoints) {
        gaps.push({
            gapId: `gap-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            category: "workflow",
            title: `Fix: ${failure}`,
            description: failure,
            userImpact: "Creates friction and reduces platform trust.",
            frequency: "frequent",
            discoveredAt: new Date().toISOString(),
        });
    }
    return gaps;
}
// ---------------------------------------------------------------------------
// Proposal generation (stub — replace with LLM)
// ---------------------------------------------------------------------------
async function generateProposals(gaps) {
    (0, logger_1.logInfo)("capability_discovery_proposals_generated", { gapCount: gaps.length });
    return gaps.map((gap, i) => ({
        proposalId: `prop-${gap.gapId}`,
        gapId: gap.gapId,
        title: `Implement: ${gap.title}`,
        description: `Build capability to address gap: "${gap.description}"`,
        category: gap.category,
        impactScore: gap.frequency === "constant" ? 90 : gap.frequency === "frequent" ? 75 : 50,
        priorityScore: 80 - i * 5,
        effortScore: 50,
        implementationPlan: [
            { order: 1, title: "Discovery & scoping", description: "Define requirements and acceptance criteria.", effort: "small", dependencies: [] },
            { order: 2, title: "Architecture & design", description: "Design service architecture and data model.", effort: "medium", dependencies: ["Discovery & scoping"] },
            { order: 3, title: "Implementation", description: "Build and test the capability.", effort: "large", dependencies: ["Architecture & design"] },
            { order: 4, title: "Integration & deployment", description: "Wire into platform and deploy.", effort: "medium", dependencies: ["Implementation"] },
        ],
        requiredIntegrations: [],
        generatedAt: new Date().toISOString(),
    }));
}
// ---------------------------------------------------------------------------
// Full discovery pipeline
// ---------------------------------------------------------------------------
async function runCapabilityDiscovery(period = "last_30_days") {
    const assessment = await assessPlatform(period);
    const gaps = await identifyGaps(assessment);
    const proposals = await generateProposals(gaps);
    (0, logger_1.logInfo)("capability_discovery_completed", { gapCount: gaps.length, proposalCount: proposals.length });
    return { assessment, gaps, proposals };
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function inferCategory(need) {
    const n = need.toLowerCase();
    if (n.includes("workflow") || n.includes("process") || n.includes("sop"))
        return "workflow";
    if (n.includes("financial") || n.includes("model") || n.includes("cost"))
        return "production";
    if (n.includes("analytics") || n.includes("report") || n.includes("intelligence"))
        return "analytics";
    if (n.includes("automat"))
        return "automation";
    if (n.includes("integrat") || n.includes("connect"))
        return "integration";
    return "capability";
}
//# sourceMappingURL=index.js.map