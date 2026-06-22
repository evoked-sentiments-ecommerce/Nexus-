// ---------------------------------------------------------------------------
// Intelligence Core — Learning
// Captures signals, feedback, and outcomes; generates improvement insights
// and feeds the continuous learning loop.
// ---------------------------------------------------------------------------

import { logInfo } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SignalType = "accepted" | "rejected" | "modified" | "ignored" | "escalated";
export type FeedbackSentiment = "positive" | "neutral" | "negative";
export type OutcomeStatus = "success" | "partial" | "failure";

export interface LearningSignal {
  signalId: string;
  userId: string;
  entityType: string;
  entityId: string;
  signalType: SignalType;
  context?: Record<string, unknown>;
  capturedAt: string;
}

export interface UserFeedback {
  feedbackId: string;
  userId: string;
  entityType: string;
  entityId: string;
  sentiment: FeedbackSentiment;
  rating?: number;
  comment?: string;
  tags?: string[];
  capturedAt: string;
}

export interface OutcomeRecord {
  outcomeId: string;
  objectiveId: string;
  status: OutcomeStatus;
  measuredValues: Record<string, number>;
  qualitativeNotes: string[];
  recordedAt: string;
}

export interface LearningInsight {
  insightId: string;
  title: string;
  description: string;
  category: "ux" | "content" | "performance" | "feature" | "process" | "strategy";
  evidenceSummary: string;
  impactScore: number;
  confidence: "high" | "medium" | "low";
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// In-process stores (stub — replace with DB persistence)
// ---------------------------------------------------------------------------

const signals: LearningSignal[] = [];
const feedback: UserFeedback[] = [];
const outcomes: OutcomeRecord[] = [];

// ---------------------------------------------------------------------------
// Signal capture
// ---------------------------------------------------------------------------

export async function captureSignal(
  input: Omit<LearningSignal, "signalId" | "capturedAt">
): Promise<LearningSignal> {
  const record: LearningSignal = {
    ...input,
    signalId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    capturedAt: new Date().toISOString(),
  };
  signals.push(record);
  logInfo("learning_signal_captured", { signalId: record.signalId, signalType: record.signalType, entityType: record.entityType });
  return record;
}

// ---------------------------------------------------------------------------
// Feedback capture
// ---------------------------------------------------------------------------

export async function captureFeedback(
  input: Omit<UserFeedback, "feedbackId" | "capturedAt">
): Promise<UserFeedback> {
  const record: UserFeedback = {
    ...input,
    feedbackId: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    capturedAt: new Date().toISOString(),
  };
  feedback.push(record);
  logInfo("learning_feedback_captured", { feedbackId: record.feedbackId, sentiment: record.sentiment });
  return record;
}

// ---------------------------------------------------------------------------
// Outcome recording
// ---------------------------------------------------------------------------

export async function recordOutcome(
  input: Omit<OutcomeRecord, "outcomeId" | "recordedAt">
): Promise<OutcomeRecord> {
  const record: OutcomeRecord = {
    ...input,
    outcomeId: `out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recordedAt: new Date().toISOString(),
  };
  outcomes.push(record);
  logInfo("learning_outcome_recorded", { outcomeId: record.outcomeId, status: record.status });
  return record;
}

// ---------------------------------------------------------------------------
// Insight generation (stub — replace with LLM synthesis)
// ---------------------------------------------------------------------------

export async function generateInsights(entityType?: string): Promise<LearningInsight[]> {
  const relevantFeedback = entityType ? feedback.filter((f) => f.entityType === entityType) : feedback;
  const relevantSignals = entityType ? signals.filter((s) => s.entityType === entityType) : signals;
  const insights: LearningInsight[] = [];

  const negCount = relevantFeedback.filter((f) => f.sentiment === "negative").length;
  const rejCount = relevantSignals.filter((s) => s.signalType === "rejected").length;
  const successCount = outcomes.filter((o) => o.status === "success").length;
  const failureCount = outcomes.filter((o) => o.status === "failure").length;

  if (negCount > 0) {
    insights.push({
      insightId: `ins-neg-${Date.now()}`,
      title: "Negative feedback pattern detected",
      description: `${negCount} negative feedback item(s) captured${entityType ? ` for ${entityType}` : ""}. Review for recurring themes.`,
      category: "ux",
      evidenceSummary: `${negCount} negative feedback entries`,
      impactScore: Math.min(negCount * 15, 100),
      confidence: negCount > 5 ? "high" : "medium",
      generatedAt: new Date().toISOString(),
    });
  }

  if (rejCount > 0) {
    insights.push({
      insightId: `ins-rej-${Date.now()}`,
      title: "High suggestion rejection rate",
      description: `${rejCount} rejection(s) recorded. Generated suggestions may need improvement.`,
      category: "content",
      evidenceSummary: `${rejCount} rejection signal(s)`,
      impactScore: Math.min(rejCount * 20, 100),
      confidence: "medium",
      generatedAt: new Date().toISOString(),
    });
  }

  if (failureCount > 0 && successCount > 0) {
    const ratio = failureCount / (successCount + failureCount);
    insights.push({
      insightId: `ins-out-${Date.now()}`,
      title: "Outcome failure rate requires attention",
      description: `${Math.round(ratio * 100)}% of recorded outcomes are failures. Investigate systemic causes.`,
      category: "performance",
      evidenceSummary: `${failureCount} failures vs ${successCount} successes`,
      impactScore: Math.round(ratio * 100),
      confidence: "high",
      generatedAt: new Date().toISOString(),
    });
  }

  logInfo("learning_insights_generated", { count: insights.length, entityType: entityType ?? "all" });
  return insights;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export async function getLearningSummary() {
  return {
    totalSignals: signals.length,
    totalFeedback: feedback.length,
    totalOutcomes: outcomes.length,
    signalBreakdown: countBy(signals, "signalType"),
    sentimentBreakdown: countBy(feedback, "sentiment"),
    outcomeBreakdown: countBy(outcomes, "status"),
  };
}

function countBy<T extends Record<string, unknown>>(arr: T[], field: keyof T): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, item) => {
    const val = String(item[field]);
    acc[val] = (acc[val] ?? 0) + 1;
    return acc;
  }, {});
}
