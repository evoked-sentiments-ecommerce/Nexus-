import { AgentSession } from "../../entities/AgentSession";
import { AgentMemory } from "./AgentMemory";
import { AgentExecutionInput, AgentExecutionOutput } from "./AgentRegistry";

export class AgentCommunication {
  constructor(private readonly memory: AgentMemory) {}

  buildExecutionInput(session: AgentSession, previousOutputs: Record<string, unknown>): AgentExecutionInput {
    const context = this.memory.getContext(session.id);
    return {
      sessionId: session.id,
      goal: session.goal,
      objective: session.objective,
      sharedMemory: context.memory,
      predictions: context.predictions,
      simulations: context.simulations,
      goals: context.goals,
      research: context.research,
      learning: context.learning,
      recommendations: context.recommendations,
      previousOutputs,
    };
  }

  publish(sessionId: string, output: AgentExecutionOutput): void {
    this.memory.mergeOutput(sessionId, output);
    this.memory.rememberDecision(
      sessionId,
      output.agentKey,
      output.decision.decision,
      output.decision.confidence
    );
  }
}
