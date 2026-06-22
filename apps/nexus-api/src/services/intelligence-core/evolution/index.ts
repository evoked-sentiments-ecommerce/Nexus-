// ---------------------------------------------------------------------------
// Intelligence Core — Evolution
// Continuous platform evolution: analyse performance, generate improvement
// proposals, expansion plans, and new capability recommendations.
// ---------------------------------------------------------------------------

import { logInfo } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlatformSnapshot {
  snapshotId: string;
  period: string;
  capabilityUsage: Record<string, number>;
  userOutcomes: { success: number; partial: number; failure: number };
  topObjectives: string[];
  unmetNeeds: string[];
  capturedAt: string;
}

export type EvolutionProposalType =
  | "improvement"
  | "expansion"
  | "new_capability"
  | "optimization"
  | "deprecation";

export interface EvolutionProposal {
  proposalId: string;
  type: EvolutionProposalType;
  title: string;
  description: string;
  rationale: string;
  impactScore: number;
  priorityScore: number;
  effort: "small" | "medium" | "large" | "x-large";
  generatedAt: string;
}

export interface EvolutionReport {
  reportId: string;
  period: string;
  snapshot: PlatformSnapshot;
  proposals: EvolutionProposal[];
  topPriorities: string[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Snapshot capture (stub — pull from analytics/DB in production)
// ---------------------------------------------------------------------------

export async function captureSnapshot(period = "last_30_days"): Promise<PlatformSnapshot> {
  logInfo("evolution_snapshot_captured", { period });
  return {
    snapshotId: `snap-${Date.now()}`,
    period,
    capabilityUsage: {
      projects: 840,
      documents: 620,
      "chef-drew": 480,
      research: 80,
      pdf: 55,
      packages: 320,
      billing: 210,
    },
    userOutcomes: { success: 142, partial: 38, failure: 12 },
    topObjectives: ["Launch new product line", "Reduce operational costs", "Expand market presence"],
    unmetNeeds: ["Automated reporting", "Multi-language support", "Advanced analytics dashboard"],
    capturedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Proposal generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateProposals(snapshot: PlatformSnapshot): Promise<EvolutionProposal[]> {
  logInfo("evolution_proposals_generated", { snapshotId: snapshot.snapshotId });
  const proposals: EvolutionProposal[] = [];

  for (const need of snapshot.unmetNeeds) {
    proposals.push({
      proposalId: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: "new_capability",
      title: `Implement: ${need}`,
      description: `Users have expressed need for "${need}". This capability is currently absent from the platform.`,
      rationale: `Identified as unmet need in ${snapshot.period}. Delivering this would directly address user gaps.`,
      impactScore: 75,
      priorityScore: 70,
      effort: "medium",
      generatedAt: new Date().toISOString(),
    });
  }

  const lowUsageCaps = Object.entries(snapshot.capabilityUsage)
    .filter(([, count]) => count < 100)
    .map(([cap]) => cap);

  for (const cap of lowUsageCaps) {
    proposals.push({
      proposalId: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: "improvement",
      title: `Improve discoverability of "${cap}"`,
      description: `"${cap}" has low adoption (${snapshot.capabilityUsage[cap]} events in ${snapshot.period}).`,
      rationale: "Surfacing this capability more prominently could increase adoption by 25-40%.",
      impactScore: 55,
      priorityScore: 50,
      effort: "small",
      generatedAt: new Date().toISOString(),
    });
  }

  return proposals;
}

// ---------------------------------------------------------------------------
// Full evolution report
// ---------------------------------------------------------------------------

export async function buildEvolutionReport(period = "last_30_days"): Promise<EvolutionReport> {
  const snapshot = await captureSnapshot(period);
  const proposals = await generateProposals(snapshot);
  const topPriorities = proposals
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3)
    .map((p) => p.title);

  const report: EvolutionReport = {
    reportId: `evo-${Date.now()}`,
    period,
    snapshot,
    proposals,
    topPriorities,
    generatedAt: new Date().toISOString(),
  };

  logInfo("evolution_report_built", {
    reportId: report.reportId,
    proposalCount: proposals.length,
    topPriorities,
  });

  return report;
}
