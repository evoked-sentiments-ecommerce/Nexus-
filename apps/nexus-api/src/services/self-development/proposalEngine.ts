// ---------------------------------------------------------------------------
// Proposal Engine — generates capability gap reports and evolution proposals
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";
import { detectGaps, getAll, CapabilityGapReport } from "../capability-discovery/registry";

export interface EvolutionProposal {
  id?: string;
  gapReportId: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "implemented";
  impactScore: number;
  priorityScore: number;
  effortScore: number;
}

export interface EvolutionCycleSummary {
  reportId: string;
  proposalsCreated: number;
  highPriorityCount: number;
  generatedAt: string;
}

async function dbQuery(text: string, params?: unknown[]): Promise<{ rows: unknown[] }> {
  try {
    const { query } = require("../../database/connection");
    return await query(text, params);
  } catch {
    return { rows: [] };
  }
}

export async function generateCapabilityGapReport(period?: string): Promise<CapabilityGapReport> {
  logInfo("gap_report_generating", { period: period ?? "all-time" });
  const capabilities = await getAll();
  const failures = capabilities.filter((c) => c.performanceScore < 60).map((c) => c.name);
  const objectives = capabilities.map((c) => c.name);
  const report = detectGaps(objectives, failures);
  logInfo("gap_report_generated", { reportId: report.reportId, gapCount: report.gaps.length });
  return report;
}

export async function convertGapsToProposals(gapReport: CapabilityGapReport): Promise<EvolutionProposal[]> {
  const proposals: EvolutionProposal[] = gapReport.gaps.map((gap) => ({
    gapReportId: gapReport.reportId,
    title: `Address ${gap.gap}`,
    description: `Improve capability in domain: ${gap.domain}. Gap identified: ${gap.gap}`,
    category: gap.domain,
    status: "pending",
    impactScore: gap.severity === "high" ? 90 : gap.severity === "medium" ? 60 : 30,
    priorityScore: gap.severity === "high" ? 85 : 50,
    effortScore: 50,
  }));

  for (const proposal of proposals) {
    try {
      await dbQuery(
        `INSERT INTO evolution_proposals (id, gap_report_id, title, description, category, status, impact_score, priority_score, effort_score, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [proposal.gapReportId, proposal.title, proposal.description, proposal.category, proposal.status, proposal.impactScore, proposal.priorityScore, proposal.effortScore]
      );
    } catch {
      // DB not available
    }
  }

  logInfo("proposals_created", { count: proposals.length, reportId: gapReport.reportId });
  return proposals;
}

export async function runEvolutionCycle(): Promise<EvolutionCycleSummary> {
  logInfo("evolution_cycle_started", {});
  try {
    const report = await generateCapabilityGapReport();
    const proposals = await convertGapsToProposals(report);
    const highPriority = proposals.filter((p) => p.priorityScore >= 80);

    logInfo("evolution_cycle_complete", { proposalsCreated: proposals.length, highPriority: highPriority.length });
    return {
      reportId: report.reportId,
      proposalsCreated: proposals.length,
      highPriorityCount: highPriority.length,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    logError("evolution_cycle_error", { message: err instanceof Error ? err.message : String(err) });
    return { reportId: "", proposalsCreated: 0, highPriorityCount: 0, generatedAt: new Date().toISOString() };
  }
}
