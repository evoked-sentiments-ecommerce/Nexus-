import { AgentExecutionOutput } from "./AgentRegistry";

export interface CollaborationResult {
  unifiedExecutionPlan: string[];
  mergedOutputs: Record<string, unknown>;
  recommendations: string[];
}

export class AgentCollaboration {
  merge(outputs: AgentExecutionOutput[]): CollaborationResult {
    const unifiedExecutionPlan: string[] = [];
    const mergedOutputs: Record<string, unknown> = {};
    const recommendations = new Set<string>();

    for (const output of outputs) {
      unifiedExecutionPlan.push(`${output.agentKey}: ${output.summary}`);
      mergedOutputs[output.agentKey] = output.contribution;
      for (const recommendation of output.recommendations) {
        recommendations.add(recommendation);
      }
    }

    return {
      unifiedExecutionPlan,
      mergedOutputs,
      recommendations: Array.from(recommendations),
    };
  }
}
