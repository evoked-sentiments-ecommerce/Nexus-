"use strict";
// ---------------------------------------------------------------------------
// Chef Drew Intelligence Division — autonomous hospitality intelligence
// service layer. Covers restaurants, hotels, resorts, private members clubs,
// luxury destinations, culinary operations, and hospitality finance.
//
// Generates: menus, recipes, costing models, production schedules, prep
// lists, training programs, SOPs, HACCP, inventory systems, blueprints.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMenu = generateMenu;
exports.generateRecipe = generateRecipe;
exports.generateCostModel = generateCostModel;
exports.generateProductionSchedule = generateProductionSchedule;
exports.generateTrainingProgram = generateTrainingProgram;
exports.generateSOPManual = generateSOPManual;
exports.generateHACCPPlan = generateHACCPPlan;
exports.generateBlueprint = generateBlueprint;
const logger_1 = require("../logger");
// ---------------------------------------------------------------------------
// Generation functions (stubs — replace with LLM + culinary data)
// ---------------------------------------------------------------------------
async function generateMenu(ctx, sectionNames) {
    (0, logger_1.logInfo)("chef_drew_menu_generated", { operation: ctx.operationName, sections: sectionNames.length });
    const sections = sectionNames.map((name) => ({
        name,
        items: [
            buildMenuItem(name, "Signature Dish", 32, 8.50),
            buildMenuItem(name, "Chef's Special", 28, 7.00),
            buildMenuItem(name, "Classic Favourite", 24, 9.50),
        ],
    }));
    const allItems = sections.flatMap((s) => s.items);
    const avgFoodCostPct = allItems.reduce((s, i) => s + i.foodCostPct, 0) / allItems.length;
    return {
        menuId: `menu-${Date.now()}`,
        name: `${ctx.operationName} Menu`,
        operationName: ctx.operationName,
        concept: ctx.cuisineStyle ?? "Contemporary",
        sections,
        engineeringAnalysis: {
            avgFoodCostPct: Math.round(avgFoodCostPct * 10) / 10,
            avgContribution: Math.round(allItems.reduce((s, i) => s + i.contribution, 0) / allItems.length * 100) / 100,
            stars: allItems.filter((i) => i.menuCategory === "star").map((i) => i.name),
            plowHorses: allItems.filter((i) => i.menuCategory === "plow_horse").map((i) => i.name),
            puzzles: allItems.filter((i) => i.menuCategory === "puzzle").map((i) => i.name),
            dogs: allItems.filter((i) => i.menuCategory === "dog").map((i) => i.name),
            recommendations: [
                "Feature Stars prominently. Promote Puzzles to increase volume.",
                "Review Dog items for removal or repositioning.",
                `Target food cost is ${avgFoodCostPct > 32 ? "above" : "within"} optimal range.`,
            ],
        },
        generatedAt: new Date().toISOString(),
    };
}
async function generateRecipe(name, portions, targetFoodCostPct) {
    (0, logger_1.logInfo)("chef_drew_recipe_generated", { name, portions });
    const ingredients = [
        buildIngredient("Main protein", 0.15 * portions, "kg", 18.00, 0.85),
        buildIngredient("Primary vegetable", 0.08 * portions, "kg", 4.50, 0.80),
        buildIngredient("Sauce base", 0.04 * portions, "L", 6.00, 1.0),
        buildIngredient("Garnish", 0.01 * portions, "kg", 12.00, 0.90),
    ];
    const totalCost = ingredients.reduce((s, i) => s + i.adjustedCost, 0);
    return {
        recipeId: `rec-${Date.now()}`,
        name,
        category: "Main",
        yield: portions,
        yieldUnit: "portions",
        portions,
        portionSize: "150g + garnish",
        prepTimeMin: 20,
        cookTimeMin: 15,
        ingredients,
        method: ["Prepare mise en place.", "Cook protein to required temperature.", "Build sauce.", "Plate and garnish."],
        platingSuggestion: "Sauce base, protein centre, vegetables alongside, garnish on top.",
        storageInstructions: "Cool rapidly. Refrigerate at <4°C. Use within 3 days.",
        totalFoodCost: Math.round(totalCost * 100) / 100,
        costPerPortion: Math.round((totalCost / portions) * 100) / 100,
        allergens: ["Gluten", "Dairy"],
    };
}
async function generateCostModel(ctx) {
    (0, logger_1.logInfo)("chef_drew_cost_model_generated", { operation: ctx.operationName });
    const revenue = (ctx.coversPerDay ?? 100) * (ctx.avgSpend ?? 45) * 30;
    const foodCost = revenue * 0.30;
    const laborCost = revenue * 0.32;
    const primeCost = foodCost + laborCost;
    const overhead = revenue * 0.18;
    const ebitda = revenue - primeCost - overhead;
    return {
        modelId: `cm-${Date.now()}`,
        operationName: ctx.operationName,
        period: "Monthly",
        revenue: Math.round(revenue),
        foodCost: Math.round(foodCost),
        foodCostPct: 30,
        laborCost: Math.round(laborCost),
        laborCostPct: 32,
        primeCost: Math.round(primeCost),
        primeCostPct: 62,
        overheadCost: Math.round(overhead),
        overheadCostPct: 18,
        ebitda: Math.round(ebitda),
        ebitdaPct: Math.round((ebitda / revenue) * 100),
        assumptions: [`${ctx.coversPerDay ?? 100} covers/day`, `$${ctx.avgSpend ?? 45} avg spend`, "30 operating days/month"],
        recommendations: [
            primeCost / revenue > 0.65 ? "Prime cost exceeds 65% — review food and labour efficiencies." : "Prime cost within target range.",
            "Track food cost weekly by category for early variance detection.",
        ],
        generatedAt: new Date().toISOString(),
    };
}
async function generateProductionSchedule(date, shift, recipeTasks) {
    (0, logger_1.logInfo)("chef_drew_production_schedule_generated", { date, shift });
    return {
        scheduleId: `sched-${Date.now()}`,
        date,
        shift,
        tasks: recipeTasks.map((t, i) => ({
            taskId: `task-${Date.now()}-${i}`,
            recipeName: t.recipeName,
            quantity: t.quantity,
            unit: t.unit,
            assignedRole: t.role,
            startTime: addMinutes("07:00", i * 45),
            endTime: addMinutes("07:45", i * 45),
            priority: i === 0 ? "critical" : "high",
        })),
        generatedAt: new Date().toISOString(),
    };
}
async function generateTrainingProgram(role, domain) {
    (0, logger_1.logInfo)("chef_drew_training_program_generated", { role, domain });
    return {
        programId: `tp-${Date.now()}`,
        title: `${role} Training Program`,
        role,
        domain,
        durationDays: 14,
        modules: [
            { moduleId: `mod-${Date.now()}-1`, title: "Orientation & Brand Standards", description: "Introduction to the operation, brand values, and service standards.", durationHours: 4, deliveryMethod: "classroom", topics: ["Brand story", "Service standards", "Guest experience principles"], resources: ["Brand manual", "SOP guide"] },
            { moduleId: `mod-${Date.now()}-2`, title: "Technical Skills", description: `Core technical skills for ${role} in ${domain}.`, durationHours: 24, deliveryMethod: "on_the_job", topics: ["Core techniques", "Equipment operation", "Quality standards"], resources: ["Technique manuals", "Recipe cards"] },
            { moduleId: `mod-${Date.now()}-3`, title: "Food Safety & HACCP", description: "Food safety, hygiene, and HACCP compliance.", durationHours: 8, deliveryMethod: "classroom", topics: ["Food safety legislation", "Personal hygiene", "Temperature control", "HACCP principles"], resources: ["HACCP plan", "Food safety manual"] },
        ],
        assessments: ["Day 5 theory assessment", "Day 10 practical assessment", "Day 14 final sign-off"],
        generatedAt: new Date().toISOString(),
    };
}
async function generateSOPManual(department, domain) {
    (0, logger_1.logInfo)("chef_drew_sop_manual_generated", { department, domain });
    return {
        manualId: `sop-${Date.now()}`,
        title: `${department} Standard Operating Procedures`,
        department,
        version: "1.0",
        sections: [
            { sectionId: `sec-${Date.now()}-1`, title: "Opening Procedures", purpose: "Ensure consistent and complete opening of the operation.", scope: "All team members on opening shift.", procedure: ["Arrive 30 minutes before service.", "Complete cleaning checklist.", "Set up stations to standard.", "Brief team on specials and priorities.", "Conduct pre-service inspection."], standards: ["Station set-up complete 15 min before service.", "All equipment operational and within temp range."], exceptions: ["Report equipment failures immediately to supervisor."] },
            { sectionId: `sec-${Date.now()}-2`, title: "Service Standards", purpose: "Deliver consistent, exceptional service.", scope: "All guest-facing team members.", procedure: ["Greet guests within 30 seconds.", "Present menus and specials.", "Take orders accurately.", "Deliver food and beverage to standard.", "Check back within 2 minutes."], standards: ["Zero tolerance for cold food delivery.", "All orders to standard within prescribed time."], exceptions: ["Escalate guest complaints immediately to floor manager."] },
            { sectionId: `sec-${Date.now()}-3`, title: "Closing Procedures", purpose: "Safe and complete closing of the operation.", scope: "Closing shift team.", procedure: ["Complete end-of-service breakdown.", "Clean and sanitise all surfaces.", "Store all perishables correctly.", "Complete closing checklist.", "Secure premises."], standards: ["All food stored at correct temperatures.", "Closing checklist signed by manager."], exceptions: [] },
        ],
        generatedAt: new Date().toISOString(),
    };
}
async function generateHACCPPlan(facilityName, processDescription) {
    (0, logger_1.logInfo)("chef_drew_haccp_plan_generated", { facilityName });
    return {
        planId: `haccp-${Date.now()}`,
        facilityName,
        processDescription,
        hazards: [
            { hazardId: `haz-${Date.now()}-1`, type: "biological", description: "Pathogen growth due to inadequate temperature control", severity: "critical", likelihood: "medium", preventiveMeasures: ["Temperature monitoring", "Cold chain management", "Staff hygiene training"] },
            { hazardId: `haz-${Date.now()}-2`, type: "chemical", description: "Chemical contamination from cleaning agents", severity: "major", likelihood: "low", preventiveMeasures: ["Separate chemical storage", "COSHH training", "Correct dilution procedures"] },
            { hazardId: `haz-${Date.now()}-3`, type: "physical", description: "Foreign body contamination", severity: "major", likelihood: "low", preventiveMeasures: ["Supplier verification", "Incoming goods inspection", "Equipment maintenance"] },
        ],
        criticalControlPoints: [
            { ccpId: `ccp-1`, processStep: "Receiving", hazardAddressed: "Pathogen introduction via contaminated inputs", criticalLimits: "Chilled goods ≤5°C, Frozen ≤-18°C", monitoringProcedure: "Temperature check every delivery", correctiveActions: ["Reject non-conforming goods", "Record and report"], verificationActivities: ["Weekly receiving log audit"] },
            { ccpId: `ccp-2`, processStep: "Cooking", hazardAddressed: "Survival of pathogens", criticalLimits: "Core temperature ≥75°C for 15 seconds", monitoringProcedure: "Probe every batch with calibrated thermometer", correctiveActions: ["Continue cooking until CCP met", "Discard if in danger zone >4h"], verificationActivities: ["Thermometer calibration weekly"] },
            { ccpId: `ccp-3`, processStep: "Hot holding", hazardAddressed: "Pathogen growth during service", criticalLimits: "Hot holding ≥63°C", monitoringProcedure: "Temperature check every 30 minutes", correctiveActions: ["Reheat or discard if below limit"], verificationActivities: ["Hot holding log review daily"] },
        ],
        verificationProcedures: ["Weekly internal HACCP audit", "Monthly corrective action review", "Annual third-party audit"],
        recordKeepingRequirements: ["Temperature logs retained for 3 years", "Corrective action records", "Training records", "Supplier verification records"],
        generatedAt: new Date().toISOString(),
    };
}
async function generateBlueprint(ctx) {
    (0, logger_1.logInfo)("chef_drew_blueprint_generated", { operation: ctx.operationName, domain: ctx.domain });
    return {
        blueprintId: `bp-${Date.now()}`,
        operationName: ctx.operationName,
        domain: ctx.domain,
        concept: `Authentic, intelligence-driven ${ctx.cuisineStyle ?? "contemporary"} ${ctx.domain} experience.`,
        targetGuest: "Discerning guests seeking quality, consistency, and memorable experiences.",
        designPrinciples: ["Guest experience first", "Operational excellence", "Continuous improvement", "Team empowerment"],
        operationalModel: `${ctx.domain} operation with ${ctx.coversPerDay ?? 100} covers/day, ${ctx.teamSize ?? 20} team members.`,
        revenueStreams: ["Food & Beverage", "Private Dining", "Events", "Merchandise"],
        keyDifferentiators: ["Autonomous intelligence-driven operations", "Personalised guest experiences", "Chef Drew culinary standards"],
        technologyStack: ["Nexus Intelligence Platform", "POS integration", "Inventory management", "Training platform"],
        staffingModel: `Lean, cross-trained team of ${ctx.teamSize ?? 20}. Ratio 1:${Math.round((ctx.coversPerDay ?? 100) / (ctx.teamSize ?? 20))} covers per team member.`,
        financialTargets: {
            targetFoodCostPct: 30,
            targetLaborCostPct: 32,
            targetPrimeCostPct: 62,
            targetEbitdaPct: 20,
        },
        implementationPhases: [
            { phase: 1, name: "Foundation", duration: "Month 1-2", milestones: ["Concept finalised", "Team recruited"], keyDeliverables: ["Brand manual", "Menu", "SOPs"] },
            { phase: 2, name: "Build", duration: "Month 2-4", milestones: ["Fit-out complete", "Team trained"], keyDeliverables: ["Training manual", "HACCP plan", "Production systems"] },
            { phase: 3, name: "Launch", duration: "Month 4-6", milestones: ["Soft launch", "Full launch"], keyDeliverables: ["Marketing campaign", "Press launch", "Operations review"] },
            { phase: 4, name: "Optimise", duration: "Month 6+", milestones: ["KPIs achieved", "Continuous improvement in place"], keyDeliverables: ["Monthly performance reports", "Improvement plans"] },
        ],
        generatedAt: new Date().toISOString(),
    };
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function buildMenuItem(section, name, price, cost) {
    const foodCostPct = (cost / price) * 100;
    return {
        itemId: `item-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: `${section} ${name}`,
        category: section,
        description: `Chef Drew signature ${name.toLowerCase()} featuring seasonal ingredients.`,
        sellingPrice: price,
        foodCost: cost,
        foodCostPct: Math.round(foodCostPct * 10) / 10,
        contribution: price - cost,
        menuCategory: foodCostPct < 28 && price > 26 ? "star" : foodCostPct >= 28 && price > 26 ? "plow_horse" : foodCostPct < 28 ? "puzzle" : "dog",
        allergens: ["Gluten", "Dairy"],
        dietaryTags: [],
    };
}
function buildIngredient(name, qty, unit, unitCost, yieldPct) {
    const adjustedCost = (qty * unitCost) / yieldPct;
    return { name, quantity: qty, unit, unitCost, totalCost: qty * unitCost, yieldPct, adjustedCost: Math.round(adjustedCost * 100) / 100 };
}
function addMinutes(time, minutes) {
    const [h, m] = time.split(":").map(Number);
    const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
//# sourceMappingURL=index.js.map