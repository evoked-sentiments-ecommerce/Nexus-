"use strict";
// ---------------------------------------------------------------------------
// Blueprint Generator — orchestrates hospitality agents to produce full blueprints
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBlueprint = generateBlueprint;
const logger_1 = require("../logger");
const agents_1 = require("../agents");
const pdfGenerator_1 = require("../pdfGenerator");
async function generateBlueprint(context, sessionId) {
    const sid = sessionId ?? `bp-session-${Date.now()}`;
    (0, logger_1.logInfo)("blueprint_generation_started", { operation: context.operationName, domain: context.domain });
    const agentResults = await Promise.all([
        (0, agents_1.runAgent)({ taskId: `${sid}-hospitality`, agentName: "hospitality_architect", taskType: "create_concept", input: { context }, sessionId: sid }),
        (0, agents_1.runAgent)({ taskId: `${sid}-financial`, agentName: "financial_architect", taskType: "build_financial_model", input: { context }, sessionId: sid }),
        (0, agents_1.runAgent)({ taskId: `${sid}-training`, agentName: "training_architect", taskType: "create_training_outline", input: { context }, sessionId: sid }),
        (0, agents_1.runAgent)({ taskId: `${sid}-operations`, agentName: "operations_architect", taskType: "design_operations", input: { context }, sessionId: sid }),
    ]);
    const trainingSummary = String(agentResults[2].output?.summary ?? "Comprehensive training program");
    const blueprint = {
        blueprintId: `bp-${Date.now()}`,
        operationName: context.operationName,
        domain: context.domain,
        concept: String(agentResults[0].output?.summary ?? `${context.operationName} concept`),
        targetGuest: "Discerning guests seeking quality, consistency, and memorable experiences.",
        designPrinciples: ["Guest experience first", "Operational excellence", "Continuous improvement", "Team empowerment"],
        operationalModel: String(agentResults[3].output?.summary ?? `${context.domain} operating model`),
        revenueStreams: ["Food & Beverage", "Private Dining", "Events", "Merchandise"],
        keyDifferentiators: ["Agent-orchestrated planning", "Data-informed hospitality design", "Chef Drew operating standards"],
        technologyStack: ["Nexus Intelligence Platform", "POS integration", "Inventory management", "Training platform"],
        staffingModel: `${context.teamSize ?? 10} person operating team`,
        financialTargets: {
            targetFoodCostPct: 28,
            targetLaborCostPct: 32,
            targetPrimeCostPct: 60,
            targetEbitdaPct: 18,
        },
        implementationPhases: [
            { phase: 1, name: "Foundation", duration: "Month 1-2", milestones: ["Concept defined", "Financial targets set"], keyDeliverables: ["Concept brief", "Financial model"] },
            { phase: 2, name: "Build", duration: "Month 2-4", milestones: ["Operations designed", "Training developed"], keyDeliverables: ["Operating model", "Training outline"] },
            { phase: 3, name: "Launch", duration: "Month 4-6", milestones: ["Soft launch", "Full launch"], keyDeliverables: ["Launch plan", "Opening playbook"] },
        ],
        menuSummary: { sections: 3, totalItems: 24, avgFoodCostPct: 28, highlights: ["Signature dishes", "Seasonal menu"] },
        foodCostModel: { targetFoodCostPct: 28, currentFoodCostPct: 30, recommendations: ["Reduce portion waste", "Negotiate supplier contracts"] },
        laborModel: { totalWeeklyHours: (context.teamSize ?? 10) * 40, laborCostPct: 32, positions: [] },
        sops: ["Opening procedures", "Closing procedures", "Food safety protocols", "Customer service standards"],
        trainingOutline: trainingSummary,
        generatedAt: new Date().toISOString(),
    };
    let pdfResult = null;
    try {
        pdfResult = await (0, pdfGenerator_1.generatePDF)({
            title: `${context.operationName} — Hospitality Blueprint`,
            subtitle: context.domain,
            sections: [
                { title: "Concept", content: blueprint.concept },
                { title: "Food Cost Model", content: JSON.stringify(blueprint.foodCostModel) },
                { title: "Labor Model", content: JSON.stringify(blueprint.laborModel) },
                { title: "SOPs", content: (blueprint.sops ?? []).join("\n") },
                { title: "Training Outline", content: blueprint.trainingOutline ?? trainingSummary },
            ],
        });
    }
    catch (err) {
        (0, logger_1.logError)("blueprint_pdf_error", { message: err instanceof Error ? err.message : String(err) });
    }
    (0, logger_1.logInfo)("blueprint_generation_complete", { blueprintId: blueprint.blueprintId });
    return { blueprint, pdfResult };
}
//# sourceMappingURL=blueprintGenerator.js.map