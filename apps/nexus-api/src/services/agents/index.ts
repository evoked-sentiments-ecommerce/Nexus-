// ---------------------------------------------------------------------------
// Agent Civilization — collaborative specialist agents that share memory and
// planning systems to collectively achieve platform objectives.
//
// Agents:
//   Research Architect       — market intelligence, competitive analysis
//   Strategy Architect       — strategic planning, business positioning
//   Business Architect       — business plan, financial model, pitch deck
//   Hospitality Architect    — Chef Drew hospitality blueprints
//   Financial Architect      — financial modelling, costing, analysis
//   HR Architect             — hiring plans, org design, training programs
//   Marketing Architect      — campaigns, brand, growth plans
//   Design Architect         — brand systems, visual assets, UI
//   Technology Architect     — system design, capability creation
//   Training Architect       — training programs, SOPs, HACCP
//   Operations Architect     — workflows, processes, operational frameworks
//   Optimization Architect   — performance, efficiency, self-development
//   Evolution Architect      — platform evolution, capability expansion
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgentName =
  | "research_architect"
  | "strategy_architect"
  | "business_architect"
  | "hospitality_architect"
  | "financial_architect"
  | "hr_architect"
  | "marketing_architect"
  | "design_architect"
  | "technology_architect"
  | "training_architect"
  | "operations_architect"
  | "optimization_architect"
  | "evolution_architect";

export type AgentStatus = "idle" | "running" | "completed" | "failed" | "waiting";

export interface AgentCapabilities {
  name: AgentName;
  description: string;
  domains: string[];
  inputTypes: string[];
  outputTypes: string[];
  canCollaborateWith: AgentName[];
}

export interface AgentTask {
  taskId: string;
  agentName: AgentName;
  taskType: string;
  input: Record<string, unknown>;
  requiredCollaborators?: AgentName[];
  sessionId: string;
  requestedBy?: string;
}

export interface AgentResult {
  taskId: string;
  agentName: AgentName;
  status: AgentStatus;
  output?: unknown;
  collaborationOutputs?: Partial<Record<AgentName, unknown>>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface CollaborationSession {
  sessionId: string;
  objective: string;
  participatingAgents: AgentName[];
  sharedMemory: Record<string, unknown>;
  tasks: AgentTask[];
  results: AgentResult[];
  status: "planning" | "executing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Agent registry
// ---------------------------------------------------------------------------

const AGENT_CAPABILITIES: Record<AgentName, AgentCapabilities> = {
  research_architect: {
    name: "research_architect",
    description: "Conducts market research, competitive intelligence, trend analysis, and opportunity detection.",
    domains: ["market", "competitive", "trends", "industry"],
    inputTypes: ["research_query", "topic", "domain"],
    outputTypes: ["research_findings", "competitive_profile", "trend_report", "opportunity_report"],
    canCollaborateWith: ["strategy_architect", "business_architect", "marketing_architect"],
  },
  strategy_architect: {
    name: "strategy_architect",
    description: "Develops strategic plans, positioning frameworks, and long-term business strategy.",
    domains: ["strategy", "positioning", "competitive_advantage"],
    inputTypes: ["business_context", "market_data", "objectives"],
    outputTypes: ["strategic_plan", "positioning_framework", "okr_structure"],
    canCollaborateWith: ["research_architect", "business_architect", "financial_architect"],
  },
  business_architect: {
    name: "business_architect",
    description: "Generates business plans, investor decks, pitch decks, and financial overviews.",
    domains: ["business_development", "fundraising", "growth"],
    inputTypes: ["business_context", "financial_data", "market_data"],
    outputTypes: ["business_plan", "investor_deck", "pitch_deck", "growth_plan"],
    canCollaborateWith: ["strategy_architect", "financial_architect", "marketing_architect"],
  },
  hospitality_architect: {
    name: "hospitality_architect",
    description: "Creates hospitality blueprints, F&B concepts, and operational models for Chef Drew.",
    domains: ["restaurant", "hotel", "resort", "culinary"],
    inputTypes: ["hospitality_context", "financial_targets", "concept_brief"],
    outputTypes: ["hospitality_blueprint", "concept_document", "operational_model"],
    canCollaborateWith: ["financial_architect", "training_architect", "operations_architect"],
  },
  financial_architect: {
    name: "financial_architect",
    description: "Builds financial models, cost analyses, revenue projections, and investment analyses.",
    domains: ["finance", "costing", "modelling", "investment"],
    inputTypes: ["financial_data", "business_context", "cost_data"],
    outputTypes: ["financial_model", "cost_model", "revenue_projection", "investment_analysis"],
    canCollaborateWith: ["business_architect", "strategy_architect", "operations_architect"],
  },
  hr_architect: {
    name: "hr_architect",
    description: "Designs hiring plans, org structures, role definitions, and people frameworks.",
    domains: ["hr", "people", "org_design", "talent"],
    inputTypes: ["business_context", "growth_plan", "roles"],
    outputTypes: ["hiring_plan", "org_chart", "role_definition", "compensation_framework"],
    canCollaborateWith: ["strategy_architect", "operations_architect", "training_architect"],
  },
  marketing_architect: {
    name: "marketing_architect",
    description: "Creates marketing strategies, campaign briefs, brand positioning, and growth plans.",
    domains: ["marketing", "brand", "growth", "campaigns"],
    inputTypes: ["business_context", "market_data", "brand_tokens"],
    outputTypes: ["marketing_plan", "campaign_brief", "brand_strategy", "content_plan"],
    canCollaborateWith: ["research_architect", "design_architect", "business_architect"],
  },
  design_architect: {
    name: "design_architect",
    description: "Generates brand systems, visual assets, UI frameworks, and all design specifications.",
    domains: ["brand", "visual_design", "ui", "print"],
    inputTypes: ["brand_tokens", "design_request", "content_brief"],
    outputTypes: ["brand_system", "logo", "ui_system", "marketing_asset", "print_asset"],
    canCollaborateWith: ["marketing_architect", "technology_architect"],
  },
  technology_architect: {
    name: "technology_architect",
    description: "Designs system architectures, generates capability specifications, and drives technical strategy.",
    domains: ["software", "infrastructure", "architecture", "integrations"],
    inputTypes: ["capability_spec", "system_requirements", "technical_context"],
    outputTypes: ["architecture", "technical_spec", "implementation_plan", "api_design"],
    canCollaborateWith: ["operations_architect", "evolution_architect", "design_architect"],
  },
  training_architect: {
    name: "training_architect",
    description: "Creates training programs, learning pathways, SOPs, and HACCP documentation.",
    domains: ["training", "learning", "compliance", "sops"],
    inputTypes: ["role", "domain", "operational_context"],
    outputTypes: ["training_program", "sop_manual", "haccp_plan", "learning_path"],
    canCollaborateWith: ["hospitality_architect", "hr_architect", "operations_architect"],
  },
  operations_architect: {
    name: "operations_architect",
    description: "Designs operational workflows, process maps, and efficiency frameworks.",
    domains: ["operations", "processes", "workflows", "efficiency"],
    inputTypes: ["business_context", "current_processes", "objectives"],
    outputTypes: ["operational_framework", "process_map", "workflow_design", "kpi_framework"],
    canCollaborateWith: ["technology_architect", "hr_architect", "financial_architect"],
  },
  optimization_architect: {
    name: "optimization_architect",
    description: "Analyses performance, identifies bottlenecks, and generates optimisation plans.",
    domains: ["optimisation", "performance", "efficiency", "analytics"],
    inputTypes: ["performance_data", "usage_data", "feedback_data"],
    outputTypes: ["optimisation_plan", "improvement_proposals", "performance_report"],
    canCollaborateWith: ["technology_architect", "operations_architect", "evolution_architect"],
  },
  evolution_architect: {
    name: "evolution_architect",
    description: "Drives platform evolution, capability expansion, and long-term intelligence growth.",
    domains: ["evolution", "capability_expansion", "self_improvement"],
    inputTypes: ["platform_snapshot", "usage_analysis", "capability_gaps"],
    outputTypes: ["evolution_report", "capability_proposals", "expansion_roadmap"],
    canCollaborateWith: ["technology_architect", "optimization_architect", "research_architect"],
  },
};

// ---------------------------------------------------------------------------
// Agent execution (stub — replace with real agent runtime / LLM tool loop)
// ---------------------------------------------------------------------------

export async function runAgent(task: AgentTask): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  logInfo("agent_task_started", {
    taskId: task.taskId,
    agentName: task.agentName,
    taskType: task.taskType,
  });

  try {
    // Stub — replace with real agent execution (LLM tool loop, etc.)
    const output = await simulateAgentExecution(task);

    const result: AgentResult = {
      taskId: task.taskId,
      agentName: task.agentName,
      status: "completed",
      output,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
    };

    logInfo("agent_task_completed", { taskId: task.taskId, agentName: task.agentName, durationMs: result.durationMs });
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError("agent_task_failed", { taskId: task.taskId, agentName: task.agentName, error });
    return { taskId: task.taskId, agentName: task.agentName, status: "failed", error, startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start };
  }
}

// ---------------------------------------------------------------------------
// Collaboration sessions
// ---------------------------------------------------------------------------

const sessions = new Map<string, CollaborationSession>();

/**
 * Create a new collaboration session where multiple agents work together
 * toward a shared objective using shared memory.
 */
export function createCollaborationSession(
  objective: string,
  agents: AgentName[]
): CollaborationSession {
  const session: CollaborationSession = {
    sessionId: `session-${Date.now()}`,
    objective,
    participatingAgents: agents,
    sharedMemory: {},
    tasks: [],
    results: [],
    status: "planning",
    createdAt: new Date().toISOString(),
  };
  sessions.set(session.sessionId, session);
  logInfo("agent_session_created", { sessionId: session.sessionId, objective: objective.slice(0, 60), agents });
  return session;
}

/**
 * Execute all tasks in a collaboration session, sharing outputs via
 * session memory so later agents can build on earlier results.
 */
export async function executeCollaborationSession(
  sessionId: string,
  tasks: AgentTask[]
): Promise<CollaborationSession> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Collaboration session not found: ${sessionId}`);

  session.status = "executing";
  session.tasks = tasks;

  logInfo("agent_session_executing", { sessionId, taskCount: tasks.length });

  for (const task of tasks) {
    const result = await runAgent(task);
    session.results.push(result);
    if (result.output) {
      session.sharedMemory[`${task.agentName}_output`] = result.output;
    }
  }

  session.status = "completed";
  session.completedAt = new Date().toISOString();
  sessions.set(sessionId, session);

  logInfo("agent_session_completed", { sessionId, resultCount: session.results.length });
  return session;
}

/**
 * Get an agent's capabilities.
 */
export function getAgentCapabilities(name: AgentName): AgentCapabilities {
  return AGENT_CAPABILITIES[name];
}

/**
 * Get all registered agent capabilities.
 */
export function getAllAgentCapabilities(): AgentCapabilities[] {
  return Object.values(AGENT_CAPABILITIES);
}

/**
 * Recommend agents for a given objective based on domain keywords.
 */
export function recommendAgentsForObjective(objective: string): AgentName[] {
  const lower = objective.toLowerCase();
  const matches: AgentName[] = [];

  for (const [name, cap] of Object.entries(AGENT_CAPABILITIES) as [AgentName, AgentCapabilities][]) {
    const domainMatch = cap.domains.some((d) => lower.includes(d.replace(/_/g, " ")));
    if (domainMatch) matches.push(name);
  }

  if (matches.length === 0) {
    return ["strategy_architect", "research_architect", "operations_architect"];
  }

  return matches.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Internal stub
// ---------------------------------------------------------------------------

async function simulateAgentExecution(task: AgentTask): Promise<unknown> {
  const caps = AGENT_CAPABILITIES[task.agentName];

  try {
    const { completeChat } = require("../llm");
    const systemPrompt = `You are the ${caps.name.replace(/_/g, " ")} specialist agent. 
Your expertise covers: ${caps.domains.join(", ")}.
Your description: ${caps.description}
You produce outputs of type: ${caps.outputTypes.join(", ")}.
Respond with a structured JSON result for the given task.`;

    const userMessage = `Task type: ${task.taskType}
Input: ${JSON.stringify(task.input, null, 2)}

Produce a ${caps.outputTypes[0] ?? "result"} output.`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const result = await completeChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        { temperature: 0.7, maxTokens: 2000 }
      );
      return {
        agentName: task.agentName,
        taskType: task.taskType,
        outputType: caps.outputTypes[0] ?? "result",
        summary: result,
        data: task.input,
      };
    }
  } catch {
    // Fall through to stub
  }

  return {
    agentName: task.agentName,
    taskType: task.taskType,
    outputType: caps.outputTypes[0] ?? "result",
    summary: `${caps.description} — task "${task.taskType}" completed.`,
    data: task.input,
  };
}
