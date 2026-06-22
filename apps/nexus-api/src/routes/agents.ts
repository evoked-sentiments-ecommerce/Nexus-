import { randomUUID } from "crypto";
import { Request, Response, Router } from "express";
import { env } from "../config/env";
import { Agent, AgentKey, parseAgentKey, parseAgentStatus } from "../entities/Agent";
import { AgentDecision, normalizeConfidence } from "../entities/AgentDecision";
import {
  AgentSession,
  createEmptySharedAgentContext,
  parseAgentSessionStatus,
} from "../entities/AgentSession";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth";
import { AgentDecisionRepository } from "../database/repositories/AgentDecisionRepository";
import { AgentRepository } from "../database/repositories/AgentRepository";
import { AgentSessionRepository } from "../database/repositories/AgentSessionRepository";
import { AgentOrchestrator } from "../services/agents/AgentOrchestrator";
import { AgentDefinition, AgentRegistry } from "../services/agents/AgentRegistry";

const router = Router();
const registry = new AgentRegistry();
const orchestrator = new AgentOrchestrator(registry);
const agentRepository = new AgentRepository();
const sessionRepository = new AgentSessionRepository();
const decisionRepository = new AgentDecisionRepository();

const memoryAgents = new Map<string, Agent>();
const memorySessions = new Map<string, AgentSession>();
const memoryDecisions = new Map<string, AgentDecision>();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/capabilities", (_req: Request, res: Response) => {
  const capabilities = registry.list().map((agent) => ({
    key: agent.key,
    name: agent.name,
    domain: agent.domain,
    specialties: agent.specialties,
    collaborateWith: agent.collaborateWith,
  }));

  res.json({ capabilities });
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? parseAgentStatus(req.query.status) : undefined;
    const domain = typeof req.query.domain === "string" ? req.query.domain : undefined;

    const persistedAgents = env.DATABASE_URL
      ? await agentRepository.list({ status, domain })
      : Array.from(memoryAgents.values()).filter(
          (agent) => (!status || agent.status === status) && (!domain || agent.domain === domain)
        );

    const registryAgents = registry.list().map(mapDefinitionToAgent);
    const merged = new Map<string, Agent>();

    for (const agent of [...registryAgents, ...persistedAgents]) {
      if ((status && agent.status !== status) || (domain && agent.domain !== domain)) {
        continue;
      }

      merged.set(agent.key, agent);
    }

    res.json({ agents: Array.from(merged.values()) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const key = parseAgentKey(req.body.key);
    const definition = registry.get(key);
    const rawCollaborationTargets: unknown[] = Array.isArray(req.body.collaborationTargets)
      ? (req.body.collaborationTargets as unknown[])
      : [];
    const collaborationTargets = rawCollaborationTargets
      .filter((item): item is string => typeof item === "string")
      .map((item: string) => parseAgentKey(item));

    const agent: Agent = {
      id: randomUUID(),
      key,
      name: typeof req.body.name === "string" && req.body.name.trim() ? req.body.name.trim() : definition?.name ?? "Agent",
      domain: typeof req.body.domain === "string" && req.body.domain.trim() ? req.body.domain.trim() : definition?.domain ?? "general",
      specialty:
        typeof req.body.specialty === "string" && req.body.specialty.trim()
          ? req.body.specialty.trim()
          : definition?.specialties[0] ?? "general intelligence",
      status: parseAgentStatus(req.body.status),
      capabilities: Array.isArray(req.body.capabilities)
        ? req.body.capabilities.filter((item: unknown): item is string => typeof item === "string")
        : definition?.specialties ?? [],
      collaborationTargets: collaborationTargets.length > 0
        ? collaborationTargets
        : definition?.collaborateWith ?? [],
      performance: {
        accuracy: normalizeConfidence(req.body.performance?.accuracy ?? 0),
        effectiveness: normalizeConfidence(req.body.performance?.effectiveness ?? 0),
        contribution: normalizeConfidence(req.body.performance?.contribution ?? 0),
        collaborationQuality: normalizeConfidence(req.body.performance?.collaborationQuality ?? 0),
      },
      metadata:
        req.body.metadata && typeof req.body.metadata === "object"
          ? (req.body.metadata as Record<string, unknown>)
          : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await agentRepository.create(agent) : null;
    const result = persisted ?? agent;

    if (!persisted && !env.DATABASE_URL) {
      memoryAgents.set(result.id, result);
    }

    res.status(201).json({ agent: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const fromRegistry = registry.get(id as AgentKey);
    const goalScoped = fromRegistry ? mapDefinitionToAgent(fromRegistry) : null;

    const agent = env.DATABASE_URL
      ? await agentRepository.getById(id)
      : memoryAgents.get(id) ?? null;

    const result = agent ?? goalScoped;

    if (!result) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.json({ agent: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/sessions/list", async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? parseAgentSessionStatus(req.query.status) : undefined;
    const sessions = env.DATABASE_URL
      ? await sessionRepository.list({ status })
      : Array.from(memorySessions.values()).filter((item) => !status || item.status === status);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/sessions", async (req: Request, res: Response) => {
  try {
    const goal = typeof req.body.goal === "string" ? req.body.goal.trim() : "";
    if (!goal) {
      res.status(400).json({ error: "goal is required" });
      return;
    }

    const rawParticipants: unknown[] = Array.isArray(req.body.participatingAgentIds)
      ? (req.body.participatingAgentIds as unknown[])
      : [];
    const requestedParticipants: AgentKey[] = rawParticipants.length > 0
      ? rawParticipants
          .filter((item): item is string => typeof item === "string")
          .map((item: string) => parseAgentKey(item))
      : [];

    const participatingAgentIds = requestedParticipants.length > 0
      ? Array.from(new Set(requestedParticipants))
      : registry.recommend(goal);

    const authReq = req as AuthenticatedRequest;
    const session: AgentSession = {
      id: randomUUID(),
      goal,
      objective: typeof req.body.objective === "string" ? req.body.objective.trim() : null,
      status: "planning",
      participatingAgentIds,
      sharedContext: createEmptySharedAgentContext(),
      unifiedExecutionPlan: [],
      mergedOutputs: {},
      createdBy: authReq.user?.id ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    const persisted = env.DATABASE_URL ? await sessionRepository.create(session) : null;
    const result = persisted ?? session;

    if (!persisted && !env.DATABASE_URL) {
      memorySessions.set(result.id, result);
    }

    res.status(201).json({ session: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const session = env.DATABASE_URL
      ? await sessionRepository.getById(req.params.id)
      : memorySessions.get(req.params.id) ?? null;

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/sessions/:id/run", async (req: Request, res: Response) => {
  try {
    const existing = env.DATABASE_URL
      ? await sessionRepository.getById(req.params.id)
      : memorySessions.get(req.params.id) ?? null;

    if (!existing) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const rawSelectedAgents: unknown[] = Array.isArray(req.body.participatingAgentIds)
      ? (req.body.participatingAgentIds as unknown[])
      : [];
    const selectedAgents = rawSelectedAgents.length > 0
      ? rawSelectedAgents
          .filter((item): item is string => typeof item === "string")
          .map((item: string) => parseAgentKey(item))
      : undefined;

    const executionInput: AgentSession = {
      ...existing,
      status: "executing",
      updatedAt: new Date().toISOString(),
    };

    const result = await orchestrator.runSession(executionInput, selectedAgents);

    const persistedSession = env.DATABASE_URL
      ? await sessionRepository.update(existing.id, {
          status: result.session.status,
          participatingAgentIds: result.session.participatingAgentIds,
          sharedContext: result.session.sharedContext,
          unifiedExecutionPlan: result.session.unifiedExecutionPlan,
          mergedOutputs: result.session.mergedOutputs,
          completedAt: result.session.completedAt,
        })
      : null;

    const finalSession = persistedSession ?? {
      ...result.session,
      updatedAt: new Date().toISOString(),
    };

    if (!persistedSession && !env.DATABASE_URL) {
      memorySessions.set(finalSession.id, finalSession);
    }

    const savedDecisions: AgentDecision[] = [];
    for (const decision of result.decisions) {
      const persistedDecision = env.DATABASE_URL
        ? await decisionRepository.create(decision)
        : null;
      const finalDecision = persistedDecision ?? decision;
      savedDecisions.push(finalDecision);

      if (!persistedDecision && !env.DATABASE_URL) {
        memoryDecisions.set(finalDecision.id, finalDecision);
      }
    }

    res.json({
      session: finalSession,
      outputs: result.outputs,
      decisions: savedDecisions,
      unifiedExecutionPlan: finalSession.unifiedExecutionPlan,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/sessions/:id/decisions", async (req: Request, res: Response) => {
  try {
    const decisions = env.DATABASE_URL
      ? await decisionRepository.listBySession(req.params.id)
      : Array.from(memoryDecisions.values()).filter((decision) => decision.sessionId === req.params.id);

    res.json({ decisions });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/sessions/:id/decisions", async (req: Request, res: Response) => {
  try {
    const session = env.DATABASE_URL
      ? await sessionRepository.getById(req.params.id)
      : memorySessions.get(req.params.id) ?? null;

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const decisionText = typeof req.body.decision === "string" ? req.body.decision.trim() : "";
    const reasoning = typeof req.body.reasoning === "string" ? req.body.reasoning.trim() : "";
    const expectedOutcome = typeof req.body.expectedOutcome === "string"
      ? req.body.expectedOutcome.trim()
      : "";

    if (!decisionText || !reasoning || !expectedOutcome) {
      res.status(400).json({ error: "decision, reasoning, and expectedOutcome are required" });
      return;
    }

    const decision: AgentDecision = {
      id: randomUUID(),
      sessionId: session.id,
      agentId: parseAgentKey(req.body.agentId),
      decision: decisionText,
      reasoning,
      confidence: normalizeConfidence(req.body.confidence ?? 0),
      alternatives: Array.isArray(req.body.alternatives)
        ? req.body.alternatives.filter((item: unknown): item is string => typeof item === "string")
        : [],
      recommendations: Array.isArray(req.body.recommendations)
        ? req.body.recommendations.filter((item: unknown): item is string => typeof item === "string")
        : [],
      expectedOutcome,
      createdAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await decisionRepository.create(decision) : null;
    const result = persisted ?? decision;

    if (!persisted && !env.DATABASE_URL) {
      memoryDecisions.set(result.id, result);
    }

    res.status(201).json({ decision: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;

function mapDefinitionToAgent(definition: AgentDefinition): Agent {
  const now = new Date().toISOString();

  return {
    id: definition.key,
    key: definition.key,
    name: definition.name,
    domain: definition.domain,
    specialty: definition.specialties[0] ?? definition.domain,
    status: "active",
    capabilities: definition.specialties,
    collaborationTargets: definition.collaborateWith,
    performance: {
      accuracy: 75,
      effectiveness: 75,
      contribution: 75,
      collaborationQuality: 75,
    },
    metadata: {
      source: "registry",
    },
    createdAt: now,
    updatedAt: now,
  };
}
