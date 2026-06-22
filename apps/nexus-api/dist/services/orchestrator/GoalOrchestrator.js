"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalOrchestrator = void 0;
const BUSINESS_DOMAIN_KEYWORDS = {
    Strategy: ["strategy", "expansion", "roadmap", "plan"],
    Finance: ["finance", "budget", "revenue", "profit", "cost", "model"],
    HR: ["hr", "hiring", "talent", "people", "team", "training"],
    Marketing: ["marketing", "brand", "campaign", "audience", "growth"],
    Operations: ["operations", "process", "sop", "delivery", "supply"],
    Technology: ["technology", "platform", "website", "application", "software", "system"],
    Research: ["research", "analysis", "insight", "validation", "discovery"],
    "Business Architecture": ["architecture", "operating model", "governance", "structure"],
};
const HOSPITALITY_DOMAIN_KEYWORDS = {
    "Restaurant Development": ["restaurant", "dining", "kitchen"],
    "Hotel Development": ["hotel", "hospitality", "lodging"],
    "Resort Development": ["resort", "destination", "villa"],
    "Private Club Development": ["club", "membership", "private club"],
    "Luxury Destination Development": ["luxury", "destination", "premium experience"],
    "Menu Engineering": ["menu", "menu design"],
    "Recipe Engineering": ["recipe", "culinary"],
    "Food Cost Engineering": ["food cost", "ingredient cost", "margin"],
    "Training Systems": ["training", "onboarding", "curriculum"],
    "Hospitality Operations": ["hospitality operations", "guest operations", "front of house"],
    "Hospitality Finance": ["hospitality finance", "adr", "revpar", "occupancy", "food margin"],
};
class GoalOrchestrator {
    async receiveGoal(goal) {
        return { goalId: goal.id, acceptedAt: new Date().toISOString() };
    }
    determineRequiredDomains(goal) {
        const content = `${goal.title} ${goal.description} ${goal.industry ?? ""}`.toLowerCase();
        const businessDomains = Object.entries(BUSINESS_DOMAIN_KEYWORDS)
            .filter(([, keywords]) => keywords.some((keyword) => content.includes(keyword)))
            .map(([domain]) => domain);
        const hospitalityDomains = Object.entries(HOSPITALITY_DOMAIN_KEYWORDS)
            .filter(([, keywords]) => keywords.some((keyword) => content.includes(keyword)))
            .map(([domain]) => domain);
        const required = new Set([...businessDomains, ...hospitalityDomains]);
        if (required.size === 0) {
            required.add("Strategy");
            required.add("Operations");
            required.add("Research");
        }
        return Array.from(required);
    }
    determineRequiredEngines(requiredDomains) {
        const engines = new Set(["planner", "memory", "learning", "production"]);
        if (requiredDomains.some((domain) => Object.keys(BUSINESS_DOMAIN_KEYWORDS).includes(domain))) {
            engines.add("nexus-business");
        }
        if (requiredDomains.some((domain) => Object.keys(HOSPITALITY_DOMAIN_KEYWORDS).includes(domain))) {
            engines.add("chef-drew");
        }
        if (requiredDomains.includes("Research")) {
            engines.add("research-intelligence");
        }
        return Array.from(engines);
    }
    buildExecutionRoadmap(goal, decomposition, requiredDomains, requiredEngines) {
        const workstreams = requiredDomains.map((domain, index) => {
            const engine = Object.keys(HOSPITALITY_DOMAIN_KEYWORDS).includes(domain)
                ? "chef-drew"
                : "nexus-business";
            return {
                id: `${goal.id}-workstream-${index + 1}`,
                name: `${domain} Workstream`,
                domain,
                engine,
                status: "planned",
                dependencies: index === 0 ? [] : [`${goal.id}-workstream-${index}`],
                milestones: decomposition.milestones.map((milestone) => milestone.title),
                deliverables: decomposition.deliverables
                    .filter((deliverable) => deliverable.category.toLowerCase().includes(domain.toLowerCase().split(" ")[0] ?? ""))
                    .map((deliverable) => deliverable.name),
            };
        });
        return {
            roadmapId: `roadmap-${goal.id}-${Date.now()}`,
            goalId: goal.id,
            requiredDomains,
            requiredEngines,
            workstreams,
            workflowTriggers: this.triggerGenerationWorkflows(requiredEngines),
            progress: this.trackProgress(workstreams),
            dependencyGraph: this.trackDependencies(workstreams),
            completionStatus: this.monitorCompletion(workstreams),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    triggerGenerationWorkflows(requiredEngines) {
        return requiredEngines.map((engine) => `${engine}:generate-workstream-plan`);
    }
    trackProgress(workstreams) {
        const total = workstreams.length;
        const completed = workstreams.filter((workstream) => workstream.status === "completed").length;
        const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { total, completed, percentComplete };
    }
    trackDependencies(workstreams) {
        return workstreams.map((workstream) => ({
            workstreamId: workstream.id,
            dependsOn: workstream.dependencies,
        }));
    }
    monitorCompletion(workstreams) {
        if (workstreams.length === 0)
            return "not_started";
        if (workstreams.every((workstream) => workstream.status === "completed")) {
            return "completed";
        }
        if (workstreams.some((workstream) => workstream.status === "in_progress")) {
            return "active";
        }
        return "not_started";
    }
    async orchestrate(goal, decomposition) {
        await this.receiveGoal(goal);
        const requiredDomains = this.determineRequiredDomains(goal);
        const requiredEngines = this.determineRequiredEngines(requiredDomains);
        return this.buildExecutionRoadmap(goal, decomposition, requiredDomains, requiredEngines);
    }
}
exports.GoalOrchestrator = GoalOrchestrator;
//# sourceMappingURL=GoalOrchestrator.js.map