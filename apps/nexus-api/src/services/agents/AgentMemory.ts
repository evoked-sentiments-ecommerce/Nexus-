import { AgentKey } from "../../entities/Agent";
import { AgentSession, SharedAgentContext, createEmptySharedAgentContext } from "../../entities/AgentSession";
import { AgentExecutionOutput } from "./AgentRegistry";

export class AgentMemory {
  private readonly sessionContext = new Map<string, SharedAgentContext>();

  initializeSession(session: AgentSession): SharedAgentContext {
    const context: SharedAgentContext = {
      ...createEmptySharedAgentContext(),
      ...session.sharedContext,
      memory: { ...session.sharedContext.memory },
      predictions: { ...session.sharedContext.predictions },
      simulations: { ...session.sharedContext.simulations },
      goals: [...session.sharedContext.goals],
      research: [...session.sharedContext.research],
      learning: [...session.sharedContext.learning],
      recommendations: [...session.sharedContext.recommendations],
    };

    this.sessionContext.set(session.id, context);
    return context;
  }

  getContext(sessionId: string): SharedAgentContext {
    if (!this.sessionContext.has(sessionId)) {
      this.sessionContext.set(sessionId, createEmptySharedAgentContext());
    }

    return this.sessionContext.get(sessionId) as SharedAgentContext;
  }

  rememberAction(
    sessionId: string,
    agentKey: AgentKey,
    actionType: string,
    details: Record<string, unknown>
  ): void {
    const context = this.getContext(sessionId);
    const memoryKey = `${agentKey}:${new Date().toISOString()}:${actionType}`;
    context.memory[memoryKey] = details;
    this.sessionContext.set(sessionId, context);
  }

  rememberDecision(sessionId: string, agentKey: AgentKey, decision: string, confidence: number): void {
    this.rememberAction(sessionId, agentKey, "decision", {
      decision,
      confidence,
    });
  }

  mergeOutput(sessionId: string, output: AgentExecutionOutput): SharedAgentContext {
    const context = this.getContext(sessionId);

    for (const item of output.memory) {
      const key = `${output.agentKey}:memory:${context.goals.length + context.research.length + 1}`;
      context.memory[key] = item;
    }

    for (const item of output.predictions) {
      context.predictions[`${output.agentKey}:${item.slice(0, 32)}`] = item;
    }

    for (const item of output.simulations) {
      context.simulations[`${output.agentKey}:${item.slice(0, 32)}`] = item;
    }

    context.goals = mergeUnique(context.goals, output.goals);
    context.research = mergeUnique(context.research, output.research);
    context.learning = mergeUnique(context.learning, output.learning);
    context.recommendations = mergeUnique(context.recommendations, output.recommendations);

    this.sessionContext.set(sessionId, context);
    return context;
  }
}

function mergeUnique(current: string[], next: string[]): string[] {
  const set = new Set<string>(current);
  for (const item of next) {
    set.add(item);
  }
  return Array.from(set);
}
