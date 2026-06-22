export type HospitalityDomain = "restaurant" | "hotel" | "resort" | "private_club" | "luxury_destination" | "culinary_operations" | "hospitality_finance" | "training" | "guest_experience";
export interface HospitalityContext {
    operationName: string;
    domain: HospitalityDomain;
    cuisineStyle?: string;
    coversPerDay?: number;
    avgSpend?: number;
    teamSize?: number;
    location?: string;
    objectives?: string[];
}
export interface MenuItem {
    itemId: string;
    name: string;
    category: string;
    description: string;
    sellingPrice: number;
    foodCost: number;
    foodCostPct: number;
    laborCost?: number;
    contribution: number;
    menuCategory: "star" | "plow_horse" | "puzzle" | "dog";
    allergens: string[];
    dietaryTags: string[];
}
export interface Menu {
    menuId: string;
    name: string;
    operationName: string;
    concept: string;
    sections: MenuSection[];
    engineeringAnalysis: MenuEngineeringAnalysis;
    generatedAt: string;
}
export interface MenuSection {
    name: string;
    items: MenuItem[];
}
export interface MenuEngineeringAnalysis {
    avgFoodCostPct: number;
    avgContribution: number;
    stars: string[];
    plowHorses: string[];
    puzzles: string[];
    dogs: string[];
    recommendations: string[];
}
export interface Recipe {
    recipeId: string;
    name: string;
    category: string;
    yield: number;
    yieldUnit: string;
    portions: number;
    portionSize: string;
    prepTimeMin: number;
    cookTimeMin: number;
    ingredients: RecipeIngredient[];
    method: string[];
    platingSuggestion?: string;
    storageInstructions?: string;
    totalFoodCost: number;
    costPerPortion: number;
    allergens: string[];
}
export interface RecipeIngredient {
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    yieldPct: number;
    adjustedCost: number;
}
export interface CostModel {
    modelId: string;
    operationName: string;
    period: string;
    revenue: number;
    foodCost: number;
    foodCostPct: number;
    laborCost: number;
    laborCostPct: number;
    primeCost: number;
    primeCostPct: number;
    overheadCost: number;
    overheadCostPct: number;
    ebitda: number;
    ebitdaPct: number;
    assumptions: string[];
    recommendations: string[];
    generatedAt: string;
}
export interface ProductionSchedule {
    scheduleId: string;
    date: string;
    shift: "prep" | "am" | "pm" | "overnight";
    tasks: ProductionTask[];
    generatedAt: string;
}
export interface ProductionTask {
    taskId: string;
    recipeName: string;
    quantity: number;
    unit: string;
    assignedRole: string;
    startTime: string;
    endTime: string;
    priority: "critical" | "high" | "medium" | "low";
    notes?: string;
}
export interface PrepList {
    prepListId: string;
    date: string;
    station: string;
    items: PrepItem[];
    generatedAt: string;
}
export interface PrepItem {
    name: string;
    parLevel: number;
    onHand: number;
    toPrepare: number;
    unit: string;
    method: string;
    assignedTo?: string;
}
export interface TrainingProgram {
    programId: string;
    title: string;
    role: string;
    domain: HospitalityDomain;
    durationDays: number;
    modules: TrainingModule[];
    assessments: string[];
    generatedAt: string;
}
export interface TrainingModule {
    moduleId: string;
    title: string;
    description: string;
    durationHours: number;
    deliveryMethod: "classroom" | "on_the_job" | "self_directed" | "shadowing";
    topics: string[];
    resources: string[];
}
export interface SOPManual {
    manualId: string;
    title: string;
    department: string;
    version: string;
    sections: SOPSection[];
    generatedAt: string;
}
export interface SOPSection {
    sectionId: string;
    title: string;
    purpose: string;
    scope: string;
    procedure: string[];
    standards: string[];
    exceptions: string[];
}
export interface HACCPPlan {
    planId: string;
    facilityName: string;
    processDescription: string;
    hazards: HACCPHazard[];
    criticalControlPoints: CriticalControlPoint[];
    verificationProcedures: string[];
    recordKeepingRequirements: string[];
    generatedAt: string;
}
export interface HACCPHazard {
    hazardId: string;
    type: "biological" | "chemical" | "physical";
    description: string;
    severity: "critical" | "major" | "minor";
    likelihood: "high" | "medium" | "low";
    preventiveMeasures: string[];
}
export interface CriticalControlPoint {
    ccpId: string;
    processStep: string;
    hazardAddressed: string;
    criticalLimits: string;
    monitoringProcedure: string;
    correctiveActions: string[];
    verificationActivities: string[];
}
export interface HospitalityBlueprint {
    blueprintId: string;
    operationName: string;
    domain: HospitalityDomain;
    concept: string;
    targetGuest: string;
    designPrinciples: string[];
    operationalModel: string;
    revenueStreams: string[];
    keyDifferentiators: string[];
    technologyStack: string[];
    staffingModel: string;
    financialTargets: Record<string, number>;
    implementationPhases: BlueprintPhase[];
    menuSummary?: {
        sections: number;
        totalItems: number;
        avgFoodCostPct: number;
        highlights: string[];
    };
    foodCostModel?: {
        targetFoodCostPct: number;
        currentFoodCostPct: number;
        recommendations: string[];
    };
    laborModel?: {
        totalWeeklyHours: number;
        laborCostPct: number;
        positions: unknown[];
    };
    sops?: string[];
    trainingOutline?: string;
    generatedAt: string;
}
export interface BlueprintPhase {
    phase: number;
    name: string;
    duration: string;
    milestones: string[];
    keyDeliverables: string[];
}
export declare function generateMenu(ctx: HospitalityContext, sectionNames: string[]): Promise<Menu>;
export declare function generateRecipe(name: string, portions: number, targetFoodCostPct: number): Promise<Recipe>;
export declare function generateCostModel(ctx: HospitalityContext): Promise<CostModel>;
export declare function generateProductionSchedule(date: string, shift: ProductionSchedule["shift"], recipeTasks: Array<{
    recipeName: string;
    quantity: number;
    unit: string;
    role: string;
}>): Promise<ProductionSchedule>;
export declare function generateTrainingProgram(role: string, domain: HospitalityDomain): Promise<TrainingProgram>;
export declare function generateSOPManual(department: string, domain: HospitalityDomain): Promise<SOPManual>;
export declare function generateHACCPPlan(facilityName: string, processDescription: string): Promise<HACCPPlan>;
export declare function generateBlueprint(ctx: HospitalityContext): Promise<HospitalityBlueprint>;
//# sourceMappingURL=index.d.ts.map