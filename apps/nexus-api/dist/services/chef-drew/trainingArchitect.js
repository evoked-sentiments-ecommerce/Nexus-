"use strict";
// ---------------------------------------------------------------------------
// Training Architect — generates SOPs, HACCP, and training programs
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSOPs = generateSOPs;
exports.generateHACCPPlan = generateHACCPPlan;
exports.generateOnboardingProgram = generateOnboardingProgram;
exports.generateTrainingProgram = generateTrainingProgram;
const logger_1 = require("../logger");
const llm_1 = require("../llm");
async function generateSOPs(context) {
    const prompt = `Generate standard operating procedures for ${context.operationName} (${context.domain}). Include opening, service, and closing procedures.`;
    await (0, llm_1.completeChat)([{ role: "user", content: prompt }]);
    (0, logger_1.logInfo)("sops_generated", { operation: context.operationName });
    return [
        { title: "Opening Procedures", department: "All", steps: ["Check all equipment", "Temperature checks", "Mise en place setup", "Staff briefing"], frequency: "Daily" },
        { title: "Food Safety Protocol", department: "Kitchen", steps: ["Temperature logging", "FIFO rotation", "Allergen segregation", "Cross-contamination prevention"], frequency: "Daily" },
        { title: "Closing Procedures", department: "All", steps: ["Deep clean all surfaces", "Equipment shutdown", "Inventory count", "Lock-up checklist"], frequency: "Daily" },
    ];
}
async function generateHACCPPlan(context) {
    const prompt = `Generate a HACCP plan for ${context.operationName}. Include critical control points and monitoring procedures.`;
    await (0, llm_1.completeChat)([{ role: "user", content: prompt }]);
    (0, logger_1.logInfo)("haccp_generated", { operation: context.operationName });
    return {
        hazardAnalysis: ["Biological: bacteria in raw proteins", "Chemical: cleaning agents", "Physical: foreign objects in food"],
        criticalControlPoints: ["Receiving temperature control", "Cold storage (< 5°C)", "Cooking temperatures", "Hot holding (> 63°C)"],
        monitoring: ["Temperature logs every 2 hours", "Daily equipment calibration", "Supplier delivery checks"],
        corrective: ["Discard non-conforming food", "Retrain staff", "Equipment repair/replacement"],
    };
}
async function generateOnboardingProgram(context) {
    (0, logger_1.logInfo)("onboarding_generated", { operation: context.operationName });
    return {
        weeks: 4,
        checklist: ["Complete food safety certification", "Shadow experienced staff", "Learn menu and allergens", "Complete service simulations", "Independent service assessment"],
        learningPath: ["Week 1: Orientation & Safety", "Week 2: Menu Knowledge & Kitchen Skills", "Week 3: Service Standards", "Week 4: Supervised Independent Service"],
    };
}
async function generateTrainingProgram(context) {
    const [sops, haccpPlan, onboarding] = await Promise.all([
        generateSOPs(context),
        generateHACCPPlan(context),
        generateOnboardingProgram(context),
    ]);
    (0, logger_1.logInfo)("training_program_generated", { operation: context.operationName });
    return { sops, haccpPlan, onboarding, generatedAt: new Date().toISOString() };
}
//# sourceMappingURL=trainingArchitect.js.map