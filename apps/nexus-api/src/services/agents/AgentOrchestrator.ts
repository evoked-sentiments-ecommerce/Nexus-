import { randomUUID } from "crypto";
import { AgentDecision } from "../../entities/AgentDecision";
import { AgentKey } from "../../entities/Agent";
import { AgentSession } from "../../entities/AgentSession";
import { AgentCollaboration } from "./AgentCollaboration";
import { AgentCommunication } from "./AgentCommunication";
import { AgentMemory } from "./AgentMemory";
import { AgentExecutionOutput, AgentRegistry } from "./AgentRegistry";

export interface AgentOrchestrationResult {
  session: AgentSession;
  outputs: AgentExecutionOutput[];
  decisions: AgentDecision[];
}

export class AgentOrchestrator {
  private readonly memory: AgentMemory;
  private readonly communication: AgentCommunication;

  constructor(
    private readonly registry = new AgentRegistry(),
    memory?: AgentMemory,
    communication?: AgentCommunication,
    private readonly collaboration = new AgentCollaboration()
  ) {
    this.memory = memory ?? new AgentMemory();
    this.communication = communication ?? new AgentCommunication(this.memory);
  }

  async runSession(session: AgentSession, selectedAgents?: AgentKey[]): Promise<AgentOrchestrationResult> {
    this.memory.initializeSession(session);

    const outputs: AgentExecutionOutput[] = [];
    const decisions: AgentDecision[] = [];
    const previousOutputs: Record<string, unknown> = { ...session.mergedOutputs };

    const participants =
      selectedAgents && selectedAgents.length > 0
        ? selectedAgents
        : session.participatingAgentIds;

    for (const agentKey of participants) {
      const agent = this.registry.get(agentKey);
      if (!agent) {
        continue;
      }

      const input = this.communication.buildExecutionInput(session, previousOutputs);
      const output = await agent.execute(input);
      outputs.push(output);
      previousOutputs[agent.key] = output.contribution;
      this.communication.publish(session.id, output);

      decisions.push({
        id: randomUUID(),
        sessionId: session.id,
        agentId: agent.key,
        decision: output.decision.decision,
        reasoning: output.decision.reasoning,
        confidence: output.decision.confidence,
        alternatives: output.decision.alternatives,
        recommendations: output.decision.recommendations,
        expectedOutcome: output.decision.expectedOutcome,
        createdAt: new Date().toISOString(),
      });
    }

    const merged = this.collaboration.merge(outputs);
    const sharedContext = this.memory.getContext(session.id);

    return {
      session: {
        ...session,
        status: outputs.length > 0 ? "completed" : "failed",
        sharedContext: {
          ...sharedContext,
          recommendations: Array.from(
            new Set([...sharedContext.recommendations, ...merged.recommendations])
          ),
        },
        unifiedExecutionPlan: merged.unifiedExecutionPlan,
        mergedOutputs: merged.mergedOutputs,
        completedAt: outputs.length > 0 ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      },
      outputs,
      decisions,
    };
  }
}
