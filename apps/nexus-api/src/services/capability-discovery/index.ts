// ---------------------------------------------------------------------------
// Capability Discovery Engine — identifies missing capabilities, workflow
// gaps, production gaps, and business opportunities; outputs structured
// proposals with impact, priority scores, and implementation plans.
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GapCategory =
  | "capability"
  | "workflow"
  | "production"
  | "integration"
  | "analytics"
  | "automation";

export interface PlatformAssessment {
  assessmentId: string;
  currentCapabilities: string[];
  currentWorkflows: string[];
  currentProductionOutputs: string[];
  observedUserNeeds: string[];
  observedFailurePoints: string[];
  period: string;
  generatedAt: string;
}

export interface CapabilityGap {
  gapId: string;
  category: GapCategory;
  title: string;
  description: string;
  userImpact: string;
  frequency: "constant" | "frequent" | "occasional" | "rare";
  discoveredAt: string;
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  effort: "small" | "medium" | "large";
  dependencies: string[];
}

export interface CapabilityProposal {
  proposalId: string;
  gapId: string;
  title: string;
  description: string;
  category: GapCategory;
  impactScore: number;    // 0-100
  priorityScore: number;  // 0-100
  effortScore: number;    // 0-100 (higher = more effort)
  implementationPlan: ImplementationStep[];
  requiredIntegrations: string[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Assessment (stub — replace with analytics data pull + LLM analysis)
// ---------------------------------------------------------------------------

export async function assessPlatform(period = "last_30_days"): Promise<PlatformAssessment> {
  logInfo("capability_discovery_assessment", { period });
  return {
    assessmentId: `assess-${Date.now()}`,
    currentCapabilities: [
      "project_management", "document_generation", "brand_management",
      "research", "pdf_generation", "package_delivery", "billing",
      "chef_drew_blueprints", "storage", "email",
    ],
    currentWorkflows: [
      "onboarding", "project_kickoff", "package_delivery", "billing_renewal",
    ],
    currentProductionOutputs: ["pdf", "docx", "package_zip"],
    observedUserNeeds: [
      "Automated financial modelling",
      "Real-time competitive intelligence",
      "AI-assisted menu engineering",
      "Multi-format presentation generation",
      "Automated SOP creation",
      "Integrated training platform",
    ],
    observedFailurePoints: [
      "Manual data entry for financial models",
      "No real-time market data",
      "Limited design asset generation",
    ],
    period,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Gap identification (stub — replace with LLM analysis)
// ---------------------------------------------------------------------------

export async function identifyGaps(assessment: PlatformAssessment): Promise<CapabilityGap[]> {
  logInfo("capability_discovery_gaps_identified", { assessmentId: assessment.assessmentId });
  const gaps: CapabilityGap[] = [];

  for (const need of assessment.observedUserNeeds) {
    const isMet = assessment.currentCapabilities.some((c) =>
      need.toLowerCase().includes(c.replace(/_/g, " "))
    );
    if (!isMet) {
      gaps.push({
        gapId: `gap-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        category: inferCategory(need),
        title: need,
        description: `Users require "${need}" but no current capability addresses this need.`,
        userImpact: "Users must use external tools, creating workflow fragmentation.",
        frequency: "frequent",
        discoveredAt: new Date().toISOString(),
      });
    }
  }

  for (const failure of assessment.observedFailurePoints) {
    gaps.push({
      gapId: `gap-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      category: "workflow",
      title: `Fix: ${failure}`,
      description: failure,
      userImpact: "Creates friction and reduces platform trust.",
      frequency: "frequent",
      discoveredAt: new Date().toISOString(),
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Proposal generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateProposals(gaps: CapabilityGap[]): Promise<CapabilityProposal[]> {
  logInfo("capability_discovery_proposals_generated", { gapCount: gaps.length });
  return gaps.map((gap, i) => ({
    proposalId: `prop-${gap.gapId}`,
    gapId: gap.gapId,
    title: `Implement: ${gap.title}`,
    description: `Build capability to address gap: "${gap.description}"`,
    category: gap.category,
    impactScore: gap.frequency === "constant" ? 90 : gap.frequency === "frequent" ? 75 : 50,
    priorityScore: 80 - i * 5,
    effortScore: 50,
    implementationPlan: [
      { order: 1, title: "Discovery & scoping", description: "Define requirements and acceptance criteria.", effort: "small", dependencies: [] },
      { order: 2, title: "Architecture & design", description: "Design service architecture and data model.", effort: "medium", dependencies: ["Discovery & scoping"] },
      { order: 3, title: "Implementation", description: "Build and test the capability.", effort: "large", dependencies: ["Architecture & design"] },
      { order: 4, title: "Integration & deployment", description: "Wire into platform and deploy.", effort: "medium", dependencies: ["Implementation"] },
    ],
    requiredIntegrations: [],
    generatedAt: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Full discovery pipeline
// ---------------------------------------------------------------------------

export async function runCapabilityDiscovery(period = "last_30_days"): Promise<{
  assessment: PlatformAssessment;
  gaps: CapabilityGap[];
  proposals: CapabilityProposal[];
}> {
  const assessment = await assessPlatform(period);
  const gaps = await identifyGaps(assessment);
  const proposals = await generateProposals(gaps);
  logInfo("capability_discovery_completed", { gapCount: gaps.length, proposalCount: proposals.length });
  return { assessment, gaps, proposals };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferCategory(need: string): GapCategory {
  const n = need.toLowerCase();
  if (n.includes("workflow") || n.includes("process") || n.includes("sop")) return "workflow";
  if (n.includes("financial") || n.includes("model") || n.includes("cost")) return "production";
  if (n.includes("analytics") || n.includes("report") || n.includes("intelligence")) return "analytics";
  if (n.includes("automat")) return "automation";
  if (n.includes("integrat") || n.includes("connect")) return "integration";
  return "capability";
}
